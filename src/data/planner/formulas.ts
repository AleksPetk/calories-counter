import {
  PLANNER_FORMULA_VERSION,
  type LifestyleActivity,
  type PlannerAnswers,
  type PlannerComputeOutcome,
  type PlannerGoal,
  type PlannerMacros,
  type PlannerSex,
  type PlannerWarningCode,
  type TrainingFrequency,
} from './types';

/** AND-aligned adult low-calorie floors used as hard caps on recommendations. */
export const CALORIE_FLOOR_FEMALE = 1200;
export const CALORIE_FLOOR_MALE = 1500;

const LIFESTYLE_MULTIPLIER: Record<LifestyleActivity, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  physical_job: 1.725,
};

/**
 * Structured-training add-on to lifestyle PAL.
 * Modest and capped so workout days are not counted twice inside lifestyle.
 */
const TRAINING_ADDON: Record<TrainingFrequency, number> = {
  none: 0,
  days_1_2: 0.075,
  days_3_4: 0.125,
  days_5_plus: 0.175,
};

const MAX_ACTIVITY_MULTIPLIER = 1.9;

const GOAL_DELTA: Record<PlannerGoal, number> = {
  maintenance: 0,
  slow_loss: -250,
  moderate_loss: -500,
  faster_loss: -750,
  slow_gain: 200,
  moderate_gain: 350,
  muscle_gain: 250,
};

const PROTEIN_G_PER_KG: Record<PlannerGoal, number> = {
  maintenance: 1.6,
  slow_loss: 1.8,
  moderate_loss: 1.8,
  faster_loss: 1.8,
  slow_gain: 1.6,
  moderate_gain: 1.6,
  muscle_gain: 2.0,
};

const FAT_KCAL_FRACTION: Record<PlannerGoal, number> = {
  maintenance: 0.3,
  slow_loss: 0.25,
  moderate_loss: 0.25,
  faster_loss: 0.25,
  slow_gain: 0.3,
  moderate_gain: 0.3,
  muscle_gain: 0.25,
};

export function roundToNearest(value: number, step: number): number {
  return Math.round(value / step) * step;
}

export function computeBmi(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100;
  if (!(heightM > 0) || !(weightKg > 0)) {
    return NaN;
  }
  return weightKg / (heightM * heightM);
}

/** Mifflin–St Jeor (1990) resting metabolic rate, kcal/day. */
export function computeMifflinStJeorRmr(
  sex: PlannerSex,
  weightKg: number,
  heightCm: number,
  age: number,
): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return sex === 'male' ? base + 5 : base - 161;
}

export function calorieFloorForSex(sex: PlannerSex): number {
  return sex === 'male' ? CALORIE_FLOOR_MALE : CALORIE_FLOOR_FEMALE;
}

/**
 * Combined activity multiplier:
 * lifestyle PAL (excludes workouts) + training add-on, capped at 1.9.
 */
export function computeActivityMultiplier(
  activity: LifestyleActivity,
  training: TrainingFrequency,
): {
  lifestyleMultiplier: number;
  trainingAddon: number;
  activityMultiplier: number;
} {
  const lifestyleMultiplier = LIFESTYLE_MULTIPLIER[activity];
  const trainingAddon = TRAINING_ADDON[training];
  const activityMultiplier = Math.min(
    MAX_ACTIVITY_MULTIPLIER,
    lifestyleMultiplier + trainingAddon,
  );
  return { lifestyleMultiplier, trainingAddon, activityMultiplier };
}

export function isLossGoal(goal: PlannerGoal): boolean {
  return (
    goal === 'slow_loss' ||
    goal === 'moderate_loss' ||
    goal === 'faster_loss'
  );
}

/**
 * Goals offered after BMI / safety screening (before calorie floor check).
 * Faster loss only when BMI >= 30.
 */
export function availableGoalsForBmi(bmi: number): PlannerGoal[] {
  if (!(bmi > 0) || bmi < 16) {
    return [];
  }
  if (bmi < 18.5) {
    return ['maintenance', 'slow_gain', 'moderate_gain', 'muscle_gain'];
  }
  const base: PlannerGoal[] = [
    'maintenance',
    'slow_loss',
    'moderate_loss',
    'slow_gain',
    'moderate_gain',
    'muscle_gain',
  ];
  if (bmi >= 30) {
    base.splice(3, 0, 'faster_loss');
  }
  return base;
}

