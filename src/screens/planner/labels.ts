import type {
  LifestyleActivity,
  PlannerGoal,
  TrainingFrequency,
} from '../../data/planner';

export const GOAL_LABELS: Record<PlannerGoal, string> = {
  maintenance: 'Maintenance',
  slow_loss: 'Slow weight loss',
  moderate_loss: 'Moderate weight loss',
  faster_loss: 'Faster weight loss',
  slow_gain: 'Slow weight gain',
  moderate_gain: 'Moderate weight gain',
  muscle_gain: 'Muscle gain',
};

export const ACTIVITY_LABELS: Record<LifestyleActivity, string> = {
  sedentary: 'Mostly sitting',
  light: 'Some walking / standing',
  moderate: 'On your feet much of the day',
  physical_job: 'Physical job',
};

export const ACTIVITY_HINTS: Record<LifestyleActivity, string> = {
  sedentary: 'Desk work, little walking — do not count workouts here.',
  light: 'Light daily movement — do not count workouts here.',
  moderate: 'Standing or walking often — do not count workouts here.',
  physical_job: 'Manual labor / heavy on-foot work — do not count workouts here.',
};

export const TRAINING_LABELS: Record<TrainingFrequency, string> = {
  none: 'None',
  days_1_2: '1–2 days / week',
  days_3_4: '3–4 days / week',
  days_5_plus: '5+ days / week',
};

export function formatMacroGoalsSummary(
  protein: number | null | undefined,
  carbs: number | null | undefined,
  fat: number | null | undefined,
): string | null {
  if (protein == null && carbs == null && fat == null) {
    return null;
  }
  const p = protein == null ? '—' : `${Math.round(protein)}`;
  const c = carbs == null ? '—' : `${Math.round(carbs)}`;
  const f = fat == null ? '—' : `${Math.round(fat)}`;
  return `Protein ${p} g · Carbs ${c} g · Fat ${f} g`;
}

/** Locale-aware calendar date without time (e.g. "Aug 4, 2026"). */
export function formatAppliedDate(iso: string): string {
  const date = new Date(iso);
  if (!Number.isFinite(date.getTime())) {
    return '';
  }
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
