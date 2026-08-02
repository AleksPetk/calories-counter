import { Platform } from 'react-native';

import { requireOptionalNativeModule } from 'expo-modules-core';

export const STORE_UNAVAILABLE_MESSAGE =
  'In-app purchases need a development or store build. Expo Go cannot load store price, purchase, or restore.';

/**
 * True only when the ExpoIap native module is present (dev client / store build).
 * Expo Go returns false — do not import or call expo-iap APIs in that case.
 */
export function isNativeIapAvailable(): boolean {
  if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
    return false;
  }
  try {
    return requireOptionalNativeModule('ExpoIap') != null;
  } catch {
    return false;
  }
}
