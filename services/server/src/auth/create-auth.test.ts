import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { Miniflare } from 'miniflare';
import { getMigrations } from 'better-auth/db/migration';
import type { D1Database } from '@cloudflare/workers-types';
import { createAuth, type LearntifyAuth } from './create-auth';
import { createAccountRoutes } from './routes';
import { readFile } from 'node:fs/promises';
import { D1DraftRepository, type DraftDatabase } from '@learntify/draft-storage';
import { createApp } from '../index';
import production from '../production';
import { D1PreferencesRepository, type PreferencesDatabase } from '@learntify/preferences-storage';

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
  it('composes production account routes with D1 but keeps signup and deletion closed', async () => {
    const bindings = {
      ACCOUNT_MODE: 'existing-accounts',
      APP_ORIGIN: origin,
      AUTH_SECRET: 'a'.repeat(40),
      RESEND_API_KEY: 're_' + 'b'.repeat(24),
      EMAIL_FROM: 'learn@learntify.test',
      DB: db,
    };
    const response = await production.fetch(new Request(origin + '/api/v1/capabilities'), bindings);
    expect(await response.json()).toMatchObject({
      data: { accounts: true, cloudDrafts: true, preferences: true, accountDeletion: false },
    });
    expect((await production.fetch(new Request(origin + '/api/v1/me'), bindings)).status).toBe(401);
    const deletion = await production.fetch(
      new Request(origin + '/api/auth/delete-user', {
        method: 'POST',
        headers: { Origin: origin, 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmation: 'DELETE' }),
      }),
      bindings,
    );
    expect(deletion.status).toBe(404);
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
  const requestLink = (
    auth: LearntifyAuth,
    requestOrigin = origin,
    email = 'learner@example.com',
  ) =>
    createAccountRoutes(auth).request(
      new Request(origin + '/api/auth/sign-in/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Origin: requestOrigin },
        body: JSON.stringify({
          email,
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
  it('persists validated preferences only for the authenticated owner', async () => {
    const sql = await readFile(
      new URL('../../migrations/0003_learning_preferences.sql', import.meta.url),
      'utf8',
    );
    for (const statement of sql.split(';').filter((part) => part.trim()))
      await db.prepare(statement).run();
    const app = createApp({
      auth,
      preferences: new D1PreferencesRepository(db as unknown as PreferencesDatabase),
    });
    const url = origin + '/api/v1/preferences';
    expect((await app.request(url)).status).toBe(401);
    const signIn = async (email: string) => {
      await requestLink(auth, origin, email);
      const response = await auth.handler(new Request(deliveries.at(-1)!.url));
      return response.headers
        .getSetCookie()
        .map((value) => value.split(';')[0])
        .join('; ');
    };
    const cookie = await signIn('first@example.test');
    const input = { locale: 'es', goal: 'projects', weeklyMinutes: 180 };
    const save = (body: unknown, requestOrigin = origin) =>
      app.request(url, {
        method: 'PUT',
        headers: { cookie, Origin: requestOrigin, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    expect((await save(input, 'https://attacker.test')).status).toBe(403);
    expect((await save({ ...input, ownerId: 'other' })).status).toBe(422);
    expect((await save({ ...input, weeklyMinutes: 999 })).status).toBe(422);
    expect((await save(input)).status).toBe(200);
    const otherCookie = await signIn('second@example.test');
    expect(
      await (await app.request(url, { headers: { cookie: otherCookie } })).json(),
    ).toMatchObject({ data: null });
    const read = await app.request(url, { headers: { cookie } });
    expect(await read.json()).toMatchObject({ data: input });
    expect(read.headers.get('Cache-Control')).toBe('no-store');
    await db.prepare('DELETE FROM user WHERE email = ?').bind('first@example.test').run();
    expect(await db.prepare('SELECT * FROM learning_preferences').all()).toMatchObject({
      results: [],
    });
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
  it('requires confirmation and fresh authentication, then deletes only the current account and its owned data', async () => {
    for (const file of ['0002_lesson_drafts.sql', '0003_learning_preferences.sql']) {
      const sql = await readFile(new URL('../../migrations/' + file, import.meta.url), 'utf8');
      for (const statement of sql.split(';').filter((part) => part.trim()))
        await db.prepare(statement).run();
    }
    expect(
      (
        await createAccountRoutes(auth).request(origin + '/api/auth/delete-user', {
          method: 'POST',
          headers: { Origin: origin, 'Content-Type': 'application/json' },
          body: JSON.stringify({ confirmation: 'DELETE' }),
        })
      ).status,
    ).toBe(404);
    auth = createAuth({
      database: db,
      secret: 'test-only-secret-with-at-least-32-characters',
      origin,
      allowSignUp: true,
      allowDeletion: true,
      sendSignInLink: async (message) => {
        deliveries.push(message);
      },
    });
    const routes = createAccountRoutes(auth);
    const remove = (
      cookie = '',
      input: unknown = { confirmation: 'DELETE' },
      requestOrigin = origin,
    ) =>
      routes.request(origin + '/api/auth/delete-user', {
        method: 'POST',
        headers: { cookie, Origin: requestOrigin, 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
    expect((await remove()).status).toBe(401);
    await requestLink(auth);
    const verified = await auth.handler(new Request(deliveries[0]!.url));
    const cookie = verified.headers
      .getSetCookie()
      .map((value) => value.split(';')[0])
      .join('; ');
    const user = await db.prepare('SELECT id FROM user').first<{ id: string }>();
    const drafts = new D1DraftRepository(db as unknown as DraftDatabase);
    const draft = await drafts.open(user!.id, 'values-and-expressions', 1);
    await drafts.save({
      id: draft.id,
      ownerId: user!.id,
      expectedRevision: 1,
      content: 'Private notes',
      operationId: crypto.randomUUID(),
    });
    await new D1PreferencesRepository(db as unknown as PreferencesDatabase).save(user!.id, {
      locale: 'en',
      goal: 'foundations',
      weeklyMinutes: null,
    });
    await db
      .prepare(
        "INSERT INTO user (id,name,email,emailVerified,createdAt,updatedAt) VALUES ('other','Other','other@example.test',1,0,0)",
      )
      .run();
    expect((await remove(cookie, { confirmation: 'DELETE' }, 'https://attacker.test')).status).toBe(
      403,
    );
    expect((await remove(cookie, { confirmation: 'DELETE', userId: 'other' })).status).toBe(422);
    expect((await remove(cookie, {})).status).toBe(422);
    await db
      .prepare('UPDATE session SET createdAt = ? WHERE userId = ?')
      .bind(Date.now() - 16 * 60 * 1000, user!.id)
      .run();
    expect((await remove(cookie)).status).toBe(409);
    expect(await drafts.get(draft.id, user!.id)).toBeDefined();
    await db
      .prepare('UPDATE session SET createdAt = ? WHERE userId = ?')
      .bind(Date.now(), user!.id)
      .run();
    const deleted = await remove(cookie);
    expect(deleted.status).toBe(200);
    expect(await deleted.json()).toMatchObject({ success: true, message: 'User deleted' });
    expect((await routes.request(origin + '/api/v1/me', { headers: { cookie } })).status).toBe(401);
    expect(await drafts.get(draft.id, user!.id)).toBeUndefined();
    for (const table of ['session', 'draft_operations', 'learning_preferences']) {
      expect(
        (await db.prepare('SELECT COUNT(*) AS count FROM ' + table).first<{ count: number }>())
          ?.count,
      ).toBe(0);
    }
    expect((await db.prepare('SELECT id FROM user').all()).results).toEqual([{ id: 'other' }]);
  });
});
