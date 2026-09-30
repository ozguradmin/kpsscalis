// D1 yardımcıları: şema, ayarlar, olay günlüğü, kullanım sayaçları, kilit.
import SCHEMA from '../schema.sql';
import { now, dayKey, safeJSON, uid } from './util.js';

let migrated = false;
export async function migrate(env) {
  if (migrated) return;
  const stmts = SCHEMA.split(/;\s*\n/).map((s) => s.replace(/--.*$/gm, '').trim()).filter(Boolean);
  await env.DB.batch(stmts.map((s) => env.DB.prepare(s)));
  // Sonradan eklenen kolonlar (varsa hata verir, yoksayılır)
  for (const alter of ADDED_COLUMNS) { try { await env.DB.prepare(alter).run(); } catch (e) { /* zaten var */ } }
  migrated = true;
}
const ADDED_COLUMNS = [];

// ---------- ayarlar ----------
// Beynin değiştirebileceği her şey burada; varsayılanlar kodda, değişiklikler D1'de.
export const DEFAULTS = {
  paused: false,                 // tüm otomatik işler durur
  auto_apply: true,              // uygun ilanlara kendi başına başvurur
  daily_apply_limit: 15,         // günlük başvuru üst sınırı
  min_fit_apply: 70,             // otomatik başvuru için en düşük uyum puanı
  min_fit_review: 55,            // bunun altı reddedilir
  daily_ai_budget_usd: 6,        // Workers AI günlük harcama tavanı (2.500 $/yıl ≈ 6,8 $/gün)
  daily_browser_minutes: 120,    // Browser Run: 10 saat/ay dahil, sonrası 0,09 $/saat (kredi)
  monthly_browser_hours: 60,     // en kötü durumda ~4,5 $/ay
  recording_days: 3,             // çalışma kayıtları kaç gün tutulur
  handoff_wait_minutes: 20,      // CAPTCHA vb. için canlı devralma bekleme süresi (sen son 5 dk içinde paneldeysen)
  auto_reply_mail: false,        // işverene gelen sorulara otomatik cevap (varsayılan: taslak + bildirim)
  digest_email: true,            // günlük özet e-postası
  notify_email: 'destek@ozgurguler.tech',
  alert_email: 'ozgurglr256@gmail.com', // önemli gelişmeler (mülakat, teklif, işveren mesajı, senin yapman gereken iş) anında buraya
  from_email: 'destek@ozgurguler.tech',
  from_name: 'Özgür Güler',
  apply_language_policy: 'en_or_tr', // başvuru metni dili: İngilizce (ya da Türkçe ilanlarda Türkçe)
  prefer_async_roles: true,      // yazılı/asenkron iletişimli işler öne alınır (İngilizce konuşma tercih edilmiyor)
  source_weights: {},            // kaynak -> çarpan (beyin ayarlar)
  role_weights: { ai_training: 1.25, frontend: 1.15, fullstack: 1.15, mobile: 1.1, content: 1.05, qa: 1.0, backend: 0.95, data: 1.0, marketing: 0.9, design: 0.85, product: 0.85, devops: 0.8, support: 0.7, sales: 0.4, other: 0.6 },
  blocked_companies: [],
  blocked_domains: [],
  models: {},                    // görev -> model (boşsa llm.js varsayılanı)
  prompt_addenda: {},            // beynin öğrendiği ek kurallar: {triage, analysis, letter, agent, answers}
  max_agent_steps: 28,
  max_per_company_30d: 2,     // aynı şirkete 30 günde en fazla kaç başvuru
  triage_batch: 60,
  jev_enabled: true,
};

export async function getSettings(env) {
  const { results } = await env.DB.prepare('SELECT key, value FROM settings').all();
  const s = structuredClone(DEFAULTS);
  for (const r of results) s[r.key] = safeJSON(r.value, r.value);
  return s;
}

