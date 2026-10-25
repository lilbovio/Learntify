import { readFile } from 'node:fs/promises';
import { afterEach, beforeEach, expect, it } from 'vitest';
import { Miniflare } from 'miniflare';
import { D1PracticeRepository, type PracticeDatabase } from './index';

let runtime: Miniflare;
let repository: D1PracticeRepository;
beforeEach(async () => {
  runtime = new Miniflare({
    modules: true,
    script: 'export default { fetch() { return new Response("ok"); } }',
    d1Databases: ['DB'],
    compatibilityDate: '2026-07-30',
  });
  const db = await runtime.getD1Database('DB');
  await db.prepare('CREATE TABLE user (id TEXT PRIMARY KEY)').run();
  await db.prepare("INSERT INTO user VALUES ('alice'), ('bob')").run();
  const schema = await readFile(
    new URL('../../../services/server/migrations/0006_practice_attempts.sql', import.meta.url),
    'utf8',
  );
  for (const statement of schema.split(';').filter((sql) => sql.trim()))
    await db.prepare(statement).run();
  repository = new D1PracticeRepository(db as unknown as PracticeDatabase);
});
afterEach(async () => {
  await runtime?.dispose();
});
const attempt = {
  id: 'one',
  lessonId: 'values',
  lessonVersion: 1,
  code: 'console.log(7)',
  matched: true,
};
it('replays concurrent saves, rejects changed payloads, isolates owners and versions, and cascades deletion', async () => {
  expect(
    await Promise.all([
      repository.save('alice', attempt, 100),
      repository.save('alice', attempt, 100),
    ]),
  ).toEqual(['saved', 'saved']);
  expect(await repository.save('alice', { ...attempt, code: 'different' }, 200)).toBe('conflict');
  expect(await repository.progress('bob')).toEqual([]);
  expect(await repository.history('bob', 'values', 1)).toEqual([]);
  await repository.save('bob', attempt, 100);
  await repository.save('alice', { ...attempt, id: 'two', matched: false }, 200);
  await repository.save('alice', { ...attempt, id: 'three', lessonVersion: 2 }, 300);
  expect((await repository.history('alice', 'values', 1)).map((row) => row.id)).toEqual([
    'two',
    'one',
  ]);
  expect(await repository.progress('alice')).toEqual(
    expect.arrayContaining([
      { lessonId: 'values', lessonVersion: 1, attempts: 2, matched: false, lastPracticedAt: 200 },
      { lessonId: 'values', lessonVersion: 2, attempts: 1, matched: true, lastPracticedAt: 300 },
    ]),
  );
  const db = await runtime.getD1Database('DB');
  await db.prepare("DELETE FROM user WHERE id = 'alice'").run();
  expect(await repository.progress('alice')).toEqual([]);
  expect(await repository.history('alice', 'values', 1)).toEqual([]);
  expect(await repository.progress('bob')).toHaveLength(1);
});
it('atomically caps rolling-day writes and still acknowledges retries at the limit', async () => {
  const db = await runtime.getD1Database('DB');
  await db
    .prepare(
      `WITH RECURSIVE numbers(n) AS (SELECT 1 UNION ALL SELECT n+1 FROM numbers WHERE n < 99)
    INSERT INTO practice_attempts SELECT 'alice', CAST(n AS TEXT), 'values', 1, '', 0, 100 FROM numbers`,
    )
    .run();
  const results = await Promise.all([
    repository.save('alice', attempt, 200),
    repository.save('alice', { ...attempt, id: 'other' }, 200),
  ]);
  expect(results.sort()).toEqual(['limit', 'saved']);
  expect((await repository.progress('alice'))[0]?.attempts).toBe(100);
  expect(await repository.history('alice', 'values', 1)).toHaveLength(20);
  const stored = await db
    .prepare("SELECT id FROM practice_attempts WHERE id IN ('one', 'other')")
    .first<{ id: string }>();
  expect(await repository.save('alice', { ...attempt, id: stored!.id }, 300)).toBe('saved');
  expect(await repository.save('alice', { ...attempt, id: 'tomorrow' }, 86400300)).toBe('saved');
});
