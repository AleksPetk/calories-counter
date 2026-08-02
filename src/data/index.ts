import type { SQLiteDatabase } from 'expo-sqlite';

import { openDatabase } from './database/openDatabase';
import {
  DailyLogEntryRepository,
  DataRepositories,
  LibraryItemRepository,
  ProfileRepository,
  SettingsRepository,
} from './repositories';

export type { DataRepositories };

let initPromise: Promise<{
  db: SQLiteDatabase;
  repositories: DataRepositories;
}> | null = null;

function createRepositories(db: SQLiteDatabase): DataRepositories {
  return {
    libraryItems: new LibraryItemRepository(db),
    dailyLogEntries: new DailyLogEntryRepository(db),
    profile: new ProfileRepository(db),
    settings: new SettingsRepository(db),
  };
}

/**
 * Opens SQLite, runs migrations, and returns typed repositories.
 * Safe to call multiple times — initialization is shared.
 * Prefer DataProvider / useData() from UI screens.
 */
export async function initDatabase(): Promise<{
  db: SQLiteDatabase;
  repositories: DataRepositories;
}> {
  if (!initPromise) {
    initPromise = (async () => {
      const db = await openDatabase();
      return {
        db,
        repositories: createRepositories(db),
      };
    })();
  }
  return initPromise;
}

export { openDatabase } from './database/openDatabase';
export {
  DEFAULT_DAILY_GOAL,
  DEFAULT_RESET_TIME,
  SCHEMA_VERSION,
} from './database/constants';
