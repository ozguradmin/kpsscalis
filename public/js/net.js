// Gerçekçi net tahmini.
// Amaç Özgür'ü mutlu etmek değil, doğruyu göstermek:
// - Başlangıç: hiç çalışmadan girdiği 4 YKS'deki davranışı (ne kadar işaretliyor, ne kadar tutturuyor).
// - Güncelleme: uygulamada çözdüğü sorular. Ders bitirmek tek başına net getirmez; sadece soru performansı sayılır.
// - Ders içi sorular sınav sorusundan kolaydır ve hemen sorulur: ağırlıkları düşük, doğrulukları iskontolu.
//   Deneme ve hocanın karışık testleri sınava en yakın kanıttır.
// - Sonuç tek sayı değil, aralık (yaklaşık %80 ihtimalle bu aralıkta).
// Konu ağırlıkları: 2014, 2018, 2020 ön lisans kitapçıklarında 294 sorunun sınıflandırması (docs/ARASTIRMA.md).
import { LESSONS, SUBJECTS } from './plan.js';
import { store } from './store.js';
import { PRIOR, PRIOR_SEC } from './yks.js';

// Dersin ÖSYM sınavında kapsadığı ortalama soru sayısı
export const YIELD = {
  // Türkçe: soruların ~%75'i paragraf türü
  tr1: 6.5, tr2: 6, tr3: 7, tr4: 3, tr5: 1, tr6: 2.5, tr7: 1.5, tr8: 1.5, tr9: 1,
  // Matematik: ~4-5 soru geometri/cebir planda yok
  mat1: 3, mat2: 2, mat3: 4, mat4: 1.5, mat5: 2.5, mat6: 2.5, mat7: 5, mat8: 3, mat9: 1.5, 'ex-mat1': 1,
  // Tarih: ~üçte biri 19. yy Osmanlı yenileşmesi + 1945 sonrası
  tar1: 2.6, tar2: 1.8, tar3: 2.6, tar4: 2.6, tar5: 2.6, tar6: 2.6, tar7: 1.5, tar8: 2.2, tar9: 5, 'ex-tar2': 3, 'ex-tar1': 0.5,
  cog1: 1.2, cog2: 2.2, cog3: 2.5, cog4: 1.9, cog5: 2.5, cog6: 2.8, cog7: 1.3, cog8: 2.8, cog9: 0.5, 'ex-cog1': 0.3,
  vat1: 0.4, vat2: 1.4, vat3: 0.4, vat4: 0.8, vat5: 1.2, vat6: 1.5, vat7: 1.8, vat8: 1.0, vat9: 0.3, 'ex-vat1': 0.2,
  gun1: 0.5, gun2: 0.4, gun3: 1, gun4: 0.5, gun5: 1, gun6: 1.8, gun7: 0.4, gun8: 0.4, gun9: 0,
  'ex-tr1': 0,
};
const SUBJ_Q = Object.fromEntries(SUBJECTS.map((s) => [s.id, s.q]));

// Kanıt ağırlığı (w) ve "sınav zorluğuna çevirme" katsayısı (k) kaynağa göre
const SRC = {
  deneme: { w: 1, k: 1 },       // sınava en yakın kanıt
  cikmis: { w: 1, k: 1 },       // geçmiş yılların gerçek ÖSYM soruları
  hoca: { w: 0.9, k: 0.95 },
  hata: { w: 0.5, k: 0.85 },    // daha önce görülmüş soru: kolaylaşmış olur
  ders: { w: 0.45, k: 0.85 },   // az önce anlatılan konudan hemen soru
  kontrol: { w: 0.25, k: 0.8 },
  kart: { w: 0.15, k: 0.7 },     // bilgi kartında "biliyordum" demek: kendi beyanı, az sayılır
  // 'on-test' (dersten önceki tahmin) bilerek sayılmaz: öğrenmeden önceki durumdur
};
const N0_C = 6;   // başlangıç doğruluğuna verilen güven (sanal soru sayısı)
const N0_A = 10;  // işaretleme davranışına verilen güven
const DAY = 86400000;

function evidence(entries, now) {
  let wa = 0, att = 0, wc = 0, ok = 0;
  const seen = new Set();
  for (const x of entries) {
    const s = SRC[x.src];
    if (!s) continue;
    const age = Math.max(0, (now - (x.at || now)) / DAY);
    // Aynı soruyu tekrar çözmek cevabı hatırlamaktır, beceri değil: tekrarlar %30 sayılır
    const again = x.k && seen.has(x.k);
    if (x.k) seen.add(x.k);
    const w = s.w * Math.pow(0.88, age) * (again ? 0.3 : 1); // eski cevaplar unutmayı yansıtsın diye azalır
    wa += w; if (x.ok !== -1) att += w;
    if (x.ok !== -1) { wc += w; if (x.ok === 1) ok += w * s.k; else ok += 0; }
  }
  return { wa, att, wc, ok };
}

