import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Dimensions, Image } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { decodeEmoji } from '../../../utils/stringUtils';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const COVER_H = 240;
const AVATAR_SIZE = 100;

const FONT_REG = Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif';
const FONT_MED = Platform.OS === 'ios' ? 'AvenirNext-Medium' : 'sans-serif-medium';
const FONT_BOLD = Platform.OS === 'ios' ? 'AvenirNext-Bold' : 'sans-serif-medium';

export const ProfileHeader = React.memo(({ profile = {}, onEditAvatar, onSettings, onPressNotifications, hasNotifications }) => {
  const insets = useSafeAreaInsets();
  const {
    fullName,
    avatar,
    verified,
    isVerified,
    online,
    isOnline,
    bio,
    location,
    gender,
    age,
    completionPct = 0,
  } = profile;
  const showVerified = typeof isVerified === 'boolean' ? isVerified : verified;
  const showOnline = typeof isOnline === 'boolean' ? isOnline : online;
  const profileCompletion = Math.max(0, Math.min(100, Number(completionPct) || 100));

  const topOffset = insets.top > 0 ? insets.top + 8 : 12;

  return (
    <View style={s.container}>
      {/* ── Cover with overlay & white text ON it ── */}
      <View style={s.coverWrap}>
        <Image
          source={{ uri: avatar || 'https://via.placeholder.com/800x400' }}
          style={s.cover}
          resizeMode="cover"
        />
        {/* Dark gradient so text is readable */}
        <LinearGradient
          colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.65)']}
          style={StyleSheet.absoluteFill}
        />

        {/* Verified Top Badge – adjacent to Gear icon */}
        {showVerified && (
          <View style={[s.verifiedBadgeTop, { top: topOffset + 6 }]}>
            <Icon name="checkmark-circle" size={12} color="#4CAF50" />
            <Text style={s.verifiedBadgeText}>Verified</Text>
          </View>
        )}

        {/* Gear icon – top-right */}
        <TouchableOpacity style={[s.gearBtn, { top: topOffset }]} onPress={onSettings}>
          <Icon name="settings-outline" size={22} color="#fff" />
        </TouchableOpacity>

        {/* Name overlaid ON the cover (white) */}
        <View style={s.coverTextBlock}>
          <View style={s.nameRow}>
            <Text style={s.coverName}>{`${decodeEmoji(fullName) || 'New User'}${age ? `, ${age}` : ''}`}</Text>
            {(gender?.toLowerCase() === 'female' || gender?.toLowerCase() === 'woman') && (
              <Icon name="female" size={20} color="#E94057" style={{ marginLeft: 4 }} />
            )}
            {(gender?.toLowerCase() === 'male' || gender?.toLowerCase() === 'man') && (
              <Icon name="male" size={20} color="#3B82F6" style={{ marginLeft: 4 }} />
            )}
          </View>
        </View>
      </View>

      {/* ── Avatar row (overlapping cover bottom) ── */}
      <View style={s.avatarRow}>
        <View style={s.avatarWrap}>
          <Image source={{ uri: avatar || 'https://via.placeholder.com/300x300' }} style={s.avatar} />
          {showOnline && <View style={s.onlineDot} />}
          <TouchableOpacity style={s.cameraBtn} onPress={onEditAvatar}>
            <Icon name="camera" size={14} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Bio & Location ── */}
      <View style={s.bioLocContainer}>
        <View style={s.headerRow}>
          <View style={{ flex: 1 }}>
            <View style={s.locRow}>
              <Icon name="location" size={16} color="#E94057" />
              <Text style={s.locText}>{location?.city || 'Location not set'}{location?.country ? `, ${location.country}` : ''}</Text>
            </View>
            <Text style={s.bioText} numberOfLines={3}>{decodeEmoji(bio) || 'Add a bio to your profile'}</Text>
          </View>

          {/* Notification Icon inside bio card */}
          <TouchableOpacity
            style={s.notifIcon}
            onPress={onPressNotifications}
            activeOpacity={0.7}
          >
            <Icon name="notifications-outline" size={24} color="#E94057" />
            {hasNotifications && <View style={s.notifDot} />}
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Profile Completion Bar ── */}
      <View style={s.completionContainer}>
        <View style={s.completionHeader}>
          <Text style={s.completionLabel}>Profile completion</Text>
          <Text style={s.completionValue}>{profileCompletion}%</Text>
        </View>
        <View style={s.progressBarBackground}>
          <LinearGradient
            colors={['#E94057', '#8A2387']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={[s.progressBarFill, { width: `${profileCompletion}%` }]}
          />
        </View>
      </View>

    </View>
  );
});

const s = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    marginBottom: 6,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 4,
  },
  coverWrap: {
    height: COVER_H,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  cover: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: width,
    height: COVER_H,
  },
  gearBtn: {
    position: 'absolute', top: Platform.OS === 'ios' ? 44 : 26, right: 16,
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center', alignItems: 'center',
  },
  verifiedBadgeTop: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 32,
    right: 70,
    height: 32,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.16)',
    borderWidth: 1.5,
    borderColor: 'rgba(76, 175, 79, 0.05)',
    paddingHorizontal: 10,
    borderRadius: 10,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  verifiedBadgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
    fontFamily: FONT_MED,
  },
  coverTextBlock: {
    paddingHorizontal: 20,
    paddingBottom: 68,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  coverName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
    fontFamily: FONT_MED,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  // Avatar overlapping cover
  avatarRow: {
    marginTop: -(AVATAR_SIZE / 2),
    paddingHorizontal: 20,
    marginBottom: 8,
    zIndex: 3,
  },
  avatarWrap: {
    width: AVATAR_SIZE, height: AVATAR_SIZE,
    shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 12, elevation: 8,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    borderWidth: 4,
    borderColor: '#fff',
  },
  onlineDot: {
    position: 'absolute', bottom: 6, right: 6,
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: '#4CAF50', borderWidth: 2.5, borderColor: '#fff',
  },
  cameraBtn: {
    position: 'absolute', bottom: 0, right: 0,
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: '#E94057',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#fff',
  },
  bioLocContainer: {
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginTop: 0,
    borderRadius: 28,
    paddingTop: 20,
    paddingBottom: 18,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 5,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  locRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 4,
  },
  locText: {
    fontSize: 15,
    color: '#666',
    marginLeft: 4,
    fontWeight: '600',
    fontFamily: FONT_BOLD,
  },
  bioText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 23,
    fontWeight: '400',
    paddingRight: 4,
    fontFamily: FONT_REG,
  },
  notifIcon: {
    width: 56,
    height: 56,
    backgroundColor: '#FFF0F3',
    borderRadius: 18,
    marginLeft: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E94057',
    borderWidth: 1.5,
    borderColor: '#FFF',
  },
  completionContainer: {
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 2,
  },
  completionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  completionLabel: {
    fontSize: 14,
    color: '#AAA',
    fontWeight: '600',
  },
  completionValue: {
    fontSize: 14,
    color: '#E94057',
    fontWeight: '800',
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 99,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 99,
  },
});
