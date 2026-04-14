import React, { useCallback } from 'react';
import {
  View, StyleSheet, ScrollView, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useProfileStore } from '../store/useProfileStore';
import { ProfileHeader } from '../components/ProfileHeader';
import { MembershipCard } from '../components/MembershipCard';
import { PhotoGrid } from '../components/PhotoGrid';
import { InterestChips } from '../components/InterestChips';

export const ProfileScreen = React.memo(() => {
  const navigation = useNavigation();
  const profile = useProfileStore();

  const handleSettings = useCallback(() => navigation.navigate('Settings'), [navigation]);
  const handleUpgrade  = useCallback(() => navigation.navigate('SubscriptionIntro'), [navigation]);
  const handleEditAvatar = useCallback(() => Alert.alert('Edit Photo', 'Opens camera roll (mock).'), []);
  const handleAddPhoto   = useCallback((uri) => profile.addPhoto(uri), [profile]);
  const handlePressPhoto = useCallback(() => {}, []);
  const handleSaveInterests = useCallback((arr) => profile.setInterests(arr), [profile]);
  const handleTopUp = useCallback(() => {
    Alert.alert(
      'Top Up Coins',
      'Choose a coin pack:',
      [
        { text: '50 coins — ₹49', onPress: () => profile.addCoins(50) },
        { text: '150 coins — ₹129', onPress: () => profile.addCoins(150) },
        { text: '500 coins — ₹399', onPress: () => profile.addCoins(500) },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  }, [profile]);

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

        {/* B. Membership card */}
        <MembershipCard
          plan={profile.plan}
          coins={profile.coins}
          onUpgrade={handleUpgrade}
          onTopUp={handleTopUp}
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
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F7F7' },
  scroll: { paddingBottom: 32 },
});
