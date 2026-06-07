import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Alert} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image as FastImage } from 'expo-image';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../constants/theme';
import { Button } from '../../../components/common/Button';

import { useAuthStore } from '../../../store/useAuthStore';
import { notificationService } from '../../../services/apiServices';
import { useToastStore } from '../../../store/useToastStore';
import { useTheme } from '../../../theme/ThemeContext';

export const NotificationsPermissionScreen = ({ navigation, route }) => {
  const { theme, isDark } = useTheme();
  const { userData } = route?.params || {};
  const login = useAuthStore(state => state.login);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const [enabling, setEnabling] = React.useState(false);
  const { showToast } = useToastStore();

  const handleFinishOnboarding = () => {
    if (isAuthenticated) {
      navigation.navigate('Home');
    } else {
      // Finalize registration onboarding
      login(userData || { id: 'new-user', name: 'User' }); // The actual user data is already in tokens
    }
  };

  const handleEnableNotifications = async () => {
    setEnabling(true);
    try {
      // 1. Generate realistic mock Firebase FCM token
      const mockToken = `fcm_token_shivam_${Math.random().toString(36).substring(2, 15)}_${Date.now().toString(36)}`;
      
      // Validate that the token is not empty/null before sending
      if (!mockToken || mockToken.trim() === '') {
        showToast({ title: 'Invalid FCM Token', text: 'The device notification token is invalid. Please try again.', type: 'error' });
        setEnabling(false);
        return;
      }

      // 2. Post token to endpoint /v1/notifications/fcm-token
      await notificationService.updateFcmToken(mockToken);
      
      // 3. Send test push notification to endpoint /v1/notifications/test-push
      await notificationService.testPush(
        "Welcome to Mingley! 💖",
        "Awesome! Push notifications are successfully enabled. 🚀 Keep matching!"
      );
      
      // 4. Show success toast then proceed
      showToast({ title: 'Notifications Enabled! 🔔', text: 'A test push notification has been sent to your device.', type: 'success' });
      setTimeout(handleFinishOnboarding, 1800);
    } catch (error) {
      console.error("Enable push notification error:", error);
      // Check if error is related to invalid FCM token
      const errMsg = error?.message || error?.error || (typeof error === 'string' ? error : '');
      const isTokenError = errMsg.toLowerCase().includes('token') || errMsg.toLowerCase().includes('fcm') || errMsg.toLowerCase().includes('invalid');
      if (isTokenError) {
        showToast({ title: 'Invalid FCM Token', text: 'The device notification token is invalid or expired. Please try again.', type: 'error' });
      } else {
        showToast({ title: 'Notification Error', text: errMsg || 'Failed to register notifications. Please try again.', type: 'error' });
      }
    } finally {
      setEnabling(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleFinishOnboarding}>
          <Text style={[styles.skipText, { color: theme.accent }]}>Skip</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.imageContainer}>
          <FastImage 
            source={require('../../../assets/notification-icon.png')} 
            style={styles.image}
            contentFit="contain"
          />
        </View>

        <Text style={[styles.title, { color: theme.textPrimary }]}>Enable notification's</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Get push-notification when you get the match or receive a message.
        </Text>

        <Button
          title="I want to be notified"
          onPress={handleEnableNotifications}
          loading={enabling}
          style={styles.actionButton}
          textStyle={styles.buttonText}
          variant="primary"
        />
      </View>
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'flex-end',
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.m,
  },
  skipText: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif-medium',
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageContainer: {
    width: 200,
    height: 200,
    marginBottom: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif-medium',
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    maxWidth: '80%',
    marginBottom: 60,
    fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif',
  },
  actionButton: {
    borderRadius: 16,
    width: '100%',
    height: 52,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif-medium',
  },
});
