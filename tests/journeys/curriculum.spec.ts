import { expect, test } from '@playwright/test';

const exercises = [
  {
    id: 'building-a-basket-total',
    title: 'Build a basket total',
    answer: '800',
    code: 'function basketTotal(items) { let total = 0; for (let i = 0; i < items.length; i = i + 1) { total = total + items[i].priceCents * items[i].quantity; } return total; }\nconsole.log(basketTotal([]));\nconsole.log(basketTotal([{ priceCents: 250, quantity: 2 }]));\nconsole.log(basketTotal([{ priceCents: 250, quantity: 2 }, { priceCents: 100, quantity: 3 }]));',
  },
  {
    id: 'building-a-study-summary',
    title: 'Build a study summary',
    answer: '15',
    code: 'function completedMinutes(sessions) { let total = 0; for (let i = 0; i < sessions.length; i = i + 1) { if (sessions[i].completed === true) { total = total + sessions[i].minutes; } } return total; }\nconsole.log(completedMinutes([]));\nconsole.log(completedMinutes([{ minutes: 20, completed: false }]));\nconsole.log(completedMinutes([{ minutes: 15, completed: true }, { minutes: 20, completed: false }, { minutes: 10, completed: true }]));',
  },
  {
    id: 'repeating-with-loops',
    title: 'Repeating with loops',
    answer: '1, 2, 3',
    code: 'for (let round = 1; round <= 4; round = round + 1) { console.log(round); }',
  },
  {
    id: 'writing-functions',
    title: 'Writing functions',
    answer: '6',
    code: 'function double(points) { return points * 2; }\nconsole.log(double(4));\nconsole.log(double(5));',
  },
  {
    id: 'collecting-with-arrays',
    title: 'Collecting values in arrays',
    answer: '4',
    code: 'let scores = [2, 4, 6];\nscores[1] = 8;\nconsole.log(scores.length);\nconsole.log(scores[1]);',
  },
  {
    id: 'describing-with-objects',
    title: 'Describing things with objects',
    answer: 'Ada',
    code: 'let player = { name: "Ada", score: 10 };\nplayer.score = 20;\nconsole.log(player.name);\nconsole.log(player.score);',
  },
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
for (const exercise of exercises) {
  test(`${exercise.title}: prediction and executable exercise`, async ({ page }) => {
    await page.goto('/en/learn/lessons/' + exercise.id);
    await expect(page.getByRole('heading', { name: exercise.title, exact: true })).toBeVisible();
    await page.getByRole('radio', { name: exercise.answer, exact: true }).check();
    await page.getByRole('button', { name: 'Check my reasoning' }).click();
    await expect(page.getByRole('heading', { name: 'You predicted it.' })).toBeVisible();
    await page.getByLabel('Your JavaScript', { exact: true }).fill(exercise.code);
    await page.getByRole('button', { name: 'Run code', exact: true }).click();
    await expect(page.getByText('Output matches.', { exact: false })).toBeVisible();
  });
}
test('expanded foundations have previous, next and return navigation', async ({ page }) => {
  await page.goto('/en/learn/lessons/making-decisions');
  await page.getByRole('button', { name: 'Previous lesson' }).click();
  await expect(page.getByRole('heading', { name: 'Comparing values', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Next lesson' }).click();
  await expect(page.getByRole('heading', { name: 'Making decisions', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Build a study summary', exact: false }).click();
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
  await page.getByRole('link', { name: 'Hoy', exact: true }).click();
  await expect(page.getByRole('link', { name: 'Paso 5 Tomar decisiones' })).toBeVisible();
});
