import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Platform, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');

const PAYMENT_METHODS = [
  {
    id: '1', label: 'HDFC Credit Card',
    sub: '**** **** **** 5229', icon: 'card-outline', brand: 'MC',
  },
  {
    id: '2', label: 'ICICI Credit Card',
    sub: '**** **** **** 4421', icon: 'card-outline', brand: 'VISA',
  },
  {
    id: '3', label: 'UPI Payment',
    sub: 'pay@ybl', icon: 'phone-portrait-outline', brand: null,
  },
  {
    id: '4', label: 'PayTM / Wallets',
    sub: 'Paytm, PhonePe & more', icon: 'wallet-outline', brand: null,
  },
  {
    id: '5', label: 'Net Banking',
    sub: 'All Indian banks', icon: 'business-outline', brand: null,
  },
];

const ORDER_SUMMARY = { plan: 'Pro Buddy – 6 Months', amount: '₹1,799', tax: '₹324', total: '₹2,123' };

export const PaymentScreen = ({ navigation }) => {
  const [selected, setSelected] = useState('1');

  const handlePay = () => {
    Alert.alert(
      'Payment Successful! 🎉',
      'Welcome to Mingley Premium. Enjoy unlimited matches!',
      [{ text: 'Continue', onPress: () => navigation.navigate('Home') }]
    );
  };

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
        <Text style={s.headerTitle}>Payment</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* Order summary card */}
        <View style={s.summaryCard}>
          <LinearGradient
            colors={['#E4415C', '#8A2387']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={s.summaryGradient}
          >
            <Text style={s.summaryEyebrow}>ORDER SUMMARY</Text>
            <Text style={s.summaryPlan}>{ORDER_SUMMARY.plan}</Text>
            <View style={s.summaryDivider} />
            <View style={s.summaryRow}>
              <Text style={s.summaryKey}>Subtotal</Text>
              <Text style={s.summaryVal}>{ORDER_SUMMARY.amount}</Text>
            </View>
            <View style={s.summaryRow}>
              <Text style={s.summaryKey}>GST (18%)</Text>
              <Text style={s.summaryVal}>{ORDER_SUMMARY.tax}</Text>
            </View>
            <View style={[s.summaryRow, s.totalRow]}>
              <Text style={s.totalKey}>Total</Text>
              <Text style={s.totalVal}>{ORDER_SUMMARY.total}</Text>
            </View>
          </LinearGradient>
        </View>

        {/* Payment methods */}
        <Text style={s.sectionLabel}>Payment Method</Text>
        <View style={s.methodsCard}>
          {PAYMENT_METHODS.map((m, idx) => {
            const isActive = selected === m.id;
            return (
              <TouchableOpacity
                key={m.id}
                style={[s.methodRow, idx < PAYMENT_METHODS.length - 1 && s.methodBorder]}
                onPress={() => setSelected(m.id)}
                activeOpacity={0.7}
              >
                {/* Radio */}
                <View style={[s.radio, isActive && s.radioActive]}>
                  {isActive && <View style={s.radioInner} />}
                </View>

                {/* Icon */}
                <View style={[s.methodIcon, isActive && s.methodIconActive]}>
                  <Icon name={m.icon} size={18} color={isActive ? '#E4415C' : '#999'} />
                </View>

                {/* Text */}
                <View style={s.methodText}>
                  <Text style={[s.methodLabel, isActive && s.methodLabelActive]}>
                    {m.label}
                  </Text>
                  <Text style={s.methodSub}>{m.sub}</Text>
                </View>

                {/* Brand badge */}
                {m.brand === 'MC' && (
                  <View style={s.mcWrap}>
                    <View style={[s.mcCircle, { backgroundColor: '#EB001B', marginRight: -8 }]} />
                    <View style={[s.mcCircle, { backgroundColor: '#F79E1B' }]} />
                  </View>
                )}
                {m.brand === 'VISA' && (
                  <Text style={s.visaText}>VISA</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Add new */}
        <TouchableOpacity style={s.addRow} onPress={() => Alert.alert('Add Payment', 'Coming soon!')}>
          <View style={s.addIcon}>
            <Icon name="add" size={18} color="#E4415C" />
          </View>
          <Text style={s.addText}>Add new payment method</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Sticky pay button */}
      <View style={s.footer}>
        <TouchableOpacity style={s.payWrap} onPress={handlePay} activeOpacity={0.88}>
          <LinearGradient
            colors={['#E4415C', '#8A2387']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={s.payBtn}
          >
            <Icon name="lock-closed" size={16} color="#fff" />
            <Text style={s.payText}>Pay {ORDER_SUMMARY.total} Securely</Text>
          </LinearGradient>
        </TouchableOpacity>
        <View style={s.secureNoteContainer}>
          <Icon name="lock-closed-outline" size={12} color="#AAA" />
          <Text style={s.secureNote}>256-bit SSL encryption</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const FONT = Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif';
const FONT_MED = Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif-medium';

const s = StyleSheet.create({
  container: { flex: 1 },
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
  scroll: { paddingHorizontal: 20, paddingBottom: 140 },

  // Summary card
  summaryCard: {  paddingHorizontal: 8, overflow: 'hidden',width: '100%',height: 200, marginBottom: 14 },
  summaryGradient: { padding: 10, paddingRight: 0, paddingLeft: 10},
  summaryEyebrow: {
    fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.7)',
    letterSpacing: 1.5, marginBottom: 6,
  },
  summaryPlan: {
    fontSize: 20, fontWeight: '700', color: '#fff',
    fontFamily: FONT_MED, marginBottom: 14,
  },
  summaryDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginBottom: 12 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  summaryKey: { fontSize: 14, color: 'rgba(255,255,255,0.75)', fontFamily: FONT },
  summaryVal: { fontSize: 14, color: '#fff', fontWeight: '700',marginRight: 16, fontFamily: FONT_MED },
  totalRow: {
    marginTop: 6, paddingTop: 12, marginBottom: 12, marginRight: 16,
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.25)',
  },
  totalKey: { fontSize: 16, fontWeight: '800', color: '#fff', fontFamily: FONT_MED },
  totalVal: { fontSize: 20, fontWeight: '800', color: '#fff', fontFamily: FONT_MED },

  sectionLabel: {
    fontSize: 14, fontWeight: '700', color: '#999',
    textTransform: 'uppercase', letterSpacing: 0.8,
    marginBottom: 12, fontFamily: FONT_MED,
  },

  // Methods card
  methodsCard: {
    backgroundColor: '#fff', borderRadius: 20,
    borderWidth: 1, borderColor: '#F0F0F0',
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
    marginBottom: 16, overflow: 'hidden',
  },
  methodRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14, gap: 12,
  },
  methodBorder: { borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  radio: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 2, borderColor: '#D0D0D0',
    justifyContent: 'center', alignItems: 'center',
  },
  radioActive: { borderColor: '#E4415C' },
  radioInner: {
    width: 10, height: 10, borderRadius: 5, backgroundColor: '#E4415C',
  },
  methodIcon: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center', alignItems: 'center',
  },
  methodIconActive: { backgroundColor: '#FFF0F3' },
  methodText: { flex: 1 },
  methodLabel: { fontSize: 14, fontWeight: '600', color: '#AAA', fontFamily: FONT_MED },
  methodLabelActive: { color: '#2b1c50' },
  methodSub: { fontSize: 11, color: '#BBB', marginTop: 2, fontFamily: FONT },

  // Brand icons
  mcWrap: { flexDirection: 'row', alignItems: 'center' },
  mcCircle: { width: 22, height: 22, borderRadius: 11, opacity: 0.9 },
  visaText: { fontSize: 16, fontWeight: '900', color: '#1A1F71', fontStyle: 'italic' },

  // Add
  addRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 14, paddingHorizontal: 4,
  },
  addIcon: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#FFF0F3', borderWidth: 1.5,
    borderColor: '#E4415C', borderStyle: 'dashed',
    justifyContent: 'center', alignItems: 'center',
  },
  addText: { fontSize: 14, color: '#E4415C', fontWeight: '600', fontFamily: FONT_MED },

  // Footer
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: 20, paddingBottom: 34, paddingTop: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1, borderTopColor: '#F0F0F0',
  },
  payWrap: { borderRadius: 18, overflow: 'hidden', marginBottom: 8 },
  payBtn: {
    height: 56, flexDirection: 'row',
    justifyContent: 'center', alignItems: 'center', gap: 10,
  },
  payText: { fontSize: 16, fontWeight: '800', color: '#fff', fontFamily: FONT_MED },
  secureNote: { fontSize: 11, color: '#AAA', textAlign: 'center', fontFamily: FONT },
});
