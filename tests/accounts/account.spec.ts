import { test, expect } from '@playwright/test';
import { readLocalSignInLink } from '../../tooling/local/mailbox.mjs';

test.beforeEach(async ({ context }) => {
  // Separate synthetic clients so the real auth limiter does not combine unrelated journeys.
  const bytes = crypto.getRandomValues(new Uint8Array(2));
  await context.setExtraHTTPHeaders({ 'x-forwarded-for': `198.18.${bytes[0]}.${bytes[1]}` });
});

test('adult learner signs in through local Worker/D1, keeps a session, and signs out', async ({
  page,
}) => {
  const email = `learner-${crypto.randomUUID()}@example.test`;
  await page.goto('/en/auth');
  await expect(page.getByRole('heading', { name: 'Your Learntify account' })).toBeVisible();
  await page.getByLabel('Email address').fill(email);
  await expect(page.getByRole('button', { name: 'Send sign-in link' })).toBeDisabled();
  await page.getByLabel('I confirm I am 18 or older.').check();
  await page.getByRole('button', { name: 'Send sign-in link' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Link requested.' })).toBeVisible();
  const link = await readLocalSignInLink(email);
  await page.goto(link);
  await expect(page).toHaveURL(/\/en\/start$/);
  await page.getByLabel('Build projects with confidence').check();
  await page.getByLabel('Weekly time (optional)').selectOption('180');
  await page.route('**/api/v1/preferences', (route) =>
    route.request().method() === 'PUT'
      ? route.fulfill({ status: 503, json: {} })
      : route.continue(),
  );
  await page.getByRole('button', { name: 'Save and continue' }).click();
  await expect(page.getByRole('alert')).toContainText('We couldn’t save or load');
  await expect(page.getByLabel('Build projects with confidence')).toBeChecked();
  await page.unroute('**/api/v1/preferences');
  await page.getByRole('button', { name: 'Save and continue' }).click();
  await expect(page).toHaveURL(/\/en\/today$/);
  expect(await (await page.request.get('/api/v1/preferences')).json()).toMatchObject({
    data: { locale: 'en', goal: 'projects', weeklyMinutes: 180 },
  });
  await expect(page.getByText('You’re signed in.', { exact: false })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('button', { name: 'Sign out', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Sign out', exact: true }).click();
  await expect(page.getByRole('link', { name: 'Sign in', exact: true })).toBeVisible();
  expect((await page.request.get('/api/v1/me')).status()).toBe(401);
  await page.goto(link);
  await expect(
    page.getByText('This sign-in link could not be used.', { exact: false }),
  ).toBeVisible();
  await expect(page.getByLabel('Email address')).toBeVisible();
  await page.getByLabel('Email address').fill(email);
  await page.getByLabel('I confirm I am 18 or older.').check();
  await page.getByRole('button', { name: 'Send sign-in link' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Link requested.' })).toBeVisible();
  await page.goto(await readLocalSignInLink(email));
  await expect(page).toHaveURL(/\/en\/today$/);
  await expect(page.getByText('Building projects', { exact: true })).toBeVisible();
});

test('Spanish form retains input after a failed delivery request', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/es/auth');
  await page.getByLabel('Correo electrónico').fill('recovery@example.test');
  await page.getByLabel('Confirmo que tengo 18 años o más.').check();
  await page.route('**/api/auth/sign-in/magic-link', (route) =>
    route.fulfill({ status: 503, contentType: 'application/json', body: '{}' }),
  );
  await page.getByRole('button', { name: 'Enviar enlace de acceso' }).click();
  await expect(page.getByRole('alert')).toContainText('No pudimos completar');
  await expect(page.getByLabel('Correo electrónico')).toHaveValue('recovery@example.test');
  await expect(page.getByRole('button', { name: 'Enviar enlace de acceso' })).toBeEnabled();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
});

test('lesson notes sync across sessions and require an explicit choice on conflicts', async ({
  page,
  browser,
}) => {
  const email = `notes-${crypto.randomUUID()}@example.test`;
  await page.goto('/en/auth');
  await page.getByLabel('Email address').fill(email);
  await page.getByLabel('I confirm I am 18 or older.').check();
  await page.getByRole('button', { name: 'Send sign-in link' }).click();
  await expect(page.getByText('Link requested.', { exact: false })).toBeVisible();
  await page.goto(await readLocalSignInLink(email));
  await expect(page).toHaveURL(/\/en\/start$/);
  await page.goto('/en/learn/lessons/values-and-expressions');
  const notes = page.getByRole('textbox', { name: 'Your lesson notes' });
  await expect(notes).toBeEnabled();
  await notes.fill('I can explain addition.');
  await expect(page.getByText('Notes saved to your account.', { exact: true })).toBeVisible();

  const second = await browser.newContext({
    baseURL: 'http://127.0.0.1:5174',
    storageState: await page.context().storageState(),
  });
  try {
    const otherPage = await second.newPage();
    await otherPage.goto('/en/learn/lessons/values-and-expressions');
    await expect(otherPage.getByRole('textbox', { name: 'Your lesson notes' })).toHaveValue(
      'I can explain addition.',
    );
  } finally {
    await second.close();
  }

  let injected = false;
  await page.route('**/api/v1/drafts/*', async (route) => {
    if (route.request().method() !== 'PUT' || injected) {
      await route.continue();
      return;
    }
    injected = true;
    const body = route.request().postDataJSON();
    const competing = await page.request.put(route.request().url(), {
      headers: { Origin: 'http://127.0.0.1:5174' },
      data: { ...body, content: 'Notes from another device.', operationId: crypto.randomUUID() },
    });
    expect(competing.status()).toBe(200);
    await route.continue();
  });
  await notes.fill('My newer explanation.');
  await expect(page.getByRole('alert')).toContainText('changed on another device');
  await expect(notes).toHaveValue('My newer explanation.');
  await expect(page.getByText('Notes from another device.', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Keep my version' }).click();
  await expect(page.getByText('Notes saved to your account.', { exact: true })).toBeVisible();
  await page.reload();
  await expect(notes).toHaveValue('My newer explanation.');
  await page.getByRole('button', { name: 'Sign out', exact: true }).click();
  await expect(notes).toHaveCount(0);
});
