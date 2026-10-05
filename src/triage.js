// İlan eleme hattı: 0) kod kuralları → 1) TypeSafe Jev hızlı yargı → 2) ucuz LLM ön eleme → 3) derin analiz + karar.
import { now, DAY, clip, safeJSON, hostOf } from './lib/util.js';
import { log, allRows } from './lib/db.js';
import { llm, jev } from './lib/llm.js';
import { CORE } from './profile.js';
import { FAMOUS } from './sources/index.js';

export const PROFILE_BRIEF = `Candidate: Özgür Güler, lives in Mardin, Türkiye (Turkish citizen), remote only. Turkish native; English intermediate (good in writing, prefers async/written communication; avoids English voice/video calls and face-video recordings). ~3 years building software with AI-assisted workflows: TypeScript, JavaScript, React, Next.js, Node.js, Hono, Capacitor, SQL/D1, Cloudflare Workers, Firebase, REST APIs. Shipped 4 mobile apps (App Store/Google Play), multilingual AI content automation platform, speech-to-text tool, LLM evaluation toolkit. Grew social media accounts to 1M+ followers (content, growth). Associate degree in Oral and Dental Health (2026). Good fits: frontend/fullstack/mobile web dev, AI training/evaluation (esp. Turkish language, coding, dental/health), content/localization in Turkish, QA/testing, automation, social media/content growth. Expected ~30 USD/hour. Starts immediately.`;

const EXEC = /\b(vp|vice president|director|head of|chief|cfo|cto|ceo|coo|cmo|general counsel|principal|staff engineer|distinguished|partner)\b/i;
const IRRELEVANT = /\b(nurse|physician|doctor|pharmac|truck|driver|warehouse|electrician|plumber|mechanic|welder|forklift|cashier|barista|chef|cook|accountant|bookkeep|auditor|tax |attorney|lawyer|paralegal|counsel|underwriter|actuar|payroll|recruiter|talent acquisition|account executive|sdr|bdr|sales development|business development rep|inside sales|field sales|door to door|real estate agent|insurance agent|loan officer|mortgage|teacher|tutor|caregiver|therapist|psycholog|veterinar|construction|architect(?!ure)|civil engineer|mechanical engineer|electrical engineer|hvac)\b/i;
const KEEP = /\b(ai trainer|ai tutor|annotat|evaluat|rater|turkish|türk|dental|dentist|oral health|react|typescript|javascript|frontend|front-end|full.?stack|mobile|capacitor|next\.?js|node|web developer|qa|tester|content|localiz|translat|social media|community)\b/i;
const HARD_GEO_CS = /\b(US|U\.S\.|USA|UK)\b.{0,25}\b(only|[Rr]esidents?|[Cc]itizens?)\b/;
const HARD_GEO = /\b(united states|canada|uk|united kingdom|australia|new zealand|india|brazil|brasil|latam|latin america|mexico|philippines|germany|france|spain|poland|ukraine|israel|singapore|japan|argentina|colombia|chile|peru|south africa|nigeria|kenya|pakistan|vietnam|indonesia)\b.{0,25}\b(only|residents?|citizens?)\b|\bmust (be )?(located|based|reside|live) in\b|\b(w-?2|1099|security clearance|clearance required|green card|us citizen)\b/i;
const OPEN_GEO = /\b(worldwide|anywhere|global(ly)?|emea|europe|türkiye|turkey|istanbul|any country|all countries|international|timezone|time zone|gmt|utc)\b/i;
const SCAM = /(registration fee|training fee|pay (a|the) (fee|deposit)|whatsapp|telegram (hr|interview)|\$\s?\d{1,2},?\d{3}\s?(per|\/)\s?week|no experience needed.*\$\d|crypto(currency)? (deposit|investment)|check (will be )?mailed|purchase (your )?equipment)/i;

