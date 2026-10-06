// Tarayıcı ajanı: sayfayı gözler, modele sorar, eylemleri uygular; başvuru gönderilene ya da engel çıkana kadar döner.
import { llm, jev } from '../lib/llm.js';
import { act, snapshot, liveHandoff, withTimeout } from './browser.js';
import { STYLE_RULES } from '../profile.js';
import { HONESTY_RULES, CORE } from '../profile.js';
import { clip, now, sleep, hostOf, sha256 } from '../lib/util.js';
import { log, addAction } from '../lib/db.js';
import { alertUser } from '../mail.js';

const SUCCESS_RE = /(thank(s| you) for (your )?(applying|application|submitting|interest)|application (has been |was )?(received|submitted|sent|complete)|we('ve| have) received your application|successfully (submitted|applied)|your application is (in|complete)|başvurunuz (alındı|iletildi|tamamlandı)|candidatura (enviada|recebida)|solicitud (enviada|recibida)|bewerbung (wurde )?(erfolgreich )?(versendet|übermittelt|eingegangen)|danke für deine bewerbung|merci pour votre candidature|отклик отправлен|спасибо за отклик|dziękujemy za (aplikację|zgłoszenie))/i;
// Profil/hesap tamamlama ifadeleri sadece takip (profil doldurma) görevlerinde başarı sayılır: WaaS şirket listesinde de eski bir "Thanks for updating your profile" bandı duruyor
const PROFILE_OK_RE = /(thanks for updating your profile|profile (has been |was )?(saved|updated|completed)|your profile is (complete|live))/i;
const SOURCE_NAMES = { remote_cos: 'Remote In Tech company directory', yc: 'Y Combinator Work at a Startup', hn: 'Hacker News "Who is hiring"', himalayas: 'Himalayas', djinni: 'Djinni', workable_tr: 'Workable', workable: 'Workable', torre: 'Torre', getonbrd: 'Get on Board', followup: 'your email to me' };
const NOT_ELIGIBLE_RE = /(your profile does not meet some of the requirements|(ukrainian|russian|polish|german) (native|c1|c2|b2)[^\n]{0,10}\n?\s*not specified in your profile|we (only|currently only) (hire|accept|consider) (candidates|applicants) (from|based in)|not accepting applications from your (country|location|region))/i;
const STRONG_CLOSED_RE = /(the job ad is no longer active|this (job|position|vacancy) is no longer (active|available|open)|вакансія (більше )?не активна|вакансия (больше )?не активна|ilan artık aktif değil)/i;
const CLOSED_RE = /(no longer (accepting|available)|position (has been )?(filled|closed)|job (is )?(closed|expired|not found)|this job has expired|ilan yayından kaldırıldı|page not found|404)/i;

const AGENT_SYS = `You are an expert web agent that completes and submits a job application in a real browser for the candidate below. You see a numbered snapshot of the page (fields/buttons/links with ids). Reply with ONLY JSON:
{"thought":"one short sentence","status":"continue|submitted|captcha|blocked|closed|not_eligible|email","reason":"short, only if status is not continue","email":"only with status email: the address to send the application to","actions":[ ... up to 12 actions ... ]}
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
3. Answer screening questions truthfully from the profile. Work authorization for US/UK/EU/Canada: No. Sponsorship needed for that country: Yes (only if they ask about sponsorship for working in that country). Remote from Türkiye as contractor: Yes. Years of experience: software/web ≈ 3, React/TypeScript ≈ 3. Expected hourly rate 30 USD (convert sensibly if monthly/annual is asked: ≈ 4800 USD/month, ≈ 57600 USD/year) unless the posted range is lower-bound higher, then use the lower bound. Start date: immediately / 1 week. Notice period: none. Gender/race/veteran/disability: "Prefer not to say"/"Decline" when available. Consent/privacy/terms checkboxes: check them. Marketing opt-ins: leave unchecked. "How did you hear about us": name the real source given as JOB SOURCE in the intro (e.g. "Remote In Tech company directory", "Y Combinator Work at a Startup", "Hacker News Who is Hiring", "Himalayas", "Djinni"), otherwise "company website". Seniority/level questions: choose Junior and/or Mid-level only (about 3 years of experience) — never Senior, Lead, Principal or Staff.
4. For free-text questions write a concise, specific, true answer (40-120 words) in the form's language (default English), grounded in the real projects in the CV. For "Why us / why this company" questions write a fresh answer about THIS company and role (no greeting, no signature); paste the full cover letter only into cover-letter fields.
5. If the site requires an account to apply: sign up with the candidate email and password "{{NEW_PASSWORD}}" (the system replaces it), then verify via email_code/email_link. If an account for this site already exists (see ACCOUNT), log in with it.
6. Only click the final submit when no required field is empty and no error is shown. After submitting, if a confirmation is visible, return status "submitted".
7. Qualifications described as ideal/preferred/nice-to-have/a plus are NOT requirements: never stop because of them; answer education questions truthfully (Associate degree, Oral and Dental Health, İstanbul Yeni Yüzyıl University, 2024-2026) and continue. Education dropdowns: pick the closest true option (e.g. "Associates Degree"; discipline: Health/Dental/Other). If a required dropdown truly has no fitting option, choose "Other".
8. Conditional questions that do not apply (e.g. "If you are based in the USA, which state?", "If you need a visa...") are NOT a reason to stop: pick the option meaning not applicable (N/A, Not applicable, None, Other, "I'm not based in the US", "Outside the US") or the closest neutral option; if a free-text field, write "Not applicable – based in Türkiye". Return not_eligible ONLY when the job itself clearly requires living/working in a place the candidate is not, OR when an explicit eligibility question (e.g. \"This program is for Bachelor's students or new graduates, are you eligible?\", \"Can you commit to X?\" where the true answer is No) must truthfully be answered No — in that case do not submit.
8b. If a CAPTCHA/human check blocks you, return status "captcha". If the job is closed return "closed". If the form reveals the candidate cannot be hired (e.g. must live in the US and asks to confirm), answer truthfully and return "not_eligible". If it hard-requires something the candidate cannot truthfully provide (face video recording now, a document he doesn't have, SSN), return "blocked" with the reason.
8c. If ANALYSIS has \"followup\": true, this is not a new application but the next step an employer asked for (e.g. create a marketplace account, complete the profile, upload the resume). Complete it fully (sign up with the candidate email, upload cv_en, fill profile fields truthfully) and return \"submitted\" when the profile/step is saved. Tests, video recordings and interviews are for the candidate himself: return \"blocked\" with reason if the next step is one.
8d. Questions that test knowledge of the company's own product/game/domain (e.g. "Up to how many players can play X?", "What is our main feature?") are not about the candidate: answer them correctly from the job text, the page, or well-known public knowledge (you may open the company's site in the same tab only if the form state is safe; prefer answering directly). Never leave such a required field empty.
8e. If this page is not an application form but a job post that links elsewhere (an "Apply" link, a careers page, a form link), follow the link with goto/click instead of stopping.
8i. Any free text you type (motivation, "why us", summaries): follow these rules.
${STYLE_RULES}
8h. If the only way to apply is by email (a mailto link or "send your CV to x@y" and no form), return status "email" with that address in "email"; the system then emails the cover letter and CV itself. If both a form link and an email exist, use the form; but if that form is blocked (needs a Google/Microsoft sign-in, a captcha you cannot pass, or is closed), fall back to status "email" with the address instead of "blocked". Go back (goto the previous page) to find the address if needed.
8f. Y Combinator Work at a Startup (workatastartup.com/jobs/N): the candidate is already logged in. Click "Apply", put the cover letter (plain text, no greeting placeholders) into the message box, click "Send". When the button then reads "Applied", the application is done: return status "submitted". If you see a login form instead, return status "blocked" with reason "YC oturumu düştü" (never type a password there).
If clicking Send changes nothing on WaaS, YC's weekly limit (5 applications/week) may be reached: return status "blocked" with reason "YC haftalık 5 başvuru sınırı".
8j. CAPTCHA/human-check: never report status "captcha" while form fields are still empty. Fill EVERYTHING first (all fields, uploads, questions), then submit; only if the captcha blocks submission report "captcha".
8g. A cookie/consent banner or dark backdrop can cover buttons; if a click does nothing, look for "Decline all"/"Accept all" and click it first.
9. Never invent facts about the candidate. Never make up usernames, profile URLs or accounts (e.g. a game/community profile link): leave such optional fields empty, and for required ones write "N/A" or use only links listed in the profile. Never state you are an AI. Prefer few, correct actions per step; after page-changing clicks you will get a fresh snapshot.
${HONESTY_RULES}`;

function renderSnapshot(s) {
  const lines = [`URL: ${s.url}`, `TITLE: ${clip(s.title, 120)}`];
  if (s.captcha) {
    const empty = (s.fields || []).filter((f) => !f.value && !f.checked && f.kind !== 'file').length;
    lines.push(empty >= 2
      ? 'Note: this page loads a captcha widget, which is normally checked only when you submit. Fill the whole form first; report "captcha" only if a visible challenge blocks submission.'
      : '⚠ CAPTCHA/HUMAN CHECK on page (form looks filled): if submit does not go through, report status "captcha".');
  }
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
  const okText = (t) => SUCCESS_RE.test(t) || (job.source === 'followup' && PROFILE_OK_RE.test(t));
  const history = [];
  let model = 'agent', stall = 0, lastSig = '', steps = 0, handoffs = 0;
  const answers = {};
  const profile = ctx.profile;
  const intro = `CANDIDATE PROFILE:\n${profile}\n\nJOB: ${job.title} at ${job.company}\nJOB SOURCE: ${SOURCE_NAMES[job.source] || job.source || 'company website'}\nJob URL: ${job.url}\nApply URL: ${job.apply_url || job.url}\nANALYSIS: ${clip(JSON.stringify(ctx.analysis || {}), 1500)}\n\nCOVER LETTER (paste into cover letter text fields):\n${letter}\n\nACCOUNT: ${account ? `existing account on ${account.site}: username/email ${account.username}, password "{{ACCOUNT_PASSWORD}}"` : 'none yet'}${ctx.recipes?.length ? `\n\nNOTES FROM PREVIOUS APPLICATIONS ON THIS SITE:\n${ctx.recipes.map((r) => `- ${r.scope}: ${clip(r.notes, 600)}`).join('\n')}` : ''}${settings.prompt_addenda?.agent ? `\n\nLEARNED RULES:\n${settings.prompt_addenda.agent}` : ''}`;
  // İnsanı çağır: canlı tarayıcı bağlantısını Gmail'e ve panele gönderir, bekler; sen geçince ajan kaldığı yerden devam eder.
  // Dönüş: 'continue' (devam et), 'submitted' (sen gönderdin), 'gave_up' (beklenmedi / süre doldu)
  const askHuman = async (kind, why) => {
    const trHour = (new Date().getUTCHours() + 3) % 24;
    // Sen "Canlı devral" dediysen her zaman; değilse Türkiye saatiyle 09-24 arası (gece seni uyandırmaz)
    const wait = (userActive || trHour >= 9) && settings.handoff_wait_minutes > 0 && handoffs < 2 ? settings.handoff_wait_minutes * 60000 : 0;
    // Cloudflare Turnstile ("Verify you are human") sunucu tarayıcısını insan tıklasa da geçirmiyor: canlı devral yerine kendi tarayıcından gönder
    const turnstile = await page.evaluate(() => !!document.querySelector('iframe[src*="challenges.cloudflare.com"], [class*="cf-turnstile"], #challenge-stage, input[name="cf-turnstile-response"]') || /verify you are human|bir insan olduğunuzu doğrulay/i.test(document.body.innerText)).catch(() => false);
    if (turnstile) return 'own_browser';
    if (!wait) return 'gave_up';
    const before = await snapshot(page);
    // Robot doğrulaması genelde formun sonunda: form boşken seni çağırma, önce kendisi doldursun (bir kez hatırlatır)
    const emptyFill = (before.fields || []).filter((f) => !f.value && !f.checked && /^(text|email|tel|textarea|url|number|search|)$/.test(f.type || '') && f.kind !== 'file').length;
    if (kind === 'captcha' && !ctx.fillFirstNudged && (emptyFill >= 2 || Object.keys(answers).length < 2)) {
      ctx.fillFirstNudged = true;
      history.push('(ÖNCE formu doldur: robot doğrulaması formun sonunda/gönderirken çıkar. Tüm alanları, CV yüklemesini ve soruları bitir; doğrulamayı ancak form tamamen doluyken ve gönder düğmesi doğrulama yüzünden çalışmıyorsa bildir.)');
      return 'continue';
    }
    const what = { captcha: 'robot doğrulaması var', stuck: 'bir yerde takıldım', blocked: 'beni durduran bir engel var' }[kind] || 'yardımın gerekiyor';
    const h = await liveHandoff(page, { instructions: `Özgür, ${job.company} başvurusunda ${what}. O kısmı geç; ben kendiliğinden devam ederim ("Done"a basman da olur).`, waitMs: wait }).catch(() => null);
    if (!h?.url || !h.done) return 'gave_up';
    handoffs++;
    const min = Math.round(wait / 60000);
    await addAction(env, { kind: 'handoff', title: `${job.company}: canlı devral (${what})`, detail: `${min} dk bekliyorum. Bağlantıyı aç, takıldığım yeri geç; sonrasını ben yaparım.`, url: h.url, app_id: app.id, job_id: job.id, priority: 1, ttlMs: wait + 120000, dedupe: 'handoff_' + app.id });
    await env.DB.prepare('UPDATE applications SET live_url=? WHERE id=?').bind(h.url, app.id).run();
    await alertUser(env, settings, { key: `handoff_${app.id}_${now()}`, appId: app.id, url: h.url, subject: `Canlı devral: ${job.company} (${min} dk bekliyorum)`,
      text: `${job.company}, ${job.title}\nDurum: ${what}. ${clip(why, 220)}\n\nAşağıdaki "Canlı tarayıcı" bağlantısını aç. Ajanın açık tuttuğu sayfayı göreceksin; sadece takıldığı kısmı yap (doğrulama kutucuğu, bulmaca, giriş ya da çalışmayan düğme). Formun geri kalanını ajan doldurdu ve doldurmaya devam edecek. Bitince "Done"a bas; robot doğrulamasında basmana gerek yok, geçtiğini kendisi görür. ${min} dakika bekliyorum.` }).catch(() => {});
    await log(env, 'apply', `${job.company}: canlı devralma bekleniyor (${what})`, { ref: app.id });
    let stop = false;
    const watch = (async () => {
      let clear = 0;
      while (!stop) {
        await sleep(5000);
        if (stop) return null;
        const s3 = await snapshot(page);
        if (okText(`${s3.title} ${s3.text}`)) return { success: true, submitted: true, reason: 'onay ekranı göründü' };
        if (kind === 'captcha' && before.captcha && !s3.error && !s3.captcha) { if (++clear >= 2) return { success: true, reason: 'doğrulama geçildi (otomatik algılandı)' }; } else clear = 0;
      }
      return null;
    })();
    const w0 = Date.now();
    const r = await Promise.race([h.done, watch.then((x) => x || h.done)]);
    ctx.waitedMs = (ctx.waitedMs || 0) + (Date.now() - w0); // insanı beklerken geçen süre toplam sınıra sayılmaz
    stop = true;
    await env.DB.prepare("UPDATE actions SET status='done' WHERE id=?").bind('handoff_' + app.id).run().catch(() => {});
    await rec.shot(page, r?.success ? 'Sen devraldın, devam' : 'Bekleme bitti').catch(() => {});
    if (r?.submitted) return 'submitted';
    if (r?.success) { history.push(`(Özgür canlı devraldı ve ${what.replace('var', 'geçildi')}; sayfaya yeniden bak ve kaldığın yerden devam et)`); await ctx.saveSession?.(page).catch(() => {}); return 'continue'; }
    return 'gave_up';
  };
  const started = Date.now();
  while (steps < maxSteps) {
    steps++;
    // Toplam süre sınırı (insan beklemesi hariç): 25 dakikayı geçen başvuru takılmış demektir
    if (Date.now() - started - (ctx.waitedMs || 0) > 25 * 60000) return { status: 'failed', reason: 'Başvuru 25 dakikayı aştı (sayfa yanıt vermiyor)', steps, answers };
    const s = await snapshot(page);
    const sig = await sha256(`${s.url}|${(s.fields || []).map((f) => `${f.label}=${f.value || f.checked || ''}`).join(';')}|${(s.errors || []).join(';')}|${clip(s.text, 400)}`);
    if (sig === lastSig) { stall++; } else { stall = 0; lastSig = sig; }
    if (stall >= 2 && model === 'agent') { model = 'agent_hard'; rec.note('Takıldı, daha güçlü modele geçildi'); }
    if (stall >= 4) {
      // Aynı yerde takıldı: önce seni çağırır (canlı tarayıcı bağlantısı), sen o adımı geçince kaldığı yerden devam eder
      const err = (s.errors || []).join(' | ');
      const r = await askHuman('stuck', err ? `Site aynı hatayı veriyor: ${clip(err, 200)}` : 'Sayfa ilerlemiyor; bir düğme ya da alan çalışmıyor olabilir');
      if (r === 'continue') { stall = 0; lastSig = ''; continue; }
      if (r === 'submitted') return { status: 'submitted', reason: 'Sen devraldıktan sonra onay ekranı görüldü', steps, answers };
      if (r === 'own_browser') return { status: 'needs_human', ownBrowser: true, reason: 'Cloudflare robot doğrulaması sunucu tarayıcısını kabul etmiyor; kendi tarayıcından göndermen gerekiyor', steps, answers };
      return err ? { status: 'needs_human', reason: `Site aynı hatayı veriyor: ${clip(err, 200)} (muhtemelen robot doğrulaması)`, steps, answers } : { status: 'failed', reason: 'Sayfa ilerlemiyor (takıldı)', steps, answers };
    }
    // Gönder düğmesi kapalı ve sayfada Cloudflare doğrulaması var: o düğme doğrulama geçmeden açılmaz; kendi tarayıcından gönderilecek
    if (steps > 2 && (s.buttons || []).some((b) => b.disabled && /submit|apply|send|gönder|başvur/i.test(b.text || ''))) {
      const ts = await page.evaluate(() => !!document.querySelector('iframe[src*="challenges.cloudflare.com"], [class*="cf-turnstile"], input[name="cf-turnstile-response"]')).catch(() => false);
      if (ts) return { status: 'needs_human', ownBrowser: true, reason: 'Form dolu ama Gönder düğmesi Cloudflare doğrulaması geçmeden açılmıyor; kendi tarayıcından göndermen gerekiyor', steps, answers };
    }
    if (okText(`${s.title} ${s.text}`) && steps > 1) { await rec.shot(page, 'Başvuru onay ekranı'); return { status: 'submitted', reason: 'Onay metni görüldü', steps, answers }; }
    if (steps === 1 && (CLOSED_RE.test(`${s.title} ${clip(s.text, 600)}`) || STRONG_CLOSED_RE.test(s.text || ''))) return { status: 'closed', reason: 'İlan kapanmış', steps, answers };
    if (steps <= 2 && NOT_ELIGIBLE_RE.test(s.text || '') && ![...(s.buttons || []), ...(s.links || [])].some((b) => /^\s*(apply|apply now|відгукнутися|откликнуться)\b/i.test(b.text || ''))) return { status: 'not_eligible', reason: 'Site profilin ilan şartlarını (ülke/İngilizce seviyesi) karşılamadığını söylüyor', steps, answers };
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
    const pwIds = new Set((s.fields || []).filter((f) => f.type === 'password' || /pass ?word|şifre|parola|passwort|contraseña/i.test(f.label || '')).map((f) => f.id));
    rec.note(`Adım ${steps}: ${clip(d.thought || '', 300)}`, { status: d.status, actions: (d.actions || []).map((a) => (pwIds.has(a.id) && a.value ? { ...a, value: '••••' } : a)) });
    if (d.status && d.status !== 'continue') {
      if (d.status === 'submitted') {
        // Modelin iddiasını doğrula: sayfada onay var mı?
        const s2 = await snapshot(page);
        await rec.shot(page, 'Gönderim sonrası');
        if (okText(`${s2.title} ${s2.text}`)) return { status: 'submitted', reason: d.reason || d.thought, steps, answers };
        // YC Work at a Startup: gönderilince "Apply" düğmesi "Applied" olur (ayrı onay metni yok)
        if (/workatastartup\.com\/jobs\//.test(s2.url || page.url()) && (s2.buttons || []).some((b) => /^applied$/i.test(String(b.text).trim()))) return { status: 'submitted', reason: 'WaaS: düğme "Applied" oldu', steps, answers };
        // Kalıp tutmadıysa Jev hakemlik yapar (browser-use/jev-ultrafast'taki "hedefe ulaşıldı mı" yargısı gibi)
        let conf = null;
        try {
          const j = await jev(env, { page_title: s2.title, url: s2.url, page_text: clip(s2.text, 3000), empty_required_fields: (s2.fields || []).filter((f) => f.required && !f.value).map((f) => f.label).slice(0, 12) }, {
            submitted: { type: 'noul', instructions: 'Does this page show that a job application was successfully submitted/received (a confirmation or thank-you state), rather than a form still waiting to be completed or an error?' } });
          conf = j.submitted.noul;
        } catch (e) { /* Jev yoksa eski kurala düş */ }
        const emptyReq = (s2.fields || []).some((f) => f.required && !f.value && f.kind !== 'file');
        if (conf != null ? conf >= 0.6 || (conf >= 0.3 && !emptyReq) : !emptyReq) { rec.note(`Gönderim doğrulandı (Jev ${conf ?? '-'})`); return { status: 'submitted', reason: d.reason || d.thought, steps, answers }; }
        history.push(`(submitted dedin ama sayfa onay göstermiyor${conf != null ? ` (Jev ${conf.toFixed(2)})` : ''}${emptyReq ? ', boş zorunlu alanlar var' : ''}; hata mesajlarına bak ve devam et)`);
        continue;
      }
      // Robot doğrulaması, ya da insan gerektiren engel (giriş, doğrulama, garip hata): canlı devralma iste
      const humanish = /captcha|robot|human|verif|doğrula|turnstile|hcaptcha|recaptcha|login|sign ?in|giriş|blocked|engel/i.test(`${d.reason || ''} ${d.thought || ''}`);
      if (d.status === 'captcha' || ((d.status === 'blocked' || d.status === 'needs_human') && humanish)) {
        const r = await askHuman(d.status === 'captcha' || /captcha|robot|human|turnstile|hcaptcha|recaptcha/i.test(d.reason || '') ? 'captcha' : 'blocked', d.reason || d.thought || '');
        if (r === 'continue') continue;
        if (r === 'submitted') return { status: 'submitted', reason: 'Sen devraldıktan sonra onay ekranı görüldü', steps, answers };
        if (r === 'own_browser') return { status: 'needs_human', ownBrowser: true, reason: 'Cloudflare robot doğrulaması sunucu tarayıcısını kabul etmiyor; kendi tarayıcından göndermen gerekiyor', steps, answers };
        return { status: 'needs_human', reason: d.status === 'captcha' ? 'CAPTCHA / robot doğrulaması' : clip(d.reason || 'İnsan gerektiren engel', 200), steps, answers };
      }
      return { status: d.status === 'not_eligible' ? 'not_eligible' : d.status, reason: d.reason || d.thought, steps, answers, email: d.email || null };
    }
    const actions = Array.isArray(d.actions) ? d.actions.slice(0, 12) : [];
    if (!actions.length) { history.push('(eylem yok)'); continue; }
    for (const a0 of actions) {
      const a = { ...a0 };
      // Uydurma bağlantı engeli: profilde olmayan bir siteye ait profil/URL yazılamaz (ör. oyun profili)
      if ((a.op === 'fill' || a.op === 'type') && /^\s*https?:\/\//i.test(String(a.value || ''))) {
        let host = ''; try { host = new URL(String(a.value).trim()).hostname.replace(/^www\./, ''); } catch (e) { /* */ }
        const known = /(^|\.)(ozgurguler\.tech|linkedin\.com|github\.com|apps\.apple\.com|play\.google\.com|huggingface\.co)$/i.test(host) || String(ctx.profile || '').includes(host);
        if (!known) { history.push(`(${a.value} profilde yok; uydurma bağlantı yazılmaz — alan zorunluysa "N/A" yazıldı)`); a.value = 'N/A'; }
      }
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
      const res = await withTimeout(act(page, a, ctx), a.op === 'email_code' || a.op === 'email_link' ? 240000 : 60000, `${a.op} eylemi`).catch((e) => `${a.op} hata: ${e.message}`);
      const shown = a.value && /password|parola|şifre/i.test(JSON.stringify(a0)) ? '••••' : clip(a.value ?? a.url ?? a.file ?? '', 80);
      history.push(`${a.op} ${a.id || ''} ${shown} → ${res}`);
      if ((a.op === 'fill' || a.op === 'select') && a.value && !/password/i.test(res)) {
        const f = (s.fields || []).find((x) => x.id === a.id);
        const secret = f?.type === 'password' || /pass ?word|şifre|parola|passwort|contraseña|mot de passe/i.test(f?.label || '');
        if (f?.label) answers[clip(f.label, 160)] = secret ? '••••' : clip(String(a.value).replace(ctx.lastPassword || '§§', '••••'), 1200);
      }
      if (a.op === 'click' || a.op === 'goto' || a.op === 'email_link') break; // sayfa değişmiş olabilir: yeniden gözle
    }
    await rec.shot(page, `Adım ${steps}: ${clip(d.thought || actions.map((x) => x.op).join(', '), 180)}`);
  }
  return { status: 'failed', reason: `Adım sınırı (${maxSteps}) doldu`, steps, answers };
}

export { renderSnapshot, SUCCESS_RE, CORE };
