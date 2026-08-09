import React, { useEffect, useState, useRef, memo, useCallback } from 'react';
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
  useColorScheme,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image as FastImage } from 'expo-image';
import Icon from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { useChatStore } from '../../../store/useChatStore';
import { callService } from '../../../services/apiServices';
import { signalRService } from '../../../services/signalRService';

// ─── Agora SDK (native only, web gets mock) ──────────────────────────────────
let createAgoraRtcEngine, RtcSurfaceView, ChannelProfileType, ClientRoleType, VideoSourceType;
let isAgoraSdkAvailable = false;

if (Platform.OS !== 'web') {
  try {
    const Agora = require('react-native-agora');
    createAgoraRtcEngine = Agora.createAgoraRtcEngine || (typeof Agora.default === 'function' ? Agora.default : null);
    RtcSurfaceView = Agora.RtcSurfaceView || View;
    ChannelProfileType = Agora.ChannelProfileType || { ChannelProfileCommunication: 0 };
    ClientRoleType = Agora.ClientRoleType || { ClientRoleBroadcaster: 1 };
    VideoSourceType = Agora.VideoSourceType || { VideoSourceCamera: 0, VideoSourceRemote: 1 };

    if (typeof createAgoraRtcEngine === 'function') {
      isAgoraSdkAvailable = true;
      console.log('[CallingScreen] REAL Agora SDK engine loaded successfully');
    }
  } catch (e) {
    console.error('[CallingScreen] Error loading native react-native-agora module:', e);
  }
}

