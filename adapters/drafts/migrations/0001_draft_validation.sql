-- Local concurrency validation schema. No remote migration is configured.
CREATE TABLE IF NOT EXISTS drafts (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL,
  content TEXT NOT NULL,
  revision INTEGER NOT NULL CHECK (revision > 0)
);
CREATE TABLE IF NOT EXISTS draft_operations (
  draft_id TEXT NOT NULL REFERENCES drafts(id) ON DELETE CASCADE,
  owner_id TEXT NOT NULL,
  operation_id TEXT NOT NULL,
  expected_revision INTEGER NOT NULL,
  content TEXT NOT NULL,
  resulting_revision INTEGER NOT NULL,
  PRIMARY KEY (draft_id, owner_id, operation_id)
);
