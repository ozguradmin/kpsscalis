// Özgür İş Ajanı v2 — Cloudflare Worker giriş noktası: panel API'si + 10 dakikalık zamanlayıcı + başvuru iş akışı.
import { migrate, getSettings, setSetting, log, allRows, oneRow, lease, release, usageToday, aiCostToday, browserHoursThisMonth } from './lib/db.js';
import { login, readSession, logoutCookie, verifyLink, seal, unseal } from './lib/auth.js';
import { WorkflowEntrypoint } from 'cloudflare:workers';
import { json, now, DAY, HOUR, MIN, dayKey, safeJSON, clip } from './lib/util.js';
import { discoverTick, seedBoards, runSource, pollBoards } from './discover.js';
import { triageTick, reanalyze } from './triage.js';
import { mailTick, sendMail, dailyDigest, alertUser, followUps } from './mail.js';
import { liveLogin, regDomain } from './sessions.js';
import { openBrowser, liveHandoff } from './apply/browser.js';
import { cvPdf, CORE } from './profile.js';
import { CV_EN, CV_TR } from './cv-text.js';
import { dispatch, recoverStuck, createApplication, ApplyWorkflow } from './apply/index.js';
import { chat, dailyReview, stateSummary, validateSetting, runTool, learnSourceWeights } from './brain.js';
import { runModelEval } from './evals.js';
import { SOURCES, SEED_VERSION } from './sources/index.js';
import { DEFAULT_MODELS } from './lib/llm.js';

export { ApplyWorkflow };

