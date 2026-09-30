// Başvuru orkestrasyonu: hazırlık (ön yazı), gönderim (tarayıcı ajanı ya da e-posta), kanıt, öğrenme.
import { WorkflowEntrypoint } from 'cloudflare:workers';
import { getSettings, log, addAction, bumpUsage, usageToday, browserHoursThisMonth, allRows } from '../lib/db.js';
import { now, uid, clip, safeJSON, hostOf, b64, DAY, MIN } from '../lib/util.js';
import { coverLetter } from './materials.js';
import { openBrowser, Recorder } from './browser.js';
import { runAgent } from './agent.js';
import { profileContext, cvBase64, CORE } from '../profile.js';
import { waitForMail, sendMail } from '../mail.js';
import { seal, unseal, strongPassword } from '../lib/auth.js';
import { detectATS } from '../sources/index.js';

async function getJob(env, id) { return env.DB.prepare('SELECT * FROM jobs WHERE id=?').bind(id).first(); }
async function getApp(env, id) { return env.DB.prepare('SELECT * FROM applications WHERE id=?').bind(id).first(); }
async function setApp(env, id, f) {
  const keys = Object.keys(f);
  await env.DB.prepare(`UPDATE applications SET ${keys.map((k, i) => `${k}=?${i + 2}`).join(', ')}, updated_at=?${keys.length + 2} WHERE id=?1`)
    .bind(id, ...keys.map((k) => f[k] == null ? null : typeof f[k] === 'object' ? JSON.stringify(f[k]) : f[k]), now()).run();
}

// ATS'ye göre doğrudan başvuru formunun adresi
export function startUrl(job) {
  const u = job.apply_url || job.url;
  const a = detectATS(u);
  if (!a) return u;
  try {
    const url = new URL(u);
    if (a.ats === 'lever' && !/\/apply\/?$/.test(url.pathname)) return u.replace(/\/?$/, '/apply');
    if (a.ats === 'ashby' && !/\/application\/?$/.test(url.pathname)) return u.replace(/\/?(a)?\/?$/, '') + '/application';
    if (a.ats === 'greenhouse' && /embed\/job_app/.test(u)) { const tok = url.searchParams.get('token'); return `https://job-boards.greenhouse.io/${a.slug}/jobs/${tok}`; }
    if (a.ats === 'workable' && /\/j\/[A-Z0-9]+\/?$/i.test(url.pathname)) return u.replace(/\/?$/, '/apply/');
  } catch (e) { /* olduğu gibi */ }
  return u;
}

// 1) Başvuru kaydı ve malzemeler
export async function createApplication(env, jobId, { by = 'auto' } = {}) {
  const existing = await env.DB.prepare("SELECT id, status FROM applications WHERE job_id=? AND status NOT IN ('failed','cancelled') ORDER BY created_at DESC LIMIT 1").bind(jobId).first();
  if (existing) return existing.id;
  const id = uid('app_');
  await env.DB.prepare("INSERT INTO applications (id, job_id, status, created_at, updated_at) VALUES (?, ?, 'queued', ?, ?)").bind(id, jobId, now(), now()).run();
  await env.DB.prepare("UPDATE jobs SET status='queued' WHERE id=?").bind(jobId).run();
  await log(env, 'apply', `Başvuru sıraya alındı (${by})`, { ref: id });
  return id;
}

export async function prepare(env, appId) {
  const settings = await getSettings(env);
  const app = await getApp(env, appId);
  const job = await getJob(env, app.job_id);
  if (app.letter) return { ok: true };
  const a = safeJSON(job.analysis, {}) || {};
  const letter = await coverLetter(env, settings, job);
  const method = a.apply_method === 'email' && a.apply_email && /@/.test(a.apply_email) ? 'email' : 'browser';
  await setApp(env, appId, { letter: letter.text, method, status: 'prepared', error: letter.warnings.length ? `ön yazı uyarısı: ${letter.warnings.join('; ')}` : null });
  return { ok: true, method };
}

