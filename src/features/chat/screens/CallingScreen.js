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
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image as FastImage } from 'expo-image';
import Icon from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { useChatStore } from '../../../store/useChatStore';
import { callService } from '../../../services/apiServices';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const ICON_SIZE    = 56;
const END_CALL_SIZE = 84;

// PiP card dimensions
const PIP_WIDTH  = 110;
const PIP_HEIGHT = 160;

// Fallback images when route params don't carry them
const CALLER_IMAGE_FALLBACK =
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80';
const MY_CAMERA_IMAGE =
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=800&q=80';

import { useToastStore } from '../../../store/useToastStore';

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

  /* ── Get dynamic self info from store to remove hardcoded values ── */
  const myUser = useChatStore((s) => s.user);

  const safeRemoteImage = remoteUser?.avatar || remoteUser?.image || remoteUser?.callerImage || CALLER_IMAGE_FALLBACK;
  const safeSelfImage   = myUser?.avatar      || myUser?.image       || MY_CAMERA_IMAGE;

  /* ── Swap state ──
     swapped = false → remote person fills screen, "You" PiP shows self
     swapped = true  → self-view fills screen, "remote" PiP shows them     */
  const [swapped, setSwapped] = useState(false);

  // Which image goes full-screen / pip
  const fullImage = swapped ? safeSelfImage   : safeRemoteImage;
  const pipImage  = swapped ? safeRemoteImage : safeSelfImage;
  const pipLabel  = swapped ? remoteUser?.name?.split(' ')[0] ?? 'Them' : 'You';

  /* ── Swap animation ── */
  const swapOpacity = useRef(new Animated.Value(1)).current;

  const handleSwap = () => {
    // Fade out → swap state → fade in
    Animated.timing(swapOpacity, {
      toValue: 0,
      duration: 180,
      useNativeDriver: true,
    }).start(() => {
      setSwapped((prev) => !prev);
      Animated.timing(swapOpacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }).start();
    });
  };

  /* ── Animations ── */
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  /* ── Call API State ── */
  const [callId, setCallId] = useState(null);
  const [agoraToken, setAgoraToken] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [incomingAnswered, setIncomingAnswered] = useState(false);
  const isIncoming = route.params?.isIncoming || false;

  /* ── Interactive call controls state ── */
  const [micMuted, setMicMuted] = useState(false);
  const [speakerEnabled, setSpeakerEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(route?.params?.callType === 'video');

  /* ── Zustand wallet ── */
  const coins       = useChatStore((s) => s.wallet.coins);
  const deductCoins = useChatStore((s) => s.deductCoins);

  const [costPerMin, setCostPerMin] = useState(route?.params?.callType === 'video' ? 100 : 10);
  const [time, setTime] = useState(0);

  const LOW_BALANCE_THRESHOLD = costPerMin * 2;
  const isLowBalance = coins <= LOW_BALANCE_THRESHOLD && coins > 0;

  /* ── Mount effect: start Call API sessions ── */
  useEffect(() => {
    let activeCallId = null;
    const targetId = remoteUser?.id || remoteUser?._id || 'd0000001-0000-0000-0000-000000000009';

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
        const response = await callService.initiateCall(targetId, route?.params?.callType || 'audio');
        const newCallId = response.data?.callId || response.callId || response.data?.id || response.id;
        const rate = response.data?.costPerMin ?? response.costPerMin ?? (route?.params?.callType === 'video' ? 100 : 10);
        setCostPerMin(rate);

        const serverTarget = response.data?.target || response.target;
        if (serverTarget) {
          setRemoteUser(prev => ({
            ...prev,
            name: serverTarget.fullName || serverTarget.name || prev.name,
            avatar: serverTarget.avatar || serverTarget.image || prev.avatar,
            id: serverTarget.id || serverTarget._id || prev.id,
          }));
        }

        if (newCallId) {
          activeCallId = newCallId;
          setCallId(newCallId);

          // Check if response contains agora directly
          const agoraObj = response.data?.agora || response.agora;
          const token = agoraObj?.token || agoraObj?.agoraToken;
          if (token) {
            setAgoraToken(token);
          } else {
            // Get Agora token
            const tokenRes = await callService.getAgoraToken(newCallId);
            const fallbackToken = tokenRes.data?.token || tokenRes.token || tokenRes.data?.agoraToken || tokenRes.agoraToken;
            if (fallbackToken) {
              setAgoraToken(fallbackToken);
            }
          }
        }
      } catch (error) {
        console.warn('Failed to initiate call:', error);
        const errMsg = error.message || (typeof error === 'string' ? error : 'Call initiation failed');
        setApiError(errMsg);
        Alert.alert('Call Failed', errMsg, [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }
    };

    startCallOnServer();

    // Cleanup: end call on server when leaving screen
    return () => {
      if (activeCallId) {
        callService.endCall(activeCallId).catch((err) => {
          console.error('Failed to end call on server:', err);
        });
      }
    };
  }, [remoteUser, route?.params?.callType, isIncoming]);

  /* ── Mount effect: start animations + timer ── */
  useEffect(() => {
    // Pulse dot
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.4, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,   duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();

    // Breathing scale on full-screen feed
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.04, duration: 4000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1,    duration: 4000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  // Timer: only run if not incoming OR if incoming call is answered
  useEffect(() => {
    if (isIncoming && !incomingAnswered) return;
    const t = setInterval(() => setTime((prev) => prev + 1), 1000);
    return () => clearInterval(t);
  }, [isIncoming, incomingAnswered]);

  const handleAnswer = async () => {
    try {
      if (callId) {
        const response = await callService.answerCall(callId);
        setIncomingAnswered(true);
        const rate = response?.data?.costPerMin ?? response?.costPerMin ?? (route?.params?.callType === 'video' ? 100 : 10);
        setCostPerMin(rate);

        const tokenRes = await callService.getAgoraToken(callId);
        const token = tokenRes.data?.token || tokenRes.token || tokenRes.data?.agoraToken || tokenRes.agoraToken;
        if (token) {
          setAgoraToken(token);
        }
      }
    } catch (error) {
      console.warn('Failed to answer call:', error);
      Alert.alert('Error', 'Failed to answer call.');
    }
  };

  const handleDecline = async () => {
    try {
      if (callId) {
        await callService.declineCall(callId);
      }
    } catch (error) {
      console.warn('Failed to decline call:', error);
    } finally {
      navigation.goBack();
    }
  };

  /* ── Deduction effect ── */
  useEffect(() => {
    if (agoraToken && time > 0 && time % 60 === 0) {
      if (coins < costPerMin) {
        useToastStore.getState().showToast({
          title: 'Call Disconnected 📞',
          text: 'Insufficient coins balance.',
          type: 'error',
        });
        navigation.goBack();
        return;
      }
      deductCoins(costPerMin);
    }
  }, [time, agoraToken, costPerMin, coins]);

  const formatTime = () => {
    if (time === 0) return 'Connecting...';
    const m = String(Math.floor(time / 60)).padStart(2, '0');
    const s = String(time % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  /* ────────────────────────────────────────────────────────────────────────
     RENDER
  ──────────────────────────────────────────────────────────────────────── */
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* ── Full-screen video feed (tap anywhere to swap) ── */}
      <TouchableWithoutFeedback onPress={handleSwap}>
        <Animated.View style={[StyleSheet.absoluteFillObject, { opacity: swapOpacity, transform: [{ scale: scaleAnim }] }]}>
          <FastImage
            source={{ uri: fullImage }}
            style={StyleSheet.absoluteFillObject}
            contentFit="cover"
          />
        </Animated.View>
      </TouchableWithoutFeedback>

      {/* Gradient overlay */}
      <LinearGradient
        colors={['rgba(0,0,0,0.55)', 'transparent', 'rgba(0,0,0,0.75)']}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      />

      {/* ── SafeAreaView wraps all HUD elements ── */}
      <SafeAreaView style={styles.hud} edges={['top']} pointerEvents="box-none">

        {/* ── Header row ── */}
        <View style={styles.header}>
          {/* Back */}
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <Icon name="chevron-down" size={28} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Rate indicator */}
          <View style={styles.rateTag}>
            <Icon name="logo-bitcoin" size={13} color="#FFD700" style={{ marginRight: 4 }} />
            <Text style={styles.rateText}>{costPerMin} coins/min</Text>
          </View>

          {/* Coin balance */}
          <View style={styles.balanceBadge}>
            <Icon name="logo-bitcoin" size={16} color="#FFD700" style={{ marginRight: 5 }} />
            <Text style={styles.balanceText}>{coins}</Text>
          </View>
        </View>

        {/* Low balance warning */}
        {isLowBalance && (
          <View style={styles.lowBalanceBar}>
            <Icon name="warning-outline" size={14} color="#92400E" style={{ marginRight: 6 }} />
            <Text style={styles.lowBalanceText}>Low balance – call will end soon!</Text>
          </View>
        )}

        {/* ── Caller info: name + timer (top-centre) ── */}
        <View style={styles.callerInfoBlock}>
          <LinearGradient
            colors={['#E94057', '#F27121']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={styles.statusBadge}
          >
            <Text style={styles.statusText}>{isIncoming && !incomingAnswered ? 'Incoming Call' : time === 0 ? 'Connecting' : 'Ongoing Call'}</Text>
            <Icon name="pulse" size={13} color="#FFF" style={{ marginLeft: 6 }} />
          </LinearGradient>

          <Text style={styles.mainUserName}>
            {swapped ? 'You' : remoteUser?.name}
          </Text>

          <View style={styles.timeTag}>
            <Animated.View style={[styles.pulseDot, { opacity: pulseAnim }]} />
            <Text style={styles.timeLabel}>{formatTime()}</Text>
          </View>

          {agoraToken && (
            <View style={{ marginTop: 12, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10, backgroundColor: 'rgba(0,0,0,0.4)' }}>
              <Text style={{ color: '#10B981', fontSize: 11, fontWeight: '700' }}>Connected to Agora</Text>
            </View>
          )}
          {apiError && (
            <View style={{ marginTop: 12, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10, backgroundColor: 'rgba(239,68,68,0.2)' }}>
              <Text style={{ color: '#EF4444', fontSize: 11, fontWeight: '600' }}>{apiError}</Text>
            </View>
          )}
        </View>

        {/* ── PiP: self-view in bottom-right, above control panel ──
             Tapping it swaps views, exactly like WhatsApp.           */}
        <TouchableOpacity
          style={[
            styles.pipWrapper,
            { bottom: 10 + Math.max(insets.bottom, 16) },
          ]}
          onPress={handleSwap}
          activeOpacity={0.88}
        >
          <Animated.View style={[styles.pipFrame, { opacity: swapOpacity }]}>
            <FastImage
              source={{ uri: pipImage }}
              style={styles.pipImage}
              contentFit="cover"
            />
            {/* Swap hint icon */}
            <View style={styles.pipSwapIcon}>
              <Icon name="swap-horizontal" size={12} color="#FFF" />
            </View>
            {/* Label */}
            <View style={styles.pipLabelWrap}>
              <Text style={styles.pipLabelText} numberOfLines={1}>{pipLabel}</Text>
            </View>
          </Animated.View>
        </TouchableOpacity>

      </SafeAreaView>

      {/* ── Control panel (always on top, absolute at bottom) ── */}
      <View style={[styles.controlPanel, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <View style={styles.panelBg} />
        <View style={styles.controlsLayout}>
          {isIncoming && !incomingAnswered ? (
            <>
              {/* Decline Call */}
              <TouchableOpacity 
                style={[styles.hangUpBtn, { backgroundColor: '#FFF' }]} 
                onPress={handleDecline} 
                activeOpacity={0.8}
              >
                <View style={styles.hangUpInner}>
                  <Icon name="call" size={34} color="#FFFFFF" style={{ transform: [{ rotate: '135deg' }] }} />
                </View>
              </TouchableOpacity>

              {/* Answer Call */}
              <TouchableOpacity 
                style={[styles.hangUpBtn, { backgroundColor: '#FFF' }]} 
                onPress={handleAnswer} 
                activeOpacity={0.8}
              >
                <View style={[styles.hangUpInner, { backgroundColor: '#4CAF50' }]}>
                  <Icon name="call" size={34} color="#FFFFFF" />
                </View>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={styles.sideGroup}>
                <IconButton
                  name={videoEnabled ? "videocam" : "videocam-off"}
                  backgroundColor={videoEnabled ? "#F5F5F5" : "#FF4D67"}
                  iconColor={videoEnabled ? "#555" : "#FFFFFF"}
                  onPress={() => setVideoEnabled(!videoEnabled)}
                />
                <IconButton
                  name="chatbubble-outline"
                  onPress={() => navigation.goBack()}
                  size={22}
                />
              </View>

              <TouchableOpacity style={styles.hangUpBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
                <View style={styles.hangUpInner}>
                  <Icon name="call" size={34} color="#FFFFFF" style={{ transform: [{ rotate: '135deg' }] }} />
                </View>
              </TouchableOpacity>

              <View style={styles.sideGroup}>
                <IconButton
                  name={speakerEnabled ? "volume-high" : "volume-mute"}
                  backgroundColor={speakerEnabled ? "#F5F5F5" : "#E5E7EB"}
                  iconColor={speakerEnabled ? "#555" : "#9CA3AF"}
                  onPress={() => setSpeakerEnabled(!speakerEnabled)}
                  size={26}
                />
                <IconButton
                  name={micMuted ? "mic-off" : "mic"}
                  backgroundColor={micMuted ? "#FF4D67" : "#F5F5F5"}
                  iconColor={micMuted ? "#FFFFFF" : "#555"}
                  onPress={() => setMicMuted(!micMuted)}
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
  container: {
    flex: 1,
    backgroundColor: '#000',
  },

  // HUD layer (header + caller info + PiP) – pointerEvents box-none so taps
  // pass through to the TouchableWithoutFeedback background swap zone.
  hud: {
    ...StyleSheet.absoluteFillObject,
    // don't block pointer events on transparent areas
  },

  /* ── Header ── */
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    height: 60,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.22)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  balanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#FFD700',
  },
  balanceText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif-medium',
  },
  rateTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.3)',
  },
  rateText: {
    color: '#FFD700',
    fontSize: 11,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif-medium',
  },

  /* ── Low balance ── */
  lowBalanceBar: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#FBBF24',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 6,
  },
  lowBalanceText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#78350F',
    fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif-medium',
  },

  /* ── Caller info block (top-centre area) ── */
  callerInfoBlock: {
    alignItems: 'center',
    marginTop: 50,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    height: 32,
    borderRadius: 100,
    marginBottom: 14,
    boxShadow: '0px 4px 10px rgba(0,0,0,0.45)',
    elevation: 8,
  },
  statusText: {
    fontSize: 11,
    color: '#FFF',
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif-medium',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  mainUserName: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#FFF',
    fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif-medium',
    marginBottom: 12,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.45)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 10,
  },
  timeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 100,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  pulseDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#E94057',
    marginRight: 9,
  },
  timeLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFF',
    fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif-medium',
  },

  /* ── PiP (bottom-right, above control panel) ── */
  pipWrapper: {
    position: 'absolute',
    right: 18,
    top: 450,
    bottom: 0,
    // `bottom` is set inline to account for insets + panel height
  },
  pipFrame: {
    width: PIP_WIDTH,
    height: PIP_HEIGHT,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.65)',
    overflow: 'hidden',
    backgroundColor: '#111',
    boxShadow: '0px 10px 16px rgba(0,0,0,0.6)',
    elevation: 20,
  },
  pipImage: {
    width: '100%',
    height: '100%',
  },
  // Small swap-hint icon in top-right corner of PiP
  pipSwapIcon: {
    position: 'absolute',
    top: 7,
    right: 7,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 10,
    padding: 4,
  },
  pipLabelWrap: {
    position: 'absolute',
    bottom: 8,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  pipLabelText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFF',
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
    overflow: 'hidden',
    fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif-medium',
  },

  /* ── Control panel (absolute, pinned to bottom) ── */
  controlPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 30,
    paddingHorizontal: 20,
  },
  panelBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: -120,
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderTopLeftRadius: 44,
    borderTopRightRadius: 44,
  },
  controlsLayout: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sideGroup: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  iconButton: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    borderRadius: ICON_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0px 4px 6px rgba(0,0,0,0.1)',
    elevation: 3,
  },
  hangUpBtn: {
    width: END_CALL_SIZE,
    height: END_CALL_SIZE,
    borderRadius: END_CALL_SIZE / 2,
    backgroundColor: '#FFF',
    padding: 8,
    boxShadow: '0px 14px 18px rgba(0,0,0,0.28)',
    elevation: 14,
  },
  hangUpInner: {
    flex: 1,
    borderRadius: (END_CALL_SIZE - 16) / 2,
    backgroundColor: '#E94057',
    justifyContent: 'center',
    alignItems: 'center',
  },
});