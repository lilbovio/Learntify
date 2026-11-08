export type PlanStatus = 'draft' | 'active' | 'completed';
export class StudyPlanLimitError extends Error {
  constructor() {
    super('Study plan capacity reached.');
  }
}
export interface PlanInput {
  title: string;
  description: string;
  weeklyMinutes: number;
}
export interface PlanRecord extends PlanInput {
  id: string;
  ownerId: string;
  slug: string;
  status: PlanStatus;
  createdAt: string;
  updatedAt: string;
}
export interface PlanQuery {
  page: number;
  limit: number;
  status?: PlanStatus | undefined;
}
export class StudyPlan {
  private readonly record: PlanRecord;
  constructor(record: PlanRecord) {
    if (
      !record.ownerId ||
      record.slug.length < 3 ||
      record.slug.length > 60 ||
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(record.slug) ||
      !record.title.trim() ||
      record.title.trim().length > 120 ||
      record.description.length > 2000 ||
      !Number.isInteger(record.weeklyMinutes) ||
      record.weeklyMinutes < 15 ||
      record.weeklyMinutes > 1200 ||
      !['draft', 'active', 'completed'].includes(record.status)
    )
      throw new Error('Invalid study plan');
    this.record = { ...record, title: record.title.trim() };
  }
  toJSON(): PlanRecord {
    return { ...this.record };
  }
}
export interface StudyPlanRepository {
  list(ownerId: string, query: PlanQuery): Promise<PlanRecord[]>;
  get(ownerId: string, id: string): Promise<PlanRecord | null>;
  create(plan: PlanRecord): Promise<PlanRecord | null>;
  replace(
    ownerId: string,
    id: string,
    input: PlanInput & { status: PlanStatus },
    updatedAt: string,
  ): Promise<PlanRecord | null>;
  delete(ownerId: string, id: string): Promise<boolean>;
}
export class StudyPlanService {
  constructor(private readonly repository: StudyPlanRepository) {}
  list(ownerId: string, query: PlanQuery) {
    return this.repository.list(ownerId, query);
  }
  get(ownerId: string, id: string) {
    return this.repository.get(ownerId, id);
  }
  create(ownerId: string, input: PlanInput & { slug: string }) {
    const now = new Date().toISOString();
    return this.repository.create(
      new StudyPlan({
        ...input,
        id: crypto.randomUUID(),
        ownerId,
        status: 'draft',
        createdAt: now,
        updatedAt: now,
      }).toJSON(),
    );
  }
  async replace(ownerId: string, id: string, input: PlanInput & { status: PlanStatus }) {
    const existing = await this.repository.get(ownerId, id);
    if (!existing) return null;
    const plan = new StudyPlan({
      ...existing,
      ...input,
      updatedAt: new Date().toISOString(),
    }).toJSON();
    return this.repository.replace(ownerId, id, plan, plan.updatedAt);
  }
  delete(ownerId: string, id: string) {
    return this.repository.delete(ownerId, id);
  }
}
