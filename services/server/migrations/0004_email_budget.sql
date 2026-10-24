-- Shared mail reservations; required before enabling existing-account preview delivery.
CREATE TABLE email_budget (
  day TEXT PRIMARY KEY,
  sent INTEGER NOT NULL CHECK (sent > 0)
);
