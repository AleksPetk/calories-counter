export type LogSourceType = 'food' | 'meal' | 'quick';

export type DailyLogEntry = {
  id: string;
  /** Calendar day key for the active app day, ISO date `YYYY-MM-DD`. */
  date: string;
  /** Local time of the log, ISO-8601 timestamp. */
  time: string;
  sourceType: LogSourceType;
  sourceId: string | null;
  calories: number;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  foodNameSnapshot: string;
  portion: number | null;
};

export type DailyLogEntryInsert = {
  id?: string;
  date: string;
  time: string;
  sourceType: LogSourceType;
  sourceId?: string | null;
  calories: number;
  protein?: number | null;
  carbs?: number | null;
  fat?: number | null;
  foodNameSnapshot: string;
  portion?: number | null;
};

export type DailyLogEntryUpdate = Partial<
  Omit<DailyLogEntry, 'id'>
>;
