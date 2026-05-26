import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Dimensions, Platform, Alert,
  Animated, FlatList,
} from 'react-native';
import { Image as FastImage } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSubscriptionStore } from '../../subscription/store/useSubscriptionStore';
import { SuperchatModal } from '../components/SuperchatModal';
import { userService } from '../../../services/apiServices';
import { decodeEmoji } from '../../../utils/stringUtils';

const { width, height } = Dimensions.get('window');

const FONT = Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif';
const FONT_MED = Platform.OS === 'ios' ? 'AvenirNext-Medium' : 'sans-serif-medium';
const FONT_BOLD = Platform.OS === 'ios' ? 'AvenirNext-Bold' : 'sans-serif-medium';

const IMAGE_HEIGHT = height * 0.40;

export const UserProfileScreen = ({ navigation, route }) => {
  const { user, isFromMatches, isFromLikes } = route.params || {};
  const insets = useSafeAreaInsets();
  const [expanded, setExpanded] = useState(false);
  const [liked, setLiked] = useState(false);
  const [rejected, setRejected] = useState(false);
  const [isSuperchatVisible, setSuperchatVisible] = useState(false);
  const [allInterests, setAllInterests] = useState([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;

  // Build image gallery: avatar + gallery images
  const images = (() => {
    const arr = [];
    if (user?.avatar || user?.image) arr.push(user.avatar || user.image);
    const extraImages = (user?.gallery && user.gallery.length > 0) ? user.gallery : (user?.images || []);
    if (extraImages.length) {
      extraImages.forEach((img) => {
        if (img !== arr[0]) arr.push(img);
      });
    }
    return arr.length > 0 ? arr : ['https://via.placeholder.com/500'];
  })();

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

  const locationText = (() => {
    if (typeof user.location === 'string') return decodeEmoji(user.location);
    if (user.location?.city) {
      return `${user.location.city}${user.location.country ? `, ${user.location.country}` : ''}`;
    }
    return user.city || 'Near you';
  })();

  const handleImageScroll = (event) => {
    const idx = Math.round(event.nativeEvent.contentOffset.x / width);
    setActiveImageIndex(idx);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        bounces
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* ── Hero Image Carousel ── */}
        <View style={styles.imageContainer}>
          <Animated.ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: false }
            )}
            onMomentumScrollEnd={handleImageScroll}
            scrollEventThrottle={16}
          >
            {images.map((img, i) => (
              <FastImage
                key={i}
                source={{ uri: img?.url || img }}
                style={styles.heroImage}
                contentFit="cover"
              />
            ))}
          </Animated.ScrollView>

          {/* Top gradient for badges */}
          <LinearGradient
            colors={['rgba(0,0,0,0.45)', 'transparent']}
            style={styles.topGradient}
            pointerEvents="none"
          />
          {/* Bottom gradient for smooth transition */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.02)', '#F8F8F8']}
            style={styles.bottomGradient}
            pointerEvents="none"
          />

          {/* Back button */}
          <TouchableOpacity
            style={[styles.backButton, { top: insets.top + 10 }]}
            onPress={() => navigation.goBack()}
          >
            <Icon name="chevron-back" size={22} color="#FFF" />
          </TouchableOpacity>

          {/* Online / Verified badge */}
          {(user.isOnline || user.online) && (
            <View style={[styles.topRightBadge, { top: insets.top + 14 }]}>
              <View style={styles.onlineDot} />
              <Text style={styles.badgeText}>Online</Text>
            </View>
          )}
          {(user.isVerified || user.verified) && !(user.isOnline || user.online) && (
            <View style={[styles.topRightBadge, { top: insets.top + 14 }]}>
              <Icon name="checkmark-circle" size={14} color="#4CAF50" />
              <Text style={styles.badgeText}>Verified</Text>
            </View>
          )}

          {/* Image pagination dots */}
          {images.length > 1 && (
            <View style={styles.paginationDots}>
              {images.map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    i === activeImageIndex && styles.dotActive,
                  ]}
                />
              ))}
            </View>
          )}
        </View>

        {/* ── Content ── */}
        <View style={styles.content}>
          {/* ── Floating Action Buttons Row inside content ── */}
          {!(isFromMatches || isFromLikes) && (
            <View style={styles.actionButtonsRowInside}>
              <TouchableOpacity
                style={[styles.actionBtn, styles.smallActionBtn, rejected && styles.btnPressed]}
                onPress={handleReject}
                activeOpacity={0.8}
              >
                <Icon name="close" size={26} color="#F27121" />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtn, styles.heartActionBtn, liked && styles.heartBtnLiked]}
                onPress={handleLike}
                activeOpacity={0.8}
              >
                <Icon name="heart" size={32} color="#FFFFFF" />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtn, styles.smallActionBtn]}
                onPress={handleSuperchat}
                activeOpacity={0.8}
              >
                <Icon name="flash" size={24} color="#7C3AED" />
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.nameRow}>
            <View style={{ flex: 1 }}>
              <View style={styles.nameAgeRow}>
                <Text style={styles.name}>
                  {decodeEmoji(user.fullName || user.name)}
                </Text>
                {!!user.age && <Text style={styles.age}>, {user.age}</Text>}
                {(user.gender?.toLowerCase() === 'female' || user.gender?.toLowerCase() === 'woman') && (
                  <Icon name="female" size={20} color="#E94057" style={{ marginLeft: 8, alignSelf: 'center' }} />
                )}
                {(user.gender?.toLowerCase() === 'male' || user.gender?.toLowerCase() === 'man') && (
                  <Icon name="male" size={20} color="#3B82F6" style={{ marginLeft: 8, alignSelf: 'center' }} />
                )}
              </View>

              <View style={styles.badgeRow}>
                {/* Verified / Not Verified Badge */}
                {(() => {
                  const isUserVerified = !!(user.isVerified || user.verified);
                  return (
                    <View style={[styles.statusBadge, isUserVerified ? styles.verifiedBadge : styles.unverifiedBadge]}>
                      <Icon
                        name={isUserVerified ? 'checkmark-circle' : 'close-circle'}
                        size={12}
                        color={isUserVerified ? '#4CAF50' : '#888'}
                      />
                      <Text style={[styles.statusBadgeText, isUserVerified ? styles.verifiedBadgeText : styles.unverifiedBadgeText]}>
                        {isUserVerified ? 'Verified' : 'Not Verified'}
                      </Text>
                    </View>
                  );
                })()}

                {/* Match Score Badge */}
                {user.matchScore !== undefined && (
                  <View style={styles.matchScoreBadgeInline}>
                    <Icon name="flame" size={12} color="#FFF" style={{ marginRight: 2 }} />
                    <Text style={styles.matchScoreTextInline}>{user.matchScore}% Match</Text>
                  </View>
                )}
              </View>
            </View>
            {isFromMatches && (
              <View style={styles.headerButtons}>
                <TouchableOpacity style={styles.headerActionBtn} onPress={handleMessage}>
                  <Icon name="paper-plane-outline" size={20} color="#E94057" />
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Location Card */}
          <View style={styles.locationCard}>
            <View style={styles.locationLeft}>
              <Text style={styles.locationTitle}>Location</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                <Text style={styles.locationCity}>{locationText}</Text>
                <Icon name="location-sharp" size={14} color="#E94057" style={{ marginLeft: 6 }} />
              </View>
            </View>
            <View style={styles.distanceBadgeRight}>
              <Text style={styles.distanceBadgeText}>{user.distance != null ? user.distance : 0} km</Text>
            </View>
          </View>

          {/* Occupation / Bio line */}
          {user.occupation ? (
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Icon name="briefcase-outline" size={16} color="#E94057" />
                <Text style={styles.infoRowText}>{decodeEmoji(user.occupation)}</Text>
              </View>
            </View>
          ) : null}

          {/* About */}
          <View style={styles.section}>
            <View style={styles.sectionTitleRow}>
              <Icon name="person-outline" size={18} color="#E94057" style={{ marginRight: 8 }} />
              <Text style={styles.sectionLabel}>About</Text>
            </View>
            <Text style={styles.bodyTextBio}>
              {decodeEmoji(user.bio || user.about || 'No bio available.')}
            </Text>
          </View>

          {/* Interests */}
          {(user.interests || []).length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionTitleRow}>
                <Icon name="heart-outline" size={18} color="#E94057" style={{ marginRight: 8 }} />
                <Text style={styles.sectionLabel}>Interests</Text>
              </View>
              <View style={styles.chipsWrap}>
                {(user.interests || []).map((interest, idx) => {
                  const interestName = typeof interest === 'string' ? interest : interest.name;
                  const interestObj = allInterests.find(i => i.name === interestName);
                  const isHighlighted = idx < 3;
                  return (
                    <View
                      key={idx}
                      style={[styles.chip, isHighlighted && styles.chipActive]}
                    >
                      {interestObj?.icon ? (
                        <Icon name={interestObj.icon} size={14} color={isHighlighted ? '#E94057' : '#777'} style={{ marginRight: 6 }} />
                      ) : isHighlighted ? (
                        <Icon name="sparkles" size={13} color="#E94057" style={{ marginRight: 5 }} />
                      ) : null}
                      <Text style={[styles.chipText, isHighlighted && styles.chipTextActive]}>
                        {interestName}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {/* Gallery */}
          {(() => {
            const galleryImages = (user.gallery && user.gallery.length > 0) ? user.gallery : (user.images || []);
            if (!galleryImages.length) return null;
            return (
              <View style={styles.section}>
                <View style={styles.sectionTitleRow}>
                  <Icon name="images-outline" size={18} color="#E94057" style={{ marginRight: 8 }} />
                  <Text style={[styles.sectionLabel, { flex: 1 }]}>Gallery</Text>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('Gallery', { images: galleryImages, initialIndex: 0 })}
                  >
                    <Text style={styles.seeAll}>See all</Text>
                  </TouchableOpacity>
                </View>
                {(() => {
                  const rows = [];
                  for (let i = 0; i < galleryImages.length; i += 3) {
                    rows.push(galleryImages.slice(i, i + 3));
                  }
                  return rows.map((rowImages, rowIndex) => (
                    <View key={rowIndex} style={[styles.galleryGrid, rowIndex > 0 && { marginTop: 10 }]}>
                      {rowImages.map((img, colIndex) => {
                        const originalIndex = rowIndex * 3 + colIndex;
                        return (
                          <TouchableOpacity
                            key={colIndex}
                            style={styles.galleryItem}
                            onPress={() => navigation.navigate('Gallery', { images: galleryImages, initialIndex: originalIndex })}
                          >
                            <FastImage source={{ uri: img?.url || img }} style={styles.galleryImage} />
                          </TouchableOpacity>
                        );
                      })}
                      {rowImages.length < 3 && Array.from({ length: 3 - rowImages.length }).map((_, emptyIdx) => (
                        <View key={`empty-${emptyIdx}`} style={styles.galleryItemPlaceholder} />
                      ))}
                    </View>
                  ));
                })()}
              </View>
            );
          })()}

          {/* Superchat Text Banner (non-match) */}
          {!(isFromMatches || isFromLikes) && (
            <TouchableOpacity
              style={styles.superchatBanner}
              onPress={handleSuperchat}
              activeOpacity={0.7}
            >
              <Icon name="flash" size={18} color="#7C3AED" />
              <Text style={styles.superchatBannerText}>
                Send a Superchat to stand out! 💬
              </Text>
              <Icon name="chevron-forward" size={16} color="#E94057" />
            </TouchableOpacity>
          )}

          {/* Bottom CTA Button */}
          {!isFromLikes && (
            <TouchableOpacity
              style={styles.ctaButton}
              onPress={isFromMatches ? handleMessage : handleSuperchat}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={['#E94057', '#8A2387']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={styles.ctaGradient}
              >
                <Icon name={isFromMatches ? 'paper-plane' : 'chatbubble-ellipses'} size={20} color="#fff" style={{ marginRight: 10 }} />
                <Text style={styles.ctaText}>{isFromMatches ? 'Send a Message' : 'Send Superchat'}</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      <SuperchatModal
        visible={isSuperchatVisible}
        onClose={() => setSuperchatVisible(false)}
        user={user}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },

  // ── Hero image carousel ──────────────────────────────────────────────────
  imageContainer: {
    width: width,
    height: IMAGE_HEIGHT,
    position: 'relative',
    backgroundColor: '#E0E0E0',
  },
  heroImage: {
    width: width,
    height: IMAGE_HEIGHT,
  },
  topGradient: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 100,
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    height: 60,
  },
  backButton: {
    position: 'absolute',
    left: 20,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topRightBadge: {
    position: 'absolute',
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
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
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: FONT_MED,
  },
  paginationDots: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  dotActive: {
    backgroundColor: '#FFFFFF',
    width: 24,
    borderRadius: 4,
  },

  // ── Floating action buttons ────────────────────────────────────────────────
  actionButtonsRowInside: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -66,
    marginBottom: 24,
    zIndex: 10,
    gap: 18,
  },
  actionBtn: {
    backgroundColor: '#FFFFFF',
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0px 8px 16px rgba(0,0,0,0.12)',
    elevation: 8,
  },
  smallActionBtn: { width: 56, height: 56 },
  heartActionBtn: {
    width: 72, height: 72,
    backgroundColor: '#E94057',
    shadowColor: '#E94057',
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 20,
    elevation: 12,
  },
  heartBtnLiked: { backgroundColor: '#E94057', transform: [{ scale: 0.92 }] },
  btnPressed: { opacity: 0.5 },

  // ── Content ────────────────────────────────────────────────────────────────
  content: {
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 20,
    backgroundColor: '#F8F8F8',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -32,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 28,
  },
  nameAgeRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
  },
  name: {
    fontSize: 22, fontWeight: '600', color: '#1A1A2E',
    fontFamily: FONT_MED,
    letterSpacing: -0.3,
  },
  age: {
    fontSize: 20, fontWeight: '400', color: '#555',
    fontFamily: FONT,
    letterSpacing: -0.3,
  },
  locationCard: {
    marginBottom: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  locationLeft: {
    flex: 1,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A2E',
    fontFamily: FONT_MED,
    marginBottom: 4,
  },
  locationCity: {
    fontSize: 14,
    color: '#666',
    fontFamily: FONT,
  },
  distanceBadgeRight: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0F3',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 4,
  },
  distanceBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#E94057',
    fontFamily: FONT_MED,
  },
  headerButtons: {
    flexDirection: 'row', gap: 10,
  },
  headerActionBtn: {
    width: 44, height: 44, borderRadius: 14,
    borderWidth: 1.5, borderColor: '#F0F0F0',
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#fff',
    boxShadow: '0px 2px 6px rgba(0,0,0,0.05)',
    elevation: 2,
  },

  // Info card
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 30,
    boxShadow: '0px 2px 10px rgba(0,0,0,0.04)',
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  infoRowText: {
    fontSize: 15, color: '#555',
    fontFamily: FONT,
    fontWeight: '500',
  },

  // Sections
  section: { marginBottom: 30 },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 16, fontWeight: '600', color: '#1A1A2E',
    fontFamily: FONT_MED,
  },
  bodyTextBio: {
    fontSize: 15, color: '#555', lineHeight: 24,
    fontFamily: FONT,
  },
  readMore: {
    fontSize: 14, color: '#E94057', fontWeight: '600', marginTop: 8,
    fontFamily: FONT_MED,
  },

  // Interest chips
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#E8E6EA',
    backgroundColor: '#FFFFFF',
  },
  chipActive: {
    backgroundColor: '#FFF0F3',
    borderColor: '#E94057',
  },
  chipText: {
    fontSize: 13,
    color: '#777',
    fontFamily: FONT,
    fontWeight: '500',
  },
  chipTextActive: {
    color: '#E94057',
    fontWeight: '600',
  },

  // Gallery
  seeAll: {
    fontSize: 14, color: '#E94057', fontWeight: '600',
    fontFamily: FONT_MED,
  },
  galleryGrid: { flexDirection: 'row', gap: 10 },
  galleryItem: {
    flex: 1, height: 110, borderRadius: 12, overflow: 'hidden',
    backgroundColor: '#E0E0E0',
  },
  galleryItemPlaceholder: {
    flex: 1,
    height: 110,
  },
  galleryImage: { width: '100%', height: '100%' },

  // Superchat banner
  superchatBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFF0F3',
    borderRadius: 16,
    marginBottom: 16,
    gap: 10,
  },
  superchatBannerText: {
    fontSize: 13.5,
    color: '#E94057',
    fontWeight: '500',
    flex: 1,
    fontFamily: FONT_MED,
  },

  // CTA Button
  ctaButton: {
    marginTop: 8, borderRadius: 100, overflow: 'hidden',
    shadowColor: '#E94057', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28, shadowRadius: 16, elevation: 10,
  },
  ctaGradient: {
    height: 58, flexDirection: 'row',
    justifyContent: 'center', alignItems: 'center',
  },
  ctaText: {
    fontSize: 17, fontWeight: '600', color: '#fff',
    fontFamily: FONT_MED,
    letterSpacing: 0.3,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    flexWrap: 'wrap',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
    borderWidth: 1,
  },
  verifiedBadge: {
    backgroundColor: 'rgba(76, 175, 80, 0.08)',
    borderColor: 'rgba(76, 175, 80, 0.25)',
  },
  unverifiedBadge: {
    backgroundColor: 'rgba(128, 128, 128, 0.08)',
    borderColor: 'rgba(128, 128, 128, 0.2)',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: FONT_MED,
  },
  verifiedBadgeText: {
    color: '#4CAF50',
  },
  unverifiedBadgeText: {
    color: '#888',
  },
  matchScoreBadgeInline: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E94057',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 3,
  },
  matchScoreTextInline: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
    fontFamily: FONT_MED,
  },
});
