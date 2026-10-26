import { Hono } from 'hono';
import { bodyLimit } from 'hono/body-limit';
import {
  createStudyPlanSchema,
  replaceStudyPlanSchema,
  studyPlanIdSchema,
  studyPlanQuerySchema,
} from '@learntify/api-contracts';
import { StudyPlanService } from '@learntify/study-plans';
import type { LearntifyAuth } from '../auth/create-auth';
import { errorBody, meta } from '../http/envelope';

export class StudyPlanController {
  constructor(
    private readonly auth: LearntifyAuth,
    private readonly service: StudyPlanService,
  ) {}
  routes() {
    const routes = new Hono<{ Variables: { ownerId: string } }>();
    routes.use('*', async (c, next) => {
      const session = await this.auth.api.getSession({ headers: c.req.raw.headers });
      if (!session) return c.json(errorBody(c, 'UNAUTHENTICATED', 'Sign in to continue.'), 401);
      if (
        !['GET', 'HEAD'].includes(c.req.method) &&
        c.req.header('Origin') !== this.auth.options.baseURL
      )
        return c.json(errorBody(c, 'INVALID_ORIGIN', 'Use the application origin.'), 403);
      c.set('ownerId', session.user.id);
      await next();
    });
    routes.use(
      '*',
      bodyLimit({
        maxSize: 16384,
        onError: (c) => c.json(errorBody(c, 'PAYLOAD_TOO_LARGE', 'Study plan is too large.'), 413),
      }),
    );
    routes.get('/', async (c) => {
      const query = studyPlanQuerySchema.safeParse(c.req.query());
      if (!query.success || Object.values(c.req.queries()).some((values) => values.length > 1))
        return c.json(errorBody(c, 'INVALID_INPUT', 'Invalid pagination or status.'), 400);
      return c.json({
        data: await this.service.list(c.get('ownerId'), query.data),
        meta: { ...meta(c), page: query.data.page, limit: query.data.limit },
      });
    });
    routes.post('/', async (c) => {
      const input = createStudyPlanSchema.safeParse(await c.req.json().catch(() => null));
      if (!input.success) return c.json(errorBody(c, 'INVALID_INPUT', 'Invalid study plan.'), 400);
      const plan = await this.service.create(c.get('ownerId'), input.data);
      if (!plan)
        return c.json(errorBody(c, 'SLUG_CONFLICT', 'A plan with this slug already exists.'), 409);
      c.header('Location', '/api/v1/study-plans/' + plan.id);
      return c.json({ data: plan, meta: meta(c) }, 201);
    });
    routes.use('/:id', async (c, next) => {
      if (!studyPlanIdSchema.safeParse(c.req.param('id')).success)
        return c.json(errorBody(c, 'INVALID_INPUT', 'Expected a UUID.'), 400);
      await next();
    });
    routes.get('/:id', async (c) => {
      const plan = await this.service.get(c.get('ownerId'), c.req.param('id'));
      return plan
        ? c.json({ data: plan, meta: meta(c) })
        : c.json(errorBody(c, 'NOT_FOUND', 'Study plan not found.'), 404);
    });
    routes.put('/:id', async (c) => {
      const input = replaceStudyPlanSchema.safeParse(await c.req.json().catch(() => null));
      if (!input.success)
        return c.json(errorBody(c, 'INVALID_INPUT', 'Provide all mutable fields.'), 400);
      const plan = await this.service.replace(c.get('ownerId'), c.req.param('id'), input.data);
      return plan
        ? c.json({ data: plan, meta: meta(c) })
        : c.json(errorBody(c, 'NOT_FOUND', 'Study plan not found.'), 404);
    });
    routes.delete('/:id', async (c) => {
      const removed = await this.service.delete(c.get('ownerId'), c.req.param('id'));
      return removed
        ? c.body(null, 204)
        : c.json(errorBody(c, 'NOT_FOUND', 'Study plan not found.'), 404);
    });
    return routes;
  }
}
