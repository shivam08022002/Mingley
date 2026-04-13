import React, { useState, useMemo, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { SPACING, TYPOGRAPHY } from '../../../constants/theme';
import { SwipeCard } from '../components/SwipeCard';
import { ActionButtons } from '../components/ActionButtons';
import { FilterSheet } from '../components/FilterSheet';
import { useFilterStore } from '../store/useFilterStore';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

// ─── All dummy profiles (with extra fields for filter logic) ────────────────
export const ALL_PROFILES = [
  {
    id: '1', name: 'Jessica Parker', age: 23, distance: 1,
    gender: 'girls', verified: true, online: true,
    occupation: 'Professional model', location: 'Mumbai, India',
    relationshipType: 'serious',
    about: "My name is Jessica Parker and I enjoy meeting new people and finding ways to help them have an uplifting experience. I enjoy reading about fashion, exploring different cuisines, and going on spontaneous adventures. Let's match!",
    interests: ['Travelling', 'Books', 'Music', 'Dancing', 'Modeling'],
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1502720705749-871143f0e671?auto=format&fit=crop&w=400&q=80',
    ],
  },
  {
    id: '2', name: 'Sofia Ramirez', age: 25, distance: 3,
    gender: 'girls', verified: false, online: true,
    occupation: 'Fashion designer', location: 'Delhi, India',
    relationshipType: 'casual',
    about: 'Sofia here! I design clothes by day and explore street food by night.',
    interests: ['Fashion', 'Food', 'Art', 'Travel', 'Yoga'],
    image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=400&q=80',
    ],
  },
  {
    id: '3', name: 'Priya Sharma', age: 22, distance: 5,
    gender: 'girls', verified: true, online: false,
    occupation: 'Actress & dancer', location: 'Bangalore, India',
    relationshipType: 'both',
    about: 'Dance is my heartbeat and acting is my soul.',
    interests: ['Dancing', 'Acting', 'Music', 'Gym', 'Movies'],
    image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=600&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    ],
  },
  {
    id: '4', name: 'Arjun Mehta', age: 27, distance: 2,
    gender: 'boys', verified: true, online: true,
    occupation: 'Photographer', location: 'Mumbai, India',
    relationshipType: 'serious',
    about: 'Life is too short for bad photos.',
    interests: ['Photography', 'Travel', 'Gym', 'Movies', 'Music'],
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    ],
  },
];

// ─── Filter logic ────────────────────────────────────────────────────────────
function applyFilters(profiles, filters) {
  return profiles.filter((p) => {
    if (filters.interestedIn !== 'both' && p.gender !== filters.interestedIn) return false;
    if (p.distance > filters.distance) return false;
    if (p.age < filters.ageRange[0] || p.age > filters.ageRange[1]) return false;
    if (filters.onlineStatus && !p.online) return false;
    if (filters.verifiedOnly && !p.verified) return false;
    if (filters.interests.length > 0) {
      const match = filters.interests.some((i) => p.interests.includes(i));
      if (!match) return false;
    }
    if (filters.relationshipType !== 'both' && p.relationshipType !== filters.relationshipType) return false;
    return true;
  });
}

// ─── Component ───────────────────────────────────────────────────────────────
export const DiscoverScreen = React.memo(() => {
  const navigation = useNavigation();
  const filters = useFilterStore();
  const [dismissed, setDismissed] = useState([]); // ids already swiped
  const [isFilterVisible, setFilterVisible] = useState(false);
  const swipeRef = useRef(null);

  // Filtered profiles (excludes dismissed)
  const users = useMemo(
    () => applyFilters(ALL_PROFILES, filters).filter((p) => !dismissed.includes(p.id)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      dismissed,
      filters.interestedIn, filters.distance, filters.ageRange,
      filters.onlineStatus, filters.verifiedOnly, filters.interests,
      filters.relationshipType,
    ]
  );

  const dismiss = useCallback((id) => setDismissed((prev) => [...prev, id]), []);

  const handleSwipeLeft  = useCallback((user) => dismiss(user.id), [dismiss]);
  const handleSwipeRight = useCallback((user) => {
    dismiss(user.id);
    if (Math.random() > 0.4) navigation.navigate('Match', { matchedUser: user });
  }, [dismiss, navigation]);

  const handleSwipeUp = useCallback(() => {
    navigation.navigate('SubscriptionIntro');
  }, [navigation]);

  const triggerDislike   = () => swipeRef.current?.swipeLeft();
  const triggerLike      = () => swipeRef.current?.swipeRight();
  const triggerSuperlike = () => {
    if (users.length > 0) navigation.navigate('SubscriptionIntro');
  };

  const hasActive = filters.hasActiveFilters?.();

  const TopCards = useMemo(() => {
    if (users.length === 0)
      return <Text style={styles.noMoreText}>No profiles match your filters 🙈</Text>;

    return users.slice(0, 2).map((user, index) => (
      <SwipeCard
        key={user.id}
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
  }, [users, handleSwipeLeft, handleSwipeRight, handleSwipeUp, navigation]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton}>
          <Icon name="chevron-back" size={24} color="#E4415C" />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Discover</Text>
          <Text style={styles.headerSubtitle}>{filters.location}</Text>
        </View>

        <TouchableOpacity
          style={[styles.headerButton, hasActive && styles.headerButtonActive]}
          onPress={() => setFilterVisible(true)}
        >
          <Icon name="options-outline" size={24} color="#E4415C" />
          {hasActive && <View style={styles.filterDot} />}
        </TouchableOpacity>
      </View>

      {/* Cards */}
      <View style={styles.cardsContainer}>{TopCards}</View>

      {/* Action Buttons */}
      <ActionButtons
        onDislike={triggerDislike}
        onLike={triggerLike}
        onSuperlike={triggerSuperlike}
      />

      {/* Filter Sheet */}
      <FilterSheet visible={isFilterVisible} onClose={() => setFilterVisible(false)} />
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
  headerButtonActive: { borderColor: '#E4415C' },
  filterDot: {
    position: 'absolute', top: 10, right: 10,
    width: 8, height: 8, borderRadius: 4, backgroundColor: '#E4415C',
  },
  headerTitleContainer: { alignItems: 'center' },
  headerTitle: { ...TYPOGRAPHY.h2, color: '#000000', marginBottom: 2 },
  headerSubtitle: { ...TYPOGRAPHY.caption, color: '#5b5b5b' },
  cardsContainer: {
    flex: 1, marginTop: 16, marginBottom: 16,
    justifyContent: 'center', alignItems: 'center',
  },
  noMoreText: {
    ...TYPOGRAPHY.body, color: '#A0A0A0',
    textAlign: 'center', paddingHorizontal: 32,
  },
});
