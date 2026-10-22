import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

export async function readLocalSignInLink(email) {
  if (!/^[a-zA-Z0-9._+@-]{1,254}$/.test(email)) throw new Error('Use a simple local test email.');
  const root = fileURLToPath(new URL('../../', import.meta.url));
  const { stdout } = await promisify(execFile)(
    process.execPath,
    [
      path.join(root, 'node_modules/wrangler/bin/wrangler.js'),
      'd1',
      'execute',
      'learntify-local',
      '--local',
      '--config',
      path.join(root, 'services/server/wrangler.local.jsonc'),
      '--json',
      '--command',
      `SELECT url FROM dev_mailbox WHERE email = '${email}' AND created_at > ${Date.now() - 600000} LIMIT 1`,
    ],
    { cwd: root, windowsHide: true },
  );
  const result = JSON.parse(stdout);
  const url = result[0]?.results?.[0]?.url;
  if (typeof url !== 'string' || new URL(url).origin !== 'http://127.0.0.1:5174')
    throw new Error('No current local sign-in link found.');
  return url;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  // Explicit developer command only; never an application log or HTTP endpoint.
  console.log(await readLocalSignInLink(process.argv[2] ?? ''));
}
