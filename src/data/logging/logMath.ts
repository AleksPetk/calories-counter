import type { DailyLogEntry, LibraryItem } from '../../types';

export function sumCalories(entries: DailyLogEntry[]): number {
  return entries.reduce((total, entry) => total + entry.calories, 0);
}

export type DayCalorieSummary = {
  goal: number;
  consumed: number;
  remaining: number;
  exceeded: number;
  isUnderOrAtGoal: boolean;
};

export function buildDayCalorieSummary(
  goal: number,
  consumed: number,
): DayCalorieSummary {
  const safeGoal = Number.isFinite(goal) ? goal : 0;
  const safeConsumed = Number.isFinite(consumed) ? consumed : 0;
  const remaining = safeGoal - safeConsumed;
  return {
    goal: safeGoal,
    consumed: safeConsumed,
    remaining: Math.max(remaining, 0),
    exceeded: Math.max(-remaining, 0),
    isUnderOrAtGoal: remaining >= 0,
  };
}

/** Library item nutrition × dimensionless portion multiplier. */
export function calculateItemNutrition(
  item: LibraryItem,
  portion: number,
): {
  calories: number;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
} {
  return {
    calories: item.calories * portion,
    protein: item.protein == null ? null : item.protein * portion,
    carbs: item.carbs == null ? null : item.carbs * portion,
    fat: item.fat == null ? null : item.fat * portion,
  };
}

export function parsePositiveCalories(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }
  return parsed;
}

export function parseOptionalMacroGrams(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return null;
  }
  return parsed;
}

export function parsePositivePortion(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }
  return parsed;
}
