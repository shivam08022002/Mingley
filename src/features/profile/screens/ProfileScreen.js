import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useProfileStore } from '../store/useProfileStore';
import { ProfileHeader } from '../components/ProfileHeader';
import { MembershipCard } from '../components/MembershipCard';
import { PhotoGrid } from '../components/PhotoGrid';
import { InterestChips } from '../components/InterestChips';
import { useChatStore } from '../../../store/useChatStore';
import { DepositModal, CashoutModal } from '../../../components/SharedFinanceModals';
import Icon from 'react-native-vector-icons/Ionicons';

export const ProfileScreen = React.memo(() => {
  const navigation = useNavigation();
  const profile = useProfileStore();

  // ── Live coin balance from the shared useChatStore wallet ──────────────
  const chatWalletCoins  = useChatStore((s) => s.wallet.coins);
  const addChatCoins     = useChatStore((s) => s.addCoins);
  const isPremium        = useChatStore((s) => s.isPremium);
  const upgradeToPremium = useChatStore((s) => s.upgradeToPremium);
  const downgradePremium = useChatStore((s) => s.downgradePremium);
  const currentUserGender= useChatStore((s) => s.user.gender);

  const isFemale = currentUserGender === 'female';
  const [depositVisible, setDepositVisible] = useState(false);
  const [cashoutVisible, setCashoutVisible] = useState(false);

  const handleSettings = useCallback(() => navigation.navigate('Settings'), [navigation]);
  const handleUpgrade  = useCallback(() => {
    if (isPremium) {
      Alert.alert('Already Premium', 'You are already on the Premium plan!', [
        { text: 'Downgrade (Demo)', onPress: downgradePremium },
        { text: 'OK' },
      ]);
    } else {
      Alert.alert('Upgrade to Premium', 'Unlock Nearby Users, Verified Filters, and more!', [
        { text: 'Upgrade (Demo)', onPress: upgradeToPremium },
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  }, [isPremium, upgradeToPremium, downgradePremium]);
  const handleEditAvatar = useCallback(() => Alert.alert('Edit Photo', 'Opens camera roll (mock).'), []);
  const handleAddPhoto   = useCallback((uri) => profile.addPhoto(uri), [profile]);
  const handlePressPhoto = useCallback(() => {}, []);
  const handleSaveInterests = useCallback((arr) => profile.setInterests(arr), [profile]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* A. Header */}
        <ProfileHeader
          profile={profile}
          onSettings={handleSettings}
          onEditAvatar={handleEditAvatar}
        />

        {/* B. Wallet Balance Row */}
        <View style={styles.walletRow}>
          <View style={styles.walletLeft}>
            <View style={styles.walletIconWrap}>
              <Icon name="wallet-outline" size={20} color="#E94057" />
            </View>
            <View>
              <Text style={styles.walletLabel}>Coin Balance</Text>
              <Text style={styles.walletCoins}>{chatWalletCoins} <Text style={styles.walletCoinsUnit}>coins</Text></Text>
            </View>
          </View>
          <View style={styles.walletActions}>
            {isFemale && (
              <TouchableOpacity style={styles.walletBtnCashout} onPress={() => setCashoutVisible(true)}>
                <Icon name="cash-outline" size={12} color="#059669" />
                <Text style={styles.walletBtnCashoutText}>Withdraw</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.walletBtnTopup} onPress={() => setDepositVisible(true)}>
              <Icon name="add" size={12} color="#fff" />
              <Text style={styles.walletBtnTopupText}>Top Up</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* C. Membership card */}
        <MembershipCard
          plan={profile.plan}
          isPremium={isPremium}
          onUpgrade={handleUpgrade}
        />

        {/* C. Photos */}
        <PhotoGrid
          photos={profile.photos}
          onAdd={handleAddPhoto}
          onPressPhoto={handlePressPhoto}
        />

        {/* D. Interests */}
        <InterestChips
          interests={profile.interests}
          onSave={handleSaveInterests}
        />
      </ScrollView>

      <DepositModal visible={depositVisible} onClose={() => setDepositVisible(false)} />
      <CashoutModal visible={cashoutVisible} onClose={() => setCashoutVisible(false)} />
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F7F7' },
  scroll: { paddingBottom: 32 },

  walletRow: {
    marginHorizontal: 16, marginBottom: 16, backgroundColor: '#fff',
    borderRadius: 14, padding: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 3
  },
  walletLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  walletIconWrap: { width: 34, height: 34, borderRadius: 10, backgroundColor: '#FFF0F3', justifyContent: 'center', alignItems: 'center' },
  walletLabel: { fontSize: 11, color: '#666', fontWeight: '500', marginBottom: 2 },
  walletCoins: { fontSize: 16, color: '#111', fontWeight: '800' },
  walletCoinsUnit: { fontSize: 11, fontWeight: '600', color: '#999' },
  walletActions: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  walletBtnTopup: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#E94057', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  walletBtnTopupText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  walletBtnCashout: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 6, borderRadius: 10, backgroundColor: '#ECFDF5', borderWidth: 1, borderColor: '#A7F3D0' },
  walletBtnCashoutText: { color: '#059669', fontSize: 11, fontWeight: '700' }
});
