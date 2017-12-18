package com.gst_sdk_tutorials.rtspviewersf;


import android.app.Activity;
import android.content.Context;
import android.os.Handler;
import android.os.Message;
import android.util.DisplayMetrics;
import android.util.Log;
import android.view.SurfaceView;
import android.view.SurfaceHolder;
import android.view.View;
import android.view.WindowManager;
import android.widget.FrameLayout;
import android.widget.Toast;


import android.graphics.SurfaceTexture;
import android.view.Surface;
import android.view.TextureView;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.UiThreadUtil;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import org.freedesktop.gstreamer.GStreamer;

import com.reactlibrary.camera.GStreamerSurfaceView;
import com.reactlibrary.camera.RCTIJKPlayer;

import java.util.LinkedList;

public class RTSPViewerSF extends FrameLayout implements TextureView.SurfaceTextureListener {
    private static final String TAG = "RCTIJKPlayerView";
    private final Context _context;
    private Activity activity = null;
    private FrameLayout framelayout;

    private native long nativePlayerCreate();        // Initialize native code, build pipeline, etc
    private native void nativePlayerFinalize(long data);   // Destroy pipeline and shutdown native code
    private native void nativeSetUri(long data, String uri, String user, String pass); // Set the URI of the media to play
    private native void nativePlay(long data);       // Set pipeline to PLAYING
    private native void nativeSetPosition(long data, int milliseconds); // Seek to the indicated position, in milliseconds
    private native void nativePause(long data);      // Set pipeline to PAUSED
    private native void nativeReady(long data);      // Set pipeline to READY
    private static native boolean nativeLayerInit(); // Initialize native class: cache Method IDs for callbacks
    private native void nativeSurfaceInit(long data, Object surface); // A new surface is available
    private native void nativeSurfaceFinalize(long data); // Surface about to be destroyed

    private long native_custom_data;      // Native code will store the player here


    private GStreamerSurfaceView surfaceView;


    private String defaultMediaUri = "rtsp://1.55.97.106:554";
    private String defaultMediaUser = "admin";
    private String defaultMediaPass = "lumivn274";


    public RTSPViewerSF(Context context, Activity activity) {
        super(context);
        this._context = context;
        this.activity = activity;

        RCTIJKPlayer.getInstance().setIJKPlayerView(this);

        surfaceView = new GStreamerSurfaceView(context);

        surfaceView.setSurfaceTextureListener(this);
        addView(surfaceView);

        if (!nativeLayerInit())
    	    throw new RuntimeException("Failed to initialize Native layer(not all necessary interface methods implemeted?)");

        try {
            GStreamer.init(context);
        } catch (Exception e) {
            Toast.makeText(context, e.getMessage(), Toast.LENGTH_LONG).show();
        }
        // addView(mIJKPlayerView);


        native_custom_data = nativePlayerCreate ();

    }


      static {
          System.loadLibrary("gstreamer_android");
          System.loadLibrary("mediaplayer");
      }

    public void refresh() {
        Log.e(TAG, "view refresh");
        this.postInvalidate();
        UiThreadUtil.runOnUiThread(new Runnable() {
            public void run() {
                requestLayout();
            }
        });

    }

    // Called from native code.
    private void nativeStateChanged(long data, final String state) {
      this.sendEvent(state);
        // final TextView tv;
        // final String message;
        // int player_id = findPlayerIdByPlayerData(data);
        //
        // this.state[player_id] = state;
        //
        // tv = findTextViewByPlayerId(player_id);
        //
        // message = getPlayerTitle (player_id);
        //
        // runOnUiThread (new Runnable() {
        //   public void run() {
        //     tv.setText(message);
        //   }
        // });
    }

    // Called from native code.
    private void nativeErrorOccured(long data, String message) {
    	final String ui_message;
    	// int player_id = findPlayerIdByPlayerData(data);
      //
    	// ui_message = "Player " + player_id + ":" + message;
      //
      //   runOnUiThread (new Runnable() {
      //       public void run() {
      //           Toast.makeText(RTSPViewerSF.this, ui_message, Toast.LENGTH_SHORT).show();
      //       }
      //   });
    }
    // Called from native code
    private void nativePositionUpdated(long data, final int position, final int duration) {
        // final int player_id = findPlayerIdByPlayerData (data);
        // final SeekBar sb = findSeekBarByPlayerId (player_id);
        //
        // // Ignore position messages from the pipeline if the seek bar is being dragged
        // if (sb.isPressed()) return;
        //
        // runOnUiThread (new Runnable() {
        //   public void run() {
        //     sb.setMax(duration);
        //     sb.setProgress(position);
        //     updateTimeWidget(player_id);
        //     sb.setEnabled(duration != 0);
        //   }
        // });
        // this.position[player_id] = position;
        // this.duration[player_id] = duration;
    }

