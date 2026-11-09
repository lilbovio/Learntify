# Inviting alpha testers

The public alpha uses `ACCOUNT_MODE=public-alpha` and does not require invitations. This guide applies only when an operator explicitly selects `existing-accounts` for a restricted cohort.

The hosted alpha requires both an account in D1 and inclusion in the exact-email allowlist, `PREVIEW_EMAILS`. There is currently no invitation dashboard or automatic invitation email. Public lessons are open. The cohort supports up to 20 email entries and is initially for adults 18 and older.

## Add a tester

1. Obtain their preferred sign-in email and display name. Generate their account SQL from the repository root, substituting their details:

   ```sh
   node services/server/scripts/provision-preview.ts learner@example.test "Preview Learner"
   ```

   This writes the ignored `.learntify-private/preview-user.sql`. It refuses to overwrite an existing file. Review and securely archive any previous output before generating another. The statement creates an unverified account only if that email is absent.

2. Review the SQL locally, confirm the alpha database binding and apply it:

   ```sh
   pnpm exec wrangler d1 execute learntify-alpha --remote --config services/server/preview/wrangler.jsonc --file .learntify-private/preview-user.sql
   ```

3. Append their address to the comma-separated `PREVIEW_EMAILS` value in the ignored `services/server/preview/.dev.vars`. Preserve existing members. Update the deployed secret using the interactive prompt:

   ```sh
   pnpm exec wrangler secret put PREVIEW_EMAILS --config services/server/preview/wrangler.jsonc
   ```

   Paste the complete email list at the prompt. Keep the local value aligned so a future deployment preserves the cohort.

4. Share https://alpha.learntify.lat/en/auth (or /es/auth). The tester requests their own email link and verifies inbox ownership. Provider linking requires the same verified email. Google testing-mode access may also require adding them in the OAuth audience settings.

An unlisted address receives a generic acknowledgement without email delivery. Invitations do not lift paused private writes; consult the [release record](ALPHA_RELEASE.md) before promising that saving is available.

## Remove access

Remove the address locally and update the deployed secret with the complete remaining list. This blocks private API access and admitted sign-ins, but preserves account data and does not physically revoke sessions. Re-adding the address can restore access through an unexpired session.

Keep cohort lists and generated SQL private. See [production setup](PRODUCTION_SETUP.md) for admission rules and [operations](OPERATIONS.md) for cleanup and recovery.
