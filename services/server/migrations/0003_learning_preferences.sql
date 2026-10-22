CREATE TABLE learning_preferences (
  user_id TEXT PRIMARY KEY REFERENCES user(id) ON DELETE CASCADE,
  locale TEXT NOT NULL CHECK (locale IN ('en', 'es')),
  goal TEXT NOT NULL CHECK (goal IN ('foundations', 'projects', 'interviews')),
  weekly_minutes INTEGER CHECK (weekly_minutes IS NULL OR weekly_minutes IN (60, 180, 300)),
  updated_at INTEGER NOT NULL
);
