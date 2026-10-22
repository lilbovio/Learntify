# Module dependency and ownership rules

Planning specification · October 21, 2026. Rules to enforce when code exists; no lint configuration or packages are generated now.

## Layers and allowed directions

Runtime entry points (HTTP, jobs, room transport) → application operations → domain policies and ports. Infrastructure adapters implement ports; composition roots wire them. Domain code never imports HTTP/React/Cloudflare/SQL/provider SDK objects. A domain can remain a few focused files; these rules do not require a class for every operation.

`packages/api-contracts` owns wire schemas; `event-contracts` owns integration event envelopes; neither imports implementation modules. The API client is generated from contracts and a browser transport wrapper. Internal domain entities are not API DTOs or database rows. Mappers at boundaries make changes deliberate.

`packages/learning-engine` is deterministic pure logic: takes explicit evidence/policy/time inputs and returns proposed progress/review outcomes. It imports no storage, clock singleton, network, auth, or UI. Server application code applies its results authoritatively with concurrency checks. Client reuse is advisory.

`packages/ui` holds accessible visual primitives/tokens, not learning/forum policy. `i18n` provides interface messages; authored curriculum stays in its content pipeline. `observability` exposes minimal redacted logging interfaces, not global business state. `test-support` cannot become a runtime dependency.

## Public module surfaces

Each module exports a deliberate public application interface, public read DTOs, error codes, and capability/port types. Its repositories, internal domain objects, migration internals, and implementation folders are private. Avoid a wildcard barrel exporting the whole module.

Direct cross-module runtime imports are prohibited except through declared public interfaces in the composition/workflow layer. Modules describe collaborator ports locally; composition adapters fulfill them using another module's public API. This prevents package cycles while still making logical dependencies visible. No direct SQL access to another domain's tables, even inside the same database. Cross-domain foreign keys enforce data integrity, not permission to bypass ownership.

## Logical dependency graph

This is the allowlist for synchronous business calls, regardless of whether they are injected ports. A new edge requires an ADR and cycle check.

- Identity: independent of other business domains; external auth/email through ports. Exports active actor/session and scoped role capabilities. Account-deletion orchestration is external to Identity; Identity only initiates/disables/finalizes its own state.
- Curriculum: independent business rules, supplied staff authorization context. Exports published version/concept/rubric resolution and publication validation.
- Social: may query Identity for actor existence/status. Owns blocks, connections, circle memberships, and teach-backs. References curriculum IDs via Curriculum public reads where needed.
- Projects: may query Identity, Curriculum, and Social for actor/template/invitation policy. Owns project drafts/snapshots/grants/handoffs.
- Learning: may query Curriculum and Identity; project-based practice coordinates through a higher workflow rather than directly depending on Projects. Exercise drafts and attempts are Learning-owned. It uses learning-engine.
- Community: may query Identity, Curriculum, Social (block policy), and Projects only to request an explicitly authorized publication copy. It never receives a live private repository handle.
- Interviews: may query Identity, Curriculum, Social, and Projects for authorized project walkthrough references. Learning remediation is an event/workflow, not a synchronous callback into Learning.
- Realtime: may query Identity and Social for current access and room policy. Owns room directory and messages. It cannot call Moderation or Notifications synchronously from message persistence.
- Moderation: may query Identity for staff policy; invokes public moderation operations on Community, Social, Projects, Interviews, or Realtime as authorized. Those domains do not call Moderation back; they enforce their own persisted visibility/state.
- Notifications: consumes events and may request safe public projections/access checks through typed read ports for the target domains. No domain calls Notifications synchronously. Notification failure cannot fail a saved answer.

No reciprocal edges are allowed. Report intake is an application workflow: authorize target through its owner, then create the report in Moderation. The owner domain does not import Moderation to display a report button.

## Cross-domain workflows

Place explicit coordinators in a small server application-workflows area, separate from transport routes. It can depend on public module APIs but must not contain new hidden repositories or duplicate rules.

