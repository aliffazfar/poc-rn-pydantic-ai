import { ApiConfig, AppConfig } from '../config';

export const APP_NAME = AppConfig.name;
export const APP_DESCRIPTION = AppConfig.description;
export const CURRENCY = AppConfig.currency;
export const API_BASE_URL = ApiConfig.baseUrl;

export const BANKING_ACTIONS = {
  CONFIRM_TRANSFER: 'confirm_transfer',
  CANCEL_TRANSFER: 'cancel_transfer',
  EDIT_TRANSFER: 'edit_transfer',
} as const;

// Animation & Layout Constants
export const ANIMATION_DURATION = 700;
export const CUSTOM_EASING = [0.32, 0.72, 0, 1]; // Bezier curve values for smooth spring-like animations

// Default Values
export const DEFAULT_INITIAL_BALANCE = 50.43;
export const DEFAULT_INTEREST_RATE = '3.00% p.a.';
export const DEFAULT_INTEREST_EARNED = 0.43;

// Glassmorphism Colors (specifically for chat dark theme and translucent overlays)
export const GLASS_COLORS = {
  bg: 'rgba(25, 30, 55, 0.85)',
  border: 'rgba(255, 255, 255, 0.12)',
  cardBg: 'rgba(41, 41, 64, 0.4)',
} as const;

// Promo Banner Config for the chat input area
export const PROMO_BANNER = {
  height: 48,
  message: 'Snap and pay with JomKira AI, get up to RM 5',
} as const;

// AI Assistant Configuration
export const AI_GREETING =
  "Hello! I'm JomKira AI. How can I assist you today? I can help you with bank transfers, bill payments, or balance inquiries.";

/**
 * Formats a number as Malaysian Ringgit currency with thousand separators.
 * @param amount - The amount to format
 * @param showCurrency - Whether to prepend CURRENCY symbol (default: false)
 * @returns Formatted string like "1,108.82" or "RM 1,108.82"
 */
export function formatAmount(amount: number, showCurrency = false): string {
  const formatted = amount.toLocaleString('en-MY', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return showCurrency ? `${CURRENCY} ${formatted}` : formatted;
}
