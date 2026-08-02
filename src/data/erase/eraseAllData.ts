import {
  DEFAULT_DAILY_GOAL,
  DEFAULT_HISTORY_RETENTION_DAYS,
  DEFAULT_RESET_TIME,
} from '../../constants';
import { DEFAULT_THEME_ID } from '../../theme/registry';
import type { Settings } from '../../types';
import { deletePersistedLibraryImage } from '../images/libraryImages';
import { deletePersistedProfileImage } from '../images/profileImages';
import type { DataRepositories } from '../repositories';

/**
 * Wipes local user data and restores defaults.
 *
 * Preserves (does not reset):
 * - trialStartedAt / trialExpiresAt
 * - real Apple/Google purchase entitlement cache
 * - settings.purchase_state is re-synced from entitlement after wipe
 *
 * Clears simulated DEV purchase flag so erase cannot look like a store unlock.
 */
export async function eraseAllData(
  repositories: DataRepositories,
): Promise<Settings> {
  const entitlement = await repositories.entitlement.get();

  const profile = await repositories.profile.get();
  await deletePersistedProfileImage(profile.photo);

  const items = await repositories.libraryItems.getAll();
  for (const item of items) {
    await deletePersistedLibraryImage(item.image);
    await repositories.libraryItems.delete(item.id);
  }

  await repositories.dailyLogEntries.deleteAll();

  await repositories.profile.update({
    nickname: null,
    photo: null,
    age: null,
    sex: 'unspecified',
    height: null,
    weight: null,
    activityLevel: 'unspecified',
    goal: 'unspecified',
  });

  // Clear DEV simulation only; never clear store purchase or trial clock.
  await repositories.entitlement.update({
    trialStartedAt: entitlement.trialStartedAt,
    trialExpiresAt: entitlement.trialExpiresAt,
    storePurchased: entitlement.storePurchased,
    storeProductId: entitlement.storeProductId,
    storePlatform: entitlement.storePlatform,
    storePurchasedAt: entitlement.storePurchasedAt,
    lastStoreCheckAt: entitlement.lastStoreCheckAt,
    simulatedPurchased: false,
  });

  const purchaseState = entitlement.storePurchased
    ? 'purchased'
    : entitlement.trialExpiresAt &&
        Date.parse(entitlement.trialExpiresAt) > Date.now()
      ? 'trial'
      : 'locked';

  return repositories.settings.update({
    dailyGoal: DEFAULT_DAILY_GOAL,
    resetTime: DEFAULT_RESET_TIME,
    historyRetention: DEFAULT_HISTORY_RETENTION_DAYS,
    tutorialSeen: false,
    themeId: DEFAULT_THEME_ID,
    purchaseState,
  });
}
