import { Hono } from 'hono';
import { bodyLimit } from 'hono/body-limit';
import { preferencesSchema } from '@learntify/api-contracts';
import type { PreferencesRepository } from '@learntify/learning';
import type { LearntifyAuth } from '../auth/create-auth';
import { errorBody, meta } from '../http/envelope';

export function createPreferencesRoutes(auth: LearntifyAuth, preferences: PreferencesRepository) {
  const routes = new Hono<{ Variables: { ownerId: string } }>();
  routes.use('/api/v1/preferences', async (c, next) => {
    c.header('Cache-Control', 'no-store');
    if (c.req.method !== 'GET' && c.req.header('Origin') !== auth.options.baseURL)
      return c.json(errorBody(c, 'INVALID_ORIGIN', 'Use the application origin.'), 403);
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if (!session) return c.json(errorBody(c, 'UNAUTHENTICATED', 'Sign in to continue.'), 401);
    c.set('ownerId', session.user.id);
    await next();
  });
  routes.use(
    '/api/v1/preferences',
    bodyLimit({
      maxSize: 1024,
      onError: (c) => c.json(errorBody(c, 'PAYLOAD_TOO_LARGE', 'Preferences are too large.'), 413),
    }),
  );
  routes.get('/api/v1/preferences', async (c) =>
    c.json({ data: await preferences.get(c.get('ownerId')), meta: meta(c) }),
  );
  routes.put('/api/v1/preferences', async (c) => {
    let input: unknown;
    try {
      input = await c.req.json();
    } catch {
      return c.json(errorBody(c, 'INVALID_JSON', 'Expected JSON.'), 400);
    }
    const parsed = preferencesSchema.safeParse(input);
    if (!parsed.success)
      return c.json(errorBody(c, 'INVALID_INPUT', 'Invalid learning preferences.'), 422);
    await preferences.save(c.get('ownerId'), parsed.data);
    return c.json({ data: parsed.data, meta: meta(c) });
  });
  return routes;
}
