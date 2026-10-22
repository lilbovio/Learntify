import { createApp } from './index';
import { createAuth } from './auth/create-auth';
import { readAccountConfiguration, type ProductionBindings } from './configuration';
import { createResendDelivery } from '@learntify/email';
import { D1DraftRepository, type DraftDatabase } from '@learntify/draft-storage';
import { D1PreferencesRepository, type PreferencesDatabase } from '@learntify/preferences-storage';

const publicApp = createApp();
const unavailable = () =>
  new Response('Account configuration is unavailable.', {
    status: 503,
    headers: { 'Cache-Control': 'no-store' },
  });

/** Same-origin /api route; signup and production deletion remain closed pending launch safeguards. */
export default {
  async fetch(request: Request, env: ProductionBindings) {
    const configuration = readAccountConfiguration(env);
    if (configuration.kind === 'disabled') return publicApp.fetch(request);
    if (configuration.kind === 'invalid') return unavailable();
    if (new URL(request.url).origin !== configuration.origin) return unavailable();
    const auth = createAuth({
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
    return createApp({
      auth,
      drafts: new D1DraftRepository(configuration.database as unknown as DraftDatabase),
      preferences: new D1PreferencesRepository(
        configuration.database as unknown as PreferencesDatabase,
      ),
    }).fetch(request);
  },
};
