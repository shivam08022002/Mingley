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
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { useChatStore } from '../../../store/useChatStore';

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

  const safeRemoteImage = user.image          || CALLER_IMAGE_FALLBACK;
  const safeSelfImage   = MY_CAMERA_IMAGE;               // always dummy

  /* ── Swap state ──
     swapped = false → remote person fills screen, "You" PiP shows self
     swapped = true  → self-view fills screen, "remote" PiP shows them     */
  const [swapped, setSwapped] = useState(false);

  // Which image goes full-screen / pip
  const fullImage = swapped ? safeSelfImage   : safeRemoteImage;
  const pipImage  = swapped ? safeRemoteImage : safeSelfImage;
  const pipLabel  = swapped ? user.name?.split(' ')[0] ?? 'Them' : 'You';

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

  /* ── Zustand wallet ── */
  const coins       = useChatStore((s) => s.wallet.coins);
  const deductCoins = useChatStore((s) => s.deductCoins);

  const RATE                  = 2;
  const BILLING_DELAY         = 10;
  const LOW_BALANCE_THRESHOLD = RATE * 5;

  const [time, setTime] = useState(0);

  const isBilling    = time >= BILLING_DELAY;
  const isLowBalance = coins <= LOW_BALANCE_THRESHOLD && coins > 0 && isBilling;

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

    const t = setInterval(() => setTime((prev) => prev + 1), 1000);
    return () => clearInterval(t);
  }, []);

  /* ── Deduction effect ── */
  useEffect(() => {
    if (time > BILLING_DELAY) {
      if (coins <= 0) {
        navigation.goBack();
        return;
      }
      deductCoins(RATE);
    }
  }, [time]);

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
            resizeMode={FastImage.resizeMode.cover}
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
          {isBilling ? (
            <View style={styles.rateTag}>
              <Icon name="cash-outline" size={13} color="#FFD700" style={{ marginRight: 4 }} />
              <Text style={styles.rateText}>{RATE} coins/sec</Text>
            </View>
          ) : (
            <View style={styles.rateTag}>
              <Icon name="time-outline" size={13} color="rgba(255,255,255,0.75)" style={{ marginRight: 4 }} />
              <Text style={[styles.rateText, { color: 'rgba(255,255,255,0.75)' }]}>Free for {BILLING_DELAY - time}s</Text>
            </View>
          )}

          {/* Coin balance */}
          <View style={styles.balanceBadge}>
            <Icon name="cash-outline" size={16} color="#FFD700" style={{ marginRight: 5 }} />
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
            <Text style={styles.statusText}>{time === 0 ? 'Connecting' : 'Ongoing Call'}</Text>
            <Icon name="pulse" size={13} color="#FFF" style={{ marginLeft: 6 }} />
          </LinearGradient>

          <Text style={styles.mainUserName}>
            {swapped ? 'You' : user.name}
          </Text>

          <View style={styles.timeTag}>
            <Animated.View style={[styles.pulseDot, { opacity: pulseAnim }]} />
            <Text style={styles.timeLabel}>{formatTime()}</Text>
          </View>
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
              resizeMode={FastImage.resizeMode.cover}
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
          <View style={styles.sideGroup}>
            <IconButton name="videocam-outline" onPress={() => {}} />
            <IconButton name="chatbubble-outline" onPress={() => {}} size={22} />
          </View>

          <TouchableOpacity style={styles.hangUpBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
            <View style={styles.hangUpInner}>
              <Icon name="call" size={34} color="#FFFFFF" style={{ transform: [{ rotate: '135deg' }] }} />
            </View>
          </TouchableOpacity>

          <View style={styles.sideGroup}>
            <IconButton name="volume-medium-outline" onPress={() => {}} size={26} />
            <IconButton name="mic-off-outline"       onPress={() => {}} size={26} />
          </View>
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
    shadowColor: '#E94057',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  hangUpBtn: {
    width: END_CALL_SIZE,
    height: END_CALL_SIZE,
    borderRadius: END_CALL_SIZE / 2,
    backgroundColor: '#FFF',
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.28,
    shadowRadius: 18,
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