import {
  copyAsync,
  deleteAsync,
  documentDirectory,
  getInfoAsync,
  makeDirectoryAsync,
} from 'expo-file-system/legacy';

import { createId } from '../database/utils';
import { optimizeLocalImage } from './optimizeLocalImage';

const LIBRARY_IMAGES_DIR = `${documentDirectory ?? ''}library-images/`;

async function ensureLibraryImagesDir(): Promise<void> {
  if (!documentDirectory) {
    throw new Error('Document directory is unavailable');
  }
  const info = await getInfoAsync(LIBRARY_IMAGES_DIR);
  if (!info.exists) {
    await makeDirectoryAsync(LIBRARY_IMAGES_DIR, { intermediates: true });
  }
}

/**
 * Optimizes then copies into permanent library storage.
 * Throws on failure — caller must not update UI/DB with a broken URI.
 */
export async function persistLibraryImage(tempUri: string): Promise<string> {
  const optimized = await optimizeLocalImage(tempUri);
  await ensureLibraryImagesDir();
  const destination = `${LIBRARY_IMAGES_DIR}${createId()}.jpg`;
  await copyAsync({ from: optimized.uri, to: destination });
  return destination;
}

/**
 * Deletes a previously persisted library image when it lives in our folder.
 * Ignores missing files and non-managed URIs.
 */
export async function deletePersistedLibraryImage(
  imageUri: string | null | undefined,
): Promise<void> {
  if (!imageUri || !documentDirectory) {
    return;
  }
  if (!imageUri.startsWith(LIBRARY_IMAGES_DIR)) {
    return;
  }
  try {
    const info = await getInfoAsync(imageUri);
    if (info.exists) {
      await deleteAsync(imageUri, { idempotent: true });
    }
  } catch {
    // Best-effort cleanup; do not block library CRUD.
  }
}

/**
 * Persist a new optimized image, then remove the previous managed file.
 * If optimization/copy fails, previousUri is left untouched and the error propagates.
 */
export async function replacePersistedLibraryImage(
  previousUri: string | null | undefined,
  nextTempUri: string,
): Promise<string> {
  const permanentUri = await persistLibraryImage(nextTempUri);
  if (previousUri && previousUri !== permanentUri) {
    await deletePersistedLibraryImage(previousUri);
  }
  return permanentUri;
}

export function isManagedLibraryImage(uri: string | null | undefined): boolean {
  return Boolean(
    uri && documentDirectory && uri.startsWith(LIBRARY_IMAGES_DIR),
  );
}
