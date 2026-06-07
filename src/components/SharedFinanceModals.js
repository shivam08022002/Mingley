import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Modal, Alert, KeyboardAvoidingView, Platform,
  ActivityIndicator, ScrollView, Dimensions, Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { useChatStore } from '../store/useChatStore';
import { BottomSheetContainer } from './common/BottomSheetContainer';
import { walletService, userService } from '../services/apiServices';
import { useProfileStore } from '../features/profile/store/useProfileStore';
import { useToastStore } from '../store/useToastStore';
import { useTheme } from '../theme/ThemeContext';

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
  const { profile } = useProfileStore();
  const { theme, isDark } = useTheme();

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
            color: isDark ? '#F6DCA0' : '#E94057',
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
          theme: { color: isDark ? '#F6DCA0' : '#E94057' },
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
    pkg_100: ['#6B7280', '#374151'],
    pkg_300: ['#E94057', '#8A2387'],
    pkg_700: ['#F59E0B', '#D97706'],
    pkg_1500: ['#7C3AED', '#4C1D95'],
    pkg_5000: ['#059669', '#064E3B'],
  };

  const screenHeight = Dimensions.get('window').height;
  const modalHeight = screenHeight < 700 ? Math.min(screenHeight * 0.78, 560) : 700;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <BottomSheetContainer onClose={onClose} height={modalHeight}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ width: '100%', flex: 1 }}
        >
          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {/* Header */}
            <View style={s.headerRow}>
              <View style={s.titleWrap}>
                <Icon name="wallet" size={20} color={theme.accent} />
                <Text style={[s.modalTitle, { color: theme.textPrimary }]}>Top Up Coins</Text>
              </View>
              <View style={[s.balancePill, isDark && { backgroundColor: theme.cardBackground, borderWidth: 1.5, borderColor: theme.accent }]}>
                <Icon name="logo-bitcoin" size={13} color="#FFD700" />
                <Text style={s.balancePillText}>{wallet.coins} coins</Text>
              </View>
            </View>

            {/* Package grid */}
            {loadingPkgs ? (
              <ActivityIndicator color={theme.accent} style={{ marginVertical: 30 }} />
            ) : (
              <View style={s.pkgGrid}>
                {packages.map((pkg) => {
                  const isSelected = selectedPkg?.id === pkg.id;
                  const gradColors = isDark ? ['#F6DCA0', '#D4AF37'] : (PACKAGE_GRADIENTS[pkg.id] || ['#E94057', '#8A2387']);
                  return (
                    <TouchableOpacity
                      key={pkg.id}
                      style={[s.pkgCard, { borderColor: isDark ? theme.actionButtonBorder : '#E8E8E8' }, isSelected && [s.pkgCardSelected, { borderColor: theme.accent }]]}
                      onPress={() => setSelectedPkg(pkg)}
                      activeOpacity={0.85}
                    >
                      {pkg.isPopular && (
                        <View style={[s.popularTag, isDark && { backgroundColor: theme.accent }]}>
                          <Text style={[s.popularTagText, isDark && { color: '#0A0A0A' }]}>⭐ Popular</Text>
                        </View>
                      )}
                      {pkg.badge && !pkg.isPopular && (
                        <View style={[s.bonusTag, isDark && { backgroundColor: theme.accent }]}>
                          <Text style={[s.bonusTagText, isDark && { color: '#0A0A0A' }]}>{pkg.badge}</Text>
                        </View>
                      )}
                      <LinearGradient
                        colors={isSelected ? gradColors : (isDark ? [theme.cardBackground, theme.cardBackground] : ['#F8F8F8', '#F0F0F0'])}
                        style={s.pkgInner}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                      >
                        <Icon
                          name="logo-bitcoin"
                          size={22}
                          color={isSelected ? (isDark ? '#0A0A0A' : '#FFD700') : theme.textSecondary}
                        />
                        <Text style={[s.pkgCoins, { color: theme.textPrimary }, isSelected && [s.pkgCoinsSelected, { color: isDark ? '#0A0A0A' : '#fff' }]]}>
                          {pkg.coins}
                        </Text>
                        <Text style={[s.pkgCoinsLabel, { color: theme.textSecondary }, isSelected && [s.pkgCoinsLabelSelected, { color: isDark ? '#0A0A0A' : 'rgba(255,255,255,0.8)' }]]}>
                          coins
                        </Text>
                        <View style={[s.pkgDivider, { backgroundColor: isDark ? theme.actionButtonBorder : 'rgba(0,0,0,0.08)' }]} />
                        <Text style={[s.pkgPrice, { color: theme.textPrimary }, isSelected && [s.pkgPriceSelected, { color: isDark ? '#0A0A0A' : '#fff' }]]}>
                          ₹{pkg.price}
                        </Text>
                        <Text style={[s.pkgLabel, { color: theme.textSecondary }, isSelected && [s.pkgLabelSelected, { color: isDark ? 'rgba(10,10,10,0.8)' : 'rgba(255,255,255,0.7)' }]]}>
                          {pkg.label}
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {/* Secure Trust Indicator */}
            <View style={[
              s.trustBanner,
              isDark && {
                backgroundColor: 'rgba(76, 175, 80, 0.15)',
                borderColor: 'rgba(76, 175, 80, 0.3)',
              }
            ]}>
              <Icon name="shield-checkmark" size={22} color={isDark ? '#4CAF50' : '#2E7D32'} />
              <View style={{ flex: 1 }}>
                <Text style={[s.trustTitle, isDark && { color: '#4CAF50' }]}>100% Secure Checkout</Text>
                <Text style={[s.trustSubtitle, isDark && { color: '#81C784' }]}>Your transaction is encrypted & securely processed via Razorpay.</Text>
              </View>
            </View>

            {/* Submit */}
            <TouchableOpacity
              style={[
                s.modalActionBtn,
                { backgroundColor: theme.accent },
                (!selectedPkg || submitting) && s.modalActionBtnDisabled,
              ]}
              onPress={handleDepositSubmit}
              disabled={!selectedPkg || submitting}
            >
              {submitting ? (
                <ActivityIndicator color={isDark ? '#0A0A0A' : '#fff'} />
              ) : (
                <>
                  <Icon name="lock-closed" size={16} color={isDark ? '#0A0A0A' : '#fff'} style={{ marginRight: 8 }} />
                  <Text style={[s.modalActionBtnText, { color: isDark ? '#0A0A0A' : '#fff' }]}>
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
  const { theme, isDark } = useTheme();

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
          <Text style={[s.modalTitle, { color: theme.textPrimary }]}>Withdraw Coins</Text>
          <Text style={[s.modalSub, { color: theme.textSecondary }]}>Available: <Text style={[s.modalSubBold, { color: theme.accent }]}>{wallet.coins} coins</Text></Text>
          <View style={[s.cashoutNote, isDark && { backgroundColor: 'rgba(5, 150, 105, 0.15)' }]}>
            <Text style={{ fontSize: 12, color: isDark ? '#34D399' : '#6B7280', lineHeight: 18 }}>Rs 1 per coin will be credited within 3-5 business days.</Text>
          </View>
          <TextInput
            style={[s.amountInput, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, color: theme.textPrimary }]}
            placeholder="Bank Details or UPI ID"
            placeholderTextColor="#A0A0A0"
            value={bankOrUpiText}
            onChangeText={setBankOrUpiText}
          />
          <TextInput
            style={[s.amountInput, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, color: theme.textPrimary }]}
            placeholder="Enter coins to withdraw"
            placeholderTextColor="#A0A0A0"
            keyboardType="numeric"
            value={cashoutInputText}
            onChangeText={setCashoutInputText}
          />
          {cashoutInputText !== '' && parseInt(cashoutInputText, 10) > wallet.coins && (
            <Text style={s.cashoutError}>Insufficient coins.</Text>
          )}
          <TouchableOpacity
            style={[s.modalActionBtn, { backgroundColor: isDark ? theme.accent : '#059669' }, (!cashoutInputText || parseInt(cashoutInputText, 10) > wallet.coins || !bankOrUpiText) && s.modalActionBtnDisabled]}
            onPress={handleWithdraw}
            disabled={!cashoutInputText || parseInt(cashoutInputText, 10) > wallet.coins || !bankOrUpiText}
          >
            <Icon name="wallet-outline" size={16} color={isDark ? '#0A0A0A' : '#FFF'} style={{ marginRight: 6 }} />
            <Text style={[s.modalActionBtnText, { color: isDark ? '#0A0A0A' : '#FFF' }]}>Withdraw</Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </BottomSheetContainer>
    </Modal>
  );
};

// ─── Verify Modal ──────────────────────────────────────────────────────────────
export const VerifyModal = ({ visible, onClose }) => {
  const [selfieUrl, setSelfieUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const { theme, isDark } = useTheme();

  const handleVerify = async () => {
    if (!selfieUrl) { Alert.alert('Error', 'Please take a selfie to verify your identity.'); return; }
    if (!agreed) { Alert.alert('Error', 'Please agree to the Terms of Service to proceed.'); return; }
    setIsLoading(true);
    try {
      await userService.verifyAccount({ idProofUrl: selfieUrl });
      Alert.alert('Success', 'Verification request submitted! A 50-coin bonus will be credited once approved.');
      onClose();
      setSelfieUrl(null);
      setAgreed(false);
    } catch (error) {
      const rawMsg = error.message || 'Verification failed';
      const cleanMsg = rawMsg
        .replace(/[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u200d|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c[\udc04-\udc0f]|\ud83c[\udd10-\udd2f]|\ud83c[\udf00-\udfff]|\ud83d[\udc00-\ude4f]|\ud83d[\ude80-\udeff]|\ud83e[\udd00-\uddff]|\ufe0f|\xa0/g, '')
        .replace(/\s+/g, ' ')
        .trim();
      useToastStore.getState().showToast(cleanMsg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <BottomSheetContainer onClose={onClose} height={580}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : ''} style={{ width: '100%', flex: 1, paddingHorizontal: 20 }}>
          <View style={{ alignItems: 'center', marginVertical: 25 }}>
            <View style={[s.verifyIconCircle, { backgroundColor: theme.iconWrapBackground }]}>
              <Icon name="shield-checkmark" size={42} color={theme.accent} />
            </View>
            <Text style={[s.modalTitle, { color: theme.textPrimary }]}>Identity Verification</Text>
            <Text style={[s.verifyBonusText, { color: theme.textSecondary }]}>
              Get a 50-coin bonus credited to your account after successful verification!
            </Text>
          </View>
          
          <View style={{ alignItems: 'center', marginBottom: 20, width: '100%' }}>
            <Text style={[s.inputLabel, { color: theme.textSecondary, alignSelf: 'flex-start', marginBottom: 10 }]}>Selfie Verification</Text>
            {selfieUrl ? (
              <View style={{ alignItems: 'center' }}>
                <Image
                  source={{ uri: selfieUrl }}
                  style={{ width: 120, height: 120, borderRadius: 60, borderWidth: 3, borderColor: theme.accent, marginBottom: 10 }}
                />
                <TouchableOpacity 
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, backgroundColor: theme.iconWrapBackground }}
                  onPress={() => setSelfieUrl(null)}
                >
                  <Icon name="camera-reverse-outline" size={14} color={theme.accent} />
                  <Text style={{ color: theme.accent, fontSize: 12, fontWeight: '600' }}>Retake Selfie</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => {
                  setIsLoading(true);
                  // Mock camera capture timeout
                  setTimeout(() => {
                    setSelfieUrl('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80');
                    setIsLoading(false);
                  }, 800);
                }}
                style={{
                  width: '100%',
                  height: 120,
                  borderRadius: 18,
                  borderWidth: 2,
                  borderStyle: 'dashed',
                  borderColor: isDark ? theme.accent : '#D1D5DB',
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: theme.inputBackground,
                }}
                activeOpacity={0.8}
              >
                <Icon name="camera" size={32} color={isDark ? theme.accent : '#9CA3AF'} style={{ marginBottom: 6 }} />
                <Text style={{ fontSize: 13, color: theme.textSecondary, fontWeight: '600' }}>Tap to Take Selfie</Text>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity style={s.checkboxContainer} onPress={() => setAgreed(!agreed)} activeOpacity={0.8}>
            <View style={[s.checkbox, { borderColor: isDark ? theme.accent : '#D1D5DB' }, agreed && [s.checkboxActive, { backgroundColor: theme.accent, borderColor: theme.accent }]]}>
              {agreed && <Icon name="checkmark" size={14} color={isDark ? '#0A0A0A' : '#FFF'} />}
            </View>
            <Text style={[s.verifyDisclaimer, { color: theme.textSecondary }]}>I agree to the Terms of Service regarding identity verification.</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.modalActionBtn, { backgroundColor: theme.accent }, (!selfieUrl || !agreed || isLoading) && s.modalActionBtnDisabled]}
            onPress={handleVerify}
            disabled={!selfieUrl || !agreed || isLoading}
          >
            {isLoading ? <ActivityIndicator color={isDark ? '#0A0A0A' : '#fff'} /> : <Text style={[s.modalActionBtnText, { color: isDark ? '#0A0A0A' : '#fff' }]}>Submit for Verification</Text>}
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
    paddingVertical: 22,
    paddingHorizontal: 10,
    alignItems: 'center',
    gap: 4,
  },
  pkgCoins: {
    fontSize: 26,
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
    fontSize: 18,
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
