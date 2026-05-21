import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm } from 'react-hook-form';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../constants/theme';
import { OTPInput } from '../components/OTPInput';
import { useAuthStore } from '../../../store/useAuthStore';

import { authService } from '../../../services/apiServices';
import { safeStorage } from '../../../services/api';

export const OTPVerificationScreen = ({ navigation, route }) => {
  const { type, identifier, value, password, phone } = route?.params || {};
  const login = useAuthStore(state => state.login);
  const [isLoading, setIsLoading] = useState(false);
  const isVerifying = useRef(false);
  
  // Use identifier if present, otherwise fallback to value (passed from EmailInputScreen)
  const userIdentifier = identifier || value;
  const userPhone = phone || (type === 'phone' ? value : null);

  const { control, watch } = useForm({
    defaultValues: { otp: '' },
  });

  const otpValue = watch('otp');
  const [timer, setTimer] = useState(42);

  useEffect(() => {
    const verifyAndLogin = async () => {
      if (otpValue?.length === 4 && !isVerifying.current) {
        isVerifying.current = true;
        setIsLoading(true);
        try {
          if (type === 'login') {
            const response = await authService.login({
              identifier: userIdentifier,
              password,
              twoFactorCode: otpValue,
              fcmToken: 'mock-device-token',
            });

            // Handle different possible response structures
            const userData = response.user || response.data?.user || (response.id ? response : null);
            const tokens = response.tokens || response.data?.tokens || {
              accessToken: response.accessToken || response.data?.accessToken,
              refreshToken: response.refreshToken || response.data?.refreshToken
            };

            if (userData) {
              if (tokens.accessToken) {
                await safeStorage.setItem('accessToken', tokens.accessToken);
              }
              if (tokens.refreshToken) {
                await safeStorage.setItem('refreshToken', tokens.refreshToken);
              }
              login(userData);
            } else {
              // Fallback: if we got a 200 but couldn't find user data, 
              // at least try to login with mock data or alert
              console.warn('Login successful but no user data found in response:', response);
              login({ identifier: userIdentifier, id: 'unknown-id' });
            }
          } else {
              // For registration flows (email/phone), we treat OTP as a dummy verification step
              // and continue to the next page (ProfileDetails)
              setIsLoading(false);
              navigation.navigate('ProfileDetails');
            }
        } catch (error) {
          console.error('OTP Verification/Login error:', error);
          Alert.alert('Verification Failed', error.message || 'The OTP entered is incorrect.');
          isVerifying.current = false;
        } finally {
          setIsLoading(false);
        }
      }
    };

    verifyAndLogin();
  }, [otpValue, login, type, userIdentifier, password, userPhone]);

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
          <Icon name="chevron-back" size={24} color="#E94057" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.timerText}>{formatTimer(timer)}</Text>
        <Text style={styles.subtitle}>
          Type the verification code we've sent to {userIdentifier}
        </Text>

        <OTPInput control={control} name="otp" />

        {isLoading && (
          <ActivityIndicator 
            size="large" 
            color="#E94057" 
            style={{ marginTop: 20 }} 
          />
        )}

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
    fontSize: 40,
    fontWeight: 'bold',
    color: '#000000',
    fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif-medium',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#333333',
    textAlign: 'center',
    maxWidth: 200,
    lineHeight: 24,
    fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif',
  },
  resendContainer: {
    marginTop: 'auto',
    marginBottom: 60,
  },
  resendText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E94057',
    fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif-medium',
  },
  resendDisabled: {
    opacity: 0.5,
  },
});
