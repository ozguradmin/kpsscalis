// Başvuru malzemeleri: ilana özel ön yazı + doğruluk denetimi, form sorularına cevaplar.
import { llm } from '../lib/llm.js';
import { profileContext, loadFacts, payFor, baseRate, DEFAULT_RATE, HONESTY_RULES, CORE, STYLE_RULES } from '../profile.js';
import { clip, safeJSON, humanize, fixSiteLink } from '../lib/util.js';
import { allRows } from '../lib/db.js';

export async function coverLetter(env, settings, job) {
  const a = safeJSON(job.analysis, {}) || {};
  const lang = job.lang === 'tr' || a.language === 'tr' ? 'Turkish' : 'English';
  const profile = await profileContext(env, { maxFacts: 40 });
  const add = settings.prompt_addenda?.letter ? `\nLearned style rules:\n${settings.prompt_addenda.letter}` : '';
  const sys = `You write short, specific, human job application letters for the candidate below. ${HONESTY_RULES}
${STYLE_RULES}
Style: ${lang}, 120-190 words, warm and direct, no clichés ("I am writing to express"), no placeholders, no subject line, no markdown. Open with ONE concrete link between something specific this company builds (taken from the job/company text) and ONE real project of the candidate; do not open with "Your mission" or praise. Do not just list projects: pick the 2 most relevant and say in one sentence what problem each solved. Do not sign with the name twice (the signature is added separately; end with just "Özgür Güler"). If you mention the portfolio in an English letter write it as ozgurguler.tech/en. Mention 2-3 concrete, true projects that match the job. Mention remote from Türkiye and async-friendly communication only if relevant. End with a simple call to action and the name "Özgür Güler". Never invent stories, incidents or sample bug reports as if they happened; if the job asks for a sample, offer to write one. Do not state pay or weekly hours unless the job asks; then use only PAY TO STATE and the profile's weekly hours.${add}`;
  const user = `${profile}\n\nJOB: ${job.title} at ${job.company}\nLocation: ${job.location || ''}\nPitch angle: ${a.pitch || ''}\nMust-haves: ${(a.must_haves || []).join('; ')}\n\n${clip(job.description, 6000)}`;
  const gen = async (extra = '') => {
    // JSON içinde istenir: bazı modeller düşünme metnini içeriğe sızdırıyor; JSON bunu ayıklar
    const o = await llm(env, settings, { task: 'letter', json: true, maxTokens: 1400, temperature: 0.45, messages: [
      { role: 'system', content: `${sys}\nReturn ONLY JSON: {"letter":"the full letter text with \\n line breaks"}` },
      { role: 'user', content: user + extra }] });
    const t = cleanLetter(o.json?.letter || '');
    if (!validLetter(t)) throw new Error('ön yazı biçimi bozuk: ' + t.slice(0, 80));
    return t;
  };
  let text;
  try { text = await gen(); } catch (e) { text = await gen('\n\nWrite the final letter directly. No analysis, no notes.'); }
  const allowed = allowedTerms(await loadFacts(env), job);
  // CV'de olmayan teknoloji adı ya da kodla yakalanan uydurma (ücret, haftalık saat, saat örtüşmesi, yaşanmış gibi anlatılan olay) varsa bir kez yeniden yaz
  const fake = unsupportedTech(text, profile);
  const flags = letterRedFlags(text, allowed);
  if (fake.length || flags.length) {
    const why = [fake.length ? `do not claim these technologies, the candidate has not used them: ${fake.join(', ')}. Mobile apps were built with React + TypeScript + Capacitor.` : '', ...flags.map((f) => f.fix)].filter(Boolean).join(' ');
    try { text = await gen(`\n\nIMPORTANT: ${why}`); } catch (e) { /* ilk metin */ }
  }
  const warnings = [];
  const check = await truthCheck(env, settings, text);
  if (!check.ok) {
    try { text = await gen(`\n\nIMPORTANT: a previous draft contained unsupported claims: ${check.issues.join('; ')}. Do not repeat them.`); } catch (e) { /* ilk metinle devam */ }
    const c2 = await truthCheck(env, settings, text);
    // Denetçi yeniden yazımdan sonra da itiraz ediyorsa uyarıyla yetinme: işaretlenen iddiaların geçtiği cümleleri çıkar
    if (!c2.ok) { const s = stripClaims(text, c2.issues, profile); text = s.text; warnings.push(...c2.issues.map((i) => (s.removed ? 'çıkarıldı (denetçi): ' : '') + i)); }
  }
  // Son güvence: yeniden yazımdan sonra hâlâ kodla yakalanan uydurma varsa o cümleleri/paragrafı metinden çıkar
  const left = letterRedFlags(text, allowed);
  if (left.length) { text = stripRedFlags(text, allowed); warnings.push(...left.map((f) => `çıkarıldı: ${f.label}`)); }
  if (lang === 'English') text = fixSiteLink(text);
  return { text, lang, warnings };
}

