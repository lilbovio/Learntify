import { expect, test } from '@playwright/test';

test('code feedback, local persistence, isolation and recovery', async ({ page }) => {
  await page.goto('/en/learn/lessons/values-and-expressions');
  const editor = page.getByLabel('Your JavaScript', { exact: true });
  const run = page.getByRole('button', { name: 'Run code', exact: true });
  await editor.fill('console.log(3 + 4);');
  await run.click();
  await expect(page.getByText('Output matches.', { exact: false })).toBeVisible();
  await page.reload();
  await expect(editor).toHaveValue('console.log(3 + 4);');
  await editor.fill(
    'console.log(typeof fetch, typeof document, typeof localStorage, typeof postMessage);',
  );
  await run.click();
  await expect(
    page.getByText('undefined undefined undefined undefined', { exact: true }),
  ).toBeVisible();
  await editor.fill('console.log(true, false, null);');
  await run.click();
  await expect(page.getByText('true false null', { exact: true })).toBeVisible();
  await editor.fill('while (true) {}');
  await run.click();
  await expect(run).toBeEnabled({ timeout: 10000 });
  await expect(page.locator('.code-exercise [role="status"]')).toContainText(
    /interrupted|Execution stopped/,
  );
  await editor.fill('console.log(3 + 4);');
  await run.click();
  await expect(page.getByText('Output matches.', { exact: false })).toBeVisible();
  await page.getByRole('button', { name: 'Storing values with variables' }).click();
  await expect(editor).toHaveValue('let score = 10;\nconsole.log(score);');
  await editor.fill('let score = 10;\nconsole.log(score);\nscore = 20;\nconsole.log(score);');
  await run.click();
  await expect(page.getByText('Output matches.', { exact: false })).toBeVisible();
});

test('syntax errors and excessive output do not break the editor', async ({ page }) => {
  await page.goto('/es/learn/lessons/values-and-expressions');
  const editor = page.getByLabel('Tu JavaScript', { exact: true });
  const run = page.getByRole('button', { name: 'Ejecutar código', exact: true });
  await editor.fill('let = ;');
  await run.click();
  await expect(page.locator('.code-exercise [role="status"]')).toContainText(/unexpected/);
  await editor.fill('for (let i = 0; i < 100; i++) console.log(i);');
  await run.click();
  await expect(page.locator('.code-exercise [role="status"]')).toContainText('Output limit');
  await page.getByRole('button', { name: 'Restablecer código' }).click();
  await expect(editor).toHaveValue('console.log(3 + 2);');
});
