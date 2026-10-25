import { Hono } from 'hono';
import { bodyLimit } from 'hono/body-limit';
import { practiceAttemptSchema } from '@learntify/api-contracts';
import { getLesson } from '@learntify/curriculum';
import { reviewDueAt, type PracticeRepository } from '@learntify/learning';
import type { LearntifyAuth } from '../auth/create-auth';
import { errorBody, meta } from '../http/envelope';

export function createPracticeRoutes(auth: LearntifyAuth, repository: PracticeRepository) {
  const routes = new Hono<{ Variables: { ownerId: string } }>();
  routes.use('/api/v1/practice/*', async (c, next) => {
    if (c.req.method !== 'GET' && c.req.header('Origin') !== auth.options.baseURL)
      return c.json(errorBody(c, 'INVALID_ORIGIN', 'Use the application origin.'), 403);
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if (!session) return c.json(errorBody(c, 'UNAUTHENTICATED', 'Sign in to continue.'), 401);
    c.set('ownerId', session.user.id);
    await next();
  });
  routes.use(
    '/api/v1/practice/*',
    bodyLimit({
      maxSize: 100000,
      onError: (c) => c.json(errorBody(c, 'PAYLOAD_TOO_LARGE', 'Attempt is too large.'), 413),
    }),
  );
  routes.post('/api/v1/practice/attempts', async (c) => {
    const input = practiceAttemptSchema.safeParse(await c.req.json().catch(() => null));
    if (!input.success) return c.json(errorBody(c, 'INVALID_INPUT', 'Invalid attempt.'), 422);
    const { expectedAccountId, ...attempt } = input.data;
    if (expectedAccountId !== c.get('ownerId'))
      return c.json(errorBody(c, 'ACCOUNT_CHANGED', 'Reload after changing accounts.'), 409);
    const lesson = getLesson(attempt.lessonId, 'en');
    if (!lesson || lesson.version !== attempt.lessonVersion)
      return c.json(errorBody(c, 'STALE_LESSON', 'Reload the current lesson.'), 409);
    const outcome = await repository.save(c.get('ownerId'), attempt, Date.now());
    if (outcome === 'conflict')
      return c.json(errorBody(c, 'ATTEMPT_CONFLICT', 'Attempt ID already used.'), 409);
    if (outcome === 'limit')
      return c.json(errorBody(c, 'PRACTICE_LIMIT', 'Daily save limit reached.'), 429);
    return c.json({ data: { saved: true }, meta: meta(c) });
  });
  routes.get('/api/v1/practice/progress', async (c) => {
    const now = Date.now();
    const progress = (await repository.progress(c.get('ownerId')))
      .filter((row) => getLesson(row.lessonId, 'en')?.version === row.lessonVersion)
      .map((row) => ({
        ...row,
        reviewDueAt: reviewDueAt(row),
        due: reviewDueAt(row) <= now,
        provenance: 'client-reported-practice' as const,
      }));
    return c.json({ data: progress, meta: meta(c) });
  });
  return routes;
}
