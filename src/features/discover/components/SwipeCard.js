import React, { forwardRef, useImperativeHandle } from 'react';
import { StyleSheet, View, Text, Dimensions, TouchableOpacity, Platform, useWindowDimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolate,
  Extrapolate,
  runOnJS,
} from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { Image as FastImage } from 'expo-image';
import Icon from 'react-native-vector-icons/Ionicons';
import { SPACING, TYPOGRAPHY } from '../../../constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../../theme/ThemeContext';

const SWIPE_THRESHOLD_X = Dimensions.get('window').width * 0.3;
const SWIPE_THRESHOLD_UP = -Dimensions.get('window').height * 0.2;

// Responsive card sizing based on available container height
// availableHeight is passed in from DiscoverScreen via layout measurement
const getCardDimensions = (screenWidth, availableHeight) => {
  // availableHeight = space between header and action buttons
  const isLongPhone = availableHeight >= 480; // tall phones get bigger cards

  if (isLongPhone) {
    // Tall phone: fit height into available space with some margin, ensure width < height
    const cardH = availableHeight - 16; // small margin top+bottom
    const cardW = Math.min(screenWidth - 48, cardH * 0.70); // ~10:14 portrait ratio
    return { cardW, cardH };
  } else {
    // Compact phone: narrower card to keep portrait ratio
    const cardH = availableHeight - 8;
    const cardW = Math.min(screenWidth - 56, cardH * 0.72); // slightly narrower
    return { cardW, cardH };
  }
};

const TITLE_FONT = Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif';
const TITLE_MED = Platform.OS === 'ios' ? 'AvenirNext-Medium' : 'sans-serif-medium';


