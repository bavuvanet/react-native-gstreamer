package com.reactlibrary.camera;

import android.app.Activity;

import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.ViewGroupManager;
import com.gst_sdk_tutorials.rtspviewersf.RTSPViewerSF;

public class RCTIJKPlayerViewManager extends ViewGroupManager<RTSPViewerSF> {
    private static final String REACT_CLASS = "RCTIJKPlayer";

    private Activity activity = null;

    public RCTIJKPlayerViewManager(Activity activity){
        this.activity = activity;
    }

    @Override
    public String getName() {
        return REACT_CLASS;
    }

    @Override
    public RTSPViewerSF createViewInstance(ThemedReactContext context) {
        return new RTSPViewerSF(context, this.activity);
    }

}
