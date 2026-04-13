import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../constants/theme';
import { CustomInput } from '../../../components/common/CustomInput';
import { GradientButton } from '../../../components/common/GradientButton';

const phoneSchema = yup.object().shape({
  phone: yup
    .string()
    .required('Phone number is required')
    .min(10, 'Must be a valid phone number'),
});

export const PhoneInputScreen = ({ navigation }) => {
  const { control, handleSubmit } = useForm({
    resolver: yupResolver(phoneSchema),
    defaultValues: { phone: '' },
  });

  const onSubmit = (data) => {
    navigation.navigate('OTPVerification', { phone: data.phone });
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboard}
      >
        <View style={styles.content}>
          <Text style={styles.title}>My mobile</Text>
          <Text style={styles.subtitle}>
            Please enter your valid phone number. We will send you a 4-digit code to verify your account.
          </Text>

          <View style={styles.formContainer}>
            <CustomInput
              control={control}
              name="phone"
              placeholder="331 623 8413"
              keyboardType="phone-pad"
              showCountryCode={true}
            />
          </View>

          <GradientButton
            title="Continue"
            onPress={handleSubmit(onSubmit)}
            colors={['#E4415C', '#E4415C']} // Solid pink requested for continue button
            style={styles.button}
          />
        </View>
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
  content: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
    paddingTop: 80,
  },
  title: {
    ...TYPOGRAPHY.h1,
    fontSize: 40,
    color: '#000000',
    marginBottom: SPACING.s,
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    color: '#333333',
    lineHeight: 24,
    marginBottom: 40,
  },
  formContainer: {
    marginBottom: 40,
  },
  button: {
    borderRadius: 16,
  },
});
