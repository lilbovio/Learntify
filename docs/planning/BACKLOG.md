# Learntify prioritized delivery backlog

Planning specification · October 21, 2026

## How to use this backlog

Latest owner approval: remain in planning. APPROVED_BASELINE.md limits the future first build to accounts, bilingual lessons, isolated editor, continuous draft sync, attempts, progress, and basic reviews. Earlier P0 labels for forum, projects, social features and solo interviews denote full-product priorities, not requirements of that first build. Do not start experiments or scaffolding. Use the approved retention targets in future privacy/recovery acceptance checks.

API_CONTRACTS.md, DATABASE_SCHEMA.md, and MODULE_RULES.md now supply the design baseline for implementation items. Before building, validate their transaction assumptions and complete the still-open operational retention/provider checks. These files are Markdown specifications, not generated OpenAPI, migrations, or runtime rules.

Technical acceptance update: LRN-007 evaluates Better Auth/Resend against ADR-001; LRN-009 includes continuous cross-device draft sync and conflict recovery (ADR-002); LRN-015 includes capacity admission and deletion disposition (ADR-004/005); LRN-027 includes topic/circle rooms, indefinite ordinary history, reconnect deduplication and revocation (ADR-003). These supersede any simpler local-only draft or bounded-retention interpretation. Provider selections remain validation-gated.

Social release gate is now decided: public posting/chat stay unreleased until moderators join. Split core-learning readiness from social activation; forum/circle/chat development remains planned but is not required to activate an unstaffed community. Before community activation, require the moderation checks in LRN-012 and confirmed English/Spanish ownership. Email authentication is passwordless. MIT scope and copyright holder are resolved in DECISIONS.md.

Owner-decision update: DECISIONS.md governs launch constraints. LRN-016 connections, LRN-017 asynchronous circles, and LRN-027 live text rooms now belong to initial social-release scope. Their technical dependencies remain, but do not postpone them solely because of the original release headings. Delivery effort remains unestimated for the sole maintainer. Public posting/chat activation requires the pending moderation decision; advanced editing remains later scope.

Architecture gate: application implementation, scaffolding, and prototypes are deferred by the owner. First review ARCHITECTURE.md, CODE_STRUCTURE.md, and OPEN_SOURCE.md. D1 references in future items are conditional on the database decision; replace provider-specific acceptance checks with the selected provider before implementation. MIT is confirmed. This backlog does not authorize starting construction.

All items are planned, not implemented. IDs are stable for later issue creation; no external issues have been created. P0 means required for the first usable release; P1 expands the confirmed social/interview experience; P2 adds live collaboration and operational scale. P2 features remain committed product scope, not paid upgrades.

Dependencies indicate delivery order, not separate services. Team capacity is unknown, so dates and effort estimates remain unset. Each item includes acceptance criteria that can become implementation checks. Curriculum expansion continues alongside product work with the same bilingual review gate.

Every shipped feature is free. Shared definition of done: English/Spanish interface and required authored content; accessible keyboard flow; privacy/authorization checks; meaningful loading/error/empty states; relevant tests; operational visibility without private payload logging; and a documented recovery path where data can be lost. Do not add speculative infrastructure merely to close a planning item.

## Release 0 — Resolve foundational risks

### LRN-001 · P0 · First-unit learning specification

Outcome: one coherent unit for values, decisions, and functions, with three fully authored bilingual lessons and the outline for the remaining first-release lessons.

Depends on: none.

Acceptance: each lesson names objectives, prerequisites, misconceptions, varied tasks, graduated hints, reference solutions, and transfer checks; both languages receive review; one concept has a project application and interview scenario. The concept graph has no cycles. Screen links: S05–S08, S21.

### LRN-002 · P0 · Claymorphism design system and journey prototype

Outcome: a recognizable, usable visual language demonstrated through Today → Lesson → Question → Interview review.

Depends on: LRN-001 sample content.

Acceptance: tokens cover typography, spacing, color, depth, focus, and states; clay depth is selective; no purple-gradient identity; code and threads remain readable; prototype includes English/Spanish and mobile layouts; keyboard, contrast, and reduced-motion checks are recorded. This is a prototype milestone, not production deployment.

### LRN-003 · P0 · Separate client/server Cloudflare spike

Outcome: independently buildable client and Worker-compatible server with a minimal versioned API contract.

