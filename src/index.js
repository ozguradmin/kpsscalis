// Özgür İş Ajanı v2 — Cloudflare Worker giriş noktası: panel API'si + 10 dakikalık zamanlayıcı + başvuru iş akışı.
import { migrate, getSettings, setSetting, log, allRows, oneRow, lease, release, usageToday, aiCostToday, browserHoursThisMonth } from './lib/db.js';
import { login, readSession, logoutCookie } from './lib/auth.js';
import { WorkflowEntrypoint } from 'cloudflare:workers';
import { json, now, DAY, HOUR, MIN, dayKey, safeJSON, clip } from './lib/util.js';
import { discoverTick, seedBoards, runSource, pollBoards } from './discover.js';
import { triageTick, reanalyze } from './triage.js';
import { mailTick, sendMail, dailyDigest } from './mail.js';
import { dispatch, recoverStuck, createApplication, ApplyWorkflow } from './apply/index.js';
import { chat, dailyReview, stateSummary, validateSetting, runTool } from './brain.js';
import { runModelEval } from './evals.js';
import { SOURCES } from './sources/index.js';
import { DEFAULT_MODELS } from './lib/llm.js';

export { ApplyWorkflow };

// Uzun süren işler (model yarışması, öz değerlendirme) için dayanıklı iş akışı: istek süresine bağlı kalmaz
export class TaskWorkflow extends WorkflowEntrypoint {
  async run(event, step) {
    const { task } = event.payload || {};
    return step.do(task || 'task', { retries: { limit: 1, delay: '2 minutes' }, timeout: '20 minutes' }, async () => {
      if (task === 'eval') { const r = await runModelEval(this.env); return { chosen: r.chosen }; }
      if (task === 'review') { const r = await dailyReview(this.env); return { applied: r.applied }; }
      return { error: 'bilinmeyen iş' };
    });
  }
}

async function startTask(env, task) {
  const inst = await env.TASKS.create({ id: `${task}-${Date.now().toString(36)}`, params: { task } });
  await log(env, 'tick', `Arka plan işi başladı: ${task}`, { data: { id: inst.id } });
  return { ok: true, id: inst.id, note: task === 'eval' ? 'Model yarışması arka planda başladı (5-10 dk). Sonuç Modeller sayfasında.' : 'Öz değerlendirme arka planda başladı; sonucu Beyin sohbetinde görünecek.' };
}

// ---------- zamanlanmış işler ----------
async function tick(env, ctx, { force = null } = {}) {
  await migrate(env);
  if (!(await lease(env, 'tick', 9 * MIN))) return { skipped: 'başka tur çalışıyor' };
  const out = {};
  const t0 = now();
  try {
    const settings = await getSettings(env);
    await setSetting(env, 'last_tick', t0, 'cron');
    if (!settings.boards_seeded) { await seedBoards(env); await setSetting(env, 'boards_seeded', true); }
    const step = async (name, fn) => { try { out[name] = await fn(); } catch (e) { out[name] = { error: e.message }; await log(env, 'tick', `${name} hatası: ${e.message}`, { level: 'error' }); } };
    await step('mail', () => mailTick(env, settings));
    if (!settings.paused) {
      await step('discover', () => discoverTick(env, settings));
      await step('triage', () => triageTick(env, settings));
      await step('recover', () => recoverStuck(env));
      const lastSeen = Number(settings.last_seen || 0);
      await step('dispatch', () => dispatch(env, settings, { max: 1, userActive: now() - lastSeen < 20 * MIN }));
    }
    await step('cleanup', () => cleanup(env, settings));
    // Günlük işler (Türkiye saatiyle)
    const trHour = new Date(now() + 3 * HOUR).getUTCHours();
    const today = dayKey();
    if (trHour >= 5 && settings.last_review_day !== today) { await setSetting(env, 'last_review_day', today); await step('review', () => startTask(env, 'review')); }
    if (trHour >= 8 && settings.digest_email && settings.last_digest_day !== today) { await setSetting(env, 'last_digest_day', today); await step('digest', () => dailyDigest(env, settings)); }
    const week = `${new Date().getUTCFullYear()}-w${Math.floor((now() / DAY + 3) / 7)}`;
    if (trHour >= 4 && settings.last_eval_week !== week) { await setSetting(env, 'last_eval_week', week); await step('eval', () => startTask(env, 'eval')); }
  } finally {
    await release(env, 'tick');
  }
  out.ms = now() - t0;
  return out;
}

