import React, { useEffect } from 'react';
import { View } from 'react-native';
import { Image as FastImage } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { styles } from '../onboarding.styles';
import { COLORS } from '../../../constants/theme';
import { useTheme } from '../../../theme/ThemeContext';
import { useAuthStore } from '../../../store/useAuthStore';

export const SplashScreen = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const isLoggingOut = useAuthStore((state) => state.isLoggingOut);
  const isSplashFinished = useAuthStore((state) => state.isSplashFinished);

  useEffect(() => {
    if (isLoggingOut) {
      // Clear the logout redirect flag
      useAuthStore.setState({ isLoggingOut: false });
      navigation.replace('Login');
    } else {
      if (!isSplashFinished) {
        // Initial app boot
        const timer = setTimeout(() => {
          useAuthStore.setState({ isSplashFinished: true });
        }, 2000);
        return () => clearTimeout(timer);
      } else {
        // App is already booted, but user is not logged in.
        // AuthNavigator defaults to Splash, so we just pass them through to GetStarted.
        navigation.replace('GetStarted');
      }
    }
  }, [isLoggingOut, isSplashFinished, navigation]);

  return (
    <View style={styles.splashContainer}>
      <LinearGradient
        colors={isDark ? ['#000000', '#000000'] : [COLORS.gradientStart, COLORS.gradientEnd]}
        style={styles.gradient}
      >
        <FastImage
          source={isDark ? require('../../../assets/app-logo2.png') : require('../../../assets/app-logo.png')}
          style={styles.logo}
          contentFit="contain"
        />
      </LinearGradient>
    </View>
  );
};
