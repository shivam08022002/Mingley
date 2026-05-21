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
import { userService } from '../../../services/apiServices';
import { useProfileStore } from '../store/useProfileStore';
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

  const [refreshing, setRefreshing] = useState(false);
  const [notifModalVisible, setNotifModalVisible] = useState(false);
  const [cashoutModalVisible, setCashoutModalVisible] = useState(false);
  const [verifyModalVisible, setVerifyModalVisible] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifs, setLoadingNotifs] = useState(false);

  useEffect(() => {
    if (isFocused) {
      fetchProfile();
      fetchStatus();
    }
  }, [isFocused, fetchProfile, fetchStatus]);

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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
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
          <View style={styles.membershipCard}>
            <View style={styles.cardTopRow}>
              <View style={styles.membershipInfo}>
                <View style={styles.membershipTypeRow}>
                  <Text style={styles.membershipType}>{profileData.isPremium ? 'PREMIUM MEMBER' : 'FREE PLAN'}</Text>
                  <Icon name="diamond" size={12} color="#FFF" style={styles.diamondIconSmall} />
                </View>
                <View style={styles.balanceRowInline}>
                  <Icon name="logo-bitcoin" size={20} color="#FFD700" />
                  <Text style={styles.balanceLabelInline}>{profileData.coinBalance || 0}</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.manageSubsBtnRight}
                onPress={handleManageSubscription}
                activeOpacity={0.85}
              >
                <Text style={styles.manageSubsText}>Manage</Text>
                <Icon name="chevron-forward" size={14} color="#FFF" />
              </TouchableOpacity>
            </View>

            <View style={styles.walletActionsRowBottom}>
              <TouchableOpacity
                style={styles.walletBtnSmall}
                onPress={() => setDepositModalVisible(true)}
                activeOpacity={0.85}
              >
                <Icon name="add-circle" size={16} color="#FFF" />
                <Text style={styles.walletBtnTextSmall}>Top-up</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.walletBtnSmall, styles.withdrawBtnSmall]}
                onPress={() => setCashoutModalVisible(true)}
                activeOpacity={0.85}
              >
                <Icon name="cash" size={16} color="#FFF" />
                <Text style={styles.walletBtnTextSmall}>Withdraw</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.section}>
            <TouchableOpacity 
              style={styles.verifyBanner}
              onPress={() => setVerifyModalVisible(true)}
            >
              <View style={styles.verifyIconWrap}>
                <Icon name="shield-checkmark" size={24} color="#E94057" />
              </View>
              <View style={styles.verifyTextWrap}>
                <Text style={styles.verifyTitle}>Verify Your Identity</Text>
                <Text style={styles.verifySub}>Get 50 bonus coins after verification!</Text>
              </View>
              <Icon name="chevron-forward" size={20} color="#AAA" />
            </TouchableOpacity>
          </View>

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
                    <View style={[styles.notifIconWrap, { backgroundColor: item.type === 'MATCH' ? '#FFF0F3' : '#F0F9FF' }]}>
                      <Icon
                        name={item.type === 'MATCH' ? 'heart' : 'notifications'}
                        size={20}
                        color={item.type === 'MATCH' ? '#E94057' : '#0EA5E9'}
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
                    <Icon name="notifications-off-outline" size={48} color="#EEE" />
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
  content: { padding: 20 },
  section: { marginBottom: 25 },
  membershipCard: {
    backgroundColor: '#E94057',
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 16,
    shadowColor: '#E94057',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
    marginBottom: 20,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  membershipInfo: { flex: 1 },
  membershipTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 4,
  },
  membershipType: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  diamondIconSmall: {
    opacity: 0.8,
  },
  balanceRowInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  balanceLabelInline: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '700',
  },
  walletActionsRowBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 20,
  },
  walletBtnSmall: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    gap: 8,
    justifyContent: 'center',
  },
  withdrawBtnSmall: {
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  walletBtnTextSmall: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  manageSubsBtnRight: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 4,
  },
  manageSubsText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  verifyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  verifyIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#FFF0F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifyTextWrap: {
    flex: 1,
    marginLeft: 15,
  },
  verifyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
    marginBottom: 2,
  },
  verifySub: {
    fontSize: 13,
    color: '#666',
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
});
