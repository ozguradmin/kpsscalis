// Haftalık model yarışması: aynı görevlerde modelleri ölçer, her görev için en iyi fiyat/başarı modelini seçer.
import { chatCore, costOf } from './llm-core.js';
import { TRIAGE, FORM, LETTER_JOB, PROFILE_BRIEF } from './eval-dataset.js';
import { TRIAGE_SYS } from './triage.js';
import { getSettings, setSetting, log } from './lib/db.js';
import { DEFAULT_MODELS } from './lib/llm.js';
import { now, uid } from './lib/util.js';

export const CANDIDATES = [
  '@cf/google/gemma-4-26b-a4b-it', '@cf/zai-org/glm-5.3-flash', '@cf/zai-org/glm-4.7-flash', '@cf/deepseek-ai/deepseek-v4-flash-0731', '@cf/deepseek-ai/deepseek-v4-pro-0813',
  '@cf/zai-org/glm-5.3', '@cf/qwen/qwen3.8-27b', '@cf/openai/gpt-oss-120b', '@cf/openai/gpt-oss-20b', '@cf/nvidia/nemotron-3-120b-a12b',
  '@cf/mistralai/mistral-small-3.1-24b-instruct', '@cf/meta/llama-4-scout-17b-16e-instruct', '@cf/moonshotai/kimi-k2.7-code',
];

function scoreTriage(got, want) {
  if (!got) return 0;
  let s = 0;
  const t = got.turkey_ok === true || got.turkey_ok === 'true' ? true : got.turkey_ok === false || got.turkey_ok === 'false' ? false : null;
  if (t === want.turkey_ok) s += 0.4;
  const norm = (a) => new Set((Array.isArray(a) ? a : []).map((x) => String(x).toLowerCase().slice(0, 2)).filter((x) => x !== 'en'));
  const g = norm(got.languages_required), w = norm(want.langs);
  if (g.size === w.size && [...w].every((x) => g.has(x))) s += 0.3;
  if (!!(got.scam === true || got.scam === 'true') === want.scam) s += 0.2;
  const fam = String(got.role_family || '');
  if (fam === want.family || (['frontend', 'fullstack'].includes(fam) && ['frontend', 'fullstack'].includes(want.family)) || (fam === 'data' && want.family === 'ai_training')) s += 0.1;
  return s;
}

// Tek model, tüm görevler. Dönen: {triage, form, tools, letterText, cost, ms}
async function evalOne(env, model) {
  const runner = (m, body) => env.AI.run(m, body);
  const chat = (o) => chatCore(runner, { ...o, model });
  const r = { model, triage: 0, form: 0, tools: 0, letter: '', cost: 0, ms: [] };
  const tri = await Promise.allSettled(TRIAGE.map((c) => chat({ json: true, maxTokens: 400, messages: [{ role: 'system', content: TRIAGE_SYS }, { role: 'user', content: c.text }] }).then((o) => ({ o, c }))));
  for (const x of tri) if (x.status === 'fulfilled') { r.triage += scoreTriage(x.value.o.json, x.value.c.want) / TRIAGE.length; r.cost += x.value.o.cost; r.ms.push(x.value.o.ms); }
  try {
    const o = await chat({ json: true, maxTokens: 700, messages: [{ role: 'system', content: 'You fill job application forms truthfully for the candidate. Use ONLY facts in the profile. For select/radio use one of the options exactly. Return ONLY JSON {"<field id>": "<value>"} with every field.' }, { role: 'user', content: `PROFILE:\n${PROFILE_BRIEF}\n\nJOB: ${FORM.job}\nFIELDS:\n${JSON.stringify(FORM.fields)}` }] });
    let hit = 0, n = 0;
    for (const [k, v] of Object.entries(FORM.expect)) { n++; const g = String(o.json?.[k] ?? ''); if (v instanceof RegExp ? v.test(g) : g.trim().toLowerCase() === String(v).toLowerCase()) hit++; }
    r.form = hit / n; r.cost += o.cost;
  } catch (e) { /* 0 */ }
  try {
    const o = await chat({ maxTokens: 300, tools: [{ type: 'function', function: { name: 'get_stats', description: 'Application statistics for a period', parameters: { type: 'object', properties: { period: { type: 'string', enum: ['today', 'week', 'month'] } }, required: ['period'] } } }], messages: [{ role: 'user', content: 'Bu hafta kaç başvuru yaptın?' }] });
    r.tools = o.toolCalls[0]?.name === 'get_stats' ? (o.toolCalls[0]?.args?.period === 'week' ? 1 : 0.6) : 0; r.cost += o.cost;
  } catch (e) { /* 0 */ }
  try {
    const o = await chat({ maxTokens: 700, temperature: 0.5, messages: [{ role: 'system', content: 'Write a short, specific, human-sounding cover letter (120-180 words, English) for the candidate. Use ONLY facts from the profile; never invent employers, years, metrics or skills. No placeholders. Plain text.' }, { role: 'user', content: `PROFILE:\n${PROFILE_BRIEF}\n\nJOB: ${LETTER_JOB.title} at ${LETTER_JOB.company}\n${LETTER_JOB.text}` }] });
    r.letter = o.content; r.cost += o.cost;
  } catch (e) { /* boş */ }
  return r;
}

