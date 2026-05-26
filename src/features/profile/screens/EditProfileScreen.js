import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image as FastImage } from 'expo-image';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { userService } from '../../../services/apiServices';
import { useProfileStore } from '../store/useProfileStore';
import { decodeEmoji } from '../../../utils/stringUtils';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../constants/theme';
import { BottomSheetDatePicker } from '../../profile-setup/components/BottomSheetDatePicker';

export const EditProfileScreen = () => {
  const navigation = useNavigation();
  const fetchProfileStore = useProfileStore(s => s.fetchProfile);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    bio: '',
    gender: '',
    dateOfBirth: '',
    avatar: ''
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await userService.getMe();
      const data = res.data || res;
      setIsVerified(data.isVerified || data.verified || false);
      setFormData({
        fullName: data.fullName || '',
        bio: decodeEmoji(data.bio || ''),
        gender: data.gender === 'man' ? 'male' : data.gender === 'woman' ? 'female' : data.gender || '',
        dateOfBirth: data.dateOfBirth || '',
        avatar: data.avatar || ''
      });
    } catch (e) {
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await userService.updateMe({
        fullName: formData.fullName,
        bio: formData.bio,
        gender: formData.gender === 'male' ? 'man' : formData.gender === 'female' ? 'woman' : formData.gender,
        dateOfBirth: formData.dateOfBirth,
        avatar: formData.avatar
      });
      await fetchProfileStore();
      if (Platform.OS === 'web') {
        alert('Profile updated successfully!');
        navigation.goBack();
      } else {
        Alert.alert('Success', 'Profile updated successfully!', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E94057" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity 
          style={styles.saveBtn} 
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#E94057" />
          ) : (
            <Text style={styles.saveBtnText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarWrapper}>
              <FastImage
                source={{ uri: formData.avatar || 'https://via.placeholder.com/150' }}
                style={styles.avatar}
              />
              <TouchableOpacity style={styles.cameraIcon}>
                <Icon name="camera" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <Text style={styles.avatarHint}>Change Profile Picture</Text>
            {isVerified && (
              <View style={styles.verifiedBadge}>
                <Icon name="checkmark-circle" size={14} color="#4CAF50" />
                <Text style={styles.verifiedText}>Verified Profile</Text>
              </View>
            )}
          </View>

          {/* Form Fields */}
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                value={formData.fullName}
                onChangeText={(text) => setFormData(prev => ({ ...prev, fullName: text }))}
                placeholder="Enter your full name"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Bio</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.bio}
                onChangeText={(text) => setFormData(prev => ({ ...prev, bio: text }))}
                placeholder="Tell us about yourself"
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Gender</Text>
              <View style={styles.genderRow}>
                {['male', 'female', 'other'].map(g => (
                  <TouchableOpacity
                    key={g}
                    style={[
                      styles.genderBtn,
                      formData.gender === g && styles.genderBtnActive
                    ]}
                    onPress={() => setFormData(prev => ({ ...prev, gender: g }))}
                  >
                    <Text style={[
                      styles.genderText,
                      formData.gender === g && styles.genderTextActive
                    ]}>
                      {g.charAt(0).toUpperCase() + g.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Birthday</Text>
              <TouchableOpacity 
                style={styles.dateBtn}
                onPress={() => setDatePickerVisible(true)}
              >
                <Icon name="calendar-outline" size={20} color="#E94057" />
                <Text style={styles.dateText}>
                  {formData.dateOfBirth ? new Date(formData.dateOfBirth).toLocaleDateString() : 'Select Birthday'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <BottomSheetDatePicker
        visible={isDatePickerVisible}
        onClose={() => setDatePickerVisible(false)}
        selectedDate={formData.dateOfBirth}
        onSelectDate={(date) => setFormData(prev => ({ ...prev, dateOfBirth: date }))}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#111' },
  saveBtn: { paddingHorizontal: 16, paddingVertical: 8 },
  saveBtnText: { color: '#E94057', fontWeight: '700', fontSize: 16 },
  scroll: { padding: 20 },
  avatarSection: { alignItems: 'center', marginBottom: 30 },
  avatarWrapper: { position: 'relative' },
  avatar: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#F5F5F5' },
  cameraIcon: {
    position: 'absolute', bottom: 0, right: 0,
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#E94057', justifyContent: 'center', alignItems: 'center',
    borderWidth: 3, borderColor: '#FFF'
  },
  avatarHint: { marginTop: 12, color: '#999', fontSize: 14, fontWeight: '500' },
  form: { gap: 20 },
  inputGroup: { gap: 8 },
  label: { fontSize: 14, fontWeight: '700', color: '#333', marginLeft: 4 },
  input: {
    backgroundColor: '#F7F7F7', borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 12,
    fontSize: 15, color: '#111',
    borderWidth: 1, borderColor: '#EEE'
  },
  textArea: { height: 100, textAlignVertical: 'top' },
  genderRow: { flexDirection: 'row', gap: 10 },
  genderBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 12,
    backgroundColor: '#F7F7F7', alignItems: 'center',
    borderWidth: 1.5, borderColor: '#EEE'
  },
  genderBtnActive: { backgroundColor: '#FFF0F3', borderColor: '#E94057' },
  genderText: { fontSize: 14, fontWeight: '600', color: '#666' },
  genderTextActive: { color: '#E94057', fontWeight: '700' },
  dateBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#F7F7F7', borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 12,
    borderWidth: 1, borderColor: '#EEE'
  },
  dateText: { fontSize: 15, color: '#111' },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F4EA',
    borderWidth: 1,
    borderColor: '#A3E2AB',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginTop: 8,
    gap: 6,
  },
  verifiedText: {
    color: '#137333',
    fontSize: 12,
    fontWeight: '700',
  }
});
