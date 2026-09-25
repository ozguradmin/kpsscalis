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

-- Doğrulanmış yapay zekâ soruları (üret → ikinci model körlemesine çözer → eşleşirse kaydedilir)
CREATE TABLE IF NOT EXISTS qbank (id TEXT PRIMARY KEY, lesson TEXT NOT NULL, level TEXT, data TEXT NOT NULL, model TEXT, created INTEGER, served INTEGER DEFAULT 0);
CREATE INDEX IF NOT EXISTS qbank_lesson ON qbank(lesson);

-- Gerçek ÖSYM soruları (metin ve görseller sadece veritabanında; depoda yok)
CREATE TABLE IF NOT EXISTS real_q (id TEXT PRIMARY KEY, exam TEXT, level TEXT, year INTEGER, sec TEXT, n INTEGER, s TEXT, lesson TEXT, konu TEXT, tip TEXT, kok TEXT, stem TEXT, o TEXT, a INTEGER, needimg INTEGER, bilgi TEXT);
CREATE INDEX IF NOT EXISTS real_q_lesson ON real_q(lesson);
CREATE INDEX IF NOT EXISTS real_q_s ON real_q(s);
CREATE TABLE IF NOT EXISTS real_img (id TEXT PRIMARY KEY, data BLOB);
