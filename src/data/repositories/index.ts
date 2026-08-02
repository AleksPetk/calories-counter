import { DailyLogEntryRepository } from './DailyLogEntryRepository';
import { EntitlementRepository } from './EntitlementRepository';
import { LibraryItemRepository } from './LibraryItemRepository';
import { ProfileRepository } from './ProfileRepository';
import { SettingsRepository } from './SettingsRepository';

export {
  DailyLogEntryRepository,
  EntitlementRepository,
  LibraryItemRepository,
  ProfileRepository,
  SettingsRepository,
};

export type DataRepositories = {
  libraryItems: LibraryItemRepository;
  dailyLogEntries: DailyLogEntryRepository;
  profile: ProfileRepository;
  settings: SettingsRepository;
  entitlement: EntitlementRepository;
};
