# Learntify — product and learning blueprint

Planning draft · October 21, 2026

Current phase: architecture and repository planning only. The owner explicitly deferred application code, scaffolding, and prototypes. MIT is confirmed for the open-source software. The architecture baseline below supersedes earlier suggestions to start implementing the first unit. A 100,000-user first-week scenario is modeled as a capacity hypothesis, not a validated forecast.

Confirmed direction: complete beginners; English and Spanish launch together; every feature free; voluntary donations; a community forum and social connections; authentication; practical interview preparation; claymorphism; separately deployed client and server; Cloudflare-first hosting with a free-tier starting budget. Plan for a large product and growth, without assuming unlimited free infrastructure. This document proposes a direction, not a fixed scope or delivery commitment.

## 1. The promise

Learn JavaScript from first principles, understand why programs behave as they do, and become able to build and debug independently.

The product should help learners answer four questions: What am I learning? Why does it matter? What do I actually understand? What should I practice next?

Success means retained understanding and independent transfer to unfamiliar tasks. Completion, streaks, test passes, and time spent are supporting signals, not proof of competence. No platform can guarantee learning; Learntify should make its evidence and uncertainty visible.

Non-negotiables:

- No paid lessons, hints, projects, assessments, progress features, community access, connections, or interview tools. Donations never unlock access, priority, or better learning outcomes.
- Useful without registration; accounts add synchronization and recovery.
- All required explanations, feedback, and assessments available in English and Spanish.
- Learning does not depend on a paid AI provider.
- Beginner-friendly explanations, accessible interactions, and modest device requirements.
- Learners can revisit any content. Recommendations guide progress without trapping people behind a test.
- Software and all original project materials created by Juan Pablo Bovio Vallejo use MIT. Preserve third-party licenses and provenance; user content is not automatically relicensed.

## 2. The teaching loop

Each lesson follows: recall → explain → predict → investigate → practice → transfer → revisit.

1. Recall a small prerequisite without looking at the answer.
2. Explain one concept using a short worked example and a useful mental model.
3. Predict the output or state before running code.
4. Step through execution and compare the result with the prediction.
5. Complete a partially worked example, then solve a fresh task independently.
6. Explain or debug a different use of the same concept.
7. Revisit it later inside a mixed exercise or project.

Use multiple formats: output prediction, code tracing, ordering code fragments, bug repair, short explanations, implementation, test writing, refactoring, and projects. Every concept needs more than one format. Provide keyboard and text alternatives to visual or drag-based interactions.

Hints progress from a question, to the relevant concept, to a partial example, to a worked solution. A solution reveal leads to another fresh attempt later; it should never shame the learner or silently count as independent mastery.

Example — loops and off-by-one errors:

- Goal: explain exactly which array indexes a loop visits.
- Prerequisites: arrays, comparison, assignment, and index access.
- Predict the values of `i` for a three-element array.
- Inspect a trace showing `i`, the condition, the accessed element, and the accumulator.
- Repair `i <= items.length` and explain the extra iteration.
- Implement a total without copying the example.
- Transfer the idea to filtering a list; test an empty list and a single item.
- Revisit in a shopping-cart project and a delayed retrieval exercise.

Learning-science basis: spaced review, retrieval, and alternating worked examples with problem solving are supported by the IES practice guide. Specific schedules and thresholds below are product hypotheses to test, not established universal formulas.

## 3. Curriculum map

Teach language fundamentals before frameworks. Introduce small algorithms naturally from the beginning, then formalize data structures and analysis after learners can write and debug functions.

### Stage 0 — Getting comfortable with programs

Instructions, input/output, values, expressions, statements, console, errors, and editing/running code. Explain what JavaScript is and distinguish the language from browser and server environments. No installation required.

Deliverable: a tiny interactive story or personalized message generator. Evidence: predict outputs and repair a syntax error.

### Stage 1 — Syntax and basic reasoning

`const` and `let`, identifiers, numbers, strings, booleans, `null`, `undefined`, operators, comparisons, strict equality, explicit conversion, truthiness, conditionals, and template literals. Introduce coercion carefully after explicit conversion; avoid presenting JavaScript surprises as trivia to memorize.

Deliverable: a unit converter and rule-based eligibility checker. Evidence: explain branch selection and handle boundary values.