async function cleanup(env, settings) {
  // Süresi dolan ekran kayıtları (R2 yaşam döngüsü kuralı da siler; bu ikinci güvence)
  const old = await allRows(env, 'SELECT id FROM recordings WHERE deleted=0 AND expires_at < ? LIMIT 20', now());
  for (const r of old) {
    let cursor;
    do {
      const l = await env.R2.list({ prefix: `rec/${r.id}/`, cursor });
      if (l.objects.length) await env.R2.delete(l.objects.map((o) => o.key));
      cursor = l.truncated ? l.cursor : null;
    } while (cursor);
    await env.DB.prepare('UPDATE recordings SET deleted=1 WHERE id=?').bind(r.id).run();
  }
  await env.DB.prepare('DELETE FROM events WHERE ts < ?').bind(now() - 60 * DAY).run();
  await env.DB.prepare('DELETE FROM logins WHERE ts < ?').bind(now() - 7 * DAY).run();
  await env.DB.prepare("UPDATE actions SET status='expired' WHERE status='open' AND expires_at IS NOT NULL AND expires_at < ?").bind(now()).run();
  // Çok eski ve hiç işlenmemiş ilanları temizle (kuyruk şişmesin)
  await env.DB.prepare("UPDATE jobs SET status='expired', reason='işlenmeden eskidi' WHERE status='new' AND discovered_at < ?").bind(now() - 20 * DAY).run();
  return { recordings_deleted: old.length };
}

// ---------- API ----------
const hooks = (env, ctx) => ({
  applyNow: async (jobId) => {
    const appId = await createApplication(env, jobId, { by: 'elle' });
    const inst = await env.APPLY.create({ id: appId + '-' + Date.now().toString(36), params: { appId, userActive: true } });
    await env.DB.prepare('UPDATE applications SET workflow_id=? WHERE id=?').bind(inst.id, appId).run();
    return { ok: true, appId, note: 'Başvuru başlatıldı; Başvurular sekmesinden canlı izleyebilirsin.' };
  },
  runTask: async (task) => runTask(env, ctx, task),
  sendEmail: async ({ to, subject, text }) => { const r = await sendMail(env, await getSettings(env), { to, subject, text }); return { ok: true, status: 'accepted', messageId: r?.messageId }; },
});

async function runTask(env, ctx, task) {
  const settings = await getSettings(env);
  switch (task) {
    case 'discover': return discoverTick(env, settings, { maxSources: 4, maxBoards: 20 });
    case 'triage': return triageTick(env, settings);
    case 'mail': return mailTick(env, settings, { limit: 50 });
    case 'review': return startTask(env, 'review');
    case 'eval': return startTask(env, 'eval');
    case 'digest': await dailyDigest(env, settings); return { ok: true };
    case 'dispatch': return dispatch(env, settings, { max: 1, userActive: true });
    case 'tick': return tick(env, ctx);
    default: {
      const src = SOURCES.find((s) => s.id === task);
      if (src) return runSource(env, src);
      return { error: 'bilinmeyen iş' };
    }
  }
}

function route(method, path, pattern) {
  if (method !== pattern[0]) return null;
  const re = new RegExp('^' + pattern[1].replace(/:[a-z_]+/g, '([^/]+)') + '$');
  const m = path.match(re);
  return m ? m.slice(1).map(decodeURIComponent) : null;
}

