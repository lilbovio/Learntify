# Learntify coursework

Study Plans CRUD is implemented. Start with [DEMO.md](DEMO.md) for setup, a presentation script, code references and the HTTP error demonstrations.

- `openapi-study-plans.yaml`: current OpenAPI contract for all five operations.
- `diagrams.md`: editable Mermaid architecture, class, database and sequence diagrams.
- `Learntify_Study_Plans_API_Proposal.pdf` and `.md`: the original nine-page proposal, retained as historical planning documents. Their proposed status and two-week schedule predate the implementation; use DEMO.md for current status.
- `proposed-schema.sql`: the original design; the executable migration is `services/server/migrations/0007_study_plans.sql`.

Start with the [API documentation](../../APIDocumentation.md), [QA/SWE requirements and evidence](QA_ENGINEERING.md), [Bruno walkthrough](bruno/README.md), and [changelog](../../CHANGELOG.md).

The coursework demonstration uses local database-backed accounts. A separate public alpha exists, but its release record reports private writes paused pending live acceptance checks. Credentials are excluded. The final presentation is five minutes of explanation followed by five minutes of questions; see the QA guide for a timed outline.
