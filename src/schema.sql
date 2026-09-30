-- Özgür İş Ajanı v2 şeması. Worker her açılışta idempotent olarak uygular (CREATE ... IF NOT EXISTS).

CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at INTEGER NOT NULL, updated_by TEXT);
CREATE TABLE IF NOT EXISTS secrets (key TEXT PRIMARY KEY, value TEXT NOT NULL);

CREATE TABLE IF NOT EXISTS jobs (
  id TEXT PRIMARY KEY,
  source TEXT NOT NULL,
  external_id TEXT,
  url TEXT NOT NULL,
  apply_url TEXT,
  ats TEXT,
  company TEXT,
  title TEXT NOT NULL,
  location TEXT,
  lang TEXT,
  description TEXT,
  salary TEXT,
  tags TEXT,
  posted_at INTEGER,
  discovered_at INTEGER NOT NULL,
  last_seen_at INTEGER NOT NULL,
  dedupe TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  stage INTEGER NOT NULL DEFAULT 0,
  remote_scope TEXT,
  turkey_ok INTEGER,
  langs_required TEXT,
  role_family TEXT,
  scam INTEGER,
  fit INTEGER,
  priority REAL,
  decision TEXT,
  reason TEXT,
  jev TEXT,
  analysis TEXT,
  raw TEXT,
  legacy_id TEXT
);
CREATE UNIQUE INDEX IF NOT EXISTS jobs_dedupe ON jobs(dedupe);
CREATE INDEX IF NOT EXISTS jobs_status ON jobs(status, priority);
CREATE INDEX IF NOT EXISTS jobs_source ON jobs(source, discovered_at);
CREATE INDEX IF NOT EXISTS jobs_disc ON jobs(discovered_at);

CREATE TABLE IF NOT EXISTS boards (
  id TEXT PRIMARY KEY,
  ats TEXT NOT NULL,
  slug TEXT NOT NULL,
  company TEXT,
  added_at INTEGER NOT NULL,
  added_from TEXT,
  last_polled INTEGER,
  jobs_seen INTEGER DEFAULT 0,
  fails INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active'
);

CREATE TABLE IF NOT EXISTS applications (
  id TEXT PRIMARY KEY,
  job_id TEXT NOT NULL,
  status TEXT NOT NULL,
  method TEXT,
  created_at INTEGER NOT NULL,
  started_at INTEGER,
  submitted_at INTEGER,
  updated_at INTEGER NOT NULL,
  attempts INTEGER DEFAULT 0,
  letter TEXT,
  answers TEXT,
  evidence TEXT,
  confirmation TEXT,
  error TEXT,
  live_url TEXT,
  workflow_id TEXT,
  account_site TEXT,
  steps INTEGER DEFAULT 0,
  cost REAL DEFAULT 0,
  browser_ms INTEGER DEFAULT 0,
  legacy INTEGER DEFAULT 0
);
CREATE INDEX IF NOT EXISTS apps_job ON applications(job_id);
CREATE INDEX IF NOT EXISTS apps_status ON applications(status, updated_at);

CREATE TABLE IF NOT EXISTS recordings (
  id TEXT PRIMARY KEY,
  app_id TEXT,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  frames INTEGER DEFAULT 0,
  title TEXT,
  session_id TEXT,
  deleted INTEGER DEFAULT 0
);
CREATE INDEX IF NOT EXISTS rec_app ON recordings(app_id);

CREATE TABLE IF NOT EXISTS accounts (
  site TEXT PRIMARY KEY,
  login_url TEXT,
  username TEXT,
  secret TEXT,
  status TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ts INTEGER NOT NULL,
  level TEXT NOT NULL,
  type TEXT NOT NULL,
  ref TEXT,
  msg TEXT NOT NULL,
  data TEXT
);
CREATE INDEX IF NOT EXISTS events_ts ON events(ts);
CREATE INDEX IF NOT EXISTS events_ref ON events(ref);

CREATE TABLE IF NOT EXISTS mail (
  id TEXT PRIMARY KEY,
  received_at TEXT,
  from_addr TEXT,
  subject TEXT,
  category TEXT,
  app_id TEXT,
  code TEXT,
  link TEXT,
  summary TEXT,
  draft TEXT,
  handled INTEGER DEFAULT 0,
  processed_at INTEGER
);
CREATE INDEX IF NOT EXISTS mail_recv ON mail(received_at);

CREATE TABLE IF NOT EXISTS actions (
  id TEXT PRIMARY KEY,
  created_at INTEGER NOT NULL,
  kind TEXT NOT NULL,
  title TEXT NOT NULL,
  detail TEXT,
  url TEXT,
  job_id TEXT,
  app_id TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  priority INTEGER DEFAULT 2,
  expires_at INTEGER
);
CREATE INDEX IF NOT EXISTS actions_status ON actions(status, created_at);

CREATE TABLE IF NOT EXISTS memory (
  id TEXT PRIMARY KEY,
  created_at INTEGER NOT NULL,
  kind TEXT NOT NULL,
  scope TEXT,
  text TEXT NOT NULL,
  weight REAL DEFAULT 1,
  active INTEGER DEFAULT 1,
  source TEXT
);

CREATE TABLE IF NOT EXISTS recipes (
  id TEXT PRIMARY KEY,
  scope TEXT NOT NULL,
  updated_at INTEGER NOT NULL,
  successes INTEGER DEFAULT 0,
  failures INTEGER DEFAULT 0,
  notes TEXT,
  fields TEXT
);

CREATE TABLE IF NOT EXISTS chat (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ts INTEGER NOT NULL,
  thread TEXT NOT NULL DEFAULT 'main',
  role TEXT NOT NULL,
  content TEXT,
  meta TEXT
);

CREATE TABLE IF NOT EXISTS ai_usage (
  day TEXT NOT NULL,
  model TEXT NOT NULL,
  task TEXT NOT NULL,
  calls INTEGER DEFAULT 0,
  in_tok INTEGER DEFAULT 0,
  out_tok INTEGER DEFAULT 0,
  cost REAL DEFAULT 0,
  errors INTEGER DEFAULT 0,
  PRIMARY KEY (day, model, task)
);

CREATE TABLE IF NOT EXISTS usage_daily (
  day TEXT PRIMARY KEY,
  browser_ms INTEGER DEFAULT 0,
  applications INTEGER DEFAULT 0,
  emails_sent INTEGER DEFAULT 0,
  jev_tokens INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS model_evals (
  id TEXT PRIMARY KEY,
  ts INTEGER NOT NULL,
  source TEXT,
  results TEXT NOT NULL,
  chosen TEXT
);

CREATE TABLE IF NOT EXISTS facts (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  source TEXT,
  confidence REAL DEFAULT 1,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS runs (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL,
  ref TEXT,
  started_at INTEGER NOT NULL,
  ended_at INTEGER,
  status TEXT,
  stats TEXT
);
CREATE INDEX IF NOT EXISTS runs_kind ON runs(kind, started_at);

CREATE TABLE IF NOT EXISTS logins (
  ip TEXT NOT NULL,
  ts INTEGER NOT NULL,
  ok INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS logins_ip ON logins(ip, ts);
