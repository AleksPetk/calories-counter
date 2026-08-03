import { DailyLogEntryRepository } from './DailyLogEntryRepository';
import { EntitlementRepository } from './EntitlementRepository';
import { LibraryItemRepository } from './LibraryItemRepository';
import { SettingsRepository } from './SettingsRepository';

export {
  DailyLogEntryRepository,
  EntitlementRepository,
  LibraryItemRepository,
  SettingsRepository,
};

export type DataRepositories = {
  libraryItems: LibraryItemRepository;
  dailyLogEntries: DailyLogEntryRepository;
  settings: SettingsRepository;
  entitlement: EntitlementRepository;
};
