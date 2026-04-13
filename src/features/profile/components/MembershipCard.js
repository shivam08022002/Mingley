import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Platform, Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');

const PLAN_CONFIG = {
  free: {
    label: 'Free Plan',
    tag: 'BASIC',
    benefit: 'Unlock unlimited likes, advanced filters & more',
    perks: ['5 likes per day', 'Basic filters only', 'Ads included'],
    icon: 'flame-outline',
    colors: ['#E4415C', '#8A2387'],
    tagColor: 'rgba(255,255,255,0.25)',
  },
  premium: {
    label: 'Premium',
    tag: 'PREMIUM ⭐',
    benefit: 'Unlimited likes, see who liked you & go incognito',
    perks: ['Unlimited likes', 'Advanced filters', 'No ads'],
    icon: 'star',
    colors: ['#f093fb', '#f5576c'],
    tagColor: 'rgba(255,255,255,0.25)',
  },
  pro: {
    label: 'Pro Member',
    tag: 'PRO 💎',
    benefit: 'Full access — priority boosts & exclusive features',
    perks: ['All Premium perks', 'Profile boost', 'Top picks daily'],
    icon: 'diamond',
    colors: ['#4facfe', '#00f2fe'],
    tagColor: 'rgba(255,255,255,0.2)',
  },
};

export const MembershipCard = React.memo(({ plan = 'free', onUpgrade }) => {
  const config = PLAN_CONFIG[plan] || PLAN_CONFIG.free;
  const isPaid = plan !== 'free';

  return (
    <LinearGradient
      colors={config.colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={s.card}
    >
      {/* Top row: plan label + tag badge */}
      <View style={s.topRow}>
        <View style={s.iconWrap}>
          <Icon name={config.icon} size={24} color="#fff" />
        </View>
        <View style={s.titleBlock}>
          <Text style={s.planLabel}>{config.label}</Text>
          <View style={[s.tagBadge, { backgroundColor: config.tagColor }]}>
            <Text style={s.tagText}>{config.tag}</Text>
          </View>
        </View>
        {isPaid ? (
          <View style={s.activePill}>
            <Icon name="checkmark-circle" size={14} color="#fff" />
            <Text style={s.activePillText}>Active</Text>
          </View>
        ) : (
          <TouchableOpacity style={s.upgradeBtn} onPress={onUpgrade} activeOpacity={0.85}>
            <Text style={s.upgradeText}>Upgrade ↗</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Divider */}
      <View style={s.divider} />

      {/* Perks row */}
      <View style={s.perksRow}>
        {config.perks.map((perk, i) => (
          <View key={i} style={s.perk}>
            <Icon name="checkmark-circle-outline" size={13} color="rgba(255,255,255,0.85)" />
            <Text style={s.perkText}>{perk}</Text>
          </View>
        ))}
      </View>

      {/* Benefit text */}
      <Text style={s.benefit}>{config.benefit}</Text>
    </LinearGradient>
  );
});

const s = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 22,
    padding: 18,
    shadowColor: '#E4415C',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  iconWrap: {
    width: 46, height: 46, borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },
  titleBlock: { flex: 1, gap: 4 },
  planLabel: {
    fontSize: 17, fontWeight: '800', color: '#fff',
    fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif-medium',
  },
  tagBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 10, fontWeight: '700', color: '#fff', letterSpacing: 0.5,
  },
  upgradeBtn: {
    backgroundColor: '#fff',
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  upgradeText: {
    fontSize: 12, fontWeight: '800',
    color: '#E4415C',
    fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif-medium',
  },
  activePill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: 14,
  },
  activePillText: { fontSize: 12, color: '#fff', fontWeight: '700' },
  divider: {
    height: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginBottom: 12,
  },
  perksRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  perk: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  perkText: {
    fontSize: 11, color: 'rgba(255,255,255,0.9)',
    fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif',
  },
  benefit: {
    fontSize: 12, color: 'rgba(255,255,255,0.75)',
    fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif',
    fontStyle: 'italic',
  },
});
