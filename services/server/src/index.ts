import { StudyPlanService, type StudyPlanRepository } from '@learntify/study-plans';
import { StudyPlanController } from './study-plans/controller';
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
import type {
  DraftRepository,
  PreferencesRepository,
  PracticeRepository,
} from '@learntify/learning';
import { createPracticeRoutes } from './learning/practice-routes';
import type { LearntifyAuth } from './auth/create-auth';
import { createAccountRoutes } from './auth/routes';
import { createDraftRoutes } from './learning/draft-routes';
import { createPreferencesRoutes } from './learning/preferences-routes';
import type { AccountAdmission } from './auth/preview-admission';
import type { WritePolicy } from './operations/write-budget';

type Variables = { requestId: string };
export function createApp(
  dependencies: {
    auth?: LearntifyAuth;
    drafts?: DraftRepository;
    preferences?: PreferencesRepository;
    practice?: PracticeRepository;
    studyPlans?: StudyPlanRepository;
    admission?: AccountAdmission;
    writes?: WritePolicy;
  } = {},
) {
  const app = new Hono<{ Variables: Variables }>();

  app.use('*', async (c, next) => {
    c.set('requestId', crypto.randomUUID());
    c.header('X-Content-Type-Options', 'nosniff');
    c.header('Cache-Control', 'no-store');
    await next();
    c.header('X-Request-Id', c.get('requestId'));
  });

  if (dependencies.auth && dependencies.admission) {
    const { auth, admission } = dependencies;
    app.use('/api/v1/*', async (c, next) => {
      const path = c.req.path;
      const publicRead =
        c.req.method === 'GET' &&
        (['/api/v1/health', '/api/v1/capabilities', '/api/v1/lessons'].includes(path) ||
          /^\/api\/v1\/lessons\/[^/]+$/.test(path));
      const publicPrediction =
        c.req.method === 'POST' && /^\/api\/v1\/lessons\/[^/]+\/predictions$/.test(path);
      if (!publicRead && !publicPrediction) {
        const session = await auth.api.getSession({ headers: c.req.raw.headers });
        if (!session || !admission(session.user.email))
          return c.json(
            {
              error: { code: 'UNAUTHENTICATED', message: 'Sign in to continue.' },
              meta: { requestId: c.get('requestId') },
            },
            401,
          );
      }
      await next();
    });
  }

  if (dependencies.auth && dependencies.writes) {
    const { auth, writes } = dependencies;
    app.use('/api/v1/*', async (c, next) => {
      const privateMutation =
        ['POST', 'PUT', 'PATCH', 'DELETE'].includes(c.req.method) &&
        /^\/api\/v1\/(drafts|preferences|practice|study-plans)(\/|$)/.test(c.req.path);
      if (!privateMutation) return next();
      const session = await auth.api.getSession({ headers: c.req.raw.headers });
      if (!session)
        return c.json(
          {
            error: { code: 'UNAUTHENTICATED', message: 'Sign in to continue.' },
            meta: { requestId: c.get('requestId') },
          },
          401,
        );
      if (c.req.header('Origin') !== auth.options.baseURL)
        return c.json(
          {
            error: { code: 'INVALID_ORIGIN', message: 'Use the application origin.' },
            meta: { requestId: c.get('requestId') },
          },
          403,
        );
      if (writes.paused) {
        c.header('Retry-After', '300');
        return c.json(
          {
            error: {
              code: 'WRITES_PAUSED',
              message: 'Saving is temporarily paused. Keep your work and try later.',
            },
            meta: { requestId: c.get('requestId') },
          },
          503,
        );
      }
      if (!(await writes.reserve(session.user.id))) {
        const now = new Date();
        const reset = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1);
        c.header('Retry-After', String(Math.ceil((reset - now.getTime()) / 1000)));
        return c.json(
          {
            error: {
              code: 'WRITE_LIMIT',
              message: 'Daily save capacity reached. Keep your work and try tomorrow.',
            },
            meta: { requestId: c.get('requestId') },
          },
          429,
        );
      }
      await next();
    });
  }

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
        accountDeletion: dependencies.auth?.options.user?.deleteUser?.enabled === true,
        preferences: Boolean(dependencies.auth && dependencies.preferences),
        cloudDrafts: Boolean(dependencies.auth && dependencies.drafts),
        codeExecution: true,
        practice: Boolean(dependencies.auth && dependencies.practice),
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
    if (dependencies.studyPlans)
      app.route(
        '/api/v1/study-plans',
        new StudyPlanController(
          dependencies.auth,
          new StudyPlanService(dependencies.studyPlans),
        ).routes(),
      );
    app.route('/', createAccountRoutes(dependencies.auth, dependencies.admission));
    if (dependencies.practice)
      app.route('/', createPracticeRoutes(dependencies.auth, dependencies.practice));
    if (dependencies.preferences)
      app.route('/', createPreferencesRoutes(dependencies.auth, dependencies.preferences));
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
