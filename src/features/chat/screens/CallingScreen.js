import React from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import FastImage from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SPACING, TYPOGRAPHY } from '../../../constants/theme';
import Svg, { Path, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';

const { width } = Dimensions.get('window');

export const CallingScreen = ({ navigation, route }) => {
  const { user } = route?.params || {
    user: {
      name: 'Sara Christin',
      image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
      callerImage: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80'
    }
  };

  return (
    <View style={styles.container}>
      {/* Background Main Image */}
      <FastImage
        source={{ uri: user.image }}
        style={StyleSheet.absoluteFillObject}
        resizeMode={FastImage.resizeMode.cover}
      />
      {/* Dark overlay to make text pop */}
      <View style={StyleSheet.absoluteFillObject} backgroundColor="rgba(0,0,0,0.2)" />

      <SafeAreaView style={styles.safeArea}>
        {/* Top Header */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={28} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.userInfoContainer}>
          <LinearGradient
            colors={['#8A2BE2', '#E94057']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.matchedBadge}
          >
            <Text style={styles.matchedText}>Matched</Text>
            <Text style={styles.heartIcon}>🩷</Text>
          </LinearGradient>

          <Text style={styles.userName}>{user.name}</Text>

          <View style={styles.timerBubble}>
            <View style={styles.recordingDot} />
            <Text style={styles.timerText}>27:15</Text>
          </View>
        </View>

        {/* Small Caller Avatar */}
        <View style={styles.callerAvatarWrapper}>
          <FastImage
            source={{ uri: user.callerImage }}
            style={styles.callerAvatar}
          />
        </View>
      </SafeAreaView>

      {/* Bottom Control Area Structure */}
      <View style={styles.bottomControlsArea}>
        {/* Curved Gradient Background Shape */}
        <View style={styles.curvedBackground}>
          <Svg width={width} height="120" viewBox="0 0 375 120" preserveAspectRatio="none">
            <Defs>
              <SvgLinearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <Stop offset="0" stopColor="#E94057" />
                <Stop offset="1" stopColor="#8A2387" />
              </SvgLinearGradient>
            </Defs>
            <Path
              fill="url(#grad)"
              d="M0 40C0 17.9 17.9 0 40 0h84.2c9.5 0 17.6 6.3 20.3 15.4C151.7 40 168.8 45 187.5 45c18.7 0 35.8-5 43-29.6 2.7-9.1 10.8-15.4 20.3-15.4H335c22.1 0 40 17.9 40 40v80H0V40z"
            />
          </Svg>
        </View>

        {/* The Action Buttons overlaying the curved shape */}
        <View style={styles.actionsRow}>
          <View style={styles.sideActions}>
            <TouchableOpacity style={styles.iconButton}>
              <Icon name="share-outline" size={26} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Icon name="chatbubble-ellipses-outline" size={26} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Center Call Button occupying the notch */}
          <TouchableOpacity style={styles.endCallButton} onPress={() => navigation.goBack()}>
            <LinearGradient
              colors={['#E94057', '#C2185B']}
              style={styles.endCallGradient}
            >
              <Icon name="call" size={28} color="#FFFFFF" style={{ transform: [{ rotate: '135deg' }] }} />
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.sideActions}>
            <TouchableOpacity style={styles.iconButton}>
              <Icon name="sync-outline" size={26} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Icon name="mic-off-outline" size={26} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.m,
  },
  backButton: {
    marginBottom: 'auto',
  },
  userInfoContainer: {
    paddingBottom: 60,
  },
  matchedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: SPACING.s,
  },
  matchedText: {
    ...TYPOGRAPHY.bodySecondary,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginRight: 4,
  },
  heartIcon: {
    fontSize: 14,
  },
  userName: {
    ...TYPOGRAPHY.h1,
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: SPACING.s,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  timerBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E94057',
    marginRight: 8,
  },
  timerText: {
    ...TYPOGRAPHY.body,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  callerAvatarWrapper: {
    position: 'absolute',
    right: SPACING.xl,
    bottom: 50,
    width: 100,
    height: 140,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    overflow: 'hidden',
  },
  callerAvatar: {
    width: '100%',
    height: '100%',
  },
  bottomControlsArea: {
    height: 120, // adjust as needed
    width: '100%',
    justifyContent: 'flex-end',
  },
  curvedBackground: {
    ...StyleSheet.absoluteFillObject,
    bottom: 0,
    width: '100%',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.l,
    paddingBottom: SPACING.xl,
    height: '100%',
  },
  sideActions: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'space-around',
  },
  iconButton: {
    padding: SPACING.s,
  },
  endCallButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#000000', // To create an outline effect around the button inside the notch
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -30, // Lift it into the notch
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  endCallGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
