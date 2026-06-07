import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, Platform} from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../constants/theme';
import { useTheme } from '../../../theme/ThemeContext';

export const CardInput = ({ label, value, onChangeText, placeholder }) => {
  const [isFocused, setIsFocused] = useState(false);
  const { theme, isDark } = useTheme();

  return (
    <View style={styles.container}>
      <View style={[
        styles.inputWrapper,
        {
          backgroundColor: theme.cardBackground,
          borderColor: isFocused
            ? theme.accent
            : (isDark ? theme.cardBorder : '#E8E8E8')
        }
      ]}>
        <View style={[styles.labelContainer, { backgroundColor: theme.cardBackground }]}>
          <Text style={styles.label}>{label}</Text>
        </View>
        <TextInput
          style={[styles.input, { color: theme.textPrimary }]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#A0A0A0"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.s,
    width: '100%',
  },
  inputWrapper: {
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 16,
    height: 60,
    justifyContent: 'center',
    paddingHorizontal: SPACING.m,
    backgroundColor: '#FFFFFF',
    marginTop: 10, // Make room for floating label
  },
  inputFocused: {
    borderColor: '#E94057',
  },
  labelContainer: {
    position: 'absolute',
    top: -10,
    left: 20,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 4,
    zIndex: 1,
  },
  label: {
    fontSize: 12,
    color: '#A0A0A0',
    fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif',
  },
  input: {
    fontSize: 16,
    color: '#000000',
    fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif',
    height: '100%',
    paddingVertical: 0,
  },
});
