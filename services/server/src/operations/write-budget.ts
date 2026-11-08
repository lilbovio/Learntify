import type { D1Database } from '@cloudflare/workers-types';

export interface WritePolicy {
  paused: boolean;
  reserve(ownerId: string): Promise<boolean>;
}

/** Application reservations, not a prediction of provider billing or rows written. */
export function createWritePolicy(db: D1Database, paused = false): WritePolicy {
  return { paused, reserve: (ownerId) => reservePrivateWrite(db, ownerId) };
}

export async function reservePrivateWrite(
  db: D1Database,
  ownerId: string,
  now = new Date(),
  limits = { account: 2000, global: 10000 },
): Promise<boolean> {
  if (
    !Number.isInteger(limits.account) ||
    !Number.isInteger(limits.global) ||
    limits.account < 1 ||
    limits.global < 1
  )
    throw new Error('Invalid write limits');
  const day = now.toISOString().slice(0, 10);
  const row = await db
    .prepare(
      `
    INSERT INTO private_write_budget (day, owner_id, reservations)
    SELECT ?, ?, 1 WHERE (SELECT COALESCE(SUM(reservations), 0) FROM private_write_budget WHERE day = ?) < ?
    ON CONFLICT(day, owner_id) DO UPDATE SET reservations = reservations + 1
    WHERE reservations < ? AND (SELECT COALESCE(SUM(reservations), 0) FROM private_write_budget WHERE day = ?) < ?
    RETURNING reservations
  `,
    )
    .bind(day, ownerId, day, limits.global, limits.account, day, limits.global)
    .first();
  return row !== null;
}

/** Bounded batches: safe to call repeatedly; only retry journals and counters expire. */
export async function cleanupOperationalMetadata(db: D1Database, now = new Date()) {
  const seconds = Math.floor(now.getTime() / 1000);
  const budgetCutoff = new Date(now.getTime() - 2 * 86400000).toISOString().slice(0, 10);
  const mailCutoff = new Date(now.getTime() - 62 * 86400000).toISOString().slice(0, 10);
  await db.batch([
    db
      .prepare(
        'DELETE FROM draft_operations WHERE rowid IN (SELECT rowid FROM draft_operations WHERE created_at < ? ORDER BY created_at LIMIT 500)',
      )
      .bind(seconds - 7 * 86400),
    db
      .prepare(
        'DELETE FROM private_write_budget WHERE rowid IN (SELECT rowid FROM private_write_budget WHERE day < ? ORDER BY day LIMIT 500)',
      )
      .bind(budgetCutoff),
    db
      .prepare(
        'DELETE FROM email_budget WHERE day IN (SELECT day FROM email_budget WHERE day < ? ORDER BY day LIMIT 500)',
      )
      .bind(mailCutoff),
  ]);
}
