// Workers AI modellerini iş ajanının gerçek görevlerinde karşılaştırır. Kullanım: CF_TOKEN=... node eval/run.mjs
import { chatCore } from '../src/llm-core.js';
import { TRIAGE, LETTER_JOB, FORM, PROFILE_BRIEF } from './dataset.mjs';
import fs from 'fs';

const ACC = '3c39c225b3a27de7822833feb24b65b1';
const TOKEN = process.env.CF_TOKEN;
const runner = async (model, body) => {
  for (let i = 0; i < 3; i++) {
    const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${ACC}/ai/run/${model}`, { method: 'POST', headers: { authorization: `Bearer ${TOKEN}`, 'content-type': 'application/json' }, body: JSON.stringify(body) });
    const j = await res.json().catch(() => ({}));
    if (res.ok) return j;
    if (i === 2 || ![429, 500, 502, 503, 504].includes(res.status)) throw new Error(`${res.status} ${JSON.stringify(j.errors || j).slice(0, 200)}`);
    await new Promise((r) => setTimeout(r, 3000 * (i + 1)));
  }
};
const chat = (o) => chatCore(runner, o);

export const TRIAGE_SYS = `You analyze job listings (any language) for ONE candidate who lives in Türkiye (Turkish citizen), speaks Turkish natively and English at intermediate level, and works only remotely as a contractor/employee.
Return ONLY JSON: {"remote_scope":"worldwide|region_includes_turkey|region_excludes_turkey|country_restricted|onsite_or_hybrid|unclear","turkey_ok":true|false|null,"languages_required":["ISO 639-1 codes of human languages needed for the daily work"],"role_family":"frontend|backend|fullstack|mobile|ai_training|data|qa|devops|design|marketing|content|support|sales|product|other","scam":true|false,"fit":0-100,"reason":"max 20 words"}
Rules: turkey_ok=true only if someone living in Türkiye can realistically be hired for this remote role. Residence-limited (Brazil only, LATAM, EU only, US only, Ukraine only, "must live in X") => false. If the listing is written in a language and the team communicates in it, include that language. Payment-upfront, WhatsApp-only HR, unrealistic pay => scam=true.`;

const MODELS = (process.env.MODELS || [
  '@cf/zai-org/glm-5.3-flash', '@cf/zai-org/glm-4.7-flash', '@cf/google/gemma-4-26b-a4b-it', '@cf/openai/gpt-oss-120b', '@cf/openai/gpt-oss-20b',
  '@cf/qwen/qwen3-30b-a3b-fp8', '@cf/deepseek-ai/deepseek-v4-flash-0731', '@cf/deepseek-ai/deepseek-v4-pro-0813', '@cf/zai-org/glm-5.3',
  '@cf/moonshotai/kimi-k2.6', '@cf/moonshotai/kimi-k2.7-code', '@cf/nvidia/nemotron-3-120b-a12b', '@cf/mistralai/mistral-small-3.1-24b-instruct',
  '@cf/meta/llama-4-scout-17b-16e-instruct', '@cf/qwen/qwen3.8-27b', '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
].join(',')).split(',');

const JUDGES = ['@cf/deepseek-ai/deepseek-v4-pro-0813', '@cf/zai-org/glm-5.3'];

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
  const ok = fam === want.family || (['frontend', 'fullstack'].includes(fam) && ['frontend', 'fullstack'].includes(want.family)) || (fam === 'data' && want.family === 'ai_training');
  if (ok) s += 0.1;
  return s;
}

async function pool(items, n, fn) {
  const out = []; let i = 0;
  await Promise.all(Array.from({ length: n }, async () => { while (i < items.length) { const k = i++; out[k] = await fn(items[k], k); } }));
  return out;
}

async function evalModel(model) {
  const r = { model, triage: 0, triageN: 0, jsonOk: 0, ms: [], cost: 0, errors: [] };
  // 1) triage
  await pool(TRIAGE, 4, async (c) => {
    try {
      const o = await chat({ model, json: true, maxTokens: 400, messages: [{ role: 'system', content: TRIAGE_SYS }, { role: 'user', content: c.text }] });
      r.ms.push(o.ms); r.cost += o.cost; r.triageN++;
      if (o.json) r.jsonOk++;
      const sc = scoreTriage(o.json, c.want); r.triage += sc;
      if (sc < 1) r.errors.push(`${c.id}:${sc.toFixed(1)} ${JSON.stringify(o.json)?.slice(0, 140)}`);
    } catch (e) { r.errors.push(`${c.id}: ERR ${e.message.slice(0, 120)}`); }
  });
  // 2) form mapping
  try {
    const o = await chat({ model, json: true, maxTokens: 700, messages: [
      { role: 'system', content: 'You fill job application forms truthfully for the candidate. Use ONLY facts in the profile. For select/radio use one of the options exactly. Return ONLY JSON {"<field id>": "<value>"} with every field.' },
      { role: 'user', content: `PROFILE:\n${PROFILE_BRIEF}\n\nJOB: ${FORM.job}\nFIELDS:\n${JSON.stringify(FORM.fields)}` }] });
    r.cost += o.cost; r.ms.push(o.ms);
    let hit = 0, n = 0;
    for (const [k, v] of Object.entries(FORM.expect)) { n++; const g = String(o.json?.[k] ?? ''); if (v instanceof RegExp ? v.test(g) : g.trim().toLowerCase() === String(v).toLowerCase()) hit++; else r.errors.push(`form.${k}=${g}`); }
    r.form = hit / n;
  } catch (e) { r.form = 0; r.errors.push('form ERR ' + e.message.slice(0, 100)); }
  // 3) tool calling
  try {
    const o = await chat({ model, maxTokens: 300, tools: [
      { type: 'function', function: { name: 'get_stats', description: 'Application statistics for a period', parameters: { type: 'object', properties: { period: { type: 'string', enum: ['today', 'week', 'month'] } }, required: ['period'] } } },
      { type: 'function', function: { name: 'search_jobs', description: 'Search discovered jobs', parameters: { type: 'object', properties: { q: { type: 'string' } }, required: ['q'] } } }],
      messages: [{ role: 'system', content: 'Sen Özgür’ün iş başvuru ajanının beynisin. Gerekirse araç çağır.' }, { role: 'user', content: 'Bu hafta kaç başvuru yaptın?' }] });
    r.cost += o.cost;
    r.tools = o.toolCalls[0]?.name === 'get_stats' && o.toolCalls[0]?.args?.period === 'week' ? 1 : o.toolCalls[0]?.name === 'get_stats' ? 0.6 : 0;
    if (r.tools < 1) r.errors.push('tool: ' + JSON.stringify(o.toolCalls).slice(0, 120) + ' ' + o.content.slice(0, 80));
  } catch (e) { r.tools = 0; r.errors.push('tool ERR ' + e.message.slice(0, 100)); }
  // 4) cover letter (en)
  try {
    const o = await chat({ model, maxTokens: 3000, thinking: true, temperature: 0.5, messages: [
      { role: 'system', content: 'Write a short, specific, human-sounding cover letter (120-180 words, English) for the candidate. Use ONLY facts from the profile; never invent employers, years, metrics or skills. Do not mention AI tools writing this. No placeholders. Plain text.' },
      { role: 'user', content: `PROFILE:\n${PROFILE_BRIEF}\n\nJOB: ${LETTER_JOB.title} at ${LETTER_JOB.company}\n${LETTER_JOB.text}` }] });
    r.cost += o.cost; r.letter = o.content;
  } catch (e) { r.letter = ''; r.errors.push('letter ERR ' + e.message.slice(0, 100)); }
  r.triageScore = r.triageN ? r.triage / TRIAGE.length : 0;
  r.p50 = r.ms.sort((a, b) => a - b)[Math.floor(r.ms.length / 2)] || 0;
  return r;
}

async function judgeLetters(results) {
  for (const r of results) {
    if (!r.letter || r.letter.length < 200) { r.letterScore = 0; continue; }
    const scores = [];
    for (const j of JUDGES) {
      try {
        const o = await chat({ model: j, json: true, thinking: true, maxTokens: 3000, messages: [
          { role: 'system', content: 'You grade cover letters. Return ONLY JSON {"truthful":0-10,"specific":0-10,"natural":0-10,"fabrications":["..."]}. truthful=10 means every claim is supported by the profile; any invented fact caps truthful at 3.' },
          { role: 'user', content: `PROFILE:\n${PROFILE_BRIEF}\n\nJOB: ${LETTER_JOB.title} at ${LETTER_JOB.company}: ${LETTER_JOB.text}\n\nLETTER:\n${r.letter}` }] });
        const g = o.json || {};
        scores.push((Number(g.truthful) * 0.5 + Number(g.specific) * 0.25 + Number(g.natural) * 0.25) / 10);
        if (g.fabrications?.length) r.errors.push('fab(' + j.split('/').pop() + '): ' + g.fabrications.join('; ').slice(0, 150));
      } catch (e) { /* hakem hatası */ }
    }
    r.letterScore = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  }
}

const results = await pool(MODELS, 4, async (m) => { const t = Date.now(); const r = await evalModel(m); console.error(`done ${m} ${((Date.now() - t) / 1000).toFixed(0)}s`); return r; });
await judgeLetters(results);
for (const r of results) r.total = r.triageScore * 0.4 + (r.form || 0) * 0.25 + (r.letterScore || 0) * 0.2 + (r.tools || 0) * 0.15;
results.sort((a, b) => b.total - a.total);
console.log('model'.padEnd(46), 'total triage json form letter tools p50ms cost$');
for (const r of results) console.log(r.model.padEnd(46), r.total.toFixed(3), r.triageScore.toFixed(2), `${r.jsonOk}/${TRIAGE.length}`, (r.form || 0).toFixed(2), (r.letterScore || 0).toFixed(2), (r.tools || 0).toFixed(1), String(r.p50).padStart(6), r.cost.toFixed(5));
fs.writeFileSync(process.env.OUT || 'eval/results.json', JSON.stringify(results, null, 2));
