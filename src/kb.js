// Bilgi tabanı: uygulamadaki tüm ders içeriği (kartlar, görseller, sorular, bilgi kartları, strateji)
// küçük parçalara bölünür. Hoca "bilgi_ara" aracıyla buradan kaynak bulur.
// Arama: anlam vektörü (bge-m3, vectors.bin varsa) + Türkçe kök eşleşmeli anahtar kelime puanı.
import TURKCE from '../public/js/content/turkce.js';
import MATEMATIK from '../public/js/content/matematik.js';
import TARIH from '../public/js/content/tarih.js';
import COGRAFYA from '../public/js/content/cografya.js';
import VATANDASLIK from '../public/js/content/vatandaslik.js';
import GUNCEL from '../public/js/content/guncel.js';
import { STRATEGY, EXTRA_LESSONS } from '../public/js/content/extra.js';

export const SUBJECT_NAMES = { turkce: 'Türkçe', matematik: 'Matematik', tarih: 'Tarih', cografya: 'Coğrafya', vatandaslik: 'Vatandaşlık', guncel: 'Güncel ve kültür' };
export const LESSON_LIST = [...TURKCE, ...MATEMATIK, ...TARIH, ...COGRAFYA, ...VATANDASLIK, ...GUNCEL, ...EXTRA_LESSONS];
export const LESSONS = Object.fromEntries(LESSON_LIST.map((l) => [l.id, l]));

import { strip, vizText, cardText, questionText } from '../public/js/text.js';
export { strip, vizText, cardText, questionText };

export function lessonSummary(l, max = 7000) {
  return (l.cards || []).map(cardText).join('\n\n').slice(0, max);
}

// ---------- parçalar ----------
export const CHUNKS = [];
for (const l of LESSON_LIST) {
  const where = `${SUBJECT_NAMES[l.s] || l.s} · ${l.day ? l.day + '. gün' : 'ekstra'} · ${strip(l.title)}`;
  (l.cards || []).forEach((c, i) => {
    if (c.k === 'video') return;
    CHUNKS.push({ id: `${l.id}:k${i}`, lesson: l.id, s: l.s, where, title: strip(c.h || l.title), text: cardText(c) });
  });
  (l.quiz || []).forEach((q, i) => CHUNKS.push({ id: `${l.id}:q${i}`, lesson: l.id, s: l.s, where, title: 'Örnek soru', text: questionText(q) + (q.tip ? `\nİpucu: ${strip(q.tip)}` : '') }));
  if (l.flash && l.flash.length) {
    for (let i = 0; i < l.flash.length; i += 6) {
      CHUNKS.push({ id: `${l.id}:f${i}`, lesson: l.id, s: l.s, where, title: 'Bilgi kartları', text: l.flash.slice(i, i + 6).map(([a, b]) => `${strip(a)} → ${strip(b)}`).join('\n') });
    }
  }
}
for (const c of STRATEGY) CHUNKS.push({ id: `strateji:${c.id}`, lesson: null, s: 'strateji', where: 'Sınav stratejisi', title: strip(c.h), text: cardText(c) });

// ---------- anahtar kelime araması (Türkçe için kaba kök: ilk 5 harf) ----------
const STOP = new Set('ve veya ile bir bu şu o da de ki mi mı mu mü için gibi daha en çok ne nedir nasıl hangi hangisi olan olarak ise ya yani her şey sonra önce kadar göre bana beni sen sınav sınavda kpss özetle anlat açıkla'.split(' '));
const norm = (s) => String(s).toLocaleLowerCase('tr').normalize('NFC');
export function tokens(s) {
  return norm(s).replace(/[^a-zçğıöşüâîû0-9\s]/g, ' ').split(/\s+/).filter((w) => w.length > 1 && !STOP.has(w)).map((w) => (w.length > 5 ? w.slice(0, 5) : w));
}
const DF = new Map();
const CT = CHUNKS.map((c) => {
  const toks = tokens(`${c.title} ${c.title} ${c.where} ${c.text}`);
  const tf = new Map();
  toks.forEach((t) => tf.set(t, (tf.get(t) || 0) + 1));
  for (const t of tf.keys()) DF.set(t, (DF.get(t) || 0) + 1);
  return { tf, len: toks.length };
});
const AVG = CT.reduce((a, c) => a + c.len, 0) / CT.length;

