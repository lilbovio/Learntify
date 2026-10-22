import { readFile } from 'node:fs/promises';
import { Miniflare } from 'miniflare';
import { beforeEach, afterEach, expect, it, vi } from 'vitest';
import { createResendDelivery, EmailUnavailable, reserveEmail } from './index';

let runtime: Miniflare;
let db: Awaited<ReturnType<Miniflare['getD1Database']>>;
beforeEach(async () => {
  runtime = new Miniflare({
    modules: true,
    script: 'export default { fetch() { return new Response("ok"); } }',
    d1Databases: ['DB'],
    compatibilityDate: '2026-07-30',
  });
  db = await runtime.getD1Database('DB');
  const sql = await readFile(
    new URL('../migrations/0001_email_budget.sql', import.meta.url),
    'utf8',
  );
  await db.prepare(sql).run();
});
afterEach(async () => {
  await runtime?.dispose();
});

it('atomically caps concurrent reservations at 90 daily', async () => {
  const now = new Date('2026-10-22T12:00:00Z');
  await db.prepare("INSERT INTO email_budget VALUES ('2026-10-22', 89)").run();
  const results = await Promise.all([reserveEmail(db, now), reserveEmail(db, now)]);
  expect(results.sort()).toEqual([false, true]);
});
it('caps the month independently and resets at the UTC month boundary', async () => {
  await db.prepare("INSERT INTO email_budget VALUES ('2026-10-01', 2500)").run();
  expect(await reserveEmail(db, new Date('2026-10-31T23:59:59Z'))).toBe(false);
  expect(await reserveEmail(db, new Date('2026-11-01T00:00:00Z'))).toBe(true);
});
it('never calls the provider once the budget is exhausted', async () => {
  const today = new Date().toISOString().slice(0, 10);
  await db.prepare('INSERT INTO email_budget VALUES (?, 90)').bind(today).run();
  const transport = vi.fn<typeof fetch>();
  const send = createResendDelivery({
    database: db,
    apiKey: 'test',
    from: 'test@example.com',
    origin: 'https://learntify.test',
    fetch: transport,
  });
  await expect(
    send({
      email: 'learner@example.com',
      url: 'https://learntify.test/api/auth/magic-link/verify?token=test',
    }),
  ).rejects.toThrow(EmailUnavailable);
  expect(transport).not.toHaveBeenCalled();
});
it('redacts provider failures, reserves failures, and sends only through the injected transport', async () => {
  const transport = vi
    .fn<typeof fetch>()
    .mockResolvedValue(new Response('sensitive provider diagnostic', { status: 429 }));
  const send = createResendDelivery({
    database: db,
    apiKey: 'test',
    from: 'test@example.com',
    origin: 'https://learntify.test',
    fetch: transport,
  });
  await expect(
    send({
      email: 'learner@example.com',
      url: 'https://learntify.test/api/auth/magic-link/verify?token=test',
    }),
  ).rejects.toThrow('Email sign-in is temporarily unavailable.');
  expect(transport).toHaveBeenCalledTimes(1);
  expect((await db.prepare('SELECT sent FROM email_budget').first<{ sent: number }>())?.sent).toBe(
    1,
  );
});