// Yazılabilecek ücret rakamları: bu ilan için hesaplanan ücret (payFor; aralık yoksa temel ücret) ve ilanın kendi aralığı; başka rakam uydurmadır
export function allowedTerms(facts = {}, job = null) {
  const v = (k) => Number(facts[k]?.value ?? facts[k]);
  const rate = v('expected_hourly_rate_usd') || DEFAULT_RATE;
  const pay = payFor(job, rate);
  const posted = [...String(job?.salary || '').matchAll(/(\d[\d,.]*)\s*(k)?/gi)].map((m) => Number(m[1].replace(/,/g, '')) * (m[2] ? 1000 : 1));
  return { rate, pay, amounts: [pay.hourly, pay.monthly, pay.yearly, ...posted].filter((n) => n > 0), hours: v('preferred_weekly_hours') || 35 };
}

const MONEY_RE = /(?:[$€£]\s?\d[\d,.]*\s?k?|\b\d[\d,.]*\s?k?\s?(?:usd|eur|gbp|dollars?|euros?|tl|try)\b)/gi;
const WEEK_HOURS_RE = /\b(\d{1,2})(?:\s?(?:-|–|to)\s?(\d{1,2}))?\s*\+?\s*(?:hours?|hrs?|saat)\s*(?:a|per|each|\/|in a|haftada|weekly)?\s*(?:week|wk|hafta)/gi;
const OVERLAP_RE = /overlap[^.\n]{0,60}(hours?|pacific|eastern|est|pst|cet|us\b|afternoon|morning|weekday)|\b(\d{1,2}|one|two|three|four|five|six|seven|eight)\s+hours?\s+of\s+(\w+\s+)?overlap|\b(pacific|eastern|central) (time|hours)|\b(align|overlap|match|work) (with|during) [^.\n]{0,25}business hours|\boverlaps?\s+(well|nicely|fully|partly|partially|closely|with)\b|\bhours (fall|sit|land) (in|within|into) your\b|saat(lik)? örtüşme/i;
// CV'de olmayan, yaşanmış gibi anlatılan olay/hata hikâyesi (örnek bug raporu, "bir keresinde" anlatısı)
const ANECDOTE_RE = /\b(steps( to reproduce)?|expected( result)?|actual( result)?)\s*:|\bone (bug|issue|time|day|incident)\b[^.\n]{0,40}\b(was|that|i|when)\b|\bI (once|remember)\b|\bbir keresinde\b/i;

function moneyAmount(m) {
  const k = /k\b/i.test(m);
  const n = Number(m.replace(/[^\d.]/g, '').replace(/\.(?=.*\.)/g, ''));
  return k ? n * 1000 : n;
}

// Kod tabanlı uydurma denetimi: LLM denetçisinin kaçırdığı ücret/saat/örtüşme/anekdot uydurmalarını yakalar
export function letterRedFlags(text, allowed = allowedTerms()) {
  const t = String(text || ''), out = [];
  const okAmount = (n) => allowed.amounts.some((a) => Math.abs(n - a) <= a * 0.03); // "$38K" ≈ 38400 gibi yuvarlamalar serbest
  const money = (t.match(MONEY_RE) || []).map(moneyAmount).filter((n) => n && !okAmount(n));
  if (money.length) out.push({ label: `profilde olmayan ücret (${money.join(', ')})`, fix: `Do not state any other pay figure. If pay must be mentioned, say exactly: ${allowed.pay.text}.` });
  const hours = [...t.matchAll(WEEK_HOURS_RE)].filter((m) => Number(m[1]) !== allowed.hours || (m[2] && Number(m[2]) !== allowed.hours));
  if (hours.length) out.push({ label: `profilde olmayan haftalık saat (${hours.map((m) => m[0]).join(', ')})`, fix: `Do not promise weekly hours. The only true figure is up to ${allowed.hours} hours a week.` });
  if (OVERLAP_RE.test(t)) out.push({ label: 'saat dilimi örtüşme vaadi', fix: 'Do not promise time-zone or working-hour overlap. Only say: based in Türkiye (UTC+3), async-friendly.' });
  if (ANECDOTE_RE.test(t)) out.push({ label: 'CV\'de olmayan olay/hata hikâyesi', fix: 'Do not invent stories, incidents, bugs or example reports as if they happened. If the job asks for a sample, offer to write one instead.' });
  return out;
}

