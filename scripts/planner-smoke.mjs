/**
 * Stage A — Calorie Planner formulas, floors, BMI gates, training add-on.
 * Mirrors src/data/planner/formulas.ts (keep in sync).
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function read(rel) {
  return readFileSync(join(root, rel), 'utf8');
}

const CALORIE_FLOOR_FEMALE = 1200;
const CALORIE_FLOOR_MALE = 1500;
const MAX_ACTIVITY_MULTIPLIER = 1.9;

const LIFESTYLE_MULTIPLIER = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  physical_job: 1.725,
};

const TRAINING_ADDON = {
  none: 0,
  days_1_2: 0.075,
  days_3_4: 0.125,
  days_5_plus: 0.175,
};

const GOAL_DELTA = {
  maintenance: 0,
  slow_loss: -250,
  moderate_loss: -500,
  faster_loss: -750,
  slow_gain: 200,
  moderate_gain: 350,
  muscle_gain: 250,
};

function roundToNearest(value, step) {
  return Math.round(value / step) * step;
}

function computeBmi(weightKg, heightCm) {
  const heightM = heightCm / 100;
  return weightKg / (heightM * heightM);
}

function computeMifflinStJeorRmr(sex, weightKg, heightCm, age) {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return sex === 'male' ? base + 5 : base - 161;
}

function computeActivityMultiplier(activity, training) {
  const lifestyleMultiplier = LIFESTYLE_MULTIPLIER[activity];
  const trainingAddon = TRAINING_ADDON[training];
  return Math.min(
    MAX_ACTIVITY_MULTIPLIER,
    lifestyleMultiplier + trainingAddon,
  );
}

function availableGoalsForBmi(bmi) {
  if (!(bmi > 0) || bmi < 16) return [];
  if (bmi < 18.5) {
    return ['maintenance', 'slow_gain', 'moderate_gain', 'muscle_gain'];
  }
  const base = [
    'maintenance',
    'slow_loss',
    'moderate_loss',
    'slow_gain',
    'moderate_gain',
    'muscle_gain',
  ];
  if (bmi >= 30) base.splice(3, 0, 'faster_loss');
  return base;
}

function calorieFloorForSex(sex) {
  return sex === 'male' ? CALORIE_FLOOR_MALE : CALORIE_FLOOR_FEMALE;
}

{
  // Mifflin–St Jeor known check (male 80kg 180cm age 30)
  const rmr = computeMifflinStJeorRmr('male', 80, 180, 30);
  assert.equal(Math.round(rmr), 1780);
}

{
  // Training add-on does not double-count past 1.9
  const m = computeActivityMultiplier('physical_job', 'days_5_plus');
  assert.equal(m, 1.9);
  assert.ok(
    LIFESTYLE_MULTIPLIER.physical_job + TRAINING_ADDON.days_5_plus > 1.9,
  );
}

{
  // Faster loss only when BMI >= 30
  assert.ok(!availableGoalsForBmi(28).includes('faster_loss'));
  assert.ok(availableGoalsForBmi(31).includes('faster_loss'));
  assert.ok(!availableGoalsForBmi(17).includes('slow_loss'));
}

{
  // Floor clamp
  const sex = 'female';
  const tdee = 1400;
  let target = roundToNearest(tdee + GOAL_DELTA.moderate_loss, 10);
  const floor = calorieFloorForSex(sex);
  let floorApplied = false;
  if (target < floor) {
    target = floor;
    floorApplied = true;
  }
  assert.equal(target, 1200);
  assert.equal(floorApplied, true);
}

{
  // Faster loss rejected when raw target below floor
  const sex = 'female';
  const tdee = 1800;
  const raw = tdee + GOAL_DELTA.faster_loss; // 1050
  assert.ok(raw < calorieFloorForSex(sex));
}

{
  // Source wiring checks
  const formulas = read('src/data/planner/formulas.ts');
  assert.match(formulas, /Mifflin/);
  assert.match(formulas, /computePlannerRecommendation/);
  assert.match(formulas, /TRAINING_ADDON/);
  assert.match(formulas, /CALORIE_FLOOR_FEMALE = 1200/);
  assert.match(formulas, /CALORIE_FLOOR_MALE = 1500/);

  const migrate = read('src/data/database/migrate.ts');
  assert.match(migrate, /version: 5/);
  assert.match(migrate, /CALORIE_PLAN_SQL/);
  assert.match(migrate, /protein_goal/);

  const constants = read('src/data/database/constants.ts');
  assert.match(constants, /SCHEMA_VERSION = 5/);

  const backupTypes = read('src/data/backup/types.ts');
  assert.match(backupTypes, /BACKUP_FORMAT_VERSION = 2/);
  assert.match(backupTypes, /caloriePlan/);
  assert.match(backupTypes, /proteinGoal/);

  const erase = read('src/data/erase/eraseAllData.ts');
  assert.match(erase, /caloriePlan\.clear/);
  assert.match(erase, /proteinGoal: null/);

  const settings = read('src/screens/SettingsScreen.tsx');
  assert.match(settings, /Calorie Planner/);
  assert.match(settings, /CaloriePlanner/);

  const onboarding = read('src/onboarding/pages.tsx');
  assert.match(onboarding, /Calorie Planner/);
  assert.match(onboarding, /id: 'planner'/);
  assert.match(onboarding, /Estimates only — not medical advice/);

  const units = read('src/data/planner/units.ts');
  assert.match(units, /defaultUnitPrefForNewPlan/);
  assert.match(units, /return 'metric'/);
  assert.doesNotMatch(units, /en-us/);

  const questionnaire = read(
    'src/screens/planner/PlannerQuestionnaireScreen.tsx',
  );
  assert.match(questionnaire, /defaultUnitPrefForNewPlan/);
  assert.match(questionnaire, /setUnitPref\(existing\.unitPref\)/);

  const plannerUi = read('src/screens/planner/CaloriePlannerScreen.tsx');
  assert.doesNotMatch(plannerUi, /BMI \(for gating only\)/);
  assert.match(plannerUi, /Recalculate Plan/);
  assert.match(plannerUi, /scrollBottomPad/);
  assert.match(plannerUi, /formatAppliedDate/);

  const labels = read('src/screens/planner/labels.ts');
  assert.match(labels, /Protein \$\{p\} g · Carbs \$\{c\} g · Fat \$\{f\} g/);

  // No logging history coupling
  assert.doesNotMatch(formulas, /daily_log/);
  assert.doesNotMatch(formulas, /DailyLog/);
}

console.log('planner-smoke: ok');
