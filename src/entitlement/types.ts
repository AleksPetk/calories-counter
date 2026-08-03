export type AccessState = 'trial_active' | 'trial_expired' | 'purchased';

export type StorePlatform = 'ios' | 'android';

/**
 * Persisted entitlement row — separate from ordinary settings.
 * Trial timestamps and real-store purchase survive Erase All Data.
 */
export type EntitlementRecord = {
  trialStartedAt: string | null;
  trialExpiresAt: string | null;
  storePurchased: boolean;
  storeProductId: string | null;
  storePlatform: StorePlatform | null;
  storePurchasedAt: string | null;
  lastStoreCheckAt: string | null;
  /**
   * __DEV__ simulation only — never treated as a real store purchase.
   * Production builds ignore this flag in access derivation.
   */
  simulatedPurchased: boolean;
  updatedAt: string;
};

export type EntitlementSnapshot = EntitlementRecord & {
  accessState: AccessState;
  /** True when unlocked via simulated DEV purchase (not store). */
  isSimulatedPurchase: boolean;
  /** True when unlocked via confirmed Apple/Google purchase cache. */
  isStorePurchase: boolean;
  canWrite: boolean;
  remainingMs: number | null;
};

export type LocalizedProductInfo = {
  productId: string;
  title: string;
  description: string;
  displayPrice: string;
};
