import type { D1Database } from '@cloudflare/workers-types';
import { parsePreviewEmails } from './auth/preview-admission';

export interface ProductionBindings {
  ACCOUNT_MODE?: string;
  APP_ORIGIN?: string;
  AUTH_SECRET?: string;
  RESEND_API_KEY?: string;
  EMAIL_FROM?: string;
  PREVIEW_EMAILS?: string;
  DB?: D1Database;
}

export type AccountConfiguration =
  | { kind: 'disabled' }
  | { kind: 'invalid'; fields: string[] }
  | {
      kind: 'ready';
      database: D1Database;
      origin: string;
      secret: string;
      apiKey: string;
      from: string;
      previewEmails: ReadonlySet<string>;
    };

/** Reports field names only. Never include values in diagnostics or HTTP responses. */
export function readAccountConfiguration(env: ProductionBindings): AccountConfiguration {
  if (env.ACCOUNT_MODE === undefined || env.ACCOUNT_MODE === 'disabled')
    return { kind: 'disabled' };
  if (env.ACCOUNT_MODE !== 'existing-accounts')
    return { kind: 'invalid', fields: ['ACCOUNT_MODE'] };
  const fields: string[] = [];
  const previewEmails = parsePreviewEmails(env.PREVIEW_EMAILS);
  if (!previewEmails) fields.push('PREVIEW_EMAILS');
  try {
    const origin = new URL(env.APP_ORIGIN ?? '');
    if (
      origin.protocol !== 'https:' ||
      origin.origin !== env.APP_ORIGIN ||
      !origin.hostname.includes('.') ||
      origin.hostname === '127.0.0.1'
    )
      fields.push('APP_ORIGIN');
  } catch {
    fields.push('APP_ORIGIN');
  }
  if (!env.DB || typeof env.DB.prepare !== 'function' || typeof env.DB.batch !== 'function')
    fields.push('DB');
  if (
    !env.AUTH_SECRET ||
    env.AUTH_SECRET.length < 32 ||
    /local-development|replace|example|change.?me/i.test(env.AUTH_SECRET)
  )
    fields.push('AUTH_SECRET');
  if (!env.RESEND_API_KEY || !/^re_[A-Za-z0-9_-]{16,}$/.test(env.RESEND_API_KEY))
    fields.push('RESEND_API_KEY');
  // A plain verified sender address keeps header/display-name parsing out of configuration.
  if (!env.EMAIL_FROM || !/^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+$/.test(env.EMAIL_FROM))
    fields.push('EMAIL_FROM');
  if (fields.length) return { kind: 'invalid', fields };
  return {
    kind: 'ready',
    database: env.DB!,
    origin: env.APP_ORIGIN!,
    secret: env.AUTH_SECRET!,
    apiKey: env.RESEND_API_KEY!,
    from: env.EMAIL_FROM!,
    previewEmails: previewEmails!,
  };
}
