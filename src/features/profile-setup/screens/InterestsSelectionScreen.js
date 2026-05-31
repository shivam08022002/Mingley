import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../constants/theme';
import { Chip } from '../components/Chip';
import { Button } from '../../../components/common/Button';
import { useProfileSetupStore } from '../store/useProfileSetupStore';
import { useToastStore } from '../../../store/useToastStore';

// Mock datastore for interests
const INTERESTS = [
  { id: '1', label: 'Photography', icon: 'camera-outline' },
  { id: '2', label: 'Shopping', icon: 'bag-handle-outline' },
  { id: '3', label: 'Karaoke', icon: 'mic-outline' },
  { id: '4', label: 'Yoga', icon: 'body-outline' },
  { id: '5', label: 'Cooking', icon: 'restaurant-outline' },
  { id: '6', label: 'Tennis', icon: 'tennisball-outline' },
  { id: '7', label: 'Run', icon: 'walk-outline' },
  { id: '8', label: 'Swimming', icon: 'water-outline' },
  { id: '9', label: 'Art', icon: 'color-palette-outline' },
  { id: '10', label: 'Traveling', icon: 'airplane-outline' },
  { id: '11', label: 'Extreme', icon: 'bicycle-outline' },
  { id: '12', label: 'Music', icon: 'musical-notes-outline' },
  { id: '13', label: 'Drink', icon: 'wine-outline' },
  { id: '14', label: 'Video games', icon: 'game-controller-outline' },
  { id: '15', label: 'Movies', icon: 'film-outline' },
  { id: '16', label: 'Reading', icon: 'book-outline' },
  { id: '17', label: 'Gym', icon: 'barbell-outline' },
  { id: '18', label: 'Coffee', icon: 'cafe-outline' },
  { id: '19', label: 'Hiking', icon: 'compass-outline' },
  { id: '20', label: 'Coding', icon: 'code-slash-outline' },
  { id: '21', label: 'Pets', icon: 'paw-outline' },
  { id: '22', label: 'Foodie', icon: 'pizza-outline' },
];

import { authService } from '../../../services/apiServices';
import { useAuthStore } from '../../../store/useAuthStore';
import { safeStorage } from '../../../services/api';

export const InterestsSelectionScreen = ({ navigation }) => {
  const { interests, toggleInterest, authDetails, profileDetails, gender, clearProfileSetup } = useProfileSetupStore();
  const login = useAuthStore(state => state.login);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const [isLoading, setIsLoading] = useState(false);

  const handleSkip = () => {
    if (isAuthenticated) {
      navigation.navigate('Home');
    } else {
      handleRegister();
    }
  };

  const handleRegister = async () => {
    setIsLoading(true);
    try {
      const userData = {
        email: authDetails.email,
        phone: authDetails.phone || '',
        password: authDetails.password,
        confirmPassword: authDetails.confirmPassword,
        fullName: `${profileDetails.firstName} ${profileDetails.lastName}`,
        gender: gender.toLowerCase(),
        dateOfBirth: profileDetails.birthday || new Date().toISOString(),
        avatar: profileDetails.avatar || 'https://via.placeholder.com/150',
        interests: interests, // Including interests as well
      };

      const response = await authService.register(userData);
      
      // Handle different possible response structures
      const registeredUser = response.user || response.data?.user || (response.id ? response : null);
      const tokens = response.tokens || response.data?.tokens || {
        accessToken: response.accessToken || response.data?.accessToken,
        refreshToken: response.refreshToken || response.data?.refreshToken
      };

      if (registeredUser) {
        clearProfileSetup();
        useToastStore.getState().showToast({
          title: 'Profile Created 🎉',
          text: 'Registration successful! Please login.',
          type: 'success',
        });
        navigation.navigate('Login');
      } else {
        // Fallback
        clearProfileSetup();
        useToastStore.getState().showToast({
          title: 'Profile Created 🎉',
          text: 'Registration successful! Please login.',
          type: 'success',
        });
        navigation.navigate('Login');
      }
    } catch (error) {
      console.error('Registration error:', error);
      useToastStore.getState().showToast({
        title: 'Registration Failed ❌',
        text: error.message || 'Registration failed',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="chevron-back" size={24} color="#E94057" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Your interests</Text>
        <Text style={styles.subtitle}>
          Select a few of your interests and let everyone know what you're passionate about.
        </Text>
        
        <ScrollView contentContainerStyle={styles.chipsContainer} showsVerticalScrollIndicator={false}>
          {INTERESTS.map((item) => (
            <Chip
              key={item.id}
              label={item.label}
              icon={item.icon}
              selected={interests.includes(item.label)}
              onPress={() => toggleInterest(item.label)}
            />
          ))}
        </ScrollView>

        <Button
          title="Continue"
          onPress={handleRegister}
          style={styles.continueButton}
          textStyle={styles.buttonText}
          variant="solid"
          loading={isLoading}
        />
      </View>

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#E94057" />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.m,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
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
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
    fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif-medium',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#5b5b5b',
    lineHeight: 20,
    fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif',
    marginBottom: 30,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingBottom: 20,
  },
  continueButton: {
    marginTop: 'auto',
    marginBottom: 20,
    borderRadius: 16,
    height: 52,
    backgroundColor: '#E94057',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif-medium',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
});

