import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';

const PLAN_CONFIG = {
  free: {
    label: 'Free Plan',
    tag: 'BASIC',
    perks: ['5 likes/day', 'Basic filters', 'Ads included'],
    icon: 'flame-outline',
    colors: ['#E4415C', '#8A2387'],
    tagBg: 'rgba(255,255,255,0.22)',
  },
  premium: {
    label: 'Premium',
    tag: 'PREMIUM',
    perks: ['Unlimited likes', 'Advanced filters', 'No ads'],
    icon: 'star-outline',
    colors: ['#f093fb', '#f5576c'],
    tagBg: 'rgba(255,255,255,0.22)',
  },
  pro: {
    label: 'Pro Member',
    tag: 'PRO',
    perks: ['All Premium', 'Profile boost', 'Top picks'],
    icon: 'trophy-outline',
    colors: ['#4facfe', '#00f2fe'],
    tagBg: 'rgba(255,255,255,0.2)',
  },
};

const FONT = Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif';
const FONT_MED = Platform.OS === 'ios' ? 'AvenirNext-Medium' : 'sans-serif-medium';

export const MembershipCard = React.memo(({ plan = 'free', coins = 0, onUpgrade, onTopUp }) => {
  const cfg = PLAN_CONFIG[plan] || PLAN_CONFIG.free;
  const isPaid = plan !== 'free';

  return (
    <View style={s.wrap}>
      <LinearGradient
        colors={cfg.colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={s.card}
      >
        {/* Top row: icon + title + upgrade */}
        <View style={s.top}>
          <View style={s.iconCircle}>
            <Icon name={cfg.icon} size={22} color="#fff" />
          </View>
          <View style={s.titleCol}>
            <Text style={s.planName}>{cfg.label}</Text>
            <View style={[s.badge, { backgroundColor: cfg.tagBg }]}>
              <Text style={s.badgeText}>{cfg.tag}</Text>
            </View>
          </View>
          {isPaid ? (
            <View style={s.activePill}>
              <Text style={s.activeText}>Active</Text>
            </View>
          ) : (
            <TouchableOpacity style={s.upgradeBtn} onPress={onUpgrade} activeOpacity={0.85}>
              <Text style={s.upgradeText}>Upgrade</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Perks */}
        <View style={s.perksRow}>
          {cfg.perks.map((p, i) => (
            <View key={i} style={s.perkItem}>
              <Icon name="checkmark-circle" size={14} color="rgba(255,255,255,0.8)" />
              <Text style={s.perkText}>{p}</Text>
            </View>
          ))}
        </View>

        {/* Coins row */}
        <View style={s.line} />
        <View style={s.coinsRow}>
          <View style={s.coinsLeft}>
            <Icon name="wallet-outline" size={16} color="rgba(255,255,255,0.85)" />
            <Text style={s.coinsLabel}>Coin Balance :</Text>
            <Text style={s.coinsVal}>{coins}</Text>
          </View>
          <TouchableOpacity style={s.topUpBtn} onPress={onTopUp} activeOpacity={0.8}>
            <Icon name="add" size={14} color="#fff" />
            <Text style={s.topUpText}>Top Up</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
});

const s = StyleSheet.create({
  wrap: {
    marginHorizontal: 0,
    marginBottom: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  card: {
    borderRadius: 20,
    height: 200,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  // ── Top row ──
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  iconCircle: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  titleCol: {
    flex: 1,
  },
  planName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    fontFamily: FONT_MED,
    marginBottom: 4,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.8,
  },
  upgradeBtn: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 24,
    alignContent: 'center',
    
  },
  upgradeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#E4415C',
    fontFamily: FONT_MED,
  },
  activePill: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
  },
  activeText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '700',
  },
  // ── Perks ──
  perksRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 14,
  },
  perkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  perkText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    fontFamily: FONT,
  },
  // ── Coins ──
  line: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.18)',
    marginBottom: 12,
  },
  coinsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  coinsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  coinsLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
    fontFamily: FONT_MED,
  },
  coinsVal: {
    fontSize: 15,
    color: '#fff',
    fontFamily: FONT_MED,
  },
  topUpBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    marginRight: 24,
  },
  topUpText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
    fontFamily: FONT_MED,
  },
});
