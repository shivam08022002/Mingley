import React from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../constants/theme';
import { CustomInput } from '../../../components/common/CustomInput';
import { Button } from '../../../components/common/Button';

const loginSchema = yup.object().shape({
  phone: yup
    .string()
    .required('Phone number is required')
    .min(10, 'Must be a valid phone number')
    .max(10, 'Must be a valid phone number'),
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
              placeholder="XXX XXX XXXX"
              keyboardType="phone-pad"
              showCountryCode={true}
              isGradientBorder={false}
            />

            <Button
              title="Submit"
              onPress={handleSubmit(onSubmit)}
              style={styles.button}
              textStyle={styles.buttonText}
              variant="solid"
            />
          </View>

          <View style={styles.orContainer}>
            <View style={styles.divider} />
            <Text style={styles.orText}>OR</Text>
            <View style={styles.divider} />
          </View>

          <View style={styles.socialSection}>
            <Text style={styles.socialTitle}>Login using</Text>
            <View style={styles.socialContainer}>
              <TouchableOpacity style={styles.socialButton}>
                 <Icon name="logo-google" size={26} color="#000" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton}>
                 <Icon name="logo-apple" size={26} color="#000" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton}>
                 <Icon name="logo-instagram" size={26} color="#000" />
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
    backgroundColor: '#FFFFFF',
  },
  keyboard: {
    flex: 1,
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
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
    width: '100%',
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E8E8E8',
  },
  orText: {
    marginHorizontal: 15,
    color: '#000000',
    fontSize: 14,
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif',
  },
  socialSection: {
    alignItems: 'center',
    width: '100%',
  },
  socialTitle: {
    fontSize: 16,
    color: '#5b5b5b',
    marginBottom: 25,
    fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif',
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  socialButton: {
    width: 65,
    height: 55,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});
