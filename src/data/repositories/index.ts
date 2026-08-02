import { DailyLogEntryRepository } from './DailyLogEntryRepository';
import { FoodRepository } from './FoodRepository';
import { MealItemRepository } from './MealItemRepository';
import { MealRepository } from './MealRepository';
import { ProfileRepository } from './ProfileRepository';
import { SettingsRepository } from './SettingsRepository';

export {
  DailyLogEntryRepository,
  FoodRepository,
  MealItemRepository,
  MealRepository,
  ProfileRepository,
  SettingsRepository,
};

export type DataRepositories = {
  foods: FoodRepository;
  meals: MealRepository;
  mealItems: MealItemRepository;
  dailyLogEntries: DailyLogEntryRepository;
  profile: ProfileRepository;
  settings: SettingsRepository;
};
