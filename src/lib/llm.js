// Model yönlendirici: görev → model zinciri (yedekli), bütçe kontrolü, kullanım kaydı; TypeSafe Jev istemcisi.
import { chatCore, costOf, parseJSON, makeRunner } from '../llm-core.js';
import { dayKey } from './util.js';
import { aiCostToday, getSecret, log, bumpUsage } from './db.js';

// 30 Eylül 2026 değerlendirmesi (eval/): 16 model, 14 çok dilli ilan + form + araç çağrısı + ön yazı.
// Sıralama: ilk model birincil, diğerleri yedek. Beyin haftalık yeniden değerlendirip settings.models ile değiştirir.
// 20 Kasım 2026: Workers AI aynı gün deepseek-v4-flash-0731, deepseek-v4-pro-0813, glm-5.3-flash, kimi-k2.7-code ve nemotron'u kaldırdı (hata 5028).
// Yerlerine 14 Kasım haftalık yarışmasında ölçülmüş ve hâlâ yayında olan modeller kondu: qwen3.8-27b (eleme 0.94, form 0.89, ön yazı 0.925),
// gemma-4, gpt-oss. glm-5.3 yalnız son yedek: yarışmada ön yazıyı boş döndürdü, JSON çağrılarında da boş cevap veriyor.
// deepseek-v4.1-flash-1017 ölçülmediği için zincire konmadı; evals.js adayı, haftalık yarışma iyi bulursa kendisi seçer.
export const DEFAULT_MODELS = {
  // 22 Kasım ölçümü: Runware modelleri başta (deepseek-v4.1-flash eleme 0.97, qwen3.8'den ~4 kat ucuz; Claude Haiku ön yazı 0.71, qwen 0.41). Runware düşerse Workers AI devralır.
  triage: ['rw:deepseek:v4.1@flash', '@cf/google/gemma-4-26b-a4b-it', '@cf/zai-org/glm-4.7-flash', '@cf/openai/gpt-oss-20b'],
  analysis: ['rw:deepseek:v4.1@flash', '@cf/qwen/qwen3.8-27b', '@cf/google/gemma-4-26b-a4b-it', '@cf/openai/gpt-oss-20b'],
  letter: ['rw:anthropic:claude@haiku-5.5', '@cf/qwen/qwen3.8-27b', '@cf/openai/gpt-oss-120b', '@cf/google/gemma-4-26b-a4b-it'],
  answers: ['rw:deepseek:v4.1@flash', '@cf/qwen/qwen3.8-27b', '@cf/openai/gpt-oss-20b', '@cf/zai-org/glm-4.7-flash'],
  // 25 Kasım: kalan işler de Runware'e (Özgür Workers AI neuron harcaması istemiyor); Workers AI sadece yedek
  agent: ['rw:anthropic:claude@haiku-5.5', '@cf/qwen/qwen3.8-27b', '@cf/openai/gpt-oss-20b', '@cf/zai-org/glm-4.7-flash'],
  agent_hard: ['rw:anthropic:claude@sonnet-5.5', '@cf/openai/gpt-oss-120b', '@cf/qwen/qwen3.8-27b', '@cf/zai-org/glm-5.3'],
  mail: ['rw:deepseek:v4.1@flash', '@cf/google/gemma-4-26b-a4b-it', '@cf/zai-org/glm-4.7-flash'],
  brain: ['rw:anthropic:claude@haiku-5.5', '@cf/qwen/qwen3.8-27b', '@cf/openai/gpt-oss-120b', '@cf/zai-org/glm-5.3'],
  review: ['rw:anthropic:claude@haiku-5.5', '@cf/qwen/qwen3.8-27b', '@cf/openai/gpt-oss-120b', '@cf/zai-org/glm-5.3'],
  judge: ['rw:anthropic:claude@haiku-5.5', '@cf/openai/gpt-oss-120b', '@cf/qwen/qwen3.8-27b'],
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
  const runner = makeRunner(env);
  let lastErr;
  const errs = []; // zincirdeki her modelin hatası (yalnız sonuncusu yazılınca asıl neden gizleniyordu)
  for (const model of chain) {
    try {
      const out = await chatCore(runner, { ...opts, model });
      await record(env, model, task, out.usage, out.cost);
      // Bitiş nedeni, uzunluk ve metnin sonu da yazılsın: yalnız baş görününce Haiku'nun neden çözülemediği anlaşılmıyordu (24 ve 26 Kasım)
      if ((opts.json || opts.schema) && out.json == null) { const c = out.content || ''; lastErr = new Error(`JSON çözülemedi (${model}; bitiş=${out.finish || '?'}, ${c.length} krk, çıktı ${out.usage?.completion_tokens ?? '?'} tok): ${c.slice(0, 160)}${c.length > 160 ? ` … ${JSON.stringify(c.slice(-200))}` : ''}`); errs.push(lastErr.message); continue; }
      if (opts.validate && !opts.validate(out.json ?? out.content)) { lastErr = new Error(`Çıktı doğrulanamadı (${model}): ${out.content.slice(0, 160)}`); errs.push(lastErr.message); continue; }
      if (!opts.json && !opts.schema && !opts.tools && !out.content.trim()) { lastErr = new Error(`Boş cevap (${model})`); errs.push(lastErr.message); continue; }
      // Yedek modelle kurtarıldıysa da öndeki modellerin hatası görünsün (günde birkaç kayıt; sessiz kalınca birincil modelin bozulduğu fark edilmiyor)
      if (errs.length) await log(env, 'llm', `Yedek modele geçildi (${task}): ${model.split('/').pop()}`, { level: 'warn', data: { errors: errs } });
      return out;
    } catch (e) {
      lastErr = e;
      errs.push(`${model.split('/').pop()}: ${String(e.message).slice(0, 200)}`);
      await record(env, model, task, null, 0, true);
      if (/budget|quota|4006|neurons/i.test(String(e.message))) break;
    }
  }
  await log(env, 'llm', `Model zinciri başarısız (${task}): ${lastErr?.message}`, { level: 'warn', data: { errors: errs } });
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
