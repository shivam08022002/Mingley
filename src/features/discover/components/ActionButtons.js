import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { SPACING } from '../../../constants/theme';
import { useTheme } from '../../../theme/ThemeContext';

export const ActionButtons = ({ onDislike, onLike, onSuperchat }) => {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
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
    boxShadow: '0px 6px 12px rgba(0,0,0,0.08)',
    elevation: 4,
  },
  smallButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  largeButton: {
    width: 90,
    height: 90,
    borderRadius: 45,
    boxShadow: '0px 10px 15px rgba(0,0,0,0.35)',
    elevation: 8,
  },
});
