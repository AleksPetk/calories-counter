import type { SQLiteDatabase } from 'expo-sqlite';
import {
  EncodingType,
  cacheDirectory,
  copyAsync,
  deleteAsync,
  documentDirectory,
  getInfoAsync,
  makeDirectoryAsync,
  readAsStringAsync,
  writeAsStringAsync,
} from 'expo-file-system/legacy';

import { normalizeLoggingMode } from '../../types/libraryItem';
import { createId } from '../database/utils';
import { deletePersistedLibraryImage } from '../images/libraryImages';
import type { DataRepositories } from '../repositories';
import { base64ToUint8Array, uint8ArrayToBase64 } from './base64';
import { ensureDir } from './createBackup';
import { sanitizeBackupImageEntryPath } from './pathSafety';
import {
  BACKUP_FORMAT,
  BACKUP_FORMAT_VERSION,
  type BackupManifest,
  type PreparedBackupImport,
} from './types';
import { decodeUtf8, readZipArchive } from './zipCodec';

const LIBRARY_IMAGES_DIR = `${documentDirectory ?? ''}library-images/`;
const PROFILE_IMAGES_DIR = `${documentDirectory ?? ''}profile-images/`;

function validateManifest(raw: unknown): BackupManifest {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Backup file is not valid JSON');
  }
  const data = raw as Partial<BackupManifest> & {
    settings?: Record<string, unknown>;
  };
  if (data.format !== BACKUP_FORMAT) {
    throw new Error('Not a QuickCal backup file');
  }
  if (typeof data.formatVersion !== 'number') {
    throw new Error('Backup is missing format version');
  }
  if (
    !Number.isInteger(data.formatVersion) ||
    data.formatVersion < 1 ||
    data.formatVersion > BACKUP_FORMAT_VERSION
  ) {
    throw new Error(`Unsupported backup format version: ${data.formatVersion}`);
  }
  if (!Array.isArray(data.libraryItems) || !Array.isArray(data.dailyLogEntries)) {
    throw new Error('Backup is missing library or history data');
  }
  if (!data.settings || typeof data.settings !== 'object') {
    throw new Error('Backup is missing settings');
  }
  if (typeof data.exportedAt !== 'string' || typeof data.appVersion !== 'string') {
    throw new Error('Backup is missing export metadata');
  }

  // Never accept entitlement / StoreKit fields from a backup payload.
  const settings = data.settings;
  if (
    'purchaseState' in settings ||
    'purchase_state' in settings ||
    'storePurchased' in settings ||
    'trialStartedAt' in settings ||
    'trialExpiresAt' in settings
  ) {
    // Strip by rebuilding known settings only — do not fail solely for extra keys,
    // but never read those fields.
  }

  const dailyGoal = settings.dailyGoal;
  const resetTime = settings.resetTime;
  const historyRetention = settings.historyRetention;
  const tutorialSeen = settings.tutorialSeen;
  const themeId = settings.themeId;

  if (typeof dailyGoal !== 'number' || !Number.isFinite(dailyGoal)) {
    throw new Error('Backup settings.dailyGoal is invalid');
  }
  if (typeof resetTime !== 'string') {
    throw new Error('Backup settings.resetTime is invalid');
  }
  if (
    historyRetention !== null &&
    historyRetention !== undefined &&
    typeof historyRetention !== 'number'
  ) {
    throw new Error('Backup settings.historyRetention is invalid');
  }
  if (typeof tutorialSeen !== 'boolean') {
    throw new Error('Backup settings.tutorialSeen is invalid');
  }
  if (typeof themeId !== 'string' || !themeId.trim()) {
    throw new Error('Backup settings.themeId is invalid');
  }

  return {
    format: BACKUP_FORMAT,
    formatVersion: data.formatVersion,
    exportedAt: data.exportedAt,
    appVersion: data.appVersion,
    schemaVersion:
      typeof data.schemaVersion === 'number' ? data.schemaVersion : 0,
    libraryItems: data.libraryItems,
    dailyLogEntries: data.dailyLogEntries,
    settings: {
      dailyGoal,
      resetTime,
      historyRetention:
        historyRetention === undefined ? null : historyRetention,
      tutorialSeen,
      themeId,
    },
    profile: data.profile ?? null,
  };
}

