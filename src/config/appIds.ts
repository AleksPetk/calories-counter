/**
 * Centralized app and store product identifiers.
 * Do not duplicate these strings elsewhere.
 */
export const appIds = {
  iosBundleIdentifier: 'com.alekspetk.quickcal',
  androidPackage: 'com.alekspetk.quickcal',
  /** iOS non-consumable lifetime product. */
  iosLifetimeProductId: 'com.alekspetk.quickcal.lifetime',
  /** Android one-time non-consumable product. */
  androidLifetimeProductId: 'quickcal_lifetime',
} as const;

export type AppIds = typeof appIds;
