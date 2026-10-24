import { expect, it } from 'vitest';
import { createApiClient } from './index';

it('accepts only the chosen provider HTTPS authorization destination', async () => {
  for (const url of [
    'https://attacker.test/',
    'http://github.com/login/oauth/authorize',
    'https://user:password@github.com/login/oauth/authorize',
    'https://accounts.google.com/o/oauth2/v2/auth',
  ]) {
    const client = createApiClient(async () => Response.json({ url }));
    await expect(client.startSocial('sign-in', 'github', 'en')).rejects.toThrow('INVALID_RESPONSE');
  }
  const client = createApiClient(async (url, init) => {
    expect(url).toBe('/api/auth/social/link');
    expect(JSON.parse(init!.body as string)).toEqual({ provider: 'github', locale: 'es' });
    return Response.json({ url: 'https://github.com/login/oauth/authorize?state=test' });
  });
  await expect(client.startSocial('link', 'github', 'es')).resolves.toContain(
    'https://github.com/',
  );
});
