import * as SQLite from 'expo-sqlite';

import { DATABASE_NAME } from './constants';
import { migrate } from './migrate';

let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;

export async function openDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!databasePromise) {
    databasePromise = (async () => {
      const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
      await migrate(db);
      return db;
    })();
  }

  return databasePromise;
}
