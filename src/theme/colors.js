// ─── Single source of truth for golden accent color ──────────────────────────
// To change the accent/golden color across the ENTIRE app, edit ONLY this line:
export const ACCENT_COLOR = '#F6DCA0';

// ─── Dark Theme ──────────────────────────────────────────────────────────────
export const darkTheme = {
  isDark: true,
  background: '#131314',
  surface: '#1B1A22',
  cardBackground: '#222126',
  cardBorder: 'rgba(179, 145, 112, 0.35)', // gold border
  border: '#4D3528',
  primary: '#D32A5E', // heart pink
  accent: ACCENT_COLOR, // primary gold
  textPrimary: '#EDEBEA',
  textSecondary: '#9B9795',
  navBackground: '#131314',
  iconActive: ACCENT_COLOR,
  iconInactive: '#B7B8C4',
  matchBadgeBg: '#2D1F3D',
  matchBadgeText: ACCENT_COLOR,
  verifiedBorder: ACCENT_COLOR,
  distanceBadgeBg: 'rgba(0,0,0,0.6)',
  likeButton: '#D32A5E',
  actionButtonBorder: '#4D3528', // dark border shadow
  superLikeBar: '#1B1A22',
  crownIcon: ACCENT_COLOR,
  filterIcon: ACCENT_COLOR,
  inputBackground: '#1B1A22',
  inputBorder: '#4D3528',
  sectionDivider: '#4D3528',
  iconWrapBackground: 'rgba(179, 145, 112, 0.12)', // light gold highlight transparent
};

// ─── Light Theme ─────────────────────────────────────────────────────────────
export const lightTheme = {
  accent: '#E94057',
  primary: '#E94057',
  background: '#FFFFFF',
  surface: '#FFFFFF',
  cardBackground: '#F5F5F5',
  cardBorder: 'rgba(0,0,0,0.1)',
  border: '#E8E8E8',
  textPrimary: '#000000',
  textSecondary: '#666666',
  navBackground: '#FFFFFF',
  iconActive: '#FF4D6D',
  iconInactive: '#ADAFBB',
  matchBadgeBg: '#FFE8EC',
  matchBadgeText: '#FF4D6D',
  verifiedBorder: '#FFD700',
  distanceBadgeBg: 'rgba(0,0,0,0.5)',
  likeButton: '#FF4D6D',
  actionButtonBorder: '#F0F0F0',
  superLikeBar: '#F5F5F5',
  crownIcon: '#E94057',
  filterIcon: '#E94057',
  inputBackground: '#FAFAFA',
  inputBorder: '#F0F0F0',
  sectionDivider: '#F5F5F5',
  iconWrapBackground: '#FFF0F3',
};
