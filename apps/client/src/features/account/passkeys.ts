import { createAuthClient } from 'better-auth/client';
import { passkeyClient } from '@better-auth/passkey/client';

// Same-origin browser adapter. No credentials or provider configuration belong in the client.
export const passkeyAuth = createAuthClient({ plugins: [passkeyClient()] });
export const supportsPasskeys = () =>
  window.isSecureContext && typeof window.PublicKeyCredential !== 'undefined';
