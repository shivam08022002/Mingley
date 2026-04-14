import React, { useState } from 'react';
import {
  View, Text, StyleSheet,
  TouchableOpacity, ScrollView, Dimensions, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');

const PLANS = [
  {
    id: '1', name: 'Starter', duration: '3 Months',
    price: '₹999', perMonth: '₹333/mo',
    icon: 'star-outline', iconColor: '#E4415C',
    badge: null,
  },
  {
    id: '2', name: 'Pro Buddy', duration: '6 Months',
    price: '₹1,799', perMonth: '₹300/mo',
    icon: 'trophy-outline', iconColor: '#8A2387',
    badge: 'MOST POPULAR',
  },
  {
    id: '3', name: 'Advanced', duration: '12 Months',
    price: '₹2,999', perMonth: '₹250/mo',
    icon: 'rocket-outline', iconColor: '#4169E1',
    badge: 'BEST VALUE',
  },
];

const FEATURES = [
  'Find out who liked your profile',
  'Contact popular & new users',
  'Browse profiles invisibly',
  'Advanced matching filters',
  'Unlimited super likes',
];

export const SubscriptionPlansScreen = ({ navigation }) => {
  const [selected, setSelected] = useState('2');

  return (
    <SafeAreaView style={s.container}>
      <LinearGradient
        colors={['#fff0f3', '#ffffff', '#f3f0ff']}
        style={StyleSheet.absoluteFillObject}
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
        <Text style={s.title}>For Best Access</Text>
        <Text style={s.subtitle}>Subscribe a plan</Text>

        {/* Features */}
        <View style={s.featuresCard}>
          <Text style={s.featuresTitle}>What you'll get</Text>
          {FEATURES.map((f, i) => (
            <View key={i} style={s.featureRow}>
              <View style={s.featureDot}>
                <Icon name="checkmark" size={12} color="#fff" />
              </View>
              <Text style={s.featureText}>{f}</Text>
            </View>
          ))}
        </View>

        {/* Plans */}
        <Text style={s.sectionLabel}>Select your plan</Text>
        <View style={s.plansList}>
          {PLANS.map((plan) => {
            const active = selected === plan.id;
            return (
              <View key={plan.id} style={s.planCardOuter}>
                {/* Badge positioned outside the card */}
                {plan.badge && (
                  <View style={[s.badgeWrap, active && s.badgeActive]}>
                    <Text style={s.badgeText}>{plan.badge}</Text>
                  </View>
                )}
                <TouchableOpacity
                  onPress={() => setSelected(plan.id)}
                  activeOpacity={0.85}
                >
                  {active ? (
                    <LinearGradient
                      colors={['#E4415C', '#8A2387']}
                      start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                      style={s.planCardBorder}
                    >
                      <View style={s.planCardInner}>
                        <PlanContent plan={plan} active />
                      </View>
                    </LinearGradient>
                  ) : (
                    <View style={s.planCardDefault}>
                      <PlanContent plan={plan} active={false} />
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Sticky footer */}
      <View style={s.footer}>
        <TouchableOpacity
          style={s.ctaWrap}
          onPress={() => navigation.navigate('Payment')}
          activeOpacity={0.88}
        >
          <LinearGradient
            colors={['#E4415C', '#8A2387']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={s.ctaBtn}
          >
            <Text style={s.ctaText}>Continue</Text>
            <Icon name="arrow-forward" size={18} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
        <Text style={s.footerNote}>Cancel anytime • Secure payment</Text>
      </View>
    </SafeAreaView>
  );
};

const PlanContent = ({ plan, active }) => (
  <View style={pc.row}>
    <View style={[pc.iconWrap, { backgroundColor: active ? '#FFF0F3' : '#F5F5F5' }]}>
      <Icon name={plan.icon} size={24} color={active ? '#E4415C' : '#999'} />
    </View>
    <View style={pc.info}>
      <Text style={[pc.name, active && pc.nameActive]}>{plan.name}</Text>
      <Text style={[pc.duration, active && pc.durationActive]}>{plan.duration}</Text>
    </View>
    <View style={pc.priceBlock}>
      <Text style={[pc.price, active && pc.priceActive]}>{plan.price}</Text>
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
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#2b1c50', fontFamily: FONT_MED },
  scroll: { paddingHorizontal: 20, paddingBottom: 120 },
  title: {
    fontSize: 32, fontWeight: '800', color: '#2b1c50',
    fontFamily: FONT_MED, marginBottom: 4, marginTop: 8,
  },
  subtitle: { fontSize: 16, color: '#E4415C', fontWeight: '600', marginBottom: 20 },
  featuresCard: {
    backgroundColor: '#FAFAFA', borderRadius: 20,
    padding: 18, marginBottom: 24,
    borderWidth: 1, borderColor: '#F0F0F0',
  },
  featuresTitle: {
    fontSize: 15, fontWeight: '700', color: '#2b1c50',
    fontFamily: FONT_MED, marginBottom: 14,
  },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  featureDot: {
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: '#E4415C',
    justifyContent: 'center', alignItems: 'center',
  },
  featureText: { fontSize: 14, color: '#444', fontFamily: FONT },
  sectionLabel: {
    fontSize: 14, fontWeight: '700', color: '#999',
    textTransform: 'uppercase', letterSpacing: 0.8,
    marginBottom: 12, fontFamily: FONT_MED,
  },
  plansList: { gap: 16 },

  // Plan card outer wrapper (holds badge + card)
  planCardOuter: {
    position: 'relative',
  },
  badgeWrap: {
    position: 'absolute', top: -10, right: 16,
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 8, zIndex: 5,
  },
  badgeActive: { backgroundColor: '#E4415C' },
  badgeText: { fontSize: 9, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },

  planCardBorder: { borderRadius: 20, padding: 2 },
  planCardInner: {
    backgroundColor: '#fff', borderRadius: 18,
    paddingHorizontal: 16, paddingVertical: 16,
  },
  planCardDefault: {
    backgroundColor: '#fff', borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 16,
    borderWidth: 1.5, borderColor: '#F0F0F0',
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
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
  ctaText: { fontSize: 16, fontWeight: '800', color: '#fff', fontFamily: FONT_MED },
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
    fontSize: 16, fontWeight: '700', color: '#555', fontFamily: FONT_MED,
  },
  nameActive: { color: '#2b1c50' },
  duration: { fontSize: 12, color: '#AAA', marginTop: 2 },
  durationActive: { color: '#888' },
  priceBlock: { alignItems: 'flex-end' },
  price: { fontSize: 18, fontWeight: '800', color: '#CCC', fontFamily: FONT_MED },
  priceActive: { color: '#E4415C' },
  perMonth: { fontSize: 10, color: '#AAA', marginTop: 2 },
});
