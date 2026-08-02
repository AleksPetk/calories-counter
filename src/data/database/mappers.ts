import type {
  DailyLogEntry,
  Food,
  LogSourceType,
  Meal,
  MealItem,
  Profile,
  PurchaseState,
  Settings,
  ActivityLevel,
  GoalType,
  Sex,
} from '../../types';
import { intToBool } from './utils';

export type FoodRow = {
  id: string;
  name: string;
  calories: number;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  image: string | null;
  pinned: number;
  created_at: string;
  updated_at: string;
};

export type MealRow = {
  id: string;
  name: string;
  image: string | null;
  pinned: number;
  created_at: string;
  updated_at: string;
};

export type MealItemRow = {
  id: string;
  meal_id: string;
  food_id: string;
  portion: number;
  sort_order: number;
};

export type DailyLogEntryRow = {
  id: string;
  date: string;
  time: string;
  source_type: string;
  source_id: string | null;
  calories: number;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  food_name_snapshot: string;
  portion: number | null;
};

export type ProfileRow = {
  id: number;
  nickname: string | null;
  photo: string | null;
  age: number | null;
  sex: string;
  height: number | null;
  weight: number | null;
  activity_level: string;
  goal: string;
  updated_at: string;
};

export type SettingsRow = {
  id: number;
  daily_goal: number;
  reset_time: string;
  history_retention: number | null;
  tutorial_seen: number;
  purchase_state: string;
  updated_at: string;
};

export function mapFood(row: FoodRow): Food {
  return {
    id: row.id,
    name: row.name,
    calories: row.calories,
    protein: row.protein,
    carbs: row.carbs,
    fat: row.fat,
    image: row.image,
    pinned: intToBool(row.pinned),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapMeal(row: MealRow): Meal {
  return {
    id: row.id,
    name: row.name,
    image: row.image,
    pinned: intToBool(row.pinned),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapMealItem(row: MealItemRow): MealItem {
  return {
    id: row.id,
    mealId: row.meal_id,
    foodId: row.food_id,
    portion: row.portion,
    sortOrder: row.sort_order,
  };
}

export function mapDailyLogEntry(row: DailyLogEntryRow): DailyLogEntry {
  return {
    id: row.id,
    date: row.date,
    time: row.time,
    sourceType: row.source_type as LogSourceType,
    sourceId: row.source_id,
    calories: row.calories,
    protein: row.protein,
    carbs: row.carbs,
    fat: row.fat,
    foodNameSnapshot: row.food_name_snapshot,
    portion: row.portion,
  };
}

export function mapProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    nickname: row.nickname,
    photo: row.photo,
    age: row.age,
    sex: row.sex as Sex,
    height: row.height,
    weight: row.weight,
    activityLevel: row.activity_level as ActivityLevel,
    goal: row.goal as GoalType,
    updatedAt: row.updated_at,
  };
}

export function mapSettings(row: SettingsRow): Settings {
  return {
    id: row.id,
    dailyGoal: row.daily_goal,
    resetTime: row.reset_time,
    historyRetention: row.history_retention,
    tutorialSeen: intToBool(row.tutorial_seen),
    purchaseState: row.purchase_state as PurchaseState,
    updatedAt: row.updated_at,
  };
}
