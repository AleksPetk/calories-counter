import type { SQLiteDatabase } from 'expo-sqlite';

import type { Food, FoodInsert, FoodUpdate } from '../../types';
import { FoodRow, mapFood } from '../database/mappers';
import { boolToInt, createId, nowIso } from '../database/utils';

export class FoodRepository {
  constructor(private readonly db: SQLiteDatabase) {}

  async getAll(): Promise<Food[]> {
    const rows = await this.db.getAllAsync<FoodRow>(
      `SELECT * FROM foods ORDER BY name COLLATE NOCASE ASC`,
    );
    return rows.map(mapFood);
  }

  async getPinned(): Promise<Food[]> {
    const rows = await this.db.getAllAsync<FoodRow>(
      `SELECT * FROM foods WHERE pinned = 1 ORDER BY name COLLATE NOCASE ASC`,
    );
    return rows.map(mapFood);
  }

  async getById(id: string): Promise<Food | null> {
    const row = await this.db.getFirstAsync<FoodRow>(
      `SELECT * FROM foods WHERE id = ?`,
      id,
    );
    return row ? mapFood(row) : null;
  }

  async create(input: FoodInsert): Promise<Food> {
    const id = input.id ?? createId();
    const timestamp = nowIso();
    await this.db.runAsync(
      `INSERT INTO foods (
        id, name, calories, protein, carbs, fat, image, pinned, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      id,
      input.name,
      input.calories,
      input.protein ?? null,
      input.carbs ?? null,
      input.fat ?? null,
      input.image ?? null,
      boolToInt(input.pinned ?? false),
      timestamp,
      timestamp,
    );
    const created = await this.getById(id);
    if (!created) {
      throw new Error(`Failed to create food ${id}`);
    }
    return created;
  }

  async update(id: string, patch: FoodUpdate): Promise<Food> {
    const existing = await this.getById(id);
    if (!existing) {
      throw new Error(`Food not found: ${id}`);
    }

    const next: Food = {
      ...existing,
      ...patch,
      protein: patch.protein !== undefined ? patch.protein : existing.protein,
      carbs: patch.carbs !== undefined ? patch.carbs : existing.carbs,
      fat: patch.fat !== undefined ? patch.fat : existing.fat,
      image: patch.image !== undefined ? patch.image : existing.image,
      updatedAt: nowIso(),
    };

    await this.db.runAsync(
      `UPDATE foods SET
        name = ?, calories = ?, protein = ?, carbs = ?, fat = ?,
        image = ?, pinned = ?, updated_at = ?
      WHERE id = ?`,
      next.name,
      next.calories,
      next.protein,
      next.carbs,
      next.fat,
      next.image,
      boolToInt(next.pinned),
      next.updatedAt,
      id,
    );

    return next;
  }

  async delete(id: string): Promise<void> {
    await this.db.runAsync(`DELETE FROM foods WHERE id = ?`, id);
  }
}
