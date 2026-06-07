import React, { useEffect } from 'react';
import { View } from 'react-native';
import { Image as FastImage } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { styles } from '../onboarding.styles';
import { COLORS } from '../../../constants/theme';
import { useTheme } from '../../../theme/ThemeContext';

export const SplashScreen = ({ navigation }) => {
  const { theme, isDark } = useTheme();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('GetStarted');
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigation]);

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
