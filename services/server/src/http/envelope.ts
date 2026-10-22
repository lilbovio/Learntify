import type { Context } from 'hono';

export function meta(context: Context) {
  return { requestId: (context.get('requestId') as string | undefined) ?? crypto.randomUUID() };
}

export function errorBody(context: Context, code: string, message: string) {
  return { error: { code, message }, meta: meta(context) };
}
