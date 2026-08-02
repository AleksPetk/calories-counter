import type { SQLiteDatabase } from 'expo-sqlite';

import type { EntitlementRecord, StorePlatform } from '../../entitlement/types';
import { nowIso } from '../database/utils';

type EntitlementRow = {
  id: number;
  trial_started_at: string | null;
  trial_expires_at: string | null;
  store_purchased: number;
  store_product_id: string | null;
  store_platform: string | null;
  store_purchased_at: string | null;
  last_store_check_at: string | null;
  simulated_purchased: number;
  updated_at: string;
};

function mapRow(row: EntitlementRow): EntitlementRecord {
  const platform = row.store_platform;
  return {
    trialStartedAt: row.trial_started_at,
    trialExpiresAt: row.trial_expires_at,
    storePurchased: row.store_purchased === 1,
    storeProductId: row.store_product_id,
    storePlatform:
      platform === 'ios' || platform === 'android'
        ? (platform as StorePlatform)
        : null,
    storePurchasedAt: row.store_purchased_at,
    lastStoreCheckAt: row.last_store_check_at,
    simulatedPurchased: row.simulated_purchased === 1,
    updatedAt: row.updated_at,
  };
}

export class EntitlementRepository {
  constructor(private readonly db: SQLiteDatabase) {}

  async get(): Promise<EntitlementRecord> {
    const row = await this.db.getFirstAsync<EntitlementRow>(
      `SELECT * FROM entitlement WHERE id = 1`,
    );
    if (!row) {
      throw new Error('Entitlement row missing');
    }
    return mapRow(row);
  }

  async update(
    patch: Partial<
      Omit<EntitlementRecord, 'updatedAt'>
    >,
  ): Promise<EntitlementRecord> {
    const current = await this.get();
    const next: EntitlementRecord = {
      ...current,
      ...patch,
      updatedAt: nowIso(),
    };

    await this.db.runAsync(
      `UPDATE entitlement SET
        trial_started_at = ?,
        trial_expires_at = ?,
        store_purchased = ?,
        store_product_id = ?,
        store_platform = ?,
        store_purchased_at = ?,
        last_store_check_at = ?,
        simulated_purchased = ?,
        updated_at = ?
      WHERE id = 1`,
      next.trialStartedAt,
      next.trialExpiresAt,
      next.storePurchased ? 1 : 0,
      next.storeProductId,
      next.storePlatform,
      next.storePurchasedAt,
      next.lastStoreCheckAt,
      next.simulatedPurchased ? 1 : 0,
      next.updatedAt,
    );

    return next;
  }
}
