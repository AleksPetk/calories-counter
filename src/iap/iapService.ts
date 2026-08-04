import { Platform } from 'react-native';

import type { LocalizedProductInfo } from '../entitlement/types';
import { getLifetimeProductId } from './productIds';
import {
  isNativeIapAvailable,
  STORE_UNAVAILABLE_MESSAGE,
} from './storeAvailability';

export type PurchaseOutcome =
  | { status: 'success'; productId: string }
  | { status: 'pending'; productId: string }
  | { status: 'cancelled' }
  | { status: 'failed'; message: string }
  | { status: 'unavailable'; message: string };

export type OwnedPurchaseQuery = {
  owned: boolean;
  productId: string | null;
  pending: boolean;
  /** Native IAP module missing (Expo Go) or connection failed before query. */
  unavailable: boolean;
};

export type OwnedPurchaseQueryOptions = {
  /**
   * When true, runs StoreKit restore/sync (may show Apple ID password UI).
   * Use only from explicit Restore Purchase / already-owned purchase flows.
   * Startup and foreground must leave this false.
   */
  interactiveRestore?: boolean;
};

type StoreModule = typeof import('expo-iap');

let storeModule: StoreModule | null = null;
let connected = false;
let loadAttempted = false;

async function loadStore(): Promise<StoreModule | null> {
  if (loadAttempted) {
    return storeModule;
  }
  loadAttempted = true;

  if (Platform.OS === 'web' || !isNativeIapAvailable()) {
    storeModule = null;
    return null;
  }

  try {
    storeModule = await import('expo-iap');
    return storeModule;
  } catch {
    storeModule = null;
    return null;
  }
}

export async function isStoreAvailable(): Promise<boolean> {
  if (!isNativeIapAvailable()) {
    return false;
  }
  const mod = await loadStore();
  return mod != null;
}

export async function connectStore(): Promise<boolean> {
  if (!isNativeIapAvailable()) {
    connected = false;
    return false;
  }
  const mod = await loadStore();
  if (!mod) {
    connected = false;
    return false;
  }
  try {
    await mod.initConnection();
    connected = true;
    return true;
  } catch {
    connected = false;
    return false;
  }
}

export async function disconnectStore(): Promise<void> {
  if (!storeModule || !connected) {
    return;
  }
  try {
    await storeModule.endConnection();
  } catch {
    // ignore
  }
  connected = false;
}

export async function fetchLifetimeProduct(): Promise<LocalizedProductInfo | null> {
  if (!isNativeIapAvailable()) {
    return null;
  }
  const mod = await loadStore();
  if (!mod) {
    return null;
  }
  if (!connected) {
    const ok = await connectStore();
    if (!ok) {
      return null;
    }
  }

  const productId = getLifetimeProductId();
  try {
    const products = await mod.fetchProducts({
      skus: [productId],
      type: 'in-app',
    });
    if (!Array.isArray(products) || products.length === 0) {
      return null;
    }
    const product =
      products.find((item) => item.id === productId) ?? products[0];
    if (!product) {
      return null;
    }
    return {
      productId: product.id,
      title: product.title ?? 'QuickCal Lifetime Access',
      description: product.description ?? '',
      displayPrice: product.displayPrice,
    };
  } catch {
    return null;
  }
}

function matchesLifetimeProduct(productId: string | null | undefined): boolean {
  if (!productId) {
    return false;
  }
  return productId === getLifetimeProductId();
}

/**
 * Query store for an owned lifetime product. Does not grant entitlement itself.
 *
 * Silent by default (getAvailablePurchases only). Interactive restore/sync is
 * opt-in — restorePurchases/syncIOS can show an Apple ID password sheet and
 * must never run on launch or foreground.
 */
export async function queryOwnedLifetimePurchase(
  options: OwnedPurchaseQueryOptions = {},
): Promise<OwnedPurchaseQuery> {
  if (!isNativeIapAvailable()) {
    return {
      owned: false,
      productId: null,
      pending: false,
      unavailable: true,
    };
  }
  const mod = await loadStore();
  if (!mod) {
    return {
      owned: false,
      productId: null,
      pending: false,
      unavailable: true,
    };
  }
  if (!connected) {
    const ok = await connectStore();
    if (!ok) {
      return {
        owned: false,
        productId: null,
        pending: false,
        unavailable: true,
      };
    }
  }

  try {
    if (options.interactiveRestore) {
      // May prompt for Apple ID credentials — user-initiated restore only.
      await mod.restorePurchases();
    }
    const purchases = await mod.getAvailablePurchases();
    let pending = false;
    for (const purchase of purchases) {
      if (!matchesLifetimeProduct(purchase.productId)) {
        continue;
      }
      if (purchase.purchaseState === 'pending') {
        pending = true;
        continue;
      }
      if (
        purchase.purchaseState === 'purchased' ||
        purchase.purchaseState === 'unknown'
      ) {
        try {
          await mod.finishTransaction({
            purchase,
            isConsumable: false,
          });
        } catch {
          // Already finished is fine for non-consumables.
        }
        return {
          owned: true,
          productId: purchase.productId,
          pending: false,
          unavailable: false,
        };
      }
    }
    return {
      owned: false,
      productId: null,
      pending,
      unavailable: false,
    };
  } catch {
    return {
      owned: false,
      productId: null,
      pending: false,
      unavailable: false,
    };
  }
}

