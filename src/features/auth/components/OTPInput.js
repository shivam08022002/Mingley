import React, { useRef, useState } from 'react';
import { View, TextInput, StyleSheet, Keyboard } from 'react-native';
import { Controller } from 'react-hook-form';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../constants/theme';

export const OTPInput = ({ control, name }) => {
  const [code, setCode] = useState(['', '', '', '']);
  const inputs = useRef([]);

  return (
    <Controller
      control={control}
      name={name}
      rules={{
        validate: (value) => value?.length === 4 || 'Code must be 4 digits',
      }}
      render={({ field: { onChange, value }, fieldState: { error } }) => {
        const handleOtpChange = (text, index) => {
          const newCode = [...code];
          newCode[index] = text;
          setCode(newCode);
          
          const otpString = newCode.join('');
          onChange(otpString);

          if (text && index < 3) {
            inputs.current[index + 1].focus();
          }
        };

        const handleKeyPress = (e, index) => {
          if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
            inputs.current[index - 1].focus();
          }
        };

        return (
          <View style={styles.container}>
            {code.map((digit, index) => {
              const isFilled = digit.length > 0;
              const isFocused = value?.length === index;

              return (
                <View
                  key={index.toString()}
                  style={[
                    styles.inputContainer,
                    isFilled ? styles.inputFilled : styles.inputEmpty,
                    isFocused && !isFilled ? styles.inputFocused : null,
                  ]}
                >
                  <TextInput
                    ref={(ref) => (inputs.current[index] = ref)}
                    style={[
                      styles.input,
                      isFilled ? styles.textFilled : styles.textEmpty,
                    ]}
                    keyboardType="number-pad"
                    maxLength={1}
                    value={digit}
                    onChangeText={(text) => handleOtpChange(text, index)}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                    placeholder="0"
                    placeholderTextColor="#E8E8E8"
                  />
                </View>
              );
            })}
          </View>
        );
      }}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.m,
    marginVertical: SPACING.xl,
  },
  inputContainer: {
    width: 65,
    height: 65,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  inputFilled: {
    backgroundColor: '#E4415C', // Red color from the image
    borderWidth: 0,
  },
  inputEmpty: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  inputFocused: {
    borderColor: '#E4415C',
  },
  input: {
    ...TYPOGRAPHY.h1,
    fontSize: 32,
    textAlign: 'center',
    width: '100%',
    height: '100%',
  },
  textFilled: {
    color: '#FFFFFF',
  },
  textEmpty: {
    color: '#E4415C',
  },
});
