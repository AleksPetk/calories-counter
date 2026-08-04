/** Locked formula pack for Calorie Planner estimates. */
export const PLANNER_FORMULA_VERSION = 'msj-v1';

export type PlannerSex = 'male' | 'female';

/**
 * Day-to-day lifestyle excluding structured workouts.
 * Prevents double-counting with training days.
 */
export type LifestyleActivity =
  | 'sedentary'
  | 'light'
  | 'moderate'
  | 'physical_job';

/** Structured exercise frequency (added on top of lifestyle PAL). */
export type TrainingFrequency = 'none' | 'days_1_2' | 'days_3_4' | 'days_5_plus';

export type PlannerGoal =
  | 'maintenance'
  | 'slow_loss'
  | 'moderate_loss'
  | 'faster_loss'
  | 'slow_gain'
  | 'moderate_gain'
  | 'muscle_gain';

export type UnitPref = 'metric' | 'imperial';

export type PlannerWarningCode =
  | 'estimate_only'
  | 'not_medical_advice'
  | 'individual_variation'
  | 'age_over_80_ack'
  | 'calorie_floor_applied'
  | 'faster_loss_bmi_gate'
  | 'loss_blocked_low_bmi'
  | 'blocked_under_18'
  | 'blocked_pregnancy'
  | 'blocked_ed_screening'
  | 'blocked_very_low_bmi';

export type PlannerAnswers = {
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
  /** Required when age > 80 before a plan may be calculated. */
  ageOver80Acknowledged: boolean;
};

export type PlannerBlockReason =
  | 'under_18'
  | 'pregnancy_or_breastfeeding'
  | 'ed_screening'
  | 'very_low_bmi'
  | 'age_over_80_needs_ack'
  | 'loss_not_appropriate'
  | 'faster_loss_not_appropriate'
  | 'invalid_inputs';

export type PlannerMacros = {
  proteinG: number;
  carbsG: number;
  fatG: number;
};

export type PlannerResult = {
  formulaVersion: typeof PLANNER_FORMULA_VERSION;
  rmrKcal: number;
  tdeeKcal: number;
  targetKcal: number;
  macros: PlannerMacros;
  bmi: number;
  lifestyleMultiplier: number;
  trainingAddon: number;
  activityMultiplier: number;
  goalDeltaKcal: number;
  floorApplied: boolean;
  warnings: PlannerWarningCode[];
  availableGoals: PlannerGoal[];
};

export type PlannerComputeSuccess = {
  ok: true;
  result: PlannerResult;
};

export type PlannerComputeBlocked = {
  ok: false;
  reason: PlannerBlockReason;
  message: string;
  bmi: number | null;
  availableGoals: PlannerGoal[];
};

export type PlannerComputeOutcome =
  | PlannerComputeSuccess
  | PlannerComputeBlocked;