// 2) Gönderim
export async function submit(env, appId, { userActive = false } = {}) {
  const settings = await getSettings(env);
  const app = await getApp(env, appId);
  const job = await getJob(env, app.job_id);
  const analysis = safeJSON(job.analysis, {}) || {};
  await setApp(env, appId, { status: 'applying', started_at: now(), attempts: (app.attempts || 0) + 1 });
  if (app.method === 'email') return submitByEmail(env, settings, app, job, analysis);

  const usage = await usageToday(env);
  if (usage.browser_ms / 60000 >= settings.daily_browser_minutes || (await browserHoursThisMonth(env)) >= settings.monthly_browser_hours) {
    await setApp(env, appId, { status: 'queued', error: 'Tarayıcı süresi kotası doldu; yarın devam' });
    return { status: 'deferred' };
  }
  const rec = new Recorder(env, { appId, title: `${job.company} — ${job.title}`, days: settings.recording_days });
  const t0 = now();
  let browser, result;
  const host = hostOf(startUrl(job));
  const accRow = await env.DB.prepare('SELECT * FROM accounts WHERE site=?').bind(host).first();
  const account = accRow ? { site: host, username: accRow.username, password: await unseal(env, accRow.secret).catch(() => '') } : null;
  const files = {};
  const ctx = {
    profile: await profileContext(env, { maxFacts: 70 }),
    analysis,
    recipes: await allRows(env, 'SELECT scope, notes FROM recipes WHERE scope IN (?, ?)', job.ats || '-', host),
    lastPassword: null,
    async file(which) {
      if (files[which]) return files[which];
      if (which === 'cv_tr' || which === 'cv_en') files[which] = { b64: await cvBase64(env, which === 'cv_tr' ? 'tr' : 'en'), name: which === 'cv_tr' ? 'Ozgur_Guler_CV.pdf' : 'Ozgur_Guler_CV_English.pdf', mime: 'application/pdf' };
      else if (which === 'letter_pdf') {
        const p = await browser.newPage();
        await p.setContent(`<html><body style="font-family:Arial,Helvetica,sans-serif;font-size:12pt;line-height:1.5;margin:48px">${String(app.letter || '').split(/\n+/).map((x) => `<p>${x.replace(/</g, '&lt;')}</p>`).join('')}</body></html>`);
        const pdf = await p.pdf({ format: 'A4' });
        await p.close();
        files[which] = { b64: b64(pdf), name: 'Ozgur_Guler_Cover_Letter.pdf', mime: 'application/pdf' };
      } else throw new Error('bilinmeyen dosya ' + which);
      return files[which];
    },
    async newPassword(site) {
      const pw = strongPassword();
      this.lastPassword = pw;
      await env.DB.prepare('INSERT INTO accounts (site, login_url, username, secret, status, created_at, updated_at, notes) VALUES (?,?,?,?,?,?,?,?) ON CONFLICT(site) DO UPDATE SET secret=excluded.secret, updated_at=excluded.updated_at, status=excluded.status')
        .bind(site || host, startUrl(job), CORE.email, await seal(env, pw), 'created', now(), now(), `${job.company} başvurusu sırasında açıldı`).run();
      await log(env, 'account', `${site || host} için hesap parolası oluşturuldu`, { ref: appId });
      return pw;
    },
    waitForMail: (hint, want) => waitForMail(env, { since: t0, hint, want }),
    dryRun: !!env.DRY_RUN,
  };
  try {
    const o = await openBrowser(env, { recording: true });
    browser = o.browser;
    await rec.start(o.sessionId);
    await o.page.goto(startUrl(job), { waitUntil: 'domcontentloaded', timeout: 45000 });
    try { await o.page.waitForNetworkIdle({ idleTime: 600, timeout: 6000 }); } catch (e) { /* devam */ }
    await rec.shot(o.page, 'Başvuru sayfası açıldı');
    result = await runAgent(env, settings, { page: o.page, job, app: { ...app, id: appId }, letter: app.letter, rec, ctx, account, maxSteps: settings.max_agent_steps, userActive });
    // kalıcı kanıt: son ekran
    try {
      const shot = await o.page.screenshot({ type: 'jpeg', quality: 70, fullPage: true });
      await env.R2.put(`evidence/${appId}/final.jpg`, shot, { httpMetadata: { contentType: 'image/jpeg' } });
      result.finalUrl = o.page.url();
      result.finalText = clip(await o.page.evaluate('document.body.innerText').catch(() => ''), 1500);
    } catch (e) { /* kanıt alınamadı */ }
  } catch (e) {
    result = { status: 'failed', reason: 'Tarayıcı hatası: ' + clip(e.message, 300), steps: 0, answers: {} };
    await log(env, 'apply', `Tarayıcı hatası: ${clip(e.stack || e.message, 800)}`, { ref: appId, level: 'error' });
  }
  const ms = now() - t0;
  // Sonucu HEMEN yaz (tarayıcı kapatma/temizlik takılsa bile kayıt kaybolmasın)
  let fin;
  try {
    await env.DB.prepare('UPDATE applications SET browser_ms=browser_ms+? WHERE id=?').bind(ms, appId).run();
    fin = await finalize(env, settings, appId, job, result, rec.id);
  } catch (e) {
    await log(env, 'apply', `Sonuç yazılamadı: ${clip(e.stack || e.message, 800)}`, { ref: appId, level: 'error' });
    await env.DB.prepare('UPDATE applications SET status=?, error=?, updated_at=? WHERE id=?').bind(result.status === 'submitted' ? 'submitted' : 'failed', clip(result.reason || e.message, 400), now(), appId).run();
    fin = { status: result.status, reason: result.reason };
  }
  await bumpUsage(env, 'browser_ms', ms).catch(() => {});
  await rec.finish().catch(() => {});
  try { await Promise.race([browser?.close(), new Promise((r) => setTimeout(r, 5000))]); } catch (e) { /* kapalı */ }
  return fin;
}

