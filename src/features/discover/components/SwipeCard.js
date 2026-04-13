import React, { forwardRef, useImperativeHandle } from 'react';
import { StyleSheet, View, Text, Dimensions, TouchableOpacity } from 'react-native';
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
const SWIPE_THRESHOLD_X = width * 0.3;
const SWIPE_THRESHOLD_UP = -height * 0.2; // swipe up 20% of screen height

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
        [0.92, 1],
        Extrapolate.CLAMP
      );
      const opacity = interpolate(
        Math.abs(translateX.value),
        [0, width / 2],
        [0.8, 1],
        Extrapolate.CLAMP
      );
      return { transform: [{ scale }], opacity };
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

const CardContent = ({ user, onPress }) => (
  <TouchableOpacity
    style={styles.cardInner}
    activeOpacity={0.95}
    onPress={onPress}
    disabled={!onPress}
  >
    <FastImage source={{ uri: user.image }} style={styles.image} />

    <View style={styles.distanceBadge}>
      <Icon name="location-outline" size={13} color="#FFFFFF" />
      <Text style={styles.distanceText}>{user.distance} km</Text>
    </View>

    {/* Swipe-up hint arrow */}
    <View style={styles.swipeUpHint}>
      <Icon name="chevron-up" size={18} color="rgba(255,255,255,0.7)" />
      <Text style={styles.swipeUpText}>Swipe up to Super Like</Text>
    </View>

    <LinearGradient
      colors={['transparent', 'rgba(0,0,0,0.85)']}
      style={styles.gradient}
    >
      <Text style={styles.name}>{user.name}, {user.age}</Text>
      <Text style={styles.occupation}>{user.occupation}</Text>
    </LinearGradient>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  cardWrapper: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
  },
  card: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  cardInner: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
    backgroundColor: '#000',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 10,
  },
  image: { width: '100%', height: '100%' },
  gradient: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    height: 180,
    justifyContent: 'flex-end',
    padding: SPACING.xl,
  },
  name: {
    ...TYPOGRAPHY.h2,
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 4,
  },
  occupation: {
    ...TYPOGRAPHY.body,
    color: 'rgba(255,255,255,0.85)',
    fontSize: 14,
  },
  distanceBadge: {
    position: 'absolute',
    top: 20, left: 20,
    backgroundColor: 'rgba(0,0,0,0.35)',
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  distanceText: {
    ...TYPOGRAPHY.caption,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  swipeUpHint: {
    position: 'absolute',
    top: 20,
    alignSelf: 'center',
    alignItems: 'center',
    opacity: 0.75,
  },
  swipeUpText: {
    color: '#fff',
    fontSize: 11,
    marginTop: 2,
  },
});
