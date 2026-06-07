import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../constants/theme';
import { SelectCard } from '../components/SelectCard';
import { Button } from '../../../components/common/Button';
import { useProfileSetupStore } from '../store/useProfileSetupStore';
import { useAuthStore } from '../../../store/useAuthStore';
import { useTheme } from '../../../theme/ThemeContext';

export const GenderSelectionScreen = ({ navigation }) => {
  const { gender, setGender } = useProfileSetupStore();
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const { theme } = useTheme();

  const handleSelect = (selectedGender) => {
    setGender(selectedGender);
  };

  const handleSkip = () => {
    if (isAuthenticated) {
      navigation.navigate('Home');
    } else {
      navigation.navigate('InterestsSelection');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={[styles.backButton, { borderColor: theme.actionButtonBorder }]}
          onPress={() => navigation.goBack()}
        >
          <Icon name="chevron-back" size={24} color={theme.accent} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>I am a</Text>
        
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipText: {
    fontSize: 16,
    fontWeight: 'bold',
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
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif-medium',
  },
});
