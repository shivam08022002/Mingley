import React, { useEffect, useState } from 'react';
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
  otp: yup.string().required('OTP is required').min(4, 'OTP must be at least 4 characters'),
  newPassword: yup.string().required('New password is required').min(6, 'Must be at least 6 characters'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('newPassword'), null], 'Passwords must match')
    .required('Confirm password is required'),
});

export const ResetPasswordScreen = ({ navigation, route }) => {
  const { theme } = useTheme();
  const { identifier, devOtp } = route.params || {};
  const { control, handleSubmit, setValue, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { otp: devOtp || '', newPassword: '', confirmPassword: '' },
  });

  const showToast = useToastStore((s) => s.showToast);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (devOtp) {
      setValue('otp', String(devOtp));
    }
  }, [devOtp, setValue]);

  const onSubmit = async (data) => {
    if (!identifier) {
      showToast('Identification missing. Please try the forgot password process again.', 'error');
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword({
        identifier,
        otp: data.otp,
        newPassword: data.newPassword,
      });
      showToast('Password reset successfully', 'success');
      setTimeout(() => {
        navigation.navigate('Login');
      }, 3000);
    } catch (error) {
      console.error('Reset password error:', error);
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
            <Text style={[styles.title, { color: theme.textPrimary }]}>Reset Password</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Enter the OTP sent to {identifier || 'your device'} and your new password.</Text>
          </View>
 
          <View style={styles.formContainer}>
            <CustomInput
              control={control}
              name="otp"
              placeholder="Enter OTP"
              keyboardType="number-pad"
              error={errors.otp?.message}
            />
 
            <CustomInput
              control={control}
              name="newPassword"
              placeholder="New Password"
              secureTextEntry={true}
              error={errors.newPassword?.message}
            />
 
            <CustomInput
              control={control}
              name="confirmPassword"
              placeholder="Confirm New Password"
              secureTextEntry={true}
              error={errors.confirmPassword?.message}
            />
 
            <Button 
              title="Reset Password" 
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
