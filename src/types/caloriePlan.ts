import type {
  LifestyleActivity,
  PlannerGoal,
  PlannerSex,
  PlannerWarningCode,
  TrainingFrequency,
  UnitPref,
} from '../data/planner';

/** Persisted Calorie Planner row (answers + static result snapshot). */
export type CaloriePlan = {
  id: number;
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

export type CaloriePlanUpsert = Omit<CaloriePlan, 'id' | 'updatedAt'> & {
  updatedAt?: string;
};
