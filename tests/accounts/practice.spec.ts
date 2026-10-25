import { expect, test } from '@playwright/test';
import { readLocalSignInLink } from '../../tooling/local/mailbox.mjs';

test('practice survives reloads, retries once after a lost acknowledgement, and populates review', async ({
  page,
  context,
  browser,
}) => {
  const bytes = crypto.getRandomValues(new Uint8Array(2));
  await context.setExtraHTTPHeaders({ 'x-forwarded-for': `198.18.${bytes[0]}.${bytes[1]}` });
  const email = `practice-${crypto.randomUUID()}@example.test`;
  await page.goto('/en/auth');
  await page.getByLabel('Email address').fill(email);
  await page.getByLabel('I confirm I am 18 or older.').check();
  await page.getByRole('button', { name: 'Send sign-in link' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Link requested.' })).toBeVisible();
  await page.goto(await readLocalSignInLink(email));
  await page.goto('/en/learn/lessons/values-and-expressions');
  await page.getByLabel('Your JavaScript', { exact: true }).fill('console.log(1);');
  await page.getByRole('button', { name: 'Run code', exact: true }).click();
  const save = page.getByRole('button', { name: 'Save practice attempt' });
  await expect(save).toBeVisible();
  await page.route(
    '**/api/v1/practice/attempts',
    async (route) => {
      await route.fetch();
      await route.abort();
    },
    { times: 1 },
  );
  await save.click();
  await expect(page.getByRole('alert')).toContainText('Could not save');
  await save.click();
  await expect(page.getByText('Attempt saved to your account.', { exact: true })).toBeVisible();
  await expect(page.getByText('Code saved to your account.', { exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'View progress and review' }).click();
  await expect(page.locator('.practice-overview')).toContainText('Saved attempts: 1');
  await expect(page.locator('.practice-overview ol')).toContainText('Values become expressions');
  await page.reload();
  await expect(page.locator('.practice-overview')).toContainText('Saved attempts: 1');
  await page.goto('/en/learn/lessons/values-and-expressions');
  await page.getByLabel('Your JavaScript', { exact: true }).fill('console.log(7);');
  await page.getByRole('button', { name: 'Run code', exact: true }).click();
  await save.click();
  await expect(page.getByText('Code saved to your account.', { exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'View progress and review' }).click();
  await expect(page.locator('.practice-overview')).toContainText('Saved attempts: 2');
  await expect(page.locator('.practice-overview')).toContainText('No reviews due right now.');
  await page.goto('/es/today');
  await expect(page.locator('.practice-overview')).toContainText('Intentos guardados: 2');
  const second = await browser.newContext({
    baseURL: 'http://localhost:5174',
    storageState: await context.storageState(),
  });
  try {
    const other = await second.newPage();
    await other.goto('/en/learn/lessons/values-and-expressions');
    await expect(other.getByLabel('Your JavaScript', { exact: true })).toHaveValue(
      'console.log(7);',
    );
    await expect(other.getByRole('textbox', { name: 'Your lesson notes' })).toHaveValue('');
    await other.getByText('Recent attempts', { exact: true }).click();
    await expect(other.getByRole('button', { name: 'Load into editor' })).toHaveCount(2);
    other.once('dialog', (dialog) => dialog.accept());
    await other.getByRole('button', { name: 'Load into editor' }).nth(1).click();
    await expect(other.getByLabel('Your JavaScript', { exact: true })).toHaveValue(
      'console.log(1);',
    );
    await expect(other.getByText('Code saved to your account.', { exact: true })).toBeVisible();
    await other.reload();
    await expect(other.getByLabel('Your JavaScript', { exact: true })).toHaveValue(
      'console.log(1);',
    );
    let injected = false;
    await other.route('**/api/v1/drafts/*', async (route) => {
      if (route.request().method() !== 'PUT' || injected) return route.continue();
      injected = true;
      const body = route.request().postDataJSON();
      const competing = await other.request.put(route.request().url(), {
        headers: { Origin: 'http://localhost:5174' },
        data: { ...body, content: 'console.log(99);', operationId: crypto.randomUUID() },
      });
      expect(competing.status()).toBe(200);
      await route.continue();
    });
    await other.getByLabel('Your JavaScript', { exact: true }).fill('console.log(42);');
    await expect(other.getByRole('alert')).toContainText('Your code changed on another device');
    await expect(other.getByLabel('Your JavaScript', { exact: true })).toHaveValue(
      'console.log(42);',
    );
    await other.getByRole('button', { name: 'Keep my code' }).click();
    await expect(other.getByText('Code saved to your account.', { exact: true })).toBeVisible();
    await other.reload();
    await expect(other.getByLabel('Your JavaScript', { exact: true })).toHaveValue(
      'console.log(42);',
    );
    await other.getByRole('button', { name: 'Sign out', exact: true }).click();
    await expect(other.getByText('Recent attempts', { exact: true })).toHaveCount(0);
    await expect(other.getByLabel('Your JavaScript', { exact: true })).toHaveValue(
      'console.log(3 + 2);',
    );
    expect(
      (await other.request.get('/api/v1/practice/history/values-and-expressions')).status(),
    ).toBe(401);
  } finally {
    await second.close();
  }
});
