import { Hono } from 'hono';
import { socialRequestSchema } from '@learntify/api-contracts';
import { sensitiveSessionAgeSeconds, type LearntifyAuth } from './create-auth';
import type { AccountAdmission } from './preview-admission';
import { errorBody } from '../http/envelope';

/** Mounted behind the account router's origin and payload guards. */
export function createSocialRoutes(auth: LearntifyAuth, admission?: AccountAdmission) {
  const routes = new Hono();
  const providers = (['google', 'github'] as const).filter((id) =>
    Boolean(auth.options.socialProviders?.[id]),
  );
  routes.get('/api/auth/social-providers', (c) => c.json({ providers }));
  routes.get('/api/auth/social-connections', async (c) => {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if (!session || (admission && !admission(session.user.email)))
      return c.json(errorBody(c, 'UNAUTHENTICATED', 'Sign in to continue.'), 401);
    const accounts = await auth.api.listUserAccounts({ headers: c.req.raw.headers });
    return c.json({
      providers: providers.filter((provider) =>
        accounts.some((account) => account.providerId === provider),
      ),
    });
  });
  for (const action of ['sign-in', 'link'] as const) {
    routes.post('/api/auth/social/' + action, async (c) => {
      const input = socialRequestSchema.safeParse(await c.req.json().catch(() => null));
      if (!input.success)
        return c.json(errorBody(c, 'INVALID_INPUT', 'Choose a configured provider.'), 422);
      const { provider, locale } = input.data;
      if (!providers.includes(provider))
        return c.json(errorBody(c, 'NOT_FOUND', 'Provider unavailable.'), 404);
      if (action === 'link') {
        const session = await auth.api.getSession({ headers: c.req.raw.headers });
        if (
          !session ||
          !session.user.emailVerified ||
          (admission && !admission(session.user.email))
        )
          return c.json(errorBody(c, 'UNAUTHENTICATED', 'Sign in to continue.'), 401);
        if (
          Date.now() - new Date(session.session.createdAt).getTime() >=
          sensitiveSessionAgeSeconds * 1000
        )
          return c.json(
            errorBody(c, 'REAUTHENTICATION_REQUIRED', 'Sign in again to connect a provider.'),
            409,
          );
      }
      const endpoint = action === 'link' ? '/link-social' : '/sign-in/social';
      const headers = new Headers(c.req.raw.headers);
      headers.delete('content-length');
      headers.set('Content-Type', 'application/json');
      return auth.handler(
        new Request(auth.options.baseURL + '/api/auth' + endpoint, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            provider,
            disableRedirect: true,
            callbackURL: '/' + locale + (action === 'link' ? '/settings' : '/today'),
            errorCallbackURL:
              '/' + locale + (action === 'link' ? '/settings?socialError=1' : '/auth'),
          }),
        }),
      );
    });
  }
  for (const provider of providers)
    routes.get('/api/auth/callback/' + provider, (c) => {
      c.header('Referrer-Policy', 'no-referrer');
      return auth.handler(c.req.raw);
    });
  return routes;
}