/**
 * When StoreKit reports the non-consumable is already owned, confirm via an
 * owned-purchase query before unlocking. Never grant without store ownership.
 */
async function resolveAlreadyOwnedPurchase(): Promise<PurchaseOutcome> {
  // Purchase was user-initiated; interactive restore is allowed here.
  const owned = await queryOwnedLifetimePurchase({ interactiveRestore: true });
  if (owned.owned && owned.productId) {
    return { status: 'success', productId: owned.productId };
  }
  if (owned.pending) {
    return {
      status: 'pending',
      productId: getLifetimeProductId(),
    };
  }
  return {
    status: 'failed',
    message:
      'The store reported this product is already owned, but ownership could not be confirmed yet. Try Restore Purchase.',
  };
}

function isAlreadyOwnedError(
  error: unknown,
  errorCodeAlreadyOwned: string,
): boolean {
  if (!error || typeof error !== 'object' || !('code' in error)) {
    return false;
  }
  return (error as { code?: string }).code === errorCodeAlreadyOwned;
}

/**
 * Start a lifetime purchase. Resolves when the store reports success, cancel, or failure.
 * Unlock must only happen after status === 'success' (including confirmed already-owned).
 */
export function purchaseLifetime(): Promise<PurchaseOutcome> {
  return new Promise(async (resolve) => {
    if (!isNativeIapAvailable()) {
      resolve({
        status: 'unavailable',
        message: STORE_UNAVAILABLE_MESSAGE,
      });
      return;
    }

    const mod = await loadStore();
    if (!mod) {
      resolve({
        status: 'unavailable',
        message: STORE_UNAVAILABLE_MESSAGE,
      });
      return;
    }
    if (!connected) {
      const ok = await connectStore();
      if (!ok) {
        resolve({
          status: 'unavailable',
          message: 'Could not connect to the store.',
        });
        return;
      }
    }

    const productId = getLifetimeProductId();
    let settled = false;
    const finish = (outcome: PurchaseOutcome) => {
      if (settled) {
        return;
      }
      settled = true;
      updated.remove();
      errored.remove();
      resolve(outcome);
    };

    const updated = mod.purchaseUpdatedListener(async (purchase) => {
      if (!matchesLifetimeProduct(purchase.productId)) {
        return;
      }
      if (purchase.purchaseState === 'pending') {
        finish({ status: 'pending', productId: purchase.productId });
        return;
      }
      try {
        await mod.finishTransaction({
          purchase,
          isConsumable: false,
        });
        finish({ status: 'success', productId: purchase.productId });
      } catch (error) {
        finish({
          status: 'failed',
          message:
            error instanceof Error
              ? error.message
              : 'Could not finish the purchase transaction.',
        });
      }
    });

    const errored = mod.purchaseErrorListener((error) => {
      if (error.code === mod.ErrorCode.UserCancelled) {
        finish({ status: 'cancelled' });
        return;
      }
      if (error.code === mod.ErrorCode.AlreadyOwned) {
        void resolveAlreadyOwnedPurchase().then(finish);
        return;
      }
      finish({
        status: 'failed',
        message: error.message || 'Purchase failed.',
      });
    });

    try {
      await mod.requestPurchase({
        type: 'in-app',
        request: {
          apple: { sku: productId },
          google: { skus: [productId] },
        },
      });
    } catch (error) {
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        (error as { code?: string }).code === mod.ErrorCode.UserCancelled
      ) {
        finish({ status: 'cancelled' });
        return;
      }
      if (isAlreadyOwnedError(error, mod.ErrorCode.AlreadyOwned)) {
        finish(await resolveAlreadyOwnedPurchase());
        return;
      }
      finish({
        status: 'failed',
        message:
          error instanceof Error ? error.message : 'Purchase request failed.',
      });
    }
  });
}

export { STORE_UNAVAILABLE_MESSAGE, isNativeIapAvailable };
