# Production setup readiness

No external setup is required to run or contribute to Learntify locally. This is a preparation checklist, not an instruction to deploy the current application publicly.

## Implemented configuration

The production entry point is `services/server/src/production.ts`. The default Wrangler configuration sets `ACCOUNT_MODE=disabled`, has no remote database binding, and disables workers.dev and logs. Public lesson endpoints work without account credentials. The local accounts entry point remains separate.

An explicitly configured `ACCOUNT_MODE=existing-accounts` composes D1, Better Auth, preferences, drafts and the budgeted Resend adapter. It requires an exact HTTPS `APP_ORIGIN`, a `DB` binding, a strong `AUTH_SECRET`, `RESEND_API_KEY` and a plain verified `EMAIL_FROM` address. Invalid configuration or an unexpected request origin returns a generic 503 without revealing secrets. Validation checks configuration shape, not domain ownership, key validity, migrations or provider capacity.

Public signup and production account deletion remain disabled. Existing-account mode is a development stage, not an access-control perimeter: a restricted preview still needs an explicit admission/access policy. Do not expose it as public production. No supported initial-user provisioning workflow exists yet. Local account data and secrets must not be copied into production.

## When setup becomes useful

After preview admission, signup safeguards, quotas and recovery procedures are implemented and tested, configure:

1. Cloudflare project and a separate preview D1 database. Apply the versioned migrations in `services/server/migrations`, including `0004_email_budget.sql`. Do not apply local mailbox SQL remotely.
2. The static client and API route under the same origin, with `/api/*` routed to the Worker and localized client routes falling back to the SPA. Separate client/server code does not require separate browser origins. Cross-origin credentialed requests are not supported by the current client.
3. A domain you control and a verified Resend sender. Set `EMAIL_FROM` only after verification. The registrar purchase is separate from hosting.
4. A newly generated random auth secret and a dedicated Resend key through the provider's secret storage. Never put credentials in git, screenshots, issue reports or chat. `AUTH_SECRET` must contain at least 32 characters; length validation does not establish randomness.
5. Google/GitHub OAuth registrations and Turnstile only after their integrations and exact callbacks are implemented. These are not wired into this configuration yet.

Before any public release, validate deployed CPU usage, admission and write limits, mail limits, backup restoration and deletion replay, and the static lesson fallback during API exhaustion. Production deletion stays disabled until its full retention workflow is ready. No deployed resources or live email were created by the code changes.

See [external services](EXTERNAL_SERVICES.md) for the service inventory and [local accounts](LOCAL_ACCOUNTS.md) to test now without external accounts.
