import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Alert} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image as FastImage } from 'expo-image';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../constants/theme';
import { Button } from '../../../components/common/Button';

import { useAuthStore } from '../../../store/useAuthStore';
import { notificationService } from '../../../services/apiServices';

export const NotificationsPermissionScreen = ({ navigation, route }) => {
  const { userData } = route?.params || {};
  const login = useAuthStore(state => state.login);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const [enabling, setEnabling] = React.useState(false);

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
      
      // 2. Post token to endpoint /v1/notifications/fcm-token
      await notificationService.updateFcmToken(mockToken);
      
      // 3. Send test push notification to endpoint /v1/notifications/test-push
      await notificationService.testPush(
        "Welcome to Mingley! 💖",
        "Awesome! Push notifications are successfully enabled. 🚀 Keep matching!"
      );
      
      // 4. Alert user beautifully
      Alert.alert(
        "Notifications Enabled! 🔔",
        "Success! A confirmation test push notification has been sent.",
        [
          { 
            text: "Let's Go! 🚀", 
            onPress: handleFinishOnboarding 
          }
        ]
      );
    } catch (error) {
      console.error("Enable push notification error:", error);
      Alert.alert(
        "Notification Permission Error",
        error.message || "Failed to register notifications. Please try again.",
        [
          { text: "Try Again", style: "default" },
          { text: "Skip for now", onPress: handleFinishOnboarding, style: "cancel" }
        ]
      );
    } finally {
      setEnabling(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleFinishOnboarding}>
          <Text style={styles.skipText}>Skip</Text>
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

        <Text style={styles.title}>Enable notification's</Text>
        <Text style={styles.subtitle}>
          Get push-notification when you get the match or receive a message.
        </Text>

        <Button
          title="I want to be notified"
          onPress={handleEnableNotifications}
          loading={enabling}
          style={styles.actionButton}
          textStyle={styles.buttonText}
          variant="solid"
        />
      </View>
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    alignItems: 'flex-end',
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.m,
  },
  skipText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E94057',
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
    color: '#000000',
    marginBottom: 10,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif-medium',
  },
  subtitle: {
    fontSize: 16,
    color: '#5b5b5b',
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
    backgroundColor: '#E94057',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif-medium',
  },
});
