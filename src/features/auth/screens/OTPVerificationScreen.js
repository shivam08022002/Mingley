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
  const hasCheckedVerification = useRef(false);

  // Use identifier if present, otherwise fallback to value (passed from EmailInputScreen)
  const userIdentifier = identifier || value;
  const userPhone = phone || (type === 'phone' ? value : null);

  const { control, watch, setValue } = useForm({
    defaultValues: { otp: '' },
  });

  const otpValue = watch('otp');
  const [timer, setTimer] = useState(42);

  // DEV/TESTING CONVENIENCE: for login attempts on unverified accounts,
  // the backend returns the real OTP directly (devOtp) since there's no
  // SMS/email provider wired up yet. This checks for that once on mount
  // and auto-fills the OTP input so testing doesn't require checking
  // server logs manually. REMOVE THIS before shipping real SMS/email OTP —
  // it only works because the backend intentionally exposes devOtp in
  // non-production environments.
  useEffect(() => {
    const routeOtp = route?.params?.devOtp;
    if (routeOtp && type === 'login' && !hasCheckedVerification.current) {
      hasCheckedVerification.current = true;
      console.log('[DEV] Auto-filling OTP from route params:', routeOtp);
      setValue('otp', String(routeOtp));
    }
  }, [route?.params?.devOtp]);

  useEffect(() => {
    const verifyAndLogin = async () => {
      if (otpValue?.length === 6 && !isVerifying.current) {
        isVerifying.current = true;
        setIsLoading(true);
        try {
          if (type === 'login') {
            const targetUserId = route?.params?.userId;
            if (!targetUserId) {
              throw new Error('User ID is missing. Please restart the login process.');
            }

            const verifyResponse = await authService.verifyOtp(
              targetUserId,
              otpValue,
              'registration'
            );
            const verifyData = verifyResponse?.data || verifyResponse;
            const accessToken = verifyData?.accessToken || verifyData?.data?.accessToken;
            const refreshToken = verifyData?.refreshToken || verifyData?.data?.refreshToken;
            const userObj = verifyData?.user || verifyData?.data?.user;

            if (!accessToken) {
              throw new Error('OTP verification did not return a valid session. Please try again.');
            }

            await safeStorage.setItem('accessToken', accessToken);
            if (refreshToken) {
              await safeStorage.setItem('refreshToken', refreshToken);
            }
            navigation.navigate('ContactsPermission', { userData: userObj });
          } else {
            // For registration flows (email/phone), we treat OTP as a dummy verification step
            // and continue to the next page (ProfileDetails)
            setIsLoading(false);
            navigation.navigate('ProfileDetails');
          }
        } catch (error) {
          console.error('OTP Verification/Login error:', error);
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
  }, [otpValue]);

  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => setTimer(t => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={28} color={theme.textPrimary} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>Verify OTP</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Enter the 6-digit code sent to {userIdentifier}
        </Text>

        <OTPInput control={control} name="otp" />

        {isLoading && <ActivityIndicator size="large" color={theme.accent} style={{ marginTop: 20 }} />}

        <Text style={[styles.timerText, { color: theme.textSecondary }]}>
          {timer > 0 ? `Resend code in ${timer}s` : 'Resend code'}
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: SPACING.xl, paddingTop: SPACING.m },
  content: { flex: 1, paddingHorizontal: SPACING.xl, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  subtitle: { fontSize: 16, textAlign: 'center', marginBottom: 40 },
  timerText: { marginTop: 24, fontSize: 14 },
});