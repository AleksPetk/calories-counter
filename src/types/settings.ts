export type PurchaseState = 'trial' | 'purchased' | 'locked';

export type Settings = {
  id: number;
  dailyGoal: number;
  /** Local day boundary as `HH:mm` (24h). Default `00:00`. */
  resetTime: string;
  /**
   * Days of history to retain.
   * `null` means unlimited retention.
   */
  historyRetention: number | null;
  tutorialSeen: boolean;
  purchaseState: PurchaseState;
  updatedAt: string;
};

export type SettingsUpdate = Partial<
  Omit<Settings, 'id' | 'updatedAt'>
>;