export async function setSetting(env, key, value, by = 'system') {
  await env.DB.prepare('INSERT INTO settings (key, value, updated_at, updated_by) VALUES (?1, ?2, ?3, ?4) ON CONFLICT(key) DO UPDATE SET value=?2, updated_at=?3, updated_by=?4')
    .bind(key, JSON.stringify(value), now(), by).run();
}

export async function getSecret(env, key) {
  const r = await env.DB.prepare('SELECT value FROM secrets WHERE key=?').bind(key).first();
  return r ? r.value : null;
}
export async function setSecret(env, key, value) {
  await env.DB.prepare('INSERT INTO secrets (key, value) VALUES (?1, ?2) ON CONFLICT(key) DO UPDATE SET value=?2').bind(key, value).run();
}

// ---------- olay günlüğü ----------
export async function log(env, type, msg, { level = 'info', ref = null, data = null } = {}) {
  try {
    await env.DB.prepare('INSERT INTO events (ts, level, type, ref, msg, data) VALUES (?, ?, ?, ?, ?, ?)')
      .bind(now(), level, type, ref, String(msg).slice(0, 2000), data == null ? null : JSON.stringify(data).slice(0, 20000)).run();
  } catch (e) { console.error('log fail', e); }
  if (level === 'error') console.error(type, msg);
}

// ---------- sayaçlar ----------
export async function bumpUsage(env, field, n = 1, day = dayKey()) {
  await env.DB.prepare(`INSERT INTO usage_daily (day, ${field}) VALUES (?1, ?2) ON CONFLICT(day) DO UPDATE SET ${field} = ${field} + ?2`).bind(day, n).run();
}
export async function usageToday(env) {
  return (await env.DB.prepare('SELECT * FROM usage_daily WHERE day=?').bind(dayKey()).first()) || { browser_ms: 0, applications: 0, emails_sent: 0 };
}
export async function aiCostToday(env) {
  const r = await env.DB.prepare('SELECT COALESCE(SUM(cost),0) c FROM ai_usage WHERE day=?').bind(dayKey()).first();
  return r ? r.c : 0;
}
export async function browserHoursThisMonth(env) {
  const r = await env.DB.prepare('SELECT COALESCE(SUM(browser_ms),0) ms FROM usage_daily WHERE substr(day,1,7)=?').bind(dayKey().slice(0, 7)).first();
  return (r ? r.ms : 0) / 3600000;
}

// ---------- kilit (aynı anda iki cron işi çakışmasın) ----------
export async function lease(env, name, ms) {
  const key = 'lease:' + name;
  const t = now();
  const r = await env.DB.prepare("INSERT INTO settings (key, value, updated_at, updated_by) VALUES (?1, ?2, ?3, 'lease') ON CONFLICT(key) DO UPDATE SET value=?2, updated_at=?3 WHERE CAST(settings.value AS INTEGER) < ?3")
    .bind(key, String(t + ms), t).run();
  return r.meta.changes > 0;
}
export async function release(env, name) {
  await env.DB.prepare('UPDATE settings SET value=? WHERE key=?').bind('0', 'lease:' + name).run();
}

// ---------- yapılacaklar (senin ilgilenebileceğin şeyler; sistem bunlarda beklemez) ----------
export async function addAction(env, { kind, title, detail = '', url = null, job_id = null, app_id = null, priority = 2, ttlMs = null, dedupe = null }) {
  const id = dedupe || uid('act_');
  await env.DB.prepare('INSERT INTO actions (id, created_at, kind, title, detail, url, job_id, app_id, status, priority, expires_at) VALUES (?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET title=excluded.title, detail=excluded.detail, url=excluded.url, status=\'open\', created_at=excluded.created_at')
    .bind(id, now(), kind, title, detail, url, job_id, app_id, 'open', priority, ttlMs ? now() + ttlMs : null).run();
  return id;
}

export async function allRows(env, sql, ...binds) {
  const { results } = await env.DB.prepare(sql).bind(...binds).all();
  return results;
}
export async function oneRow(env, sql, ...binds) {
  return env.DB.prepare(sql).bind(...binds).first();
}