### Stage 2 — Functions and decomposition

Parameters, arguments, return values, local scope, function declarations and expressions, callbacks at an introductory level, pure functions, side effects, decomposition, and basic assertions. Distinguish returning a value from printing it.

Deliverable: a pricing engine built from small functions. Evidence: design tests, trace calls, and reuse a function in a new context.

### Stage 3 — Collections and iteration

Arrays, objects, property access, loops, iteration, mutation, references, identity, shallow copies, destructuring, rest/spread, and array methods after explicit loops are understood. Include nested collections, missing properties, and empty inputs.

Deliverable: a library inventory or expense analyzer. Evidence: transform unfamiliar data and explain mutation bugs.

### Stage 4 — How JavaScript behaves

Lexical scope, closures, call stack, recursion foundations, hoisting and temporal dead zone, `this`, prototypes, classes, modules, errors, and exceptions. Distinguish useful mental models from literal engine implementation details.

Deliverable: a modular quiz engine with encapsulated state. Evidence: explain captured variables and debug reference/scope errors.

### Stage 5 — Browser programming

A small HTML/CSS/accessibility bridge, then DOM, events, forms, validation, storage, rendering state, event propagation, and safe text insertion. Explain language APIs versus browser APIs.

Deliverable: an accessible task manager. Evidence: keyboard interaction, validation, persistence, and debugging with browser tools.

### Stage 6 — Asynchronous JavaScript

Callbacks, promises, `async`/`await`, event-loop concepts, tasks and microtasks, HTTP basics, JSON, `fetch`, loading/error states, cancellation, concurrent requests, and race conditions. Use controlled local fixtures before relying on public APIs.

Deliverable: a searchable catalog with simulated delays and failures. Evidence: reason about execution order and prevent stale results.

### Stage 7 — Data structures

Abstract data types; arrays versus linked lists; stacks, queues, sets, maps, hash tables, trees, heaps, and graphs. For each: real use case, operations, a small implementation, complexity, tradeoffs, and relevant built-ins. Teach when native `Map` or `Set` is the sensible choice.

Deliverables: undo history, task scheduling, and a dependency explorer. Evidence: justify a structure choice and identify its limitations.

### Stage 8 — Algorithms and reasoning

Operation counting, input size, time/space complexity, linear and binary search, sorting, recursion, divide and conquer, two pointers, sliding windows, BFS/DFS, greedy reasoning, backtracking, and dynamic programming. Include invariants, counterexamples, correctness, and testing. Teach the math needed at the point of use.

Deliverables: search indexing, route exploration, and scheduling. Evidence: explain correctness, compare approaches, and handle adversarial cases—not merely match expected outputs.

### Stage 9 — Building dependable software

Git, package management, Node.js, filesystem and HTTP fundamentals, API design, databases, testing, integration tests, security basics, performance measurement, deployment, observability, and documentation. TypeScript becomes an extension after JavaScript foundations. Framework tracks follow the core path.

Deliverable: a small deployed application with tests and a design explanation. Evidence: implement a new requirement, investigate a defect, and explain tradeoffs.

Optional advanced paths: language internals, functional programming, deeper algorithms, backend systems, frontend architecture, accessibility, and open-source contribution. Do not make completing all advanced paths a prerequisite for building useful software.

## 4. Study plans and adaptation

Offer a recommended path plus flexible exploration. Ask about available time and goals; do not promise job readiness by a calendar date.

- Gentle: three 25-minute sessions weekly, one concept split across sessions.
- Steady: five 40-minute sessions weekly, mixing instruction, practice, and project work.
- Intensive: five 75-minute sessions weekly, divided into shorter blocks with breaks.

A sample 40-minute session: 5 minutes retrieval, 10 explanation/tracing, 15 independent practice, 10 project work/reflection. Adjust when a learner needs more time; never punish slower reading or accessibility needs.

First four weeks are an illustrative sequence, not a mastery deadline: week 1 programs/values; week 2 decisions; week 3 functions; week 4 combining functions in a small project. Move forward or review according to evidence.

Start adaptation with explainable rules:

