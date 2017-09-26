package com.allvoices;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.ServiceConnection;
import android.media.MediaPlayer;
import android.media.MediaPlayer.OnBufferingUpdateListener;
import android.media.MediaPlayer.OnCompletionListener;
import android.media.MediaPlayer.OnPreparedListener;
import android.media.AudioManager;
import android.os.IBinder;
import android.support.annotation.Nullable;
import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import java.util.HashMap;

public class AllVoicesMusicServiceModule extends ReactContextBaseJavaModule implements ServiceConnection {
    public int type = AudioManager.STREAM_MUSIC;
    private ReactApplicationContext context;
    private Class<?> clsActivity;
    private MusicService signal;
    private Intent bindIntent;
    private HashMap streamingURL;

    public Class<?> getClassActivity() {
        if (this.clsActivity == null) {
            this.clsActivity = getCurrentActivity().getClass();
        }
        return this.clsActivity;
    }

    public AllVoicesMusicServiceModule(ReactApplicationContext rct) {
        super(rct);
        this.context = rct;
    }

    private ReactApplicationContext getReactApplicationContextModule() {
        return this.context;
    }

    @Override public String getName() {
        return "MusicService";
    }

    @Override public void initialize() {
        super.initialize();
        try {
            bindIntent = new Intent(this.context, MusicService.class);
            this.context.bindService(bindIntent, this, Context.BIND_AUTO_CREATE);
        } catch (Exception e) {
            Log.e("ERROR", e.getMessage());
        }
    }

    @ReactMethod public void seekTo(ReadableMap progress) {
        double progrees = progress.getDouble("progress");
        Integer songTime = signal.player.getDuration();
        Log.i("info", songTime.toString());
        Double seekTime = songTime*progrees;
        Log.i("info", seekTime.toString());
        signal.player.seekTo(seekTime.intValue());
    }

    @ReactMethod public void play(ReadableMap arr) {
        this.signal.setSongInfo(arr);
        signal.play();
    }

    @ReactMethod public void stop() {
        signal.stop();
        signal.exitNotification();
    }

    @ReactMethod public void pause() {
        signal.pause();
    }

    @ReactMethod public void getMediaplayerStatus(Callback returnCallback) {
        returnCallback.invoke(signal.getMPStatus());
    }

    @ReactMethod public void resume() {
        signal.resume();
    }

    @Override public void onServiceConnected(ComponentName className, IBinder service) {
        Log.i("info", "service~~");
        this.signal = ((MusicService.MusicBinder) service).getService();
        this.signal.setContext(this.context, this);
        WritableMap params = Arguments.createMap();
        sendEvent(this.getReactApplicationContextModule(), "serviceCreated", params);
    }

    @Override public void onServiceDisconnected(ComponentName className) {
        Log.i("info", "service gone");
        signal = null;
    }

    public void sendEvent(ReactContext reactContext,
                           String eventName,
                           @Nullable WritableMap params) {
        reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(eventName, params);
    }

}
