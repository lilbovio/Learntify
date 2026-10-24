import { expect, it } from 'vitest';
import { readSocialCredentials } from './social';

it('keeps providers disabled by default and rejects incomplete credentials without exposing them', () => {
  expect(readSocialCredentials({})).toEqual({ credentials: {}, fields: [] });
  const invalid = readSocialCredentials({ GOOGLE_CLIENT_SECRET: 'private-test-secret' });
  expect(invalid.credentials).toEqual({});
  expect(invalid.fields).toEqual(['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET']);
  expect(JSON.stringify(invalid)).not.toContain('private-test-secret');
  expect(
    readSocialCredentials({ GITHUB_CLIENT_ID: ' id ', GITHUB_CLIENT_SECRET: ' secret ' })
      .credentials,
  ).toEqual({ github: { clientId: 'id', clientSecret: 'secret' } });
});
