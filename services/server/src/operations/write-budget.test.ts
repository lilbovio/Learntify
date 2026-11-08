import { beforeAll, afterAll, expect, it, vi } from 'vitest';
import { Miniflare } from 'miniflare';
import type { D1Database } from '@cloudflare/workers-types';
import { reservePrivateWrite, cleanupOperationalMetadata } from './write-budget';
import { createApp } from '../index';
import type { LearntifyAuth } from '../auth/create-auth';
let runtime: Miniflare;
let db: D1Database;
beforeAll(async () => {
  runtime = new Miniflare({
    modules: true,
    script: 'export default { fetch() { return new Response("ok"); } }',
    d1Databases: ['DB'],
    compatibilityDate: '2026-07-30',
  });
  db = (await runtime.getD1Database('DB')) as unknown as D1Database;
  await db
    .prepare(
      'CREATE TABLE private_write_budget (day TEXT, owner_id TEXT, reservations INTEGER, PRIMARY KEY(day, owner_id))',
    )
    .run();
  await db.prepare('CREATE TABLE draft_operations (created_at INTEGER)').run();
  await db.prepare('CREATE TABLE email_budget (day TEXT PRIMARY KEY, sent INTEGER)').run();
});
afterAll(async () => runtime?.dispose());
it('enforces atomic account and global reservations with UTC rollover', async () => {
  const now = new Date('2026-10-26T23:59:59Z');
  const results = await Promise.all(
    Array.from({ length: 8 }, () =>
      reservePrivateWrite(db, 'alice', now, { account: 3, global: 5 }),
    ),
  );
  expect(results.filter(Boolean)).toHaveLength(3);
  expect(await reservePrivateWrite(db, 'bob', now, { account: 3, global: 5 })).toBe(true);
  expect(await reservePrivateWrite(db, 'bob', now, { account: 3, global: 5 })).toBe(true);
  expect(await reservePrivateWrite(db, 'carol', now, { account: 3, global: 5 })).toBe(false);
  expect(
    await reservePrivateWrite(db, 'alice', new Date('2026-10-27T00:00:00Z'), {
      account: 3,
      global: 5,
    }),
  ).toBe(true);
});
it('bounds retention cleanup and preserves recent metadata', async () => {
  const now = new Date('2026-10-27T00:00:00Z');
  const seconds = now.getTime() / 1000;
  await db
    .prepare('INSERT INTO draft_operations (created_at) VALUES (?), (?)')
    .bind(seconds - 8 * 86400, seconds)
    .run();
  await db.prepare("INSERT INTO email_budget VALUES ('2026-01-01', 10), ('2026-10-27', 2)").run();
  await reservePrivateWrite(db, 'old', new Date('2026-01-01'));
  await cleanupOperationalMetadata(db, now);
  expect(
    (await db.prepare('SELECT COUNT(*) AS count FROM draft_operations').first<{ count: number }>())
      ?.count,
  ).toBe(1);
  expect(
    (await db.prepare('SELECT COUNT(*) AS count FROM email_budget').first<{ count: number }>())
      ?.count,
  ).toBe(1);
  expect(
    await db.prepare("SELECT * FROM private_write_budget WHERE owner_id = 'old'").first(),
  ).toBeNull();
  await cleanupOperationalMetadata(db, now);
  expect(
    (await db.prepare('SELECT COUNT(*) AS count FROM draft_operations').first<{ count: number }>())
      ?.count,
  ).toBe(1);
});
const origin = 'https://learntify.test';
const auth = {
  options: { baseURL: origin },
  api: {
    getSession: async ({ headers }: { headers: Headers }) =>
      headers.get('Cookie') ? { user: { id: 'alice' } } : null,
  },
} as unknown as LearntifyAuth;
it('keeps public lessons/read paths available, rejects writes before storage and preserves sign-out routing', async () => {
  const reserve = vi.fn(async () => false);
  const app = createApp({ auth, writes: { paused: false, reserve } });
  expect((await app.request('/api/v1/lessons')).status).toBe(200);
  const response = await app.request('/api/v1/study-plans', {
    method: 'POST',
    headers: { Cookie: 'session', Origin: origin },
  });
  expect(response.status).toBe(429);
  expect(Number(response.headers.get('Retry-After'))).toBeGreaterThan(0);
  expect(reserve).toHaveBeenCalledWith('alice');
  reserve.mockClear();
  expect((await app.request('/api/v1/study-plans', { method: 'POST' })).status).toBe(401);
  expect(
    (
      await app.request('/api/v1/preferences', {
        method: 'PUT',
        headers: { Cookie: 'session', Origin: 'https://evil.test' },
      })
    ).status,
  ).toBe(403);
  expect(reserve).not.toHaveBeenCalled();
  const paused = createApp({ auth, writes: { paused: true, reserve } });
  expect(
    (
      await paused.request('/api/v1/drafts/open', {
        method: 'POST',
        headers: { Cookie: 'session', Origin: origin },
      })
    ).status,
  ).toBe(503);
  expect((await paused.request('/api/v1/lessons')).status).toBe(200);
  expect(reserve).not.toHaveBeenCalled();
});
