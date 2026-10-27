# Alpha operating limits and recovery

## Capacity behavior

Migration `0008_operational_limits.sql` is required before using the current account-enabled server. Apply numbered migrations before switching application versions. The local account, external-test and production account composition all reserve private writes.

The policy allows up to **2,000 reservations per account per UTC day**, and **10,000 across accounts per UTC day**. A reservation happens after authentication and origin validation but before private mutation handling. Invalid bodies, failed writes and retries can consume a reservation; this deliberately favors conservative capacity accounting. Concurrent reservations cannot exceed the configured ceiling. Daily reset occurs at UTC midnight and 429 responses include `Retry-After`.

This is an application reservation budget, not an exact D1-row count or a promise that provider limits cannot be exhausted. Auth/session reads, anonymous traffic, static assets and auth operations have different costs and controls. Inspect actual provider usage before inviting learners. Existing mail reservations and the practice-attempt cap remain independent.

Set `PRIVATE_WRITES=paused` in an account-enabled configuration to return a recoverable 503 for private draft/preference/practice/plan mutations. Reads, public lessons and auth recovery/sign-out remain routed normally. Keep work in the current tab or use **Download a copy**. Downloaded files contain private user-authored text; on a shared device, the learner should remove them when finished. Downloads are explicit actions, not a new automatic local cache.

Each account can hold 50 study plans. The database enforces the cap atomically. A duplicate slug remains 409; a new plan beyond capacity returns 429 `PLAN_LIMIT`. Delete an unused plan to reclaim space. This does not charge users or introduce paid access.

## Metadata cleanup

The production scheduled handler deletes at most 500 rows from each metadata category per invocation:

- Draft retry journal entries older than seven days (content hashes and revision metadata only).
- Private write counters older than two days.
- Email-budget counters older than 62 days; the current month remains intact.

The preview example schedules this every 15 minutes. It is inactive until an account-enabled deployment is explicitly configured; local/external-local testing does not automatically execute scheduled events. The cleanup never deletes drafts, lessons, attempts or plans. Older retry IDs can no longer replay the original acknowledgment after journal cleanup; revision checks still prevent reapplying an obsolete write. Test this behavior before changing the retention window.

## Same-origin preview artifact

`services/server/preview/wrangler.example.jsonc` binds the compiled Vite client as static assets. `/api/*` runs through the production Worker; localized client deep links use SPA fallback. The example has accounts disabled, private writes paused, no database binding, no secrets and no public workers.dev endpoint. It is safe for local dry-run verification; it is not a configured production deployment.

Run `pnpm test:preview` to test it locally. `pnpm build` includes its dry run. A real deployment requires a separately reviewed `services/server/preview/wrangler.jsonc` (ignored by Git), an HTTPS origin, isolated D1 binding and provider secrets. Do not deploy the external-local entry point. Do not enable CD merely because the artifact builds.

## Recovery rehearsal

`services/server/src/operations/recovery.test.ts` loads every numbered migration into a synthetic SQLite database, creates representative account/session/passkey/draft/attempt/plan data, takes an in-memory snapshot, restores it into a separate database, replays a deletion and checks foreign keys/integrity. It proves schema and cleanup behavior locally. It does **not** prove Cloudflare retention, remote restore mechanics, deletion-ledger completeness or operational recovery time.

Before a provider restore:

1. Close account admission and private writes; preserve the current state and exact application/migration version. Restore into a separate database, never blindly overwrite the live database.
2. Supply the independently retained list of user IDs deleted after the snapshot. Production self-service deletion remains disabled until a durable deletion ledger and retention process are implemented. An empty or incomplete list cannot establish deletion compliance.
3. Generate reviewable cleanup SQL with `node services/server/scripts/replay-deletions.ts <private-user-id-list.json>`. The JSON must be an array of opaque IDs. Output is `.learntify-private/recovery-cleanup.sql`; the generator refuses to overwrite it and never connects to D1.
4. Review and apply the SQL to the isolated restored database. It removes restored sessions and verification records, then deletes listed users with foreign-key cascades. It preserves surviving learners' content and budget counters. Repeating it is safe.
5. Reconcile mail/write usage since the snapshot before reopening. Restored counters may be stale; keep delivery/saving closed until actual provider usage is known. Verify retained credentials, membership and secret compatibility; never assume old sessions remain revoked without the cleanup step.
6. Check database integrity, owner isolation, restored content, deletion replay and the complete learner journey. Record operator, snapshot time, release version, checks and outcome without logging private contents or secrets.
7. Only switch the reviewed configuration to the restored database after approval. Keep the previous database for the documented recovery window, restricted from normal application access.

Seven-day backup retention, 14-day diagnostic logs and 30-day security metadata remain operational targets subject to actual provider capabilities. No persistent logging service, remote backup schedule or production deletion ledger is silently claimed by this implementation. The final invited-preview gate includes these validations.
