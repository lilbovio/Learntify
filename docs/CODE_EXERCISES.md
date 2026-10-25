# Code exercises

The first two bilingual lessons now include editable synchronous JavaScript exercises with expected output and immediate feedback. Code is saved by lesson/version in this browser only, shared by anyone using that browser profile. It is not yet synchronized to the account. Reset restores the lesson example.

## Execution boundary

The client lazily starts a dedicated Worker containing QuickJS compiled to WebAssembly. Learner source is evaluated in a fresh QuickJS context, never with browser `eval` or `Function`. Only `console.log` is exposed. There is no browser DOM, fetch, storage, credential access, module loader or timer API in the learner context. Promise jobs are not drained; asynchronous exercises are not supported yet.

Source is limited to 16,000 characters. Execution has a one-second VM interrupt deadline, a configured 16 MiB VM memory limit and 256 KiB stack limit. An independent five-second wall-clock timer terminates the Worker, including loading time. These are resource mitigations, not a guarantee of a fixed total browser memory footprint. Stop, lesson navigation and component unmount terminate the Worker. Output is capped at 50 lines and 1,000 characters per line. Objects are represented by type rather than traversed or invoking learner getters.

Output matching is public practice feedback: it does not prove the intended technique was used, assess mastery or award a credential. Attempts and progress are not yet stored. Next, add account-owned attempt records, explicit client-reported provenance, and a review queue before broadening assessment claims.

## Verification

`pnpm test:e2e` covers runnable exercises, reload persistence, lesson separation, unavailable browser globals, infinite loops, syntax errors, output caps and subsequent successful execution. `pnpm exec playwright test --config playwright.production.config.ts` repeats the runner journeys against compiled assets to catch Worker/WASM packaging regressions. Both are in CI. No live provider, paid service or external execution service is involved.

Interpreter reference: [QuickJS Emscripten](https://github.com/justjake/quickjs-emscripten). Package version is pinned in the client manifest and lockfile.

Turnstile is deferred by the owner. Existing restricted registration remains in place; it is not a prerequisite for learning features.
