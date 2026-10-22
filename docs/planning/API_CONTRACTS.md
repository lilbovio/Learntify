# API contracts — design baseline v1

Planning specification, October 21, 2026. These are contracts for later implementation, not deployed endpoints or generated OpenAPI. TECHNICAL_DECISIONS.md and owner decisions govern scope. All social mutations and room connections remain server-disabled until moderator readiness.

## Common protocol

Application base: `/api/v1`. Auth-library routes: `/api/auth/*`, isolated from domain routes. Browser sessions use secure HttpOnly cookies; mutation requests require the chosen CSRF/origin controls. Identity always comes from the verified session, never a body `userId`. Server validates active account status, feature availability, object permissions, and quota admission.

JSON DTOs use camelCase, opaque string IDs, RFC 3339 UTC timestamps, integer nonnegative revisions, and locale `en` or `es`. Database naming/types are not exposed. Reject unknown mutation fields to prevent mass assignment. Public read responses are explicit allowlists; privacy is not enforced by simply removing a few known fields.

Single success: `data` plus `meta.requestId`. Collections add `page.nextCursor` and `page.hasMore`; default limit 20, maximum 50. Cursor binds filter/sort context and includes a stable ID tiebreaker. No arbitrary sort SQL, offset pagination for growing feeds, or automatic expensive total counts. Cursor is not an access token.

Errors: `error.code`, safe `error.message`, optional `error.fields` and `error.retryAfterSeconds`, plus `meta.requestId`. Client localizes stable codes. Never return SQL, tokens, private snapshots, or stack traces. Use 400 invalid shape/cursor, 401 authentication required, 403 known forbidden action, 404 absent or deliberately concealed private object, 409 state/idempotency conflict, 412 stale revision, 413 payload too large, 422 invalid domain input, 428 required precondition absent, 429 actor throttling, 503 temporary capacity/service failure. Use `FEATURE_UNAVAILABLE` for unreleased social functions without implying a payment requirement. `Retry-After` is supplied only when defensible.

Creates return 201 and a resource location. Accepted jobs return 202 and a status resource, not a claim of completion. No-content deletes/relationship removals return 204. Reads return 200 or 304 for a matching ETag. Mutable-resource writes require `If-Match` from the prior read unless the operation has a more specific atomic state predicate. Responses include the resulting ETag/revision.

Mutation idempotency: create/action POSTs require `Idempotency-Key` (opaque 16–128 characters). Scope by actor, operation, and key; hash canonical validated input. Same key/body returns the original committed result after current authorization checks; changed body returns `IDEMPOTENCY_CONFLICT`. Concurrent processing returns a retryable in-progress result. Proposed replay retention: seven days; entity-level unique client IDs protect attempts/draft operations beyond that where needed. Never cache a response containing long-lived credentials in this general store.

Initial request limits: 256 KiB JSON; text/code-only draft bundle up to 128 KiB UTF-8, 20 files, 64 KiB/file; question/answer body 20,000 characters and 80 KiB; question title 160 characters. Paths are normalized relative paths, with traversal/absolute paths rejected. Server recomputes content hashes. Limits are product defaults to validate, not Cloudflare limits. Oversize payloads fail before partial persistence.

## Identity and account lifecycle

- `GET /capabilities`: public released-feature flags and broad availability modes; omit internal quota counters and staff details. Cache briefly; server still enforces flags on mutations.
- `/api/auth/*`: Google/GitHub and email OTP through the maintained library. Exact provider endpoints remain tied to the selected supported library version. They must meet ADR-001; do not invent a second session implementation.
- `GET /me`: account ID/status, chosen profile fields, locale/preferences, and scoped capabilities; `PATCH /me/profile` accepts displayName/handle/visible fields with If-Match; `PATCH /me/preferences` accepts supported locale/accessibility/notification/discovery settings.
- `POST /me/onboarding`: `{adultEligibilityConfirmed, termsVersion, locale}`. Require true adult declaration for account participation; store policy version/time, not an unnecessary full birth date. Do not label self-declaration verified age.
- `GET /me/sessions`, `DELETE /me/sessions/:id`: list safe session metadata or revoke an owned session; no raw tokens. Fresh authentication required for revoke-all/identity linking.
- `POST /me/imports`: bounded guest-attempt/draft import with stable client IDs and original exercise versions; return created/deduplicated/conflicted results. Never trust imported mastery claims.
- `POST /me/exports`: `{scope:"account"}` → 202 job; `GET /me/exports/:id` owner-only status and short-lived authorized download when ready.
- `POST /me/deletion-preview`: `{publicContributionDisposition:"preserveWithoutAuthor"|"remove"}` → counts/categories, caveats, preview ID/revision; no deletion occurs.
- `POST /me/deletions`: `{previewId, publicContributionDisposition, confirmation:true}` plus fresh-auth proof → 202 deletion job. Record the choice and disable account/revoke sessions atomically. Issue a narrow, short-lived deletion-status receipt through a protected channel so status remains readable after logout; never grant normal account access with it.
- `GET /deletions/:id/status`: authorized deletion receipt only, minimal stage/result, no personal-content payload. Public-content preservation does not promise removal of identifying text.

