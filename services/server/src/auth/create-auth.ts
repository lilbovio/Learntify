import { betterAuth } from 'better-auth';
import { magicLink } from 'better-auth/plugins';
import { passkey } from '@better-auth/passkey';
import type { D1Database } from '@cloudflare/workers-types';
import type { AccountAdmission } from './preview-admission';

export const sensitiveSessionAgeSeconds = 15 * 60;

export interface AuthConfiguration {
  database: D1Database;
  secret: string;
  origin: string;
  allowSignUp?: boolean;
  allowDeletion?: boolean;
  admission?: AccountAdmission;
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
    session: {
      expiresIn: 60 * 60 * 24 * 7,
      updateAge: 60 * 60 * 24,
      freshAge: sensitiveSessionAgeSeconds,
    },
    user: { deleteUser: { enabled: configuration.allowDeletion === true } },
    rateLimit: { enabled: true, storage: 'database', window: 60, max: 30 },
    advanced: { useSecureCookies: origin.protocol === 'https:' },
    logger: { disabled: true },
    databaseHooks: {
      session: {
        create: {
          before: async (session) => {
            if (!configuration.admission) return;
            const user = await configuration.database
              .prepare('SELECT email FROM user WHERE id = ?')
              .bind(session.userId)
              .first<{ email: string }>();
            if (!user || !configuration.admission(user.email)) return false;
          },
        },
      },
    },
    plugins: [
      passkey({
        rpID: origin.hostname,
        rpName: 'Learntify',
        origin: configuration.origin,
        authenticatorSelection: { residentKey: 'required', userVerification: 'required' },
        registration: {
          requireSession: true,
          afterVerification: ({ verification }) => {
            if (!verification.registrationInfo?.userVerified)
              throw new Error('Device verification required.');
          },
        },
        authentication: {
          afterVerification: ({ verification }) => {
            if (!verification.authenticationInfo.userVerified)
              throw new Error('Device verification required.');
          },
        },
      }),
      magicLink({
        disableSignUp: configuration.allowSignUp !== true,
        expiresIn: 60 * 10,
        storeToken: 'hashed',
        rateLimit: { window: 60, max: 3 },
        sendMagicLink: ({ email, url, metadata }) => {
          if (metadata?.adultConfirmed !== true) throw new Error('Adult confirmation is required.');
          if (configuration.admission && !configuration.admission(email))
            throw new Error('Sign-in unavailable.');
          return configuration.sendSignInLink({ email, url });
        },
      }),
    ],
  });
}

export type LearntifyAuth = ReturnType<typeof createAuth>;
