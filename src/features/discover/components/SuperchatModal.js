import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity,
  TextInput, ActivityIndicator, Platform,
  Dimensions, ScrollView, Animated, Easing,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { useChatStore } from '../../../store/useChatStore';
import { BottomSheetContainer } from '../../../components/common/BottomSheetContainer';
import { useToastStore } from '../../../store/useToastStore';
import { useTheme } from '../../../theme/ThemeContext';

const { width: SCREEN_WIDTH, height } = Dimensions.get('window');

const Section = ({ label, children, theme }) => (
  <View style={s.section}>
    <Text style={[s.sectionLabel, { color: theme.textPrimary }]}>{label}</Text>
    {children}
  </View>
);

// ─── Confetti particle ─────────────────────────────────────────────────
const PARTICLE_COLORS = ['#E94057', '#FFD700', '#7C3AED', '#22C55E', '#0EA5E9', '#F97316', '#EC4899'];

const ConfettiParticle = ({ delay, startX }) => {
  const translateY = useRef(new Animated.Value(-20)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const color = PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)];
  const size = 6 + Math.random() * 6;

  useEffect(() => {
    const drift = (Math.random() - 0.5) * 120;
    const duration = 1400 + Math.random() * 800;

    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(translateY, { toValue: 260 + Math.random() * 80, duration, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(translateX, { toValue: drift, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: duration * 0.9, delay: duration * 0.1, useNativeDriver: true }),
        Animated.timing(rotate, { toValue: 3 + Math.random() * 3, duration, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  const spin = rotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: startX,
        top: 0,
        width: size,
        height: size * 1.4,
        borderRadius: size * 0.3,
        backgroundColor: color,
        opacity,
        transform: [{ translateY }, { translateX }, { rotate: spin }],
      }}
    />
  );
};

// ─── Success celebration overlay ────────────────────────────────────────
const SuccessOverlay = ({ visible, coinAmount, userName, onDone, theme, isDark }) => {
  const scale = useRef(new Animated.Value(0)).current;
  const coinTranslateY = useRef(new Animated.Value(100)).current;
  const coinScale = useRef(new Animated.Value(0.5)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;

    scale.setValue(0);
    coinTranslateY.setValue(150);
    coinScale.setValue(0.5);
    textOpacity.setValue(0);

    // Orchestrated sequence
    Animated.sequence([
      // Container scale-in with spring
      Animated.spring(scale, { toValue: 1, friction: 6, tension: 80, useNativeDriver: true }),

      // Coin shoots up and scales
      Animated.parallel([
        Animated.timing(coinTranslateY, { toValue: 0, duration: 800, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.spring(coinScale, { toValue: 1, friction: 6, tension: 80, useNativeDriver: true }),
      ]),

      // Text reveal
      Animated.timing(textOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),

      // Auto dismiss after pause
      Animated.delay(2200),
    ]).start(() => {
      onDone?.();
    });
  }, [visible]);

  if (!visible) return null;

  // Generate confetti particles
  const particles = Array.from({ length: 30 }, (_, i) => (
    <ConfettiParticle key={i} delay={200 + i * 40} startX={Math.random() * 260 - 50} />
  ));

  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View style={s.successOverlay}>
        <Animated.View style={[s.successCard, { transform: [{ scale }], backgroundColor: 'transparent', elevation: 0, shadowOpacity: 0 }]}>
          {/* Confetti container */}
          <View style={s.confettiWrap}>{particles}</View>

          {/* Coin Animation */}
          <Animated.View
            style={[
              s.successCoinWrap,
              { transform: [{ translateY: coinTranslateY }, { scale: coinScale }] }
            ]}
          >
            <LinearGradient
              colors={['#FFE259', '#FFA751']}
              style={s.coinGradient}
            >
              <Icon name="logo-bitcoin" size={48} color="#fff" />
            </LinearGradient>
          </Animated.View>

          {/* Text */}
          <Animated.View style={{ 
            opacity: textOpacity, 
            alignItems: 'center', 
            marginTop: 20,
            backgroundColor: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.9)',
            paddingHorizontal: 24,
            paddingVertical: 16,
            borderRadius: 24,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 5,
          }}>
            <Text style={[s.successTitle, { color: theme.textPrimary }]}>Superchat Sent!</Text>
            <Text style={[s.successSubtitle, { color: theme.textSecondary }]}>
              Your superchat of{' '}
              <Text style={{ color: isDark ? theme.accent : '#7C3AED', fontWeight: '800' }}>{coinAmount} coins</Text>
              {' '}has been sent to {userName}
            </Text>
          </Animated.View>
        </Animated.View>
      </View>
    </Modal>
  );
};

// ─── Main component ─────────────────────────────────────────────────────
export const SuperchatModal = ({ visible, onClose, user }) => {
  const [message, setMessage] = useState('');
  const [coinAmount, setCoinAmount] = useState('500');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successInfo, setSuccessInfo] = useState({ coins: 0, name: '' });
  const { wallet, sendSuperchat, fetchWalletBalance, setDepositModalVisible } = useChatStore();
  const { theme, isDark } = useTheme();
  const { showToast } = useToastStore();

  React.useEffect(() => {
    if (visible) {
      fetchWalletBalance();
    }
  }, [visible, fetchWalletBalance]);

  const handleSendSuperchat = async () => {
    if (!message.trim()) {
      showToast({ title: 'Missing Message', text: 'Please enter a message.', type: 'error' });
      return;
    }

    const amount = parseInt(coinAmount, 10);
    if (isNaN(amount) || amount <= 0) {
      showToast({ title: 'Invalid Amount', text: 'Please enter a valid coin amount.', type: 'error' });
      return;
    }

    if (wallet.coins < amount) {
      showToast({ title: 'Insufficient Coins', text: 'Please top up your wallet.', type: 'error' });
      return;
    }

    setIsLoading(true);
    try {
      await sendSuperchat(user.id || user._id, message, amount);
      setIsLoading(false);
      // Show the celebration animation
      setSuccessInfo({
        coins: amount,
        name: user?.fullName || user?.name || 'User',
      });
      setShowSuccess(true);
    } catch (error) {
      setIsLoading(false);
      showToast({ title: 'Failed', text: error.message || 'Failed to send superchat', type: 'error' });
    }
  };

  const handleSuccessDone = () => {
    setShowSuccess(false);
    onClose();
    setMessage('');
    setCoinAmount('500');
  };

  return (
    <>
      <Modal
        visible={visible}
        transparent
        animationType="none"
        onRequestClose={onClose}
      >
        <BottomSheetContainer
          height={height * 0.85}
          onClose={onClose}
        >
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
            <View style={s.headerRow}>
              <TouchableOpacity style={[s.backButton, { backgroundColor: theme.cardBackground, borderColor: theme.actionButtonBorder }]} onPress={onClose}>
                <Icon name="chevron-back" size={22} color={theme.textPrimary} />
              </TouchableOpacity>
              <View style={{ flex: 1, alignItems: 'center', marginRight: 44 }}>
                <Text style={[s.title, { color: theme.textPrimary }]}>Send Superchat</Text>
              </View>
            </View>

            <Text style={[s.subtitle, { color: theme.textSecondary }]}>Direct message to {user?.fullName || user?.name || 'User'}</Text>

            <View style={[s.promoBanner, isDark && { backgroundColor: theme.surface }]}>
              <Icon name="shield-checkmark" size={20} color={isDark ? theme.accent : '#E94057'} />
              <Text style={[s.promoText, isDark && { color: theme.accent }]}>Send a Superchat. If you don't get a reply, you'll get a full refund!</Text>
            </View>

            <Section label="Your Balance" theme={theme}>
              <View style={[s.balanceCard, { backgroundColor: theme.inputBackground }]}>
                <View style={s.coinsBadge}>
                  <Icon name="logo-bitcoin" size={16} color="#FFD700" />
                  <Text style={[s.coinsText, { color: theme.textPrimary }]}>{wallet.coins} Coins</Text>
                </View>
                <TouchableOpacity onPress={() => {
                  onClose();
                  setDepositModalVisible(true);
                }}>
                  <Text style={[s.topUpBtn, isDark && { color: theme.accent }]}>Top Up</Text>
                </TouchableOpacity>
              </View>
            </Section>

            <Section label="Superchat Amount" theme={theme}>
              <View style={[s.inputContainer, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder }]}>
                <Icon name="flash" size={20} color={isDark ? theme.accent : "#7C3AED"} style={s.inputIcon} />
                <TextInput
                  style={[s.amountInput, { color: theme.textPrimary }]}
                  placeholder="Enter amount"
                  keyboardType="numeric"
                  value={coinAmount}
                  onChangeText={setCoinAmount}
                  placeholderTextColor={theme.textSecondary}
                />
                <Text style={{ fontWeight: '600', color: isDark ? theme.accent : '#E94057' }}>Coins</Text>
              </View>
            </Section>

            <Section label="Your Message" theme={theme}>
              <TextInput
                style={[s.textArea, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, color: theme.textPrimary }]}
                placeholder="Say something nice..."
                multiline
                numberOfLines={4}
                value={message}
                onChangeText={setMessage}
                placeholderTextColor={theme.textSecondary}
              />
            </Section>

            <TouchableOpacity
              style={s.sendBtnWrap}
              onPress={handleSendSuperchat}
              disabled={isLoading || !message.trim()}
            >
              <LinearGradient
                colors={['#E94057', '#8A2387']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={s.sendBtn}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Text style={s.sendBtnText}>Send Superchat</Text>
                    <Icon name="flash" size={18} color="#fff" />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        </BottomSheetContainer>
      </Modal>

      {/* Success celebration */}
      <SuccessOverlay
        visible={showSuccess}
        coinAmount={successInfo.coins}
        userName={successInfo.name}
        onDone={handleSuccessDone}
        theme={theme}
        isDark={isDark}
      />
    </>
  );
};

