import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image as FastImage } from 'expo-image';
import * as Location from 'expo-location';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../constants/theme';
import { Button } from '../../../components/common/Button';
import { useAuthStore } from '../../../store/useAuthStore';
import { userService } from '../../../services/apiServices';
import { useTheme } from '../../../theme/ThemeContext';

export const LocationPermissionScreen = ({ navigation, route }) => {
  const { theme, isDark } = useTheme();
  const { userData } = route?.params || {};
  const login = useAuthStore(state => state.login);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const [enabling, setEnabling] = useState(false);

  const handleFinishOnboarding = () => {
    if (isAuthenticated) {
      navigation.navigate('Home');
    } else {
      login(userData || { id: 'new-user', name: 'User' });
    }
  };

  const handleEnableLocation = async () => {
    setEnabling(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Location Needed',
          'Please enable location permissions in settings to use Mingley.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Platform.OS === 'ios' ? Linking.openURL('app-settings:') : Linking.openSettings() }
          ]
        );
        setEnabling(false);
        return;
      }

      // Fetch the device's current GPS coordinates
      try {
        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        const { latitude, longitude } = position.coords;

        // Send coordinates to the backend
        await userService.updateLocation({ latitude, longitude });
      } catch (locErr) {
        console.warn('Location fetch/upload failed, continuing onboarding:', locErr);
      }

      handleFinishOnboarding();
    } catch (error) {
      console.error("Enable location error:", error);
      Alert.alert('Error', 'Failed to request location permission.');
      setEnabling(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Empty header for layout alignment - no skip button allowed */}
      <View style={styles.header} />

      <View style={styles.content}>
        <View style={styles.imageContainer}>
          <FastImage 
            source={require('../../../assets/location.webp')} 
            style={styles.image}
            contentFit="contain"
          />
        </View>

        <Text style={[styles.title, { color: theme.textPrimary }]}>Enable location</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          We need your location to show matches nearby.
        </Text>

        <Button
          title="I want to share my location"
          onPress={handleEnableLocation}
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
    height: 40,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.m,
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
