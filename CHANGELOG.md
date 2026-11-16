# Changelog

Notable changes to Learntify. Historical entries below summarize verified Git commits; dates are commit dates, not invented semantic-version releases. The platform remains an alpha.

## Unreleased

### Documentation and developer tooling

- Added a discoverable Study Plans API guide, QA/SWE requirements evidence, presentation preparation and this changelog.
- Added a local Bruno CRUD demonstration and a Git-ignored one-time sign-in helper. Authentication credentials are not part of the collection committed to source control.
- Clarified local API URLs and corrected contract examples and coursework deployment wording.

These working-tree changes are not a new production deployment.

## 2026-11-08 — Public alpha registration

- Enabled explicit email-verified public alpha registration; passkeys and provider linking remain available after email-first registration (`196e8f3`).
- Recorded deployment and smoke-check evidence (`5e3ddab`). Hosted private writes remain paused pending live persistence/recovery acceptance.
- Integrated the monochrome bilingual interface and accessible motion (`0615dbf`); recorded the initial alpha rollout (`7aff3f6`).

## 2026-10-31 — Alpha release preparation

- Prepared alpha release checks and private failure diagnostics (`7637bd7`).

## 2026-10-27 — Capacity and recovery preparation

- Added capacity safeguards, explicit offline exports and recovery checks (`053dded`).
- Recorded alpha acceptance evidence (`754c571`). Local recovery tests are not a completed provider restore rehearsal.

## 2026-10-26 — Study Plans CRUD

- Added authenticated database-backed study-plan CRUD and coursework demonstration (`698e77a`).
- Improved duplicate-plan feedback visibility (`b6ec34f`).
- Stabilized alpha forms and session recovery (`4a9d017`).

See [release evidence](docs/ALPHA_RELEASE.md), [API documentation](APIDocumentation.md) and the Git history for full context. This is a curated history, not an exhaustive account of every earlier change.
