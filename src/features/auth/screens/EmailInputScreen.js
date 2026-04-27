import React from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../constants/theme';
import { CustomInput } from '../../../components/common/CustomInput';
import { Button } from '../../../components/common/Button';

const schema = yup.object().shape({
  email: yup.string().email('Invalid email format').required('Email is required'),
});

export const EmailInputScreen = ({ navigation }) => {
  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = (data) => {
    navigation.navigate('OTPVerification', { type: 'email', value: data.email });
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={24} color="#000" />
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

            <Button 
              title="Continue" 
              onPress={handleSubmit(onSubmit)}
              style={styles.continueButton}
              textStyle={styles.buttonText}
              variant="solid"
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
    backgroundColor: '#FFFFFF',
  },
  keyboardView: {
    flex: 1,
  },
  backButton: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.m,
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
    color: '#000000',
    marginBottom: 10,
    fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif-medium',
  },
  subtitle: {
    fontSize: 16,
    color: '#5b5b5b',
    lineHeight: 24,
    fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif',
  },
  formContainer: {
    width: '100%',
  },
  continueButton: {
    borderRadius: 16,
    height: 52,
    backgroundColor: '#E94057',
    marginTop: 30,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif-medium',
  },
});
