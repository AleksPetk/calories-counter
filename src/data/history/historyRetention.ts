import { DEFAULT_RESET_TIME } from '../../constants';
import type { Settings } from '../../types';
import type { DataRepositories } from '../repositories';
import {
  formatLocalDateKey,
  getActiveDayKey,
} from '../logging/activeDay';

/** Shift a `YYYY-MM-DD` key by a whole number of local calendar days. */
export function shiftDateKey(dateKey: string, deltaDays: number): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateKey.trim());
  if (!match) {
    return dateKey;
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + deltaDays);
  return formatLocalDateKey(date);
}

/**
 * Oldest logical day to keep when retaining `retentionDays` including the active day.
 * Entries with `date <` this key are expired.
 */
export function getRetentionOldestKeepDateKey(
  activeDayKey: string,
  retentionDays: number,
): string {
  if (!Number.isFinite(retentionDays) || retentionDays <= 0) {
    return activeDayKey;
  }
  return shiftDateKey(activeDayKey, -(retentionDays - 1));
}

export function labelForRetentionDays(days: number | null): string {
  if (days == null) {
    return 'Unlimited';
  }
  if (days === 7) {
    return '1 week';
  }
  if (days === 30) {
    return '1 month';
  }
  if (days === 365) {
    return '1 year';
  }
  return `${days} days`;
}

/**
 * Deletes log entries older than the retention window.
 * No-op when retention is unlimited (`null`).
 * Does not touch library, settings, or images.
 */
export async function applyHistoryRetention(
  repositories: DataRepositories,
  settings?: Settings,
  now: Date = new Date(),
): Promise<{ deleted: boolean; oldestKeepDate: string | null }> {
  const resolved = settings ?? (await repositories.settings.get());
  const retention = resolved.historyRetention;
  if (retention == null) {
    return { deleted: false, oldestKeepDate: null };
  }

  const activeDay = getActiveDayKey(
    now,
    resolved.resetTime ?? DEFAULT_RESET_TIME,
  );
  const oldestKeep = getRetentionOldestKeepDateKey(activeDay, retention);
  await repositories.dailyLogEntries.deleteOlderThan(oldestKeep);
  return { deleted: true, oldestKeepDate: oldestKeep };
}