function proteinTargetG(
  goal: PlannerGoal,
  weightKg: number,
  training: TrainingFrequency,
): number {
  let perKg = PROTEIN_G_PER_KG[goal];
  // Resistance training supports a modest protein nudge (not a second TDEE).
  if (training === 'days_3_4') {
    perKg += 0.1;
  } else if (training === 'days_5_plus') {
    perKg += 0.2;
  }
  return perKg * weightKg;
}

export function computeMacros(options: {
  targetKcal: number;
  goal: PlannerGoal;
  weightKg: number;
  training: TrainingFrequency;
}): PlannerMacros {
  const { targetKcal, goal, weightKg, training } = options;
  let proteinG = proteinTargetG(goal, weightKg, training);
  const maxProteinFromKcal = (targetKcal * 0.4) / 4;
  proteinG = Math.min(proteinG, maxProteinFromKcal);

  const fatFromFraction = (targetKcal * FAT_KCAL_FRACTION[goal]) / 9;
  const fatFloorG = Math.max(0.6 * weightKg, (targetKcal * 0.2) / 9);
  let fatG = Math.max(fatFromFraction, fatFloorG);

  let proteinKcal = proteinG * 4;
  let fatKcal = fatG * 9;
  if (proteinKcal + fatKcal >= targetKcal) {
    // Keep protein priority; shrink fat to fit, never below 15% kcal.
    const minFatKcal = targetKcal * 0.15;
    fatKcal = Math.max(minFatKcal, targetKcal - proteinKcal);
    fatG = fatKcal / 9;
    proteinKcal = Math.min(proteinKcal, targetKcal - fatKcal);
    proteinG = proteinKcal / 4;
  }

  const carbsKcal = Math.max(0, targetKcal - proteinG * 4 - fatG * 9);
  const carbsG = carbsKcal / 4;

  return {
    proteinG: Math.max(0, Math.round(proteinG)),
    carbsG: Math.max(0, Math.round(carbsG)),
    fatG: Math.max(0, Math.round(fatG)),
  };
}

function validateNumericAnswers(answers: PlannerAnswers): boolean {
  const { age, heightCm, weightKg } = answers;
  if (!Number.isFinite(age) || age < 1 || age > 120) {
    return false;
  }
  if (!Number.isFinite(heightCm) || heightCm < 100 || heightCm > 250) {
    return false;
  }
  if (!Number.isFinite(weightKg) || weightKg < 30 || weightKg > 400) {
    return false;
  }
  return true;
}

/**
 * Pure planner computation. Never reads logging history.
 */
