// Model yönlendirici: görev → model zinciri (yedekli), bütçe kontrolü, kullanım kaydı; TypeSafe Jev istemcisi.
import { chatCore, costOf, parseJSON } from '../llm-core.js';
import { dayKey } from './util.js';
import { aiCostToday, getSecret, log, bumpUsage } from './db.js';

// 30 Eylül 2026 değerlendirmesi (eval/): 16 model, 14 çok dilli ilan + form + araç çağrısı + ön yazı.
// Sıralama: ilk model birincil, diğerleri yedek. Beyin haftalık yeniden değerlendirip settings.models ile değiştirir.
export const DEFAULT_MODELS = {
  triage: ['@cf/google/gemma-4-26b-a4b-it', '@cf/zai-org/glm-5.3-flash', '@cf/zai-org/glm-4.7-flash'],
  analysis: ['@cf/deepseek-ai/deepseek-v4-flash-0731', '@cf/zai-org/glm-5.3-flash', '@cf/deepseek-ai/deepseek-v4-pro-0813'],
  letter: ['@cf/deepseek-ai/deepseek-v4-flash-0731', '@cf/deepseek-ai/deepseek-v4-pro-0813', '@cf/moonshotai/kimi-k2.7-code'],
  answers: ['@cf/deepseek-ai/deepseek-v4-flash-0731', '@cf/zai-org/glm-5.3-flash', '@cf/deepseek-ai/deepseek-v4-pro-0813'],
  agent: ['@cf/deepseek-ai/deepseek-v4-flash-0731', '@cf/deepseek-ai/deepseek-v4-pro-0813', '@cf/zai-org/glm-5.3'],
  agent_hard: ['@cf/deepseek-ai/deepseek-v4-pro-0813', '@cf/zai-org/glm-5.3', '@cf/moonshotai/kimi-k2.7-code'],
  mail: ['@cf/google/gemma-4-26b-a4b-it', '@cf/zai-org/glm-5.3-flash'],
  brain: ['@cf/deepseek-ai/deepseek-v4-pro-0813', '@cf/zai-org/glm-5.3', '@cf/deepseek-ai/deepseek-v4-flash-0731'],
  review: ['@cf/deepseek-ai/deepseek-v4-pro-0813', '@cf/zai-org/glm-5.3'],
  judge: ['@cf/deepseek-ai/deepseek-v4-pro-0813', '@cf/zai-org/glm-5.3'],
};

export function modelsFor(settings, task) {
  const custom = settings?.models?.[task];
  const base = DEFAULT_MODELS[task] || DEFAULT_MODELS.analysis;
  if (!custom) return base;
  const list = Array.isArray(custom) ? custom : [custom];
  return [...list, ...base.filter((m) => !list.includes(m))];
}

async function record(env, model, task, usage, cost, error = false) {
  try {
    await env.DB.prepare('INSERT INTO ai_usage (day, model, task, calls, in_tok, out_tok, cost, errors) VALUES (?1,?2,?3,1,?4,?5,?6,?7) ON CONFLICT(day, model, task) DO UPDATE SET calls=calls+1, in_tok=in_tok+?4, out_tok=out_tok+?5, cost=cost+?6, errors=errors+?7')
      .bind(dayKey(), model, task, usage?.prompt_tokens || 0, usage?.completion_tokens || 0, cost || 0, error ? 1 : 0).run();
  } catch (e) { /* sayaç hatası işi durdurmasın */ }
}

export class BudgetError extends Error {}

// opts: {task, messages, json, schema, tools, maxTokens, thinking, temperature, models}
export async function llm(env, settings, opts) {
  const task = opts.task || 'analysis';
  const spent = await aiCostToday(env);
  if (spent >= (settings?.daily_ai_budget_usd ?? 6) && !opts.ignoreBudget) throw new BudgetError(`Günlük yapay zekâ bütçesi doldu (${spent.toFixed(2)} $)`);
  const chain = opts.models || modelsFor(settings, task);
  const runner = (model, body) => env.AI.run(model, body);
  let lastErr;
  for (const model of chain) {
    try {
      const out = await chatCore(runner, { ...opts, model });
      await record(env, model, task, out.usage, out.cost);
      if ((opts.json || opts.schema) && out.json == null) { lastErr = new Error(`JSON çözülemedi (${model}): ${out.content.slice(0, 160)}`); continue; }
      if (opts.validate && !opts.validate(out.json ?? out.content)) { lastErr = new Error(`Çıktı doğrulanamadı (${model}): ${out.content.slice(0, 160)}`); continue; }
      if (!opts.json && !opts.schema && !opts.tools && !out.content.trim()) { lastErr = new Error(`Boş cevap (${model})`); continue; }
      return out;
    } catch (e) {
      lastErr = e;
      await record(env, model, task, null, 0, true);
      if (/budget|quota|4006|neurons/i.test(String(e.message))) break;
    }
  }
  await log(env, 'llm', `Model zinciri başarısız (${task}): ${lastErr?.message}`, { level: 'warn' });
  throw lastErr || new Error('LLM başarısız');
}

export { parseJSON, costOf };

// ---------- TypeSafe Jev: hızlı ve ucuz tipli yargılar ----------
export async function jev(env, state, questions, { retries = 2 } = {}) {
  const key = env.TYPESAFE_KEY || (await getSecret(env, 'typesafe_key'));
  if (!key) throw new Error('TypeSafe anahtarı yok');
  let last;
  for (let i = 0; i <= retries; i++) {
    const r = await fetch('https://api.typesafe.ai/v1/systemone', {
      method: 'POST',
      headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
      body: JSON.stringify({ model: 'jev-latest', state, questions }),
      signal: AbortSignal.timeout(90000), // asılı kalmasın
    });
    if (r.ok) {
      const j = await r.json();
      try { await bumpUsage(env, 'jev_tokens', j.usage?.input_tokens || 0); } catch (e) { /* yoksay */ }
      return j.answers;
    }
    last = new Error(`Jev ${r.status}: ${(await r.text()).slice(0, 200)}`);
    if (r.status === 429 || r.status >= 500) { await new Promise((res) => setTimeout(res, 1500 * (i + 1))); continue; }
    break;
  }
  throw last;
}
