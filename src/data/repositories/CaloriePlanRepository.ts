import type { SQLiteDatabase } from 'expo-sqlite';

import type {
  LifestyleActivity,
  PlannerGoal,
  PlannerSex,
  PlannerWarningCode,
  TrainingFrequency,
  UnitPref,
} from '../planner';
import type { CaloriePlan, CaloriePlanUpsert } from '../../types';
import { boolToInt, intToBool, nowIso } from '../database/utils';

type CaloriePlanRow = {
  id: number;
  sex: string;
  age: number;
  height_cm: number;
  weight_kg: number;
  unit_pref: string;
  activity: string;
  training: string;
  goal: string;
  pregnant_or_breastfeeding: number;
  ed_screening: number;
  age_over_80_acknowledged: number;
  rmr_kcal: number | null;
  tdee_kcal: number | null;
  target_kcal: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  bmi: number | null;
  warnings_json: string | null;
  calculated_at: string | null;
  applied_at: string | null;
  formula_version: string;
  updated_at: string;
};

function parseWarnings(raw: string | null): PlannerWarningCode[] {
  if (!raw) {
    return [];
  }
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter((item): item is PlannerWarningCode => typeof item === 'string');
  } catch {
    return [];
  }
}

function mapRow(row: CaloriePlanRow): CaloriePlan {
  return {
    id: row.id,
    sex: row.sex as PlannerSex,
    age: row.age,
    heightCm: row.height_cm,
    weightKg: row.weight_kg,
    unitPref: row.unit_pref as UnitPref,
    activity: row.activity as LifestyleActivity,
    training: row.training as TrainingFrequency,
    goal: row.goal as PlannerGoal,
    pregnantOrBreastfeeding: intToBool(row.pregnant_or_breastfeeding),
    edScreening: intToBool(row.ed_screening),
    ageOver80Acknowledged: intToBool(row.age_over_80_acknowledged),
    rmrKcal: row.rmr_kcal,
    tdeeKcal: row.tdee_kcal,
    targetKcal: row.target_kcal,
    proteinG: row.protein_g,
    carbsG: row.carbs_g,
    fatG: row.fat_g,
    bmi: row.bmi,
    warnings: parseWarnings(row.warnings_json),
    calculatedAt: row.calculated_at,
    appliedAt: row.applied_at,
    formulaVersion: row.formula_version,
    updatedAt: row.updated_at,
  };
}

export class CaloriePlanRepository {
  constructor(private readonly db: SQLiteDatabase) {}

  async get(): Promise<CaloriePlan | null> {
    const row = await this.db.getFirstAsync<CaloriePlanRow>(
      `SELECT * FROM calorie_plan WHERE id = 1`,
    );
    return row ? mapRow(row) : null;
  }

  async upsert(input: CaloriePlanUpsert): Promise<CaloriePlan> {
    const updatedAt = input.updatedAt ?? nowIso();
    await this.db.runAsync(
      `INSERT INTO calorie_plan (
        id, sex, age, height_cm, weight_kg, unit_pref, activity, training, goal,
        pregnant_or_breastfeeding, ed_screening, age_over_80_acknowledged,
        rmr_kcal, tdee_kcal, target_kcal, protein_g, carbs_g, fat_g, bmi,
        warnings_json, calculated_at, applied_at, formula_version, updated_at
      ) VALUES (
        1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
      ON CONFLICT(id) DO UPDATE SET
        sex = excluded.sex,
        age = excluded.age,
        height_cm = excluded.height_cm,
        weight_kg = excluded.weight_kg,
        unit_pref = excluded.unit_pref,
        activity = excluded.activity,
        training = excluded.training,
        goal = excluded.goal,
        pregnant_or_breastfeeding = excluded.pregnant_or_breastfeeding,
        ed_screening = excluded.ed_screening,
        age_over_80_acknowledged = excluded.age_over_80_acknowledged,
        rmr_kcal = excluded.rmr_kcal,
        tdee_kcal = excluded.tdee_kcal,
        target_kcal = excluded.target_kcal,
        protein_g = excluded.protein_g,
        carbs_g = excluded.carbs_g,
        fat_g = excluded.fat_g,
        bmi = excluded.bmi,
        warnings_json = excluded.warnings_json,
        calculated_at = excluded.calculated_at,
        applied_at = excluded.applied_at,
        formula_version = excluded.formula_version,
        updated_at = excluded.updated_at`,
      input.sex,
      input.age,
      input.heightCm,
      input.weightKg,
      input.unitPref,
      input.activity,
      input.training,
      input.goal,
      boolToInt(input.pregnantOrBreastfeeding),
      boolToInt(input.edScreening),
      boolToInt(input.ageOver80Acknowledged),
      input.rmrKcal,
      input.tdeeKcal,
      input.targetKcal,
      input.proteinG,
      input.carbsG,
      input.fatG,
      input.bmi,
      JSON.stringify(input.warnings),
      input.calculatedAt,
      input.appliedAt,
      input.formulaVersion,
      updatedAt,
    );
    const saved = await this.get();
    if (!saved) {
      throw new Error('Failed to save calorie plan');
    }
    return saved;
  }

  async clear(): Promise<void> {
    await this.db.runAsync(`DELETE FROM calorie_plan WHERE id = 1`);
  }

  async markApplied(appliedAt: string = nowIso()): Promise<CaloriePlan | null> {
    const existing = await this.get();
    if (!existing) {
      return null;
    }
    return this.upsert({
      ...existing,
      appliedAt,
    });
  }
}