export function computePlannerRecommendation(
  answers: PlannerAnswers,
): PlannerComputeOutcome {
  if (!validateNumericAnswers(answers)) {
    return {
      ok: false,
      reason: 'invalid_inputs',
      message: 'Check age, height, and weight, then try again.',
      bmi: null,
      availableGoals: [],
    };
  }

  if (answers.age < 18) {
    return {
      ok: false,
      reason: 'under_18',
      message:
        'These estimates are for adults 18 and older. Ask a qualified clinician for guidance.',
      bmi: null,
      availableGoals: [],
    };
  }

  if (answers.pregnantOrBreastfeeding) {
    return {
      ok: false,
      reason: 'pregnancy_or_breastfeeding',
      message:
        'Generic calorie estimates are not suitable during pregnancy or breastfeeding. Use guidance from your clinician.',
      bmi: null,
      availableGoals: [],
    };
  }

  if (answers.edScreening) {
    return {
      ok: false,
      reason: 'ed_screening',
      message:
        'If you have an eating disorder or are in treatment, do not use this planner. Seek professional care.',
      bmi: null,
      availableGoals: [],
    };
  }

  if (answers.age > 80 && !answers.ageOver80Acknowledged) {
    return {
      ok: false,
      reason: 'age_over_80_needs_ack',
      message:
        'Estimates are less reliable over age 80. Confirm you understand before continuing.',
      bmi: computeBmi(answers.weightKg, answers.heightCm),
      availableGoals: [],
    };
  }

  const bmi = computeBmi(answers.weightKg, answers.heightCm);
  if (!(bmi > 0) || bmi < 16) {
    return {
      ok: false,
      reason: 'very_low_bmi',
      message:
        'Generic estimates are not suitable at a very low BMI. Speak with a qualified clinician.',
      bmi: Number.isFinite(bmi) ? bmi : null,
      availableGoals: [],
    };
  }

  const availableGoals = availableGoalsForBmi(bmi);
  if (!availableGoals.includes(answers.goal)) {
    if (isLossGoal(answers.goal) && bmi < 18.5) {
      return {
        ok: false,
        reason: 'loss_not_appropriate',
        message:
          'Weight-loss targets are not offered at a low BMI. Choose maintenance or a gain goal, or speak with a clinician.',
        bmi,
        availableGoals,
      };
    }
    if (answers.goal === 'faster_loss') {
      return {
        ok: false,
        reason: 'faster_loss_not_appropriate',
        message:
          'Faster weight loss is only shown when BMI is 30 or higher and the result stays above the safety floor.',
        bmi,
        availableGoals,
      };
    }
    return {
      ok: false,
      reason: 'invalid_inputs',
      message: 'That goal is not available for these answers.',
      bmi,
      availableGoals,
    };
  }

  const rmr = computeMifflinStJeorRmr(
    answers.sex,
    answers.weightKg,
    answers.heightCm,
    answers.age,
  );
  const { lifestyleMultiplier, trainingAddon, activityMultiplier } =
    computeActivityMultiplier(answers.activity, answers.training);
  const tdee = roundToNearest(rmr * activityMultiplier, 10);
  const floor = calorieFloorForSex(answers.sex);
  const rawTarget = tdee + GOAL_DELTA[answers.goal];
  let targetKcal = roundToNearest(rawTarget, 10);
  let floorApplied = false;

  if (targetKcal < floor) {
    targetKcal = floor;
    floorApplied = true;
  }

  // Faster loss must remain above the floor after adjustment; otherwise hide it.
  if (answers.goal === 'faster_loss' && (floorApplied || rawTarget < floor)) {
    return {
      ok: false,
      reason: 'faster_loss_not_appropriate',
      message:
        'Faster weight loss would fall below the safety floor for these inputs. Choose a milder goal.',
      bmi,
      availableGoals: availableGoals.filter((g) => g !== 'faster_loss'),
    };
  }

  const macros = computeMacros({
    targetKcal,
    goal: answers.goal,
    weightKg: answers.weightKg,
    training: answers.training,
  });

  const warnings: PlannerWarningCode[] = [
    'estimate_only',
    'not_medical_advice',
    'individual_variation',
  ];
  if (answers.age > 80) {
    warnings.push('age_over_80_ack');
  }
  if (floorApplied) {
    warnings.push('calorie_floor_applied');
  }
  if (answers.goal === 'faster_loss') {
    warnings.push('faster_loss_bmi_gate');
  }

  return {
    ok: true,
    result: {
      formulaVersion: PLANNER_FORMULA_VERSION,
      rmrKcal: roundToNearest(rmr, 1),
      tdeeKcal: tdee,
      targetKcal,
      macros,
      bmi: Math.round(bmi * 10) / 10,
      lifestyleMultiplier,
      trainingAddon,
      activityMultiplier,
      goalDeltaKcal: GOAL_DELTA[answers.goal],
      floorApplied,
      warnings,
      availableGoals:
        answers.goal === 'faster_loss' || (!floorApplied && bmi >= 30)
          ? availableGoals
          : availableGoals.filter((g) => {
              if (g !== 'faster_loss') {
                return true;
              }
              const fasterRaw = tdee + GOAL_DELTA.faster_loss;
              return fasterRaw >= floor;
            }),
    },
  };
}

export function warningMessage(code: PlannerWarningCode): string {
  switch (code) {
    case 'estimate_only':
      return 'Results are estimates, not precise measurements.';
    case 'not_medical_advice':
      return 'This is not medical advice, a diagnosis, or a treatment plan.';
    case 'individual_variation':
      return 'Individual bodies and real-world responses differ.';
    case 'age_over_80_ack':
      return 'You confirmed that estimates may be less reliable over age 80.';
    case 'calorie_floor_applied':
      return 'The target was limited to a safer estimate minimum.';
    case 'faster_loss_bmi_gate':
      return 'Faster loss was offered only because BMI was 30+ and the target stayed above the safety floor.';
    case 'loss_blocked_low_bmi':
      return 'Loss goals are not offered at a low BMI.';
    case 'blocked_under_18':
      return 'Planner estimates are for adults 18+.';
    case 'blocked_pregnancy':
      return 'Not suitable during pregnancy or breastfeeding.';
    case 'blocked_ed_screening':
      return 'Not suitable when an eating disorder is present or in treatment.';
    case 'blocked_very_low_bmi':
      return 'Not suitable at a very low BMI.';
    default:
      return '';
  }
}
