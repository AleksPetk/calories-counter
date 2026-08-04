import {
  REFERENCE_CATEGORY_LABELS,
  type ReferenceCategory,
  type ReferenceFood,
} from './types';

/**
 * Scale per-100 g reference nutrients to a custom gram amount.
 */
export function scaleReferenceNutrition(
  item: Pick<ReferenceFood, 'calories' | 'protein' | 'carbs' | 'fat'>,
  grams: number,
): {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
} {
  if (!(grams > 0) || !Number.isFinite(grams)) {
    return { calories: 0, protein: 0, carbs: 0, fat: 0 };
  }
  const scale = grams / 100;
  return {
    calories: Math.round(item.calories * scale * 10) / 10,
    protein: Math.round(item.protein * scale * 10) / 10,
    carbs: Math.round(item.carbs * scale * 10) / 10,
    fat: Math.round(item.fat * scale * 10) / 10,
  };
}

export function matchesReferenceQuery(
  item: ReferenceFood,
  query: string,
): boolean {
  const q = query.trim().toLowerCase();
  if (!q) {
    return true;
  }
  const haystack = [
    item.name,
    item.displayName,
    item.state,
    item.category,
    REFERENCE_CATEGORY_LABELS[item.category],
    item.usdaDescription,
  ]
    .join(' ')
    .toLowerCase();
  // All whitespace-separated tokens must appear (order-independent).
  return q.split(/\s+/).every((token) => haystack.includes(token));
}

export function filterReferenceFoods(
  items: ReferenceFood[],
  options: {
    query?: string;
    category?: ReferenceCategory | null;
  },
): ReferenceFood[] {
  const { query = '', category = null } = options;
  return items.filter((item) => {
    if (category && item.category !== category) {
      return false;
    }
    return matchesReferenceQuery(item, query);
  });
}
