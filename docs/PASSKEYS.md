# Passkey sign-in and persistent sessions

Learntify uses a persistent HTTP-only session cookie with a seven-day lifetime. Closing a tab does not sign out. Explicit logout revokes the session; a previously verified email address is not a reusable credential. Account settings can revoke other sessions without ending the current one.

Passkeys provide the requested email-free return after logout. Sign in by email once, open account settings, and enroll a passkey within 15 minutes of sign-in. Enrollment requires a verified email and an admitted account. The browser handles device verification; Learntify stores the public credential, never the private key or biometric data. The server verifies origin, relying-party ID, challenge and user verification. Email remains recovery when a passkey is unavailable. Registration and removal require recent authentication.

## Local testing

Use `http://localhost:5174` for offline accounts or `http://localhost:5175` for external services. Numeric IP origins are unsuitable for WebAuthn relying-party IDs. Existing cookies from `127.0.0.1` do not transfer: sign in once at localhost. Do not alternate the hosts during an authentication flow.

Apply migration `0005_passkeys.sql` before starting the updated server. The offline database command applies it automatically; external test D1 requires the documented remote migration command. There are no new paid services or provider keys.

In settings, enter an optional label and choose Add a passkey. Complete your browser/OS prompt yourself. Sign out, choose Sign in with a passkey, and complete device verification. Browser support and local OS credential-manager setup are required. The automated Chromium test uses a virtual authenticator, not the user's real credentials.

Passkeys can be synced by a credential manager; they are not proof of one unique physical device. Localhost credentials do not work on the eventual production domain. Enroll new credentials there after the domain is finalized. This implementation does not register a public production relying party or enable public signup.

References: [Better Auth passkeys](https://better-auth.com/docs/plugins/passkey), [session management](https://better-auth.com/docs/concepts/session-management).
