import type { SQLiteDatabase } from 'expo-sqlite';

import type { Settings, SettingsUpdate } from '../../types';
import { SettingsRow, mapSettings } from '../database/mappers';
import { boolToInt, nowIso } from '../database/utils';

export class SettingsRepository {
  constructor(private readonly db: SQLiteDatabase) {}

  async get(): Promise<Settings> {
    const row = await this.db.getFirstAsync<SettingsRow>(
      `SELECT * FROM settings WHERE id = 1`,
    );
    if (!row) {
      throw new Error('Settings row missing');
    }
    return mapSettings(row);
  }

  async update(patch: SettingsUpdate): Promise<Settings> {
    const existing = await this.get();
    const next: Settings = {
      ...existing,
      ...patch,
      historyRetention:
        patch.historyRetention !== undefined
          ? patch.historyRetention
          : existing.historyRetention,
      updatedAt: nowIso(),
    };

    await this.db.runAsync(
      `UPDATE settings SET
        daily_goal = ?, reset_time = ?, history_retention = ?,
        tutorial_seen = ?, purchase_state = ?, updated_at = ?
      WHERE id = 1`,
      next.dailyGoal,
      next.resetTime,
      next.historyRetention,
      boolToInt(next.tutorialSeen),
      next.purchaseState,
      next.updatedAt,
    );

    return next;
  }
}
