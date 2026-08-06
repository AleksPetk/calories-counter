import * as DocumentPicker from 'expo-document-picker';
import { deleteAsync } from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import type { SQLiteDatabase } from 'expo-sqlite';
import { Alert, Platform } from 'react-native';

import { resolveTheme } from '../../theme/registry';
import { initDatabase } from '../index';
import type { DataRepositories } from '../repositories';
import { createBackupZip } from './createBackup';
import {
  applyBackupImport,
  cleanupPreparedImport,
  prepareBackupImport,
} from './restoreBackup';
import type { PreparedBackupImport } from './types';

/**
 * Android share targets may still be reading the ZIP after shareAsync resolves.
 * Delay cache cleanup so the receiver can finish; iOS can clean up immediately.
 */
export const ANDROID_BACKUP_SHARE_CLEANUP_DELAY_MS = 60_000;

function formatBackupDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

async function deleteExportZip(uri: string): Promise<void> {
  try {
    await deleteAsync(uri, { idempotent: true });
  } catch {
    // Cache cleanup is best-effort.
  }
}

/**
 * Schedule removal of the temporary export ZIP after sharing.
 * Android: delayed. iOS / others: immediate after the share sheet closes.
 */
export function scheduleExportZipCleanup(uri: string): void {
  if (Platform.OS === 'android') {
    setTimeout(() => {
      void deleteExportZip(uri);
    }, ANDROID_BACKUP_SHARE_CLEANUP_DELAY_MS);
    return;
  }
  void deleteExportZip(uri);
}

export async function exportBackupViaShareSheet(options: {
  repositories: DataRepositories;
}): Promise<void> {
  const { db } = await initDatabase();
  const { uri } = await createBackupZip({
    repositories: options.repositories,
    db,
  });

  try {
    const available = await Sharing.isAvailableAsync();
    if (!available) {
      throw new Error('Sharing is not available on this device');
    }

    await Sharing.shareAsync(uri, {
      mimeType: 'application/zip',
      dialogTitle: 'Export QuickCal Backup',
      UTI: 'public.zip-archive',
    });
  } finally {
    scheduleExportZipCleanup(uri);
  }
}

export async function pickAndPreviewBackupImport(): Promise<PreparedBackupImport | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: ['application/zip', 'public.zip-archive', '*/*'],
    copyToCacheDirectory: true,
    multiple: false,
  });

  if (result.canceled || !result.assets?.[0]?.uri) {
    return null;
  }

  return prepareBackupImport(result.assets[0].uri);
}

export function confirmAndApplyBackupImport(options: {
  repositories: DataRepositories;
  prepared: PreparedBackupImport;
  onSuccess: () => Promise<void> | void;
}): void {
  const { repositories, prepared, onSuccess } = options;
  const { preview } = prepared;

  Alert.alert(
    'Import Backup?',
    `Backup date: ${formatBackupDate(preview.exportedAt)}\nApp version: ${preview.appVersion}\n\nThis will replace your current local QuickCal data.`,
    [
      {
        text: 'Cancel',
        style: 'cancel',
        onPress: () => {
          void cleanupPreparedImport(prepared);
        },
      },
      {
        text: 'Import',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            try {
              const { db } = await initDatabase();
              await applyBackupImport({ repositories, db, prepared });
              await onSuccess();
              Alert.alert('Imported', 'Your QuickCal backup was restored.');
            } catch (error) {
              await cleanupPreparedImport(prepared);
              Alert.alert(
                'Import failed',
                error instanceof Error ? error.message : String(error),
              );
            }
          })();
        },
      },
    ],
  );
}

export async function runBackupImportFlow(options: {
  repositories: DataRepositories;
  onSuccess: (themeId: string) => Promise<void> | void;
}): Promise<void> {
  let prepared: PreparedBackupImport | null = null;
  try {
    prepared = await pickAndPreviewBackupImport();
    if (!prepared) {
      return;
    }
    confirmAndApplyBackupImport({
      repositories: options.repositories,
      prepared,
      onSuccess: async () => {
        const settings = await options.repositories.settings.get();
        await options.onSuccess(resolveTheme(settings.themeId).id);
      },
    });
  } catch (error) {
    await cleanupPreparedImport(prepared);
    Alert.alert(
      'Import failed',
      error instanceof Error ? error.message : String(error),
    );
  }
}

/** Exposed for tests / typed callers that already hold a db handle. */
export type BackupDbHandle = SQLiteDatabase;
