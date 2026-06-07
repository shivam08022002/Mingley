import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { TYPOGRAPHY, SPACING } from '../../../constants/theme';
import { useTheme } from '../../../theme/ThemeContext';

export const Chip = ({ label, icon, selected, onPress }) => {
  const { theme, isDark } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          borderColor: theme.actionButtonBorder,
          backgroundColor: isDark ? theme.cardBackground : '#FFFFFF',
        },
        selected && {
          backgroundColor: theme.accent,
          borderColor: theme.accent,
        }
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Icon 
        name={icon} 
        size={16} 
        color={selected ? (isDark ? '#0A0A0A' : '#FFFFFF') : theme.accent} 
        style={styles.icon} 
      />
      <Text style={[
        styles.label,
        { color: theme.textPrimary },
        selected && {
          color: isDark ? '#0A0A0A' : '#FFFFFF',
          fontWeight: 'bold',
        }
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
  },
  icon: {
    marginRight: 6,
  },
  label: {
    fontSize: 13,
    fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif',
  },
});

