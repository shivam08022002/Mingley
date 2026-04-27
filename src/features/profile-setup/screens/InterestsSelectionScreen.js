import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../constants/theme';
import { Chip } from '../components/Chip';
import { Button } from '../../../components/common/Button';
import { useProfileSetupStore } from '../store/useProfileSetupStore';

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
];

export const InterestsSelectionScreen = ({ navigation }) => {
  const { interests, toggleInterest } = useProfileSetupStore();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="chevron-back" size={24} color="#E94057" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
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
          onPress={() => navigation.navigate('ContactsPermission')}
          style={styles.continueButton}
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
    fontSize: 34,
    fontWeight: 'bold',
    color: '#000000',
    fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif-medium',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#5b5b5b',
    lineHeight: 24,
    fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif',
    marginBottom: 40,
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
});