async function submitByEmail(env, settings, app, job, analysis) {
  const to = analysis.apply_email;
  const subject = `Application: ${job.title} — Özgür Güler`;
  const text = `${app.letter}\n\n—\nÖzgür Güler\n${CORE.email} · ${CORE.phone}\nPortfolio: ${CORE.portfolio}\nGitHub: ${CORE.github}\nLinkedIn: ${CORE.linkedin}\nCV (PDF): ${CORE.cv_url_en}`;
  try {
    const res = await sendMail(env, settings, { to, subject, text, appId: app.id, attachments: [{ content: await cvBase64(env, 'en'), filename: 'Ozgur_Guler_CV_English.pdf', type: 'application/pdf', disposition: 'attachment' }] });
    return finalize(env, settings, app.id, job, { status: 'submitted', reason: `E-posta ile gönderildi → ${to} (gönderim kabul edildi, teslim henüz doğrulanmadı)`, steps: 1, answers: { email_to: to, subject }, messageId: res?.messageId }, null);
  } catch (e) {
    return finalize(env, settings, app.id, job, { status: 'failed', reason: 'E-posta gönderilemedi: ' + e.message, steps: 0, answers: {} }, null);
  }
}

async function finalize(env, settings, appId, job, r, recId) {
  const map = { dry_run: 'dry_run', submitted: 'submitted', needs_human: 'needs_human', captcha: 'needs_human', not_eligible: 'not_eligible', closed: 'closed', blocked: 'blocked', failed: 'failed', paused: 'queued', deferred: 'queued' };
  const status = map[r.status] || 'failed';
  const evidence = { rec: recId, finalUrl: r.finalUrl || null, finalText: r.finalText || null, steps: r.steps, messageId: r.messageId || null, finalShot: r.finalUrl ? `evidence/${appId}/final.jpg` : null, at: now() };
  await setApp(env, appId, { status, error: status === 'submitted' ? null : clip(r.reason, 500), evidence, answers: r.answers || {}, steps: r.steps || 0, submitted_at: status === 'submitted' ? now() : null });
  let jobStatus = { submitted: 'applied', not_eligible: 'rejected', closed: 'expired', blocked: 'blocked', needs_human: 'needs_human', failed: 'approved', queued: 'approved' }[status] || 'approved';
  if (status === 'failed') {
    const f = await env.DB.prepare("SELECT COUNT(*) n FROM applications WHERE job_id=? AND status='failed'").bind(job.id).first();
    if ((f?.n || 0) >= 2) jobStatus = 'apply_failed'; // iki kez başarısız: bırak
  }
  await env.DB.prepare('UPDATE jobs SET status=?, reason=CASE WHEN ? IS NOT NULL THEN ? ELSE reason END WHERE id=?').bind(jobStatus, status !== 'submitted' ? r.reason : null, clip(r.reason || '', 300), job.id).run();
  if (status === 'submitted') await bumpUsage(env, 'applications', 1);
  if (status === 'needs_human') await addAction(env, { kind: 'needs_human', title: `${job.company} — ${job.title}: elle tamamlanabilir`, detail: `${r.reason}. Ön yazı ve cevaplar hazır; panelden "Canlı devral" ile yeniden başlatabilir ya da bağlantıdan kendin gönderebilirsin.`, url: startUrl(job), job_id: job.id, app_id: appId, priority: 2, dedupe: 'nh_' + appId });
  // öğrenme: bu site/ATS için not
  const scope = job.ats || hostOf(startUrl(job));
  if (scope && ['submitted', 'failed', 'needs_human', 'blocked'].includes(status)) {
    const ok = status === 'submitted' ? 1 : 0;
    const labels = Object.keys(r.answers || {}).slice(0, 40);
    const note = ok ? `Başarılı: ${labels.length} alan dolduruldu (${clip(labels.join('; '), 400)})` : `Sorun: ${clip(r.reason, 200)}`;
    await env.DB.prepare(`INSERT INTO recipes (id, scope, updated_at, successes, failures, notes, fields) VALUES (?1, ?1, ?2, ?3, ?4, ?5, ?6)
      ON CONFLICT(id) DO UPDATE SET updated_at=?2, successes=successes+?3, failures=failures+?4, notes=substr(?5 || char(10) || COALESCE(notes,''), 1, 1500), fields=?6`).bind(scope, now(), ok, 1 - ok, note, JSON.stringify(labels)).run();
  }
  await log(env, 'apply', `${job.company} — ${job.title}: ${status}${r.reason ? ` (${clip(r.reason, 160)})` : ''}`, { ref: appId, level: status === 'failed' ? 'warn' : 'info', data: { steps: r.steps } });
  return { status, reason: r.reason };
}

