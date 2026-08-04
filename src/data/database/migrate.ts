import type { SQLiteDatabase } from 'expo-sqlite';

import {
  DEFAULT_DAILY_GOAL,
  DEFAULT_HISTORY_RETENTION_DAYS,
  DEFAULT_RESET_TIME,
  SCHEMA_VERSION,
} from './constants';
import {
  CALORIE_PLAN_SQL,
  ENTITLEMENT_SQL,
  LIBRARY_ITEMS_SQL,
  SCHEMA_V1_SQL,
} from './schema';
import { nowIso } from './utils';

type Migration = {
  version: number;
  up: (db: SQLiteDatabase) => Promise<void>;
};

type FoodMigRow = {
  id: string;
  name: string;
  calories: number;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  image: string | null;
  pinned: number;
  created_at: string;
  updated_at: string;
};

type MealMigRow = {
  id: string;
  name: string;
  image: string | null;
  pinned: number;
  created_at: string;
  updated_at: string;
};

type MealItemMigRow = {
  meal_id: string;
  food_id: string;
  portion: number;
};

function flattenMealNutrition(
  items: MealItemMigRow[],
  foodsById: Map<string, FoodMigRow>,
): {
  calories: number;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
} {
  if (items.length === 0) {
    return { calories: 0, protein: null, carbs: null, fat: null };
  }

  let calories = 0;
  let proteinSum = 0;
  let carbsSum = 0;
  let fatSum = 0;
  let proteinMissing = false;
  let carbsMissing = false;
  let fatMissing = false;

  for (const item of items) {
    const food = foodsById.get(item.food_id);
    if (!food) {
      continue;
    }
    calories += food.calories * item.portion;
    if (food.protein == null) {
      proteinMissing = true;
    } else {
      proteinSum += food.protein * item.portion;
    }
    if (food.carbs == null) {
      carbsMissing = true;
    } else {
      carbsSum += food.carbs * item.portion;
    }
    if (food.fat == null) {
      fatMissing = true;
    } else {
      fatSum += food.fat * item.portion;
    }
  }

  return {
    calories,
    protein: proteinMissing ? null : proteinSum,
    carbs: carbsMissing ? null : carbsSum,
    fat: fatMissing ? null : fatSum,
  };
}

async function migrateToLibraryItems(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(LIBRARY_ITEMS_SQL);

  const foods = await db.getAllAsync<FoodMigRow>(`SELECT * FROM foods`);
  const foodsById = new Map(foods.map((food) => [food.id, food]));

  for (const food of foods) {
    await db.runAsync(
      `INSERT INTO library_items (
        id, name, calories, protein, carbs, fat, image, pinned,
        logging_mode, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'portion', ?, ?)`,
      food.id,
      food.name,
      food.calories,
      food.protein,
      food.carbs,
      food.fat,
      food.image,
      food.pinned,
      food.created_at,
      food.updated_at,
    );
  }

  const meals = await db.getAllAsync<MealMigRow>(`SELECT * FROM meals`);
  const mealItems = await db.getAllAsync<MealItemMigRow>(
    `SELECT meal_id, food_id, portion FROM meal_items`,
  );
  const itemsByMeal = new Map<string, MealItemMigRow[]>();
  for (const item of mealItems) {
    const list = itemsByMeal.get(item.meal_id) ?? [];
    list.push(item);
    itemsByMeal.set(item.meal_id, list);
  }

  for (const meal of meals) {
    const nutrition = flattenMealNutrition(
      itemsByMeal.get(meal.id) ?? [],
      foodsById,
    );
    await db.runAsync(
      `INSERT OR IGNORE INTO library_items (
        id, name, calories, protein, carbs, fat, image, pinned,
        logging_mode, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'quick', ?, ?)`,
      meal.id,
      meal.name,
      nutrition.calories,
      nutrition.protein,
      nutrition.carbs,
      nutrition.fat,
      meal.image,
      meal.pinned,
      meal.created_at,
      meal.updated_at,
    );
  }

  // Expand source_type CHECK to include 'library' without rewriting rows.
  await db.execAsync(`
    CREATE TABLE daily_log_entries_v3 (
      id TEXT PRIMARY KEY NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      source_type TEXT NOT NULL
        CHECK (source_type IN ('food', 'meal', 'quick', 'library')),
      source_id TEXT,
      calories REAL NOT NULL,
      protein REAL,
      carbs REAL,
      fat REAL,
      food_name_snapshot TEXT NOT NULL,
      portion REAL
    );
    INSERT INTO daily_log_entries_v3
      SELECT id, date, time, source_type, source_id, calories,
             protein, carbs, fat, food_name_snapshot, portion
      FROM daily_log_entries;
    DROP TABLE daily_log_entries;
    ALTER TABLE daily_log_entries_v3 RENAME TO daily_log_entries;
    CREATE INDEX IF NOT EXISTS idx_daily_log_entries_date
      ON daily_log_entries(date);
  `);

  await db.execAsync(`
    DROP TABLE IF EXISTS meal_items;
    DROP TABLE IF EXISTS meals;
    DROP TABLE IF EXISTS foods;
  `);
}

