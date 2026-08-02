/**
 * Active-day calculation from a local clock and settings reset time (`HH:mm`).
 * All screens must use these helpers — do not duplicate boundary logic.
 */

export type ParsedResetTime = {
  hours: number;
  minutes: number;
};

/** Parse `HH:mm` (24h). Invalid input falls back to midnight. */
export function parseResetTime(resetTime: string): ParsedResetTime {
  const match = /^(\d{1,2}):(\d{2})$/.exec(resetTime.trim());
  if (!match) {
    return { hours: 0, minutes: 0 };
  }
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (
    !Number.isInteger(hours) ||
    !Number.isInteger(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return { hours: 0, minutes: 0 };
  }
  return { hours, minutes };
}

/** Local calendar day key `YYYY-MM-DD` (device timezone). */
export function formatLocalDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Logical app day for a moment in local time.
 * If local clock is before today's reset time, the active day is yesterday.
 */
export function getActiveDayKey(
  now: Date,
  resetTime: string = '00:00',
): string {
  const { hours, minutes } = parseResetTime(resetTime);
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const resetMinutes = hours * 60 + minutes;

  const day = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (nowMinutes < resetMinutes) {
    day.setDate(day.getDate() - 1);
  }
  return formatLocalDateKey(day);
}

/** ISO-8601 timestamp suitable for `daily_log_entries.time`. */
export function toLogTimestamp(now: Date = new Date()): string {
  return now.toISOString();
}