function stage0(j, settings) {
  const text = `${j.title}\n${j.location}\n${clip(j.description, 2500)}`;
  if ((settings.blocked_companies || []).some((c) => c && String(j.company || '').toLowerCase().includes(String(c).toLowerCase()))) return 'engelli şirket';
  if ((settings.blocked_domains || []).some((d) => d && hostOf(j.apply_url || j.url).endsWith(d))) return 'engelli alan adı';
  // ATS panoları sadece açık ilanları listeler; oradaki eski tarih 'hâlâ açık' demektir
  // Workable araması da sadece yayındaki ilanları döndürür
  if (j.posted_at && now() - j.posted_at > 45 * DAY && !/^(ats:|workable)/.test(String(j.source || ''))) return 'ilan 45 günden eski';
  if (SCAM.test(text)) return 'dolandırıcılık belirtisi';
  if (/remoteok\.com/i.test(j.apply_url || '')) return 'RemoteOK başvurusu ücretli üyelik istiyor';
  if (EXEC.test(j.title) && !/ai trainer|evaluat|annotat/i.test(j.title)) return 'üst düzey yönetici pozisyonu';
  if (IRRELEVANT.test(j.title) && !KEEP.test(j.title)) return 'alan dışı pozisyon';
  const loc = `${j.location || ''} ${clip(j.description, 1200)}`;
  if ((HARD_GEO.test(loc) || HARD_GEO_CS.test(loc)) && !OPEN_GEO.test(j.location || '')) return 'ülke kısıtlı (Türkiye dışı)';
  if (/^\s*(onsite|on-site|hybrid)\b/i.test(j.location || '') && !/remote/i.test(j.location || '')) return 'ofiste/hibrit';
  return null;
}

async function setJob(env, id, fields) {
  const keys = Object.keys(fields);
  await env.DB.prepare(`UPDATE jobs SET ${keys.map((k, i) => `${k}=?${i + 2}`).join(', ')} WHERE id=?1`).bind(id, ...keys.map((k) => fields[k] == null ? null : typeof fields[k] === 'object' ? JSON.stringify(fields[k]) : fields[k])).run();
}

// ---------- 1) Jev ----------
const JEV_Q = {
  turkey_ok: { type: 'noul', instructions: 'Could a person who lives in Türkiye (Turkish citizen) realistically be hired for this job and do it fully remotely? Answer no if the listing limits candidates to specific countries/regions that exclude Türkiye (e.g. US only, Brazil only, LATAM, EU-only residents, must live in X), requires on-site/hybrid work, or requires work authorization for a country other than Türkiye.' },
  other_language: { type: 'noul', instructions: 'Does the job require fluent/professional use of a human language other than English and Turkish (for example German, Spanish, Portuguese, Polish, Russian, Ukrainian, French) for daily work?' },
  scam: { type: 'noul', instructions: 'Does this listing look like a scam or a low-quality/MLM/commission-only offer (upfront fees, unrealistic pay, chat-app-only recruiting, vague duties)?' },
  fit: { type: 'score', instructions: { candidate: PROFILE_BRIEF, question: 'How well does the `candidate` fit this job (skills, experience level, type of work)?' }, criteria: ['Unrelated field', 'Weak fit: few overlapping skills', 'Partial fit: some core skills match but important gaps', 'Good fit: most core requirements match', 'Excellent fit: core requirements match closely'] },
};

async function jevStage(env, settings, jobs) {
  const results = await Promise.allSettled(jobs.map((j) => jev(env, { title: j.title, company: j.company, location: j.location, description: clip(j.description, 6000) }, JEV_Q)));
  let rej = 0, pass = 0;
  for (let i = 0; i < jobs.length; i++) {
    const j = jobs[i], r = results[i];
    if (r.status !== 'fulfilled') { await setJob(env, j.id, { stage: 2 }); continue; } // Jev yoksa LLM aşamasına geç
    const a = r.value;
    const v = { turkey_ok: +a.turkey_ok.noul.toFixed(2), other_language: +a.other_language.noul.toFixed(2), scam: +a.scam.noul.toFixed(2), fit: +a.fit.score.toFixed(2), fit_conf: +(a.fit.confidence || 0).toFixed(2) };
    let reason = null;
    if (v.turkey_ok < 0.15) reason = `Türkiye'den başvurulamaz (Jev ${v.turkey_ok})`;
    else if (v.other_language > 0.85) reason = `başka dil şart (Jev ${v.other_language})`;
    else if (v.scam > 0.75) reason = `şüpheli ilan (Jev ${v.scam})`;
    else if (v.fit < 1.2 && !OPEN_APP.test(j.title || '')) reason = `uyum çok düşük (Jev ${v.fit}/4)`;
    if (reason) { rej++; await setJob(env, j.id, { stage: 1, status: 'rejected', decision: 'reject', reason, jev: v, fit: Math.round(v.fit * 25) }); }
    else { pass++; await setJob(env, j.id, { stage: 2, jev: v, fit: Math.round(v.fit * 25) }); }
  }
  return { rej, pass };
}

