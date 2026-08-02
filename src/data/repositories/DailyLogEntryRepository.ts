import type { SQLiteDatabase } from 'expo-sqlite';

import type {
  DailyLogEntry,
  DailyLogEntryInsert,
  DailyLogEntryUpdate,
} from '../../types';
import { DailyLogEntryRow, mapDailyLogEntry } from '../database/mappers';
import { createId } from '../database/utils';

export class DailyLogEntryRepository {
  constructor(private readonly db: SQLiteDatabase) {}

  async getByDate(date: string): Promise<DailyLogEntry[]> {
    const rows = await this.db.getAllAsync<DailyLogEntryRow>(
      `SELECT * FROM daily_log_entries WHERE date = ? ORDER BY time ASC`,
      date,
    );
    return rows.map(mapDailyLogEntry);
  }

  async getLatestByDate(date: string): Promise<DailyLogEntry | null> {
    const row = await this.db.getFirstAsync<DailyLogEntryRow>(
      `SELECT * FROM daily_log_entries WHERE date = ? ORDER BY time DESC LIMIT 1`,
      date,
    );
    return row ? mapDailyLogEntry(row) : null;
  }

  async getById(id: string): Promise<DailyLogEntry | null> {
    const row = await this.db.getFirstAsync<DailyLogEntryRow>(
      `SELECT * FROM daily_log_entries WHERE id = ?`,
      id,
    );
    return row ? mapDailyLogEntry(row) : null;
  }

  async create(input: DailyLogEntryInsert): Promise<DailyLogEntry> {
    const id = input.id ?? createId();
    await this.db.runAsync(
      `INSERT INTO daily_log_entries (
        id, date, time, source_type, source_id, calories,
        protein, carbs, fat, food_name_snapshot, portion
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      id,
      input.date,
      input.time,
      input.sourceType,
      input.sourceId ?? null,
      input.calories,
      input.protein ?? null,
      input.carbs ?? null,
      input.fat ?? null,
      input.foodNameSnapshot,
      input.portion ?? null,
    );
    const created = await this.getById(id);
    if (!created) {
      throw new Error(`Failed to create daily log entry ${id}`);
    }
    return created;
  }

  async update(id: string, patch: DailyLogEntryUpdate): Promise<DailyLogEntry> {
    const existing = await this.getById(id);
    if (!existing) {
      throw new Error(`Daily log entry not found: ${id}`);
    }

    const next: DailyLogEntry = {
      ...existing,
      ...patch,
      sourceId:
        patch.sourceId !== undefined ? patch.sourceId : existing.sourceId,
      protein: patch.protein !== undefined ? patch.protein : existing.protein,
      carbs: patch.carbs !== undefined ? patch.carbs : existing.carbs,
      fat: patch.fat !== undefined ? patch.fat : existing.fat,
      portion: patch.portion !== undefined ? patch.portion : existing.portion,
    };

    await this.db.runAsync(
      `UPDATE daily_log_entries SET
        date = ?, time = ?, source_type = ?, source_id = ?, calories = ?,
        protein = ?, carbs = ?, fat = ?, food_name_snapshot = ?, portion = ?
      WHERE id = ?`,
      next.date,
      next.time,
      next.sourceType,
      next.sourceId,
      next.calories,
      next.protein,
      next.carbs,
      next.fat,
      next.foodNameSnapshot,
      next.portion,
      id,
    );

    return next;
  }

  async delete(id: string): Promise<void> {
    await this.db.runAsync(`DELETE FROM daily_log_entries WHERE id = ?`, id);
  }
}
