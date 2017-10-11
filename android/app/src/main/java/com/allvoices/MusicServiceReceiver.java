package com.allvoices;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

import com.allvoices.MusicService;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;

import android.util.Log;

/**
 * Created by 80713 on 2017/8/22.
 */

class MusicServiceReceiver extends BroadcastReceiver {
    private MusicService serviceInstance;

    public MusicServiceReceiver(MusicService initInstance) {
        this.serviceInstance = initInstance;
    }

    @Override
    public void onReceive(Context ct, Intent it) {
        String action = it.getAction();
        Log.i("info", action);
        switch (action) {
            case "playOrPause":
                if(serviceInstance.player != null) {
                    WritableMap params = Arguments.createMap();
                    params.putBoolean("status", true);
                    serviceInstance.setRemoteViewButton(serviceInstance.player.isPlaying());
                    if(serviceInstance.player.isPlaying()) {
                        serviceInstance.sendEvent("playerPause", params);
                        serviceInstance.pause();
                    }else {
                        serviceInstance.sendEvent("playerResume", params);
                        serviceInstance.resume();
                    }
                }else {
                    Log.i("info", "player not init.");
                }
                break;
            case "exit":
                serviceInstance.exitNotification();
                break;
            case "next":
                WritableMap next = Arguments.createMap();
                next.putBoolean("status", true);
                serviceInstance.sendEvent("playNext", next);
                break;
            case "prev":
                WritableMap prev = Arguments.createMap();
                prev.putBoolean("status", true);
                serviceInstance.sendEvent("playPrev", prev);
                break;
        }
    }

    public void MusicService(MusicService cls) {

    }
}