- Ask from lesson: Learning authorizes a requested attempt/draft export → user previews approved copy → Community creates its own shared artifact/question. Original private content stays private. Do not publish from a background event without consent.
- Project-linked practice: Projects supplies an authorized immutable snapshot → Learning records an independent attempt against the correct exercise version. Ownership remains explicit.
- Interview remediation: Interviews commits feedback and outbox event → workflow validates recipient/concept/version → Learning schedules optional practice. Feedback never grants mastery by itself.
- Account deletion: Identity disables account → deletion coordinator invokes each owner's cleanup → Realtime acknowledges room cleanup → projection/notification cleanup → Identity finalizes mapping removal. Progress is resumable; no fake distributed transaction.
- Moderation: Moderation records intent/audit → owner applies idempotent content action → moderation action marks applied/failed. Do not report a room ban as fully propagated before acknowledgement or lease expiry.

If a workflow needs atomic writes across domains in the same database, declare a shared application transaction boundary and implement it in a narrowly owned persistence coordinator. Domain public operations contribute guarded commands; routes never assemble SQL. Splitting that boundary into services later requires a replacement consistency design first.

## Realtime as an explicit module

Add `modules/realtime` to the planned layout; `services/realtime` is its transport/composition runtime. This resolves the earlier ambiguity where rooms had a runtime but no declared domain owner. The module has room identity, membership-access ports, message/order rules, and moderation/deletion operations. Durable Object storage adapters are runtime-specific and never imported by the browser.

`packages/realtime-contracts` is the additional planned shared package for validated frames and history DTOs. It has no application code or provider bindings. `services/realtime` can use a trusted API/service-binding adapter for Identity/Social checks; it cannot directly query arbitrary D1 tables to bypass those modules.

## Client rules

Routes compose feature public exports. Each feature owns UI, server-query hooks, local draft interaction, and feature tests. Feature-to-feature dependencies use narrow exports or app-level composition; no deep import into another feature's store/components.

The draft sync coordinator has one owner per active draft/tab, handles revisions and conflict recovery, and exposes save state. Avoid competing autosave hooks in editor, route, and sidebar. Server state cache and local editor state are distinct; do not mirror both into an unrelated global store. Broadcast local tab coordination is optional later, not proof of cross-device consistency.

Browser packages may import UI, i18n, API client/contracts, realtime contracts, sandbox protocol, and explicitly safe pure rules. They may not import modules, adapters, deployment bindings, server environment schemas, auth secrets, or database models. Admin obeys the same restrictions; hiding a button is not authorization.

## Adapter and repository rules

Group persistence adapters by domain under the selected database adapter; repositories implement domain ports and own only their domain tables. Common connection/transaction plumbing is shared, business queries are not. Read projections crossing domains are explicitly owned and authorized, never an unreviewed reporting backdoor.

Provider-specific SDK types stop at adapters. Identity library tables and migrations are owned by its adapter and exposed only through Identity operations. Replacement does not mean data migration is free; preserve stable app IDs and document migration impacts.

No generic write-any-table service, generic resource authorization by string alone, global mutable session singleton, or broad `utils` package containing domain rules. Helpers are colocated until actual shared responsibility emerges.

## Enforcement and review

When implementation starts, package exports, dependency declarations, lint import restrictions and a cycle detector enforce these rules. Fail CI on undeclared dependencies, deep module imports, server code in browser bundles, test helpers in runtime bundles, business code importing provider SDKs, and contracts importing implementations. Build a documented allowlist rather than relying on naming conventions alone.

Architecture tests should include deliberately forbidden import fixtures to prove the rules reject violations. Use contract tests for generated clients and adapters, domain tests for invariant behavior, and integration tests for real transaction semantics. Passing unit mocks does not establish D1 concurrency or room correctness.

Ownership reviews: changes to contracts involve API consumers; schema migrations involve the owning domain and persistence reviewer; shared UI changes include accessibility; English/Spanish content publication includes both language reviews. Initially the owner may perform multiple roles; never invent staffed teams. Boundary exceptions require a documented ADR, owner, expiry/review date, and test coverage.

## Definition of architecture consistency

Every endpoint maps to one owning operation or explicit coordinator; every table has one writer domain; every synchronous collaborator edge is allowlisted; every event has a version and idempotent consumer; every private projection rechecks access. Cross-store failure behavior must be described before enabling the corresponding capability. These are design acceptance rules, not claims that implementation exists.
