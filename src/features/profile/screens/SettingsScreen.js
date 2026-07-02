import React, { useState, useCallback, useEffect } from 'react';
import * as Location from 'expo-location';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator, TextInput, Platform, Alert, Modal, FlatList, Dimensions, Switch
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
import { useSubscriptionStore } from '../../subscription/store/useSubscriptionStore';
import { useTheme } from '../../../theme/ThemeContext';

const SECTIONS = [
  {
    title: 'Account',
    items: [
      { key: 'editProfile', icon: 'person-outline', label: 'Edit Profile' },
      { key: 'changePassword', icon: 'lock-closed-outline', label: 'Change Password' },
      { key: 'notifications', icon: 'notifications-outline', label: 'Notifications' },
      { key: 'blocked', icon: 'ban-outline', label: 'Blocked Accounts' },
      { key: 'deleteAccount', icon: 'trash-outline', label: 'Delete My Account' },
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
      { key: 'discoverPrefs', icon: 'options-outline', label: 'Filters' },
      { key: 'location', icon: 'location-outline', label: 'Location' },
      { key: 'travelMode', icon: 'airplane-outline', label: 'Travel Mode' },
    ],
  },
  {
    title: 'Support',
    items: [
      { key: 'help', icon: 'help-circle-outline', label: 'Help & Support' },
      { key: 'terms', icon: 'document-text-outline', label: 'Terms of Service' },
      { key: 'privPolicy', icon: 'lock-closed-outline', label: 'Privacy Policy' },
    ],
  },
];

