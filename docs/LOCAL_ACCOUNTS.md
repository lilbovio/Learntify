# Local account development

No external accounts, domain, OAuth credentials or email provider are needed for this workflow. Use synthetic addresses such as learner@example.test. Production account routes remain disabled.

## Start

Run `pnpm db:local` once and after new migrations. It applies the checked-in auth migration to **local** D1 and creates a separate development mailbox. Re-running it is safe; it does not reset existing data.

In separate terminals, run:

```sh
pnpm dev:accounts:server
pnpm dev:accounts:client
```

Open http://127.0.0.1:5174 and select **Sign in**. Enter a test email and confirm that you are 18 or older. This is self-attestation, not age verification. Request a link, then retrieve it explicitly:

```sh
node tooling/local/mailbox.mjs learner@example.test
```

Open the printed link in the same local browser. Links expire after ten minutes and can be used once. Sign-out revokes the session; lesson access remains public. The interface does not claim that progress is saved to the account yet.

New accounts continue to onboarding; returning accounts continue to Today. Choose a learning direction and optional weekly study time, or skip. Account preferences persist in D1; guest preferences stay in browser storage and are not automatically imported on sign-in. Preferences use last-write-wins saves, unlike revision-protected lesson notes. Today links to the two available lessons and lets you edit preferences.

Signed-in learners can write lesson notes. Notes save after 1.2 seconds of idle typing and are isolated by account and lesson version. Open another authenticated browser context to recover the saved notes. Conflicting edits show the other device's version and require an explicit choice. Network failures retain edits in the current tab with a retry button; they do not persist an offline copy on disk. Avoid closing the tab before saving. Saved notes are separate from assessed learning progress.

## Isolation

From a signed-in page, open **Account settings** to edit learning preferences, sign out, or delete the development account. Deletion requires typing `DELETE` and a session created within 15 minutes; otherwise sign out, sign in again and return to settings. Deletion removes the auth user, all its sessions, lesson notes, retry records and preferences from active local D1. The development mailbox, verification expiry records and guest browser choices are separate. Production backup expiry and deletion replay still need implementation before launch. The implementation uses [Better Auth's deletion and fresh-session checks](https://better-auth.com/docs/concepts/users-accounts), with a stricter request boundary.

The local profile uses `services/server/src/local.ts`, loopback ports 8788/5174, a deliberately development-only secret and a placeholder D1 ID. It rejects requests with non-loopback hostnames and incompatible bindings. Do not deploy this profile or reuse its secret. The production entry point does not import the local entry point or mailbox.

The mailbox stores the latest link per test address in ignored `.wrangler` local state. Expired entries are removed on the next mail request; stopping the server is not deletion. Do not use personal addresses or copy mailbox data into bug reports. The mailbox has no HTTP retrieval endpoint and sends no external email. CLI output is an explicit local developer action; the application does not log login links.

`allowSignUp` defaults to false in the auth factory. Local development explicitly enables it. The email request validates adult confirmation before generating a link, limits redirects to the supported locale destinations, and checks the request origin. Public signup still needs abuse controls and the application onboarding/privacy flow.

## Tests and migrations

`pnpm test:accounts` starts both local servers, applies local migrations and exercises sign-in, session persistence, sign-out, token replay and Spanish error recovery in Chromium. It needs free ports 8788 and 5174 and never connects to a mail provider. These tests are part of GitHub CI.

Auth integration tests now apply the checked-in SQL and verify no schema changes are requested by the pinned Better Auth configuration. Future schema changes require a new migration. The initial generator refuses to overwrite the existing file; do not regenerate an already-applied migration.

## When to configure external services

You can reserve the domain and create provider accounts whenever convenient, but neither is needed to continue coding. First finish production Worker composition, OAuth integration, signup admission/Turnstile, account deletion, and the app's persistent learning schema. Then configure real Cloudflare D1, Google/GitHub callback credentials, Resend domain verification and secrets in a controlled preview. Validate CPU/quota usage and recovery before enabling public accounts. The service inventory is in [EXTERNAL_SERVICES.md](EXTERNAL_SERVICES.md).
