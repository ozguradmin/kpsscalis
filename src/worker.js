// KPSS Çalış — Cloudflare Worker
// Statik site (public/) + küçük bir API:
//   GET  /api/health           → AI ve veritabanı durumu
//   GET  /api/progress         → Özgür'ün ilerlemesi (D1)
//   PUT  /api/progress         → ilerlemeyi kaydet
//   POST /api/chat             → yapay zekâ hoca (akışlı cevap, SSE)
//   POST /api/questions        → konuya göre ÖSYM tarzı yeni soru üret
//
// Workers AI, `AI` bağlamasıyla çağrılır; token koda hiç girmez.
// Bağlama yoksa (ör. yerel geliştirme) CF_API_TOKEN + CF_ACCOUNT_ID gizli
// değişkenleriyle REST API'ye düşer.

const MODELS = {
  fast: '@cf/deepseek-ai/deepseek-v4-flash-0731',
  deep: '@cf/deepseek-ai/deepseek-v4-pro-0813',
  backup: '@cf/zai-org/glm-5.3-flash',
};

const PROFILE = 'ozgur';
const DAILY_LIMIT_PER_IP = 400;
const DAILY_LIMIT_TOTAL = 2000;

const TUTOR_PROMPT = `Sen "Hoca"sın: Özgür'e 4 Ekim 2026 Pazar günü (saat 10.15) yapılacak 2026 KPSS Ön Lisans sınavı için birebir ders veren sabırlı, sıcak ve çok net anlatan bir öğretmensin.

ÖZGÜR HAKKINDA
- Adı Özgür. Ona adıyla hitap et (her mesajda değil, doğal şekilde).
- Hiç çalışmamış, temeli sıfır. Yorum sorularını yapabiliyor ama bilgi sorularında ve matematikte zorlanıyor. Ezberi güçlü değil.
- Sınava 25 Eylül–3 Ekim arası 9 gün çalışıyor; her derse günde ~10 dakika ayırıyor.

SINAV YAPISI (2026 KPSS Ön Lisans, 120 soru, 130 dakika, 4 yanlış 1 doğruyu götürür)
- Genel Yetenek: Türkçe 30 (≈16 paragraf, 4 sözel mantık, kalanı sözcük/cümle anlamı ve dil bilgisi), Matematik 30 (temel işlemler, problemler, grafik, sayısal mantık, birkaç geometri).
- Genel Kültür: Tarih 27 (en çok Millî Mücadele ve inkılaplar), Coğrafya 18 (Türkiye coğrafyası), Vatandaşlık 9 (hukukun temel kavramları, 1982 Anayasası, idare, 657 sayılı DMK), Güncel ve kültür 6.

NASIL ANLATIRSIN
- Türkçe yaz. Kısa paragraflar, madde işaretleri, **kalın** anahtar kelimeler kullan. Gereksiz uzatma.
- Önce en basit hâliyle anlat, sonra bir benzetme/günlük hayat örneği ver, sonra sınavda nasıl sorulduğunu göster.
- Ezber gereken yerde akılda kalıcı bir "kodlama" (kısaltma, hikâye, kafiye) öner.
- Matematikte adım adım git; her adımı tek satırda yaz; mümkünse "şıklardan deneme" yolunu da göster.
- 4 yanlış 1 doğruyu götürdüğü için: en az bir şıkkı eleyebiliyorsa işaretlemesinin mantıklı olduğunu hatırlat.
- Bilgi doğruluğu çok önemli. Emin olmadığın bir tarih, isim veya sayı varsa bunu açıkça söyle, uydurma.
- Güncel bilgilerde bilgin eskiyse bunu belirt.
- Uygun olduğunda cevabın sonunda tek bir kısa kontrol sorusu sor ("Hadi dene: ...").
- Konu dışı sorularda kibarca kısa cevap verip sınava geri yönlendir.`;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (!url.pathname.startsWith('/api/')) {
      return env.ASSETS.fetch(request);
    }
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
          if (request.method === 'POST') return questions(request, env, ctx);
          break;
      }
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
  if (text.length > 900_000) return json({ error: 'Veri çok büyük' }, 413);
  const now = Date.now();
  await env.DB.prepare(
    'INSERT INTO progress (profile, data, updated_at) VALUES (?, ?, ?) ON CONFLICT(profile) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at'
  ).bind(PROFILE, text, now).run();
  return json({ ok: true, updated_at: now });
}