/**
 * Reads a ZIP from disk, unpacks safe image entries to cache, returns preview.
 * Does not mutate app data.
 */
export async function prepareBackupImport(
  zipUri: string,
): Promise<PreparedBackupImport> {
  if (!cacheDirectory) {
    throw new Error('Cache directory is unavailable');
  }

  const zipBase64 = await readAsStringAsync(zipUri, {
    encoding: EncodingType.Base64,
  });
  let unzipped: Record<string, Uint8Array>;
  try {
    unzipped = readZipArchive(base64ToUint8Array(zipBase64));
  } catch {
    throw new Error('Backup ZIP could not be read');
  }

  const jsonBytes = unzipped['backup.json'];
  if (!jsonBytes) {
    throw new Error('Backup ZIP is missing backup.json');
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(decodeUtf8(jsonBytes));
  } catch {
    throw new Error('backup.json is corrupted');
  }
  const manifest = validateManifest(parsed);

  const extractDir = `${cacheDirectory}backup-import-${createId()}/`;
  await ensureDir(extractDir);
  await ensureDir(`${extractDir}images/`);

  const imageFiles: Record<string, string> = {};
  for (const [path, bytes] of Object.entries(unzipped)) {
    if (path === 'backup.json' || path.endsWith('/')) {
      continue;
    }
    const safePath = sanitizeBackupImageEntryPath(path);
    if (!safePath) {
      continue;
    }
    try {
      const dest = `${extractDir}${safePath}`;
      await writeAsStringAsync(dest, uint8ArrayToBase64(bytes), {
        encoding: EncodingType.Base64,
      });
      imageFiles[safePath] = dest;
    } catch {
      // Ignore individual corrupt image entries.
    }
  }

  return {
    preview: {
      exportedAt: manifest.exportedAt,
      appVersion: manifest.appVersion,
      formatVersion: manifest.formatVersion,
      libraryItemCount: manifest.libraryItems.length,
      logEntryCount: manifest.dailyLogEntries.length,
    },
    manifest,
    extractDir,
    imageFiles,
  };
}

async function stageImageIntoDir(
  relativePath: string | null,
  imageFiles: Record<string, string>,
  targetDir: string,
): Promise<string | null> {
  const safePath =
    relativePath != null ? sanitizeBackupImageEntryPath(relativePath) : null;
  if (!safePath) {
    return null;
  }
  const source = imageFiles[safePath];
  if (!source || !documentDirectory) {
    return null;
  }
  try {
    await ensureDir(targetDir);
    const extMatch = /\.([a-zA-Z0-9]+)$/.exec(safePath);
    const ext = (extMatch?.[1] ?? 'jpg').toLowerCase();
    const dest = `${targetDir}${createId()}.${ext === 'jpeg' ? 'jpg' : ext}`;
    await copyAsync({ from: source, to: dest });
    return dest;
  } catch {
    return null;
  }
}

async function writeLegacyProfile(
  db: SQLiteDatabase,
  profile: BackupManifest['profile'],
  photoUri: string | null,
): Promise<void> {
  if (!profile) {
    return;
  }
  try {
    await db.runAsync(
      `INSERT INTO profile (
        id, nickname, photo, age, sex, height, weight,
        activity_level, goal, updated_at
      ) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        nickname = excluded.nickname,
        photo = excluded.photo,
        age = excluded.age,
        sex = excluded.sex,
        height = excluded.height,
        weight = excluded.weight,
        activity_level = excluded.activity_level,
        goal = excluded.goal,
        updated_at = excluded.updated_at`,
      profile.nickname,
      photoUri,
      profile.age,
      profile.sex,
      profile.height,
      profile.weight,
      profile.activityLevel,
      profile.goal,
      profile.updatedAt,
    );
  } catch {
    // Legacy table may be absent on some installs — ignore.
  }
}

async function deleteStagedFiles(uris: string[]): Promise<void> {
  for (const uri of uris) {
    try {
      await deleteAsync(uri, { idempotent: true });
    } catch {
      // best-effort rollback
    }
  }
}

