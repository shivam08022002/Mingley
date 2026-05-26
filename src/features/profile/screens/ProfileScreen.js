import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, RefreshControl, Dimensions, Modal, FlatList, ActivityIndicator, Image, Platform
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
    const performSignOut = async () => {
      try {
        await authService.logout();
        logoutAction();
      } catch (error) {
        console.error('Logout error:', error);
        logoutAction();
      }
    };

    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Are you sure you want to sign out?');
      if (confirmed) {
        performSignOut();
      }
    } else {
      Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: performSignOut,
        },
      ]);
    }
  }, [logoutAction]);

  const [refreshing, setRefreshing] = useState(false);
  const [notifModalVisible, setNotifModalVisible] = useState(false);
  const [cashoutModalVisible, setCashoutModalVisible] = useState(false);
  const [verifyModalVisible, setVerifyModalVisible] = useState(false);
  const [coverModalVisible, setCoverModalVisible] = useState(false);
  const [updatingCover, setUpdatingCover] = useState(false);
  const [avatarModalVisible, setAvatarModalVisible] = useState(false);
  const [updatingAvatar, setUpdatingAvatar] = useState(false);
  const [avatarSelectionMode, setAvatarSelectionMode] = useState('avatar'); // 'avatar' or 'gallery'



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
    setAvatarSelectionMode('avatar');
    setAvatarModalVisible(true);
  }, []);

  const handleAddGalleryPhoto = useCallback(() => {
    setAvatarSelectionMode('gallery');
    setAvatarModalVisible(true);
  }, []);

  const handleApplyAvatar = async (url) => {
    setUpdatingAvatar(true);
    try {
      const isPrimary = avatarSelectionMode === 'avatar';
      await userService.uploadImage({ url, isPrimary });
      await fetchProfile();
      setAvatarModalVisible(false);
    } catch (e) {
      Alert.alert('Error', avatarSelectionMode === 'avatar' ? 'Failed to update profile photo' : 'Failed to upload gallery image');
    } finally {
      setUpdatingAvatar(false);
    }
  };

  const avatarChoices = [
    { gender: 'boy', label: 'Classic Boy', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80' },
    { gender: 'boy', label: 'Casual Boy', url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80' },
    { gender: 'boy', label: 'Modern Boy', url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80' },
    { gender: 'girl', label: 'Classic Girl', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80' },
    { gender: 'girl', label: 'Casual Girl', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80' },
    { gender: 'girl', label: 'Modern Girl', url: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=400&q=80' },
  ];


  const handleEditCover = useCallback(() => {
    setCoverModalVisible(true);
  }, []);

  const handleDeleteCover = async () => {
    setUpdatingCover(true);
    try {
      await userService.deleteCoverPhoto();
      await fetchProfile();
      setCoverModalVisible(false);
    } catch (e) {
      Alert.alert('Error', 'Failed to remove cover photo');
    } finally {
      setUpdatingCover(false);
    }
  };


  const handleApplyCover = async (url) => {
    setUpdatingCover(true);
    try {
      await userService.updateCoverPhoto(url);
      await fetchProfile();
      setCoverModalVisible(false);
    } catch (e) {
      Alert.alert('Error', 'Failed to update cover photo');
    } finally {
      setUpdatingCover(false);
    }
  };

  const premiumCovers = [
    { name: 'Modern Cityscape', gender: 'boy', icon: '🏙️', url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80', desc: 'Sleek, futuristic cityscape theme' },
    { name: 'Ocean Surf Beach', gender: 'boy', icon: '🏖️', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80', desc: 'Vibrant tropical surf theme' },
    { name: 'Pastel Bokeh Lights', gender: 'girl', icon: '🌟', url: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&q=80', desc: 'Soft bokeh lights theme' },
    { name: 'Mountain Canyon', gender: 'girl', icon: '⛰️', url: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80', desc: 'Adventure seeker mountain theme' }
  ];


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

  const handleDeletePhoto = useCallback(async (imageId) => {
    try {
      await userService.deleteImage(imageId);
      await fetchProfile();
    } catch (e) {
      Alert.alert('Error', 'Failed to delete photo');
    }
  }, [fetchProfile]);

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
          onEditCover={handleEditCover}
          onSettings={() => navigation.navigate('Settings')}
          onPressNotifications={() => setNotifModalVisible(true)}
          hasNotifications={notifications.some((n) => !n.isRead)}
        />

        <View style={styles.content}>
          <View style={styles.section}>
            <PhotoGrid
              photos={profileData.images || []}
              onAdd={handleAddGalleryPhoto}
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

              <TouchableOpacity style={styles.actionRow} onPress={() => setDepositModalVisible(true)}>
                <View style={styles.actionIconWrap}>
                  <Icon name="wallet-outline" size={18} color="#E94057" />
                </View>
                <Text style={styles.actionLabel}>Coin Packages</Text>
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

      {/* ── Premium Visual Cover Photo Modal ── */}
      <Modal visible={coverModalVisible} transparent animationType="slide" onRequestClose={() => setCoverModalVisible(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => !updatingCover && setCoverModalVisible(false)}>
          <View style={styles.modalSheet} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHandle} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <Text style={styles.modalTitle}>Choose Cover Photo</Text>
              {updatingCover && <ActivityIndicator color="#E94057" />}
            </View>
            <Text style={styles.modalSubtitleText}>Select from 4 premium curated styles to set your background theme</Text>

            {/* Row 1 Selection */}
            <View style={styles.coverSelectionRow}>
              {premiumCovers.slice(0, 2).map((cov) => (
                <TouchableOpacity
                  key={cov.name}
                  style={styles.coverSelectionCard}
                  onPress={() => handleApplyCover(cov.url)}
                  disabled={updatingCover}
                  activeOpacity={0.85}
                >
                  <Image source={{ uri: cov.url }} style={styles.coverThumbnail} />
                  <View style={styles.coverCardInfo}>
                    <Text style={styles.coverCardName}>{cov.name}</Text>
                    <Text style={styles.coverCardDesc} numberOfLines={1}>{cov.desc}</Text>
                  </View>
                  <View style={styles.coverBadge}>
                    <Text style={styles.coverBadgeText}>Premium</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Row 2 Selection */}
            <View style={styles.coverSelectionRow}>
              {premiumCovers.slice(2, 4).map((cov) => (
                <TouchableOpacity
                  key={cov.name}
                  style={styles.coverSelectionCard}
                  onPress={() => handleApplyCover(cov.url)}
                  disabled={updatingCover}
                  activeOpacity={0.85}
                >
                  <Image source={{ uri: cov.url }} style={styles.coverThumbnail} />
                  <View style={styles.coverCardInfo}>
                    <Text style={styles.coverCardName}>{cov.name}</Text>
                    <Text style={styles.coverCardDesc} numberOfLines={1}>{cov.desc}</Text>
                  </View>
                  <View style={styles.coverBadge}>
                    <Text style={styles.coverBadgeText}>Premium</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Delete button */}
            <TouchableOpacity 
              style={[styles.deleteCoverBtn, updatingCover && styles.deleteCoverBtnDisabled]}
              onPress={handleDeleteCover}
              disabled={updatingCover}
              activeOpacity={0.8}
            >
              <Icon name="trash-outline" size={16} color="#E94057" style={{ marginRight: 6 }} />
              <Text style={styles.deleteCoverBtnText}>Delete Cover Photo</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ── Visual Avatar Selection Modal ── */}
      <Modal visible={avatarModalVisible} transparent animationType="slide" onRequestClose={() => setAvatarModalVisible(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => !updatingAvatar && setAvatarModalVisible(false)}>
          <View style={styles.modalSheet} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHandle} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <Text style={styles.modalTitle}>
                {avatarSelectionMode === 'avatar' ? 'Choose Profile Picture' : 'Add Photo to Gallery'}
              </Text>
              {updatingAvatar && <ActivityIndicator color="#E94057" />}
            </View>
            <Text style={styles.modalSubtitleText}>
              {avatarSelectionMode === 'avatar' 
                ? 'Select a premium portrait style to update your primary avatar' 
                : 'Select a premium portrait to add to your photo gallery'}
            </Text>

            {/* Boy Avatars */}
            <Text style={styles.genderSectionHeader}>Boy Avatars 🙋‍♂️</Text>
            <View style={styles.avatarSelectionRow}>
              {avatarChoices.filter(c => c.gender === 'boy').map((choice) => (
                <TouchableOpacity
                  key={choice.url}
                  style={styles.avatarSelectionCard}
                  onPress={() => handleApplyAvatar(choice.url)}
                  disabled={updatingAvatar}
                  activeOpacity={0.8}
                >
                  <Image source={{ uri: choice.url }} style={styles.avatarSelectionImage} />
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
                  onPress={() => handleApplyAvatar(choice.url)}
                  disabled={updatingAvatar}
                  activeOpacity={0.8}
                >
                  <Image source={{ uri: choice.url }} style={styles.avatarSelectionImage} />
                  <Text style={styles.avatarSelectionLabel}>{choice.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>



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
  coverSelectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 20,
    width: '100%',
  },
  coverSelectionCard: {
    flex: 1,
    height: 125,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#F0F0F0',
    backgroundColor: '#FFF',
    boxShadow: '0px 2px 6px rgba(0,0,0,0.06)',
    elevation: 3,
    position: 'relative',
  },
  coverThumbnail: {
    width: '100%',
    height: 65,
  },
  coverCardInfo: {
    padding: 6,
  },
  coverCardName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#222',
  },
  coverCardDesc: {
    fontSize: 8,
    color: '#888',
    marginTop: 1,
  },
  coverBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(233, 64, 87, 0.95)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  coverBadgeText: {
    color: '#FFF',
    fontSize: 7,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  deleteCoverBtn: {
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
  deleteCoverBtnDisabled: {
    opacity: 0.6,
  },
  deleteCoverBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#E94057',
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
    boxShadow: '0px 3px 8px rgba(0,0,0,0.1)',
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