// 3) Gönderimden sonra onay e-postası kontrolü (mailTick de yapar; burada hızlı bağlama)
export async function confirmByMail(env, appId) {
  const app = await getApp(env, appId);
  if (!app || app.status !== 'submitted') return { status: app?.status };
  const job = await getJob(env, app.job_id);
  const since = new Date(app.submitted_at - 60000).toISOString();
  const { results } = await env.MAILDB.prepare("SELECT id, from_address, subject, text_body FROM messages WHERE direction='inbound' AND received_at >= ? ORDER BY received_at DESC LIMIT 30").bind(since).all();
  const name = String(job.company || '').toLowerCase().split(/\s+/)[0];
  const hit = (results || []).find((m) => name.length > 2 && `${m.from_address} ${m.subject} ${m.text_body}`.toLowerCase().includes(name) && /thank|received|application|başvuru|bewerbung|candidatura|solicitud/i.test(`${m.subject} ${m.text_body}`));
  if (hit) {
    await setApp(env, appId, { status: 'confirmed', confirmation: { mailId: hit.id, subject: hit.subject, from: hit.from_address } });
    await log(env, 'apply', `${job.company}: başvuru onay e-postası geldi`, { ref: appId });
    return { status: 'confirmed' };
  }
  return { status: 'submitted' };
}

