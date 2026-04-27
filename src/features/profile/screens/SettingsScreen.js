import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Platform, Alert, Modal, FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../../store/useAuthStore';
import { useChatStore } from '../../../store/useChatStore';
import { BottomSheetContainer } from '../../../components/common/BottomSheetContainer';

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
    title: 'Finance',
    items: [
      { key: 'transactions', icon: 'card-outline', label: 'Transaction History' },
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
      <Icon name={icon} size={18} color="#E94057" />
    </View>
    <Text style={row.label}>{label}</Text>
    <Icon name="chevron-forward" size={18} color="#CCC" />
  </TouchableOpacity>
));

export const SettingsScreen = React.memo(() => {
  const navigation = useNavigation();
  const logout = useAuthStore((s) => s.logout);
  const transactions = useChatStore((s) => s.transactions);
  const [txModalVisible, setTxModalVisible] = useState(false);

  const handleItem = useCallback((key) => {
    if (key === 'editProfile') {
      navigation.navigate('ProfileDetails');
    } else if (key === 'transactions') {
      setTxModalVisible(true);
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
            <Icon name="log-out-outline" size={18} color="#E94057" />
            <Text style={s.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Transaction History Modal */}
      <Modal visible={txModalVisible} transparent animationType="fade" onRequestClose={() => setTxModalVisible(false)}>
        <BottomSheetContainer onClose={() => setTxModalVisible(false)} height={600}>
          <View style={{ flex: 1, width: '100%' }}>
            <View style={s.txHeader}>
              <Text style={s.txHeaderTitle}>Transaction History</Text>
            </View>
            <FlatList
              data={transactions}
              keyExtractor={(item) => item.id}
              contentContainerStyle={s.txList}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={<Text style={s.txEmpty}>No transactions yet.</Text>}
              renderItem={({ item }) => {
                const isCredit = item.type === 'credit';
                return (
                  <View style={s.txItem}>
                    <View style={row.iconWrap}>
                      <Icon name={isCredit ? 'arrow-down-outline' : 'arrow-up-outline'} size={18} color={isCredit ? '#059669' : '#E94057'} />
                    </View>
                    <View style={s.txLeft}>
                      <Text style={s.txTitle}>{item.title}</Text>
                      <Text style={s.txDate}>{new Date(item.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</Text>
                    </View>
                    <Text style={[s.txAmount, isCredit ? s.txCredit : s.txDebit]}>
                      {isCredit ? '+' : '-'}{item.amount} coins
                    </Text>
                  </View>
                );
              }}
            />
          </View>
        </BottomSheetContainer>
      </Modal>
    </SafeAreaView>
  );
});

const FONT     = Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif';
const FONT_MED = Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif-medium';
const PINK     = '#E94057';

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
  
  // Transaction Modal Styles
  txHeader: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
  },
  txHeaderTitle: { fontSize: 18, fontWeight: '700', color: '#111', fontFamily: FONT_MED },
  txList: { paddingVertical: 16 },
  txEmpty: { textAlign: 'center', color: '#999', marginTop: 40, fontFamily: FONT },
  txItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F5F5F5',
  },
  txLeft: { flex: 1, marginLeft: 12 },
  txTitle: { fontSize: 15, fontWeight: '600', color: '#222', fontFamily: FONT_MED, marginBottom: 2 },
  txDate: { fontSize: 12, color: '#888', fontFamily: FONT },
  txAmount: { fontSize: 15, fontWeight: '700', fontFamily: FONT_MED },
  txCredit: { color: '#059669' },
  txDebit: { color: '#DC2626' },
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