Depends on: none; can proceed alongside content/design.

Acceptance: local setup is documented; client contains no server secrets; contracts are validated; same-origin API routing or explicit CORS strategy is selected; D1 migrations, atomic write strategy, and restoration approach are demonstrated; quota assumptions are recorded. Remote deployment requires configured account access and is a later implementation action, not authorized spending.

### LRN-004 · P0 · Authentication decision and threat model

Outcome: select a maintained compatible authentication approach, initial sign-in methods, recovery strategy, and session design.

Depends on: LRN-003.

Acceptance: sign-in, cancellation, expiry, revocation, account linking, guest import, and recovery are designed; provider compatibility is tested; no unverified-email merging; outbound email dependency is explicit if selected; privileged-role protection and object authorization rules are documented.

### LRN-005 · P0 · Browser execution proof

Outcome: isolated introductory JavaScript execution with useful feedback.

Depends on: LRN-001, LRN-003.

Acceptance: infinite loops terminate; output size is bounded; learner code cannot access application credentials or parent state; network restrictions are verified; viewing a forum post cannot execute code; evaluation provenance is clear; supported-browser assumptions and accessible output are documented.

Release gate: sample lessons are reviewed, the four-screen prototype is usable, and auth/execution/persistence choices have evidence. Resolve the intended age audience and moderation coverage before public social features launch.

## Release 1 — A complete learn/help/interview loop

### LRN-006 · P0 · Application shell and localized navigation

Depends on: LRN-002, LRN-003.

Acceptance: released routes support both locales; language switching preserves workspace state; deep links and back navigation work; unavailable future sections are absent; layouts support narrow screens and keyboard navigation. Screens: S01, S03–S06, shared shell.

### LRN-007 · P0 · Accounts and guest continuity

Depends on: LRN-004, LRN-006.

Acceptance: users can sign in/out, recover through the selected path, revoke sessions, and retain guest work; retries cannot duplicate imported attempts; conflicting project drafts are both preserved; owner-only endpoints reject other accounts; session expiry does not destroy a draft. Screens: S02, S25.

### LRN-008 · P0 · Bilingual content pipeline

Depends on: LRN-001, LRN-003.

Acceptance: schemas validate versioned lessons/exercises/rubrics; reference solutions pass and known incorrect solutions fail relevant tests; missing required translations block publication; editors can preview/review/publish and inspect failures; historical content references remain resolvable. Initial author UI may be minimal. Screen: S26.

### LRN-009 · P0 · Lesson editor, hints, and practice formats

Depends on: LRN-005, LRN-006, LRN-008.

Acceptance: reading, output prediction, coding, debugging, hints, and submission work end to end; solution reveal is recorded honestly; drafts recover after reload; network failures show local/pending status; task feedback explains the relevant error. Screens: S07–S08.

### LRN-010 · P0 · Evidence, progress, and review scheduling

Depends on: LRN-007, LRN-009.

Acceptance: attempts pin exercise versions; duplicate submissions do not duplicate evidence; hint-assisted and independent attempts remain distinct; progress explains its evidence; delayed reviews are generated once; a policy change can recompute projections without rewriting attempts. Screens: S04, S06, S08–S09.

### LRN-011 · P0 · Forum with lesson context

Depends on: LRN-007–LRN-009. Public launch also requires LRN-012.

Acceptance: public reading/search and authenticated questions/answers work; language/concept filters and cursor pagination are bounded; ask-from-lesson previews the exact shared snapshot; returning preserves the exercise; acceptance only selects an answer on that question; Markdown is sanitized; hints/spoilers are supported. Screens: S11–S13.

### LRN-012 · P0 · Moderation and blocking

Depends on: LRN-004, LRN-007, LRN-011 data contracts.

Acceptance: report, mute, block, moderator queue, actions/reasons, appeal submission, and audit history work; permissions distinguish moderator/editor/admin; spam limits are exercised; notifications and discovery respect blocks; removing content clears invalid accepted-answer status; English/Spanish reporting guidance and a launch moderation owner exist. Screens: S13, S25, S27.

### LRN-013 · P0 · In-app notifications and subscriptions

Depends on: LRN-007, LRN-011, LRN-012.

Acceptance: subscribed answers produce deduplicated notifications; marking read is idempotent; preferences are respected; removed/private targets cannot leak text through a notification; no email or push dependency is required. Screen: S18.

