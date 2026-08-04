import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AppState, type AppStateStatus } from 'react-native';

import { useData } from '../data/DataProvider';
import { nowIso } from '../data/database/utils';
import {
  connectStore,
  fetchLifetimeProduct,
  isNativeIapAvailable,
  purchaseLifetime,
  queryOwnedLifetimePurchase,
  STORE_UNAVAILABLE_MESSAGE,
} from '../iap/iapService';
import { getStorePlatform } from '../iap/productIds';
import { dismissPaywall, navigationRef } from '../navigation/navigationRef';
import { DEV_ONE_MINUTE_MS, TRIAL_DURATION_MS } from './constants';
import {
  accessStateToPurchaseState,
  deriveAccess,
} from './deriveAccess';
import type {
  AccessState,
  EntitlementRecord,
  EntitlementSnapshot,
  LocalizedProductInfo,
} from './types';

type PurchaseBusyState = 'idle' | 'purchasing' | 'restoring' | 'loading';

type EntitlementContextValue = {
  ready: boolean;
  snapshot: EntitlementSnapshot | null;
  accessState: AccessState | null;
  canWrite: boolean;
  product: LocalizedProductInfo | null;
  storeAvailable: boolean;
  busy: PurchaseBusyState;
  lastError: string | null;
  /** Returns true if writes are allowed; otherwise opens paywall and returns false. */
  requireWriteAccess: () => boolean;
  openPaywall: () => void;
  closePaywall: () => void;
  refreshLocal: () => Promise<void>;
  refreshFromStore: () => Promise<void>;
  purchase: () => Promise<'success' | 'pending' | 'cancelled' | 'failed' | 'unavailable'>;
  restore: () => Promise<'restored' | 'none' | 'failed' | 'unavailable'>;
  loadProduct: () => Promise<void>;
  /** __DEV__ only */
  devStartFreshTrial: () => Promise<void>;
  devSetOneMinuteRemaining: () => Promise<void>;
  devExpireTrialNow: () => Promise<void>;
  devSimulatePurchased: () => Promise<void>;
  devResetSimulated: () => Promise<void>;
};

const EntitlementContext = createContext<EntitlementContextValue | null>(
  null,
);

function toSnapshot(
  record: EntitlementRecord,
  nowMs = Date.now(),
): EntitlementSnapshot {
  const derived = deriveAccess(record, nowMs);
  return {
    ...record,
    ...derived,
  };
}