## Curriculum and learning

- `GET /releases/current?locale=en`, `GET /concepts`, `GET /concepts/:id`, `GET /lessons/:id?releaseId=...&locale=...`, `GET /exercise-versions/:id?locale=...`: public published material only. Published versions are immutable; cache by version/locale. Missing required translation blocks publication rather than silently changing language.
- `POST /drafts`: `{exerciseVersionId}` or `{projectId}`, exactly one → owned draft ID/revision. Uniqueness prevents duplicate active drafts for the same owner/target.
- `GET /drafts/:id`: owner-only current files/revision/hash; `PUT /drafts/:id`: `{operationId, files:[{path,content}]}` with If-Match → revision/hash/savedAt. Server never changes submitted attempts when updating a draft. Conflict returns current revision and a safe refetch link, not another user's content. Client retains both branches.
- `POST /attempts`: `{clientAttemptId, exerciseVersionId, answer, hintIdsUsed, solutionRevealed, clientObservation?}`. `answer` is a versioned union of code files, predicted output, selected response, or explanation. Validate against exercise format. Response: attempt ID, pinned version, evidence provenance, feedback and `progressStatus` (`updated` or explicit future `pending`). Browser observations/hint claims are untrusted; record source, never certify them as server-evaluated mastery.
- `GET /attempts/:id`: owner-only record; `GET /me/progress?conceptId=...`: states, evidence summaries, policy version, review reasons; `GET /me/reviews`: bounded due items.
- `POST /reviews/:id/attempts`: same attempt payload tied to an owned active review; prevents a duplicate scheduler item. Completing a review requires an actual outcome, not a client-supplied `mastered:true`.
- `GET/POST /me/notebook`, `PATCH/DELETE /me/notebook/:id`: private misconception/reflection/concept and optional owned snapshot, with revision checks. `POST /me/notebook/:id/contributions` creates a separately previewed public-review copy with explicit consent, never changes private visibility in place.

## Community, social learning, and projects

- `GET /questions?language=es&conceptId=...&status=open`: visible public results. `POST /questions`: `{title,body,language,conceptIds,exerciseVersionId?,sharedSnapshot?}`; sharedSnapshot is an explicit approved copy, not an arbitrary private artifact ID. `GET/PATCH /questions/:id` read/edit visible question; edits require author or audited moderation authority.
- `POST /questions/:id/answers`: `{body,language}`; `POST /questions/:id/replies` and `/answers/:id/replies`: shallow clarifications. Edits/deletes are author-scoped. `PUT /questions/:id/accepted-answer`: `{answerId}` by asker; require visible answer belonging to that question. `DELETE` clears selection. Helpful/bookmark/subscription endpoints use idempotent PUT/DELETE relations.
- `POST /questions/:id/clinic`: `{expected,actual,sharedTrace}` → clinic. `POST /clinics/:id/annotations`: `{traceId,stepId,body}`; trace/step must belong to the visible clinic. `POST /clinics/:id/repairs`: `{snapshot,explanation}` by owner; resolution is a separate valid transition.
- `GET /people/:handle`: public allowlisted profile; `GET /people?language=...&conceptId=...`: opted-in discovery. `POST /connections/requests`: `{recipientId}`; `POST /connections/requests/:id/accept|decline|cancel`: actor-specific transitions. `DELETE /connections/:id` by either participant. `PUT/DELETE /me/blocks/:userId`: authenticated, no self-block.
- `GET/POST /circles`; create `{name,purpose,language,visibility,membershipPolicy}`. `POST /circles/:id/join-requests`, `/invitations`, `/membership-actions`: explicit actor/role checks; clients cannot choose host privileges. `GET/POST /circles/:id/discussions` and `/goals`, plus `/goals/:id/check-ins`: members only where private. Leaving/transfer/archive are explicit actions, never implicit owner deletion.
- `POST /teach-backs`: `{conceptId,peerId?,rubricVersionId}`; explanation, follow-up, feedback and reflection are versioned session actions. Only invited/accepted participants can read private content. Completion never automatically grants mastery.
- `GET/POST /projects`: template version and private workspace; `GET /projects/:id`; `POST /projects/:id/snapshots`: owned draft reference/revision or explicit files → immutable snapshot. `POST /projects/:id/publications`: selected snapshot and consent, no automatic history sharing.
- `POST /projects/:id/handoffs`: `{recipientId,snapshotId,contract,acceptanceCriteria}` → offer. `/handoffs/:id/accept|decline|return|review|cancel` enforce state and participant rights; return carries a newly owned/scoped snapshot. No unrestricted workspace access is implied.

