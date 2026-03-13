/**
 * Feature flags for vStudent application
 * 
 * Toggle features on/off without changing code logic
 * 
 * To enable/disable features:
 * - Set ITEMS_FEATURE_ENABLED = true to enable Items marketplace
 * - Set ITEMS_FEATURE_ENABLED = false to show Coming Soon screen
 */

export const FEATURES = {
  // Items Marketplace Feature
  ITEMS_FEATURE_ENABLED: process.env.NODE_ENV === 'development' ? true : false,
  
  // Future features (placeholder)
  CHAT_FEATURE_ENABLED: false,
  NOTIFICATIONS_ENABLED: true,
  MAP_VIEW_ENABLED: false,
} as const;

// Helper functions for feature checking
export const isItemsFeatureEnabled = () => FEATURES.ITEMS_FEATURE_ENABLED;
export const isChatFeatureEnabled = () => FEATURES.CHAT_FEATURE_ENABLED;
export const isNotificationsEnabled = () => FEATURES.NOTIFICATIONS_ENABLED;
export const isMapViewEnabled = () => FEATURES.MAP_VIEW_ENABLED;

// Type definitions
export type FeatureFlag = keyof typeof FEATURES;
export type FeatureStatus = boolean;
