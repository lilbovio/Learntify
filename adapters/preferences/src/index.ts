import type { LearningPreferences, PreferencesRepository } from '@learntify/learning';
export interface PreferencesDatabase {
  prepare(sql: string): {
    bind(...values: (string | number | null)[]): { first<T>(): Promise<T | null> };
  };
}
export class D1PreferencesRepository implements PreferencesRepository {
  constructor(private readonly db: PreferencesDatabase) {}
  async get(ownerId: string): Promise<LearningPreferences | null> {
    return this.db
      .prepare(
        'SELECT locale, goal, weekly_minutes AS weeklyMinutes FROM learning_preferences WHERE user_id = ?',
      )
      .bind(ownerId)
      .first<LearningPreferences>();
  }
  async save(ownerId: string, preferences: LearningPreferences): Promise<void> {
    await this.db
      .prepare(
        `INSERT INTO learning_preferences (user_id, locale, goal, weekly_minutes, updated_at)
      VALUES (?, ?, ?, ?, ?) ON CONFLICT(user_id) DO UPDATE SET locale = excluded.locale, goal = excluded.goal, weekly_minutes = excluded.weekly_minutes, updated_at = excluded.updated_at RETURNING user_id`,
      )
      .bind(ownerId, preferences.locale, preferences.goal, preferences.weeklyMinutes, Date.now())
      .first();
  }
}