// Fallback for web platform only
if (Platform.OS === 'web') {
  if (!ChannelProfileType) ChannelProfileType = { ChannelProfileCommunication: 0 };
  if (!ClientRoleType) ClientRoleType = { ClientRoleBroadcaster: 1 };
  if (!VideoSourceType) VideoSourceType = { VideoSourceCamera: 0, VideoSourceRemote: 1 };
  if (!RtcSurfaceView) RtcSurfaceView = View;
  if (!createAgoraRtcEngine) {
    createAgoraRtcEngine = () => ({
      initialize: () => { console.log('[Agora Web] initialize called'); },
      enableAudio: () => { console.log('[Agora Web] enableAudio called'); },
      enableVideo: () => { console.log('[Agora Web] enableVideo called'); },
      disableVideo: () => { console.log('[Agora Web] disableVideo called'); },
      startPreview: () => { console.log('[Agora Web] startPreview called'); },
      registerEventHandler: (handlers) => {
        if (handlers.onJoinChannelSuccess) setTimeout(() => handlers.onJoinChannelSuccess(), 1000);
        if (handlers.onUserJoined) setTimeout(() => handlers.onUserJoined({}, 12345), 3000);
      },
      setChannelProfile: () => {},
      setClientRole: () => {},
      setDefaultAudioRouteToSpeakerphone: () => {},
      setEnableSpeakerphone: () => {},
      joinChannel: () => {},
      muteLocalAudioStream: () => {},
      muteLocalVideoStream: () => {},
      switchCamera: () => {},
      leaveChannel: () => {},
      release: () => {},
    });
  }
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const ICON_SIZE = 56;
const END_CALL_SIZE = 84;
const PIP_WIDTH = 110;
const PIP_HEIGHT = 160;

const CALLER_IMAGE_FALLBACK =
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80';

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

/* ─── Ask for camera + mic permission (Android only) ─────────────────────── */
async function requestCallPermissions(isVideo) {
  if (Platform.OS !== 'android') return true;
  const perms = [PermissionsAndroid.PERMISSIONS.RECORD_AUDIO];
  if (isVideo) perms.push(PermissionsAndroid.PERMISSIONS.CAMERA);
  const results = await PermissionsAndroid.requestMultiple(perms);
  return Object.values(results).every((r) => r === PermissionsAndroid.RESULTS.GRANTED);
}

/* ─── Main screen ─────────────────────────────────────────────────────────── */
export const CallingScreen = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // ─── Full theme palette ───────────────────────────────────────────────────
  const T = isDark ? {
    // Dark — deep charcoal panel, glowing neon-tinted buttons
    bgOverlay:      'rgba(8, 8, 14, 0.78)',
    panelBg:        'rgba(14, 14, 20, 0.97)',
    panelBorder:    'rgba(255,255,255,0.07)',
    labelColor:     '#9CA3AF',
    nameColor:      '#FFFFFF',
    headerBtnBg:    'rgba(255,255,255,0.12)',
    headerBtnBorder:'rgba(255,255,255,0.1)',
    balanceBg:      'rgba(255,215,0,0.1)',
    balanceBorder:  '#FFD700',
    rateBg:         'rgba(255,215,0,0.08)',
    rateBorder:     'rgba(255,215,0,0.25)',
    timeBg:         'rgba(255,255,255,0.10)',
    timeBorder:     'rgba(255,255,255,0.12)',
    avatarBorder:   'rgba(233,64,87,0.7)',
    avatarGlow:     '#E94057',
    ripple1Border:  'rgba(233,64,87,0.35)',
    ripple1Bg:      'rgba(233,64,87,0.05)',
    ripple2Border:  'rgba(233,64,87,0.15)',
    ripple2Bg:      'rgba(233,64,87,0.02)',
    pipBorder:      'rgba(255,255,255,0.55)',
    // Buttons
    btnDefaultBg:   'rgba(255,255,255,0.09)',
    btnDefaultIcon: '#D1D5DB',
    btnActiveBg:    'rgba(255,255,255,0.15)',
    btnMuteBg:      'rgba(220,38,38,0.20)',
    btnMuteIcon:    '#F87171',
    btnSpeakerBg:   'rgba(96,165,250,0.18)',
    btnSpeakerIcon: '#60A5FA',
    hangUpOuter:    'rgba(255,255,255,0.08)',
  } : {
    // Light — clean white frosted panel, soft pastels
    bgOverlay:      'rgba(0,0,0,0.52)',
    panelBg:        'rgba(255,255,255,0.98)',
    panelBorder:    'rgba(0,0,0,0.06)',
    labelColor:     '#6B7280',
    nameColor:      '#FFFFFF',
    headerBtnBg:    'rgba(255,255,255,0.25)',
    headerBtnBorder:'rgba(255,255,255,0.2)',
    balanceBg:      'rgba(0,0,0,0.45)',
    balanceBorder:  '#FFD700',
    rateBg:         'rgba(0,0,0,0.3)',
    rateBorder:     'rgba(255,215,0,0.35)',
    timeBg:         'rgba(255,255,255,0.22)',
    timeBorder:     'rgba(255,255,255,0.22)',
    avatarBorder:   'rgba(255,255,255,0.9)',
    avatarGlow:     '#FFFFFF',
    ripple1Border:  'rgba(255,255,255,0.45)',
    ripple1Bg:      'rgba(255,255,255,0.06)',
    ripple2Border:  'rgba(255,255,255,0.22)',
    ripple2Bg:      'rgba(255,255,255,0.02)',
    pipBorder:      'rgba(255,255,255,0.72)',
    // Buttons
    btnDefaultBg:   '#F3F4F6',
    btnDefaultIcon: '#374151',
    btnActiveBg:    '#E5E7EB',
    btnMuteBg:      '#FEE2E2',
    btnMuteIcon:    '#DC2626',
    btnSpeakerBg:   '#DBEAFE',
    btnSpeakerIcon: '#2563EB',
    hangUpOuter:    '#FFFFFF',
  };

  const { user } = route?.params || { user: { name: 'Unknown', image: CALLER_IMAGE_FALLBACK } };
  const isVideoCall = (route?.params?.callType || 'audio') === 'video';
  const targetId = user.id || user._id;

  const safeRemoteImage = user.image || CALLER_IMAGE_FALLBACK;

  /* ── Swap state (which feed is full-screen vs PiP) ── */
  const [swapped, setSwapped] = useState(false);
  const swapOpacity = useRef(new Animated.Value(1)).current;
  const handleSwap = () => {
    Animated.timing(swapOpacity, { toValue: 0, duration: 180, useNativeDriver: true }).start(() => {
      setSwapped((prev) => !prev);
      Animated.timing(swapOpacity, { toValue: 1, duration: 220, useNativeDriver: true }).start();
    });
  };

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  /* ── Call/RTC state ── */
  const [callId, setCallId] = useState(route?.params?.callId || null);
  const [connectionState, setConnectionState] = useState('connecting'); // connecting | connected | failed | ended
  const [remoteUid, setRemoteUid] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const engineRef = useRef(null);
  const callIdRef = useRef(callId);
  const hasEndedRef = useRef(false);

  const coins = useChatStore((s) => s.wallet.coins);
  const deductCoins = useChatStore((s) => s.deductCoins);

  const RATE = 2;
  const BILLING_DELAY = 10;
  const LOW_BALANCE_THRESHOLD = RATE * 5;
  const [time, setTime] = useState(0);
  const isBilling = time >= BILLING_DELAY;
  const isLowBalance = coins <= LOW_BALANCE_THRESHOLD && coins > 0 && isBilling;

  /* ── Safe navigation back helper ── */
  const safeGoBack = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
    }
  }, [navigation]);

  /* ── End the call once, from anywhere (button, remote hangup, error) ── */
  const endCall = useCallback(async (reason) => {
    if (hasEndedRef.current) return;
    hasEndedRef.current = true;

    try { await engineRef.current?.leaveChannel(); } catch (e) { /* no-op */ }
    try { engineRef.current?.release(); } catch (e) { /* no-op */ }
    engineRef.current = null;

    if (callIdRef.current) {
      callService.endCall(callIdRef.current).catch((err) => console.warn('endCall API failed:', err));
    }
    safeGoBack();
  }, [callService, safeGoBack]);

  /* ── Mount: request permissions, start/answer the call, join Agora channel ── */
  useEffect(() => {
    let unsubAnswered, unsubEnded, unsubDeclined;

    const setupCall = async () => {
      const granted = await requestCallPermissions(isVideoCall);
      if (!granted) {
        setErrorMsg('Camera/microphone permission denied.');
        Alert.alert('Permission required', 'Camera and microphone access are needed for calls.', [
          { text: 'OK', onPress: safeGoBack },
        ]);
        return;
      }

      try {
        let agora, resolvedCallId;

        if (route?.params?.isIncoming && route?.params?.callId) {
          const res = await callService.answerCall(route.params.callId);
          resolvedCallId = route.params.callId;
          agora = res.agora || res.data?.agora;
        } else {
          const res = await callService.initiateCall(targetId, isVideoCall ? 'video' : 'audio');
          resolvedCallId = res.callId || res.data?.callId;
          agora = res.agora || res.data?.agora;
        }

        if (!resolvedCallId || !agora?.appId) {
          throw new Error('Server did not return call/Agora details.');
        }

        setCallId(resolvedCallId);
        callIdRef.current = resolvedCallId;

        await joinAgoraChannel(agora, resolvedCallId);
      } catch (error) {
        const msg = error?.message || (typeof error === 'string' ? error : 'Call could not be started.');
        setErrorMsg(msg);
        setConnectionState('failed');
        Alert.alert('Call Failed', msg, [{ text: 'OK', onPress: safeGoBack }]);
      }
    };

    const joinAgoraChannel = async (agora, resolvedCallId) => {
      const engine = createAgoraRtcEngine();
      engineRef.current = engine;

      engine.initialize({ appId: agora.appId });
      engine.setChannelProfile(ChannelProfileType.ChannelProfileCommunication);
      engine.setClientRole(ClientRoleType.ClientRoleBroadcaster);

      if (isVideoCall) {
        engine.enableVideo();
        engine.startPreview();
      } else {
        engine.disableVideo();
      }
      engine.enableAudio();
      engine.setDefaultAudioRouteToSpeakerphone(false);

      let refreshCount = 0;
      let isRefreshing = false;
      const MAX_REFRESH = 2;

      const refreshToken = async () => {
        if (isRefreshing) return;
        if (refreshCount >= MAX_REFRESH) {
          console.warn('[agora] Max token refresh attempts reached (2). Token invalid on backend.');
          setConnectionState('failed');
          setErrorMsg('Call failed: Invalid credentials from server.');
          return;
        }

        isRefreshing = true;
        refreshCount += 1;

        try {
          const res = await callService.getAgoraToken(resolvedCallId);
          const newToken = res.token || res.agoraToken || res.data?.token || res.data?.agoraToken;
          if (newToken && engineRef.current) {
            engineRef.current.renewToken?.(newToken);
            console.log('[agora] token renewed successfully');
          } else {
            console.warn('[agora] Server did not return a new Agora token.');
            setConnectionState('failed');
            setErrorMsg('Call failed: Unable to refresh token.');
          }
        } catch (e) {
          console.warn('[agora] failed to renew token:', e);
        } finally {
          isRefreshing = false;
        }
      };

      engine.registerEventHandler({
        onJoinChannelSuccess: () => {
          refreshCount = 0;
          console.log('[agora] joined channel', agora.channelName);
        },
        onUserJoined: (_conn, uid) => {
          setRemoteUid(uid);
          setConnectionState('connected');
        },
        onUserOffline: () => {
          setRemoteUid(null);
          endCall('remote_left');
        },
        onConnectionStateChanged: (_conn, state) => {
          if (state === 5) {
            setConnectionState('failed');
            setErrorMsg('Could not connect to the call. Please try again.');
          }
        },
        onTokenPrivilegeWillExpire: () => {
          console.log('[agora] token privilege will expire, renewing...');
          refreshToken();
        },
        onRequestToken: () => {
          console.log('[agora] request token received, renewing...');
          refreshToken();
        },
        onError: (err, msg) => {
          console.warn('[agora] RTC event code:', err, msg);
          if (err === 109 || err === 110) {
            if (refreshCount < MAX_REFRESH) {
              console.warn('[agora] Token invalid/expired (code ' + err + '). Attempting refresh (attempt ' + (refreshCount + 1) + '/' + MAX_REFRESH + ')...');
              refreshToken();
            } else {
              console.warn('[agora] Token error ' + err + ' persisted after refresh attempt.');
              setConnectionState('failed');
              setErrorMsg('Call failed: Invalid Agora token credentials.');
            }
          }
        },
      });

      const agoraToken = agora.token || agora.agoraToken || '';
      const channelName = agora.channelName || agora.channel || resolvedCallId;
      const rawUid = agora.uid ?? 0;
      const numericUid = Number(rawUid);

      console.log('[agora] joining channel:', {
        appId: agora.appId,
        channelName,
        rawUid,
        numericUid,
        tokenSnippet: agoraToken ? agoraToken.substring(0, 15) + '...' : 'EMPTY',
      });

      if (isNaN(numericUid) && typeof rawUid === 'string') {
        engine.joinChannelWithUserAccount(agoraToken, channelName, String(rawUid), {
          clientRoleType: ClientRoleType.ClientRoleBroadcaster,
        });
      } else {
        engine.joinChannel(agoraToken, channelName, isNaN(numericUid) ? 0 : numericUid, {
          clientRoleType: ClientRoleType.ClientRoleBroadcaster,
        });
      }
    };

    setupCall();

    // ── Listen for the call being answered / ended / declined from the other side ──
    unsubAnswered = signalRService.on('CallAnswered', (data) => {
      if (!callIdRef.current || !data?.callId || String(data.callId) !== String(callIdRef.current)) {
        return;
      }
      setConnectionState('connected');
    });
    unsubEnded = signalRService.on('CallEnded', (data) => {
      if (data.callId === callIdRef.current) endCall('remote_ended');
    });
    unsubDeclined = signalRService.on('CallDeclined', (data) => {
      if (data.callId === callIdRef.current) {
        Alert.alert('Call declined');
        endCall('declined');
      }
    });

    return () => {
      unsubAnswered?.();
      unsubEnded?.();
      unsubDeclined?.();
      if (!hasEndedRef.current) {
        hasEndedRef.current = true;
        try { engineRef.current?.leaveChannel(); } catch (e) { /* no-op */ }
        try { engineRef.current?.release(); } catch (e) { /* no-op */ }
        if (callIdRef.current) {
          callService.endCall(callIdRef.current).catch(() => { });
        }
      }
    };
  }, []);

  /* ── Animations + timer ── */
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

  useEffect(() => {
    if (connectionState !== 'connected') return;
    const t = setInterval(() => setTime((prev) => prev + 1), 1000);
    return () => clearInterval(t);
  }, [connectionState]);

  useEffect(() => {
    if (time > BILLING_DELAY) {
      if (coins <= 0) { endCall('no_coins'); return; }
      deductCoins(RATE);
    }
  }, [time]);

  const formatTime = () => {
    if (connectionState !== 'connected') return 'Connecting...';
    const m = String(Math.floor(time / 60)).padStart(2, '0');
    const s = String(time % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  /* ── Control handlers ── */
  const toggleMute = () => {
    const next = !isMuted;
    engineRef.current?.muteLocalAudioStream(next);
    setIsMuted(next);
  };
  const toggleCamera = () => {
    const next = !isCameraOff;
    engineRef.current?.muteLocalVideoStream(next);
    setIsCameraOff(next);
  };
  const toggleSpeaker = () => {
    const next = !isSpeakerOn;
    engineRef.current?.setEnableSpeakerphone(next);
    setIsSpeakerOn(next);
  };
  const switchCamera = () => engineRef.current?.switchCamera();

  const renderRemoteFeed = (isPip = false) => {
    if (isVideoCall && remoteUid != null && Platform.OS !== 'web') {
      return (
        <RtcSurfaceView
          style={isPip ? styles.pipImage : StyleSheet.absoluteFillObject}
          canvas={{ uid: remoteUid, sourceType: VideoSourceType.VideoSourceRemote }}
          zOrderMediaOverlay={isPip}
          zOrderOnTop={isPip}
        />
      );
    }
    return (
      <FastImage
        source={{ uri: safeRemoteImage }}
        style={isPip ? styles.pipImage : StyleSheet.absoluteFillObject}
        contentFit="cover"
      />
    );
  };

  const renderSelfFeed = (isPip = false) => {
    if (isVideoCall && !isCameraOff && Platform.OS !== 'web') {
      return (
        <RtcSurfaceView
          style={isPip ? styles.pipImage : StyleSheet.absoluteFillObject}
          canvas={{ uid: 0, sourceType: VideoSourceType.VideoSourceCamera }}
          zOrderMediaOverlay={isPip}
          zOrderOnTop={isPip}
        />
      );
    }
    return <View style={[isPip ? styles.pipImage : StyleSheet.absoluteFillObject, { backgroundColor: '#222' }]} />;
  };

  const renderBackground = () => {
    if (isVideoCall) {
      return (
        <TouchableWithoutFeedback onPress={handleSwap}>
          <Animated.View style={[StyleSheet.absoluteFillObject, { opacity: swapOpacity, transform: [{ scale: scaleAnim }] }]}>
            {swapped ? renderSelfFeed(false) : renderRemoteFeed(false)}
          </Animated.View>
        </TouchableWithoutFeedback>
      );
    }

    // Audio Call: premium blurred background + central avatar card with breath animations
    return (
      <View style={StyleSheet.absoluteFillObject}>
        <FastImage
          source={{ uri: safeRemoteImage }}
          style={StyleSheet.absoluteFillObject}
          contentFit="cover"
          blurRadius={isDark ? 42 : 30}
        />
        {/* Theme-aware dark/light overlay tint */}
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: T.bgOverlay }]} />

        <View style={styles.audioCenterContainer}>
          {/* Breathing ripple ring 1 */}
          <Animated.View style={[
            styles.avatarRippleRing,
            { borderColor: T.ripple1Border, backgroundColor: T.ripple1Bg },
            {
              transform: [{ scale: scaleAnim }],
              opacity: pulseAnim.interpolate({ inputRange: [0.4, 1], outputRange: [0.15, 0.55] }),
            },
          ]} />

          {/* Breathing ripple ring 2 */}
          <Animated.View style={[
            styles.avatarRippleRing2,
            { borderColor: T.ripple2Border, backgroundColor: T.ripple2Bg },
            {
              transform: [{ scale: Animated.multiply(scaleAnim, 1.15) }],
              opacity: pulseAnim.interpolate({ inputRange: [0.4, 1], outputRange: [0.05, 0.28] }),
            },
          ]} />

          {/* Central Avatar */}
          <Animated.View style={[
            styles.audioAvatarContainer,
            { borderColor: T.avatarBorder, shadowColor: T.avatarGlow },
            { transform: [{ scale: scaleAnim }] },
          ]}>
            <FastImage source={{ uri: safeRemoteImage }} style={styles.audioAvatar} contentFit="cover" />
          </Animated.View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {renderBackground()}

      {/* Vignette gradient — slightly stronger in light to keep UI readable */}
      <LinearGradient
        colors={isDark
          ? ['rgba(0,0,0,0.6)', 'transparent', 'rgba(0,0,0,0.82)']
          : ['rgba(0,0,0,0.5)', 'transparent', 'rgba(0,0,0,0.68)']}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      />

      <SafeAreaView style={styles.hud} edges={['top']} pointerEvents="box-none">
        <View style={styles.header}>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: T.headerBtnBg, borderColor: T.headerBtnBorder }]}
            onPress={() => endCall('back_button')}
            activeOpacity={0.7}
          >
            <Icon name="chevron-down" size={28} color="#FFFFFF" />
          </TouchableOpacity>

          {isBilling ? (
            <View style={[styles.rateTag, { backgroundColor: T.rateBg, borderColor: T.rateBorder }]}>
              <Icon name="logo-bitcoin" size={13} color="#FFD700" style={{ marginRight: 4 }} />
              <Text style={styles.rateText}>{RATE} coins/sec</Text>
            </View>
          ) : (
            <View style={[styles.rateTag, { backgroundColor: T.rateBg, borderColor: T.rateBorder }]}>
              <Icon name="time-outline" size={13} color="rgba(255,255,255,0.8)" style={{ marginRight: 4 }} />
              <Text style={[styles.rateText, { color: 'rgba(255,255,255,0.8)' }]}>Free for {BILLING_DELAY - time}s</Text>
            </View>
          )}

          <View style={[styles.balanceBadge, { backgroundColor: T.balanceBg, borderColor: T.balanceBorder }]}>
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

        <View style={styles.callerInfoBlock}>
          {/* Status badge */}
          <LinearGradient
            colors={isDark ? ['#B91C3C', '#C2410C'] : ['#E94057', '#F27121']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={[
              styles.statusBadge,
              isDark && { shadowColor: '#E94057', shadowOpacity: 0.6 },
            ]}
          >
            <Text style={styles.statusText}>
              {connectionState === 'connected' ? 'Ongoing Call' : 'Connecting'}
            </Text>
            <Icon name="pulse" size={13} color="#FFF" style={{ marginLeft: 6 }} />
          </LinearGradient>

          {/* Caller name */}
          <Text style={[styles.mainUserName, { color: T.nameColor }]}>
            {swapped ? 'You' : user.name}
          </Text>

          {/* Timer chip */}
          <View style={[styles.timeTag, { backgroundColor: T.timeBg, borderColor: T.timeBorder }]}>
            <Animated.View style={[styles.pulseDot, { opacity: pulseAnim }]} />
            <Text style={styles.timeLabel}>{formatTime()}</Text>
          </View>

          {errorMsg && (
            <View style={{
              marginTop: 12, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 12,
              backgroundColor: isDark ? 'rgba(239,68,68,0.18)' : 'rgba(239,68,68,0.12)',
              borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)',
            }}>
              <Text style={{ color: '#F87171', fontSize: 11, fontWeight: '700' }}>{errorMsg}</Text>
            </View>
          )}
        </View>

        {isVideoCall && (
          <TouchableOpacity
            style={[styles.pipWrapper, { bottom: 10 + Math.max(insets.bottom, 16) }]}
            onPress={handleSwap}
            activeOpacity={0.88}
          >
            <Animated.View style={[styles.pipFrame, { opacity: swapOpacity, borderColor: T.pipBorder }]}>
              {swapped ? renderRemoteFeed(true) : renderSelfFeed(true)}
              <View style={styles.pipSwapIcon}>
                <Icon name="swap-horizontal" size={12} color="#FFF" />
              </View>
              <View style={styles.pipLabelWrap}>
                <Text style={styles.pipLabelText} numberOfLines={1}>
                  {swapped ? (user.name?.split(' ')[0] ?? 'Them') : 'You'}
                </Text>
              </View>
            </Animated.View>
          </TouchableOpacity>
        )}
      </SafeAreaView>

      <View style={[styles.controlPanel, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        {/* Panel background — themed + top border separator */}
        <View style={[
          styles.panelBg,
          { backgroundColor: T.panelBg, borderTopColor: T.panelBorder },
          isDark && { borderTopWidth: 1 },
        ]} />

        <View style={styles.controlsLayout}>
          {!isVideoCall ? (
            // ── Audio controls ────────────────────────────────────────────
            <>
              <View style={styles.controlWrapper}>
                <IconButton
                  name={isMuted ? 'mic-off-outline' : 'mic-outline'}
                  onPress={toggleMute}
                  size={26}
                  backgroundColor={isMuted ? T.btnMuteBg : T.btnDefaultBg}
                  iconColor={isMuted ? T.btnMuteIcon : T.btnDefaultIcon}
                />
                <Text style={[styles.controlBtnLabel, { color: T.labelColor }]}>
                  {isMuted ? 'Muted' : 'Mute'}
                </Text>
              </View>

              <View style={styles.controlWrapper}>
                <TouchableOpacity
                  style={[styles.hangUpBtn, { backgroundColor: T.hangUpOuter }]}
                  onPress={() => endCall('user_ended')}
                  activeOpacity={0.8}
                >
                  <View style={styles.hangUpInner}>
                    <Icon name="call" size={34} color="#FFFFFF" style={{ transform: [{ rotate: '135deg' }] }} />
                  </View>
                </TouchableOpacity>
                <Text style={[styles.controlBtnLabel, { color: T.labelColor }]}>End</Text>
              </View>

              <View style={styles.controlWrapper}>
                <IconButton
                  name={isSpeakerOn ? 'volume-high-outline' : 'volume-medium-outline'}
                  onPress={toggleSpeaker}
                  size={26}
                  backgroundColor={isSpeakerOn ? T.btnSpeakerBg : T.btnDefaultBg}
                  iconColor={isSpeakerOn ? T.btnSpeakerIcon : T.btnDefaultIcon}
                />
                <Text style={[styles.controlBtnLabel, { color: T.labelColor }]}>
                  {isSpeakerOn ? 'Speaker' : 'Earpiece'}
                </Text>
              </View>
            </>
          ) : (
            // ── Video controls ────────────────────────────────────────────
            <>
              <View style={styles.sideGroup}>
                <IconButton
                  name={isCameraOff ? 'videocam-off-outline' : 'videocam-outline'}
                  onPress={toggleCamera}
                  backgroundColor={T.btnDefaultBg}
                  iconColor={T.btnDefaultIcon}
                />
                <IconButton
                  name="camera-reverse-outline"
                  onPress={switchCamera}
                  size={22}
                  backgroundColor={T.btnDefaultBg}
                  iconColor={T.btnDefaultIcon}
                />
              </View>

              <TouchableOpacity
                style={[styles.hangUpBtn, { backgroundColor: T.hangUpOuter }]}
                onPress={() => endCall('user_ended')}
                activeOpacity={0.8}
              >
                <View style={styles.hangUpInner}>
                  <Icon name="call" size={34} color="#FFFFFF" style={{ transform: [{ rotate: '135deg' }] }} />
                </View>
              </TouchableOpacity>

              <View style={styles.sideGroup}>
                <IconButton
                  name={isSpeakerOn ? 'volume-high-outline' : 'volume-medium-outline'}
                  onPress={toggleSpeaker}
                  size={26}
                  backgroundColor={isSpeakerOn ? T.btnSpeakerBg : T.btnDefaultBg}
                  iconColor={isSpeakerOn ? T.btnSpeakerIcon : T.btnDefaultIcon}
                />
                <IconButton
                  name={isMuted ? 'mic-off-outline' : 'mic-outline'}
                  onPress={toggleMute}
                  size={26}
                  backgroundColor={isMuted ? T.btnMuteBg : T.btnDefaultBg}
                  iconColor={isMuted ? T.btnMuteIcon : T.btnDefaultIcon}
                />
              </View>
            </>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  hud: { ...StyleSheet.absoluteFillObject },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 10, height: 60,
  },
  backButton: {
    width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.22)',
    justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  balanceBadge: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 13, paddingVertical: 7, borderRadius: 24, borderWidth: 1.5, borderColor: '#FFD700',
  },
  balanceText: { color: '#FFF', fontSize: 14, fontWeight: '800', fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif-medium' },
  rateTag: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.35)',
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,215,0,0.3)',
  },
  rateText: { color: '#FFD700', fontSize: 11, fontWeight: '700', fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif-medium' },
  lowBalanceBar: {
    flexDirection: 'row', alignItems: 'center', alignSelf: 'center', backgroundColor: '#FBBF24',
    paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, marginTop: 6,
  },
  lowBalanceText: { fontSize: 12, fontWeight: '700', color: '#78350F', fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif-medium' },
  mockWarningBar: {
    flexDirection: 'row', alignItems: 'center', alignSelf: 'center',
    backgroundColor: '#DC2626', paddingHorizontal: 14, paddingVertical: 5,
    borderRadius: 20, marginTop: 6,
  },
  mockWarningText: { fontSize: 11, fontWeight: '700', color: '#FFFFFF' },
  callerInfoBlock: { alignItems: 'center', marginTop: 50 },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, height: 32, borderRadius: 100,
    marginBottom: 14, shadowColor: '#E94057', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.45, shadowRadius: 10, elevation: 8,
  },
  statusText: {
    fontSize: 11, color: '#FFF', fontWeight: '800', fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif-medium',
    textTransform: 'uppercase', letterSpacing: 1.5,
  },
  mainUserName: {
    fontSize: 34, fontWeight: 'bold', color: '#FFF', fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif-medium',
    marginBottom: 12, textAlign: 'center', textShadowColor: 'rgba(0,0,0,0.45)', textShadowOffset: { width: 0, height: 3 }, textShadowRadius: 10,
  },
  timeTag: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 100, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.18)',
  },
  pulseDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: '#E94057', marginRight: 9 },
  timeLabel: { fontSize: 14, fontWeight: '700', color: '#FFF', fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif-medium' },
  pipWrapper: { position: 'absolute', right: 18, top: 450, bottom: 0 },
  pipFrame: {
    width: PIP_WIDTH, height: PIP_HEIGHT, borderRadius: 20, borderWidth: 3, borderColor: 'rgba(255,255,255,0.65)',
    overflow: 'hidden', backgroundColor: '#111', shadowColor: '#000', shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.6, shadowRadius: 16, elevation: 20,
  },
  pipImage: { width: '100%', height: '100%' },
  pipSwapIcon: { position: 'absolute', top: 7, right: 7, backgroundColor: 'rgba(0,0,0,0.45)', borderRadius: 10, padding: 4 },
  pipLabelWrap: { position: 'absolute', bottom: 8, left: 0, right: 0, alignItems: 'center' },
  pipLabelText: {
    fontSize: 11, fontWeight: '700', color: '#FFF', backgroundColor: 'rgba(0,0,0,0.45)',
    paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20, overflow: 'hidden',
    fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif-medium',
  },
  controlPanel: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingTop: 30, paddingHorizontal: 20 },
  panelBg: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: -120,
    borderTopLeftRadius: 44, borderTopRightRadius: 44,
    // backgroundColor is injected at render time from the colorScheme token
  },
  controlsLayout: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sideGroup: { flexDirection: 'row', flex: 1, justifyContent: 'space-evenly', alignItems: 'center' },
  iconButton: {
    width: ICON_SIZE, height: ICON_SIZE, borderRadius: ICON_SIZE / 2, justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 3,
  },
  hangUpBtn: {
    width: END_CALL_SIZE, height: END_CALL_SIZE, borderRadius: END_CALL_SIZE / 2, backgroundColor: '#FFF', padding: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 14 }, shadowOpacity: 0.28, shadowRadius: 18, elevation: 14,
  },
  hangUpInner: {
    flex: 1, borderRadius: (END_CALL_SIZE - 16) / 2, backgroundColor: '#E94057', justifyContent: 'center', alignItems: 'center',
  },
  audioCenterContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 60,
  },
  avatarRippleRing: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  avatarRippleRing2: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  audioAvatarContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.85)',
    overflow: 'hidden',
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  audioAvatar: {
    width: '100%',
    height: '100%',
  },
  controlWrapper: {
    alignItems: 'center',
    flex: 1,
  },
  controlBtnLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
    fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif-medium',
    // color is injected at render time from the colorScheme token (panelLabelColor)
  },
});