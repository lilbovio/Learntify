# Local testing with real services

This profile runs the client and Worker on your machine, with a separate remote test D1 database and real Resend delivery. It is not a production deployment or proof of production readiness. No domain purchase is needed. Local links work on the machine running the app; opening one on a phone does not reach your computer.

## Account setup

1. Create and verify a Cloudflare account. Run `pnpm exec wrangler login` and authorize in the browser. If authorization times out, run it again after account creation is finished. Keep the Free plan.
2. Create and verify a Resend account. Create a dedicated key named `Learntify local testing` with Sending access. The default sender `onboarding@resend.dev` can deliver only to the email associated with that Resend account until you verify a domain. [Resend restriction](https://resend.com/docs/knowledge-base/403-error-resend-dev-domain).
3. Store `AUTH_SECRET` (a newly generated random value), `RESEND_API_KEY`, and `PREVIEW_EMAILS` in `services/server/external/.dev.vars`. The latter must contain only your Resend account email. The file is gitignored. Never print its contents in logs or paste it into chat. Keep the existing offline profiles free of live credentials.

## Dedicated test database

After login, inspect existing D1 databases before creating one named `learntify-external-test`. Use a separate test database, never an existing production database. Copy `services/server/external/wrangler.example.jsonc` to `services/server/external/wrangler.jsonc` and replace its placeholder ID with the created database ID. The generated configuration is gitignored.

The `remote: true` D1 binding connects local Worker execution to Cloudflare. Do not add `--local` to the external profile commands. Database mutations here affect the actual remote test database. [Cloudflare remote bindings](https://developers.cloudflare.com/d1/best-practices/local-development/).

From the repository root, after verifying the database ID:

```sh
pnpm exec wrangler d1 migrations apply learntify-external-test --remote --config services/server/external/wrangler.jsonc
```

Apply only the versioned server migrations. Do not copy the development mailbox remotely.

Generate the initial account with the provisioning tool documented in [production setup](PRODUCTION_SETUP.md). Review its output, then apply it to the same test database:

```sh
pnpm exec wrangler d1 execute learntify-external-test --remote --config services/server/external/wrangler.jsonc --file .learntify-private/preview-user.sql
```

The generated account is unverified, has no session, and can sign in only if its address is also in `PREVIEW_EMAILS`. Delete the private SQL file after use. Normal email-link verification proves mailbox access. Public signup and account deletion remain disabled in this profile.

## Run and validate

In separate terminals:

```sh
pnpm dev:external:server
pnpm dev:external:client
```

Open `http://localhost:5175`. The client proxies `/api` to port 8789. Sign in with your single permitted email, open the email link on this machine, set learning preferences, save notes, reload, and sign out. Check that notes and preferences persist in the test database and that signed-out private requests are denied. Test addresses that are not admitted must not cause email delivery. Real requests consume provider quotas; automated tests use disposable local databases and simulated mail delivery instead.

The profile is explicitly restricted to HTTP loopback, one recipient, and the Resend testing sender. Production retains its HTTPS-only configuration. This test does not validate deployed HTTPS cookies, edge CPU limits, backup recovery or public load capacity.

## Other services

- GitHub already hosts the repository and CI. No additional source-hosting service is needed.
- Google and GitHub integration now supports explicit account linking and sign-in. Configure both using [OAuth local testing](OAUTH_LOCAL_TESTING.md); live provider testing remains separate from email verification.
- Turnstile integration is still pending. It is needed before public signup, not to exercise the current single-account preview.
- Durable Objects are deferred with moderated chat. MongoDB, Redis and paid auth services are not needed.
- Domain purchase and verification remain deferred. Do not enable delivery to other recipients using the testing sender.
