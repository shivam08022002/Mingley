import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet,
  TouchableOpacity, ScrollView, Platform, ActivityIndicator, Dimensions, Alert
} from 'react-native';

const { width } = Dimensions.get('window');
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSubscriptionStore } from '../store/useSubscriptionStore';
import { useToastStore } from '../../../store/useToastStore';

const DEFAULT_ICONS = ['star-outline', 'trophy-outline', 'rocket-outline', 'flash-outline'];

export const SubscriptionPlansScreen = ({ navigation }) => {
  const { 
    plans, fetchPlans, isLoading, setSelectedPlan, subscribe, 
    fetchStatus, currentStatus, cancelSubscription 
  } = useSubscriptionStore();
  const [selected, setSelected] = useState(null);

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

  useEffect(() => {
    if (isSubscriptionActive && currentActivePlanId) {
      setSelected(currentActivePlanId);
    } else if (plans.length > 0 && !selected) {
      setSelected(plans[0].id || plans[0]._id);
    }
  }, [plans, selected, currentStatus, isSubscriptionActive, currentActivePlanId]);

  const handleSelectPlan = (planId) => {
    if (isSubscriptionActive && planId !== currentActivePlanId) {
      const expiry = currentStatus?.expiresAt || currentStatus?.endDate;
      const formattedDate = expiry ? new Date(expiry).toLocaleDateString([], { dateStyle: 'medium' }) : 'expiry';
      useToastStore.getState().showToast(
        `Active plan exists. You can switch after it expires on ${formattedDate}.`,
        'info',
        3000
      );
      return;
    }
    setSelected(planId);
  };

  const handleContinue = async () => {
    const selectedMappedPlan = mappedPlans.find((plan) => plan.id === selected);
    if (selectedMappedPlan) {
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

  const mappedPlans = plans.map((p, idx) => {
    const name = p.name?.toLowerCase() || '';
    let colors = ['#E94057', '#8A2387']; // Default
    let textColor = '#FFF';

    if (name.includes('gold')) {
      colors = ['#ECC844', '#8E6E1D'];
      textColor = '#111111';
    } else if (name.includes('silver')) {
      colors = ['#E2E8F0', '#94A3B8'];
      textColor = '#111111';
    } else if (name.includes('platinum')) {
      colors = ['#4FACFE', '#00F2FE'];
      textColor = '#FFF';
    } else if (name.includes('free')) {
      colors = ['#E94057', '#8A2387'];
      textColor = '#FFF';
    }

    return {
      id: p.id || p._id,
      name: p.name,
      duration: (p.id === 'free' || p.durationDays === 0) ? 'Lifetime' : (p.durationDays ? `${p.durationDays} Days` : (p.duration || `${p.validityDays} Days`)),
      price: `₹${p.price}`,
      perMonth: p.perMonth || (p.durationDays > 30 ? `₹${Math.round(p.price / (p.durationDays / 30))}/mo` : (p.validityDays > 30 ? `₹${Math.round(p.price / (p.validityDays / 30))}/mo` : '')),
      features: Array.isArray(p.features) ? p.features : [],
      icon: p.icon || (name.includes('free') ? 'star-outline' : DEFAULT_ICONS[idx % DEFAULT_ICONS.length]),
      badge: p.badge || (p.isPopular ? 'MOST POPULAR' : (idx === 1 ? 'MOST POPULAR' : idx === 2 ? 'BEST VALUE' : null)),
      colors,
      textColor,
      isFree: (p.id === 'free' || name.includes('free'))
    };
  });
  const activePlan = mappedPlans.find((plan) => plan.id === selected);
  const planFeatures = activePlan?.features || [];

  if (isLoading && plans.length === 0) {
    return (
      <View style={[s.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#E94057" />
      </View>
    );
  }

  return (
    <SafeAreaView style={s.container}>
      <LinearGradient
        colors={['#fff0f3', '#ffffff', '#f3f0ff']}
        style={StyleSheet.absoluteFill}
      />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={22} color="#2b1c50" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Choose Plan</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        <View style={s.topSection}>
          <Text style={s.title}>Upgrade to Premium</Text>
          <Text style={s.subtitle}>Get more matches and unlimited features with our premium plans</Text>
        </View>

        {/* Features list with better UI */}
        <View style={s.featuresContainer}>
          {planFeatures.map((f, i) => (
            <View key={i} style={s.featureItem}>
              <View style={s.featureIconBg}>
                <Icon name="checkmark" size={14} color="#E94057" />
              </View>
              <Text style={s.featureText}>{f}</Text>
            </View>
          ))}
        </View>

        {/* Plans - Vertical Column */}
        <View style={s.plansColumn}>
          {mappedPlans.map((plan) => {
            const active = selected === plan.id;
            return (
              <TouchableOpacity
                key={plan.id}
                onPress={() => handleSelectPlan(plan.id)}
                activeOpacity={0.9}
                style={[
                  s.planCard, 
                  active && s.planCardActive,
                  active && { borderColor: plan.colors[0] }
                ]}
              >
                {active && (
                  <LinearGradient
                    colors={plan.colors}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                    style={[StyleSheet.absoluteFillObject, { borderRadius: 22 }]}
                  />
                )}

                {plan.badge && (
                  <View style={[
                    s.badgeWrapNew, 
                    active ? (plan.textColor === '#111111' ? { backgroundColor: '#111111' } : { backgroundColor: '#FFF' }) : { backgroundColor: '#111111' }
                  ]}>
                    <Text style={[
                      s.badgeTextNew, 
                      active ? { color: plan.textColor === '#111111' ? '#FFF' : plan.colors[1] } : { color: '#FFF' }
                    ]}>{plan.badge}</Text>
                  </View>
                )}
                
                <View style={s.planHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap', flex: 1 }}>
                    <Text style={[s.planNameNew, active && (plan.textColor === '#111111' ? s.activeTextDark : s.activeTextWhite)]}>{plan.name}</Text>
                    {isSubscriptionActive && plan.id === currentActivePlanId && (
                      <View style={[
                        s.currentPlanBadge, 
                        active ? (plan.textColor === '#111111' ? { backgroundColor: 'rgba(17, 17, 17, 0.08)' } : { backgroundColor: 'rgba(255, 255, 255, 0.25)' }) : { backgroundColor: 'rgba(76, 175, 80, 0.12)' }
                      ]}>
                        <Text style={[
                          s.currentPlanBadgeText, 
                          active ? { color: plan.textColor === '#111111' ? '#111111' : '#FFF' } : { color: '#4CAF50' }
                        ]}>Current Plan</Text>
                      </View>
                    )}
                  </View>
                  <View style={[s.planIconWrap, active && (plan.textColor === '#111111' ? { backgroundColor: 'rgba(0, 0, 0, 0.08)' } : s.planIconWrapActive)]}>
                    <Icon name={plan.icon} size={24} color={active ? (plan.textColor === '#111111' ? '#111111' : plan.colors[1]) : '#111111'} />
                  </View>
                </View>

                <View style={s.planPriceSection}>
                  <Text style={[s.planPriceNew, active && (plan.textColor === '#111111' ? s.activeTextDark : s.activeTextWhite)]}>{plan.price}</Text>
                  <Text style={[s.planDurationNew, active && (plan.textColor === '#111111' ? s.activeTextDarkSub : s.activeTextWhiteSub)]}>{plan.duration}</Text>
                </View>

                {plan.perMonth ? (
                  <Text style={[s.planPerMonthNew, active && (plan.textColor === '#111111' ? s.activeTextDarkSub : s.activeTextWhiteSub)]}>{plan.perMonth}</Text>
                ) : null}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Sticky footer */}
      {(() => {
        const isCurrentActiveSelected = isSubscriptionActive && selected === currentActivePlanId;
        return (
          <View style={s.footer}>
            {!isCurrentActiveSelected ? (
              <TouchableOpacity
                style={s.ctaWrap}
                onPress={handleContinue}
                activeOpacity={0.88}
              >
                <LinearGradient
                  colors={['#E94057', '#8A2387']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={s.ctaBtn}
                >
                  <Text style={s.ctaText}>Continue</Text>
                  <Icon name="arrow-forward" size={18} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>
            ) : (
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
                  <Text style={s.ctaText}>Cancel Subscription</Text>
                  <Icon name="close-circle-outline" size={18} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>
            )}

            <Text style={s.footerNote}>Cancel anytime • Secure payment</Text>
          </View>
        );
      })()}
    </SafeAreaView>
  );
};

const PlanContent = ({ plan, active }) => (
  <View style={pc.row}>
    <View style={[pc.iconWrap, { backgroundColor: active ? (plan.isFree ? '#EEE' : '#FFF0F3') : '#F5F5F5' }]}>
      <Icon name={plan.icon} size={24} color={active ? (plan.isFree ? '#666' : '#E94057') : '#999'} />
    </View>
    <View style={pc.info}>
      <Text style={[pc.name, active && { color: plan.textColor || '#2b1c50' }]}>{plan.name}</Text>
      <Text style={[pc.duration, active && { color: plan.textColor || '#888', opacity: 0.8 }]}>{plan.duration}</Text>
    </View>
    <View style={pc.priceBlock}>
      <Text style={[pc.price, active && { color: plan.isFree ? '#666' : '#E94057' }]}>{plan.price}</Text>
      <Text style={pc.perMonth}>{plan.perMonth}</Text>
    </View>
  </View>
);

const FONT = Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif';
const FONT_MED = Platform.OS === 'ios' ? 'AvenirNext-Medium' : 'sans-serif-medium';

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 10,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#2b1c50', fontFamily: FONT_MED },
  scroll: { paddingBottom: 160 },
  topSection: { paddingHorizontal: 24, marginTop: 12 },
  title: {
    fontSize: 28, fontWeight: '800', color: '#111',
    fontFamily: FONT_MED, marginBottom: 8,
  },
  subtitle: { fontSize: 15, color: '#666', lineHeight: 22, fontFamily: FONT, marginBottom: 24 },
  
  featuresContainer: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 12,
  },
  featureIconBg: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFF0F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureText: {
    fontSize: 15,
    color: '#444',
    fontFamily: FONT,
    fontWeight: '500',
  },

  plansColumn: {
    paddingHorizontal: 24,
    paddingBottom: 20,
    gap: 16,
  },
  planCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 20,
    borderWidth: 2,
    borderColor: '#F0F0F0',
    position: 'relative',
    justifyContent: 'space-between',
    minHeight: 160,
  },
  planCardActive: {
    // Dynamic styles applied inline based on plan.colors
  },
  badgeWrapNew: {
    position: 'absolute',
    top: -12,
    right: 20,
    backgroundColor: '#E94057',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
  },
  badgeTextNew: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  planNameNew: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111111',
  },
  planIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  planIconWrapActive: {
    backgroundColor: '#FFF',
  },
  planPriceSection: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  planPriceNew: {
    fontSize: 32,
    fontWeight: '800',
    color: '#111111',
  },
  planDurationNew: {
    fontSize: 16,
    color: '#111111',
    fontWeight: '600',
    opacity: 0.75,
  },
  planPerMonthNew: {
    fontSize: 13,
    color: '#111111',
    marginTop: 4,
    opacity: 0.6,
  },
  activeTextWhite: { color: '#FFF', opacity: 1 },
  activeTextWhiteSub: { color: 'rgba(255, 255, 255, 0.8)', opacity: 1 },
  activeTextDark: { color: '#111111', opacity: 1 },
  activeTextDarkSub: { color: 'rgba(0, 0, 0, 0.65)', opacity: 1 },

  currentPlanBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentPlanBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },

  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: 20, paddingBottom: 34, paddingTop: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1, borderTopColor: '#F0F0F0',
  },
  ctaWrap: { borderRadius: 18, overflow: 'hidden', marginBottom: 8 },
  ctaBtn: {
    height: 56, flexDirection: 'row',
    justifyContent: 'center', alignItems: 'center', gap: 10,
  },
  ctaText: { fontSize: 16, fontWeight: '700', color: '#fff', fontFamily: FONT_MED },
  cancelSubBtn: {
    marginTop: 8,
    marginBottom: 12,
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  cancelSubText: {
    color: '#E94057',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: FONT_MED,
  },
  footerNote: { fontSize: 11, color: '#AAA', textAlign: 'center', fontFamily: FONT },
});

const pc = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconWrap: {
    width: 48, height: 48, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
  },
  info: { flex: 1 },
  name: {
    fontSize: 16, fontWeight: '600', color: '#555', fontFamily: FONT_MED,
  },
  nameActive: { color: '#2b1c50' },
  duration: { fontSize: 12, color: '#AAA', marginTop: 2 },
  durationActive: { color: '#888' },
  priceBlock: { alignItems: 'flex-end' },
  price: { fontSize: 18, fontWeight: '700', color: '#CCC', fontFamily: FONT_MED },
  priceActive: { color: '#E94057' },
  perMonth: { fontSize: 10, color: '#AAA', marginTop: 2 },
});
