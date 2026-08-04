import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../theme/ThemeContext';

export const ActionButtons = ({
  onBoost,
  onDislike,
  onSuperLike,
  onLike,
  onSuperchat,
  style,
}) => {
  const { theme, isDark } = useTheme();

  // Golden accent color for both Boost and Superchat to match brand aesthetics
  const goldenAccent = isDark ? (theme.accent || '#F6DCA0') : '#F59E0B';

  const colors = {
    boost: goldenAccent,
    pass: isDark ? '#FF6B6B' : '#FF6B6B',
    superlike: isDark ? '#3B82F6' : '#3B82F6',
    like: isDark ? '#FF4D6D' : '#FF4D6D',
    superchat: goldenAccent,
  };

  const buttons = [
    {
      key: 'boost',
      label: 'BOOST',
      icon: 'flash',
      iconSize: 17,
      color: colors.boost,
      onPress: onBoost,
    },
    {
      key: 'pass',
      label: 'PASS',
      icon: 'close',
      iconSize: 18,
      color: colors.pass,
      onPress: onDislike,
    },
    {
      key: 'superlike',
      label: 'SUPER LIKE',
      icon: 'star',
      iconSize: 17,
      color: colors.superlike,
      onPress: onSuperLike,
    },
    {
      key: 'like',
      label: 'LIKE',
      icon: 'heart',
      iconSize: 17,
      color: colors.like,
      onPress: onLike,
    },
    {
      key: 'superchat',
      label: 'SUPER CHAT',
      icon: 'chatbubble',
      iconSize: 15,
      color: colors.superchat,
      onPress: onSuperchat,
    },
  ];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? 'rgba(27, 26, 34, 0.95)' : 'rgba(18, 18, 24, 0.88)',
          borderColor: isDark ? 'rgba(246, 220, 160, 0.35)' : 'rgba(255, 255, 255, 0.18)',
        },
        style,
      ]}
    >
      {buttons.map((btn) => (
        <TouchableOpacity
          key={btn.key}
          style={styles.buttonItem}
          onPress={btn.onPress}
          activeOpacity={0.75}
        >
          <View
            style={[
              styles.iconCircle,
              {
                borderColor: btn.color,
                backgroundColor: 'rgba(0, 0, 0, 0.45)',
              },
            ]}
          >
            <Icon name={btn.icon} size={btn.iconSize} color={btn.color} />
          </View>
          <Text style={[styles.label, { color: btn.color }]} numberOfLines={1}>
            {btn.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const FONT_LABEL = Platform.OS === 'ios' ? 'System' : 'sans-serif-medium';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 6,
    paddingHorizontal: 6,
    marginHorizontal: 22,
    borderRadius: 24,
    borderWidth: 1.2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  buttonItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 7.5,
    fontWeight: '800',
    fontFamily: FONT_LABEL,
    marginTop: 3,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
});
