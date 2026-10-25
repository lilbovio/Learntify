# Google and GitHub local sign-in

OAuth is implemented but requires your own provider applications for live testing. No domain purchase is needed for the local callbacks. Use the existing external-services profile at `http://localhost:5175`; the offline profile intentionally has no OAuth credentials. Public signup remains disabled.

## Private configuration

Put these values only in the ignored `services/server/external/.dev.vars` file:

```dotenv
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
```

Leave both values empty to disable a provider. An incomplete pair rejects account configuration. Never commit these values, paste them into chat, place them in Vite variables, or include them in screenshots. Keep the existing AUTH_SECRET and Resend settings. Restart the external server after editing the file.

## Google

Create a project in [Google Cloud Console](https://console.cloud.google.com/), configure Google Auth Platform branding/audience, and create an OAuth client of type **Web application**. Keep the application in testing and add your account as a test user where required. Do not enable paid products for this setup.

- Authorized JavaScript origin: `http://localhost:5175`
- Authorized redirect URI: `http://localhost:5175/api/auth/callback/google`
- Store its client ID and secret in the private file above.

Only identity scopes are needed. Do not request Gmail, Drive, or other product access. [Provider documentation](https://better-auth.com/docs/authentication/google).

## GitHub

In [Developer settings → OAuth Apps](https://github.com/settings/developers), create a separate OAuth application for Learntify local testing:

- Application name: `Learntify local testing`
- Homepage URL: `http://localhost:5175`
- Authorization callback URL: `http://localhost:5175/api/auth/callback/github`
- Device flow is not needed.
- Store its client ID and generated client secret in the private file above.

The integration uses identity and email access, not repository permissions. Your GitHub account must have the same verified email as your Learntify preview account. [GitHub setup](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app), [provider integration](https://better-auth.com/docs/authentication/github).

## Test the account flow

1. Sign in to Learntify with email or your passkey.
2. Open account settings and choose Connect Google or Connect GitHub. If identity confirmation is needed, complete the passkey prompt; the pending connection resumes automatically. If no passkey is available, use Confirm by email instead. That link returns to settings without requiring logout; select the provider again.
3. Authorize that provider yourself. Use the same verified email. Settings displays the connected provider after the callback.
4. Sign out and use Continue with Google/GitHub on the sign-in page.

Implicit same-email linking is disabled. OAuth cannot create an account during this preview. A first-time OAuth sign-in must be linked from settings first. Rejected, cancelled or expired flows keep email/passkey recovery available. Provider token exchange and signed identity verification are delegated to pinned Better Auth; automated tests simulate provider responses while exercising real state cookies, linking policy and local D1. Live provider testing is still required.

Access/refresh tokens are encrypted by Better Auth before storage. The API exposes provider names only when displaying connections. No client-controlled scopes, callback destinations, token-based shortcuts or signup overrides are accepted. Provider disconnect controls are not yet exposed; provider-side authorization can be revoked directly in Google/GitHub settings.
