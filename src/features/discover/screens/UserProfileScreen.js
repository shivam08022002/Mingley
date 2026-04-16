import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Dimensions, Platform, Alert,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export const UserProfileScreen = ({ navigation, route }) => {
  const { user } = route.params || {};
  const insets = useSafeAreaInsets();
  const [expanded, setExpanded] = useState(false);
  const [liked, setLiked] = useState(false);
  const [rejected, setRejected] = useState(false);

  if (!user) return null;

  const handleReject = useCallback(() => {
    setRejected(true);
    setTimeout(() => navigation.goBack(), 300);
  }, [navigation]);

  const handleLike = useCallback(() => {
    setLiked(true);
    // Simulate 50% match chance
    setTimeout(() => {
      if (Math.random() > 0.5) {
        navigation.replace('Match', { matchedUser: user });
      } else {
        navigation.goBack();
      }
    }, 400);
  }, [navigation, user]);

  const handleSuperLike = useCallback(() => {
    navigation.navigate('SubscriptionIntro');
  }, [navigation]);

  const handleMessage = useCallback(() => {
    navigation.navigate('Chat', { user });
  }, [navigation, user]);

  const handleCall = useCallback(() => {
    navigation.navigate('Calling', { user });
  }, [navigation, user]);

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      bounces
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      {/* ── Hero image ── */}
      <View style={styles.imageContainer}>
        <FastImage
          source={{ uri: user.image }}
          style={styles.mainImage}
          resizeMode={FastImage.resizeMode.cover}
        />
        <LinearGradient
          colors={['rgba(0,0,0,0.5)', 'transparent', 'transparent', 'rgba(255,255,255,0.95)']}
          style={StyleSheet.absoluteFillObject}
        />

        {/* Back */}
        <TouchableOpacity
          style={[styles.backButton, { top: insets.top + 12 }]}
          onPress={() => navigation.goBack()}
        >
          <Icon name="chevron-back" size={22} color="#333" />
        </TouchableOpacity>

        {/* Online badge */}
        {user.online && (
          <View style={[styles.onlineBadge, { top: insets.top + 16 }]}>
            <View style={styles.onlineDot} />
            <Text style={styles.onlineText}>Online</Text>
          </View>
        )}

        {/* Verified badge */}
        {user.verified && (
          <View style={[styles.verifiedBadge, { top: insets.top + 16 }]}>
            <Icon name="checkmark-circle" size={16} color="#4CAF50" />
            <Text style={styles.verifiedText}>Verified</Text>
          </View>
        )}
      </View>

      {/* ── Action buttons row ── */}
      <View style={styles.actionButtonsRow}>
        {/* Reject */}
        <TouchableOpacity
          style={[styles.actionBtn, styles.smallBtn, rejected && styles.btnPressed]}
          onPress={handleReject}
          activeOpacity={0.8}
        >
          <Icon name="close" size={26} color="#E86B32" />
        </TouchableOpacity>

        {/* Like / Heart */}
        <TouchableOpacity
          style={[styles.actionBtn, styles.heartBtn, liked && styles.heartBtnLiked]}
          onPress={handleLike}
          activeOpacity={0.8}
        >
          <Icon name={liked ? 'heart' : 'heart'} size={32} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Super Like → subscription */}
        <TouchableOpacity
          style={[styles.actionBtn, styles.smallBtn]}
          onPress={handleSuperLike}
          activeOpacity={0.8}
        >
          <Icon name="star" size={24} color="#8A2BE2" />
        </TouchableOpacity>
      </View>

      {/* ── Content ── */}
      <View style={styles.content}>
        {/* Name row */}
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{user.name}, {user.age}</Text>
            <Text style={styles.occupation}>{user.occupation}</Text>
          </View>
          <View style={styles.headerButtons}>
            <TouchableOpacity style={styles.headerActionBtn} onPress={handleCall}>
              <Icon name="call-outline" size={20} color="#E94057" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerActionBtn} onPress={handleMessage}>
              <Icon name="paper-plane-outline" size={20} color="#E94057" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Location */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Location</Text>
          <View style={styles.locationRow}>
            <Text style={styles.bodyText}>{user.location}</Text>
            <View style={styles.distanceBadge}>
              <Icon name="location-outline" size={13} color="#E94057" />
              <Text style={styles.distanceText}>{user.distance} km</Text>
            </View>
          </View>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>About</Text>
          <Text style={styles.bodyText} numberOfLines={expanded ? undefined : 3}>
            {user.about}
          </Text>
          <TouchableOpacity onPress={() => setExpanded(!expanded)}>
            <Text style={styles.readMore}>{expanded ? 'Read less' : 'Read more'}</Text>
          </TouchableOpacity>
        </View>

        {/* Interests */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Interests</Text>
          <View style={styles.chipsWrap}>
            {(user.interests || []).map((interest, idx) => (
              <View
                key={idx}
                style={[styles.chip, idx < 2 && styles.chipActive]}
              >
                {idx < 2 && (
                  <Icon name="checkmark-done" size={13} color="#E94057" style={{ marginRight: 4 }} />
                )}
                <Text style={[styles.chipText, idx < 2 && styles.chipTextActive]}>
                  {interest}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Gallery */}
        <View style={styles.section}>
          <View style={styles.rowBetween}>
            <Text style={styles.sectionLabel}>Gallery</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Gallery', { images: user.gallery, initialIndex: 0 })}
            >
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.galleryGrid}>
            {(user.gallery || []).slice(0, 3).map((img, i) => (
              <TouchableOpacity
                key={i}
                style={styles.galleryItem}
                onPress={() => navigation.navigate('Gallery', { images: user.gallery, initialIndex: i })}
              >
                <FastImage source={{ uri: img }} style={styles.galleryImage} />
              </TouchableOpacity>
            ))}
          </View>
          {(user.gallery || []).length > 3 && (
            <View style={[styles.galleryGrid, { marginTop: 8 }]}>
              {(user.gallery || []).slice(3, 6).map((img, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.galleryItem}
                  onPress={() => navigation.navigate('Gallery', { images: user.gallery, initialIndex: i + 3 })}
                >
                  <FastImage source={{ uri: img }} style={styles.galleryImage} />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Say Hello CTA */}
        <TouchableOpacity style={styles.helloBtn} onPress={handleMessage} activeOpacity={0.85}>
          <LinearGradient
            colors={['#E94057', '#8A2387']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={styles.helloGradient}
          >
            <Text style={styles.helloText}>Send a Message</Text>
            <Icon name="paper-plane" size={18} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  imageContainer: { height: width * 1.15, width: '100%' },
  mainImage: { width: '100%', height: '100%' },
  backButton: {
    position: 'absolute', left: 20,
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 6, elevation: 4,
  },
  onlineBadge: {
    position: 'absolute', right: 20,
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(255,255,255,0.88)',
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20,
  },
  onlineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#4CAF50' },
  onlineText: { fontSize: 12, color: '#4CAF50', fontWeight: '700' },
  verifiedBadge: {
    position: 'absolute', right: 20, top: 52,
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(255,255,255,0.88)',
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20,
  },
  verifiedText: { fontSize: 12, color: '#4CAF50', fontWeight: '700' },

  // Action buttons
  actionButtonsRow: {
    flexDirection: 'row', justifyContent: 'center',
    alignItems: 'center', gap: 24,
    marginTop: -40, zIndex: 10, marginBottom: 10,
  },
  actionBtn: {
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12, shadowRadius: 10, elevation: 6,
  },
  smallBtn: { width: 64, height: 64, borderRadius: 32 },
  heartBtn: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#E94057',
  },
  heartBtnLiked: { backgroundColor: '#C1284A' },
  btnPressed: { opacity: 0.6 },

  // Content
  content: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 20 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  name: {
    fontSize: 26, fontWeight: '800', color: '#111',
    fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif-medium',
    letterSpacing: -0.3,
  },
  occupation: {
    fontSize: 14, color: '#888', marginTop: 2,
    fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif',
  },
  headerButtons: {
    flexDirection: 'row', gap: 10,
  },
  headerActionBtn: {
    width: 46, height: 46, borderRadius: 14,
    borderWidth: 1, borderColor: '#F0F0F0',
    justifyContent: 'center', alignItems: 'center',
  },
  section: { marginBottom: 22 },
  sectionLabel: {
    fontSize: 17, fontWeight: '700', color: '#111',
    fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif-medium',
    marginBottom: 8,
  },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  locationRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bodyText: {
    fontSize: 14, color: '#5b5b5b', lineHeight: 22,
    fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif',
  },
  distanceBadge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFF0F3', paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 10, gap: 3,
  },
  distanceText: { fontSize: 12, color: '#E94057', fontWeight: '700' },
  readMore: { fontSize: 13, color: '#E94057', fontWeight: '700', marginTop: 4 },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1, borderColor: '#E8E8E8',
    backgroundColor: '#FFFFFF',
  },
  chipActive: { borderColor: '#E94057' },
  chipText: {
    fontSize: 13, color: '#333',
    fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif',
  },
  chipTextActive: { color: '#E94057', fontWeight: '700' },
  seeAll: { fontSize: 13, color: '#E94057', fontWeight: '700', marginBottom: 8 },
  galleryGrid: { flexDirection: 'row', gap: 8 },
  galleryItem: { flex: 1, height: 112, borderRadius: 14, overflow: 'hidden' },
  galleryImage: { width: '100%', height: '100%' },
  helloBtn: { marginTop: 12, borderRadius: 20, overflow: 'hidden' },
  helloGradient: {
    height: 56, flexDirection: 'row',
    justifyContent: 'center', alignItems: 'center', gap: 10,
  },
  helloText: {
    fontSize: 16, fontWeight: '700', color: '#fff',
    fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif-medium',
  },
});
