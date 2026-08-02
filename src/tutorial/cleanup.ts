import { deletePersistedLibraryImage } from '../data/images/libraryImages';
import type { DataRepositories } from '../data/repositories';
import { isTutorialTempId, TUTORIAL_TEMP_ID_PREFIX } from './types';

/**
 * Removes tutorial-created library items, their images, and related log rows.
 * Never touches non-tutorial user/seed items.
 */
export async function cleanupTutorialArtifacts(
  repositories: DataRepositories,
): Promise<void> {
  await repositories.dailyLogEntries.deleteBySourceIdPrefix(
    TUTORIAL_TEMP_ID_PREFIX,
  );

  const items = await repositories.libraryItems.getAll();
  for (const item of items) {
    if (!isTutorialTempId(item.id)) {
      continue;
    }
    await deletePersistedLibraryImage(item.image);
    await repositories.libraryItems.delete(item.id);
  }
}

/**
 * Prefer an existing real pinned item. Only create tutorial-temp-* when
 * there is no non-tutorial pin to demonstrate Home logging.
 */
export async function ensureTutorialDemoItem(
  repositories: DataRepositories,
): Promise<{ id: string; created: boolean }> {
  const items = await repositories.libraryItems.getAll();
  const pinned = items.filter(
    (item) => item.pinned && !isTutorialTempId(item.id),
  );
  if (pinned.length > 0) {
    return { id: pinned[0].id, created: false };
  }

  const existingTemp = items.find((item) => isTutorialTempId(item.id));
  if (existingTemp) {
    if (!existingTemp.pinned) {
      await repositories.libraryItems.update(existingTemp.id, { pinned: true });
    }
    return { id: existingTemp.id, created: false };
  }

  const id = `${TUTORIAL_TEMP_ID_PREFIX}demo`;
  await repositories.libraryItems.create({
    id,
    name: 'Tutorial Demo Item',
    calories: 100,
    protein: null,
    carbs: null,
    fat: null,
    image: null,
    pinned: true,
    loggingMode: 'quick',
  });
  return { id, created: true };
}
