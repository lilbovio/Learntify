import { expect, test } from '@playwright/test';

test('library search preserves lesson order and opens the real workspace', async ({
  page,
}, testInfo) => {
  await page.goto('/en/learn');
  await expect(page.locator('.library-items li')).toHaveCount(12);
  await page.getByRole('button', { name: 'Path', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Path', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await page.getByRole('searchbox', { name: 'Search lessons' }).fill('arrays');
  await expect(page.locator('.library-items li')).toHaveCount(1);
  await expect(page.locator('.library-step')).toHaveText('08');
  await page.screenshot({ path: testInfo.outputPath('library.png'), fullPage: true });
  await page.locator('.library-items a').click();
  await expect(page).toHaveURL(/collecting-with-arrays/);
  await expect(page.locator('.code-editor')).toBeVisible();
});

test('Spanish mobile hubs have honest guest states and no overflow', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/es/learn');
  await expect(page.locator('.library-items li')).toHaveCount(12);
  await page.getByRole('searchbox').fill('zzzz');
  await expect(
    page.getByText('No hay lecciones con esa búsqueda. Prueba otra palabra.'),
  ).toBeVisible();
  await page.getByRole('link', { name: 'Practicar', exact: true }).click();
  await expect(page.getByText('Aquí va tu práctica.')).toBeVisible();
  await page.getByRole('link', { name: 'Progreso', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Mira cuánto has avanzado.' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('progress-mobile.png'), fullPage: true });
  await page.getByRole('link', { name: 'Cuaderno', exact: true }).click();
  await expect(page.getByText('Un lugar para tus propias palabras.')).toBeVisible();
  await expect(page.getByRole('textbox')).toHaveCount(0);
});