- Track concepts as unseen, introduced, practicing, independently demonstrated, and review due.
- Record concept, task version, outcome, hint use, solution reveal, and whether the task was familiar or novel.
- Require evidence across multiple tasks and at least two formats before marking independent demonstration.
- Add a delayed check before describing a skill as retained; do not erase prior achievement when review becomes due.
- Initial review candidates: approximately 1, 3, 7, and 21 days, adjusted by performance and actual return dates.
- Repeated misconception → targeted explanation and simpler prerequisite task; success → a transfer task.
- Explain recommendations: “Review array indexing because your last two attempts accessed one position beyond the array.”

Do not infer mastery from typing speed, minutes watched, or raw attempt counts. Keep an override so learners can continue. Use richer statistical models only after collecting enough validated data to justify them.

## 5. Bilingual curriculum as a core system

One language-independent concept graph and exercise identity, with reviewed English and Spanish content variants. Switching language must preserve progress, code, and exercise state.

Maintain a bilingual terminology glossary; show JavaScript keywords unchanged. Explain terms such as scope/ámbito and closure/cierre consistently. Prefer neutral Spanish initially, and invite regional terminology feedback.

Each lesson release requires both languages: explanation, hints, feedback, captions, image descriptions, assessment instructions, and solution reasoning. Track translation status and source revision so content changes cannot silently leave Spanish stale. Machine translation can draft; human review is necessary before release. Test layouts with longer Spanish text.

Assess the programming concept rather than English fluency. Free-text explanations should support either language, use published rubrics, and provide self-comparison or optional human review. Do not claim reliable automatic semantic grading without validation.

## 6. Product surfaces

Core: learning map; lesson reader; editor and output panel; accessible execution traces; misconception-specific feedback; review queue; project workspace; progress evidence; bilingual reference/glossary; content issue reporting; account/export settings.

Author tools are a first-class product: lesson preview, exercise fixtures, translation status, concept dependencies, validation, version comparisons, and review workflows.

Core community scope: searchable questions and answers, lesson-linked discussions, profiles, opt-in connections, notifications, and moderation. Later expansion: study circles, live rooms, peer interviews, community projects, contributor dashboards, offline lesson packs, and optional AI assistance. Moderation and abuse handling ship alongside community posting.

Avoid public speed rankings and streak loss pressure. Celebrate explanations, repairs, persistence, and project milestones.

## 7. Architecture: ambitious scope, explicit boundaries

Recommendation: a monorepo with a modular application backend, plus a separately deployed execution boundary. Repository count and service count are independent decisions. A large product does not require many services on day one.

Proposed deployables:

- Learner web app: lesson delivery, editor, local execution, progress UI, bilingual routing.
- Author/admin app: content preview, publishing review, translations, issue triage.
- Application API: identity, curriculum catalog, attempts, progress, recommendations, and projects as explicit internal modules.
- Background worker: review scheduling, publishing jobs, notifications, and aggregate analytics.
- Isolated runner: only when server-side or authoritative assessment is needed; separate credentials, network policy, resource limits, and deployment lifecycle.
- Static content delivery and object storage: versioned lesson bundles and project assets.

Revised starting stack for the confirmed hosting direction: TypeScript; React with Vite for the independently built client; a separately deployed Cloudflare Worker API using a Worker-compatible router (Hono is a candidate); D1 for initial relational persistence; optional R2 for uploads; SQLite-backed Durable Objects for live room coordination when introduced. Validate library/runtime compatibility in a spike. This replaces the earlier Node/Fastify/PostgreSQL hosting proposal. PostgreSQL remains a possible migration target if measured database needs justify it. Choose an editor after accessibility and mobile testing. Publish public curriculum as static content. Separate client/server builds, deployments, tests, and configuration even when they share a repository.

Suggested repository structure:

```text
apps/client
apps/author
services/server
services/worker
services/runner
packages/contracts
packages/learning-engine
packages/exercise-schema
packages/ui
packages/i18n
curriculum/concepts
curriculum/en
curriculum/es
infra
docs/decisions
```

Extract services when there is a concrete reason: independent scaling, a security boundary, a separate owning team, different availability needs, or deployment contention. Possible later separations: assessment orchestration, content publishing, analytics, and collaboration. Avoid distributed transactions across progress/attempts at first.

