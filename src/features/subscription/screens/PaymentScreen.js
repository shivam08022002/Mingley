import { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSubscriptionStore } from '../store/useSubscriptionStore';

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

export const PaymentScreen = ({ navigation }) => {
  const { selectedPlan, subscribe, isLoading } = useSubscriptionStore();
  const [selectedMethod, setSelectedMethod] = useState('1');

  if (!selectedPlan) {
    // We can't really navigate back here directly if the component is already rendering
    // but we can show an empty state or handle it gracefully.
    return (
      <SafeAreaView style={s.container}>
        <View style={s.emptyState}>
          <Text>No plan selected</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={{ color: '#E94057', marginTop: 10 }}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const priceStr = String(selectedPlan.price || '0').replace(/[^0-9.]/g, '');
  const subtotal = parseFloat(priceStr) || 0;
  const tax = parseFloat((subtotal * 0.18).toFixed(2));
  const total = parseFloat((subtotal + tax).toFixed(2));

  const handlePay = async () => {
    try {
      await subscribe({
        planId: selectedPlan.id || selectedPlan._id,
        autoRenew: true,
        paymentMethod: PAYMENT_METHODS.find((item) => item.id === selectedMethod)?.label || 'Card',
        paymentId: `mock-payment-${Date.now()}`,
        orderId: `mock-order-${Date.now()}`,
        signature: 'mock-signature',
      });
      Alert.alert(
        'Payment Successful! 🎉',
        'Welcome to Mingley Premium. Enjoy unlimited matches!',
        [{ text: 'Continue', onPress: () => navigation.navigate('Home') }]
      );
    } catch (error) {
      Alert.alert('Payment Failed', error.message || 'Something went wrong. Please try again.');
    }
  };

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
        <Text style={s.headerTitle}>Payment</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {/* Selected Plan Info */}
        <View style={s.planInfoCard}>
          <View style={s.planIconCircle}>
            <Icon name="star" size={24} color="#E94057" />
          </View>
          <View style={s.planDetails}>
            <Text style={s.planLabel}>Selected Plan</Text>
            <Text style={s.planName}>{selectedPlan.name}</Text>
          </View>
          <View style={s.planPriceTag}>
            <Text style={s.planPriceText}>₹{subtotal}</Text>
          </View>
        </View>

        {/* Payment methods */}
        <Text style={s.sectionLabel}>Payment Method</Text>
        <View style={s.methodsCard}>
          {PAYMENT_METHODS.map((m, idx) => {
            const isActive = selectedMethod === m.id;
            return (
              <TouchableOpacity
                key={m.id}
                style={[s.methodRow, idx < PAYMENT_METHODS.length - 1 && s.methodBorder]}
                onPress={() => setSelectedMethod(m.id)}
                activeOpacity={0.7}
              >
                {/* Radio */}
                <View style={[s.radio, isActive && s.radioActive]}>
                  {isActive && <View style={s.radioInner} />}
                </View>

                {/* Icon */}
                <View style={[s.methodIcon, isActive && s.methodIconActive]}>
                  <Icon name={m.icon} size={18} color={isActive ? '#E94057' : '#999'} />
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
            <Icon name="add" size={18} color="#E94057" />
          </View>
          <Text style={s.addText}>Add new payment method</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Sticky footer with Order Summary */}
      <View style={s.footer}>
        <View style={s.summaryContainer}>
          <View style={s.summaryRow}>
            <Text style={s.summaryKey}>Subtotal</Text>
            <Text style={s.summaryVal}>₹{subtotal}</Text>
          </View>
          <View style={s.summaryRow}>
            <Text style={s.summaryKey}>Tax (GST 18%)</Text>
            <Text style={s.summaryVal}>₹{tax}</Text>
          </View>
          <View style={s.summaryDivider} />
          <View style={[s.summaryRow, { marginBottom: 12 }]}>
            <Text style={s.totalKey}>Total Amount</Text>
            <Text style={s.totalVal}>₹{total}</Text>
          </View>
        </View>

        <TouchableOpacity style={s.payWrap} onPress={handlePay} activeOpacity={0.88} disabled={isLoading}>
          <LinearGradient
            colors={['#E94057', '#8A2387']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={s.payBtn}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Icon name="lock-closed" size={16} color="#fff" />
                <Text style={s.payText}>Pay Securely</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
        <View style={s.secureNoteContainer}>
          <Icon name="shield-checkmark" size={12} color="#4CAF50" />
          <Text style={s.secureNote}>Secure 256-bit SSL encrypted payment</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const FONT = Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif';
const FONT_MED = Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif-medium';

const s = StyleSheet.create({
  container: { flex: 1 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center' },
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
  scroll: { paddingHorizontal: 20, paddingBottom: 220 },

  // Plan info card
  planInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  planIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF0F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  planDetails: { flex: 1 },
  planLabel: { fontSize: 12, color: '#888', marginBottom: 2 },
  planName: { fontSize: 16, fontWeight: '700', color: '#111' },
  planPriceTag: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  planPriceText: { fontSize: 14, fontWeight: '700', color: '#333' },

  sectionLabel: {
    fontSize: 13, fontWeight: '600', color: '#9A8FA3',
    textTransform: 'uppercase', letterSpacing: 0.8,
    marginBottom: 12, fontFamily: FONT_MED,
  },

  // Methods card
  methodsCard: {
    backgroundColor: '#fff', borderRadius: 24,
    paddingHorizontal: 16, marginBottom: 16,
    borderWidth: 1, borderColor: '#F0F0F0',
    shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 10, elevation: 2,
  },
  methodRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 18,
  },
  methodBorder: { borderBottomWidth: 1, borderBottomColor: '#F8F8F8' },

  radio: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 2, borderColor: '#DDD',
    justifyContent: 'center', alignItems: 'center',
    marginRight: 12,
  },
  radioActive: { borderColor: '#E94057' },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#E94057' },

  methodIcon: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: '#F8F8F8',
    justifyContent: 'center', alignItems: 'center',
    marginRight: 12,
  },
  methodIconActive: { backgroundColor: '#FFF0F3' },
  methodText: { flex: 1 },
  methodLabel: { fontSize: 15, fontWeight: '500', color: '#555', fontFamily: FONT_MED },
  methodLabelActive: { color: '#000' },
  methodSub: { fontSize: 12, color: '#AAA', marginTop: 1, fontFamily: FONT },

  mcWrap: { flexDirection: 'row', alignItems: 'center' },
  mcCircle: { width: 16, height: 16, borderRadius: 8, opacity: 0.9 },
  visaText: { fontSize: 10, fontWeight: '900', color: '#1A1F71', fontStyle: 'italic' },

  addRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 4, marginTop: 4, marginBottom: 24,
  },
  addIcon: {
    width: 24, height: 24, borderRadius: 8,
    backgroundColor: '#FFF0F3',
    justifyContent: 'center', alignItems: 'center',
    marginRight: 10,
  },
  addText: { fontSize: 14, color: '#E94057', fontWeight: '500', fontFamily: FONT_MED },

  // Footer & Summary
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: 24, paddingBottom: 34, paddingTop: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1, borderTopColor: '#F0F0F0',
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05, shadowRadius: 10, elevation: 10,
  },
  summaryContainer: { marginBottom: 20 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  summaryKey: { fontSize: 14, color: '#666' },
  summaryVal: { fontSize: 14, color: '#111', fontWeight: '600' },
  summaryDivider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 12 },
  totalKey: { fontSize: 16, fontWeight: '700', color: '#111' },
  totalVal: { fontSize: 20, fontWeight: '800', color: '#E94057' },

  payWrap: { borderRadius: 18, overflow: 'hidden', marginBottom: 12 },
  payBtn: {
    height: 56, flexDirection: 'row',
    justifyContent: 'center', alignItems: 'center', gap: 10,
  },
  payText: { fontSize: 16, fontWeight: '700', color: '#fff', fontFamily: FONT_MED },
  secureNoteContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
  secureNote: { fontSize: 11, color: '#666', textAlign: 'center', fontFamily: FONT },
});
