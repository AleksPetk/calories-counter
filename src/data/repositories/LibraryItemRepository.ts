import type { SQLiteDatabase } from 'expo-sqlite';

import type {
  LibraryItem,
  LibraryItemInsert,
  LibraryItemUpdate,
} from '../../types';
import { LibraryItemRow, mapLibraryItem } from '../database/mappers';
import { boolToInt, createId, nowIso } from '../database/utils';

export class LibraryItemRepository {
  constructor(private readonly db: SQLiteDatabase) {}

  async getAll(): Promise<LibraryItem[]> {
    const rows = await this.db.getAllAsync<LibraryItemRow>(
      `SELECT * FROM library_items ORDER BY name COLLATE NOCASE ASC`,
    );
    return rows.map(mapLibraryItem);
  }

  async getPinned(): Promise<LibraryItem[]> {
    const rows = await this.db.getAllAsync<LibraryItemRow>(
      `SELECT * FROM library_items WHERE pinned = 1 ORDER BY name COLLATE NOCASE ASC`,
    );
    return rows.map(mapLibraryItem);
  }

  async getById(id: string): Promise<LibraryItem | null> {
    const row = await this.db.getFirstAsync<LibraryItemRow>(
      `SELECT * FROM library_items WHERE id = ?`,
      id,
    );
    return row ? mapLibraryItem(row) : null;
  }

  async create(input: LibraryItemInsert): Promise<LibraryItem> {
    const id = input.id ?? createId();
    const timestamp = nowIso();
    await this.db.runAsync(
      `INSERT INTO library_items (
        id, name, calories, protein, carbs, fat, image, pinned,
        logging_mode, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      id,
      input.name,
      input.calories,
      input.protein ?? null,
      input.carbs ?? null,
      input.fat ?? null,
      input.image ?? null,
      boolToInt(input.pinned ?? false),
      input.loggingMode,
      timestamp,
      timestamp,
    );
    const created = await this.getById(id);
    if (!created) {
      throw new Error(`Failed to create library item ${id}`);
    }
    return created;
  }

  async update(id: string, patch: LibraryItemUpdate): Promise<LibraryItem> {
    const existing = await this.getById(id);
    if (!existing) {
      throw new Error(`Library item not found: ${id}`);
    }

    const next: LibraryItem = {
      ...existing,
      ...patch,
      protein: patch.protein !== undefined ? patch.protein : existing.protein,
      carbs: patch.carbs !== undefined ? patch.carbs : existing.carbs,
      fat: patch.fat !== undefined ? patch.fat : existing.fat,
      image: patch.image !== undefined ? patch.image : existing.image,
      loggingMode:
        patch.loggingMode !== undefined
          ? patch.loggingMode
          : existing.loggingMode,
      updatedAt: nowIso(),
    };

    await this.db.runAsync(
      `UPDATE library_items SET
        name = ?, calories = ?, protein = ?, carbs = ?, fat = ?,
        image = ?, pinned = ?, logging_mode = ?, updated_at = ?
      WHERE id = ?`,
      next.name,
      next.calories,
      next.protein,
      next.carbs,
      next.fat,
      next.image,
      boolToInt(next.pinned),
      next.loggingMode,
      next.updatedAt,
      id,
    );

    return next;
  }

  async delete(id: string): Promise<void> {
    await this.db.runAsync(`DELETE FROM library_items WHERE id = ?`, id);
  }
}
