export const APP_TITLE = 'Calories Counter';

export const PIN_SLOT_COUNT = 21;

/** Display / seed default until Settings UI is wired to SQLite. */
export const DEFAULT_DAILY_GOAL = 2200;

/** Display / seed default day boundary (`HH:mm`). */
export const DEFAULT_RESET_TIME = '00:00';

export const TAB_LABELS = {
  home: 'Home',
  library: 'Library',
  history: 'History',
  settings: 'Settings',
} as const;
