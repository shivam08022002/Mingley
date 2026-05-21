import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Dimensions, Platform, Alert,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSubscriptionStore } from '../../subscription/store/useSubscriptionStore';
import { SuperchatModal } from '../components/SuperchatModal';
import { userService } from '../../../services/apiServices';
import { decodeEmoji } from '../../../utils/stringUtils';

const { width } = Dimensions.get('window');

const FONT = Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif';
const FONT_MED = Platform.OS === 'ios' ? 'AvenirNext-Medium' : 'sans-serif-medium';
const FONT_BOLD = Platform.OS === 'ios' ? 'AvenirNext-Bold' : 'sans-serif-medium';

export const UserProfileScreen = ({ navigation, route }) => {
  const { user, isFromMatches } = route.params || {};
  const insets = useSafeAreaInsets();
  const [expanded, setExpanded] = useState(false);
  const [liked, setLiked] = useState(false);
  const [rejected, setRejected] = useState(false);
  const [isSuperchatVisible, setSuperchatVisible] = useState(false);
  const [allInterests, setAllInterests] = useState([]);

  useEffect(() => {
    const fetchInterests = async () => {
      try {
        const response = await userService.getInterests();
        setAllInterests(response.data?.interests || []);
      } catch (e) {
        console.error('Fetch interests error:', e);
      }
    };
    fetchInterests();
  }, []);

  const { currentStatus } = useSubscriptionStore();

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

  const handleSuperchat = useCallback(() => {
    setSuperchatVisible(true);
  }, []);

  const handleMessage = useCallback(() => {
    navigation.navigate('Chat', { user });
  }, [navigation, user]);

  const handleCall = useCallback(() => {
    const videoCallEnabled = currentStatus?.plan?.videoCallEnabled || false;
    if (!videoCallEnabled) {
      Alert.alert(
        '🔒 Premium Feature',
        'Video calls are only available for Gold and Platinum members. Upgrade now to connect!',
        [
          { text: 'Later', style: 'cancel' },
          { text: 'Upgrade', onPress: () => navigation.navigate('SubscriptionPlans') }
        ]
      );
      return;
    }
    navigation.navigate('Calling', { user });
  }, [navigation, user, currentStatus]);

  if (!user) return null;

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
          source={{ uri: user.avatar || user.image }}
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
        {(user.isOnline || user.online) && (
          <View style={[styles.onlineBadge, { top: insets.top + 16 }]}>
            <View style={styles.onlineDot} />
            <Text style={styles.onlineText}>Online</Text>
          </View>
        )}

        {/* Verified badge */}
        {(user.isVerified || user.verified) && (
          <View style={[styles.verifiedBadge, { top: insets.top + 16 }]}>
            <Icon name="checkmark-circle" size={16} color="#4CAF50" />
            <Text style={styles.verifiedText}>Verified</Text>
          </View>
        )}
      </View>

      {/* Action Buttons Row */}
      <View style={styles.actionButtonsRow}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.smallBtn, rejected && styles.btnPressed]}
          onPress={handleReject}
          activeOpacity={0.8}
        >
          <Icon name="close" size={28} color="#E86B32" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, styles.heartBtn, liked && styles.heartBtnLiked]}
          onPress={handleLike}
          activeOpacity={0.8}
        >
          <Icon name="heart" size={36} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, styles.smallBtn]}
          onPress={handleSuperchat}
          activeOpacity={0.8}
        >
          <Icon name="chatbubble-ellipses" size={26} color="#8A2BE2" />
        </TouchableOpacity>
      </View>

      {/* ── Content ── */}
      <View style={styles.content}>
        {/* Name row */}
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.name}>{decodeEmoji(user.fullName || user.name)}, {user.age}</Text>
              {(user.isVerified || user.verified) && (
                <Icon name="checkmark-circle" size={24} color="#4CAF50" style={{ marginLeft: 8 }} />
              )}
            </View>
            <Text style={styles.occupation}>{decodeEmoji(user.occupation || user.city)}</Text>
          </View>
          {isFromMatches && (
            <View style={styles.headerButtons}>
              <TouchableOpacity style={styles.headerActionBtn} onPress={handleCall}>
                <Icon name="call-outline" size={20} color="#E94057" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerActionBtn} onPress={handleMessage}>
                <Icon name="paper-plane-outline" size={20} color="#E94057" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Location */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Location</Text>
          <View style={styles.locationRow}>
            <Text style={styles.bodyText}>{decodeEmoji(user.location || user.city)}</Text>
            <View style={styles.distanceBadge}>
              <Icon name="location-outline" size={13} color="#E94057" />
              <Text style={styles.distanceText}>{user.distance || 0} km</Text>
            </View>
          </View>
        </View>

        {/* About */}
        <View style={styles.section}>
          <View style={styles.rowCenter}>
            <Icon name="person-outline" size={20} color="#E94057" style={{ marginRight: 6 }} />
            <Text style={[styles.sectionLabel, { marginBottom: 0 }]}>About</Text>
          </View>
          <Text style={styles.bodyTextBio} numberOfLines={expanded ? undefined : 3}>
            {decodeEmoji(user.bio || user.about)}
          </Text>
          <TouchableOpacity onPress={() => setExpanded(!expanded)} style={{ alignSelf: 'flex-start' }}>
            <Text style={styles.readMore}>{expanded ? 'Read less' : 'Read more'}</Text>
          </TouchableOpacity>
        </View>

        {/* Interests */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Interests</Text>
          <View style={styles.chipsWrap}>
            {(user.interests || []).map((interest, idx) => {
              const interestName = typeof interest === 'string' ? interest : interest.name;
              const interestObj = allInterests.find(i => i.name === interestName);
              return (
                <View
                  key={idx}
                  style={[styles.chip, idx < 2 && styles.chipActive]}
                >
                  {interestObj?.icon ? (
                    <Icon name={interestObj.icon} size={14} color={idx < 2 ? '#E94057' : '#666'} style={{ marginRight: 6 }} />
                  ) : idx < 2 ? (
                    <Icon name="checkmark-done" size={13} color="#E94057" style={{ marginRight: 4 }} />
                  ) : null}
                  <Text style={[styles.chipText, idx < 2 && styles.chipTextActive]}>
                    {interestName}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Gallery */}
        {user.gallery && user.gallery.length > 0 && (
          <View style={styles.section}>
            <View style={styles.locationRow}>
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
        )}

        {/* Superchat Text Only (No box) */}
        {!isFromMatches && (
          <TouchableOpacity 
            style={styles.textOnlyBanner}
            onPress={handleSuperchat}
            activeOpacity={0.7}
          >
            <Text style={styles.textOnlyBannerText}>
              Send a message to reach directly into DM! ⚡
            </Text>
            <Icon name="chevron-forward" size={14} color="#8A2BE2" />
          </TouchableOpacity>
        )}

        {/* Bottom CTA Button */}
        <TouchableOpacity 
          style={styles.helloBtn} 
          onPress={isFromMatches ? handleMessage : handleSuperchat} 
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={isFromMatches ? ['#E94057', '#8A2387'] : ['#8A2BE2', '#4B0082']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={styles.helloGradient}
          >
            <Text style={styles.helloText}>{isFromMatches ? 'Send a Message' : 'Send Superchat'}</Text>
            <Icon name={isFromMatches ? 'paper-plane' : 'flash'} size={18} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <SuperchatModal
        visible={isSuperchatVisible}
        onClose={() => setSuperchatVisible(false)}
        user={user}
      />
    </ScrollView>
  );
};



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  imageContainer: {
    width: width,
    height: width * 1.1,
    position: 'relative',
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  onlineBadge: {
    position: 'absolute',
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    gap: 6,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
  },
  onlineText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    fontFamily: FONT_MED,
  },
  verifiedBadge: {
    position: 'absolute',
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    gap: 4,
  },
  verifiedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginLeft: 4,
    fontFamily: FONT_MED,
  },

  // Action buttons row
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -35,
    zIndex: 10,
    gap: 20,
  },
  actionBtn: {
    backgroundColor: '#FFFFFF',
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  smallBtn: { width: 64, height: 64 },
  heartBtn: { 
    width: 86, height: 86, 
    backgroundColor: '#E94057',
  },
  heartBtnLiked: { backgroundColor: '#E94057', transform: [{ scale: 0.95 }] },
  btnPressed: { opacity: 0.6 },

  textOnlyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginTop: 4,
    gap: 8,
  },
  textOnlyBannerText: {
    fontSize: 12.5,
    color: '#8A2BE2',
    fontWeight: '700',
    flex: 1,
    fontFamily: FONT_BOLD,
  },

  // Content
  content: { paddingHorizontal: 24, paddingTop: 4, paddingBottom: 20 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  name: {
    fontSize: 28, fontWeight: '600', color: '#111',
    fontFamily: FONT_MED,
    letterSpacing: -0.5,
  },
  occupation: {
    fontSize: 15, color: '#999', marginTop: 0,
    fontFamily: FONT,
  },
  headerButtons: {
    flexDirection: 'row', gap: 12,
  },
  headerActionBtn: {
    width: 48, height: 48, borderRadius: 16,
    borderWidth: 1.5, borderColor: '#F5F5F5',
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#fff',
  },
  section: { marginBottom: 24 },
  sectionLabel: {
    fontSize: 18, fontWeight: '600', color: '#000',
    fontFamily: FONT_MED,
    marginBottom: 10,
  },
  rowCenter: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  locationRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  bodyText: {
    fontSize: 15, color: '#666', lineHeight: 24,
    fontFamily: FONT,
  },
  bodyTextBio: {
    fontSize: 15, color: '#444', lineHeight: 24,
    fontFamily: FONT,
  },
  distanceBadge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFF0F3', paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 12, gap: 4,
  },
  distanceText: { fontSize: 13, color: '#E94057', fontWeight: '600', fontFamily: FONT_MED },
  readMore: { fontSize: 14, color: '#E94057', fontWeight: '600', marginTop: 6, fontFamily: FONT_MED },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#E8E6EA',
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: '#FFF0F3',
    borderColor: '#E94057',
  },
  chipText: {
    fontSize: 14,
    color: '#666',
    fontFamily: FONT,
    fontWeight: '500',
  },
  chipTextActive: {
    color: '#E94057',
    fontWeight: '700',
  },
  seeAll: { fontSize: 14, color: '#E94057', fontWeight: '600', marginBottom: 10, fontFamily: FONT_MED },
  galleryGrid: { flexDirection: 'row', gap: 10 },
  galleryItem: { flex: 1, height: 120, borderRadius: 18, overflow: 'hidden' },
  galleryImage: { width: '100%', height: '100%' },
  helloBtn: {
    marginTop: 16, borderRadius: 100, overflow: 'hidden',
    shadowColor: '#8A2BE2', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3, shadowRadius: 15, elevation: 10,
  },
  helloGradient: {
    height: 60, flexDirection: 'row',
    justifyContent: 'center', alignItems: 'center', gap: 12,
  },
  helloText: {
    fontSize: 18, fontWeight: '600', color: '#fff',
    fontFamily: FONT_MED,
    letterSpacing: 0.5,
  },
});
