export type MealItem = {
  id: string;
  mealId: string;
  foodId: string;
  /** Quantity for this food within the meal. Unit model deferred. */
  portion: number;
  sortOrder: number;
};

export type MealItemInsert = {
  id?: string;
  mealId: string;
  foodId: string;
  portion: number;
  sortOrder: number;
};

export type MealItemUpdate = Partial<
  Omit<MealItem, 'id' | 'mealId' | 'foodId'>
>;
