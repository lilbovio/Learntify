# Learntify repository and code organization specification

Planning only · No folders, packages, runtime configuration, or application files described below have been scaffolded

DECISIONS.md now includes live text chat in the first social release, so the planned realtime runtime is relevant to that release. The package structure remains a target map, not an instruction to generate it. Tooling choices remain provisional until the sole maintainer's preferences are known.

## Repository strategy

Detailed ownership/import rules now live in MODULE_RULES.md. Add planned `modules/realtime` and `packages/realtime-contracts` when the room capability is implemented; services/realtime is the deployment shell, not the sole owner of room business logic. API_CONTRACTS.md and DATABASE_SCHEMA.md define interface/persistence boundaries. No package directories are being created in this planning phase.

Recommend one public MIT monorepo with independent applications and deployment pipelines. Shared changes can be reviewed atomically, and contributors can understand the whole product. Separate repositories become appropriate when ownership, access, independent versioning, or contribution volume warrants the coordination cost; they are not a scaling mechanism for requests.

Use TypeScript as the shared language. A workspace package manager with a single committed lockfile and explicit package exports is the baseline; pnpm is the proposed choice, subject to tooling confirmation before implementation. Add task caching/build orchestration only if the actual package graph benefits. Pin supported toolchain versions and document upgrade policy.

## Planned layout

```text
learntify/
  apps/
    client/                     # Learner-facing browser application
    admin/                      # Content and moderation browser application
  services/
    server/                     # HTTP API composition and deployment entry
    jobs/                       # Background job composition and deployment entry
    realtime/                   # Added when live rooms ship
    runner/                     # Added only if server assessment is selected
  modules/
    identity/
    curriculum/
    learning/
    community/
    social/
    projects/
    interviews/
    moderation/
    notifications/
  packages/
    api-contracts/              # Public request/response schemas and API spec
    api-client/                 # Generated client plus a small transport wrapper
    event-contracts/            # Versioned domain integration event envelopes
    learning-engine/            # Pure deterministic evidence/review rules
    ui/                        # Accessible shared visual primitives and tokens
    i18n/                      # Locale infrastructure and shared interface messages
    sandbox-protocol/          # Validated commands/results, no execution secrets
    observability/             # Minimal logging/trace interfaces and redaction
    test-support/              # Reusable synthetic fixtures and helpers
  adapters/
    persistence/               # Selected database repositories and migrations
    object-storage/            # Artifact storage provider implementation
    identity-provider/         # External identity integration
    jobs/                      # Transport/scheduling implementation
    search/                    # Search projection implementation
  curriculum/
    concepts/                  # Stable concept graph
    units/                     # Versioned lesson/exercise definitions
    locales/en/                # Authored content translations
    locales/es/
    rubrics/
  tooling/
    content/                   # Validation/publishing tools when implemented
    architecture/              # Import-boundary and contract checks
  tests/
    journeys/                  # Cross-application end-to-end behavior
    contracts/
    performance/
    recovery/
  infra/
    environments/              # Nonsecret environment/deployment definitions
    runbooks/
  docs/
    planning/
    architecture/decisions/
    contributing/
  .github/                     # Workflows/templates/ownership when implemented
  LICENSE                      # Exact MIT text, actual copyright holder
  README.md
  CONTRIBUTING.md
  CODE_OF_CONDUCT.md
  SECURITY.md
  GOVERNANCE.md
```

This is a target map, not a requirement to create empty packages. Introduce each package when a real responsibility needs it. Provider implementation paths reflect the eventual database decision; no simultaneous D1 and PostgreSQL abstraction is required without a real use case.

## Server module pattern

Each domain module contains `domain/`, `application/`, `ports/`, and a narrow public entry. Domain holds rules and value types; application holds named use cases; ports describe required storage/provider capabilities. HTTP routing belongs to the server composition layer, and provider SDK calls belong to adapters. Small modules can keep these as a few files rather than ceremonial class trees.

