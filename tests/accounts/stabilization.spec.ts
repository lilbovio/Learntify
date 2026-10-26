import { expect, test } from '@playwright/test';
import { readLocalSignInLink } from '../../tooling/local/mailbox.mjs';

test('learning journey protects plan edits and recovers from failed and expired saves', async ({
  page,
}) => {
  test.setTimeout(90000);
  const email = `stability-${crypto.randomUUID()}@example.test`;
  await page.goto('/en/auth');
  await page.getByLabel('Email address').fill(email);
  await page.getByLabel('I confirm I am 18 or older.').check();
  await page.getByRole('button', { name: 'Send sign-in link' }).click();
  await expect(page.getByText('Link requested.', { exact: false })).toBeVisible();
  await page.goto(await readLocalSignInLink(email));
  await page.goto('/en/learn/lessons/values-and-expressions');
  await page.getByLabel('Your JavaScript', { exact: true }).fill('console.log(7);');
  await page.getByRole('button', { name: 'Run code', exact: true }).click();
  await page.getByRole('button', { name: 'Save practice attempt' }).click();
  await expect(page.getByText('Attempt saved to your account.', { exact: true })).toBeVisible();
  await expect(page.getByText('Code saved to your account.', { exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'View progress and review' }).click();
  await expect(page.locator('.practice-overview')).toContainText('Saved attempts: 1');
  await page.getByRole('link', { name: 'Study plans', exact: true }).click();
  await page.getByLabel('Title', { exact: true }).fill('Keep my work');
  await page.getByLabel('Slug', { exact: true }).fill('keep-my-work');
  page.once('dialog', (dialog) => dialog.dismiss());
  await page.getByRole('button', { name: 'New plan', exact: true }).click();
  await expect(page.getByLabel('Title', { exact: true })).toHaveValue('Keep my work');
  page.once('dialog', (dialog) => dialog.dismiss());
  await page.getByRole('link', { name: 'Learn', exact: true }).click();
  await expect(page).toHaveURL(/study-plans$/);
  page.once('dialog', (dialog) => dialog.dismiss());
  await page.getByRole('button', { name: 'Sign out', exact: true }).click();
  await expect(page.getByLabel('Title', { exact: true })).toHaveValue('Keep my work');
  await page.route(
    '**/api/v1/study-plans',
    (route) => route.fulfill({ status: 401, json: { error: { code: 'UNAUTHENTICATED' } } }),
    { times: 1 },
  );
  await page.getByRole('button', { name: 'Create plan', exact: true }).click();
  const recovery = page.getByRole('link', { name: 'Sign in in another tab' });
  await expect(recovery).toHaveAttribute('target', '_blank');
  await expect(page.getByLabel('Title', { exact: true })).toHaveValue('Keep my work');
  await page.getByRole('button', { name: 'Create plan', exact: true }).click();
  await expect(page.getByText('Plan saved.', { exact: true })).toBeVisible();
  await expect(recovery).toHaveCount(0);
  await page.getByLabel('Title', { exact: true }).fill('Retry this edit');
  await page.route('**/api/v1/study-plans/*', async (route) => {
    if (route.request().method() === 'PUT') await route.abort();
    else await route.continue();
  });
  await page.getByRole('button', { name: 'Save changes', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Try again');
  await expect(page.getByLabel('Title', { exact: true })).toHaveValue('Retry this edit');
  await page.unroute('**/api/v1/study-plans/*');
  await page.getByRole('button', { name: 'Save changes', exact: true }).click();
  await expect(page.getByText('Plan saved.', { exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Español', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Planes de estudio', exact: true })).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'Retry this edit', exact: true }).click();
  await expect(page.getByLabel('Título', { exact: true })).toHaveValue('Retry this edit');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: test.info().outputPath('stabilized-mobile.png'), fullPage: true });
});
