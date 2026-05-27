import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSubscriptionStore } from '../../subscription/store/useSubscriptionStore';
import { useProfileStore } from '../store/useProfileStore';

const GRADIENTS = {
  Free: ['#374151', '#111827'],
  Silver: ['#E2E8F0', '#94A3B8'],
  Gold: ['#ECC844', '#8E6E1D'],
  Platinum: ['#4FACFE', '#00F2FE'],
};

const FONT = Platform.OS === 'ios' ? 'System' : 'sans-serif';
const FONT_MED = Platform.OS === 'ios' ? 'System' : 'sans-serif-medium';

export const MembershipCard = React.memo(({
  onWithdraw,
  onTopUp,
  onManage,
}) => {
  const { currentStatus, plans, fetchPlans, fetchStatus } = useSubscriptionStore();
  const { profile } = useProfileStore();
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    fetchStatus();
    if (!plans || plans.length === 0) {
      fetchPlans();
    }
  }, [fetchPlans, fetchStatus]);

  const profileData = profile || {};
  const isFemale = profileData.gender?.toLowerCase() === 'female' || profileData.gender?.toLowerCase() === 'woman';

  const activePlanName = (currentStatus?.isActive && currentStatus?.planName) ? currentStatus.planName : 'Free';
  const normalizedPlan = activePlanName.charAt(0).toUpperCase() + activePlanName.slice(1).toLowerCase();
  const cardColors = GRADIENTS[normalizedPlan] || GRADIENTS.Free;

  const isDarkTheme = normalizedPlan === 'Gold' || normalizedPlan === 'Silver';
  const cardTextColor = isDarkTheme ? '#111111' : '#FFFFFF';
  const cardSubTextColor = isDarkTheme ? 'rgba(0, 0, 0, 0.65)' : 'rgba(255, 255, 255, 0.8)';
  const cardIconColor = isDarkTheme ? '#111111' : '#FFFFFF';
  const btnBgColor = isDarkTheme ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.22)';
  const dividerColor = isDarkTheme ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.15)';

  // Find features from active plan object
  const activePlanObj = plans?.find(
    (p) => p.name?.toLowerCase() === activePlanName?.toLowerCase()
  );

  const features = activePlanObj?.features || [];

  return (
    <View style={styles.cardContainer}>
      <LinearGradient
        colors={cardColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.membershipCard}
      >
        {/* Top Section */}
        <View style={styles.cardTopRow}>
          <View style={styles.membershipInfo}>
             <View style={styles.membershipTypeRow}>
              <Text style={[styles.membershipType, { color: cardSubTextColor }]}>
                {currentStatus?.isActive ? `${activePlanName.toUpperCase()} MEMBER` : 'FREE PLAN'}
              </Text>
              <Icon name="diamond" size={12} color={cardIconColor} style={styles.diamondIconSmall} />
            </View>
            <View style={styles.balanceRowInline}>
              <Icon name="wallet-outline" size={22} color={isDarkTheme ? '#111111' : '#FFD700'} />
              <Text style={[styles.balanceLabelInline, { color: cardTextColor }]}>{profileData.coinBalance || 0}</Text>
              <Text style={[styles.balanceLabelSuffix, { color: cardSubTextColor }]}>coins</Text>
            </View>
          </View>
        </View>

        {/* Action buttons bottom row (Always visible below coins/status initially) */}
        <View style={styles.walletActionsRowBottom}>
          {isFemale ? (
            <>
              <TouchableOpacity
                style={[styles.walletBtnSmall, { backgroundColor: btnBgColor }]}
                onPress={onWithdraw}
                activeOpacity={0.85}
              >
                <Icon name="wallet-outline" size={16} color={cardIconColor} />
                <Text style={[styles.walletBtnTextSmall, { color: cardTextColor }]}>Withdraw</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.walletBtnSmall, { backgroundColor: btnBgColor }]}
                onPress={onManage}
                activeOpacity={0.85}
              >
                <Icon name="settings-outline" size={16} color={cardIconColor} />
                <Text style={[styles.walletBtnTextSmall, { color: cardTextColor }]}>Manage</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity
                style={[styles.walletBtnSmall, { backgroundColor: btnBgColor }]}
                onPress={onTopUp}
                activeOpacity={0.85}
              >
                <Icon name="add-circle-outline" size={16} color={cardIconColor} />
                <Text style={[styles.walletBtnTextSmall, { color: cardTextColor }]}>Top-up</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.walletBtnSmall, { backgroundColor: btnBgColor }]}
                onPress={onManage}
                activeOpacity={0.85}
              >
                <Icon name="settings-outline" size={16} color={cardIconColor} />
                <Text style={[styles.walletBtnTextSmall, { color: cardTextColor }]}>Manage</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Perks and Expiry details section (Visible only when expanded) */}
        {isExpanded && (
          <View style={[styles.expandedContent, { borderTopColor: dividerColor }]}>
            {/* Perks / Features bullet list */}
            {features && features.length > 0 && (
              <View style={styles.featuresContainer}>
                {features.map((feature, idx) => (
                  <View key={idx} style={styles.featureItemRow}>
                    <Icon name="checkmark-circle" size={14} color={cardIconColor} style={styles.checkIcon} />
                    <Text style={[styles.featureText, { color: cardTextColor }]}>{feature}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Validity info (No hardcoded date) */}
            <View style={[styles.validityContainer, { borderTopColor: dividerColor }]}>
              {currentStatus?.isActive && currentStatus?.endDate ? (
                <Text style={[styles.validityText, { color: cardSubTextColor }]}>
                  Valid until: {new Date(currentStatus.endDate).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })} ({currentStatus.daysRemaining} days left)
                </Text>
              ) : (
                <Text style={[styles.validityText, { color: cardSubTextColor }]}>
                  Enjoy standard features or upgrade for premium benefits!
                </Text>
              )}
            </View>
          </View>
        )}

        {/* Bottom Collapse/Expand Arrow Toggle */}
        <TouchableOpacity
          style={[styles.expandToggle, { borderTopColor: dividerColor }]}
          onPress={() => setIsExpanded(prev => !prev)}
          activeOpacity={0.85}
        >
          <Text style={[styles.expandToggleText, { color: cardSubTextColor }]}>
            {isExpanded ? 'View Less' : 'View More'}
          </Text>
          <Icon
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={14}
            color={cardSubTextColor}
          />
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
});

