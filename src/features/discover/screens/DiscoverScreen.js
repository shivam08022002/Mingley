import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Platform, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { SPACING, TYPOGRAPHY } from '../../../constants/theme';
import { SwipeCard } from '../components/SwipeCard';
import { ActionButtons } from '../components/ActionButtons';
import { FilterSheet } from '../components/FilterSheet';
import { SuperchatModal } from '../components/SuperchatModal';
import { useFilterStore } from '../store/useFilterStore';
import { useDiscoverStore } from '../store/useDiscoverStore';
import { useNavigation } from '@react-navigation/native';

const TITLE_FONT = Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif';
const TITLE_MED = Platform.OS === 'ios' ? 'AvenirNext-Medium' : 'sans-serif-medium';

// ─── Component ───────────────────────────────────────────────────────────────
import { useSubscriptionStore } from '../../subscription/store/useSubscriptionStore';

import { useProfileStore } from '../../profile/store/useProfileStore';

export const DiscoverScreen = React.memo(() => {
  const navigation = useNavigation();
  const filters = useFilterStore();
  const fetchProfile = useProfileStore((s) => s.fetchProfile);
  const { currentStatus } = useSubscriptionStore();
  const {
    profiles, fetchProfiles, swipe, isLoading,
  } = useDiscoverStore();
  
  const [isFilterVisible, setFilterVisible] = useState(false);
  const [isSuperchatVisible, setSuperchatVisible] = useState(false);
  const swipeRef = useRef(null);

  useEffect(() => {
    fetchProfile();
    fetchProfiles(useFilterStore.getState());
  }, [fetchProfile, fetchProfiles]);

  const handleSwipeLeft = useCallback(async (user) => {
    await swipe(user.id || user._id, 'pass');
  }, [swipe]);

  const handleSwipeRight = useCallback(async (user) => {
    // Check subscription limits for likes
    const hasUnlimitedLikes = currentStatus?.plan?.unlimitedLikes || false;
    const likesRemaining = currentStatus?.likesRemaining ?? 5; // Default 5 if free

    if (!hasUnlimitedLikes && likesRemaining <= 0) {
      Alert.alert(
        'Limit Reached',
        'You have run out of daily likes. Upgrade to premium for unlimited likes!',
        [
          { text: 'Later', style: 'cancel' },
          { text: 'Upgrade', onPress: () => navigation.navigate('SubscriptionPlans') }
        ]
      );
      swipeRef.current?.reset(); // Reset card position if possible
      return;
    }

    const result = await swipe(user.id || user._id, 'like');
    
    // Show match screen if API confirms a match
    if (result?.isMatch) {
      navigation.navigate('Match', { matchedUser: user });
    }
  }, [swipe, navigation, currentStatus]);

  const handleSwipeUp = useCallback(() => {
    // Check superlike limits
    const superLikesPerDay = currentStatus?.plan?.superLikesPerDay || 0;
    const superLikesRemaining = currentStatus?.superLikesRemaining ?? 0;

    if (superLikesPerDay !== -1 && superLikesRemaining <= 0) {
      Alert.alert(
        'No Super Likes',
        'You have no Super Likes left today. Upgrade your plan to get more!',
        [
          { text: 'Later', style: 'cancel' },
          { text: 'Upgrade', onPress: () => navigation.navigate('SubscriptionPlans') }
        ]
      );
      return;
    }

    navigation.navigate('SubscriptionIntro');
  }, [navigation, currentStatus]);

  const triggerDislike   = () => swipeRef.current?.swipeLeft();
  const triggerLike      = () => swipeRef.current?.swipeRight();
  const triggerSuperchat = () => {
    if (profiles.length > 0) {
      setSuperchatVisible(true);
    }
  };

  const hasActive = filters.hasActiveFilters?.();

  const TopCards = useMemo(() => {
    if (isLoading && profiles.length === 0) {
      return <ActivityIndicator size="large" color="#E94057" />;
    }

    if (profiles.length === 0 && !isLoading) {
      return <Text style={styles.noMoreText}>No profiles match your filters 🙈</Text>;
    }

    return profiles.slice(0, 2).map((user, index) => (
      <SwipeCard
        key={user.id || user._id}
        ref={index === 0 ? swipeRef : null}
        user={user}
        isFirst={index === 0}
        isSecond={index === 1}
        onSwipeLeft={handleSwipeLeft}
        onSwipeRight={handleSwipeRight}
        onSwipeUp={index === 0 ? handleSwipeUp : undefined}
        onPress={index === 0 ? () => navigation.navigate('UserProfile', { user }) : undefined}
      />
    ));
  }, [profiles, isLoading, handleSwipeLeft, handleSwipeRight, handleSwipeUp, navigation]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Discover</Text>
          <Text style={styles.headerSubtitle}>{filters.location}</Text>
        </View>

        <TouchableOpacity
          style={[styles.headerButton, hasActive && styles.headerButtonActive]}
          onPress={() => setFilterVisible(true)}
        >
          <Icon name="options-outline" size={24} color="#E94057" />
          {hasActive && <View style={styles.filterDot} />}
        </TouchableOpacity>
      </View>

      {/* Cards */}
      <View style={styles.cardsContainer}>{TopCards}</View>

      {/* Action Buttons */}
      <ActionButtons
        onDislike={triggerDislike}
        onLike={triggerLike}
        onSuperchat={triggerSuperchat}
      />

      {/* Filter Sheet */}
      <FilterSheet visible={isFilterVisible} onClose={() => setFilterVisible(false)} />

      {/* Superchat Modal */}
      <SuperchatModal
        visible={isSuperchatVisible}
        onClose={() => setSuperchatVisible(false)}
        user={profiles[0]}
      />
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: SPACING.xl, paddingTop: SPACING.m,
  },
  headerButton: {
    width: 50, height: 50, borderRadius: 16,
    borderWidth: 1, borderColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center', alignItems: 'center',
  },
  headerButtonActive: { borderColor: '#E94057' },
  filterDot: {
    position: 'absolute', top: 10, right: 10,
    width: 8, height: 8, borderRadius: 4, backgroundColor: '#E94057',
  },
  headerTitleContainer: { flex: 1, alignItems: 'center', marginLeft: 50 },
  headerTitle: { ...TYPOGRAPHY.h2, color: '#1F1F1F', marginBottom: 2, fontSize: 28, fontWeight: '600', fontFamily: TITLE_MED },
  headerSubtitle: { ...TYPOGRAPHY.caption, color: '#7A7A7A', fontFamily: TITLE_FONT },
  cardsContainer: {
    flex: 1, marginTop: 16, marginBottom: 16,
    justifyContent: 'center', alignItems: 'center',
  },
  noMoreText: {
    ...TYPOGRAPHY.body, color: '#A0A0A0',
    textAlign: 'center', paddingHorizontal: 32,
  },
});
