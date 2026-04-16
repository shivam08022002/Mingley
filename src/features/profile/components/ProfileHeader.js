import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Dimensions, Image } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');
const COVER_H = 240;
const AVATAR_SIZE = 100;

const FONT = Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif';
const FONT_BOLD = Platform.OS === 'ios' ? 'AvenirNext-Bold' : 'sans-serif-medium';

export const ProfileHeader = React.memo(({ profile, onEditAvatar, onSettings }) => {
  const { name, age, occupation, location, avatar, coverImage, completionPct, verified, online } = profile;

  return (
    <View style={s.container}>
      {/* ── Cover with overlay & white text ON it ── */}
      <View style={s.coverWrap}>
        <Image
          source={{ uri: coverImage }}
          style={s.cover}
          resizeMode="cover"
        />
        {/* Dark gradient so text is readable */}
        <LinearGradient
          colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.65)']}
          style={StyleSheet.absoluteFillObject}
        />

        {/* Gear icon – top-right */}
        <TouchableOpacity style={s.gearBtn} onPress={onSettings}>
          <Icon name="settings-outline" size={22} color="#fff" />
        </TouchableOpacity>

        {/* Verified badge – top center */}
        {verified && (
          <View style={s.verifiedTopBadge}>
            <Icon name="checkmark-circle" size={20} color="#4CAF50" />
          </View>
        )}

        {/* Name + occupation overlaid ON the cover (white) */}
        <View style={s.coverTextBlock}>
          <View style={s.nameRow}>
            <Text style={s.coverName}>{name}, {age}</Text>
          </View>
          <Text style={s.coverOccupation}>{occupation}</Text>
          <View style={s.locRow}>
            <Icon name="location-outline" size={13} color="rgba(255,255,255,0.85)" />
            <Text style={s.coverLoc}>{location}</Text>
          </View>
        </View>
      </View>

      {/* ── Avatar row (overlapping cover bottom) ── */}
      <View style={s.avatarRow}>
        <View style={s.avatarWrap}>
          <Image source={{ uri: avatar }} style={s.avatar} />
          {online && <View style={s.onlineDot} />}
          <TouchableOpacity style={s.cameraBtn} onPress={onEditAvatar}>
            <Icon name="camera" size={14} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Completion bar ── */}
      <View style={s.progressWrap}>
        <View style={s.progressTop}>
          <Text style={s.progressLabel}>Profile completion</Text>
          <Text style={s.progressPct}>{completionPct}%</Text>
        </View>
        <View style={s.progressBg}>
          <LinearGradient
            colors={['#E94057', '#8A2387']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={[s.progressFill, { width: `${completionPct}%` }]}
          />
        </View>
      </View>
    </View>
  );
});

const s = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    marginBottom: 4,
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
    position: 'absolute', top: Platform.OS === 'ios' ? 54 : 40, right: 16,
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center', alignItems: 'center',
  },
  verifiedTopBadge: {
    position: 'absolute', top: Platform.OS === 'ios' ? 58 : 44,
    alignSelf: 'center',
  },
  coverTextBlock: {
    paddingHorizontal: 20,
    paddingBottom: 60, // leave room for avatar overlap
  },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  coverName: {
    fontSize: 26, fontWeight: '800', color: '#fff',
    fontFamily: FONT_BOLD,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  coverOccupation: {
    fontSize: 14, color: 'rgba(255,255,255,0.9)', marginTop: 4,
    fontFamily: FONT,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 5 },
  coverLoc: {
    fontSize: 13, color: 'rgba(255,255,255,0.8)',
    fontFamily: FONT,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },

  // Avatar overlapping cover
  avatarRow: {
    marginTop: -(AVATAR_SIZE / 2),
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  avatarWrap: {
    width: AVATAR_SIZE, height: AVATAR_SIZE,
    shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 12, elevation: 8,
  },
  avatar: {
    width: AVATAR_SIZE, height: AVATAR_SIZE,
    borderRadius: 28, borderWidth: 3, borderColor: '#fff',
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

  // Progress
  progressWrap: { paddingHorizontal: 20, paddingBottom: 18 },
  progressTop: {
    flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6,
  },
  progressLabel: { fontSize: 12, color: '#999', fontFamily: FONT },
  progressPct: { fontSize: 12, fontWeight: '700', color: '#E94057', fontFamily: FONT_BOLD },
  progressBg: { height: 7, backgroundColor: '#F2F2F2', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
});