## Interviews, notifications, and operations

- `GET /interview-scenarios?locale=...&format=...`; `POST /interview-sessions`: `{scenarioVersionId,mode,optionalTimerSeconds?}`; solo is always available independently of peer matching. Role-specific prompt material is omitted from the other role's DTO.
- `POST /interview-sessions/:id/start|complete|cancel`: valid participant/state transitions. `POST /interview-sessions/:id/feedback`: `{rubricVersionId,observations,conceptIds,source}`; server derives source/author rights, rejects impersonation and auto-certification. `POST /interview-sessions/:id/confidence`: self-report only.
- `POST /matches`: topic/language/role/availability; `POST /matches/:id/confirm|decline|cancel`: confirm UTC slot and roles. Detect conflicting active reservations; local display time is not the stored scheduling identity.
- `GET /me/notifications`, `PUT /me/notifications/:id/read`, `PATCH /me/notification-preferences`: target access rechecked at render; removed membership must not leak old snippets.
- `POST /reports`: typed visible target reference and reason; chat reports require room/message IDs. `POST /moderation/actions`: moderator-only typed action/reason/report reference, audited; owner domain executes the effect. `POST /appeals`: affected actor only.
- `/admin/content/*`: editor-authored draft revisions and bilingual review; `POST /admin/releases/:id/publish` → job that validates manifest, both locales, references and tests before activation. Staff roles do not confer blanket private-note access.

These domain route groups are the v1 surface map. Generated schemas for every subaction follow only during implementation; do not expose a generic arbitrary-state PATCH as a shortcut.

## Room HTTP and WebSocket contract

`GET /rooms` lists authorized room metadata, never private circle names to nonmembers. `GET /rooms/:id/messages?before=...&limit=...` returns authorized bounded history. `POST /rooms/:id/tickets` creates a one-use ticket valid for at most 60 seconds, with room/user/session/permission version binding. Keep tickets out of query logs; browser transport details must be verified in the runtime spike. Origin checks remain mandatory.

Socket frames carry `{version:1,type,requestId,payload}` with a maximum frame size matching message-byte policy. Client frames: `authenticate`, `resume{afterSequence}`, `message.send{clientMessageId,body}`, `presence.update`. Server frames: `ready`, `message.ack{clientMessageId,messageId,sequence}`, `message.created`, `message.changed`, `message.removed`, `error`, `access.revoked`, `capacity.changed`. Unauthenticated sockets receive no history and close after a short handshake timeout. No code executes on receipt.

Ordering: a room assigns monotonic message sequence; message revisions include their own revision and a replayable change-event sequence so edits/deletions to old messages are not missed. Reconnect uses change-event position; initial history uses message position. `ready` carries both cursors and permission lease expiry. Paginate replay; if compaction later invalidates a change cursor, require an authorized resync, never omit deletions silently.

Authorize reads/sends under a renewable lease no longer than 30 seconds initially; revocation push is faster when available. Stop fanout and sends at lease expiry if authoritative renewal fails. Account deletion/membership removal may take up to that documented bound unless revocation is acknowledged sooner. Immediate global revocation is not claimed. Measure the cost of renewal before implementation; do not weaken the bound silently to save quota.

## Contract validation gates

Require future checks for every private read/write, mass assignment, stale ETags, duplicate/mismatched idempotency keys, concurrent deletion, cross-question accepted answers, forged feedback source, altered version references, quota rejection, session expiry, socket replay, and missed tombstones. No API tests have been run: this is the design specification.
