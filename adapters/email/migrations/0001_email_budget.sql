-- Apply with the versioned application migrations before enabling mail delivery.
CREATE TABLE email_budget (
  day TEXT PRIMARY KEY,
  sent INTEGER NOT NULL CHECK (sent > 0)
);
