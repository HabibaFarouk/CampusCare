// Design tokens shared across screens. Keep styles consistent by reaching
// for these instead of hard-coding hex codes and numbers everywhere.

export const colors = {
  bg: '#f6f1ec', // New main background
  surface: '#fcfaf8', // Card background (slightly off-white to match theme)
  surfaceAlt: '#f0ece7', // Alternate surface (slightly darker than bg)
  border: '#e6dac3',
  borderStrong: '#d1c3a7',

  text: '#1d1d1b', // Dark brown/black main text
  textMuted: '#68645e',
  textSubtle: '#949089',

  primary: '#e6dac3', // The tan accent color for buttons
  primaryDark: '#d1c3a7',
  primarySoft: '#f0ece7',
  
  primaryText: '#3a3532', // Dark text on primary buttons

  action: '#9b483e', // Reddish-brown for main action buttons
  actionText: '#ffffff',

  success: '#10b981',
  danger: '#ef4444',
  dangerSoft: '#fee2e2',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  full: 999,
};

export const type = {
  display: { fontSize: 30, fontWeight: '700', color: colors.text, letterSpacing: -0.5 },
  title: { fontSize: 24, fontWeight: '700', color: colors.text },
  heading: { fontSize: 18, fontWeight: '600', color: colors.text },
  body: { fontSize: 15, color: colors.text },
  bodyMuted: { fontSize: 15, color: colors.textMuted },
  small: { fontSize: 13, color: colors.textMuted },
  tiny: { fontSize: 12, color: colors.textSubtle },
};

export const shadow = {
  card: {
    shadowColor: '#1d1d1b',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  fab: {
    shadowColor: '#1d1d1b',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
};