export const SwipeCard = forwardRef(
  ({ user, onSwipeLeft, onSwipeRight, onSwipeUp, isFirst, isSecond, onPress, availableHeight }, ref) => {
    const { width } = useWindowDimensions();
    const { cardW: CARD_WIDTH, cardH: CARD_HEIGHT } = getCardDimensions(width, availableHeight || 480);
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const startX = useSharedValue(0);
    const startY = useSharedValue(0);

    useImperativeHandle(ref, () => ({
      swipeLeft: () => {
        translateX.value = withSpring(-width * 1.5, { velocity: -600 }, (finished) => {
          if (finished && onSwipeLeft) runOnJS(onSwipeLeft)(user);
        });
      },
      swipeRight: () => {
        translateX.value = withSpring(width * 1.5, { velocity: 600 }, (finished) => {
          if (finished && onSwipeRight) runOnJS(onSwipeRight)(user);
        });
      },
      reset: () => {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      },
    }));

    const panGesture = Gesture.Pan()
      .onStart(() => {
        startX.value = translateX.value;
        startY.value = translateY.value;
      })
      .onUpdate((event) => {
        translateX.value = startX.value + event.translationX;
        translateY.value = startY.value + event.translationY;
      })
      .onEnd((event) => {
        // Swipe UP → subscription
        if (translateY.value < SWIPE_THRESHOLD_UP && Math.abs(translateX.value) < SWIPE_THRESHOLD_X) {
          translateY.value = withSpring(-(CARD_HEIGHT + 400), { velocity: event.velocityY }, (finished) => {
            if (finished && onSwipeUp) runOnJS(onSwipeUp)();
          });
          return;
        }
        // Swipe right → like
        if (translateX.value > SWIPE_THRESHOLD_X) {
          translateX.value = withSpring(width * 1.5, { velocity: event.velocityX }, (finished) => {
            if (finished && onSwipeRight) runOnJS(onSwipeRight)(user);
          });
          return;
        }
        // Swipe left → dislike
        if (translateX.value < -SWIPE_THRESHOLD_X) {
          translateX.value = withSpring(-width * 1.5, { velocity: event.velocityX }, (finished) => {
            if (finished && onSwipeLeft) runOnJS(onSwipeLeft)(user);
          });
          return;
        }
        // Snap back
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      });

    const animatedCardStyle = useAnimatedStyle(() => {
      const rotateZ = interpolate(
        translateX.value,
        [-width, 0, width],
        [-15, 0, 15],
        Extrapolate.CLAMP
      );
      return {
        transform: [
          { translateX: translateX.value },
          { translateY: translateY.value },
          { rotateZ: `${rotateZ}deg` },
        ],
      };
    });

    const nextCardAnimatedStyle = useAnimatedStyle(() => {
      const scale = interpolate(
        Math.abs(translateX.value),
        [0, width / 2],
        [0.94, 1],
        Extrapolate.CLAMP
      );
      const opacity = interpolate(
        Math.abs(translateX.value),
        [0, width / 2],
        [0.85, 1],
        Extrapolate.CLAMP
      );
      const translateYVal = interpolate(
        Math.abs(translateX.value),
        [0, width / 2],
        [-15, 0],
        Extrapolate.CLAMP
      );
      return {
        transform: [{ scale }, { translateY: translateYVal }],
        opacity,
      };
    });

    // Centered overlay animations based on swipe distance
    const likeOverlayStyle = useAnimatedStyle(() => {
      const opacity = interpolate(
        translateX.value,
        [0, width * 0.35],
        [0, 1],
        Extrapolate.CLAMP
      );
      const scale = interpolate(
        translateX.value,
        [0, width * 0.35],
        [0.7, 1.1],
        Extrapolate.CLAMP
      );
      return {
        opacity,
        transform: [{ scale }],
      };
    });

    const dislikeOverlayStyle = useAnimatedStyle(() => {
      const opacity = interpolate(
        translateX.value,
        [-width * 0.35, 0],
        [1, 0],
        Extrapolate.CLAMP
      );
      const scale = interpolate(
        translateX.value,
        [-width * 0.35, 0],
        [1.1, 0.7],
        Extrapolate.CLAMP
      );
      return {
        opacity,
        transform: [{ scale }],
      };
    });

    const { theme } = useTheme();

    return (
      <View
        style={[styles.cardWrapper, { zIndex: isFirst ? 2 : 1 }]}
        pointerEvents={isFirst ? 'auto' : 'none'}
      >
        {isFirst ? (
          <GestureDetector gesture={panGesture}>
            <Animated.View style={[
              styles.card,
              { width: CARD_WIDTH, height: CARD_HEIGHT },
              theme.isDark && { borderWidth: 1, borderColor: theme.accent },
              animatedCardStyle
            ]}>
              <CardContent user={user} onPress={onPress} />

              {/* Center Swipe overlays */}
              <Animated.View style={[styles.overlayContainer, likeOverlayStyle]} pointerEvents="none">
                <Icon name="heart" size={54} color="#E94057" />
              </Animated.View>
              <Animated.View style={[styles.overlayContainer, dislikeOverlayStyle]} pointerEvents="none">
                <Icon name="close" size={54} color="#E86B32" />
              </Animated.View>
            </Animated.View>
          </GestureDetector>
        ) : (
          <Animated.View style={[
            styles.card,
            { width: CARD_WIDTH, height: CARD_HEIGHT },
            theme.isDark && { borderWidth: 1, borderColor: theme.accent },
            nextCardAnimatedStyle
          ]}>
            <CardContent user={user} />
          </Animated.View>
        )}
      </View>
    );
  }
);

