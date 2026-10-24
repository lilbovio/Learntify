import { readFile } from 'node:fs/promises';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { Miniflare } from 'miniflare';
import { D1DraftRepository, type DraftDatabase } from './index';

describe('draft persistence in the local Workers/D1 runtime', () => {
  let runtime: Miniflare;
  let repository: D1DraftRepository;
  beforeEach(async () => {
    runtime = new Miniflare({
      modules: true,
      script: 'export default { fetch() { return new Response("ok"); } }',
      d1Databases: ['DB'],
      compatibilityDate: '2026-07-30',
    });
    const db = await runtime.getD1Database('DB');
    const sql = await readFile(
      new URL('../../../services/server/migrations/0002_lesson_drafts.sql', import.meta.url),
      'utf8',
    );
    await db.prepare('CREATE TABLE user (id TEXT PRIMARY KEY)').run();
    await db.prepare("INSERT INTO user VALUES ('alice'), ('bob')").run();
    for (const statement of sql.split(';').filter((part) => part.trim()))
      await db.prepare(statement).run();
    await db
      .prepare("INSERT INTO drafts VALUES ('draft-1', 'alice', 'validation', 1, 'original', 1)")
      .run();
    repository = new D1DraftRepository(db as unknown as DraftDatabase);
  });
  afterEach(async () => {
    await runtime?.dispose();
  });
  it('opens one draft per owner and version under concurrent retries', async () => {
    const [first, second] = await Promise.all([
      repository.open('alice', 'lesson', 1),
      repository.open('alice', 'lesson', 1),
    ]);
    expect(first.id).toBe(second.id);
    expect(first.revision).toBe(1);
    expect((await repository.open('bob', 'lesson', 1)).id).not.toBe(first.id);
    expect((await repository.open('alice', 'lesson', 2)).id).not.toBe(first.id);
  });

  it('does not leak or update a different owner’s draft', async () => {
    expect(await repository.get('draft-1', 'bob')).toBeUndefined();
    expect(
      await repository.save({
        id: 'draft-1',
        ownerId: 'bob',
        content: 'attack',
        expectedRevision: 1,
        operationId: 'x',
      }),
    ).toEqual({ kind: 'missing' });
    expect((await repository.get('draft-1', 'alice'))?.content).toBe('original');
  });
  it('allows exactly one of two devices to save from the same revision', async () => {
    const base = { id: 'draft-1', ownerId: 'alice', expectedRevision: 1 };
    const results = await Promise.all([
      repository.save({ ...base, content: 'device A', operationId: 'a' }),
      repository.save({ ...base, content: 'device B', operationId: 'b' }),
    ]);
    expect(results.filter((result) => result.kind === 'saved')).toHaveLength(1);
    expect(results.filter((result) => result.kind === 'conflict')).toHaveLength(1);
    expect((await repository.get('draft-1', 'alice'))?.revision).toBe(2);
  });
  it('replays a lost acknowledgement without another revision and rejects changed payloads', async () => {
    const input = {
      id: 'draft-1',
      ownerId: 'alice',
      expectedRevision: 1,
      content: 'saved',
      operationId: 'once',
    };
    expect(await repository.save(input)).toEqual({ kind: 'saved', revision: 2 });
    expect(await repository.save(input)).toEqual({ kind: 'saved', revision: 2 });
    expect(await repository.save({ ...input, content: 'different' })).toEqual({
      kind: 'operation-conflict',
    });
    expect((await repository.get('draft-1', 'alice'))?.revision).toBe(2);
  });
});
