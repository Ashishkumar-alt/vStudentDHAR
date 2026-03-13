"use client";

import React from "react";
import { FEATURES, FeatureFlag } from "@/lib/features";

interface FeatureGateProps {
  feature: FeatureFlag;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Conditional rendering component based on feature flags
 * 
 * Usage:
 * <FeatureGate feature="ITEMS_FEATURE_ENABLED">
 *   <ItemsPage />
 * </FeatureGate>
 * 
 * With fallback:
 * <FeatureGate 
 *   feature="ITEMS_FEATURE_ENABLED" 
 *   fallback={<ComingSoon />}
 * >
 *   <ItemsPage />
 * </FeatureGate>
 */
export default function FeatureGate({ feature, children, fallback }: FeatureGateProps) {
  const isFeatureEnabled = FEATURES[feature];
  
  if (isFeatureEnabled) {
    return <>{children}</>;
  }
  
  return <>{fallback}</>;
}

/**
 * Hook for checking feature status
 * Usage: const isItemsEnabled = useFeatureFlag('ITEMS_FEATURE_ENABLED');
 */
export function useFeatureFlag(feature: FeatureFlag): boolean {
  return FEATURES[feature];
}
