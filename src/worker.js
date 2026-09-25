// KPSS Çalış — Cloudflare Worker
// Statik site (public/) + API:
//   GET  /api/health           → AI ve veritabanı durumu
//   GET  /api/progress         → Özgür'ün ilerlemesi (D1)
//   PUT  /api/progress         → ilerlemeyi kaydet
//   POST /api/chat             → yapay zekâ hoca: araç kullanan ajan, akışlı cevap (SSE)
//   POST /api/questions        → konuya göre ÖSYM tarzı yeni soru üret
//   GET  /api/search?q=        → bilgi tabanında ara (test/yardımcı)
//
// Workers AI, `AI` bağlamasıyla çağrılır; token koda hiç girmez.
// Bağlama yoksa (yerel geliştirme) CF_API_TOKEN + CF_ACCOUNT_ID gizli değişkenleriyle REST API'ye düşer.

import { search, catalog, LESSONS, SUBJECT_NAMES, lessonSummary, questionText, strip } from './kb.js';
import { TUTOR_SYSTEM, QUESTION_SYSTEM, QUESTION_STYLE, VERIFY_SYSTEM } from './prompts.js';

const MODELS = {
  fast: '@cf/deepseek-ai/deepseek-v4-flash-0731',
  deep: '@cf/deepseek-ai/deepseek-v4-pro-0813',
  backup: '@cf/zai-org/glm-5.3-flash',
  embed: '@cf/baai/bge-m3',
};
const NO_THINK = { chat_template_kwargs: { enable_thinking: false } };

const PROFILE = 'ozgur';
// Sözel mantık bulmacalarında modeller öncüller arası çelişkiyi güvenilir biçimde yakalayamıyor:
// bu derslerde yalnızca elle kontrol edilmiş sorular kullanılır.
const NO_AI_QUESTIONS = new Set(['tr4']);
const DAILY_LIMIT_PER_IP = 600;
const DAILY_LIMIT_TOTAL = 3000;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (!url.pathname.startsWith('/api/')) return env.ASSETS.fetch(request);
    try {
      if (request.method === 'OPTIONS') return new Response(null, { headers: cors() });
      switch (url.pathname) {
        case '/api/health':
          return json({ ok: true, ai: aiAvailable(env), db: !!env.DB, models: MODELS });
        case '/api/progress':
          if (request.method === 'GET') return getProgress(env);
          if (request.method === 'PUT') return putProgress(request, env);
          break;
        case '/api/chat':
          if (request.method === 'POST') return chat(request, env, ctx);
          break;
        case '/api/questions':
          if (request.method === 'POST') return questionsEndpoint(request, env);
          break;
        case '/api/bank': {
          const ls = (url.searchParams.get('l') || '').split(',').filter((id) => LESSONS[id]).slice(0, 60);
          return json({ questions: await bankQuestions(env, ls, Math.min(60, Number(url.searchParams.get('n')) || 20)) });
        }
        case '/api/real':
          return realQuestions(url, env);
        case '/api/real/stats':
          return realStats(env);
        case '/api/real/put':
          if (request.method === 'POST') return realPut(request, env);
          break;
        case '/api/tts':
          if (request.method === 'POST') return tts(request, env, ctx);
          break;
        case '/api/bank/report':
          if (request.method === 'POST') return bankReport(request, env);
          break;
        case '/api/bank/fill':
          if (request.method === 'POST') return bankFill(request, env);
          break;
        case '/api/search':
          return json({ results: await search(env, runAI, url.searchParams.get('q') || '', { k: 6 }) });
      }
      if (url.pathname.startsWith('/api/realimg/')) return realImg(url.pathname.slice(13), env);
      return json({ error: 'Bulunamadı' }, 404);
    } catch (err) {
      console.error(err);
      return json({ error: 'Sunucu hatası: ' + (err && err.message ? err.message : String(err)) }, 500);
    }
  },
};

// ---------- İlerleme ----------

async function getProgress(env) {
  if (!env.DB) return json({ data: null, updated_at: 0 });
  const row = await env.DB.prepare('SELECT data, updated_at FROM progress WHERE profile = ?').bind(PROFILE).first();
  if (!row) return json({ data: null, updated_at: 0 });
  return json({ data: JSON.parse(row.data), updated_at: row.updated_at });
}

async function putProgress(request, env) {
  if (!env.DB) return json({ error: 'Veritabanı bağlı değil' }, 503);
  const body = await request.json();
  if (!body || typeof body.data !== 'object') return json({ error: 'Geçersiz veri' }, 400);
  const text = JSON.stringify(body.data);
  if (text.length > 1_800_000) return json({ error: 'Veri çok büyük' }, 413);
  const now = Date.now();
  await env.DB.prepare(
    'INSERT INTO progress (profile, data, updated_at) VALUES (?, ?, ?) ON CONFLICT(profile) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at'
  ).bind(PROFILE, text, now).run();
  return json({ ok: true, updated_at: now });
}

// ---------- Yapay zekâ altyapısı ----------

function aiAvailable(env) {
  return !!(env.AI || (env.CF_API_TOKEN && env.CF_ACCOUNT_ID));
}

async function underLimit(request, env) {
  if (!env.DB) return true;
  const day = new Date().toISOString().slice(0, 10);
  const ip = request.headers.get('cf-connecting-ip') || 'yerel';
  const total = await env.DB.prepare('SELECT COALESCE(SUM(count),0) AS n FROM ai_usage WHERE day = ?').bind(day).first();
  if (total && total.n >= DAILY_LIMIT_TOTAL) return false;
  const row = await env.DB.prepare(
    'INSERT INTO ai_usage (day, ip, count) VALUES (?, ?, 1) ON CONFLICT(day, ip) DO UPDATE SET count = count + 1 RETURNING count'
  ).bind(day, ip).first();
  return !row || row.count <= DAILY_LIMIT_PER_IP;
}