function bm25(query) {
  const q = [...new Set(tokens(query))];
  const N = CHUNKS.length;
  return CT.map((c, i) => {
    let s = 0;
    for (const t of q) {
      const f = c.tf.get(t);
      if (!f) continue;
      const idf = Math.log(1 + (N - DF.get(t) + 0.5) / (DF.get(t) + 0.5));
      s += idf * ((f * 2.2) / (f + 1.2 * (0.25 + 0.75 * (c.len / AVG))));
    }
    return s;
  });
}

// ---------- anlam vektörleri (isteğe bağlı: /kb/vectors.bin) ----------
let VEC = null; // { dim, ids, data: Int8Array, scale: Float32Array }
async function loadVectors(env) {
  if (VEC !== null) return VEC;
  VEC = false;
  try {
    const res = await env.ASSETS.fetch(new Request('https://assets.local/kb/vectors.bin'));
    const meta = await env.ASSETS.fetch(new Request('https://assets.local/kb/vectors.json'));
    if (!res.ok || !meta.ok) return VEC;
    const m = await meta.json();
    const buf = await res.arrayBuffer();
    const n = m.ids.length;
    VEC = { dim: m.dim, ids: m.ids, scale: new Float32Array(buf, 0, n), data: new Int8Array(buf, n * 4) };
  } catch (e) { VEC = false; }
  return VEC;
}

async function semantic(env, runAI, query) {
  const V = await loadVectors(env);
  if (!V) return null;
  const r = await runAI(env, '@cf/baai/bge-m3', { text: [query] });
  const q = r && r.data && r.data[0];
  if (!q) return null;
  let qn = 0; for (const x of q) qn += x * x; qn = Math.sqrt(qn) || 1;
  const byId = new Map();
  for (let i = 0; i < V.ids.length; i++) {
    let dot = 0; const off = i * V.dim;
    for (let d = 0; d < V.dim; d++) dot += V.data[off + d] * q[d];
    byId.set(V.ids[i], (dot * V.scale[i]) / qn);
  }
  return byId;
}

export async function search(env, runAI, query, { k = 5, subject = null } = {}) {
  const kw = bm25(query);
  const maxKw = Math.max(1e-9, ...kw);
  let sem = null;
  try { sem = await semantic(env, runAI, query); } catch (e) { sem = null; }
  const scored = CHUNKS.map((c, i) => {
    let s = (kw[i] / maxKw) * (sem ? 0.45 : 1);
    if (sem) s += Math.max(0, ((sem.get(c.id) ?? 0) - 0.35) / 0.4) * 0.55;
    if (subject && c.s === subject) s *= 1.15;
    return { c, s };
  }).filter((x) => x.s > 0.05).sort((a, b) => b.s - a.s);
  // aynı dersin aynı kartını iki kez getirme; çeşitlilik için ders başına en fazla 3 parça
  const per = {}; const out = [];
  for (const x of scored) {
    const key = x.c.lesson || x.c.id;
    if ((per[key] = (per[key] || 0) + 1) > 3) continue;
    out.push(x);
    if (out.length >= k) break;
  }
  return out.map(({ c, s }) => ({ id: c.id, lesson: c.lesson, where: c.where, title: c.title, text: c.text.slice(0, 1400), score: Math.round(s * 100) / 100 }));
}

// Ders listesi (hocanın sistem mesajına kısa katalog)
export function catalog() {
  return LESSON_LIST.map((l) => `${l.id}: ${SUBJECT_NAMES[l.s]}${l.day ? ` ${l.day}. gün` : ' ekstra'} · ${strip(l.title)}`).join('\n');
}
