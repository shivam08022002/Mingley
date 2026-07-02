import * as Notifications from 'expo-notifications';
import { Platform, Linking } from 'react-native';
import { notificationService } from './apiServices';

export async function registerForPushNotificationsAsync() {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status, canAskAgain } = await Notifications.requestPermissionsAsync();
      finalStatus = status;

      // Android won't re-show the system prompt once denied — canAskAgain
      // tells us that's the case, so we need to send the user to Settings
      // manually instead of trying (and failing) to prompt again.
      if (status !== 'granted' && !canAskAgain) {
        return { success: false, reason: 'permission_denied_permanently' };
      }
    }

    if (finalStatus !== 'granted') {
      return { success: false, reason: 'permission_denied' };
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('mingley_default', {
        name: 'Mingley Notifications',
        importance: Notifications.AndroidImportance.HIGH,
        sound: 'default',
        vibrationPattern: [0, 250, 250, 250],
      });
    }

    const tokenData = await Notifications.getDevicePushTokenAsync();
    const token = tokenData?.data;

    if (!token) {
      return { success: false, reason: 'no_token' };
    }

    await notificationService.updateFcmToken(token);
    return { success: true, token };
  } catch (err) {
    console.warn('Push registration failed:', err);
    return { success: false, reason: 'error', error: err };
  }
}

// Opens the device's app-specific notification settings — the only way
// to grant a permanently-denied permission on Android.
export function openNotificationSettings() {
  if (Platform.OS === 'android') {
    Linking.openSettings();
  } else {
    Linking.openURL('app-settings:');
  }
}