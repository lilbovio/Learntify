# Implementation status

Updated October 22, 2026.

The owner has authorized local implementation, fixes, testing, and CI setup. This supersedes the planning-only restriction in older documents. Production deployment, purchases, external messaging, and paid infrastructure are not authorized.

## Delivered in the first increment

Separate client/server workspace, two bilingual prediction lessons, localized lesson navigation, lesson/version-specific local selections, error recovery, runtime-validated API contracts, and a reusable API transport. OpenCode's second lesson/catalog work was preserved and corrected rather than replaced.

The D1 adapter supports account-owned, versioned lesson notes in the local profile. Tests cover concurrent creation, unauthorized access, simultaneous writes from the same revision, and retry replay/payload mismatch. Private-write HTTP endpoints require a session. Auth and draft SQL migrations are checked in but have not been applied remotely.

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

Remaining screens include advanced account management, Google/GitHub sign-in, runnable coding exercises, assessed attempts/results, progress, review queue, projects, community/moderation and interview preparation. Community posting/chat remains gated on moderators. There are no fabricated progress statistics or links to unfinished modules in the current Today screen.

## Next implementation boundary

The production entry point now validates deployment bindings and composes the D1/auth/email adapters in an explicit existing-account mode. Defaults remain disabled; unknown modes, missing bindings and unexpected origins fail closed. Public signup and production deletion remain closed. The email-budget migration is now part of the server's versioned migration sequence. No external resources are configured, and preview admission, initial-user provisioning and actual provider validation remain unfinished. See [production setup readiness](PRODUCTION_SETUP.md).

Better Auth 1.7.12 has local D1-backed integration tests for hashed one-time links, expiration, session lookup and sign-out revocation. HTTP boundaries reject foreign origins and require adult self-confirmation for email link requests. Signup defaults to closed. Account and draft routes derive ownership from the session, validate published lesson/version pairs, and preserve revision/retry semantics. Production still instantiates the application without these dependencies, so account and cloud-draft capabilities remain false. OAuth is not implemented yet.

The bilingual notes editor serializes saves, debounces typing, skips unchanged content, retains operation IDs after network failures, and asks for explicit conflict resolution. Clean notes refresh when the window regains focus. Unsaved notes remain in tab memory; leaving or signing out warns before discarding them. This is not an offline durable queue. Retry records store SHA-256 content hashes rather than historical text copies. Operation-journal cleanup, global write budgets and account-deletion workflows remain launch prerequisites.

The replaceable Resend adapter reserves a shared D1 mail budget (90/day, 2,500/month) before sending; tests inject a transport and send no real emails. Its migration is not applied remotely. Auth now has a checked-in migration, tested against the pinned configuration. Migrations must precede auth initialization. A separate loopback-only Worker profile serves a bilingual sign-in/sign-out UI and captures mail into local D1. Chromium tests exercise real local Worker execution, session persistence, token replay, Spanish recovery and mobile layout. Deployed CPU limits and real OAuth/mail delivery remain unvalidated.

Next: production Worker composition/configuration, complete signup policy and abuse controls, Google/GitHub integration, account deletion, write budgets and journal cleanup. Then guest import, durable offline recovery and real progress/review rules. External service setup is not required for ongoing local implementation; see LOCAL_ACCOUNTS.md. Isolated arbitrary-code execution needs browser threat-model tests before enabling the editor runner. The current lesson shows code and asks for predictions; it does not execute learner code.

Provider credentials and domain/email verification are future prerequisites for live OAuth/mail, not reasons to pretend accounts work now. Community remains disabled until moderators join. Preserve the strict zero-dollar policy.
