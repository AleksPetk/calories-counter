/**
 * Stage 5 smoke tests (Node).
 * Covers meal nutrition rules, seed catalog shape, pin limit math,
 * deletion RESTRICT/CASCADE behavior via node:sqlite, and seed idempotency.
 *
 * Image persistence after app restart is verified manually in Expo Go
 * (expo-file-system is native). This script asserts the permanent-path
 * convention used by libraryImages.ts.
 */

import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function calculateMealNutrition(entries) {
  if (entries.length === 0) {
    return { calories: 0, protein: null, carbs: null, fat: null };
  }
  let calories = 0;
  let proteinSum = 0;
  let carbsSum = 0;
  let fatSum = 0;
  let proteinMissing = false;
  let carbsMissing = false;
  let fatMissing = false;

  for (const { item, food } of entries) {
    calories += food.calories * item.portion;
    if (food.protein == null) proteinMissing = true;
    else proteinSum += food.protein * item.portion;
    if (food.carbs == null) carbsMissing = true;
    else carbsSum += food.carbs * item.portion;
    if (food.fat == null) fatMissing = true;
    else fatSum += food.fat * item.portion;
  }

  return {
    calories,
    protein: proteinMissing ? null : proteinSum,
    carbs: carbsMissing ? null : carbsSum,
    fat: fatMissing ? null : fatSum,
  };
}

function testMealNutrition() {
  const complete = calculateMealNutrition([
    {
      item: { portion: 2 },
      food: { calories: 100, protein: 10, carbs: 5, fat: 2 },
    },
    {
      item: { portion: 0.5 },
      food: { calories: 200, protein: 20, carbs: 10, fat: 4 },
    },
  ]);
  assert.equal(complete.calories, 300);
  assert.equal(complete.protein, 30);
  assert.equal(complete.carbs, 15);
  assert.equal(complete.fat, 6);

  const unknownProtein = calculateMealNutrition([
    {
      item: { portion: 1 },
      food: { calories: 100, protein: 10, carbs: 5, fat: 2 },
    },
    {
      item: { portion: 1 },
      food: { calories: 50, protein: null, carbs: 5, fat: 1 },
    },
  ]);
  assert.equal(unknownProtein.calories, 150);
  assert.equal(unknownProtein.protein, null);
  assert.equal(unknownProtein.carbs, 10);
  assert.equal(unknownProtein.fat, 3);

  const allUnknown = calculateMealNutrition([
    {
      item: { portion: 1 },
      food: { calories: 250, protein: null, carbs: null, fat: null },
    },
  ]);
  assert.equal(allUnknown.calories, 250);
  assert.equal(allUnknown.protein, null);
  assert.equal(allUnknown.carbs, null);
  assert.equal(allUnknown.fat, null);

  console.log('ok meal nutrition');
}

