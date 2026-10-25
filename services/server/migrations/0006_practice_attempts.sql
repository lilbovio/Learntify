CREATE TABLE practice_attempts (
  user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
  id TEXT NOT NULL,
  lesson_id TEXT NOT NULL,
  lesson_version INTEGER NOT NULL CHECK (lesson_version > 0),
  code TEXT NOT NULL CHECK (length(code) <= 16000),
  matched INTEGER NOT NULL CHECK (matched IN (0, 1)),
  created_at INTEGER NOT NULL,
  PRIMARY KEY (user_id, id)
);
CREATE INDEX practice_owner_time ON practice_attempts(user_id, created_at);
CREATE INDEX practice_lesson ON practice_attempts(user_id, lesson_id, lesson_version, created_at);
