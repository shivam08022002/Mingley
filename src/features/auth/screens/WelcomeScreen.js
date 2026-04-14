import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../constants/theme';
import { Button } from '../../../components/common/Button';

export const WelcomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.gradientStart, COLORS.gradientEnd]}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Mingley</Text>
            <Text style={styles.subtitle}>Find your perfect match</Text>
          </View>
          
          <View style={styles.buttonContainer}>
            <Button
              title="Create Account"
              onPress={() => {}}
              style={styles.button}
              textStyle={styles.buttonTextPrimary}
              variant="custom" // Not primary to avoid gradient within gradient
            />
            <Button
              title="Sign In"
              onPress={() => navigation.navigate('Login')}
              variant="outline"
              style={styles.signInButton}
              textStyle={styles.signInText}
            />
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: SPACING.xl,
    justifyContent: 'space-between',
  },
  headerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    ...TYPOGRAPHY.h1,
    fontSize: 48,
    color: COLORS.white,
    marginBottom: SPACING.s,
  },
  subtitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.white,
    opacity: 0.9,
  },
  buttonContainer: {
    width: '100%',
    paddingBottom: SPACING.xl,
  },
  button: {
    backgroundColor: COLORS.white,
  },
  buttonTextPrimary: {
    color: COLORS.primary,
  },
  signInButton: {
    borderColor: COLORS.white,
    marginTop: SPACING.m,
  },
  signInText: {
    color: COLORS.white,
  },
});
