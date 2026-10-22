# Database schema specification v1

Planning only · October 21, 2026. Relational blueprint, not SQL migrations. D1 is the recommended initial application database; each live room has separate SQLite-backed Durable Object storage. No cross-store foreign keys or distributed atomic transactions are assumed.

## Notation and global conventions

`PK` primary key, `FK` foreign key, `UQ` unique, `?` nullable. Application-generated opaque text IDs; times stored as integer UTC epoch milliseconds and serialized as RFC 3339. Revisions are positive integers. Booleans are checked 0/1. Enumerations are text with CHECK constraints. All ordinary entities include `created_at`; mutable ones include `updated_at, revision`. These shared fields are omitted below unless relevant. Never use display names/emails as application keys.

JSON is schema-validated, bounded text for content payloads/rubric answers/settings; use relational columns for permissions, joins, filtering, lifecycle and uniqueness. Index FK/read-path columns explicitly. Do not assume SQLite automatically indexes every FK. Default delete behavior is RESTRICT; child-only rows may use deliberate CASCADE after lifecycle cleanup. User-authored public resources use explicit deletion/anonymization, not accidental cascades.

D1 enforces foreign keys and supports transactional batches. A zero-row conditional UPDATE is not itself a failed statement: guarded dependent writes must check the same predicate or fail the transaction explicitly. Never append an unconditional outbox write after a failed compare-and-swap. [D1 batches](https://developers.cloudflare.com/d1/worker-api/d1-database/), [foreign keys](https://developers.cloudflare.com/d1/sql-api/foreign-keys/).

## Identity ownership

- `app_users(id PK, status, adult_declared_at?, eligibility_policy_version?, deletion_started_at?)`: status pending_onboarding/active/suspended/deleting. Authenticated but pending users cannot bypass adult onboarding.
- `auth_user_links(user_id PK FK app_users, auth_subject_id UQ)`: connects the library-managed identity to stable app identity. Same-store FK to the selected auth user table once names are pinned.
- Auth library tables: accounts, provider identities, sessions and verification challenges. Generate/review against the selected version; do not invent a competing handwritten schema. Require unique provider/subject, expiring sessions/challenges, revocation and safe credential storage verified in the auth adapter. No duplicate application password table.
- `profiles(user_id PK FK, handle_normalized UQ, display_name, locale, public_fields_json)`: normalized handle syntax reserved-name checks; public projection is allowlisted.
- `user_preferences(user_id PK FK, timezone?, discovery_opt_in, settings_json)`.
- `platform_role_assignments(user_id FK, role, granted_by FK, granted_at, PK(user_id,role))`: no donor role. Circle roles are separate.
- `consents(id PK, user_id FK, purpose, policy_version, scope_ref?, granted_at, revoked_at?)`: scoped sharing decisions, not a universal access bypass.

App-level account deletion removes auth records through the Identity adapter, then drops the mapping when no operational workflow needs it. No auth-library cascades may erase other people's public discussion context.

## Curriculum ownership

- `concepts(id PK, stable_key UQ, status)`; `concept_prerequisites(concept_id FK, prerequisite_id FK, PK(pair))`, CHECK distinct IDs. Cycle detection is a publication validator beyond FK checks.
- `learning_paths(id PK, stable_key UQ)`; `path_items(path_id FK, position, concept_id FK, lesson_id FK?, PK(path_id,position))`.
- `lessons(id PK, stable_key UQ)`; `lesson_versions(id PK, lesson_id FK, version_number, status, checksum, UQ(lesson_id,version_number))`; `lesson_concepts(lesson_version_id FK, concept_id FK, PK(pair))`.
- `lesson_localizations(lesson_version_id FK, locale, content_json, review_status, source_checksum, PK(version,locale))`: en/es required at publication.
- `exercises(id PK, stable_key UQ)`; `exercise_versions(id PK, exercise_id FK, version_number, format, evaluator_version, definition_json, checksum, UQ(exercise_id,version_number))`.
- `exercise_localizations(exercise_version_id FK, locale, prompt_hints_json, review_status, PK(version,locale))`; `exercise_concepts(exercise_version_id FK, concept_id FK, weight, PK(pair))`.
- `lesson_exercises(lesson_version_id FK, exercise_version_id FK, position, PK(lesson_version_id,position), UQ(lesson_version_id,exercise_version_id))`.
- `rubric_versions(id PK, stable_key, version_number, criteria_json, UQ(stable_key,version_number))`; `rubric_localizations(rubric_version_id FK, locale, content_json, PK(pair))`.
- `content_releases(id PK, status, manifest_checksum, published_at?)`; explicit `release_lessons`, `release_exercises`, `release_rubrics` joins with typed FKs. `active_release(locale PK, release_id FK, revision)` changes only after bilingual validation. Publish both required locale pointers atomically.

Published versions are immutable; corrections create versions. Retire/withdraw without breaking attempts referencing them. Content bundles can be published as immutable static assets; D1 stores version metadata and authoring records, not a required read for every lesson page.

## Learning ownership

- `exercise_drafts(id PK, user_id FK, exercise_version_id FK, revision, files_json, content_hash, UQ(user_id,exercise_version_id))`. Project drafts live in Projects; API exposes a common draft DTO without a generic untyped FK target.
- `draft_save_operations(id PK, user_id FK, draft_id FK, operation_id, request_hash, resulting_revision, UQ(user_id,draft_id,operation_id))`: minimum replay metadata, bounded retention. Revision preconditions still prevent stale replay after cleanup.
- `attempts(id PK, user_id FK, exercise_version_id FK, client_attempt_id, answer_json, answer_hash, hint_context_json, client_observation_json?, received_at, client_created_at?, UQ(user_id,client_attempt_id))`: immutable except governed private-data deletion. Do not trust client timestamps or pass flags as verified outcomes.
- `attempt_evaluations(id PK, attempt_id FK, evaluator_version, provenance, outcome_json, validity, UQ(attempt_id,evaluator_version,provenance))`: initial provenance may be client_observed; server_assessed is reserved for actual server evaluation.
- `evidence(id PK, user_id FK, concept_id FK, evaluation_id FK, evidence_kind, independence, policy_version, validity, UQ(evaluation_id,concept_id,evidence_kind,policy_version))`: peer feedback remains in its own domain and triggers a practice recommendation, not this verified-looking evidence row by default.
- `concept_progress(user_id FK, concept_id FK, state, policy_version, evidence_watermark, revision, last_delayed_success_at?, PK(user_id,concept_id))`.
- `review_items(id PK, user_id FK, concept_id FK, due_at, status, reason, policy_version, completed_attempt_id FK?)`: partial UQ(user_id,concept_id) for active scheduled/due items; completion checks attempt ownership/concept relevance.
- `notebook_entries(id PK, user_id FK, concept_id FK?, assumption, correction, private_code_json?, revision)`; `misconception_contributions(id PK, author_id FK?, concept_id FK, approved_copy_json, review_status, consent_id FK?)`. A contribution stores a separate copy; deleting the notebook cannot expose or accidentally alter it.

Indexes: attempts(user_id,received_at,id); evidence(user_id,concept_id,created_at,id); review_items(user_id,status,due_at,id). Draft writes coalesce; no keystroke history table.

## Projects ownership

- `project_template_versions(id PK, stable_key, version_number, definition_json, rubric_version_id FK, UQ(key,version))`; `project_template_localizations(template_version_id FK,locale,content_json,PK(pair))`; `project_template_concepts(template_version_id FK,concept_id FK,PK(pair))`.
- `project_workspaces(id PK, owner_id FK, template_version_id FK?, status, revision)`; `project_drafts(id PK, project_id FK UQ, revision, files_json, content_hash)`; `project_draft_save_operations` follows the exercise-draft operation pattern, scoped to authorized workspace owners.
- `project_snapshots(id PK, project_id FK, creator_id FK?, content_hash, files_json?, object_key?, byte_size)`: exactly one payload storage location; object storage is conditional, not mandatory under the zero-budget plan. Hash is not an authorization token or globally shared private resource lookup.
- `project_publications(id PK, project_id FK, snapshot_id FK, author_id FK?, description, status, consent_id FK?)`: snapshot must belong to project. Private history is not implied by publication.
- `project_handoffs(id PK, project_id FK, sender_id FK, recipient_id FK, input_snapshot_id FK, returned_snapshot_id FK?, contract_json, status, revision)`; `project_grants(id PK, project_id FK, principal_id FK, handoff_id FK?, permission, expires_at?, revoked_at?)`.

Published/shared copies have explicit retention and attribution; cleaning an account must not cascade-delete another person's independent returned work. Access checks follow current grants even if snapshot IDs are guessed.

## Community ownership

- `questions(id PK, author_id FK?, title, body, language, status, resolution, exercise_version_id FK?, revision)`; `question_concepts(question_id FK,concept_id FK,PK(pair))`.
- `shared_question_code(question_id PK FK, approved_files_json, content_hash, consent_id FK?)`: a copy, never a live private draft reference.
- `answers(id PK, question_id FK, author_id FK?, body, language, status, revision, UQ(question_id,id))`.
- `question_acceptances(question_id PK FK, answer_id, selected_by FK?)`: composite FK(question_id,answer_id) → answers(question_id,id) enforces same question. Selecting hidden answers is forbidden by the use case; hiding/deleting an answer clears selection transactionally.
- `question_replies(id PK,question_id FK,author_id FK?,body,status)` and `answer_replies(id PK,answer_id FK,author_id FK?,body,status)`: shallow replies, no recursive tree.
- `question_revisions` and `answer_revisions`: typed parent FK, revision, prior payload, actor, reason; restricted read permissions and separately bounded retention.
- Typed `question_bookmarks`, `question_subscriptions`, `answer_helpful_marks`: composite user/target PK, FK to target, no arbitrary polymorphic IDs.
- `bug_clinics(id PK,question_id FK UQ,expected,actual,status,revision)`; `clinic_traces(id PK,clinic_id FK,snapshot_json,content_hash,runtime_version,trace_json)`; `trace_steps(trace_id FK,step_id,PK(pair))`; `trace_annotations(id PK,trace_id,step_id,author_id FK?,body)`, composite FK to trace_steps. Payloads are bounded; old annotations never silently move to a new trace.
- `clinic_repairs(id PK,clinic_id FK,author_id FK?,code_json,explanation,status)`.

Indexes: questions(language,status,created_at,id), question_concepts(concept_id,question_id), answers(question_id,status,created_at,id), subscriptions(question_id,user_id). Search initially uses bounded indexed queries; any later text index is rebuildable and omits hidden/private content.

## Social ownership

- `blocks(blocker_id FK,blocked_id FK,PK(pair))`, CHECK different users; index reverse pair for incoming checks.
- `connection_requests(id PK,requester_id FK,recipient_id FK,pair_low,pair_high,status,expires_at,revision)`: canonical pair columns validated against participants; partial UQ(pair_low,pair_high) for pending state prevents opposite-direction duplicate offers.
- `connections(user_low FK,user_high FK,PK(pair))`, CHECK low < high. Block/removal transitions handled by Social.
- `circles(id PK,owner_id FK,name,purpose,language,visibility,membership_policy,status,permission_version)`; `circle_memberships(circle_id FK,user_id FK,role,state,revision,PK(pair))`.
- `circle_invitations(id PK,circle_id FK,sender_id FK,recipient_id FK,status,expires_at)`; `circle_goals(id PK,circle_id FK,body,status)`; `circle_check_ins(id PK,goal_id FK,author_id FK?,body)`; `circle_discussions(id PK,circle_id FK,author_id FK?,body,status,revision)` and typed discussion replies.
- `teach_back_sessions(id PK,concept_id FK,explainer_id FK,peer_id FK?,rubric_version_id FK,status,revision)`; `teach_back_artifacts(id PK,session_id FK,kind,payload_json,author_id FK?)`; `teach_back_feedback(id PK,session_id FK,author_id FK?,rubric_version_id FK,observations_json)`.

No private-message tables in initial scope. Invitations/circle discussions remain behind moderator activation. Circle ownership transfer is an explicit workflow before owner deletion/archive.

## Interview ownership

Curriculum publishes `interview_scenario_versions(id PK,stable_key,version_number,format,definition_json,rubric_version_id FK)` plus localized prompts and scenario/concept joins. Interviews owns usage records below.

- `interview_sessions(id PK,owner_id FK,scenario_version_id FK,mode,status,timer_seconds?,started_at?,completed_at?,revision)`.
- `interview_participants(session_id FK,user_id FK,role,state,PK(pair))`: unique active candidate/interviewer slots as applicable.
- `interview_artifacts(id PK,session_id FK,author_id FK?,kind,payload_json)`; `interview_feedback(id PK,session_id FK,author_id FK?,recipient_id FK,rubric_version_id FK,source,observations_json)`; `feedback_concepts(feedback_id FK,concept_id FK,PK(pair))`.
- `confidence_checks(id PK,session_id FK,user_id FK,value,scale_version)`; `practice_plan_items(id PK,user_id FK,feedback_id FK?,concept_id FK,action_kind,status)`.
- `availability_windows(id PK,user_id FK,start_at,end_at,timezone,status)` CHECK end > start.
- `match_proposals(id PK,candidate_id FK,interviewer_id FK,scenario_version_id FK?,start_at,end_at,status,revision)`; `match_confirmations(proposal_id FK,user_id FK,role,confirmed_at,PK(pair))`.
- `interview_reservations(user_id FK,slot_start,proposal_id FK,PK(user_id,slot_start))`: use fixed five-minute UTC slots for accepted bookings; bounded duration. Atomically reserve all required slots for both parties so overlaps fail by uniqueness. Availability is broader input; release reservations on cancellation. Exact slot granularity is a product default.

Indexes: sessions(owner_id,created_at,id), participants(user_id,state,session_id), feedback(recipient_id,created_at,id), windows(user_id,start_at). Rubric source cannot be chosen arbitrarily by a client.

## Moderation, notifications, and operations

- `reports(id PK,reporter_id FK?,target_kind,target_id,room_id?,reason,status)`; `moderation_actions(id PK,report_id FK?,actor_id FK?,action,target_kind,target_id,reason,status)`; `appeals(id PK,action_id FK,appellant_id FK?,body,status)`; `audit_events(id PK,actor_id FK?,action,resource_ref,safe_metadata_json)`.
- These cross-domain target references intentionally lack generic FKs; validate through typed domain ports and retain tombstone references. For chat, room_id is required; staff access is scoped to reported material. No magic FK to several tables.
- `notifications(id PK,recipient_id FK,category,target_kind,target_id,dedupe_key,read_at?,UQ(recipient_id,dedupe_key))`: no private body stored in generic previews; resolve current access at read.
- `outbox_events(id PK,event_type,schema_version,aggregate_id,payload_json,available_at,created_at)`; `event_deliveries(event_id FK,consumer,status,attempts,lease_until?,next_attempt_at,PK(pair))`; `processed_events(consumer,event_id,processed_at,PK(pair))` where needed for independent consumers.
- `api_operations(actor_id FK,operation,key,request_hash,status,response_ref?,expires_at,PK(actor_id,operation,key))`: no tokens/private-response bodies copied into generic cache.
- `export_jobs(id PK,owner_id FK?,status,expires_at?,artifact_ref?)`; `deletion_jobs(id PK,user_id FK?,disposition,status,started_at,completed_at?,receipt_hash?,receipt_expires_at?)`; `deletion_steps(job_id FK,domain,status,cursor?,last_error_code?,PK(pair))`.
- `deletion_ledger(id PK,subject_ref,scope,committed_at,retain_until)`: access-restricted reconciliation, not an indefinite hidden replacement user profile. Final retention tied to backup window before launch.

Indexes: events(available_at,id), deliveries(status,next_attempt_at), notifications(recipient_id,created_at,id), reports(status,created_at,id), jobs(status,created_at). Archive/cleanup bounds apply to operational records; ordinary chat has no automatic age expiry.

## Room directory in D1 and room-local schema

Realtime owns D1 `rooms(id PK,kind,circle_id FK?,title?,status,permission_version,storage_locator)` with CHECK topic has no circle / circle-room has circle. Social supplies membership policy; Realtime must not mutate circle memberships. `author_room_participation(user_id FK,room_id FK,first_seen_at,last_seen_at,PK(pair))` supports deletion discovery. Register an author-room relationship before permitting a first message; stale unused index rows are harmless. Prevent registration when account is deleting and recheck under the permission lease.

Each room's SQLite storage:

- `room_metadata(singleton PK,room_id,schema_version,next_message_sequence,next_event_sequence,permission_version,status)`.
- `messages(id PK,sequence UQ,author_id?,body?,status,revision,created_at,updated_at)`; author IDs are logical references, not cross-store FKs.
- `message_operations(actor_id,client_message_id,request_hash,message_id,PK(pair))`: retained dedupe reference while message exists; deletion may replace identity references according to cleanup policy.
- `room_events(event_sequence PK,type,message_id,revision,created_at,safe_payload_json)`: edits/deletes included for replay, no retained deleted body in the event payload.
- `room_control_operations(operation_id PK,kind,status,result_json)` for idempotent moderation/revocation/deletion.

Persist message, dedupe mapping, sequence update and replay event in one room transaction before acknowledgement. Presence and connections are transient runtime state. Search/export reads check current room permission and message status. Deletion applies to all stores and old body revisions; moderation evidence, if separately retained, has restricted ownership and an explicit policy.

## Transaction boundaries and race handling

Draft save: validate authorization, CAS revision plus request dedupe outcome atomically; zero-row CAS must yield conflict and no saved-success/outbox row. Attempt: unique client ID plus answer/evaluation/evidence/progress/outbox; optimistic progress revision guard prevents lost updates across different simultaneous attempts. Read-dependent computations may retry the whole guarded transaction with fresh state. No HTTP/provider calls inside a database transaction.

Answer acceptance and moderation: same-question composite FK and use-case visibility checks in the guarded write; clearing acceptance and hiding answer commit together. Cross-domain moderation invokes the owning domain transaction rather than writing foreign tables.

Deletion: account disable and cleanup intent are atomic in D1, while room/artifact cleanup is resumable. Reconcile author-room registration and in-flight lease writes before final completion; purge again after the maximum authorization lease has expired. Revoke receipts/cleanup references at their specified expiry. Do not announce completion before all mandatory steps reconcile.

Migration gates: one global ordered D1 history, separate versioned room-local migrations, schema checks before/after, production-like synthetic restore, bounded backfills, and no destructive release coupled to immediate old-client removal. Auth-generated schema must enter the same review process. This document does not claim that these constraints have been implemented or tested.