/**
 * Replaces local QuickCal user data with the prepared backup.
 * Preserves entitlement / StoreKit purchase + trial state.
 * Database writes run in one transaction so failures do not leave a partial replace.
 */
export async function applyBackupImport(options: {
  repositories: DataRepositories;
  db: SQLiteDatabase;
  prepared: PreparedBackupImport;
}): Promise<void> {
  const { repositories, db, prepared } = options;
  const { manifest, imageFiles } = prepared;

  const entitlement = await repositories.entitlement.get();
  const existingItems = await repositories.libraryItems.getAll();
  const previousImages = existingItems
    .map((item) => item.image)
    .filter((uri): uri is string => Boolean(uri));

  const stagedFiles: string[] = [];
  const restoredByItemId = new Map<string, string | null>();

  try {
    for (const item of manifest.libraryItems) {
      const image = await stageImageIntoDir(
        item.image,
        imageFiles,
        LIBRARY_IMAGES_DIR,
      );
      if (image) {
        stagedFiles.push(image);
      }
      restoredByItemId.set(item.id, image);
    }

    let stagedProfilePhoto: string | null = null;
    if (manifest.profile?.photo) {
      stagedProfilePhoto = await stageImageIntoDir(
        manifest.profile.photo,
        imageFiles,
        PROFILE_IMAGES_DIR,
      );
      if (stagedProfilePhoto) {
        stagedFiles.push(stagedProfilePhoto);
      }
    }

    const purchaseState = entitlement.storePurchased
      ? 'purchased'
      : entitlement.trialExpiresAt &&
          Date.parse(entitlement.trialExpiresAt) > Date.now()
        ? 'trial'
        : 'locked';

    await db.withTransactionAsync(async () => {
      await repositories.libraryItems.deleteAll();
      await repositories.dailyLogEntries.deleteAll();

      for (const item of manifest.libraryItems) {
        await repositories.libraryItems.insertFull({
          id: item.id,
          name: item.name,
          calories: item.calories,
          protein: item.protein,
          carbs: item.carbs,
          fat: item.fat,
          image: restoredByItemId.get(item.id) ?? null,
          pinned: item.pinned,
          loggingMode: normalizeLoggingMode(item.loggingMode),
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        });
      }

      for (const entry of manifest.dailyLogEntries) {
        await repositories.dailyLogEntries.insertFull({
          id: entry.id,
          date: entry.date,
          time: entry.time,
          sourceType: entry.sourceType,
          sourceId: entry.sourceId,
          calories: entry.calories,
          protein: entry.protein,
          carbs: entry.carbs,
          fat: entry.fat,
          foodNameSnapshot: entry.foodNameSnapshot,
          portion: entry.portion,
        });
      }

      await repositories.settings.update({
        dailyGoal: manifest.settings.dailyGoal,
        resetTime: manifest.settings.resetTime,
        historyRetention: manifest.settings.historyRetention,
        tutorialSeen: manifest.settings.tutorialSeen,
        themeId: manifest.settings.themeId,
        purchaseState,
      });

      await writeLegacyProfile(db, manifest.profile, stagedProfilePhoto);
    });

    for (const uri of previousImages) {
      await deletePersistedLibraryImage(uri);
    }
  } catch (error) {
    await deleteStagedFiles(stagedFiles);
    throw error;
  } finally {
    await cleanupPreparedImport(prepared);
  }
}

export async function cleanupPreparedImport(
  prepared: PreparedBackupImport | null,
): Promise<void> {
  if (!prepared) {
    return;
  }
  try {
    const info = await getInfoAsync(prepared.extractDir);
    if (info.exists) {
      await deleteAsync(prepared.extractDir, { idempotent: true });
    }
  } catch {
    // ignore
  }
}

export async function ensureLibraryImagesDirExists(): Promise<void> {
  if (!documentDirectory) {
    return;
  }
  const info = await getInfoAsync(LIBRARY_IMAGES_DIR);
  if (!info.exists) {
    await makeDirectoryAsync(LIBRARY_IMAGES_DIR, { intermediates: true });
  }
}
