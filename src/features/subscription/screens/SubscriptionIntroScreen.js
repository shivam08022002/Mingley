import React from 'react';
import {
  View, Text, StyleSheet,
  TouchableOpacity, Dimensions, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image as FastImage } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../theme/ThemeContext';

const { width, height } = Dimensions.get('window');

const PERKS = [
  { icon: 'heart', label: 'Unlimited Likes', desc: 'Swipe as much as you want without daily constraints' },
  { icon: 'eye-off', label: 'Incognito Mode', desc: 'Browse profiles privately without letting others know' },
  { icon: 'sparkles', label: 'Top Picks Daily', desc: 'Access handpicked profiles curated just for you' },
  { icon: 'options', label: 'Advanced Filters', desc: 'Find matches using nearby, online, and verified filters' },
];

export const SubscriptionIntroScreen = ({ navigation }) => {
  const { isDark, theme } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {!isDark && (
        <LinearGradient
          colors={['#FFF5F6', '#F8FAFC', '#F1F5F9']}
          style={StyleSheet.absoluteFillObject}
        />
      )}

      {/* Back button */}
      <TouchableOpacity style={[styles.backBtn, { backgroundColor: isDark ? theme.cardBackground : '#FFF' }]} onPress={() => navigation.goBack()}>
        <Icon name="chevron-back" size={22} color={theme.textPrimary} />
      </TouchableOpacity>

      {/* Hero illustration */}
      <View style={styles.heroWrap}>
        <View style={[styles.glowCircle1, { backgroundColor: isDark ? '#2D1F3D' : '#FFF0F2' }]} />
        <View style={[styles.glowCircle2, { backgroundColor: isDark ? '#3B1F3D' : '#EBE9FF' }]} />
        <FastImage
          source={require('../../../assets/Hello-User.png')}
          style={styles.heroImg}
          contentFit="contain"
        />
      </View>

      {/* Bottom card */}
      <View style={[styles.card, { backgroundColor: isDark ? theme.surface : '#FFFFFF', borderColor: isDark ? theme.border : '#FFF1F3' }]}>
        <View style={styles.badgeContainer}>
          <View style={[styles.eyebrowBadge, { backgroundColor: isDark ? 'rgba(211, 42, 94, 0.15)' : '#FFF0F2', borderColor: isDark ? theme.primary : '#FFE0E5' }]}>
            <Icon name="sparkles" size={10} color={theme.primary} style={{ marginRight: 4 }} />
            <Text style={[styles.eyebrowText, { color: theme.primary }]}>MINGLEY PREMIUM</Text>
          </View>
        </View>

        <Text style={[styles.title, { color: theme.textPrimary }]}>Say Hello to{'\n'}Premium!</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Get full access to all features and find your perfect match without limits.
        </Text>

        {/* Perks list */}
        <View style={styles.perksList}>
          {PERKS.map((p) => (
            <View key={p.label} style={[styles.perkItem, { backgroundColor: isDark ? theme.cardBackground : '#FFF8F9', borderColor: isDark ? theme.border : '#FFEBEF' }]}>
              <View style={styles.perkIconWrap}>
                <LinearGradient
                  colors={isDark ? ['rgba(211, 42, 94, 0.2)', 'rgba(211, 42, 94, 0.1)'] : ['#FFF0F2', '#FFE5EC']}
                  style={styles.perkIconGrad}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                >
                  <Icon name={p.icon} size={18} color={theme.primary} />
                </LinearGradient>
              </View>
              <View style={styles.perkTextWrap}>
                <Text style={[styles.perkLabel, { color: theme.textPrimary }]}>{p.label}</Text>
                <Text style={[styles.perkDesc, { color: theme.textSecondary }]}>{p.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* CTA */}
        <TouchableOpacity
          style={styles.ctaWrap}
          onPress={() => navigation.navigate('SubscriptionPlans')}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={isDark ? ['#D32A5E', '#8A2387'] : ['#E94057', '#8A2387']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={styles.ctaBtn}
          >
            <Text style={styles.ctaText}>View Plans</Text>
            <Icon name="arrow-forward" size={18} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.skipBtn}>
          <Text style={[styles.skipText, { color: theme.textSecondary }]}>Maybe later</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const FONT = Platform.OS === 'ios' ? 'System' : 'sans-serif';
const FONT_MED = Platform.OS === 'ios' ? 'System' : 'sans-serif-medium';

const styles = StyleSheet.create({
  container: { flex: 1 },
  backBtn: {
    position: 'absolute', top: 56, left: 20, zIndex: 10,
    width: 42, height: 42, borderRadius: 14,
    backgroundColor: '#FFF',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 6, elevation: 3,
  },
  heroWrap: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    paddingTop: 60,
    position: 'relative',
  },
  glowCircle1: {
    position: 'absolute',
    width: width * 0.65,
    height: width * 0.65,
    borderRadius: (width * 0.65) / 2,
    backgroundColor: '#FFF0F2',
    opacity: 0.8,
  },
  glowCircle2: {
    position: 'absolute',
    width: width * 0.5,
    height: width * 0.5,
    borderRadius: (width * 0.5) / 2,
    backgroundColor: '#EBE9FF',
    opacity: 0.5,
  },
  heroImg: { width: width * 0.7, height: width * 0.7, zIndex: 1 },
  card: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    borderTopWidth: 1.5,
    borderColor: '#FFF1F3',
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 40,
    shadowColor: '#E94057',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: -10 },
    shadowRadius: 20,
    elevation: 8,
  },
  badgeContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  eyebrowBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0F2',
    borderWidth: 1,
    borderColor: '#FFE0E5',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 100,
  },
  eyebrowText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#E94057',
    letterSpacing: 1.2,
  },
  title: {
    fontSize: 28, fontWeight: '800', color: '#0F172A',
    fontFamily: FONT_MED, textAlign: 'center', lineHeight: 36,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14, color: '#64748B', textAlign: 'center',
    lineHeight: 21, fontFamily: FONT, marginBottom: 24,
  },
  perksList: {
    gap: 12,
    marginBottom: 28,
  },
  perkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8F9',
    borderRadius: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FFEBEF',
  },
  perkIconWrap: {
    marginRight: 14,
  },
  perkIconGrad: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  perkTextWrap: {
    flex: 1,
  },
  perkLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: FONT_MED,
  },
  perkDesc: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: FONT,
    marginTop: 2,
  },
  ctaWrap: { borderRadius: 20, overflow: 'hidden', marginBottom: 12 },
  ctaBtn: {
    height: 56, flexDirection: 'row',
    justifyContent: 'center', alignItems: 'center', gap: 10,
  },
  ctaText: { fontSize: 16, fontWeight: '800', color: '#fff', fontFamily: FONT_MED },
  skipBtn: { alignItems: 'center', paddingVertical: 6 },
  skipText: { fontSize: 13, color: '#64748B', fontFamily: FONT, fontWeight: '600' },
});
