import type { SQLiteDatabase } from 'expo-sqlite';

import {
  DEFAULT_DAILY_GOAL,
  DEFAULT_RESET_TIME,
  SCHEMA_VERSION,
} from './constants';
import { SCHEMA_V1_SQL } from './schema';
import { nowIso } from './utils';

type Migration = {
  version: number;
  up: (db: SQLiteDatabase) => Promise<void>;
};

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
        ) VALUES (1, ?, ?, NULL, 0, 'trial', ?)`,
        DEFAULT_DAILY_GOAL,
        DEFAULT_RESET_TIME,
        timestamp,
      );
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
