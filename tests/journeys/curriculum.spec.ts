import { expect, test } from '@playwright/test';

const exercises = [
  {
    id: 'working-with-text',
    title: 'Working with text',
    answer: 'Hello, Ada',
    code: 'let name = "Sam";\nconsole.log("Hello, " + name);',
  },
  {
    id: 'comparing-values',
    title: 'Comparing values',
    answer: 'true',
    code: 'let score = 10;\nconsole.log(score > 10);\nconsole.log(score === 10);',
  },
  {
    id: 'making-decisions',
    title: 'Making decisions',
    answer: 'Keep practicing',
    code: 'let score = 10;\nif (score >= 10) {\n  console.log("Ready");\n} else {\n  console.log("Keep practicing");\n}',
  },
];
test('new foundations teach predictions and runnable exercises in sequence', async ({ page }) => {
  for (const exercise of exercises) {
    await page.goto('/en/learn/lessons/' + exercise.id);
    await expect(page.getByRole('heading', { name: exercise.title, exact: true })).toBeVisible();
    await page.getByRole('radio', { name: exercise.answer, exact: true }).check();
    await page.getByRole('button', { name: 'Check my reasoning' }).click();
    await expect(page.getByRole('heading', { name: 'You predicted it.' })).toBeVisible();
    await page.getByLabel('Your JavaScript', { exact: true }).fill(exercise.code);
    await page.getByRole('button', { name: 'Run code', exact: true }).click();
    await expect(page.getByText('Output matches.', { exact: false })).toBeVisible();
  }
  await page.getByRole('button', { name: 'Previous lesson' }).click();
  await expect(page.getByRole('heading', { name: 'Comparing values', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Next lesson' }).click();
  await expect(page.getByRole('link', { name: 'Return to your practice' })).toBeVisible();
});

test('Spanish foundations remain readable on mobile and preserve lesson navigation', async ({
  page,
}, testInfo) => {
  await page.goto('/es/learn/lessons/comparing-values');
  await expect(page.getByRole('heading', { name: 'Comparar valores', exact: true })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('lesson-desktop.png'), fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await page.getByRole('button', { name: 'Siguiente lección' }).click();
  await expect(page.getByRole('heading', { name: 'Tomar decisiones', exact: true })).toBeVisible();
  await expect(page.locator('#lesson')).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await page.screenshot({ path: testInfo.outputPath('lesson-mobile.png'), fullPage: true });
  await page.getByRole('link', { name: 'Volver a tu práctica' }).click();
  await expect(page.getByRole('link', { name: 'Paso 5 Tomar decisiones' })).toBeVisible();
});
