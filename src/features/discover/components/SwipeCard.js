import React, { forwardRef, useImperativeHandle } from 'react';
import { StyleSheet, View, Text, Dimensions, TouchableOpacity, Platform } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolate,
  Extrapolate,
  runOnJS,
} from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import FastImage from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/Ionicons';
import { SPACING, TYPOGRAPHY } from '../../../constants/theme';
import LinearGradient from 'react-native-linear-gradient';

const { width, height } = Dimensions.get('window');
const CARD_HEIGHT = height * 0.79; // Card takes ~79% of screen height
const CARD_WIDTH = width - 32;     // Increased width (horizontal margin is 16 on each side)
const SWIPE_THRESHOLD_X = width * 0.3;
const SWIPE_THRESHOLD_UP = -height * 0.2;

const TITLE_FONT = Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif';
const TITLE_MED = Platform.OS === 'ios' ? 'AvenirNext-Medium' : 'sans-serif-medium';

export const SwipeCard = forwardRef(
  ({ user, onSwipeLeft, onSwipeRight, onSwipeUp, isFirst, isSecond, onPress }, ref) => {
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
          translateY.value = withSpring(-height * 1.5, { velocity: event.velocityY }, (finished) => {
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
      return { transform: [{ scale }], opacity };
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

    return (
      <View
        style={[styles.cardWrapper, { zIndex: isFirst ? 2 : 1 }]}
        pointerEvents={isFirst ? 'auto' : 'none'}
      >
        {isFirst ? (
          <GestureDetector gesture={panGesture}>
            <Animated.View style={[styles.card, animatedCardStyle]}>
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
          <Animated.View style={[styles.card, nextCardAnimatedStyle]}>
            <CardContent user={user} />
          </Animated.View>
        )}
      </View>
    );
  }
);

const CardContent = ({ user, onPress }) => {
  const locationText = (() => {
    if (user.location?.city) {
      return `${user.location.city}${user.location.country ? `, ${user.location.country}` : ''}`;
    }
    return user.city || user.locationText || 'Mumbai, India';
  })();

  return (
    <TouchableOpacity
      style={styles.cardInner}
      activeOpacity={0.95}
      onPress={onPress}
      disabled={!onPress}
    >
      <FastImage source={{ uri: user.avatar || user.image }} style={styles.image} resizeMode="cover" />

      {/* Distance glassmorphism badge */}
      <View style={styles.distanceBadge}>
        <Icon name="location-outline" size={13} color="#FFFFFF" />
        <Text style={styles.distanceText}>{user.distance || 0} km</Text>
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
      <View style={styles.bottomInfoContainer}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{user.fullName || user.name}, {user.age}</Text>
        </View>
        <Text style={styles.locationText}>{locationText}</Text>

        {/* Inline Row for Match Score & Super Like Hint */}
        <View style={styles.cardRowInline}>
          {user.matchScore !== undefined && (
            <View style={styles.matchScoreBadgeInline}>
              <Icon name="flame" size={11} color="#FFF" style={{ marginRight: 2 }} />
              <Text style={styles.matchScoreTextInline}>{user.matchScore}% Match</Text>
            </View>
          )}

          <View style={styles.superlikeHintCapsule}>
            <Icon name="arrow-up" size={13} color="#FFF" />
            <Text style={styles.superlikeHintText}>Swipe up for Super Like</Text>
          </View>
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
    width: CARD_WIDTH,
    height: '98%', // dynamic height to perfectly fit between header and ActionButtons without overlapping
    borderRadius: 18,
    backgroundColor: '#000000',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  name: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: TITLE_MED,
    marginBottom: 4,
  },
  locationText: {
    color: '#D8D8D8',
    fontSize: 15,
    fontFamily: TITLE_FONT,
  },
  distanceBadge: {
    position: 'absolute',
    top: 24, left: 24,
    backgroundColor: 'rgba(0,0,0,0.45)', // semi-transparent dark background
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
    right: 16,
    top: '38%',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 12,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
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
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
    zIndex: 10,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
    marginBottom: 6,
    flexWrap: 'wrap',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
    borderWidth: 1,
  },
  verifiedBadge: {
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    borderColor: 'rgba(76, 175, 80, 0.3)',
  },
  unverifiedBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: TITLE_FONT,
    textTransform: 'uppercase',
  },
  verifiedBadgeText: {
    color: '#4CAF50',
  },
  unverifiedBadgeText: {
    color: '#BBB',
  },
  matchScoreBadgeInline: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E94057',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 3,
  },
  matchScoreTextInline: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
    fontFamily: TITLE_FONT,
    textTransform: 'uppercase',
  },
  cardRowInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    flexWrap: 'wrap',
  },
  superlikeHintCapsule: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  superlikeHintText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    fontFamily: TITLE_FONT,
  },
});

