import type { SQLiteDatabase } from 'expo-sqlite';

import type { Meal, MealInsert, MealUpdate } from '../../types';
import { MealRow, mapMeal } from '../database/mappers';
import { boolToInt, createId, nowIso } from '../database/utils';

export class MealRepository {
  constructor(private readonly db: SQLiteDatabase) {}

  async getAll(): Promise<Meal[]> {
    const rows = await this.db.getAllAsync<MealRow>(
      `SELECT * FROM meals ORDER BY name COLLATE NOCASE ASC`,
    );
    return rows.map(mapMeal);
  }

  async getPinned(): Promise<Meal[]> {
    const rows = await this.db.getAllAsync<MealRow>(
      `SELECT * FROM meals WHERE pinned = 1 ORDER BY name COLLATE NOCASE ASC`,
    );
    return rows.map(mapMeal);
  }

  async getById(id: string): Promise<Meal | null> {
    const row = await this.db.getFirstAsync<MealRow>(
      `SELECT * FROM meals WHERE id = ?`,
      id,
    );
    return row ? mapMeal(row) : null;
  }

  async create(input: MealInsert): Promise<Meal> {
    const id = input.id ?? createId();
    const timestamp = nowIso();
    await this.db.runAsync(
      `INSERT INTO meals (id, name, image, pinned, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      id,
      input.name,
      input.image ?? null,
      boolToInt(input.pinned ?? false),
      timestamp,
      timestamp,
    );
    const created = await this.getById(id);
    if (!created) {
      throw new Error(`Failed to create meal ${id}`);
    }
    return created;
  }

  async update(id: string, patch: MealUpdate): Promise<Meal> {
    const existing = await this.getById(id);
    if (!existing) {
      throw new Error(`Meal not found: ${id}`);
    }

    const next: Meal = {
      ...existing,
      ...patch,
      image: patch.image !== undefined ? patch.image : existing.image,
      updatedAt: nowIso(),
    };

    await this.db.runAsync(
      `UPDATE meals SET name = ?, image = ?, pinned = ?, updated_at = ?
       WHERE id = ?`,
      next.name,
      next.image,
      boolToInt(next.pinned),
      next.updatedAt,
      id,
    );

    return next;
  }

  async delete(id: string): Promise<void> {
    await this.db.runAsync(`DELETE FROM meals WHERE id = ?`, id);
  }
}
