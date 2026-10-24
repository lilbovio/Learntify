import { readAccountConfiguration, type ProductionBindings } from './configuration';
import { serveAccounts } from './production';

/** Local execution with real providers. Never deploy this entry point. */
export default {
  async fetch(request: Request, env: ProductionBindings & { LOCAL_EXTERNAL_SERVICES?: string }) {
    const url = new URL(request.url);
    if (
      env.LOCAL_EXTERNAL_SERVICES !== 'true' ||
      url.protocol !== 'http:' ||
      url.hostname !== '127.0.0.1'
    )
      return new Response('Local external-services testing only.', { status: 403 });
    const configuration = readAccountConfiguration(env, 'local-external');
    if (
      configuration.kind !== 'ready' ||
      configuration.from !== 'onboarding@resend.dev' ||
      configuration.previewEmails.size !== 1
    )
      return new Response('Complete the local external-services configuration.', {
        status: 503,
        headers: { 'Cache-Control': 'no-store' },
      });
    return serveAccounts(request, configuration);
  },
};
