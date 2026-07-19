import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolate,
  runOnJS,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import FAIcon from 'react-native-vector-icons/FontAwesome5';
import { Image as FastImage } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../../theme/ThemeContext';
import { useAuthStore } from '../../../store/useAuthStore';
import { useProfileStore } from '../../profile/store/useProfileStore';
import { useFilterStore } from '../store/useFilterStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SPACING } from '../../../constants/theme';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const SWIPE_THRESH_X = SCREEN_W * 0.3;
const SWIPE_THRESH_UP = -SCREEN_H * 0.18;
const TITLE_FONT = Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif';
const TITLE_MED = Platform.OS === 'ios' ? 'AvenirNext-Medium' : 'sans-serif-medium';

// ─── Image Assets ────────────────────────────────────────────────────────────
const GIF_RIGHT = require('../../../assets/righttt.gif');
const GIF_LEFT = require('../../../assets/lefttt.gif');
const SVG_UP = require('../../../assets/Swipe.gif');

// ─── Unsplash Images (same ones used in ProfileScreen) ──────────────────────
const FEMALE_IMAGES = [
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
];
const MALE_IMAGES = [
  'https://images.unsplash.com/photo-1500048993953-d23a436266cf?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?auto=format&fit=crop&w=800&q=80',
];

const FEMALE_PROFILES = [
  { name: 'Sophia', age: 24, city: 'Mumbai, India', distance: 3, matchScore: 94, isVerified: true },
  { name: 'Ananya', age: 22, city: 'Delhi, India', distance: 5, matchScore: 88, isVerified: true },
  { name: 'Priya', age: 25, city: 'Bangalore, India', distance: 2, matchScore: 91, isVerified: true },
];
const MALE_PROFILES = [
  { name: 'Alex', age: 26, city: 'Mumbai, India', distance: 4, matchScore: 92, isVerified: true },
  { name: 'Arjun', age: 24, city: 'Pune, India', distance: 3, matchScore: 85, isVerified: true },
  { name: 'Rohan', age: 27, city: 'Delhi, India', distance: 6, matchScore: 89, isVerified: true },
];

// ─── Swipe Steps Config ─────────────────────────────────────────────────────
const SWIPE_STEPS = [
  { direction: 'right', image: GIF_RIGHT, label: 'Swipe right for a match', icon: 'heart', color: '#E94057' },
  { direction: 'left', image: GIF_LEFT, label: 'Swipe left to pass', icon: 'close', color: '#E86B32' },
  { direction: 'up', image: SVG_UP, label: 'Swipe up for Super Like', icon: 'star', color: '#7C3AED' },
];

