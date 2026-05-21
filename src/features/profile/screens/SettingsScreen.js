import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator, TextInput, Platform, Alert, Modal, FlatList, Dimensions
} from 'react-native';

const { height } = Dimensions.get('window');
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuthStore } from '../../../store/useAuthStore';
import { useChatStore } from '../../../store/useChatStore';
import { authService, userService } from '../../../services/apiServices';
import { decodeEmoji } from '../../../utils/stringUtils';
import { BottomSheetContainer } from '../../../components/common/BottomSheetContainer';

const SECTIONS = [
  {
    title: 'Account',
    items: [
      { key: 'editProfile',    icon: 'person-outline',       label: 'Edit Profile' },
      { key: 'changePassword', icon: 'lock-closed-outline',  label: 'Change Password' },
      { key: 'notifications',  icon: 'notifications-outline', label: 'Notifications' },
      { key: 'privacy',        icon: 'shield-outline',        label: 'Privacy' },
      { key: 'blocked',        icon: 'ban-outline',           label: 'Blocked Accounts' },
      { key: 'deleteAccount',  icon: 'trash-outline',         label: 'Delete My Account' },
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
      { key: 'discoverPrefs', icon: 'options-outline',    label: 'Filters' },
      { key: 'location',      icon: 'location-outline',   label: 'Location' },
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
  const route = useRoute();
  const logoutAction = useAuthStore((s) => s.logout);
  const transactions = useChatStore((s) => s.transactions);
  const fetchTransactions = useChatStore((s) => s.fetchTransactions);
  const [txModalVisible, setTxModalVisible] = useState(false);
  const [blockedModalVisible, setBlockedModalVisible] = useState(false);
  const [notifModalVisible, setNotifModalVisible] = useState(false);
  const [privacyModalVisible, setPrivacyModalVisible] = useState(false);
  const [tosModalVisible, setTosModalVisible] = useState(false);
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [changePwdModalVisible, setChangePwdModalVisible] = useState(false);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [privacyData, setPrivacyData] = useState({ title: '', content: '', lastUpdated: '' });
  const [tosData, setTosData] = useState({ title: '', content: '', lastUpdated: '' });
  const [userData, setUserData] = useState(null);
  const [loadingBlocked, setLoadingBlocked] = useState(false);
  const [loadingNotifs, setLoadingNotifs] = useState(false);
  const [loadingPrivacy, setLoadingPrivacy] = useState(false);
  const [loadingTos, setLoadingTos] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [loadingChangePwd, setLoadingChangePwd] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const res = await userService.getMe();
      setUserData(res.data || res);
    } catch (e) {
      console.error('Fetch user data error:', e);
    }
  };

  useEffect(() => {
    if (blockedModalVisible) {
      fetchBlockedUsers();
    }
  }, [blockedModalVisible]);

  useEffect(() => {
    if (notifModalVisible || (route?.params?.openNotifications && !notifModalVisible)) {
      fetchNotifications();
      if (route?.params?.openNotifications) {
        setNotifModalVisible(true);
        // Clear params to avoid reopening on re-renders
        navigation.setParams({ openNotifications: undefined });
      }
    }
  }, [notifModalVisible, route?.params?.openNotifications]);

  useEffect(() => {
    if (privacyModalVisible) {
      fetchPrivacyPolicy();
    }
  }, [privacyModalVisible]);

  useEffect(() => {
    if (tosModalVisible) {
      fetchTermsOfService();
    }
  }, [tosModalVisible]);

  const fetchNotifications = async () => {
    setLoadingNotifs(true);
    try {
      const res = await userService.getNotifications();
      setNotifications(res.data?.notifications || []);
    } catch (e) {
      console.error('Fetch notifications error:', e);
    } finally {
      setLoadingNotifs(false);
    }
  };

  const fetchPrivacyPolicy = async () => {
    setLoadingPrivacy(true);
    try {
      const res = await userService.getPrivacyPolicy();
      const data = res.data || {};
      setPrivacyData({
        title: data.title || 'Privacy Policy',
        content: data.content || '',
        lastUpdated: data.lastUpdated || ''
      });
    } catch (e) {
      console.error('Fetch privacy policy error:', e);
    } finally {
      setLoadingPrivacy(false);
    }
  };

  const fetchTermsOfService = async () => {
    setLoadingTos(true);
    try {
      setTosData({
        title: 'Mingley Terms of Service',
        lastUpdated: '2024-05-19',
        content: `1. USER ELIGIBILITY
You must be at least 18 years of age to use Mingley. By creating an account, you represent and warrant that you meet this requirement.

2. ACCOUNT SECURITY
You are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account. If you suspect any unauthorized use, you must notify us immediately.

3. COMMUNITY GUIDELINES
Respect other users. Harassment, hate speech, and explicit unsolicited content are strictly prohibited and will lead to immediate account suspension. We promote a safe and inclusive environment for everyone.

4. COIN SYSTEM & PAYMENTS
Coins purchased are non-refundable. Commissions for SuperChats are credited only upon valid responses as per current system rates. Mingley reserves the right to adjust coin values and pricing.

5. PRIVACY
Your use of Mingley is also governed by our Privacy Policy. Please review it to understand our practices regarding data collection and usage.

6. LIMITATION OF LIABILITY
Mingley shall not be liable for any indirect, incidental, or consequential damages arising out of your use of the service.

7. TERMINATION
We reserve the right to terminate or suspend your account at our sole discretion, without notice, for conduct that we believe violates these Terms.`
      });
    } catch (e) {
      console.error('Fetch terms error:', e);
    } finally {
      setLoadingTos(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await userService.markAllNotificationsAsRead();
      fetchNotifications();
    } catch (e) {
      Alert.alert('Error', 'Failed to mark notifications as read');
    }
  };

  const fetchBlockedUsers = async () => {
    setLoadingBlocked(true);
    try {
      const res = await userService.getBlockedUsers();
      setBlockedUsers(res.data?.users || []);
    } catch (e) {
      console.error('Fetch blocked users error:', e);
    } finally {
      setLoadingBlocked(false);
    }
  };

  const handleUnblock = async (userId) => {
    try {
      await userService.unblockUser(userId);
      fetchBlockedUsers();
      Alert.alert('Success', 'User unblocked');
    } catch (e) {
      Alert.alert('Error', 'Failed to unblock user');
    }
  };

  const handleItem = useCallback((key) => {
    if (key === 'editProfile') {
      navigation.navigate('EditProfile');
    } else if (key === 'changePassword') {
      setChangePwdModalVisible(true);
    } else if (key === 'transactions') {
      fetchTransactions();
      setTxModalVisible(true);
    } else if (key === 'discoverPrefs') {
      navigation.navigate('Filter');
    } else if (key === 'location') {
      setLocationModalVisible(true);
    } else if (key === 'blocked') {
      setBlockedModalVisible(true);
    } else if (key === 'notifications') {
      setNotifModalVisible(true);
    } else if (key === 'privPolicy') {
      setPrivacyModalVisible(true);
    } else if (key === 'terms') {
      setTosModalVisible(true);
    } else if (key === 'deleteAccount') {
      handleDeleteAccount();
    } else {
      Alert.alert(key, 'Coming soon!');
    }
  }, [navigation, fetchTransactions]);

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to permanently delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await userService.deleteAccount({ reason: 'User requested' });
              Alert.alert('Success', 'Account deleted successfully.');
              logoutAction();
            } catch (e) {
              Alert.alert('Error', e.message || 'Failed to delete account');
            }
          }
        }
      ]
    );
  };

  const handleUpdateLocation = async (loc) => {
    setLoadingLocation(true);
    try {
      await userService.updateLocation({
        lat: loc.lat,
        lng: loc.lng,
        city: loc.city,
        country: loc.country
      });
      await fetchUserData();
      Alert.alert('Success', 'Location updated successfully!');
      setLocationModalVisible(false);
    } catch (e) {
      Alert.alert('Error', 'Failed to update location');
    } finally {
      setLoadingLocation(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    setLoadingChangePwd(true);
    try {
      await authService.changePassword({ currentPassword, newPassword });
      Alert.alert('Success', 'Password changed successfully!');
      setChangePwdModalVisible(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to change password');
    } finally {
      setLoadingChangePwd(false);
    }
  };

  const handleSignOut = useCallback(() => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out', style: 'destructive',
        onPress: async () => {
          try {
            await authService.logout();
            logoutAction();
          } catch (error) {
            console.error('Logout error:', error);
            // Even if API fails, we should logout locally
            logoutAction();
          }
        },
      },
    ]);
  }, [logoutAction]);

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
              {section.items.map((item, idx) => {
                let label = item.label;
                if (item.key === 'location' && userData?.location?.city) {
                  label = `${userData.location.city}, ${userData.location.country || ''}`;
                }
                return (
                  <SettingsRow
                    key={item.key}
                    icon={item.icon}
                    label={label}
                    isLast={idx === section.items.length - 1}
                    onPress={() => handleItem(item.key)}
                  />
                );
              })}
            </View>
          </View>
        ))}

        {/* Sign Out — at bottom, above safe area */}
        <View style={s.section}>
      {/* Blocked Accounts Modal */}
      <Modal visible={blockedModalVisible} transparent animationType="fade" onRequestClose={() => setBlockedModalVisible(false)}>
        <BottomSheetContainer onClose={() => setBlockedModalVisible(false)} height={height * 0.8}>
          <View style={{ flex: 1, width: '100%' }}>
            <View style={s.modalHeader}>
              <Text style={s.modalHeaderTitle}>Blocked Accounts</Text>
            </View>
            
            {loadingBlocked ? (
              <ActivityIndicator color="#E94057" style={{ marginTop: 40 }} />
            ) : (
              <FlatList
                data={blockedUsers}
                keyExtractor={item => item.id}
                contentContainerStyle={{ paddingVertical: 10 }}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                  <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' }}>
                    <View style={row.iconWrap}>
                      <Icon name="person-circle-outline" size={24} color="#999" />
                    </View>
                    <Text style={{ flex: 1, fontSize: 16, fontWeight: '600', color: '#111', marginLeft: 12 }}>{item.fullName || 'User'}</Text>
                    <TouchableOpacity 
                      onPress={() => handleUnblock(item.id)}
                      style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10, backgroundColor: '#FFF0F3', borderWidth: 1, borderColor: '#F2D0D6' }}
                    >
                      <Text style={{ color: '#E94057', fontWeight: '700' }}>Unblock</Text>
                    </TouchableOpacity>
                  </View>
                )}
                ListEmptyComponent={
                  <View style={{ padding: 60, alignItems: 'center' }}>
                    <Icon name="ban-outline" size={48} color="#EEE" />
                    <Text style={{ color: '#AAA', marginTop: 12, fontFamily: FONT }}>No blocked users</Text>
                  </View>
                }
              />
            )}
          </View>
        </BottomSheetContainer>
      </Modal>

      {/* Notifications Modal */}
      <Modal visible={notifModalVisible} transparent animationType="fade" onRequestClose={() => setNotifModalVisible(false)}>
        <BottomSheetContainer onClose={() => setNotifModalVisible(false)} height={height * 0.85}>
          <View style={{ flex: 1, width: '100%' }}>
            <View style={s.notifHeader}>
              <Text style={s.notifHeaderTitle}>Notifications</Text>
              <View style={{ flexDirection: 'row', gap: 15 }}>
                <TouchableOpacity onPress={handleMarkAllRead}>
                  <Icon name="checkmark-done-outline" size={22} color="#E94057" />
                </TouchableOpacity>
              </View>
            </View>
            
            {loadingNotifs ? (
              <ActivityIndicator color="#E94057" style={{ marginTop: 40 }} />
            ) : (
              <FlatList
                data={notifications}
                keyExtractor={item => item.id}
                contentContainerStyle={s.notifList}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => {
                  let iconName = 'notifications-outline';
                  let iconColor = '#999';
                  
                  if (item.type === 'match') {
                    iconName = 'heart';
                    iconColor = '#E94057';
                  } else if (item.type === 'coins') {
                    iconName = 'planet';
                    iconColor = '#E94057';
                  }

                  return (
                    <TouchableOpacity 
                      style={[s.notifItem, !item.isRead && s.notifUnread]}
                      onPress={async () => {
                        if (!item.isRead) {
                          await userService.markNotificationAsRead(item.id);
                          fetchNotifications();
                        }
                      }}
                    >
                      <View style={[s.notifIconWrap, { backgroundColor: item.isRead ? '#F5F5F5' : '#FFF' }]}>
                        <Icon name={iconName} size={20} color={iconColor} />
                      </View>
                      <View style={s.notifContent}>
                        <Text style={[s.notifTitle, !item.isRead && { fontWeight: '800' }]}>
                          {decodeEmoji(item.title)}
                        </Text>
                        <Text style={s.notifBody}>{decodeEmoji(item.body || item.message)}</Text>
                        <Text style={s.notifTime}>{new Date(item.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                }}
                ListEmptyComponent={
                  <View style={{ padding: 40, alignItems: 'center' }}>
                    <Text style={{ color: '#AAA', fontFamily: FONT }}>No notifications yet.</Text>
                  </View>
                }
              />
            )}
          </View>
        </BottomSheetContainer>
      </Modal>

      {/* Privacy Policy Modal */}
      <Modal visible={privacyModalVisible} transparent animationType="fade" onRequestClose={() => setPrivacyModalVisible(false)}>
        <BottomSheetContainer onClose={() => setPrivacyModalVisible(false)} height={height * 0.85}>
          <View style={{ flex: 1, width: '100%' }}>
            <View style={s.modalHeader}>
              <Text style={s.modalHeaderTitle}>{privacyData.title || 'Privacy Policy'}</Text>
            </View>
            {loadingPrivacy ? (
              <ActivityIndicator color="#E94057" style={{ marginTop: 40 }} />
            ) : (
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 20 }}>
                {privacyData.lastUpdated && (
                  <Text style={{ fontSize: 12, color: '#999', marginBottom: 16, fontFamily: FONT }}>
                    Last Updated: {privacyData.lastUpdated}
                  </Text>
                )}
                <Text style={{ fontSize: 15, color: '#333', lineHeight: 24, fontFamily: FONT }}>
                  {privacyData.content}
                </Text>
                <View style={{ height: 40 }} />
              </ScrollView>
            )}
          </View>
        </BottomSheetContainer>
      </Modal>

      {/* Terms of Service Modal */}
      <Modal visible={tosModalVisible} transparent animationType="fade" onRequestClose={() => setTosModalVisible(false)}>
        <BottomSheetContainer onClose={() => setTosModalVisible(false)} height={height * 0.85}>
          <View style={{ flex: 1, width: '100%' }}>
            <View style={s.modalHeader}>
              <Text style={s.modalHeaderTitle}>{tosData.title || 'Terms of Service'}</Text>
            </View>
            {loadingTos ? (
              <ActivityIndicator color="#E94057" style={{ marginTop: 40 }} />
            ) : (
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 20 }}>
                {tosData.lastUpdated && (
                  <Text style={{ fontSize: 12, color: '#999', marginBottom: 16, fontFamily: FONT }}>
                    Last Updated: {tosData.lastUpdated}
                  </Text>
                )}
                <Text style={{ fontSize: 15, color: '#333', lineHeight: 24, fontFamily: FONT }}>
                  {tosData.content}
                </Text>
                <View style={{ height: 40 }} />
              </ScrollView>
            )}
          </View>
        </BottomSheetContainer>
      </Modal>

      {/* Location Modal */}
      <Modal visible={locationModalVisible} transparent animationType="fade" onRequestClose={() => setLocationModalVisible(false)}>
        <BottomSheetContainer onClose={() => setLocationModalVisible(false)} height={height * 0.5}>
          <View style={{ flex: 1, width: '100%' }}>
            <View style={s.modalHeader}>
              <Text style={s.modalHeaderTitle}>Update Location</Text>
            </View>
            <View style={{ paddingVertical: 30, alignItems: 'center' }}>
              <View style={[row.iconWrap, { width: 60, height: 60, borderRadius: 30, marginBottom: 16 }]}>
                <Icon name="location" size={30} color="#E94057" />
              </View>
              <Text style={{ fontSize: 18, fontWeight: '700', color: '#111', marginBottom: 8 }}>
                {userData?.location?.city || 'City'}, {userData?.location?.country || 'Country'}
              </Text>
              <Text style={{ fontSize: 14, color: '#666', textAlign: 'center', paddingHorizontal: 40, marginBottom: 30 }}>
                Current Coordinates: {userData?.location?.lat ? Number(userData.location.lat).toFixed(4) : '0.0000'}, {userData?.location?.lng ? Number(userData.location.lng).toFixed(4) : '0.0000'}
              </Text>

              {loadingLocation ? (
                <ActivityIndicator color="#E94057" />
              ) : (
                <TouchableOpacity 
                  onPress={() => {
                    // Mocking location pick as requested by UI PUT API
                    handleUpdateLocation({
                      lat: 28.6139,
                      lng: 77.209,
                      city: 'Delhi',
                      country: 'India'
                    });
                  }}
                  style={{ 
                    backgroundColor: '#E94057', 
                    paddingHorizontal: 30, 
                    paddingVertical: 14, 
                    borderRadius: 100,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 10
                  }}
                >
                  <Icon name="refresh" size={18} color="#FFF" />
                  <Text style={{ color: '#FFF', fontWeight: '700' }}>Update Location</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </BottomSheetContainer>
      </Modal>

      {/* Change Password Modal */}
      <Modal visible={changePwdModalVisible} transparent animationType="fade" onRequestClose={() => setChangePwdModalVisible(false)}>
        <BottomSheetContainer onClose={() => setChangePwdModalVisible(false)} height={height * 0.6}>
          <View style={{ flex: 1, width: '100%' }}>
            <View style={s.modalHeader}>
              <Text style={s.modalHeaderTitle}>Change Password</Text>
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 20 }}>
              <Text style={s.inputLabel}>Current Password</Text>
              <TextInput
                style={s.amountInput}
                placeholder="Enter current password"
                placeholderTextColor="#A0A0A0"
                secureTextEntry
                value={currentPassword}
                onChangeText={setCurrentPassword}
              />

              <Text style={s.inputLabel}>New Password</Text>
              <TextInput
                style={s.amountInput}
                placeholder="Enter new password"
                placeholderTextColor="#A0A0A0"
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
              />

              <Text style={s.inputLabel}>Confirm New Password</Text>
              <TextInput
                style={s.amountInput}
                placeholder="Confirm new password"
                placeholderTextColor="#A0A0A0"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />

              {loadingChangePwd ? (
                <ActivityIndicator color="#E94057" style={{ marginTop: 10 }} />
              ) : (
                <TouchableOpacity 
                  onPress={handleChangePassword}
                  style={s.submitBtn}
                >
                  <Text style={s.submitBtnText}>Change Password</Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>
        </BottomSheetContainer>
      </Modal>

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
                const isCredit = item.direction === 'credit' || item.type === 'credit';
                return (
                  <View style={s.txItem}>
                    <View style={row.iconWrap}>
                      <Icon 
                        name={isCredit ? 'arrow-down-outline' : 'arrow-up-outline'} 
                        size={18} 
                        color={isCredit ? '#059669' : '#E94057'} 
                      />
                    </View>
                    <View style={s.txLeft}>
                      <Text style={s.txTitle}>{item.description || item.title}</Text>
                      <Text style={s.txDate}>
                        {new Date(item.createdAt || item.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </Text>
                    </View>
                    <Text style={[s.txAmount, isCredit ? s.txCredit : s.txDebit]}>
                      {isCredit ? '+' : '-'}{item.coins || item.amount} coins
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

  inputLabel: {
    fontSize: 14, fontWeight: '600', color: '#444', marginBottom: 8, fontFamily: FONT_MED,
  },
  amountInput: {
    borderWidth: 1.5, borderColor: '#F0F0F0', borderRadius: 14,
    paddingHorizontal: 16, paddingVertical: 12, fontSize: 16, color: '#111',
    marginBottom: 16, backgroundColor: '#FAFAFA',
  },
  submitBtn: {
    backgroundColor: PINK, borderRadius: 14, height: 52,
    justifyContent: 'center', alignItems: 'center', marginTop: 10,
  },
  submitBtnText: {
    color: '#FFF', fontSize: 16, fontWeight: '700', fontFamily: FONT_MED,
  },

  // Notification Modal Styles
  notifHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
    paddingHorizontal: 8,
  },
  notifHeaderTitle: { fontSize: 18, fontWeight: '700', color: '#111', fontFamily: FONT_MED },
  notifList: { paddingVertical: 10 },
  notifItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  notifUnread: {
    backgroundColor: '#FFF0F3',
  },
  notifIconWrap: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center', alignItems: 'center',
    marginRight: 12,
  },
  notifContent: { flex: 1 },
  notifTitle: { fontSize: 15, fontWeight: '700', color: '#111', fontFamily: FONT_MED, marginBottom: 2 },
  notifBody: { fontSize: 14, color: '#555', fontFamily: FONT, lineHeight: 20 },
  notifTime: { fontSize: 11, color: '#999', marginTop: 8, fontFamily: FONT },

  // Shared Modal Styles
  modalHeader: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
  },
  modalHeaderTitle: { fontSize: 18, fontWeight: '700', color: '#111', fontFamily: FONT_MED },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 20,
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
