import { betterAuth } from 'better-auth';
import { magicLink } from 'better-auth/plugins';
import type { D1Database } from '@cloudflare/workers-types';

export interface AuthConfiguration {
  database: D1Database;
  secret: string;
  origin: string;
  /** The delivery adapter must enforce the global mail budget before sending. */
  sendSignInLink: (message: { email: string; url: string }) => Promise<void>;
}

/** Created at the composition root, never inside the learning domain. */
export function createAuth(configuration: AuthConfiguration) {
  const origin = new URL(configuration.origin);
  if (
    origin.origin !== configuration.origin ||
    (origin.protocol !== 'https:' &&
      !(origin.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(origin.hostname)))
  ) {
    throw new Error('Authentication requires an HTTPS origin (HTTP is local-only).');
  }
  if (configuration.secret.length < 32) throw new Error('Authentication secret is too short.');
  return betterAuth({
    database: configuration.database,
    secret: configuration.secret,
    baseURL: configuration.origin,
    basePath: '/api/auth',
    trustedOrigins: [configuration.origin],
    emailAndPassword: { enabled: false },
    account: { accountLinking: { enabled: false } },
    session: { expiresIn: 60 * 60 * 24 * 7, updateAge: 60 * 60 * 24 },
    rateLimit: { enabled: true, storage: 'database', window: 60, max: 30 },
    advanced: { useSecureCookies: origin.protocol === 'https:' },
    logger: { disabled: true },
    plugins: [
      magicLink({
        expiresIn: 60 * 10,
        storeToken: 'hashed',
        rateLimit: { window: 60, max: 3 },
        sendMagicLink: ({ email, url }) => configuration.sendSignInLink({ email, url }),
      }),
    ],
  });
}

export type LearntifyAuth = ReturnType<typeof createAuth>;
