package com.allvoices;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

/**
 * Created by 80713 on 2017/8/23.
 */

public class EventsListener extends BroadcastReceiver {

    private MusicService signal;

    public EventsListener(MusicService signal) {
        super();
        this.signal = signal;
    }

    @Override
    public void onReceive(Context ct, Intent it) {
        String action = it.getAction();

    }
}
