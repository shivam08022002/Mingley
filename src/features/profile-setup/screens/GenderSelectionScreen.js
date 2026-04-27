import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../constants/theme';
import { SelectCard } from '../components/SelectCard';
import { Button } from '../../../components/common/Button';
import { useProfileSetupStore } from '../store/useProfileSetupStore';

export const GenderSelectionScreen = ({ navigation }) => {
  const { gender, setGender } = useProfileSetupStore();

  const handleSelect = (selectedGender) => {
    setGender(selectedGender);
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
        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>I am a</Text>
        
        <View style={styles.optionsContainer}>
          <SelectCard 
            label="Woman" 
            selected={gender === 'Woman'} 
            onPress={() => handleSelect('Woman')} 
          />
          <SelectCard 
            label="Man" 
            selected={gender === 'Man'} 
            onPress={() => handleSelect('Man')} 
          />
          <SelectCard 
            label="Choose another" 
            selected={gender === 'Other'} // Mock
            onPress={() => handleSelect('Other')} 
          />
        </View>

        <Button
          title="Continue"
          onPress={() => navigation.navigate('InterestsSelection')}
          style={styles.continueButton}
          textStyle={styles.buttonText}
          disabled={!gender}
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
    paddingTop: 60,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#000000',
    fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif-medium',
    marginBottom: 60,
  },
  optionsContainer: {
    gap: 12,
  },
  continueButton: {
    marginTop: 'auto',
    marginBottom: 60,
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
