import { DailyLogEntryRepository } from './DailyLogEntryRepository';
import { LibraryItemRepository } from './LibraryItemRepository';
import { ProfileRepository } from './ProfileRepository';
import { SettingsRepository } from './SettingsRepository';

export {
  DailyLogEntryRepository,
  LibraryItemRepository,
  ProfileRepository,
  SettingsRepository,
};

export type DataRepositories = {
  libraryItems: LibraryItemRepository;
  dailyLogEntries: DailyLogEntryRepository;
  profile: ProfileRepository;
  settings: SettingsRepository;
};
