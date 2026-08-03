import type { AccessState, EntitlementRecord } from './types';

export type DerivedAccess = {
  accessState: AccessState;
  canWrite: boolean;
  remainingMs: number | null;
  isStorePurchase: boolean;
  isSimulatedPurchase: boolean;
};

/**
 * Pure entitlement derivation — safe for unit/smoke tests without SQLite.
 */
export function deriveAccess(
  record: Pick<
    EntitlementRecord,
    | 'trialStartedAt'
    | 'trialExpiresAt'
    | 'storePurchased'
    | 'simulatedPurchased'
  >,
  nowMs: number = Date.now(),
): DerivedAccess {
  if (record.storePurchased) {
    return {
      accessState: 'purchased',
      canWrite: true,
      remainingMs: null,
      isStorePurchase: true,
      isSimulatedPurchase: false,
    };
  }

  // Simulated unlock is DEV-only. Production ignores the flag so a leftover
  // SQLite value cannot grant write access after a release install.
  if (__DEV__ && record.simulatedPurchased) {
    return {
      accessState: 'purchased',
      canWrite: true,
      remainingMs: null,
      isStorePurchase: false,
      isSimulatedPurchase: true,
    };
  }

  const expiresAt = record.trialExpiresAt
    ? Date.parse(record.trialExpiresAt)
    : NaN;

  if (!Number.isFinite(expiresAt)) {
    return {
      accessState: 'trial_expired',
      canWrite: false,
      remainingMs: 0,
      isStorePurchase: false,
      isSimulatedPurchase: false,
    };
  }

  const remainingMs = expiresAt - nowMs;
  if (remainingMs > 0) {
    return {
      accessState: 'trial_active',
      canWrite: true,
      remainingMs,
      isStorePurchase: false,
      isSimulatedPurchase: false,
    };
  }

  return {
    accessState: 'trial_expired',
    canWrite: false,
    remainingMs: 0,
    isStorePurchase: false,
    isSimulatedPurchase: false,
  };
}

/** Maps access state to legacy settings.purchase_state display values. */
export function accessStateToPurchaseState(
  accessState: AccessState,
): 'trial' | 'purchased' | 'locked' {
  if (accessState === 'purchased') {
    return 'purchased';
  }
  if (accessState === 'trial_expired') {
    return 'locked';
  }
  return 'trial';
}
