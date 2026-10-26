CREATE TABLE study_plans (
  id TEXT PRIMARY KEY NOT NULL,
  owner_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
  slug TEXT NOT NULL CHECK (length(slug) BETWEEN 3 AND 60),
  title TEXT NOT NULL CHECK (length(trim(title)) BETWEEN 1 AND 120),
  description TEXT NOT NULL CHECK (length(description) <= 2000),
  weekly_minutes INTEGER NOT NULL
    CHECK (typeof(weekly_minutes) = 'integer' AND weekly_minutes BETWEEN 15 AND 1200),
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'active', 'completed')),
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  UNIQUE (owner_id, slug)
);
CREATE INDEX study_plans_owner_created
  ON study_plans(owner_id, created_at DESC, id DESC);
-- The API validates UUIDs, slug syntax and immutable fields.
-- Every query additionally filters by owner_id obtained from the session.
