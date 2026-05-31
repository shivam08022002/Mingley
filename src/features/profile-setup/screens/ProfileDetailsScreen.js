import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image as FastImage } from 'expo-image';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../constants/theme';
import { CardInput } from '../components/CardInput';
import { BottomSheetDatePicker } from '../components/BottomSheetDatePicker';
import { BottomSheetContainer } from '../../../components/common/BottomSheetContainer';
import { Button } from '../../../components/common/Button';
import { useProfileSetupStore } from '../store/useProfileSetupStore';
import { useAuthStore } from '../../../store/useAuthStore';

const DismissKeyboard = ({ children }) => {
  if (Platform.OS === 'web') {
    return children;
  }
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      {children}
    </TouchableWithoutFeedback>
  );
};

const avatarChoices = [
  { gender: 'boy', label: 'Classic Boy', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80' },
  { gender: 'boy', label: 'Casual Boy', url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80' },
  { gender: 'boy', label: 'Modern Boy', url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80' },
  { gender: 'girl', label: 'Classic Girl', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80' },
  { gender: 'girl', label: 'Casual Girl', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80' },
  { gender: 'girl', label: 'Modern Girl', url: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=400&q=80' },
];

export const ProfileDetailsScreen = ({ navigation }) => {
  const { profileDetails, setProfileDetails } = useProfileSetupStore();
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [avatarModalVisible, setAvatarModalVisible] = useState(false);

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
    setAvatarModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <DismissKeyboard>
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
                   {profileDetails.avatar ? (
                     <FastImage
                        source={{ uri: profileDetails.avatar }}
                        style={styles.avatar}
                     />
                   ) : (
                     <View style={styles.placeholderAvatar}>
                       <Icon name="person" size={54} color="#D0D0D0" />
                     </View>
                   )}
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
                placeholder=""
              />
              <CardInput
                label="Last name"
                value={profileDetails.lastName}
                onChangeText={(text) => setProfileDetails({ lastName: text })}
                placeholder=""
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
      </DismissKeyboard>

      <BottomSheetDatePicker
        visible={isDatePickerVisible}
        onClose={() => setDatePickerVisible(false)}
        selectedDate={profileDetails.birthday}
        onSelectDate={(date) => setProfileDetails({ birthday: date })}
      />

      {/* ── Visual Avatar Selection Modal ── */}
      <Modal visible={avatarModalVisible} transparent animationType="fade" onRequestClose={() => setAvatarModalVisible(false)}>
        <BottomSheetContainer onClose={() => setAvatarModalVisible(false)} height={540}>
          <View style={{ flex: 1, width: '100%' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <Text style={styles.modalTitle}>Choose Profile Picture</Text>
            </View>
            <Text style={styles.modalSubtitleText}>Select a premium portrait style to set your primary avatar</Text>

            {/* Boy Avatars */}
            <Text style={styles.genderSectionHeader}>Boy Avatars 🙋‍♂️</Text>
            <View style={styles.avatarSelectionRow}>
              {avatarChoices.filter(c => c.gender === 'boy').map((choice) => (
                <TouchableOpacity
                  key={choice.url}
                  style={styles.avatarSelectionCard}
                  onPress={() => {
                    setProfileDetails({ avatar: choice.url });
                    setAvatarModalVisible(false);
                  }}
                  activeOpacity={0.8}
                >
                  <FastImage source={{ uri: choice.url }} style={styles.avatarSelectionImage} />
                  <Text style={styles.avatarSelectionLabel}>{choice.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Girl Avatars */}
            <Text style={styles.genderSectionHeader}>Girl Avatars 🙋‍♀️</Text>
            <View style={styles.avatarSelectionRow}>
              {avatarChoices.filter(c => c.gender === 'girl').map((choice) => (
                <TouchableOpacity
                  key={choice.url}
                  style={styles.avatarSelectionCard}
                  onPress={() => {
                    setProfileDetails({ avatar: choice.url });
                    setAvatarModalVisible(false);
                  }}
                  activeOpacity={0.8}
                >
                  <FastImage source={{ uri: choice.url }} style={styles.avatarSelectionImage} />
                  <Text style={styles.avatarSelectionLabel}>{choice.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </BottomSheetContainer>
      </Modal>
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
  placeholderAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 40,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111',
  },
  modalSubtitleText: {
    fontSize: 13,
    color: '#777',
    marginBottom: 20,
    lineHeight: 18,
  },
  genderSectionHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: '#E94057',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  avatarSelectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 16,
    marginBottom: 24,
    width: '100%',
  },
  avatarSelectionCard: {
    alignItems: 'center',
    flex: 1,
  },
  avatarSelectionImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarSelectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#444',
    marginTop: 8,
    textAlign: 'center',
  },
});


