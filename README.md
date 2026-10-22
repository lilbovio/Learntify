# Learntify

A free, bilingual JavaScript learning platform focused on understanding, practice, and independent reasoning. Software and original project materials are MIT licensed by Juan Pablo Bovio Vallejo. Third-party dependencies retain their licenses.

## Current implementation

This is an early local development increment, not a production-ready learning platform.

- Separate React/Vite client and Hono Cloudflare Worker API.
- Production binding validation and adapter composition, with accounts disabled by default; see [setup readiness](docs/PRODUCTION_SETUP.md).
- Exact-email preview admission, private-API access checks, and a reviewable SQL generator for initial preview accounts.
- Connected English/Spanish welcome, email sign-in/check-email, onboarding, Today and lesson screens, with localized missing-page recovery.
- Learning goal and optional weekly time saved in the guest browser or authenticated D1 profile.
- Bilingual local account settings with recent-sign-in checks, explicit deletion confirmation, and cascading removal of owned notes/preferences.
- Two English/Spanish lessons with a localized learning path and prediction feedback.
- Per-lesson/version answer persistence on the current device; honest storage/failure messages.
- Strict shared API schemas and a small typed HTTP client.
- Account-owned lesson notes in the local profile, with debounced autosave, conflict comparison, and retry deduplication backed by D1.
- D1-backed passwordless authentication integration tests and session-owned draft HTTP routes, injectable but disabled in the default Worker.
- A replaceable Resend delivery adapter with atomic daily/monthly mail reservations; tests never send live emails.
- A separate local account profile with bilingual sign-in UI, adult self-confirmation, a local mailbox, and checked-in auth migrations.
- Type checking, formatting, import-boundary checks, API/domain tests, local D1 tests, and Chromium journeys in CI.

Public accounts and email delivery are **not enabled**: production provider configuration and full signup safeguards remain unfinished. Accounts and synchronized lesson notes can be exercised in the separate local profile. Arbitrary code execution, server-side learning progress, review scheduling, and community features are not implemented. The default Worker keeps accounts and cloud drafts unavailable. The local answer choice is not a mastery record. The sample curriculum still needs educational review.

## Local setup

Use Node.js 24 and pnpm 11.11.0 (the version declared in package.json).

```sh
pnpm install --frozen-lockfile
pnpm dev:server
```

In a second terminal:

```sh
pnpm dev:client
```

Open http://127.0.0.1:5173. Vite proxies `/api` to the separate local Worker on port 8787. No Cloudflare account, production secrets, or database credentials are needed for this increment. Wrangler runs locally and may create logs in its user configuration directory.

For working local sign-in without external email, follow [local account development](docs/LOCAL_ACCOUNTS.md). It uses separate ports and local D1; no provider signup is needed.

## Validation

```sh
pnpm check
pnpm exec playwright install chromium
pnpm test:e2e
pnpm test:accounts
```

`pnpm check` runs formatting, architecture checks, TypeScript, boundary-rule tests, unit/API/D1 tests, the client build, and a Worker **dry-run** build. The D1 suite uses disposable Miniflare databases, not a remote account. Browser tests start and stop local dev servers. Install browser OS dependencies on Linux with `pnpm exec playwright install --with-deps chromium`.

The GitHub Actions workflow runs those same checks for pushes and pull requests with read-only repository permissions. It never deploys or receives production credentials. Check the [Actions runs](https://github.com/lilbovio/Learntify/actions) for results on each commit.

## Structure

- `apps/client`: presentation, local interaction state, and shared interface translations.
- `services/server`: HTTP composition, validation, and Worker entry point.
- `modules/curriculum`: curriculum lookup and feedback rules without framework dependencies.
- `modules/learning`: draft and learning-preference repository contracts.
- `adapters/preferences`: account-owned D1 learning preferences.
- `adapters/drafts`: D1 lesson-note persistence and concurrency tests; versioned schema lives in `services/server/migrations`.
- `adapters/email`: Resend transport and D1 mail-budget reservations.
- `packages/api-contracts`: runtime schemas and public DTO types.
- `packages/api-client`: transport and response validation.
- `tooling/architecture`: import parser and enforced package-layer checks.
- `tests/journeys`: browser-level behavior and recovery tests.

Only packages with actual responsibilities exist. The broader roadmap is in [the blueprint](LEARNTIFY_PLAN.md); detailed boundaries are in [module rules](docs/planning/MODULE_RULES.md). See [implementation status](docs/IMPLEMENTATION_STATUS.md) for gaps and the next increment.

## Dependencies and limitations

The lockfile is included as a project artifact. Dependency releases must be at least one day old, and install scripts are allowed only for the configured build runtimes. TypeScript is pinned to 5.9.3 because the architecture checker uses its JavaScript compiler API; TypeScript 7's installed package did not expose that API. Revisit the checker/toolchain together rather than upgrading blindly.

No paid resources or deployments are configured. The Worker currently has no production D1 binding. Do not expose the preview publicly as a production service: authentication, abuse controls, and operational retention remain unfinished.

See [external services and free-tier limits](docs/EXTERNAL_SERVICES.md) for account setup, current allowances, and the retention/capacity gaps.
