export type Food = {
  id: string;
  name: string;
  calories: number;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  image: string | null;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
};

export type FoodInsert = {
  id?: string;
  name: string;
  calories: number;
  protein?: number | null;
  carbs?: number | null;
  fat?: number | null;
  image?: string | null;
  pinned?: boolean;
};

export type FoodUpdate = Partial<
  Omit<Food, 'id' | 'createdAt' | 'updatedAt'>
>;
