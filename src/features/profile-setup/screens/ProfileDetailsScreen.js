import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback } from 'react-native';
import FastImage from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../constants/theme';
import { CardInput } from '../components/CardInput';
import { BottomSheetDatePicker } from '../components/BottomSheetDatePicker';
import { GradientButton } from '../../../components/common/GradientButton';
import { useProfileSetupStore } from '../store/useProfileSetupStore';

export const ProfileDetailsScreen = ({ navigation }) => {
  const { profileDetails, setProfileDetails } = useProfileSetupStore();
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);

  const formatDisplayDate = (dateString) => {
    if (!dateString) return;
    return dateString; // Just returning string for mock
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1 }}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.navigate('Home')}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
          </View>

          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.content}
          >
            <Text style={styles.title}>Profile details</Text>
            
            <View style={styles.avatarContainer}>
              <View style={styles.avatarWrapper}>
                 <FastImage
                    source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }}
                    style={styles.avatar}
                 />
                 <TouchableOpacity style={styles.cameraIcon}>
                   <Icon name="camera" size={16} color="#FFFFFF" />
                 </TouchableOpacity>
              </View>
            </View>

            <View style={styles.formContainer}>
              <CardInput
                label="First name"
                value={profileDetails.firstName}
                onChangeText={(text) => setProfileDetails({ firstName: text })}
                placeholder="David"
              />
              <CardInput
                label="Last name"
                value={profileDetails.lastName}
                onChangeText={(text) => setProfileDetails({ lastName: text })}
                placeholder="Peterson"
              />

              <TouchableOpacity 
                style={styles.birthdayButton}
                onPress={() => setDatePickerVisible(true)}
                activeOpacity={0.8}
              >
                <Icon name="calendar-outline" size={24} color="#E4415C" style={styles.calendarIcon} />
                <Text style={[styles.birthdayText, !profileDetails.birthday && styles.birthdayPlaceholder]}>
                  {profileDetails.birthday ? formatDisplayDate(profileDetails.birthday) : 'Choose birthday date'}
                </Text>
              </TouchableOpacity>
            </View>

            <GradientButton
              title="Confirm"
              onPress={() => navigation.navigate('GenderSelection')}
              colors={['#E4415C', '#E4415C']}
              style={styles.confirmButton}
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
    ...TYPOGRAPHY.body,
    fontWeight: 'bold',
    color: '#E4415C',
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
    paddingTop: 40,
  },
  title: {
    ...TYPOGRAPHY.h1,
    fontSize: 40,
    color: '#000000',
    marginBottom: 60,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  avatarWrapper: {
    width: 120,
    height: 120,
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
    backgroundColor: '#E4415C',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  formContainer: {
    gap: SPACING.l,
    marginBottom: 60,
  },
  birthdayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0F3', // Light pink background
    height: 60,
    borderRadius: 16,
    paddingHorizontal: SPACING.m,
    marginTop: 10,
  },
  calendarIcon: {
    marginRight: 12,
  },
  birthdayText: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
    color: '#E4415C', // Selected text might be red or black, UI shows pinkish
  },
  birthdayPlaceholder: {
    color: '#E4415C',
  },
  confirmButton: {
    marginTop: 'auto',
    marginBottom: 40,
    borderRadius: 16,
  },
});
