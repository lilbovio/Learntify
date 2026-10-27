import { expect, test } from '@playwright/test';
test('same-origin preview serves localized deep links and keeps API errors as JSON', async ({
  page,
  request,
}) => {
  await page.goto('/es/learn/lessons/values-and-expressions');
  await expect(page.getByRole('heading', { name: 'De valores a expresiones' })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'De valores a expresiones' })).toBeVisible();
  const missing = await request.get('/api/v1/does-not-exist');
  expect(missing.status()).toBe(404);
  expect(missing.headers()['content-type']).toContain('application/json');
  const capabilities = await request.get('/api/v1/capabilities');
  expect((await capabilities.json()).data.accounts).toBe(false);
  await page.goto('/en/missing');
  await expect(page.getByRole('heading', { name: 'This page is not here.' })).toBeVisible();
});
test('bundled Worker and WASM execute offline downloads without a Vite API proxy', async ({
  page,
}) => {
  await page.goto('/en/learn/lessons/values-and-expressions');
  await page.getByLabel('Your JavaScript', { exact: true }).fill('console.log(7);');
  await page.getByRole('button', { name: 'Run code', exact: true }).click();
  await expect(
    page.getByText('Output matches. Explain why your code produces this result.', { exact: false }),
  ).toBeVisible();
  await page.context().setOffline(true);
  const pending = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download a copy', exact: true }).click();
  const download = await pending;
  expect(download.suggestedFilename()).toBe('values-and-expressions.js');
  const stream = await download.createReadStream();
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  expect(Buffer.concat(chunks).toString()).toBe('console.log(7);');
  await page.context().setOffline(false);
});
