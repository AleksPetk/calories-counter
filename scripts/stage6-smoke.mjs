/**
 * Stage 6+ logging / library smoke checks.
 */
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function calculateItemNutrition(item, portion) {
  return {
    calories: item.calories * portion,
    protein: item.protein == null ? null : item.protein * portion,
    carbs: item.carbs == null ? null : item.carbs * portion,
    fat: item.fat == null ? null : item.fat * portion,
  };
}

{
  const item = { calories: 100, protein: 10, carbs: 5, fat: 2 };
  assert.equal(calculateItemNutrition(item, 1).calories, 100);
  assert.equal(calculateItemNutrition(item, 1.5).calories, 150);
  assert.equal(calculateItemNutrition(item, 2).calories, 200);
}

{
  const db = new DatabaseSync(':memory:');
  db.exec(`
    CREATE TABLE library_items (
      id TEXT PRIMARY KEY, name TEXT, calories REAL, protein REAL,
      carbs REAL, fat REAL, logging_mode TEXT
    );
    CREATE TABLE daily_log_entries (
      id TEXT PRIMARY KEY, date TEXT, time TEXT, source_type TEXT,
      source_id TEXT, calories REAL, protein REAL, carbs REAL, fat REAL,
      food_name_snapshot TEXT, portion REAL
    );
  `);
  db.prepare(
    `INSERT INTO library_items VALUES ('i1','Egg',78,6,1,5,'portion')`,
  ).run();
  db.prepare(
    `INSERT INTO daily_log_entries VALUES
      ('l1','2026-08-02','t','library','i1',156,12,2,10,'Egg',2)`,
  ).run();
  db.prepare(`UPDATE library_items SET name='Egg Updated', calories=999`).run();
  const log = db
    .prepare(`SELECT food_name_snapshot, calories, source_type FROM daily_log_entries WHERE id='l1'`)
    .get();
  assert.equal(log.food_name_snapshot, 'Egg');
  assert.equal(log.calories, 156);
  assert.equal(log.source_type, 'library');
}

{
  const brand = readFileSync(join(root, 'src/config/appBrand.ts'), 'utf8');
  assert.match(brand, /appName: 'QuickCal'/);
  const types = readFileSync(join(root, 'src/types/libraryItem.ts'), 'utf8');
  assert.match(types, /LoggingMode/);
  const seed = readFileSync(join(root, 'src/data/seed/devSeedData.ts'), 'utf8');
  assert.match(seed, /loggingMode: 'quick'/);
  assert.match(seed, /loggingMode: 'portion'/);
  const migrate = readFileSync(join(root, 'src/data/database/migrate.ts'), 'utf8');
  assert.match(migrate, /library_items/);
  assert.match(migrate, /version: 3/);
}

console.log('ok unified library / logging smoke');
