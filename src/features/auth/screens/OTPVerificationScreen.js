import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm } from 'react-hook-form';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../constants/theme';
import { OTPInput } from '../components/OTPInput';
import { useAuthStore } from '../../../store/useAuthStore';
import { useTheme } from '../../../theme/ThemeContext';

import { authService } from '../../../services/apiServices';
import { safeStorage } from '../../../services/api';

export const OTPVerificationScreen = ({ navigation, route }) => {
  const { theme } = useTheme();
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
              navigation.navigate('ContactsPermission', { userData });
            } else {
              // Fallback: if we got a 200 but couldn't find user data, 
              // at least try to login with mock data or alert
              console.warn('Login successful but no user data found in response:', response);
              navigation.navigate('ContactsPermission', { 
                userData: { identifier: userIdentifier, id: 'unknown-id' } 
              });
            }
          } else {
              // For registration flows (email/phone), we treat OTP as a dummy verification step
              // and continue to the next page (ProfileDetails)
              setIsLoading(false);
              navigation.navigate('ProfileDetails');
            }
        } catch (error) {
          console.error('OTP Verification/Login error:', error);
          // Extract a human-readable message from the API error response
          const errMsg =
            error?.message ||
            error?.error ||
            (typeof error === 'string' ? error : null) ||
            'Invalid credentials. Please check your details and try again.';
          Alert.alert('Login Failed', errMsg);
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
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={[styles.backButton, { borderColor: theme.border, backgroundColor: theme.surface }]}
          onPress={() => navigation.goBack()}
        >
          <Icon name="chevron-back" size={24} color={theme.isDark ? theme.accent : theme.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={[styles.timerText, { color: theme.textPrimary }]}>{formatTimer(timer)}</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Type the verification code we've sent to {userIdentifier}
        </Text>

        <OTPInput control={control} name="otp" />

        {isLoading && (
          <ActivityIndicator 
            size="large" 
            color={theme.isDark ? theme.accent : theme.primary} 
            style={{ marginTop: 20 }} 
          />
        )}

        <TouchableOpacity 
          style={styles.resendContainer}
          onPress={handleResend}
          disabled={timer > 0}
        >
          <Text style={[styles.resendText, { color: theme.isDark ? theme.accent : theme.primary }, timer > 0 && styles.resendDisabled]}>
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
    fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif-medium',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
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
    fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif-medium',
  },
  resendDisabled: {
    opacity: 0.5,
  },
});
