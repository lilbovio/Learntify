CREATE TABLE drafts (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL,
  lesson_version INTEGER NOT NULL CHECK (lesson_version > 0),
  content TEXT NOT NULL,
  revision INTEGER NOT NULL CHECK (revision > 0),
  UNIQUE (owner_id, lesson_id, lesson_version)
);
CREATE TABLE draft_operations (
  draft_id TEXT NOT NULL REFERENCES drafts(id) ON DELETE CASCADE,
  owner_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
  operation_id TEXT NOT NULL,
  expected_revision INTEGER NOT NULL,
  content_hash TEXT NOT NULL,
  resulting_revision INTEGER NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  PRIMARY KEY (draft_id, owner_id, operation_id)
);
