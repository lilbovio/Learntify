# Practice attempts, progress and review

Signed-in learners can save an exercise result explicitly. This stores a code snapshot and the browser-reported output-match flag in D1. It does not execute code on the server or prove mastery. Unsaved editor drafts remain browser-local; lesson notes retain their separate cloud-sync behavior.

## Contracts and ownership

- `POST /api/v1/practice/attempts`: UUID `id`, `lessonId`, `lessonVersion`, `code` (maximum 16,000 characters), `matched`, and `expectedAccountId`. The server derives ownership from the session and only uses the expected ID to reject account changes. Origin checks, current published lesson/version validation, exact input validation and preview admission apply.
- Retrying the same ID and payload acknowledges the original attempt. Reusing it with different content returns 409. A conditional database insertion caps new saves at 100 per account over a rolling 24 hours; retries still succeed at that cap. Learners can keep running exercises without saving.
- `GET /api/v1/practice/progress`: owner-only summaries for current lesson versions, attempt counts, latest outcome, server-recorded practice time, review time and explicit `client-reported-practice` provenance. Responses are not cached. Historical code snapshots are stored but a history browsing/restoration screen is not yet implemented.

The Today page shows lessons practiced, saved attempt counts and links to due reviews. The latest mismatching result is due immediately. A matching result is due after 24 hours. Saving another attempt updates the reminder. This is a basic revisit queue, not adaptive spaced repetition or a mastery score. Data refreshes on page load and window focus. Guests do not get fabricated account progress.

## Storage and operation

Migration `0006_practice_attempts.sql` adds an owner-scoped table with indexes for time and lesson/version queries. User deletion cascades to attempts. The current implementation retains attempt snapshots until account deletion; it does not yet implement export or individual attempt deletion. Production account deletion retains its existing launch restrictions.

Local setup applies migrations through `pnpm db:local`. Migration 0006 has also been applied to the existing dedicated external-test D1 database. Fresh installations need this migration before using saved attempts. No new provider or paid service is introduced. The per-account cap is a safeguard, not a global capacity guarantee; preview admission stays restricted.

## Verification

Local D1 tests cover concurrent idempotent retries, conflicting IDs, owner isolation, version separation, deletion cascades and quota races. API tests cover origin/session/identity checks, input validation and current-version summaries. A real account browser journey covers a lost acknowledgement, retry without double-counting, reload persistence, EN/ES progress and removal from the due queue after matching output.
