# Study Plans: implementation and demo

The Study Plans module is now implemented in Learntify. The original proposal PDF remains a historical planning document; use this guide and the current YAML contract to present the working implementation. This completes the focused CRUD module, not the entire platform or a production launch.

## Run locally

From the repository root, run `pnpm db:local` once to apply migrations. In separate terminals run `pnpm dev:accounts:server` and `pnpm dev:accounts:client`. Open http://localhost:5174/en/auth and use the existing local sign-in mailbox workflow. Local account mode does not send real emails.

For the already configured external-test profile, use `pnpm dev:external:server` and `pnpm dev:external:client`, then open http://localhost:5175/en/study-plans. This profile requires migration 0007 on its dedicated external-test D1 database. Do not copy credentials into slides, screenshots, commits or API examples.

## Five-minute presentation

1. Sign in and open **Study plans** from navigation. Expand **API activity (demo)**. This panel captures actual HTTP responses from this screen; it excludes cookies and credentials.
2. Create a plan with title `JavaScript foundations`, slug `javascript-foundations`, description `Practice variables and arrays`, and 120 minutes per week. Explain `POST /api/v1/study-plans`, status **201**, a server-generated UUID, and the `Location` response header (visible in browser Network tools).
3. Refresh the list. Explain `GET /api/v1/study-plans?page=1&limit=20`, status **200**, pagination and owner filtering.
4. Click the plan title. This performs `GET /api/v1/study-plans/{id}`, status **200**. Reload the page and open it again to demonstrate database persistence.
5. Change the title and set status Active. Save changes. Explain `PUT /api/v1/study-plans/{id}`, status **200**, full replacement of mutable fields, and why the ID, owner, slug and creation date remain unchanged.
6. Click New plan and try the same slug. The API returns **409**. Explain the database's unique `(owner_id, slug)` constraint, including protection against concurrent requests.
7. Open the existing plan and delete it, confirming the dialog. Explain `DELETE /api/v1/study-plans/{id}`, status **204**, and an empty response body. Reload to prove removal.

The same screen is available at `/es/study-plans`. The demo activity panel retains only the last 12 requests in component memory and clears on reload or logout.

## Error demonstrations

The browser form helps prevent malformed inputs. To demonstrate API validation, use browser Network tools or the authenticated same-origin console. These calls use the existing session without copying its cookie:

```js
// 400: invalid pagination
await fetch('/api/v1/study-plans?page=0').then((r) => r.status);
// 400: invalid UUID
await fetch('/api/v1/study-plans/not-a-uuid').then((r) => r.status);
// 404: valid UUID that does not exist in this account
await fetch('/api/v1/study-plans/12345678-1234-4123-8123-123456789abc').then((r) => r.status);
// 401: deliberately omit the session
await fetch('/api/v1/study-plans', { credentials: 'omit' }).then((r) => r.status);
```

Use automated tests to demonstrate **500**. The tests inject a failing repository and verify all five operations return a generic error with a request ID, without exposing database details. There is no public endpoint for intentionally crashing the app.

## Explain the code

- `modules/study-plans/src/index.ts`: `StudyPlan` encapsulates and validates entity data; `StudyPlanService` coordinates operations; `StudyPlanRepository` defines the storage abstraction. This demonstrates encapsulation, interfaces, dependency injection and polymorphism without unnecessary inheritance.
- `adapters/study-plans/src/index.ts`: `D1StudyPlanRepository` implements that interface using parameterized SQL. Every read, update and delete includes the session-derived owner ID. Duplicate slug detection uses a specific SQL conflict target rather than masking all database exceptions.
- `services/server/src/study-plans/controller.ts`: `StudyPlanController` maps resource-oriented HTTP requests to the service, validates strict request contracts, enforces authentication and trusted write origins, and returns the required status codes.
- `packages/api-contracts/src/study-plans.ts`: shared validation and response schemas. Unknown request properties are rejected; PUT requires every mutable field.
- `services/server/migrations/0007_study_plans.sql`: database schema, foreign key, unique constraint, range checks and listing index. Account deletion cascades to plans.
- `apps/client/src/features/home/StudyPlansPage.tsx`: English/Spanish interface for all five operations.
- `openapi-study-plans.yaml` and `diagrams.md`: contract and architecture/class/database/sequence diagrams.

## Validation and CI

Run `pnpm check` for formatting, dependency boundaries, TypeScript, unit/integration tests and build dry runs. Run `pnpm test:accounts` for the authenticated browser journeys. Both already run in the repository CI workflow.

`services/server/src/study-plans/controller.test.ts` exercises real local D1 persistence and every rubric status: list 200/400/401/500; item 200/400/401/404/500; POST 201/400/401/409/500; PUT 200/400/401/404/500; DELETE 204/400/401/404/500. It additionally covers origin rejection, payload limits, owner isolation and concurrent duplicate creation. `modules/study-plans/src/index.test.ts` checks entity invariants and encapsulation. `tests/accounts/study-plans.spec.ts` demonstrates create, reload, read, edit, duplicate conflict and delete through the app.

## Scope and limits

Plans are private scheduling goals; they do not yet assign lessons or automatically update learning progress. Updates use last-write-wins. Production launch safeguards and full-platform work remain separate. Keep the demo on local or dedicated external-test infrastructure.
