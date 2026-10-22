import { Hono } from 'hono';
import { bodyLimit } from 'hono/body-limit';
import {
  lessonListResponseSchema,
  lessonResponseSchema,
  localeSchema,
  predictionSchema,
  predictionResponseSchema,
} from '@learntify/api-contracts';
import { checkPrediction, getLesson, listLessons } from '@learntify/curriculum';
import type { DraftRepository } from '@learntify/learning';
import type { LearntifyAuth } from './auth/create-auth';
import { createAccountRoutes } from './auth/routes';
import { createDraftRoutes } from './learning/draft-routes';

type Variables = { requestId: string };
export function createApp(dependencies: { auth?: LearntifyAuth; drafts?: DraftRepository } = {}) {
  const app = new Hono<{ Variables: Variables }>();

  app.use('*', async (c, next) => {
    c.set('requestId', crypto.randomUUID());
    c.header('X-Content-Type-Options', 'nosniff');
    c.header('Cache-Control', 'no-store');
    await next();
    c.header('X-Request-Id', c.get('requestId'));
  });

  app.use(
    '/api/v1/lessons/:id/predictions',
    bodyLimit({
      maxSize: 2048,
      onError: (c) =>
        c.json(
          {
            error: { code: 'PAYLOAD_TOO_LARGE', message: 'Prediction is too large.' },
            meta: { requestId: c.get('requestId') },
          },
          413,
        ),
    }),
  );

  app.get('/api/v1/health', (c) =>
    c.json({ data: { status: 'ok' }, meta: { requestId: c.get('requestId') } }),
  );
  app.get('/api/v1/capabilities', (c) =>
    c.json({
      data: {
        lessons: true,
        predictionPractice: true,
        accounts: Boolean(dependencies.auth),
        cloudDrafts: Boolean(dependencies.auth && dependencies.drafts),
        codeExecution: false,
        community: false,
      },
      meta: { requestId: c.get('requestId') },
    }),
  );

  app.get('/api/v1/lessons', (c) => {
    const locale = localeSchema.safeParse(c.req.query('locale') ?? 'en');
    if (!locale.success)
      return c.json(
        {
          error: { code: 'INVALID_LOCALE', message: 'Use en or es.' },
          meta: { requestId: c.get('requestId') },
        },
        400,
      );
    return c.json(
      lessonListResponseSchema.parse({
        data: listLessons(locale.data),
        meta: { requestId: c.get('requestId') },
      }),
    );
  });

  app.get('/api/v1/lessons/:id', (c) => {
    const locale = localeSchema.safeParse(c.req.query('locale') ?? 'en');
    if (!locale.success)
      return c.json(
        {
          error: { code: 'INVALID_LOCALE', message: 'Use en or es.' },
          meta: { requestId: c.get('requestId') },
        },
        400,
      );
    const lesson = getLesson(c.req.param('id'), locale.data);
    if (!lesson)
      return c.json(
        {
          error: { code: 'NOT_FOUND', message: 'Lesson not found.' },
          meta: { requestId: c.get('requestId') },
        },
        404,
      );
    return c.json(
      lessonResponseSchema.parse({ data: lesson, meta: { requestId: c.get('requestId') } }),
    );
  });

  // Stateless feedback only: no attempt, personal data, or mastery is persisted here.
  app.post('/api/v1/lessons/:id/predictions', async (c) => {
    const raw = await c.req.text();
    if (new TextEncoder().encode(raw).length > 2048)
      return c.json(
        {
          error: { code: 'PAYLOAD_TOO_LARGE', message: 'Prediction is too large.' },
          meta: { requestId: c.get('requestId') },
        },
        413,
      );
    let input: unknown;
    try {
      input = JSON.parse(raw);
    } catch {
      return c.json(
        {
          error: { code: 'INVALID_JSON', message: 'Expected JSON.' },
          meta: { requestId: c.get('requestId') },
        },
        400,
      );
    }
    const parsed = predictionSchema.safeParse(input);
    if (!parsed.success)
      return c.json(
        {
          error: { code: 'INVALID_INPUT', message: 'Invalid prediction.' },
          meta: { requestId: c.get('requestId') },
        },
        422,
      );
    const result = checkPrediction(
      c.req.param('id'),
      parsed.data.locale,
      parsed.data.lessonVersion,
      parsed.data.choiceId,
    );
    if (result.kind !== 'feedback') {
      const status = result.kind === 'missing' ? 404 : result.kind === 'stale' ? 409 : 422;
      return c.json(
        {
          error: {
            code: result.kind === 'stale' ? 'VERSION_CONFLICT' : 'INVALID_PREDICTION',
            message: 'Reload the lesson and choose an available answer.',
          },
          meta: { requestId: c.get('requestId') },
        },
        status,
      );
    }
    return c.json(
      predictionResponseSchema.parse({
        data: result.feedback,
        meta: { requestId: c.get('requestId') },
      }),
    );
  });

  if (dependencies.auth) {
    app.route('/', createAccountRoutes(dependencies.auth));
    if (dependencies.drafts)
      app.route('/', createDraftRoutes(dependencies.auth, dependencies.drafts));
  }

  app.notFound((c) =>
    c.json(
      {
        error: { code: 'NOT_FOUND', message: 'Route not found.' },
        meta: { requestId: c.get('requestId') },
      },
      404,
    ),
  );
  app.onError((_error, c) =>
    c.json(
      {
        error: { code: 'INTERNAL_ERROR', message: 'The request could not be completed.' },
        meta: { requestId: c.get('requestId') },
      },
      500,
    ),
  );
  return app;
}
// Production stays closed until identity provisioning, age consent, quotas and migrations are ready.
export const app = createApp();
export default app;
