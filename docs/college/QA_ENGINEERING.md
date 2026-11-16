# Coursework requirements and QA / Software Engineering evidence

Review date: November 15, 2026. Scope: the implemented Study Plans CRUD module. This is a traceability guide, not a claim that all of Learntify is production-ready.

## Requirement assessment

1. **English code: met in the reviewed CRUD scope.** Classes, methods, properties and parameters use English: `StudyPlan`, `StudyPlanService`, `ownerId`, `weeklyMinutes`, `create`, `replace`, `delete`. Spanish user-facing translations are intentional and separate from identifier naming.
2. **Database: implemented.** [D1 repository](../../adapters/study-plans/src/index.ts) performs SQL operations; [migration 0007](../../services/server/migrations/0007_study_plans.sql) defines the persisted resource, foreign key, uniqueness, checks and listing index. Local D1 is database persistence, not an in-memory JavaScript array.
3. **OOP: implemented.** [Domain source](../../modules/study-plans/src/index.ts) shows an encapsulated entity, constructor-injected service and repository interface. [Controller](../../services/server/src/study-plans/controller.ts) maps HTTP operations. D1 and failing-test repositories implement the same abstraction. Explain encapsulation, dependency injection and polymorphism; artificial inheritance is unnecessary.
4. **Resource-oriented design: implemented.** `/api/v1/study-plans` and `/api/v1/study-plans/{id}` identify resources; HTTP verbs express the five operations. Owner filtering and status codes have explicit semantics.
5. **YAML documentation: present.** [OpenAPI 3.0.3](openapi-study-plans.yaml) defines all five operations, security, parameters, schemas and required status responses. [API guide](../../APIDocumentation.md) makes the contract readable and discoverable.
6. **Diagrams: present.** [Mermaid diagrams](diagrams.md) cover architecture, classes, entity relationships and creation sequence. Preview them in GitHub or a Mermaid-capable Markdown viewer before class; raw Mermaid source alone is inconvenient to present.
7. **HTTP codes: implemented with explicit tests.** Evidence below covers every requested status; 500 is exercised using controlled dependency failure.
8. **Professional context: demonstrated through QA and software engineering.** Layered code, strict contracts, SQL constraints, ownership protection, risk-based tests, browser regression coverage and CI provide concrete evidence rather than only a role label.

A CHANGELOG was not explicitly required by the rubric, but [CHANGELOG.md](../../CHANGELOG.md) now provides release traceability. Historical proposals are not the current specification.

## Exact HTTP coverage

The [controller integration suite](../../services/server/src/study-plans/controller.test.ts) contains these cases:

- GET list: **200 / 400 / 401 / 500**.
- GET by ID: **200 / 400 / 401 / 404 / 500**.
- POST: **201 / 400 / 401 / 409 / 500**.
- PUT: **200 / 400 / 401 / 404 / 500**.
- DELETE: **204 / 400 / 401 / 404 / 500**.

Find tests by their English names: `persists all five operations`, `returns 401 for every operation`, `returns 400 for malformed IDs`, and `returns a safe 500 envelope for each operation`. The persistence case also verifies duplicate conflicts, foreign-owner 404s, missing records and an empty DELETE response.

## QA strategy and evidence limits

- **Domain tests:** invalid values and defensive copying/encapsulation. Inspect [entity tests](../../modules/study-plans/src/index.test.ts).
- **Database/controller integration:** real local D1 queries, status mapping, owner isolation, concurrent duplicate protection, storage caps and input rejection. Authentication is substituted here, so these tests alone do not establish real sign-in behavior.
- **Browser regression:** [study-plan journey](../../tests/accounts/study-plans.spec.ts) signs in through local email verification, creates/reloads/updates plans, checks conflict feedback and deletes. It also checks a mobile viewport. This is not a comprehensive accessibility audit.
- **Manual API exploration:** [Bruno collection](bruno/README.md) separates the HTTP service from the frontend. Its negative tests pass when expected error codes are returned. It does not include every combination in the automated rubric matrix.
- **Continuous integration:** [workflow](../../.github/workflows/ci.yml) runs formatting, module boundary checks, TypeScript, unit/integration tests, builds and browser suites. A local green run does not mean that new uncommitted work has passed GitHub CI.

