CREATE TABLE private_write_budget (
  day TEXT NOT NULL,
  owner_id TEXT NOT NULL,
  reservations INTEGER NOT NULL CHECK (reservations > 0),
  PRIMARY KEY (day, owner_id)
);
CREATE INDEX draft_operations_created_at ON draft_operations(created_at);
-- Budget metadata intentionally survives account deletion until bounded cleanup.
-- It contains opaque account IDs, dates and counts, never draft contents.
