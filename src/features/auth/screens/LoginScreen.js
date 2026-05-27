import React from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Icon from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../constants/theme';
import { CustomInput } from '../../../components/common/CustomInput';
import { Button } from '../../../components/common/Button';

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
  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(loginSchema),
    defaultValues: { identifier: '', password: '' },
  });

  const onSubmit = async (data) => {
    // Instead of logging in directly, we navigate to the OTP screen.
    // We pass the login data to the OTP screen so it can perform the final login with the OTP.
    navigation.navigate('OTPVerification', { 
      type: 'login', 
      identifier: data.identifier, 
      password: data.password 
    });
  };
  return (
    <SafeAreaView style={styles.container}>
      {/* Back button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
        activeOpacity={0.7}
      >
        <Icon name="chevron-back" size={24} color="#000" />
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
              <Text style={styles.title}>Login</Text>
              <Text style={styles.subtitle}>
                Please enter your valid phone number. We will send you a 4-digit code to verify
              </Text>
            </View>

            <View style={styles.formContainer}>
              <CustomInput
                control={control}
                name="identifier"
                placeholder="Email or phone number"
                keyboardType="default"
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
                <Text style={styles.forgotPasswordText}>Forgot password?</Text>
              </TouchableOpacity>

              <Button
                title="Submit"
                onPress={handleSubmit(onSubmit)}
                style={styles.button}
                textStyle={styles.buttonText}
                variant="solid"
              />
            </View>

            <View style={styles.footerContainer}>
              <Text style={styles.footerText}>
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
    backgroundColor: '#FFFFFF',
  },
  keyboard: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  backButton: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.m,
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
    color: '#000000',
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif-medium',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#5b5b5b',
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
    color: '#E94057',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif-medium',
  },
  button: {
    borderRadius: 16,
    height: 52,
    backgroundColor: '#E94057',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#FFFFFF',
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
    color: '#8A8A8F',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif',
  },
});