// ---------- Yapay zekâ ----------

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

async function runAI(env, model, input) {
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

function lessonContext(lesson) {
  if (!lesson || typeof lesson !== 'object') return '';
  const parts = [];
  if (lesson.subject) parts.push(`Ders: ${String(lesson.subject).slice(0, 40)}`);
  if (lesson.title) parts.push(`Konu: ${String(lesson.title).slice(0, 160)}`);
  if (lesson.summary) parts.push(`Bu derste Özgür'e anlatılanlar:\n${String(lesson.summary).slice(0, 7000)}`);
  if (lesson.question) parts.push(`Özgür'ün baktığı soru:\n${String(lesson.question).slice(0, 2000)}`);
  return parts.length ? `\n\nŞU ANKİ BAĞLAM\n${parts.join('\n')}` : '';
}

async function chat(request, env, ctx) {
  if (!aiAvailable(env)) return json({ error: 'Yapay zekâ bağlı değil.' }, 503);
  if (!(await underLimit(request, env))) return json({ error: 'Bugünkü soru hakkı doldu, yarın tekrar dene.' }, 429);
  const body = await request.json();
  const history = Array.isArray(body.messages) ? body.messages.slice(-12) : [];
  const messages = [
    { role: 'system', content: TUTOR_PROMPT + lessonContext(body.lesson) + (body.progress ? `\n\nÖZGÜR'ÜN İLERLEMESİ (uygulamadan)\n${String(body.progress).slice(0, 2000)}` : '') },
    ...history
      .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
      .map((m) => ({ role: m.role, content: m.content.slice(0, 4000) })),
  ];
  const model = body.mode === 'deep' ? MODELS.deep : MODELS.fast;

  let upstream;
  try {
    upstream = await runAI(env, model, { messages, stream: true, max_tokens: body.mode === 'deep' ? 6000 : 2500, temperature: 0.4 });
  } catch (err) {
    upstream = await runAI(env, MODELS.backup, { messages, stream: true, max_tokens: 2500, temperature: 0.4 });
  }

  const lastUser = [...history].reverse().find((m) => m.role === 'user');
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();
  const enc = new TextEncoder();
  const send = (obj) => writer.write(enc.encode(`data: ${JSON.stringify(obj)}\n\n`));

  ctx.waitUntil(
    (async () => {
      let answer = '';
      try {
        const reader = upstream.getReader();
        const dec = new TextDecoder();
        let buf = '';
        let thinkingSent = false;
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
            let delta = '';
            let reasoning = '';
            if (chunk.choices && chunk.choices[0]) {
              const d = chunk.choices[0].delta || chunk.choices[0].message || {};
              delta = d.content || '';
              reasoning = d.reasoning_content || d.reasoning || '';
            } else if (typeof chunk.response === 'string') {
              delta = chunk.response;
            }
            if (reasoning && !thinkingSent) { thinkingSent = true; await send({ thinking: true }); }
            if (delta) { answer += delta; await send({ t: delta }); }
          }
        }
        await send({ done: true });
      } catch (err) {
        await send({ error: 'Cevap yarıda kesildi: ' + err.message });
      } finally {
        await writer.close();
        if (env.DB && lastUser) {
          await env.DB.prepare('INSERT INTO ai_log (ts, kind, lesson, question, answer) VALUES (?, ?, ?, ?, ?)')
            .bind(Date.now(), 'chat', body.lesson && body.lesson.title ? String(body.lesson.title).slice(0, 200) : null,
              lastUser.content.slice(0, 2000), answer.slice(0, 4000))
            .run().catch(() => {});
        }
      }
    })()
  );

  return new Response(readable, {
    headers: { 'content-type': 'text/event-stream; charset=utf-8', 'cache-control': 'no-cache', ...cors() },
  });
}

