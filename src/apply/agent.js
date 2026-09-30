// Tarayıcı ajanı: sayfayı gözler, modele sorar, eylemleri uygular; başvuru gönderilene ya da engel çıkana kadar döner.
import { llm } from '../lib/llm.js';
import { act, snapshot, liveHandoff } from './browser.js';
import { HONESTY_RULES, CORE } from '../profile.js';
import { clip, now, sleep, hostOf, sha256 } from '../lib/util.js';
import { log, addAction } from '../lib/db.js';
import { alertUser } from '../mail.js';

const SUCCESS_RE = /(thank(s| you) for (your )?(applying|application|submitting|interest)|application (has been |was )?(received|submitted|sent|complete)|we('ve| have) received your application|successfully (submitted|applied)|your application is (in|complete)|başvurunuz (alındı|iletildi|tamamlandı)|candidatura (enviada|recebida)|solicitud (enviada|recibida)|bewerbung (wurde )?(erfolgreich )?(versendet|übermittelt|eingegangen)|danke für deine bewerbung|merci pour votre candidature|отклик отправлен|спасибо за отклик|dziękujemy za (aplikację|zgłoszenie))/i;
const CLOSED_RE = /(no longer (accepting|available)|position (has been )?(filled|closed)|job (is )?(closed|expired|not found)|this job has expired|ilan yayından kaldırıldı|page not found|404)/i;

const AGENT_SYS = `You are an expert web agent that completes and submits a job application in a real browser for the candidate below. You see a numbered snapshot of the page (fields/buttons/links with ids). Reply with ONLY JSON:
{"thought":"one short sentence","status":"continue|submitted|captcha|blocked|closed|not_eligible","reason":"short, only if status is not continue","actions":[ ... up to 12 actions ... ]}
Action ops:
- {"op":"fill","id":"e12_ab3","value":"text"} (text, email, tel, number, textarea, richtext; add "enter":true to press Enter after)
- {"op":"select","id":"...","value":"visible option text"} (native select or searchable combobox/autocomplete)
- {"op":"check","id":"..."} / {"op":"uncheck","id":"..."} / {"op":"radio","id":"<the radio option element id>"}
- {"op":"upload","id":"<file input id>","file":"cv_en"|"cv_tr"|"letter_pdf"}
- {"op":"click","id":"..."} (buttons/links: Apply, Next, Continue, Submit, Sign up...)
- {"op":"goto","url":"https://..."} / {"op":"scroll"} / {"op":"wait","ms":2000} / {"op":"press","key":"Enter"}
- {"op":"email_code","id":"<code input id>","hint":"sender or company word"} (waits for a verification/security code email and types it)
- {"op":"email_link","hint":"..."} (waits for a verification link email and opens it)
Rules:
1. Fill EVERY required field (and useful optional ones like LinkedIn, portfolio, GitHub, cover letter) before clicking submit. Upload the resume to resume/CV file inputs (cv_en; cv_tr only for Turkish-language forms). For "cover letter" file inputs use letter_pdf; for cover-letter text areas paste the provided letter.
2a. Location/city fields with autocomplete suggestions: use the select op (value "Mardin") so a suggestion is picked; do not re-fill fields that already show a correct value.
2. Use the candidate facts exactly (name, email, phone, location, links). Phone fields with a separate country selector: select Turkey (+90) and type 5537284232.
3. Answer screening questions truthfully from the profile. Work authorization for US/UK/EU/Canada: No. Sponsorship needed for that country: Yes (only if they ask about sponsorship for working in that country). Remote from Türkiye as contractor: Yes. Years of experience: software/web ≈ 3, React/TypeScript ≈ 3. Expected hourly rate 30 USD (convert sensibly if monthly/annual is asked: ≈ 4800 USD/month, ≈ 57600 USD/year) unless the posted range is lower-bound higher, then use the lower bound. Start date: immediately / 1 week. Notice period: none. Gender/race/veteran/disability: "Prefer not to say"/"Decline" when available. Consent/privacy/terms checkboxes: check them. Marketing opt-ins: leave unchecked. "How did you hear about us": job board or company website.
4. For free-text questions write a concise, specific, true answer (40-120 words) in the form's language (default English), grounded in the real projects in the CV. For "Why us / why this company" questions write a fresh answer about THIS company and role (no greeting, no signature); paste the full cover letter only into cover-letter fields.
5. If the site requires an account to apply: sign up with the candidate email and password "{{NEW_PASSWORD}}" (the system replaces it), then verify via email_code/email_link. If an account for this site already exists (see ACCOUNT), log in with it.
6. Only click the final submit when no required field is empty and no error is shown. After submitting, if a confirmation is visible, return status "submitted".
7. Qualifications described as ideal/preferred/nice-to-have/a plus are NOT requirements: never stop because of them; answer education questions truthfully (Associate degree, Oral and Dental Health, İstanbul Yeni Yüzyıl University, 2024-2026) and continue. Education dropdowns: pick the closest true option (e.g. "Associates Degree"; discipline: Health/Dental/Other). If a required dropdown truly has no fitting option, choose "Other".
8. Conditional questions that do not apply (e.g. "If you are based in the USA, which state?", "If you need a visa...") are NOT a reason to stop: pick the option meaning not applicable (N/A, Not applicable, None, Other, "I'm not based in the US", "Outside the US") or the closest neutral option; if a free-text field, write "Not applicable – based in Türkiye". Return not_eligible ONLY when the job itself clearly requires living/working in a place the candidate is not, OR when an explicit eligibility question (e.g. \"This program is for Bachelor's students or new graduates, are you eligible?\", \"Can you commit to X?\" where the true answer is No) must truthfully be answered No — in that case do not submit.
8b. If a CAPTCHA/human check blocks you, return status "captcha". If the job is closed return "closed". If the form reveals the candidate cannot be hired (e.g. must live in the US and asks to confirm), answer truthfully and return "not_eligible". If it hard-requires something the candidate cannot truthfully provide (face video recording now, a document he doesn't have, SSN), return "blocked" with the reason.
8c. If ANALYSIS has \"followup\": true, this is not a new application but the next step an employer asked for (e.g. create a marketplace account, complete the profile, upload the resume). Complete it fully (sign up with the candidate email, upload cv_en, fill profile fields truthfully) and return \"submitted\" when the profile/step is saved. Tests, video recordings and interviews are for the candidate himself: return \"blocked\" with reason if the next step is one.
9. Never invent facts. Never state you are an AI. Prefer few, correct actions per step; after page-changing clicks you will get a fresh snapshot.
${HONESTY_RULES}`;

function renderSnapshot(s) {
  const lines = [`URL: ${s.url}`, `TITLE: ${clip(s.title, 120)}`];
  if (s.captcha) lines.push('⚠ CAPTCHA/HUMAN CHECK DETECTED ON PAGE');
  if (s.errors?.length) lines.push('ERRORS: ' + s.errors.join(' | '));
  lines.push('FIELDS:');
  for (const f of s.fields || []) {
    let l = `[${f.id}] ${f.kind}${f.required ? '*' : ''} "${clip(f.label, 150)}"`;
    if (f.group) l += ` group="${clip(f.group, 120)}"`;
    if (f.option) l += ` option="${clip(f.option, 80)}"`;
    if (f.checked !== undefined) l += ` checked=${f.checked}`;
    if (f.value) l += ` value="${clip(f.value, 60)}"`;
    if (f.options) l += ` options=[${f.options.slice(0, 25).map((o) => clip(o, 40)).join(' | ')}${f.options.length > 25 ? ' …' : ''}]`;
    if (f.accept) l += ` accept=${f.accept}`;
    if (f.invalid) l += ' INVALID';
    lines.push(l);
  }
  lines.push('BUTTONS: ' + (s.buttons || []).map((b) => `[${b.id}] "${b.text}"${b.disabled ? ' (disabled)' : ''}`).join(' · '));
  if (s.links?.length) lines.push('LINKS: ' + s.links.map((a) => `[${a.id}] "${a.text}" → ${clip(a.href, 90)}`).join(' · '));
  if (s.iframes?.length) lines.push('IFRAMES: ' + s.iframes.slice(0, 5).join(' · '));
  lines.push('PAGE TEXT: ' + clip(s.text, 2200));
  return lines.join('\n');
}

export async function runAgent(env, settings, { page, job, app, letter, rec, ctx, account = null, maxSteps = 28, userActive = false }) {
  const history = [];
  let model = 'agent', stall = 0, lastSig = '', steps = 0, handoffs = 0;
  const answers = {};
  const profile = ctx.profile;
  const intro = `CANDIDATE PROFILE:\n${profile}\n\nJOB: ${job.title} at ${job.company}\nJob URL: ${job.url}\nApply URL: ${job.apply_url || job.url}\nANALYSIS: ${clip(JSON.stringify(ctx.analysis || {}), 1500)}\n\nCOVER LETTER (paste into cover letter text fields):\n${letter}\n\nACCOUNT: ${account ? `existing account on ${account.site}: username/email ${account.username}, password "{{ACCOUNT_PASSWORD}}"` : 'none yet'}${ctx.recipes?.length ? `\n\nNOTES FROM PREVIOUS APPLICATIONS ON THIS SITE:\n${ctx.recipes.map((r) => `- ${r.scope}: ${clip(r.notes, 600)}`).join('\n')}` : ''}${settings.prompt_addenda?.agent ? `\n\nLEARNED RULES:\n${settings.prompt_addenda.agent}` : ''}`;
  while (steps < maxSteps) {
    steps++;
    const s = await snapshot(page);
    const sig = await sha256(`${s.url}|${(s.fields || []).map((f) => `${f.label}=${f.value || f.checked || ''}`).join(';')}|${(s.errors || []).join(';')}|${clip(s.text, 400)}`);
    if (sig === lastSig) { stall++; } else { stall = 0; lastSig = sig; }
    if (stall >= 2 && model === 'agent') { model = 'agent_hard'; rec.note('Takıldı, daha güçlü modele geçildi'); }
    if (stall >= 4) {
      // Aynı hata tekrarlanıyorsa büyük ihtimalle görünmeyen bir doğrulama ya da site sorunu var: sana bırak
      const err = (s.errors || []).join(' | ');
      return err ? { status: 'needs_human', reason: `Site aynı hatayı veriyor: ${clip(err, 200)} (muhtemelen robot doğrulaması)`, steps, answers } : { status: 'failed', reason: 'Sayfa ilerlemiyor (takıldı)', steps, answers };
    }
    if (SUCCESS_RE.test(`${s.title} ${s.text}`) && steps > 1) { await rec.shot(page, 'Başvuru onay ekranı'); return { status: 'submitted', reason: 'Onay metni görüldü', steps, answers }; }
    if (steps === 1 && CLOSED_RE.test(`${s.title} ${clip(s.text, 600)}`)) return { status: 'closed', reason: 'İlan kapanmış', steps, answers };
    const msgs = [
      { role: 'system', content: AGENT_SYS },
      { role: 'user', content: `${intro}\n\nHISTORY (last actions → results):\n${history.slice(-14).join('\n') || '(start)'}\n\nCURRENT PAGE SNAPSHOT (step ${steps}/${maxSteps}):\n${renderSnapshot(s)}` },
    ];
    let o;
    try {
      o = await llm(env, settings, { task: model, json: true, maxTokens: 2200, temperature: 0.1, messages: msgs });
    } catch (e) {
      if (e.name === 'BudgetError') return { status: 'paused', reason: e.message, steps, answers };
      history.push(`(model hatası: ${clip(e.message, 100)})`);
      await sleep(1500);
      continue;
    }
    const d = o.json || {};
    rec.note(`Adım ${steps}: ${clip(d.thought || '', 300)}`, { status: d.status, actions: d.actions });
    if (d.status && d.status !== 'continue') {
      if (d.status === 'submitted') {
        // Modelin iddiasını doğrula: sayfada onay var mı?
        const s2 = await snapshot(page);
        await rec.shot(page, 'Gönderim sonrası');
        if (SUCCESS_RE.test(`${s2.title} ${s2.text}`) || !(s2.fields || []).some((f) => f.required && !f.value && f.kind !== 'file')) return { status: 'submitted', reason: d.reason || d.thought, steps, answers };
        history.push('(submitted dedin ama sayfada onay yok ve boş zorunlu alanlar var; devam et)');
        continue;
      }
      if (d.status === 'captcha') {
        // Panel açıksa ya da Türkiye saatiyle gündüzse (09-24) canlı bağlantıyı Gmail'e yollayıp bekle; gece beklemez
        const trHour = (new Date().getUTCHours() + 3) % 24;
        const wait = (userActive || trHour >= 9) && settings.handoff_wait_minutes > 0 && handoffs < 1 ? settings.handoff_wait_minutes * 60000 : 0;
        const h = await liveHandoff(page, { instructions: `Özgür, ${job.company} başvurusunda robot doğrulaması çıktı. Lütfen doğrulamayı tamamla ve "Done"a bas; gerisini ben yaparım.`, waitMs: wait }).catch(() => null);
        if (h?.url) {
          await addAction(env, { kind: 'handoff', title: `${job.company}: robot doğrulaması (canlı devral)`, detail: wait ? `${Math.round(wait / 60000)} dk bekliyorum. Bağlantıyı açıp doğrulamayı yap, "Done"a bas.` : 'Canlı oturum açık; bağlantı 1 saat geçerli. İstersen panelden "Canlı devral" ile yeniden başlat.', url: h.url, app_id: app.id, job_id: job.id, priority: 1, ttlMs: 3600000, dedupe: 'handoff_' + app.id });
          await env.DB.prepare('UPDATE applications SET live_url=? WHERE id=?').bind(h.url, app.id).run();
          if (wait && !userActive) await alertUser(env, settings, { key: 'handoff_' + app.id, appId: app.id, url: h.url, subject: `Robot doğrulaması: ${job.company} (${Math.round(wait / 60000)} dk bekliyorum)`,
            text: `${job.company} — ${job.title} başvurusunda form dolduruldu ama site "robot değilim" doğrulaması istiyor. Bu doğrulamayı yapay zekâ geçemez.\n\nAşağıdaki bağlantıyı telefondan aç, doğrulamayı yap ve "Done"a bas; ajan kaldığı yerden gönderir. ${Math.round(wait / 60000)} dakika bekliyorum, sonra başvuru "Sana kalanlar"a düşer.` }).catch(() => {});
        }
        if (h?.done) {
          handoffs++;
          await log(env, 'apply', `${job.company}: canlı devralma bekleniyor`, { ref: app.id });
          const r = await h.done;
          history.push(`(insan müdahalesi: ${r.success ? 'tamamlandı' : 'başarısız: ' + (r.reason || '')})`);
          if (r.success) continue;
        }
        // Canlı bağlantı bu oturumla birlikte kapanıyor; eski "canlı devral" işini kapat (yerine "elle tamamla" işi açılır)
        await env.DB.prepare("UPDATE actions SET status='done' WHERE id=?").bind('handoff_' + app.id).run().catch(() => {});
        return { status: 'needs_human', reason: 'CAPTCHA / robot doğrulaması', steps, answers };
      }
      return { status: d.status === 'not_eligible' ? 'not_eligible' : d.status, reason: d.reason || d.thought, steps, answers };
    }
    const actions = Array.isArray(d.actions) ? d.actions.slice(0, 12) : [];
    if (!actions.length) { history.push('(eylem yok)'); continue; }
    for (const a0 of actions) {
      const a = { ...a0 };
      if (typeof a.value === 'string' && a.value.includes('{{NEW_PASSWORD}}')) a.value = a.value.replace('{{NEW_PASSWORD}}', await ctx.newPassword(hostOf(s.url)));
      if (typeof a.value === 'string' && a.value.includes('{{ACCOUNT_PASSWORD}}')) a.value = a.value.replace('{{ACCOUNT_PASSWORD}}', account?.password || '');
      if (ctx.dryRun && a.op === 'click') {
        const b = [...(s.buttons || []), ...(s.links || [])].find((x) => x.id === a.id);
        if (b && /submit|send application|gönder|enviar|absenden|отправ/i.test(b.text)) {
          await rec.shot(page, 'DENEME: son gönderim tıklaması engellendi');
          const s2 = await snapshot(page);
          const empty = (s2.fields || []).filter((f) => f.required && !f.value && f.checked !== true && f.kind !== 'file' && f.kind !== 'radio');
          return { status: 'dry_run', reason: `Form dolduruldu, gönder düğmesine basılmadı. Boş zorunlu alan: ${empty.length}`, steps, answers, emptyRequired: empty.map((f) => f.label) };
        }
      }
      const res = await act(page, a, ctx);
      const shown = a.value && /password|parola|şifre/i.test(JSON.stringify(a0)) ? '••••' : clip(a.value ?? a.url ?? a.file ?? '', 80);
      history.push(`${a.op} ${a.id || ''} ${shown} → ${res}`);
      if ((a.op === 'fill' || a.op === 'select') && a.value && !/password/i.test(res)) {
        const f = (s.fields || []).find((x) => x.id === a.id);
        if (f?.label) answers[clip(f.label, 160)] = clip(String(a.value).replace(ctx.lastPassword || '§§', '••••'), 1200);
      }
      if (a.op === 'click' || a.op === 'goto' || a.op === 'email_link') break; // sayfa değişmiş olabilir: yeniden gözle
    }
    await rec.shot(page, `Adım ${steps}: ${clip(d.thought || actions.map((x) => x.op).join(', '), 180)}`);
  }
  return { status: 'failed', reason: `Adım sınırı (${maxSteps}) doldu`, steps, answers };
}

export { renderSnapshot, SUCCESS_RE, CORE };
