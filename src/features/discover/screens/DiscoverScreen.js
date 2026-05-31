import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Platform, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import FAIcon from 'react-native-vector-icons/FontAwesome5';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../constants/theme';
import { SwipeCard } from '../components/SwipeCard';
import { ActionButtons } from '../components/ActionButtons';
import { FilterSheet } from '../components/FilterSheet';
import { SuperchatModal } from '../components/SuperchatModal';
import { useFilterStore } from '../store/useFilterStore';
import { useDiscoverStore } from '../store/useDiscoverStore';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

const TITLE_FONT = Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif';
const TITLE_MED = Platform.OS === 'ios' ? 'AvenirNext-Medium' : 'sans-serif-medium';

// ─── Component ───────────────────────────────────────────────────────────────
import { useSubscriptionStore } from '../../subscription/store/useSubscriptionStore';

import { useProfileStore } from '../../profile/store/useProfileStore';

const areFiltersEqual = (f1, f2) => {
  if (!f1 || !f2) return false;
  return (
    f1.interestedIn === f2.interestedIn &&
    f1.location === f2.location &&
    f1.distance === f2.distance &&
    f1.ageRange?.[0] === f2.ageRange?.[0] &&
    f1.ageRange?.[1] === f2.ageRange?.[1] &&
    f1.onlineStatus === f2.onlineStatus &&
    f1.verifiedOnly === f2.verifiedOnly &&
    f1.nearbyOnly === f2.nearbyOnly &&
    f1.relationshipType === f2.relationshipType &&
    JSON.stringify(f1.interests || []) === JSON.stringify(f2.interests || [])
  );
};

export const DiscoverScreen = React.memo(() => {
  const navigation = useNavigation();
  const filters = useFilterStore();
  const fetchProfile = useProfileStore((s) => s.fetchProfile);
  const profile = useProfileStore((s) => s.profile);
  const { currentStatus } = useSubscriptionStore();
  const {
    profiles, fetchProfiles, swipe, isLoading, resetPage,
  } = useDiscoverStore();

  const [isFilterVisible, setFilterVisible] = useState(false);
  const [isSuperchatVisible, setSuperchatVisible] = useState(false);
  const swipeRef = useRef(null);
  const lastFiltersRef = useRef(null);

  const handleReload = useCallback(async () => {
    resetPage();
    const currentFilters = {
      interestedIn: useFilterStore.getState().interestedIn,
      location: useFilterStore.getState().location,
      distance: useFilterStore.getState().distance,
      ageRange: useFilterStore.getState().ageRange,
      onlineStatus: useFilterStore.getState().onlineStatus,
      verifiedOnly: useFilterStore.getState().verifiedOnly,
      nearbyOnly: useFilterStore.getState().nearbyOnly,
      relationshipType: useFilterStore.getState().relationshipType,
      interests: useFilterStore.getState().interests,
    };
    lastFiltersRef.current = currentFilters;
    await fetchProfiles(currentFilters);
  }, [resetPage, fetchProfiles]);

  useFocusEffect(
    useCallback(() => {
      fetchProfile();

      const currentFilters = {
        interestedIn: filters.interestedIn,
        location: filters.location,
        distance: filters.distance,
        ageRange: filters.ageRange,
        onlineStatus: filters.onlineStatus,
        verifiedOnly: filters.verifiedOnly,
        nearbyOnly: filters.nearbyOnly,
        relationshipType: filters.relationshipType,
        interests: filters.interests,
      };

      if (!lastFiltersRef.current || !areFiltersEqual(lastFiltersRef.current, currentFilters)) {
        resetPage();
        fetchProfiles(currentFilters);
        lastFiltersRef.current = currentFilters;
      }

      // Reset card position if it was swiped up (for super like) and returned
      swipeRef.current?.reset();
    }, [fetchProfile, fetchProfiles, resetPage, filters])
  );

  const displayLocation = useMemo(() => {
    if (profile?.location?.city) {
      const city = profile.location.city;
      const country = profile.location.country || '';
      return country ? `${city}, ${country}` : city;
    }
    if (profile?.city) {
      return profile.city;
    }
    return filters.location || 'Chicago, Il';
  }, [profile, filters.location]);

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

  const triggerDislike = () => swipeRef.current?.swipeLeft();
  const triggerLike = () => swipeRef.current?.swipeRight();
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
        <TouchableOpacity
          style={styles.crownButton}
          onPress={() => navigation.navigate('SubscriptionPlans')}
          activeOpacity={0.8}
        >
          <FAIcon name="crown" size={20} color={COLORS.primary} />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Discover</Text>
          <Text style={styles.headerSubtitle}>{displayLocation}</Text>
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
      <FilterSheet visible={isFilterVisible} onClose={() => setFilterVisible(false)} onApply={handleReload} />

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
    width: 52, height: 52, borderRadius: 16,
    borderWidth: 1, borderColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center', alignItems: 'center',
  },
  headerButtonActive: { borderColor: '#E94057' },
  crownButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    // shadowColor: COLORS.primary,
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.15,
    // shadowRadius: 4,
    elevation: 3,
  },
  filterDot: {
    position: 'absolute', top: 10, right: 10,
    width: 8, height: 8, borderRadius: 4, backgroundColor: '#E94057',
  },
  headerTitleContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...TYPOGRAPHY.h2, color: '#1F1F1F', marginBottom: 2, fontSize: 28, fontWeight: '600', fontFamily: TITLE_MED },
  headerSubtitle: { ...TYPOGRAPHY.caption, color: '#7A7A7A', fontFamily: TITLE_FONT },
  cardsContainer: {
    flex: 1, marginTop: 8, marginBottom: 14,
    justifyContent: 'center', alignItems: 'center',
  },
  noMoreText: {
    ...TYPOGRAPHY.body, color: '#A0A0A0',
    textAlign: 'center', paddingHorizontal: 32,
  },
});