const migrations: Migration[] = [
  {
    version: 1,
    up: async (db) => {
      await db.execAsync(SCHEMA_V1_SQL);

      const timestamp = nowIso();
      await db.runAsync(
        `INSERT OR IGNORE INTO profile (
          id, nickname, photo, age, sex, height, weight,
          activity_level, goal, updated_at
        ) VALUES (1, NULL, NULL, NULL, 'unspecified', NULL, NULL,
          'unspecified', 'unspecified', ?)`,
        timestamp,
      );

      await db.runAsync(
        `INSERT OR IGNORE INTO settings (
          id, daily_goal, reset_time, history_retention,
          tutorial_seen, purchase_state, updated_at
        ) VALUES (1, ?, ?, ?, 0, 'trial', ?)`,
        DEFAULT_DAILY_GOAL,
        DEFAULT_RESET_TIME,
        DEFAULT_HISTORY_RETENTION_DAYS,
        timestamp,
      );
    },
  },
  {
    version: 2,
    up: async (db) => {
      await db.execAsync(
        `ALTER TABLE settings ADD COLUMN theme_id TEXT NOT NULL DEFAULT 'modernGreen'`,
      );
    },
  },
  {
    version: 3,
    up: async (db) => {
      await db.withTransactionAsync(async () => {
        await migrateToLibraryItems(db);
      });
    },
  },
  {
    version: 4,
    up: async (db) => {
      await db.execAsync(ENTITLEMENT_SQL);
      const timestamp = nowIso();
      await db.runAsync(
        `INSERT OR IGNORE INTO entitlement (
          id, trial_started_at, trial_expires_at,
          store_purchased, store_product_id, store_platform,
          store_purchased_at, last_store_check_at,
          simulated_purchased, updated_at
        ) VALUES (1, NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, ?)`,
        timestamp,
      );

      // Migrate legacy settings.purchase_state=purchased into store cache
      // only as a local hint — real store verification still required on refresh.
      const settings = await db.getFirstAsync<{ purchase_state: string }>(
        `SELECT purchase_state FROM settings WHERE id = 1`,
      );
      if (settings?.purchase_state === 'purchased') {
        await db.runAsync(
          `UPDATE entitlement SET
            store_purchased = 1,
            store_purchased_at = COALESCE(store_purchased_at, ?),
            updated_at = ?
          WHERE id = 1 AND store_purchased = 0`,
          timestamp,
          timestamp,
        );
      }
    },
  },
  {
    version: 5,
    up: async (db) => {
      await db.execAsync(
        `ALTER TABLE settings ADD COLUMN protein_goal REAL`,
      );
      await db.execAsync(`ALTER TABLE settings ADD COLUMN carbs_goal REAL`);
      await db.execAsync(`ALTER TABLE settings ADD COLUMN fat_goal REAL`);
      await db.execAsync(CALORIE_PLAN_SQL);
    },
  },
];

export async function migrate(db: SQLiteDatabase): Promise<void> {
  await db.execAsync('PRAGMA foreign_keys = ON;');

  const row = await db.getFirstAsync<{ user_version: number }>(
    'PRAGMA user_version',
  );
  const currentVersion = row?.user_version ?? 0;

  for (const migration of migrations) {
    if (migration.version <= currentVersion) {
      continue;
    }
    await migration.up(db);
    await db.execAsync(`PRAGMA user_version = ${migration.version}`);
  }

  if (SCHEMA_VERSION < currentVersion) {
    throw new Error(
      `Database schema version ${currentVersion} is newer than supported ${SCHEMA_VERSION}.`,
    );
  }
}