// ─── Outro Features ─────────────────────────────────────────────────────────
const OUTRO_FEATURES = [
  {
    icon: 'crown',
    iconType: 'fa5',
    title: 'Explore Premium',
    desc: 'Unlock unlimited likes & exclusive features.',
    color: '#F6DCA0',
  },
  {
    icon: 'flash',
    iconType: 'ion',
    title: 'Super Chat',
    desc: 'Send a message before matching.',
    color: '#7C3AED',
  },
  {
    icon: 'videocam',
    iconType: 'ion',
    title: 'Voice & Video Calls',
    desc: 'Connect instantly via voice or video calls.',
    color: '#E94057',
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// WELCOME SCREEN (Same as before: photo background, gradient, wave emoji)
// ═══════════════════════════════════════════════════════════════════════════════
const WelcomeScreen = ({ theme, onStart, onSkip, bgImage }) => {
  const insets = useSafeAreaInsets();
  return (
    <View style={s.welcomeRoot}>
      {/* Background image (blurred via opacity overlay) */}
      <FastImage source={{ uri: bgImage }} style={StyleSheet.absoluteFillObject} contentFit="cover" />
      <LinearGradient
        colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.65)', 'rgba(0,0,0,0.88)']}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Content wrapper */}
      <View style={[s.welcomeContent, { paddingBottom: insets.bottom + 40 }]}>
        {/* Wave Icon */}
        <View style={s.waveIconWrap}>
          <Icon name="hand-left" size={36} color="#F6DCA0" />
        </View>

        {/* Heading */}
        <Text style={[s.welcomeTitle, { fontFamily: TITLE_MED, color: '#FFF' }]}>
          Let's get you ready!
        </Text>
        <Text style={[s.welcomeSubtitle, { color: 'rgba(255,255,255,0.65)' }]}>
          Here's everything you need to know.
        </Text>

        {/* Start Button */}
        <TouchableOpacity
          style={s.startButton}
          onPress={onStart}
          activeOpacity={0.88}
        >
          <Text style={[s.startButtonText, { color: '#111', fontFamily: TITLE_MED }]}>
            Start tutorial
          </Text>
        </TouchableOpacity>

        {/* Skip */}
        <TouchableOpacity onPress={onSkip} activeOpacity={0.7} style={s.skipTouchable}>
          <Text style={s.skipLabel}>
            Skip
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SWIPEABLE TUTORIAL CARD (Replica discover screen + dim focus backdrop)
// ═══════════════════════════════════════════════════════════════════════════════
const SwipeTutorialCard = ({ stepIndex, profile, imageUrl, stepConfig, theme, onCorrectSwipe }) => {
  const insets = useSafeAreaInsets();
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);

  const [cardsHeight, setCardsHeight] = useState(0);
  const cardW = SCREEN_W - 32;
  const cardH = cardsHeight > 0 ? cardsHeight - 16 : SCREEN_H * 0.58;

  const instructionAnim = useSharedValue(0);

  useEffect(() => {
    instructionAnim.value = 0;
    instructionAnim.value = withRepeat(
      withTiming(1, { duration: 800 }),
      -1,
      true
    );
  }, [stepConfig.direction]);

  const triggerCorrectSwipe = useCallback(() => {
    onCorrectSwipe();
  }, [onCorrectSwipe]);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      startX.value = translateX.value;
      startY.value = translateY.value;
    })
    .onUpdate((e) => {
      translateX.value = startX.value + e.translationX;
      translateY.value = startY.value + e.translationY;
    })
    .onEnd((e) => {
      const dir = stepConfig.direction;

      if (dir === 'right' && translateX.value > SWIPE_THRESH_X) {
        translateX.value = withSpring(SCREEN_W * 1.5, { velocity: e.velocityX }, (fin) => {
          if (fin) runOnJS(triggerCorrectSwipe)();
        });
        return;
      }
      if (dir === 'left' && translateX.value < -SWIPE_THRESH_X) {
        translateX.value = withSpring(-SCREEN_W * 1.5, { velocity: e.velocityX }, (fin) => {
          if (fin) runOnJS(triggerCorrectSwipe)();
        });
        return;
      }
      if (dir === 'up' && translateY.value < SWIPE_THRESH_UP && Math.abs(translateX.value) < SWIPE_THRESH_X) {
        translateY.value = withSpring(-(cardH + 400), { velocity: e.velocityY }, (fin) => {
          if (fin) runOnJS(triggerCorrectSwipe)();
        });
        return;
      }

      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
    });

  const animatedCard = useAnimatedStyle(() => {
    const rot = interpolate(translateX.value, [-SCREEN_W, 0, SCREEN_W], [-15, 0, 15], Extrapolate.CLAMP);
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotateZ: `${rot}deg` },
      ],
    };
  });

  const likeOverlay = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, SCREEN_W * 0.35], [0, 1], Extrapolate.CLAMP),
    transform: [{ scale: interpolate(translateX.value, [0, SCREEN_W * 0.35], [0.7, 1.1], Extrapolate.CLAMP) }],
  }));
  const nopeOverlay = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [-SCREEN_W * 0.35, 0], [1, 0], Extrapolate.CLAMP),
    transform: [{ scale: interpolate(translateX.value, [-SCREEN_W * 0.35, 0], [1.1, 0.7], Extrapolate.CLAMP) }],
  }));
  const superOverlay = useAnimatedStyle(() => ({
    opacity: interpolate(translateY.value, [SWIPE_THRESH_UP, 0], [1, 0], Extrapolate.CLAMP),
    transform: [{ scale: interpolate(translateY.value, [SWIPE_THRESH_UP, 0], [1.1, 0.7], Extrapolate.CLAMP) }],
  }));

  const gestureStyle = useAnimatedStyle(() => {
    if (stepConfig.direction === 'up') {
      const transY = interpolate(instructionAnim.value, [0, 1], [0, -35]);
      return {
        transform: [{ translateY: transY }],
      };
    }
    return {};
  });

  const filters = useFilterStore();
  const displayLocation = filters?.location || 'Mumbai, India';

  return (
    <View style={[s.discoverContainer, { backgroundColor: theme.background }]}>

      {/* 1. Header (Discover screen match) */}
      <View style={[s.discoverHeader, { paddingTop: insets.top + SPACING.m }]}>
        <TouchableOpacity
          style={[s.discoverHeaderCrown, {
            borderColor: theme.isDark ? theme.accent : theme.actionButtonBorder,
            backgroundColor: theme.cardBackground,
          }]}
          activeOpacity={0.8}
        >
          <FAIcon name="crown" size={20} color={theme.crownIcon} />
        </TouchableOpacity>

        <View style={s.discoverHeaderCenter}>
          <Text style={[
            s.discoverHeaderTitle,
            { color: theme.accent },
            theme.isDark && { fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontWeight: 'bold' }
          ]}>Discover</Text>
          <Text style={[s.discoverHeaderSub, { color: theme.textSecondary }]}>{displayLocation}</Text>
        </View>

        <TouchableOpacity
          style={[s.discoverHeaderOptions, {
            borderColor: theme.isDark ? theme.accent : theme.actionButtonBorder,
            backgroundColor: theme.cardBackground,
          }]}
        >
          <Icon name="options-outline" size={24} color={theme.filterIcon} />
        </TouchableOpacity>
      </View>

      {/* 2. Dim backdrop filter focusing only on the cards area */}
      <View style={[s.dimBackgroundOverlay, { backgroundColor: theme.isDark ? 'rgba(0,0,0,0.65)' : 'rgba(0,0,0,0.35)' }]} pointerEvents="none" />

      {/* 3. Card Workspace Area */}
      <View
        style={s.discoverCardsArea}
        onLayout={(e) => {
          const h = e.nativeEvent.layout.height;
          if (h > 0) setCardsHeight(h);
        }}
      >
        <GestureDetector gesture={panGesture}>
          <Animated.View style={[
            s.realSwipeCard,
            { width: cardW, height: cardH },
            theme.isDark && { borderWidth: 1, borderColor: theme.accent },
            animatedCard,
          ]}>
            {/* Image */}
            <FastImage
              source={{ uri: imageUrl }}
              style={s.cardImage}
              contentFit="cover"
              blurRadius={6}
            />
            {/* Dark overlay over the image for better gesture legibility */}
            <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(0, 0, 0, 0.4)' }]} pointerEvents="none" />

            {/* Distance badge */}
            <View style={[s.distanceBadge, { backgroundColor: theme.distanceBadgeBg }]}>
              <Icon name="location-outline" size={13} color="#FFFFFF" />
              <Text style={s.distanceText}>{profile.distance} km</Text>
            </View>

            {/* Pagination dots capsule */}
            <View style={s.paginationDots}>
              <View style={[s.dot, s.activeDot]} />
              <View style={s.dot} />
              <View style={s.dot} />
              <View style={s.dot} />
              <View style={s.dot} />
            </View>

            {/* Translucent bottom info gradient */}
            <LinearGradient
              colors={['transparent', 'rgba(0, 0, 0, 0.45)', 'rgba(0, 0, 0, 0.85)']}
              locations={[0, 0.35, 1]}
              style={s.bottomInfoGradient}
            >
              <Text style={[
                s.cardNameText,
                theme.isDark && { fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontWeight: 'bold' }
              ]}>
                {profile.name}, {profile.age}
              </Text>

              {/* Location pin row */}
              <View style={s.cardLocRowInline}>
                <Icon name="location" size={12} color={theme.isDark ? '#FFF' : '#D8D8D8'} />
                <Text style={[s.cardLocTextInline, theme.isDark && { color: '#FFF' }]}>{profile.city}</Text>
              </View>

              {/* Match Score & Verified Row */}
              <View style={s.cardRowInline}>
                <View style={[s.matchScoreBadgeInline, { backgroundColor: theme.isDark ? 'rgba(255, 77, 109, 0.12)' : theme.matchBadgeBg }]}>
                  <Icon name="flame" size={11} color={theme.isDark ? '#FF4D6D' : theme.matchBadgeText} style={{ marginRight: 2 }} />
                  <Text style={[s.matchScoreTextInline, { color: theme.isDark ? '#FF4D6D' : theme.matchBadgeText }]}>
                    {profile.matchScore}% Match
                  </Text>
                </View>

                {profile.isVerified && (
                  <View style={[s.verifiedBadgeInline, { borderColor: theme.accent, backgroundColor: theme.isDark ? 'rgba(246, 220, 160, 0.15)' : 'rgba(233, 64, 87, 0.06)' }]}>
                    <Icon name="checkmark-circle" size={11} color={theme.accent} style={{ marginRight: 3 }} />
                    <Text style={[s.verifiedTextInline, { color: theme.accent }]}>VERIFIED</Text>
                  </View>
                )}
              </View>

              {/* Super Like Bar */}
              <View style={[
                s.superlikeButtonContainer,
                theme.isDark && { borderColor: theme.accent, borderWidth: 1, backgroundColor: 'rgba(0,0,0,0.4)' }
              ]}>
                <Icon name="arrow-up" size={12} color={theme.isDark ? theme.accent : '#FFF'} style={{ marginRight: 4 }} />
                <Text style={[s.superlikeButtonText, theme.isDark && { color: theme.accent }]}>
                  SWIPE UP FOR SUPER LIKE
                </Text>
              </View>
            </LinearGradient>

            {/* Stamp Overlays */}
            <Animated.View style={[s.stampOverlay, likeOverlay]} pointerEvents="none">
              <Icon name="heart" size={54} color="#E94057" />
            </Animated.View>
            <Animated.View style={[s.stampOverlay, nopeOverlay]} pointerEvents="none">
              <Icon name="close" size={54} color="#E86B32" />
            </Animated.View>
            <Animated.View style={[s.stampOverlay, superOverlay]} pointerEvents="none">
              <Icon name="star" size={54} color="#7C3AED" />
            </Animated.View>
          </Animated.View>
        </GestureDetector>

        {/* 4. Action Row (Discover screen match) */}
        <View style={s.discoverActionButtons}>
          <TouchableOpacity style={[s.actionBtnSmall, { backgroundColor: theme.cardBackground, borderColor: theme.isDark ? theme.accent : theme.actionButtonBorder }]}>
            <Icon name="close" size={32} color={theme.isDark ? theme.accent : '#FF6B6B'} />
          </TouchableOpacity>
          <TouchableOpacity style={[s.actionBtnLarge, { backgroundColor: theme.likeButton }]}>
            <Icon name="heart" size={44} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity style={[s.actionBtnSmall, { backgroundColor: theme.cardBackground, borderColor: theme.isDark ? theme.accent : theme.actionButtonBorder }]}>
            <Icon name="flash" size={32} color={theme.isDark ? theme.accent : '#7C3AED'} />
          </TouchableOpacity>
        </View>

        {/* 5. Image Hint Overlay (Floats absolute, doesn't shift layout) */}
        <View style={[s.imageFloatingOverlay, { top: cardH * 0.12 }]} pointerEvents="none">
          <Animated.View style={gestureStyle}>
            <FastImage
              source={stepConfig.image}
              style={s.imageFloatingImage}
              contentFit="contain"
            />
          </Animated.View>
          <View style={[s.swipeHintPill, { backgroundColor: 'rgba(0,0,0,0.72)' }]}>
            <Icon name={stepConfig.icon} size={14} color={stepConfig.color} />
            <Text style={[s.swipeHintText, { fontFamily: TITLE_MED }]}>
              {stepConfig.label}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// OUTRO SCREEN
// ═══════════════════════════════════════════════════════════════════════════════
const OutroScreen = ({ theme, onDone }) => {
  const insets = useSafeAreaInsets();
  const textPrimary = theme.isDark ? '#FFFFFF' : '#111111';
  const textSecondary = theme.isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)';
  const cardBg = theme.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)';
  const cardBorder = theme.isDark ? 'rgba(246,220,160,0.15)' : 'rgba(0,0,0,0.06)';

  return (
    <View style={s.outroRoot}>
      {/* Golden sparkles icon instead of emoji */}
      <View style={s.outroIconWrap}>
        <Icon name="sparkles" size={48} color="#F6DCA0" />
      </View>

      {/* Title */}
      <Text style={[s.outroTitle, { color: textPrimary, fontFamily: TITLE_MED }]}>
        There's more than swiping!
      </Text>
      <Text style={[s.outroSubtitle, { color: textSecondary }]}>
        Discover all the ways to connect.
      </Text>

      {/* Feature Cards */}
      <View style={s.outroFeatures}>
        {OUTRO_FEATURES.map((feat, i) => (
          <View key={i} style={[s.featureRow, { backgroundColor: cardBg, borderColor: cardBorder }]}>
            <View style={[s.featureIconWrap, { backgroundColor: `${feat.color}18` }]}>
              {feat.iconType === 'fa5' ? (
                <FAIcon name={feat.icon} size={18} color={feat.color} />
              ) : (
                <Icon name={feat.icon} size={20} color={feat.color} />
              )}
            </View>
            <View style={s.featureTextCol}>
              <Text style={[s.featureTitle, { color: textPrimary, fontFamily: TITLE_MED }]}>{feat.title}</Text>
              <Text style={[s.featureDesc, { color: textSecondary }]}>{feat.desc}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Got it button */}
      <TouchableOpacity
        style={[s.gotItBtn, { backgroundColor: theme.accent }]}
        onPress={onDone}
        activeOpacity={0.88}
      >
        <Text style={[s.gotItText, { fontFamily: TITLE_MED }]}>Got it!</Text>
      </TouchableOpacity>
    </View>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN OVERLAY CONTROL
// ═══════════════════════════════════════════════════════════════════════════════
export const TutorialOverlay = () => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  // User profiles & details
  const user = useAuthStore((s) => s.user);
  const profileData = useProfileStore((s) => s.profile);
  const userId = user?.id || user?._id || 'guest';

  // Gender check for dummy images
  const userGender = (user?.gender || profileData?.gender || '').toLowerCase();
  const showFemale = userGender !== 'female' && userGender !== 'woman';

  const images = showFemale ? FEMALE_IMAGES : MALE_IMAGES;
  const profiles = showFemale ? FEMALE_PROFILES : MALE_PROFILES;

  // AsyncStorage status
  const completedKey = `mingley_tutorial_completed_${userId}`;
  const declinedKey = `mingley_tutorial_disabled_${userId}`; // Match exact toggle key names used in DiscoverScreen

  // Phase tracker: 'loading' | 'welcome' | 'swipe' | 'outro' | 'hidden'
  const [phase, setPhase] = useState('loading');
  const [swipeStep, setSwipeStep] = useState(0);
  const [cardKey, setCardKey] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const [completed, declined] = await Promise.all([
          AsyncStorage.getItem(completedKey),
          AsyncStorage.getItem(declinedKey),
        ]);
        if (completed === 'true' || declined === 'true') {
          setPhase('hidden');
        } else {
          setPhase('welcome');
        }
      } catch {
        setPhase('welcome');
      }
    })();
  }, [userId, completedKey, declinedKey]);

  const handleSkipWelcome = useCallback(async () => {
    try { await AsyncStorage.setItem(declinedKey, 'true'); } catch { }
    setPhase('hidden');
  }, [declinedKey]);

  const handleStartTutorial = useCallback(() => {
    setSwipeStep(0);
    setCardKey(0);
    setPhase('swipe');
  }, []);

  const handleCorrectSwipe = useCallback(() => {
    if (swipeStep < SWIPE_STEPS.length - 1) {
      const next = swipeStep + 1;
      setSwipeStep(next);
      setCardKey(prev => prev + 1);
    } else {
      setPhase('outro');
    }
  }, [swipeStep]);

  const handleOutroDone = useCallback(async () => {
    try { await AsyncStorage.setItem(completedKey, 'true'); } catch { }
    setPhase('hidden');
  }, [completedKey]);

  if (phase === 'loading' || phase === 'hidden') return null;

  // For welcome screen, overlay itself should be transparent so we see the Discover screen behind
  const mainOverlayBg = phase === 'welcome' ? 'transparent' : (theme.isDark ? '#131314' : '#FFFFFF');

  return (
    <View style={[s.overlay, { backgroundColor: mainOverlayBg }]}>
      {phase === 'welcome' && (
        <WelcomeScreen
          theme={theme}
          onStart={handleStartTutorial}
          onSkip={handleSkipWelcome}
          bgImage={images[0]}
        />
      )}

      {phase === 'swipe' && (
        <SwipeTutorialCard
          key={`swipe-card-${cardKey}`}
          stepIndex={swipeStep}
          profile={profiles[swipeStep]}
          imageUrl={images[swipeStep]}
          stepConfig={SWIPE_STEPS[swipeStep]}
          theme={theme}
          onCorrectSwipe={handleCorrectSwipe}
        />
      )}

      {phase === 'outro' && (
        <OutroScreen theme={theme} onDone={handleOutroDone} />
      )}
    </View>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// STYLES (Identical styles extracted from DiscoverScreen & SwipeCard)
// ═══════════════════════════════════════════════════════════════════════════════
const s = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 99999,
  },

  // Welcome screen layouts
  welcomeRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  welcomeContent: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  waveIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(246, 220, 160, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
    fontFamily: TITLE_FONT,
  },
  startButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 30,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  skipTouchable: {
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  skipLabel: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: TITLE_FONT,
  },

  // Discover screen layout replica
  discoverContainer: {
    flex: 1,
  },
  discoverHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    zIndex: 5,
  },
  discoverHeaderCrown: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  discoverHeaderCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  discoverHeaderTitle: {
    fontSize: 28,
    fontWeight: '600',
    fontFamily: TITLE_MED,
    marginBottom: 2,
  },
  discoverHeaderSub: {
    fontSize: 11,
    fontFamily: TITLE_FONT,
  },
  discoverHeaderOptions: {
    width: 52,
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  discoverCardsArea: {
    flex: 1,
    marginTop: 8,
    marginBottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    zIndex: 20,
  },

  // Dim backdrop overlay focusing only on the cards area
  dimBackgroundOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },

  // Replica SwipeCard inner components
  realSwipeCard: {
    borderRadius: 18,
    backgroundColor: '#000000',
    elevation: 4,
    position: 'relative',
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    borderRadius: 18,
  },
  distanceBadge: {
    position: 'absolute',
    top: 24,
    left: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  distanceText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
    fontFamily: TITLE_FONT,
  },
  paginationDots: {
    position: 'absolute',
    right: 0,
    top: '38%',
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    paddingVertical: 18,
    paddingHorizontal: 8,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
  },
  activeDot: {
    backgroundColor: '#FFFFFF',
  },
  bottomInfoGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 140 : 115, // Perfect action button spacing matching SwipeCard.js
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  cardNameText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  cardLocRowInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginVertical: 3,
  },
  cardLocTextInline: {
    color: '#D8D8D8',
    fontSize: 12,
    fontFamily: TITLE_FONT,
  },
  cardRowInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 5,
    flexWrap: 'wrap',
  },
  matchScoreBadgeInline: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 3,
  },
  matchScoreTextInline: {
    fontSize: 9,
    fontWeight: '700',
    fontFamily: TITLE_FONT,
    textTransform: 'uppercase',
  },
  verifiedBadgeInline: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  verifiedTextInline: {
    fontSize: 9,
    fontWeight: '700',
    fontFamily: TITLE_FONT,
    textTransform: 'uppercase',
  },
  superlikeButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  superlikeButtonText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontFamily: TITLE_FONT,
  },
  stampOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 120,
    height: 120,
    marginTop: -60,
    marginLeft: -60,
    borderRadius: 60,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },

  // Discover ActionButtons replica
  discoverActionButtons: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 35 : 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    zIndex: 5,
  },
  actionBtnSmall: {
    width: 66,
    height: 66,
    borderRadius: 33,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 6,
  },
  actionBtnLarge: {
    width: 84,
    height: 84,
    borderRadius: 42,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.28,
    shadowRadius: 14,
    elevation: 10,
  },

  // Floating Image Instruction Overlay styles
  imageFloatingOverlay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 30,
  },
  imageFloatingImage: {
    width: 90,
    height: 90,
  },
  swipeHintPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    gap: 6,
    marginTop: 8,
  },
  swipeHintText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },

  // Outro screen designs
  outroRoot: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  outroIconWrap: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: 'rgba(246, 220, 160, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  outroTitle: {
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  outroSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 36,
    lineHeight: 20,
    fontFamily: TITLE_FONT,
  },
  outroFeatures: {
    width: '100%',
    gap: 12,
    marginBottom: 40,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 14,
  },
  featureIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureTextCol: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: 12,
    lineHeight: 17,
    fontFamily: TITLE_FONT,
  },
  gotItBtn: {
    width: '100%',
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  gotItText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
