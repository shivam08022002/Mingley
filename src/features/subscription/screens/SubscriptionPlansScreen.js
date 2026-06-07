import { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet,
  TouchableOpacity, ScrollView, Platform, ActivityIndicator, Dimensions, Alert, StatusBar
} from 'react-native';

const { width, height } = Dimensions.get('window');
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSubscriptionStore } from '../store/useSubscriptionStore';
import { useToastStore } from '../../../store/useToastStore';
import { useTheme } from '../../../theme/ThemeContext';

const DEFAULT_ICONS = ['star-outline', 'trophy-outline', 'rocket-outline', 'flash-outline'];

const FEATURE_METADATA = {
  '3 free messages per chat': { icon: 'chatbubbles-outline', desc: 'Chat limit per conversation' },
  '1 Super Like/day': { icon: 'star-outline', desc: 'Stand out from the crowd' },
  'Basic matching': { icon: 'heart-outline', desc: 'Standard matching system' },
  'Standard support': { icon: 'help-circle-outline', desc: 'Regular customer service' },
  'Unlimited likes': { icon: 'heart-outline', desc: 'Swipe right as much as you want' },
  'No ads': { icon: 'eye-off-outline', desc: 'Clean and ad-free experience' },
  '5 Super Likes/day': { icon: 'star-outline', desc: 'Stand out from the crowd' },
  'See who liked you': { icon: 'eye-outline', desc: 'Instantly view your admirers' },
  'All Silver': { icon: 'sparkles-outline', desc: 'Includes all Silver benefits' },
  'Video calls': { icon: 'videocam-outline', desc: 'Connect directly via video' },
  '10 Super Likes/day': { icon: 'star-outline', desc: 'Get maximum attention daily' },
  '2 Profile boosts': { icon: 'rocket-outline', desc: 'Boost visibility to get matches' },
  '5 coins/msg': { icon: 'wallet-outline', desc: 'Earn coins for chatting' },
  'All Gold': { icon: 'sparkles-outline', desc: 'Includes all Gold benefits' },
  'Top picks daily': { icon: 'trophy-outline', desc: 'Curated high-quality profiles' },
  'Unlimited Super Likes': { icon: 'star-outline', desc: 'Unlimited stand-out interactions' },
  '5 boosts/month': { icon: 'rocket-outline', desc: 'Boost profile multiple times a month' },
  'Priority support': { icon: 'flash-outline', desc: 'Priority customer service' },
  'All Platinum': { icon: 'sparkles-outline', desc: 'Includes all Platinum benefits' },
  'VIP badge': { icon: 'ribbon-outline', desc: 'Exclusive VIP status badge' },
  'Global search': { icon: 'globe-outline', desc: 'Unlock Travel Mode globally' },
  'Dedicated support': { icon: 'headset-outline', desc: '24/7 personal customer assistant' },
  'Early features': { icon: 'time-outline', desc: 'Try new features before anyone else' }
};

