# Learntify technical decision records

Planning only · October 21, 2026. No packages installed, providers configured, or application code written. Owner choices are requirements; technical selections below are recommendations awaiting later validation.

Approval update: the owner has accepted the proposed stack subject to technical validation and replacement if needed, while explicitly remaining in planning. APPROVED_BASELINE.md supplies the now-decided retention policies and narrower first-build scope; older references below to unsettled retention are superseded. Validation itself is not yet authorized.

## ADR-001 — Authentication and email

Recommend Better Auth within the application server, Google/GitHub OAuth, and email OTP through a replaceable delivery port. Keep application user IDs independent of provider subjects. Resend Free is the first email candidate after domain verification and no-overage account checks.

Better Auth documents native D1 support and email OTP sign-in. This avoids another hosted identity datastore while using an existing authentication implementation. We still own configuration, security updates, and integration testing. [D1 support](https://better-auth.com/blog/1-5), [OTP documentation](https://better-auth.com/docs/plugins/email-otp).

Resend currently documents 100 daily sends on Free. Verify current monthly allowance, recipient/domain restrictions, production approval, and hard-stop behavior before deployment. Reserve email for authentication initially; community notifications are in-app. Limits count sends and resends, not unique accounts. [Pricing](https://resend.com/pricing), [quota documentation](https://resend.com/docs/knowledge-base/account-quotas-and-limits).

Alternatives: Clerk reduces identity operations but adds a hosted identity dependency and retained-user pricing model. Supabase Auth adds another service and production email configuration while D1 remains the application store. Keep these as fallback candidates if Better Auth compatibility or maintenance proves unsuitable. [Clerk pricing](https://clerk.com/pricing), [Supabase SMTP guidance](https://supabase.com/docs/guides/auth/auth-smtp).

Validation gate: supported release/advisories; Worker runtime and CPU behavior; D1 migration compatibility; OAuth linking and private/missing provider emails; OTP challenge binding, hashing, expiry, attempt limits, replay protection; CSRF/session behavior; account deletion; resend races; bilingual templates; outages and quotas. Check actual library settings rather than assuming all protections are defaults.

Email-only users receive an honest temporary sign-in limitation if delivery stops; existing sessions remain usable when otherwise valid. Never auto-link a social identity from an unverified matching address. Provider acceptance is not proof of inbox delivery. Do not put expiring login codes in a slow general-purpose queue or resend repeatedly after ambiguous failure. No paid upgrade is automatic.

## ADR-002 — Continuous draft synchronization

Accepted: automatically sync drafts across devices, retaining local recovery. This does not require a write per keystroke or concurrent collaborative editing.

Proposed defaults: persist locally during editing; coalesce remote saves after roughly two seconds idle, with a maximum 15-second dirty interval while online. Timings are tunable, not guarantees during browser suspension or quota pressure. Flush on explicit save/run/submit where possible. Page exit is best effort, never the sole durable save.

`Draft` contains owner, workspace/exercise-version reference, revision, content hash, contents, and timestamps. Saves carry expected revision and client operation ID. Compare-and-swap prevents stale overwrites; retry deduplication returns the original outcome. Unchanged hashes skip redundant writes. Replace the current draft revision; keep submitted attempts and explicit project snapshots separately instead of retaining every edit forever.

On device open/focus/reconnect, fetch the authorized latest revision. While active, use bounded conditional version checks with backoff; inactive tabs do not poll constantly. Later push invalidation can replace polling if measurements justify it.

If two devices edit the same base, preserve the local branch and server branch, show a conflict, and let the learner choose/merge. Never silently use last-writer-wins. Collaborative CRDT editing remains later scope. Submission pins the exact submitted contents even if background saves race it.

UI distinguishes saved locally, syncing, saved to account, offline/pending, conflict, and capacity-paused. If sync stops, retain local work and offer export. Browser storage can be cleared or evicted and is not a guaranteed backup.

Cost example: a save every 15 seconds during 20 minutes of uninterrupted typing means about 80 saves per session, before reads, submissions, and index effects. Measure actual row operations and typing patterns before setting admission limits. Continuous synchronization is a meaningful free-tier workload.

## ADR-003 — Rooms with indefinite history

Accepted: topic and study-circle rooms first; private messages later. Ordinary history has no age-based expiry. Deletion, moderation, account choices, and backup policies still apply. Indefinite retention is not unlimited capacity.

One SQLite-backed Durable Object per room owns authoritative message ordering/history. D1 owns directory, membership, and policy, not duplicate message bodies. Presence/typing are ephemeral. Cursor pagination loads recent history first; old pages are fetched deliberately. Initial messages are text-only, with proposed 4,000-character and bounded byte limits; room size and send rates remain configurable and need validation.

Messages carry client ID, actor, room ID, and body. Persist and assign a monotonic room sequence before acknowledging or broadcasting. Dedupe actor/client IDs; reconnect from the last seen sequence and dedupe replayed messages. Network delivery is not exactly once. Failed persistence never produces successful-send status.

Short-lived room tickets follow authoritative membership checks. Tickets are not perpetual authorization: push idempotent revocations and revalidate permission freshness before privileged actions. Failed authoritative checks reject joins/sends. Membership removal in D1 and socket revocation are not atomic; expose pending revocation when necessary and define a bounded freshness policy before implementation. Moderation tombstones propagate to connected clients and projections.

Near storage capacity, stop accepting new content or rooms while preserving stored history. Read-only rooms are preferable to silent deletion. Continued storage growth needs funding or an explicit migration. Cold archives are not assumed available within the zero-dollar budget. Ordinary history retention and limited moderation-evidence retention are separate policies; the latter must be finalized before social launch.

## ADR-004 — Quotas and admission control

Accepted: keep lessons public and restrict new accounts/costly features before quotas run out. No paid priority or automatic upgrades.

Track requests, CPU, scanned/written rows, database bytes, room storage/operations, email sends, and job backlog independently. Static lessons must not require authenticated database reads. Suggested warning/admission thresholds of 70%/85% are initial heuristics, not guaranteed protection; use predicted consumption, burst reserve, and feature-specific limits. Delayed dashboard metrics alone are insufficient.

Modes: normal; conservation (restrict signup/new rooms, coalesce sync, delay optional work); affected-service read-only (reject writes before acknowledgement, preserve local drafts). Protect critical saves, account access, moderation/deletion work, and accepted attempts as capacity allows. Dynamic history cannot be promised during total backend failure.

Use stable capacity/rate-limit errors, localized explanations, bounded jittered retries, and retry timing only when known. Registration admission is distinct from existing-user login. Scarce-resource reservations must handle concurrency without adding one global counter bottleneck to every ordinary request. Verify provider hard stops/no-overage account configuration: alerts are not spending caps.

## ADR-005 — Account deletion and public contributions

Accepted: offer preservation with author identity removed or removal of public contributions during deletion. Show an explicit preview and choice. Removing a profile does not guarantee anonymization: code, prose, quotes, or links can identify an author. Explain this and offer editing/removal rather than claiming untouched content is anonymous.

Public questions, answers, and public-room messages follow the selected disposition. Private drafts/projects/feedback and account identifiers follow deletion policy. Others' replies remain theirs; use tombstones to retain discussion structure. No public preservation choice silently preserves private material.

Workflow: recent authentication → export option/disposition preview → record choice → disable account/revoke sessions → resumable per-domain cleanup → verify → truthful completion status. Cover D1, rooms, artifacts, search, notifications, pending jobs, and owned published copies.

Maintain an author-to-room index to find messages without scanning every room. Cross-store updates require durable retry/reconciliation so indexing failure cannot hide messages from cleanup. Block new contributions once deletion begins. Restrict cleanup metadata and define its retention.

Backups may retain deleted data until documented expiry; maintain a deletion ledger sufficient to reapply removals after restoration. Specify actual backup and necessary abuse-evidence retention before launch. Do not promise deletion from other people's downloads or external sites.

## ADR-006 — Contracts and persistence

REST contracts live under `/api/v1`; auth-library endpoints remain behind the identity boundary. Use opaque IDs, UTC timestamps, runtime-validated DTOs, bounded cursor pages, standardized errors, request-size limits, idempotency, and optimistic concurrency. Expose no storage SDK types to clients.

Draft saves require expected revision and operation ID. Attempts pin exercise version and submitted snapshot. Chat sends carry client message IDs. Deletion requires explicit contribution disposition and fresh authentication. Avoid a generic endpoint that lets clients write arbitrary tables.

D1 owns application relational records; the auth library owns reviewed auth schema definitions, with Identity mapping them to application users. Use a single ordered migration process, domain ownership, expand/backfill/verify/contract changes, and no automatic production schema edits on startup.

Attempt/evidence/outbox commits stay in one database boundary. Room commits stay in the room. Cross-boundary effects are asynchronous, idempotent, observable, and reconciled. Foreign keys and deletion behavior must not cascade into other learners' contributions.

Future validation covers concurrent drafts, lost acknowledgements, offline replay, expired OTPs, ambiguous email sends, room reconnect, active-session moderation, delayed revocation, permanent-history storage exhaustion, and interrupted account deletion. No such implementation tests have been run yet.
