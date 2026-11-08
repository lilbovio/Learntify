# Learntify UI/UX Redesign — Coverage & Verification

**Implementation owner:** OpenCode  
**Client:** `apps/client` (TypeScript + React + Vite)  
**Design source:** `design/learntify-ui/` (owned by Antigravity)  
**Handoff:** `design/learntify-ui/HANDOFF.md` — present, board status “Ready for Juan’s Review”, route statuses “Draft Ready for Review” / “Specification Ready”. The file has no explicit revision ID; the reviewed copy is the untracked handoff last saved **2026-11-02 22:39 local**.  
**Screenshots captured:** **2026-11-03**

## Deliverable map

| Evidence                             | Location                                                                        |
| ------------------------------------ | ------------------------------------------------------------------------------- |
| Working screens, English and Spanish | `docs/screenshots/final/{en,es}/{phone,desktop}/`                               |
| Phone viewport                       | `390 × 844`                                                                     |
| Desktop viewport                     | `1280 × 900` (matches the handoff’s 1280px desktop reference)                   |
| Before redesign                      | `docs/screenshots/baseline/{en,es}/{phone,desktop}/`                            |
| Roadmap concepts (not live)          | `design/learntify-ui/boards/future-concepts.html`                               |
| Review boards (not the running app)  | `design/learntify-ui/boards/*.html`, `design/learntify-ui/prototype/index.html` |

Screenshot filenames are route keys: `welcome`, `auth`, `start`, `today`, `learn`, `lesson`, `practice`, `projects`, `notebook`, `study-plans`, `progress`, `settings`, `missing`. Every route was captured in both locales and both viewports (52 working-screen images).

> The roadmap board contains moderated forums, study circles and interview rehearsal. Those are labeled concepts only; none appear in live navigation and none are implemented.

## Route-by-route checklist

All routes were exercised in English and Spanish at phone and desktop sizes. “Working” means the route rendered and passed the automated route check; state notes come from the journey and account suites.

| Route                        | Component                              | EN/ES | Phone/desktop | Working states verified                                                                                                                               |
| ---------------------------- | -------------------------------------- | ----- | ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/`, `/:locale`              | `WelcomePage`                          | ✓     | ✓             | Public hero, real `2 + 3 → 5` preview, signature margin, 3-step method, 3 learning-path cards, secondary sign-in, language switch                     |
| `/:locale/auth`              | `AuthPage` / `AccountPanel`            | ✓     | ✓             | Narrow 440px card; provider, passkey and email sections separated; submitting, check-inbox, invalid-link and retry/error states                       |
| `/:locale/start`             | `OnboardingPage`                       | ✓     | ✓             | Guest preferences, saved preferences, failed save with retained input, signed-in sync, skip path                                                      |
| `/:locale/today`             | `TodayPage`                            | ✓     | ✓             | First-day zero state, next-action priority, due review, signed-in account strip, guest/loading/error states                                           |
| `/:locale/learn`             | `LearningHubPage`                      | ✓     | ✓             | Search/order preservation, numbered sequence, prerequisites, guest start, loading/error states                                                        |
| `/:locale/learn/lessons/:id` | `LessonPage` / `LessonWorkspace`       | ✓     | ✓             | Predict → Run → Explain, signature margin desktop, numbered kickers phone, runner isolation, error/recovery, notes, attempt history, project guidance |
| `/:locale/practice`          | `LearningHubPage` / `PracticeOverview` | ✓     | ✓             | Real review queue, saved attempts, expired-session recovery, empty guest state                                                                        |
| `/:locale/projects`          | `ProjectsPage`                         | ✓     | ✓             | Guided project entry, real milestone checks, review guidance, mobile brief                                                                            |
| `/:locale/notebook`          | `NotebookPage`                         | ✓     | ✓             | Empty, loading, unavailable and populated note views; lesson picker; saved notes reopen                                                               |
| `/:locale/study-plans`       | `StudyPlansPage`                       | ✓     | ✓             | List, detail, create, edit, delete, duplicate conflict, five REST operations, download and activity log                                               |
| `/:locale/progress`          | `LearningHubPage` / `PracticeOverview` | ✓     | ✓             | Attempt history, review readiness, guest/expired states, no invented streaks                                                                          |
| `/:locale/settings`          | `SettingsPage`                         | ✓     | ✓             | Learning preferences, account/session, passkeys, provider linking, signed-out, deleted, failure and danger-zone states                                |
| `/:locale/missing`           | Missing route                          | ✓     | ✓             | 404/missing-route recovery links in both locales                                                                                                      |

### Vertical slice

The required welcome → lesson → run → result slice is covered by `tests/journeys/learning-hub.spec.ts`, `tests/journeys/lesson.spec.ts` and `tests/journeys/code.spec.ts`. The Playwright suites exercise the real in-browser runner, prediction feedback, output matching, syntax errors and lesson isolation.

## Design-system implementation notes

- Tokens live in `apps/client/src/styles.css`; route layouts live in `apps/client/src/design.css`.
- Canvas `#101214`, reading `#171A1D`, raised `#202529`, divider `#343B40`, outline `#74818A`, ink `#F3F1EB`, secondary `#B2BABD`, success `#A3E6C3`, warning `#F3C477`, error `#FF9696`.
- Spacing uses the 4px scale; controls use 8px corners and panels 12px.
- Lesson prose is 17px / 1.6 with a 64ch measure.
- The Run key uses the ivory fill, ink label, 2px black lower edge, press compression and offset ivory focus ring.
- Code output is neutral ivory on an opaque terminal surface; mint is reserved for status labels such as `✓ Output matches`.
- Sticky navigation uses glass with an opaque fallback; lesson prose and code remain opaque.
- Desktop navigation collapses to the modal drawer at `max-width: 840px`; the drawer is 310px wide, traps focus, closes on Escape/backdrop and restores focus.
- The account disclosure is a non-modal popover with Escape dismissal and focus restoration.
- `motion/react` is installed only in `apps/client`; drawer, popover and the first completed run result use motion, honoring reduced motion. No Three.js was added.
- On phones the vertical `Predict / Run / Explain` margin becomes numbered inline kickers (`01 · Predict`, `02 · Run`, `03 · Explain`). The Explain kicker appears with the account-backed notes panel.

