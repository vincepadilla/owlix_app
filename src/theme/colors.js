// CareerVault Design Tokens
export const colors = {
  // Backgrounds
  bg: '#0A0F2C',
  bgCard: '#141830',
  bgCardHover: '#1C2244',
  bgInput: '#1A1F3D',
  bgOverlay: 'rgba(10,15,44,0.85)',

  // Primary — Electric Indigo
  primary: '#6366F1',
  primaryLight: '#818CF8',
  primaryDark: '#4F46E5',
  primaryGlow: 'rgba(99,102,241,0.25)',

  // Accent — Amber
  accent: '#F59E0B',
  accentLight: '#FCD34D',

  // Semantic
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

  // Text
  textPrimary: '#F1F5F9',
  textSecondary: '#94A3B8',
  textMuted: '#475569',
  textInverse: '#0A0F2C',

  // Borders
  border: '#1E2B4A',
  borderGlow: 'rgba(99,102,241,0.4)',

  // Status chips
  status: {
    Applied:   { bg: 'rgba(99,102,241,0.18)',  text: '#818CF8', dot: '#6366F1' },
    Interview: { bg: 'rgba(245,158,11,0.18)',  text: '#FCD34D', dot: '#F59E0B' },
    Rejected:  { bg: 'rgba(239,68,68,0.18)',   text: '#FCA5A5', dot: '#EF4444' },
    Offered:   { bg: 'rgba(20,184,166,0.18)',  text: '#5EEAD4', dot: '#14B8A6' },
    Hired:     { bg: 'rgba(16,185,129,0.18)',  text: '#6EE7B7', dot: '#10B981' },
  },

  // Category badges
  category: {
    Certificate: { bg: 'rgba(99,102,241,0.18)',  text: '#818CF8' },
    Resume:      { bg: 'rgba(245,158,11,0.18)',  text: '#FCD34D' },
    ID:          { bg: 'rgba(20,184,166,0.18)',  text: '#5EEAD4' },
    Other:       { bg: 'rgba(148,163,184,0.18)', text: '#CBD5E1' },
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
