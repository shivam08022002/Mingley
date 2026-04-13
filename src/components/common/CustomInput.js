import React from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Controller } from 'react-hook-form';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS, SPACING, TYPOGRAPHY } from '../../constants/theme';
import FastImage from 'react-native-fast-image';

export const CustomInput = ({
  control,
  name,
  rules,
  placeholder,
  keyboardType = 'default',
  showCountryCode = false,
  isGradientBorder = false,
}) => {
  const InputWrapper = ({ children, hasError }) => {
    if (isGradientBorder && !hasError) {
      return (
        <LinearGradient
          colors={['#FF6B8B', '#8A2387']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientBorder}
        >
          <View style={styles.innerContainer}>{children}</View>
        </LinearGradient>
      );
    }
    return (
      <View style={[styles.container, hasError && styles.errorContainer]}>
        {children}
      </View>
    );
  };

  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
        <View style={styles.wrapper}>
          <InputWrapper hasError={!!error}>
            {showCountryCode && (
              <>
                <TouchableOpacity style={styles.countryCodeContainer}>
                  <Text style={styles.flag}>🇮🇳</Text>
                  <Text style={styles.countryCode}>(+91) v</Text>
                </TouchableOpacity>
                <View style={styles.divider} />
              </>
            )}
            <TextInput
              style={styles.input}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              placeholder={placeholder}
              placeholderTextColor="#A0A0A0"
              keyboardType={keyboardType}
              maxLength={15}
            />
          </InputWrapper>
          {error && <Text style={styles.errorText}>{error.message}</Text>}
        </View>
      )}
    />
  );
};

const baseContainerStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  height: 56,
  borderRadius: 28,
  paddingHorizontal: SPACING.m,
  backgroundColor: '#FFFFFF',
};

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: SPACING.s,
    width: '100%',
  },
  gradientBorder: {
    padding: 1.5,
    borderRadius: 29.5,
    width: '100%',
  },
  innerContainer: {
    ...baseContainerStyle,
  },
  container: {
    ...baseContainerStyle,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  errorContainer: {
    borderColor: COLORS.error,
  },
  countryCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flag: {
    fontSize: 18,
    marginRight: 4,
  },
  countryCode: {
    ...TYPOGRAPHY.body,
    color: '#333333',
  },
  divider: {
    height: 24,
    width: 1,
    backgroundColor: '#E8E8E8',
    marginHorizontal: SPACING.s,
  },
  input: {
    flex: 1,
    ...TYPOGRAPHY.body,
    color: '#333333',
    height: '100%',
  },
  errorText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.error,
    marginTop: SPACING.xs,
    marginLeft: SPACING.m,
  },
});
