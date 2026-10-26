import { D1StudyPlanRepository, type StudyPlanDatabase } from '@learntify/study-plan-storage';
import type { D1Database } from '@cloudflare/workers-types';
import { createAuth } from './auth/create-auth';
import { createApp } from './index';
import { D1PracticeRepository, type PracticeDatabase } from '@learntify/practice-storage';
import { D1DraftRepository, type DraftDatabase } from '@learntify/draft-storage';
import { D1PreferencesRepository, type PreferencesDatabase } from '@learntify/preferences-storage';

interface LocalBindings {
  DB: D1Database;
  LOCAL_ACCOUNTS: string;
  APP_ORIGIN: string;
}

/** Separate local-only entry point. Production's entry point never imports this file. */
export default {
  async fetch(request: Request, env: LocalBindings) {
    const hostname = new URL(request.url).hostname;
    if (
      env.LOCAL_ACCOUNTS !== 'true' ||
      !['127.0.0.1', 'localhost'].includes(hostname) ||
      env.APP_ORIGIN !== 'http://localhost:5174'
    )
      return new Response('Local account development only.', { status: 403 });
    const auth = createAuth({
      database: env.DB,
      origin: env.APP_ORIGIN,
      secret: 'local-development-only-never-use-this-secret-in-production',
      allowSignUp: true,
      allowDeletion: true,
      sendSignInLink: async ({ email, url }) => {
        await env.DB.batch([
          env.DB.prepare('DELETE FROM dev_mailbox WHERE created_at < ?').bind(Date.now() - 600000),
          env.DB.prepare(
            'INSERT INTO dev_mailbox (email, url, created_at) VALUES (?, ?, ?) ON CONFLICT(email) DO UPDATE SET url = excluded.url, created_at = excluded.created_at',
          ).bind(email, url, Date.now()),
        ]);
      },
    });
    await auth.$context;
    return createApp({
      auth,
      studyPlans: new D1StudyPlanRepository(env.DB as unknown as StudyPlanDatabase),
      practice: new D1PracticeRepository(env.DB as unknown as PracticeDatabase),
      preferences: new D1PreferencesRepository(env.DB as unknown as PreferencesDatabase),
      drafts: new D1DraftRepository(env.DB as unknown as DraftDatabase),
    }).fetch(request);
  },
};
