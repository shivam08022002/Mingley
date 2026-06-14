import React, { useEffect, useState, useRef, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StatusBar,
  Platform,
  Animated,
  Easing,
  Dimensions,
  Alert,
  PermissionsAndroid,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image as FastImage } from 'expo-image';
import Icon from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { useChatStore } from '../../../store/useChatStore';
import { callService } from '../../../services/apiServices';
import { signalRService } from '../../../services/signalRService';
import { useToastStore } from '../../../store/useToastStore';
import { useSubscriptionStore } from '../../subscription/store/useSubscriptionStore';

// ─── Agora SDK (native only) ─────────────────────────────────────────────────
let createAgoraRtcEngine, RtcSurfaceView, ChannelProfileType, ClientRoleType;

if (Platform.OS !== 'web') {
  try {
    const req = require;
    const Agora = req('react-native-agora');
    createAgoraRtcEngine = Agora.createAgoraRtcEngine;
    RtcSurfaceView       = Agora.RtcSurfaceView;
    ChannelProfileType   = Agora.ChannelProfileType;
    ClientRoleType       = Agora.ClientRoleType;
  } catch (e) {
    console.warn('[CallingScreen] Agora SDK not found. Voice/Video calling will be mocked.', e);
  }
}

// Fallback mocks for web or when react-native-agora is not installed/loaded
if (!ChannelProfileType) {
  ChannelProfileType = {
    ChannelProfileCommunication: 0,
  };
}
if (!ClientRoleType) {
  ClientRoleType = {
    ClientRoleBroadcaster: 1,
  };
}
if (!RtcSurfaceView) {
  RtcSurfaceView = View;
}
if (!createAgoraRtcEngine) {
  createAgoraRtcEngine = () => ({
    initialize: () => {
      console.log('[Agora Mock] initialize called');
    },
    enableAudio: () => {
      console.log('[Agora Mock] enableAudio called');
    },
    enableVideo: () => {
      console.log('[Agora Mock] enableVideo called');
    },
    startPreview: () => {
      console.log('[Agora Mock] startPreview called');
    },
    addListener: (event, callback) => {
      console.log(`[Agora Mock] addListener: ${event}`);
      if (event === 'onJoinChannelSuccess') {
        setTimeout(() => callback({ channelId: 'mock-channel' }, 0), 1000);
      }
      if (event === 'onUserJoined') {
        setTimeout(() => callback({ channelId: 'mock-channel' }, 12345), 3000);
      }
    },
    setEnableSpeakerphone: (enabled) => {
      console.log(`[Agora Mock] setEnableSpeakerphone: ${enabled}`);
    },
    joinChannel: (token, channel, uid, options) => {
      console.log(`[Agora Mock] joinChannel: ${channel}`);
    },
    muteLocalAudioStream: (muted) => {
      console.log(`[Agora Mock] muteLocalAudioStream: ${muted}`);
    },
    muteLocalVideoStream: (muted) => {
      console.log(`[Agora Mock] muteLocalVideoStream: ${muted}`);
    },
    switchCamera: () => {
      console.log('[Agora Mock] switchCamera called');
    },
    leaveChannel: () => {
      console.log('[Agora Mock] leaveChannel called');
    },
    release: () => {
      console.log('[Agora Mock] release called');
    },
  });
}

const CALLER_IMAGE_FALLBACK =
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80';
const MY_CAMERA_IMAGE =
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=800&q=80';

