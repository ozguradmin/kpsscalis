// Keşif: kaynakları sırayla tarar, yeni ilanları kaydeder, ilanlardaki ATS panolarını öğrenip onları da tarar.
import { SOURCES, fetchBoard, detectATS, SEED_BOARDS } from './sources/index.js';
import { now, sha256, normKey, MIN, safeJSON, uid } from './lib/util.js';
import { log, allRows } from './lib/db.js';

async function dedupeKey(j) {
  const c = normKey(j.company);
  const t = normKey(j.title);
  return sha256(c && t ? `${c}|${t}` : j.url);
}

// Yeni ilanları toplu yazar; var olanların sadece last_seen_at'ini günceller. Dönen: yeni ilan sayısı
export async function saveJobs(env, jobs) {
  if (!jobs.length) return { added: 0, seen: 0 };
  const t = now();
  const keys = await Promise.all(jobs.map(dedupeKey));
  const uniq = new Map();
  jobs.forEach((j, i) => { if (!uniq.has(keys[i])) uniq.set(keys[i], j); });
  let added = 0;
  const entries = [...uniq.entries()];
  for (let i = 0; i < entries.length; i += 40) {
    const chunk = entries.slice(i, i + 40);
    const stmts = chunk.map(([k, j]) => {
      const ats = detectATS(j.apply_url) || detectATS(j.url);
      return env.DB.prepare(`INSERT INTO jobs (id, source, external_id, url, apply_url, ats, company, title, location, lang, description, salary, tags, posted_at, discovered_at, last_seen_at, dedupe, status, stage)
        VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13,?14,?15,?15,?16,'new',0)
        ON CONFLICT(dedupe) DO UPDATE SET last_seen_at=?15`)
        .bind(uid('j_'), j.source, j.external_id, j.url, j.apply_url, ats ? ats.ats : null, j.company, j.title, j.location, j.lang, j.description, j.salary, j.tags, j.posted_at, t, k);
    });
    const res = await env.DB.batch(stmts);
    // Yeni satırda last_row_id değişir ve changes=1; güncellemede de changes=1 olur. Ayırt etmek için discovered_at kontrolü:
    added += res.length;
  }
  const fresh = await env.DB.prepare('SELECT COUNT(*) n FROM jobs WHERE discovered_at=?').bind(t).first();
  return { added: fresh?.n || 0, seen: entries.length };
}

