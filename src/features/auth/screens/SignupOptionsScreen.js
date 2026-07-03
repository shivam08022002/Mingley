import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image as FastImage } from 'expo-image';
import Icon from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../constants/theme';
import { useTheme } from '../../../theme/ThemeContext';

export const SignupOptionsScreen = ({ navigation }) => {
  const { theme, isDark } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Icon name="chevron-back" size={24} color={theme.textPrimary} />
      </TouchableOpacity>
      
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <FastImage
            source={require('../../../assets/signup-logo.png')}
            style={styles.logo}
            contentFit="contain"
          />
        </View>

        <Text style={[styles.title, { color: theme.textPrimary }]}>Sign up to continue</Text>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity 
            onPress={() => navigation.navigate('EmailInput')}
            activeOpacity={0.8}
            style={{ width: '100%', marginBottom: 16 }}
          >
            {isDark ? (
              <LinearGradient
                colors={['#F6DCA0', '#D4AF37']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.primaryButton}
              >
                <Text style={[styles.primaryButtonText, { color: '#0A0A0A' }]}>Continue with email</Text>
              </LinearGradient>
            ) : (
              <View style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>Continue with email</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.secondaryButton, { 
              backgroundColor: isDark ? 'transparent' : '#FFFFFF', 
              borderColor: isDark ? theme.accent : '#F0F0F0',
              borderWidth: 1.5
            }]}
            onPress={() => navigation.navigate('PhoneInput')}
            activeOpacity={0.8}
          >
            <Text style={[styles.secondaryButtonText, { color: theme.accent }]}>Use phone number</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.disclaimerContainer}>
          <Text style={[styles.disclaimerText, { color: theme.textSecondary }]}>
            By signing up, you agree to our{' '}
            <Text style={[styles.disclaimerLink, { color: theme.accent }]}>Terms of Use</Text>
            {' '}and{' '}
            <Text style={[styles.disclaimerLink, { color: theme.accent }]}>Privacy Policy</Text>.
          </Text>
        </View>
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
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.m,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
    paddingTop: 30,
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
    fontSize: 24,
    color: '#000000',
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif-medium',
    marginBottom: 40,
  },
  buttonsContainer: {
    width: '100%',
    marginBottom: 40,
  },
  primaryButton: {
    backgroundColor: '#E94057',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif-medium',
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
    fontSize: 18,
    fontWeight: '600',
    color: '#E94057',
    fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif-medium',
  },
  disclaimerContainer: {
    width: '100%',
    paddingHorizontal: 20,
    marginTop: 20,
    alignItems: 'center',
  },
  disclaimerText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif',
  },
  disclaimerLink: {
    fontWeight: '600',
  },
});
