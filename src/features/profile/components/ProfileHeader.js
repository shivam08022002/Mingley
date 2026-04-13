import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Platform, Dimensions,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');
const COVER_H = 220;
const AVATAR_SIZE = 90;

export const ProfileHeader = React.memo(({ profile, onEditAvatar, onSettings }) => {
  const { name, age, occupation, location, avatar, coverImage, completionPct, verified, online } = profile;

  return (
    <View style={s.container}>
      {/* ── Cover with overlay & white text ON it ── */}
      <View style={s.coverWrap}>
        <FastImage
          source={{ uri: coverImage }}
          style={s.cover}
          resizeMode={FastImage.resizeMode.cover}
        />
        {/* Dark gradient bottom-half so text is readable */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.72)']}
          style={StyleSheet.absoluteFillObject}
        />

        {/* Gear icon – top-right */}
        <TouchableOpacity style={s.gearBtn} onPress={onSettings}>
          <Icon name="settings-outline" size={20} color="#fff" />
        </TouchableOpacity>

        {/* Name + occupation overlaid ON the cover (white) */}
        <View style={s.coverTextBlock}>
          <View style={s.nameRow}>
            <Text style={s.coverName}>{name}, {age}</Text>
            {verified && (
              <View style={s.verifiedBadge}>
                <Icon name="checkmark-circle" size={15} color="#4CAF50" />
              </View>
            )}
          </View>
          <Text style={s.coverOccupation}>{occupation}</Text>
          <View style={s.locRow}>
            <Icon name="location-outline" size={12} color="rgba(255,255,255,0.8)" />
            <Text style={s.coverLoc}>{location}</Text>
          </View>
        </View>
      </View>

      {/* ── Avatar row (overlapping cover bottom) ── */}
      <View style={s.avatarRow}>
        <View style={s.avatarWrap}>
          <FastImage source={{ uri: avatar }} style={s.avatar} />
          {online && <View style={s.onlineDot} />}
          <TouchableOpacity style={s.cameraBtn} onPress={onEditAvatar}>
            <Icon name="camera" size={13} color="#fff" />
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
            colors={['#E4415C', '#8A2387']}
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
  cover: { ...StyleSheet.absoluteFillObject },
  gearBtn: {
    position: 'absolute', top: 48, right: 16,
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center', alignItems: 'center',
  },
  coverTextBlock: {
    paddingHorizontal: 20,
    paddingBottom: 56, // leave room for avatar overlap
  },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  coverName: {
    fontSize: 24, fontWeight: '800', color: '#fff',
    fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif-medium',
  },
  verifiedBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10, padding: 2,
  },
  coverOccupation: {
    fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 3,
    fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif',
  },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 5 },
  coverLoc: {
    fontSize: 12, color: 'rgba(255,255,255,0.75)',
    fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif',
  },

  // Avatar overlapping cover
  avatarRow: {
    marginTop: -(AVATAR_SIZE / 2),
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  avatarWrap: {
    width: AVATAR_SIZE, height: AVATAR_SIZE,
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10, elevation: 8,
  },
  avatar: {
    width: AVATAR_SIZE, height: AVATAR_SIZE,
    borderRadius: 26, borderWidth: 3, borderColor: '#fff',
  },
  onlineDot: {
    position: 'absolute', bottom: 4, right: 4,
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: '#4CAF50', borderWidth: 2.5, borderColor: '#fff',
  },
  cameraBtn: {
    position: 'absolute', bottom: 0, right: 0,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#E4415C',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#fff',
  },

  // Progress
  progressWrap: { paddingHorizontal: 20, paddingBottom: 18 },
  progressTop: {
    flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6,
  },
  progressLabel: { fontSize: 12, color: '#999' },
  progressPct: { fontSize: 12, fontWeight: '700', color: '#E4415C' },
  progressBg: { height: 7, backgroundColor: '#F2F2F2', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
});
