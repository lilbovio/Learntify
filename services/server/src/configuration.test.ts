import { expect, it } from 'vitest';
import { readAccountConfiguration, type ProductionBindings } from './configuration';
import production from './production';

it('defaults to closed accounts and exposes no configuration values on errors', async () => {
  expect(readAccountConfiguration({})).toEqual({ kind: 'disabled' });
  expect(readAccountConfiguration({ ACCOUNT_MODE: 'enabled' })).toEqual({
    kind: 'invalid',
    fields: ['ACCOUNT_MODE'],
  });
  const response = await production.fetch(
    new Request('https://learntify.test/api/v1/capabilities'),
    {},
  );
  expect(await response.json()).toMatchObject({
    data: { accounts: false, accountDeletion: false },
  });
  const invalid = await production.fetch(
    new Request('https://learntify.test/api/v1/capabilities'),
    { ACCOUNT_MODE: 'existing-accounts', AUTH_SECRET: 'private-value' },
  );
  expect(invalid.status).toBe(503);
  expect(await invalid.text()).not.toContain('private-value');
});

it('validates exact HTTPS origins and complete preview bindings without accessing providers', async () => {
  const env: ProductionBindings = {
    ACCOUNT_MODE: 'existing-accounts',
    APP_ORIGIN: 'https://learntify.test',
    AUTH_SECRET: 'a'.repeat(40),
    RESEND_API_KEY: 're_' + 'b'.repeat(24),
    EMAIL_FROM: 'learn@learntify.test',
    DB: {
      prepare() {
        throw Error('Database must not be accessed');
      },
      batch() {
        throw Error('Database must not be accessed');
      },
    } as unknown as NonNullable<ProductionBindings['DB']>,
  };
  expect(readAccountConfiguration(env).kind).toBe('ready');
  for (const origin of [
    'http://learntify.test',
    'https://learntify.test/',
    'https://learntify.test/path',
    'https://user:password@learntify.test',
    'https://localhost',
  ]) {
    expect(readAccountConfiguration({ ...env, APP_ORIGIN: origin })).toMatchObject({
      kind: 'invalid',
      fields: ['APP_ORIGIN'],
    });
  }
  expect(
    readAccountConfiguration({
      ...env,
      AUTH_SECRET: 'local-development-only-never-use-this-secret-in-production',
    }),
  ).toMatchObject({ kind: 'invalid', fields: ['AUTH_SECRET'] });
  expect((await production.fetch(new Request('https://other.test/api/v1/me'), env)).status).toBe(
    503,
  );
});
