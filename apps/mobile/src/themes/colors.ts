/**
 * Centralized color palette for JomKira React Native app.
 * Use these constants instead of hardcoded hex values.
 */
export const colors = {
  // Brand Colors
  primary: '#3B82F6',
  primaryLight: '#DBEAFE',
  primaryDark: '#1D4ED8',

  // Status Colors
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#0EA5E9',

  // Surface Colors
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceOverlay: 'rgba(255, 255, 255, 0.8)',
  surfaceBorder: 'rgba(255, 255, 255, 0.6)',

  // Text Colors
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  textInverse: '#FFFFFF',

  // Slate Scale (for dark cards)
  slate: {
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
  },

  // Gradient Colors
  gradientStart: '#E0F2FE', // sky-100
  gradientMid: '#F3E8FF', // purple-100
  gradientEnd: '#F1F5F9', // slate-100

  // Border Colors
  border: '#E2E8F0',
  borderLight: 'rgba(255, 255, 255, 0.4)',

  // Transparency variants
  transparent: 'transparent',
  primaryAlpha20: 'rgba(59, 130, 246, 0.2)',
  primaryAlpha70: 'rgba(59, 130, 246, 0.7)',
} as const;

// Type for color keys
export type ColorKey = keyof typeof colors;