const styles = StyleSheet.create({
  cardContainer: {
    marginHorizontal: 0,
    marginTop: 16,
    marginBottom: 20,
  },
  membershipCard: {
    borderRadius: 24,
    paddingHorizontal: 0,
    paddingTop: 14,
    paddingBottom: 0,
    marginHorizontal: 0,
    minHeight: 150,
    justifyContent: 'space-between',
    boxShadow: '0px 6px 10px rgba(0,0,0,0.2)',
    elevation: 8,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 0,
  },

  membershipInfo: { flex: 1, marginHorizontal: 20 },

  membershipTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 4,
  },

  membershipType: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    fontFamily: FONT_MED,
  },
  diamondIconSmall: {
    opacity: 0.8,
  },
  balanceRowInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  balanceLabelInline: {
    color: '#FFF',
    fontSize: 30,
    fontWeight: '800',
    fontFamily: FONT_MED,
  },
  balanceLabelSuffix: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 15,
    fontWeight: '500',
    alignSelf: 'flex-end',
    marginBottom: 6,
    fontFamily: FONT,
  },
  walletActionsRowBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginRight: 10,
    gap: 10,
    marginTop: 16,
    marginBottom: 16,
  },
  walletBtnSmall: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.22)',
    paddingVertical: 12,
    borderRadius: 16,
    gap: 4,
    justifyContent: 'center',
  },

  withdrawBtnSmall: {
    backgroundColor: 'rgba(0,0,0,0.18)',
  },

  walletBtnTextSmall: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: FONT_MED,
  },
  expandedContent: {
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.15)',
    paddingTop: 16,
    paddingBottom: 5,
    marginHorizontal: 12,
    marginBottom: 6,
  },
  featuresContainer: {
    gap: 8,
    marginBottom: 10,
  },
  featureItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkIcon: {
    opacity: 0.9,

  },
  featureText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '500',
    fontFamily: FONT,
  },
  validityContainer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingTop: 10,
  },
  validityText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontWeight: '500',
    fontFamily: FONT,
  },
  expandToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    marginTop: 4,
    marginBottom: 4,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.12)',
  },
  expandToggleText: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: FONT_MED,
  },
});
