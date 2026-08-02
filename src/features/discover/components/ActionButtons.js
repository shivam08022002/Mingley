import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { SPACING } from '../../../constants/theme';
import { useTheme } from '../../../theme/ThemeContext';

export const ActionButtons = ({ onDislike, onLike, onSuperchat, style }) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, style]}>
      {/* Pass / X button */}
      <TouchableOpacity
        style={[
          styles.button,
          styles.smallButton,
          {
            backgroundColor: theme.cardBackground,
            borderWidth: 1.5,
            borderColor: theme.isDark ? theme.accent : theme.actionButtonBorder
          },
        ]}
        onPress={onDislike}
        activeOpacity={0.85}
      >
        <Icon name="close" size={32} color={theme.isDark ? theme.accent : '#FF6B6B'} />
      </TouchableOpacity>

      {/* Heart / Like button */}
      <TouchableOpacity
        style={[styles.button, styles.largeButton, { backgroundColor: theme.likeButton }]}
        onPress={onLike}
        activeOpacity={0.85}
      >
        <Icon name="heart" size={44} color="#FFFFFF" />
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.button,
          styles.smallButton,
          {
            backgroundColor: theme.cardBackground,
            borderWidth: 1.5,
            borderColor: theme.isDark ? theme.accent : theme.actionButtonBorder
          },
        ]}
        onPress={onSuperchat}
        activeOpacity={0.85}
      >
        <Icon name="flash" size={32} color={theme.isDark ? theme.accent : '#7C3AED'} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    marginTop: 14,
    marginBottom: 20,
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 6,
  },
  smallButton: {
    width: 66,
    height: 66,
    borderRadius: 33,
  },
  largeButton: {
    width: 84,
    height: 84,
    borderRadius: 42,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.28,
    shadowRadius: 14,
    elevation: 10,
  },
});