async function judge(env, letter) {
  if (!letter || letter.length < 300 || /let me|analy[sz]e this task|here is/i.test(letter.slice(0, 80))) return 0;
  const runner = (m, body) => env.AI.run(m, body);
  try {
    const o = await chatCore(runner, { model: DEFAULT_MODELS.judge[0], json: true, maxTokens: 400, messages: [{ role: 'system', content: 'Grade the cover letter. Return ONLY JSON {"truthful":0-10,"specific":0-10,"natural":0-10}. Any invented fact caps truthful at 3.' }, { role: 'user', content: `PROFILE:\n${PROFILE_BRIEF}\n\nJOB: ${LETTER_JOB.title} at ${LETTER_JOB.company}: ${LETTER_JOB.text}\n\nLETTER:\n${letter}` }] });
    const g = o.json || {};
    return (Number(g.truthful) * 0.5 + Number(g.specific) * 0.25 + Number(g.natural) * 0.25) / 10 || 0;
  } catch (e) { return 0; }
}

export async function runModelEval(env, { apply = true } = {}) {
  const settings = await getSettings(env);
  const results = [];
  for (let i = 0; i < CANDIDATES.length; i += 4) {
    const part = await Promise.allSettled(CANDIDATES.slice(i, i + 4).map((m) => evalOne(env, m)));
    for (const p of part) if (p.status === 'fulfilled') results.push(p.value);
  }
  for (const r of results) { r.letterScore = await judge(env, r.letter); r.p50 = r.ms.sort((a, b) => a - b)[Math.floor(r.ms.length / 2)] || 0; delete r.ms; r.letter = r.letter.slice(0, 600); }
  // Görev bazında seçim: kalite önce; fark küçükse ucuz ve hızlı olan
  const pick = (score, minQ) => results.filter((r) => score(r) >= minQ).sort((a, b) => (score(b) - score(a)) * 10 - (b.cost - a.cost) * 20 - (b.p50 - a.p50) / 20000)[0]?.model;
  const chosen = {
    triage: pick((r) => r.triage, 0.85),
    answers: pick((r) => r.form * 0.7 + r.triage * 0.3, 0.85),
    letter: pick((r) => r.letterScore, 0.8),
    analysis: pick((r) => r.triage * 0.6 + r.form * 0.4, 0.85),
  };
  const id = uid('eval_');
  await env.DB.prepare('INSERT INTO model_evals (id, ts, source, results, chosen) VALUES (?,?,?,?,?)').bind(id, now(), 'weekly', JSON.stringify(results), JSON.stringify(chosen)).run();
  if (apply) {
    const models = { ...(settings.models || {}) };
    for (const [task, m] of Object.entries(chosen)) if (m) models[task] = m;
    await setSetting(env, 'models', models, 'model-eval');
  }
  await log(env, 'eval', `Model yarışması bitti: ${Object.entries(chosen).map(([k, v]) => `${k}→${(v || '-').split('/').pop()}`).join(', ')}`, { data: { chosen } });
  return { id, chosen, results: results.map((r) => ({ model: r.model, triage: +r.triage.toFixed(2), form: +r.form.toFixed(2), tools: r.tools, letter: +r.letterScore.toFixed(2), cost: +r.cost.toFixed(5), p50: r.p50 })) };
}

export { costOf };
