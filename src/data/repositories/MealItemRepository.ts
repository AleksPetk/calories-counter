import type { SQLiteDatabase } from 'expo-sqlite';

import type { MealItem, MealItemInsert, MealItemUpdate } from '../../types';
import { MealItemRow, mapMealItem } from '../database/mappers';
import { createId } from '../database/utils';

export class MealItemRepository {
  constructor(private readonly db: SQLiteDatabase) {}

  async getByMealId(mealId: string): Promise<MealItem[]> {
    const rows = await this.db.getAllAsync<MealItemRow>(
      `SELECT * FROM meal_items WHERE meal_id = ? ORDER BY sort_order ASC`,
      mealId,
    );
    return rows.map(mapMealItem);
  }

  async getById(id: string): Promise<MealItem | null> {
    const row = await this.db.getFirstAsync<MealItemRow>(
      `SELECT * FROM meal_items WHERE id = ?`,
      id,
    );
    return row ? mapMealItem(row) : null;
  }

  async create(input: MealItemInsert): Promise<MealItem> {
    const id = input.id ?? createId();
    await this.db.runAsync(
      `INSERT INTO meal_items (id, meal_id, food_id, portion, sort_order)
       VALUES (?, ?, ?, ?, ?)`,
      id,
      input.mealId,
      input.foodId,
      input.portion,
      input.sortOrder,
    );
    const created = await this.getById(id);
    if (!created) {
      throw new Error(`Failed to create meal item ${id}`);
    }
    return created;
  }

  async update(id: string, patch: MealItemUpdate): Promise<MealItem> {
    const existing = await this.getById(id);
    if (!existing) {
      throw new Error(`Meal item not found: ${id}`);
    }

    const next: MealItem = {
      ...existing,
      ...patch,
    };

    await this.db.runAsync(
      `UPDATE meal_items SET portion = ?, sort_order = ? WHERE id = ?`,
      next.portion,
      next.sortOrder,
      id,
    );

    return next;
  }

  async delete(id: string): Promise<void> {
    await this.db.runAsync(`DELETE FROM meal_items WHERE id = ?`, id);
  }

  async deleteByMealId(mealId: string): Promise<void> {
    await this.db.runAsync(`DELETE FROM meal_items WHERE meal_id = ?`, mealId);
  }
}
