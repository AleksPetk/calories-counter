export type PurchaseState = 'trial' | 'purchased' | 'locked';

export type Settings = {
  id: number;
  dailyGoal: number;
  /**
   * Optional daily macro targets (grams).
   * `null` means no macro goal is set.
   */
  proteinGoal: number | null;
  carbsGoal: number | null;
  fatGoal: number | null;
  /** Local day boundary as `HH:mm` (24h). Default `00:00`. */
  resetTime: string;
  /**
   * Days of history to retain.
   * `null` means unlimited retention.
   */
  historyRetention: number | null;
  tutorialSeen: boolean;
  purchaseState: PurchaseState;
  /** Registered theme id (see `src/theme/registry.ts`). */
  themeId: string;
  updatedAt: string;
};

export type SettingsUpdate = Partial<
  Omit<Settings, 'id' | 'updatedAt'>
>;
