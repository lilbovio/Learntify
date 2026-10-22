import { Hono } from 'hono';
import { bodyLimit } from 'hono/body-limit';
import { saveDraftSchema } from '@learntify/api-contracts';
import type { DraftRepository } from '@learntify/learning';
import type { LearntifyAuth } from '../auth/create-auth';
import { errorBody, meta } from '../http/envelope';

export function createDraftRoutes(auth: LearntifyAuth, drafts: DraftRepository) {
  const routes = new Hono<{ Variables: { ownerId: string } }>();
  routes.use('/api/v1/drafts/*', async (c, next) => {
    c.header('Cache-Control', 'no-store');
    if (c.req.method !== 'GET' && c.req.header('Origin') !== auth.options.baseURL)
      return c.json(errorBody(c, 'INVALID_ORIGIN', 'Use the application origin.'), 403);
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if (!session) return c.json(errorBody(c, 'UNAUTHENTICATED', 'Sign in to continue.'), 401);
    c.set('ownerId', session.user.id);
    await next();
  });
  routes.use(
    '/api/v1/drafts/*',
    bodyLimit({
      maxSize: 65536,
      onError: (c) => c.json(errorBody(c, 'PAYLOAD_TOO_LARGE', 'Draft is too large.'), 413),
    }),
  );
  routes.get('/api/v1/drafts/:id', async (c) => {
    const draft = await drafts.get(c.req.param('id'), c.get('ownerId'));
    if (!draft) return c.json(errorBody(c, 'NOT_FOUND', 'Draft not found.'), 404);
    return c.json({
      data: { id: draft.id, content: draft.content, revision: draft.revision },
      meta: meta(c),
    });
  });
  routes.put('/api/v1/drafts/:id', async (c) => {
    if (c.req.header('Content-Type')?.split(';')[0]?.trim() !== 'application/json')
      return c.json(errorBody(c, 'UNSUPPORTED_MEDIA_TYPE', 'Expected application/json.'), 415);
    let input: unknown;
    try {
      input = await c.req.json();
    } catch {
      return c.json(errorBody(c, 'INVALID_JSON', 'Expected valid JSON.'), 400);
    }
    const parsed = saveDraftSchema.safeParse(input);
    if (!parsed.success) return c.json(errorBody(c, 'INVALID_INPUT', 'Invalid draft update.'), 422);
    const result = await drafts.save({
      ...parsed.data,
      id: c.req.param('id'),
      ownerId: c.get('ownerId'),
    });
    if (result.kind === 'missing')
      return c.json(errorBody(c, 'NOT_FOUND', 'Draft not found.'), 404);
    if (result.kind === 'operation-conflict')
      return c.json(
        errorBody(
          c,
          'OPERATION_CONFLICT',
          'This operation was already used for a different update.',
        ),
        409,
      );
    if (result.kind === 'conflict')
      return c.json(
        {
          ...errorBody(c, 'VERSION_CONFLICT', 'The draft changed on another device.'),
          currentRevision: result.revision,
        },
        409,
      );
    return c.json({ data: { revision: result.revision }, meta: meta(c) });
  });
  return routes;
}
