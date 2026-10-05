// Başvuru malzemeleri: ilana özel ön yazı + doğruluk denetimi, form sorularına cevaplar.
import { llm } from '../lib/llm.js';
import { profileContext, HONESTY_RULES, CORE } from '../profile.js';
import { clip, safeJSON } from '../lib/util.js';
import { allRows } from '../lib/db.js';

export async function coverLetter(env, settings, job) {
  const a = safeJSON(job.analysis, {}) || {};
  const lang = job.lang === 'tr' || a.language === 'tr' ? 'Turkish' : 'English';
  const profile = await profileContext(env, { maxFacts: 40 });
  const add = settings.prompt_addenda?.letter ? `\nLearned style rules:\n${settings.prompt_addenda.letter}` : '';
  const sys = `You write short, specific, human job application letters for the candidate below. ${HONESTY_RULES}
Style: ${lang}, 120-190 words, warm and direct, no clichés ("I am writing to express"), no placeholders, no subject line, no markdown. Open with why this role/company fits the candidate's REAL work (use the pitch angle if given). Mention 2-3 concrete, true projects that match the job. Mention remote from Türkiye and async-friendly communication only if relevant. End with a simple call to action and the name "Özgür Güler".${add}`;
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
  // CV'de olmayan teknoloji adı geçiyorsa (ör. React Native ↔ Capacitor) bir kez yeniden yaz
  const fake = unsupportedTech(text, profile);
  // Uydurma çalışma saati/örtüşme sözü ("overlap 4+ hours with US Pacific") de yeniden yazdırır
  if (/overlap[^.]{0,40}(hours?|pacific|eastern|est|pst|cet|us )|\b(pacific|eastern|central) (time|hours)/i.test(text)) fake.push('time-zone overlap promises');
  if (fake.length) { try { text = await gen(`\n\nIMPORTANT: do not claim these technologies, the candidate has not used them: ${fake.join(', ')}. Mobile apps were built with React + TypeScript + Capacitor.`); } catch (e) { /* ilk metin */ } }
  const check = await truthCheck(env, settings, text);
  if (!check.ok) {
    try { text = await gen(`\n\nIMPORTANT: a previous draft contained unsupported claims: ${check.issues.join('; ')}. Do not repeat them.`); } catch (e) { /* ilk metinle devam */ }
    const c2 = await truthCheck(env, settings, text);
    if (!c2.ok) return { text, lang, warnings: c2.issues };
  }
  return { text, lang, warnings: [] };
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
  return String(s || '').replace(/^\s*(subject|konu):.*$/gim, '').replace(/\*\*/g, '').replace(/\[(your|company|hiring manager)[^\]]*\]/gi, '')
    // Sayı uydurmasın: mağazada 4 uygulama var (Galaktik Uzay web platformu, mağazada değil; toplam 5 ürün).
    // Sadece mağaza/mobil bağlamında geçen 5+ sayısını 4'e çevir; "toplam beş ürün" doğru, dokunma.
    .split(/((?<=[.!?])\s+)/).map((sen) => /app store|google play|\bstores?\b|mobile|mağaza|mobil/i.test(sen)
      ? sen.replace(/\b(five|six|seven|5|6|7)(\s+(?:mobile\s+|published\s+|live\s+)?(?:products|apps|applications|mobile products))/gi, (m, n, rest) => (/^\d/.test(n) ? '4' : n[0] === n[0].toUpperCase() ? 'Four' : 'four') + rest)
        .replace(/\b(beş|altı|yedi)(\s+(?:mobil\s+)?(?:ürün|uygulama))/gi, (m, n, rest) => (n[0] === n[0].toUpperCase() ? 'Dört' : 'dört') + rest)
      : sen).join('')
    .trim();
}

// Metindeki her iddianın CV'de dayanağı var mı?
export async function truthCheck(env, settings, text) {
  try {
    const o = await llm(env, settings, { task: 'judge', json: true, maxTokens: 500, messages: [
      { role: 'system', content: 'You verify claims in an application text against the candidate CV/facts. Return ONLY JSON {"ok":true|false,"issues":["each unsupported or false claim, short"]}. Reasonable paraphrases and enthusiasm are fine; invented employers, numbers, years, skills, degrees, language fluency or claims of being a native English speaker are NOT. Technologies/frameworks must appear in the CV (e.g. the mobile apps use React + Capacitor; saying React Native is false). The candidate has FOUR apps on the App Store/Google Play; Galaktik Uzay is a web platform. Promises of working-hour overlap with other time zones are not in the CV (false).' },
      { role: 'user', content: `CANDIDATE:\n${await profileContext(env, { maxFacts: 40 })}\n\nTEXT:\n${text}` }] });
    const j = o.json || {};
    return { ok: j.ok !== false || !(j.issues || []).length, issues: j.issues || [] };
  } catch (e) { return { ok: true, issues: [] }; }
}

// Formdaki tek bir serbest metin sorusuna doğru ve kısa cevap
export async function answerQuestion(env, settings, job, question, { maxWords = 120 } = {}) {
  const o = await llm(env, settings, { task: 'answers', maxTokens: 500, temperature: 0.3, messages: [
    { role: 'system', content: `Answer a job application question for the candidate, in the question's language (default English), max ${maxWords} words, first person, concrete and true. ${HONESTY_RULES}` },
    { role: 'user', content: `${await profileContext(env, { maxFacts: 60 })}\n\nJOB: ${job.title} at ${job.company}\n\nQUESTION: ${question}` }] });
  return o.content.trim();
}

// Daha önce başarıyla kullanılmış alan/cevap eşleşmeleri (öğrenilmiş tarifler)
export async function recipesFor(env, scopes) {
  if (!scopes.length) return [];
  const rows = await allRows(env, `SELECT scope, notes, fields, successes, failures FROM recipes WHERE scope IN (${scopes.map(() => '?').join(',')})`, ...scopes);
  return rows;
}

export { CORE };