Core entities: learner/guest identity, concept, prerequisite edge, lesson version, localized content version, exercise version, attempt, evidence record, mastery state, review item, project snapshot, and content issue. Store immutable attempt evidence and derive progress from it. Pin versions so a curriculum edit does not change the meaning of an old result. Validate the prerequisite graph for cycles.

Use versioned API contracts and idempotent attempt submission. Save an attempt and its progress update transactionally. When background delivery matters, use an outbox with idempotent consumers rather than claiming exactly-once delivery.

## 8. Running code safely and affordably

Browser execution should cover most introductory work. Use a dedicated sandbox origin without application cookies or credentials; workers permit termination of runaway loops, but are not a complete security boundary. Restrict network access and message formats. DOM exercises need an appropriately sandboxed iframe and explicit origin/message validation. Test the full isolation design before accepting arbitrary code.

Client-side tests provide learning feedback, not trustworthy certification; learners can inspect or alter them. If authoritative results become necessary, run assessments in isolated server jobs. Do not use `eval` in the API process or treat Node's `vm` module as a security sandbox.

Server execution requires strong isolation, deny-by-default network access, CPU/memory/time/output limits, ephemeral storage, no production secrets, abuse quotas, and cleanup verification. Containerization alone should not be assumed sufficient for hostile workloads. Validate an isolation approach in a focused security spike before public release.

Full browser Node environments are optional later. WebContainers have browser and cross-origin-isolation requirements; evaluate compatibility, licensing, and cost before adoption. They should not be required to complete the beginner curriculum.

## 9. Keeping everything free

Free for learners still requires a sustainable operating model. Proposed funding: voluntary donations, grants, transparent sponsorship, and institution-supported hosting with no paid learning advantage. Do not depend on unlimited free cloud tiers or unlimited AI inference.

Reduce costs through static lesson delivery, browser execution, cached assets, sensible upload limits, and optional accounts. Preserve basic lessons and local practice if hosted jobs are temporarily unavailable. Apply fair-use limits to costly compute, not paywalls to concepts or hints.

Before public growth, measure cost per active learner and per server job. Budget model: base hosting + storage/egress + executed jobs × average job cost + moderation/support. Model low, expected, and high usage with real provider quotes; no hosting estimate is reliable yet.

Select code/content licenses deliberately, maintain third-party attribution, and create a contribution policy. Default to minimal analytics; allow account deletion and progress export. Avoid recording raw code or personal content in analytics by default. Decide age eligibility and applicable privacy requirements before launching to children.

## 10. Quality and evidence

Content pipeline: draft → pedagogical review → technical review → bilingual review → automated validation → learner pilot → publish. Validate code examples, reference solutions, expected failing solutions, tests, prerequisite links, localization completeness, and accessibility.

Use tests for behavior and targeted syntax analysis only when the learning objective requires a particular construct. Do not reject correct alternative implementations for arbitrary style. Include boundary cases and mutation tests for important exercise suites. Deterministic feedback should explain a misconception instead of merely reporting a failed test.

Measure independent transfer success, delayed retrieval, hint dependence over time, recurring misconceptions, and project rubric outcomes. Also monitor abandonment, accessibility friction, language differences, runtime failures, and cost. Define metrics clearly and avoid interpreting a tiny volunteer pilot as proof of broad effectiveness.

Pilot with 5–10 consenting beginners across both languages. Observe confusion, interview learners, and compare performance on fresh tasks after a delay. Use findings to revise teaching before expanding content volume. This sample is for discovery, not statistically conclusive efficacy claims.

## 11. Build roadmap with exit criteria

### Phase A — Teaching and technical proof

Write the product charter, concept graph for stages 0–2, terminology glossary, lesson schema, three complete bilingual lessons, sample assessments, and an execution threat model. Spike editor accessibility, sandbox behavior, and progress persistence.

Exit: beginners can complete the sample path, explanations address observed misconceptions, and the execution approach is technically viable. Estimate delivery only after team availability is known.

### Phase B — One complete learning path

Build roughly 12 bilingual lessons covering values, decisions, and functions; 30–40 varied exercises; a small project; tiered hints; progress evidence; a rule-based review queue; guest use; and optional account synchronization. These quantities are planning targets, not the definition of success.

Exit: learners can study, practice, recover work, change language, receive useful feedback, revisit concepts, and complete a fresh transfer task end to end. No critical isolation or accessibility defect remains open.

