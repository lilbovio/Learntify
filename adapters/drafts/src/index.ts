import type { Draft, DraftRepository, SaveDraft, SaveResult } from '@learntify/learning';

interface Statement {
  bind(...values: (string | number)[]): Statement;
  first<T>(): Promise<T | null>;
}
export interface DraftDatabase {
  prepare(sql: string): Statement;
  batch(statements: Statement[]): Promise<unknown>;
}

type Row = { id: string; owner_id: string; content: string; revision: number };
type Operation = { expected_revision: number; content: string; resulting_revision: number };

export class D1DraftRepository implements DraftRepository {
  constructor(private readonly db: DraftDatabase) {}

  async get(id: string, ownerId: string): Promise<Draft | undefined> {
    const row = await this.db
      .prepare('SELECT id, owner_id, content, revision FROM drafts WHERE id = ? AND owner_id = ?')
      .bind(id, ownerId)
      .first<Row>();
    return row
      ? { id: row.id, ownerId: row.owner_id, content: row.content, revision: row.revision }
      : undefined;
  }

  private async operation(input: SaveDraft): Promise<Operation | null> {
    return this.db
      .prepare(
        'SELECT expected_revision, content, resulting_revision FROM draft_operations WHERE draft_id = ? AND owner_id = ? AND operation_id = ?',
      )
      .bind(input.id, input.ownerId, input.operationId)
      .first<Operation>();
  }

  private replay(input: SaveDraft, operation: Operation): SaveResult {
    return operation.content === input.content &&
      operation.expected_revision === input.expectedRevision
      ? { kind: 'saved', revision: operation.resulting_revision }
      : { kind: 'operation-conflict' };
  }

  async save(input: SaveDraft): Promise<SaveResult> {
    // Check ownership before returning any replay result.
    if (!(await this.get(input.id, input.ownerId))) return { kind: 'missing' };
    const previous = await this.operation(input);
    if (previous) return this.replay(input, previous);

    try {
      await this.db.batch([
        this.db
          .prepare(
            `INSERT INTO draft_operations
          (draft_id, owner_id, operation_id, expected_revision, content, resulting_revision)
          SELECT id, owner_id, ?, revision, ?, revision + 1 FROM drafts
          WHERE id = ? AND owner_id = ? AND revision = ?`,
          )
          .bind(input.operationId, input.content, input.id, input.ownerId, input.expectedRevision),
        this.db
          .prepare(
            `UPDATE drafts SET content = ?, revision = revision + 1
          WHERE id = ? AND owner_id = ? AND revision = ?
          AND EXISTS (SELECT 1 FROM draft_operations WHERE draft_id = ? AND owner_id = ? AND operation_id = ? AND content = ? AND expected_revision = ?)`,
          )
          .bind(
            input.content,
            input.id,
            input.ownerId,
            input.expectedRevision,
            input.id,
            input.ownerId,
            input.operationId,
            input.content,
            input.expectedRevision,
          ),
      ]);
    } catch (error) {
      // A concurrent duplicate operation may win the unique constraint.
      const committed = await this.operation(input);
      if (committed) return this.replay(input, committed);
      throw error;
    }
    const committed = await this.operation(input);
    if (committed) return this.replay(input, committed);
    const latest = await this.get(input.id, input.ownerId);
    return latest ? { kind: 'conflict', revision: latest.revision } : { kind: 'missing' };
  }
}
