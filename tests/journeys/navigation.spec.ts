import { expect, test } from '@playwright/test';

test('guest can choose a pace, revisit it, and open a lesson without an account', async ({
  page,
}, testInfo) => {
  await page.goto('/');
  await page.screenshot({ path: testInfo.outputPath('welcome.png'), fullPage: true });
  await page.getByRole('link', { name: 'Find my starting point' }).click();
  await page.getByLabel('Build projects with confidence').check();
  await page.getByLabel('Weekly time (optional)').selectOption('180');
  await page.getByRole('button', { name: 'Save and continue' }).click();
  await expect(page).toHaveURL(/\/en\/today$/);
  await expect(page.getByText('Building projects', { exact: true })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('today.png'), fullPage: true });
  await page.reload();
  await expect(page.getByText('Weekly study time: 180 minutes')).toBeVisible();
  await page.getByRole('link', { name: 'Edit learning preferences' }).click();
  await expect(page.getByLabel('Build projects with confidence')).toBeChecked();
  await page.getByRole('link', { name: 'Skip for now' }).click();
  await page.getByRole('link', { name: /Step 1 Values become expressions/ }).click();
  await expect(page.getByRole('heading', { name: 'Values become expressions' })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Values become expressions' })).toBeVisible();
});

test('Spanish mobile navigation and missing routes have usable destinations', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/es');
  await page.getByRole('link', { name: 'Encontrar mi punto de partida' }).click();
  await expect(page.getByRole('heading', { name: 'Haz espacio para aprender.' })).toBeVisible();
  await page.getByLabel('Crear proyectos con confianza').waitFor();
  await page.screenshot({ path: testInfo.outputPath('onboarding-mobile.png'), fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await page.getByRole('link', { name: 'Omitir por ahora' }).click();
  await expect(page.getByRole('heading', { name: 'Un poco de aprendizaje, hoy.' })).toBeVisible();
  await page.goto('/es/missing');
  await expect(page.getByRole('heading', { name: 'Esta página no existe.' })).toBeVisible();
  await page.getByRole('link', { name: 'Volver a Learntify' }).click();
  await expect(page).toHaveURL(/\/es$/);
});
