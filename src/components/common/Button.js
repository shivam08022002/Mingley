import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../../constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../theme/ThemeContext';

export const Button = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  textStyle,
}) => {
  const { theme, isDark } = useTheme();
  const isPrimary = variant === 'primary';
  const isFilled = variant === 'primary' || variant === 'solid';

  const Content = () => {
    let textColor = COLORS.white;
    if (isDark) {
      textColor = isFilled ? '#0A0A0A' : theme.accent;
    } else {
      if (!isPrimary) {
        textColor = COLORS.primary;
      }
    }
    if (disabled) {
      textColor = isDark ? '#666666' : COLORS.textSecondary;
    }

    return (
      <>
        {loading ? (
          <ActivityIndicator color={textColor} />
        ) : (
          <Text
            style={[
              styles.text,
              { color: textColor },
              textStyle,
            ]}
          >
            {title}
          </Text>
        )}
      </>
    );
  };

  if (isPrimary && !disabled) {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        style={[styles.container, style]}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={isDark ? ['#F6DCA0', '#D4AF37'] : [COLORS.gradientStart, COLORS.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        >
          <Content />
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  const containerBg = isDark 
    ? (isFilled ? theme.accent : 'transparent')
    : (isFilled ? COLORS.primary : 'transparent');

  const containerBorderColor = isDark ? theme.accent : COLORS.primary;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.container,
        { backgroundColor: containerBg },
        !isPrimary && { borderWidth: 2, borderColor: containerBorderColor },
        disabled && (isDark ? { backgroundColor: '#1A1A1A', borderColor: '#333' } : styles.disabledContainer),
        style,
      ]}
      activeOpacity={0.8}
    >
      <Content />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    width: '100%',
    marginVertical: SPACING.s,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  solidBackground: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
  },
  outlineContainer: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  disabledContainer: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
  },
  text: {
    ...TYPOGRAPHY.h3,
    color: COLORS.white,
  },
  textOutline: {
    color: COLORS.primary,
  },
  textDisabled: {
    color: COLORS.textSecondary,
  },
});
