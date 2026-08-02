import { deletePersistedLibraryImage } from '../images/libraryImages';
import type { DataRepositories } from '../repositories';
import { DEV_SEED_LIBRARY_ITEMS } from './devSeedData';

async function libraryIsEmpty(repositories: DataRepositories): Promise<boolean> {
  const items = await repositories.libraryItems.getAll();
  return items.length === 0;
}

async function insertSeedCatalog(repositories: DataRepositories): Promise<void> {
  for (const item of DEV_SEED_LIBRARY_ITEMS) {
    await repositories.libraryItems.create({
      id: item.id,
      name: item.name,
      calories: item.calories,
      protein: item.protein ?? null,
      carbs: item.carbs ?? null,
      fat: item.fat ?? null,
      image: null,
      pinned: item.pinned ?? false,
      loggingMode: item.loggingMode,
    });
  }
}

/**
 * Development-only. Seeds the library when empty.
 * Safe to call on every launch under __DEV__ — skips if data exists.
 */
export async function seedDevLibraryIfEmpty(
  repositories: DataRepositories,
): Promise<{ seeded: boolean }> {
  if (!__DEV__) {
    return { seeded: false };
  }
  if (!(await libraryIsEmpty(repositories))) {
    return { seeded: false };
  }
  await insertSeedCatalog(repositories);
  return { seeded: true };
}

/**
 * Development-only. Clears library items then reseeds.
 * Requires confirmation in UI before calling. Does not clear logs.
 */
export async function resetAndReseedDevLibrary(
  repositories: DataRepositories,
): Promise<void> {
  if (!__DEV__) {
    throw new Error('resetAndReseedDevLibrary is only available in development');
  }

  const items = await repositories.libraryItems.getAll();
  for (const item of items) {
    await repositories.libraryItems.delete(item.id);
    await deletePersistedLibraryImage(item.image);
  }

  await insertSeedCatalog(repositories);
}