### Phase C — Foundations release

Extend through collections and core JavaScript behavior. Add reusable traces, content contribution workflows, project rubrics, export/delete functionality, operational monitoring, backups, and restoration drills.

Exit: bilingual publishing is repeatable, progress survives content updates, and running/support costs are understood.

### Phase D — Applied JavaScript

Add DOM and asynchronous programming, multi-file projects, failure simulation, and a hardened server runner only if required by the content.

Exit: learners build and debug useful applications, and expensive execution is bounded and observable.

### Phase E — Computer science and ecosystem

Add data structures, algorithms, backend engineering, TypeScript extensions, and carefully moderated collaboration. Extract services as operational evidence warrants.

Exit: advanced content has the same review and learning standards as the introductory path; growth does not erode the free core.

## 12. Decisions to settle next

Confirmed: complete beginners, simultaneous English/Spanish launch, all features free, donations only, forum and social connections, authentication, interview preparation, claymorphism, separate client/server deployments, and Cloudflare-first hosting.

Still open: team capacity and weekly availability; hosting budget; age audience; code/content licenses; supported devices; availability of bilingual reviewers; governance and funding preferences.

Current next task: review architecture, capacity assumptions, persistence choice, domain boundaries, repository organization, and MIT stewardship before any application implementation. First-unit and prototype work remain future backlog items.

## 13. Community: a forum that connects to learning

The community is a core product pillar. Everyone with an account can ask and answer, subject to shared moderation and abuse limits; nobody pays to participate. Public questions remain readable without an account.

Launch with durable, searchable threads and conversational replies. A question has a title, body, language, concept/lesson tags, optional code snapshot, answers, and clarification replies. Include bookmarks, subscriptions, helpful reactions, an author-selected helpful answer, edit history, and unresolved filters. An accepted answer indicates that it helped the asker, not that staff verified its correctness.

Question prompts: What were you trying to do? What happened? What did you try? What part is confusing? Keep these helpful and lightweight for beginners. Suggest related threads without preventing a new question.

From a lesson, “Ask the community” can attach the exercise version and a learner-approved code snapshot. Preview exactly what becomes public; never publish private workspace data automatically. Readers can explicitly run a fork in the isolated sandbox. Viewing a post never executes its code. Offer spoiler controls and hints-first answer formatting.

English and Spanish threads share concept tags and have language filters. Preserve original text and label any translation. Do not promise automatic translations without a funded implementation. Both language communities need moderator coverage.

Live rooms are a later layer over the persistent forum: topic-based help, presence, replies, and bounded history. Useful conclusions can become a thread summary with participant consent. Avoid one global endless chat where answers disappear.

Moderation launch requirements: report, block, mute, spam throttling, sanitized Markdown, link controls, moderator queue, reversible actions, audit history, appeals, and a clear code of conduct. New-account limits respond to abuse risk rather than donation status. Search results, notifications, and live rooms must honor blocks and visibility rules. Keep early uploads restricted until attachment validation is ready.

## 14. Connections and distinctive learning features

The features below are now confirmed product scope, delivered in stages: study circles, learning buddies, Explain it back, Bug clinic, concept-to-interview bridges, mistake notebooks, project handoffs, and Help that teaches. Their exact interactions remain hypotheses to validate; we do not claim that no other platform offers them.

- Study circles: small opt-in groups around a concept or weekly goal, with language and availability preferences, a shared agenda, and asynchronous check-ins.
- Learning buddies: mutual connection requests based on topics, goals, preferred language, and self-declared availability. Precise location and real names are unnecessary. Explain matching criteria and let people decline quietly.
- Explain it back: learners teach a concept to a peer using a trace or example; the peer asks a follow-up. Use a rubric for reasoning, not popularity.
- Bug clinic: submit a minimal reproducible example; helpers annotate a saved execution trace, then the learner performs the repair and explains it.
- Concept-to-interview bridge: after learning a concept, try its interview form—clarify requirements, describe a plan, implement, test, and explain tradeoffs.
- Shared mistake notebooks: private by default, with optional anonymized contributions to reviewed misconception guides. Public sharing is always explicit.
- Project handoffs: one learner writes a small module and another uses or reviews it, teaching contracts, documentation, and collaboration.
- Help that teaches: recognize answers that guide someone toward understanding. Never use answer counts or reaction totals as proof of expertise.