// Uzun süren işler (model yarışması, öz değerlendirme) için dayanıklı iş akışı: istek süresine bağlı kalmaz
export class TaskWorkflow extends WorkflowEntrypoint {
  async run(event, step) {
    const { task, url } = event.payload || {};
    if (task === 'login') {
      return step.do('login', { retries: { limit: 0, delay: '1 minute' }, timeout: '40 minutes' }, async () => {
        const settings = await getSettings(this.env);
        return liveLogin(this.env, settings, { url, openBrowser, liveHandoff, alertUser });
      });
    }
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
    if (settings.boards_seed_version !== SEED_VERSION) { await seedBoards(env); await setSetting(env, 'boards_seed_version', SEED_VERSION); }
    const step = async (name, fn) => { try { out[name] = await fn(); } catch (e) { out[name] = { error: e.message }; await log(env, 'tick', `${name} hatası: ${e.message}`, { level: 'error' }); } };
    await step('mail', () => mailTick(env, settings));
    if (!settings.paused) {
      await step('discover', () => discoverTick(env, settings));
      await step('triage', () => triageTick(env, settings));
      await step('recover', () => recoverStuck(env));
      const lastSeen = Number(settings.last_seen || 0);
      await step('dispatch', () => dispatch(env, settings, { max: 1, userActive: now() - lastSeen < 5 * MIN }));
    }
    await step('cleanup', () => cleanup(env, settings));
    // Günlük işler (Türkiye saatiyle)
    const trHour = new Date(now() + 3 * HOUR).getUTCHours();
    const today = dayKey();
    if (trHour >= 4 && settings.last_learn_day !== today) { await setSetting(env, 'last_learn_day', today); await step('learn', () => learnSourceWeights(env)); }
    if (trHour >= 5 && settings.last_review_day !== today) { await setSetting(env, 'last_review_day', today); await step('review', () => startTask(env, 'review')); }
    if (trHour >= 8 && settings.digest_email && settings.last_digest_day !== today) { await setSetting(env, 'last_digest_day', today); await step('digest', () => dailyDigest(env, settings)); }
    if (trHour >= 10 && trHour < 18 && settings.last_followup_day !== today) { await setSetting(env, 'last_followup_day', today); await step('followup', () => followUps(env, settings)); }
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
  // 'Sana kalanlar' şişmesin: başvurusu artık beklemede olmayan ya da 4 günden eski elle-tamamla görevleri kapat
  await env.DB.prepare("UPDATE actions SET status='expired' WHERE status='open' AND kind='needs_human' AND (created_at < ? OR app_id IN (SELECT id FROM applications WHERE status NOT IN ('needs_human','blocked')))").bind(now() - 4 * DAY).run();
  // Çok eski ve hiç işlenmemiş ilanları temizle (kuyruk şişmesin)
  await env.DB.prepare("UPDATE jobs SET status='expired', reason='işlenmeden eskidi' WHERE status='new' AND discovered_at < ?").bind(now() - 20 * DAY).run();
  // Elenmiş ilanların uzun metnini kısalt (kayıt kalır ki aynı ilan tekrar değerlendirilmesin; veritabanı şişmesin)
  await env.DB.prepare("UPDATE jobs SET description=substr(description,1,400) WHERE id IN (SELECT id FROM jobs WHERE status IN ('rejected','expired') AND discovered_at < ? AND length(description) > 600 LIMIT 3000)").bind(now() - 3 * DAY).run();
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
    case 'learn': return learnSourceWeights(env);
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

// Başvuruyu baştan başlat; handoff=true ise robot doğrulamasında seni bekler ve canlı bağlantıyı e-postalar
async function restartApp(env, appId, handoff) {
  const a = await oneRow(env, 'SELECT id, job_id, status FROM applications WHERE id=?', appId);
  if (!a) return { error: 'başvuru yok' };
  if (['applying', 'prepared'].includes(a.status)) return { ok: true, running: true };
  await env.DB.prepare("UPDATE applications SET status='queued', error=NULL, updated_at=? WHERE id=?").bind(now(), a.id).run();
  await env.DB.prepare("UPDATE actions SET status='done' WHERE app_id=? AND status='open' AND kind IN ('needs_human','handoff')").bind(a.id).run();
  const inst = await env.APPLY.create({ id: a.id + '-' + Date.now().toString(36), params: { appId: a.id, userActive: !!handoff } });
  await env.DB.prepare('UPDATE applications SET workflow_id=? WHERE id=?').bind(inst.id, a.id).run();
  await log(env, 'apply', handoff ? 'Yeniden başlatıldı (canlı devral: robot doğrulamasında seni bekleyecek)' : 'Yeniden başlatıldı', { ref: a.id });
  return { ok: true, workflow: inst.id };
}

// "Kendi tarayıcından gönder": Cloudflare doğrulaması sunucu tarayıcısını geçirmeyen sitelerde Özgür kendi tarayıcısından gönderir;
// her cevap kopyalanmaya hazır, sonunda "Gönderdim" ile başvuru kaydı güncellenir.
async function ownBrowserPage(env, request, url, method, appId, panel) {
  const a = await oneRow(env, 'SELECT a.id, a.status, a.letter, a.answers, j.id job_id, j.company, j.title, j.apply_url, j.url FROM applications a JOIN jobs j ON j.id=a.job_id WHERE a.id=?', appId);
  if (method === 'POST') {
    await env.DB.prepare("UPDATE applications SET status='submitted', submitted_at=?, updated_at=?, error=NULL, confirmation='Özgür kendi tarayıcından gönderdi' WHERE id=?").bind(now(), now(), appId).run();
    await env.DB.prepare("UPDATE jobs SET status='applied' WHERE id=?").bind(a.job_id).run();
    await env.DB.prepare("UPDATE actions SET status='done' WHERE app_id=? AND status='open'").bind(appId).run();
    await log(env, 'apply', `${a.company}: Özgür kendi tarayıcından gönderdi`, { ref: appId });
    return htmlPage('Kaydedildi', `<h1>Teşekkürler</h1><p>${escHtml(a.company)} başvurusu "gönderildi" olarak kaydedildi. Onay e-postası gelirse sistem kendisi eşleştirir.</p><a href="${panel}">Panelde aç</a>`);
  }
  const ans = safeJSON(a.answers, {}) || {};
  const rows = [['Ad Soyad', CORE.full_name], ['Ad', CORE.first_name], ['Soyad', CORE.last_name], ['E-posta', CORE.email], ['Telefon', CORE.phone], ['Konum', `${CORE.city}, ${CORE.country_en}`], ['LinkedIn', CORE.linkedin], ['GitHub', CORE.github], ['Portfolyo', CORE.portfolio]];
  for (const [k, v] of Object.entries(ans)) if (v && String(v) !== '••••' && !rows.some((r) => r[1] === v)) rows.push([k, String(v)]);
  if (a.letter) rows.splice(0, 0, ['Ön yazı / Cover letter', a.letter]);
  const item = ([k, v], i) => `<div class="it"><div class="k">${escHtml(clip(k, 140))}</div><textarea id="v${i}" readonly rows="${Math.min(10, Math.ceil(String(v).length / 60) + 1)}">${escHtml(v)}</textarea><button type="button" onclick="navigator.clipboard.writeText(document.getElementById('v${i}').value);this.textContent='Kopyalandı ✓'">Kopyala</button></div>`;
  const css = '<style>.it{margin:14px 0}.k{font-size:13px;color:#9fb0c8;margin-bottom:4px}textarea{width:100%;box-sizing:border-box;background:#141c2c;color:#e9edf4;border:1px solid #2a3550;border-radius:8px;padding:8px;font:15px/1.4 system-ui}.it button{margin-top:6px;padding:8px 14px;font-size:14px}main{max-width:560px;width:100%}.big{display:block;text-align:center;margin:10px 0}</style>';
  return htmlPage(`${a.company}: kendi tarayıcından gönder`, `${css}<h1>${escHtml(a.company)}</h1><p>${escHtml(a.title)}</p>
    <p>Bu site Cloudflare robot doğrulaması kullanıyor ve sunucu tarayıcısını kabul etmiyor. Formu kendi tarayıcında aç, aşağıdakileri kopyala yapıştır, CV'yi yükle, gönder. Sonra en alttaki "Gönderdim"e bas.</p>
    <a class="big" href="${escHtml(a.apply_url || a.url)}" target="_blank" rel="noopener">1) İlanı / formu aç</a>
    <a class="big" href="${escHtml(CORE.cv_url_en)}" target="_blank" rel="noopener" style="background:#2a3550;color:#e9edf4">CV (İngilizce PDF) indir</a>
    <h2 style="font-size:18px;margin-top:22px">2) Kopyala, yapıştır</h2>${rows.map(item).join('')}
    <h2 style="font-size:18px;margin-top:22px">3) Gönderdikten sonra</h2><form method="post"><button>Gönderdim ✓</button></form><p><a href="${panel}" style="background:none;color:#86a9ee;padding:0">Panelde aç</a></p>`);
}

const escHtml = (x) => String(x ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const htmlPage = (title, body) => new Response(`<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><style>body{font:16px/1.5 -apple-system,system-ui,sans-serif;margin:0;background:#0d1320;color:#e9edf4;display:grid;place-items:center;min-height:100vh;padding:20px}main{max-width:420px}h1{font-size:24px}a,button{display:inline-block;background:#e9edf4;color:#0d1320;border:0;border-radius:10px;padding:12px 18px;font:600 16px system-ui;text-decoration:none;cursor:pointer}p{color:#c3cbd8}</style></head><body><main>${body}</main></body></html>`, { headers: { 'content-type': 'text/html; charset=utf-8', 'x-robots-tag': 'noindex' } });

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
  // E-postadaki tek tıklık bağlantı: başvuruyu baştan başlat ve canlı devral (GET sadece onay sayfası; e-posta tarayıcıları tetiklemesin diye işlem POST ile)
  if (path.startsWith('/h/')) {
    const p = await verifyLink(env, decodeURIComponent(path.slice(3)));
    if (!p?.a) return htmlPage('Geçersiz bağlantı', '<h1>Bağlantı geçersiz ya da süresi dolmuş</h1><p>Panelden başvuruyu açıp "Canlı devral"a basabilirsin.</p>');
    const a = await oneRow(env, 'SELECT a.id, a.status, j.company, j.title FROM applications a JOIN jobs j ON j.id=a.job_id WHERE a.id=?', p.a);
    if (!a) return htmlPage('Bulunamadı', '<h1>Başvuru bulunamadı</h1>');
    const panel = `${url.origin}/#/basvuru/${a.id}`;
    if (p.op === 'own') return ownBrowserPage(env, request, url, method, a.id, panel);
    if (method !== 'POST') return htmlPage('Canlı devral', `<h1>${escHtml(a.company)}</h1><p>${escHtml(a.title)}</p><p>Ajan başvuruyu baştan dolduracak ve robot doğrulamasına gelince seni bekleyecek. Canlı tarayıcı bağlantısı 2-4 dakika içinde e-postana gelir; doğrulamayı geçince ajan kendiliğinden devam eder.</p><form method="post"><button>Başlat</button></form><p><a href="${panel}" style="background:none;color:#86a9ee;padding:0">Panelde aç</a></p>`);
    const r = await restartApp(env, a.id, true);
    return htmlPage('Başladı', `<h1>${r.running ? 'Zaten çalışıyor' : 'Başladı'}</h1><p>Canlı bağlantı e-postana ve paneldeki "Sana kalanlar"a gelecek. Bu sayfayı kapatabilirsin.</p><a href="${panel}">Panelde izle</a>`);
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
  // Sadece gerçek tarayıcıdan gelen istekler "Özgür panelde" sayılır (komut satırı izlemeleri canlı devralmayı boşuna bekletmesin)
  const human = /Mozilla\//.test(request.headers.get('user-agent') || '');
  ctx.waitUntil((async () => { if (human) await setSetting(env, 'last_seen', now(), 'panel'); const s = await getSettings(env); if (s.public_url !== url.origin) await setSetting(env, 'public_url', url.origin, 'panel'); })());
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
    const r = await restartApp(env, m[0], !!body.handoff);
    return r.error ? json(r, 404) : json(r);
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
  if ((m = route(method, path, ['GET', '/accounts']))) {
    const accounts = await allRows(env, 'SELECT site, login_url, username, status, created_at, updated_at, notes, (secret IS NOT NULL) has_password FROM accounts ORDER BY updated_at DESC');
    const sessions = await allRows(env, 'SELECT domain, count, updated_at, note FROM sessions ORDER BY updated_at DESC');
    return json({ accounts, sessions });
  }
  if ((m = route(method, path, ['POST', '/accounts']))) {
    const site = String(body.site || '').trim().toLowerCase();
    if (!site || !body.username) return json({ error: 'site ve kullanıcı adı gerekli' }, 400);
    await env.DB.prepare('INSERT INTO accounts (site, login_url, username, secret, status, created_at, updated_at, notes) VALUES (?,?,?,?,?,?,?,?) ON CONFLICT(site) DO UPDATE SET login_url=excluded.login_url, username=excluded.username, secret=COALESCE(excluded.secret, accounts.secret), status=excluded.status, updated_at=excluded.updated_at, notes=excluded.notes')
      .bind(site, body.login_url || null, String(body.username), body.password ? await seal(env, String(body.password)) : null, 'active', now(), now(), body.notes || null).run();
    await log(env, 'account', `${site} hesabı kaydedildi`);
    return json({ ok: true });
  }
  if ((m = route(method, path, ['GET', '/accounts/:site/password']))) {
    const r = await oneRow(env, 'SELECT secret FROM accounts WHERE site=?', m[0]);
    if (!r?.secret) return json({ error: 'şifre yok' }, 404);
    return json({ password: await unseal(env, r.secret) });
  }
  if ((m = route(method, path, ['POST', '/sessions/import']))) {
    const by = new Map();
    for (const c of Array.isArray(body.cookies) ? body.cookies : []) {
      const d = regDomain(c.domain); if (!d) continue;
      if (!by.has(d)) by.set(d, []);
      by.get(d).push({ name: c.name, value: c.value, domain: c.domain, path: c.path || '/', expires: c.expires, httpOnly: !!c.httpOnly, secure: !!c.secure, sameSite: c.sameSite });
    }
    for (const [d, list] of by) await env.DB.prepare('INSERT INTO sessions (domain, cookies, count, updated_at, note) VALUES (?,?,?,?,?) ON CONFLICT(domain) DO UPDATE SET cookies=excluded.cookies, count=excluded.count, updated_at=excluded.updated_at, note=excluded.note').bind(d, await seal(env, JSON.stringify(list)), list.length, now(), String(body.note || 'içe aktarıldı')).run();
    return json({ ok: true, domains: [...by.keys()] });
  }
  if ((m = route(method, path, ['POST', '/sessions/login']))) {
    let u; try { u = new URL(String(body.url || '')); } catch (e) { return json({ error: 'geçersiz adres' }, 400); }
    if (!/^https?:$/.test(u.protocol)) return json({ error: 'geçersiz adres' }, 400);
    const inst = await env.TASKS.create({ id: `login-${Date.now().toString(36)}`, params: { task: 'login', url: u.href } });
    await log(env, 'account', `Canlı giriş başlatıldı: ${u.hostname}`, { data: { id: inst.id } });
    return json({ ok: true, note: 'Tarayıcı açılıyor. 1-2 dakika içinde canlı bağlantı Gmail\'ine ve "Sana kalanlar"a gelecek.' });
  }
  if ((m = route(method, path, ['POST', '/sessions/:domain/delete']))) {
    await env.DB.prepare('DELETE FROM sessions WHERE domain=?').bind(decodeURIComponent(m[0])).run();
    return json({ ok: true });
  }
  if ((m = route(method, path, ['GET', '/cv/:lang']))) {
    const lang = m[0] === 'tr' ? 'tr' : 'en';
    if (url.searchParams.get('format') === 'text') return json({ lang, text: lang === 'tr' ? CV_TR : CV_EN });
    const pdf = await cvPdf(env, lang);
    return new Response(pdf, { headers: { 'content-type': 'application/pdf', 'content-disposition': `${url.searchParams.get('download') ? 'attachment' : 'inline'}; filename="${lang === 'tr' ? 'Ozgur_Guler_CV.pdf' : 'Ozgur_Guler_CV_English.pdf'}"`, 'cache-control': 'private, max-age=300' } });
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
