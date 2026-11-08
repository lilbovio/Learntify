# First-release alpha acceptance

This checklist measures the **agreed first-release alpha**, not the full Learntify vision or production readiness. It replaces the earlier conversational percentage estimate with countable acceptance checks. Each of the 20 checks contributes one completion point; the percentage is checklist coverage, **not a forecast of remaining effort or risk**. A failed automated gate removes its point until corrected.

The agreed release includes accounts, bilingual foundational lessons, isolated execution, draft sync, attempts, progress and a basic review queue. Study Plans and the guided project are now part of its working demo. Community/chat remains gated on moderators; full algorithms and interview curricula are later milestones.

## Acceptance checks

1. Email sign-in, verification, session lookup and logout work with local D1; credentials never enter client bundles.
2. Passkey enrollment, sign-in and removal have a real browser journey and server verification checks.
3. Google/GitHub connection and recovery have tested code paths, explicit linking and configured-provider UI. Live provider rehearsal is included in check 20.
4. Published foundational lessons have English and Spanish content, stable URLs and ordered navigation.
5. Prediction exercises validate lesson/version and preserve correct per-lesson state.
6. JavaScript executes in an isolated, bounded Worker/WASM runtime; syntax failures, runaway loops and recovery are tested.
7. Account code and notes persist with debouncing, revision conflicts, serialized writes and retry identity.
8. Saved attempts persist with owner/version validation, idempotent retry and a daily cap.
9. Progress and the review queue use actual saved practice, with transparent self-reported provenance.
10. A guided project has requirements, executable function checks, saved work and self-review prompts.
11. Study Plans supports all five CRUD operations, the coursework HTTP matrix and real D1 persistence.
12. Private operations enforce session ownership, input bounds, origin checks and account isolation.
13. Loading, empty, failed-request and session-expiry states have actionable recovery that preserves current input.
14. Unsaved form navigation is guarded, and code, notes and plan text can be downloaded without a working API.
15. Core English/Spanish journeys work at mobile widths, with keyboard focus and reduced-motion support.
16. Separate client/server packages follow checked dependency boundaries, typed contracts and readable module responsibilities.
17. Formatting, type checks, integration tests, browser journeys and build dry runs pass locally and in CI for the release commit.
18. Private writes have atomic per-account/global reservation limits, an emergency pause, bounded plan storage and readable limit feedback. These are application limits, not a provider-billing guarantee.
19. Metadata cleanup, synthetic snapshot restoration/deletion replay, and same-origin preview asset/API routing are implemented and tested. Live provider restoration remains in check 20.
20. **Pending human/environment acceptance:** a small invited pilot validates learning clarity; live provider sign-in is rehearsed; the chosen HTTPS origin, email sender, actual quotas, monitoring and provider backup/restore procedure are verified. Deployment remains deferred until explicitly authorized.

## Evidence

- `pnpm check`: domain/API/authentication/D1 tests, dependency rules, type checks and three build dry runs.
- `pnpm test:e2e`: public curriculum, isolated execution and mobile navigation.
- `pnpm exec playwright test --config playwright.production.config.ts`: compiled JavaScript/WASM assets.
- `pnpm test:accounts`: real local authentication, draft persistence, practice, CRUD and session/unsaved-state recovery.
- `pnpm test:preview`: a single local Cloudflare Worker serves the built static client and API, including SPA deep links and offline file download.
- `services/server/src/operations/`: quota, cleanup and synthetic recovery tests.
- `docs/ALPHA_ACCEPTANCE.md`, `docs/OPERATIONS.md`: rehearsal and environment handoff.

Do not mark checks 17–19 complete solely because the code exists: record the successful validation run and commit in implementation status. Passing checks 1–19 is **19/20 = 95% alpha checklist coverage**. Check 20 remains a release gate even though its count is only one point. There is no claim that Learntify is 95% production-ready or 95% complete overall.
