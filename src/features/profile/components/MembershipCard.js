import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Platform, Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';

import { useSubscriptionStore } from '../../subscription/store/useSubscriptionStore';

const PLAN_CONFIG = {
  free: {
    label: 'Free Plan',
    tag: 'BASIC',
    perks: ['5 likes/day', 'Basic filters', 'Ads included'],
    icon: 'flame-outline',
    colors: ['#666666', '#333333'],
    tagBg: 'rgba(255,255,255,0.2)',
  },
  Silver: {
    label: 'Silver Member',
    tag: 'SILVER',
    perks: ['Unlimited likes', 'No ads', '5 Super Likes/day'],
    icon: 'star-outline',
    colors: ['#E94057', '#8A2387'],
    tagBg: 'rgba(255,255,255,0.22)',
  },
  Gold: {
    label: 'Gold Member',
    tag: 'GOLD',
    perks: ['Video calls', '10 Super Likes/day', 'Profile boost'],
    icon: 'trophy-outline',
    colors: ['#f093fb', '#f5576c'],
    tagBg: 'rgba(255,255,255,0.22)',
  },
  Platinum: {
    label: 'Platinum Member',
    tag: 'PLATINUM',
    perks: ['Unlimited Super Likes', 'Top picks daily', 'Priority support'],
    icon: 'flash-outline',
    colors: ['#4facfe', '#00f2fe'],
    tagBg: 'rgba(255,255,255,0.2)',
  },
};

// Premium feature highlights shown on the free plan card
const PREMIUM_BENEFITS = [
  { icon: 'navigate',         label: 'Nearby Users',    locked: true  },
  { icon: 'shield-checkmark', label: 'Verified Filter',  locked: true  },
  { icon: 'heart',            label: 'Unlimited Likes',  locked: true  },
];

const FONT = Platform.OS === 'ios' ? 'System' : 'sans-serif';
const FONT_MED = Platform.OS === 'ios' ? 'System' : 'sans-serif-medium';

export const MembershipCard = React.memo(({ status, onUpgrade, onManage }) => {
  const { cancelSubscription, fetchStatus } = useSubscriptionStore();
  
  const isActive = status?.isActive || false;
  const planName = status?.plan?.name || 'free';
  const cfg = PLAN_CONFIG[planName] || PLAN_CONFIG.free;

  const handleCancel = async () => {
    Alert.alert(
      'Cancel Subscription',
      'Are you sure you want to cancel your subscription? You will lose your benefits at the end of the current period.',
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Yes, Cancel', 
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelSubscription(status.id || status._id, 'User requested cancellation');
              Alert.alert('Success', 'Your subscription has been cancelled.');
              fetchStatus();
            } catch (error) {
              Alert.alert('Error', error.message || 'Failed to cancel subscription');
            }
          }
        }
      ]
    );
  };

  return (
    <View style={s.wrap}>
      <LinearGradient
        colors={cfg.colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={s.card}
      >
        {/* Top row: icon + title + upgrade/cancel */}
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
          {isActive ? (
            <View style={s.actionRow}>
              <TouchableOpacity style={s.manageBtn} onPress={onManage} activeOpacity={0.85}>
                <Text style={s.manageText}>Manage</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.cancelBtn} onPress={handleCancel}>
                <Text style={s.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={s.upgradeBtn} onPress={onUpgrade} activeOpacity={0.85}>
              <Text style={s.upgradeText}>Upgrade</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Perks */}
        <View style={s.perksRow}>
          {(status?.plan?.features || cfg.perks).map((p, i) => (
            <View key={i} style={s.perkItem}>
              <Icon name="checkmark-circle" size={14} color="rgba(255,255,255,0.8)" />
              <Text style={s.perkText} numberOfLines={1}>{p}</Text>
            </View>
          ))}
        </View>

        {/* Premium benefits strip (shown when free) */}
        {!isActive && (
          <View style={s.benefitsStrip}>
            {PREMIUM_BENEFITS.map((b) => (
              <View key={b.icon} style={s.benefitItem}>
                <Icon name="lock-closed" size={11} color="#F59E0B" style={{ marginRight: 3 }} />
                <Text style={s.benefitText}>{b.label}</Text>
              </View>
            ))}
          </View>
        )}

        {isActive && status.expiryDate && (
          <Text style={s.expiryText}>
            Valid until: {new Date(status.expiryDate).toLocaleDateString()}
          </Text>
        )}
      </LinearGradient>
    </View>
  );
});

const s = StyleSheet.create({
  wrap: {
    marginHorizontal: 0,
    marginBottom: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  card: {
    borderRadius: 20,
    minHeight: 220,
    paddingHorizontal: 15,
    paddingVertical: 20,
  },
  // ── Top row ──
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  titleCol: {
    flex: 1,
  },
  planName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    fontFamily: FONT_MED,
    marginBottom: 4,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
    letterSpacing: 0.5,
  },
  upgradeBtn: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  upgradeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#E94057',
    fontFamily: FONT_MED,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  manageBtn: {
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  manageText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#E94057',
    fontFamily: FONT_MED,
  },
  cancelBtn: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  cancelText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  // ── Perks ──
  perksRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  perkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  perkText: {
    fontSize: 14,
    color: 'rgba(255,255,255,1)',
    fontFamily: FONT,
  },
  // ── Premium benefits strip ──────────────────────────────────
  benefitsStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.15)',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 10,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  benefitText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    fontFamily: FONT_MED,
  },
  expiryText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    fontFamily: FONT,
    marginTop: 4,
  },
});