// ---------- 2) hızlı LLM ön eleme ----------
export const TRIAGE_SYS = `You analyze job listings (any language) for ONE candidate who lives in Türkiye (Turkish citizen), speaks Turkish natively and English at intermediate level, and works only remotely as a contractor/employee.
Return ONLY JSON: {"remote_scope":"worldwide|region_includes_turkey|region_excludes_turkey|country_restricted|onsite_or_hybrid|unclear","turkey_ok":true|false|null,"languages_required":["ISO 639-1 codes of human languages needed for the daily work"],"role_family":"frontend|backend|fullstack|mobile|ai_training|data|qa|devops|design|marketing|content|support|sales|product|other","scam":true|false,"fit":0-100,"reason":"max 20 words, Turkish"}
Rules: turkey_ok=true only if someone living in Türkiye can realistically be hired for this remote role. Residence-limited (Brazil only, LATAM, EU only, US only, Ukraine only, "must live in X") => false. If the listing is written in a language and the team communicates in it, include that language. Payment-upfront, WhatsApp-only HR, unrealistic pay => scam=true.
If the title is "Open application (remote)" there is no specific opening: the company hires worldwide and publishes a hiring email. Then judge COMPANY fit instead of role fit: fit 60-85 if the company builds software, web/mobile apps, SaaS, AI or developer tools or is a digital agency; fit < 40 only if its work is unrelated to the candidate (hardware, medicine, pure sales). turkey_ok=true for these unless the text restricts residence.
Fit is for this candidate: ${PROFILE_BRIEF}`;

async function llmStage(env, settings, jobs) {
  let rej = 0, pass = 0;
  const add = settings.prompt_addenda?.triage ? `\nLearned rules:\n${settings.prompt_addenda.triage}` : '';
  await Promise.all(jobs.map(async (j) => {
    try {
      const o = await llm(env, settings, { task: 'triage', json: true, maxTokens: 350, messages: [{ role: 'system', content: TRIAGE_SYS + add }, { role: 'user', content: `TITLE: ${j.title}\nCOMPANY: ${j.company}\nLOCATION: ${j.location}\nSOURCE: ${j.source}\n\n${clip(j.description, 5000)}` }] });
      const g = o.json || {};
      const langs = (Array.isArray(g.languages_required) ? g.languages_required : []).map((x) => String(x).toLowerCase().slice(0, 2));
      const foreign = langs.filter((l) => !['en', 'tr'].includes(l));
      const t = g.turkey_ok === true || g.turkey_ok === 'true';
      const fit = Math.max(0, Math.min(100, Number(g.fit) || 0));
      let reason = null;
      if (g.scam === true || g.scam === 'true') reason = 'şüpheli ilan';
      else if (g.turkey_ok === false || g.turkey_ok === 'false') reason = `Türkiye'den çalışılamıyor (${g.remote_scope || ''})`;
      else if (foreign.length) reason = `dil şartı: ${foreign.join(', ')}`;
      else if (fit < settings.min_fit_review) reason = `uyum düşük (${fit})`;
      const base = { remote_scope: g.remote_scope || null, turkey_ok: t ? 1 : g.turkey_ok === false || g.turkey_ok === 'false' ? 0 : null, langs_required: langs, role_family: g.role_family || 'other', scam: g.scam === true ? 1 : 0, fit };
      if (reason) { rej++; await setJob(env, j.id, { ...base, stage: 2, status: 'rejected', decision: 'reject', reason: `${reason} — ${g.reason || ''}`.slice(0, 300) }); }
      else { pass++; await setJob(env, j.id, { ...base, stage: 3, reason: g.reason || null }); }
    } catch (e) {
      if (e.name === 'BudgetError') throw e;
      await setJob(env, j.id, { stage: 2, reason: 'ön eleme hatası: ' + String(e.message).slice(0, 120) });
    }
  }));
  return { rej, pass };
}

