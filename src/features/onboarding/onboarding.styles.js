import { StyleSheet, Dimensions, Platform } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../../constants/theme';

const { width, height } = Dimensions.get('window');
const FONT_BOLD = Platform.OS === 'ios' ? 'AvenirNext-Bold' : 'sans-serif-medium';
const FONT = Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif';

export const styles = StyleSheet.create({
  // ─── Splash Screen ─────────────────────────────
  splashContainer: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 250,
    height: 100,
  },

  // ─── Get Started Screen ────────────────────────
  getStartedContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  startedBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerLogoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -40,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  circleLogo: {
    width: 140,
    height: 60,
  },
  getStartedFooter: {
    position: 'absolute',
    bottom: SPACING.xl * 2,
    alignSelf: 'center',
  },
  getStartedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.m,
    paddingHorizontal: SPACING.xl,
  },
  getStartedText: {
    ...TYPOGRAPHY.h2,
    color: COLORS.primary,
    fontWeight: 'bold',
    marginRight: SPACING.xs,
  },

  // ─── Carousel Screen ──────────────────────────
  carouselContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  slideCard: {
    flex: 1,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#F5F5F5',
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  slideImage: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    marginTop: 2,
    minHeight: 68,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#E94057',
    fontFamily: FONT,
    marginBottom: 6,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#7D7D7D',
    textAlign: 'center',
    lineHeight: 20,
    fontFamily: FONT,
    paddingHorizontal: SPACING.m,
  },

  // ─── Pagination ────────────────────────────────
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 6,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },

  // ─── Footer ────────────────────────────────────
  footer: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: 10,
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  alreadyText: {
    fontSize: 14,
    color: '#AAAAAA',
    fontFamily: FONT,
  },
  signInText: {
    fontSize: 14,
    color: '#E94057',
    fontWeight: '500',
    marginLeft: 4,
    fontFamily: FONT,
  },
  createAccountBtn: {
    backgroundColor: '#E94057',
    borderRadius: 16,
    height: 52,
    marginVertical: 4,
  },
});