async function runOnce(env, model, input) {
  if (env.AI) return env.AI.run(model, input);
  const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${env.CF_ACCOUNT_ID}/ai/run/${model}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.CF_API_TOKEN}`, 'content-type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`Workers AI ${res.status}: ${(await res.text()).slice(0, 300)}`);
  if (input.stream) return res.body;
  const data = await res.json();
  return data.result;
}

const isBusy = (e) => /rate limit|429|capacity|overloaded|3040|too many/i.test(String(e && e.message));
const FALLBACK = { [MODELS.fast]: MODELS.deep, [MODELS.deep]: MODELS.fast };

// Dakikalık istek sınırına takılırsa kısa bekleyip dener, sonra yedek modele geçer.
export async function runAI(env, model, input, { tries = 3 } = {}) {
  let last;
  for (let i = 0; i < tries; i++) {
    try { return await runOnce(env, model, input); } catch (e) {
      last = e;
      if (!isBusy(e)) break;
      await new Promise((r) => setTimeout(r, 900 * (i + 1) + Math.random() * 600));
    }
  }
  const alt = FALLBACK[model];
  if (alt) {
    try { return await runOnce(env, alt, input); } catch (e) { last = e; }
  }
  throw last;
}

function textOf(result) {
  if (!result) return '';
  if (typeof result === 'string') return result;
  if (result.choices && result.choices[0]) {
    const m = result.choices[0].message || {};
    return m.content || result.choices[0].text || '';
  }
  if (typeof result.response === 'string') return result.response;
  if (result.response && typeof result.response === 'object') return JSON.stringify(result.response);
  return '';
}

// Akış (SSE) okuyucu: içerik parçaları ve araç çağrıları
async function readStream(stream, onText) {
  const reader = stream.getReader();
  const dec = new TextDecoder();
  let buf = '', text = '', finish = null;
  const calls = [];
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    let idx;
    while ((idx = buf.indexOf('\n')) >= 0) {
      const line = buf.slice(0, idx).trim();
      buf = buf.slice(idx + 1);
      if (!line.startsWith('data:')) continue;
      const payload = line.slice(5).trim();
      if (!payload || payload === '[DONE]') continue;
      let chunk;
      try { chunk = JSON.parse(payload); } catch { continue; }
      if (chunk.choices && chunk.choices[0]) {
        const ch = chunk.choices[0];
        const d = ch.delta || ch.message || {};
        if (d.content) { text += d.content; await onText(d.content); }
        for (const tc of d.tool_calls || []) {
          const i = tc.index ?? calls.length;
          const cur = (calls[i] ||= { id: tc.id || `call_${i}`, type: 'function', function: { name: '', arguments: '' } });
          if (tc.id) cur.id = tc.id;
          if (tc.function?.name) cur.function.name += tc.function.name;
          if (tc.function?.arguments) cur.function.arguments += tc.function.arguments;
        }
        if (ch.finish_reason) finish = ch.finish_reason;
      } else if (typeof chunk.response === 'string' && chunk.response) {
        text += chunk.response; await onText(chunk.response);
      }
    }
  }
  return { text, calls: calls.filter(Boolean), finish };
}

// ---------- Hoca: araçlar ----------

const TOOLS = [
  {
    type: 'function',
    function: {
      name: 'bilgi_ara',
      description: 'Uygulamadaki KPSS ders notlarında, örnek sorularda ve bilgi kartlarında arama yapar. Tarih, coğrafya, vatandaşlık, güncel, Türkçe kuralları ve matematik yöntemleri için ÖNCE bunu kullan. Özgür\'e ne öğretildiyse burada yazar.',
      parameters: { type: 'object', properties: { sorgu: { type: 'string', description: 'Aranacak konu, 2-8 kelime. Örn: "Cumhurbaşkanı yetkileri", "Sivas Kongresi kararları"' } }, required: ['sorgu'] },
    },
  },
  {
    type: 'function',
    function: {
      name: 'web_ara',
      description: 'Türkçe Vikipedi\'de arar. Ders notlarında olmayan, güncel ya da ayrıntılı bilgi gerektiğinde kullan (ör. 2025-2026 olayları, bir kişinin eseri). Sonucu özetlerken kaynağı belirt.',
      parameters: { type: 'object', properties: { sorgu: { type: 'string' } }, required: ['sorgu'] },
    },
  },
  {
    type: 'function',
    function: {
      name: 'test_olustur',
      description: 'Özgür\'e sohbet içinde dokunarak çözebileceği etkileşimli bir test gösterir (mini deneme gibi). "Bana test yap", "soru sor", "kendimi deneyeyim", "yanlışlarımı tekrar çözdür" gibi isteklerde veya bir konuyu anlattıktan sonra pekiştirmek için kullan. Soruları sen metin olarak YAZMA; bu araç doğrulanmış soru bankasından seçer, gerekirse yenisini üretir.',
      parameters: {
        type: 'object',
        properties: {
          dersler: { type: 'array', items: { type: 'string' }, description: 'Ders kimlikleri (katalogdan, örn. ["tar1","tar2"]). Boş bırakılırsa Özgür\'ün çalıştığı derslerden karışık seçilir.' },
          konu: { type: 'string', description: 'Ders kimliği bilinmiyorsa konu adı' },
          adet: { type: 'integer', description: 'Soru sayısı, 3-10. Varsayılan 5' },
          kaynak: { type: 'string', enum: ['karisik', 'gercek', 'yanlislarim', 'yeni'], description: 'karisik: önce geçmiş yılların gerçek ÖSYM soruları, yetmezse ders ve banka soruları; gercek: SADECE çıkmış ÖSYM soruları (2010-2026, 1800+ soru); yanlislarim: daha önce yanlış yaptıkları; yeni: yapay zekâ yeni soru yazsın' },
          zorluk: { type: 'string', enum: ['kolay', 'sinav'] },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'yanlislarim',
      description: 'Özgür\'ün yanlış yaptığı ya da boş bıraktığı soruları (soru metni, onun seçtiği şık, doğru şık) getirir. Zayıf konularını analiz etmek için kullan.',
      parameters: { type: 'object', properties: { ders: { type: 'string', description: 'İsteğe bağlı ders kimliği ya da ders adı (tarih, turkce…)' } } },
    },
  },
  {
    type: 'function',
    function: {
      name: 'gorsel_goster',
      description: 'Anlatımı kolaylaştıran bir görsel çizer: zaman çizgisi, tablo, karşılaştırma sütunları, akış şeması, kodlama (harf harf ezber) ya da çubuk grafik. Kronoloji, karşılaştırma ve ezber için çok etkilidir; ama her cevapta değil, gerçekten yardımcı olacaksa kullan.',
      parameters: {
        type: 'object',
        properties: {
          tur: { type: 'string', enum: ['timeline', 'table', 'compare', 'flow', 'mnemonic', 'bars'] },
          baslik: { type: 'string' },
          veri: {
            type: 'object',
            description: 'timeline: {"items":[{"y":"1919","t":"Olay","d":"kısa not"}]} · table: {"head":["A","B"],"rows":[["..",".."]]} · compare: {"cols":[{"h":"Başlık","items":["madde"]}]} · flow: {"items":["adım 1","adım 2"]} · mnemonic: {"lines":[["K","Kelime: açıklama"]]} · bars: {"items":[["etiket",12,"12 soru"]]}',
          },
        },
        required: ['tur', 'veri'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'kart_ekle',
      description: 'Özgür\'ün aralıklı tekrar destesine bir bilgi kartı ekler (ön yüz soru, arka yüz kısa cevap). Ezberlenmesi gereken kritik bir bilgi geçtiğinde ya da o isteyince kullan. Bir cevapta en fazla 3 kart.',
      parameters: { type: 'object', properties: { on: { type: 'string' }, arka: { type: 'string' } }, required: ['on', 'arka'] },
    },
  },
];

const TOOL_LABEL = {
  bilgi_ara: (a) => `Ders notlarına bakıyorum: “${a.sorgu || ''}”`,
  web_ara: (a) => `Vikipedi'de araştırıyorum: “${a.sorgu || ''}”`,
  test_olustur: (a) => (a.kaynak === 'yeni' ? 'Yeni sorular yazıyorum ve kontrol ediyorum…' : 'Test hazırlıyorum…'),
  yanlislarim: () => 'Yanlışlarına bakıyorum…',
  gorsel_goster: () => 'Görsel çiziyorum…',
  kart_ekle: () => 'Tekrar destene kart ekliyorum…',
};

