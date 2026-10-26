# Alpha acceptance and restricted-preview handoff

This is the release rehearsal for the current alpha, not a declaration of production readiness. No deployment is performed by this document or by CI.

## Implemented stabilization

- Study plans protect dirty forms when opening another plan, starting a new plan, following navigation, reloading/closing a tab, or signing out. Browser close warnings depend on browser support and prior interaction; they are not a backup.
- Learning preferences protect unsaved selections. Successful saving allows navigation without a redundant warning.
- Failed saves preserve form values. Plan requests show a working state; failed lists no longer look like empty lists. Duplicate errors remain visible and focused.
- Expired sessions expose a new-tab sign-in link so the original form/editor can remain open. Return to the original tab and retry with the same account. Plan and preference saves check the current account against the account that loaded the form. This client check is a UX safeguard; server session ownership remains the authorization boundary.
- Code/notes sync keeps pending content and the original retry operation ID after a 401, and displays session recovery. Practice attempts remain retryable after expiry; account/lesson changes still require reloading. History and practice views distinguish session failures from network errors.
- Forms have consistent spacing, visible keyboard focus, distinct invalid fields, quieter secondary plan buttons, and reduced-motion support.

## Local automated acceptance

1. `pnpm check`: formatting, module boundaries, TypeScript, domain/API/persistence tests and build dry runs.
2. `pnpm test:e2e`: public English/Spanish learning and mobile navigation.
3. `pnpm exec playwright test --config playwright.production.config.ts`: compiled client and isolated JavaScript execution.
4. `pnpm test:accounts`: real local Worker/D1 authentication and account journeys, including CRUD and `stabilization.spec.ts`.

The existing GitHub CI runs these commands. A local pass does not prove the remote workflow or deployed infrastructure passed. Check the workflow for the exact commit before promoting it.

## Learner rehearsal

Use localhost:5175 with the existing external-test services, or localhost:5174 with local accounts. Never demonstrate keys or cookies.

1. Sign in, open a lesson, run JavaScript, save an attempt, and wait for code sync.
2. Open progress/review and confirm the attempt appears. Return to the lesson and check saved code and notes.
3. Open Study plans, create a plan, reload, open it, and update it. Try a duplicate slug and correct it.
4. Edit a plan and attempt to open a different plan, navigate away, or sign out. Cancel and confirm the edit remains. Save and navigate without a warning.
5. Use the automated failure tests for expired sessions and unavailable services. Recovery should keep input, identify the next action, and allow retry. Do not deliberately disable shared providers for a demonstration.
6. Repeat essential actions in Spanish at mobile width and with the keyboard. Check focus indicators and the absence of horizontal overflow.

## Restricted Cloudflare preview: pending environment work

Prepare these items before authorizing a deployment:

- Select one HTTPS preview origin and a same-origin client/API routing arrangement. Verify SPA fallbacks for `/en/*` and `/es/*`; route `/api/*` to the production Worker entry point. Do not deploy the local or external-local entry points.
- Create an isolated preview D1 database and apply all numbered migrations through `0007_study_plans.sql`. Never apply the local mailbox migration remotely. Keep external-test data separate.
- Use `ACCOUNT_MODE=existing-accounts`, exact `APP_ORIGIN`, a verified `EMAIL_FROM`, and secrets for `AUTH_SECRET`, `RESEND_API_KEY`, and `PREVIEW_EMAILS`. The exact-email allowlist is limited to 20 addresses by the current implementation. Public lessons remain public.
- Provision only invited accounts using the existing reviewable provisioning script. Verify admitted and non-admitted accounts, including removal from the allowlist. Public signup and production account deletion stay disabled.
- Configure provider credentials and callback URLs for the chosen HTTPS origin; local OAuth registrations do not establish preview readiness. Check passkeys on that origin because registrations are origin-dependent.
- Verify current provider quotas and billing controls in the actual accounts. Confirm the verified sender works for invited addresses. Turnstile remains deferred; it is not a prerequisite for this implementation pass.
- Establish a recoverable database snapshot and rehearse restoration on a separate disposable database. Record actual provider retention, restore steps, and who can perform them. Do not claim the seven-day recovery target is proven until tested.
- Define minimal error/availability monitoring without credentials or draft/message bodies, an incident contact, and a switch to close account access while keeping lessons available. Validate mail/write limits and behavior at capacity.
- Record the release commit, successful CI run, migration state, and the previous compatible deployment for rollback. Avoid destructive migration rollback.
- After an explicitly authorized deployment, repeat the learner rehearsal on the real preview origin. Confirm cookies, origin enforcement, OAuth, passkeys, WASM execution, persistence, account isolation, and static routing there.

## Remaining limitations

This pass does not complete curriculum expansion, community moderation/chat, full interview preparation, offline form backup, multi-device merge handling for study plans, or production operations. Forms remain in tab memory until saved; explicit discard or a browser crash can lose edits. Study plan updates remain last-write-wins. Admission, quota, recovery and deployed-origin checks are required before treating the preview as ready for invited learners.
