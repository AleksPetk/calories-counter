import { Platform } from 'react-native';

import { appIds } from '../config/appIds';

/** Platform-specific lifetime product ID from centralized config. */
export function getLifetimeProductId(): string {
  return Platform.OS === 'ios'
    ? appIds.iosLifetimeProductId
    : appIds.androidLifetimeProductId;
}

export function getStorePlatform(): 'ios' | 'android' {
  return Platform.OS === 'ios' ? 'ios' : 'android';
}