Profiles expose only chosen information: display name, languages, interests, learning goals, selected projects, and availability. Progress and interview feedback stay private unless explicitly shared. Messaging requires mutual consent; block/report controls are present from launch. Start with threaded study-circle discussion before expanding private real-time messaging. No guaranteed access to a human mentor, since volunteer availability varies.

## 15. Authentication and authorization

Guest users can learn and save locally. Accounts enable synchronization, posting, connections, groups, and interview history. Support safe migration of guest progress with explicit conflict handling.

Initial proposal: Google and GitHub sign-in through a maintained Worker-compatible authentication implementation; evaluate passkeys and a non-social recovery path before finalizing providers. Do not require beginners to understand GitHub. Email sign-in/recovery requires an actual outbound email service and delivery budget; Cloudflare hosting alone does not establish that capability.

Server-owned sessions use secure HttpOnly cookies, rotation, expiry, logout, revocation, and an active-session list. Validate OAuth state/PKCE and account linking; never merge identities solely because unverified email strings match. Keep secrets in server bindings. Require stronger authentication for moderation and administration.

Authorize every operation on the server, including object ownership, private threads, membership, moderation, and room connections. Roles: learner, moderator, content editor, administrator. Donations confer no role or capability. Add CSRF protection appropriate to the cookie flow, strict allowed origins, login throttling, and auditable privilege changes.

A separate server can be exposed through a same-origin `/api` route for simpler browser session handling while retaining independent deployment. If using `api.<domain>`, explicitly configure credentialed CORS and narrowly scoped cookies. Never put session tokens in browser local storage by default. Include account export/deletion and a defined policy for anonymizing retained public contributions.

## 16. Interview preparation: confidence through rehearsal

Interview preparation is a parallel free track connected to the concept graph, not a replacement for the curriculum. Start with untimed practice and grow toward realistic conditions. Explain that interview formats vary and preparation cannot guarantee employment.

Train the full interview process:

1. Understand the prompt, ask clarifying questions, and identify constraints.
2. Walk through examples and edge cases.
3. Describe a simple correct approach before optimizing.
4. Implement while communicating reasoning.
5. Test, debug, and recover constructively when stuck.
6. Discuss complexity, alternatives, and what would change in production.

Formats: JavaScript concept discussions; practical DOM/API tasks; debugging unfamiliar code; data-structure/algorithm exercises; code review; bounded take-home simulations; project walkthroughs; behavioral stories about collaboration, mistakes, feedback, and tradeoffs; and asking useful questions of an interviewer. Add architecture discussions at the appropriate experience level.

Practice modes: solo with a checklist; asynchronous peer review; paired mock interview with rotating interviewer/candidate roles; and optional timed rehearsal. Start with text and shared snapshots; live collaborative editing is a later capability. Voice/video and recording require separate cost and privacy evaluation and are not assumed free Cloudflare features. Recording is off by default and requires explicit consent.

Feedback rubric: clarification, decomposition, correctness, testing, communication, tradeoffs, and recovery. Keep self-reported confidence distinct from observed performance. No fabricated hireability score. A missed concept links back to a lesson and produces a follow-up practice plan.

Example cycle: study arrays → build an expense summary → explain a one-pass solution → take a mock data-transformation interview → review missed edge cases → repeat with a different task. Behavioral exercises use honest examples from projects or study groups; never encourage invented experience.

Offer both languages for explanations and mocks, plus optional English technical communication practice. Reward clarity rather than accent or fluency. Peer matching, rubrics, and practice history are always free; volunteer availability may limit scheduling, so solo practice remains available.

## 17. Visual direction: a tactile learning workshop

Confirmed style: claymorphism. No purple-gradient visual identity, generic AI dashboard aesthetic, or dense problem-list-first layout resembling coding challenge sites.

Proposed identity: warm ivory background, charcoal text, terracotta primary accents, and restrained sage or muted blue supporting colors. Use rounded, softly modeled controls, subtle inner/outer shadows, tactile progress objects, and original clay-like illustrations of programming concepts. Depth comes from shape and light, not a purple gradient. Final colors require contrast checks.