/* ─── Small reusable icon button ─────────────────────────────────────────── */
const IconButton = memo(({ name, onPress, size = 24, backgroundColor = '#F5F5F5', iconColor = '#555', btnSize = 56 }) => (
  <TouchableOpacity
    style={[styles.iconButton, { backgroundColor, width: btnSize, height: btnSize, borderRadius: btnSize / 2 }]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Icon name={name} size={size} color={iconColor} />
  </TouchableOpacity>
));

const soundEffects = new (class {
  ctx = null;
  osc1 = null;
  osc2 = null;
  gainNode = null;
  interval = null;

  startRinging(type) {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      
      this.stop();
      this.ctx = new AudioContextClass();
      
      const playTone = () => {
        if (!this.ctx) return;
        if (this.ctx.state === 'suspended') this.ctx.resume();
        
        this.osc1 = this.ctx.createOscillator();
        this.osc2 = this.ctx.createOscillator();
        this.gainNode = this.ctx.createGain();
        
        if (type === 'dialing') {
          this.osc1.frequency.value = 440;
          this.osc2.frequency.value = 480;
        } else {
          this.osc1.frequency.value = 480;
          this.osc2.frequency.value = 540;
        }
        
        this.osc1.connect(this.gainNode);
        this.osc2.connect(this.gainNode);
        this.gainNode.connect(this.ctx.destination);
        
        this.gainNode.gain.setValueAtTime(0, this.ctx.currentTime);
        this.gainNode.gain.linearRampToValueAtTime(0.15, this.ctx.currentTime + 0.1);
        this.osc1.start();
        this.osc2.start();
        
        const stopTime = this.ctx.currentTime + 1.5;
        this.gainNode.gain.setValueAtTime(0.15, stopTime - 0.1);
        this.gainNode.gain.linearRampToValueAtTime(0, stopTime);
        this.osc1.stop(stopTime);
        this.osc2.stop(stopTime);
      };
      
      playTone();
      this.interval = setInterval(playTone, 4000);
    } catch (e) {
      console.warn('Ringing sound failed:', e);
    }
  }

  stop() {
    if (this.interval) { clearInterval(this.interval); this.interval = null; }
    if (this.osc1) { try { this.osc1.stop(); } catch {} this.osc1 = null; }
    if (this.osc2) { try { this.osc2.stop(); } catch {} this.osc2 = null; }
    if (this.ctx) { try { this.ctx.close(); } catch {} this.ctx = null; }
  }
})();

