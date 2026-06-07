import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback, Alert, Modal } from 'react-native';
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
import { useTheme } from '../../../theme/ThemeContext';

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
  { gender: 'boy', label: 'Classic Boy', url: 'https://images.unsplash.com/photo-1500048993953-d23a436266cf?auto=format&fit=crop&w=400&q=80' },
  { gender: 'boy', label: 'Casual Boy', url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80' },
  { gender: 'boy', label: 'Modern Boy', url: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?auto=format&fit=crop&w=400&q=80' },
  { gender: 'boy', label: 'Stylish Boy', url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=400&q=80' },
  { gender: 'boy', label: 'Trendy Boy', url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80' },
  { gender: 'boy', label: 'Cool Boy', url: 'https://images.unsplash.com/photo-1489980508314-941910ded1f4?auto=format&fit=crop&w=400&q=80' },
  { gender: 'girl', label: 'Classic Girl', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80' },
  { gender: 'girl', label: 'Casual Girl', url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=400&q=80' },
  { gender: 'girl', label: 'Modern Girl', url: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=400&q=80' },
  { gender: 'girl', label: 'Stylish Girl', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80' },
  { gender: 'girl', label: 'Trendy Girl', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80' },
  { gender: 'girl', label: 'Cool Girl', url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80' },
];

export const ProfileDetailsScreen = ({ navigation }) => {
  const { profileDetails, setProfileDetails } = useProfileSetupStore();
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [avatarModalVisible, setAvatarModalVisible] = useState(false);
  const { theme, isDark } = useTheme();

  const handleSkip = () => {
    if (isAuthenticated) {
      navigation.navigate('Home');
    } else {
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

  const handleConfirm = () => {
    if (!profileDetails.firstName?.trim()) {
      Alert.alert('Validation Error', 'First name is required.');
      return;
    }
    if (!profileDetails.birthday) {
      Alert.alert('Validation Error', 'Please select your birthday.');
      return;
    }
    navigation.navigate('GenderSelection');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <DismissKeyboard>
        <View style={{ flex: 1 }}>
          <View style={styles.header} />

          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.content}
          >
            <Text style={[styles.title, { color: theme.textPrimary }]}>Profile details</Text>
            
            <View style={styles.avatarContainer}>
              <TouchableOpacity onPress={handleSelectAvatar} activeOpacity={0.85}>
                <View style={[styles.avatarWrapper, { backgroundColor: isDark ? theme.cardBackground : '#F0F0F0' }]}>
                   {profileDetails.avatar ? (
                     <FastImage
                        source={{ uri: profileDetails.avatar }}
                        style={styles.avatar}
                     />
                   ) : (
                     <View style={[styles.placeholderAvatar, { backgroundColor: isDark ? theme.cardBackground : '#F3F4F6' }]}>
                       <Icon name="person" size={54} color={isDark ? '#444' : '#D0D0D0'} />
                     </View>
                   )}
                   <View style={[styles.cameraIcon, { backgroundColor: theme.accent, borderColor: theme.background }]}>
                     <Icon name="camera" size={16} color={isDark ? '#0A0A0A' : '#FFFFFF'} />
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
                style={[styles.birthdayButton, { backgroundColor: theme.iconWrapBackground }]}
                onPress={() => setDatePickerVisible(true)}
                activeOpacity={0.8}
              >
                <Icon name="calendar-outline" size={24} color={theme.accent} style={styles.calendarIcon} />
                <Text style={[styles.birthdayText, { color: theme.accent }, !profileDetails.birthday && { color: theme.accent }]}>
                  {profileDetails.birthday ? formatDisplayDate(profileDetails.birthday) : 'Choose birthday date'}
                </Text>
              </TouchableOpacity>
            </View>

            <Button
              title="Confirm"
              onPress={handleConfirm}
              style={styles.confirmButton}
              textStyle={styles.buttonText}
              variant="primary"
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
              <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Choose Profile Picture</Text>
            </View>
            <Text style={[styles.modalSubtitleText, { color: theme.textSecondary }]}>Select a premium portrait style to set your primary avatar</Text>

            {/* Boy Avatars */}
            <Text style={[styles.genderSectionHeader, { color: theme.accent }]}>Boy Avatars 🙋‍♂️</Text>
            <View style={[styles.avatarSectionBackground, { backgroundColor: theme.iconWrapBackground, borderColor: isDark ? theme.cardBorder : '#FFE3E7' }]}>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                contentContainerStyle={styles.avatarScrollContainer}
              >
                {avatarChoices.filter(c => c.gender === 'boy').map((choice) => (
                  <TouchableOpacity
                    key={choice.url}
                    style={styles.avatarSelectionCardScroll}
                    onPress={() => {
                      setProfileDetails({ avatar: choice.url });
                      setAvatarModalVisible(false);
                    }}
                    activeOpacity={0.8}
                  >
                    <FastImage source={{ uri: choice.url }} style={[styles.avatarSelectionImage, { borderColor: isDark ? theme.actionButtonBorder : '#F0F0F0' }]} />
                    <Text style={[styles.avatarSelectionLabel, { color: theme.textPrimary }]}>{choice.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Girl Avatars */}
            <Text style={[styles.genderSectionHeader, { color: theme.accent }]}>Girl Avatars 🙋‍♀️</Text>
            <View style={[styles.avatarSectionBackground, { backgroundColor: theme.iconWrapBackground, borderColor: isDark ? theme.cardBorder : '#FFE3E7' }]}>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                contentContainerStyle={styles.avatarScrollContainer}
              >
                {avatarChoices.filter(c => c.gender === 'girl').map((choice) => (
                  <TouchableOpacity
                    key={choice.url}
                    style={styles.avatarSelectionCardScroll}
                    onPress={() => {
                      setProfileDetails({ avatar: choice.url });
                      setAvatarModalVisible(false);
                    }}
                    activeOpacity={0.8}
                  >
                    <FastImage source={{ uri: choice.url }} style={[styles.avatarSelectionImage, { borderColor: isDark ? theme.actionButtonBorder : '#F0F0F0' }]} />
                    <Text style={[styles.avatarSelectionLabel, { color: theme.textPrimary }]}>{choice.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
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
  },
  header: {
    alignItems: 'flex-end',
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.m,
  },
  skipText: {
    fontSize: 16,
    fontWeight: 'bold',
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
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
  },
  formContainer: {
    gap: SPACING.m,
    marginBottom: 40,
  },
  birthdayButton: {
    flexDirection: 'row',
    alignItems: 'center',
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
    fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif-medium',
  },
  confirmButton: {
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
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  modalSubtitleText: {
    fontSize: 13,
    marginBottom: 20,
    lineHeight: 18,
  },
  genderSectionHeader: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  avatarSectionBackground: {
    borderRadius: 22,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 8,
    marginBottom: 20,
    width: '100%',
  },
  avatarScrollContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 4,
  },
  avatarSelectionCardScroll: {
    alignItems: 'center',
    width: 80,
  },
  avatarSelectionImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
  },
  avatarSelectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
});


