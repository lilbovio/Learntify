import { expect, test } from '@playwright/test';
test('switching lessons isolates answers, persists the URL, and localizes navigation', async ({
  page,
}) => {
  await page.goto('/en/learn/lessons/values-and-expressions');
  await page.getByRole('radio', { name: '5', exact: true }).check();
  await page.getByRole('button', { name: 'Storing values with variables' }).click();
  await expect(page.getByRole('button', { name: 'Check my reasoning' })).toBeDisabled();
  await page.getByRole('radio', { name: '10', exact: true }).check();
  await page.getByRole('button', { name: 'Check my reasoning' }).click();
  await expect(page.getByRole('heading', { name: 'You predicted it.' })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('radio', { name: '10', exact: true })).toBeChecked();
  await page.getByRole('combobox').selectOption('es');
  await expect(page.getByRole('button', { name: 'Guardar valores con variables' })).toBeVisible();
  await page.getByRole('button', { name: 'De valores a expresiones' }).click();
  await expect(page.getByRole('radio', { name: '5', exact: true })).toBeChecked();
});
test('a late feedback response cannot appear on another lesson', async ({ page }) => {
  await page.goto('/en/learn/lessons/values-and-expressions');
  await page.getByRole('radio', { name: '5', exact: true }).check();
  let release!: () => void;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route('**/predictions', async (route) => {
    await pending;
    await route.fulfill({
      json: {
        data: {
          correct: true,
          explanation: 'OLD RESPONSE',
          nextStep: 'old',
          provenance: 'practice-feedback',
        },
        meta: { requestId: 'test' },
      },
    });
  });
  await page.getByRole('button', { name: 'Check my reasoning' }).click();
  await page.getByRole('button', { name: 'Storing values with variables' }).click();
  await expect(page.getByRole('heading', { name: 'Storing values with variables' })).toBeVisible();
  release();
  await expect(page.getByText('OLD RESPONSE')).toHaveCount(0);
});
test('learner receives feedback and preserves a prediction when switching language', async ({
  page,
}) => {
  await page.goto('/en/learn/lessons/values-and-expressions');
  await expect(page.getByRole('heading', { name: 'Values become expressions' })).toBeVisible();
  await page.getByRole('radio', { name: '32', exact: true }).check();
  await page.getByRole('button', { name: 'Check my reasoning' }).click();
  await expect(page.getByRole('heading', { name: 'Let’s follow the expression.' })).toBeVisible();
  await page.getByRole('combobox').selectOption('es');
  await expect(page.getByRole('heading', { name: 'De valores a expresiones' })).toBeVisible();
  await expect(page.getByRole('radio', { name: '32', exact: true })).toBeChecked();
  await page.getByRole('radio', { name: '5', exact: true }).check();
  await page.getByRole('button', { name: 'Comprobar mi razonamiento' }).click();
  await expect(page.getByRole('heading', { name: 'Lo predijiste.' })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('radio', { name: '5', exact: true })).toBeChecked();
  await expect(page.locator('html')).toHaveAttribute('lang', 'es');
});
test('failed feedback keeps the selected answer and can recover', async ({ page }) => {
  await page.goto('/en/learn/lessons/values-and-expressions');
  await page.getByRole('radio', { name: '5', exact: true }).check();
  await page.route('**/predictions', (route) => route.abort());
  await page.getByRole('button', { name: 'Check my reasoning' }).click();
  await expect(page.getByRole('alert')).toContainText('Your answer is still here');
  await expect(page.getByRole('radio', { name: '5', exact: true })).toBeChecked();
  await page.unroute('**/predictions');
  await page.getByRole('button', { name: 'Check my reasoning' }).click();
  await expect(page.getByRole('heading', { name: 'You predicted it.' })).toBeVisible();
});
test('mobile lesson does not overflow the viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/es/learn/lessons/values-and-expressions');
  await expect(page.getByRole('heading', { name: 'De valores a expresiones' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
});