Apply clay treatment selectively to navigation, buttons, concept objects, and milestones. Keep code editors, lesson text, tables, and forum conversations on calm, readable surfaces. Avoid low-contrast embossed text, excessive pill shapes, and decorative cards around every paragraph. Provide visible focus, keyboard operation, reduced motion, and a higher-contrast appearance.

Primary navigation: Learn, Practice, Community, Interview Studio, Projects, and personal progress. The home screen answers “What should I do next?” with a lesson or review, a current project, and relevant community activity. Avoid competitive scoreboards and walls of statistics.

Distinctive interactions: manipulate array elements as physical pieces with a text alternative; inspect scope through nested spaces; move through an execution trace; follow a branching concept map with an equivalent linear outline. Keep animations optional and purposeful. Large clay illustrations should load lazily and never delay the editor.

Design deliverables before broad UI implementation: tokens, typography, spacing, depth levels, component states, English/Spanish layout examples, mobile lesson/forum flows, and a usable editor prototype. Validate visual preferences and accessibility with real learners.

## 18. Cloudflare deployment and growth plan

Use one repository initially with explicitly separate client and server applications, independent deployment pipelines, versioned API contracts, and no server secrets in client bundles. Keep database access behind server modules. A multi-repository split can follow team ownership without changing the public contracts.

Deployment proposal:

- Client: built static assets on Cloudflare Workers Static Assets (Pages is an alternative), with cached curriculum bundles.
- Server: independent Worker API for accounts, attempts, forum, connections, and interviews; modular domains, not one service per database table.
- Persistence: D1 initially, with indexed queries, cursor pagination, migrations, and tested export/restore procedures.
- Live rooms: SQLite-backed Durable Objects, partitioned by room rather than one global coordinator; use WebSocket hibernation where appropriate and validate quotas before enabling broadly.
- Assets: static deployment files first; R2 for controlled user uploads when needed. Introduce object lifecycle and app-level upload limits.
- Background work: bounded, retryable scheduled batches initially; evaluate a queue against current availability and pricing when job volume needs it.
- Code execution: isolated browser runtime for the initial curriculum. The API Worker is never an arbitrary learner-code execution process. Server-side execution remains a separate deployment decision and may require a funded service beyond the free baseline.

Verified planning constraints, checked October 21, 2026:

