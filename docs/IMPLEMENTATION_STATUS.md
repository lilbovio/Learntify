# Implementation status

Updated October 25, 2026.

## Delivery stage

Current stage: functional alpha for restricted testing, not a production release candidate. The complete account → lesson → execute → save attempt → review flow is implemented. Nine bilingual introductory lessons cover values, variables, strings, comparisons, conditionals, loops, functions, arrays and objects. This remains a small beginning of the intended curriculum.

The next milestone is a private beta: add applied foundation projects and deeper practice; improve feedback and accessibility; expand offline recovery and history access beyond the latest 20 attempts; and validate the experience with learners. Production readiness additionally needs tested backup/restore and deletion replay, monitoring and incident procedures, global capacity controls, deployed environment verification and production email/domain configuration. Community launch still requires moderators. Projects, data structures, algorithms and interview preparation remain substantial product work.

The latest UI pass reduces the lesson hero and signed-in account panel, softens card shadows, adds previous/next navigation with focus management, and checks desktop/mobile layouts. New lesson journeys execute solutions and validate bilingual navigation. This is incremental polish, not a claim that every product screen is complete.

The complete [Google AI Studio design brief](planning/GOOGLE_AI_STUDIO_DESIGN_PROMPT.md) covers all planned screens, clay/glass styling, restrained motion, accessible bilingual states and a frontend-only prototype handoff. The returned export is in `ai-studio-desing/`. Its core visual system is being integrated into the real client, with new library, practice, progress and notebook destinations. See [design integration](DESIGN_INTEGRATION.md) for delivered behavior and the remaining screens. Curriculum work continues independently: loops, functions, arrays and objects now have authored explanations, prediction feedback, executable exercises and transfer questions, with individual browser tests per lesson.

The owner has authorized local implementation, fixes, testing, and CI setup. This supersedes the planning-only restriction in older documents. Production deployment, purchases, external messaging, and paid infrastructure are not authorized.

## Delivered in the first increment

Separate client/server workspace, two bilingual prediction lessons, localized lesson navigation, lesson/version-specific local selections, error recovery, runtime-validated API contracts, and a reusable API transport. OpenCode's second lesson/catalog work was preserved and corrected rather than replaced.

The D1 adapter supports account-owned, versioned lesson notes in the local profile. Tests cover concurrent creation, unauthorized access, simultaneous writes from the same revision, and retry replay/payload mismatch. Private-write HTTP endpoints require a session. Auth, draft, preferences and mail-budget migrations have been applied to the dedicated remote test database.

CI covers formatting, type checks, module rules and their rejection tests, API/domain/local-D1 tests, dry-run builds, and Chromium journeys. The repository is now connected to https://github.com/lilbovio/Learntify. Initial CI runs passed on main and feat/account-onboarding. Work continues on the feature branch; consult Actions for each subsequent commit.

## Review corrections

- Fixed a hard-coded answer-storage key that mixed lessons and rejected the second lesson's answers.
- Replaced slug-derived navigation labels with localized catalog titles.
- Preserved selected lesson in the URL and restored answers by lesson/version.
- Separated the lesson workspace and shared copy from application routing/loading.
- Ignored late feedback and fetch results after navigation or locale changes.
- Restored architecture checks by pinning a compiler version with the required JavaScript API.
- Added regressions for multi-lesson navigation, stale feedback, payload limits, and localization.

## Screen coverage

The complete product screen map is **not finished**. The implemented local flow is welcome → email sign-in/check-email → onboarding → Today → lesson. Guests can use onboarding, Today and lessons without signing in. Both locales support direct URLs and page reloads; unknown routes provide localized recovery. New accounts land in onboarding and returning accounts land in Today. Expired or reused links return to sign-in with a recoverable error.

Learning preferences have validated GET/PUT contracts, a provider-independent repository interface, and a separate D1 adapter/migration. The server derives ownership from the session and rejects foreign-origin writes. Guest preferences use browser storage. Save failures preserve form input; member failures never silently save private preferences as guest data. Preferences use last-write-wins updates and are distinct from progress or mastery. Deleting an auth user cascades to preferences; the user-facing deletion workflow is still pending.

The local profile now includes `/en/settings` and `/es/settings`: preference access, sign-out, and permanent account deletion with typed confirmation and a sign-in within 15 minutes. The default configuration keeps deletion disabled. Integration tests cover rejected origins, missing confirmation, stale sessions, session revocation, cascaded notes/preferences/operation removal and preservation of other users. This implements active local database deletion only. It does not implement production backup deletion replay, cleanup records, moderation retention or external-provider cleanup. Development mailbox and short-lived verification/rate-limit records follow their separate lifecycle; the UI does not promise complete infrastructure erasure.

Remaining screens include advanced assessment, projects, community/moderation and interview preparation. Google/GitHub integration, runnable exercises, saved practice and a basic Today review queue are implemented. Community posting/chat remains gated on moderators. Today reports actual saved practice counts, not mastery scores.

## Runnable exercises

Signed-in code now uses the existing draft sync engine with separate `code:<lessonId>` storage keys; existing note keys remain unchanged. New code drafts start with the lesson example, and intentionally empty saved code stays empty. Saves debounce for 1.2 seconds, serialize requests, preserve retry IDs and expose conflicts without silently overwriting another device. Account changes hide private code/history; guest storage is not used for account code. Code or note changes warn before leaving or signing out. Recent attempts shows the latest 20 current-version snapshots and restores one only after confirmation. No new database migration is required. Offline durability and automatic guest-to-account import remain future work.