const SettingsRow = React.memo(({ icon, label, onPress, isLast, theme }) => {
  const iconColor = theme?.accent || '#E94057';
  const labelColor = theme?.textPrimary || '#222';
  const borderColor = theme?.sectionDivider || '#F5F5F5';
  const iconBg = theme?.iconWrapBackground || '#FFF0F3';
  const chevronColor = theme?.textSecondary || '#CCC';
  return (
    <TouchableOpacity
      style={[row.container, !isLast && { ...row.border, borderBottomColor: borderColor }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[row.iconWrap, { backgroundColor: iconBg }]}>
        <Icon name={icon} size={18} color={iconColor} />
      </View>
      <Text style={[row.label, { color: labelColor }]}>{label}</Text>
      <Icon name="chevron-forward" size={18} color={chevronColor} />
    </TouchableOpacity>
  );
});

const NotificationItem = React.memo(({ item, onPress, FONT }) => {
  const { theme, isDark } = useTheme();
  const handlePress = () => {
    if (!item.isRead && onPress) {
      onPress(item.id || item._id);
    }
  };

  let iconName = 'notifications-outline';
  let iconColor = isDark ? '#A0A0A0' : '#999';

  if (item.type === 'match') {
    iconName = 'heart';
    iconColor = theme.accent;
  } else if (item.type === 'coins') {
    iconName = 'planet';
    iconColor = theme.accent;
  }

  return (
    <TouchableOpacity
      style={[
        s.notifItem,
        !item.isRead && { backgroundColor: theme.iconWrapBackground },
        { borderBottomColor: theme.sectionDivider }
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={[s.notifIconWrap, { backgroundColor: item.isRead ? (isDark ? theme.cardBackground : '#F5F5F5') : (isDark ? theme.background : '#FFF') }]}>
        <Icon name={iconName} size={20} color={iconColor} />
      </View>
      <View style={s.notifContent}>
        <Text style={[s.notifTitle, !item.isRead && { fontWeight: '800' }, { color: theme.textPrimary }]}>
          {decodeEmoji(item.title)}
        </Text>
        <Text style={[s.notifBody, { color: theme.textSecondary }]}>{decodeEmoji(item.body || item.message)}</Text>
        <Text style={[s.notifTime, { color: theme.textSecondary }]}>{new Date(item.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</Text>
      </View>
    </TouchableOpacity>
  );
});

const TRAVEL_PRESETS = [
  { city: 'Delhi', country: 'India', lat: 28.6139, lng: 77.2090 },
  { city: 'Mumbai', country: 'India', lat: 19.0760, lng: 72.8777 },
  { city: 'Bangalore', country: 'India', lat: 12.9716, lng: 77.5946 },
  { city: 'Kolkata', country: 'India', lat: 22.5726, lng: 88.3639 },
  { city: 'Chennai', country: 'India', lat: 13.0827, lng: 80.2707 },
  { city: 'Hyderabad', country: 'India', lat: 17.3850, lng: 78.4867 },
];

export const SettingsScreen = React.memo(() => {
  const navigation = useNavigation();
  const route = useRoute();
  const { theme, isDark, toggleTheme } = useTheme();
  const logoutAction = useAuthStore((s) => s.logout);
  const transactions = useChatStore((s) => s.transactions);
  const fetchTransactions = useChatStore((s) => s.fetchTransactions);
  const currentStatus = useSubscriptionStore((s) => s.currentStatus);
  const [txModalVisible, setTxModalVisible] = useState(false);
  const [blockedModalVisible, setBlockedModalVisible] = useState(false);
  const [notifModalVisible, setNotifModalVisible] = useState(false);
  const [privacyModalVisible, setPrivacyModalVisible] = useState(false);
  const [tosModalVisible, setTosModalVisible] = useState(false);
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [changePwdModalVisible, setChangePwdModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
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
  const [travelModeEnabled, setTravelModeEnabled] = useState(false);
  const [loadingTravelMode, setLoadingTravelMode] = useState(false);
  const [loadingChangePwd, setLoadingChangePwd] = useState(false);
  const [locationTab, setLocationTab] = useState('myLocation');
  const [travelCityInput, setTravelCityInput] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    fetchUserData();
  }, []);

  // Sync travel mode toggle from server data
  useEffect(() => {
    if (userData?.isTravelMode !== undefined) {
      setTravelModeEnabled(userData.isTravelMode);
    }
  }, [userData]);

  const fetchUserData = async () => {
    try {
      const res = await userService.getMe();
      setUserData(res.data || res);
      await useSubscriptionStore.getState().fetchStatus();
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
    if (route.params?.openTravelMode) {
      setLocationTab('travelMode');
      setLocationModalVisible(true);
      navigation.setParams({ openTravelMode: undefined });
    }
  }, [route.params?.openTravelMode]);

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

  const handleAcceptPrivacyPolicy = async () => {
    try {
      const userParam = userData?.id || userData?._id || 'user';
      await userService.acceptPrivacyPolicy(userParam);
      Alert.alert('Success', 'Privacy Policy accepted successfully!');
      setPrivacyModalVisible(false);
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to accept privacy policy');
    }
  };

  const handleMarkOneRead = async (id) => {
    try {
      await userService.markNotificationAsRead(id);
      fetchNotifications();
    } catch (e) {
      console.error('Mark notification as read failed:', e);
    }
  };

  const performDeleteAccount = async () => {
    try {
      await userService.deleteAccount({ password: deletePassword, reason: 'User requested' });
      setDeletePassword('');
      if (Platform.OS === 'web') {
        alert('Account deleted successfully.');
      } else {
        Alert.alert('Success', 'Account deleted successfully.');
      }
      logoutAction();
    } catch (e) {
      if (Platform.OS === 'web') {
        alert(e.message || 'Failed to delete account');
      } else {
        Alert.alert('Error', e.message || 'Failed to delete account');
      }
    }
  };

  const handleDeleteAccount = useCallback(() => {
    setDeletePassword('');
    setDeleteModalVisible(true);
  }, []);

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
      setLocationTab('myLocation');
      setLocationModalVisible(true);
    } else if (key === 'travelMode') {
      setLocationTab('travelMode');
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
  }, [navigation, fetchTransactions, handleDeleteAccount]);

  // const handleUpdateLocation = async (manualCoords) => {



  //   setLoadingLocation(true);
  //   try {
  //     let lat, lng, city, country;
  //     if (manualCoords && manualCoords.lat) {
  //       lat = manualCoords.lat;
  //       lng = manualCoords.lng;
  //       city = manualCoords.city;
  //       country = manualCoords.country || 'India';
  //     } else {
  //       // Request GPS permission
  //       const { status } = await Location.requestForegroundPermissionsAsync();
  //       if (status !== 'granted') {
  //         Alert.alert('Permission Denied', 'Location permission is required to update your location.');
  //         setLoadingLocation(false);
  //         return;
  //       }
  //       // Get current GPS coordinates
  //       const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
  //       // Reverse geocode to get city/country
  //       const [geo] = await Location.reverseGeocodeAsync({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
  //       lat = loc.coords.latitude;
  //       lng = loc.coords.longitude;
  //       city = geo?.city || geo?.subregion || geo?.region || 'Unknown';
  //       country = geo?.country || 'Unknown';
  //     }

  //     await userService.updateLocation({ lat, lng, city, country });
  //     await fetchUserData();
  //     Alert.alert('Success', `Location updated to ${city}, ${country}!`);
  //     setLocationModalVisible(false);
  //   } catch (e) {
  //     Alert.alert('Error', 'Failed to update location. Please try again.');
  //   } finally {
  //     setLoadingLocation(false);
  //   }
  // };

  const handleUpdateLocation = async (manualCoords) => {
  setLoadingLocation(true);
  try {
    let lat, lng, city, country;
    if (manualCoords && manualCoords.lat) {
      lat = manualCoords.lat;
      lng = manualCoords.lng;
      city = manualCoords.city;
      country = manualCoords.country || 'India';
    } else {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to update your location.');
        setLoadingLocation(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      lat = loc.coords.latitude;
      lng = loc.coords.longitude;

      // Reverse geocode is best-effort — if it fails, still send lat/lng.
      // The backend does its own reverse geocode to fill in city/country.
      city = 'Unknown';
      country = 'Unknown';
      try {
        const [geo] = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
        city = geo?.city || geo?.subregion || geo?.region || 'Unknown';
        country = geo?.country || 'Unknown';
      } catch (geoErr) {
        console.warn('On-device reverse geocode failed, backend will resolve it:', geoErr);
      }
    }

    await userService.updateLocation({ lat, lng, city, country });
    await fetchUserData();
    Alert.alert('Success', `Location updated${city !== 'Unknown' ? ` to ${city}, ${country}` : ''}!`);
    setLocationModalVisible(false);
  } catch (e) {
    console.error('Location update error:', e);
    Alert.alert('Error', e?.response?.data?.message || e?.message || 'Failed to update location. Please try again.');
  } finally {
    setLoadingLocation(false);
  }
};
  const handleToggleTravelMode = async (enabled, travelDetails = null) => {
    setLoadingTravelMode(true);
    try {
      if (enabled && travelDetails) {
        await userService.updateLocation({
          lat: travelDetails.lat,
          lng: travelDetails.lng,
          city: travelDetails.city,
          country: travelDetails.country || 'India',
        });
        await userService.setTravelMode({
          enabled: true,
          city: travelDetails.city,
          lat: travelDetails.lat,
          lng: travelDetails.lng,
        });
        setTravelModeEnabled(true);
        Alert.alert('Travel Mode On', `Showing you people near ${travelDetails.city}.`);
      } else {
        await userService.setTravelMode({ enabled: false });
        setTravelModeEnabled(false);
        Alert.alert('Travel Mode Off', 'Back to your home location.');
      }
      await fetchUserData();
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to update Travel Mode.');
    } finally {
      setLoadingTravelMode(false);
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

  const handleSignOut = useCallback(async () => {
    try {
      await authService.logout();
      logoutAction();
    } catch (error) {
      console.error('Logout error:', error);
      // Even if API fails, we should logout locally
      logoutAction();
    }
  }, [logoutAction]);

  return (
    <SafeAreaView style={[s.container, { backgroundColor: theme.cardBackground }]}>
      {/* Header */}
      <View style={[s.header, { backgroundColor: theme.background, borderBottomColor: theme.actionButtonBorder }]}>
        <TouchableOpacity style={[s.backBtn, { backgroundColor: theme.cardBackground }]} onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={22} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={[s.headerTitle, { color: theme.textPrimary }]}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* ── Appearance Section (Dark Mode Toggle) ── */}
        <View style={s.section}>
          <Text style={[s.sectionTitle, { color: theme.textSecondary }]}>Appearance</Text>
          <View style={[s.card, { backgroundColor: theme.background, borderColor: theme.cardBorder, borderWidth: isDark ? 1 : 0 }]}>
            <View style={[row.container, { borderBottomWidth: 0 }]}>
              <View style={[row.iconWrap, { backgroundColor: theme.iconWrapBackground }]}>
                <Icon name={isDark ? 'moon' : 'sunny-outline'} size={18} color={theme.accent} />
              </View>
              <Text style={[row.label, { color: theme.textPrimary }]}>Dark Mode</Text>
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: '#767577', true: theme.accent }}
                thumbColor={isDark ? theme.accent : '#f4f3f4'}
              />
            </View>
          </View>
        </View>

        {SECTIONS.map((section) => (
          <View key={section.title} style={s.section}>
            <Text style={[s.sectionTitle, { color: theme.textSecondary }]}>{section.title}</Text>
            <View style={[s.card, { backgroundColor: theme.background, borderColor: theme.cardBorder, borderWidth: isDark ? 1 : 0 }]}>
              {section.items.map((item, idx) => {
                let label = item.label;
                if (item.key === 'location' && userData?.location?.city) {
                  label = `${userData.location.city}, ${userData.location.country || ''}`;
                }
                if (item.key === 'travelMode') {
                  label = travelModeEnabled
                    ? `Travelling: ${userData?.location?.city || 'Selected City'}`
                    : 'Travel Mode (Off)';
                }
                return (
                  <SettingsRow
                    key={item.key}
                    icon={item.icon}
                    label={label}
                    isLast={idx === section.items.length - 1}
                    onPress={() => handleItem(item.key)}
                    theme={theme}
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
                <View style={[s.modalHeader, { borderBottomColor: theme.sectionDivider }]}>
                  <Text style={[s.modalHeaderTitle, { color: theme.textPrimary }]}>Blocked Accounts</Text>
                </View>

                {loadingBlocked ? (
                  <ActivityIndicator color={theme.accent} style={{ marginTop: 40 }} />
                ) : (
                  <FlatList
                    data={blockedUsers}
                    keyExtractor={item => item.id || item._id}
                    contentContainerStyle={{ paddingVertical: 10 }}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item }) => (
                      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: theme.sectionDivider }}>
                        <View style={[row.iconWrap, { backgroundColor: theme.iconWrapBackground }]}>
                          <Icon name="person-circle-outline" size={24} color={theme.textSecondary} />
                        </View>
                        <Text style={{ flex: 1, fontSize: 16, fontWeight: '600', color: theme.textPrimary, marginLeft: 12 }}>{item.fullName || item.name || 'User'}</Text>
                        <TouchableOpacity
                          onPress={() => handleUnblock(item.id || item._id)}
                          style={{
                            paddingHorizontal: 16,
                            paddingVertical: 8,
                            borderRadius: 10,
                            backgroundColor: theme.iconWrapBackground,
                            borderWidth: 1,
                            borderColor: isDark ? theme.accent : '#F2D0D6'
                          }}
                        >
                          <Text style={{ color: theme.accent, fontWeight: '700' }}>Unblock</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                    ListEmptyComponent={
                      <View style={{ padding: 60, alignItems: 'center' }}>
                        <Icon name="ban-outline" size={48} color={theme.textSecondary} />
                        <Text style={{ color: theme.textSecondary, marginTop: 12, fontFamily: FONT }}>No blocked users</Text>
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
                <View style={[s.notifHeader, { borderBottomColor: theme.sectionDivider }]}>
                  <Text style={[s.notifHeaderTitle, { color: theme.textPrimary }]}>Notifications</Text>
                  <View style={{ flexDirection: 'row', gap: 15 }}>
                    <TouchableOpacity onPress={handleMarkAllRead}>
                      <Icon name="checkmark-done-outline" size={22} color={theme.accent} />
                    </TouchableOpacity>
                  </View>
                </View>

                {loadingNotifs ? (
                  <ActivityIndicator color={theme.accent} style={{ marginTop: 40 }} />
                ) : (
                  <FlatList
                    data={notifications}
                    keyExtractor={item => item.id || item._id}
                    contentContainerStyle={s.notifList}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item }) => (
                      <NotificationItem
                        item={item}
                        onPress={handleMarkOneRead}
                        FONT={FONT}
                      />
                    )}
                    ListEmptyComponent={
                      <View style={{ padding: 40, alignItems: 'center' }}>
                        <Text style={{ color: theme.textSecondary, fontFamily: FONT }}>No notifications yet.</Text>
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
                <View style={[s.modalHeader, { borderBottomColor: theme.sectionDivider }]}>
                  <Text style={[s.modalHeaderTitle, { color: theme.textPrimary }]}>{privacyData.title || 'Privacy Policy'}</Text>
                </View>
                {loadingPrivacy ? (
                  <ActivityIndicator color={theme.accent} style={{ marginTop: 40 }} />
                ) : (
                  <View style={{ flex: 1 }}>
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 20 }}>
                      {privacyData.lastUpdated && (
                        <Text style={{ fontSize: 12, color: theme.textSecondary, marginBottom: 16, fontFamily: FONT }}>
                          Last Updated: {privacyData.lastUpdated}
                        </Text>
                      )}
                      <Text style={{ fontSize: 15, color: theme.textPrimary, lineHeight: 24, fontFamily: FONT }}>
                        {privacyData.content}
                      </Text>
                      <View style={{ height: 20 }} />
                    </ScrollView>

                    <TouchableOpacity
                      onPress={handleAcceptPrivacyPolicy}
                      style={{
                        backgroundColor: theme.accent,
                        paddingVertical: 14,
                        borderRadius: 12,
                        alignItems: 'center',
                        marginBottom: 10,
                        shadowColor: theme.accent,
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.2,
                        shadowRadius: 5,
                        elevation: 3,
                      }}
                    >
                      <Text style={{ color: isDark ? '#0A0A0A' : '#FFF', fontWeight: '700', fontSize: 15, fontFamily: FONT_MED }}>Accept Privacy Policy</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </BottomSheetContainer>
          </Modal>

          {/* Terms of Service Modal */}
          <Modal visible={tosModalVisible} transparent animationType="fade" onRequestClose={() => setTosModalVisible(false)}>
            <BottomSheetContainer onClose={() => setTosModalVisible(false)} height={height * 0.85}>
              <View style={{ flex: 1, width: '100%' }}>
                <View style={[s.modalHeader, { borderBottomColor: theme.sectionDivider }]}>
                  <Text style={[s.modalHeaderTitle, { color: theme.textPrimary }]}>{tosData.title || 'Terms of Service'}</Text>
                </View>
                {loadingTos ? (
                  <ActivityIndicator color={theme.accent} style={{ marginTop: 40 }} />
                ) : (
                  <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 20 }}>
                    {tosData.lastUpdated && (
                      <Text style={{ fontSize: 12, color: theme.textSecondary, marginBottom: 16, fontFamily: FONT }}>
                        Last Updated: {tosData.lastUpdated}
                      </Text>
                    )}
                    <Text style={{ fontSize: 15, color: theme.textPrimary, lineHeight: 24, fontFamily: FONT }}>
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
            <BottomSheetContainer onClose={() => setLocationModalVisible(false)} height={height * 0.73}>
              <View style={{ flex: 1, width: '100%' }}>
                <View style={[s.modalHeader, { borderBottomColor: theme.sectionDivider }]}>
                  <Text style={[s.modalHeaderTitle, { color: theme.textPrimary }]}>Discovery Location</Text>
                </View>

                {/* Custom Segmented Tab Bar */}
                <View style={[s.modalTabBar, { borderBottomColor: theme.sectionDivider }]}>
                  <TouchableOpacity
                    style={[s.modalTabItem, locationTab === 'myLocation' && [s.modalTabItemActive, { borderBottomColor: theme.accent }]]}
                    onPress={() => setLocationTab('myLocation')}
                    activeOpacity={0.8}
                  >
                    <Icon name="location-outline" size={18} color={locationTab === 'myLocation' ? theme.accent : theme.textSecondary} />
                    <Text style={[s.modalTabItemText, { color: locationTab === 'myLocation' ? theme.accent : theme.textSecondary }, locationTab === 'myLocation' && s.modalTabItemTextActive]}>My Location</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[s.modalTabItem, locationTab === 'travelMode' && [s.modalTabItemActive, { borderBottomColor: theme.accent }]]}
                    onPress={() => setLocationTab('travelMode')}
                    activeOpacity={0.8}
                  >
                    <Icon name="airplane-outline" size={18} color={locationTab === 'travelMode' ? theme.accent : theme.textSecondary} style={{ transform: [{ rotate: '45deg' }] }} />
                    <Text style={[s.modalTabItemText, { color: locationTab === 'travelMode' ? theme.accent : theme.textSecondary }, locationTab === 'travelMode' && s.modalTabItemTextActive]}>Travel Mode</Text>
                  </TouchableOpacity>
                </View>

                {locationTab === 'myLocation' ? (
                  <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                    <View style={[row.iconWrap, { backgroundColor: theme.iconWrapBackground, width: 60, height: 60, borderRadius: 30, marginBottom: 16 }]}>
                      <Icon name="location" size={30} color={theme.accent} />
                    </View>
                    <Text style={{ fontSize: 18, fontWeight: '700', color: theme.textPrimary, marginBottom: 30 }}>
                      {userData?.location?.city || 'City'}, {userData?.location?.country || 'Country'}
                    </Text>

                    {loadingLocation ? (
                      <ActivityIndicator color={theme.accent} />
                    ) : (
                      <View style={{ flexDirection: 'column', gap: 12, width: '80%', alignItems: 'center' }}>
                        <TouchableOpacity
                          onPress={() => handleUpdateLocation()}
                          style={{
                            backgroundColor: theme.accent,
                            paddingHorizontal: 30,
                            paddingVertical: 14,
                            borderRadius: 100,
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 10,
                            width: '100%',
                            justifyContent: 'center'
                          }}
                        >
                          <Icon name="locate" size={18} color={isDark ? '#0A0A0A' : '#FFF'} />
                          <Text style={{ color: isDark ? '#0A0A0A' : '#FFF', fontWeight: '700' }}>Detect via GPS</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                ) : (() => {
                  const planName = (currentStatus?.isActive && currentStatus?.planName)
                    ? currentStatus.planName.toLowerCase()
                    : 'free';
                  const isVIP = planName === 'vip';

                  return (
                    <View style={{ flex: 1, position: 'relative' }}>
                      <ScrollView
                        showsVerticalScrollIndicator={false}
                        style={{ paddingHorizontal: 10, paddingVertical: 15 }}
                        contentContainerStyle={{ paddingBottom: 40 }}
                        pointerEvents={isVIP ? 'auto' : 'none'}
                      >
                        <Text style={{ fontSize: 13, color: theme.textSecondary, lineHeight: 18, marginBottom: 16 }}>
                          Travel Mode lets you virtually change your city so you can find matches from other cities worldwide!
                        </Text>

                        {/* Active Travel Mode Status Banner */}
                        <View style={[
                          s.travelStatusBanner,
                          travelModeEnabled 
                            ? [s.travelStatusBannerActive, isDark && { backgroundColor: 'rgba(46, 125, 50, 0.15)', borderColor: 'rgba(46, 125, 50, 0.3)' }] 
                            : [s.travelStatusBannerInactive, isDark && { backgroundColor: theme.cardBackground, borderColor: theme.actionButtonBorder }]
                        ]}>
                          <Icon
                            name={travelModeEnabled ? 'navigate-circle' : 'airplane-outline'}
                            size={20}
                            color={travelModeEnabled ? (isDark ? '#4CAF50' : '#2E7D32') : theme.textSecondary}
                            style={!travelModeEnabled && { transform: [{ rotate: '45deg' }] }}
                          />
                          <Text style={[s.travelStatusText, travelModeEnabled ? { color: isDark ? '#4CAF50' : '#2E7D32' } : { color: theme.textSecondary }]}>
                            {travelModeEnabled
                              ? `Travelling in: ${userData?.location?.city || 'Selected City'}`
                              : 'Travel Mode is currently Off'}
                          </Text>
                        </View>

                        {/* Quick Pick presets */}
                        <Text style={{ fontSize: 14, fontWeight: '700', color: theme.textPrimary, marginTop: 16, marginBottom: 10 }}>Popular Destinations</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingBottom: 10 }}>
                          {TRAVEL_PRESETS.map((preset) => {
                            const isActivePreset = userData?.location?.city?.toLowerCase() === preset.city.toLowerCase() && travelModeEnabled;
                            return (
                              <TouchableOpacity
                                key={preset.city}
                                onPress={() => {
                                  setTravelCityInput(preset.city);
                                  handleToggleTravelMode(true, preset);
                                }}
                                style={[
                                  s.travelPresetCard,
                                  { backgroundColor: theme.background, borderColor: theme.actionButtonBorder },
                                  isActivePreset && [s.travelPresetCardActive, { borderColor: theme.accent, backgroundColor: theme.iconWrapBackground }]
                                ]}
                                activeOpacity={0.8}
                              >
                                <Text style={{ fontSize: 22, marginBottom: 2 }}>🇮🇳</Text>
                                <Text style={[s.travelPresetName, { color: theme.textPrimary }, isActivePreset && { color: theme.accent }]}>{preset.city}</Text>
                              </TouchableOpacity>
                            );
                          })}
                        </ScrollView>

                        {/* Manual City entry */}
                        <Text style={{ fontSize: 14, fontWeight: '700', color: theme.textPrimary, marginTop: 16, marginBottom: 10 }}>Custom City Destination</Text>
                        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
                          <TextInput
                            style={[s.amountInput, { flex: 1, marginBottom: 0, backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, color: theme.textPrimary }]}
                            placeholder="Enter city name (e.g. Mumbai, Paris)"
                            placeholderTextColor="#A0A0A0"
                            value={travelCityInput}
                            onChangeText={setTravelCityInput}
                          />
                          <TouchableOpacity
                            onPress={() => {
                              if (!travelCityInput.trim()) {
                                Alert.alert('Error', 'Please enter a city name.');
                                return;
                              }
                              const found = TRAVEL_PRESETS.find(p => p.city.toLowerCase() === travelCityInput.trim().toLowerCase());
                              if (found) {
                                handleToggleTravelMode(true, found);
                              } else {
                                handleToggleTravelMode(true, {
                                  city: travelCityInput.trim(),
                                  lat: 28.6139 + (Math.random() - 0.5) * 2,
                                  lng: 77.2090 + (Math.random() - 0.5) * 2,
                                });
                              }
                            }}
                            style={{
                              backgroundColor: theme.accent,
                              width: 52,
                              height: 52,
                              borderRadius: 14,
                              justifyContent: 'center',
                              alignItems: 'center',
                            }}
                          >
                            {loadingTravelMode ? (
                              <ActivityIndicator color={isDark ? '#0A0A0A' : '#FFF'} />
                            ) : (
                              <Icon name="search-outline" size={20} color={isDark ? '#0A0A0A' : '#FFF'} />
                            )}
                          </TouchableOpacity>
                        </View>

                        {travelModeEnabled && (
                          <TouchableOpacity
                            onPress={() => handleToggleTravelMode(false)}
                            style={[s.turnOffTravelBtn, { backgroundColor: theme.iconWrapBackground, borderColor: isDark ? theme.accent : '#FFD6DE' }]}
                            activeOpacity={0.8}
                          >
                            <Icon name="power" size={16} color={theme.accent} style={{ marginRight: 6 }} />
                            <Text style={{ color: theme.accent, fontWeight: '700' }}>Turn Off Travel Mode</Text>
                          </TouchableOpacity>
                        )}
                      </ScrollView>
                      {!isVIP && (
                        <View style={[s.lockOverlay, { backgroundColor: isDark ? 'rgba(10,10,10,0.92)' : 'rgba(255, 255, 255, 0.90)' }]}>
                          <Icon name="lock-closed-outline" size={44} color={theme.accent} style={{ marginBottom: 12 }} />
                          <Text style={[s.lockTitle, { color: theme.textPrimary }]}>VIP Feature Only</Text>
                          <Text style={[s.lockDesc, { color: theme.textSecondary }]}>
                            Travel Mode is an exclusive feature for VIP members. Upgrade now to change your virtual location globally!
                          </Text>
                          <TouchableOpacity
                            style={[s.lockBtn, { backgroundColor: theme.accent }]}
                            onPress={() => {
                              setLocationModalVisible(false);
                              navigation.navigate('SubscriptionPlans', { selectPlanName: 'vip' });
                            }}
                          >
                            <Text style={[s.lockBtnText, { color: isDark ? '#0A0A0A' : '#FFF' }]}>Upgrade to VIP</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  );
                })()}
              </View>
            </BottomSheetContainer>
          </Modal>

          {/* Change Password Modal */}
          <Modal visible={changePwdModalVisible} transparent animationType="fade" onRequestClose={() => setChangePwdModalVisible(false)}>
            <BottomSheetContainer onClose={() => setChangePwdModalVisible(false)} height={height * 0.6}>
              <View style={{ flex: 1, width: '100%' }}>
                <View style={[s.modalHeader, { borderBottomColor: theme.sectionDivider }]}>
                  <Text style={[s.modalHeaderTitle, { color: theme.textPrimary }]}>Change Password</Text>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 20 }}>
                  <Text style={[s.inputLabel, { color: theme.textSecondary }]}>Current Password</Text>
                  <TextInput
                    style={[s.amountInput, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, color: theme.textPrimary }]}
                    placeholder="Enter current password"
                    placeholderTextColor="#A0A0A0"
                    secureTextEntry
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                  />

                  <Text style={[s.inputLabel, { color: theme.textSecondary }]}>New Password</Text>
                  <TextInput
                    style={[s.amountInput, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, color: theme.textPrimary }]}
                    placeholder="Enter new password"
                    placeholderTextColor="#A0A0A0"
                    secureTextEntry
                    value={newPassword}
                    onChangeText={setNewPassword}
                  />

                  <Text style={[s.inputLabel, { color: theme.textSecondary }]}>Confirm New Password</Text>
                  <TextInput
                    style={[s.amountInput, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, color: theme.textPrimary }]}
                    placeholder="Confirm new password"
                    placeholderTextColor="#A0A0A0"
                    secureTextEntry
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                  />

                  {loadingChangePwd ? (
                    <ActivityIndicator color={theme.accent} style={{ marginTop: 10 }} />
                  ) : (
                    <TouchableOpacity
                      onPress={handleChangePassword}
                      style={[s.submitBtn, { backgroundColor: theme.accent }]}
                    >
                      <Text style={[s.submitBtnText, { color: isDark ? '#0A0A0A' : '#FFF' }]}>Change Password</Text>
                    </TouchableOpacity>
                  )}
                </ScrollView>
              </View>
            </BottomSheetContainer>
          </Modal>

          <TouchableOpacity style={[s.signOutBtn, { backgroundColor: theme.background, borderColor: isDark ? theme.accent : '#F2D0D6' }]} onPress={handleSignOut}>
            <Icon name="log-out-outline" size={18} color={theme.accent} />
            <Text style={[s.signOutText, { color: theme.accent }]}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Transaction History Modal */}
      <Modal visible={txModalVisible} transparent animationType="fade" onRequestClose={() => setTxModalVisible(false)}>
        <BottomSheetContainer onClose={() => setTxModalVisible(false)} height={600}>
          <View style={{ flex: 1, width: '100%' }}>
            <View style={[s.txHeader, { borderBottomColor: theme.sectionDivider }]}>
              <Text style={[s.txHeaderTitle, { color: theme.textPrimary }]}>Transaction History</Text>
            </View>
            <FlatList
              data={transactions}
              keyExtractor={(item) => item.id}
              contentContainerStyle={s.txList}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={<Text style={[s.txEmpty, { color: theme.textSecondary }]}>No transactions yet.</Text>}
              renderItem={({ item }) => {
                const isCredit = item.direction === 'credit' || item.type === 'credit';
                return (
                  <View style={[s.txItem, { borderBottomColor: theme.sectionDivider }]}>
                    <View style={[row.iconWrap, { backgroundColor: theme.iconWrapBackground }]}>
                      <Icon
                        name={isCredit ? 'arrow-down-outline' : 'arrow-up-outline'}
                        size={18}
                        color={isCredit ? '#059669' : theme.likeButton}
                      />
                    </View>
                    <View style={s.txLeft}>
                      <Text style={[s.txTitle, { color: theme.textPrimary }]}>{item.description || item.title}</Text>
                      <Text style={[s.txDate, { color: theme.textSecondary }]}>
                        {new Date(item.createdAt || item.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </Text>
                    </View>
                    <Text style={[s.txAmount, isCredit ? s.txCredit : { color: theme.likeButton }]}>
                      {isCredit ? '+' : '-'}{item.coins || item.amount} coins
                    </Text>
                  </View>
                );
              }}
            />
          </View>
        </BottomSheetContainer>
      </Modal>

      {/* Delete Account Warning Modal */}
      <Modal visible={deleteModalVisible} transparent animationType="fade" onRequestClose={() => setDeleteModalVisible(false)}>
        <View style={s.alertOverlay}>
          <View style={[s.alertBox, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder, borderWidth: isDark ? 1 : 0 }]}>
            <View style={[s.alertIconWrap, { backgroundColor: theme.iconWrapBackground }]}>
              <Icon name="warning-outline" size={32} color={theme.likeButton} />
            </View>
            <Text style={[s.alertTitle, { color: theme.textPrimary }]}>Delete Account</Text>
            <Text style={[s.alertDescription, { color: theme.textSecondary }]}>
              Are you sure you want to permanently delete your account? This action cannot be undone and you will lose all your data. Please enter your password to confirm.
            </Text>
            <TextInput
              style={[s.alertPasswordInput, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, color: theme.textPrimary }]}
              placeholder="Enter your password"
              placeholderTextColor="#A0A0A0"
              secureTextEntry
              value={deletePassword}
              onChangeText={setDeletePassword}
            />
            <View style={s.alertActionRow}>
              <TouchableOpacity
                style={[s.alertBtn, s.alertBtnCancel, { backgroundColor: isDark ? '#333' : '#F5F5F5' }]}
                onPress={() => setDeleteModalVisible(false)}
                activeOpacity={0.8}
              >
                <Text style={[s.alertBtnCancelText, { color: theme.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  s.alertBtn,
                  s.alertBtnDelete,
                  { backgroundColor: theme.likeButton },
                  !deletePassword.trim() && (isDark ? { backgroundColor: '#55222A', opacity: 0.5 } : s.alertBtnDeleteDisabled)
                ]}
                onPress={() => {
                  if (!deletePassword.trim()) {
                    Alert.alert('Error', 'Please enter your password to proceed.');
                    return;
                  }
                  setDeleteModalVisible(false);
                  performDeleteAccount();
                }}
                disabled={!deletePassword.trim()}
                activeOpacity={0.8}
              >
                <Text style={s.alertBtnDeleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
});

const FONT = Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif';
const FONT_MED = Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif-medium';
const PINK = '#E94057';

const s = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 12,
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
    boxShadow: '0px -4px 10px rgba(0,0,0,0.1)',
    elevation: 20,
  },
  alertOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  alertBox: {
    width: '90%',
    maxWidth: 340,
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  alertIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFF0F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  alertTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111',
    fontFamily: FONT_MED,
    marginBottom: 8,
    textAlign: 'center',
  },
  alertDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    fontFamily: FONT,
    marginBottom: 24,
  },
  alertActionRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  alertBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertBtnCancel: {
    backgroundColor: '#F5F5F5',
  },
  alertBtnCancelText: {
    color: '#666',
    fontWeight: '700',
    fontSize: 15,
    fontFamily: FONT_MED,
  },
  alertBtnDelete: {
    backgroundColor: '#E94057',
  },
  alertBtnDeleteText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 15,
    fontFamily: FONT_MED,
  },
  alertPasswordInput: {
    width: '100%',
    borderWidth: 1.5,
    borderColor: '#F0F0F0',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111',
    backgroundColor: '#FAFAFA',
    marginBottom: 20,
    fontFamily: FONT,
  },
  alertBtnDeleteDisabled: {
    backgroundColor: '#F2A0AC',
    opacity: 0.7,
  },
  modalTabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1.5,
    borderBottomColor: '#F0F0F0',
    marginBottom: 10,
  },
  modalTabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  modalTabItemActive: {
    borderBottomColor: '#E94057',
  },
  modalTabItemText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  modalTabItemTextActive: {
    color: '#E94057',
    fontWeight: '700',
  },
  travelStatusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 10,
  },
  travelStatusBannerActive: {
    backgroundColor: '#F0FDF4',
    borderColor: '#C6F6D5',
  },
  travelStatusBannerInactive: {
    backgroundColor: '#F9FAFB',
    borderColor: '#E5E7EB',
  },
  travelStatusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  travelPresetCard: {
    backgroundColor: '#FFF',
    borderWidth: 1.5,
    borderColor: '#F0F0F0',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    minWidth: 90,
  },
  travelPresetCardActive: {
    borderColor: '#E94057',
    backgroundColor: '#FFF0F3',
  },
  travelPresetName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#444',
  },
  turnOffTravelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF0F3',
    borderWidth: 1.5,
    borderColor: '#FFD6DE',
    borderRadius: 14,
    paddingVertical: 12,
    marginTop: 10,
    width: '100%',
  },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.90)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    borderRadius: 18,
    zIndex: 10,
  },
  lockTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  lockDesc: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 24,
  },
  lockBtn: {
    backgroundColor: '#E94057',
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 22,
    shadowColor: '#E94057',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  lockBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
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
