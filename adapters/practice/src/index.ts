import type { PracticeAttempt, PracticeProgress, PracticeRepository } from '@learntify/learning';

export interface PracticeDatabase {
  prepare(sql: string): {
    bind(...values: (string | number)[]): {
      first<T>(): Promise<T | null>;
      all<T>(): Promise<{ results: T[] }>;
    };
  };
}
export class D1PracticeRepository implements PracticeRepository {
  constructor(private readonly db: PracticeDatabase) {}
  async save(ownerId: string, attempt: PracticeAttempt, now: number) {
    // Conditional insertion makes the rolling daily cap atomic even across concurrent requests.
    const inserted = await this.db
      .prepare(
        `INSERT INTO practice_attempts
      (user_id, id, lesson_id, lesson_version, code, matched, created_at)
      SELECT ?, ?, ?, ?, ?, ?, ? WHERE
      (SELECT COUNT(*) FROM practice_attempts WHERE user_id = ? AND created_at > ?) < 100
      ON CONFLICT(user_id, id) DO NOTHING RETURNING id`,
      )
      .bind(
        ownerId,
        attempt.id,
        attempt.lessonId,
        attempt.lessonVersion,
        attempt.code,
        Number(attempt.matched),
        now,
        ownerId,
        now - 86400000,
      )
      .first();
    if (inserted) return 'saved' as const;
    const previous = await this.db
      .prepare(
        `SELECT lesson_id AS lessonId, lesson_version AS lessonVersion, code, matched
      FROM practice_attempts WHERE user_id = ? AND id = ?`,
      )
      .bind(ownerId, attempt.id)
      .first<Omit<PracticeAttempt, 'id' | 'matched'> & { matched: number }>();
    if (!previous) return 'limit' as const;
    return previous.lessonId === attempt.lessonId &&
      previous.lessonVersion === attempt.lessonVersion &&
      previous.code === attempt.code &&
      Boolean(previous.matched) === attempt.matched
      ? ('saved' as const)
      : ('conflict' as const);
  }
  async progress(ownerId: string): Promise<PracticeProgress[]> {
    const rows = await this.db
      .prepare(
        `SELECT lesson_id AS lessonId, lesson_version AS lessonVersion,
      attempts, matched, created_at AS lastPracticedAt FROM (
        SELECT *, COUNT(*) OVER (PARTITION BY lesson_id, lesson_version) AS attempts,
        ROW_NUMBER() OVER (PARTITION BY lesson_id, lesson_version ORDER BY created_at DESC, rowid DESC) AS position
        FROM practice_attempts WHERE user_id = ?
      ) WHERE position = 1`,
      )
      .bind(ownerId)
      .all<Omit<PracticeProgress, 'matched'> & { matched: number }>();
    return rows.results.map((row) => ({ ...row, matched: Boolean(row.matched) }));
  }
}