async function wikiSearch(q) {
  const H = { 'user-agent': 'kpss-ozgur/1.0 (egitim uygulamasi)' };
  const s = await fetch(`https://tr.wikipedia.org/w/api.php?action=query&list=search&format=json&srlimit=3&srsearch=${encodeURIComponent(q)}`, { headers: H });
  if (!s.ok) throw new Error('Vikipedi yanıt vermedi');
  const hits = ((await s.json()).query?.search || []).map((h) => h.title);
  if (!hits.length) return [];
  const e = await fetch(`https://tr.wikipedia.org/w/api.php?action=query&prop=extracts&explaintext=1&exintro=0&exchars=1800&format=json&redirects=1&titles=${encodeURIComponent(hits.join('|'))}`, { headers: H });
  const pages = Object.values((await e.json()).query?.pages || {});
  return hits.map((t) => {
    const p = pages.find((x) => x.title === t) || {};
    return { title: t, url: `https://tr.wikipedia.org/wiki/${encodeURIComponent(t.replace(/ /g, '_'))}`, text: String(p.extract || '').replace(/\n{2,}/g, '\n').slice(0, 1800) };
  });
}

function findLessons(args, profile) {
  let ids = Array.isArray(args.dersler) ? args.dersler.filter((id) => LESSONS[id]) : [];
  if (!ids.length && args.konu) {
    const k = String(args.konu).toLocaleLowerCase('tr');
    const subj = Object.entries(SUBJECT_NAMES).find(([, n]) => k.includes(n.toLocaleLowerCase('tr').slice(0, 5)));
    ids = Object.values(LESSONS).filter((l) => (subj && l.s === subj[0] && (profile.studied || []).includes(l.id)) || strip(l.title).toLocaleLowerCase('tr').split(/\s+/).some((w) => w.length > 4 && k.includes(w.slice(0, 5)))).map((l) => l.id);
    if (!ids.length && subj) ids = Object.values(LESSONS).filter((l) => l.s === subj[0] && l.day && l.day <= (profile.day || 9)).map((l) => l.id);
  }
  if (!ids.length) ids = (profile.studied || []).filter((id) => LESSONS[id]);
  if (!ids.length) ids = Object.values(LESSONS).filter((l) => l.day === (profile.day || 1)).map((l) => l.id);
  return ids.slice(0, 12);
}

function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

async function buildQuiz(env, args, profile, status) {
  const n = Math.max(3, Math.min(10, Number(args.adet) || 5));
  const okSet = new Set(profile.ok || []);
  let qs = [];
  let title = 'Mini test';
  if (args.kaynak === 'yanlislarim') {
    title = 'Yanlışlarını yeniden çöz';
    for (const w of profile.wrong || []) {
      const [lid, qi] = String(w.k || '').split('#');
      const q = LESSONS[lid]?.quiz?.[Number(qi)];
      if (q) qs.push({ ...q, key: w.k, l: lid });
    }
    qs = shuffle(qs).slice(0, n);
  }
  const ids = findLessons(args, profile);
  // Önce gerçek ÖSYM soruları (sınava en yakın malzeme); doğru çözdükleri tekrar gelmez
  if (qs.length < n && args.kaynak !== 'yeni') {
    const real = await realByLessons(env, ids, n - qs.length, { exclude: [...okSet].filter((k) => k.startsWith('real:')) });
    qs.push(...real.map((q) => ({ ...q, ex: q.ex || (q.bilgi ? `**Sınanan bilgi:** ${q.bilgi}` : ''), tip: `Bu soru ${q.src} sınavında soruldu.` })));
    if (real.length && title === 'Mini test') title = 'Gerçek ÖSYM soruları';
  }
  if (qs.length < n && args.kaynak !== 'yeni' && args.kaynak !== 'gercek') {
    const pool = [];
    ids.forEach((id) => (LESSONS[id].quiz || []).forEach((q, i) => {
      const key = `${id}#${i}`;
      if (!qs.some((x) => x.key === key)) pool.push({ ...q, key, l: id, _ok: okSet.has(key) });
    }));
    // önce henüz doğru çözmediği sorular
    const fresh = shuffle(pool.filter((q) => !q._ok));
    const seen = shuffle(pool.filter((q) => q._ok));
    qs.push(...[...fresh, ...seen].slice(0, n - qs.length));
    if (title === 'Mini test') title = ids.length === 1 ? strip(LESSONS[ids[0]].title) : 'Çalıştığın konulardan karışık';
  }
  if (qs.length < n && args.kaynak !== 'yeni') {
    const bank = await bankQuestions(env, ids, n - qs.length);
    qs.push(...bank.filter((q) => !okSet.has(q.key)));
  }
  if (qs.length < n || args.kaynak === 'yeni') {
    const need = args.kaynak === 'yeni' ? n : n - qs.length;
    const target = LESSONS[ids.find((id) => !NO_AI_QUESTIONS.has(id))];
    if (target) {
      await status('Yeni sorular yazıyorum ve her birini ikinci kez kontrol ediyorum (20-40 sn)…');
      try {
        const gen = await generateQuestions(env, {
          subject: SUBJECT_NAMES[target.s], topic: strip(target.title),
          summary: ids.slice(0, 3).map((id) => lessonSummary(LESSONS[id], 3000)).join('\n\n'),
          count: need, level: args.zorluk === 'sinav' ? 'hard' : 'easy', lessonId: target.id,
        });
        qs.push(...gen.map((q) => ({ ...q, l: target.id })));
        if (args.kaynak === 'yeni') title = `${strip(target.title)} · yeni sorular`;
      } catch (e) { /* bankadakilerle devam */ }
    }
  }
  qs = qs.slice(0, n).map((q) => ({ q: q.q, o: q.o, a: q.a, ex: q.ex || '', tip: q.tip || '', l: q.l, key: q.key, ai: !!q.ai, viz: q.viz || null, img: q.img || null, needimg: !!q.needimg, real: !!q.real, src: q.src || null }));
  return { type: 'quiz', id: `t${Date.now().toString(36)}`, title, questions: qs };
}

