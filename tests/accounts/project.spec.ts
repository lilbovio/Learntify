import { expect, test } from '@playwright/test';
import { readLocalSignInLink } from '../../tooling/local/mailbox.mjs';
import { basketSolution } from '../fixtures/basket';

test('project code, attempt and interview notes survive reload and appear in notebook', async ({
  page,
}) => {
  const email = `project-${crypto.randomUUID()}@example.test`;
  await page.goto('/en/auth');
  await page.getByLabel('Email address').fill(email);
  await page.getByLabel('I confirm I am 18 or older.').check();
  await page.getByRole('button', { name: 'Send sign-in link' }).click();
  await expect(page.getByText('Link requested.', { exact: false })).toBeVisible();
  await page.goto(await readLocalSignInLink(email));
  await page.goto('/en/learn/lessons/project-basket-total');
  await page.getByLabel('Your JavaScript', { exact: true }).fill(basketSolution);
  await page.getByRole('button', { name: 'Run code', exact: true }).click();
  await expect(page.getByText('All project checks passed.', { exact: false })).toBeVisible();
  await page.getByRole('button', { name: 'Save practice attempt' }).click();
  await expect(page.getByText('Attempt saved to your account.', { exact: true })).toBeVisible();
  await page
    .getByRole('textbox', { name: 'Your lesson notes', exact: true })
    .fill('I used cents and kept the accumulator local. Empty baskets return zero.');
  await expect(page.getByText('Notes saved to your account.', { exact: true })).toBeVisible();
  await expect(page.getByText('Code saved to your account.', { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByLabel('Your JavaScript', { exact: true })).toHaveValue(basketSolution);
  await page.getByText('Recent attempts', { exact: true }).click();
  await expect(page.getByRole('button', { name: 'Load into editor' })).toHaveCount(1);
  await page.getByRole('link', { name: 'Notebook', exact: true }).click();
  await page.getByLabel('Choose a lesson').selectOption('project-basket-total');
  await expect(page.getByRole('textbox', { name: 'Your lesson notes', exact: true })).toHaveValue(
    'I used cents and kept the accumulator local. Empty baskets return zero.',
  );
});
