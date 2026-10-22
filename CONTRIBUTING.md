# Contributing

Learntify is early in development. Start with README.md and the architecture documents before proposing a new dependency or runtime. The initial maintainer is Juan Pablo Bovio Vallejo; there is no assumed review team.

## Changes

Use `main` for the reviewed baseline. Create short-lived branches such as `feat/account-onboarding` or `fix/draft-conflicts`, and open pull requests back to `main`. Keep commits focused and require the CI checks to pass before merging. Repository branch protection must be configured separately; this convention alone does not enforce it.

Keep one coherent behavior per change. Explain the problem, the resulting behavior, and how it was tested. Preserve others' local work; coordinate before editing the same files. Major changes to database choice, domain boundaries, auth, or public contracts need a decision record first.

Use the package's public export rather than another package's source path. Domain modules remain independent of HTTP, UI, database, and provider SDKs. Store user-visible interface copy in the bilingual copy module; curriculum content has both English and Spanish variants.

Run `pnpm check` before submitting. Run `pnpm test:e2e` for changes to learner flows or their API dependencies. Write regression tests that demonstrate the failure being fixed, including invalid input, ownership, concurrency, or recovery where relevant. Do not disable a failed gate merely to merge.

Use `pnpm format` for maintained code. Existing planning documents and the root scratch experiment are excluded from automated formatting. Never commit credentials, local database state, screenshots containing personal information, or production exports.

## Content and accessibility

State the learning objective, expected misconceptions, explanation, feedback, and transfer prompt. Test both locales and preserve stable exercise identities across translation. Correct feedback does not establish mastery by itself. Test keyboard navigation, mobile width, and recovery from network failure.

## License

Contribute only material you have the right to contribute under the project's MIT license. Preserve third-party notices and disclose copied or externally sourced assets. Learner posts and private work are not automatically MIT-licensed by being stored in the app.