function hash(s) { let h = 0; for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) | 0; return (h >>> 0).toString(36); }

const VIZ_OK = {
  timeline: (v) => Array.isArray(v.items) && v.items.every((i) => i && i.y != null && i.t),
  table: (v) => Array.isArray(v.rows) && v.rows.every(Array.isArray),
  compare: (v) => Array.isArray(v.cols) && v.cols.every((c) => c && c.h && Array.isArray(c.items)),
  flow: (v) => Array.isArray(v.items) && v.items.every((x) => typeof x === 'string'),
  mnemonic: (v) => Array.isArray(v.lines) && v.lines.every((l) => Array.isArray(l) && l.length >= 2),
  bars: (v) => Array.isArray(v.items) && v.items.every((i) => Array.isArray(i) && typeof i[1] === 'number'),
};

async function runTool(env, name, args, profile, emit, status) {
  switch (name) {
    case 'bilgi_ara': {
      const r = await search(env, runAI, String(args.sorgu || ''), { k: 5 });
      if (r.length) await emit({ sources: r.map((x) => ({ t: x.where })) });
      const past = await pastFacts(env, String(args.sorgu || ''));
      const pastTxt = past.length ? `\n\n---\n\n[GEÇMİŞ SINAVLARDA BU KONUDA SORULAN BİLGİLER]\n${past.join('\n')}` : '';
      return r.length ? r.map((x) => `[${x.where} · ${x.title}]\n${x.text}`).join('\n\n---\n\n') + pastTxt : pastTxt ? pastTxt.trim() : 'Ders notlarında bu konuda bir şey bulunamadı. Gerekirse web_ara kullan ya da bildiğin kesin bilgiyle, emin olmadığını belirterek cevap ver.';
    }
    case 'web_ara': {
      const r = await wikiSearch(String(args.sorgu || ''));
      if (r.length) await emit({ sources: r.map((x) => ({ t: 'Vikipedi: ' + x.title, u: x.url })) });
      return r.length ? r.map((x) => `[Vikipedi: ${x.title}] ${x.url}\n${x.text}`).join('\n\n---\n\n') : 'Vikipedi\'de sonuç çıkmadı.';
    }
    case 'test_olustur': {
      const block = await buildQuiz(env, args, profile, status);
      if (!block.questions.length) return 'Test için soru bulunamadı. Özgür\'e kısaca açıkla ve konuyu anlatmayı öner.';
      await emit({ block });
      return `Ekranda ${block.questions.length} soruluk etkileşimli test gösterildi ("${block.title}"; dersler: ${[...new Set(block.questions.map((q) => q.l))].join(', ')}). Soruları ve cevapları TEKRAR YAZMA. Tek cümleyle başlamasını söyle (ör. süre tutmadan, emin olmadığında şıkları elemeyi dene). Özgür bitirince sonuçları sana mesaj olarak gelecek; o zaman analiz edeceksin.`;
    }
    case 'yanlislarim': {
      const d = String(args.ders || '').toLocaleLowerCase('tr');
      const list = (profile.wrong || []).filter((w) => {
        const lid = String(w.k).split('#')[0];
        return !d || lid === d || (LESSONS[lid] && (LESSONS[lid].s === d || SUBJECT_NAMES[LESSONS[lid].s].toLocaleLowerCase('tr').startsWith(d.slice(0, 4))));
      }).slice(-15);
      if (!list.length) return 'Kayıtlı yanlış yok.';
      return list.map((w) => {
        const [lid, qi] = String(w.k).split('#');
        const q = LESSONS[lid]?.quiz?.[Number(qi)];
        const head = `[${lid} · ${LESSONS[lid] ? strip(LESSONS[lid].title) : ''}] ${w.n > 1 ? `(${w.n} kez yanlış)` : ''}`;
        if (q) return `${head}\n${questionText(q)}\nÖzgür'ün cevabı: ${w.p == null || w.p < 0 ? 'boş' : 'ABCDE'[w.p] || '?'}`;
        return `${head}\n${w.q || ''}`;
      }).join('\n\n');
    }
    case 'gorsel_goster': {
      const tur = String(args.tur || '');
      let veri = args.veri;
      if (typeof veri === 'string') { try { veri = JSON.parse(veri); } catch { veri = null; } }
      if (!veri || !VIZ_OK[tur] || !VIZ_OK[tur](veri)) return 'Görsel verisi hatalı olduğu için çizilemedi. Aynı bilgiyi markdown tablo ya da liste ile ver.';
      await emit({ block: { type: 'viz', title: args.baslik ? String(args.baslik).slice(0, 120) : '', viz: { type: tur, ...veri } } });
      return 'Görsel ekranda gösterildi; içeriğini tekrar tablo olarak yazma, gerekirse kısaca yorumla.';
    }
    case 'kart_ekle': {
      const f = String(args.on || '').slice(0, 300), b = String(args.arka || '').slice(0, 400);
      if (!f || !b) return 'Kart boş olamaz.';
      await emit({ block: { type: 'card', f, b } });
      return 'Kart Özgür\'ün tekrar destesine eklendi.';
    }
  }
  return 'Bilinmeyen araç.';
}

// ---------- Hoca: sohbet ----------

