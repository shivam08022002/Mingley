import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../constants/theme';
import { CustomInput } from '../../../components/common/CustomInput';
import { GradientButton } from '../../../components/common/GradientButton';

const schema = yup.object().shape({
  email: yup.string().email('Invalid email format').required('Email is required'),
});

export const EmailInputScreen = ({ navigation }) => {
  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = (data) => {
    // Navigate to OTP or Password screen based on flow
    navigation.navigate('OTPVerification', { type: 'email', value: data.email });
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={24} color={COLORS.text} />
        </TouchableOpacity>

        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Continue with Email</Text>
            <Text style={styles.subtitle}>Enter your email address to receive a verification code.</Text>
          </View>

          <View style={styles.formContainer}>
            <CustomInput
              control={control}
              name="email"
              placeholder="Email address"
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email?.message}
            />

            <GradientButton 
              title="Continue" 
              onPress={handleSubmit(onSubmit)}
              style={styles.continueButton}
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
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  backButton: {
    padding: SPACING.m,
  },
  content: {
    flex: 1,
    padding: SPACING.xl,
    justifyContent: 'center',
  },
  header: {
    marginBottom: SPACING.xxl,
  },
  title: {
    ...TYPOGRAPHY.h1,
    marginBottom: SPACING.s,
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
  formContainer: {
    gap: SPACING.l,
  },
  continueButton: {
    marginTop: SPACING.xl,
  },
});