const FONT = Platform.OS === 'ios' ? 'System' : 'sans-serif';
const FONT_MED = Platform.OS === 'ios' ? 'System' : 'sans-serif-medium';

const s = StyleSheet.create({
  scroll: { paddingBottom: 40 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    fontFamily: FONT_MED,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    fontFamily: FONT,
  },
  promoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0F3',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    gap: 10,
  },
  promoText: {
    flex: 1,
    fontSize: 13,
    color: '#E94057',
    fontWeight: '600',
    lineHeight: 18,
  },
  amountDisplay: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  amountValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  amountValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#E94057',
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111',
    marginBottom: 12,
    fontFamily: FONT_MED,
  },
  balanceCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    padding: 16,
    borderRadius: 16,
  },
  coinsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  coinsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    fontFamily: FONT_MED,
  },
  topUpBtn: {
    fontSize: 14,
    color: '#E94057',
    fontWeight: '600',
    fontFamily: FONT_MED,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#F0F0F0',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: { marginRight: 12 },
  amountInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    fontFamily: FONT,
  },
  textArea: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#F0F0F0',
    borderRadius: 16,
    padding: 16,
    height: 120,
    textAlignVertical: 'top',
    fontSize: 15,
    color: '#333',
    fontFamily: FONT,
  },
  sendBtnWrap: {
    borderRadius: 100,
    overflow: 'hidden',
    marginTop: 8,
  },
  sendBtn: {
    height: 56,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  sendBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    fontFamily: FONT_MED,
  },

  // ─── Success overlay ──────────────────────────────────
  successOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successCard: {
    backgroundColor: '#fff',
    borderRadius: 28,
    width: Math.min(SCREEN_WIDTH * 0.82, 340),
    paddingVertical: 40,
    paddingHorizontal: 28,
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 20,
  },
  confettiWrap: {
    position: 'absolute',
    top: 0,
    left: 40,
    right: 40,
    height: 0,
    overflow: 'visible',
    zIndex: 10,
  },
  successCoinWrap: {
    marginBottom: 20,
    borderRadius: 48,
    backgroundColor: '#FFA751',
    shadowColor: '#FFA751',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 15,
  },
  coinGradient: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111',
    marginBottom: 8,
    fontFamily: FONT_MED,
  },
  successSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    fontFamily: FONT,
  },
});

