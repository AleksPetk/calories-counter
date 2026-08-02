export const PIN_SLOT_COUNT = 21;

/** Display / seed default until Settings UI is wired to SQLite. */
export const DEFAULT_DAILY_GOAL = 2200;

/** Display / seed default day boundary (`HH:mm`). */
export const DEFAULT_RESET_TIME = '00:00';

/**
 * Default history retention in days (1 year).
 * `null` in settings means unlimited — existing NULL rows stay unlimited.
 */
export const DEFAULT_HISTORY_RETENTION_DAYS = 365;

export const HISTORY_RETENTION_OPTIONS = [
  { label: '1 week', days: 7 },
  { label: '1 month', days: 30 },
  { label: '1 year', days: 365 },
  { label: 'Unlimited', days: null },
] as const;

export const TAB_LABELS = {
  home: 'Home',
  library: 'Library',
  history: 'History',
  settings: 'Settings',
} as const;