## Commands and outcomes

| Command                                       | Outcome                                                                                                                                                                        |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `pnpm format:check`                           | **Pass** — all matched files use Prettier style (design-lead boards excluded via `.prettierignore`)                                                                            |
| `pnpm typecheck`                              | **Pass**                                                                                                                                                                       |
| `pnpm test`                                   | **Pass** — 26 files, 83 tests                                                                                                                                                  |
| `pnpm test:e2e`                               | **Pass** — 25 public journey tests                                                                                                                                             |
| `pnpm test:accounts`                          | **Pass** — 10 local Worker/D1 account tests                                                                                                                                    |
| `pnpm build`                                  | **Pass** — client build plus server dry-run deploys. Non-failing warning: main client chunk is 597 KB (183 KB gzip).                                                           |
| `node tmp/verify-ui.mjs`                      | **Pass** — 78/78 route checks (13 routes × 2 locales × phone/tablet/desktop): no document overflow, no console/page errors, correct canvas, no duplicate exact “Sign in” links |
| `node tmp/check-header.mjs`                   | **Pass** — widths 840, 860, 900, 960, 1000, 1080: no header or document overflow; drawer shown at 840, desktop nav shown from 860                                              |
| `node tmp/check-reduced-motion.mjs`           | **Pass** — reduced-motion emulation: transitions `0s`, scroll `auto`, drawer untransformed                                                                                     |
| `node tmp/capture.mjs docs/screenshots/final` | **Pass** — 52 working-screen screenshots                                                                                                                                       |

The account suite covers magic-link sign-in, session persistence, sign-out, deletion/revocation, passkeys, social fallbacks, practice syncing, project work, study plans and draft conflicts. No assertions were weakened; selectors were updated only for the new drawer and account-disclosure structure.

## Unverified or intentionally out of scope

- **Cloud deployment was not run.** Build verification used `wrangler deploy --dry-run` only; no cloud settings or credentials were changed.
- **Screenshots use the public/guest session.** Signed-in Today, Settings, Practice, Notebook and Study-plans states were verified by the Playwright account suite but are not part of the public screenshot set.
- **Real third-party OAuth exchange** was not exercised; provider initiation and failure paths were verified with simulated responses.
- **Physical passkey hardware** was not used; passkey journeys ran against Playwright’s CDP virtual authenticator.
- **Real email delivery** was not used; magic links were read from the repo’s local mailbox tooling.
- **Screen-reader testing with a human** was not performed. Accessible names, roles, live regions, focus traps and keyboard dismissal are asserted in Playwright.
- **Reduced-motion behavior** was emulated and checked for zero-duration transitions and an untransformed drawer; no reduced-motion screenshot set was captured.
- **Handoff revision:** the handoff does not expose a revision hash. Cite the file and its 2026-11-02 22:39 local timestamp when reviewing these screenshots.
