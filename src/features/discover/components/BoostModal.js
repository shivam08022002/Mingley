import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity,
  Dimensions, Platform, TouchableWithoutFeedback, Animated, Easing,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../../theme/ThemeContext';
import { useToastStore } from '../../../store/useToastStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const BOOST_PACKAGES = [
  { id: '1_boost', count: 1, label: 'Boost', price: '₹249/ea', saveText: null },
  { id: '5_boosts', count: 5, label: 'Boosts', price: '₹199/ea', saveText: 'SAVE 20%', isPopular: true },
  { id: '10_boosts', count: 10, label: 'Boosts', price: '₹149/ea', saveText: null },
];

export const BoostModal = ({ visible, onClose }) => {
  const { theme, isDark } = useTheme();
  const { showToast } = useToastStore();
  const [selectedId, setSelectedId] = useState('5_boosts');
  const [renderModal, setRenderModal] = useState(visible);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.92)).current;
  const translateYAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    if (visible) {
      setRenderModal(true);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 65,
          useNativeDriver: true,
        }),
        Animated.spring(translateYAnim, {
          toValue: 0,
          friction: 8,
          tension: 65,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 180,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.94,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(translateYAnim, {
          toValue: 30,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setRenderModal(false);
      });
    }
  }, [visible]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 180,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.94,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(translateYAnim, {
        toValue: 30,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setRenderModal(false);
      onClose();
    });
  };

  const handleBoostMe = () => {
    const selectedPkg = BOOST_PACKAGES.find(p => p.id === selectedId);
    showToast({
      title: 'Boost Activated! ⚡️',
      text: `Your profile boost for ${selectedPkg?.count || 1} boost(s) has been activated. You're now top profile in your area!`,
      type: 'success',
    });
    handleClose();
  };

  if (!renderModal) return null;

  const accentColor = isDark ? (theme.accent || '#F6DCA0') : '#E94057';
  const headerGradient = isDark
    ? ['#1F1A24', '#2D1F3D', '#151419']
    : ['#E94057', '#8A2387', '#7C3AED'];

  return (
    <Modal
      visible={renderModal}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <Animated.View style={[s.modalOverlay, { opacity: fadeAnim }]}>
          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                s.container,
                {
                  backgroundColor: isDark ? theme.cardBackground : '#FFFFFF',
                  borderColor: isDark ? 'rgba(246, 220, 160, 0.3)' : 'rgba(0, 0, 0, 0.08)',
                  borderWidth: isDark ? 1.5 : 1,
                  transform: [{ scale: scaleAnim }, { translateY: translateYAnim }],
                },
              ]}
            >
              {/* Close button */}
              <TouchableOpacity style={s.closeButton} onPress={handleClose} activeOpacity={0.8}>
                <Icon name="close" size={20} color="#FFFFFF" />
              </TouchableOpacity>

              {/* ─── Top Gradient Banner ──────────────────────── */}
              <LinearGradient
                colors={headerGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={s.topBanner}
              >
                {/* Floating Flash Graphic */}
                <View style={s.floatingHeartWrap}>
                  <Icon name="flash" size={26} color={isDark ? accentColor : '#FFFFFF'} />
                </View>

                {/* Main 10.0x Badge */}
                <View style={[s.badgeOuterRing, { backgroundColor: isDark ? 'rgba(246, 220, 160, 0.25)' : 'rgba(255, 255, 255, 0.25)' }]}>
                  <View style={[s.badgeInnerCircle, { backgroundColor: isDark ? '#1B1A22' : '#FFFFFF', borderColor: isDark ? accentColor : 'transparent', borderWidth: isDark ? 1.5 : 0 }]}>
                    <Text style={[s.multiplierText, { color: isDark ? accentColor : '#E94057' }]}>10.0x</Text>
                    <Text style={[s.viewsLabel, { color: isDark ? accentColor : '#8B5CF6' }]}>VIEWS</Text>
                  </View>
                </View>

                {/* Title & Description */}
                <Text style={[s.title, isDark && { color: theme.textPrimary }]}>Skip The Line</Text>
                <Text style={[s.description, isDark && { color: theme.textSecondary }]}>
                  Be the top profile in your area for 30 minutes and get more matches
                </Text>
              </LinearGradient>

              {/* ─── Packages Container ─────────────────────────────── */}
              <View style={s.packagesWrapper}>
                {BOOST_PACKAGES.map((pkg) => {
                  const isSelected = selectedId === pkg.id;

                  return (
                    <TouchableOpacity
                      key={pkg.id}
                      activeOpacity={0.9}
                      onPress={() => setSelectedId(pkg.id)}
                      style={[
                        s.packageCard,
                        {
                          backgroundColor: isDark
                            ? (isSelected ? 'rgba(246, 220, 160, 0.14)' : '#1B1A22')
                            : (isSelected ? '#FFF0F3' : '#F9FAFB'),
                          borderColor: isSelected ? accentColor : (isDark ? 'rgba(255,255,255,0.08)' : '#E5E7EB'),
                          borderWidth: isSelected ? 2 : 1,
                        },
                        isSelected && (isDark ? s.selectedCardShadowDark : s.selectedCardShadow),
                      ]}
                    >
                      {/* Save Badge Header */}
                      {pkg.saveText ? (
                        <View style={[s.saveBadge, { backgroundColor: accentColor }]}>
                          <Text style={[s.saveBadgeText, isDark && { color: '#111827' }]}>{pkg.saveText}</Text>
                        </View>
                      ) : (
                        <View style={s.badgePlaceholder} />
                      )}

                      {/* Count */}
                      <Text
                        style={[
                          s.countText,
                          { color: isSelected ? accentColor : (isDark ? theme.textPrimary : '#111827') }
                        ]}
                      >
                        {pkg.count}
                      </Text>

                      {/* Label */}
                      <Text
                        style={[
                          s.labelText,
                          { color: isSelected ? accentColor : (isDark ? theme.textSecondary : '#6B7280') }
                        ]}
                      >
                        {pkg.label}
                      </Text>

                      {/* Price */}
                      <Text
                        style={[
                          s.priceText,
                          { color: isSelected ? accentColor : (isDark ? theme.textPrimary : '#111827') }
                        ]}
                      >
                        {pkg.price}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* ─── Action Buttons ──────────────────────────────────── */}
              <View style={s.actionSection}>
                <TouchableOpacity
                  activeOpacity={0.88}
                  onPress={handleBoostMe}
                  style={[
                    s.boostMeBtnWrap,
                    {
                      backgroundColor: isDark ? (theme.accent || '#F6DCA0') : '#E94057',
                      shadowColor: isDark ? (theme.accent || '#F6DCA0') : '#E94057',
                      shadowOpacity: 0.35,
                      shadowRadius: 10,
                    },
                  ]}
                >
                  <View style={s.boostMeBtn}>
                    <Text style={[s.boostMeText, { color: isDark ? '#0D0D12' : '#FFFFFF', fontWeight: '900' }]}>
                      BOOST ME
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={handleClose}
                  style={s.noThanksBtn}
                >
                  <Text style={[s.noThanksText, { color: isDark ? theme.textSecondary : '#9CA3AF' }]}>
                    NO, THANKS
                  </Text>
                </TouchableOpacity>
              </View>

            </Animated.View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const FONT = Platform.OS === 'ios' ? 'System' : 'sans-serif';
const FONT_BOLD = Platform.OS === 'ios' ? 'System' : 'sans-serif-medium';

const s = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 18,
  },
  container: {
    width: Math.min(SCREEN_WIDTH - 36, 375),
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 14,
    right: 14,
    zIndex: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ── Top Banner ─────────────────────────────────────────────────────────────
  topBanner: {
    paddingTop: 30,
    paddingBottom: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    position: 'relative',
  },
  floatingHeartWrap: {
    position: 'absolute',
    top: 12,
    alignSelf: 'center',
    opacity: 0.85,
  },
  badgeOuterRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  badgeInnerCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    justifyContent: 'center',
    alignItems: 'center',
  },
  multiplierText: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.5,
    fontFamily: FONT_BOLD,
  },
  viewsLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginTop: -2,
    fontFamily: FONT_BOLD,
  },
  title: {
    fontSize: 21,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 5,
    fontFamily: FONT_BOLD,
  },
  description: {
    fontSize: 12.5,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.88)',
    textAlign: 'center',
    lineHeight: 18,
    fontFamily: FONT,
    paddingHorizontal: 8,
  },

  // ── Packages Section ────────────────────────────────────────────────────────
  packagesWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 14,
    gap: 8,
  },
  packageCard: {
    flex: 1,
    borderRadius: 16,
    alignItems: 'center',
    paddingBottom: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  selectedCardShadow: {
    shadowColor: '#E94057',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 8,
  },
  selectedCardShadowDark: {
    shadowColor: '#F6DCA0',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  saveBadge: {
    width: '100%',
    paddingVertical: 4,
    alignItems: 'center',
    marginBottom: 8,
  },
  saveBadgeText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  badgePlaceholder: {
    height: 22,
    marginBottom: 8,
  },
  countText: {
    fontSize: 26,
    fontWeight: '800',
    fontFamily: FONT_BOLD,
    marginBottom: 0,
  },
  labelText: {
    fontSize: 11.5,
    fontWeight: '600',
    fontFamily: FONT,
    marginBottom: 6,
  },
  priceText: {
    fontSize: 11.5,
    fontWeight: '700',
    fontFamily: FONT_BOLD,
  },

  // ── Action Section ──────────────────────────────────────────────────────────
  actionSection: {
    paddingHorizontal: 18,
    paddingBottom: 18,
    alignItems: 'center',
  },
  boostMeBtnWrap: {
    width: '100%',
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#FF4D6D',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
    marginBottom: 10,
  },
  boostMeBtn: {
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  boostMeText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 1.1,
    fontFamily: FONT_BOLD,
  },
  noThanksBtn: {
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  noThanksText: {
    fontSize: 11.5,
    fontWeight: '700',
    letterSpacing: 1,
    fontFamily: FONT_BOLD,
  },
});