async function api(request, env, ctx) {
  const url = new URL(request.url);
  const path = url.pathname.replace(/^\/api/, '') || '/';
  const method = request.method;
  if (path === '/health') {
    const s = await getSettings(env);
    return json({ ok: true, last_tick: s.last_tick || null, paused: !!s.paused, now: now() });
  }
  if (path === '/login' && method === 'POST') {
    const r = await login(env, request);
    return r.ok ? json({ ok: true }, 200, { 'set-cookie': r.cookie }) : json({ ok: false, error: r.error }, r.status);
  }
  const session = await readSession(env, request);
  if (!session) return json({ error: 'giriş gerekli' }, 401);
  if (method !== 'GET') {
    const origin = request.headers.get('origin');
    if (origin && new URL(origin).host !== url.host) return json({ error: 'kaynak reddedildi' }, 403);
  }
  if (path === '/logout') return json({ ok: true }, 200, { 'set-cookie': logoutCookie() });
  const body = method === 'POST' ? await request.json().catch(() => ({})) : {};
  // Çevrimiçi izi (canlı devralma için) ve panel adresi
  ctx.waitUntil((async () => { await setSetting(env, 'last_seen', now(), 'panel'); const s = await getSettings(env); if (s.public_url !== url.origin) await setSetting(env, 'public_url', url.origin, 'panel'); })());
  let m;

  if ((m = route(method, path, ['GET', '/overview']))) {
    const settings = await getSettings(env);
    const [summary, events, actions, usage, cost, bh, running, recent] = await Promise.all([
      stateSummary(env),
      allRows(env, 'SELECT id, ts, level, type, ref, msg FROM events ORDER BY id DESC LIMIT 40'),
      allRows(env, "SELECT * FROM actions WHERE status='open' ORDER BY priority, created_at DESC LIMIT 30"),
      usageToday(env), aiCostToday(env), browserHoursThisMonth(env),
      allRows(env, "SELECT a.id, a.status, a.started_at, j.company, j.title, (SELECT id FROM recordings r WHERE r.app_id=a.id ORDER BY created_at DESC LIMIT 1) rec FROM applications a JOIN jobs j ON j.id=a.job_id WHERE a.status IN ('applying','prepared') ORDER BY a.updated_at DESC LIMIT 5"),
      allRows(env, "SELECT a.id, a.status, a.submitted_at, a.updated_at, j.company, j.title, j.source FROM applications a JOIN jobs j ON j.id=a.job_id ORDER BY a.updated_at DESC LIMIT 12"),
    ]);
    const trend = await allRows(env, "SELECT strftime('%Y-%m-%d', discovered_at/1000, 'unixepoch', '+3 hours') d, COUNT(*) found, SUM(status IN ('approved','queued','applied','review','needs_human')) ok FROM jobs WHERE discovered_at > ? GROUP BY d ORDER BY d", now() - 14 * DAY);
    const appTrend = await allRows(env, "SELECT strftime('%Y-%m-%d', submitted_at/1000, 'unixepoch', '+3 hours') d, COUNT(*) n FROM applications WHERE submitted_at > ? GROUP BY d ORDER BY d", now() - 14 * DAY);
    return json({ summary, events, actions, usage, ai_cost_today: cost, browser_hours_month: bh, running, recent, trend, appTrend,
      settings: { paused: settings.paused, auto_apply: settings.auto_apply, daily_apply_limit: settings.daily_apply_limit, daily_ai_budget_usd: settings.daily_ai_budget_usd, daily_browser_minutes: settings.daily_browser_minutes, monthly_browser_hours: settings.monthly_browser_hours, last_tick: settings.last_tick } });
  }
  if ((m = route(method, path, ['GET', '/jobs']))) {
    const w = ['1=1'], b = [];
    const st = url.searchParams.get('status'), q = url.searchParams.get('q'), src = url.searchParams.get('source');
    if (st === 'eligible') w.push("status IN ('approved','review','queued')"); else if (st) { w.push('status=?'); b.push(st); }
    if (src) { w.push('source=?'); b.push(src); }
    if (q) { w.push('(title LIKE ? OR company LIKE ? OR location LIKE ?)'); b.push(`%${q}%`, `%${q}%`, `%${q}%`); }
    const page = Math.max(0, Number(url.searchParams.get('page')) || 0);
    const order = st === 'rejected' || st === 'new' ? 'discovered_at DESC' : 'COALESCE(priority, fit, 0) DESC, discovered_at DESC';
    const rows = await allRows(env, `SELECT id, title, company, source, location, lang, status, stage, fit, priority, role_family, substr(reason,1,200) reason, discovered_at, posted_at, url FROM jobs WHERE ${w.join(' AND ')} ORDER BY ${order} LIMIT 50 OFFSET ${page * 50}`, ...b);
    const counts = await allRows(env, 'SELECT status, COUNT(*) n FROM jobs GROUP BY status');
    return json({ rows, counts: Object.fromEntries(counts.map((c) => [c.status, c.n])) });
  }
  if ((m = route(method, path, ['GET', '/jobs/:id']))) {
    const j = await oneRow(env, 'SELECT * FROM jobs WHERE id=?', m[0]);
    if (!j) return json({ error: 'yok' }, 404);
    j.analysis = safeJSON(j.analysis); j.jev = safeJSON(j.jev); j.raw = undefined;
    j.applications = await allRows(env, 'SELECT id, status, created_at, submitted_at, error FROM applications WHERE job_id=? ORDER BY created_at DESC', m[0]);
    return json(j);
  }
  if ((m = route(method, path, ['POST', '/jobs/:id/decision']))) {
    const r = await runTool(env, 'job_decision', { id: m[0], decision: body.decision, reason: body.reason || 'panel' }, hooks(env, ctx));
    return json(r);
  }
  if ((m = route(method, path, ['POST', '/jobs/:id/reanalyze']))) return json(await reanalyze(env, await getSettings(env), m[0]));
  if ((m = route(method, path, ['GET', '/applications']))) {
    const st = url.searchParams.get('status');
    const rows = await allRows(env, `SELECT a.id, a.status, a.method, a.created_at, a.submitted_at, a.updated_at, a.steps, substr(a.error,1,200) error, a.legacy, a.live_url, j.id job_id, j.company, j.title, j.source, j.url, (SELECT id FROM recordings r WHERE r.app_id=a.id AND r.deleted=0 ORDER BY created_at DESC LIMIT 1) rec FROM applications a JOIN jobs j ON j.id=a.job_id ${st ? 'WHERE a.status=?' : ''} ORDER BY a.updated_at DESC LIMIT 200`, ...(st ? [st] : []));
    const counts = await allRows(env, 'SELECT status, COUNT(*) n FROM applications GROUP BY status');
    return json({ rows, counts: Object.fromEntries(counts.map((c) => [c.status, c.n])) });
  }
  if ((m = route(method, path, ['GET', '/applications/:id']))) {
    const a = await oneRow(env, 'SELECT a.*, j.title, j.company, j.url, j.apply_url, j.location, j.source, j.analysis FROM applications a JOIN jobs j ON j.id=a.job_id WHERE a.id=?', m[0]);
    if (!a) return json({ error: 'yok' }, 404);
    a.answers = safeJSON(a.answers); a.evidence = safeJSON(a.evidence); a.confirmation = safeJSON(a.confirmation); a.analysis = safeJSON(a.analysis);
    a.recordings = await allRows(env, 'SELECT id, created_at, expires_at, frames, deleted FROM recordings WHERE app_id=? ORDER BY created_at DESC', m[0]);
    a.mails = await allRows(env, 'SELECT id, received_at, from_addr, subject, category, summary FROM mail WHERE app_id=? ORDER BY received_at DESC', m[0]);
    a.events = await allRows(env, 'SELECT ts, level, msg FROM events WHERE ref=? ORDER BY id DESC LIMIT 30', m[0]);
    return json(a);
  }
  if ((m = route(method, path, ['POST', '/applications/:id/retry']))) {
    const a = await oneRow(env, 'SELECT id, job_id FROM applications WHERE id=?', m[0]);
    if (!a) return json({ error: 'yok' }, 404);
    await env.DB.prepare("UPDATE applications SET status='queued', error=NULL, updated_at=? WHERE id=?").bind(now(), a.id).run();
    const inst = await env.APPLY.create({ id: a.id + '-' + Date.now().toString(36), params: { appId: a.id, userActive: !!body.handoff } });
    await env.DB.prepare('UPDATE applications SET workflow_id=? WHERE id=?').bind(inst.id, a.id).run();
    return json({ ok: true, workflow: inst.id });
  }
  if ((m = route(method, path, ['POST', '/applications/:id/status']))) {
    const allowed = ['submitted', 'confirmed', 'interview', 'next_step', 'offer', 'rejected', 'cancelled'];
    if (!allowed.includes(body.status)) return json({ error: 'geçersiz durum' }, 400);
    await env.DB.prepare('UPDATE applications SET status=?, updated_at=? WHERE id=?').bind(body.status, now(), m[0]).run();
    await log(env, 'apply', `Durum elle değiştirildi: ${body.status}`, { ref: m[0] });
    return json({ ok: true });
  }
  if ((m = route(method, path, ['GET', '/recordings']))) {
    return json(await allRows(env, "SELECT r.*, a.status app_status, j.company, j.title FROM recordings r LEFT JOIN applications a ON a.id=r.app_id LEFT JOIN jobs j ON j.id=a.job_id WHERE r.deleted=0 ORDER BY r.created_at DESC LIMIT 100"));
  }
  if ((m = route(method, path, ['GET', '/recordings/:id']))) {
    const r = await oneRow(env, 'SELECT * FROM recordings WHERE id=?', m[0]);
    if (!r) return json({ error: 'yok' }, 404);
    const tl = await env.R2.get(`rec/${r.id}/timeline.json`);
    const listed = await env.R2.list({ prefix: `rec/${r.id}/`, limit: 1000 });
    const frames = listed.objects.filter((o) => o.key.endsWith('.jpg')).map((o) => o.key).sort();
    return json({ ...r, frames, timeline: tl ? await tl.json() : [] });
  }
  if (method === 'GET' && path.startsWith('/file/')) {
    const key = decodeURIComponent(path.slice(6));
    if (!/^(rec|evidence|assets)\//.test(key) || key.includes('..')) return json({ error: 'izin yok' }, 403);
    const obj = await env.R2.get(key);
    if (!obj) return json({ error: 'bulunamadı (kayıtlar 3 gün sonra silinir)' }, 404);
    return new Response(obj.body, { headers: { 'content-type': obj.httpMetadata?.contentType || 'application/octet-stream', 'cache-control': 'private, max-age=86400' } });
  }
  if ((m = route(method, path, ['GET', '/mail']))) {
    const cat = url.searchParams.get('category');
    return json(await allRows(env, `SELECT m.*, j.company FROM mail m LEFT JOIN applications a ON a.id=m.app_id LEFT JOIN jobs j ON j.id=a.job_id ${cat ? 'WHERE m.category=?' : ''} ORDER BY m.received_at DESC LIMIT 150`, ...(cat ? [cat] : [])));
  }
  if ((m = route(method, path, ['GET', '/mail/:id']))) {
    const meta = await oneRow(env, 'SELECT * FROM mail WHERE id=?', m[0]);
    const full = await env.MAILDB.prepare('SELECT id, from_address, from_name, to_json, subject, text_body, received_at FROM messages WHERE id=?').bind(m[0]).first();
    return json({ ...meta, ...full });
  }
  if ((m = route(method, path, ['POST', '/mail/:id/reply']))) {
    const meta = await oneRow(env, 'SELECT * FROM mail WHERE id=?', m[0]);
    if (!meta) return json({ error: 'yok' }, 404);
    const text = String(body.text || meta.draft || '').trim();
    if (!text) return json({ error: 'metin yok' }, 400);
    const r = await sendMail(env, await getSettings(env), { to: meta.from_addr, subject: /^re:/i.test(meta.subject) ? meta.subject : `Re: ${meta.subject}`, text, appId: meta.app_id });
    await env.DB.prepare('UPDATE mail SET handled=1 WHERE id=?').bind(m[0]).run();
    return json({ ok: true, status: 'accepted', messageId: r?.messageId });
  }
  if ((m = route(method, path, ['GET', '/actions']))) return json(await allRows(env, "SELECT * FROM actions ORDER BY status='open' DESC, priority, created_at DESC LIMIT 100"));
  if ((m = route(method, path, ['POST', '/actions/:id/done']))) { await env.DB.prepare("UPDATE actions SET status='done' WHERE id=?").bind(m[0]).run(); return json({ ok: true }); }
  if ((m = route(method, path, ['GET', '/events']))) {
    const type = url.searchParams.get('type'), before = Number(url.searchParams.get('before')) || 9e15;
    return json(await allRows(env, `SELECT * FROM events WHERE id < ? ${type ? 'AND type=?' : ''} ORDER BY id DESC LIMIT 150`, before, ...(type ? [type] : [])));
  }
  if ((m = route(method, path, ['GET', '/chat']))) return json(await allRows(env, "SELECT id, ts, role, content, meta FROM chat WHERE thread=? ORDER BY id DESC LIMIT 60", url.searchParams.get('thread') || 'main'));
  if ((m = route(method, path, ['POST', '/chat']))) {
    const msg = String(body.message || '').trim();
    if (!msg) return json({ error: 'boş mesaj' }, 400);
    try { return json(await chat(env, msg, hooks(env, ctx), body.thread || 'main')); } catch (e) { return json({ error: 'Beyin cevap veremedi: ' + e.message }, 500); }
  }
  if ((m = route(method, path, ['GET', '/settings']))) {
    const s = await getSettings(env);
    for (const k of Object.keys(s)) if (k.startsWith('lease:') || k.startsWith('src:')) delete s[k];
    return json(s);
  }
  if ((m = route(method, path, ['POST', '/settings']))) {
    try { const v = validateSetting(body.key, body.value); await setSetting(env, body.key, v, 'panel'); await log(env, 'settings', `Panelden ayar: ${body.key} = ${clip(JSON.stringify(v), 200)}`); return json({ ok: true, value: v }); }
    catch (e) { return json({ error: e.message }, 400); }
  }
  if ((m = route(method, path, ['GET', '/memory']))) return json(await allRows(env, 'SELECT * FROM memory ORDER BY active DESC, created_at DESC LIMIT 200'));
  if ((m = route(method, path, ['POST', '/memory/:id/toggle']))) { await env.DB.prepare('UPDATE memory SET active=1-active WHERE id=?').bind(m[0]).run(); return json({ ok: true }); }
  if ((m = route(method, path, ['GET', '/facts']))) return json(await allRows(env, "SELECT key, value, source, confidence, updated_at FROM facts WHERE key NOT LIKE 'form_answer_%' ORDER BY updated_at DESC LIMIT 500"));
  if ((m = route(method, path, ['POST', '/facts']))) {
    if (!body.key) return json({ error: 'anahtar yok' }, 400);
    await env.DB.prepare('INSERT INTO facts (key, value, source, confidence, updated_at) VALUES (?, ?, ?, 1, ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value, source=excluded.source, updated_at=excluded.updated_at').bind(String(body.key).slice(0, 80), JSON.stringify(body.value ?? ''), 'user:panel', now()).run();
    return json({ ok: true });
  }
  if ((m = route(method, path, ['GET', '/models']))) {
    const s = await getSettings(env);
    const evals = await allRows(env, 'SELECT id, ts, source, chosen, results FROM model_evals ORDER BY ts DESC LIMIT 5');
    const usage = await allRows(env, 'SELECT model, task, SUM(calls) calls, SUM(in_tok) in_tok, SUM(out_tok) out_tok, ROUND(SUM(cost),4) cost, SUM(errors) errors FROM ai_usage WHERE day >= ? GROUP BY model, task ORDER BY cost DESC', dayKey(now() - 7 * DAY));
    return json({ defaults: DEFAULT_MODELS, custom: s.models || {}, evals: evals.map((e) => ({ ...e, chosen: safeJSON(e.chosen), results: safeJSON(e.results) })), usage });
  }
  if ((m = route(method, path, ['GET', '/costs']))) {
    const daily = await allRows(env, 'SELECT day, ROUND(SUM(cost),4) cost, SUM(calls) calls FROM ai_usage GROUP BY day ORDER BY day DESC LIMIT 30');
    const usage = await allRows(env, 'SELECT * FROM usage_daily ORDER BY day DESC LIMIT 30');
    const total = await oneRow(env, 'SELECT ROUND(SUM(cost),4) c FROM ai_usage');
    return json({ daily, usage, total: total?.c || 0 });
  }
  if ((m = route(method, path, ['GET', '/sources']))) {
    const st = await allRows(env, "SELECT key, value FROM settings WHERE key LIKE 'src:%'");
    const stats = await allRows(env, "SELECT source, COUNT(*) n, SUM(status IN ('approved','queued','applied','review','needs_human')) ok, SUM(status='applied') applied FROM jobs GROUP BY source");
    const boards = await allRows(env, 'SELECT * FROM boards ORDER BY jobs_seen DESC LIMIT 300');
    return json({ sources: SOURCES.map((s) => ({ id: s.id, label: s.label, cadence: s.cadence, state: safeJSON(st.find((x) => x.key === 'src:' + s.id)?.value, {}), stats: stats.find((x) => x.source === s.id) || {} })), boards, boardStats: stats.filter((x) => x.source.startsWith('ats:')) });
  }
  if ((m = route(method, path, ['POST', '/run/:task']))) {
    try { return json(await runTask(env, ctx, m[0])); } catch (e) { return json({ error: e.message }, 500); }
  }
  return json({ error: 'bulunamadı' }, 404);
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    try {
      await migrate(env);
      if (url.pathname.startsWith('/api/')) return await api(request, env, ctx);
      return env.ASSETS.fetch(request);
    } catch (e) {
      console.error(e);
      return json({ error: 'Sunucu hatası: ' + e.message }, 500);
    }
  },
  async scheduled(event, env, ctx) {
    ctx.waitUntil(tick(env, ctx).catch((e) => log(env, 'tick', 'Tur çöktü: ' + e.message, { level: 'error' })));
  },
};
