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
  let o = await llm(env, settings, { task: 'letter', maxTokens: 900, temperature: 0.5, messages: [{ role: 'system', content: sys }, { role: 'user', content: user }] });
  let text = cleanLetter(o.content);
  const check = await truthCheck(env, settings, text);
  if (!check.ok) {
    o = await llm(env, settings, { task: 'letter', maxTokens: 900, temperature: 0.3, messages: [{ role: 'system', content: sys }, { role: 'user', content: `${user}\n\nIMPORTANT: a previous draft contained unsupported claims: ${check.issues.join('; ')}. Do not repeat them.` }] });
    text = cleanLetter(o.content);
    const c2 = await truthCheck(env, settings, text);
    if (!c2.ok) return { text, lang, warnings: c2.issues };
  }
  return { text, lang, warnings: [] };
}

function cleanLetter(s) {
  return String(s || '').replace(/^\s*(subject|konu):.*$/gim, '').replace(/\*\*/g, '').replace(/\[(your|company|hiring manager)[^\]]*\]/gi, '').trim();
}

// Metindeki her iddianın CV'de dayanağı var mı?
export async function truthCheck(env, settings, text) {
  try {
    const o = await llm(env, settings, { task: 'judge', json: true, maxTokens: 500, messages: [
      { role: 'system', content: 'You verify claims in an application text against the candidate CV/facts. Return ONLY JSON {"ok":true|false,"issues":["each unsupported or false claim, short"]}. Reasonable paraphrases and enthusiasm are fine; invented employers, numbers, years, skills, degrees, language fluency or claims of being a native English speaker are NOT.' },
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
