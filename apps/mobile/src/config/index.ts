/**
 * Environment configuration for JomKira React Native app.
 * All configurable environment variables should be defined here.
 *
 * For production, these values can be overridden via:
 * - react-native-config (for build-time .env files)
 * - Or replaced during CI/CD build process
 */

/**
 * API Configuration
 */
export const ApiConfig = {
  /** Base URL for the backend API */
  baseUrl: __DEV__ ? 'http://localhost:8000' : 'https://api.jomkira.my',

  /** API request timeout in milliseconds */
  timeout: 30000,

  /** Number of retry attempts for failed requests */
  retryAttempts: 3,

  /** API version path prefix */
  version: '/api',
} as const;

/**
 * Feature Flags
 */
export const FeatureFlags = {
  /** Enable/disable chat feature */
  enableChat: true,

  /** Enable/disable bill payment feature */
  enableBillPayment: true,

  /** Enable/disable image upload in chat */
  enableImageUpload: true,

  /** Enable/disable file logging (production only) */
  enableFileLogging: !__DEV__,

  /** Enable/disable analytics */
  enableAnalytics: !__DEV__,
} as const;

/**
 * Logging Configuration
 */
export const LogConfig = {
  /** Minimum log level: 'debug' | 'info' | 'warn' | 'error' */
  minLevel: __DEV__ ? 'debug' : 'warn',

  /** Log file name pattern (use {date-today} for date substitution) */
  fileNamePattern: 'jomkira_{date-today}',

  /** Enable console logging */
  enableConsole: true,

  /** Enable file logging */
  enableFile: !__DEV__,
} as const;

/**
 * App Configuration
 */
export const AppConfig = {
  /** Application name */
  name: 'JomKira',

  /** Application description */
  description: 'Your Smart Digital Bank Assistant',

  /** Default currency */
  currency: 'RM',

  /** Default locale */
  locale: 'en-MY',

  /** Animation duration in milliseconds */
  animationDuration: 700,
} as const;

/**
 * Platform-specific URLs
 */
export const PlatformUrls = {
  /** Terms and conditions URL */
  termsUrl: 'https://jomkira.my/terms',

  /** Privacy policy URL */
  privacyUrl: 'https://jomkira.my/privacy',

  /** Support/help URL */
  supportUrl: 'https://jomkira.my/support',

  /** DuitNow terms URL */
  duitNowTermsUrl: 'https://duitnow.my/terms',
} as const;

// Type exports for type safety
export type ApiConfigType = typeof ApiConfig;
export type FeatureFlagsType = typeof FeatureFlags;
export type LogConfigType = typeof LogConfig;
export type AppConfigType = typeof AppConfig;
export type PlatformUrlsType = typeof PlatformUrls;
