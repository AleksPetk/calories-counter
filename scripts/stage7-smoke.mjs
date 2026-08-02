/**
 * Stage 7 — history retention, clear vs erase, tutorial flag helpers.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function formatLocalDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function shiftDateKey(dateKey, deltaDays) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateKey.trim());
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + deltaDays);
  return formatLocalDateKey(date);
}

function getRetentionOldestKeepDateKey(activeDayKey, retentionDays) {
  return shiftDateKey(activeDayKey, -(retentionDays - 1));
}

{
  // Keep 7 days including active → oldest keep = active - 6
  assert.equal(
    getRetentionOldestKeepDateKey('2026-08-02', 7),
    '2026-07-27',
  );
  assert.equal(
    getRetentionOldestKeepDateKey('2026-08-02', 1),
    '2026-08-02',
  );
}

{
  const db = new DatabaseSync(':memory:');
  db.exec(`
    CREATE TABLE daily_log_entries (
      id TEXT PRIMARY KEY, date TEXT, calories REAL
    );
    CREATE TABLE library_items (id TEXT PRIMARY KEY, name TEXT);
    CREATE TABLE settings (
      id INTEGER PRIMARY KEY, purchase_state TEXT, tutorial_seen INTEGER,
      history_retention INTEGER, theme_id TEXT
    );
  `);
  db.prepare(`INSERT INTO library_items VALUES ('i1','Egg')`).run();
  db.prepare(`INSERT INTO settings VALUES (1,'purchased',1,365,'oceanBlue')`).run();
  db.prepare(`INSERT INTO daily_log_entries VALUES ('a','2026-07-01',100)`).run();
  db.prepare(`INSERT INTO daily_log_entries VALUES ('b','2026-08-01',200)`).run();

  const oldest = getRetentionOldestKeepDateKey('2026-08-02', 7);
  db.prepare(`DELETE FROM daily_log_entries WHERE date < ?`).run(oldest);
  const left = db.prepare(`SELECT id FROM daily_log_entries ORDER BY id`).all();
  assert.deepEqual(left.map((r) => r.id), ['b']);

  // Clear history only
  db.prepare(`DELETE FROM daily_log_entries`).run();
  assert.equal(db.prepare(`SELECT COUNT(*) AS c FROM daily_log_entries`).get().c, 0);
  assert.equal(db.prepare(`SELECT COUNT(*) AS c FROM library_items`).get().c, 1);
  assert.equal(
    db.prepare(`SELECT purchase_state FROM settings WHERE id=1`).get().purchase_state,
    'purchased',
  );
}

{
  const retention = readFileSync(
    join(root, 'src/data/history/historyRetention.ts'),
    'utf8',
  );
  assert.match(retention, /applyHistoryRetention/);
  const erase = readFileSync(join(root, 'src/data/erase/eraseAllData.ts'), 'utf8');
  assert.match(erase, /storePurchased/);
  assert.match(erase, /trialStartedAt/);
  assert.match(erase, /tutorialSeen: false/);
  const brand = readFileSync(join(root, 'src/config/appBrand.ts'), 'utf8');
  assert.match(brand, /appName: 'QuickCal'/);
  assert.match(brand, /privacyPolicyUrl/);
  const tutorial = readFileSync(join(root, 'src/tutorial/steps.ts'), 'utf8');
  assert.match(tutorial, /Themes can be changed/);
  assert.match(tutorial, /Quick Log/);
  assert.match(tutorial, /Portion/);
}

console.log('ok stage 7 history / erase / tutorial smoke');