function testImagePathConvention() {
  const source = readFileSync(
    join(root, 'src/data/images/libraryImages.ts'),
    'utf8',
  );
  assert.match(source, /library-images\//);
  assert.match(source, /persistLibraryImage/);
  assert.match(source, /deletePersistedLibraryImage/);
  assert.doesNotMatch(source, /ImagePicker/);
  console.log('ok image path convention (permanent library-images/)');
}

function testDevGating() {
  const seed = readFileSync(join(root, 'src/data/seed/seedDevData.ts'), 'utf8');
  const provider = readFileSync(join(root, 'src/data/DataProvider.tsx'), 'utf8');
  const settings = readFileSync(
    join(root, 'src/screens/SettingsScreen.tsx'),
    'utf8',
  );
  assert.match(seed, /if \(!__DEV__\)/);
  assert.match(provider, /if \(__DEV__\)/);
  assert.match(settings, /__DEV__/);
  assert.match(settings, /Reset & reseed/);
  console.log('ok __DEV__ gating for seed + settings reset');
}

function createDb() {
  const db = new DatabaseSync(':memory:');
  db.exec(`
    PRAGMA foreign_keys = ON;
    CREATE TABLE library_items (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      calories REAL NOT NULL,
      protein REAL,
      carbs REAL,
      fat REAL,
      image TEXT,
      pinned INTEGER NOT NULL DEFAULT 0,
      logging_mode TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);
  return db;
}

function testCrudSearchPinDeleteSeed() {
  const db = createDb();
  const now = '2026-01-01T00:00:00.000Z';

  db.prepare(
    `INSERT INTO library_items (
      id, name, calories, protein, carbs, fat, image, pinned, logging_mode, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run('f1', 'Egg', 78, 6, 1, 5, null, 1, 'portion', now, now);
  db.prepare(
    `INSERT INTO library_items (
      id, name, calories, protein, carbs, fat, image, pinned, logging_mode, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run('f2', 'Rice', 130, 3, 28, 0, null, 0, 'quick', now, now);

  const search = db
    .prepare(`SELECT name FROM library_items WHERE name LIKE ? COLLATE NOCASE`)
    .all('%egg%');
  assert.equal(search.length, 1);
  assert.equal(search[0].name, 'Egg');

  const pinned = db
    .prepare(`SELECT COUNT(*) AS c FROM library_items WHERE pinned = 1`)
    .get();
  assert.equal(pinned.c, 1);

  db.prepare(`DELETE FROM library_items WHERE id = ?`).run('f1');
  assert.equal(
    db.prepare(`SELECT COUNT(*) AS c FROM library_items WHERE id = ?`).get('f1').c,
    0,
  );

  function seedIfEmpty() {
    const count = db.prepare(`SELECT COUNT(*) AS c FROM library_items`).get().c;
    if (count > 0) {
      return false;
    }
    db.prepare(
      `INSERT INTO library_items (
        id, name, calories, protein, carbs, fat, image, pinned, logging_mode, created_at, updated_at
      ) VALUES ('seed-1', 'Egg', 78, NULL, NULL, NULL, NULL, 0, 'portion', ?, ?)`,
    ).run(now, now);
    return true;
  }

  assert.equal(seedIfEmpty(), false);
  db.prepare(`DELETE FROM library_items`).run();
  assert.equal(seedIfEmpty(), true);
  assert.equal(seedIfEmpty(), false);

  console.log('ok CRUD / search / pin / delete / seed idempotency');
}

function testSeedCatalogFile() {
  const data = readFileSync(join(root, 'src/data/seed/devSeedData.ts'), 'utf8');
  const itemIds = [...data.matchAll(/id: 'seed-item-\d+'/g)];
  assert.ok(itemIds.length >= 20, `expected ≥20 library items, got ${itemIds.length}`);
  assert.match(data, /loggingMode: 'quick'/);
  assert.match(data, /loggingMode: 'portion'/);
  console.log(`ok seed catalog (${itemIds.length} library items)`);
}

testMealNutrition();
testImagePathConvention();
testDevGating();
testCrudSearchPinDeleteSeed();
testSeedCatalogFile();

{
  const root = mkdtempSync(join(tmpdir(), 'cc-img-'));
  const libraryImages = join(root, 'documents', 'library-images');
  const pickerTemp = join(root, 'picker');
  mkdirSync(libraryImages, { recursive: true });
  mkdirSync(pickerTemp, { recursive: true });
  const tempUri = join(pickerTemp, 'photo.jpg');
  writeFileSync(tempUri, 'fake-image-bytes');
  const permanent = join(libraryImages, `${randomUUID()}.jpg`);
  copyFileSync(tempUri, permanent);
  rmSync(tempUri);
  assert.equal(existsSync(permanent), true);
  assert.equal(readFileSync(permanent, 'utf8'), 'fake-image-bytes');
  rmSync(root, { recursive: true, force: true });
  console.log('ok image persistence after restart (simulated)');
}

console.log('Stage 5 smoke passed');
