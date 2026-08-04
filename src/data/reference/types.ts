export type ReferenceCategory =
  | 'meat_poultry'
  | 'fish_seafood'
  | 'eggs'
  | 'grains'
  | 'beans_legumes'
  | 'vegetables'
  | 'fruits'
  | 'nuts_seeds';

export type ReferenceState = 'raw' | 'uncooked' | 'dry';

export type ReferenceFood = {
  id: string;
  name: string;
  displayName: string;
  category: ReferenceCategory;
  state: ReferenceState;
  servingBasis: 'per_100g';
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fdcId: number;
  usdaDescription: string;
  source: 'sr_legacy';
  sourceVersion: string;
  dataType: string;
};

export type ReferenceFoodsDataset = {
  format: 'quickcal-reference-foods';
  version: number;
  source: {
    name: string;
    dataType: string;
    release: string;
    license: string;
    url: string;
    attribution: string;
  };
  itemCount: number;
  items: ReferenceFood[];
};

export const REFERENCE_CATEGORY_LABELS: Record<ReferenceCategory, string> = {
  meat_poultry: 'Meat & Poultry',
  fish_seafood: 'Fish & Seafood',
  eggs: 'Eggs',
  grains: 'Grains',
  beans_legumes: 'Beans & Legumes',
  vegetables: 'Vegetables',
  fruits: 'Fruits',
  nuts_seeds: 'Nuts & Seeds',
};

export const REFERENCE_STATE_LABELS: Record<ReferenceState, string> = {
  raw: 'Raw',
  uncooked: 'Uncooked',
  dry: 'Dry',
};

export const REFERENCE_CATEGORIES: ReferenceCategory[] = [
  'meat_poultry',
  'fish_seafood',
  'eggs',
  'grains',
  'beans_legumes',
  'vegetables',
  'fruits',
  'nuts_seeds',
];
