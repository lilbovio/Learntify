# Demonstrate Learntify with Bruno

This collection exercises the real local account API and local D1 database. It does not use production credentials or send email. Use the synthetic account `bruno-demo@example.test`. Do not change this collection to target the hosted alpha: private writes may be paused there.

## 1. Start the application

Open terminals in the repository root. First apply local migrations (safe to repeat):

```powershell
pnpm db:local
```

Keep these two commands running in separate terminals:

```powershell
pnpm dev:accounts:server
```

```powershell
pnpm dev:accounts:client
```

The requests use `http://localhost:5174`. Vite proxies `/api` to the local Worker on port 8788. Keep `localhost` consistent; switching to `127.0.0.1` changes cookie/origin behavior.

## 2. Open the collection

In Bruno, choose **Open Collection** and select this folder (`docs/college/bruno`), which contains `bruno.json`. Select the **Local** environment. A collection is a saved group of requests; the environment supplies `baseUrl`.

Select a request in the sidebar and click **Send**. The top section is what you send (method, URL, headers and body). The response section shows what the server returned (status, JSON, headers and test results). Auth is set to None because this API uses a session cookie, not a Bearer token. Bruno's cookie jar handles that cookie after sign-in.

## 3. Sign in inside Bruno

1. Send **01 Request sign-in**. Expect 200. This writes a local mailbox entry; it does not send real email. The adult-confirmation field represents your explicit self-attestation, as in the app.
2. In a third terminal at the repository root, run:

   ```powershell
   node tooling/local/bruno-login.mjs
   ```

3. Bruno should discover **02 Verify sign-in (private local link)**. If necessary, reopen the collection. Send this request once within ten minutes. Expect 302. Redirect-following is deliberately disabled so you can see the authentication response instead of an HTML page.
4. Send **03 Check session**. Expect 200 with your user ID. This confirms authentication; a redirect alone is not proof of a valid session.

The helper stores the one-time link only in an ignored `*.local.bru` file and does not print it. Do not share that file, export the cookie jar, or show authentication response headers on a projector. Browser and Bruno sessions are separate: signing in in your browser does not sign Bruno in. No API key or `.dev.vars` value belongs in this collection.

## 4. Present the API

Send requests individually in this order and inspect **Tests** after each:

1. **04 Create plan** -> 201. Explain the JSON body and Location header. A pre-request script creates a fresh slug; the response script remembers the ID in the runtime variable `planId`.
2. **05 List plans** -> 200. Explain the collection and pagination.
3. **06 Get plan by ID** -> 200. Explain `{{planId}}` and the returned resource.
4. **07 Update plan** -> 200. Explain that PUT sends all four editable fields. Send 06 again if you want to demonstrate that the changes persisted.
5. **08 Duplicate slug** -> 409. This repeats the current slug without generating a new one. The duplicate rule is per-owner slug, not matching descriptions.
6. **09 Invalid input** -> 400. Show the empty title and zero weekly minutes.
7. **10 Delete plan** -> 204. An empty response body is correct.
8. **11 Deleted plan is missing** -> 404. Show that deletion took effect.
9. **12 Sign out** -> 200. This signs out Bruno, not your browser.
10. **13 Unauthenticated list** -> 401. Show that private resources require a session.

The error examples are successful tests when they return their expected error status. Do not deliberately break the database to show 500; discuss the existing automated error-handler tests instead.

Do not use Run Collection for the initial authentication setup: request 02 must be regenerated between requesting and consuming the link. For the first presentation, manual requests make the behavior easier to explain. Run 04 only once per walkthrough; repeating it creates another plan. Run 08 to demonstrate a duplicate. After signing out, repeat the sign-in steps before another walkthrough. Runtime variables are not persisted, so after restarting Bruno, start with sign-in and 04 again.

## Troubleshooting

- Connection refused: both local servers must be running. Do not start another copy on an occupied port.
- No Local environment selected: select it to resolve `{{baseUrl}}`.
- 401: complete 01, regenerate 02, send 02, then check 03. Ensure Bruno saves/sends cookies.
- 403: keep the Origin header and baseUrl at `http://localhost:5174`.
- Verification redirects but 03 returns 401: the link may have expired or already been used. Request a new link and regenerate 02. Do not open it in your browser first.
- 429 during login: stop retrying and allow the rate-limit window to expire.
- Unresolved planId: send 04 successfully in this Bruno session.
- 503: check that you are using the local account profile, not the deployed write-paused alpha.

## References

- [API contract](../openapi-study-plans.yaml)
- [Local account setup](../../LOCAL_ACCOUNTS.md)
- [Bruno scripting reference](https://docs.usebruno.com/testing/script/javascript-reference)
- [Bruno collection format](https://docs.usebruno.com/bru-lang/overview)

The application and its existing CI are unchanged by this demo collection. Requests 10 and 12 intentionally delete the demonstration plan and end the demonstration session.
