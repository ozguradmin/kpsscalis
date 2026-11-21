// Runware teşhisi: düşünmeyi kapatan parametreyi ve model kısıtlarını canlı ölçer (dokümanda yazmıyor; 22 Kasım).
import { log } from './lib/db.js';

const MODELS = ['deepseek:v4@flash', 'deepseek:v4.1@flash', 'zai:glm@5.3-flash', 'google:gemini@3.8-flash', 'anthropic:claude@haiku-5.5', 'alibaba:qwen@4-max'];
const VARIANTS = {
  base: {},
  effort_none: { reasoning_effort: 'none' },
  effort_minimal: { reasoning_effort: 'minimal' },
  effort_low: { reasoning_effort: 'low' },
  thinking_disabled: { thinking: { type: 'disabled' } },
  reasoning_off: { reasoning: { enabled: false } },
  reasoning_effort_obj: { reasoning: { effort: 'none' } },
  template_kwargs: { chat_template_kwargs: { enable_thinking: false } },
  enable_thinking: { enable_thinking: false },
};

export async function runwareProbe(env) {
  const out = {};
  const one = async (model, name, extra, opts = {}) => {
    const body = { model, max_tokens: 400, messages: [{ role: 'user', content: 'Return ONLY JSON {"city":"<capital of Turkey>","n":<2+2>}' }], ...extra };
    if (opts.json) body.response_format = { type: 'json_object' };
    if (opts.temp) body.temperature = 0.2;
    const t0 = Date.now();
    try {
      const res = await fetch('https://api.runware.ai/v1/chat/completions', { method: 'POST', headers: { authorization: `Bearer ${env.RUNWARE_KEY}`, 'content-type': 'application/json' }, body: JSON.stringify(body) });
      const text = await res.text();
      if (!res.ok) return { err: `${res.status} ${text.replace(/\s+/g, ' ').slice(0, 160)}` };
      const j = JSON.parse(text); const c = j.choices?.[0] || {}; const m = c.message || {};
      return { fin: c.finish_reason, rc: (m.reasoning_content || m.reasoning || '').length, out: j.usage?.completion_tokens, rt: j.usage?.completion_tokens_details?.reasoning_tokens, c: String(m.content || '').slice(0, 60), ms: Date.now() - t0 };
    } catch (e) { return { err: String(e.message).slice(0, 160) }; }
  };
  await Promise.all(MODELS.map(async (model) => {
    const r = {};
    for (const [name, extra] of Object.entries(VARIANTS)) r[name] = await one(model, name, extra);
    r.json_mode = await one(model, 'json', {}, { json: true });
    r.temperature = await one(model, 'temp', {}, { temp: true });
    out[model] = r;
  }));
  await log(env, 'rwprobe', 'Runware parametre teşhisi', { data: out });
  return { ok: true };
}