// Cloudflare Workflows: her başvuru dayanıklı bir iş akışı olarak çalışır
export class ApplyWorkflow extends WorkflowEntrypoint {
  async run(event, step) {
    const { appId, userActive = false } = event.payload || {};
    await step.do('prepare', { retries: { limit: 2, delay: '30 seconds', backoff: 'linear' }, timeout: '6 minutes' }, () => prepare(this.env, appId));
    // Gönderim tekrar denenmez (çift başvuru olmasın)
    const res = await step.do('submit', { retries: { limit: 0, delay: '1 minute' }, timeout: '25 minutes' }, async () => {
      try { return await submit(this.env, appId, { userActive }); }
      catch (e) { await log(this.env, 'apply', `Gönderim adımı çöktü: ${clip(e.stack || e.message, 800)}`, { ref: appId, level: 'error' }); return { status: 'failed', reason: e.message }; }
    });
    if (res.status === 'submitted') {
      await step.sleep('mail-wait', '5 minutes');
      await step.do('confirm', { retries: { limit: 2, delay: '1 minute' }, timeout: '2 minutes' }, () => confirmByMail(this.env, appId));
    }
    return res;
  }
}

// Kuyruğu işlet: günlük sınırlar içinde en öncelikli ilanlara başvuru başlat
export async function dispatch(env, settings, { max = 1, userActive = false } = {}) {
  if (settings.paused || !settings.auto_apply) return { started: 0, why: 'duraklatıldı/otomatik başvuru kapalı' };
  const usage = await usageToday(env);
  const running = await env.DB.prepare("SELECT COUNT(*) n FROM applications WHERE status IN ('applying','prepared') AND updated_at > ?").bind(now() - 30 * MIN).first();
  if ((running?.n || 0) >= 2) return { started: 0, why: 'zaten 2 başvuru sürüyor' };
  const todayApps = await env.DB.prepare("SELECT COUNT(*) n FROM applications WHERE created_at > ? AND status NOT IN ('failed','cancelled','queued')").bind(now() - DAY).first();
  const left = settings.daily_apply_limit - Math.max(usage.applications || 0, todayApps?.n || 0);
  if (left <= 0) return { started: 0, why: 'günlük başvuru sınırı doldu' };
  if (usage.browser_ms / 60000 >= settings.daily_browser_minutes) return { started: 0, why: 'günlük tarayıcı süresi doldu' };
  const blockedHosts = new Set((settings.blocked_domains || []).map(String));
  // Öğrenilmiş: robot doğrulaması yüzünden hiç başarılamayan siteler, sen panelde değilken denenmez (tarayıcı süresi boşa gitmesin)
  const hardScopes = new Set((await allRows(env, 'SELECT scope FROM recipes WHERE failures >= 3 AND successes = 0')).map((r) => r.scope));
  const candidates = await allRows(env, `SELECT id, apply_url, url, company FROM jobs WHERE status='approved' ORDER BY priority DESC, discovered_at DESC LIMIT 20`);
  let started = 0;
  for (const j of candidates) {
    if (started >= Math.min(max, left)) break;
    if (blockedHosts.has(hostOf(j.apply_url || j.url))) continue;
    const scope = detectATS(j.apply_url || j.url)?.ats || hostOf(startUrl(j));
    if (!userActive && hardScopes.has(scope)) { await env.DB.prepare("UPDATE jobs SET status='review', reason=? WHERE id=?").bind(`${scope} sitesinde otomatik başvuru robot doğrulamasına takılıyor; panelden "Hemen başvur" ile canlı devralabilirsin`, j.id).run(); continue; }
    // Aynı şirkete 30 günde en fazla N başvuru (posta kutusundaki önceki başvuru e-postaları da sayılır)
    const perCo = settings.max_per_company_30d ?? 2;
    const mine = await env.DB.prepare("SELECT COUNT(*) n FROM applications a JOIN jobs k ON k.id=a.job_id WHERE lower(k.company)=lower(?) AND a.created_at > ? AND a.status IN ('submitted','confirmed','interview','next_step','applying','prepared','queued')").bind(j.company || '', now() - 30 * DAY).first();
    let prior = 0;
    if ((j.company || '').length > 2) {
      const r = await env.MAILDB.prepare("SELECT COUNT(DISTINCT substr(received_at,1,10)) n FROM messages WHERE direction='inbound' AND received_at > ? AND (subject LIKE ? OR from_name LIKE ?) AND (subject LIKE '%appl%' OR subject LIKE '%başvuru%' OR subject LIKE '%security code%')").bind(new Date(now() - 30 * DAY).toISOString(), `%${j.company}%`, `%${j.company}%`).first().catch(() => null);
      prior = r?.n || 0;
    }
    if ((mine?.n || 0) + prior >= perCo) { await env.DB.prepare("UPDATE jobs SET status='review', reason=? WHERE id=?").bind(`Bu şirkete son 30 günde ${(mine?.n || 0) + prior} başvuru var (sınır ${perCo})`, j.id).run(); continue; }
    const appId = await createApplication(env, j.id);
    try {
      const inst = await env.APPLY.create({ id: appId + '-' + Date.now().toString(36), params: { appId, userActive } });
      await setApp(env, appId, { workflow_id: inst.id });
      started++;
    } catch (e) {
      await setApp(env, appId, { status: 'failed', error: 'Workflow başlatılamadı: ' + e.message });
    }
  }
  return { started };
}

