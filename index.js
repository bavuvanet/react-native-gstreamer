
// import { NativeModules } from 'react-native';
//
// const { RNReactNativeCamera } = NativeModules;
// console.log('RNReactNativeCamera', RNReactNativeCamera);
//
// export default RNReactNativeCamera;
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
    NativeAppEventEmitter,
    NativeModules,
    Platform,
    StyleSheet,
    requireNativeComponent,
    DeviceEventEmitter,
    View,
} from 'react-native';

const IJKPlayerManager = NativeModules.IJKPlayerManager || NativeModules.IJKPlayerModule;
const REF = 'RCTIJKPlayer';

function convertNativeProps(props) {
    const newProps = { ...props };
    return newProps;
}


export default class RCTIJKPlayer extends Component {

    static PlayBackState = {
        IJKMPMoviePlaybackStateStopped: 0,
        IJKMPMoviePlaybackStatePlaying: 1,
        IJKMPMoviePlaybackStatePaused: 2,
        IJKMPMoviePlaybackStateInterrupted: 3,
        IJKMPMoviePlaybackStateSeekingForward: 4,
        IJKMPMoviePlaybackStateSeekingBackward: 5,
        IJKMPMoviePlaybackStateReady: 6,
    }

    // static constants = {
    //     PlayBackState: RCTIJKPlayer.PlayBackState,
    // };

    static propTypes = {
            ...View.propTypes,
        push_url: PropTypes.string,
        onLiveStateChange: PropTypes.func,
    };

    static defaultProps = {
    };

    setNativeProps(props) {
        this.refs[REF].setNativeProps(props);
    }

    constructor() {
        super();
        this.state = {
            isAuthorized: false,
            isRecording: false
        };
    }

    _onPlayBackStateChange(data)
    {
      console.log('_onPlayBackStateChange', data);
      if(Platform.OS != 'ios')
      {
        if(data.state == 'PLAYING')
        {
          data.state = 1
        }else if(data.state == 'STOPPED')
        {
          data.state = 0
        }else if(data.state == 'PAUSED')
        {
          data.state = 2
        }else if(data.state == 'READY')
        {
          data.state = 6
        }else {
          data.state = 3
        }
      }
      if (this.props.onPlayBackStateChange) this.props.onPlayBackStateChange(data);
    }

    async componentWillMount() {
        const emitter = Platform.OS == 'ios' ? NativeAppEventEmitter : DeviceEventEmitter;
        this.playBackStateChangeListener = emitter.addListener('PlayBackState', this._onPlayBackStateChange.bind(this));
    }

    componentWillUnmount() {
        this.playBackStateChangeListener.remove();
        this.stop();
        this.shutdown();
    }

    render() {
        const style = [styles.base, this.props.style];
        const nativeProps = convertNativeProps(this.props);

        return <_RCTIJKPlayer ref={REF} {...nativeProps} />;
    }

    start(cam, date) {
        let options = {};

        if(Platform.OS == 'ios')
        {
          options.url = this.parseUrlCameraIOS(cam, date);
        }else {
          options.url = this.parseUrlCameraAndroid(cam, date);
          options.user = cam.user
          options.pass = cam.pass
        }

        console.log("ijkplayer index start begin", cam, options);
        return IJKPlayerManager.start(options).then(data => {
            console.log('start', data);
        }).catch(error => console.log("error", error));
    }

    start(options) {
        console.log("ijkplayer index start begin", options);
        return IJKPlayerManager.start(options).then(data => {
            console.log('start', data);
        }).catch(error => console.log("error", error));
    }

