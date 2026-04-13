import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Icon from 'react-native-vector-icons/FontAwesome';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../constants/theme';
import { CustomInput } from '../../../components/common/CustomInput';
import { GradientButton } from '../../../components/common/GradientButton';

const loginSchema = yup.object().shape({
  phone: yup
    .string()
    .required('Phone number is required')
    .min(10, 'Must be a valid phone number'),
});

export const LoginScreen = ({ navigation }) => {
  const { control, handleSubmit } = useForm({
    resolver: yupResolver(loginSchema),
    defaultValues: { phone: '' },
  });

  const onSubmit = (data) => {
    navigation.navigate('OTPVerification', { phone: data.phone });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Light gradient background shown in image */}
      <LinearGradient
        colors={['#F0F8FF', '#FFFFF0']} 
        style={StyleSheet.absoluteFillObject}
      />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboard}
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
              name="phone"
              placeholder="331 623 8413"
              keyboardType="phone-pad"
              showCountryCode={true}
              isGradientBorder={true} // Enable gradient border
            />

            <GradientButton
              title="Submit"
              onPress={handleSubmit(onSubmit)}
              style={styles.button}
              colors={['#FF6B8B', '#8A2387']} // Purple to pink submit button gradient
            />
          </View>

          <View style={styles.orContainer}>
            <View style={styles.divider} />
            <View style={styles.orCircle}>
              <Text style={styles.orText}>OR</Text>
            </View>
            <View style={styles.divider} />
          </View>

          <View style={styles.socialSection}>
            <Text style={styles.socialTitle}>Login using</Text>
            <View style={styles.socialContainer}>
              <TouchableOpacity style={[styles.socialButton, { backgroundColor: '#3b5998' }]}>
                 <Icon name="facebook" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.socialButton, { backgroundColor: '#db4a39' }]}>
                 <Icon name="google" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
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
  keyboard: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
    paddingTop: 80,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    ...TYPOGRAPHY.h1,
    fontSize: 40,
    color: '#2A1856', // Dark purple text
    marginBottom: SPACING.s,
    fontWeight: 'bold',
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    color: '#5b5b5b',
    textAlign: 'center',
    paddingHorizontal: SPACING.l,
    lineHeight: 24,
  },
  formContainer: {
    width: '100%',
    marginBottom: 40,
    gap: SPACING.m,
  },
  button: {
    borderRadius: 28,
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
    width: '100%',
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E8D5D5',
  },
  orCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#E8D5D5',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: -25, // Overlap divider
    zIndex: 1,
  },
  orText: {
    ...TYPOGRAPHY.bodySecondary,
    color: '#2A1856',
    fontWeight: 'bold',
  },
  socialSection: {
    alignItems: 'center',
  },
  socialTitle: {
    ...TYPOGRAPHY.h3,
    color: '#2A1856',
    marginBottom: 20,
  },
  socialContainer: {
    flexDirection: 'row',
    gap: 30,
  },
  socialButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
