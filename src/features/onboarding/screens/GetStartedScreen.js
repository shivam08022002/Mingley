import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';

const { width } = Dimensions.get('window');

const IMAGE_SIZE = width * 1.2;
const LOGO_SIZE = IMAGE_SIZE * 0.30;

export const GetStartedScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>

      {/* ── Centred illustration + logo block ── */}
      <View style={styles.centreBlock}>
        <View style={styles.imageWrapper}>

          {/* Started.png ring illustration — behind */}
          <FastImage
            source={require('../../../assets/Started.png')}
            style={styles.startedImage}
            resizeMode={FastImage.resizeMode.contain}
          />

          {/* Logo + subtitle — overlaid in the centre of the circle */}
          <View style={styles.logoOverlay}>
            <FastImage
              source={require('../../../assets/app-logo2.png')}
              style={styles.logo}
              resizeMode={FastImage.resizeMode.contain}
            />
            <Text style={styles.subtitle}>Online Dating App</Text>
          </View>

        </View>
      </View>

      {/* ── Get Started with two-tone gradient-style text + arrow ── */}
      <TouchableOpacity
        style={styles.footer}
        onPress={() => navigation.navigate('Carousel')}
        activeOpacity={0.7}
      >
        <View style={styles.getStartedRow}>
          <Text style={styles.getStartedText}>Get Started</Text>
          <Text style={styles.getStartedSpace}>  </Text>
          <Text style={styles.getStartedArrow}>→</Text>
        </View>
      </TouchableOpacity>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  centreBlock: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageWrapper: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  startedImage: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
  },
  logoOverlay: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 0,
  },
  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE * 0.45,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E94057',
    letterSpacing: 0.5,
    fontFamily: Platform.OS === 'ios' ? 'AvenirNext-regular' : 'sans-serif-regular',
    textAlign: 'center',
    marginTop: 2,
  },
  footer: {
    paddingBottom: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  getStartedRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  getStartedText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#E94057',
    fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif-medium',
    letterSpacing: 0.4,
  },
  getStartedSpace: {
    fontSize: 22,
  },
  getStartedArrow: {
    fontSize: 22,
    fontWeight: '700',
    color: '#8A2387',
    fontFamily: Platform.OS === 'ios' ? 'Inter-Bold' : 'sans-serif-medium',
  },
});