/* ─── Main screen ─────────────────────────────────────────────────────────── */
export const CallingScreen = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions();

  // Responsive sizing
  const isSmallPhone = SCREEN_HEIGHT < 700;
  const ICON_SIZE = isSmallPhone ? 48 : 56;
  const END_CALL_SIZE = isSmallPhone ? 72 : 84;
  const PIP_WIDTH = isSmallPhone ? 90 : 110;
  const PIP_HEIGHT = isSmallPhone ? 130 : 160;
  const controlPanelHeight = isSmallPhone ? 100 : 120;

  /* ── Route params ── */
  const { user } = route?.params || {
    user: {
      name: 'Sara Christin',
      image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80',
      callerImage: CALLER_IMAGE_FALLBACK,
    },
  };

  const [remoteUser, setRemoteUser] = useState(user);
  const myUser = useChatStore((s) => s.user);

  const safeRemoteImage = remoteUser?.avatar || remoteUser?.image || remoteUser?.callerImage || CALLER_IMAGE_FALLBACK;
  const safeSelfImage = myUser?.avatar || myUser?.image || MY_CAMERA_IMAGE;

  const [swapped, setSwapped] = useState(false);
  const fullImage = swapped ? safeSelfImage : safeRemoteImage;
  const pipImage = swapped ? safeRemoteImage : safeSelfImage;
  const pipLabel = swapped ? remoteUser?.name?.split(' ')[0] ?? 'Them' : 'You';

  const swapOpacity = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  /* ── Agora engine ref ── */
  const agoraEngineRef = useRef(null);
  const [agoraJoined, setAgoraJoined] = useState(false);
  const [remoteUid, setRemoteUid] = useState(null);

  /* ── Call API State ── */
  const [callId, setCallId] = useState(null);
  const callIdRef = useRef(null); // Keep a ref so SignalR callbacks can access it
  const [agoraToken, setAgoraToken] = useState(null);
  const [agoraAppId, setAgoraAppId] = useState(null);
  const [agoraChannel, setAgoraChannel] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [incomingAnswered, setIncomingAnswered] = useState(false);
  const [outgoingAnswered, setOutgoingAnswered] = useState(false); // ← set to true when callee picks up
  const isIncoming = route.params?.isIncoming || false;

  /* ── Controls ── */
  const [micMuted, setMicMuted] = useState(false);
  const [speakerEnabled, setSpeakerEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(route?.params?.callType === 'video');

  /* ── Wallet ── */
  const coins = useChatStore((s) => s.wallet.coins);
  const deductCoins = useChatStore((s) => s.deductCoins);
  const [costPerMin, setCostPerMin] = useState(route?.params?.callType === 'video' ? 100 : 10);
  const [time, setTime] = useState(0);
  const currentStatus = useSubscriptionStore((s) => s.currentStatus);

  const LOW_BALANCE_THRESHOLD = costPerMin * 2;
  const isLowBalance = coins <= LOW_BALANCE_THRESHOLD && coins > 0;

  /* ─────────────────────────────────────────────────────────────────────────
     ANDROID PERMISSIONS
  ───────────────────────────────────────────────────────────────────────── */
  const requestAndroidPermissions = async (callType) => {
    if (Platform.OS !== 'android') return true;
    try {
      const perms = [PermissionsAndroid.PERMISSIONS.RECORD_AUDIO];
      if (callType === 'video') perms.push(PermissionsAndroid.PERMISSIONS.CAMERA);
      const grants = await PermissionsAndroid.requestMultiple(perms);
      return Object.values(grants).every((r) => r === PermissionsAndroid.RESULTS.GRANTED);
    } catch {
      return false;
    }
  };

  /* ─────────────────────────────────────────────────────────────────────────
     INITIALIZE AGORA ENGINE
  ───────────────────────────────────────────────────────────────────────── */
  const initAgoraEngine = async (appId, callType) => {
    if (agoraEngineRef.current) return;

    const engine = createAgoraRtcEngine();
    agoraEngineRef.current = engine;

    engine.initialize({
      appId,
      channelProfile: ChannelProfileType.ChannelProfileCommunication,
    });

    engine.enableAudio();
    if (callType === 'video') {
      engine.enableVideo();
      engine.startPreview();
    }

    engine.addListener('onUserJoined', (connection, uid) => {
      console.log('Agora: Remote user joined uid=', uid);
      setRemoteUid(uid);
      // When remote user joins Agora channel, caller knows callee picked up
      setOutgoingAnswered(true);
    });

    engine.addListener('onUserOffline', (connection, uid) => {
      console.log('Agora: Remote user left uid=', uid);
      setRemoteUid(null);
      navigation.goBack();
    });

    engine.addListener('onJoinChannelSuccess', (connection, elapsed) => {
      console.log('Agora: Joined channel', connection.channelId);
      setAgoraJoined(true);
    });

    engine.addListener('onError', (err, msg) => {
      console.error('Agora error', err, msg);
    });

    engine.setEnableSpeakerphone(true);
  };

  const joinAgoraChannel = async (appId, token, channel, callType) => {
    if (Platform.OS === 'web') {
      console.log('[Agora Mock Web] Channel join bypass');
      setAgoraJoined(true);
      return;
    }
    try {
      await requestAndroidPermissions(callType);
      await initAgoraEngine(appId, callType);

      await agoraEngineRef.current.joinChannel(
        token || null,
        channel,
        0,
        {
          clientRoleType: ClientRoleType.ClientRoleBroadcaster,
          publishMicrophoneTrack: true,
          publishCameraTrack: callType === 'video',
          autoSubscribeAudio: true,
          autoSubscribeVideo: callType === 'video',
        }
      );
    } catch (err) {
      console.error('Agora joinChannel failed:', err);
      Alert.alert('Call Error', 'Could not connect to the call. Please try again.');
    }
  };

  /* ─────────────────────────────────────────────────────────────────────────
     JOIN WHEN WE HAVE ALL THREE: appId, token/null, channel
  ───────────────────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (!agoraAppId || !agoraChannel || agoraJoined) return;
    const callType = route?.params?.callType || 'audio';
    joinAgoraChannel(agoraAppId, agoraToken, agoraChannel, callType);
  }, [agoraAppId, agoraToken, agoraChannel]);

  /* ─────────────────────────────────────────────────────────────────────────
     FIX: SIGNALR — Listen for CallAnswered (outgoing calls)
     When callee picks up, the server sends a SignalR event "CallAnswered".
     This transitions the caller from "Ringing…" → timer running.
  ───────────────────────────────────────────────────────────────────────── */
  useEffect(() => {
    signalRService.onCallAnswered = (data) => {
      const currentCallId = callIdRef.current;
      if (!data?.callId || !currentCallId || data.callId === currentCallId) {
        console.log('[CallingScreen] CallAnswered received → outgoing call answered');
        setOutgoingAnswered(true);

        // If we get Agora details in the answered payload, use them
        const agoraObj = data?.agora;
        if (agoraObj?.appId && !agoraJoined) {
          setAgoraAppId(agoraObj.appId);
          setAgoraToken(agoraObj.token || null);
          setAgoraChannel(agoraObj.channelName || `call_${currentCallId}`);
        }
      }
    };
    return () => { signalRService.onCallAnswered = null; };
  }, [agoraJoined]);

  // Keep callIdRef in sync with state
  useEffect(() => { callIdRef.current = callId; }, [callId]);

  /* ─────────────────────────────────────────────────────────────────────────
     POLLING FALLBACK: Poll call status every 4s while ringing (outgoing only)
     In case SignalR event is missed. Stops once call is connected.
  ───────────────────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (isIncoming || outgoingAnswered || !callId) return;

    const pollInterval = setInterval(async () => {
      try {
        const res = await callService.getCallStatus?.(callId);
        const status = res?.data?.status || res?.status;
        if (status === 'active' || status === 'answered' || status === 'connected') {
          console.log('[CallingScreen] Poll detected call answered, status=', status);
          setOutgoingAnswered(true);
          clearInterval(pollInterval);

          // Grab Agora details if not yet connected
          if (!agoraJoined) {
            const agoraObj = res?.data?.agora || res?.agora;
            if (agoraObj?.appId) {
              setAgoraAppId(agoraObj.appId);
              setAgoraToken(agoraObj.token || null);
              setAgoraChannel(agoraObj.channelName || `call_${callId}`);
            }
          }
        }
      } catch (e) {
        // Silently ignore poll errors
      }
    }, 4000);

    return () => clearInterval(pollInterval);
  }, [callId, isIncoming, outgoingAnswered, agoraJoined]);

  /* ─────────────────────────────────────────────────────────────────────────
     MOUNT: Initiate or receive call on server
  ───────────────────────────────────────────────────────────────────────── */
  useEffect(() => {
    let activeCallId = null;

    const startCallOnServer = async () => {
      if (isIncoming) {
        const incomingCallId = route.params?.callId;
        if (incomingCallId) {
          activeCallId = incomingCallId;
          setCallId(incomingCallId);
        }
        return;
      }

      try {
        const initialUser = route?.params?.user || {};
        const targetId = initialUser.id || initialUser._id || '';
        const response = await callService.initiateCall(targetId, route?.params?.callType || 'audio');

        const newCallId = response.data?.callId || response.callId || response.data?.id || response.id;
        const rate = response.data?.costPerMin ?? response.costPerMin ?? (route?.params?.callType === 'video' ? 100 : 10);
        setCostPerMin(rate);

        const serverTarget = response.data?.target || response.target;
        if (serverTarget) {
          setRemoteUser((prev) => ({
            ...prev,
            name: serverTarget.fullName || serverTarget.name || prev.name,
            avatar: serverTarget.avatar || serverTarget.image || prev.avatar,
            id: serverTarget.id || serverTarget._id || prev.id,
          }));
        }

        if (newCallId) {
          activeCallId = newCallId;
          setCallId(newCallId);

          const agoraObj = response.data?.agora || response.agora;
          const appId = agoraObj?.appId;
          const token = agoraObj?.token || agoraObj?.agoraToken || null;
          const channel = agoraObj?.channelName || agoraObj?.channel || `call_${newCallId}`;

          if (appId) {
            setAgoraAppId(appId);
            setAgoraToken(token);
            setAgoraChannel(channel);
          } else {
            const tokenRes = await callService.getAgoraToken(newCallId);
            const fallbackAppId = tokenRes.data?.appId || tokenRes.appId;
            if (fallbackAppId) {
              setAgoraAppId(fallbackAppId);
              setAgoraToken(tokenRes.data?.token || tokenRes.token || null);
              setAgoraChannel(tokenRes.data?.channelName || tokenRes.channelName || `call_${newCallId}`);
            }
          }
        }
      } catch (error) {
        const errMsg = error.message || (typeof error === 'string' ? error : 'Call initiation failed');
        setApiError(errMsg);
        Alert.alert('Call Failed', errMsg, [{ text: 'OK', onPress: () => navigation.goBack() }]);
      }
    };

    startCallOnServer();

    return () => {
      if (activeCallId) callService.endCall(activeCallId).catch(console.error);
      if (agoraEngineRef.current) {
        agoraEngineRef.current.leaveChannel();
        agoraEngineRef.current.release();
        agoraEngineRef.current = null;
      }
    };
  }, [isIncoming]);

  /* ── Animations ── */
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 0.4, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 1, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
    ])).start();
    Animated.loop(Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.04, duration: 4000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 4000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
    ])).start();
  }, []);

  // isCallConnected: true once Agora is live AND either callee answered (outgoing) or caller answered (incoming)
  const isCallConnected = agoraJoined && (isIncoming ? incomingAnswered : (outgoingAnswered || remoteUid !== null));

  /* ── Timer: only when actually connected ── */
  useEffect(() => {
    if (!isCallConnected) return;
    const t = setInterval(() => setTime((prev) => prev + 1), 1000);
    return () => clearInterval(t);
  }, [isCallConnected]);

  // Ringing sound
  useEffect(() => {
    if (isCallConnected) {
      soundEffects.stop();
    } else {
      if (isIncoming && !incomingAnswered) soundEffects.startRinging('incoming');
      else if (!isIncoming && !outgoingAnswered) soundEffects.startRinging('dialing');
    }
    return () => soundEffects.stop();
  }, [isCallConnected, isIncoming, incomingAnswered, outgoingAnswered]);

  /* ── Answer incoming call ── */
  const handleAnswer = async () => {
    try {
      if (!callId) return;
      const response = await callService.answerCall(callId);
      setIncomingAnswered(true);

      const rate = response?.data?.costPerMin ?? response?.costPerMin ?? (route?.params?.callType === 'video' ? 100 : 10);
      setCostPerMin(rate);

      const agoraObj = response?.data?.agora || response?.agora;
      const appId = agoraObj?.appId || response?.data?.appId || response?.appId;
      const token = agoraObj?.token || agoraObj?.agoraToken || response?.data?.token || response?.token || null;
      const channel = agoraObj?.channelName || agoraObj?.channel || response?.data?.channelName || `call_${callId}`;

      if (appId) {
        setAgoraAppId(appId);
        setAgoraToken(token);
        setAgoraChannel(channel);
      } else {
        const tokenRes = await callService.getAgoraToken(callId);
        setAgoraAppId(tokenRes.data?.appId || tokenRes.appId);
        setAgoraToken(tokenRes.data?.token || tokenRes.token || null);
        setAgoraChannel(tokenRes.data?.channelName || tokenRes.channelName || `call_${callId}`);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to answer call.');
    }
  };

  const handleDecline = async () => {
    try { if (callId) await callService.declineCall(callId); } catch {}
    navigation.goBack();
  };

  const handleHangUp = async () => {
    try { if (callId) await callService.endCall(callId); } catch {}
    navigation.goBack();
  };

  // 30 seconds ringing timeout
  useEffect(() => {
    if (isCallConnected) return;

    const timeoutSecs = route.params?.timeoutIn || 30;
    const timeoutTimer = setTimeout(() => {
      console.log('[CallingScreen] Call timed out after', timeoutSecs, 'seconds');
      useToastStore.getState().showToast({
        title: 'Call Unanswered 📞',
        text: 'The other person did not pick up the call.',
        type: 'info'
      });
      if (isIncoming && !incomingAnswered) {
        handleDecline();
      } else {
        handleHangUp();
      }
    }, timeoutSecs * 1000);

    return () => clearTimeout(timeoutTimer);
  }, [isCallConnected, isIncoming, incomingAnswered, callId]);

  /* ── Coin deduction every minute ── */
  useEffect(() => {
    if (!isCallConnected || time === 0 || time % 60 !== 0) return;
    if (coins < costPerMin) {
      useToastStore.getState().showToast({ title: 'Call Disconnected 📞', text: 'Insufficient coins balance.', type: 'error' });
      navigation.goBack();
      return;
    }
    deductCoins(costPerMin);
  }, [time, isCallConnected]);

  /* ── Agora control handlers ── */
  const toggleMic = () => { agoraEngineRef.current?.muteLocalAudioStream(!micMuted); setMicMuted((p) => !p); };
  const toggleSpeaker = () => { agoraEngineRef.current?.setEnableSpeakerphone(!speakerEnabled); setSpeakerEnabled((p) => !p); };
  const toggleVideo = async () => {
    if (!videoEnabled) {
      try {
        await useSubscriptionStore.getState().fetchStatus();
      } catch (e) {
        console.error('Failed to fetch status before toggling video:', e);
      }
      const status = useSubscriptionStore.getState().currentStatus;
      const planName = (status?.isActive && status?.planName)
        ? status.planName.toLowerCase()
        : 'free';
      const hasPremium = planName === 'gold' || planName === 'platinum' || planName === 'vip';
      if (planName === 'free' || planName === 'silver' || !hasPremium) {
        Alert.alert(
          '🔒 Premium Feature',
          'Video calls are only available for Gold and higher tier members. Upgrade now to connect!',
          [
            { text: 'Later', style: 'cancel' },
            { text: 'Upgrade', onPress: () => {
              if (callId) callService.endCall(callId).catch(console.error);
              navigation.navigate('SubscriptionPlans');
            }}
          ]
        );
        return;
      }
    }
    agoraEngineRef.current?.muteLocalVideoStream(!videoEnabled ? false : true);
    setVideoEnabled((p) => !p);
  };
  const flipCamera = () => agoraEngineRef.current?.switchCamera();

  const handleSwap = () => {
    Animated.timing(swapOpacity, { toValue: 0, duration: 180, useNativeDriver: true }).start(() => {
      setSwapped((p) => !p);
      Animated.timing(swapOpacity, { toValue: 1, duration: 220, useNativeDriver: true }).start();
    });
  };

  const formatTime = () => {
    if (!isCallConnected) {
      if (isIncoming && !incomingAnswered) return 'Incoming Call...';
      if (!isIncoming && !outgoingAnswered) return 'Ringing...';
      return 'Connecting...';
    }
    const m = String(Math.floor(time / 60)).padStart(2, '0');
    const s = String(time % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  const callStatus = isCallConnected ? 'Ongoing Call' : isIncoming ? 'Incoming Call' : 'Ringing';
  const callType = route?.params?.callType || 'audio';
  const isVideo = callType === 'video';

  // PiP position: place it above the control panel
  const pipBottom = controlPanelHeight + Math.max(insets.bottom, 16) + 20;

  /* ─────────────────────────────────────────────────────────────────────────
     RENDER
  ───────────────────────────────────────────────────────────────────────── */
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* ── Full-screen video / avatar feed ── */}
      <TouchableWithoutFeedback onPress={handleSwap}>
        <Animated.View style={[StyleSheet.absoluteFillObject, { opacity: swapOpacity, transform: [{ scale: scaleAnim }] }]}>
          {isVideo && agoraJoined && remoteUid && !swapped && Platform.OS !== 'web' ? (
            <RtcSurfaceView canvas={{ uid: remoteUid }} style={StyleSheet.absoluteFillObject} />
          ) : isVideo && agoraJoined && swapped && Platform.OS !== 'web' ? (
            <RtcSurfaceView canvas={{ uid: 0 }} style={StyleSheet.absoluteFillObject} />
          ) : (
            <FastImage source={{ uri: fullImage }} style={StyleSheet.absoluteFillObject} contentFit="cover" />
          )}
        </Animated.View>
      </TouchableWithoutFeedback>

      {/* Gradient overlay */}
      <LinearGradient
        colors={['rgba(0,0,0,0.6)', 'transparent', 'transparent', 'rgba(0,0,0,0.8)']}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      />

      {/* ── HUD ── */}
      <SafeAreaView style={styles.hud} edges={['top']} pointerEvents="box-none">

        {/* Header */}
        <View style={[styles.header, { paddingTop: isSmallPhone ? 6 : 10 }]}>
          <TouchableOpacity style={styles.backButton} onPress={handleHangUp} activeOpacity={0.7}>
            <Icon name="chevron-down" size={26} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.rateTag}>
            <Icon name="logo-bitcoin" size={12} color="#FFD700" style={{ marginRight: 4 }} />
            <Text style={[styles.rateText, isSmallPhone && { fontSize: 10 }]}>{costPerMin} coins/min</Text>
          </View>
          <View style={styles.balanceBadge}>
            <Icon name="logo-bitcoin" size={isSmallPhone ? 14 : 16} color="#FFD700" style={{ marginRight: 5 }} />
            <Text style={[styles.balanceText, isSmallPhone && { fontSize: 13 }]}>{coins}</Text>
          </View>
        </View>

        {isLowBalance && (
          <View style={styles.lowBalanceBar}>
            <Icon name="warning-outline" size={13} color="#92400E" style={{ marginRight: 6 }} />
            <Text style={[styles.lowBalanceText, isSmallPhone && { fontSize: 11 }]}>Low balance – call will end soon!</Text>
          </View>
        )}

        {/* Caller info block */}
        <View style={[styles.callerInfoBlock, { marginTop: isSmallPhone ? 28 : 50 }]}>
          <LinearGradient
            colors={['#E94057', '#F27121']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={styles.statusBadge}
          >
            <Text style={[styles.statusText, isSmallPhone && { fontSize: 10 }]}>{callStatus}</Text>
            <Icon name="pulse" size={12} color="#FFF" style={{ marginLeft: 6 }} />
          </LinearGradient>

          <Text
            style={[
              styles.mainUserName,
              isSmallPhone && { fontSize: 26, marginBottom: 8 }
            ]}
          >
            {swapped ? 'You' : remoteUser?.name}
          </Text>

          <View style={styles.timeTag}>
            <Animated.View style={[styles.pulseDot, { opacity: pulseAnim }]} />
            <Text style={[styles.timeLabel, isSmallPhone && { fontSize: 12 }]}>{formatTime()}</Text>
          </View>

          {apiError && (
            <View style={{ marginTop: 10, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10, backgroundColor: 'rgba(239,68,68,0.2)' }}>
              <Text style={{ color: '#EF4444', fontSize: 11, fontWeight: '600' }}>{apiError}</Text>
            </View>
          )}
        </View>

        {/* PiP — always above control panel */}
        <TouchableOpacity
          style={[styles.pipWrapper, { bottom: pipBottom }]}
          onPress={handleSwap}
          activeOpacity={0.88}
        >
          <Animated.View style={[
            styles.pipFrame,
            { opacity: swapOpacity, width: PIP_WIDTH, height: PIP_HEIGHT }
          ]}>
            {isVideo && agoraJoined && Platform.OS !== 'web' ? (
              <RtcSurfaceView
                canvas={{ uid: swapped ? remoteUid || 0 : 0 }}
                style={styles.pipImage}
              />
            ) : (
              <FastImage source={{ uri: pipImage }} style={styles.pipImage} contentFit="cover" />
            )}
            <View style={styles.pipSwapIcon}>
              <Icon name="swap-horizontal" size={11} color="#FFF" />
            </View>
            <View style={styles.pipLabelWrap}>
              <Text style={styles.pipLabelText} numberOfLines={1}>{pipLabel}</Text>
            </View>
          </Animated.View>
        </TouchableOpacity>

      </SafeAreaView>

      {/* ── Control panel ── */}
      <View style={[
        styles.controlPanel,
        { paddingBottom: Math.max(insets.bottom, 20), minHeight: controlPanelHeight + Math.max(insets.bottom, 20) }
      ]}>
        <View style={styles.panelBg} />
        <View style={[styles.controlsLayout, isSmallPhone && { gap: 8 }]}>
          {isIncoming && !incomingAnswered ? (
            <>
              {/* Decline */}
              <TouchableOpacity
                style={[styles.hangUpBtn, { backgroundColor: '#FFF', width: END_CALL_SIZE, height: END_CALL_SIZE, borderRadius: END_CALL_SIZE / 2 }]}
                onPress={handleDecline}
                activeOpacity={0.8}
              >
                <View style={[styles.hangUpInner, { borderRadius: (END_CALL_SIZE - 16) / 2, backgroundColor: '#E94057' }]}>
                  <Icon name="call" size={isSmallPhone ? 28 : 34} color="#FFFFFF" style={{ transform: [{ rotate: '135deg' }] }} />
                </View>
              </TouchableOpacity>
              {/* Answer */}
              <TouchableOpacity
                style={[styles.hangUpBtn, { backgroundColor: '#FFF', width: END_CALL_SIZE, height: END_CALL_SIZE, borderRadius: END_CALL_SIZE / 2 }]}
                onPress={handleAnswer}
                activeOpacity={0.8}
              >
                <View style={[styles.hangUpInner, { borderRadius: (END_CALL_SIZE - 16) / 2, backgroundColor: '#4CAF50' }]}>
                  <Icon name="call" size={isSmallPhone ? 28 : 34} color="#FFFFFF" />
                </View>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={styles.sideGroup}>
                <IconButton
                  name={videoEnabled ? 'videocam' : 'videocam-off'}
                  backgroundColor={videoEnabled ? '#F5F5F5' : '#FF4D67'}
                  iconColor={videoEnabled ? '#555' : '#FFFFFF'}
                  onPress={toggleVideo}
                  btnSize={ICON_SIZE}
                  size={isSmallPhone ? 20 : 24}
                />
                {isVideo ? (
                  <IconButton name="camera-reverse" onPress={flipCamera} size={isSmallPhone ? 18 : 22} btnSize={ICON_SIZE} />
                ) : (
                  <IconButton name="chatbubble-outline" onPress={() => navigation.goBack()} size={isSmallPhone ? 18 : 22} btnSize={ICON_SIZE} />
                )}
              </View>

              {/* Hang up */}
              <TouchableOpacity
                style={[styles.hangUpBtn, { width: END_CALL_SIZE, height: END_CALL_SIZE, borderRadius: END_CALL_SIZE / 2 }]}
                onPress={handleHangUp}
                activeOpacity={0.8}
              >
                <View style={[styles.hangUpInner, { borderRadius: (END_CALL_SIZE - 16) / 2 }]}>
                  <Icon name="call" size={isSmallPhone ? 28 : 34} color="#FFFFFF" style={{ transform: [{ rotate: '135deg' }] }} />
                </View>
              </TouchableOpacity>

              <View style={styles.sideGroup}>
                <IconButton
                  name={speakerEnabled ? 'volume-high' : 'volume-mute'}
                  backgroundColor={speakerEnabled ? '#F5F5F5' : '#E5E7EB'}
                  iconColor={speakerEnabled ? '#555' : '#9CA3AF'}
                  onPress={toggleSpeaker}
                  size={isSmallPhone ? 20 : 26}
                  btnSize={ICON_SIZE}
                />
                <IconButton
                  name={micMuted ? 'mic-off' : 'mic'}
                  backgroundColor={micMuted ? '#FF4D67' : '#F5F5F5'}
                  iconColor={micMuted ? '#FFFFFF' : '#555'}
                  onPress={toggleMic}
                  size={isSmallPhone ? 20 : 26}
                  btnSize={ICON_SIZE}
                />
              </View>
            </>
          )}
        </View>
      </View>
    </View>
  );
};

