export type LoggingMode = 'quick' | 'portion';

/** Normalize DB / UI values. Unknown → portion (never accidental one-tap). */
export function normalizeLoggingMode(
  value: string | null | undefined,
): LoggingMode {
  if (typeof value !== 'string') {
    return 'portion';
  }
  const mode = value.trim().toLowerCase();
  return mode === 'quick' ? 'quick' : 'portion';
}

export type LibraryItem = {
  id: string;
  name: string;
  calories: number;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  image: string | null;
  pinned: boolean;
  loggingMode: LoggingMode;
  createdAt: string;
  updatedAt: string;
};

export type LibraryItemInsert = {
  id?: string;
  name: string;
  calories: number;
  protein?: number | null;
  carbs?: number | null;
  fat?: number | null;
  image?: string | null;
  pinned?: boolean;
  loggingMode: LoggingMode;
};

export type LibraryItemUpdate = Partial<
  Omit<LibraryItem, 'id' | 'createdAt' | 'updatedAt'>
>;
