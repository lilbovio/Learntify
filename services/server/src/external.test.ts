import { expect, it } from 'vitest';
import external from './external';
import { readAccountConfiguration, type ProductionBindings } from './configuration';

const env: ProductionBindings & { LOCAL_EXTERNAL_SERVICES: string } = {
  LOCAL_EXTERNAL_SERVICES: 'true',
  ACCOUNT_MODE: 'existing-accounts',
  APP_ORIGIN: 'http://127.0.0.1:5175',
  AUTH_SECRET: 'a'.repeat(48),
  RESEND_API_KEY: 're_' + 'b'.repeat(24),
  EMAIL_FROM: 'onboarding@resend.dev',
  PREVIEW_EMAILS: 'tester@example.test',
  DB: {
    prepare() {
      throw Error('Must not access providers');
    },
    batch() {
      throw Error('Must not access providers');
    },
  } as unknown as NonNullable<ProductionBindings['DB']>,
};
it('keeps production HTTPS validation while explicitly supporting one local testing origin', () => {
  expect(readAccountConfiguration(env).kind).toBe('invalid');
  expect(readAccountConfiguration(env, 'local-external').kind).toBe('ready');
  for (const origin of ['http://localhost:5175', 'http://127.0.0.1:5174', 'https://learntify.test'])
    expect(readAccountConfiguration({ ...env, APP_ORIGIN: origin }, 'local-external').kind).toBe(
      'invalid',
    );
});
it('rejects public access, disabled mode, extra recipients and incomplete configuration before provider use', async () => {
  for (const url of [
    'https://learntify.test/api/v1/me',
    'http://localhost:8789/api/v1/me',
    'https://127.0.0.1/api/v1/me',
  ])
    expect((await external.fetch(new Request(url), env)).status).toBe(403);
  const request = new Request('http://127.0.0.1:8789/api/v1/me');
  expect((await external.fetch(request, { ...env, LOCAL_EXTERNAL_SERVICES: 'false' })).status).toBe(
    403,
  );
  for (const change of [
    { EMAIL_FROM: 'other@example.test' },
    { PREVIEW_EMAILS: 'one@example.test,two@example.test' },
    { RESEND_API_KEY: '' },
  ])
    expect((await external.fetch(request, { ...env, ...change })).status).toBe(503);
});