All nine bilingual lessons include a code editor, expected output, Run/Stop/Reset controls and immediate output feedback. A dedicated Worker runs a fresh QuickJS WebAssembly context with execution, stack, memory and output limits. Browser globals are unavailable to learner code. Guest code drafts persist in browser storage; signed-in drafts and explicit attempt snapshots save separately to D1. This is output practice, not verified mastery. Development and compiled-production browser journeys cover isolation, runaway loops, syntax errors, output limits and recovery. See [code exercise boundaries](CODE_EXERCISES.md).

Practice saves validate session ownership, origin, expected account, current lesson version and bounded input. Idempotent IDs prevent duplicate attempts after lost acknowledgements; a rolling 100-save daily cap limits writes per account. Today shows current-version practice counts and review reminders (immediate after mismatch, 24 hours after a match), with client-reported provenance. Migration 0006 is applied to local test storage and the dedicated external-test D1 database. D1/API/browser tests cover isolation, quota races, retries, deletion cascades, language switching and due-queue updates. See [practice progress](PRACTICE_PROGRESS.md).

Turnstile is deferred at the owner's request. It is not required for the learning flow; restricted registration stays in place. No additional external service is required for the runner.

## Next implementation boundary

A separate loopback-only external-testing profile now composes real Resend delivery and a remote D1 binding at client port 5175 / Worker port 8789. It permits one preview recipient and the Resend testing sender, leaving production HTTPS requirements unchanged. Its build runs in CI with placeholder bindings; tests do not call live providers. Provider authorization and private key configuration are complete locally; the dedicated test database is created, and the owner confirmed email delivery, verification and persisted account data. See [external local testing](EXTERNAL_LOCAL_TESTING.md). The setup itself does not establish production readiness.

Preview admission now requires a bounded exact-email list in production existing-account mode. Unlisted requests do not issue tokens or mail, pending links cannot create sessions after removal, and existing sessions lose private API access when the list changes. A Node 24 provisioning tool generates reviewable, idempotent SQL without connecting to a database or verifying email. These controls do not replace request/write quotas, general signup safeguards or production recovery testing.

The production entry point validates deployment bindings and composes the D1/auth/email adapters in an explicit existing-account mode. Defaults remain disabled; unknown modes, missing bindings and unexpected origins fail closed. Public signup and production deletion remain closed. The email-budget migration is part of the server's versioned migration sequence. External test resources are configured; public deployment, request/write budgets and recovery procedures remain unfinished. See [production setup readiness](PRODUCTION_SETUP.md).

Better Auth 1.7.12 has local D1-backed integration tests for hashed one-time links, expiration, session lookup and sign-out revocation. HTTP boundaries reject foreign origins and require adult self-confirmation for email link requests. Signup defaults to closed. Account and draft routes derive ownership from the session, validate published lesson/version pairs, and preserve revision/retry semantics. Account capabilities depend on the selected configuration.

The bilingual notes editor serializes saves, debounces typing, skips unchanged content, retains operation IDs after network failures, and asks for explicit conflict resolution. Clean notes refresh when the window regains focus. Unsaved notes remain in tab memory; leaving or signing out warns before discarding them. This is not an offline durable queue. Retry records store SHA-256 content hashes rather than historical text copies. Operation-journal cleanup, global write budgets and account-deletion workflows remain launch prerequisites.

The replaceable Resend adapter reserves a shared D1 mail budget (90/day, 2,500/month) before sending; tests inject a transport and send no real emails. Its migration is applied to the dedicated test database. Auth now has a checked-in migration, tested against the pinned configuration. Migrations must precede auth initialization. A separate loopback-only Worker profile serves a bilingual sign-in/sign-out UI and captures mail into local D1. Chromium tests exercise real local Worker execution, session persistence, token replay, Spanish recovery and mobile layout. The owner verified real email sign-in and persistent preferences/notes against test D1. Deployed CPU limits and OAuth remain unvalidated.

Next: broader UI polish and curriculum expansion, plus durable offline recovery and broader history access. Public-launch work still includes signup policy, production account deletion, global capacity budgets and journal cleanup. External service setup is not required for ongoing local implementation; see LOCAL_ACCOUNTS.md.

Provider credentials are configured for local testing. Domain purchase and verified production email remain deferred. Community remains disabled until moderators join. Preserve the strict zero-dollar policy.

## Passkeys and session controls

Passkey enrollment, sign-in and removal are implemented with Better Auth 1.7.12. Enrollment/removal require a verified account and a sign-in within 15 minutes. Origin, challenge and device user verification are enforced; preview admission still gates session creation. Settings can revoke other sessions while retaining the current one. Browser tests use a virtual authenticator; the owner also confirmed successful real-device enrollment and sign-in. Local account URLs now use localhost for WebAuthn. See [passkey setup](PASSKEYS.md). Google/GitHub OAuth code is implemented with explicit linking and credentials are configured locally. The owner confirmed Google linking; live GitHub verification remains pending. Turnstile is deferred.

## Google/GitHub integration

Optional server-only credentials enable provider buttons. Accounts must first sign in by email/passkey, then explicitly link the same verified email from settings within 15 minutes. Implicit linking and OAuth signup remain disabled. Requests cannot override scopes, redirects, ID tokens or signup policy. Access/refresh tokens are encrypted at rest. Tests simulate provider responses. Credentials are configured locally and Google linking was confirmed by the owner; live GitHub verification remains pending. See [OAuth local testing](OAUTH_LOCAL_TESTING.md).

Provider connection UX now confirms identity in place using a passkey when the backend requires recent authentication, then retries once. Switching accounts stops automatic linking. Email confirmation can return to settings without logout. Connected providers have explicit disabled states; there is no user-facing linking countdown. The backend freshness policy is preserved.
