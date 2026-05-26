import React, { useEffect } from 'react';
import { View } from 'react-native';
import { Image as FastImage } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
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
    <View style={styles.splashContainer}>
      <LinearGradient
        colors={[COLORS.gradientStart, COLORS.gradientEnd]}
        style={styles.gradient}
      >
        <FastImage
          source={require('../../../assets/app-logo.png')}
          style={styles.logo}
          contentFit="contain"
        />
      </LinearGradient>
    </View>
  );
};
