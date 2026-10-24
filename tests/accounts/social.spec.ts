import { test, expect } from '@playwright/test';

test('shows configured providers and preserves email recovery after OAuth initiation failure', async ({
  page,
}) => {
  await page.goto('/es/auth');
  await expect(page.getByLabel('Correo electrónico')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Continuar con Google', exact: true })).toHaveCount(
    0,
  );
  await page.route('**/api/auth/social-providers', (route) =>
    route.fulfill({ json: { providers: ['google', 'github'] } }),
  );
  await page.route('**/api/auth/social/sign-in', async (route) => {
    expect(route.request().postDataJSON()).toEqual({ provider: 'github', locale: 'es' });
    await route.fulfill({ status: 503, json: {} });
  });
  await page.reload();
  await page.getByLabel('Correo electrónico').fill('learner@example.test');
  await page.getByRole('button', { name: 'Continuar con GitHub', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('No se pudo cargar o iniciar');
  await expect(page.getByLabel('Correo electrónico')).toHaveValue('learner@example.test');
  await expect(
    page.getByRole('button', { name: 'Continuar con GitHub', exact: true }),
  ).toBeEnabled();
  await page.unroute('**/api/auth/social/sign-in');
  await page.route('**/api/auth/social/sign-in', (route) =>
    route.fulfill({
      status: 409,
      json: {
        error: { code: 'REAUTHENTICATION_REQUIRED', message: 'Sign in again' },
        meta: { requestId: 'test' },
      },
    }),
  );
  await page.getByRole('button', { name: 'Continuar con GitHub', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('últimos 15 minutos');
});
