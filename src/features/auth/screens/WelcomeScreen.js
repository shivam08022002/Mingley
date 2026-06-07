import React from 'react';
import { View, Text, StyleSheet, Platform} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../constants/theme';
import { Button } from '../../../components/common/Button';
import { useTheme } from '../../../theme/ThemeContext';

export const WelcomeScreen = ({ navigation }) => {
  const { isDark, theme } = useTheme();

  return (
    <View style={styles.container}>
      {isDark ? (
        <View style={[styles.gradient, { backgroundColor: theme.background }]}>
          <View style={styles.content}>
            <View style={styles.headerContainer}>
              <Text style={[styles.title, { color: theme.accent }]}>Mingley</Text>
              <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Find your perfect match</Text>
            </View>
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity onPress={() => navigation.navigate('SignupOptions')} activeOpacity={0.8}>
                <LinearGradient
                  colors={['#F6DCA0', '#D4AF37']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.button}
                >
                  <Text style={[styles.buttonTextPrimary, { color: '#0A0A0A' }]}>Create Account</Text>
                </LinearGradient>
              </TouchableOpacity>
              <Button
                title="Sign In"
                onPress={() => navigation.navigate('Login')}
                variant="outline"
                style={[styles.signInButton, { borderColor: theme.accent }]}
                textStyle={[styles.signInText, { color: theme.accent }]}
              />
            </View>
          </View>
        </View>
      ) : (
        <LinearGradient
          colors={['#E94057', '#8A2387']}
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
                variant="custom"
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
      )}
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
    paddingHorizontal: SPACING.xl,
    paddingTop: 100,
    paddingBottom: 60,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 52,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif-medium',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif',
    opacity: 0.9,
  },
  buttonContainer: {
    width: '100%',
  },
  button: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonTextPrimary: {
    color: '#E94057',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif-medium',
  },
  signInButton: {
    borderColor: '#FFFFFF',
    borderWidth: 1.5,
    borderRadius: 16,
    height: 56,
    marginTop: 16,
    backgroundColor: 'transparent',
  },
  signInText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif-medium',
  },
});
