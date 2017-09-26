package com.allvoices;

import android.widget.Toast;

import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import java.util.Map;
import java.util.HashMap;

/**
 * Created by 80713 on 2017/8/22.
 */

public class MusicServiceModule extends ReactContextBaseJavaModule {

    private  ReactApplicationContext context;

    public MusicServiceModule(ReactApplicationContext context) {
        super(context);
        this.context = context;
    }

    @Override public String getName() {
        return "MusicService";
    }
}
