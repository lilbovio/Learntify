import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { Miniflare } from 'miniflare';
import { getMigrations } from 'better-auth/db/migration';
import type { D1Database } from '@cloudflare/workers-types';
import { createAuth, type LearntifyAuth } from './create-auth';
import { createAccountRoutes } from './routes';
import { readFile } from 'node:fs/promises';
import { D1DraftRepository, type DraftDatabase } from '@learntify/draft-storage';
import { createApp } from '../index';

describe('passwordless authentication with local D1', () => {
  let runtime: Miniflare;
  let auth: LearntifyAuth;
  let db: D1Database;
  let deliveries: { email: string; url: string }[];
  const origin = 'https://learntify.test';
  beforeEach(async () => {
    runtime = new Miniflare({
      modules: true,
      script: 'export default { fetch() { return new Response("ok"); } }',
      d1Databases: ['DB'],
      compatibilityDate: '2026-07-30',
    });
    db = (await runtime.getD1Database('DB')) as unknown as D1Database;
    deliveries = [];
    const schema = await readFile(
      new URL('../../migrations/0001_auth.sql', import.meta.url),
      'utf8',
    );
    for (const statement of schema
      .replace(/^--.*$/gm, '')
      .split(';')
      .filter((part) => part.trim()))
      await db.prepare(statement).run();
    // Initialize auth only after migrations: the provider validates schema eagerly.
    auth = createAuth({
      database: db,
      secret: 'test-only-secret-with-at-least-32-characters',
      origin,
      allowSignUp: true,
      sendSignInLink: async (message) => {
        deliveries.push(message);
      },
    });
  });
  afterEach(async () => {
    await runtime?.dispose();
  });
  it('keeps the committed schema aligned with the pinned auth configuration', async () => {
    const plan = await getMigrations(auth.options);
    expect(plan.toBeCreated).toEqual([]);
    expect(plan.toBeAdded).toEqual([]);
    expect(plan.toBeAddedIndexes).toEqual([]);
    expect(plan.schemaProblems).toEqual([]);
  });
  it('requires explicit adult confirmation before issuing a link', async () => {
    const response = await createAccountRoutes(auth).request(
      origin + '/api/auth/sign-in/magic-link',
      {
        method: 'POST',
        headers: { Origin: origin, 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'learner@example.com' }),
      },
    );
    expect(response.status).toBe(422);
    expect(deliveries).toHaveLength(0);
    expect(
      (await db.prepare('SELECT COUNT(*) AS count FROM verification').first<{ count: number }>())
        ?.count,
    ).toBe(0);
  });
  it('defaults to closed signup even with a valid link', async () => {
    const closed = createAuth({
      database: db,
      secret: 'test-only-secret-with-at-least-32-characters',
      origin,
      sendSignInLink: async (message) => {
        deliveries.push(message);
      },
    });
    await requestLink(closed);
    const response = await closed.handler(new Request(deliveries[0]!.url));
    expect(response.headers.get('location')).toContain('new_user_signup_disabled');
    expect(
      (await db.prepare('SELECT COUNT(*) AS count FROM user').first<{ count: number }>())?.count,
    ).toBe(0);
  });
  const requestLink = (auth: LearntifyAuth, requestOrigin = origin) =>
    createAccountRoutes(auth).request(
      new Request(origin + '/api/auth/sign-in/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Origin: requestOrigin },
        body: JSON.stringify({
          email: 'learner@example.com',
          callbackURL: '/',
          metadata: { adultConfirmed: true },
        }),
      }),
    );

  it('issues a session once, stores a hashed link, and revokes access on sign-out', async () => {
    expect((await requestLink(auth)).status).toBe(200);
    expect(deliveries).toHaveLength(1);
    const url = deliveries[0]!.url;
    const rawToken = new URL(url).searchParams.get('token')!;
    const stored = await db.prepare('SELECT * FROM verification').all();
    expect(JSON.stringify(stored.results)).not.toContain(rawToken);
    const verified = await auth.handler(new Request(url));
    expect(verified.status).toBe(302);
    const cookie = verified.headers
      .getSetCookie()
      .map((value) => value.split(';')[0])
      .join('; ');
    const routes = createAccountRoutes(auth);
    const me = await routes.request(origin + '/api/v1/me', { headers: { cookie } });
    expect(me.status).toBe(200);
    expect(Object.keys((await me.json()).data).sort()).toEqual(['id', 'name']);
    const replay = await auth.handler(new Request(url));
    expect(replay.headers.get('location')).toContain('error=');
    expect(replay.headers.get('set-cookie') ?? '').not.toContain('session_token=');
    const signedOut = await auth.handler(
      new Request(origin + '/api/auth/sign-out', {
        method: 'POST',
        headers: { cookie, Origin: origin, 'Content-Type': 'application/json' },
        body: '{}',
      }),
    );
    expect(signedOut.status).toBe(200);
    expect((await routes.request(origin + '/api/v1/me', { headers: { cookie } })).status).toBe(401);
  });
  it('rejects foreign origins and unauthenticated requests', async () => {
    expect((await requestLink(auth, 'https://attacker.test')).status).toBe(403);
    expect(deliveries).toHaveLength(0);
    expect((await createAccountRoutes(auth).request(origin + '/api/v1/me')).status).toBe(401);
  });
  it('rejects expired links without creating a session', async () => {
    await requestLink(auth);
    await db.prepare('UPDATE verification SET expiresAt = 0').run();
    const result = await auth.handler(new Request(deliveries[0]!.url));
    expect(result.headers.get('location')).toContain('error=');
    expect(
      (await db.prepare('SELECT COUNT(*) AS count FROM session').first<{ count: number }>())?.count,
    ).toBe(0);
  });
  it('derives draft ownership from the session and protects writes and revisions', async () => {
    const sql = await readFile(
      new URL('../../migrations/0002_lesson_drafts.sql', import.meta.url),
      'utf8',
    );
    for (const statement of sql.split(';').filter((part) => part.trim()))
      await db.prepare(statement).run();
    await requestLink(auth);
    const verified = await auth.handler(new Request(deliveries[0]!.url));
    const cookie = verified.headers
      .getSetCookie()
      .map((value) => value.split(';')[0])
      .join('; ');
    const user = await db.prepare('SELECT id FROM user').first<{ id: string }>();
    await db
      .prepare("INSERT INTO drafts VALUES (?, ?, 'validation', 1, ?, 1)")
      .bind('mine', user!.id, 'original')
      .run();
    await db
      .prepare(
        "INSERT INTO user (id, name, email, emailVerified, createdAt, updatedAt) VALUES ('someone-else', 'Other', 'other@example.test', 1, 0, 0)",
      )
      .run();
    await db
      .prepare(
        "INSERT INTO drafts VALUES ('theirs', 'someone-else', 'validation', 1, 'private', 1)",
      )
      .run();
    const app = createApp({ auth, drafts: new D1DraftRepository(db as unknown as DraftDatabase) });
    const open = (lessonId: string, lessonVersion: number) =>
      app.request(origin + '/api/v1/drafts/open', {
        method: 'POST',
        headers: { cookie, Origin: origin, 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId, lessonVersion }),
      });
    const opened = await open('values-and-expressions', 1);
    expect(opened.status).toBe(200);
    expect((await (await open('values-and-expressions', 1)).json()).data.id).toBe(
      (await opened.json()).data.id,
    );
    expect((await open('missing', 1)).status).toBe(404);
    expect((await open('values-and-expressions', 999)).status).toBe(409);
    expect((await app.request(origin + '/api/v1/drafts/mine')).status).toBe(401);
    expect(
      (await app.request(origin + '/api/v1/drafts/theirs', { headers: { cookie } })).status,
    ).toBe(404);
    const input = { content: 'updated', expectedRevision: 1, operationId: crypto.randomUUID() };
    const save = (id: string, body: unknown, requestOrigin = origin) =>
      app.request(origin + '/api/v1/drafts/' + id, {
        method: 'PUT',
        headers: { cookie, Origin: requestOrigin, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    expect((await save('mine', input, 'https://attacker.test')).status).toBe(403);
    expect((await save('mine', { ...input, ownerId: 'someone-else' })).status).toBe(422);
    expect((await save('theirs', input)).status).toBe(404);
    expect((await save('mine', input)).status).toBe(200);
    expect((await save('mine', input)).status).toBe(200);
    expect((await save('mine', { ...input, operationId: crypto.randomUUID() })).status).toBe(409);
    expect((await save('mine', { ...input, content: 'changed retry' })).status).toBe(409);
    expect((await save('mine', { ...input, content: 'x'.repeat(16001) })).status).toBe(422);
    const read = await app.request(origin + '/api/v1/drafts/mine', { headers: { cookie } });
    expect(await read.json()).toMatchObject({ data: { content: 'updated', revision: 2 } });
    expect(read.headers.get('Cache-Control')).toBe('no-store');
  });
});
