import { test, expect } from '@playwright/test';
import { readLocalSignInLink } from '../../tooling/local/mailbox.mjs';

test('enrolls a passkey, signs in after logout without mail, and removes the credential', async ({
  page,
  context,
}) => {
  const bytes = crypto.getRandomValues(new Uint8Array(2));
  await context.setExtraHTTPHeaders({ 'x-forwarded-for': `198.19.${bytes[0]}.${bytes[1]}` });
  const cdp = await context.newCDPSession(page);
  await cdp.send('WebAuthn.enable');
  const { authenticatorId } = await cdp.send('WebAuthn.addVirtualAuthenticator', {
    options: {
      protocol: 'ctap2',
      transport: 'internal',
      hasResidentKey: true,
      hasUserVerification: true,
      isUserVerified: true,
      automaticPresenceSimulation: true,
    },
  });
  const email = `passkey-${crypto.randomUUID()}@example.test`;
  await page.goto('/en/auth');
  await page.getByLabel('Email address').fill(email);
  await page.getByLabel('I confirm I am 18 or older.').check();
  await page.getByRole('button', { name: 'Send sign-in link', exact: true }).click();
  await expect(page.getByText('Link requested.', { exact: false })).toBeVisible();
  const originalLink = await readLocalSignInLink(email);
  await page.goto(originalLink);
  await page.goto('/en/settings');
  await page.getByLabel('Passkey name').fill('Test laptop');
  await page.getByRole('button', { name: 'Add a passkey', exact: true }).click();
  await expect(page.getByText('Passkey added.', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Sign out', exact: true }).click();
  expect((await page.request.get('/api/v1/me')).status()).toBe(401);
  await page.goto('/en/auth');
  await cdp.send('WebAuthn.setUserVerified', { authenticatorId, isUserVerified: false });
  await page.getByRole('button', { name: 'Sign in with a passkey', exact: true }).click();
  await expect(page.getByRole('alert')).toBeVisible();
  expect((await page.request.get('/api/v1/me')).status()).toBe(401);
  await cdp.send('WebAuthn.setUserVerified', { authenticatorId, isUserVerified: true });
  const assertion = page.waitForRequest('**/api/auth/passkey/verify-authentication');
  await page.getByRole('button', { name: 'Sign in with a passkey', exact: true }).click();
  const assertionBody = (await assertion).postDataJSON();
  await expect(page).toHaveURL(/\/en\/today$/);
  expect((await page.request.get('/api/v1/me')).status()).toBe(200);
  expect(await readLocalSignInLink(email)).toBe(originalLink);
  const replay = await page.request.post('/api/auth/passkey/verify-authentication', {
    headers: { Origin: 'http://localhost:5174' },
    data: assertionBody,
  });
  expect(replay.ok()).toBe(false);
  await page.goto('/en/settings');
  await page.getByRole('button', { name: 'Remove', exact: true }).click();
  await expect(page.getByText('Passkey removed.', { exact: true })).toBeVisible();
  await expect(page.getByText('No passkeys added yet.', { exact: true })).toBeVisible();
});