function contextText(c) {
  if (!c || typeof c !== 'object') return '';
  const out = [];
  const l = c.lessonId && LESSONS[c.lessonId];
  if (l) out.push(`Ders: ${SUBJECT_NAMES[l.s]} · ${l.day ? l.day + '. gün' : 'ekstra'} · ${strip(l.title)} (kimlik: ${l.id})`);
  if (c.step) out.push(`Bulunduğu adım: ${String(c.step).slice(0, 120)}`);
  if (c.screen) out.push(`Ekranda gördüğü içerik:\n${String(c.screen).slice(0, 3000)}`);
  if (c.question) out.push(`Baktığı soru:\n${String(c.question).slice(0, 2500)}`);
  if (c.answer) out.push(`Özgür'ün bu sorudaki durumu: ${String(c.answer).slice(0, 300)}`);
  if (l) out.push(`Bu derste anlatılanların özeti (kaynak olarak kullan):\n${lessonSummary(l, 4500)}`);
  return out.length ? `\n\n## ŞU AN EKRANDA (Özgür bunu görüyor; "hangi adımdasın" diye SORMA, buradan bil)\n${out.join('\n')}` : '';
}

function profileText(p) {
  if (!p || typeof p !== 'object') return '';
  return `\n\n## ÖZGÜR'ÜN DURUMU (uygulamadan, canlı)\n${String(p.text || '').slice(0, 5000)}`;
}

async function chat(request, env, ctx) {
  if (!aiAvailable(env)) return json({ error: 'Yapay zekâ bağlı değil.' }, 503);
  if (!(await underLimit(request, env))) return json({ error: 'Bugünkü soru hakkı doldu, yarın tekrar dene.' }, 429);
  const body = await request.json();
  const profile = body.profile && typeof body.profile === 'object' ? body.profile : {};
  const history = (Array.isArray(body.messages) ? body.messages : []).slice(-16)
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
    .map((m) => ({ role: m.role, content: m.content.slice(0, 6000) }));
  if (!history.length || history[history.length - 1].role !== 'user') return json({ error: 'Mesaj yok' }, 400);

  const system = TUTOR_SYSTEM
    .replace('{{TODAY}}', String(profile.today || ''))
    .replace('{{CATALOG}}', catalog())
    + profileText(profile) + contextText(body.context);
  const messages = [{ role: 'system', content: system }, ...history];
  const deep = body.mode === 'deep';
  const model = deep ? MODELS.deep : MODELS.fast;

  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();
  const enc = new TextEncoder();
  let closed = false;
  const emit = async (obj) => { if (!closed) { try { await writer.write(enc.encode(`data: ${JSON.stringify(obj)}\n\n`)); } catch { closed = true; } } };
  const status = (s) => emit({ status: s });
  const lastUser = history[history.length - 1].content;

  ctx.waitUntil((async () => {
    let answer = '';
    const used = [];
    try {
      for (let round = 0; round < 5; round++) {
        const lastRound = round === 4;
        let res;
        const input = {
          messages, stream: true, temperature: 0.35,
          max_completion_tokens: deep ? 5000 : 3500, ...NO_THINK,
          ...(lastRound ? {} : { tools: TOOLS }),
        };
        const stream = await runAI(env, model, input);
        res = await readStream(stream, async (t) => { answer += t; await emit({ t }); });
        if (!res.calls.length) break;
        if (res.text.trim()) await emit({ t: '\n\n' });
        messages.push({ role: 'assistant', content: res.text || '', tool_calls: res.calls });
        for (const call of res.calls) {
          let args = {};
          try { args = JSON.parse(call.function.arguments || '{}'); } catch { args = {}; }
          const name = call.function.name;
          used.push(name);
          await status((TOOL_LABEL[name] || (() => 'Çalışıyorum…'))(args));
          let out;
          try { out = await runTool(env, name, args, profile, emit, status); }
          catch (e) { out = `Araç hatası: ${e.message}. Aracı tekrar deneme; elindeki bilgiyle devam et.`; }
          messages.push({ role: 'tool', tool_call_id: call.id, content: String(out).slice(0, 9000) });
        }
        await status('Yazıyorum…');
      }
      if (!answer.trim()) {
        // Model boş döndüyse: araçsız, düz bir cevap iste (yedek model dahil)
        await status('Cevabı toparlıyorum…');
        for (const m of [MODELS.fast, MODELS.backup]) {
          try {
            const r = await runAI(env, m, { messages: [...messages, { role: 'user', content: 'Şimdi Özgür\'e cevabını yaz.' }], max_completion_tokens: 3000, temperature: 0.3, ...NO_THINK });
            const t = textOf(r).replace(/<think>[\s\S]*?<\/think>/g, '').trim();
            if (t) { answer = t; await emit({ t }); break; }
          } catch (e) { /* sıradaki */ }
        }
      }
      if (!answer.trim() && !used.includes('test_olustur') && !used.includes('gorsel_goster')) await emit({ error: 'Hoca bu sefer cevap üretemedi. Soruyu biraz farklı sorup tekrar dener misin?' });
      await emit({ done: true });
    } catch (err) {
      await emit({ error: 'Cevap yarıda kesildi: ' + err.message });
    } finally {
      closed = true;
      try { await writer.close(); } catch { /* kapalı */ }
      if (env.DB) {
        await env.DB.prepare('INSERT INTO ai_log (ts, kind, lesson, question, answer) VALUES (?, ?, ?, ?, ?)')
          .bind(Date.now(), 'chat' + (used.length ? ':' + [...new Set(used)].join(',') : ''), body.context && body.context.lessonId ? String(body.context.lessonId).slice(0, 40) : null,
            lastUser.slice(0, 2000), answer.slice(0, 4000))
          .run().catch(() => {});
      }
    }
  })());

  return new Response(readable, {
    headers: { 'content-type': 'text/event-stream; charset=utf-8', 'cache-control': 'no-cache', 'x-accel-buffering': 'no', ...cors() },
  });
}

// ---------- Soru üretme ----------

async function generateRaw(env, { subject, topic, summary, count, level }) {
  const messages = [
    { role: 'system', content: QUESTION_SYSTEM },
    {
      role: 'user',
      content: `Ders: ${String(subject || '').slice(0, 40)}\nKonu: ${String(topic || '').slice(0, 200)}\n` +
        `Zorluk: ${level === 'hard' ? 'gerçek sınav ayarı' : 'kolay-orta, konuyu pekiştiren ama yine ÖSYM üslubunda'}\n\n` +
        `${QUESTION_STYLE[subject] || ''}\n\nDers notları (bilgiyi SADECE buradan ve kesin bildiğin gerçeklerden al):\n${String(summary || '').slice(0, 9000)}\n\n${count} soru yaz.`,
    },
  ];
  let lastErr = '';
  const order = level === 'hard' ? [MODELS.deep, MODELS.fast] : [MODELS.fast, MODELS.deep];
  for (const model of order) {
    try {
      const result = await runAI(env, model, { messages, max_completion_tokens: 8000, temperature: 0.6, ...NO_THINK });
      const parsed = parseQuestions(textOf(result));
      if (parsed && parsed.length) return { qs: parsed, model };
      lastErr = 'Model geçerli soru döndürmedi';
    } catch (err) { lastErr = err.message; }
  }
  throw new Error(lastErr);
}

