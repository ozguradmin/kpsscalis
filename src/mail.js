// E-posta: ozgurguler-mail D1'inden gelen kutusunu okur, sınıflandırır, başvurulara bağlar; doğrulama kodu/bağlantısı bulur; e-posta gönderir.
import { now, uid, clip, htmlToText, hostOf, normKey, sleep, DAY, MIN, dayKey } from './lib/util.js';
import { log, allRows, addAction, bumpUsage } from './lib/db.js';
import { jev, llm } from './lib/llm.js';
import { signLink } from './lib/auth.js';

const LINK_RE = /https?:\/\/[^\s"'<>)\]]+/g;
const isYear = (x) => /^(19|20)\d{2}$/.test(x);
const codeLike = (x) => /^[A-Za-z0-9]{4,10}$/.test(x) && /\d/.test(x) && !isYear(x) && !/^\d{7,}$/.test(x);

// Doğrulama kodu: önce HTML'de öne çıkarılmış kod (h1/h2/strong/b/td/span), sonra metindeki "code: X" kalıbı, sonra tek başına 4-8 haneli sayı
export function extractCode(text, html = '') {
  const h = String(html || '');
  for (const m of h.matchAll(/<(h1|h2|h3|strong|b|td|span|p|div)[^>]*>\s*([A-Za-z0-9]{4,10})\s*<\/\1>/gi)) if (codeLike(m[2])) return m[2];
  const t = `${text || ''}\n${h.replace(/<[^>]+>/g, ' ')}`;
  const near = t.match(/(?:code|kod|código|codice|pin|otp|passcode)\s*(?:is|:|-|=)?\s*([A-Za-z0-9]{4,10})\b/i);
  if (near && codeLike(near[1])) return near[1];
  for (const m of t.matchAll(/(?:^|[\s:>])(\d{4,8})(?=[\s.<]|$)/g)) if (!isYear(m[1])) return m[1];
  return null;
}

export function extractVerifyLink(text, html) {
  const all = [...String(html || '').matchAll(/href="([^"]+)"/g)].map((m) => m[1].replace(/&amp;/g, '&')).concat(String(text || '').match(LINK_RE) || []);
  return all.find((u) => /verif|confirm|activate|activation|validate|magic|sign.?in|login|token=|onay|doğrula/i.test(u) && !/unsubscribe|privacy|terms|help|support\./i.test(u)) || null;
}

// Başvuru sırasında gelen kodu/bağlantıyı bekler (ör. Greenhouse güvenlik kodu, hesap doğrulama)
export async function waitForMail(env, { since, hint = '', want = 'code', timeoutMs = 150000 }) {
  const until = now() + timeoutMs;
  const sinceIso = new Date(since - 60000).toISOString();
  const h = String(hint || '').toLowerCase();
  while (now() < until) {
    const rows = await env.MAILDB.prepare("SELECT id, from_address, subject, text_body, html_body, received_at FROM messages WHERE direction='inbound' AND received_at >= ? ORDER BY received_at DESC LIMIT 15").bind(sinceIso).all();
    for (const m of rows.results || []) {
      const hay = `${m.from_address} ${m.subject} ${m.text_body}`.toLowerCase();
      if (h && !h.split(/\s+/).some((w) => w.length > 2 && hay.includes(w))) continue;
      if (want === 'code') { const c = extractCode(`${m.subject}\n${m.text_body || ''}`, m.html_body); if (c) return c; }
      else { const l = extractVerifyLink(m.text_body, m.html_body); if (l) return l; }
    }
    await sleep(8000);
  }
  return null;
}

const CATS = {
  verification: 'Verification/security code, magic sign-in link or email confirmation for an account or application',
  confirmation: 'Automatic confirmation that a job application was received',
  rejection: 'The employer declined the candidate / position filled / not moving forward',
  interview: 'Invitation to an interview, call, meeting or scheduling request with a person',
  assessment: 'The employer requires the candidate to complete a test, assignment, AI/video interview or a mandatory next step to stay in the hiring process',
  survey: 'Optional survey, diversity/EEO questionnaire, satisfaction or support rating, feedback request',
  recruiter: 'A personal message from a recruiter/employer asking a question or requesting information/documents',
  offer: 'Job offer, contract, onboarding or payment/invoice setup for work',
  reminder: 'Reminder about an incomplete application or pending step',
  newsletter: 'Marketing, newsletter, product update, job alerts or other bulk email',
  other: 'Anything else',
};

// E-postadaki ana eylem bağlantısı (kayıt ol, profili tamamla, başvuruyu bitir…)
export function pickCTA(text, html) {
  const links = [...String(html || '').matchAll(/<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi)].map((m) => ({ url: m[1].replace(/&amp;/g, '&'), label: htmlToText(m[2], 120) }));
  for (const u of String(text || '').match(LINK_RE) || []) links.push({ url: u, label: '' });
  const bad = /unsubscribe|privacy|terms|preferences|help|support|facebook|twitter|linkedin\.com\/company|instagram|youtube|mailto:/i;
  const good = /sign ?up|register|join|create|complete|finish|continue|get started|upload|profile|login|log in|apply|onboard|start|activate|verify/i;
  const scored = links.filter((l) => /^https?:/.test(l.url) && !bad.test(l.url) && !bad.test(l.label)).map((l) => ({ ...l, s: (good.test(l.label) ? 2 : 0) + (good.test(l.url) ? 1 : 0) }));
  scored.sort((a, b) => b.s - a.s);
  return scored[0]?.s > 0 ? scored[0].url : null;
}

async function createFollowup(env, { mailId, url, app, subject, body }) {
  const id = uid('j_');
  const res = await env.DB.prepare(`INSERT OR IGNORE INTO jobs (id, source, external_id, url, apply_url, company, title, location, description, discovered_at, last_seen_at, dedupe, status, stage, fit, priority, reason, analysis, lang)
    VALUES (?, 'followup', ?, ?, ?, ?, ?, 'Remote', ?, ?, ?, ?, 'approved', 4, 90, 900, ?, ?, 'en')`)
    .bind(id, mailId, url, url, app.company, clip(`Takip: ${subject}`, 200), clip(body, 6000), now(), now(), 'followup:' + mailId,
      'Şirketin e-postası kayıt/profil/CV adımı istiyor; ajan tamamlayacak',
      JSON.stringify({ apply_method: 'job_board_account', needs_account: true, followup: true, pitch: `Complete the next step requested by ${app.company} after applying to "${app.title}": ${clip(subject, 150)}`, decision: 'apply' })).run();
  if (res.meta.changes) await log(env, 'mail', `${app.company}: e-postadaki sonraki adım (kayıt/profil) ajana görev olarak verildi`, { ref: app.id, data: { url } });
}

// Yeni gelen e-postaları işle
export async function mailTick(env, settings, { limit = 25 } = {}) {
  const last = await env.DB.prepare("SELECT value FROM settings WHERE key='mail_cursor'").first();
  const cursor = last ? JSON.parse(last.value) : new Date(now() - 14 * DAY).toISOString();
  const { results } = await env.MAILDB.prepare("SELECT id, from_address, from_name, subject, text_body, html_body, received_at FROM messages WHERE direction='inbound' AND received_at > ? ORDER BY received_at ASC LIMIT ?").bind(cursor, limit).all();
  if (!results?.length) return { processed: 0 };
  const apps = await allRows(env, `SELECT a.id, a.status, a.submitted_at, a.created_at, j.company, j.title, j.apply_url, j.url FROM applications a JOIN jobs j ON j.id=a.job_id WHERE a.updated_at > ? ORDER BY a.updated_at DESC LIMIT 300`, now() - 90 * DAY);
  let processed = 0;
  const own = String(settings.from_email || 'destek@ozgurguler.tech').toLowerCase();
  for (const m of results) {
    if (String(m.from_address || '').toLowerCase() === own) { await env.DB.prepare("INSERT INTO settings (key, value, updated_at, updated_by) VALUES ('mail_cursor', ?1, ?2, 'mail') ON CONFLICT(key) DO UPDATE SET value=?1, updated_at=?2").bind(JSON.stringify(m.received_at), now()).run(); continue; }
    const body = clip(m.text_body || htmlToText(m.html_body), 4000);
    // 1) Başvuruya bağla: sadece başvurudan SONRA gelen e-postalar; şirket adı ya da şirketin kendi alan adı (ATS alan adları ortak olduğu için sayılmaz)
    const recvT = Date.parse(m.received_at) || now();
    const dom = (m.from_address || '').split('@')[1] || '';
    const hay = normKey(`${m.from_name} ${m.subject} ${body.slice(0, 1500)} ${dom}`);
    const eligible = apps.filter((a) => (a.created_at || 0) - 5 * 60000 <= recvT);
    const ATS_HOSTS = /greenhouse|lever|ashby|workable|recruitee|personio|teamtailor|breezy|smartrecruiters|himalayas|getonbrd|remoteok|djinni|jobicy|pstmrk|sendgrid|mailgun/i;
    const app = eligible.find((a) => { const c = normKey(a.company); return c.length > 2 && hay.includes(c); })
      || eligible.find((a) => { const h = hostOf(a.apply_url || a.url).split('.').slice(-2, -1)[0]; return h && h.length > 3 && !ATS_HOSTS.test(h) && dom.includes(h); });
    // 2) Sınıflandır (başvuru bağlamıyla) + takip eylemi türü
    let category = 'other', conf = 0, action = 'none';
    try {
      const a = await jev(env, { from: `${m.from_name || ''} <${m.from_address}>`, subject: m.subject, body: clip(body, 2500), related_application: app ? { company: app.company, title: app.title, status: app.status } : null }, {
        cat: { type: 'choice', instructions: 'What kind of email is this, for a job seeker who applies to jobs automatically? If `related_application` is present the email comes from a company he applied to, so it is rarely a newsletter.', criteria: CATS },
        action: { type: 'choice', instructions: 'What does the sender want the candidate to do next?', criteria: {
          signup_or_profile: 'Create/activate an account, complete a profile, upload a resume, fill an online form or questionnaire about skills/availability',
          test_or_interview: 'Take a test/assessment, record a video, do an AI or live interview',
          schedule_or_reply: 'Reply by email, schedule a call or meeting, answer questions',
          none: 'Nothing required (information, confirmation, marketing, rejection)' } },
      });
      category = a.cat.choice; conf = a.cat.confidence; action = a.action.choice;
      if (app && category === 'newsletter') category = 'other';
    } catch (e) {
      try {
        const o = await llm(env, settings, { task: 'mail', json: true, maxTokens: 160, messages: [{ role: 'system', content: `Classify the email for a job seeker. Return JSON {"cat":"${Object.keys(CATS).join('|')}","action":"signup_or_profile|test_or_interview|schedule_or_reply|none"}` }, { role: 'user', content: `From: ${m.from_address}\nSubject: ${m.subject}\nRelated application: ${app ? app.company : 'none'}\n\n${clip(body, 2000)}` }] });
        category = o.json?.cat || 'other'; action = o.json?.action || 'none';
      } catch (e2) { /* sınıflandırılamadı */ }
    }
    // 3) Takip görevi: kayıt/profil/CV adımını ajan kendisi tamamlasın
    if (action === 'signup_or_profile' && app && category !== 'verification' && category !== 'rejection') {
      const url = pickCTA(m.text_body, m.html_body);
      if (url) await createFollowup(env, { mailId: m.id, url, app, subject: m.subject, body });
    }
    const code = category === 'verification' ? extractCode(`${m.subject}\n${m.text_body || ''}`, m.html_body) : null;
    const link = category === 'verification' ? extractVerifyLink(m.text_body, m.html_body) : null;
    let summary = null, draft = null;
    if (['interview', 'assessment', 'recruiter', 'offer', 'rejection'].includes(category) || action !== 'none') {
      try {
        const o = await llm(env, settings, { task: 'mail', json: true, maxTokens: 700, messages: [
          { role: 'system', content: 'You help a job seeker (Özgür Güler, Türkiye, remote-only, English intermediate, prefers written communication). Return JSON {"summary_tr":"1-2 sentences in Turkish: what they want and deadline","needs_human":true|false,"reply_en":"a short polite reply in the same language as the email (or English), only if a reply is useful; else null"}. Never promise things the candidate did not state; do not invent availability times.' },
          { role: 'user', content: `From: ${m.from_name || ''} <${m.from_address}>\nSubject: ${m.subject}\n\n${body}` }] });
        summary = o.json?.summary_tr || null; draft = o.json?.reply_en || null;
      } catch (e) { /* özet yok */ }
    }
    await env.DB.prepare('INSERT OR REPLACE INTO mail (id, received_at, from_addr, subject, category, app_id, code, link, summary, draft, handled, processed_at) VALUES (?,?,?,?,?,?,?,?,?,?,0,?)')
      .bind(m.id, m.received_at, m.from_address, clip(m.subject, 300), category, app?.id || null, code, link, summary, draft, now()).run();
    // Doğrulama kodu geldi ama onu bekleyen bir ajan yoksa: Özgür elle bir şey yapıyordur (ör. Meridial kaydı) → kodu Gmail'ine ilet
    if (category === 'verification' && (code || link) && recvT > now() - 30 * MIN) {
      const busy = await env.DB.prepare("SELECT 1 FROM applications WHERE status IN ('applying','prepared') AND updated_at > ?").bind(now() - 20 * MIN).first();
      if (!busy) await alertUser(env, settings, { key: 'code_' + m.id, subject: `Doğrulama ${code ? 'kodu: ' + code : 'bağlantısı'} (${m.from_name || dom})`,
        text: `${m.from_name || ''} <${m.from_address}> az önce destek@ozgurguler.tech adresine bir doğrulama ${code ? 'kodu' : 'bağlantısı'} gönderdi.\n${code ? `\nKOD: ${code}\n` : ''}${link ? `\nBağlantı: ${link}\n` : ''}\nKonu: ${m.subject}` });
    }
    if (app) {
      const next = { confirmation: 'confirmed', rejection: 'rejected', interview: 'interview', assessment: 'next_step', offer: 'offer' }[category];
      const rank = { submitted: 1, confirmed: 2, next_step: 3, interview: 4, offer: 5, rejected: 6 };
      if (next && (rank[next] || 0) > (rank[app.status] || 0)) {
        await env.DB.prepare('UPDATE applications SET status=?, updated_at=? WHERE id=?').bind(next, now(), app.id).run();
        await log(env, 'mail', `${app.company}: ${category} → başvuru durumu "${next}"`, { ref: app.id });
      }
    }
    if (['interview', 'assessment', 'offer', 'recruiter'].includes(category) && action !== 'signup_or_profile') {
      await addAction(env, { kind: category, title: `${app ? app.company + ': ' : ''}${clip(m.subject, 120)}`, detail: summary || clip(body, 400), app_id: app?.id || null, priority: category === 'offer' || category === 'interview' ? 1 : 2, dedupe: 'mail_' + m.id });
      const LBL = { offer: '🎉 İş teklifi', interview: 'Mülakat daveti', assessment: 'Sonraki adım / test', recruiter: 'İşverenden mesaj' };
      await alertUser(env, settings, { key: 'mail_' + m.id, appId: app?.id, subject: `${LBL[category]}: ${app ? app.company : m.from_name || m.from_address}`,
        text: `${summary || ''}\n\nKimden: ${m.from_name || ''} <${m.from_address}>\nKonu: ${m.subject}\n${app ? `Başvuru: ${app.company} — ${app.title || ''}\n` : ''}\n--- e-postanın başı ---\n${clip(body, 1500)}${draft ? `\n\n--- cevap taslağı (panelden düzenleyip gönderebilirsin) ---\n${draft}` : ''}` });
      if (settings.auto_reply_mail && draft && category === 'recruiter') await sendMail(env, settings, { to: m.from_address, subject: /^re:/i.test(m.subject) ? m.subject : `Re: ${m.subject}`, text: draft, appId: app?.id });
    }
    processed++;
    await env.DB.prepare("INSERT INTO settings (key, value, updated_at, updated_by) VALUES ('mail_cursor', ?1, ?2, 'mail') ON CONFLICT(key) DO UPDATE SET value=?1, updated_at=?2").bind(JSON.stringify(m.received_at), now()).run();
  }
  if (processed) await log(env, 'mail', `${processed} yeni e-posta işlendi`);
  return { processed };
}

// Özgür'e anında bildirim (Gmail). Aynı olay için bir kez; günde en fazla 15.
export async function alertUser(env, settings, { key, subject, text, url = null, appId = null, restart = false }) {
  const to = settings.alert_email;
  if (!to) return false;
  const dup = await env.DB.prepare("SELECT 1 FROM events WHERE type='alert' AND ref=? LIMIT 1").bind(key).first();
  if (dup) return false;
  const today = await env.DB.prepare("SELECT COUNT(*) n FROM events WHERE type='alert' AND ts>?").bind(now() - DAY).first();
  if ((today?.n || 0) >= 15) return false;
  const panel = settings.public_url || 'https://ozgur-is-ajani.ozgurglr256.workers.dev';
  const again = restart && appId ? `\nŞimdi yapamıyorsan, sonra şu bağlantıya bas: ajan başvuruyu baştan doldurur ve robot doğrulamasında seni bekler (7 gün geçerli):\n${panel}/api/h/${encodeURIComponent(await signLink(env, { a: appId, exp: now() + 7 * DAY }))}\n` : '';
  const body = `${text}\n\n${url ? `Canlı tarayıcı: ${url}\n` : ''}${again}\nPanel: ${panel}/${appId ? `#/basvuru/${appId}` : ''}\n\n— İş ajanı (otomatik bildirim)`;
  try {
    const res = await env.EMAIL.send({ to, from: { email: settings.from_email || 'destek@ozgurguler.tech', name: 'İş Ajanı' }, subject, text: body });
    await log(env, 'alert', `Bildirim gönderimi kabul edildi → ${to}: ${clip(subject, 100)}`, { ref: key, data: { messageId: res?.messageId, appId } });
    return true;
  } catch (e) {
    await log(env, 'mail', `Bildirim gönderilemedi: ${e.message}`, { level: 'warn', ref: appId });
    return false;
  }
}

// E-posta gönder (Cloudflare Email Service) ve posta sistemindeki "Gönderilenler"e kopyasını yaz
export async function sendMail(env, settings, { to, subject, text, attachments = [], appId = null, replyTo = null }) {
  const from = { email: settings.from_email || 'destek@ozgurguler.tech', name: settings.from_name || 'Özgür Güler' };
  const res = await env.EMAIL.send({ to, from, subject, text, replyTo: replyTo || undefined, attachments: attachments.length ? attachments : undefined });
  const t = new Date().toISOString();
  const mid = uid('msg_');
  try {
    await env.MAILDB.prepare(`INSERT INTO messages (id, thread_id, folder, direction, from_address, from_name, to_json, cc_json, subject, preview, text_body, html_body, received_at, is_read, created_at, delivery_status, provider_message_id)
      VALUES (?, ?, 'sent', 'outbound', ?, ?, ?, '[]', ?, ?, ?, '', ?, 1, ?, 'accepted', ?)`)
      .bind(mid, mid, from.email, from.name, JSON.stringify([{ address: to }]), subject, clip(text, 180), text, t, t, res?.messageId || null).run();
  } catch (e) { await log(env, 'mail', 'Gönderilen kopyası posta kutusuna yazılamadı: ' + e.message, { level: 'warn' }); }
  await bumpUsage(env, 'emails_sent', 1);
  await log(env, 'mail', `E-posta gönderimi kabul edildi → ${to}: ${clip(subject, 100)}`, { ref: appId, data: { messageId: res?.messageId } });
  return res;
}

const STATUS_TR = { queued: 'sırada', prepared: 'hazırlandı', applying: 'başvuruyor', submitted: 'gönderildi', confirmed: 'gönderildi, şirketten otomatik "alındı" e-postası geldi', next_step: 'SONRAKİ ADIM istendi', interview: 'MÜLAKAT', offer: 'TEKLİF', rejected: 'olumsuz', needs_human: 'sana kaldı', not_eligible: 'uygun değil', closed: 'ilan kapalı', blocked: 'engel', failed: 'başarısız', cancelled: 'iptal' };

// E-postayla yapılan başvurularda 8 gün ses çıkmazsa tek, kısa ve kibar bir hatırlatma (başvuru başına en fazla bir kez)
export async function followUps(env, settings) {
  const rows = await allRows(env, `SELECT a.id, a.answers, a.submitted_at, j.company, j.title FROM applications a JOIN jobs j ON j.id=a.job_id
    WHERE a.method='email' AND a.status='submitted' AND a.submitted_at < ? AND a.submitted_at > ? AND NOT EXISTS (SELECT 1 FROM events e WHERE e.type='followup' AND e.ref=a.id) LIMIT 3`, now() - 8 * DAY, now() - 30 * DAY);
  let sent = 0;
  for (const r of rows) {
    const ans = (() => { try { return JSON.parse(r.answers || '{}'); } catch (e) { return {}; } })();
    if (!ans.email_to) continue;
    const text = `Hello,\n\nI wanted to briefly follow up on my application for ${r.title} at ${r.company}, sent on ${new Date(r.submitted_at).toISOString().slice(0, 10)}. I remain very interested and I am happy to share anything else that would help, such as code samples or a short written task.\n\nThank you for your time,\nÖzgür Güler\nozgurguler.tech`;
    await sendMail(env, settings, { to: ans.email_to, subject: /^re:/i.test(ans.subject || '') ? ans.subject : `Re: ${ans.subject || 'Application — Özgür Güler'}`, text, appId: r.id });
    await log(env, 'followup', `${r.company}: 8 gün yanıt gelmediği için kısa hatırlatma gönderildi (kabul edildi)`, { ref: r.id });
    sent++;
  }
  return { sent };
}

// Günlük özet (sabah)
export async function dailyDigest(env, settings) {
  const since = now() - DAY;
  const q = async (sql, ...b) => (await env.DB.prepare(sql).bind(...b).first()) || {};
  const found = await q('SELECT COUNT(*) n FROM jobs WHERE discovered_at>?', since);
  const approved = await q("SELECT COUNT(*) n FROM jobs WHERE status IN ('approved','queued','applied') AND discovered_at>?", since);
  const apps = await allRows(env, "SELECT a.status, j.company, j.title FROM applications a JOIN jobs j ON j.id=a.job_id WHERE a.updated_at>? ORDER BY a.updated_at DESC LIMIT 30", since);
  const acts = await allRows(env, "SELECT title, detail FROM actions WHERE status='open' ORDER BY priority, created_at DESC LIMIT 10");
  const cost = await q('SELECT COALESCE(SUM(cost),0) c FROM ai_usage WHERE day=?', dayKey(since));
  const lines = [
    `Son 24 saat: ${found.n || 0} yeni ilan tarandı, ${approved.n || 0} tanesi uygun bulundu.`,
    '', 'Başvurular:', ...(apps.length ? apps.map((a) => `- ${a.company} — ${a.title}: ${STATUS_TR[a.status] || a.status}`) : ['- (yok)']),
    '', 'Senin bakman gerekebilecekler:', ...(acts.length ? acts.map((a) => `- ${a.title}${a.detail ? ` — ${clip(a.detail, 160)}` : ''}`) : ['- (yok)']),
    '', `Dünkü yapay zekâ maliyeti: ${Number(cost.c || 0).toFixed(2)} $ (Cloudflare kredisinden).`,
    '', 'Panel: ' + (settings.public_url || ''),
  ];
  await sendMail(env, settings, { to: settings.alert_email || settings.notify_email, subject: `İş ajanı günlük özet — ${dayKey()}`, text: lines.join('\n') });
}
