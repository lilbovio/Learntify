# Alpha release handoff

Updated October 31, 2026. **Deployment is awaiting owner approval. No testers are available yet.** The software checklist is not a substitute for the final live-service and learner acceptance gate.

## Prepared destination

The proposed preview origin is `https://alpha.learntify.lat`. The reviewed starting configuration is `services/server/preview/wrangler.alpha.example.jsonc`. It uses one Worker for the built client and API, an isolated `learntify-alpha` D1 binding, exact-email admission, disabled public signup and paused private writes. The database UUID is deliberately a placeholder. Credentials and a verified sender are absent, so this is not an operational deployment configuration.

After approval, copy the template to the ignored `services/server/preview/wrangler.jsonc`. Create the isolated database, replace its placeholder ID, and apply numbered migrations through 0008 from `services/server/migrations`; never apply the local mailbox migration. Do not reuse the external-test database, local auth secret or local mailbox. Configure the verified sender, a fresh auth secret, dedicated email key and exact invited addresses through private configuration and secret storage. Review Google/GitHub callbacks and passkey enrollment for the new origin; localhost credentials do not prove HTTPS authentication works.

Before deployment, build the client and dry-run the completed private configuration:

```sh
pnpm build
pnpm --filter @learntify/server exec wrangler deploy --dry-run --config preview/wrangler.jsonc
```

These commands do not deploy. Database creation, remote migrations, provisioning, secret uploads, DNS changes and deployment remain separate approved actions. Keep private writes paused until quota, account admission and recovery checks are complete, then explicitly enable them for the rehearsal. Public lessons remain available when the fully configured application pauses private writes.

## Operator acceptance record

Record the release commit and CI URL, operator, date, evidence and result for each check. Keep addresses, tokens and database contents out of the repository.

- **Pending approval:** owner authorizes the concrete destination and isolated resources.
- **Pending environment:** HTTPS routing and real provider quotas are verified in the relevant accounts, including free-tier limits and billing settings.
- **Pending identity:** email, Google, GitHub, passkey and logout succeed on the preview origin; an uninvited identity cannot enter private APIs.
- **Pending persistence:** code, notes, attempts and plans survive sign-out/sign-in and reload; one account cannot access another account's records.
- **Pending recovery:** rehearse a provider restore into a disposable database, invalidate restored sessions and replay deletions as described in OPERATIONS.md. Record actual retention and restore time.
- **Pending monitoring:** verify a sanitized failure record can be found by request ID; select actual retention and incident ownership. Console output alone is not an alerting service.
- **Pending rollback:** identify the last compatible application version and practice closing admission/writes. Do not reverse destructive migrations.

After an approved deployment, run `pnpm check:preview https://alpha.learntify.lat accounts`. This read-only probe checks routing and public API responses; it does not replace the authenticated checks above.

## Learner rehearsal: English and Spanish

A real learner should perform this without being coached through every click. The owner can perform an initial rehearsal, but must record that limitation. Use the local account environment first if deployment is still deferred.

1. Sign in, select a pace, find the first lesson and explain its objective in their own words.
2. Make a prediction, explain the feedback, edit/run code, and correct an intentional mistake.
3. Save an attempt and notes; reload and find both in progress/notebook.
4. Create, edit and delete a study plan. Try a duplicate identifier and recover using the displayed message.
5. Edit without saving, try leaving, cancel, and verify the work is preserved. Download a copy and inspect it locally.
6. Repeat navigation and a lesson in Spanish at mobile width; use keyboard navigation for the main actions.

Record completion, confusing wording, blocked tasks and accessibility problems without private learner content. Fix blocking issues and repeat the affected task. **No pilot result is recorded yet.** Do not mark check 20 or the alpha as 100% until this record and the live operator checks have evidence.
