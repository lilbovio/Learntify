# Implementation status

Updated October 22, 2026.

The owner has authorized local implementation, fixes, testing, and CI setup. This supersedes the planning-only restriction in older documents. Production deployment, purchases, external messaging, and paid infrastructure are not authorized.

## Delivered in the first increment

Separate client/server workspace, two bilingual prediction lessons, localized lesson navigation, lesson/version-specific local selections, error recovery, runtime-validated API contracts, and a reusable API transport. OpenCode's second lesson/catalog work was preserved and corrected rather than replaced.

The D1 adapter is a local concurrency experiment. Tests cover unauthorized access, simultaneous writes from the same revision, and retry replay/payload mismatch. No private-write HTTP endpoint is exposed without authentication. The SQL file is not a complete application schema or remote migration.

CI is configured for formatting, type checks, module rules and their rejection tests, API/domain/local-D1 tests, dry-run builds, and Chromium journeys. GitHub execution still requires a repository/remote; the inspected workspace had no .git directory. No Git history was available to attribute changes precisely.

## Review corrections

- Fixed a hard-coded answer-storage key that mixed lessons and rejected the second lesson's answers.
- Replaced slug-derived navigation labels with localized catalog titles.
- Preserved selected lesson in the URL and restored answers by lesson/version.
- Separated the lesson workspace and shared copy from application routing/loading.
- Ignored late feedback and fetch results after navigation or locale changes.
- Restored architecture checks by pinning a compiler version with the required JavaScript API.
- Added regressions for multi-lesson navigation, stale feedback, payload limits, and localization.

## Next implementation boundary

Better Auth 1.7.12 now has local D1-backed integration tests for hashed one-time links, expiration, session lookup and sign-out revocation. HTTP boundaries reject foreign origins. Injectable account and draft routes derive ownership from the session, validate payloads, and preserve revision/retry semantics. Production still instantiates the application without these dependencies, so account and cloud-draft capabilities remain false. Draft creation, browser sign-in/sync UI and OAuth are not implemented yet.

The replaceable Resend adapter reserves a shared D1 mail budget (90/day, 2,500/month) before sending; tests inject a transport and send no real emails. Its migration is not applied remotely. Auth schema generation currently runs only against disposable test databases. Auth logic runs in the test host against Miniflare D1; end-to-end auth execution inside a deployed Worker, CPU limits and real OAuth/mail delivery remain unvalidated.

Next: checked-in reviewed auth/application migrations, Worker composition/configuration, signup age consent and abuse controls, Google/GitHub integration, browser account UX, and owned draft creation/sync. Then guest import and real progress/review rules. Isolated arbitrary-code execution needs browser threat-model tests before enabling the editor runner. The current lesson shows code and asks for predictions; it does not execute learner code.

Provider credentials and domain/email verification are future prerequisites for live OAuth/mail, not reasons to pretend accounts work now. Community remains disabled until moderators join. Preserve the strict zero-dollar policy.
