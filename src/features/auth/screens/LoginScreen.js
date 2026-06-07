import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Icon from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../constants/theme';
import { CustomInput } from '../../../components/common/CustomInput';
import { Button } from '../../../components/common/Button';
import { useTheme } from '../../../theme/ThemeContext';

import { authService } from '../../../services/apiServices';
import { useAuthStore } from '../../../store/useAuthStore';
import { safeStorage } from '../../../services/api';

const loginSchema = yup.object().shape({
  identifier: yup
    .string()
    .required('Email or phone number is required'),
  password: yup.string().required('Password is required'),
});

export const LoginScreen = ({ navigation }) => {
  const login = useAuthStore(state => state.login);
  const { theme, isDark } = useTheme();
  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(loginSchema),
    defaultValues: { identifier: '', password: '' },
  });

  const onSubmit = async (data) => {
    // If the identifier looks like a phone number (all digits, 10 chars), prefix +91
    const isPhone = /^[0-9]{10}$/.test(data.identifier.trim());
    const finalIdentifier = isPhone ? `+91${data.identifier.trim()}` : data.identifier.trim();

    navigation.navigate('OTPVerification', {
      type: 'login',
      identifier: finalIdentifier,
      password: data.password
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Back button */}
      <TouchableOpacity
        style={[styles.backButton, { borderColor: theme.border, backgroundColor: theme.surface }]}
        onPress={() => navigation.goBack()}
        activeOpacity={0.7}
      >
        <Icon name="chevron-back" size={24} color={theme.primary} />
      </TouchableOpacity>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboard}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={[styles.title, { color: theme.textPrimary }]}>Login</Text>
              <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                Please enter your registered email or phone number.
              </Text>
              <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                We will send you a 4-digit code to verify
              </Text>
            </View>

            <View style={styles.formContainer}>
              <CustomInput
                control={control}
                name="identifier"
                placeholder="Email or phone number"
                keyboardType="default"
                showCountryCode={false}
                autoCapitalize="none"
                error={errors.identifier?.message}
              />

              <CustomInput
                control={control}
                name="password"
                placeholder="Password"
                secureTextEntry={true}
                error={errors.password?.message}
              />

              <TouchableOpacity
                style={styles.forgotPassword}
                onPress={() => navigation.navigate('ForgotPassword')}
              >
                <Text style={[styles.forgotPasswordText, { color: theme.accent }]}>Forgot password?</Text>
              </TouchableOpacity>

              <Button
                title="Submit"
                onPress={handleSubmit(onSubmit)}
                style={styles.button}
                textStyle={styles.buttonText}
                variant="primary"
              />
            </View>

            <View style={styles.footerContainer}>
              <Text style={[styles.footerText, { color: theme.textSecondary }]}>
                By signing in, you agree to our Terms of Service & Privacy Policy
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboard: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.xl,
    marginTop: SPACING.s,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
    paddingTop: 30,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 40,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif-medium',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 10,
    lineHeight: 24,
    fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif',
  },
  formContainer: {
    width: '100%',
    marginBottom: 40,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: 10,
    marginBottom: 20,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif-medium',
  },
  button: {
    borderRadius: 16,
    height: 52,
    marginTop: 20,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif-medium',
  },
  footerContainer: {
    marginTop: 40,
    marginBottom: 20,
    alignItems: 'center',
    paddingHorizontal: 20,
    width: '100%',
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif',
  },
});
