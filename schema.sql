-- D1 şeması (Cloudflare'de zaten oluşturuldu; yerel geliştirme için:
--   npx wrangler d1 execute kpss-ozgur --local --file=schema.sql)
CREATE TABLE IF NOT EXISTS progress (
  profile TEXT PRIMARY KEY,
  data TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS ai_usage (
  day TEXT NOT NULL,
  ip TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (day, ip)
);
CREATE TABLE IF NOT EXISTS ai_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ts INTEGER NOT NULL,
  kind TEXT NOT NULL,
  lesson TEXT,
  question TEXT,
  answer TEXT
);
