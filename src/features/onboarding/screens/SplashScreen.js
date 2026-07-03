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
  const isLoggingOut = useAuthStore((s) => s.isLoggingOut);

  useEffect(() => {
    if (isLoggingOut) {
      // Clear the logout redirect flag
      useAuthStore.setState({ isLoggingOut: false });
      navigation.replace('Login');
    } else {
      const timer = setTimeout(() => {
        navigation.replace('GetStarted');
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isLoggingOut, navigation]);

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
