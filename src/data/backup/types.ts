import type { DailyLogEntry, LibraryItem, LoggingMode } from '../../types';
import type {
  LifestyleActivity,
  PlannerGoal,
  PlannerSex,
  PlannerWarningCode,
  TrainingFrequency,
  UnitPref,
} from '../planner';

export const BACKUP_FORMAT = 'quickcal-backup' as const;
/** v2 adds macro goals + optional calorie_plan snapshot. */
export const BACKUP_FORMAT_VERSION = 2;

/** Settings fields restored from backup (never StoreKit / entitlement). */
export type BackupSettingsPayload = {
  dailyGoal: number;
  proteinGoal: number | null;
  carbsGoal: number | null;
  fatGoal: number | null;
  resetTime: string;
  historyRetention: number | null;
  tutorialSeen: boolean;
  themeId: string;
};

/** Legacy profile row — optional; product UI no longer exposes Profile. */
export type BackupProfilePayload = {
  nickname: string | null;
  photo: string | null;
  age: number | null;
  sex: string;
  height: number | null;
  weight: number | null;
  activityLevel: string;
  goal: string;
  updatedAt: string;
};

export type BackupLibraryItemPayload = {
  id: string;
  name: string;
  calories: number;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  /** Relative path inside the ZIP (`images/...`) or null. */
  image: string | null;
  pinned: boolean;
  loggingMode: LoggingMode;
  createdAt: string;
  updatedAt: string;
};

export type BackupLogEntryPayload = {
  id: string;
  date: string;
  time: string;
  sourceType: DailyLogEntry['sourceType'];
  sourceId: string | null;
  calories: number;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  foodNameSnapshot: string;
  portion: number | null;
};

export type BackupCaloriePlanPayload = {
  sex: PlannerSex;
  age: number;
  heightCm: number;
  weightKg: number;
  unitPref: UnitPref;
  activity: LifestyleActivity;
  training: TrainingFrequency;
  goal: PlannerGoal;
  pregnantOrBreastfeeding: boolean;
  edScreening: boolean;
  ageOver80Acknowledged: boolean;
  rmrKcal: number | null;
  tdeeKcal: number | null;
  targetKcal: number | null;
  proteinG: number | null;
  carbsG: number | null;
  fatG: number | null;
  bmi: number | null;
  warnings: PlannerWarningCode[];
  calculatedAt: string | null;
  appliedAt: string | null;
  formulaVersion: string;
  updatedAt: string;
};

export type BackupManifest = {
  format: typeof BACKUP_FORMAT;
  formatVersion: number;
  exportedAt: string;
  appVersion: string;
  schemaVersion: number;
  libraryItems: BackupLibraryItemPayload[];
  dailyLogEntries: BackupLogEntryPayload[];
  settings: BackupSettingsPayload;
  /** Present only when a legacy profile row existed at export time. */
  profile: BackupProfilePayload | null;
  /** Present when a Calorie Planner snapshot exists (format v2+). */
  caloriePlan: BackupCaloriePlanPayload | null;
};

export type BackupPreview = {
  exportedAt: string;
  appVersion: string;
  formatVersion: number;
  libraryItemCount: number;
  logEntryCount: number;
};

export type PreparedBackupImport = {
  preview: BackupPreview;
  manifest: BackupManifest;
  /** Absolute cache dir holding unzipped `backup.json` + `images/`. */
  extractDir: string;
  /** Map of relative image path → absolute file URI under extractDir. */
  imageFiles: Record<string, string>;
};

export type LibraryItemForBackup = LibraryItem;