Prioritize data ownership, persisted changes, duplicate races, invalid inputs and safe failure handling. For each defect, record the environment, reproduction steps, expected/actual behavior, sanitized evidence, fix and regression check. Never attach cookies, sign-in links or learner data.

One real defect example is duplicate-plan feedback: the API returned 409 but the interface did not make the problem sufficiently visible. Commit `b6ec34f` brought feedback into view; the browser regression checks the focused alert and invalid slug field. Explain both the backend contract and the user's recovery experience.

## Repeatable verification

```sh
pnpm exec vitest run modules/study-plans/src/index.test.ts services/server/src/study-plans/controller.test.ts
pnpm exec playwright test --config playwright.accounts.config.ts tests/accounts/study-plans.spec.ts
pnpm check
```

Stop manually started servers on ports 5174 and 8788 before the browser suite if they conflict with its managed servers. Do not stop unrelated processes. The full CI workflow contains additional browser commands.

Record the execution date, command, outcome and relevant commit with presentation evidence. Test counts are not code-coverage percentages. Do not claim 100% line coverage, a fresh cloud test, or current GitHub CI without the corresponding result.

## Verification record — November 15, 2026

- Source baseline: `5e3ddab`, with the documentation changes in the working tree; no application logic changed in this review.
- Targeted Vitest command above: **2 files, 7 tests passed**, including all required HTTP status branches. The initial sandboxed attempt could not connect to the local D1 runtime; the rerun with local connection access passed.
- Targeted Chromium study-plan journey above: **1 test passed**, including sign-in, persisted CRUD, duplicate feedback and mobile checks.
- `pnpm dlx @apidevtools/swagger-cli validate docs/college/openapi-study-plans.yaml`: **valid OpenAPI document**. This validates structure/references, not automatic runtime conformance.
- Formatting checks passed for the changed documentation; 26 local links in the three new guides resolved; `git diff --check` passed.
- Full-platform suites, current GitHub CI and live cloud recovery were **not rerun** for this documentation review. Earlier evidence remains in the release record.

## Five-minute presentation and five-minute Q&A

The teacher's latest format replaces the earlier ten-minute uninterrupted speech.

- **0:00–0:35:** problem, target learner and the bounded study-plan resource. Introduce your QA/SWE focus.
- **0:35–1:15:** show the architecture/class diagram and explain controller, service and repository responsibilities.
- **1:15–3:15:** demonstrate POST, list, get by ID, PUT and DELETE in Bruno; name the response status. Prepare authentication before the timed talk. Use one synthetic plan.
- **3:15–4:15:** show a duplicate 409 before deletion, a 400 example and the automated 500 test. Explain ownership and database uniqueness.
- **4:15–5:00:** show YAML and the test/CI evidence. State the local-demo versus hosted-alpha limitation, then invite questions.

Practice the sequence so the duplicate attempt occurs while the plan still exists. Keep screenshots or a prior test log available if the local service fails; label them as recorded evidence, not a live response. Present in English for the advertised extra points.

Prepare answers to:

1. Why PUT rather than PATCH? Full replacement of four editable fields; strict validation; no upsert.
2. Where is the data stored? D1, with parameterized SQL and numbered schema migrations.
3. How is OOP applied? Entity encapsulation, constructor injection, interface-based repositories and separate responsibilities.
4. Why 401 versus 404? Missing session versus inaccessible/missing owned resource; foreign ownership is not disclosed.
5. Why 409? Per-owner slug uniqueness, enforced atomically in SQL.
6. How do you test 500? Inject a failing repository and assert a generic error for all five routes.
7. What prevents SQL injection? Bound query values, plus strict validation; validation alone is not the SQL defense.
8. What remains incomplete? Hosted persistence/recovery acceptance, learner testing and broader platform features; none should be presented as finished.

## Remaining actions before November 23

- Rehearse the five-minute explanation and five-minute code questions in English.
- Confirm the diagrams render and the YAML opens in your chosen viewer.
- Repeat the local API demo and preserve sanitized test results for the version you present.
- Commit the new documentation and Bruno tooling, review the diff and check GitHub CI before claiming the submitted revision is validated.
- Be able to explain the code yourself, including test doubles and actual database constraints. The teacher ultimately decides whether the evidence satisfies the rubric.
