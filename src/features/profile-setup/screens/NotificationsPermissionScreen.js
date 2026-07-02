import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Alert} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image as FastImage } from 'expo-image';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../constants/theme';
import { Button } from '../../../components/common/Button';
import { registerForPushNotificationsAsync, openNotificationSettings } from '../../../services/pushNotificationService';
import { useAuthStore } from '../../../store/useAuthStore';
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
      const result = await registerForPushNotificationsAsync();

      if (!result.success) {
        if (result.reason === 'permission_denied_permanently') {
          setEnabling(false);
          Alert.alert(
            'Enable Notifications',
            'You previously denied notification permission. To receive alerts for matches and messages, please enable notifications for Mingley in your device settings.',
            [
              { text: 'Not Now', style: 'cancel', onPress: () => setTimeout(handleFinishOnboarding, 300) },
              { text: 'Open Settings', onPress: () => openNotificationSettings() },
            ]
          );
          return;
        }
        if (result.reason === 'permission_denied') {
          showToast({ title: 'Permission Needed', text: 'Enable notifications in your device settings to receive alerts.', type: 'error' });
        } else {
          showToast({ title: 'Notification Error', text: 'Could not register for notifications. You can try again from Settings.', type: 'error' });
        }
        setEnabling(false);
        setTimeout(handleFinishOnboarding, 1200);
        return;
      }

      showToast({ title: 'Notifications Enabled! 🔔', text: 'You\'ll now receive real notifications from Mingley.', type: 'success' });
      setTimeout(handleFinishOnboarding, 1800);
    } catch (error) {
      console.error("Enable push notification error:", error);
      showToast({ title: 'Notification Error', text: 'Failed to register notifications. Please try again.', type: 'error' });
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