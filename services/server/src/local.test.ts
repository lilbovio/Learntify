import { expect, it } from 'vitest';
import local from './local';
import type { D1Database } from '@cloudflare/workers-types';

it('rejects non-local requests and disabled local mode before touching the database', async () => {
  const bindings = {
    DB: undefined as unknown as D1Database,
    LOCAL_ACCOUNTS: 'true',
    APP_ORIGIN: 'http://127.0.0.1:5174',
  };
  expect(
    (await local.fetch(new Request('https://learntify.lat/api/v1/health'), bindings)).status,
  ).toBe(403);
  expect(
    (
      await local.fetch(new Request('http://127.0.0.1:8788/api/v1/health'), {
        ...bindings,
        LOCAL_ACCOUNTS: 'false',
      })
    ).status,
  ).toBe(403);
});
