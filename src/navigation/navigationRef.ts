import {
  CommonActions,
  createNavigationContainerRef,
} from '@react-navigation/native';

import type { RootStackParamList } from './types';
import type { TutorialTab } from '../tutorial/types';

export const navigationRef =
  createNavigationContainerRef<RootStackParamList>();

export function navigateToTab(tab: TutorialTab) {
  if (!navigationRef.isReady()) {
    return;
  }
  navigationRef.dispatch(
    CommonActions.navigate({
      name: 'Main',
      params: {
        screen: tab,
      },
    }),
  );
}

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