### LRN-014 · P0 · First project and solo interview bridge

Depends on: LRN-008–LRN-010.

Acceptance: one project applies the first-unit concepts; a linked solo scenario guides clarification, planning, implementation, tests, and reflection; feedback is labeled as self-review or test output; missed concepts link back to practice; timer is optional; results are private; both languages are complete. Screens: S19, S21–S23.

### LRN-015 · P0 · Privacy, resilience, and first release readiness

Depends on: LRN-006–LRN-014.

Acceptance: export/deletion flows match the published retention policy; private artifacts never appear in public search; restoration is rehearsed; logs exclude sensitive payloads; usage/error monitoring exists; offline/quota failure preserves supported local practice without false success; a representative end-to-end journey passes in both languages. Publish the no-paywall/donation policy.

Release gate: a guest starts a lesson, registers without losing work, submits an attempt, asks for help, receives an answer, performs a fresh attempt, completes the project/interview bridge, and returns to a justified review. Run a small beginner pilot in both languages; prioritize observed confusion before increasing content volume. Planning target remains roughly 12 lessons and 30–40 varied exercises, with quality and complete flows taking precedence over counts.

## Release 2 — Distinctive social learning

### LRN-016 · P1 · Profiles, connections, and learning buddies

Depends on: LRN-007, LRN-012–LRN-013.

Acceptance: opt-in profiles expose only chosen fields; mutual connection requests can be accepted/declined/cancelled; blocking prevents new requests and removes matching eligibility; matching explains language/topic/availability criteria; no match returns useful solo alternatives. Screen: S15.

### LRN-017 · P1 · Study circles

Depends on: LRN-016.

Acceptance: create/join/request/invite/leave flows reflect the circle's membership policy; roles authorize actions; goals, asynchronous check-ins, and discussion work; private circles never leak into public search; ownership transfer/archive and reporting are supported. Screen: S16.

### LRN-018 · P1 · Mistake notebook and reviewed contributions

Depends on: LRN-009–LRN-010, LRN-012.

Acceptance: users can capture a misconception, corrected reasoning, and revisit action; entries are private; a public contribution is a separately previewed copy that requires review; private history is never exposed; deletion behavior for both copies is explicit. Screen: S10.

### LRN-019 · P1 · Bug clinics and trace annotations

Depends on: LRN-005, LRN-011–LRN-012.

Acceptance: a learner shares a bounded reproducible trace; annotations anchor to immutable snapshot/step IDs; helpers cannot modify the learner's private code; revised code generates a new trace; the learner explains/verifies a repair before resolving; keyboard/text trace navigation works. Screen: S14.

### LRN-020 · P1 · Explain it back

Depends on: LRN-010, LRN-013, LRN-016.

Acceptance: invite a peer, publish the scoped explanation, receive a follow-up and rubric feedback, revise, and reflect; cancellation/expiry/blocking are handled; no response offers self-review; peer feedback does not automatically establish mastery. Screen: S17.

### LRN-021 · P1 · Project handoffs

Depends on: LRN-014, LRN-016.

Acceptance: a handoff includes contract, tests, documentation, and immutable input snapshot; receiver explicitly accepts scoped access; returned work preserves attribution; revisions cannot overwrite the sender's workspace; cancellation/revocation is enforced on future reads. Screen: S20.

### LRN-022 · P1 · Help that teaches

Depends on: LRN-011, LRN-019–LRN-020.

Acceptance: optional feedback distinguishes useful explanation, useful question, and useful example; recognition is modest and noncompetitive; counts do not confer expert status or moderation power; abuse reporting and undo are supported; donation status has no effect. Screens: S13–S17.

Release gate: learners can move from a lesson into a clinic, teach-back, or circle and return to independent practice. Verify privacy/blocking across those transitions, not only on individual screens. Pilot participation rates and unanswered requests to avoid building flows that assume constant volunteer availability.

## Release 3 — Full interview preparation

### LRN-023 · P1 · Interview scenario library and rubrics

Depends on: LRN-008, LRN-014.

Acceptance: reviewed bilingual scenarios cover practical coding, algorithms at appropriate levels, debugging, code review, project walkthroughs, and behavioral discussion; rubrics cover reasoning/communication/testing/recovery; prompts specify prerequisites and variants; behavioral examples encourage honesty; no hiring score is generated. Screens: S21–S23.

