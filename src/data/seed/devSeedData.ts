export type SeedLibraryItem = {
  id: string;
  name: string;
  calories: number;
  protein?: number | null;
  carbs?: number | null;
  fat?: number | null;
  pinned?: boolean;
  loggingMode: 'quick' | 'portion';
  image?: null;
};

/**
 * Development-only fixture catalog (mixed Quick Log + Portion items).
 * Never call from production paths — gate with __DEV__.
 */
export const DEV_SEED_LIBRARY_ITEMS: SeedLibraryItem[] = [
  { id: 'seed-item-01', name: 'Egg', calories: 78, protein: 6.3, fat: 5.3, carbs: 0.6, pinned: true, loggingMode: 'portion' },
  { id: 'seed-item-02', name: 'Egg White', calories: 17, protein: 3.6, carbs: 0.2, fat: 0.1, loggingMode: 'portion' },
  { id: 'seed-item-03', name: 'Chicken Breast', calories: 165, protein: 31, carbs: 0, fat: 3.6, pinned: true, loggingMode: 'portion' },
  { id: 'seed-item-04', name: 'Chicken Thigh', calories: 209, protein: 26, fat: 10.9, carbs: 0, loggingMode: 'portion' },
  { id: 'seed-item-05', name: 'Salmon', calories: 208, protein: 20, fat: 13, carbs: 0, pinned: true, loggingMode: 'portion' },
  { id: 'seed-item-06', name: 'Greek Yogurt 0%', calories: 59, protein: 10, carbs: 3.6, fat: 0.4, pinned: true, loggingMode: 'portion' },
  { id: 'seed-item-07', name: 'Whey Protein Scoop', calories: 120, protein: 24, carbs: 3, fat: 1.5, pinned: true, loggingMode: 'portion' },
  { id: 'seed-item-08', name: 'Banana', calories: 105, protein: 1.3, carbs: 27, fat: 0.4, loggingMode: 'portion' },
  { id: 'seed-item-09', name: 'White Rice Cooked', calories: 130, protein: 2.7, carbs: 28, fat: 0.3, pinned: true, loggingMode: 'portion' },
  { id: 'seed-item-10', name: 'Oats Dry', calories: 389, protein: 16.9, carbs: 66.3, fat: 6.9, loggingMode: 'portion' },
  { id: 'seed-item-11', name: 'Olive Oil Tbsp', calories: 119, protein: 0, carbs: 0, fat: 13.5, loggingMode: 'portion' },
  { id: 'seed-item-12', name: 'Peanut Butter Tbsp', calories: 94, protein: 4, carbs: 3.1, fat: 8, loggingMode: 'portion' },
  { id: 'seed-item-13', name: 'Broccoli', calories: 34, protein: 2.8, carbs: 7, fat: 0.4, loggingMode: 'portion' },
  { id: 'seed-item-14', name: 'Almonds', calories: 164, protein: 6, carbs: 6.1, fat: 14.2, loggingMode: 'portion' },
  { id: 'seed-item-15', name: 'Sweet Potato', calories: 86, protein: 1.6, carbs: 20.1, fat: 0.1, loggingMode: 'portion' },
  { id: 'seed-item-16', name: 'Restaurant Burger Patty', calories: 250, protein: null, carbs: null, fat: null, loggingMode: 'portion' },
  { id: 'seed-item-17', name: 'Takeout Fried Rice Box', calories: 520, protein: 12, carbs: null, fat: null, loggingMode: 'portion' },
  { id: 'seed-item-18', name: 'Cafe Latte Medium', calories: 190, protein: 10, carbs: 18, fat: null, loggingMode: 'portion' },
  { id: 'seed-item-19', name: 'Protein Bar', calories: 210, protein: 20, carbs: 22, fat: 7, loggingMode: 'portion' },
  { id: 'seed-item-20', name: 'Celery Stick', calories: 6, protein: 0.3, carbs: 1.2, fat: 0.1, loggingMode: 'portion' },
  // Quick Log — fixed meals / servings
  {
    id: 'seed-item-21',
    name: 'Protein Breakfast',
    calories: 370,
    protein: 33.6,
    carbs: 32.4,
    fat: 11.6,
    pinned: true,
    loggingMode: 'quick',
  },
  {
    id: 'seed-item-22',
    name: 'Chicken Rice Bowl',
    calories: 587,
    protein: 52.3,
    carbs: 63,
    fat: 12.15,
    pinned: true,
    loggingMode: 'quick',
  },
  {
    id: 'seed-item-23',
    name: 'Post-Workout Shake',
    calories: 255,
    protein: 26.5,
    carbs: 30.6,
    fat: 4.3,
    pinned: true,
    loggingMode: 'quick',
  },
  {
    id: 'seed-item-24',
    name: 'Salmon Plate',
    calories: 360,
    protein: 26.5,
    carbs: 33.75,
    fat: 13.55,
    loggingMode: 'quick',
  },
  {
    id: 'seed-item-25',
    name: 'Unknown Macro Lunch',
    calories: 530,
    protein: null,
    carbs: null,
    fat: null,
    loggingMode: 'quick',
  },
  {
    id: 'seed-item-26',
    name: 'Light Snack Plate',
    calories: 156,
    protein: 12.6,
    carbs: 21.5,
    fat: 2.9,
    loggingMode: 'quick',
  },
  { id: 'seed-item-27', name: 'Usual Coffee Shop Order', calories: 280, protein: 12, carbs: 35, fat: 9, loggingMode: 'quick' },
  { id: 'seed-item-28', name: 'Office Lunch Set', calories: 650, protein: 35, carbs: 70, fat: 22, loggingMode: 'quick' },
  { id: 'seed-item-29', name: 'Evening Yogurt Bowl', calories: 210, protein: 18, carbs: 28, fat: 3, loggingMode: 'quick' },
  { id: 'seed-item-30', name: 'Homemade Smoothie Mystery', calories: 320, protein: null, carbs: null, fat: null, pinned: true, loggingMode: 'quick' },
];