    private void sendEvent(String state) {
        Log.e(TAG, "sendEvent");
        ReactContext reactContext = (ReactContext) getContext();
        WritableMap params = Arguments.createMap();
        params.putString("state", state);
        reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit("PlayBackState", params);

    }


// Set the URI to play, and record whether it is a local or remote file
    private void setMediaUri(String uri, String user, String pass) {
        nativeSetUri (native_custom_data, uri, user, pass);
    }

    private void reConfigureGstreamer (String uri, String user, String pass) {

        // Restore previous playing state
        setMediaUri (uri, user, pass);
        // nativeSetPosition (native_custom_data, 0);
        nativePlay(native_custom_data);

    }

    @Override
    public void onSurfaceTextureAvailable(SurfaceTexture surfaceTexture, int i, int i2) {
      Surface surface = new Surface(surfaceTexture);
            nativeSurfaceInit (native_custom_data, surface);
            // reConfigureGstreamer (defaultMediaUri, defaultMediaUser, defaultMediaPass);
    }

    @Override
    public void onSurfaceTextureSizeChanged(SurfaceTexture surfaceTexture, int width, int height) {
      surfaceView.media_width = width;
      surfaceView.media_height = height;
      // activity.runOnUiThread(new Runnable() {
      //     public void run() {
              // surfaceView.requestLayout();
      //     }
      // });
      Surface surface = new Surface(surfaceTexture);
      nativeSurfaceInit (native_custom_data, surface);
      reConfigureGstreamer (defaultMediaUri, defaultMediaUser, defaultMediaPass);
    }

    @Override
    public boolean onSurfaceTextureDestroyed(SurfaceTexture surfaceTexture) {
        nativeSurfaceFinalize (native_custom_data);
        return true;
    }

    @Override
    public void onSurfaceTextureUpdated(SurfaceTexture surfaceTexture) {
    }

    public void surfaceChanged(SurfaceHolder holder, int format, int width,
            int height) {
        Log.d("GStreamer", "Surface changed to format " + format + " width "
                + width + " height " + height);

    }

    public void surfaceCreated(SurfaceHolder holder) {
        Log.d("GStreamer", "Surface created: " + holder.getSurface());
                nativeSurfaceInit (native_custom_data, holder.getSurface());
                reConfigureGstreamer (defaultMediaUri, defaultMediaUser, defaultMediaPass);
    }

    public void surfaceDestroyed(SurfaceHolder holder) {
        Log.d("GStreamer", "Surface destroyed");

        nativeSurfaceFinalize (native_custom_data);
    }

     // Called from native code when the size of the media changes or is first detected.
    // Inform the video surface about the new size and recalculate the layout.
    private void nativeMediaSizeChanged (long data, int width, int height) {

        Log.i ("GStreamer", "Media size changed to " + width + "x" + height);

        surfaceView.media_width = width;
        surfaceView.media_height = height;
        activity.runOnUiThread(new Runnable() {
            public void run() {
                surfaceView.requestLayout();
            }
        });
    }

    public void start(final String URL, final String user, final String pass) {
        Log.e(TAG, String.format("start URL %s", URL));
        defaultMediaUri = URL;
        defaultMediaUser = user;
        defaultMediaPass = pass;
        setMediaUri(defaultMediaUri, defaultMediaUser, defaultMediaPass);
        nativePlay(native_custom_data);
    }

    public void stop() {
        Log.e(TAG, String.format("stop"));
        nativeReady(native_custom_data);
    }

    public void pause() {
        Log.e(TAG, String.format("pause"));
        nativePause(native_custom_data);
    }

    public void resume() {
        Log.e(TAG, String.format("resume"));
        nativePlay(native_custom_data);

    }

    public void shutdown() {
        Log.e(TAG, String.format("shutdown"));
        // mIJKPlayerView.release(true);
    }

    public void seekTo(double currentPlaybackTime) {
        int position = (int)(currentPlaybackTime * 1000);
        Log.e(TAG, "seekTo "+ currentPlaybackTime + ", " + position);
        // mIJKPlayerView.seekTo(position);
    }
}
