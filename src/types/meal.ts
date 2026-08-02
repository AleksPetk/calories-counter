export type Meal = {
  id: string;
  name: string;
  image: string | null;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
};

export type MealInsert = {
  id?: string;
  name: string;
  image?: string | null;
  pinned?: boolean;
};

export type MealUpdate = Partial<Omit<Meal, 'id' | 'createdAt' | 'updatedAt'>>;