// Bir konu için (işaretleme oranı a, doğruluk c)
export function lessonRates(id, st = store.get(), now = Date.now()) {
  const s = LESSONS[id]?.s;
  const pr = PRIOR[s] || { a: 0.5, c: 0.4 };
  const e = evidence((st.log || []).filter((x) => x.l === id), now);
  const a = (pr.a * N0_A + e.att) / (N0_A + e.wa);
  const c = (pr.c * N0_C + e.ok) / (N0_C + e.wc);
  return { a: Math.min(0.99, a), c: Math.min(0.95, c), n: e.wc };
}

// Geriye uyum: "ustalık" = sınav şartlarında doğru yapma olasılığı
export function mastery(id, st) { const r = lessonRates(id, st); return r.a * r.c; }

function bucket(y, a, c) {
  const pD = a * c, pY = a * (1 - c);
  const mean = pD - pY / 4;
  const varq = pD * 1 + pY * 0.0625 - mean * mean;
  return { D: y * pD, Y: y * pY, B: y * (1 - a), net: y * mean, var: y * varq };
}

export function lessonNet(id, st) { const r = lessonRates(id, st); return bucket(YIELD[id] || 0, r.a, r.c).net; }

export function estimate(st = store.get()) {
  const now = Date.now();
  const per = {};
  let total = 0, start = 0, variance = 0, D = 0, Y = 0, B = 0;
  for (const s of SUBJECTS) {
    const ids = Object.keys(YIELD).filter((id) => LESSONS[id]?.s === s.id && YIELD[id] > 0);
    const covered = ids.reduce((a, id) => a + YIELD[id], 0);
    const scale = covered > SUBJ_Q[s.id] ? SUBJ_Q[s.id] / covered : 1;
    const rest = Math.max(0, SUBJ_Q[s.id] - covered);
    const pr = PRIOR[s.id];
    const parts = ids.map((id) => { const r = lessonRates(id, st, now); return { id, ...bucket(YIELD[id] * scale, r.a, r.c), n: r.n }; });
    const restB = bucket(rest, pr.a, pr.c);
    const sum = (k) => parts.reduce((a, p) => a + p[k], 0) + restB[k];
    const base = bucket(SUBJ_Q[s.id], pr.a, pr.c).net;
    const now_ = sum('net');
    // model belirsizliği: kanıt azsa daha geniş
    const nEv = parts.reduce((a, p) => a + p.n, 0);
    const modelSd = now_ * (0.18 / Math.sqrt(1 + nEv / 15));
    per[s.id] = { now: now_, base, q: SUBJ_Q[s.id], D: sum('D'), Y: sum('Y'), B: sum('B'), evidence: nEv, sd: Math.sqrt(sum('var') + modelSd * modelSd) };
    total += now_; start += base; variance += sum('var') + modelSd * modelSd;
    D += per[s.id].D; Y += per[s.id].Y; B += per[s.id].B;
  }
  const sd = Math.sqrt(variance);
  const low = Math.max(0, total - 1.28 * sd), high = total + 1.28 * sd;
  return { total, start, gain: total - start, per, D, Y, B, low, high, puan: puan(total), puanLow: puan(low), puanHigh: puan(high), time: timeModel(st) };
}

// Süre: uygulamada soru başına harcadığı süreden, 130 dakikaya yetişir mi?
export function timeModel(st = store.get()) {
  const out = {};
  let need = 0;
  for (const s of SUBJECTS) {
    const xs = (st.log || []).filter((x) => x.s === s.id && x.sec > 3 && x.sec < 900 && (x.src === 'deneme' || x.src === 'hoca' || x.src === 'ders' || x.src === 'hata')).map((x) => x.sec).sort((a, b) => a - b);
    const med = xs.length >= 3 ? xs[Math.floor(xs.length / 2)] : null;
    const sec = med != null ? (med * xs.length + PRIOR_SEC[s.id] * 3) / (xs.length + 3) : PRIOR_SEC[s.id];
    out[s.id] = { sec, n: xs.length };
    need += sec * s.q * (s.id === 'matematik' ? 0.5 : 1); // matematikte sadece yapabileceğine bakacak
  }
  return { per: out, needMin: need / 60, limitMin: 130 };
}

// 2024 ön lisans P93 dağılımına göre yaklaşık çevirme (35 net≈67, 45≈72, 60≈80)
export function puan(net) { return Math.round((50.5 + 0.49 * net) * 10) / 10; }

export function gainFor(id, before, after) { return lessonNet(id, after) - lessonNet(id, before); }

export const fmtNet = (n) => (Math.round(n * 10) / 10).toFixed(1).replace('.', ',');