// Denetçinin itiraz ettiği iddialar ("Claims Express, not in CV"): sorundaki, profilde hiç geçmeyen kelimeleri bul, o kelimelerin geçtiği cümleleri çıkar
const CLAIM_STOP = new Set(['claims', 'claim', 'claimed', 'states', 'stated', 'says', 'mentions', 'unsupported', 'invented', 'false', 'candidate', 'profile', 'not', 'the', 'and', 'with', 'from', 'that', 'this', 'about', 'daily', 'using', 'used', 'uses', 'experience', 'years', 'year']);
export function stripClaims(text, issues = [], profile = '') {
  const p = String(profile || '').toLowerCase();
  const words = [...new Set(issues.join(' ').toLowerCase().match(/[a-zçğıöşü][a-zçğıöşü.+#-]{3,}/g) || [])]
    .map((w) => w.replace(/[.,-]+$/, '')).filter((w) => w.length >= 4 && !CLAIM_STOP.has(w) && !p.includes(w));
  if (!words.length) return { text, removed: 0 };
  let removed = 0;
  const out = String(text || '').split(/\n{2,}/).map((para) => para.split(/(?<=[.!?])\s+/).filter((s) => {
    const hit = words.some((w) => new RegExp(`(^|[^a-zçğıöşü])${w.replace(/[.+#]/g, '\\$&')}`, 'i').test(s));
    if (hit && !/Özgür Güler\s*$/.test(s)) { removed++; return false; }
    return true;
  }).join(' ')).filter((x) => x.trim()).join('\n\n');
  return { text: out, removed };
}

// Uydurma içeren cümleleri (anekdotta bütün paragrafı) çıkarır; geri kalan metne dokunmaz
export function stripRedFlags(text, allowed = allowedTerms()) {
  const bad = (s) => letterRedFlags(s, allowed).length > 0;
  return String(text || '').split(/\n{2,}/)
    .filter((p) => !ANECDOTE_RE.test(p))
    .map((p) => p.split(/(?<=[.!?])\s+/).filter((s) => !bad(s)).join(' '))
    .filter((p) => p.trim()).join('\n\n');
}

const TECH_TERMS = ['React Native', 'Flutter', 'Swift', 'SwiftUI', 'Kotlin', 'Java', 'Python', 'Django', 'Golang', 'Rust', 'Ruby', 'Rails', 'PHP', 'Laravel', 'Vue', 'Angular', 'Svelte', '.NET', 'C#', 'Kubernetes', 'AWS', 'GraphQL', 'PostgreSQL', 'Postgres', 'MongoDB', 'Docker', 'Terraform', 'Unity', 'Unreal'];
// Metinde geçen, ama adayın profilinde/CV'sinde hiç geçmeyen teknoloji adları ("deneyimim yok" diye geçenler hariç)
export function unsupportedTech(text, profile) {
  const t = String(text || ''), p = String(profile || '').toLowerCase();
  return TECH_TERMS.filter((k) => {
    const re = new RegExp(`(^|[^A-Za-z])${k.replace(/[.#+]/g, (c) => '\\' + c)}([^A-Za-z]|$)`);
    if (!re.test(t) || p.includes(k.toLowerCase())) return false;
    // "X ile deneyimim yok / eager to learn X / new to X" gibi dürüst ifadeler sorun değil
    const i = t.search(re); const ctx = t.slice(Math.max(0, i - 80), i + 80);
    return !/(eager to (learn|deepen)|new to|haven't|have not|not yet|no (professional )?experience|learning|deneyimim yok|öğren)/i.test(ctx);
  });
}

export function validLetter(t) {
  const s = String(t || '').trim();
  if (s.length < 350 || s.length > 2600) return false;
  if (/^(let me|let's|i'll analyze|i will analyze|okay|ok,|here is|here's|the user|we need|analysis|thinking|sure)/i.test(s)) return false;
  if (/\b(the candidate|the user wants|word count|requirements:|constraints:)\b/i.test(s)) return false;
  return true;
}

function cleanLetter(s) {
  return humanize(String(s || '').replace(/^\s*(subject|konu):.*$/gim, '').replace(/\*\*/g, '').replace(/\[(your|company|hiring manager)[^\]]*\]/gi, '')
    // Sayı uydurmasın: mağazada 4 uygulama var (Galaktik Uzay web platformu, mağazada değil; toplam 5 ürün).
    // Sadece mağaza/mobil bağlamında geçen 5+ sayısını 4'e çevir; "toplam beş ürün" doğru, dokunma.
    .split(/((?<=[.!?])\s+)/).map((sen) => /app store|google play|\bstores?\b|mobile|mağaza|mobil/i.test(sen)
      ? sen.replace(/\b(five|six|seven|5|6|7)(\s+(?:mobile\s+|published\s+|live\s+)?(?:products|apps|applications|mobile products))/gi, (m, n, rest) => (/^\d/.test(n) ? '4' : n[0] === n[0].toUpperCase() ? 'Four' : 'four') + rest)
        .replace(/\b(beş|altı|yedi)(\s+(?:mobil\s+)?(?:ürün|uygulama))/gi, (m, n, rest) => (n[0] === n[0].toUpperCase() ? 'Dört' : 'dört') + rest)
      : sen).join('')
    .trim());
}

// Metindeki her iddianın CV'de dayanağı var mı?
export async function truthCheck(env, settings, text) {
  try {
    const o = await llm(env, settings, { task: 'judge', json: true, maxTokens: 500, messages: [
      { role: 'system', content: 'You verify claims in an application text against the candidate CV/facts. Return ONLY JSON {"ok":true|false,"issues":["each unsupported or false claim, short"]}. Reasonable paraphrases and enthusiasm are fine; invented employers, numbers, years, skills, degrees, language fluency or claims of being a native English speaker are NOT. Technologies/frameworks must appear in the CV (e.g. the mobile apps use React + Capacitor; saying React Native is false). The candidate has FOUR apps on the App Store/Google Play; Galaktik Uzay is a web platform. Promises of working-hour overlap with other time zones are not in the CV (false). Weekly hours that differ from preferred_weekly_hours are false. Pay is checked separately; ignore pay figures. Stories, incidents or example bug reports told as if they really happened are false unless they are in the CV.' },
      { role: 'user', content: `CANDIDATE:\n${await profileContext(env, { maxFacts: 40 })}\n\nTEXT:\n${text}` }] });
    const j = o.json || {};
    return { ok: j.ok !== false || !(j.issues || []).length, issues: j.issues || [] };
  } catch (e) { return { ok: true, issues: [] }; }
}

// Formdaki tek bir serbest metin sorusuna doğru ve kısa cevap
export async function answerQuestion(env, settings, job, question, { maxWords = 120 } = {}) {
  const profile = await profileContext(env, { maxFacts: 60 });
  const pay = payFor(job, await baseRate(env));
  const ask = async (extra = '') => humanize((await llm(env, settings, { task: 'answers', maxTokens: 500, temperature: 0.3, messages: [
    { role: 'system', content: `${STYLE_RULES}\nAnswer a job application question for the candidate, in the question's language (default English), max ${maxWords} words, first person, concrete and true. Never invent stories, incidents or sample bug reports as if they happened. ${HONESTY_RULES}` },
    { role: 'user', content: `${profile}\n\nPAY TO STATE (for pay/salary/rate questions, never another figure): ${pay.text}\n\nJOB: ${job.title} at ${job.company}\n\nQUESTION: ${question}${extra}` }] })).content.trim());
  // Kodla yakalanan uydurma (ücret, haftalık saat, örtüşme, olay hikâyesi) varsa bir kez yeniden yaz
  let text = await ask();
  const flags = letterRedFlags(text, allowedTerms(await loadFacts(env), job));
  if (flags.length) { try { text = await ask(`\n\nIMPORTANT: ${flags.map((f) => f.fix).join(' ')}`); } catch (e) { /* ilk cevap */ } }
  return text;
}

// Daha önce başarıyla kullanılmış alan/cevap eşleşmeleri (öğrenilmiş tarifler)
export async function recipesFor(env, scopes) {
  if (!scopes.length) return [];
  const rows = await allRows(env, `SELECT scope, notes, fields, successes, failures FROM recipes WHERE scope IN (${scopes.map(() => '?').join(',')})`, ...scopes);
  return rows;
}

export { CORE };
