import { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSubscriptionStore } from '../store/useSubscriptionStore';
import { walletService } from '../../../services/apiServices';
import { useToastStore } from '../../../store/useToastStore';
import { useProfileStore } from '../../profile/store/useProfileStore';

// Conditional Native import to prevent Web bundler crashes
let RazorpayCheckout = null;
if (Platform.OS !== 'web') {
  try {
    RazorpayCheckout = require('react-native-razorpay').default;
  } catch (e) {
    console.warn('react-native-razorpay is not available in this environment');
  }
}

// Dynamic script loader for Web Razorpay checkout
const loadRazorpayWebScript = () => {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      resolve(true);
      return;
    }
    if (typeof document === 'undefined') {
      resolve(false);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};


export const PaymentScreen = ({ navigation }) => {
  const { selectedPlan, subscribe, isLoading, fetchStatus, setSelectedPlan } = useSubscriptionStore();
  const [isPaying, setIsPaying] = useState(false);

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
    setIsPaying(true);
    const refreshProfileBalance = async () => {
      try {
        await useProfileStore.getState().fetchProfile();
      } catch (e) {
        console.warn('Failed to refresh profile balance:', e);
      }
    };

    try {
      // 1. Fetch Razorpay key dynamically from order API to avoid hardcoding credentials
      let rzpKey = null;
      try {
        const tempOrder = await walletService.createRazorpayOrder('pkg_100');
        rzpKey = tempOrder?.key || tempOrder?.data?.key;
      } catch (keyErr) {
        console.warn('Failed to dynamically fetch Razorpay Key, falling back to default test key:', keyErr);
        rzpKey = 'rzp_test_mingley'; // fallback default test key if backend orders are down
      }

      if (!rzpKey) {
        throw new Error('Could not retrieve payment gateway credentials.');
      }

      const totalPaise = Math.round(total * 100);

      if (Platform.OS === 'web') {
        // 2. Web Checkout Flow
        const isLoaded = await loadRazorpayWebScript();
        if (!isLoaded) {
          throw new Error('Failed to load Razorpay Checkout SDK.');
        }

        const options = {
          key: rzpKey,
          amount: totalPaise,
          currency: 'INR',
          name: 'Mingley Premium',
          description: `Subscribe to ${selectedPlan.name} Plan`,
          handler: async (response) => {
            setIsPaying(true);
            try {
              await subscribe({
                planId: selectedPlan.id || selectedPlan._id,
                autoRenew: true,
                paymentMethod: 'razorpay',
                paymentToken: response.razorpay_payment_id,
                orderId: response.razorpay_order_id || `sub-order-${Date.now()}`,
                signature: response.razorpay_signature || 'signature-web',
              });
              await fetchStatus();
              setSelectedPlan(null); // Clear plan from store to remove it from order summary
              await refreshProfileBalance();
              useToastStore.getState().showToast('Subscription plan activated successfully! 🎉', 'success', 3500);
              navigation.navigate('SubscriptionPlans');
            } catch (err) {
              await refreshProfileBalance();
              useToastStore.getState().showToast(err.message || 'Subscription verification failed.', 'error', 4000);
            } finally {
              setIsPaying(false);
            }
          },
          prefill: {
            name: 'Mingley User',
            email: 'user@mingley.com',
          },
          modal: {
            ondismiss: async () => {
              await refreshProfileBalance();
              setIsPaying(false);
            }
          },
          theme: {
            color: '#E94057',
          },
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        // 2. Native Checkout Flow
        if (!RazorpayCheckout) {
          throw new Error('Razorpay Checkout SDK is not available on this device.');
        }

        const options = {
          description: `Subscribe to ${selectedPlan.name} Plan`,
          image: 'https://i.imgur.com/3g7A6cz.png',
          currency: 'INR',
          key: rzpKey,
          amount: totalPaise,
          name: 'Mingley Premium',
          prefill: {
            email: 'user@mingley.com',
            contact: '',
            name: 'Mingley User',
          },
          theme: { color: '#E94057' },
        };

        RazorpayCheckout.open(options)
          .then(async (data) => {
            setIsPaying(true);
            try {
              await subscribe({
                planId: selectedPlan.id || selectedPlan._id,
                autoRenew: true,
                paymentMethod: 'razorpay',
                paymentToken: data.razorpay_payment_id,
                orderId: data.razorpay_order_id || `sub-order-${Date.now()}`,
                signature: data.razorpay_signature || 'signature-native',
              });
              await fetchStatus();
              setSelectedPlan(null); // Clear plan from store to remove it from order summary
              await refreshProfileBalance();
              useToastStore.getState().showToast('Subscription plan activated successfully! 🎉', 'success', 3500);
              navigation.navigate('SubscriptionPlans');
            } catch (err) {
              await refreshProfileBalance();
              useToastStore.getState().showToast(err.message || 'Subscription verification failed.', 'error', 4000);
            } finally {
              setIsPaying(false);
            }
          })
          .catch(async (error) => {
            await refreshProfileBalance();
            useToastStore.getState().showToast(error.description || 'Payment was cancelled.', 'error', 4000);
            setIsPaying(false);
          });
      }
    } catch (error) {
      await refreshProfileBalance();
      useToastStore.getState().showToast(error.message || 'Payment failed.', 'error', 4000);
      setIsPaying(false);
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

        {/* Secure Checkout Indicator */}
        <View style={s.trustBanner}>
          <Icon name="shield-checkmark" size={24} color="#4CAF50" />
          <View style={{ flex: 1 }}>
            <Text style={s.trustTitle}>100% Secure Checkout</Text>
            <Text style={s.trustSubtitle}>Your transaction is encrypted & securely processed via Razorpay. Choose UPI, Cards, Netbanking or Wallets directly on the checkout window.</Text>
          </View>
        </View>
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

        <TouchableOpacity style={s.payWrap} onPress={handlePay} activeOpacity={0.88} disabled={isLoading || isPaying}>
          <LinearGradient
            colors={['#E94057', '#8A2387']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={s.payBtn}
          >
            {isLoading || isPaying ? (
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

  // Secure Trust Indicator
  trustBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3FBF7',
    padding: 14,
    borderRadius: 14,
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: '#C8E6C9',
    gap: 12,
  },
  trustTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2E7D32',
    fontFamily: FONT_MED,
  },
  trustSubtitle: {
    fontSize: 11,
    color: '#4CAF50',
    lineHeight: 15,
    marginTop: 1,
    fontFamily: FONT,
  },

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
