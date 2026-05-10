// Design tokens shared across screens. Keep styles consistent by reaching
// for these instead of hard-coding hex codes and numbers everywhere.

export const colors = {
  bg: '#f5f6fa',
  surface: '#ffffff',
  surfaceAlt: '#f1f2f7',
  border: '#e5e7eb',
  borderStrong: '#cbd5e1',

  text: '#0f172a',
  textMuted: '#64748b',
  textSubtle: '#94a3b8',

  primary: '#6366f1',
  primaryDark: '#4f46e5',
  primarySoft: '#eef2ff',

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
  title: { fontSize: 22, fontWeight: '700', color: colors.text },
  heading: { fontSize: 18, fontWeight: '600', color: colors.text },
  body: { fontSize: 15, color: colors.text },
  bodyMuted: { fontSize: 15, color: colors.textMuted },
  small: { fontSize: 13, color: colors.textMuted },
  tiny: { fontSize: 12, color: colors.textSubtle },
};

export const shadow = {
  card: {
    shadowColor: '#0f172a',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  fab: {
    shadowColor: '#4f46e5',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
};