/* ─── Styles ──────────────────────────────────────────────────────────────── */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  hud: { ...StyleSheet.absoluteFillObject },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 18, height: 56,
  },
  backButton: {
    width: 34, height: 34, borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.22)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  balanceBadge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 24, borderWidth: 1.5, borderColor: '#FFD700',
  },
  balanceText: { color: '#FFF', fontSize: 14, fontWeight: '800', fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif-medium' },
  rateTag: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,215,0,0.3)',
  },
  rateText: { color: '#FFD700', fontSize: 11, fontWeight: '700' },
  lowBalanceBar: {
    flexDirection: 'row', alignItems: 'center', alignSelf: 'center',
    backgroundColor: '#FBBF24', paddingHorizontal: 14, paddingVertical: 5,
    borderRadius: 20, marginTop: 4,
  },
  lowBalanceText: { fontSize: 12, fontWeight: '700', color: '#78350F' },
  callerInfoBlock: { alignItems: 'center' },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, height: 30,
    borderRadius: 100, marginBottom: 12, elevation: 8,
  },
  statusText: { fontSize: 11, color: '#FFF', fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.5 },
  mainUserName: {
    fontSize: 32, fontWeight: 'bold', color: '#FFF', marginBottom: 10,
    textAlign: 'center',
    textShadow: '0px 3px 10px rgba(0,0,0,0.45)',
  },
  timeTag: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 100, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.18)',
  },
  pulseDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#E94057', marginRight: 8 },
  timeLabel: { fontSize: 14, fontWeight: '700', color: '#FFF' },
  pipWrapper: { position: 'absolute', right: 16 },
  pipFrame: {
    borderRadius: 18, borderWidth: 3, borderColor: 'rgba(255,255,255,0.65)',
    overflow: 'hidden', backgroundColor: '#111', elevation: 20,
  },
  pipImage: { width: '100%', height: '100%' },
  pipSwapIcon: {
    position: 'absolute', top: 6, right: 6,
    backgroundColor: 'rgba(0,0,0,0.45)', borderRadius: 9, padding: 4,
  },
  pipLabelWrap: { position: 'absolute', bottom: 7, left: 0, right: 0, alignItems: 'center' },
  pipLabelText: {
    fontSize: 10, fontWeight: '700', color: '#FFF',
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20, overflow: 'hidden',
  },
  controlPanel: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingTop: 24, paddingHorizontal: 20,
  },
  panelBg: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: -120,
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderTopLeftRadius: 40, borderTopRightRadius: 40,
  },
  controlsLayout: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  sideGroup: { flexDirection: 'row', flex: 1, justifyContent: 'space-evenly', alignItems: 'center' },
  iconButton: { justifyContent: 'center', alignItems: 'center', elevation: 3 },
  hangUpBtn: { backgroundColor: '#FFF', padding: 8, elevation: 14 },
  hangUpInner: { flex: 1, backgroundColor: '#E94057', justifyContent: 'center', alignItems: 'center' },
});
