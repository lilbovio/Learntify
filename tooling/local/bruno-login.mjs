import { writeFile } from 'node:fs/promises';
import { readLocalSignInLink } from './mailbox.mjs';

// Keep the one-time credential out of tracked requests and terminal output.
const url = await readLocalSignInLink('bruno-demo@example.test');
if (new URL(url).pathname !== '/api/auth/magic-link/verify')
  throw new Error('Unexpected local verification endpoint.');
await writeFile(
  new URL('../../docs/college/bruno/02 Verify sign-in.local.bru', import.meta.url),
  `meta {
  name: 02 Verify sign-in (private local link)
  type: http
  seq: 2
}

get {
  url: ${url}
  body: none
  auth: none
}

settings {
  followRedirects: false
}

tests {
  test("Verification redirects", function () {
    expect(res.status).to.equal(302);
  });
}
`,
);
console.log('Private request 02 prepared. Send it once in Bruno, then send 03 Check session.');
