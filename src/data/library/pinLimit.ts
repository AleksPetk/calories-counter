import { PIN_SLOT_COUNT } from '../../constants';
import type { DataRepositories } from '../repositories';

export async function countPinnedItems(
  repositories: DataRepositories,
): Promise<number> {
  const items = await repositories.libraryItems.getPinned();
  return items.length;
}

export async function canPinAnotherItem(
  repositories: DataRepositories,
  options?: { currentlyPinned?: boolean },
): Promise<boolean> {
  if (options?.currentlyPinned) {
    return true;
  }
  const count = await countPinnedItems(repositories);
  return count < PIN_SLOT_COUNT;
}
