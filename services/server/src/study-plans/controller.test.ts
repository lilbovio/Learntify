import { beforeAll, afterAll, expect, it } from 'vitest';
import { Miniflare } from 'miniflare';
import { readFile } from 'node:fs/promises';
import { D1StudyPlanRepository, type StudyPlanDatabase } from '@learntify/study-plan-storage';
import type { StudyPlanRepository } from '@learntify/study-plans';
import type { LearntifyAuth } from '../auth/create-auth';
import { createApp } from '../index';

const origin = 'https://learntify.test';
const base = '/api/v1/study-plans';
const missing = '12345678-1234-4123-8123-123456789abc';
const input = {
  slug: 'javascript-basics',
  title: ' JavaScript basics ',
  description: 'Practice every week',
  weeklyMinutes: 120,
};
const replacement = {
  title: 'Interview preparation',
  description: '',
  weeklyMinutes: 180,
  status: 'active',
};
const auth = {
  options: { baseURL: origin },
  api: {
    getSession: async ({ headers }: { headers: Headers }) => {
      const owner = headers.get('Cookie');
      return owner === 'alice' || owner === 'bob'
        ? { user: { id: owner, email: owner + '@example.test' } }
        : null;
    },
  },
} as unknown as LearntifyAuth;
let runtime: Miniflare;
let app: ReturnType<typeof createApp>;
let repository: D1StudyPlanRepository;
beforeAll(async () => {
  runtime = new Miniflare({
    modules: true,
    script: 'export default { fetch() { return new Response("ok"); } }',
    d1Databases: ['DB'],
    compatibilityDate: '2026-07-30',
  });
  const db = await runtime.getD1Database('DB');
  await db.prepare('CREATE TABLE user (id TEXT PRIMARY KEY)').run();
  await db.prepare("INSERT INTO user (id) VALUES ('alice'), ('bob')").run();
  const sql = await readFile(
    new URL('../../migrations/0007_study_plans.sql', import.meta.url),
    'utf8',
  );
  for (const statement of sql
    .replace(/^--.*$/gm, '')
    .split(';')
    .filter((value) => value.trim()))
    await db.prepare(statement).run();
  repository = new D1StudyPlanRepository(db as unknown as StudyPlanDatabase);
  app = createApp({ auth, studyPlans: repository });
});
afterAll(async () => {
  await runtime?.dispose();
});
function request(method: string, suffix = '', body?: unknown, cookie = 'alice', target = app) {
  return target.request(base + suffix, {
    method,
    headers: { Cookie: cookie, Origin: origin, 'Content-Type': 'application/json' },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
}
it('persists all five operations, trims titles and atomically detects duplicate slugs', async () => {
  const created = await request('POST', '', input);
  expect(created.status).toBe(201);
  const { data: plan } = await created.json();
  expect(plan.title).toBe('JavaScript basics');
  expect(plan.ownerId).toBe('alice');
  expect(plan.status).toBe('draft');
  expect(created.headers.get('Location')).toBe(base + '/' + plan.id);
  const concurrent = await Promise.all([
    request('POST', '', { ...input, slug: 'concurrent' }),
    request('POST', '', { ...input, slug: 'concurrent' }),
  ]);
  expect(concurrent.map((response) => response.status).sort()).toEqual([201, 409]);
  expect((await request('POST', '', input)).status).toBe(409);
  expect((await request('POST', '', input, 'bob')).status).toBe(201);
  const list = await request('GET');
  expect(list.status).toBe(200);
  expect((await list.json()).data).toHaveLength(2);
  expect((await (await request('GET', '?page=999')).json()).data).toEqual([]);
  expect((await request('GET', '/' + plan.id)).status).toBe(200);
  const updated = await request('PUT', '/' + plan.id, replacement);
  expect(updated.status).toBe(200);
  expect((await updated.json()).data).toMatchObject({
    ...replacement,
    id: plan.id,
    slug: input.slug,
    createdAt: plan.createdAt,
  });
  expect(await repository.get('alice', plan.id)).toMatchObject(replacement);
  expect((await (await request('GET', '?status=active&limit=1')).json()).data).toHaveLength(1);
  for (const method of ['GET', 'PUT', 'DELETE'])
    expect(
      (await request(method, '/' + plan.id, method === 'PUT' ? replacement : undefined, 'bob'))
        .status,
    ).toBe(404);
  const deleted = await request('DELETE', '/' + plan.id);
  expect(deleted.status).toBe(204);
  expect(await deleted.text()).toBe('');
  expect(deleted.headers.get('Content-Type')).toBeNull();
  expect(await repository.get('alice', plan.id)).toBeNull();
  for (const method of ['GET', 'PUT', 'DELETE'])
    expect(
      (await request(method, '/' + plan.id, method === 'PUT' ? replacement : undefined)).status,
    ).toBe(404);
});
it('returns 401 for every operation without a session', async () => {
  for (const [method, suffix, body] of [
    ['GET', '', undefined],
    ['GET', '/' + missing, undefined],
    ['POST', '', input],
    ['PUT', '/' + missing, replacement],
    ['DELETE', '/' + missing, undefined],
  ] as const)
    expect((await request(method, suffix, body, '')).status).toBe(401);
});
it('returns 400 for malformed IDs, queries, JSON, unknown fields and invalid values', async () => {
  for (const query of [
    '?page=0',
    '?limit=101',
    '?status=unknown',
    '?other=1',
    '?page=1&page=2',
    '?page=1.5',
  ])
    expect((await request('GET', query)).status).toBe(400);
  for (const method of ['GET', 'PUT', 'DELETE'])
    expect(
      (await request(method, '/invalid', method === 'PUT' ? replacement : undefined)).status,
    ).toBe(400);
  for (const body of [
    { ...input, ownerId: 'bob' },
    { ...input, weeklyMinutes: 14 },
    { ...input, title: '   ' },
    { ...input, slug: 'Bad slug' },
    { ...input, status: 'active' },
  ])
    expect((await request('POST', '', body)).status).toBe(400);
  for (const body of [
    { title: 'Incomplete' },
    { ...replacement, slug: 'change-slug' },
    { ...replacement, status: 'unknown' },
  ])
    expect((await request('PUT', '/' + missing, body)).status).toBe(400);
  for (const method of ['POST', 'PUT'])
    expect(
      (
        await app.request(base + (method === 'PUT' ? '/' + missing : ''), {
          method,
          headers: { Cookie: 'alice', Origin: origin },
          body: '{',
        })
      ).status,
    ).toBe(400);
});
it('rejects foreign origins and oversized payloads', async () => {
  expect(
    (
      await app.request(base, {
        method: 'POST',
        headers: { Cookie: 'alice', Origin: 'https://foreign.test' },
        body: JSON.stringify(input),
      })
    ).status,
  ).toBe(403);
  expect((await request('POST', '', { ...input, description: 'a'.repeat(17000) })).status).toBe(
    413,
  );
});
it('returns a safe 500 envelope for each operation when storage fails', async () => {
  const fail = async () => {
    throw new Error('private SQL details');
  };
  const failing: StudyPlanRepository = {
    list: fail,
    get: fail,
    create: fail,
    replace: fail,
    delete: fail,
  };
  const broken = createApp({ auth, studyPlans: failing });
  for (const [method, suffix, body] of [
    ['GET', '', undefined],
    ['GET', '/' + missing, undefined],
    ['POST', '', input],
    ['PUT', '/' + missing, replacement],
    ['DELETE', '/' + missing, undefined],
  ] as const) {
    const response = await request(method, suffix, body, 'alice', broken);
    expect(response.status).toBe(500);
    const result = await response.json();
    expect(result.error.code).toBe('INTERNAL_ERROR');
    expect(result.meta.requestId).toBeTruthy();
    expect(JSON.stringify(result)).not.toContain('SQL');
  }
});