// ---------- 3) derin analiz ----------
const OPEN_APP = /^open application/i;
const ANALYSIS_SYS = `You are a senior recruiter working FOR the candidate. Analyze the job deeply and return ONLY JSON:
{"company":"real company name","title":"clean title","language":"ISO code of the listing","apply_method":"ats_form|email|job_board_account|external_site|unknown","apply_email":"address if applications go by email else null","needs_account":true|false,
"turkey_ok":true|false|null,"location_rule":"short quote/paraphrase of the location/residency rule","languages_required":["iso"],"english_level_needed":"none|basic|intermediate|fluent|native",
"requires_video":true|false,"requires_calls":"none|few|frequent","contract":"contractor|employee|freelance|unknown","seniority":"junior|mid|senior|lead|any","salary":"text or null",
"must_haves":["..."],"candidate_has":["..."],"candidate_missing":["..."],"fit":0-100,"decision":"apply|review|reject","why":"2 sentences in Turkish","pitch":"1-2 sentences in English: the most relevant true angle from the candidate's real background","red_flags":["..."],
"company_scale":"tiny|small|mid|large|famous","hire_chance":0-100}
company_scale: tiny (<20 people, unknown), small (<100), mid (<1000), large, famous (household tech brand that gets thousands of applicants per role). hire_chance: realistic chance this candidate gets an interview, considering competition (famous brands and big AI-training marketplaces get flooded; small unknown companies, Turkish-speaking roles and non-English-market companies hiring worldwide are much better odds).
Decide "apply" only if the candidate can realistically be hired from Türkiye, meets most must-haves, and no fluent language other than English/Turkish is needed. Prefer roles where work is written/async and deliverables are digital. A requirement for recorded face-video or frequent live English calls lowers fit (candidate avoids them) but does not auto-reject AI-training roles with optional video.
OPEN APPLICATIONS (title "Open application (remote)"): there is no listed role; the company hires worldwide and publishes a hiring email. Evaluate COMPANY fit (does it build software/web/mobile/AI/SaaS/devtools or is it a digital agency, would a full-stack TypeScript/React/Node developer with shipped products be useful) and choose decision "apply" with fit 65-85 when it matches; the pitch must name what the company builds and the candidate's most relevant real projects. Reject only if the company's work is unrelated or it needs another language.`;

async function analysisStage(env, settings, jobs) {
  let approved = 0, review = 0, rej = 0;
  const add = settings.prompt_addenda?.analysis ? `\nLearned rules:\n${settings.prompt_addenda.analysis}` : '';
  await Promise.all(jobs.map(async (j) => {
    try {
      const o = await llm(env, settings, { task: 'analysis', json: true, maxTokens: 1200, messages: [
        { role: 'system', content: ANALYSIS_SYS + add },
        { role: 'user', content: `CANDIDATE:\n${PROFILE_BRIEF}\n\nJOB (source ${j.source}, url ${j.url}, apply ${j.apply_url || ''}):\nTITLE: ${j.title}\nCOMPANY: ${j.company}\nLOCATION: ${j.location}\nSALARY: ${j.salary || ''}\n\n${clip(j.description, 9000)}` }] });
      const a = o.json || {};
      const fit = Math.max(0, Math.min(100, Number(a.fit) || 0));
      const foreign = (a.languages_required || []).map((x) => String(x).toLowerCase().slice(0, 2)).filter((l) => !['en', 'tr'].includes(l));
      let status = 'review', reason = a.why || '';
      if (a.turkey_ok === false || foreign.length || a.decision === 'reject' || fit < settings.min_fit_review) { status = 'rejected'; }
      else if (a.decision === 'apply' && fit >= settings.min_fit_apply && ['apply', 'review'].includes(a.decision)) status = 'approved';
      if (a.english_level_needed === 'native') { status = status === 'approved' ? 'review' : status; reason = `${reason} (ana dili İngilizce isteniyor)`; }
      const rw = settings.role_weights?.[j.role_family] ?? 1;
      const sw = settings.source_weights?.[j.source] ?? 1;
      const ageDays = j.posted_at ? (now() - j.posted_at) / DAY : 7;
      const fresh = Math.max(0.5, 1.2 - ageDays / 30);
      const async = settings.prefer_async_roles && (a.requires_calls === 'frequent' || a.requires_video) ? 0.8 : 1;
      // Rekabet: ünlü şirketler geri, küçük/bilinmeyen ve Türkiye'ye açık olanlar öne
      const famous = FAMOUS.test(`${a.company || j.company}`) ? 'famous' : a.company_scale;
      const scale = { tiny: 1.35, small: 1.3, mid: 1, large: 0.7, famous: 0.45 }[famous] ?? 1;
      const chance = 0.6 + Math.max(0, Math.min(100, Number(a.hire_chance) || 40)) / 125;
      const local = j.source === 'workable_tr' || a.turkey_ok === true && /türk|turkey|turkish|istanbul|ankara|izmir/i.test(`${j.location} ${a.location_rule || ''}`) ? 1.25 : 1;
      const priority = +(fit * rw * sw * fresh * async * scale * chance * local).toFixed(2);
      if (famous === 'famous' && status === 'approved') { status = 'review'; reason = `${reason} (ünlü şirket: rekabet çok yüksek, otomatik başvuru yerine incelemede)`; }
      if (status === 'approved') approved++; else if (status === 'review') review++; else rej++;
      await setJob(env, j.id, { stage: 4, status, decision: a.decision || null, reason: clip(reason, 400), fit, priority, analysis: a,
        company: a.company && a.company.length < 80 ? a.company : j.company, langs_required: a.languages_required || null });
    } catch (e) {
      if (e.name === 'BudgetError') throw e;
      await setJob(env, j.id, { reason: 'analiz hatası: ' + String(e.message).slice(0, 120) });
    }
  }));
  return { approved, review, rej };
}

