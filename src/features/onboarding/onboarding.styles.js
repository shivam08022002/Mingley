import { StyleSheet, Dimensions } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../../constants/theme';

const { width, height } = Dimensions.get('window');

export const styles = StyleSheet.create({
  // Splash Screen
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
  
  // Get Started Screen
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
  
  // Carousel Screen
  carouselContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: height * 0.05,
  },
  slideContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.m,
  },
  imageContainer: {
    width: '100%',
    height: height * 0.5,
    borderRadius: 30,
    overflow: 'hidden',
    marginBottom: SPACING.xl,
  },
  slideImage: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    alignItems: 'center',
    height: 120,
    paddingHorizontal: SPACING.m,
  },
  title: {
    ...TYPOGRAPHY.h1,
    color: COLORS.primary,
    marginBottom: SPACING.m,
    textAlign: 'center',
  },
  description: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  
  // Pagination
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: SPACING.m,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  
  // Footer
  footer: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xl * 1.5,
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.m,
  },
  alreadyText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
  signInText: {
    ...TYPOGRAPHY.body,
    color: '#FF4b72',
    fontWeight: 'bold',
    marginLeft: 4,
  },
  createAccountBtn: {
    backgroundColor: '#FF4b72',
    borderRadius: 16,
    height: 60,
  },
});
