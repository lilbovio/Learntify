import { writeFile } from 'node:fs/promises';
import { Miniflare } from 'miniflare';
import { getMigrations } from 'better-auth/db/migration';
import { createAuth } from '../src/auth/create-auth.ts';

// Initial schema only. Never overwrite a migration or migrate a remote database here.
const runtime = new Miniflare({
  modules: true,
  script: 'export default { fetch() { return new Response("ok"); } }',
  d1Databases: ['DB'],
  compatibilityDate: '2026-07-30',
});
try {
  const auth = createAuth({
    database: await runtime.getD1Database('DB'),
    secret: 'schema-generation-only-not-a-runtime-secret',
    origin: 'https://learntify.test',
    sendSignInLink: async () => {
      throw new Error('Schema generation cannot send mail.');
    },
  });
  const schema = await (await getMigrations(auth.options)).compileMigrations();
  await writeFile(
    new URL('../migrations/0001_auth.sql', import.meta.url),
    '-- Better Auth 1.7.12; generated then reviewed.\n' + schema + '\n',
    { flag: 'wx' },
  );
} finally {
  await runtime.dispose();
}