// İkinci bir çağrı soruyu cevap anahtarını görmeden şık şık çözer. Tek doğru şık, anahtarla aynı olmalı.
async function verifyOnce(env, q, order) {
  // order: şıkların gösterim sırası (karıştırılmış olabilir); cevap orijinal indekse çevrilir
  const user = `${q.q}\n${order.map((j, k) => `${'ABCDE'[k]}) ${q.o[j]}`).join('\n')}`;
  try {
    const r = await runAI(env, MODELS.fast, { messages: [{ role: 'system', content: VERIFY_SYSTEM }, { role: 'user', content: user }], max_completion_tokens: 1800, temperature: 0.1, ...NO_THINK });
    const t = textOf(r);
    const j = JSON.parse(t.slice(t.indexOf('{'), t.lastIndexOf('}') + 1));
    const fits = (j.siklar || []).filter((x) => x.uyar).map((x) => x.h);
    const k = 'ABCDE'.indexOf(j.cevap);
    return { ok: k >= 0 && order[k] === q.a && fits.length === 1, note: j.kusur };
  } catch (e) { return { ok: false, err: true, note: 'denetlenemedi: ' + String(e.message).slice(0, 80) }; }
}

// İki bağımsız denetim (ikincisinde şıklar karışık): ikisi de anahtarla aynı tek şıkkı bulmalı.
async function verifyQuestion(env, q) {
  const order2 = [0, 1, 2, 3, 4].sort(() => Math.random() - 0.5);
  const once = async (o) => { const c = await verifyOnce(env, q, o); return c.err ? verifyOnce(env, q, o) : c; };
  const [a, b] = await Promise.all([once([0, 1, 2, 3, 4]), once(order2)]);
  return { ok: a.ok && b.ok, note: !a.ok ? a.note : b.note };
}

async function mapLimit(items, n, fn) {
  const out = new Array(items.length);
  let i = 0;
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, async () => {
    while (i < items.length) { const k = i++; out[k] = await fn(items[k], k); }
  }));
  return out;
}

async function generateQuestions(env, { subject, topic, summary, count, level, lessonId }) {
  if (lessonId && NO_AI_QUESTIONS.has(lessonId)) throw new Error('Bu konuda yapay zekâ sorusu üretilmiyor; sözel mantıkta sadece kontrol edilmiş sorular kullanılıyor');
  const { qs, model } = await generateRaw(env, { subject, topic, summary, count: Math.min(10, count + 2), level });
  const checks = await mapLimit(qs, 2, (q) => verifyQuestion(env, q));
  const good = qs.filter((q, i) => checks[i].ok).map((q) => ({ ...q, verified: true }));
  if (env.DB && lessonId && good.length) {
    const now = Date.now();
    await env.DB.batch(good.map((q) => env.DB.prepare('INSERT OR IGNORE INTO qbank (id, lesson, level, data, model, created) VALUES (?, ?, ?, ?, ?, ?)')
      .bind(`ai:${hash(q.q)}`, lessonId, level || 'easy', JSON.stringify(q), model, now))).catch(() => {});
  }
  console.log(JSON.stringify({ gen: lessonId, made: qs.length, kept: good.length, rejected: checks.filter((c) => !c.ok).map((c) => c.note) }));
  if (!good.length) throw new Error('Üretilen soruların hiçbiri denetimden geçmedi');
  return good.slice(0, count).map((q) => ({ ...q, key: `ai:${hash(q.q)}` }));
}

async function bankQuestions(env, lessons, n) {
  if (!env.DB || !lessons.length) return [];
  const rs = await env.DB.prepare(`SELECT id, lesson, data FROM qbank WHERE lesson IN (${lessons.map(() => '?').join(',')}) ORDER BY RANDOM() LIMIT ?`).bind(...lessons, n).all();
  return (rs.results || []).map((r) => ({ ...JSON.parse(r.data), key: r.id, l: r.lesson }));
}

async function questionsEndpoint(request, env) {
  if (!aiAvailable(env)) return json({ error: 'Yapay zekâ bağlı değil.' }, 503);
  if (!(await underLimit(request, env))) return json({ error: 'Bugünkü soru hakkı doldu, yarın tekrar dene.' }, 429);
  const body = await request.json();
  const count = Math.max(1, Math.min(8, Number(body.count) || 5));
  const l = body.lessonId && LESSONS[body.lessonId];
  try {
    const qs = await generateQuestions(env, {
      subject: l ? SUBJECT_NAMES[l.s] : body.subject, topic: l ? strip(l.title) : body.topic,
      summary: l ? lessonSummary(l, 9000) : body.summary, count, level: body.level, lessonId: l ? l.id : null,
    });
    return json({ questions: qs });
  } catch (e) {
    return json({ error: 'Soru üretilemedi: ' + e.message }, 502);
  }
}

// Sorguyla ilgili, geçmiş ÖSYM sınavlarında gerçekten sorulmuş bilgiler
async function pastFacts(env, query) {
  if (!env.DB) return [];
  const words = [...new Set(String(query).toLocaleLowerCase('tr').split(/[^a-zçğıöşüâîû0-9]+/).filter((w) => w.length >= 4))].slice(0, 5);
  if (!words.length) return [];
  const cond = words.map(() => '(LOWER(bilgi) LIKE ? OR LOWER(konu) LIKE ?)').join(' OR ');
  const args = words.flatMap((w) => [`%${w.slice(0, 6)}%`, `%${w.slice(0, 6)}%`]);
  try {
    const rs = await env.DB.prepare(`SELECT year, level, bilgi FROM real_q WHERE bilgi IS NOT NULL AND (${cond}) ORDER BY year DESC LIMIT 8`).bind(...args).all();
    return (rs.results || []).map((r) => `- ${r.year} ${LEVEL_NAME[r.level] || ''}: ${r.bilgi}`);
  } catch (e) { return []; }
}

// ---------- Gerçek ÖSYM soruları (2010-2026 kitapçıkları) ----------
// Soru metinleri ve görselleri depoda değil, sadece D1'de durur.
// Yükleme parolasız ama güvenli: public/kb/realq-manifest.json her kaydın SHA-256 parmak izini içerir;
// sadece parmak izi tutan veri yazılabilir.
let MANIFEST = null;
async function manifest(env) {
  if (MANIFEST) return MANIFEST;
  const r = await env.ASSETS.fetch(new Request('https://assets.local/kb/realq-manifest.json'));
  MANIFEST = r.ok ? await r.json() : {};
  return MANIFEST;
}
async function sha256hex(buf) {
  const d = await crypto.subtle.digest('SHA-256', buf);
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, '0')).join('');
}
function b64ToBytes(b64) { const s = atob(b64); const u = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i); return u; }

