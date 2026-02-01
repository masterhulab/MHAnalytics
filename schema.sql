-- Create Main Table
CREATE TABLE IF NOT EXISTS visits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  url TEXT,
  referrer TEXT,
  user_agent TEXT,
  ip TEXT,
  country TEXT,
  domain TEXT,
  session_id TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create Indexes
CREATE INDEX IF NOT EXISTS idx_visits_timestamp ON visits(timestamp);
CREATE INDEX IF NOT EXISTS idx_visits_url ON visits(url);
CREATE INDEX IF NOT EXISTS idx_visits_domain ON visits(domain);
CREATE INDEX IF NOT EXISTS idx_visits_session_id ON visits(session_id);
CREATE INDEX IF NOT EXISTS idx_visits_referrer ON visits(referrer);
CREATE INDEX IF NOT EXISTS idx_visits_country ON visits(country);
CREATE INDEX IF NOT EXISTS idx_visits_user_agent ON visits(user_agent);
