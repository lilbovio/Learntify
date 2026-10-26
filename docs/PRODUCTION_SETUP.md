# Production setup readiness

No external setup is required to run or contribute to Learntify locally. This is a preparation checklist, not an instruction to deploy the current application publicly.

## Implemented configuration

The production entry point is `services/server/src/production.ts`. The default Wrangler configuration sets `ACCOUNT_MODE=disabled`, has no remote database binding, and disables workers.dev and logs. Public lesson endpoints work without account credentials. The local accounts entry point remains separate.

An explicitly configured `ACCOUNT_MODE=existing-accounts` composes D1, Better Auth, preferences, drafts and the budgeted Resend adapter. It requires an exact HTTPS `APP_ORIGIN`, a `DB` binding, a strong `AUTH_SECRET`, `RESEND_API_KEY` and a plain verified `EMAIL_FROM` address. Invalid configuration or an unexpected request origin returns a generic 503 without revealing secrets. Validation checks configuration shape, not domain ownership, key validity, migrations or provider capacity.

Existing-account mode also requires `PREVIEW_EMAILS`: a comma-separated list of 1–20 exact email addresses, stored as a secret because it contains personal information. Addresses are trimmed and compared case-insensitively; domains and wildcard admissions are unsupported. An unlisted sign-in request receives the same acknowledgement but creates no token and sends no mail. Admission is checked again before session creation and on every private API request. Removing an address blocks its existing sessions from private APIs after the updated configuration is active; it does not delete account data or physically revoke stored sessions. Re-adding it can restore access until those sessions expire. Sign-out remains available.

Public signup and production account deletion remain disabled. This is a small preview admission policy, not general signup or complete abuse protection. Public lessons remain available without admission. Local account data and secrets must not be copied into production.

## Prepare an initial account

Use Node 24 to generate a reviewable SQL file with a synthetic address first:

```sh
node services/server/scripts/provision-preview.ts learner@example.test "Preview Learner"
```

The tool writes `.learntify-private/preview-user.sql` (gitignored) and refuses to overwrite an existing file. It does not connect to any database. Review the file, then apply it only to the intended migrated preview database when that environment is explicitly being configured. The operation preserves any existing account with the same email, creates no session, and leaves email unverified. Normal email-link sign-in verifies ownership. Add the same address to `PREVIEW_EMAILS` to grant preview access; provisioning alone grants none. Protect and remove the generated file after use because it contains personal information. No provisioning file is generated or applied automatically by CI.

## When setup becomes useful

After remaining signup safeguards, quotas and recovery procedures are implemented and tested, configure:

1. Cloudflare project and a separate preview D1 database. Apply the versioned migrations in `services/server/migrations`, including `0004_email_budget.sql`. Do not apply local mailbox SQL remotely.
2. The static client and API route under the same origin, with `/api/*` routed to the Worker and localized client routes falling back to the SPA. Separate client/server code does not require separate browser origins. Cross-origin credentialed requests are not supported by the current client.
3. A domain you control and a verified Resend sender. Set `EMAIL_FROM` only after verification. The registrar purchase is separate from hosting.
4. A newly generated random auth secret and a dedicated Resend key through the provider's secret storage. Never put credentials in git, screenshots, issue reports or chat. `AUTH_SECRET` must contain at least 32 characters; length validation does not establish randomness.
5. Google/GitHub OAuth registrations for the selected HTTPS origin. Optional GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET and GITHUB_CLIENT_ID/GITHUB_CLIENT_SECRET pairs are supported by the current configuration; verify their exact callbacks before preview use. Turnstile remains deferred.

Before any public release, validate deployed CPU usage, admission and write limits, mail limits, backup restoration and deletion replay, and the static lesson fallback during API exhaustion. Production deletion stays disabled until its full retention workflow is ready. No deployed resources or live email were created by the code changes.

See [external services](EXTERNAL_SERVICES.md) for the service inventory and [local accounts](LOCAL_ACCOUNTS.md) to test now without external accounts.

See [alpha acceptance and restricted-preview handoff](ALPHA_ACCEPTANCE.md) for the current rehearsal and pending environment checks.
