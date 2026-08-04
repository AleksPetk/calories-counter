import type {
  DailyLogEntry,
  LibraryItem,
  LogSourceType,
  PurchaseState,
  Settings,
} from '../../types';
import { normalizeLoggingMode } from '../../types/libraryItem';
import { intToBool } from './utils';

export type LibraryItemRow = {
  id: string;
  name: string;
  calories: number;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  image: string | null;
  pinned: number;
  logging_mode: string;
  created_at: string;
  updated_at: string;
};

export type DailyLogEntryRow = {
  id: string;
  date: string;
  time: string;
  source_type: string;
  source_id: string | null;
  calories: number;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  food_name_snapshot: string;
  portion: number | null;
};

export type SettingsRow = {
  id: number;
  daily_goal: number;
  protein_goal: number | null;
  carbs_goal: number | null;
  fat_goal: number | null;
  reset_time: string;
  history_retention: number | null;
  tutorial_seen: number;
  purchase_state: string;
  theme_id: string;
  updated_at: string;
};

export function mapLibraryItem(row: LibraryItemRow): LibraryItem {
  const rawMode =
    row.logging_mode ??
    (row as LibraryItemRow & { loggingMode?: string }).loggingMode;

  return {
    id: row.id,
    name: row.name,
    calories: row.calories,
    protein: row.protein,
    carbs: row.carbs,
    fat: row.fat,
    image: row.image,
    pinned: intToBool(row.pinned),
    loggingMode: normalizeLoggingMode(rawMode),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapDailyLogEntry(row: DailyLogEntryRow): DailyLogEntry {
  return {
    id: row.id,
    date: row.date,
    time: row.time,
    sourceType: row.source_type as LogSourceType,
    sourceId: row.source_id,
    calories: row.calories,
    protein: row.protein,
    carbs: row.carbs,
    fat: row.fat,
    foodNameSnapshot: row.food_name_snapshot,
    portion: row.portion,
  };
}

export function mapSettings(row: SettingsRow): Settings {
  return {
    id: row.id,
    dailyGoal: row.daily_goal,
    proteinGoal: row.protein_goal ?? null,
    carbsGoal: row.carbs_goal ?? null,
    fatGoal: row.fat_goal ?? null,
    resetTime: row.reset_time,
    historyRetention: row.history_retention,
    tutorialSeen: intToBool(row.tutorial_seen),
    purchaseState: row.purchase_state as PurchaseState,
    themeId: row.theme_id,
    updatedAt: row.updated_at,
  };
}
