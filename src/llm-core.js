// Model çağrısının çekirdeği: hem Worker'da (env.AI) hem de Node'daki değerlendirme betiğinde (REST) aynı kod çalışır.

// Workers AI fiyatları (USD / 1M token, girdi-çıktı). Kaynak: /ai/models/search, Eylül 2026.
export const PRICES = {
  '@cf/openai/gpt-oss-120b': [0.35, 0.75],
  '@cf/openai/gpt-oss-20b': [0.2, 0.3],
  '@cf/zai-org/glm-5.3': [1.4, 4.4],
  '@cf/zai-org/glm-5.3-flash': [0.15, 0.5],
  '@cf/zai-org/glm-5.2': [1.4, 4.4],
  '@cf/zai-org/glm-4.7-flash': [0.0605, 0.4],
  '@cf/moonshotai/kimi-k2.6': [0.95, 4],
  '@cf/moonshotai/kimi-k2.7-code': [0.95, 4],
  '@cf/deepseek-ai/deepseek-v4-flash-0731': [0.44, 1.32],
  '@cf/deepseek-ai/deepseek-v4-pro-0813': [1.32, 3.96],
  '@cf/google/gemma-4-26b-a4b-it': [0.1, 0.3],
  '@cf/qwen/qwen3-30b-a3b-fp8': [0.0509, 0.335],
  '@cf/qwen/qwen3.8-27b': [0.45, 3.2],
  '@cf/nvidia/nemotron-3-120b-a12b': [0.5, 1.5],
  '@cf/mistralai/mistral-small-3.1-24b-instruct': [0.351, 0.555],
  '@cf/meta/llama-4-scout-17b-16e-instruct': [0.27, 0.85],
  '@cf/meta/llama-3.3-70b-instruct-fp8-fast': [0.293, 2.253],
  '@cf/ibm-granite/granite-4.0-h-micro': [0.017, 0.112],
  '@cf/meta/llama-3.2-11b-vision-instruct': [0.0485, 0.676],
  '@cf/baai/bge-m3': [0.012, 0],
};

// Düşünme (reasoning) açma/kapama desteği olan aileler; Mistral/Llama/Nemotron bu parametreyi reddediyor.
const THINK_TOGGLE = /zai-org|qwen|deepseek|moonshotai|gemma-4/;

export function costOf(model, usage) {
  const p = PRICES[model];
  if (!p || !usage) return 0;
  return ((usage.prompt_tokens || 0) * p[0] + (usage.completion_tokens || 0) * p[1]) / 1e6;
}

// Çıktıdaki ilk geçerli JSON nesnesini/dizisini bulur (kod bloğu, önsöz vb. temizlenir).
export function parseJSON(text) {
  if (text == null) return null;
  if (typeof text === 'object') return text;
  let s = String(text).trim();
  const fence = s.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) s = fence[1].trim();
  try { return JSON.parse(s); } catch (e) { /* devam */ }
  const starts = [s.indexOf('{'), s.indexOf('[')].filter((i) => i >= 0);
  if (!starts.length) return null;
  const start = Math.min(...starts);
  const open = s[start], close = open === '{' ? '}' : ']';
  let depth = 0, inStr = false, esc = false;
  for (let i = start; i < s.length; i++) {
    const c = s[i];
    if (inStr) { if (esc) esc = false; else if (c === '\\') esc = true; else if (c === '"') inStr = false; continue; }
    if (c === '"') inStr = true;
    else if (c === open) depth++;
    else if (c === close && --depth === 0) {
      const chunk = s.slice(start, i + 1);
      try { return JSON.parse(chunk); } catch (e) {
        try { return JSON.parse(chunk.replace(/,\s*([}\]])/g, '$1')); } catch (e2) { return null; }
      }
    }
  }
  return null;
}

// Tek tip çağrı. runner(model, body) -> ham sonuç (env.AI.run veya REST)
export async function chatCore(runner, { model, messages, json = false, schema = null, tools = null, maxTokens = 1200, thinking = false, temperature = 0.2, effort = 'low' }) {
  const body = { messages, max_completion_tokens: maxTokens, temperature };
  if (THINK_TOGGLE.test(model)) body.chat_template_kwargs = { enable_thinking: !!thinking };
  if (model.includes('gpt-oss')) body.reasoning_effort = thinking ? 'medium' : effort;
  if (schema) body.response_format = { type: 'json_schema', json_schema: { name: 'out', schema, strict: false } };
  else if (json) body.response_format = { type: 'json_object' };
  if (tools) { body.tools = tools; body.tool_choice = 'auto'; }
  const t0 = Date.now();
  const raw = await runner(model, body);
  const ms = Date.now() - t0;
  const r = raw && raw.result ? raw.result : raw;
  const msg = r?.choices?.[0]?.message || {};
  let content = msg.content ?? r?.response ?? '';
  if (Array.isArray(content)) content = content.map((c) => c.text || '').join('');
  const usage = r?.usage || {};
  content = typeof content === 'string' ? content : JSON.stringify(content);
  // Bazı modeller düşünmeyi içeriğe <think>...</think> olarak sızdırıyor
  content = content.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
  const out = {
    model, ms, usage,
    content,
    reasoning: msg.reasoning_content || msg.reasoning || '',
    toolCalls: (msg.tool_calls || []).map((t) => ({ id: t.id, name: t.function?.name, args: parseJSON(t.function?.arguments) || {} })),
    finish: r?.choices?.[0]?.finish_reason,
    cost: costOf(model, usage),
  };
  if (json || schema) out.json = parseJSON(out.content) ?? parseJSON(out.reasoning);
  return out;
}
