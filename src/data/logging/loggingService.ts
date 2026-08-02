import type {
  DailyLogEntry,
  DailyLogEntryInsert,
  LibraryItem,
  Settings,
} from '../../types';
import type { DataRepositories } from '../repositories';
import { getActiveDayKey, toLogTimestamp } from './activeDay';
import { normalizeLoggingMode } from './libraryItemTap';
import { calculateItemNutrition } from './logMath';

const UNKNOWN_FOOD_NAME = 'Unknown food';

async function resolveSettings(
  repositories: DataRepositories,
  settings?: Settings,
): Promise<Settings> {
  return settings ?? repositories.settings.get();
}

function baseStamp(
  settings: Settings,
  now: Date,
): Pick<DailyLogEntryInsert, 'date' | 'time'> {
  return {
    date: getActiveDayKey(now, settings.resetTime),
    time: toLogTimestamp(now),
  };
}

/** Manual Home calorie entry. */
export async function logQuickEntry(
  repositories: DataRepositories,
  input: {
    calories: number;
    name?: string;
    protein?: number | null;
    carbs?: number | null;
    fat?: number | null;
  },
  options?: { settings?: Settings; now?: Date },
): Promise<DailyLogEntry> {
  if (!Number.isFinite(input.calories) || input.calories <= 0) {
    throw new Error('Calories must be greater than zero');
  }
  const settings = await resolveSettings(repositories, options?.settings);
  const now = options?.now ?? new Date();
  const name = input.name?.trim() || UNKNOWN_FOOD_NAME;

  return repositories.dailyLogEntries.create({
    ...baseStamp(settings, now),
    sourceType: 'quick',
    sourceId: null,
    calories: input.calories,
    protein: input.protein ?? null,
    carbs: input.carbs ?? null,
    fat: input.fat ?? null,
    foodNameSnapshot: name,
    portion: null,
  });
}

/** Library item with logging_mode = quick — one tap, no portion. */
export async function logLibraryQuickItem(
  repositories: DataRepositories,
  item: LibraryItem,
  options?: { settings?: Settings; now?: Date },
): Promise<DailyLogEntry> {
  if (normalizeLoggingMode(item.loggingMode) !== 'quick') {
    throw new Error(
      `Cannot quick-log item "${item.name}" (loggingMode=${item.loggingMode})`,
    );
  }
  const settings = await resolveSettings(repositories, options?.settings);
  const now = options?.now ?? new Date();

  return repositories.dailyLogEntries.create({
    ...baseStamp(settings, now),
    sourceType: 'library',
    sourceId: item.id,
    calories: item.calories,
    protein: item.protein,
    carbs: item.carbs,
    fat: item.fat,
    foodNameSnapshot: item.name,
    portion: null,
  });
}

/** Library item with logging_mode = portion. */
export async function logLibraryPortionItem(
  repositories: DataRepositories,
  item: LibraryItem,
  portion: number,
  options?: { settings?: Settings; now?: Date },
): Promise<DailyLogEntry> {
  if (normalizeLoggingMode(item.loggingMode) !== 'portion') {
    throw new Error(
      `Cannot portion-log item "${item.name}" (loggingMode=${item.loggingMode})`,
    );
  }
  if (!Number.isFinite(portion) || portion <= 0) {
    throw new Error('Portion must be greater than zero');
  }
  const settings = await resolveSettings(repositories, options?.settings);
  const now = options?.now ?? new Date();
  const nutrition = calculateItemNutrition(item, portion);

  return repositories.dailyLogEntries.create({
    ...baseStamp(settings, now),
    sourceType: 'library',
    sourceId: item.id,
    calories: nutrition.calories,
    protein: nutrition.protein,
    carbs: nutrition.carbs,
    fat: nutrition.fat,
    foodNameSnapshot: item.name,
    portion,
  });
}

export async function undoLastLogForActiveDay(
  repositories: DataRepositories,
  options?: { settings?: Settings; now?: Date },
): Promise<DailyLogEntry | null> {
  const settings = await resolveSettings(repositories, options?.settings);
  const now = options?.now ?? new Date();
  const date = getActiveDayKey(now, settings.resetTime);
  const latest = await repositories.dailyLogEntries.getLatestByDate(date);
  if (!latest) {
    return null;
  }
  await repositories.dailyLogEntries.delete(latest.id);
  return latest;
}
