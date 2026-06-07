import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../constants/theme';
import { CustomInput } from '../../../components/common/CustomInput';
import { Button } from '../../../components/common/Button';
import { authService } from '../../../services/apiServices';
import { useToastStore } from '../../../store/useToastStore';
import { useTheme } from '../../../theme/ThemeContext';

const schema = yup.object().shape({
  identifier: yup.string().required('Email or phone number is required'),
});

export const ForgotPasswordScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { identifier: '' },
  });

  const [loading, setLoading] = useState(false);
  const showToast = useToastStore((s) => s.showToast);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await authService.forgotPassword(data.identifier);
      const devOtp = res?.devOtp || res?.data?.devOtp || res?.otp || res?.data?.otp || '';
      navigation.navigate('ResetPassword', { identifier: data.identifier, devOtp });
    } catch (error) {
      console.error('Forgot password error:', error);
      showToast(error.message || 'Something went wrong', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <TouchableOpacity 
          style={[styles.backButton, { borderColor: theme.border, backgroundColor: theme.surface }]} 
          onPress={() => navigation.goBack()}
        >
          <Icon name="chevron-back" size={24} color={theme.primary} />
        </TouchableOpacity>

        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.textPrimary }]}>Forgot Password</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Enter your email or phone number to reset your password.</Text>
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

            <Button 
              title="Continue" 
              onPress={handleSubmit(onSubmit)}
              style={styles.continueButton}
              textStyle={styles.buttonText}
              variant="primary"
              loading={loading}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
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
    paddingTop: 40,
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 34,
    fontWeight: '600',
    marginBottom: 10,
    fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif-medium',
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif',
  },
  formContainer: {
    width: '100%',
  },
  continueButton: {
    borderRadius: 16,
    height: 52,
    marginTop: 30,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif-medium',
  },
});