const QUESTION_PROMPT = `Sen ÖSYM'de KPSS Ön Lisans soruları yazan deneyimli bir soru yazarısın.
Verilen konu ve ders notlarına dayanarak, gerçek sınav tarzında, TEK doğru cevabı olan, 5 seçenekli (A-E) sorular yaz.
Kurallar:
- Bilgiler kesin doğru olmalı; tartışmalı veya emin olmadığın bilgiyi kullanma.
- Çeldiriciler inandırıcı olsun ama kesin yanlış olsun.
- Soruların bir kısmı "hangisi değildir / söylenemez" tipi, bir kısmı öncüllü (I, II, III) olabilir.
- Her soruya, Özgür'ün (temeli zayıf bir öğrenci) anlayacağı sadelikte 2-4 cümlelik açıklama yaz: neden doğru, çeldiriciler neden yanlış.
- Her soruya bir "ipucu" ekle: soruyu hatırlatan bir kodlama veya eleme taktiği.
ÇIKTI: Yalnızca geçerli JSON döndür, başka hiçbir metin yazma:
{"questions":[{"q":"soru kökü","o":["A seçeneği","B","C","D","E"],"a":0,"ex":"açıklama","tip":"ipucu"}]}
"a" doğru seçeneğin 0-4 arası indeksidir. Doğru cevabın yerini sorular arasında dağıt.`;

async function questions(request, env) {
  if (!aiAvailable(env)) return json({ error: 'Yapay zekâ bağlı değil.' }, 503);
  if (!(await underLimit(request, env))) return json({ error: 'Bugünkü soru hakkı doldu, yarın tekrar dene.' }, 429);
  const body = await request.json();
  const count = Math.max(1, Math.min(8, Number(body.count) || 5));
  const messages = [
    { role: 'system', content: QUESTION_PROMPT },
    {
      role: 'user',
      content: `Ders: ${String(body.subject || '').slice(0, 40)}\nKonu: ${String(body.topic || '').slice(0, 200)}\n` +
        `Zorluk: ${body.level === 'hard' ? 'sınav ayarı, biraz zor' : 'kolay-orta, konuyu pekiştiren'}\n` +
        `Ders notları:\n${String(body.summary || '').slice(0, 8000)}\n\n${count} soru yaz.`,
    },
  ];
  let parsed = null;
  let lastErr = '';
  const order = body.level === 'hard' ? [MODELS.deep, MODELS.fast] : [MODELS.fast, MODELS.deep];
  for (const model of order) {
    try {
      const result = await runAI(env, model, { messages, max_tokens: 9000, temperature: 0.5 });
      parsed = parseQuestions(textOf(result));
      if (parsed && parsed.length) break;
      lastErr = 'Model geçerli soru döndürmedi';
    } catch (err) {
      lastErr = err.message;
    }
  }
  if (!parsed || !parsed.length) return json({ error: 'Soru üretilemedi: ' + lastErr }, 502);
  return json({ questions: parsed.slice(0, count) });
}

function parseQuestions(text) {
  if (!text) return null;
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start < 0 || end <= start) return null;
  let obj;
  try { obj = JSON.parse(text.slice(start, end + 1)); } catch { return null; }
  const list = Array.isArray(obj) ? obj : obj.questions;
  if (!Array.isArray(list)) return null;
  return list
    .filter((q) => q && typeof q.q === 'string' && Array.isArray(q.o) && q.o.length === 5 && Number.isInteger(q.a) && q.a >= 0 && q.a < 5)
    .map((q) => ({
      q: q.q.slice(0, 1500),
      o: q.o.map((x) => String(x).slice(0, 300)),
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
