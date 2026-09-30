// E-posta: ozgurguler-mail D1'inden gelen kutusunu okur, sınıflandırır, başvurulara bağlar; doğrulama kodu/bağlantısı bulur; e-posta gönderir.
import { now, uid, clip, htmlToText, hostOf, normKey, sleep, DAY, dayKey } from './lib/util.js';
import { log, allRows, addAction, bumpUsage } from './lib/db.js';
import { jev, llm } from './lib/llm.js';

const CODE_RE = /(?:code|kod|código|codice|Code|verification|doğrulama|security|pin|otp)[^0-9]{0,60}?\b(\d{4,8})\b|\b(\d{6})\b(?=[^0-9]{0,40}(?:is your|to verify|verification|code|kod))/i;
const LINK_RE = /https?:\/\/[^\s"'<>)\]]+/g;

export function extractCode(text) {
  const t = String(text || '');
  const m = t.match(CODE_RE);
  if (m) return m[1] || m[2];
  const six = t.match(/(?:^|\s)(\d{6})(?:\s|$)/);
  return six ? six[1] : null;
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
      if (want === 'code') { const c = extractCode(`${m.subject}\n${m.text_body || htmlToText(m.html_body)}`); if (c) return c; }
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
  assessment: 'Request to complete a test, assignment, AI interview, video recording, questionnaire or next application step',
  recruiter: 'A personal message from a recruiter/employer asking a question or requesting information/documents',
  offer: 'Job offer, contract, onboarding or payment/invoice setup for work',
  reminder: 'Reminder about an incomplete application or pending step',
  newsletter: 'Marketing, newsletter, product update, job alerts or other bulk email',
  other: 'Anything else',
};

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
    let category = 'other', conf = 0;
    try {
      const a = await jev(env, { from: `${m.from_name || ''} <${m.from_address}>`, subject: m.subject, body: clip(body, 2500) }, { cat: { type: 'choice', instructions: 'What kind of email is this, for a job seeker who applies to jobs automatically?', criteria: CATS } });
      category = a.cat.choice; conf = a.cat.confidence;
    } catch (e) {
      try {
        const o = await llm(env, settings, { task: 'mail', json: true, maxTokens: 120, messages: [{ role: 'system', content: `Classify the email. Return JSON {"cat":"${Object.keys(CATS).join('|')}"}` }, { role: 'user', content: `From: ${m.from_address}\nSubject: ${m.subject}\n\n${clip(body, 2000)}` }] });
        category = o.json?.cat || 'other';
      } catch (e2) { /* sınıflandırılamadı */ }
    }
    // Başvuruya bağla: gönderen alan adı / şirket adı / ATS adı eşleşmesi
    const dom = (m.from_address || '').split('@')[1] || '';
    const hay = normKey(`${m.from_name} ${m.subject} ${body.slice(0, 1500)} ${dom}`);
    let app = apps.find((a) => { const c = normKey(a.company); return c.length > 2 && hay.includes(c); })
      || apps.find((a) => { const h = hostOf(a.apply_url || a.url).split('.').slice(-2, -1)[0]; return h && h.length > 3 && dom.includes(h); });
    const code = category === 'verification' ? extractCode(`${m.subject}\n${body}`) : null;
    const link = category === 'verification' ? extractVerifyLink(m.text_body, m.html_body) : null;
    let summary = null, draft = null;
    if (['interview', 'assessment', 'recruiter', 'offer', 'rejection'].includes(category)) {
      try {
        const o = await llm(env, settings, { task: 'mail', json: true, maxTokens: 700, messages: [
          { role: 'system', content: 'You help a job seeker (Özgür Güler, Türkiye, remote-only, English intermediate, prefers written communication). Return JSON {"summary_tr":"1-2 sentences in Turkish: what they want and deadline","needs_human":true|false,"reply_en":"a short polite reply in the same language as the email (or English), only if a reply is useful; else null"}. Never promise things the candidate did not state; do not invent availability times.' },
          { role: 'user', content: `From: ${m.from_name || ''} <${m.from_address}>\nSubject: ${m.subject}\n\n${body}` }] });
        summary = o.json?.summary_tr || null; draft = o.json?.reply_en || null;
      } catch (e) { /* özet yok */ }
    }
    await env.DB.prepare('INSERT OR REPLACE INTO mail (id, received_at, from_addr, subject, category, app_id, code, link, summary, draft, handled, processed_at) VALUES (?,?,?,?,?,?,?,?,?,?,0,?)')
      .bind(m.id, m.received_at, m.from_address, clip(m.subject, 300), category, app?.id || null, code, link, summary, draft, now()).run();
    if (app) {
      const next = { confirmation: 'confirmed', rejection: 'rejected', interview: 'interview', assessment: 'next_step', offer: 'offer' }[category];
      const rank = { submitted: 1, confirmed: 2, next_step: 3, interview: 4, offer: 5, rejected: 6 };
      if (next && (rank[next] || 0) > (rank[app.status] || 0)) {
        await env.DB.prepare('UPDATE applications SET status=?, updated_at=? WHERE id=?').bind(next, now(), app.id).run();
        await log(env, 'mail', `${app.company}: ${category} → başvuru durumu "${next}"`, { ref: app.id });
      }
    }
    if (['interview', 'assessment', 'offer', 'recruiter'].includes(category)) {
      await addAction(env, { kind: category, title: `${app ? app.company + ': ' : ''}${clip(m.subject, 120)}`, detail: summary || clip(body, 400), app_id: app?.id || null, priority: category === 'offer' || category === 'interview' ? 1 : 2, dedupe: 'mail_' + m.id });
      if (settings.auto_reply_mail && draft && category === 'recruiter') await sendMail(env, settings, { to: m.from_address, subject: /^re:/i.test(m.subject) ? m.subject : `Re: ${m.subject}`, text: draft, appId: app?.id });
    }
    processed++;
    await env.DB.prepare("INSERT INTO settings (key, value, updated_at, updated_by) VALUES ('mail_cursor', ?1, ?2, 'mail') ON CONFLICT(key) DO UPDATE SET value=?1, updated_at=?2").bind(JSON.stringify(m.received_at), now()).run();
  }
  if (processed) await log(env, 'mail', `${processed} yeni e-posta işlendi`);
  return { processed };
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
    '', 'Başvurular:', ...(apps.length ? apps.map((a) => `- ${a.company} — ${a.title}: ${a.status}`) : ['- (yok)']),
    '', 'Senin bakman gerekebilecekler:', ...(acts.length ? acts.map((a) => `- ${a.title}${a.detail ? ` — ${clip(a.detail, 160)}` : ''}`) : ['- (yok)']),
    '', `Dünkü yapay zekâ maliyeti: ${Number(cost.c || 0).toFixed(2)} $ (Cloudflare kredisinden).`,
    '', 'Panel: ' + (settings.public_url || ''),
  ];
  await sendMail(env, settings, { to: settings.notify_email, subject: `İş ajanı günlük özet — ${dayKey()}`, text: lines.join('\n') });
}
