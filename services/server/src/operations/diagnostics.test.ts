import { expect, it, vi } from 'vitest';
import { createApp } from '../index';
import type { LearntifyAuth } from '../auth/create-auth';
import { failureArea } from './diagnostics';

it('classifies only fixed route families', () => {
  expect(failureArea('/api/v1/drafts/private-id')).toBe('drafts');
  expect(failureArea('/api/v1/drafts-untrusted/private-id')).toBe('other');
  expect(failureArea('/api/auth/callback/github')).toBe('auth');
  expect(failureArea('/private@example.test')).toBe('other');
});

it('reports failures with correlation IDs without request or exception contents', async () => {
  const reportFailure = vi.fn();
  const auth = {
    options: { baseURL: 'https://learntify.test' },
    api: {
      getSession: async () => {
        throw new Error('secret database detail');
      },
    },
  } as unknown as LearntifyAuth;
  const app = createApp({
    auth,
    writes: { paused: false, reserve: async () => true },
    reportFailure,
  });
  const response = await app.request('/api/v1/drafts/private-id?token=secret-query', {
    method: 'PUT',
    headers: { Cookie: 'secret-cookie', Origin: 'https://learntify.test' },
    body: 'private code',
  });
  expect(response.status).toBe(500);
  expect(reportFailure).toHaveBeenCalledExactlyOnceWith({
    event: 'request_failed',
    requestId: response.headers.get('X-Request-Id'),
    area: 'drafts',
    status: 500,
  });
  expect(response.headers.get('X-Request-Id')).toBeTruthy();
  expect(await response.text()).not.toContain('secret');
  await app.request('/api/v1/lessons');
  expect(reportFailure).toHaveBeenCalledTimes(1);
});

it('keeps the original response when the diagnostic sink fails', async () => {
  const auth = {
    options: { baseURL: 'https://learntify.test' },
    api: { getSession: async () => ({ user: { id: 'learner' } }) },
  } as unknown as LearntifyAuth;
  const app = createApp({
    auth,
    writes: { paused: true, reserve: async () => true },
    reportFailure: () => {
      throw new Error('sink unavailable');
    },
  });
  const response = await app.request('/api/v1/drafts/open', {
    method: 'POST',
    headers: { Cookie: 'session', Origin: 'https://learntify.test' },
  });
  expect(response.status).toBe(503);
  expect((await response.json()).error.code).toBe('WRITES_PAUSED');
  expect(response.headers.get('Retry-After')).toBe('300');
});
