import { expect, test } from '@playwright/test';
import { readLocalSignInLink } from '../../tooling/local/mailbox.mjs';

test('study plans demonstrate real CRUD, conflicts and persistence after reload', async ({
  page,
}) => {
  const email = `plans-${crypto.randomUUID()}@example.test`;
  await page.goto('/en/auth');
  await page.getByLabel('Email address').fill(email);
  await page.getByLabel('I confirm I am 18 or older.').check();
  await page.getByRole('button', { name: 'Send sign-in link' }).click();
  await expect(page.getByText('Link requested.', { exact: false })).toBeVisible();
  await page.goto(await readLocalSignInLink(email));
  await page.goto('/en/study-plans');
  await page.getByLabel('Title', { exact: true }).fill('JavaScript foundations');
  await page.getByLabel('Slug', { exact: true }).fill('javascript-foundations');
  await page.getByLabel('Description', { exact: true }).fill('Practice fundamentals');
  await page.getByRole('button', { name: 'Create plan', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Plan saved.' })).toBeVisible();
  await page.reload();
  await page.getByRole('button', { name: 'JavaScript foundations', exact: true }).click();
  await expect(page.getByLabel('Description', { exact: true })).toHaveValue(
    'Practice fundamentals',
    { timeout: 15000 },
  );
  await page.getByLabel('Title', { exact: true }).fill('Ready for interviews');
  await page.getByLabel('Status', { exact: true }).selectOption('active');
  await page.getByRole('button', { name: 'Save changes', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Ready for interviews', exact: true }),
  ).toBeVisible();
  await page.screenshot({
    path: test.info().outputPath('study-plans-desktop.png'),
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole('button', { name: 'Save changes', exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await page.screenshot({ path: test.info().outputPath('study-plans-mobile.png'), fullPage: true });
  await page.getByRole('button', { name: 'New plan', exact: true }).click();
  await page.getByLabel('Title', { exact: true }).fill('Duplicate');
  await page.getByLabel('Slug', { exact: true }).fill('javascript-foundations');
  await page.getByRole('button', { name: 'Create plan', exact: true }).click();
  await expect(page.getByRole('alert')).toHaveText('This slug already exists. Choose another.');
  await expect(page.getByRole('alert')).toBeInViewport();
  await expect(page.getByRole('alert')).toBeFocused();
  await expect(page.getByLabel('Slug', { exact: true })).toHaveAttribute('aria-invalid', 'true');
  await expect(page.getByLabel('Title', { exact: true })).toHaveValue('Duplicate');
  await page.getByLabel('Slug', { exact: true }).fill('another-plan');
  await expect(page.getByRole('alert')).toHaveCount(0);
  await page.getByRole('button', { name: 'Ready for interviews', exact: true }).click();
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Delete plan', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Plan deleted.' })).toBeVisible();
  await page.getByText('API activity (demo)', { exact: true }).click();
  await expect(page.locator('summary').filter({ hasText: /DELETE .* → 204/ })).toBeVisible();
  await page.reload();
  await expect(page.getByText('No plans on this page yet.', { exact: true })).toBeVisible();
});