### LRN-024 · P1 · Peer matching and scheduling

Depends on: LRN-016, LRN-023.

Acceptance: both participants confirm role/language/time; time zones display correctly; overlapping commitments, expiry, declines, cancellation, no-shows, and blocking are handled; only opted-in availability is used; solo fallback is always available. Screen: S24.

### LRN-025 · P1 · Peer mock sessions and private feedback

Depends on: LRN-013, LRN-023–LRN-024.

Acceptance: role-specific prompts and private session access work; initial asynchronous/text-and-snapshot sessions need no video; participants can cancel/resume as permitted; feedback labels its source, pins rubric version, and links concepts; confidence remains separate; feedback never appears on a public profile automatically. Screens: S22–S23.

### LRN-026 · P1 · Feedback-to-study plans

Depends on: LRN-010, LRN-018, LRN-025.

Acceptance: learners can accept/dismiss specific lesson, review, or project suggestions derived from feedback; recommendations explain their origin; peer opinion does not overwrite evidence; a later fresh attempt can demonstrate improvement; optional English communication practice never penalizes accent. Screens: S04, S08–S10, S23.

Release gate: run a complete peer interview → feedback → targeted study → fresh scenario journey in both languages, including cancellation and no-partner paths. All interview formats remain free.

## Release 4 — Live collaboration and growth

### LRN-027 · P0 social launch · Live help and study rooms

Depends on: LRN-007, LRN-012, LRN-017, agreed moderation coverage, validated current hosting limits. Peer interviews are not a prerequisite for basic live text rooms.

Acceptance: room-scoped coordination supports authorized joins, reconnection, bounded history, backpressure, and moderator removal; permission changes revoke participation; persistent messages have one declared storage owner; useful summaries can be deliberately published as forum threads; asynchronous help remains usable when rooms are unavailable.

### LRN-028 · P2 · Collaborative editing

Depends on: LRN-021, LRN-027.

Acceptance: prototype concurrent edits, conflict recovery, late joins, reconnect, attribution, snapshot export, and permission revocation; pick a synchronization model based on the prototype; editing code never executes it automatically; accessible solo editing remains intact.

### LRN-029 · P2 · Advanced execution decision

Depends on: LRN-005, curriculum needs, measured funding/capacity.

Acceptance: document whether browser execution still meets needs; if server evaluation is required, validate a separate hostile-code isolation boundary, job limits, no production secrets, cleanup, abuse controls, cost caps, and provenance. Do not route arbitrary code into the application Worker or assume free-tier support for a container fleet.

### LRN-030 · P2 · Capacity and service extraction

Depends on: production-like measurements from earlier releases.

Acceptance: benchmark representative queries, notifications, and room fanout; document quota and latency triggers; rehearse quota exhaustion; select scaling changes from evidence; preserve API/version compatibility and free access; obtain actual hosting budget before enabling paid infrastructure. Extraction requires a concrete security, ownership, deployment, or scaling reason.

### LRN-031 · P1 continuing · Curriculum expansion

Depends on: LRN-008 and teaching-loop pilot findings.

Acceptance per unit: reviewed bilingual instruction, misconception feedback, multiple task formats, independent transfer, delayed review, project application, and a relevant interview bridge. Expand through collections, JavaScript behavior, browser/async work, data structures/algorithms, and engineering in the blueprint's order. Content is a continuous workstream, not a final polish task.

## Future implementation order — after architecture review

1. LRN-001: author the first three lessons and one concept-to-interview scenario completely.
2. LRN-002: prototype Today, Lesson, Question, and Interview review using that real content.
3. LRN-003–LRN-005: prove the client/server, auth, and execution foundations.
4. Implement LRN-006–LRN-010 to make learning and progress work.
5. Implement LRN-011–LRN-015 to complete the first integrated release.

Immediate planning sequence: review system boundaries and data ownership; agree capacity/reliability assumptions; decide persistence and budget constraints; review package/import rules; resolve MIT coverage and governance; document remaining decisions in ADRs. No application construction begins until the user asks to leave planning.

Remaining planning decisions: team availability, review ownership in both languages, intended age audience, initial identity providers, recovery delivery, copyright holder and content/asset license coverage, domain/account configuration, production database, and an operating budget ceiling. MIT software licensing is already selected.
