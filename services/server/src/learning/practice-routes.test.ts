import { expect, it, vi } from 'vitest';
import type { LearntifyAuth } from '../auth/create-auth';
import { createApp } from '../index';
import type { PracticeRepository } from '@learntify/learning';

const origin = 'https://learntify.test';
const repository: PracticeRepository = {
  history: vi.fn(async () => []),
  save: vi.fn(async () => 'saved' as const),
  progress: vi.fn(async () => [
    {
      lessonId: 'values-and-expressions',
      lessonVersion: 1,
      attempts: 2,
      matched: true,
      lastPracticedAt: Date.now() - 1000,
    },
    {
      lessonId: 'storing-values',
      lessonVersion: 1,
      attempts: 1,
      matched: false,
      lastPracticedAt: Date.now() - 1000,
    },
    {
      lessonId: 'values-and-expressions',
      lessonVersion: 999,
      attempts: 20,
      matched: true,
      lastPracticedAt: 1,
    },
  ]),
};
const auth = {
  options: { baseURL: origin },
  api: {
    getSession: async ({ headers }: { headers: Headers }) =>
      headers.get('Cookie') === 'test=alice'
        ? { user: { id: 'alice', email: 'alice@example.test' } }
        : null,
  },
} as unknown as LearntifyAuth;
const app = createApp({ auth, practice: repository });
const input = {
  id: '12345678-1234-4123-8123-123456789abc',
  expectedAccountId: 'alice',
  lessonId: 'values-and-expressions',
  lessonVersion: 1,
  code: 'console.log(7)',
  matched: true,
};
it('requires a session for history and derives its owner and current version on the server', async () => {
  expect((await app.request('/api/v1/practice/history/values-and-expressions')).status).toBe(401);
  const response = await app.request('/api/v1/practice/history/values-and-expressions', {
    headers: { Cookie: 'test=alice' },
  });
  expect(response.status).toBe(200);
  expect(repository.history).toHaveBeenCalledWith('alice', 'values-and-expressions', 1);
  expect(
    (await app.request('/api/v1/practice/history/unknown', { headers: { Cookie: 'test=alice' } }))
      .status,
  ).toBe(404);
});
function save(
  body: unknown,
  headers: Record<string, string> = { Origin: origin, Cookie: 'test=alice' },
) {
  return app.request('/api/v1/practice/attempts', {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}
it('rejects missing sessions, foreign origins, changed identities, stale lessons, oversized and unknown input', async () => {
  vi.mocked(repository.save).mockClear();
  expect((await save(input, { Origin: origin })).status).toBe(401);
  expect(
    (await save(input, { Origin: 'https://elsewhere.test', Cookie: 'test=alice' })).status,
  ).toBe(403);
  expect((await save({ ...input, expectedAccountId: 'bob' })).status).toBe(409);
  expect((await save({ ...input, lessonVersion: 999 })).status).toBe(409);
  expect((await save({ ...input, code: 'x'.repeat(16001) })).status).toBe(422);
  expect((await save({ ...input, ownerId: 'bob' })).status).toBe(422);
  expect(repository.save).not.toHaveBeenCalled();
  expect((await save(input)).status).toBe(200);
  expect(repository.save).toHaveBeenCalledWith(
    'alice',
    expect.objectContaining({ code: input.code }),
    expect.any(Number),
  );
});
it('returns owner progress with provenance, current versions and transparent review dates', async () => {
  expect((await app.request('/api/v1/practice/progress')).status).toBe(401);
  const response = await app.request('/api/v1/practice/progress', {
    headers: { Cookie: 'test=alice' },
  });
  const { data } = await response.json();
  expect(data).toHaveLength(2);
  expect(data[0].due).toBe(false);
  expect(data[0].reviewDueAt - data[0].lastPracticedAt).toBe(86400000);
  expect(data[1].due).toBe(true);
  expect(data[1].provenance).toBe('client-reported-practice');
  expect(repository.progress).toHaveBeenCalledWith('alice');
});
