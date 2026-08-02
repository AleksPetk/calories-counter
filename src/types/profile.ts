export type Sex = 'female' | 'male' | 'other' | 'unspecified';

export type ActivityLevel =
  | 'sedentary'
  | 'light'
  | 'moderate'
  | 'active'
  | 'very_active'
  | 'unspecified';

export type GoalType =
  | 'lose'
  | 'maintain'
  | 'gain'
  | 'unspecified';

export type Profile = {
  id: number;
  nickname: string | null;
  photo: string | null;
  age: number | null;
  sex: Sex;
  height: number | null;
  weight: number | null;
  activityLevel: ActivityLevel;
  goal: GoalType;
  updatedAt: string;
};

export type ProfileUpdate = Partial<
  Omit<Profile, 'id' | 'updatedAt'>
>;
