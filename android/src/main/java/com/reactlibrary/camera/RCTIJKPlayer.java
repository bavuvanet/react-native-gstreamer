package com.reactlibrary.camera;


import com.gst_sdk_tutorials.rtspviewersf.RTSPViewerSF;
public class RCTIJKPlayer {

    private static final RCTIJKPlayer ourInstance = new RCTIJKPlayer();
    private RTSPViewerSF mIJKPlayerView;


    public static RCTIJKPlayer getInstance() {
        return ourInstance;
    }

    public static RTSPViewerSF getViewInstance() {
        return ourInstance.mIJKPlayerView;
    }

    public void setIJKPlayerView(RTSPViewerSF mIJKPlayerView) {
        this.mIJKPlayerView = mIJKPlayerView;
    }

    private RCTIJKPlayer() {
    }

}