async function realPut(request, env) {
  if (!env.DB) return json({ error: 'DB yok' }, 503);
  const m = await manifest(env);
  const body = await request.json();
  const stmts = []; let ok = 0, bad = 0;
  for (const it of body.items || []) {
    const e = m[it.id];
    if (!e) { bad++; continue; }
    if (it.q) {
      const raw = JSON.stringify(it.q);
      if (await sha256hex(new TextEncoder().encode(raw)) !== e.q) { bad++; continue; }
      const q = it.q;
      stmts.push(env.DB.prepare('INSERT OR REPLACE INTO real_q (id, exam, level, year, sec, n, s, lesson, konu, tip, kok, stem, o, a, needimg, bilgi) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)')
        .bind(it.id, q.exam, q.level, q.year, q.sec, q.n, q.s, q.lesson, q.konu, q.tip, q.kok, q.stem, JSON.stringify(q.o), q.a, q.needimg ? 1 : 0, q.bilgi));
      ok++;
    }
    if (it.img) {
      const bytes = b64ToBytes(it.img);
      if (await sha256hex(bytes) !== e.i) { bad++; continue; }
      stmts.push(env.DB.prepare('INSERT OR REPLACE INTO real_img (id, data) VALUES (?, ?)').bind(it.id, bytes));
      ok++;
    }
  }
  if (stmts.length) await env.DB.batch(stmts);
  return json({ ok, bad });
}

async function realImg(id, env) {
  if (!env.DB || !/^[\w-]{5,40}$/.test(id)) return new Response('yok', { status: 404 });
  const row = await env.DB.prepare('SELECT data FROM real_img WHERE id = ?').bind(id).first();
  if (!row) return new Response('yok', { status: 404 });
  const d = row.data;
  const bytes = d instanceof ArrayBuffer ? new Uint8Array(d) : ArrayBuffer.isView(d) ? d : new Uint8Array(d);
  return new Response(bytes, { headers: { 'content-type': 'image/jpeg', 'cache-control': 'public, max-age=604800' } });
}

const LEVEL_NAME = { onl: 'Ön Lisans', ort: 'Ortaöğretim', lis: 'Lisans' };
function realRow(r) {
  return {
    key: `real:${r.id}`, id: r.id, l: r.lesson, s: r.s, q: r.stem, o: JSON.parse(r.o || '[]'), a: r.a, konu: r.konu, bilgi: r.bilgi,
    img: `/api/realimg/${r.id}`, needimg: !!r.needimg, real: true, src: `${r.year} KPSS ${LEVEL_NAME[r.level] || ''}`,
  };
}
export async function realByLessons(env, lessons, n, { subject = null, exclude = [] } = {}) {
  if (!env.DB) return [];
  const where = [];
  const args = [];
  if (lessons && lessons.length) { where.push(`lesson IN (${lessons.map(() => '?').join(',')})`); args.push(...lessons); }
  if (subject) { where.push('s = ?'); args.push(subject); }
  where.push('a IS NOT NULL');
  // ön lisans ve son yıllar önce gelsin: ağırlıklı rastgele sıralama
  const rs = await env.DB.prepare(`SELECT * FROM real_q WHERE ${where.join(' AND ')} ORDER BY (CASE level WHEN 'onl' THEN 0 WHEN 'ort' THEN 1 ELSE 2 END) + (2026 - year) / 12.0 + (ABS(RANDOM()) % 1000) / 250.0 LIMIT ?`)
    .bind(...args, n + exclude.length).all();
  const ex = new Set(exclude);
  return (rs.results || []).filter((r) => !ex.has(`real:${r.id}`)).slice(0, n).map(realRow);
}
async function realQuestions(url, env) {
  const ls = (url.searchParams.get('l') || '').split(',').filter((id) => LESSONS[id]).slice(0, 80);
  const s = url.searchParams.get('s');
  const n = Math.min(60, Number(url.searchParams.get('n')) || 10);
  const exclude = (url.searchParams.get('x') || '').split(',').filter(Boolean).slice(0, 300);
  return json({ questions: await realByLessons(env, ls, n, { subject: s && SUBJECT_NAMES[s] ? s : null, exclude }) });
}
async function realStats(env) {
  if (!env.DB) return json({});
  const rs = await env.DB.prepare('SELECT lesson, COUNT(*) AS n FROM real_q WHERE a IS NOT NULL AND lesson IS NOT NULL GROUP BY lesson').all();
  return json(Object.fromEntries((rs.results || []).map((r) => [r.lesson, r.n])));
}

