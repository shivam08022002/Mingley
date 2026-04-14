import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../constants/theme';

export const SignupOptionsScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Icon name="chevron-back" size={24} color="#000" />
      </TouchableOpacity>
      
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <FastImage
            source={require('../../../assets/signup-logo.png')}
            style={styles.logo}
            resizeMode={FastImage.resizeMode.contain}
          />
        </View>

        <Text style={styles.title}>Sign up to continue</Text>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => navigation.navigate('EmailInput')}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>Continue with email</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('PhoneInput')}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonText}>Use phone number</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.orContainer}>
          <View style={styles.divider} />
          <Text style={styles.orText}>or sign up with</Text>
          <View style={styles.divider} />
        </View>

        <View style={styles.socialContainer}>
          <TouchableOpacity style={styles.socialButton}>
             <Icon name="logo-facebook" size={24} color="#E4415C" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialButton}>
             <Icon name="logo-google" size={24} color="#E4415C" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialButton}>
             <Icon name="logo-apple" size={24} color="#E4415C" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity>
          <Text style={styles.footerLink}>Terms of use</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text style={styles.footerLink}>Privacy Policy</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    paddingLeft: SPACING.xl,
    paddingTop: SPACING.m,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
    paddingTop: 40,
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 100,
    height: 100,
  },
  title: {
    ...TYPOGRAPHY.h2,
    color: '#000000',
    marginBottom: 40,
  },
  buttonsContainer: {
    width: '100%',
    gap: SPACING.m,
    marginBottom: 40,
  },
  primaryButton: {
    backgroundColor: '#E4415C',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    ...TYPOGRAPHY.body,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonText: {
    ...TYPOGRAPHY.body,
    fontWeight: 'bold',
    color: '#E4415C',
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    width: '100%',
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#F0F0F0',
  },
  orText: {
    ...TYPOGRAPHY.bodySecondary,
    marginHorizontal: SPACING.m,
    color: '#000000',
  },
  socialContainer: {
    flexDirection: 'row',
    gap: SPACING.m,
  },
  socialButton: {
    width: 65,
    height: 65,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.xl,
    paddingBottom: 40,
  },
  footerLink: {
    ...TYPOGRAPHY.bodySecondary,
    color: '#E4415C',
  },
});
