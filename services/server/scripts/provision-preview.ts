import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parsePreviewEmails } from '../src/auth/preview-admission.ts';

const literal = (value: string) => "'" + value.replaceAll("'", "''") + "'";

/** Generate only: never connects to D1, issues sessions, verifies an email, or overwrites a user. */
export function provisionPreviewSql(email: string, name: string): string {
  const emails = parsePreviewEmails(email);
  if (!emails || emails.size !== 1 || email.includes(','))
    throw new Error('Provide one valid email.');
  if (!name.trim() || name.length > 80 || /[\x00-\x1f\x7f]/.test(name))
    throw new Error('Provide a display name of 1–80 characters without control characters.');
  const normalized = [...emails][0]!;
  const now = Date.now();
  return `-- Private preview account. Review before applying to the intended migrated database.\n-- Email ownership is verified by the normal sign-in link; this grants no session.\nINSERT INTO "user" (id, name, email, emailVerified, createdAt, updatedAt)\nSELECT ${literal(randomUUID())}, ${literal(name.trim())}, ${literal(normalized)}, 0, ${now}, ${now}\nWHERE NOT EXISTS (SELECT 1 FROM "user" WHERE lower(email) = ${literal(normalized)});\n`;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    if (process.argv.length !== 4)
      throw new Error(
        'Usage: node services/server/scripts/provision-preview.ts <email> <display-name>',
      );
    const sql = provisionPreviewSql(process.argv[2]!, process.argv[3]!);
    const folder = fileURLToPath(new URL('../../../.learntify-private/', import.meta.url));
    await mkdir(folder, { recursive: true });
    await writeFile(path.join(folder, 'preview-user.sql'), sql, { flag: 'wx', mode: 0o600 });
    console.log(
      'Wrote .learntify-private/preview-user.sql. Review it; no database was changed. Existing files are never overwritten.',
    );
  } catch {
    console.error(
      'Could not prepare preview SQL. Provide one email and display name; ensure the private output file does not already exist.',
    );
    process.exitCode = 1;
  }
}