// Takılı kalan başvuruları kurtar
export async function recoverStuck(env) {
  const stuck = await allRows(env, "SELECT id, job_id FROM applications WHERE status IN ('applying','prepared') AND updated_at < ?", now() - 40 * MIN);
  for (const a of stuck) {
    // Kayıttaki son adımlara bak: gönderim/onay görüldüyse ASLA tekrar başvurma
    let sent = false;
    const rec = await env.DB.prepare('SELECT id FROM recordings WHERE app_id=? ORDER BY created_at DESC LIMIT 1').bind(a.id).first();
    if (rec) {
      const tl = await env.R2.get(`rec/${rec.id}/timeline.json`);
      const txt = tl ? await tl.text() : '';
      sent = /onay ekranı|Gönderim sonrası|submitted|Thank you/i.test(txt);
    }
    if (sent) {
      await env.DB.prepare("UPDATE applications SET status='submitted', submitted_at=COALESCE(submitted_at, updated_at), error='Kayıttan kurtarıldı: onay ekranı görülmüştü', updated_at=? WHERE id=?").bind(now(), a.id).run();
      await env.DB.prepare("UPDATE jobs SET status='applied' WHERE id=?").bind(a.job_id).run();
      await bumpUsage(env, 'applications', 1);
      await log(env, 'apply', 'Takılı başvuru kayıttan kurtarıldı: gönderilmiş', { ref: a.id });
    } else {
      await env.DB.prepare("UPDATE applications SET status='failed', error='Zaman aşımı (iş akışı yanıt vermedi)', updated_at=? WHERE id=?").bind(now(), a.id).run();
      await log(env, 'apply', 'Takılı başvuru başarısız sayıldı', { ref: a.id, level: 'warn' });
    }
  }
  await env.DB.prepare("UPDATE jobs SET status=CASE WHEN (SELECT COUNT(*) FROM applications a WHERE a.job_id=jobs.id AND a.status='failed') >= 2 THEN 'apply_failed' ELSE 'approved' END WHERE status='queued' AND NOT EXISTS (SELECT 1 FROM applications a WHERE a.job_id=jobs.id AND a.status IN ('queued','prepared','applying','submitted','confirmed'))").run();
}

export { getJob, getApp };
