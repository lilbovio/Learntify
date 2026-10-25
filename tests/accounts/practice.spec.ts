import { expect, test } from '@playwright/test';
import { readLocalSignInLink } from '../../tooling/local/mailbox.mjs';

test('practice survives reloads, retries once after a lost acknowledgement, and populates review', async ({
  page,
  context,
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
  await page.getByRole('link', { name: 'View progress and review' }).click();
  await expect(page.locator('.practice-overview')).toContainText('Saved attempts: 1');
  await expect(page.locator('.practice-overview ol')).toContainText('Values become expressions');
  await page.reload();
  await expect(page.locator('.practice-overview')).toContainText('Saved attempts: 1');
  await page.goto('/en/learn/lessons/values-and-expressions');
  await page.getByLabel('Your JavaScript', { exact: true }).fill('console.log(7);');
  await page.getByRole('button', { name: 'Run code', exact: true }).click();
  await save.click();
  await page.getByRole('link', { name: 'View progress and review' }).click();
  await expect(page.locator('.practice-overview')).toContainText('Saved attempts: 2');
  await expect(page.locator('.practice-overview')).toContainText('No reviews due right now.');
  await page.goto('/es/today');
  await expect(page.locator('.practice-overview')).toContainText('Intentos guardados: 2');
});
