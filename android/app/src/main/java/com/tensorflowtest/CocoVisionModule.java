package com.tensorflowtest;

import android.util.Log;

import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import java.util.Map;
import java.util.HashMap;

public class CocoVisionModule extends ReactContextBaseJavaModule {
    CocoVisionModule(ReactApplicationContext context) {
        super(context);
    }

    @Override
    public String getName() {
        return "CocoVisionModule";
    }

    @ReactMethod
    public void testModuleStatus(String param1, String param2) {
        Log.d("CocoVisionModule", "testModuleStatus called with param1: " + param1
                + " and param2: " + param2);
    }
}
