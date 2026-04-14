import React, { useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Platform, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../../store/useAuthStore';

const SECTIONS = [
  {
    title: 'Account',
    items: [
      { key: 'editProfile',    icon: 'person-outline',       label: 'Edit Profile' },
      { key: 'notifications',  icon: 'notifications-outline', label: 'Notifications' },
      { key: 'privacy',        icon: 'shield-outline',        label: 'Privacy' },
    ],
  },
  {
    title: 'Discovery',
    items: [
      { key: 'discoverPrefs', icon: 'options-outline',    label: 'Discovery Preferences' },
      { key: 'location',      icon: 'location-outline',   label: 'Location' },
      { key: 'likedYou',      icon: 'heart-outline',      label: 'Liked You' },
    ],
  },
  {
    title: 'Support',
    items: [
      { key: 'help',       icon: 'help-circle-outline',    label: 'Help & Support' },
      { key: 'terms',      icon: 'document-text-outline',  label: 'Terms of Service' },
      { key: 'privPolicy', icon: 'lock-closed-outline',    label: 'Privacy Policy' },
    ],
  },
];

const SettingsRow = React.memo(({ icon, label, onPress, isLast }) => (
  <TouchableOpacity
    style={[row.container, !isLast && row.border]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={row.iconWrap}>
      <Icon name={icon} size={18} color="#E4415C" />
    </View>
    <Text style={row.label}>{label}</Text>
    <Icon name="chevron-forward" size={18} color="#CCC" />
  </TouchableOpacity>
));

export const SettingsScreen = React.memo(() => {
  const navigation = useNavigation();
  const logout = useAuthStore((s) => s.logout);

  const handleItem = useCallback((key) => {
    if (key === 'editProfile') {
      navigation.navigate('ProfileDetails');
    } else {
      Alert.alert(key, 'Coming soon!');
    }
  }, [navigation]);

  const handleSignOut = useCallback(() => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out', style: 'destructive',
        onPress: () => logout(),
      },
    ]);
  }, [logout]);

  return (
    <SafeAreaView style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={22} color="#333" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {SECTIONS.map((section) => (
          <View key={section.title} style={s.section}>
            <Text style={s.sectionTitle}>{section.title}</Text>
            <View style={s.card}>
              {section.items.map((item, idx) => (
                <SettingsRow
                  key={item.key}
                  icon={item.icon}
                  label={item.label}
                  isLast={idx === section.items.length - 1}
                  onPress={() => handleItem(item.key)}
                />
              ))}
            </View>
          </View>
        ))}

        {/* Sign Out — at bottom, above safe area */}
        <View style={s.section}>
          <TouchableOpacity style={s.signOutBtn} onPress={handleSignOut}>
            <Icon name="log-out-outline" size={18} color="#E4415C" />
            <Text style={s.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
});

const FONT     = Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif';
const FONT_MED = Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif-medium';
const PINK     = '#E4415C';

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F7F7' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18, fontWeight: '800', color: '#111', fontFamily: FONT_MED,
  },
  scroll: { padding: 16, paddingBottom: 40 },
  section: { marginBottom: 20 },
  sectionTitle: {
    fontSize: 13, fontWeight: '700', color: '#999', textTransform: 'uppercase',
    letterSpacing: 0.8, marginBottom: 8, paddingLeft: 4, fontFamily: FONT_MED,
  },
  card: {
    backgroundColor: '#fff', borderRadius: 18,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
    overflow: 'hidden',
  },
  signOutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: '#fff', borderRadius: 18,
    height: 54, borderWidth: 1, borderColor: '#F2D0D6',
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  signOutText: {
    fontSize: 15, fontWeight: '700', color: PINK, fontFamily: FONT_MED,
  },
});

const row = StyleSheet.create({
  container: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14, gap: 14,
  },
  border: { borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  iconWrap: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: '#FFF0F3',
    justifyContent: 'center', alignItems: 'center',
  },
  label: {
    flex: 1, fontSize: 15, color: '#222', fontFamily: FONT,
  },
});