    parseUrlCameraIOS(cam, date)
    {
      // type : this.props.route.type, //0, 1, 2, 3
      // name: '',
      // user: '',
      // pass: '',
      // ip: '',
      // port: '',
      // dns: '',
      // port2: '',
      // string: '',
      // channel: '',
      // main: '' //0/1

      // camList.push('rtsp://mpv.cdn3.bigCDN.com:554/bigCDN/definst/mp4:bigbuckbunnyiphone_400.mp4')
      // camList.push('rtsp://admin:lumivn274@rdtestdahua.dahuaddns.com:554/cam/realmonitor?channel=1&subtype=0')
      //rtsp://admin:lumivn274@42.113.204.166:554

      // return 'rtsp://admin:lumivn274@rdtestdahua.dahuaddns.com:554/cam/realmonitor?channel=1&subtype=0';

      if(cam.type == 0) //Other
      {
        return 'rtsp://' + cam.user.trim() + ':' + cam.pass.trim() + '@' + (cam.dns.trim().length == 0 ? cam.ip : cam.dns.trim()) + ':' + (cam.dns.trim().length == 0 ? cam.port.trim() : cam.port2.trim()) + (cam.string.trim().length > 0 ? ('/' + cam.string.trim()) : '');
      }else if(cam.type == 1) //dahua
      {
        if(date)
        {
          var d = new Date()
          return 'rtsp://' + cam.user.trim() + ':' + cam.pass.trim() + '@' + (cam.dns.trim().length == 0 ? cam.ip : cam.dns.trim()) + ':' + (cam.dns.trim().length == 0 ? cam.port.trim() : cam.port2.trim()) + '/cam/playback?channel=' + cam.channel.trim() + '&starttime=' + (date.y + '_' + (date.mon) + '_' + date.d + '_' + date.h + '_' + date.m + '_00') + '&endtime=' + d.getFullYear() + '_' + ((d.getMonth() + 1) >= 10 ? (d.getMonth() + 1) : ('0' + (d.getMonth() + 1))) + '_' + (d.getDate() >= 10 ? d.getDate() : ('0' + d.getDate())) + '_' + (d.getHours() >= 10 ? d.getHours() : ('0' + d.getHours())) + '_' + (d.getMinutes() >=10 ? d.getMinutes() : ('0' + d.getMinutes())) + '_00';
        }
        return 'rtsp://' + cam.user.trim() + ':' + cam.pass.trim() + '@' + (cam.dns.trim().length == 0 ? cam.ip : cam.dns.trim()) + ':' + (cam.dns.trim().length == 0 ? cam.port.trim() : cam.port2.trim()) + '/cam/realmonitor?channel=' + cam.channel.trim() + '&subtype=' + cam.main.trim();
      }else if(cam.type == 2) //Hikvision
      {
        if(date)
        {
          var d = new Date()
          return 'rtsp://' + cam.user.trim() + ':' + cam.pass.trim() + '@' + (cam.dns.trim().length == 0 ? cam.ip : cam.dns.trim()) + ':' + (cam.dns.trim().length == 0 ? cam.port.trim() : cam.port2.trim())  + (cam.channel.trim().length > 0 ? ('/Streaming/tracks/' + (parseInt(cam.channel.trim()) + '0' + cam.main.trim())) : '') + '?starttime=' + date.y + date.mon + date.d + 't' + date.h+date.m + '00z&endtime=' + d.getFullYear() + ((d.getMonth() + 1) >= 10 ? (d.getMonth() + 1) : ('0' + (d.getMonth() + 1))) + (d.getDate() >= 10 ? d.getDate() : ('0' + d.getDate())) + 't' +  (d.getHours() >= 10 ? d.getHours() : ('0' + d.getHours())) + (d.getMinutes() >=10 ? d.getMinutes() : ('0' + d.getMinutes())) + '00z';
        }
        return 'rtsp://' + cam.user.trim() + ':' + cam.pass.trim() + '@' + (cam.dns.trim().length == 0 ? cam.ip : cam.dns.trim()) + ':' + (cam.dns.trim().length == 0 ? cam.port.trim() : cam.port2.trim())  + (cam.channel.trim().length > 0 ? ('/Streaming/Channels/' + cam.channel.trim() + '0' + cam.main.trim()) : '');
      }
      return 'rtsp://' + cam.user.trim() + ':' + cam.pass.trim() + '@' + (cam.dns.trim().length == 0 ? cam.ip : cam.dns.trim()) + ':' + (cam.dns.trim().length == 0 ? cam.port.trim() : cam.port2.trim())  + (cam.channel.trim().length > 0 ? ('/' + cam.channel.trim()) : '');

      // return 'rtsp://mpv.cdn3.bigCDN.com:554/bigCDN/definst/mp4:bigbuckbunnyiphone_400.mp4'
    }
    parseUrlCameraAndroid(cam, date)
    {
      // type : this.props.route.type, //0, 1, 2, 3
      // name: '',
      // user: '',
      // pass: '',
      // ip: '',
      // port: '',
      // dns: '',
      // port2: '',
      // string: '',
      // channel: '',
      // main: '' //0/1

      // camList.push('rtsp://mpv.cdn3.bigCDN.com:554/bigCDN/definst/mp4:bigbuckbunnyiphone_400.mp4')
      // camList.push('rtsp://admin:lumivn274@rdtestdahua.dahuaddns.com:554/cam/realmonitor?channel=1&subtype=0')
      //rtsp://admin:lumivn274@42.113.204.166:554

      // return 'rtsp://admin:lumivn274@rdtestdahua.dahuaddns.com:554/cam/realmonitor?channel=1&subtype=0';

      if(cam.type == 0) //Other
      {
        return 'rtsp://' + (cam.dns.trim().length == 0 ? cam.ip : cam.dns.trim()) + ':' + (cam.dns.trim().length == 0 ? cam.port.trim() : cam.port2.trim()) + (cam.string.trim().length > 0 ? ('/' + cam.string.trim()) : '');
      }else if(cam.type == 1) //dahua
      {
        if(date)
        {
          var d = new Date()
          return 'rtsp://' + (cam.dns.trim().length == 0 ? cam.ip : cam.dns.trim()) + ':' + (cam.dns.trim().length == 0 ? cam.port.trim() : cam.port2.trim()) + '/cam/playback?channel=' + cam.channel.trim() + '&starttime=' + (date.y + '_' + (date.mon) + '_' + date.d + '_' + date.h + '_' + date.m + '_00') + '&endtime=' + d.getFullYear() + '_' + ((d.getMonth() + 1) >= 10 ? (d.getMonth() + 1) : ('0' + (d.getMonth() + 1))) + '_' + (d.getDate() >= 10 ? d.getDate() : ('0' + d.getDate())) + '_' + (d.getHours() >= 10 ? d.getHours() : ('0' + d.getHours())) + '_' + (d.getMinutes() >=10 ? d.getMinutes() : ('0' + d.getMinutes())) + '_00';
        }
        return 'rtsp://' + (cam.dns.trim().length == 0 ? cam.ip : cam.dns.trim()) + ':' + (cam.dns.trim().length == 0 ? cam.port.trim() : cam.port2.trim()) + '/cam/realmonitor?channel=' + cam.channel.trim() + '&subtype=' + cam.main.trim();
      }else if(cam.type == 2) //Hikvision
      {
        if(date)
        {
          var d = new Date()
          return 'rtsp://' + (cam.dns.trim().length == 0 ? cam.ip : cam.dns.trim()) + ':' + (cam.dns.trim().length == 0 ? cam.port.trim() : cam.port2.trim())  + (cam.channel.trim().length > 0 ? ('/Streaming/tracks/' + (100 + parseInt(cam.channel.trim()))) : '') + '?starttime=' + date.y + date.mon + date.d + 't' + date.h+date.m + '00z&endtime=' + d.getFullYear() + ((d.getMonth() + 1) >= 10 ? (d.getMonth() + 1) : ('0' + (d.getMonth() + 1))) + (d.getDate() >= 10 ? d.getDate() : ('0' + d.getDate())) + 't' +  (d.getHours() >= 10 ? d.getHours() : ('0' + d.getHours())) + (d.getMinutes() >=10 ? d.getMinutes() : ('0' + d.getMinutes())) + '00z';
        }
        return 'rtsp://' + cam.user.trim() + ':' + cam.pass.trim() + '@' + (cam.dns.trim().length == 0 ? cam.ip : cam.dns.trim()) + ':' + (cam.dns.trim().length == 0 ? cam.port.trim() : cam.port2.trim())  + (cam.channel.trim().length > 0 ? ('/Streaming/Channels/' + cam.channel.trim() + '0' + cam.main.trim()) : '');
      }
      return 'rtsp://' + (cam.dns.trim().length == 0 ? cam.ip : cam.dns.trim()) + ':' + (cam.dns.trim().length == 0 ? cam.port.trim() : cam.port2.trim())  + (cam.channel.trim().length > 0 ? ('/' + cam.channel.trim()) : '');

      // return 'rtsp://mpv.cdn3.bigCDN.com:554/bigCDN/definst/mp4:bigbuckbunnyiphone_400.mp4'
    }

    stop() {
        console.log("stop");
        IJKPlayerManager.stop();
    }

    resume() {
        console.log("resume");
        IJKPlayerManager.resume();
    }

    pause() {
        console.log("pause");
        IJKPlayerManager.pause();
    }

    shutdown() {
        console.log("shutdown");
        IJKPlayerManager.shutdown();
    }

    seekTo(currentPlaybackTime) {
        console.log("seekTo ", currentPlaybackTime);
        IJKPlayerManager.seekTo(currentPlaybackTime);
    }

    playbackInfo() {
        let self = this;
        return IJKPlayerManager.playbackInfo()
            .then(data => {
                for (var k in data) {
                    if (data.hasOwnProperty(k)) {
                        data[k] = +data[k];
                    }

                }
                // console.log(data);
                if (self.props.onPlayBackInfo) self.props.onPlayBackInfo(data);
            }).catch(error => console.log("error", error));
    }
}

export const constants = RCTIJKPlayer.constants;

const _RCTIJKPlayer = requireNativeComponent('RCTIJKPlayer', RCTIJKPlayer);

const styles = StyleSheet.create({
    base: {},
});