export function EntitlementProvider({ children }: { children: ReactNode }) {
  const { ready: dataReady, repositories, reloadSettings } = useData();
  const [ready, setReady] = useState(false);
  const [snapshot, setSnapshot] = useState<EntitlementSnapshot | null>(null);
  const [product, setProduct] = useState<LocalizedProductInfo | null>(null);
  const [storeAvailable, setStoreAvailable] = useState(false);
  const [busy, setBusy] = useState<PurchaseBusyState>('idle');
  const [lastError, setLastError] = useState<string | null>(null);
  const initRef = useRef(false);

  const syncPurchaseStateMirror = useCallback(
    async (accessState: AccessState) => {
      if (!repositories) {
        return;
      }
      const mirrored = accessStateToPurchaseState(accessState);
      const settings = await repositories.settings.get();
      if (settings.purchaseState !== mirrored) {
        await repositories.settings.update({ purchaseState: mirrored });
        await reloadSettings();
      }
    },
    [repositories, reloadSettings],
  );

  const applyRecord = useCallback(
    async (record: EntitlementRecord) => {
      const next = toSnapshot(record);
      setSnapshot(next);
      await syncPurchaseStateMirror(next.accessState);
      return next;
    },
    [syncPurchaseStateMirror],
  );

  const ensureTrialStarted = useCallback(async (): Promise<EntitlementRecord> => {
    if (!repositories) {
      throw new Error('Repositories not ready');
    }
    const current = await repositories.entitlement.get();
    if (current.trialStartedAt && current.trialExpiresAt) {
      return current;
    }
    const started = current.trialStartedAt
      ? new Date(current.trialStartedAt)
      : new Date();
    const expires = current.trialExpiresAt
      ? new Date(current.trialExpiresAt)
      : new Date(started.getTime() + TRIAL_DURATION_MS);
    return repositories.entitlement.update({
      trialStartedAt: started.toISOString(),
      trialExpiresAt: expires.toISOString(),
    });
  }, [repositories]);

  const refreshLocal = useCallback(async () => {
    if (!repositories) {
      return;
    }
    const record = await repositories.entitlement.get();
    await applyRecord(record);
  }, [repositories, applyRecord]);

  const grantStorePurchase = useCallback(
    async (productId: string) => {
      if (!repositories) {
        return;
      }
      const stamp = nowIso();
      const record = await repositories.entitlement.update({
        storePurchased: true,
        storeProductId: productId,
        storePlatform: getStorePlatform(),
        storePurchasedAt: stamp,
        lastStoreCheckAt: stamp,
        simulatedPurchased: false,
      });
      await applyRecord(record);
    },
    [repositories, applyRecord],
  );

  const refreshFromStore = useCallback(async () => {
    if (!repositories) {
      return;
    }
    // Silent owned-purchase check only — never interactive StoreKit sync here.
    const result = await queryOwnedLifetimePurchase();
    const stamp = nowIso();
    if (result.owned && result.productId) {
      await grantStorePurchase(result.productId);
      return;
    }
    const current = await repositories.entitlement.get();
    // Do not clear a confirmed store purchase solely because the store is offline
    // or silent query returned empty (finished non-consumables need explicit Restore).
    const record = await repositories.entitlement.update({
      lastStoreCheckAt: stamp,
      storePurchased: current.storePurchased,
    });
    await applyRecord(record);
  }, [repositories, grantStorePurchase, applyRecord]);

  const loadProduct = useCallback(async () => {
    const info = await fetchLifetimeProduct();
    setProduct(info);
  }, []);

  const openPaywall = useCallback(() => {
    if (!navigationRef.isReady()) {
      return;
    }
    // Avoid stacking duplicate Paywall routes.
    if (navigationRef.getCurrentRoute()?.name === 'Paywall') {
      return;
    }
    navigationRef.navigate('Paywall');
  }, []);

  const closePaywall = useCallback(() => {
    dismissPaywall();
  }, []);

  const requireWriteAccess = useCallback(() => {
    if (snapshot?.canWrite) {
      return true;
    }
    openPaywall();
    return false;
  }, [snapshot?.canWrite, openPaywall]);

  const purchase = useCallback(async () => {
    setLastError(null);
    setBusy('purchasing');
    try {
      const outcome = await purchaseLifetime();
      if (outcome.status === 'success') {
        await grantStorePurchase(outcome.productId);
        return 'success';
      }
      if (outcome.status === 'pending') {
        setLastError('Purchase is pending. Access unlocks when the store confirms it.');
        return 'pending';
      }
      if (outcome.status === 'cancelled') {
        return 'cancelled';
      }
      if (outcome.status === 'unavailable') {
        setLastError(outcome.message);
        return 'unavailable';
      }
      setLastError(outcome.message);
      return 'failed';
    } finally {
      setBusy('idle');
    }
  }, [grantStorePurchase]);

  const restore = useCallback(async () => {
    setLastError(null);
    setBusy('restoring');
    try {
      if (!isNativeIapAvailable()) {
        setLastError(STORE_UNAVAILABLE_MESSAGE);
        return 'unavailable';
      }
      const result = await queryOwnedLifetimePurchase({
        interactiveRestore: true,
      });
      if (result.unavailable) {
        setLastError(STORE_UNAVAILABLE_MESSAGE);
        return 'unavailable';
      }
      if (result.owned && result.productId) {
        await grantStorePurchase(result.productId);
        return 'restored';
      }
      if (result.pending) {
        setLastError('A purchase is still pending on the store.');
        return 'failed';
      }
      return 'none';
    } catch (error) {
      setLastError(
        error instanceof Error ? error.message : 'Restore failed.',
      );
      return 'failed';
    } finally {
      setBusy('idle');
      await refreshLocal();
    }
  }, [grantStorePurchase, refreshLocal]);

  const assertDevMutable = useCallback(() => {
    if (!__DEV__) {
      throw new Error('Dev entitlement tools are unavailable in release builds.');
    }
    if (snapshot?.storePurchased || snapshot?.isStorePurchase) {
      throw new Error(
        'A real store purchase is cached. Dev tools will not overwrite it.',
      );
    }
  }, [snapshot?.storePurchased, snapshot?.isStorePurchase]);

  const devStartFreshTrial = useCallback(async () => {
    assertDevMutable();
    if (!repositories) {
      return;
    }
    const started = new Date();
    const expires = new Date(started.getTime() + TRIAL_DURATION_MS);
    const record = await repositories.entitlement.update({
      trialStartedAt: started.toISOString(),
      trialExpiresAt: expires.toISOString(),
      simulatedPurchased: false,
    });
    await applyRecord(record);
  }, [assertDevMutable, repositories, applyRecord]);

  const devSetOneMinuteRemaining = useCallback(async () => {
    assertDevMutable();
    if (!repositories) {
      return;
    }
    const now = Date.now();
    const current = await repositories.entitlement.get();
    const record = await repositories.entitlement.update({
      trialStartedAt: current.trialStartedAt ?? new Date(now).toISOString(),
      trialExpiresAt: new Date(now + DEV_ONE_MINUTE_MS).toISOString(),
      simulatedPurchased: false,
    });
    await applyRecord(record);
  }, [assertDevMutable, repositories, applyRecord]);

  const devExpireTrialNow = useCallback(async () => {
    assertDevMutable();
    if (!repositories) {
      return;
    }
    const now = Date.now();
    const current = await repositories.entitlement.get();
    const record = await repositories.entitlement.update({
      trialStartedAt:
        current.trialStartedAt ?? new Date(now - TRIAL_DURATION_MS).toISOString(),
      trialExpiresAt: new Date(now - 1000).toISOString(),
      simulatedPurchased: false,
    });
    await applyRecord(record);
  }, [assertDevMutable, repositories, applyRecord]);

  const devSimulatePurchased = useCallback(async () => {
    assertDevMutable();
    if (!repositories) {
      return;
    }
    const record = await repositories.entitlement.update({
      simulatedPurchased: true,
    });
    await applyRecord(record);
  }, [assertDevMutable, repositories, applyRecord]);

  const devResetSimulated = useCallback(async () => {
    if (!__DEV__) {
      throw new Error('Dev entitlement tools are unavailable in release builds.');
    }
    if (!repositories) {
      return;
    }
    const current = await repositories.entitlement.get();
    if (current.storePurchased) {
      throw new Error(
        'A real store purchase is cached. Dev tools will not overwrite it.',
      );
    }
    const record = await repositories.entitlement.update({
      simulatedPurchased: false,
    });
    await applyRecord(record);
  }, [repositories, applyRecord]);

  useEffect(() => {
    if (!dataReady || !repositories || initRef.current) {
      return;
    }
    initRef.current = true;
    let cancelled = false;

    (async () => {
      try {
        const record = await ensureTrialStarted();
        if (cancelled) {
          return;
        }
        await applyRecord(record);
        // Never touch expo-iap native APIs in Expo Go.
        if (!isNativeIapAvailable()) {
          if (!cancelled) {
            setStoreAvailable(false);
          }
        } else {
          const connected = await connectStore();
          if (!cancelled) {
            setStoreAvailable(connected);
          }
          if (connected) {
            await refreshFromStore();
            await loadProduct();
          }
        }
      } finally {
        if (!cancelled) {
          setReady(true);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    dataReady,
    repositories,
    ensureTrialStarted,
    applyRecord,
    refreshFromStore,
    loadProduct,
  ]);

  useEffect(() => {
    const onChange = (state: AppStateStatus) => {
      if (state === 'active' && ready) {
        void refreshLocal();
        if (storeAvailable) {
          void refreshFromStore();
        }
      }
    };
    const sub = AppState.addEventListener('change', onChange);
    return () => sub.remove();
  }, [ready, storeAvailable, refreshLocal, refreshFromStore]);

  // Tick remaining trial while active so 1-minute DEV expiry updates UI.
  useEffect(() => {
    if (!snapshot || snapshot.accessState !== 'trial_active') {
      return;
    }
    const remaining = snapshot.remainingMs ?? 0;
    const intervalMs = remaining <= 2 * 60 * 1000 ? 1000 : 5000;
    const id = setInterval(() => {
      void refreshLocal();
    }, intervalMs);
    return () => clearInterval(id);
  }, [snapshot?.accessState, snapshot?.remainingMs, refreshLocal]);

  const value = useMemo<EntitlementContextValue>(
    () => ({
      ready,
      snapshot,
      accessState: snapshot?.accessState ?? null,
      canWrite: snapshot?.canWrite ?? false,
      product,
      storeAvailable,
      busy,
      lastError,
      requireWriteAccess,
      openPaywall,
      closePaywall,
      refreshLocal,
      refreshFromStore,
      purchase,
      restore,
      loadProduct,
      devStartFreshTrial,
      devSetOneMinuteRemaining,
      devExpireTrialNow,
      devSimulatePurchased,
      devResetSimulated,
    }),
    [
      ready,
      snapshot,
      product,
      storeAvailable,
      busy,
      lastError,
      requireWriteAccess,
      openPaywall,
      closePaywall,
      refreshLocal,
      refreshFromStore,
      purchase,
      restore,
      loadProduct,
      devStartFreshTrial,
      devSetOneMinuteRemaining,
      devExpireTrialNow,
      devSimulatePurchased,
      devResetSimulated,
    ],
  );

  return (
    <EntitlementContext.Provider value={value}>
      {children}
    </EntitlementContext.Provider>
  );
}

export function useEntitlement(): EntitlementContextValue {
  const value = useContext(EntitlementContext);
  if (!value) {
    throw new Error('useEntitlement must be used within EntitlementProvider');
  }
  return value;
}
