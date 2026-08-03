import {
  createNavigationContainerRef,
} from '@react-navigation/native';

import type { RootStackParamList } from './types';

export const navigationRef =
  createNavigationContainerRef<RootStackParamList>();

/**
 * Dismiss the root Paywall modal safely (single pop, no double GO_BACK).
 * Returns to whatever screen was underneath (Settings, Home, etc.).
 */
export function dismissPaywall() {
  if (!navigationRef.isReady()) {
    return;
  }

  const current = navigationRef.getCurrentRoute();
  if (current?.name !== 'Paywall') {
    return;
  }

  if (navigationRef.canGoBack()) {
    navigationRef.goBack();
    return;
  }

  // No history (should be rare) — land on Main without a blind goBack.
  navigationRef.navigate('Main');
}
