import type { SQLiteDatabase } from 'expo-sqlite';
import {
  EncodingType,
  cacheDirectory,
  getInfoAsync,
  makeDirectoryAsync,
  readAsStringAsync,
  writeAsStringAsync,
} from 'expo-file-system/legacy';

import { appBrand } from '../../config/appBrand';
import { SCHEMA_VERSION } from '../database/constants';
import { nowIso } from '../database/utils';
import type { DataRepositories } from '../repositories';
import { base64ToUint8Array, uint8ArrayToBase64 } from './base64';
import {
  BACKUP_FORMAT,
  BACKUP_FORMAT_VERSION,
  type BackupLibraryItemPayload,
  type BackupManifest,
  type BackupProfilePayload,
} from './types';
import { createZipArchive, encodeUtf8 } from './zipCodec';

function extensionForUri(uri: string): string {
  const match = /\.([a-zA-Z0-9]+)(?:\?|$)/.exec(uri);
  if (!match) {
    return 'jpg';
  }
  const ext = match[1].toLowerCase();
  if (ext === 'jpeg' || ext === 'jpg' || ext === 'png' || ext === 'webp') {
    return ext === 'jpeg' ? 'jpg' : ext;
  }
  return 'jpg';
}

async function readLegacyProfile(
  db: SQLiteDatabase,
): Promise<BackupProfilePayload | null> {
  try {
    const row = await db.getFirstAsync<{
      nickname: string | null;
      photo: string | null;
      age: number | null;
      sex: string;
      height: number | null;
      weight: number | null;
      activity_level: string;
      goal: string;
      updated_at: string;
    }>(`SELECT * FROM profile WHERE id = 1`);
    if (!row) {
      return null;
    }
    return {
      nickname: row.nickname,
      photo: row.photo,
      age: row.age,
      sex: row.sex,
      height: row.height,
      weight: row.weight,
      activityLevel: row.activity_level,
      goal: row.goal,
      updatedAt: row.updated_at,
    };
  } catch {
    return null;
  }
}

/**
 * Builds a QuickCal ZIP backup in the cache directory.
 * Does not include entitlement / StoreKit purchase state.
 */
export async function createBackupZip(options: {
  repositories: DataRepositories;
  db: SQLiteDatabase;
}): Promise<{ uri: string; fileName: string; manifest: BackupManifest }> {
  const { repositories, db } = options;
  if (!cacheDirectory) {
    throw new Error('Cache directory is unavailable');
  }

  const [libraryItems, dailyLogEntries, settings, profile, caloriePlan] =
    await Promise.all([
      repositories.libraryItems.getAll(),
      repositories.dailyLogEntries.getAllOrdered(),
      repositories.settings.get(),
      readLegacyProfile(db),
      repositories.caloriePlan.get(),
    ]);

  const zipFiles: Record<string, Uint8Array> = {};
  const exportedItems: BackupLibraryItemPayload[] = [];
  let imageIndex = 0;

  for (const item of libraryItems) {
    let imageRef: string | null = null;
    if (item.image) {
      try {
        const info = await getInfoAsync(item.image);
        if (info.exists && !info.isDirectory) {
          const ext = extensionForUri(item.image);
          const relative = `images/${item.id}-${imageIndex}.${ext}`;
          imageIndex += 1;
          const base64 = await readAsStringAsync(item.image, {
            encoding: EncodingType.Base64,
          });
          zipFiles[relative] = base64ToUint8Array(base64);
          imageRef = relative;
        }
      } catch {
        // Skip missing/corrupt images; keep the item without a photo.
        imageRef = null;
      }
    }

    exportedItems.push({
      id: item.id,
      name: item.name,
      calories: item.calories,
      protein: item.protein,
      carbs: item.carbs,
      fat: item.fat,
      image: imageRef,
      pinned: item.pinned,
      loggingMode: item.loggingMode,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    });
  }

  // Profile photo (legacy) — export file if present; keep path null in JSON
  // when missing so restore stays graceful.
  let profilePayload = profile;
  if (profile?.photo) {
    try {
      const info = await getInfoAsync(profile.photo);
      if (info.exists && !info.isDirectory) {
        const ext = extensionForUri(profile.photo);
        const relative = `images/profile.${ext}`;
        const base64 = await readAsStringAsync(profile.photo, {
          encoding: EncodingType.Base64,
        });
        zipFiles[relative] = base64ToUint8Array(base64);
        profilePayload = { ...profile, photo: relative };
      } else {
        profilePayload = { ...profile, photo: null };
      }
    } catch {
      profilePayload = { ...profile, photo: null };
    }
  }

  const manifest: BackupManifest = {
    format: BACKUP_FORMAT,
    formatVersion: BACKUP_FORMAT_VERSION,
    exportedAt: nowIso(),
    appVersion: appBrand.version,
    schemaVersion: SCHEMA_VERSION,
    libraryItems: exportedItems,
    dailyLogEntries: dailyLogEntries.map((entry) => ({
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
    })),
    settings: {
      dailyGoal: settings.dailyGoal,
      proteinGoal: settings.proteinGoal,
      carbsGoal: settings.carbsGoal,
      fatGoal: settings.fatGoal,
      resetTime: settings.resetTime,
      historyRetention: settings.historyRetention,
      tutorialSeen: settings.tutorialSeen,
      themeId: settings.themeId,
    },
    profile: profilePayload,
    caloriePlan: caloriePlan
      ? {
          sex: caloriePlan.sex,
          age: caloriePlan.age,
          heightCm: caloriePlan.heightCm,
          weightKg: caloriePlan.weightKg,
          unitPref: caloriePlan.unitPref,
          activity: caloriePlan.activity,
          training: caloriePlan.training,
          goal: caloriePlan.goal,
          pregnantOrBreastfeeding: caloriePlan.pregnantOrBreastfeeding,
          edScreening: caloriePlan.edScreening,
          ageOver80Acknowledged: caloriePlan.ageOver80Acknowledged,
          rmrKcal: caloriePlan.rmrKcal,
          tdeeKcal: caloriePlan.tdeeKcal,
          targetKcal: caloriePlan.targetKcal,
          proteinG: caloriePlan.proteinG,
          carbsG: caloriePlan.carbsG,
          fatG: caloriePlan.fatG,
          bmi: caloriePlan.bmi,
          warnings: caloriePlan.warnings,
          calculatedAt: caloriePlan.calculatedAt,
          appliedAt: caloriePlan.appliedAt,
          formulaVersion: caloriePlan.formulaVersion,
          updatedAt: caloriePlan.updatedAt,
        }
      : null,
  };

  zipFiles['backup.json'] = encodeUtf8(JSON.stringify(manifest, null, 2));

  const zipBytes = createZipArchive(zipFiles);
  const stamp = manifest.exportedAt
    .replace(/[:.]/g, '-')
    .replace(/Z$/i, 'Z');
  // Filename is product + export timestamp only — no account/device/user ids.
  const fileName = `QuickCal-backup-${stamp}.zip`;
  const uri = `${cacheDirectory}${fileName}`;
  await writeAsStringAsync(uri, uint8ArrayToBase64(zipBytes), {
    encoding: EncodingType.Base64,
  });

  return { uri, fileName, manifest };
}

/**
 * Ensures a destination directory exists (idempotent).
 */
export async function ensureDir(uri: string): Promise<void> {
  const info = await getInfoAsync(uri);
  if (!info.exists) {
    await makeDirectoryAsync(uri, { intermediates: true });
  }
}