Dependency direction: routes/jobs → application use cases → domain rules and ports. Adapters implement ports and are wired at composition roots. Domain/application code does not import React, Cloudflare bindings, HTTP request objects, or another module's repository. Pure learning-engine rules may be used by Learning and safely reused client-side; authoritative policy application stays server-owned.

Module APIs return intentional DTOs/results, not ORM models. Prefer explicit use cases such as SubmitAttempt, PublishQuestion, AcceptConnection, and SubmitInterviewFeedback. Keep transactions visible in those workflows. Avoid a universal BaseRepository, giant shared service, global mutable database singleton, or a shared folder containing unrelated business logic.

Cross-module calls go through public application interfaces. Do not turn every local module interaction into HTTP or an event. Use events for delayed independent effects such as notifications/search, not to obscure immediate invariants. Cycles in module imports require redesign rather than an exception.

## Client organization

Within `apps/client/src`, use `app/` for routing/providers/shell, `features/` for coherent user capabilities, and a small `shared/` for client-only primitives. Feature examples: lesson-workspace, review-queue, question-thread, bug-clinic, connections, study-circle, project-handoff, interview-session, and account-settings.

A feature owns its UI, query/mutation hooks, local state, validation adapters, and colocated tests. Route files compose features; they do not contain the full workflow. Features use api-client and approved public feature exports; no deep imports into another feature's internals.

Separate server state from UI state. Server data is fetched/cached through a consistent query layer. Editor state, panel selection, and in-progress predictions stay local; durable drafts have an explicit persistence/sync owner. Avoid copying the entire server cache into a second global store. Initial state libraries remain implementation selections, not architectural dependencies.

UI primitives implement accessible controls and claymorphism tokens. Feature components own domain behavior. Raw hardcoded colors, duplicated translated strings, and independent modal/button implementations should not spread through features. Admin can reuse primitives/contracts but has its own navigation and authorization-aware workflows.

## Enforceable boundaries

Future CI should reject: browser imports of server/adapters; domain imports of vendor SDKs; module deep imports; circular package dependencies; undeclared dependencies; exposed secret configuration; incompatible API schema changes; missing required content locales. Package exports and lint/import rules encode the allowed graph, not only prose.

Each runtime has an explicit environment schema validated on startup/deployment. Browser-visible values are a deliberate allowlist. No production credentials in examples or generated clients. Generated files are reproducible and never manually edited; generation commands are documented.

## Testing and release organization

Colocate domain/use-case tests with their owners. Adapter integration tests run against the selected database/runtime behavior, not only mocks. Contract tests protect independently deployed clients. Journey tests exercise learning → community → interview and authorization boundaries. Performance tests use realistic data distributions; recovery tests verify restoration and replay.

Use focused checks for changed packages plus mandatory security/contract/content gates. Dependency caching must never skip essential migration or environment verification. Public fork checks receive no production secrets and do not deploy privileged infrastructure. Deployment jobs require trusted release context.

Version public contracts deliberately. Internal packages may move together under one repository release cadence, while applications have independent release artifacts and changelogs. Pin compatibility assumptions; retain forward/backward compatibility across rollout and rollback windows. Document migration ownership and review requirements.

## Contributor experience

Plan a documented local path to run client + API with synthetic data, offline-safe fixtures where practical, test identities, and a simulated job transport. Production accounts must not be required for UI, curriculum, or pure-domain contributions. Provider emulation and real integration tests are distinct; document their differences.

README explains product, MIT license, development status, and architecture entry points. CONTRIBUTING gives setup, checks, branch/PR expectations, content and translation contribution paths. CODEOWNERS identifies domain reviewers when maintainers exist; it must not invent nonexistent teams. Offer scoped starter issues and keep design decisions discoverable.

Changes to domain boundaries, persistence, public contracts, authentication, or execution isolation require an architecture decision record. Routine bug fixes do not. Avoid creating persistent agent rules or configuration during this documentation-only phase.
