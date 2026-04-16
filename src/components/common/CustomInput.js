import React from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity, Platform, Image } from 'react-native';
import { Controller } from 'react-hook-form';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS, SPACING, TYPOGRAPHY } from '../../constants/theme';

export const CustomInput = ({
  control,
  name,
  rules,
  placeholder,
  keyboardType = 'default',
  showCountryCode = false,
  isGradientBorder = false,
  autoCapitalize,
  error: externalError,
}) => {
  const InputWrapper = ({ children, hasError }) => {
    if (isGradientBorder && !hasError) {
      return (
        <LinearGradient
          colors={['#E94057', '#8A2387']}
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
                <TouchableOpacity style={styles.countryCodeContainer} activeOpacity={0.7}>
                  <Image source={{ uri: 'https://flagcdn.com/w40/in.png' }} style={styles.flagImage} />
                  <Text style={styles.countryCode}>(+91)</Text>
                  <Text style={styles.dropdownArrow}>▼</Text>
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
              autoCapitalize={autoCapitalize}
              maxLength={15}
            />
          </InputWrapper>
          {error && <Text style={styles.errorText}>{error.message}</Text>}
        </View>
      )}
    />
  );
};

const FONT = Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif';

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
  flagImage: {
    width: 24,
    height: 16,
    borderRadius: 2,
    marginRight: 6,
  },
  countryCode: {
    fontSize: 15,
    color: '#333333',
    fontFamily: FONT,
    fontWeight: '500',
  },
  dropdownArrow: {
    fontSize: 8,
    color: '#AAAAAA',
    marginLeft: 5,
    marginTop: 1,
  },
  divider: {
    height: 24,
    width: 1,
    backgroundColor: '#E8E8E8',
    marginHorizontal: SPACING.s,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333333',
    fontFamily: FONT,
    height: '100%',
  },
  errorText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.error,
    marginTop: SPACING.xs,
    marginLeft: SPACING.m,
  },
});