- Workers Free documents 100,000 requests per day and 10 ms CPU time per invocation. This constrains dynamic API usage, not simply registered users. [Workers limits](https://developers.cloudflare.com/workers/platform/limits/)
- D1 has free-plan usage/storage limits and can refuse queries when those limits are reached. Track scanned rows, not just request counts, and recheck current allowances before launch. [D1 pricing](https://developers.cloudflare.com/d1/platform/pricing/)
- SQLite-backed Durable Objects are available on Workers Free with their own usage limits; real-time features are not unlimited. [Durable Objects pricing](https://developers.cloudflare.com/durable-objects/platform/pricing/)
- R2 has included free usage, requires subscription setup, and can incur usage charges. It is not an automatic hard spending cap. [R2 setup](https://developers.cloudflare.com/r2/get-started/) and [pricing](https://developers.cloudflare.com/r2/pricing/)
- Static asset billing differs from Worker execution; configure asset routing deliberately and verify whether a request invokes code. [Static asset billing](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/)

Capacity illustration, not a forecast: at 40 dynamic calls per daily active learner, 2,000 daily learners create 80,000 calls before bots, retries, administration, and room traffic. Read/write volume, CPU, concurrency, and storage may bind earlier. Validate these with workload tests rather than promising a user count.

Growth controls: cache public reads, debounce drafts, batch progress updates safely, index forum filters, bound result sizes, avoid constant polling, and retain only necessary events. Define metrics for latency, errors, quota consumption, database scans, room fanout, and cost. Test reconnects, duplicate requests, authorization failures, backup restoration, and quota exhaustion.

Set internal usage thresholds before provider limits and degrade expensive optional operations first: pause attachments or new live rooms, retain asynchronous discussions when possible, keep cached lessons and local practice working, and queue local progress for later synchronization. Do not present unsaved server writes as successful. If D1 becomes unavailable, authenticated writes and forum updates may stop; cached learning should remain usable.

Large-scale hosting will likely require funding. The commitment is permanent free access for learners, with operator-funded capacity through donations or sponsorship—not a promise that infrastructure will always cost zero. Do not enable paid subscriptions, billing, or hosting changes as part of this planning work.

## 19. Updated delivery sequence

The original curriculum phases remain; expand their product scope as follows:

1. Foundation decisions: bilingual lesson schema, concept map, claymorphism prototype, independent client/server deployment spike, auth compatibility, and usage budget.
2. First usable release: core learning path, guest/account progress, public forum reading, authenticated questions/answers, lesson context, notifications, and complete moderation basics. Publish the no-paywall commitment.
3. Social learning release: profiles, mutual connections, study circles, bug clinics, and optional shared project reviews. Validate consent and block behavior end to end.
4. Interview release: concept-to-interview bridges, solo practice, rubrics, peer scheduling, mock sessions, and private feedback history. Launch English and Spanish together.
5. Live collaboration and scale: room coordination, shared editing if justified, advanced curriculum, stronger operations, and infrastructure upgrades financed without learner paywalls.

A large vision is the target; these releases make each part usable and supportable. All launched capabilities are free from their first release. The first usable release now includes one solo concept-to-interview bridge, so the learning/community/interview loop is present immediately; the dedicated interview release expands formats and peer sessions.

## 20. Detailed product specifications

- [Approved baseline for review](docs/planning/APPROVED_BASELINE.md): latest stack approval, first-build scope, retention targets, deletion policy, and explicit planning-only authorization. This takes precedence over earlier conflicting first-release assumptions.
- [API contracts](docs/planning/API_CONTRACTS.md): endpoint surface, DTO conventions, permissions, errors, concurrency, idempotency, and room protocol.
- [Database schema](docs/planning/DATABASE_SCHEMA.md): tables, fields, constraints, indexes, ownership, transaction boundaries, and room-local storage.
- [Module rules](docs/planning/MODULE_RULES.md): dependency allowlist, public interfaces, workflow coordinators, client boundaries, and future enforcement.
- [Technical decision records](docs/planning/TECHNICAL_DECISIONS.md): authentication/email recommendation, continuous draft synchronization, indefinite room history, admission control, deletion, and persistence contracts.
- [Owner decisions](docs/planning/DECISIONS.md): authoritative answers on budget, launch scope, staffing, eligibility, authentication, availability, and license holder; supersedes earlier assumptions where different.
- [Architecture baseline](docs/planning/ARCHITECTURE.md): deployment boundaries, consistency, capacity scenarios, reliability, database decision, and planning gates. This supersedes earlier provisional architecture where they differ.
- [Code structure specification](docs/planning/CODE_STRUCTURE.md): target repository layout, module dependency rules, testing, contracts, and contributor workflow. This is a plan, not a scaffold.
- [Open-source stewardship](docs/planning/OPEN_SOURCE.md): confirmed MIT choice, governance, contribution policy, and release responsibilities.
- [Screen map and connected journeys](docs/planning/SCREEN_MAP.md): navigation, routes, actions, access, states, and the distinctive features.
- [Domain model and API boundaries](docs/planning/DOMAIN_MODEL.md): entities, relationships, ownership, state transitions, permissions, and persistence boundaries.
- [Prioritized delivery backlog](docs/planning/BACKLOG.md): ordered releases, dependencies, acceptance criteria, and release gates.

These documents elaborate this blueprint. ARCHITECTURE.md and CODE_STRUCTURE.md control architectural decisions; the backlog describes future implementation sequencing after the architecture gate. Earlier broad phases describe curriculum breadth rather than a separate competing schedule. No implementation or external deployment has been performed by this planning work.

## Sources consulted

- MDN JavaScript Guide, language coverage reference: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide
- MDN JavaScript fundamentals, beginner objectives reference: https://developer.mozilla.org/en-US/curriculum/core/javascript-fundamentals/
- IES, Organizing Instruction and Study to Improve Student Learning, teaching-method reference: https://ies.ed.gov/ncee/wwc/Docs/PracticeGuide/20072004.pdf
- WebContainers browser support, runtime compatibility constraint: https://webcontainers.io/guides/browser-support

These references inform the plan; they do not validate the proposed mastery rules, scope estimates, or Learntify's future effectiveness.