const CardContent = ({ user, onPress }) => {
  const { theme } = useTheme();

  const locationText = (() => {
    if (user.location?.city) {
      return `${user.location.city}${user.location.country ? `, ${user.location.country}` : ''}`;
    }
    return user.city || user.locationText || 'Mumbai, India';
  })();

  const isVerified = user.isVerified || user.verified;

  return (
    <TouchableOpacity
      style={[styles.cardInner, theme.isDark && { backgroundColor: theme.background }]}
      activeOpacity={0.95}
      onPress={onPress}
      disabled={!onPress}
    >
      <FastImage source={{ uri: user.avatar || user.image }} style={styles.image} resizeMode="cover" />

      {/* Distance glassmorphism badge */}
      <View style={[styles.distanceBadge, { backgroundColor: theme.distanceBadgeBg }]}>
        <Icon name="location-outline" size={13} color="#FFFFFF" />
        <Text style={styles.distanceText}>{user.distance != null ? Math.max(1, Math.round(user.distance)) : 1} km</Text>
      </View>

      {/* Vertical pagination dots capsule from reference design */}
      <View style={styles.paginationDots}>
        <View style={[styles.dot, styles.activeDot]} />
        <View style={styles.dot} />
        <View style={styles.dot} />
        <View style={styles.dot} />
        <View style={styles.dot} />
      </View>

      {/* Bottom translucent info section */}
      <View style={[
        styles.bottomInfoContainer,
        theme.isDark && { backgroundColor: 'rgba(10, 10, 10, 0.75)', borderTopWidth: 0 }
      ]}>
        <View style={styles.nameRow}>
          <Text style={[
            styles.name,
            theme.isDark && { fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontWeight: 'bold' }
          ]}>
            {user.fullName || user.name}, {user.age}
          </Text>
        </View>

        {/* Location row with pin icon */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginVertical: 3 }}>
          <Icon name="location" size={12} color={theme.isDark ? '#FFF' : '#D8D8D8'} />
          <Text style={[styles.locationText, theme.isDark && { color: '#FFF' }]}>{locationText}</Text>
        </View>

        {/* Inline Row for Match Score & Verified Badge */}
        <View style={styles.cardRowInline}>
          {user.matchScore !== undefined && (
            <View style={[styles.matchScoreBadgeInline, { backgroundColor: theme.matchBadgeBg }]}>
              <Icon name="flame" size={11} color={theme.isDark ? '#FF4D6D' : theme.matchBadgeText} style={{ marginRight: 2 }} />
              <Text style={[styles.matchScoreTextInline, { color: theme.isDark ? '#FF4D6D' : theme.matchBadgeText }]}>
                {user.matchScore}% Match
              </Text>
            </View>
          )}

          {isVerified && (
            <View style={[styles.verifiedBadgeInline, { borderColor: theme.accent, backgroundColor: theme.isDark ? 'rgba(0,0,0,0.3)' : 'transparent' }]}>
              <Icon name="star" size={10} color={theme.accent} style={{ marginRight: 3 }} />
              <Text style={[styles.verifiedTextInline, { color: theme.accent }]}>VERIFIED</Text>
            </View>
          )}
        </View>

        {/* Super Like Button */}
        <View style={[
          styles.superlikeButtonContainer,
          theme.isDark && { borderColor: theme.accent, borderWidth: 1, backgroundColor: 'rgba(0,0,0,0.4)' }
        ]}>
          <Icon name="arrow-up" size={12} color={theme.isDark ? theme.accent : '#FFF'} style={{ marginRight: 4 }} />
          <Text style={[styles.superlikeButtonText, theme.isDark && { color: theme.accent }]}>
            SWIPE UP FOR SUPER LIKE
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    borderRadius: 18,
    backgroundColor: '#000000',
    boxShadow: '0px 4px 8px rgba(0,0,0,0.12)',
    elevation: 4,
    // width and height set dynamically via inline style
  },
  cardInner: {
    width: '100%',
    height: '100%',
    borderRadius: 18,
    backgroundColor: '#000000',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 18,
  },
  bottomInfoContainer: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  name: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: TITLE_MED,
    marginBottom: 2,
  },
  locationText: {
    color: '#D8D8D8',
    fontSize: 12,
    fontFamily: TITLE_FONT,
  },
  distanceBadge: {
    position: 'absolute',
    top: 24, left: 24,
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)', // glassmorphism border
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
  overlayContainer: {
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
    boxShadow: '0px 12px 16px rgba(0,0,0,0.25)',
    elevation: 10,
    zIndex: 10,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
  cardRowInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 5,
    flexWrap: 'wrap',
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
});
