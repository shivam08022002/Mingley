import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useForm } from 'react-hook-form';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../constants/theme';
import { OTPInput } from '../components/OTPInput';
import { useAuthStore } from '../../../store/useAuthStore';

export const OTPVerificationScreen = ({ navigation, route }) => {
  const { phone } = route?.params || { phone: '1234567890' };
  const login = useAuthStore(state => state.login);
  const { control, watch } = useForm({
    defaultValues: { otp: '' },
  });

  const otpValue = watch('otp');
  const [timer, setTimer] = useState(42);

  useEffect(() => {
    if (otpValue?.length === 4) {
      // Mock logic to login on completion
      login({ phone, id: 'user-123' });
    }
  }, [otpValue, login, phone]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleResend = () => {
    setTimer(42);
  };

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="chevron-back" size={24} color="#E4415C" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.timerText}>{formatTimer(timer)}</Text>
        <Text style={styles.subtitle}>
          Type the verification code we've sent you
        </Text>

        <OTPInput control={control} name="otp" />

        <TouchableOpacity 
          style={styles.resendContainer}
          onPress={handleResend}
          disabled={timer > 0}
        >
          <Text style={[styles.resendText, timer > 0 && styles.resendDisabled]}>
            Send again
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.m,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
    paddingTop: 60,
    alignItems: 'center',
  },
  timerText: {
    ...TYPOGRAPHY.h1,
    fontSize: 40,
    color: '#000000',
    marginBottom: SPACING.m,
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    color: '#333333',
    textAlign: 'center',
    maxWidth: 200,
    lineHeight: 24,
  },
  resendContainer: {
    marginTop: 'auto',
    marginBottom: 60,
  },
  resendText: {
    ...TYPOGRAPHY.body,
    fontWeight: 'bold',
    color: '#E4415C',
  },
  resendDisabled: {
    opacity: 0.5,
  },
});