// ---------- Sesli okuma: Cartesia (Türkçe ses) ----------
// Anahtar yalnızca Worker gizli değişkeninden (CARTESIA_API_KEY) okunur; kodda ve depoda yoktur.
const TTS_VOICE = '5a31e4fb-f823-4359-aa91-82c0ae9a991c';
async function sha(text) {
  const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 32);
}
async function tts(request, env, ctx) {
  if (!env.CARTESIA_API_KEY) return json({ error: 'tts-kapali' }, 503);
  const body = await request.json().catch(() => ({}));
  const text = String(body.text || '').replace(/\s+/g, ' ').trim().slice(0, 700);
  if (!text) return json({ error: 'Metin yok' }, 400);
  const cacheKey = new Request(`https://tts-cache.kpss-ozgur/${await sha(`sonic-3.6|${TTS_VOICE}|${text}`)}`);
  const cache = caches.default;
  const hit = await cache.match(cacheKey).catch(() => null);
  if (hit) return hit;
  if (!(await underLimit(request, env))) return json({ error: 'Bugünkü hak doldu' }, 429);
  const r = await fetch('https://api.cartesia.ai/tts/bytes', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.CARTESIA_API_KEY}`, 'Cartesia-Version': '2026-08-14', 'content-type': 'application/json' },
    body: JSON.stringify({
      model_id: 'sonic-3.6', transcript: text, language: 'tr',
      voice: { mode: 'id', id: TTS_VOICE },
      output_format: { container: 'mp3', sample_rate: 44100, bit_rate: 128000 },
    }),
  });
  if (!r.ok) { console.error('tts', r.status, (await r.text()).slice(0, 200)); return json({ error: `Ses servisi ${r.status}` }, 502); }
  const audio = await r.arrayBuffer();
  const res = new Response(audio, { headers: { 'content-type': 'audio/mpeg', 'cache-control': 'public, max-age=2592000' } });
  ctx.waitUntil(cache.put(cacheKey, res.clone()).catch(() => {}));
  return res;
}

// Özgür bir soruyu hatalı bulursa: silmeden önce hakem incelemesi.
// Hakem (derin model) itirazı görerek soruyu şık şık değerlendirir; ayrıca iki bağımsız kör denetim yapılır.
// Kusur doğrulanırsa soru bankadan çıkar; değilse kalır ve Özgür'e neden doğru olduğu anlatılır.
async function bankReport(request, env) {
  if (!env.DB) return json({ error: 'DB yok' }, 503);
  const b = await request.json();
  const id = typeof b.id === 'string' ? b.id.slice(0, 40) : '';
  if (!id.startsWith('ai:')) return json({ error: 'Geçersiz soru' }, 400);
  if (!(await underLimit(request, env))) return json({ error: 'Bugünkü hak doldu' }, 429);
  const row = await env.DB.prepare('SELECT data FROM qbank WHERE id = ?').bind(id).first();
  const q = row ? JSON.parse(row.data) : (b.q && Array.isArray(b.q.o) && b.q.o.length === 5 ? b.q : null);
  if (!q) return json({ removed: false, verdict: 'yok', why: 'Soru bankada bulunamadı (daha önce çıkarılmış olabilir).' });
  const reason = String(b.reason || '').slice(0, 500);
  const L = 'ABCDE';
  const hakemMsg = `Soru:\n${q.q}\n${q.o.map((o, j) => `${L[j]}) ${o}`).join('\n')}\nCevap anahtarı: ${L[q.a]}\nAçıklama: ${q.ex || '-'}\n\nÖğrencinin itirazı: ${reason || '(gerekçe yazmadı, sadece hatalı dedi)'}\n\n` +
    'Sen ÖSYM itiraz komisyonusun. Her şıkkı tek tek değerlendir (olumsuz köklerde cevap yanlış/olmayan ifadedir). Soru kusurlu mu? Kusur: birden fazla doğru şık, anahtar yanlış, bilgi hatası, kök belirsiz ya da tartışmalı bilgi. ' +
    'Yalnızca JSON: {"karar":"kusurlu"|"gecerli","dogru_sik":"A-E ya da null","aciklama":"öğrenciye 2-4 cümle, sade Türkçe"}';
  const [hakem, blind] = await Promise.all([
    runAI(env, MODELS.deep, { messages: [{ role: 'user', content: hakemMsg }], max_completion_tokens: 2500, temperature: 0.1, ...NO_THINK })
      .then((r) => { const t = textOf(r); return JSON.parse(t.slice(t.indexOf('{'), t.lastIndexOf('}') + 1)); })
      .catch(() => null),
    verifyQuestion(env, q),
  ]);
  const flawed = (hakem && hakem.karar === 'kusurlu') || !blind.ok;
  if (flawed) await env.DB.prepare('DELETE FROM qbank WHERE id = ?').bind(id).run();
  const hk = hakem && hakem.aciklama ? String(hakem.aciklama).slice(0, 800) : '';
  let why;
  if (flawed && hakem && hakem.karar === 'kusurlu') why = hk;
  else if (flawed) why = 'İtiraz komisyonu anahtarı doğru buldu, ama iki bağımsız kör denetim bu soruda tek bir doğru şık üzerinde birleşemedi. Tartışmalı soru sınav hazırlığına zarar verir; bu yüzden bankadan çıkarıldı.';
  else why = hk || 'Tekrar denetimde soru tek doğru cevaplı çıktı.';
  await env.DB.prepare('INSERT INTO ai_log (ts, kind, lesson, question, answer) VALUES (?, ?, ?, ?, ?)')
    .bind(Date.now(), 'rapor:' + (flawed ? 'silindi' : 'kaldi'), q.l || null, `${id} ${reason}`.slice(0, 600), why).run().catch(() => {});
  return json({ removed: flawed, verdict: flawed ? 'kusurlu' : 'gecerli', why, answer: L[q.a] });
}

// Soru bankasını önceden doldurmak için: bir ders için doğrulanmış sorular üretip kaydeder
async function bankFill(request, env) {
  if (!aiAvailable(env) || !env.DB) return json({ error: 'AI/DB yok' }, 503);
  if (!(await underLimit(request, env))) return json({ error: 'Limit' }, 429);
  const body = await request.json();
  const l = LESSONS[body.lessonId];
  if (!l) return json({ error: 'Ders yok' }, 400);
  const have = await env.DB.prepare('SELECT COUNT(*) AS n FROM qbank WHERE lesson = ?').bind(l.id).first();
  try {
    const qs = await generateQuestions(env, { subject: SUBJECT_NAMES[l.s], topic: strip(l.title), summary: lessonSummary(l, 9000), count: Math.min(8, Number(body.count) || 6), level: body.level === 'hard' ? 'hard' : 'easy', lessonId: l.id });
    return json({ lesson: l.id, before: have ? have.n : 0, added: qs.length });
  } catch (e) { return json({ lesson: l.id, error: e.message }, 502); }
}

function parseQuestions(text) {
  if (!text) return null;
  text = text.replace(/<think>[\s\S]*?<\/think>/g, '');
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start < 0 || end <= start) return null;
  let obj;
  try { obj = JSON.parse(text.slice(start, end + 1)); } catch { return null; }
  const list = Array.isArray(obj) ? obj : obj.questions;
  if (!Array.isArray(list)) return null;
  return list
    .filter((q) => q && typeof q.q === 'string' && Array.isArray(q.o) && q.o.length === 5 && Number.isInteger(q.a) && q.a >= 0 && q.a < 5)
    .filter((q) => new Set(q.o.map((x) => String(x).trim().toLocaleLowerCase('tr'))).size === 5)
    .map((q) => ({
      q: q.q.slice(0, 1500),
      o: q.o.map((x) => String(x).replace(/^[A-E][).]\s*/, '').slice(0, 300)),
      a: q.a,
      ex: String(q.ex || '').slice(0, 1500),
      tip: String(q.tip || '').slice(0, 400),
      ai: true,
    }));
}

// ---------- yardımcılar ----------

function cors() {
  return {
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET, PUT, POST, OPTIONS',
    'access-control-allow-headers': 'content-type',
  };
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...cors() },
  });
}
