package com.allvoices;

import android.app.Notification;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.media.AudioManager;
import android.media.AudioTrack;
import android.media.MediaPlayer;
import android.media.MediaPlayer.OnBufferingUpdateListener;
import android.media.MediaPlayer.OnCompletionListener;
import android.media.MediaPlayer.OnErrorListener;
import android.media.MediaPlayer.OnInfoListener;
import android.media.MediaPlayer.OnPreparedListener;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.os.Binder;
import android.os.Bundle;
import android.os.Handler;
import android.os.IBinder;
import android.os.Parcelable;
import android.provider.MediaStore;
import android.support.annotation.BoolRes;
import android.support.v4.app.NotificationCompat;
import android.support.v4.app.TaskStackBuilder;
import android.telephony.PhoneStateListener;
import android.telephony.TelephonyManager;
import android.util.Log;
import android.widget.RemoteViews;

import com.squareup.picasso.Picasso;
import com.allvoices.MusicServiceReceiver;
import com.allvoices.AllVoicesMusicServiceModule;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;

import java.util.ArrayList;
import java.util.Timer;
import java.util.TimerTask;

/**
 * Created by 80713 on 2017/8/22.
 */

public class MusicService extends Service implements
        OnCompletionListener,
        OnPreparedListener,
        OnBufferingUpdateListener,
        OnErrorListener{

    public class MusicBinder extends Binder {
        public MusicService getService() {
            return MusicService.this;
        }
    }

    public boolean onError(MediaPlayer mp, int a, int b) {
        Log.i("info", a+":"+b);
        return false;
    }

    public void onCompletion(MediaPlayer mp) {
        WritableMap params = Arguments.createMap();
        params.putBoolean("status", true);
        sendEvent("completed", params);
        this.player.reset();
    }

    public void onPrepared(MediaPlayer mp) {
        isPrepared = true;
        Log.i("info", "player prepared");
        mp.start();
        WritableMap params = Arguments.createMap();
        params.putBoolean("status", true);
        sendEvent("prepared", params);
    }

    //bp means cached how much
    public void onBufferingUpdate(MediaPlayer mp, int bp) {
        if(isPrepared) {
            int current = mp.getCurrentPosition()/mp.getDuration();
            WritableMap params = Arguments.createMap();
            params.putInt("cached", bp);
            params.putInt("current", current);
            Log.i("info", "当前缓冲"+String.valueOf(bp));
            Log.i("info", "当前播放"+String.valueOf(current));
            sendEvent("buffering", params);
        }
    }

    private ReadableMap song_list;

    private Class<?> clsActivity;
    private static final int NOTIFY_ME_ID = 233333;
    private NotificationCompat.Builder notifyBuilder;
    private Notification notification;
    private NotificationManager notifyManager = null;
    public static RemoteViews rv;
    public MediaPlayer player;
    private int type = 1;//1 loop, 2 list loop, 3 random
    private Timer timer = new Timer();

    public static final String BROADCAST_PLAYBACK_NEXT = "next",
            BROADCAST_PLAYBACK_PREV = "prev",
            BROADCAST_PLAY_OR_PAUSE = "playOrPause",
            BROADCAST_EXIT = "exit";

    private final Handler handler = new Handler();
    private final IBinder binder = new MusicBinder();
    private final MusicServiceReceiver receiver = new MusicServiceReceiver(this);
    private ReactApplicationContext context;
    private AllVoicesMusicServiceModule mod;
    private boolean isPrepared = false;

    private TelephonyManager phoneManager;

    public void setSongInfo(ReadableMap arr) {
        this.song_list = arr;
    }

    public void setContext(ReactApplicationContext ct, AllVoicesMusicServiceModule mod) {
        this.context = ct;
        this.mod = mod;
        this.clsActivity = mod.getClassActivity();
    }

    public void play() {
        try {
            this.player.reset();
            if(notification == null && rv == null) {
                showNotification();
            }
            rv.setTextViewText(R.id.song_name, song_list.getString("song_name"));
            rv.setTextViewText(R.id.song_info, song_list.getString("artist_name"));
            rv.setImageViewResource(R.id.btn_play_or_pause, R.mipmap.ic_pause_circle_outline_black_24dp);
            String song_url = song_list.getString("song_url");
            context.runOnUiQueueThread(new Runnable() {
                @Override
                public void run() {
                    Picasso.with(context).
                            load(song_list.getString("album_pic")).
                            into(rv, R.id.albumPic, NOTIFY_ME_ID, notification);
                }
            });
            this.player.setDataSource(song_url);
            isPrepared = false;
            this.player.prepareAsync();
        }catch (Exception e) {
            Log.e("mediaPlayer", e.getMessage(), e);
        }

    }

    TimerTask timerTask = new TimerTask() {

        @Override
        public void run() {
            if (player == null)
                return;
            if (player.isPlaying()) {
                WritableMap param = Arguments.createMap();
                param.putDouble("current", player.getCurrentPosition());
                param.putInt("duration", player.getDuration());
                sendEvent("playerProgress", param);
            }
        }
    };

    public void pause() {
        if(this.player.isPlaying()) {
            if(rv != null) {
                rv.setImageViewResource(R.id.btn_play_or_pause, R.mipmap.ic_play_circle_outline_black_24dp);
                notifyManager.notify(NOTIFY_ME_ID, notification);
            }
            this.player.pause();
        }
    }

    public void resume() {
        if(!this.player.isPlaying()) {
            if(rv != null) {
                rv.setImageViewResource(R.id.btn_play_or_pause, R.mipmap.ic_pause_circle_outline_black_24dp);
                notifyManager.notify(NOTIFY_ME_ID, notification);
            }
            this.player.start();
        }
    }

    public void stop() {
        if(this.player.isPlaying()) {
            this.player.stop();
        }
    }

    public boolean getMPStatus() {
        if (this.player == null) {
            return false;
        } else {
            return this.player.isPlaying();
        }
    }

    @Override
    public void onCreate() {
        timer.schedule(timerTask, 0, 1000);
        IntentFilter Filter = new IntentFilter();
        Filter.addAction(BROADCAST_EXIT);
        Filter.addAction(BROADCAST_PLAY_OR_PAUSE);
        Filter.addAction(BROADCAST_PLAYBACK_NEXT);
        Filter.addAction(BROADCAST_PLAYBACK_PREV);
        registerReceiver(receiver, Filter);
        super.onCreate();
        try {
            this.player = new MediaPlayer();
            this.player.setAudioStreamType(AudioManager.STREAM_MUSIC);
            this.player.setOnCompletionListener(this);
            this.player.setOnBufferingUpdateListener(this);
            this.player.setOnPreparedListener(this);
            this.player.setOnErrorListener(this);
        }catch (Exception e) {
            e.printStackTrace();
        }
        this.notifyManager = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);

    }

    @Override
    public IBinder onBind(Intent intent) {
        return binder;
    }

    @Override
    public int onStartCommand(Intent it, int flags, int startId) {

        return super.onStartCommand(it, flags, startId);
    }

    public void showNotification() {
        rv = new RemoteViews(context.getPackageName(), R.layout.sample_notify_view);
        notifyBuilder = new NotificationCompat.Builder(this.context)
                .setSmallIcon(R.mipmap.notify_logo)
                .setContentText("")
                .setOngoing(true)
                .setContent(rv);

        Intent resultIntent = new Intent(this.context, this.clsActivity);
        resultIntent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
        resultIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);

        TaskStackBuilder stackBuilder = TaskStackBuilder.create(this.context);
        stackBuilder.addParentStack(this.clsActivity);
        stackBuilder.addNextIntent(resultIntent);

        PendingIntent resultPendingIntent = stackBuilder.getPendingIntent(0,
                PendingIntent.FLAG_UPDATE_CURRENT);

        notifyBuilder.setContentIntent(resultPendingIntent);
        rv.setOnClickPendingIntent(R.id.btn_next, makePendingIntent(BROADCAST_PLAYBACK_NEXT));
        rv.setOnClickPendingIntent(R.id.btn_prev, makePendingIntent(BROADCAST_PLAYBACK_PREV));
        rv.setOnClickPendingIntent(R.id.btn_play_or_pause, makePendingIntent(BROADCAST_PLAY_OR_PAUSE));
        rv.setOnClickPendingIntent(R.id.btn_exit, makePendingIntent(BROADCAST_EXIT));
        notifyManager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        notification = notifyBuilder.build();
        // set big content view for newer androids
        if (android.os.Build.VERSION.SDK_INT >= 16) {
            notification.bigContentView = rv;
        }
        notifyManager.notify(NOTIFY_ME_ID, notification);
    }

    public void clearNotification() {
        if (notifyManager != null)
            notifyManager.cancel(NOTIFY_ME_ID);
    }

    public void exitNotification() {
        stop();
        notifyManager.cancelAll();
        clearNotification();
        notifyBuilder = null;
        notifyManager = null;
    }

    public void setRemoteViewButton(boolean playing) {
        if (playing) {
            rv.setImageViewResource(R.id.btn_play_or_pause, R.mipmap.ic_pause_circle_outline_black_24dp);
            notifyManager.notify(NOTIFY_ME_ID, notification);
        }else {
            rv.setImageViewResource(R.id.btn_play_or_pause, R.mipmap.ic_play_circle_outline_black_24dp);
            notifyManager.notify(NOTIFY_ME_ID, notification);
        }
    }

    private PendingIntent makePendingIntent(String broadcast) {
        Intent intent = new Intent(broadcast);
        return PendingIntent.getBroadcast(this.context, 0, intent, 0);
    }

    public void sendEvent(String name, WritableMap params) {
        this.mod.sendEvent(context, name, params);
    }

}
