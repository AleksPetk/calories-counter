import {
  copyAsync,
  deleteAsync,
  documentDirectory,
  getInfoAsync,
  makeDirectoryAsync,
} from 'expo-file-system/legacy';

import { createId } from '../database/utils';
import { optimizeLocalImage } from './optimizeLocalImage';

const PROFILE_IMAGES_DIR = `${documentDirectory ?? ''}profile-images/`;

async function ensureProfileImagesDir(): Promise<void> {
  if (!documentDirectory) {
    throw new Error('Document directory is unavailable');
  }
  const info = await getInfoAsync(PROFILE_IMAGES_DIR);
  if (!info.exists) {
    await makeDirectoryAsync(PROFILE_IMAGES_DIR, { intermediates: true });
  }
}

/**
 * Optimizes then copies into permanent profile storage.
 * Throws on failure — caller must not update profile with a broken URI.
 */
export async function persistProfileImage(tempUri: string): Promise<string> {
  const optimized = await optimizeLocalImage(tempUri);
  await ensureProfileImagesDir();
  const destination = `${PROFILE_IMAGES_DIR}${createId()}.jpg`;
  await copyAsync({ from: optimized.uri, to: destination });
  return destination;
}

/** Best-effort delete of a managed profile image URI. */
export async function deletePersistedProfileImage(
  imageUri: string | null | undefined,
): Promise<void> {
  if (!imageUri || !documentDirectory) {
    return;
  }
  if (!imageUri.startsWith(PROFILE_IMAGES_DIR)) {
    return;
  }
  try {
    const info = await getInfoAsync(imageUri);
    if (info.exists) {
      await deleteAsync(imageUri, { idempotent: true });
    }
  } catch {
    // Best-effort; do not block profile updates.
  }
}

/**
 * Persist a new optimized image, then remove the previous managed file.
 * On failure, previousUri is preserved and the error propagates.
 */
export async function replacePersistedProfileImage(
  previousUri: string | null | undefined,
  nextTempUri: string,
): Promise<string> {
  const permanentUri = await persistProfileImage(nextTempUri);
  if (previousUri && previousUri !== permanentUri) {
    await deletePersistedProfileImage(previousUri);
  }
  return permanentUri;
}

export function isManagedProfileImage(uri: string | null | undefined): boolean {
  return Boolean(
    uri && documentDirectory && uri.startsWith(PROFILE_IMAGES_DIR),
  );
}
