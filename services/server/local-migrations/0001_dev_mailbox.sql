-- Local development only. Never include this directory in production migrations.
CREATE TABLE IF NOT EXISTS dev_mailbox (
  email TEXT PRIMARY KEY,
  url TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
