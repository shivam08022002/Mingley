import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

const CURRENT_USER_IMAGE =
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=500&q=80';

export const MatchScreen = ({ navigation, route }) => {
  const { matchedUser } = route.params || {};
  const insets = useSafeAreaInsets();

  // Entrance animation
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const leftCardAnim = useRef(new Animated.Value(-300)).current;
  const rightCardAnim = useRef(new Animated.Value(300)).current;
  const textAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.spring(leftCardAnim, {
          toValue: 0,
          tension: 60,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(rightCardAnim, {
          toValue: 0,
          tension: 60,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
      Animated.spring(textAnim, {
        toValue: 1,
        tension: 80,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const matchedName = matchedUser?.name?.split(' ')[0] || 'Jake';

  return (
    <Animated.View style={[styles.container, { opacity: overlayOpacity }]}>
      {/* Subtle gradient background */}
      <LinearGradient
        colors={['#fff5f7', '#ffffff', '#fff5f7']}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Cards section */}
      <View style={styles.cardsSection}>
        {/* Heart badge between cards at top-center */}
        <View style={styles.topHeartBadge}>
          <Text style={styles.topHeartIcon}>♥</Text>
        </View>

        {/* Right card – matched user (boy/other person) - slightly behind */}
        <Animated.View
          style={[
            styles.cardWrapper,
            styles.rightCard,
            { transform: [{ translateX: rightCardAnim }] },
          ]}
        >
          <FastImage
            source={{
              uri:
                matchedUser?.image ||
                'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=500&q=80',
            }}
            style={styles.cardImage}
          />
        </Animated.View>

        {/* Left card – current user (girl) - in front with heart on bottom-left */}
        <Animated.View
          style={[
            styles.cardWrapper,
            styles.leftCard,
            { transform: [{ translateX: leftCardAnim }] },
          ]}
        >
          <FastImage
            source={{ uri: CURRENT_USER_IMAGE }}
            style={styles.cardImage}
          />
          {/* Heart badge on bottom-left of girl card */}
          <View style={styles.heartBadge}>
            <Text style={styles.heartIcon}>♥</Text>
          </View>
        </Animated.View>
      </View>

      {/* Text section */}
      <Animated.View
        style={[
          styles.textSection,
          {
            opacity: textAnim,
            transform: [
              {
                translateY: textAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [30, 0],
                }),
              },
            ],
          },
        ]}
      >
        <Text style={styles.matchTitle}>It's a match, {matchedName}!</Text>
        <Text style={styles.matchSubtitle}>
          Start a conversation now with each other
        </Text>
      </Animated.View>

      {/* Action Buttons */}
      <Animated.View
        style={[
          styles.buttonsContainer,
          { paddingBottom: insets.bottom + 20, opacity: textAnim },
        ]}
      >
        <TouchableOpacity
          style={styles.sayHelloButton}
          activeOpacity={0.85}
          onPress={() => {
            navigation.replace('Chat');
          }}
        >
          <LinearGradient
            colors={['#E94057', '#E94057']}
            style={styles.helloGradient}
          >
            <Text style={styles.sayHelloText}>Say hello</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.keepSwipingButton}
          activeOpacity={0.8}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.keepSwipingText}>Keep swiping</Text>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
};

const CARD_WIDTH = width * 0.52;
const CARD_HEIGHT = CARD_WIDTH * 1.45;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  cardsSection: {
    width: width,
    height: height * 0.48,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  topHeartBadge: {
    position: 'absolute',
    top: 0,
    zIndex: 10,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#E94057',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  topHeartIcon: {
    fontSize: 26,
    color: '#E94057',
  },
  cardWrapper: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'absolute',
    backgroundColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 10,
  },
  leftCard: {
    left: width * 0.05,
    bottom: 0,
    transform: [{ rotate: '-8deg' }],
    zIndex: 3,
  },
  rightCard: {
    right: width * 0.05,
    top: 30,
    transform: [{ rotate: '8deg' }],
    zIndex: 1,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  heartBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#E94057',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  heartIcon: {
    fontSize: 22,
    color: '#E94057',
  },
  textSection: {
    alignItems: 'center',
    paddingHorizontal: 32,
    marginTop: 48,
  },
  matchTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#E94057',
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif-medium',
    letterSpacing: -0.5,
    marginBottom: 10,
  },
  matchSubtitle: {
    fontSize: 15,
    color: '#7A7A7A',
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif',
    lineHeight: 22,
  },
  buttonsContainer: {
    width: '100%',
    paddingHorizontal: 28,
    gap: 14,
    marginTop: 'auto',
  },
  sayHelloButton: {
    borderRadius: 30,
    overflow: 'hidden',
    height: 56,
  },
  helloGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sayHelloText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif-medium',
    letterSpacing: 0.3,
  },
  keepSwipingButton: {
    height: 56,
    borderRadius: 30,
    backgroundColor: '#FFF0F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  keepSwipingText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#E94057',
    fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif-medium',
  },
});
