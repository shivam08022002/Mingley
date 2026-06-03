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
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image as FastImage } from 'expo-image';
import Icon from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { useChatStore } from '../../../store/useChatStore';
import { callService } from '../../../services/apiServices';
import { signalRService } from '../../../services/signalRService';
import { useToastStore } from '../../../store/useToastStore';

// ─── Agora SDK ────────────────────────────────────────────────────────────────
// Requires: npx expo install react-native-agora  +  EAS dev build
import {
  createAgoraRtcEngine,
  RtcSurfaceView,
  ChannelProfileType,
  ClientRoleType,
  IRtcEngine,
} from 'react-native-agora';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const ICON_SIZE = 56;
const END_CALL_SIZE = 84;
const PIP_WIDTH = 110;
const PIP_HEIGHT = 160;

const CALLER_IMAGE_FALLBACK =
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80';
const MY_CAMERA_IMAGE =
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=800&q=80';

/* ─── Small reusable icon button ─────────────────────────────────────────── */
const IconButton = memo(({ name, onPress, size = 24, backgroundColor = '#F5F5F5', iconColor = '#555' }) => (
  <TouchableOpacity
    style={[styles.iconButton, { backgroundColor }]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Icon name={name} size={size} color={iconColor} />
  </TouchableOpacity>
));

/* ─── Main screen ─────────────────────────────────────────────────────────── */
export const CallingScreen = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();

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
  const [agoraToken, setAgoraToken] = useState(null);
  const [agoraAppId, setAgoraAppId] = useState(null);
  const [agoraChannel, setAgoraChannel] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [incomingAnswered, setIncomingAnswered] = useState(false);
  const [outgoingAnswered, setOutgoingAnswered] = useState(false);
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

  const LOW_BALANCE_THRESHOLD = costPerMin * 2;
  const isLowBalance = coins <= LOW_BALANCE_THRESHOLD && coins > 0;

  /* ─────────────────────────────────────────────────────────────────────────
     ANDROID PERMISSIONS
  ───────────────────────────────────────────────────────────────────────── */
  const requestAndroidPermissions = async (callType) => {
    if (Platform.OS !== 'android') return true;
    try {
      const perms = [PermissionsAndroid.PERMISSIONS.RECORD_AUDIO];
      if (callType === 'video') {
        perms.push(PermissionsAndroid.PERMISSIONS.CAMERA);
      }
      const grants = await PermissionsAndroid.requestMultiple(perms);
      const allGranted = Object.values(grants).every(
        (r) => r === PermissionsAndroid.RESULTS.GRANTED
      );
      if (!allGranted) {
        Alert.alert('Permissions Required', 'Microphone (and camera for video) permissions are needed for calls.');
      }
      return allGranted;
    } catch {
      return false;
    }
  };

  /* ─────────────────────────────────────────────────────────────────────────
     INITIALIZE AGORA ENGINE
  ───────────────────────────────────────────────────────────────────────── */
  const initAgoraEngine = async (appId, callType) => {
    if (agoraEngineRef.current) return; // already inited

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

    // Set up event listeners
    engine.addListener('onUserJoined', (connection, uid) => {
      console.log('Agora: Remote user joined uid=', uid);
      setRemoteUid(uid);
    });

    engine.addListener('onUserOffline', (connection, uid) => {
      console.log('Agora: Remote user left uid=', uid);
      setRemoteUid(null);
      // Remote party left — end the call
      navigation.goBack();
    });

    engine.addListener('onJoinChannelSuccess', (connection, elapsed) => {
      console.log('Agora: Joined channel', connection.channelId);
      setAgoraJoined(true);
    });

    engine.addListener('onError', (err, msg) => {
      console.error('Agora error', err, msg);
    });

    // Speaker by default
    engine.setEnableSpeakerphone(true);

    console.log('Agora engine initialised');
  };

  /* ─────────────────────────────────────────────────────────────────────────
     JOIN AGORA CHANNEL — called once we have appId + token + channelName
  ───────────────────────────────────────────────────────────────────────── */
  const joinAgoraChannel = async (appId, token, channel, callType) => {
    try {
      await requestAndroidPermissions(callType);
      await initAgoraEngine(appId, callType);

      await agoraEngineRef.current.joinChannel(
        token || null,  // null = testing mode (AppCertificate empty)
        channel,
        0,              // uid = 0 → Agora assigns one
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
     SIGNALR: Listen for CallAnswered (outgoing calls)
  ───────────────────────────────────────────────────────────────────────── */
  useEffect(() => {
    signalRService.onCallAnswered = (data) => {
      if (data.callId === callId || !callId) {
        setOutgoingAnswered(true);
      }
    };
    return () => { signalRService.onCallAnswered = null; };
  }, [callId]);

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
            // Fallback: fetch token separately
            const tokenRes = await callService.getAgoraToken(newCallId);
            const fallbackAppId = tokenRes.data?.appId || tokenRes.appId;
            const fallbackToken = tokenRes.data?.token || tokenRes.token || null;
            const fallbackChannel = tokenRes.data?.channelName || tokenRes.channelName || `call_${newCallId}`;
            if (fallbackAppId) {
              setAgoraAppId(fallbackAppId);
              setAgoraToken(fallbackToken);
              setAgoraChannel(fallbackChannel);
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
      if (activeCallId) {
        callService.endCall(activeCallId).catch(console.error);
      }
      // Destroy Agora engine on unmount
      if (agoraEngineRef.current) {
        agoraEngineRef.current.leaveChannel();
        agoraEngineRef.current.release();
        agoraEngineRef.current = null;
      }
    };
  }, [isIncoming]);

  /* ── Animations ── */
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.4, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.04, duration: 4000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1, duration: 4000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const isCallConnected = agoraJoined; // connected = actually in Agora channel

  /* ── Timer: only when Agora is actually connected ── */
  useEffect(() => {
    if (!isCallConnected) return;
    const t = setInterval(() => setTime((prev) => prev + 1), 1000);
    return () => clearInterval(t);
  }, [isCallConnected]);

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
    try { if (callId) await callService.declineCall(callId); } catch { }
    navigation.goBack();
  };

  const handleHangUp = async () => {
    try { if (callId) await callService.endCall(callId); } catch { }
    navigation.goBack();
  };

  /* ── Coin deduction every minute while connected ── */
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
  const toggleMic = () => {
    agoraEngineRef.current?.muteLocalAudioStream(!micMuted);
    setMicMuted((prev) => !prev);
  };

  const toggleSpeaker = () => {
    agoraEngineRef.current?.setEnableSpeakerphone(!speakerEnabled);
    setSpeakerEnabled((prev) => !prev);
  };

  const toggleVideo = () => {
    if (videoEnabled) {
      agoraEngineRef.current?.muteLocalVideoStream(true);
    } else {
      agoraEngineRef.current?.muteLocalVideoStream(false);
    }
    setVideoEnabled((prev) => !prev);
  };

  const flipCamera = () => { agoraEngineRef.current?.switchCamera(); };

  const handleSwap = () => {
    Animated.timing(swapOpacity, { toValue: 0, duration: 180, useNativeDriver: true }).start(() => {
      setSwapped((prev) => !prev);
      Animated.timing(swapOpacity, { toValue: 1, duration: 220, useNativeDriver: true }).start();
    });
  };

  const formatTime = () => {
    if (!isCallConnected) {
      if (isIncoming && !incomingAnswered) return 'Incoming Call...';
      return 'Ringing...';
    }
    const m = String(Math.floor(time / 60)).padStart(2, '0');
    const s = String(time % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  const callType = route?.params?.callType || 'audio';
  const isVideo = callType === 'video';

  /* ─────────────────────────────────────────────────────────────────────────
     RENDER
  ───────────────────────────────────────────────────────────────────────── */
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* ── Full-screen video / avatar feed ── */}
      <TouchableWithoutFeedback onPress={handleSwap}>
        <Animated.View style={[StyleSheet.absoluteFillObject, { opacity: swapOpacity, transform: [{ scale: scaleAnim }] }]}>
          {isVideo && agoraJoined && remoteUid && !swapped ? (
            /* Live remote video */
            <RtcSurfaceView
              canvas={{ uid: remoteUid }}
              style={StyleSheet.absoluteFillObject}
            />
          ) : isVideo && agoraJoined && swapped ? (
            /* My own camera in the full-screen slot when swapped */
            <RtcSurfaceView
              canvas={{ uid: 0 }}
              style={StyleSheet.absoluteFillObject}
            />
          ) : (
            <FastImage source={{ uri: fullImage }} style={StyleSheet.absoluteFillObject} contentFit="cover" />
          )}
        </Animated.View>
      </TouchableWithoutFeedback>

      {/* Gradient overlay */}
      <LinearGradient
        colors={['rgba(0,0,0,0.55)', 'transparent', 'rgba(0,0,0,0.75)']}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      />

      {/* ── HUD ── */}
      <SafeAreaView style={styles.hud} edges={['top']} pointerEvents="box-none">

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleHangUp} activeOpacity={0.7}>
            <Icon name="chevron-down" size={28} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.rateTag}>
            <Icon name="logo-bitcoin" size={13} color="#FFD700" style={{ marginRight: 4 }} />
            <Text style={styles.rateText}>{costPerMin} coins/min</Text>
          </View>
          <View style={styles.balanceBadge}>
            <Icon name="logo-bitcoin" size={16} color="#FFD700" style={{ marginRight: 5 }} />
            <Text style={styles.balanceText}>{coins}</Text>
          </View>
        </View>

        {isLowBalance && (
          <View style={styles.lowBalanceBar}>
            <Icon name="warning-outline" size={14} color="#92400E" style={{ marginRight: 6 }} />
            <Text style={styles.lowBalanceText}>Low balance – call will end soon!</Text>
          </View>
        )}

        {/* Caller info */}
        <View style={styles.callerInfoBlock}>
          <LinearGradient
            colors={['#E94057', '#F27121']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={styles.statusBadge}
          >
            <Text style={styles.statusText}>
              {isCallConnected ? 'Ongoing Call' : isIncoming ? 'Incoming Call' : 'Ringing'}
            </Text>
            <Icon name="pulse" size={13} color="#FFF" style={{ marginLeft: 6 }} />
          </LinearGradient>
          <Text style={styles.mainUserName}>{swapped ? 'You' : remoteUser?.name}</Text>
          <View style={styles.timeTag}>
            <Animated.View style={[styles.pulseDot, { opacity: pulseAnim }]} />
            <Text style={styles.timeLabel}>{formatTime()}</Text>
          </View>
          {apiError && (
            <View style={{ marginTop: 12, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10, backgroundColor: 'rgba(239,68,68,0.2)' }}>
              <Text style={{ color: '#EF4444', fontSize: 11, fontWeight: '600' }}>{apiError}</Text>
            </View>
          )}
        </View>

        {/* PiP */}
        <TouchableOpacity
          style={[styles.pipWrapper, { top: 450, bottom: 10 + Math.max(insets.bottom, 16) }]}
          onPress={handleSwap}
          activeOpacity={0.88}
        >
          <Animated.View style={[styles.pipFrame, { opacity: swapOpacity }]}>
            {isVideo && agoraJoined ? (
              <RtcSurfaceView
                canvas={{ uid: swapped ? remoteUid || 0 : 0 }}
                style={styles.pipImage}
              />
            ) : (
              <FastImage source={{ uri: pipImage }} style={styles.pipImage} contentFit="cover" />
            )}
            <View style={styles.pipSwapIcon}>
              <Icon name="swap-horizontal" size={12} color="#FFF" />
            </View>
            <View style={styles.pipLabelWrap}>
              <Text style={styles.pipLabelText} numberOfLines={1}>{pipLabel}</Text>
            </View>
          </Animated.View>
        </TouchableOpacity>

      </SafeAreaView>

      {/* ── Control panel ── */}
      <View style={[styles.controlPanel, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <View style={styles.panelBg} />
        <View style={styles.controlsLayout}>
          {isIncoming && !incomingAnswered ? (
            <>
              {/* Decline */}
              <TouchableOpacity style={[styles.hangUpBtn, { backgroundColor: '#FFF' }]} onPress={handleDecline} activeOpacity={0.8}>
                <View style={styles.hangUpInner}>
                  <Icon name="call" size={34} color="#FFFFFF" style={{ transform: [{ rotate: '135deg' }] }} />
                </View>
              </TouchableOpacity>
              {/* Answer */}
              <TouchableOpacity style={[styles.hangUpBtn, { backgroundColor: '#FFF' }]} onPress={handleAnswer} activeOpacity={0.8}>
                <View style={[styles.hangUpInner, { backgroundColor: '#4CAF50' }]}>
                  <Icon name="call" size={34} color="#FFFFFF" />
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
                />
                {isVideo && (
                  <IconButton
                    name="camera-reverse"
                    onPress={flipCamera}
                    size={22}
                  />
                )}
                {!isVideo && (
                  <IconButton name="chatbubble-outline" onPress={() => navigation.goBack()} size={22} />
                )}
              </View>

              {/* Hang up */}
              <TouchableOpacity style={styles.hangUpBtn} onPress={handleHangUp} activeOpacity={0.8}>
                <View style={styles.hangUpInner}>
                  <Icon name="call" size={34} color="#FFFFFF" style={{ transform: [{ rotate: '135deg' }] }} />
                </View>
              </TouchableOpacity>

              <View style={styles.sideGroup}>
                <IconButton
                  name={speakerEnabled ? 'volume-high' : 'volume-mute'}
                  backgroundColor={speakerEnabled ? '#F5F5F5' : '#E5E7EB'}
                  iconColor={speakerEnabled ? '#555' : '#9CA3AF'}
                  onPress={toggleSpeaker}
                  size={26}
                />
                <IconButton
                  name={micMuted ? 'mic-off' : 'mic'}
                  backgroundColor={micMuted ? '#FF4D67' : '#F5F5F5'}
                  iconColor={micMuted ? '#FFFFFF' : '#555'}
                  onPress={toggleMic}
                  size={26}
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 10, height: 60 },
  backButton: { width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.22)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  balanceBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 13, paddingVertical: 7, borderRadius: 24, borderWidth: 1.5, borderColor: '#FFD700' },
  balanceText: { color: '#FFF', fontSize: 14, fontWeight: '800', fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif-medium' },
  rateTag: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.35)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,215,0,0.3)' },
  rateText: { color: '#FFD700', fontSize: 11, fontWeight: '700', fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif-medium' },
  lowBalanceBar: { flexDirection: 'row', alignItems: 'center', alignSelf: 'center', backgroundColor: '#FBBF24', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, marginTop: 6 },
  lowBalanceText: { fontSize: 12, fontWeight: '700', color: '#78350F' },
  callerInfoBlock: { alignItems: 'center', marginTop: 50 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, height: 32, borderRadius: 100, marginBottom: 14, elevation: 8 },
  statusText: { fontSize: 11, color: '#FFF', fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.5 },
  mainUserName: { fontSize: 34, fontWeight: 'bold', color: '#FFF', marginBottom: 12, textAlign: 'center', textShadowColor: 'rgba(0,0,0,0.45)', textShadowOffset: { width: 0, height: 3 }, textShadowRadius: 10 },
  timeTag: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 100, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.18)' },
  pulseDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: '#E94057', marginRight: 9 },
  timeLabel: { fontSize: 14, fontWeight: '700', color: '#FFF' },
  pipWrapper: { position: 'absolute', right: 18 },
  pipFrame: { width: PIP_WIDTH, height: PIP_HEIGHT, borderRadius: 20, borderWidth: 3, borderColor: 'rgba(255,255,255,0.65)', overflow: 'hidden', backgroundColor: '#111', elevation: 20 },
  pipImage: { width: '100%', height: '100%' },
  pipSwapIcon: { position: 'absolute', top: 7, right: 7, backgroundColor: 'rgba(0,0,0,0.45)', borderRadius: 10, padding: 4 },
  pipLabelWrap: { position: 'absolute', bottom: 8, left: 0, right: 0, alignItems: 'center' },
  pipLabelText: { fontSize: 11, fontWeight: '700', color: '#FFF', backgroundColor: 'rgba(0,0,0,0.45)', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20, overflow: 'hidden' },
  controlPanel: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingTop: 30, paddingHorizontal: 20 },
  panelBg: { position: 'absolute', top: 0, left: 0, right: 0, bottom: -120, backgroundColor: 'rgba(255,255,255,0.97)', borderTopLeftRadius: 44, borderTopRightRadius: 44 },
  controlsLayout: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sideGroup: { flexDirection: 'row', flex: 1, justifyContent: 'space-evenly', alignItems: 'center' },
  iconButton: { width: ICON_SIZE, height: ICON_SIZE, borderRadius: ICON_SIZE / 2, justifyContent: 'center', alignItems: 'center', elevation: 3 },
  hangUpBtn: { width: END_CALL_SIZE, height: END_CALL_SIZE, borderRadius: END_CALL_SIZE / 2, backgroundColor: '#FFF', padding: 8, elevation: 14 },
  hangUpInner: { flex: 1, borderRadius: (END_CALL_SIZE - 16) / 2, backgroundColor: '#E94057', justifyContent: 'center', alignItems: 'center' },
});
