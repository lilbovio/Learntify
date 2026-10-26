import type {
  PlanInput,
  PlanQuery,
  PlanRecord,
  PlanStatus,
  StudyPlanRepository,
} from '@learntify/study-plans';
export interface StudyPlanDatabase {
  prepare(sql: string): {
    bind(...values: (string | number | null)[]): {
      first<T>(): Promise<T | null>;
      all<T>(): Promise<{ results: T[] }>;
    };
  };
}
const columns =
  'id, owner_id AS ownerId, slug, title, description, weekly_minutes AS weeklyMinutes, status, created_at AS createdAt, updated_at AS updatedAt';
type Row = Omit<PlanRecord, 'createdAt' | 'updatedAt'> & { createdAt: number; updatedAt: number };
function decode(row: Row): PlanRecord {
  return {
    ...row,
    createdAt: new Date(row.createdAt).toISOString(),
    updatedAt: new Date(row.updatedAt).toISOString(),
  };
}
export class D1StudyPlanRepository implements StudyPlanRepository {
  constructor(private readonly db: StudyPlanDatabase) {}
  async list(ownerId: string, query: PlanQuery) {
    const result = await this.db
      .prepare(
        `SELECT ${columns} FROM study_plans WHERE owner_id = ? ${query.status ? 'AND status = ?' : ''} ORDER BY created_at DESC, id DESC LIMIT ? OFFSET ?`,
      )
      .bind(
        ownerId,
        ...(query.status ? [query.status] : []),
        query.limit,
        (query.page - 1) * query.limit,
      )
      .all<Row>();
    return result.results.map(decode);
  }
  async get(ownerId: string, id: string) {
    const row = await this.db
      .prepare(`SELECT ${columns} FROM study_plans WHERE owner_id = ? AND id = ?`)
      .bind(ownerId, id)
      .first<Row>();
    return row ? decode(row) : null;
  }
  async create(plan: PlanRecord) {
    const row = await this.db
      .prepare(
        `INSERT INTO study_plans (id, owner_id, slug, title, description, weekly_minutes, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(owner_id, slug) DO NOTHING RETURNING ${columns}`,
      )
      .bind(
        plan.id,
        plan.ownerId,
        plan.slug,
        plan.title,
        plan.description,
        plan.weeklyMinutes,
        plan.status,
        Date.parse(plan.createdAt),
        Date.parse(plan.updatedAt),
      )
      .first<Row>();
    return row ? decode(row) : null;
  }
  async replace(
    ownerId: string,
    id: string,
    input: PlanInput & { status: PlanStatus },
    updatedAt: string,
  ) {
    const row = await this.db
      .prepare(
        `UPDATE study_plans SET title = ?, description = ?, weekly_minutes = ?, status = ?, updated_at = ? WHERE owner_id = ? AND id = ? RETURNING ${columns}`,
      )
      .bind(
        input.title,
        input.description,
        input.weeklyMinutes,
        input.status,
        Date.parse(updatedAt),
        ownerId,
        id,
      )
      .first<Row>();
    return row ? decode(row) : null;
  }
  async delete(ownerId: string, id: string) {
    return Boolean(
      await this.db
        .prepare('DELETE FROM study_plans WHERE owner_id = ? AND id = ? RETURNING id')
        .bind(ownerId, id)
        .first(),
    );
  }
}
