import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, RefreshControl, Dimensions, Modal, FlatList, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { ProfileHeader } from '../components/ProfileHeader';
import { PhotoGrid } from '../components/PhotoGrid';
import { InterestChips } from '../components/InterestChips';
import { MembershipCard } from '../components/MembershipCard';
import { authService, userService, walletService } from '../../../services/apiServices';
import { useProfileStore } from '../store/useProfileStore';
import { useAuthStore } from '../../../store/useAuthStore';
import { useChatStore } from '../../../store/useChatStore';
import { BottomSheetContainer } from '../../../components/common/BottomSheetContainer';
import { useSubscriptionStore } from '../../subscription/store/useSubscriptionStore';
import { CashoutModal, VerifyModal } from '../../../components/SharedFinanceModals';

const { height } = Dimensions.get('window');

export const ProfileScreen = React.memo(() => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const { profile, loading, fetchProfile } = useProfileStore();
  const fetchStatus = useSubscriptionStore((state) => state.fetchStatus);
  const setDepositModalVisible = useChatStore((s) => s.setDepositModalVisible);
  const fetchWalletBalance = useChatStore((s) => s.fetchWalletBalance);
  const logoutAction = useAuthStore((s) => s.logout);

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
            logoutAction();
          }
        },
      },
    ]);
  }, [logoutAction]);

  const [refreshing, setRefreshing] = useState(false);
  const [notifModalVisible, setNotifModalVisible] = useState(false);
  const [cashoutModalVisible, setCashoutModalVisible] = useState(false);
  const [verifyModalVisible, setVerifyModalVisible] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifs, setLoadingNotifs] = useState(false);
  const [coinPackages, setCoinPackages] = useState([]);

  useEffect(() => {
    if (isFocused) {
      fetchProfile();
      fetchStatus();
      fetchWalletBalance();
    }
  }, [isFocused, fetchProfile, fetchStatus, fetchWalletBalance]);

  // Only fetch coin packages for male users (API rejects for female/woman)
  useEffect(() => {
    if (isFocused && profile?.gender) {
      const gender = profile.gender.toLowerCase();
      const isMale = gender === 'male' || gender === 'man';
      if (isMale) {
        fetchCoinPackages();
      }
    }
  }, [isFocused, profile?.gender]);

  useEffect(() => {
    if (notifModalVisible) {
      fetchNotifications();
    }
  }, [notifModalVisible]);

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

  const fetchCoinPackages = async () => {
    try {
      const res = await walletService.getPackages();
      setCoinPackages(res.data?.packages || res.packages || []);
    } catch (_) {
      // Silently ignore — packages may not be available for this user
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

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchProfile();
    setRefreshing(false);
  }, [fetchProfile]);

  const profileData = profile || {};

  const handleManageSubscription = useCallback(() => {
    navigation.navigate('SubscriptionPlans');
  }, [navigation]);

  const handleChangeAvatar = useCallback(() => {
    const avatarChoices = [
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
    ];

    Alert.alert('Change Profile Photo', 'Choose a sample photo for now.', [
      {
        text: 'Style 1',
        onPress: async () => {
          try {
            await userService.uploadImage({ url: avatarChoices[0], isPrimary: true });
            await fetchProfile();
          } catch (e) {
            Alert.alert('Error', 'Failed to update profile photo');
          }
        },
      },
      {
        text: 'Style 2',
        onPress: async () => {
          try {
            await userService.uploadImage({ url: avatarChoices[1], isPrimary: true });
            await fetchProfile();
          } catch (e) {
            Alert.alert('Error', 'Failed to update profile photo');
          }
        },
      },
      {
        text: 'Style 3',
        onPress: async () => {
          try {
            await userService.uploadImage({ url: avatarChoices[2], isPrimary: true });
            await fetchProfile();
          } catch (e) {
            Alert.alert('Error', 'Failed to update profile photo');
          }
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }, [fetchProfile]);

  if (!profile && loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E94057" />
      </View>
    );
  }

  const handleSetPrimary = async (imageId) => {
    try {
      await userService.setPrimaryImage(imageId);
      fetchProfile();
    } catch (e) {
      Alert.alert('Error', 'Failed to set primary image');
    }
  };

  const handleDeletePhoto = async (imageId) => {
    Alert.alert('Delete Photo', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await userService.deleteImage(imageId);
            fetchProfile();
          } catch (e) {
            Alert.alert('Error', 'Failed to delete photo');
          }
        },
      },
    ]);
  };

  const isFemale = profileData.gender?.toLowerCase() === 'female' || profileData.gender?.toLowerCase() === 'woman';

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#E94057" />}
      >
        <ProfileHeader
          profile={profileData}
          onEditAvatar={handleChangeAvatar}
          onSettings={() => navigation.navigate('Settings')}
          onPressNotifications={() => setNotifModalVisible(true)}
          hasNotifications={notifications.some((n) => !n.isRead)}
        />

        <View style={styles.content}>
          <View style={styles.section}>
            <PhotoGrid
              photos={profileData.images || []}
              onAdd={() => Alert.alert('Upload', 'Image upload coming soon!')}
              onSetPrimary={handleSetPrimary}
              onDelete={handleDeletePhoto}
              onEditLabel={() => {
                if (profileData.images && profileData.images.length > 0) {
                  navigation.navigate('Gallery', { images: profileData.images, initialIndex: 0 });
                }
              }}
            />
          </View>

          <View style={styles.section}>
            <InterestChips interests={profileData.interests || []} onSave={fetchProfile} />
          </View>

          <MembershipCard
            onWithdraw={() => setCashoutModalVisible(true)}
            onTopUp={() => setDepositModalVisible(true)}
            onManage={handleManageSubscription}
          />

          {/* Coin Packages Section */}
          {coinPackages.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Coin Packages</Text>
              <View style={styles.packagesGrid}>
                {coinPackages.map((pkg) => (
                  <TouchableOpacity
                    key={pkg.id}
                    style={styles.packageCard}
                    onPress={() => setDepositModalVisible(true)}
                    activeOpacity={0.8}
                  >
                    {pkg.isPopular && (
                      <View style={styles.popularBadge}>
                        <Text style={styles.popularBadgeText}>Popular</Text>
                      </View>
                    )}
                    <Icon name="wallet-outline" size={24} color="#FFD700" />
                    <Text style={styles.packageCoins}>{pkg.coins}</Text>
                    <Text style={styles.packageCoinsLabel}>coins</Text>
                    <Text style={styles.packagePrice}>₹{pkg.price}</Text>
                    {pkg.bonus > 0 && (
                      <Text style={styles.packageBonus}>+{pkg.bonus} bonus</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account Options</Text>
            <View style={styles.actionCard}>
              <TouchableOpacity style={styles.actionRow} onPress={() => navigation.navigate('EditProfile')}>
                <View style={styles.actionIconWrap}>
                  <Icon name="person-outline" size={18} color="#E94057" />
                </View>
                <Text style={styles.actionLabel}>Edit Profile</Text>
                <Icon name="chevron-forward" size={16} color="#CCC" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionRow} onPress={() => setVerifyModalVisible(true)}>
                <View style={styles.actionIconWrap}>
                  <Icon name="shield-checkmark-outline" size={18} color="#E94057" />
                </View>
                <Text style={styles.actionLabel}>Verify Identity</Text>
                <Icon name="chevron-forward" size={16} color="#CCC" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionRow} onPress={() => navigation.navigate('Filter')}>
                <View style={styles.actionIconWrap}>
                  <Icon name="options-outline" size={18} color="#E94057" />
                </View>
                <Text style={styles.actionLabel}>Match Filters</Text>
                <Icon name="chevron-forward" size={16} color="#CCC" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionRow} onPress={() => navigation.navigate('Settings')}>
                <View style={styles.actionIconWrap}>
                  <Icon name="settings-outline" size={18} color="#E94057" />
                </View>
                <Text style={styles.actionLabel}>Account Settings</Text>
                <Icon name="chevron-forward" size={16} color="#CCC" />
              </TouchableOpacity>

              <TouchableOpacity style={[styles.actionRow, styles.lastActionRow]} onPress={handleSignOut}>
                <View style={styles.actionIconWrap}>
                  <Icon name="log-out-outline" size={18} color="#E94057" />
                </View>
                <Text style={[styles.actionLabel, { color: '#E94057', fontWeight: '700' }]}>Sign Out</Text>
                <Icon name="chevron-forward" size={16} color="#E94057" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      <Modal visible={notifModalVisible} transparent animationType="fade" onRequestClose={() => setNotifModalVisible(false)}>
        <BottomSheetContainer onClose={() => setNotifModalVisible(false)} height={height * 0.85}>
          <View style={styles.modalContent}>
            <View style={styles.notifHeader}>
              <Text style={styles.notifHeaderTitle}>Notifications</Text>
              <TouchableOpacity onPress={handleMarkAllRead}>
                <Icon name="checkmark-done-outline" size={22} color="#E94057" />
              </TouchableOpacity>
            </View>

            {loadingNotifs ? (
              <ActivityIndicator color="#E94057" style={{ marginTop: 40 }} />
            ) : (
              <FlatList
                data={notifications}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.notifList}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                  <View style={[styles.notifItem, !item.isRead && styles.notifItemUnread]}>
                    <View style={[styles.notifIconWrap, { backgroundColor: item.type === 'MATCH' ? '#FFF0F3' : item.type === 'SUPERCHAT' ? '#F3E8FF' : '#F0F9FF' }]}>
                      <Icon
                        name={item.type === 'MATCH' ? 'heart-circle' : item.type === 'SUPERCHAT' ? 'flash' : 'megaphone-outline'}
                        size={22}
                        color={item.type === 'MATCH' ? '#E94057' : item.type === 'SUPERCHAT' ? '#7C3AED' : '#0EA5E9'}
                      />
                    </View>
                    <View style={styles.notifTextWrap}>
                      <Text style={styles.notifTitle}>{item.title}</Text>
                      <Text style={styles.notifBody}>{item.body}</Text>
                      <Text style={styles.notifTime}>{new Date(item.createdAt).toLocaleDateString()}</Text>
                    </View>
                    {!item.isRead && <View style={styles.unreadDot} />}
                  </View>
                )}
                ListEmptyComponent={
                  <View style={styles.emptyState}>
                    <Icon name="notifications-off-outline" size={48} color="#DDD" />
                    <Text style={styles.emptyStateText}>No notifications yet</Text>
                  </View>
                }
              />
            )}
          </View>
        </BottomSheetContainer>
      </Modal>

      <CashoutModal 
        visible={cashoutModalVisible} 
        onClose={() => setCashoutModalVisible(false)} 
      />
      <VerifyModal 
        visible={verifyModalVisible} 
        onClose={() => setVerifyModalVisible(false)} 
      />
     </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 20 },
  section: { marginBottom: 12 },

  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
    paddingLeft: 4,
  },
  actionCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  lastActionRow: {
    borderBottomWidth: 0,
  },
  actionIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FFF0F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actionLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  membershipIcon: { marginLeft: 20 },
  modalContent: { flex: 1, width: '100%' },
  notifHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  notifHeaderTitle: { fontSize: 20, fontWeight: '800', color: '#111' },
  notifList: { paddingBottom: 30 },
  notifItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F8F9FA',
    alignItems: 'center',
  },
  notifItemUnread: { backgroundColor: '#FFF9FA' },
  notifIconWrap: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  notifTextWrap: { flex: 1, marginLeft: 12 },
  notifTitle: { fontSize: 15, fontWeight: '700', color: '#111', marginBottom: 2 },
  notifBody: { fontSize: 14, color: '#666', lineHeight: 20 },
  notifTime: { fontSize: 12, color: '#AAA', marginTop: 4 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#E94057', marginLeft: 10 },
  emptyState: { padding: 60, alignItems: 'center' },
  emptyStateText: { color: '#AAA', marginTop: 12 },

  // Coin Packages
  packagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  packageCard: {
    width: '31%',
    backgroundColor: '#FFF',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    position: 'relative',
    overflow: 'hidden',
  },
  popularBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#E94057',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderBottomLeftRadius: 8,
  },
  popularBadgeText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '800',
  },
  packageCoins: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111',
    marginTop: 6,
  },
  packageCoinsLabel: {
    fontSize: 11,
    color: '#999',
    fontWeight: '600',
    marginBottom: 6,
  },
  packagePrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#E94057',
  },
  packageBonus: {
    fontSize: 10,
    fontWeight: '700',
    color: '#4CAF50',
    marginTop: 2,
  },
});
