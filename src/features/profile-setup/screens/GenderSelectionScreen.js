import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../constants/theme';
import { SelectCard } from '../components/SelectCard';
import { GradientButton } from '../../../components/common/GradientButton';
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

        <GradientButton
          title="Continue"
          onPress={() => navigation.navigate('InterestsSelection')}
          colors={['#E94057', '#E94057']}
          style={styles.continueButton}
          disabled={!gender}
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
    ...TYPOGRAPHY.body,
    fontWeight: 'bold',
    color: '#E94057',
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
    paddingTop: 60,
  },
  title: {
    ...TYPOGRAPHY.h1,
    fontSize: 40,
    color: '#000000',
    marginBottom: 60,
  },
  optionsContainer: {
    gap: SPACING.s,
  },
  continueButton: {
    marginTop: 'auto',
    marginBottom: 40,
    borderRadius: 16,
  },
});
