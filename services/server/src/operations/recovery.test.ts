import { DatabaseSync } from 'node:sqlite';
import { readdir, readFile } from 'node:fs/promises';
import { expect, it } from 'vitest';
import { recoveryCleanupSql } from '../../scripts/replay-deletions';

it('restores a synthetic snapshot, reapplies deletions and invalidates restored credentials', async () => {
  const original = new DatabaseSync(':memory:');
  const restored = new DatabaseSync(':memory:');
  try {
    const folder = new URL('../../migrations/', import.meta.url);
    for (const file of (await readdir(folder)).filter((name) => name.endsWith('.sql')).sort())
      original.exec(await readFile(new URL(file, folder), 'utf8'));
    original.exec(`
      INSERT INTO user(id,name,email,emailVerified,createdAt,updatedAt) VALUES ('alice','Alice','alice@example.test',1,1,1),('bob','Bob','bob@example.test',1,1,1);
      INSERT INTO session(id,expiresAt,token,createdAt,updatedAt,userId) VALUES ('session-a',9999999999999,'synthetic-a',1,1,'alice'),('session-b',9999999999999,'synthetic-b',1,1,'bob');
      INSERT INTO verification(id,identifier,value,expiresAt,createdAt,updatedAt) VALUES ('link','synthetic','synthetic',9999999999999,1,1);
      INSERT INTO account(id,accountId,providerId,userId,createdAt,updatedAt) VALUES ('account-a','synthetic','github','alice',1,1);
      INSERT INTO passkey(id,publicKey,userId,credentialID,counter,deviceType,backedUp) VALUES ('key-a','synthetic','alice','synthetic',0,'singleDevice',0);
      INSERT INTO drafts(id,owner_id,lesson_id,lesson_version,content,revision) VALUES ('draft-a','alice','values-and-expressions',1,'private alice',2),('draft-b','bob','values-and-expressions',1,'preserve bob',1);
      INSERT INTO draft_operations(draft_id,owner_id,operation_id,expected_revision,content_hash,resulting_revision) VALUES ('draft-a','alice','op-a',1,'synthetic',2);
      INSERT INTO learning_preferences(user_id,locale,goal,weekly_minutes,updated_at) VALUES ('alice','en','foundations',60,1);
      INSERT INTO practice_attempts(user_id,id,lesson_id,lesson_version,code,matched,created_at) VALUES ('alice','attempt-a','values-and-expressions',1,'console.log(7)',1,1);
      INSERT INTO study_plans(id,owner_id,slug,title,description,weekly_minutes,status,created_at,updated_at) VALUES ('plan-a','alice','learn-js','Learn JS','',120,'draft',1,1),('plan-b','bob','learn-js','Keep this','',120,'active',1,1);
      INSERT INTO email_budget(day,sent) VALUES ('2026-10-26',90);
      INSERT INTO private_write_budget(day,owner_id,reservations) VALUES ('2026-10-26','alice',5);
    `);
    const snapshot = original.serialize();
    original.exec("DELETE FROM user WHERE id = 'alice'");
    restored.deserialize(snapshot);
    restored.exec('PRAGMA foreign_keys = ON');
    expect(restored.prepare("SELECT id FROM user WHERE id = 'alice'").get()).toBeTruthy();
    restored.exec(recoveryCleanupSql(['alice']));
    restored.exec(recoveryCleanupSql(['alice']));
    for (const table of [
      'session',
      'verification',
      'account',
      'passkey',
      'draft_operations',
      'learning_preferences',
      'practice_attempts',
    ])
      expect(restored.prepare(`SELECT COUNT(*) AS count FROM ${table}`).get()?.count).toBe(0);
    expect(restored.prepare('SELECT id FROM user').all()).toEqual([{ id: 'bob' }]);
    expect(restored.prepare('SELECT content FROM drafts').all()).toEqual([
      { content: 'preserve bob' },
    ]);
    expect(restored.prepare('SELECT title FROM study_plans').all()).toEqual([
      { title: 'Keep this' },
    ]);
    expect(restored.prepare('SELECT sent FROM email_budget').get()?.sent).toBe(90);
    expect(
      restored.prepare('SELECT reservations FROM private_write_budget').get()?.reservations,
    ).toBe(5);
    expect(restored.prepare('PRAGMA foreign_key_check').all()).toEqual([]);
    expect(restored.prepare('PRAGMA integrity_check').get()?.integrity_check).toBe('ok');
  } finally {
    original.close();
    restored.close();
  }
});

it('rejects malformed cleanup records instead of interpolating arbitrary SQL', () => {
  for (const input of [null, {}, [''], ["alice'; DROP TABLE user;--"], [3]])
    expect(() => recoveryCleanupSql(input)).toThrow();
  expect(recoveryCleanupSql(['alice', 'alice']).match(/DELETE FROM "user"/g)).toHaveLength(1);
});
