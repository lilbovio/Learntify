export type SocialProvider = 'google' | 'github';
export type SocialCredentials = Partial<
  Record<SocialProvider, { clientId: string; clientSecret: string }>
>;

export function readSocialCredentials(env: Record<string, unknown>) {
  const credentials: SocialCredentials = {};
  const fields: string[] = [];
  for (const provider of ['google', 'github'] as const) {
    const prefix = provider.toUpperCase();
    const id = env[prefix + '_CLIENT_ID'];
    const secret = env[prefix + '_CLIENT_SECRET'];
    if (!id && !secret) continue;
    if (typeof id !== 'string' || !id.trim() || typeof secret !== 'string' || !secret.trim()) {
      fields.push(prefix + '_CLIENT_ID', prefix + '_CLIENT_SECRET');
      continue;
    }
    credentials[provider] = { clientId: id.trim(), clientSecret: secret.trim() };
  }
  return { credentials, fields };
}
