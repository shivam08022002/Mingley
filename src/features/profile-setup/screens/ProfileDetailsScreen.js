import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image as FastImage } from 'expo-image';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../constants/theme';
import { CardInput } from '../components/CardInput';
import { BottomSheetDatePicker } from '../components/BottomSheetDatePicker';
import { Button } from '../../../components/common/Button';
import { useProfileSetupStore } from '../store/useProfileSetupStore';
import { useAuthStore } from '../../../store/useAuthStore';

export const ProfileDetailsScreen = ({ navigation }) => {
  const { profileDetails, setProfileDetails } = useProfileSetupStore();
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);

  const handleSkip = () => {
    if (isAuthenticated) {
      navigation.navigate('Home');
    } else {
      // During registration, maybe we don't allow skip or we navigate to next step
      navigation.navigate('GenderSelection');
    }
  };

  const formatDisplayDate = (dateString) => {
    if (!dateString) return;
    return dateString;
  };

  const handleSelectAvatar = () => {
    const avatarChoices = [
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
      'https://i.ibb.co/bpR70mc/image.png',
    ];

    Alert.alert('Choose Profile Photo', 'Select a sample photo to use for your profile.', [
      {
        text: 'Style 1',
        onPress: () => {
          setProfileDetails({ avatar: avatarChoices[0] });
        },
      },
      {
        text: 'Style 2',
        onPress: () => {
          setProfileDetails({ avatar: avatarChoices[1] });
        },
      },
      {
        text: 'Style 3',
        onPress: () => {
          setProfileDetails({ avatar: avatarChoices[2] });
        },
      },
      {
        text: 'Style 4 (Male)',
        onPress: () => {
          setProfileDetails({ avatar: avatarChoices[3] });
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1 }}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleSkip}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
          </View>

          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.content}
          >
            <Text style={styles.title}>Profile details</Text>
            
            <View style={styles.avatarContainer}>
              <TouchableOpacity onPress={handleSelectAvatar} activeOpacity={0.85}>
                <View style={styles.avatarWrapper}>
                   <FastImage
                      source={profileDetails.avatar ? { uri: profileDetails.avatar } : require('../../../assets/hey.png')}
                      style={styles.avatar}
                   />
                   <View style={styles.cameraIcon}>
                     <Icon name="camera" size={16} color="#FFFFFF" />
                   </View>
                </View>
              </TouchableOpacity>
            </View>

            <View style={styles.formContainer}>
              <CardInput
                label="First name"
                value={profileDetails.firstName}
                onChangeText={(text) => setProfileDetails({ firstName: text })}
                placeholder="Peter"
              />
              <CardInput
                label="Last name"
                value={profileDetails.lastName}
                onChangeText={(text) => setProfileDetails({ lastName: text })}
                placeholder="Parker"
              />

              <TouchableOpacity 
                style={styles.birthdayButton}
                onPress={() => setDatePickerVisible(true)}
                activeOpacity={0.8}
              >
                <Icon name="calendar-outline" size={24} color="#E94057" style={styles.calendarIcon} />
                <Text style={[styles.birthdayText, !profileDetails.birthday && styles.birthdayPlaceholder]}>
                  {profileDetails.birthday ? formatDisplayDate(profileDetails.birthday) : 'Choose birthday date'}
                </Text>
              </TouchableOpacity>
            </View>

            <Button
              title="Confirm"
              onPress={() => navigation.navigate('GenderSelection')}
              style={styles.confirmButton}
              textStyle={styles.buttonText}
              variant="solid"
            />
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>

      <BottomSheetDatePicker
        visible={isDatePickerVisible}
        onClose={() => setDatePickerVisible(false)}
        selectedDate={profileDetails.birthday}
        onSelectDate={(date) => setProfileDetails({ birthday: date })}
      />
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
    paddingTop: 30,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#000000',
    fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif-medium',
    marginBottom: 40,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  avatarWrapper: {
    width: 130,
    height: 140,
    borderRadius: 40,
    backgroundColor: '#F0F0F0',
    position: 'relative',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
  },
  cameraIcon: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E94057',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  formContainer: {
    gap: SPACING.m,
    marginBottom: 40,
  },
  birthdayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0F3',
    height: 60,
    borderRadius: 16,
    paddingHorizontal: SPACING.m,
    marginTop: 10,
  },
  calendarIcon: {
    marginRight: 12,
  },
  birthdayText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E94057',
    fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif-medium',
  },
  birthdayPlaceholder: {
    color: '#E94057',
  },
  confirmButton: {
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