export const SubscriptionPlansScreen = ({ navigation, route }) => {
  const { 
    plans, fetchPlans, isLoading, setSelectedPlan, subscribe, 
    fetchStatus, currentStatus, cancelSubscription 
  } = useSubscriptionStore();
  const [selected, setSelected] = useState(null);
  const { isDark, theme } = useTheme();

  useEffect(() => {
    fetchPlans();
    fetchStatus();
  }, [fetchPlans, fetchStatus]);

  const isSubscriptionActive = currentStatus?.isActive || currentStatus?.status === 'active';
  const currentActivePlanId = (() => {
    if (!currentStatus) return null;
    const directId = currentStatus?.plan?.id || currentStatus?.plan?._id || currentStatus?.planId;
    if (directId) return directId;

    if (currentStatus?.planName && plans.length > 0) {
      const match = plans.find(
        (p) => p.name?.toLowerCase() === currentStatus.planName.toLowerCase()
      );
      if (match) return match.id || match._id;
    }
    return null;
  })();

  const mappedPlans = plans.map((p, idx) => {
    const name = p.name?.toLowerCase() || '';
    let colors = isDark ? ['#222126', '#2A2833'] : ['#F8FAFC', '#F1F5F9'];
    let accentColor = isDark ? '#94A3B8' : '#64748B';
    let textColor = isDark ? '#FFFFFF' : '#0F172A';

    if (name.includes('vip')) {
      colors = isDark ? ['#3B1F3D', '#502049'] : ['#FFFDF5', '#FDF5D6'];
      accentColor = isDark ? '#E8B4F8' : '#D97706';
      textColor = isDark ? '#FFFFFF' : '#0F172A';
    } else if (name.includes('gold')) {
      colors = isDark ? ['#332512', '#4D3815'] : ['#FFFDF5', '#FEF9E7'];
      accentColor = isDark ? '#F6DCA0' : '#ECC844';
      textColor = isDark ? '#FFFFFF' : '#0F172A';
    } else if (name.includes('silver')) {
      colors = isDark ? ['#1E293B', '#334155'] : ['#F8FAFC', '#F1F5F9'];
      accentColor = isDark ? '#CBD5E1' : '#475569';
      textColor = isDark ? '#FFFFFF' : '#0F172A';
    } else if (name.includes('platinum')) {
      colors = isDark ? ['#164E63', '#083344'] : ['#ECFEFF', '#CFFAFE'];
      accentColor = isDark ? '#67E8F9' : '#06B6D4';
      textColor = isDark ? '#FFFFFF' : '#0F172A';
    } else if (name.includes('free')) {
      colors = isDark ? ['#2A1215', '#3D151B'] : ['#F8FAFC', '#F1F5F9'];
      accentColor = isDark ? '#FCA5A5' : '#E94057';
      textColor = isDark ? '#FFFFFF' : '#0F172A';
    }

    return {
      id: p.id || p._id,
      name: p.name,
      duration: (p.id === 'free' || p.durationDays === 0) ? 'Lifetime' : (p.durationDays ? `${p.durationDays} Days` : (p.duration || `${p.validityDays} Days`)),
      price: p.price === 0 ? 'Free' : `₹${p.price}`,
      perMonth: p.perMonth || (p.price > 0 && p.durationDays > 30 ? `₹${Math.round(p.price / (p.durationDays / 30))}/mo` : (p.price > 0 && p.validityDays > 30 ? `₹${Math.round(p.price / (p.validityDays / 30))}/mo` : '')),
      features: Array.isArray(p.features) ? p.features : [],
      icon: p.icon || (
        name.includes('free') ? 'star-outline' :
        name.includes('silver') ? 'trophy-outline' :
        name.includes('gold') ? 'ribbon-outline' :
        name.includes('platinum') ? 'sparkles-outline' : 'diamond-outline'
      ),
      badge: p.badge || (p.isPopular ? 'MOST POPULAR' : (name.includes('gold') ? 'MOST POPULAR' : name.includes('vip') ? 'BEST VALUE' : null)),
      colors,
      accentColor,
      textColor,
      isFree: (p.id === 'free' || name.includes('free'))
    };
  });

  const carouselRef = useRef(null);

  useEffect(() => {
    if (mappedPlans.length > 0 && !selected) {
      let initialPlanId = null;
      const selectPlanName = route?.params?.selectPlanName;
      if (selectPlanName) {
        const found = mappedPlans.find(p => p.name?.toLowerCase().includes(selectPlanName.toLowerCase()));
        if (found) {
          initialPlanId = found.id;
        }
      }

      if (!initialPlanId) {
        if (isSubscriptionActive && currentActivePlanId) {
          initialPlanId = currentActivePlanId;
        } else {
          const defaultPlan = mappedPlans.find(p => p.badge?.includes('POPULAR') || p.name?.toLowerCase().includes('gold'))
            || mappedPlans.find(p => !p.isFree)
            || mappedPlans[0];
          initialPlanId = defaultPlan.id;
        }
      }

      if (initialPlanId) {
        setSelected(initialPlanId);
        const index = mappedPlans.findIndex(p => p.id === initialPlanId);
        if (index !== -1) {
          setTimeout(() => {
            carouselRef.current?.scrollTo({ x: index * (width - 32), animated: false });
          }, 150);
        }
      }
    }
  }, [plans, selected, currentStatus, isSubscriptionActive, currentActivePlanId, mappedPlans, route?.params?.selectPlanName]);

  const handleSelectPlan = (planId) => {
    setSelected(planId);
    const index = mappedPlans.findIndex(p => p.id === planId);
    if (index !== -1 && carouselRef.current) {
      carouselRef.current.scrollTo({ x: index * (width - 32), animated: true });
    }
  };

  const handleCarouselScroll = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / (width - 32));
    if (index >= 0 && index < mappedPlans.length) {
      const planId = mappedPlans[index].id;
      if (selected !== planId) {
        setSelected(planId);
      }
    }
  };

  const handleDotPress = (index, planId) => {
    setSelected(planId);
    if (carouselRef.current) {
      carouselRef.current.scrollTo({ x: index * (width - 32), animated: true });
    }
  };

  const handleContinue = async () => {
    const selectedMappedPlan = mappedPlans.find((plan) => plan.id === selected);
    if (selectedMappedPlan) {
      const PLAN_RANKS = {
        'free': 0,
        'silver': 1,
        'gold': 2,
        'platinum': 3,
        'vip': 4
      };
      const currentPlanName = (typeof currentStatus === 'string'
        ? currentStatus
        : currentStatus?.planName || currentStatus?.plan?.name || 'free').toLowerCase();
      const currentRank = PLAN_RANKS[currentPlanName] ?? 0;

      const selectedPlanName = (selectedMappedPlan?.name || '').toLowerCase();
      const selectedRank = PLAN_RANKS[selectedPlanName] ?? 0;

      if (currentRank > 0 && selectedRank <= currentRank && selected !== currentActivePlanId) {
        Alert.alert('Upgrade Restriction', 'You can only upgrade to a higher tier plan.');
        return;
      }

      if (selectedMappedPlan.isFree) {
        try {
          await subscribe({
            planId: selectedMappedPlan.id,
            autoRenew: false,
            paymentMethod: 'Free',
            paymentId: `free-plan-${Date.now()}`,
            orderId: `free-order-${Date.now()}`,
            signature: 'free-signature',
          });
          await fetchStatus();
          Alert.alert(
            'Subscription Activated! 🎉',
            'You are now on the Free plan.',
            [{ text: 'Continue', onPress: () => navigation.navigate('Home') }]
          );
        } catch (error) {
          Alert.alert('Subscription Failed', error.message || 'Something went wrong.');
        }
      } else {
        setSelectedPlan(selectedMappedPlan);
        navigation.navigate('Payment');
      }
    }
  };

  const handleCancelSubscription = () => {
    Alert.alert(
      'Cancel Subscription? 😢',
      'Are you sure you want to cancel your subscription? You will still keep your premium benefits until the end of your billing cycle.',
      [
        { text: 'Keep Plan', style: 'cancel' },
        { 
          text: 'Cancel Subscription', 
          style: 'destructive', 
          onPress: async () => {
            const subId = currentStatus?.id || currentStatus?._id;
            if (subId) {
              try {
                await cancelSubscription(subId, 'Cancelled by user');
                await fetchStatus();
                useToastStore.getState().showToast(
                  'Subscription successfully cancelled.',
                  'success',
                  3000
                );
              } catch (error) {
                Alert.alert('Cancellation Failed', error.message || 'Something went wrong.');
              }
            } else {
              Alert.alert('Error', 'Unable to find active subscription ID.');
            }
          }
        }
      ]
    );
  };

  const activePlan = mappedPlans.find((plan) => plan.id === selected);
  const planFeatures = activePlan?.features || [];

  return (
    <SafeAreaView style={[s.container, { backgroundColor: theme.background }]} edges={['top', 'bottom']}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      {!isDark && (
        <LinearGradient
          colors={['#FFF5F6', '#F8FAFC', '#F1F5F9']}
          style={StyleSheet.absoluteFill}
        />
      )}

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={[s.backBtn, { backgroundColor: theme.cardBackground }]} onPress={() => navigation.goBack()}>
          <Icon name="close" size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={[s.headerTitle, { color: theme.textPrimary }]}>Upgrade Membership</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        
        {/* Special rotated banner (swipable carousel) */}
        <View style={s.bannerCardWrapper}>
          <ScrollView
            ref={carouselRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handleCarouselScroll}
            style={s.carouselScrollView}
            contentContainerStyle={s.carouselContentContainer}
          >
            {mappedPlans.map((plan) => (
              <View key={plan.id} style={s.bannerCardContainer}>
                <View style={[s.bannerCard, { backgroundColor: isDark ? theme.surface : '#FFF', borderColor: isDark ? theme.border : '#E2E8F0' }]}>
                  {!plan.isFree && (
                    <View style={s.discountBadge}>
                      <Text style={s.discountText}>20% OFF</Text>
                    </View>
                  )}
                  <View style={s.bannerInfo}>
                    <Icon name={plan.icon || 'sparkles'} size={32} color={plan.accentColor || '#E94057'} />
                    <View>
                      <Text style={[s.bannerTitle, { color: theme.textPrimary }]}>Mingley {plan.name || 'Premium'}</Text>
                      <Text style={[s.bannerSubtitle, { color: theme.textSecondary }]}>
                        {plan.isFree ? 'Explore basic features with standard limits' : 'Unlock full matching power & global search'}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
          
          {/* Slide Indicator Dots */}
          <View style={s.pagerDots}>
            {mappedPlans.map((p, idx) => (
              <TouchableOpacity
                key={p.id} 
                onPress={() => handleDotPress(idx, p.id)}
                activeOpacity={0.7}
                style={[
                  s.pagerDot, 
                  selected === p.id 
                    ? [s.pagerDotActive, { backgroundColor: p.accentColor }] 
                    : [s.pagerDotInactive, { backgroundColor: isDark ? theme.border : '#E2E8F0' }]
                ]} 
              />
            ))}
          </View>
        </View>

        {/* Horizontal Plans Card Selectors */}
        <Text style={s.sectionLabel}>Select a Plan</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={s.plansHorizontalList}
        >
          {mappedPlans.map((plan) => {
            const active = selected === plan.id;
            return (
              <TouchableOpacity
                key={plan.id}
                onPress={() => handleSelectPlan(plan.id)}
                activeOpacity={0.9}
                style={[
                  s.planCard,
                  { backgroundColor: isDark ? theme.cardBackground : '#FFFFFF', borderColor: isDark ? theme.border : '#E2E8F0' },
                  active && [s.planCardActive, { borderColor: plan.accentColor }]
                ]}
              >
                {active && (
                  <LinearGradient
                    colors={plan.colors}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                    style={[StyleSheet.absoluteFillObject, { borderRadius: 20 }]}
                  />
                )}

                {plan.badge && (
                  <View style={[s.badgeWrap, { backgroundColor: plan.accentColor }]}>
                    <Text 
                      style={[
                        s.badgeText, 
                        { color: (plan.name?.toLowerCase().includes('gold') || plan.name?.toLowerCase().includes('vip') || plan.name?.toLowerCase().includes('platinum')) && !isDark ? '#0F172A' : (isDark ? '#111' : '#FFF') }
                      ]}
                    >
                      {plan.badge}
                    </Text>
                  </View>
                )}

                <View style={s.cardPlanHeader}>
                  <Text style={[s.planName, { color: active ? plan.textColor : theme.textPrimary }]}>{plan.name}</Text>
                  <Icon name={plan.icon} size={18} color={active ? plan.accentColor : theme.textSecondary} />
                </View>

                <View style={s.priceContainer}>
                  <Text style={[s.priceText, { color: active ? plan.textColor : theme.textPrimary }]}>{plan.price}</Text>
                  <Text style={[s.durationText, { color: active ? plan.textColor : theme.textSecondary }]}>/ {plan.duration}</Text>
                </View>

                {plan.perMonth ? (
                  <Text style={[s.perMonthText, { color: active ? plan.textColor : theme.textSecondary }]}>{plan.perMonth}</Text>
                ) : (
                  <Text style={[s.perMonthText, { color: active ? plan.textColor : theme.textSecondary }]}>One-time entry</Text>
                )}

                {isSubscriptionActive && plan.id === currentActivePlanId && (
                  <View style={s.activeBadge}>
                    <Text style={s.activeBadgeText}>Active</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Plan comparison section */}
        <View style={s.comparisonDivider}>
          <View style={[s.dividerLine, { backgroundColor: theme.border }]} />
          <Text style={[s.comparisonTitle, { color: theme.textSecondary }]}>
            {activePlan ? `${activePlan.name} Features` : 'Plan Features'}
          </Text>
          <View style={[s.dividerLine, { backgroundColor: theme.border }]} />
        </View>

        {/* Features Checklist */}
        <View style={s.featuresContainer}>
          {planFeatures.length > 0 ? (
            planFeatures.map((f, i) => {
              const meta = FEATURE_METADATA[f] || { icon: 'checkmark-circle-outline', desc: 'Premium exclusive feature' };
              return (
                <View key={i} style={[s.featureItem, { backgroundColor: isDark ? theme.surface : '#FFFFFF', borderColor: isDark ? theme.border : '#E2E8F0' }]}>
                  <View style={[s.featureIconBg, { backgroundColor: isDark ? theme.cardBackground : '#F8FAFC' }]}>
                    <Icon name={meta.icon} size={18} color={activePlan?.accentColor || theme.primary} />
                  </View>
                  <View style={s.featureTextWrap}>
                    <View style={s.featureHeaderRow}>
                      <Text style={[s.featureTitle, { color: theme.textPrimary }]}>{f}</Text>
                      <Icon name="information-circle-outline" size={12} color={theme.textSecondary} style={{ marginLeft: 4 }} />
                    </View>
                    <Text style={[s.featureDesc, { color: theme.textSecondary }]}>{meta.desc}</Text>
                  </View>
                  <View style={[s.checkmarkCircle, { backgroundColor: activePlan?.accentColor || theme.primary }]}>
                    <Icon name="checkmark" size={12} color="#FFF" />
                  </View>
                </View>
              );
            })
          ) : (
            <Text style={[s.noFeaturesText, { color: theme.textSecondary }]}>No special features listed.</Text>
          )}
        </View>
      </ScrollView>

      {/* Sticky Footer */}
      {(() => {
        const isCurrentActiveSelected = isSubscriptionActive && selected === currentActivePlanId;
        const selectedMappedPlan = mappedPlans.find((plan) => plan.id === selected);
        const isFreeSelected = selectedMappedPlan?.isFree;

        const PLAN_RANKS = {
          'free': 0,
          'silver': 1,
          'gold': 2,
          'platinum': 3,
          'vip': 4
        };

        const currentPlanName = (typeof currentStatus === 'string'
          ? currentStatus
          : currentStatus?.planName || currentStatus?.plan?.name || 'free').toLowerCase();
        const currentRank = PLAN_RANKS[currentPlanName] ?? 0;

        const selectedPlanName = (selectedMappedPlan?.name || '').toLowerCase();
        const selectedRank = PLAN_RANKS[selectedPlanName] ?? 0;

        const isDowngrade = currentRank > 0 && selectedRank <= currentRank && selected !== currentActivePlanId;

        let buttonLabel = '';
        if (isCurrentActiveSelected) {
          buttonLabel = 'Cancel Active Subscription';
        } else if (isDowngrade) {
          buttonLabel = 'Upgrade Only (Higher Tier)';
        } else if (isFreeSelected) {
          buttonLabel = 'Your Current Plan';
        } else {
          buttonLabel = `Get ${selectedMappedPlan?.name || ''} plan for ${selectedMappedPlan?.price || ''}`;
        }

        return (
          <View style={[s.footer, { backgroundColor: theme.background }]}>
            {isCurrentActiveSelected ? (
              <TouchableOpacity
                style={s.ctaWrap}
                onPress={handleCancelSubscription}
                activeOpacity={0.88}
              >
                <LinearGradient
                  colors={['#E94057', '#8A2387']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={s.ctaBtn}
                >
                  <Text style={s.ctaText}>{buttonLabel}</Text>
                  <Icon name="close-circle-outline" size={18} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>
            ) : isDowngrade ? (
              <View style={[s.ctaWrap, { opacity: 0.6 }]}>
                <View style={[s.ctaBtn, { backgroundColor: isDark ? theme.border : '#94A3B8' }]}>
                  <Text style={[s.ctaText, { color: '#FFF' }]}>{buttonLabel}</Text>
                  <Icon name="lock-closed-outline" size={18} color="#FFF" />
                </View>
              </View>
            ) : isFreeSelected ? (
              <View style={[s.ctaWrap, { opacity: 0.8 }]}>
                <View style={[s.ctaBtn, { backgroundColor: isDark ? theme.cardBackground : '#64748B' }]}>
                  <Text style={[s.ctaText, { color: '#FFF' }]}>{buttonLabel}</Text>
                  <Icon name="checkmark-circle-outline" size={18} color="#FFF" />
                </View>
              </View>
            ) : (
              <TouchableOpacity
                style={s.ctaWrap}
                onPress={handleContinue}
                activeOpacity={0.88}
              >
                <LinearGradient
                  colors={selectedMappedPlan ? [selectedMappedPlan.accentColor, selectedMappedPlan.accentColor] : ['#E94057', '#8A2387']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={s.ctaBtn}
                >
                  <Text style={[s.ctaText, { color: '#FFF' }]}>{buttonLabel}</Text>
                  <Icon name="arrow-forward" size={18} color="#FFF" />
                </LinearGradient>
              </TouchableOpacity>
            )}
            <Text style={[s.footerNote, { color: theme.textSecondary }]}>Cancel anytime • Secure SSL encrypted payment</Text>
          </View>
        );
      })()}
    </SafeAreaView>
  );
};

const FONT = Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif';
const FONT_MED = Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif-medium';

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#FFF',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A', fontFamily: FONT_MED },
  scroll: { paddingBottom: 160 },

  // Special rotated banner
  bannerCardWrapper: {
    paddingHorizontal: 16,
    marginTop: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  bannerCard: {
    width: '100%',
    borderRadius: 20,
    padding: 20,
    position: 'relative',
    overflow: 'hidden',
    height: 100,
    justifyContent: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 3,
  },
  discountBadge: {
    position: 'absolute',
    left: -28,
    top: 14,
    backgroundColor: '#FF3366',
    transform: [{ rotate: '-45deg' }],
    paddingHorizontal: 28,
    paddingVertical: 4,
  },
  discountText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '800',
  },
  bannerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 32,
    gap: 16,
  },
  bannerTitle: {
    color: '#0F172A',
    fontSize: 20,
    fontWeight: '800',
    fontFamily: FONT_MED,
  },
  bannerSubtitle: {
    color: '#64748B',
    fontSize: 12,
    fontFamily: FONT,
    marginTop: 2,
  },
  pagerDots: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 14,
  },
  pagerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  pagerDotActive: {
    width: 16,
  },
  pagerDotInactive: {
    backgroundColor: '#E2E8F0',
  },

  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: 18,
    marginBottom: 12,
  },

  // Horizontal Card Selection
  plansHorizontalList: {
    paddingHorizontal: 16,
    gap: 12,
    paddingTop: 16,
    paddingBottom: 12,
  },
  planCard: {
    width: 145,
    height: 170,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    padding: 12,
    justifyContent: 'space-between',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  planCardActive: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2.5,
  },
  badgeWrap: {
    position: 'absolute',
    top: -11,
    left: 8,
    right: 8,
    paddingVertical: 3.5,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 8.5,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  cardPlanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  planName: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  priceContainer: {
    marginTop: 6,
  },
  priceText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  durationText: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 1,
  },
  perMonthText: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '500',
  },
  activeBadge: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    backgroundColor: '#10B981',
    borderTopLeftRadius: 10,
    borderBottomRightRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  activeBadgeText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
  },

  // Comparison Divider
  comparisonDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    marginTop: 30,
    marginBottom: 20,
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  comparisonTitle: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },

  // Features checklist
  featuresContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 18,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },
  featureIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  featureTextWrap: {
    flex: 1,
  },
  featureHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  featureDesc: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  checkmarkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noFeaturesText: {
    color: '#64748B',
    textAlign: 'center',
    marginTop: 20,
  },

  // Sticky footer
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: 16, paddingBottom: Platform.OS === 'ios' ? 34 : 20, paddingTop: 14,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1.5, borderTopColor: '#E2E8F0',
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.03, shadowRadius: 10, elevation: 10,
  },
  ctaWrap: { borderRadius: 20, overflow: 'hidden', marginBottom: 8 },
  ctaBtn: {
    height: 56, flexDirection: 'row',
    justifyContent: 'center', alignItems: 'center', gap: 10,
  },
  ctaText: { fontSize: 16, fontWeight: '800', color: '#fff', fontFamily: FONT_MED },
  footerNote: { fontSize: 11, color: '#64748B', textAlign: 'center', fontFamily: FONT },
  
  // Swipable Carousel Styles
  carouselScrollView: {
    width: width - 32,
    height: 100,
  },
  carouselContentContainer: {
    alignItems: 'center',
  },
  bannerCardContainer: {
    width: width - 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
