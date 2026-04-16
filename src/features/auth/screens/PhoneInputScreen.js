import React from 'react';
import {
  View, Text, StyleSheet, KeyboardAvoidingView,
  Platform, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../constants/theme';
import { CustomInput } from '../../../components/common/CustomInput';
import { GradientButton } from '../../../components/common/GradientButton';

const FONT = Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif';
const FONT_BOLD = Platform.OS === 'ios' ? 'AvenirNext-Bold' : 'sans-serif-medium';

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
        {/* Back button */}
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Icon name="chevron-back" size={22} color="#E94057" />
        </TouchableOpacity>

        <View style={styles.content}>
          <Text style={styles.title}>My mobile</Text>
          <Text style={styles.subtitle}>
            Please enter your valid phone number. We will{'\n'}send you a 4-digit code to verify your account.
          </Text>

          <View style={styles.formContainer}>
            <CustomInput
              control={control}
              name="phone"
              placeholder="Enter phone number"
              keyboardType="phone-pad"
              showCountryCode={true}
              isGradientBorder={true}
            />
          </View>

          <GradientButton
            title="Continue"
            onPress={handleSubmit(onSubmit)}
            colors={['#E94057', '#E94057']}
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
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
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
  title: {
    fontSize: 34,
    fontWeight: '600',
    color: '#1A1A2E',
    fontFamily: FONT,
    marginBottom: SPACING.s,
  },
  subtitle: {
    fontSize: 14,
    color: '#7D7D7D',
    lineHeight: 22,
    fontFamily: FONT,
    marginBottom: 36,
  },
  formContainer: {
    marginBottom: 36,
  },
  button: {
    borderRadius: 16,
  },
});
