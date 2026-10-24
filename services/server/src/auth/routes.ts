import { Hono } from 'hono';
import { bodyLimit } from 'hono/body-limit';
import { sensitiveSessionAgeSeconds, type LearntifyAuth } from './create-auth';
import { errorBody, meta } from '../http/envelope';
import { signInRequestSchema, deleteAccountSchema } from '@learntify/api-contracts';
import type { AccountAdmission } from './preview-admission';

/** Mount only after deployment configuration and signup safeguards are complete. */
export function createAccountRoutes(auth: LearntifyAuth, admission?: AccountAdmission) {
  const routes = new Hono();
  routes.use('/api/auth/*', async (c, next) => {
    c.header('Cache-Control', 'no-store');
    if (c.req.method === 'POST' && c.req.header('Origin') !== auth.options.baseURL)
      return c.json(errorBody(c, 'INVALID_ORIGIN', 'Use the application origin.'), 403);
    await next();
  });
  routes.use(
    '/api/auth/*',
    bodyLimit({
      maxSize: 4096,
      onError: (c) => c.json(errorBody(c, 'PAYLOAD_TOO_LARGE', 'Request is too large.'), 413),
    }),
  );
  routes.post('/api/auth/sign-in/magic-link', async (c) => {
    let input: unknown;
    try {
      input = await c.req.raw.clone().json();
    } catch {
      return c.json(errorBody(c, 'INVALID_JSON', 'Expected JSON.'), 400);
    }
    const parsed = signInRequestSchema.safeParse(input);
    if (!parsed.success)
      return c.json(
        errorBody(c, 'INVALID_INPUT', 'Enter a valid email and confirm you are 18 or older.'),
        422,
      );
    // Match the provider's acknowledgement without creating tokens or consuming mail budget.
    if (admission && !admission(parsed.data.email)) return c.json({ status: true });
    return auth.handler(c.req.raw);
  });
  // Expose only the account operations implemented by the client.
  const passkeyRegistrationPaths = new Set([
    '/api/auth/passkey/generate-register-options',
    '/api/auth/passkey/verify-registration',
    '/api/auth/passkey/delete-passkey',
  ]);
  routes.use('/api/auth/passkey/*', async (c, next) => {
    if (
      passkeyRegistrationPaths.has(c.req.path) ||
      c.req.path === '/api/auth/passkey/list-user-passkeys'
    ) {
      const session = await auth.api.getSession({ headers: c.req.raw.headers });
      if (!session || !session.user.emailVerified || (admission && !admission(session.user.email)))
        return c.json(errorBody(c, 'UNAUTHENTICATED', 'Sign in to continue.'), 401);
      if (
        passkeyRegistrationPaths.has(c.req.path) &&
        Date.now() - new Date(session.session.createdAt).getTime() >=
          sensitiveSessionAgeSeconds * 1000
      )
        return c.json(
          errorBody(c, 'REAUTHENTICATION_REQUIRED', 'Sign in again to manage passkeys.'),
          409,
        );
    }
    await next();
  });
  for (const path of [
    'generate-register-options',
    'generate-authenticate-options',
    'list-user-passkeys',
  ])
    routes.get('/api/auth/passkey/' + path, (c) => auth.handler(c.req.raw));
  for (const path of ['verify-registration', 'verify-authentication', 'delete-passkey'])
    routes.post('/api/auth/passkey/' + path, (c) => auth.handler(c.req.raw));
  routes.post('/api/auth/sign-out', (c) => auth.handler(c.req.raw));
  routes.post('/api/auth/revoke-other-sessions', async (c) => {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if (!session || (admission && !admission(session.user.email)))
      return c.json(errorBody(c, 'UNAUTHENTICATED', 'Sign in to continue.'), 401);
    // No client-supplied user IDs or tokens: the provider derives ownership from this session.
    const headers = new Headers(c.req.raw.headers);
    headers.delete('content-length');
    headers.set('Content-Type', 'application/json');
    return auth.handler(new Request(c.req.url, { method: 'POST', headers, body: '{}' }));
  });
  routes.post('/api/auth/delete-user', async (c) => {
    if (!auth.options.user?.deleteUser?.enabled)
      return c.json(errorBody(c, 'NOT_FOUND', 'Account deletion is unavailable.'), 404);
    let input: unknown;
    try {
      input = await c.req.json();
    } catch {
      return c.json(errorBody(c, 'INVALID_JSON', 'Expected JSON.'), 400);
    }
    if (!deleteAccountSchema.safeParse(input).success)
      return c.json(errorBody(c, 'INVALID_INPUT', 'Confirm account deletion.'), 422);
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if (!session) return c.json(errorBody(c, 'UNAUTHENTICATED', 'Sign in to continue.'), 401);
    if (
      Date.now() - new Date(session.session.createdAt).getTime() >=
      sensitiveSessionAgeSeconds * 1000
    )
      return c.json(
        errorBody(c, 'REAUTHENTICATION_REQUIRED', 'Sign in again before deleting your account.'),
        409,
      );
    // Provider handles session revocation and cookies; callers cannot supply passwords or tokens.
    const headers = new Headers(c.req.raw.headers);
    headers.delete('content-length');
    return auth.handler(new Request(c.req.url, { method: 'POST', headers, body: '{}' }));
  });
  routes.get('/api/auth/magic-link/verify', (c) => {
    c.header('Referrer-Policy', 'no-referrer');
    return auth.handler(c.req.raw);
  });
  routes.get('/api/v1/me', async (c) => {
    c.header('Cache-Control', 'no-store');
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if (!session) return c.json(errorBody(c, 'UNAUTHENTICATED', 'Sign in to continue.'), 401);
    // Never return provider tokens, session tokens or the full auth database record.
    return c.json({ data: { id: session.user.id, name: session.user.name }, meta: meta(c) });
  });
  return routes;
}
