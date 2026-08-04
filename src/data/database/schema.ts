/**
 * Initial schema (version 1) — historical.
 * Later migrations evolve toward library_items (v3).
 *
 * Portion is stored as REAL; unit semantics are deferred.
 * Image fields store local filesystem paths, not bundled assets.
 * Settings is a single-row table (id = 1).
 * Legacy `profile` table may still exist from older installs; unused by the app.
 */
export const SCHEMA_V1_SQL = `
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS foods (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  calories REAL NOT NULL,
  protein REAL,
  carbs REAL,
  fat REAL,
  image TEXT,
  pinned INTEGER NOT NULL DEFAULT 0 CHECK (pinned IN (0, 1)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS meals (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  image TEXT,
  pinned INTEGER NOT NULL DEFAULT 0 CHECK (pinned IN (0, 1)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS meal_items (
  id TEXT PRIMARY KEY NOT NULL,
  meal_id TEXT NOT NULL,
  food_id TEXT NOT NULL,
  portion REAL NOT NULL,
  sort_order INTEGER NOT NULL,
  FOREIGN KEY (meal_id) REFERENCES meals(id) ON DELETE CASCADE,
  FOREIGN KEY (food_id) REFERENCES foods(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_meal_items_meal_id ON meal_items(meal_id);
CREATE INDEX IF NOT EXISTS idx_meal_items_food_id ON meal_items(food_id);

CREATE TABLE IF NOT EXISTS daily_log_entries (
  id TEXT PRIMARY KEY NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('food', 'meal', 'quick')),
  source_id TEXT,
  calories REAL NOT NULL,
  protein REAL,
  carbs REAL,
  fat REAL,
  food_name_snapshot TEXT NOT NULL,
  portion REAL
);

CREATE INDEX IF NOT EXISTS idx_daily_log_entries_date ON daily_log_entries(date);

CREATE TABLE IF NOT EXISTS profile (
  id INTEGER PRIMARY KEY NOT NULL CHECK (id = 1),
  nickname TEXT,
  photo TEXT,
  age INTEGER,
  sex TEXT NOT NULL DEFAULT 'unspecified',
  height REAL,
  weight REAL,
  activity_level TEXT NOT NULL DEFAULT 'unspecified',
  goal TEXT NOT NULL DEFAULT 'unspecified',
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY NOT NULL CHECK (id = 1),
  daily_goal REAL NOT NULL,
  reset_time TEXT NOT NULL,
  history_retention INTEGER,
  tutorial_seen INTEGER NOT NULL DEFAULT 0 CHECK (tutorial_seen IN (0, 1)),
  purchase_state TEXT NOT NULL DEFAULT 'trial'
    CHECK (purchase_state IN ('trial', 'purchased', 'locked')),
  updated_at TEXT NOT NULL
);
`;

/** Canonical library_items DDL after migration v3. */
export const LIBRARY_ITEMS_SQL = `
CREATE TABLE IF NOT EXISTS library_items (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  calories REAL NOT NULL,
  protein REAL,
  carbs REAL,
  fat REAL,
  image TEXT,
  pinned INTEGER NOT NULL DEFAULT 0 CHECK (pinned IN (0, 1)),
  logging_mode TEXT NOT NULL DEFAULT 'portion'
    CHECK (logging_mode IN ('quick', 'portion')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
`;

/**
 * Entitlement row — separate from settings.
 * Survives Erase All Data (trial timestamps + store purchase cache).
 */
export const ENTITLEMENT_SQL = `
CREATE TABLE IF NOT EXISTS entitlement (
  id INTEGER PRIMARY KEY NOT NULL CHECK (id = 1),
  trial_started_at TEXT,
  trial_expires_at TEXT,
  store_purchased INTEGER NOT NULL DEFAULT 0
    CHECK (store_purchased IN (0, 1)),
  store_product_id TEXT,
  store_platform TEXT,
  store_purchased_at TEXT,
  last_store_check_at TEXT,
  simulated_purchased INTEGER NOT NULL DEFAULT 0
    CHECK (simulated_purchased IN (0, 1)),
  updated_at TEXT NOT NULL
);
`;

/**
 * Calorie Planner — questionnaire answers + static recommendation snapshot.
 * Independent of logging history. Cleared by Erase All. Included in backups.
 */
export const CALORIE_PLAN_SQL = `
CREATE TABLE IF NOT EXISTS calorie_plan (
  id INTEGER PRIMARY KEY NOT NULL CHECK (id = 1),
  sex TEXT NOT NULL CHECK (sex IN ('male', 'female')),
  age INTEGER NOT NULL,
  height_cm REAL NOT NULL,
  weight_kg REAL NOT NULL,
  unit_pref TEXT NOT NULL CHECK (unit_pref IN ('metric', 'imperial')),
  activity TEXT NOT NULL,
  training TEXT NOT NULL,
  goal TEXT NOT NULL,
  pregnant_or_breastfeeding INTEGER NOT NULL DEFAULT 0
    CHECK (pregnant_or_breastfeeding IN (0, 1)),
  ed_screening INTEGER NOT NULL DEFAULT 0
    CHECK (ed_screening IN (0, 1)),
  age_over_80_acknowledged INTEGER NOT NULL DEFAULT 0
    CHECK (age_over_80_acknowledged IN (0, 1)),
  rmr_kcal REAL,
  tdee_kcal REAL,
  target_kcal REAL,
  protein_g REAL,
  carbs_g REAL,
  fat_g REAL,
  bmi REAL,
  warnings_json TEXT,
  calculated_at TEXT,
  applied_at TEXT,
  formula_version TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
`;
