// CareerVault Design Tokens
const commonColors = {
  primary: '#6366F1',
  primaryLight: '#818CF8',
  primaryDark: '#4F46E5',
  primaryGlow: 'rgba(99,102,241,0.25)',

  accent: '#F59E0B',
  accentLight: '#FCD34D',

  success: '#10B981',
  successBg: 'rgba(16,185,129,0.15)',
  warning: '#F59E0B',
  warningBg: 'rgba(245,158,11,0.15)',
  danger: '#EF4444',
  dangerBg: 'rgba(239,68,68,0.15)',
  info: '#3B82F6',
  infoBg: 'rgba(59,130,246,0.15)',
  teal: '#14B8A6',
  tealBg: 'rgba(20,184,166,0.15)',

  borderGlow: 'rgba(99,102,241,0.4)',
};

export const darkTheme = {
  ...commonColors,
  bg: '#0A0F2C',
  bgCard: '#141830',
  bgCardHover: '#1C2244',
  bgInput: '#1A1F3D',
  bgOverlay: 'rgba(10,15,44,0.85)',

  // Glass variants — stronger frosted layers for dark mode
  bgCardGlass: 'rgba(20, 24, 56, 0.55)',
  bgCardGlassHover: 'rgba(30, 36, 72, 0.70)',
  bgInputGlass: 'rgba(26, 31, 61, 0.5)',
  bgGlassHighlight: 'rgba(255, 255, 255, 0.04)',

  // Borders
  border: '#1E2B4A',
  borderGlass: 'rgba(255, 255, 255, 0.08)',
  borderGlassActive: 'rgba(99, 102, 241, 0.45)',

  // Shadows & glow
  shadowColor: '#000000',
  glowColor: 'rgba(99, 102, 241, 0.18)',

  textPrimary: '#F1F5F9',
  textSecondary: '#94A3B8',
  textMuted: '#475569',
  textInverse: '#0A0F2C',

  status: {
    Applied: { bg: 'rgba(234,179,8,0.18)', text: '#FDE047', dot: '#EAB308' },
    Interview: { bg: 'rgba(139,92,246,0.18)', text: '#A78BFA', dot: '#8B5CF6' },
    Rejected: { bg: 'rgba(239,68,68,0.18)', text: '#FCA5A5', dot: '#EF4444' },
    Offered: { bg: 'rgba(20,184,166,0.18)', text: '#5EEAD4', dot: '#14B8A6' },
    Hired: { bg: 'rgba(16,185,129,0.18)', text: '#6EE7B7', dot: '#10B981' },
  },
  category: {
    Certificate: { bg: 'rgba(99,102,241,0.18)', text: '#818CF8' },
    Resume: { bg: 'rgba(245,158,11,0.18)', text: '#FCD34D' },
    ID: { bg: 'rgba(20,184,166,0.18)', text: '#5EEAD4' },
    Other: { bg: 'rgba(148,163,184,0.18)', text: '#CBD5E1' },
  },
};

export const lightTheme = {
  ...commonColors,
  bg: '#F0F4FF',
  bgCard: '#FFFFFF',
  bgCardHover: '#F1F5F9',
  bgInput: '#EEF2FF',
  bgOverlay: 'rgba(248,250,252,0.85)',

  // Glass variants — soft translucent surfaces for light mode
  bgCardGlass: 'rgba(255, 255, 255, 0.62)',
  bgCardGlassHover: 'rgba(255, 255, 255, 0.82)',
  bgInputGlass: 'rgba(238, 242, 255, 0.7)',
  bgGlassHighlight: 'rgba(255, 255, 255, 0.85)',

  // Borders
  border: '#DDE3F4',
  borderGlass: 'rgba(99, 102, 241, 0.12)',
  borderGlassActive: 'rgba(99, 102, 241, 0.5)',

  // Shadows & glow
  shadowColor: '#4F5CA0',
  glowColor: 'rgba(99, 102, 241, 0.10)',

  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  textInverse: '#FFFFFF',

  status: {
    Applied: { bg: 'rgba(234,179,8,0.15)', text: '#CA8A04', dot: '#CA8A04' },
    Interview: { bg: 'rgba(139,92,246,0.15)', text: '#7C3AED', dot: '#7C3AED' },
    Rejected: { bg: 'rgba(239,68,68,0.15)', text: '#B91C1C', dot: '#B91C1C' },
    Offered: { bg: 'rgba(20,184,166,0.15)', text: '#0F766E', dot: '#0F766E' },
    Hired: { bg: 'rgba(16,185,129,0.15)', text: '#047857', dot: '#047857' },
  },
  category: {
    Certificate: { bg: 'rgba(99,102,241,0.15)', text: '#4F46E5' },
    Resume: { bg: 'rgba(245,158,11,0.15)', text: '#D97706' },
    ID: { bg: 'rgba(20,184,166,0.15)', text: '#0F766E' },
    Other: { bg: 'rgba(148,163,184,0.15)', text: '#64748B' },
  },
};


export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const typography = {
  h1: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  h2: { fontSize: 22, fontWeight: '700', letterSpacing: -0.3 },
  h3: { fontSize: 18, fontWeight: '700' },
  body: { fontSize: 15, fontWeight: '400' },
  bodyBold: { fontSize: 15, fontWeight: '600' },
  caption: { fontSize: 12, fontWeight: '400' },
  captionBold: { fontSize: 12, fontWeight: '600' },
};

// Glass card shadow presets
export const glassShadow = {
  dark: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 10,
  },
  light: {
    shadowColor: '#4F5CA0',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 6,
  },
};