// Bir cron turunda: önce kurallar, sonra Jev, sonra LLM'ler. Yeni ve umut vadeden ilanlar önce.
export async function triageTick(env, settings, { n0 = 400, n1 = 120, n2 = 30, n3 = 10 } = {}) {
  const stats = {};
  // 0) kural
  const fresh = await allRows(env, "SELECT id, source, title, company, location, description, posted_at, apply_url, url FROM jobs WHERE status='new' AND stage=0 ORDER BY discovered_at DESC LIMIT ?", n0);
  let r0 = 0;
  const upd = [];
  for (const j of fresh) {
    const why = stage0(j, settings);
    if (why) { r0++; upd.push(env.DB.prepare("UPDATE jobs SET stage=0, status='rejected', decision='reject', reason=? WHERE id=?").bind(why, j.id)); }
    else upd.push(env.DB.prepare('UPDATE jobs SET stage=? WHERE id=?').bind(settings.jev_enabled ? 1 : 2, j.id));
  }
  for (let i = 0; i < upd.length; i += 80) await env.DB.batch(upd.slice(i, i + 80));
  stats.rules = { seen: fresh.length, rejected: r0 };
  // 1) Jev — başlığı adaya yakın olanlar öne
  const s1 = await allRows(env, `SELECT id, title, company, location, description FROM jobs WHERE status='new' AND stage=1 ORDER BY (CASE WHEN title LIKE '%react%' OR title LIKE '%front%' OR title LIKE '%full%' OR title LIKE '%AI %' OR title LIKE '%Turkish%' OR title LIKE '%mobile%' OR title LIKE '%typescript%' OR title LIKE '%javascript%' OR title LIKE '%content%' THEN 0 ELSE 1 END), discovered_at DESC LIMIT ?`, n1);
  if (s1.length) stats.jev = await jevStage(env, settings, s1);
  // 2) LLM ön eleme
  const s2 = await allRows(env, "SELECT id, title, company, location, description, source FROM jobs WHERE status='new' AND stage=2 ORDER BY COALESCE(fit,50) DESC, discovered_at DESC LIMIT ?", n2);
  if (s2.length) stats.llm = await llmStage(env, settings, s2);
  // 3) derin analiz
  const s3 = await allRows(env, "SELECT id, title, company, location, description, source, url, apply_url, salary, posted_at, role_family FROM jobs WHERE status='new' AND stage=3 ORDER BY COALESCE(fit,50) DESC, discovered_at DESC LIMIT ?", n3);
  if (s3.length) stats.analysis = await analysisStage(env, settings, s3);
  if (fresh.length || s1.length || s2.length || s3.length) await log(env, 'triage', `Eleme: kural ${r0}/${fresh.length} ret · Jev ${stats.jev ? `${stats.jev.pass} geçti/${stats.jev.rej} ret` : '-'} · LLM ${stats.llm ? `${stats.llm.pass}/${stats.llm.rej}` : '-'} · analiz ${stats.analysis ? `${stats.analysis.approved} onay, ${stats.analysis.review} inceleme, ${stats.analysis.rej} ret` : '-'}`, { data: stats });
  return stats;
}

// Tek bir ilanı baştan analiz et (panelden / beyinden)
export async function reanalyze(env, settings, id) {
  await env.DB.prepare("UPDATE jobs SET status='new', stage=3 WHERE id=?").bind(id).run();
  const s3 = await allRows(env, 'SELECT id, title, company, location, description, source, url, apply_url, salary, posted_at, role_family FROM jobs WHERE id=?', id);
  return analysisStage(env, settings, s3);
}

export { CORE };
