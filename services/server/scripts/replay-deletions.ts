import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/** Generate recovery SQL only. Apply to an isolated restored database after review. */
export function recoveryCleanupSql(deletedUserIds: unknown): string {
  if (
    !Array.isArray(deletedUserIds) ||
    deletedUserIds.length > 10000 ||
    deletedUserIds.some((id) => typeof id !== 'string' || !/^[a-zA-Z0-9_-]{1,128}$/.test(id))
  )
    throw new Error('Expected an array of valid opaque user IDs.');
  const ids = [...new Set(deletedUserIds as string[])];
  return [
    '-- Recovery cleanup: keep admission closed until validation completes.',
    '-- Invalidate all restored sessions, one-time links and pending passkey challenges.',
    'DELETE FROM session;',
    'DELETE FROM verification;',
    ...ids.map((id) => `DELETE FROM "user" WHERE id = '${id}';`),
    '-- Leave rate limits and provider budgets intact; reconcile them before reopening.',
    '',
  ].join('\n');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    if (process.argv.length !== 3)
      throw new Error(
        'Usage: node services/server/scripts/replay-deletions.ts <private-user-id-list.json>',
      );
    const input: unknown = JSON.parse(await readFile(process.argv[2]!, 'utf8'));
    const sql = recoveryCleanupSql(input);
    const folder = fileURLToPath(new URL('../../../.learntify-private/', import.meta.url));
    await mkdir(folder, { recursive: true });
    await writeFile(path.join(folder, 'recovery-cleanup.sql'), sql, { flag: 'wx', mode: 0o600 });
    console.log(
      'Generated .learntify-private/recovery-cleanup.sql. Review before applying to an isolated restored database.',
    );
  } catch {
    console.error(
      'Could not generate recovery cleanup. Check the input format and existing output file; no database was changed.',
    );
    process.exitCode = 1;
  }
}
