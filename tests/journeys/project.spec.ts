import { expect, test } from '@playwright/test';
import { basketSolution } from '../fixtures/basket';

test('project checks reject printed answers and verify function behavior', async ({ page }) => {
  await page.goto('/en/projects');
  await page.getByRole('link', { name: 'Open project', exact: false }).click();
  await expect(page.getByRole('heading', { name: 'Project brief' })).toBeVisible();
  const editor = page.getByLabel('Your JavaScript', { exact: true });
  await editor.fill('console.log(0); console.log(500); console.log(800);');
  await page.getByRole('button', { name: 'Run code', exact: true }).click();
  await expect(
    page.getByText('Review the failing checks and try again.', { exact: true }),
  ).toBeVisible();
  await expect(page.locator('.project-checks > ul > li')).toHaveCount(7);
  await editor.fill(basketSolution);
  await page.getByRole('button', { name: 'Run code', exact: true }).click();
  await expect(page.getByText('All project checks passed.', { exact: false })).toBeVisible();
  await expect(
    page.locator('.project-checks > ul > li').filter({ hasText: '— Passed' }),
  ).toHaveCount(7);
  await expect(
    page.getByRole('heading', { name: 'Review and interview walkthrough' }),
  ).toBeVisible();
  await editor.fill('function basketTotal(items) { return 800; }');
  await expect(page.getByText('All project checks passed.', { exact: false })).toHaveCount(0);
  await page.getByRole('button', { name: 'Run code', exact: true }).click();
  await expect(
    page.locator('.project-checks > ul > li').filter({ hasText: 'Needs work' }),
  ).not.toHaveCount(0);
});

test('project reports mutation and runtime errors, then recovers', async ({ page }) => {
  await page.goto('/en/learn/lessons/project-basket-total');
  const editor = page.getByLabel('Your JavaScript', { exact: true });
  await editor.fill(basketSolution.replace('return total;', 'items.length = 0; return total;'));
  await page.getByRole('button', { name: 'Run code', exact: true }).click();
  await expect(
    page.locator('.project-checks li').filter({ hasText: 'Input records remain unchanged' }),
  ).toContainText('Needs work');
  await editor.fill('function basketTotal(items) { while (true) {} }');
  await page.getByRole('button', { name: 'Run code', exact: true }).click();
  await expect(
    page.getByText('Review the failing checks and try again.', { exact: true }),
  ).toBeVisible();
  await editor.fill(basketSolution);
  await page.getByRole('button', { name: 'Run code', exact: true }).click();
  await expect(page.getByText('All project checks passed.', { exact: false })).toBeVisible();
});

test('Spanish project brief and review remain usable on mobile', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/es/projects');
  await page.getByRole('link', { name: 'Abrir proyecto', exact: false }).click();
  await expect(page.getByRole('heading', { name: 'Guía del proyecto' })).toBeVisible();
  await page.getByLabel('Tu JavaScript', { exact: true }).fill(basketSolution);
  await page.getByRole('button', { name: 'Ejecutar código', exact: true }).click();
  await expect(page.getByText('Todas las pruebas pasaron.', { exact: false })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('project-mobile.png'), fullPage: true });
});
