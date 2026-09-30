// Eski ajandan (ozgur-job-agent-db) veri aktarımı: profil bilgileri, ilanlar, başvurular. Parça parça, kaldığı yerden.
import { now, sha256, normKey, clip, safeJSON, toTs } from './lib/util.js';
import { log, addAction } from './lib/db.js';

const APP_MAP = { confirmed: 'confirmed', interview: 'interview', submitted: 'submitted', needs_human: 'needs_human', blocked_not_eligible: 'blocked', preflight_ready: 'cancelled', review_resolved: 'cancelled', queued: 'cancelled' };
const JOB_MAP = { applied: 'applied', rejected: 'rejected', duplicate: 'rejected', eligible: 'review', review: 'review', discovered: 'new' };

async function state(env) {
  const r = await env.DB.prepare("SELECT value FROM settings WHERE key='legacy_import'").first();
  return r ? JSON.parse(r.value) : { facts: false, jobsOffset: 0, jobsDone: false, apps: false, accounts: false };
}
async function save(env, st) {
  await env.DB.prepare("INSERT INTO settings (key, value, updated_at, updated_by) VALUES ('legacy_import', ?1, ?2, 'legacy') ON CONFLICT(key) DO UPDATE SET value=?1, updated_at=?2").bind(JSON.stringify(st), now()).run();
}

export async function legacyTick(env) {
  if (!env.OLDDB) return { skipped: true };
  const st = await state(env);
  if (st.apps && st.jobsDone && st.facts && st.accounts) return { done: true };
  if (!st.facts) {
    const { results } = await env.OLDDB.prepare('SELECT key, value_json, source, confidence FROM profile_facts').all();
    const stmts = results.map((r) => env.DB.prepare('INSERT OR IGNORE INTO facts (key, value, source, confidence, updated_at) VALUES (?,?,?,?,?)').bind(r.key, r.value_json, `eski ajan: ${clip(r.source, 120)}`, r.confidence ?? 1, now()));
    for (let i = 0; i < stmts.length; i += 80) await env.DB.batch(stmts.slice(i, i + 80));
    st.facts = true; await save(env, st);
    await log(env, 'legacy', `Eski ajandan ${results.length} profil bilgisi aktarıldı`);
    return st;
  }
  if (!st.jobsDone) {
    const { results } = await env.OLDDB.prepare('SELECT * FROM jobs ORDER BY discovered_at LIMIT 250 OFFSET ?').bind(st.jobsOffset).all();
    const stmts = [];
    for (const j of results) {
      const dk = await sha256(normKey(j.company) && normKey(j.title) ? `${normKey(j.company)}|${normKey(j.title)}` : j.url);
      const status = JOB_MAP[j.status] || 'rejected';
      stmts.push(env.DB.prepare(`INSERT OR IGNORE INTO jobs (id, source, external_id, url, apply_url, company, title, location, description, posted_at, discovered_at, last_seen_at, dedupe, status, stage, fit, reason, decision, legacy_id, lang)
        VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13,?14,?15,?16,?17,?18,?1,'en')`)
        .bind(j.id, j.source, j.external_id, j.url, j.apply_url, j.company, j.title, j.location, clip(j.description, 9000), toTs(j.posted_at), toTs(j.discovered_at) || now(), toTs(j.last_seen_at) || now(), dk, status, status === 'new' ? 0 : status === 'review' ? 3 : 4, j.fit_score, clip(`[eski ajan] ${j.decision_reason || ''}`, 400), j.decision));
    }
    for (let i = 0; i < stmts.length; i += 50) await env.DB.batch(stmts.slice(i, i + 50));
    st.jobsOffset += results.length;
    if (results.length < 250) st.jobsDone = true;
    await save(env, st);
    if (st.jobsDone) await log(env, 'legacy', `Eski ajandan ${st.jobsOffset} ilan aktarıldı`);
    return st;
  }
  if (!st.apps) {
    const { results } = await env.OLDDB.prepare('SELECT a.*, j.company, j.title, j.apply_url FROM applications a JOIN jobs j ON j.id=a.job_id').all();
    for (const a of results) {
      const status = APP_MAP[a.status] || 'cancelled';
      await env.DB.prepare(`INSERT OR IGNORE INTO applications (id, job_id, status, method, created_at, started_at, submitted_at, updated_at, answers, evidence, error, legacy)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,1)`).bind(a.id, a.job_id, status, 'legacy', toTs(a.started_at) || toTs(a.updated_at) || now(), toTs(a.started_at), toTs(a.submitted_at), toTs(a.updated_at) || now(), a.form_answers_json, JSON.stringify({ legacy: true, final_url: a.final_url, evidence_key: a.evidence_key }), a.last_error).run();
      if (status === 'interview') {
        await addAction(env, { kind: 'interview', title: `${a.company}: ${a.title} — mülakat/değerlendirme adımı bekliyor`, detail: 'Eski ajan döneminden: şirket (micro1 vb.) yapay zekâ mülakatı ya da sonraki adım istiyor. Bu adımı ancak sen yapabilirsin; e-postalarda hatırlatmalar var.', url: a.apply_url, app_id: a.id, job_id: a.job_id, priority: 1, dedupe: 'legacy_int_' + a.id });
      }
    }
    st.apps = true; await save(env, st);
    await log(env, 'legacy', `Eski ajandan ${results.length} başvuru aktarıldı`);
    return st;
  }
  if (!st.accounts) {
    const { results } = await env.OLDDB.prepare('SELECT service, username, login_url, created_at FROM account_credentials').all();
    for (const r of results) {
      await env.DB.prepare('INSERT OR IGNORE INTO accounts (site, login_url, username, secret, status, created_at, updated_at, notes) VALUES (?,?,?,NULL,?,?,?,?)')
        .bind(String(r.service).toLowerCase(), r.login_url, r.username, 'legacy', toTs(r.created_at) || now(), now(), 'Eski ajanda açıldı; parolası eski anahtarla şifreli (gerekirse "şifremi unuttum" ile yenilenir)').run();
    }
    st.accounts = true; await save(env, st);
    return st;
  }
  return st;
}

// Eski ajanı durdur (yeni sistem çalıştığı doğrulandıktan sonra): kendi durdurma bayrağı
export async function pauseLegacy(env) {
  if (!env.OLDDB) return false;
  await env.OLDDB.prepare("UPDATE system_state SET value_json='true', updated_at=datetime('now') WHERE key='agent_paused'").run();
  await env.OLDDB.prepare("UPDATE system_state SET value_json='false', updated_at=datetime('now') WHERE key='auto_apply_enabled'").run();
  await log(env, 'legacy', 'Eski ajan (ozgur-job-agent) duraklatıldı: yeni sistem devraldı');
  return true;
}
