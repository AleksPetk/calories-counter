import type { SQLiteDatabase } from 'expo-sqlite';

import type { Profile, ProfileUpdate } from '../../types';
import { ProfileRow, mapProfile } from '../database/mappers';
import { nowIso } from '../database/utils';

export class ProfileRepository {
  constructor(private readonly db: SQLiteDatabase) {}

  async get(): Promise<Profile> {
    const row = await this.db.getFirstAsync<ProfileRow>(
      `SELECT * FROM profile WHERE id = 1`,
    );
    if (!row) {
      throw new Error('Profile row missing');
    }
    return mapProfile(row);
  }

  async update(patch: ProfileUpdate): Promise<Profile> {
    const existing = await this.get();
    const next: Profile = {
      ...existing,
      ...patch,
      nickname:
        patch.nickname !== undefined ? patch.nickname : existing.nickname,
      photo: patch.photo !== undefined ? patch.photo : existing.photo,
      age: patch.age !== undefined ? patch.age : existing.age,
      height: patch.height !== undefined ? patch.height : existing.height,
      weight: patch.weight !== undefined ? patch.weight : existing.weight,
      updatedAt: nowIso(),
    };

    await this.db.runAsync(
      `UPDATE profile SET
        nickname = ?, photo = ?, age = ?, sex = ?, height = ?, weight = ?,
        activity_level = ?, goal = ?, updated_at = ?
      WHERE id = 1`,
      next.nickname,
      next.photo,
      next.age,
      next.sex,
      next.height,
      next.weight,
      next.activityLevel,
      next.goal,
      next.updatedAt,
    );

    return next;
  }
}
