import { D1StudyPlanRepository, type StudyPlanDatabase } from '@learntify/study-plan-storage';
import { createApp } from './index';
import { D1PracticeRepository, type PracticeDatabase } from '@learntify/practice-storage';
import { createAuth } from './auth/create-auth';
import {
  readAccountConfiguration,
  type ProductionBindings,
  type AccountConfiguration,
} from './configuration';
import { createResendDelivery } from '@learntify/email';
import { D1DraftRepository, type DraftDatabase } from '@learntify/draft-storage';
import { D1PreferencesRepository, type PreferencesDatabase } from '@learntify/preferences-storage';
import { previewAdmission } from './auth/preview-admission';

const publicApp = createApp();
const unavailable = () =>
  new Response('Account configuration is unavailable.', {
    status: 503,
    headers: { 'Cache-Control': 'no-store' },
  });

export async function serveAccounts(
  request: Request,
  configuration: Extract<AccountConfiguration, { kind: 'ready' }>,
) {
  const admission = previewAdmission(configuration.previewEmails);
  const auth = createAuth({
    admission,
    socialProviders: configuration.socialProviders,
    database: configuration.database,
    origin: configuration.origin,
    secret: configuration.secret,
    sendSignInLink: createResendDelivery({
      database: configuration.database,
      origin: configuration.origin,
      apiKey: configuration.apiKey,
      from: configuration.from,
    }),
  });
  try {
    await auth.$context;
  } catch {
    return unavailable();
  }
  return createApp({
    auth,
    studyPlans: new D1StudyPlanRepository(configuration.database as unknown as StudyPlanDatabase),
    practice: new D1PracticeRepository(configuration.database as unknown as PracticeDatabase),
    admission,
    drafts: new D1DraftRepository(configuration.database as unknown as DraftDatabase),
    preferences: new D1PreferencesRepository(
      configuration.database as unknown as PreferencesDatabase,
    ),
  }).fetch(request);
}

/** Same-origin /api route; signup and production deletion remain closed pending launch safeguards. */
export default {
  async fetch(request: Request, env: ProductionBindings) {
    const configuration = readAccountConfiguration(env);
    if (configuration.kind === 'disabled') return publicApp.fetch(request);
    if (configuration.kind === 'invalid') return unavailable();
    if (new URL(request.url).origin !== configuration.origin) return unavailable();
    return serveAccounts(request, configuration);
  },
};
