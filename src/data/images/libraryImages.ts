import {
  copyAsync,
  deleteAsync,
  documentDirectory,
  getInfoAsync,
  makeDirectoryAsync,
} from 'expo-file-system/legacy';

import { createId } from '../database/utils';

const LIBRARY_IMAGES_DIR = `${documentDirectory ?? ''}library-images/`;

function extensionFromUri(uri: string): string {
  const cleaned = uri.split('?')[0] ?? uri;
  const match = cleaned.match(/\.([a-zA-Z0-9]+)$/);
  return match?.[1]?.toLowerCase() ?? 'jpg';
}

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
 * Copies a picker/temp URI into the app document directory.
 * Returns the permanent file URI to store in SQLite.
 */
export async function persistLibraryImage(tempUri: string): Promise<string> {
  await ensureLibraryImagesDir();
  const ext = extensionFromUri(tempUri);
  const destination = `${LIBRARY_IMAGES_DIR}${createId()}.${ext}`;
  await copyAsync({ from: tempUri, to: destination });
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
 * Replaces an existing persisted image: persist the new file, then remove the old one.
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
