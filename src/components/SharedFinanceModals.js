import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Modal, Alert, KeyboardAvoidingView, Platform,
  ActivityIndicator, ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { useChatStore } from '../store/useChatStore';
import { BottomSheetContainer } from './common/BottomSheetContainer';
import { walletService } from '../services/apiServices';
import { useProfileStore } from '../features/profile/store/useProfileStore';

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

// ─── Deposit / Top-Up Modal ────────────────────────────────────────────────────
export const DepositModal = ({ visible, onClose }) => {
  const [packages, setPackages] = useState([]);
  const [selectedPkg, setSelectedPkg] = useState(null);
  const [loadingPkgs, setLoadingPkgs] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const wallet = useChatStore((s) => s.wallet);
  const fetchWalletBalance = useChatStore((s) => s.fetchWalletBalance);

  useEffect(() => {
    if (visible) {
      fetchWalletBalance();
      loadPackages();
    }
  }, [visible]);

  const loadPackages = async () => {
    setLoadingPkgs(true);
    try {
      const res = await walletService.getPackages();
      const pkgs = res?.data?.packages || res?.packages || [];
      setPackages(pkgs);
      // Auto-select the popular package
      const popular = pkgs.find((p) => p.isPopular) || pkgs[0];
      if (popular) setSelectedPkg(popular);
    } catch (e) {
      console.error('Failed to load packages:', e);
    } finally {
      setLoadingPkgs(false);
    }
  };

  const handleDepositSubmit = async () => {
    if (!selectedPkg) {
      if (Platform.OS === 'web') {
        alert('Please select a coin package.');
      } else {
        Alert.alert('Error', 'Please select a coin package.');
      }
      return;
    }

    const refreshProfileBalance = async () => {
      try {
        await useProfileStore.getState().fetchProfile();
      } catch (e) {
        console.warn('Failed to refresh profile balance:', e);
      }
    };

    setSubmitting(true);
    try {
      // 1. Create order on the backend
      const orderRes = await walletService.createRazorpayOrder(selectedPkg.id);
      const { orderId, amount, key } = orderRes?.data || orderRes || {};

      if (!orderId || !amount || !key) {
        throw new Error('Invalid order response from payment gateway.');
      }

      if (Platform.OS === 'web') {
        // 2. Web Checkout Flow
        const isLoaded = await loadRazorpayWebScript();
        if (!isLoaded) {
          throw new Error('Failed to load Razorpay Checkout SDK.');
        }

        const options = {
          key: key,
          amount: amount,
          currency: 'INR',
          name: 'Mingley Premium',
          description: `Top up ${selectedPkg.coins} Coins`,
          order_id: orderId,
          handler: async (response) => {
            try {
              setSubmitting(true);
              await walletService.verifyRazorpayPayment({
                orderId: response.razorpay_order_id || orderId,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                packageId: selectedPkg.id,
              });
              alert(`Payment successful! ${selectedPkg.coins} coins credited to your wallet.`);
              onClose();
              await refreshProfileBalance();
              fetchWalletBalance();
            } catch (err) {
              await refreshProfileBalance();
              alert(err.message || 'Payment verification failed.');
            } finally {
              setSubmitting(false);
            }
          },
          prefill: {
            name: 'Mingley User',
            email: 'user@mingley.com',
          },
          theme: {
            color: '#E94057',
          },
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
        setSubmitting(false);
      } else {
        // 2. Native Checkout Flow
        if (!RazorpayCheckout) {
          throw new Error('Razorpay Checkout SDK is not available on this device.');
        }

        const options = {
          description: `Top up ${selectedPkg.coins} Coins`,
          image: 'https://i.imgur.com/3g7A6cz.png',
          currency: 'INR',
          key: key,
          amount: amount,
          name: 'Mingley Premium',
          order_id: orderId,
          prefill: {
            email: 'user@mingley.com',
            contact: '',
            name: 'Mingley User',
          },
          theme: { color: '#E94057' },
        };

        RazorpayCheckout.open(options)
          .then(async (data) => {
            try {
              setSubmitting(true);
              await walletService.verifyRazorpayPayment({
                orderId: data.razorpay_order_id || orderId,
                paymentId: data.razorpay_payment_id,
                signature: data.razorpay_signature,
                packageId: selectedPkg.id,
              });
              Alert.alert('Success', `Payment successful! ${selectedPkg.coins} coins credited to your wallet.`);
              onClose();
              await refreshProfileBalance();
              fetchWalletBalance();
            } catch (err) {
              await refreshProfileBalance();
              Alert.alert('Error', err.message || 'Payment verification failed.');
            } finally {
              setSubmitting(false);
            }
          })
          .catch(async (error) => {
            await refreshProfileBalance();
            Alert.alert('Payment Cancelled', error.description || 'Payment was cancelled.');
            setSubmitting(false);
          });
      }
    } catch (error) {
      await refreshProfileBalance();
      if (Platform.OS === 'web') {
        alert(error.message || 'Payment initiation failed.');
      } else {
        Alert.alert('Error', error.message || 'Payment initiation failed.');
      }
      setSubmitting(false);
    }
  };

  const PACKAGE_GRADIENTS = {
    pkg_100:  ['#6B7280', '#374151'],
    pkg_300:  ['#E94057', '#8A2387'],
    pkg_700:  ['#F59E0B', '#D97706'],
    pkg_1500: ['#7C3AED', '#4C1D95'],
    pkg_5000: ['#059669', '#064E3B'],
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <BottomSheetContainer onClose={onClose} height={580}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ width: '100%', flex: 1 }}
        >
          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {/* Header */}
            <View style={s.headerRow}>
              <View style={s.titleWrap}>
                <Icon name="wallet" size={20} color="#E94057" />
                <Text style={s.modalTitle}>Top Up Coins</Text>
              </View>
              <View style={s.balancePill}>
                <Icon name="logo-bitcoin" size={13} color="#FFD700" />
                <Text style={s.balancePillText}>{wallet.coins} coins</Text>
              </View>
            </View>

            {/* Package grid */}
            {loadingPkgs ? (
              <ActivityIndicator color="#E94057" style={{ marginVertical: 30 }} />
            ) : (
              <View style={s.pkgGrid}>
                {packages.map((pkg) => {
                  const isSelected = selectedPkg?.id === pkg.id;
                  const gradColors = PACKAGE_GRADIENTS[pkg.id] || ['#E94057', '#8A2387'];
                  return (
                    <TouchableOpacity
                      key={pkg.id}
                      style={[s.pkgCard, isSelected && s.pkgCardSelected]}
                      onPress={() => setSelectedPkg(pkg)}
                      activeOpacity={0.85}
                    >
                      {pkg.isPopular && (
                        <View style={s.popularTag}>
                          <Text style={s.popularTagText}>⭐ Popular</Text>
                        </View>
                      )}
                      {pkg.badge && !pkg.isPopular && (
                        <View style={s.bonusTag}>
                          <Text style={s.bonusTagText}>{pkg.badge}</Text>
                        </View>
                      )}
                      <LinearGradient
                        colors={isSelected ? gradColors : ['#F8F8F8', '#F0F0F0']}
                        style={s.pkgInner}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                      >
                        <Icon
                          name="logo-bitcoin"
                          size={22}
                          color={isSelected ? '#FFD700' : '#AAA'}
                        />
                        <Text style={[s.pkgCoins, isSelected && s.pkgCoinsSelected]}>
                          {pkg.coins}
                        </Text>
                        <Text style={[s.pkgCoinsLabel, isSelected && s.pkgCoinsLabelSelected]}>
                          coins
                        </Text>
                        <View style={s.pkgDivider} />
                        <Text style={[s.pkgPrice, isSelected && s.pkgPriceSelected]}>
                          ₹{pkg.price}
                        </Text>
                        <Text style={[s.pkgLabel, isSelected && s.pkgLabelSelected]}>
                          {pkg.label}
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {/* Secure Trust Indicator */}
            <View style={s.trustBanner}>
              <Icon name="shield-checkmark" size={22} color="#4CAF50" />
              <View style={{ flex: 1 }}>
                <Text style={s.trustTitle}>100% Secure Checkout</Text>
                <Text style={s.trustSubtitle}>Your transaction is encrypted & securely processed via Razorpay.</Text>
              </View>
            </View>

            {/* Submit */}
            <TouchableOpacity
              style={[
                s.modalActionBtn,
                (!selectedPkg || submitting) && s.modalActionBtnDisabled,
              ]}
              onPress={handleDepositSubmit}
              disabled={!selectedPkg || submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Icon name="lock-closed" size={16} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={s.modalActionBtnText}>
                    {selectedPkg ? `Pay ₹${selectedPkg.price} Securely` : 'Select a Package'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </BottomSheetContainer>
    </Modal>
  );
};

// ─── Cashout Modal ─────────────────────────────────────────────────────────────
export const CashoutModal = ({ visible, onClose }) => {
  const [cashoutInputText, setCashoutInputText] = useState('');
  const [bankOrUpiText, setBankOrUpiText] = useState('');
  const wallet = useChatStore((s) => s.wallet);
  const withdrawCoins = useChatStore((s) => s.withdrawCoins);
  const fetchWalletBalance = useChatStore((s) => s.fetchWalletBalance);

  useEffect(() => {
    if (visible) fetchWalletBalance();
  }, [visible, fetchWalletBalance]);

  const handleWithdraw = async () => {
    const amount = parseInt(cashoutInputText, 10);
    if (!bankOrUpiText.trim()) { Alert.alert('Error', 'Please enter your Bank Details or UPI ID.'); return; }

    try {
      await walletService.withdraw({ coins: amount, bankOrUpi: bankOrUpiText });
      onClose();
      setCashoutInputText('');
      setBankOrUpiText('');
      Alert.alert('Success', `${amount} coins withdrawn to ${bankOrUpiText}.`);
    } catch (error) {
      Alert.alert('Error', error.message || 'Withdrawal failed');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <BottomSheetContainer onClose={onClose} height={460}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : ''} style={{ width: '100%', flex: 1 }}>
          <Text style={s.modalTitle}>Withdraw Coins</Text>
          <Text style={s.modalSub}>Available: <Text style={s.modalSubBold}>{wallet.coins} coins</Text></Text>
          <Text style={s.cashoutNote}>Rs 1 per coin will be credited within 3-5 business days.</Text>
          <TextInput style={s.amountInput} placeholder="Bank Details or UPI ID" placeholderTextColor="#A0A0A0" value={bankOrUpiText} onChangeText={setBankOrUpiText} />
          <TextInput style={s.amountInput} placeholder="Enter coins to withdraw" placeholderTextColor="#A0A0A0" keyboardType="numeric" value={cashoutInputText} onChangeText={setCashoutInputText} />
          {cashoutInputText !== '' && parseInt(cashoutInputText, 10) > wallet.coins && (
            <Text style={s.cashoutError}>Insufficient coins.</Text>
          )}
          <TouchableOpacity
            style={[s.modalActionBtn, s.cashoutBtn, (!cashoutInputText || parseInt(cashoutInputText, 10) > wallet.coins || !bankOrUpiText) && s.modalActionBtnDisabled]}
            onPress={handleWithdraw}
            disabled={!cashoutInputText || parseInt(cashoutInputText, 10) > wallet.coins || !bankOrUpiText}
          >
            <Icon name="wallet-outline" size={16} color="#FFF" style={{ marginRight: 6 }} />
            <Text style={s.modalActionBtnText}>Withdraw</Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </BottomSheetContainer>
    </Modal>
  );
};

// ─── Verify Modal ──────────────────────────────────────────────────────────────
export const VerifyModal = ({ visible, onClose }) => {
  const [idProofUrl, setIdProofUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const handleVerify = async () => {
    if (!idProofUrl.trim()) { Alert.alert('Error', 'Please enter ID proof URL'); return; }
    if (!agreed) { Alert.alert('Error', 'Please agree to the Terms of Service to proceed.'); return; }
    setIsLoading(true);
    try {
      await walletService.verifyAccount({ idProofUrl });
      Alert.alert('Success', 'Verification request submitted! A 50-coin bonus will be credited once approved.');
      onClose();
      setIdProofUrl('');
      setAgreed(false);
    } catch (error) {
      Alert.alert('Error', error.message || 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <BottomSheetContainer onClose={onClose} height={520}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : ''} style={{ width: '100%', flex: 1, paddingHorizontal: 20 }}>
          <View style={{ alignItems: 'center', marginVertical: 25 }}>
            <View style={s.verifyIconCircle}>
              <Icon name="shield-checkmark" size={42} color="#E94057" />
            </View>
            <Text style={s.modalTitle}>Identity Verification</Text>
            <Text style={s.verifyBonusText}>
              Get a 50-coin bonus credited to your account after successful verification!
            </Text>
          </View>
          <View style={{ marginBottom: 20 }}>
            <Text style={s.inputLabel}>ID Proof Document URL</Text>
            <TextInput
              style={s.amountInput}
              placeholder="https://example.com/your-id.jpg"
              placeholderTextColor="#A0A0A0"
              value={idProofUrl}
              onChangeText={setIdProofUrl}
              autoCapitalize="none"
            />
          </View>
          <TouchableOpacity style={s.checkboxContainer} onPress={() => setAgreed(!agreed)} activeOpacity={0.8}>
            <View style={[s.checkbox, agreed && s.checkboxActive]}>
              {agreed && <Icon name="checkmark" size={14} color="#FFF" />}
            </View>
            <Text style={s.verifyDisclaimer}>I agree to the Terms of Service regarding identity verification.</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.modalActionBtn, (!idProofUrl || !agreed || isLoading) && s.modalActionBtnDisabled]}
            onPress={handleVerify}
            disabled={!idProofUrl || !agreed || isLoading}
          >
            {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={s.modalActionBtnText}>Submit for Verification</Text>}
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </BottomSheetContainer>
    </Modal>
  );
};

// ─── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  // Header
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  titleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111',
  },
  balancePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#1A1A2E',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 99,
  },
  balancePillText: {
    color: '#FFD700',
    fontSize: 13,
    fontWeight: '700',
  },

  // Package grid
  pkgGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  pkgCard: {
    width: '31%',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E8E8E8',
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 10,
  },
  pkgCardSelected: {
    borderColor: '#E94057',
    boxShadow: '0px 4px 14px rgba(233,64,87,0.3)',
    elevation: 6,
  },
  pkgInner: {
    paddingVertical: 16,
    paddingHorizontal: 10,
    alignItems: 'center',
    gap: 3,
  },
  pkgCoins: {
    fontSize: 22,
    fontWeight: '800',
    color: '#333',
    marginTop: 4,
  },
  pkgCoinsSelected: { color: '#fff' },
  pkgCoinsLabel: {
    fontSize: 11,
    color: '#999',
    fontWeight: '500',
  },
  pkgCoinsLabelSelected: { color: 'rgba(255,255,255,0.8)' },
  pkgDivider: {
    width: '60%',
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.08)',
    marginVertical: 6,
  },
  pkgPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
  },
  pkgPriceSelected: { color: '#fff' },
  pkgLabel: {
    fontSize: 10,
    color: '#AAA',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  pkgLabelSelected: { color: 'rgba(255,255,255,0.7)' },
  popularTag: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#E94057',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    zIndex: 1,
  },
  popularTagText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '700',
  },
  bonusTag: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#7C3AED',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    zIndex: 1,
  },
  bonusTagText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '700',
  },

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
  },
  trustSubtitle: {
    fontSize: 11,
    color: '#4CAF50',
    lineHeight: 15,
    marginTop: 1,
  },

  // Inputs
  inputLabel: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 8 },
  amountInput: {
    borderWidth: 1.5,
    borderColor: '#F0F0F0',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111',
    marginBottom: 16,
    backgroundColor: '#FAFAFA',
    ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}),
  },

  // Action button
  modalActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E94057',
    paddingVertical: 14,
    borderRadius: 14,
    marginBottom: 8,
  },
  modalActionBtnDisabled: { backgroundColor: '#D0D0D0' },
  modalActionBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
  cashoutBtn: { backgroundColor: '#059669' },

  // Cashout
  modalSub: { fontSize: 13, color: '#777', marginBottom: 20 },
  modalSubBold: { fontWeight: '700', color: '#E94057' },
  cashoutNote: {
    fontSize: 12, color: '#6B7280', marginBottom: 16, lineHeight: 18,
    backgroundColor: '#F0FDF4', padding: 10, borderRadius: 10,
  },
  cashoutError: { fontSize: 12, color: '#DC2626', marginBottom: 8, marginTop: -8 },

  // Verify
  verifyIconCircle: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: '#FFF0F3',
    justifyContent: 'center', alignItems: 'center', marginBottom: 16,
  },
  verifyBonusText: {
    fontSize: 14, color: '#4B5563', textAlign: 'center', lineHeight: 20,
    marginTop: 4, paddingHorizontal: 20,
  },
  checkboxContainer: {
    flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 12,
  },
  checkbox: {
    width: 22, height: 22, borderRadius: 6, borderWidth: 2,
    borderColor: '#D1D5DB', justifyContent: 'center', alignItems: 'center',
  },
  checkboxActive: { backgroundColor: '#E94057', borderColor: '#E94057' },
  verifyDisclaimer: { fontSize: 12, color: '#6B7280', flex: 1, lineHeight: 18 },
});
