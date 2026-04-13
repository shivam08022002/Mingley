import React, { useEffect } from 'react';
import { View, SafeAreaView } from 'react-native';
import FastImage from 'react-native-fast-image';
import LinearGradient from 'react-native-linear-gradient';
import { styles } from '../onboarding.styles';
import { COLORS } from '../../../constants/theme';

export const SplashScreen = ({ navigation }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('GetStarted');
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <SafeAreaView style={styles.splashContainer}>
      <LinearGradient
        colors={[COLORS.gradientStart, COLORS.gradientEnd]}
        style={styles.gradient}
      >
        <FastImage
          source={require('../../../assets/app-logo.png')}
          style={styles.logo}
          resizeMode={FastImage.resizeMode.contain}
        />
      </LinearGradient>
    </SafeAreaView>
  );
};