// İlan bağlantılarından yeni ATS panoları öğren
export async function learnBoards(env, jobs, from) {
  const found = new Map();
  for (const j of jobs) {
    for (const u of [j.apply_url, j.url]) {
      const a = detectATS(u);
      if (a) found.set(`${a.ats}:${a.slug}`, { ...a, company: j.company });
    }
    // İlan metnindeki ATS bağlantıları (HN ilanlarında sık)
    for (const m of String(j.description || '').matchAll(/https?:\/\/[^\s)"'<>]+/g)) {
      const a = detectATS(m[0]);
      if (a) found.set(`${a.ats}:${a.slug}`, { ...a, company: j.company });
    }
  }
  if (!found.size) return 0;
  const stmts = [...found.entries()].map(([id, a]) => env.DB.prepare('INSERT OR IGNORE INTO boards (id, ats, slug, company, added_at, added_from) VALUES (?,?,?,?,?,?)').bind(id, a.ats, a.slug, a.company || a.slug, now(), from));
  const res = await env.DB.batch(stmts);
  return res.reduce((n, r) => n + (r.meta.changes || 0), 0);
}

export async function seedBoards(env) {
  const stmts = SEED_BOARDS.map(([ats, slug]) => env.DB.prepare('INSERT OR IGNORE INTO boards (id, ats, slug, company, added_at, added_from) VALUES (?,?,?,?,?,?)').bind(`${ats}:${slug}`, ats, slug, slug, now(), 'seed'));
  await env.DB.batch(stmts);
}

async function sourceState(env) {
  const rows = await allRows(env, "SELECT key, value FROM settings WHERE key LIKE 'src:%'");
  const st = {};
  for (const r of rows) st[r.key.slice(4)] = safeJSON(r.value, {});
  return st;
}
async function saveSourceState(env, id, st) {
  await env.DB.prepare("INSERT INTO settings (key, value, updated_at, updated_by) VALUES (?1, ?2, ?3, 'discover') ON CONFLICT(key) DO UPDATE SET value=?2, updated_at=?3").bind('src:' + id, JSON.stringify(st), now()).run();
}

export async function runSource(env, src) {
  const t0 = now();
  const st = (await sourceState(env))[src.id] || {};
  try {
    const jobs = (await src.fetch()).filter((j) => j.title && j.url);
    const { added, seen } = await saveJobs(env, jobs);
    const boards = await learnBoards(env, jobs, src.id);
    Object.assign(st, { last: t0, ok: true, seen, added, boards, err: null, ms: now() - t0, total_added: (st.total_added || 0) + added, fails: 0 });
    await saveSourceState(env, src.id, st);
    await log(env, 'discover', `${src.label}: ${seen} ilan, ${added} yeni${boards ? `, ${boards} yeni şirket panosu` : ''}`, { ref: src.id, data: { seen, added, boards } });
    return { added, seen };
  } catch (e) {
    Object.assign(st, { last: t0, ok: false, err: String(e.message).slice(0, 300), fails: (st.fails || 0) + 1 });
    await saveSourceState(env, src.id, st);
    await log(env, 'discover', `${src.label} hata: ${e.message}`, { level: 'warn', ref: src.id });
    return { added: 0, seen: 0, error: e.message };
  }
}

// Zamanı gelen kaynaklardan en eskisini(lerini) çalıştır
export async function discoverTick(env, settings, { maxSources = 2, maxBoards = 12 } = {}) {
  const st = await sourceState(env);
  const disabled = new Set(settings.sources_disabled || []);
  const weights = settings.source_weights || {};
  const due = SOURCES
    .filter((s) => !disabled.has(s.id) && (weights[s.id] ?? 1) > 0)
    .map((s) => {
      const x = st[s.id] || {};
      // Başarısız kaynak üstel geri çekilir; ağırlığı düşük kaynak daha seyrek taranır
      const cadence = s.cadence * Math.min(8, 2 ** Math.min(3, x.fails || 0)) / Math.max(0.25, weights[s.id] ?? 1);
      return { s, overdue: now() - (x.last || 0) - cadence * MIN };
    })
    .filter((x) => x.overdue > 0)
    .sort((a, b) => b.overdue - a.overdue)
    .slice(0, maxSources);
  const out = [];
  for (const { s } of due) out.push({ id: s.id, ...(await runSource(env, s)) });
  out.push(...(await pollBoards(env, maxBoards)));
  return out;
}

export async function pollBoards(env, n = 12) {
  const boards = await allRows(env, "SELECT * FROM boards WHERE status='active' AND (last_polled IS NULL OR last_polled < ?) ORDER BY COALESCE(last_polled,0) ASC LIMIT ?", now() - 12 * 3600000, n);
  const out = [];
  await Promise.all(boards.map(async (b) => {
    try {
      const jobs = await fetchBoard(b.ats, b.slug);
      const { added } = await saveJobs(env, jobs);
      await env.DB.prepare('UPDATE boards SET last_polled=?, jobs_seen=jobs_seen+?, fails=0 WHERE id=?').bind(now(), added, b.id).run();
      out.push({ id: b.id, added, seen: jobs.length });
    } catch (e) {
      const fails = (b.fails || 0) + 1;
      await env.DB.prepare("UPDATE boards SET last_polled=?, fails=?, status=CASE WHEN ?>=4 THEN 'dead' ELSE status END WHERE id=?").bind(now(), fails, fails, b.id).run();
      out.push({ id: b.id, error: String(e.message).slice(0, 120) });
    }
  }));
  const added = out.reduce((a, b) => a + (b.added || 0), 0);
  if (boards.length) await log(env, 'discover', `${boards.length} şirket panosu tarandı, ${added} yeni ilan`, { data: out.slice(0, 30) });
  return out;
}
