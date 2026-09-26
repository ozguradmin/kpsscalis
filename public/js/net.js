// Gerçekçi net tahmini.
// Amaç Özgür'ü mutlu etmek değil, doğruyu göstermek:
// - Başlangıç: hiç çalışmadan girdiği 4 YKS'deki davranışı (ne kadar işaretliyor, ne kadar tutturuyor).
// - Güncelleme: uygulamada çözdüğü sorular. Ders bitirmek tek başına net getirmez; sadece soru performansı sayılır.
// - Ders içi sorular sınav sorusundan kolaydır ve hemen sorulur: ağırlıkları düşük, doğrulukları iskontolu.
//   Deneme ve hocanın karışık testleri sınava en yakın kanıttır.
// - Sonuç tek sayı değil, aralık (yaklaşık %80 ihtimalle bu aralıkta).
// Konu ağırlıkları: 2010-2026 arası ÖSYM kitapçıklarındaki 1.860 gerçek sorunun sınıflandırması (docs/ARASTIRMA.md).
import { LESSONS, SUBJECTS } from './plan.js';
import { store } from './store.js';
import { PRIOR, PRIOR_SEC } from './yks.js';

// Dersin ÖSYM sınavında kapsadığı ortalama soru sayısı
export const YIELD = {
  // 2010-2026 arası 15 tam + 8 kısmi ÖSYM kitapçığındaki 1.860 sorudan (ön lisans ağırlıklı, yeni yıllar daha ağır)
  // Türkçe: paragrafta ana düşünce ~10 soru; 2022-2025'te paragraf yapısı (akış, boşluk) yükselişte
  tr1: 9.7, tr2: 4.1, tr3: 6.4, tr4: 1.8, tr5: 1.5, tr6: 2, tr7: 2.9, tr8: 1.8, tr9: 0.5,
  // Matematik: sayı problemleri, temel işlemler ve (son yıllarda artan) sayısal mantık; ~3 soru geometri planda yok
  mat1: 6.4, mat2: 1, mat3: 3.5, mat4: 0.6, mat5: 0.7, mat6: 0.5, mat7: 4.5, mat8: 2.1, mat9: 2, 'ex-mat1': 0.6,
  // Az hesaplı matematik ekstraları: payları ana derslerden alındı (matematik toplamı değişmedi)
  'ex-mat2': 1.2, 'ex-mat3': 1.8, 'ex-mat5': 2, 'ex-mat6': 1,
  // Tarih: 19. yy Osmanlı + çağdaş Türkiye en büyük blok
  tar1: 3.2, tar2: 2, tar3: 2.2, tar4: 3.2, tar5: 2.7, tar6: 3, tar7: 1.5, tar8: 1.9, tar9: 5, 'ex-tar2': 2.6, 'ex-tar1': 0.1,
  cog1: 1.3, cog2: 1.8, cog3: 2.7, cog4: 1.6, cog5: 2.8, cog6: 2.7, cog7: 1.9, cog8: 3.6, cog9: 0.1, 'ex-cog1': 0,
  // Vatandaşlık: idare (merkezî + yerel) ilk sırada
  vat1: 1.2, vat2: 1.2, vat3: 0.4, vat4: 0.8, vat5: 1.3, vat6: 1.1, vat7: 0.9, vat8: 1.8, vat9: 0.6, 'ex-vat1': 0.1,
  // Güncel: kültür büyükleri ve gündem
  gun1: 0.6, gun2: 0.1, gun3: 1.4, gun4: 0.5, gun5: 0.4, gun6: 2.2, gun7: 0.5, gun8: 0.2, gun9: 0,
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
  // süre kısıtı: 130 dakikaya yetişemeyeceği sorular boş kalır
  const tm = timeModel(st), fit = timeFit(per, tm);
  const free = total;
  D = Y = B = total = 0;
  for (const s of SUBJECTS) {
    const p = per[s.id], f = fit.per[s.id].f;
    if (f < 1) { const lost = (p.D + p.Y) * (1 - f); p.now *= f; p.B += lost; p.D *= f; p.Y *= f; }
    p.min = fit.per[s.id].min;
    total += p.now; D += p.D; Y += p.Y; B += p.B;
  }
  const sd = Math.sqrt(variance);
  const low = Math.max(0, total - 1.28 * sd), high = total + 1.28 * sd;
  return { total, start, gain: total - start, per, D, Y, B, low, high, puan: puan(total), puanLow: puan(low), puanHigh: puan(high), time: { ...tm, fit: fit.per, needMin: fit.needMin, spareMin: fit.spareMin }, free };
}

// ---------- Süre ----------
// Sınavda 120 soru / 130 dk. Hedef tempo (soru başı sn): Türkçe ~40 dk, Genel Kültür ~40 dk, Matematik ~50 dk.
export const BUDGET = { turkce: 80, matematik: 100, tarih: 40, cografya: 40, vatandaslik: 40, guncel: 40 };
export const EXAM_MIN = 130;
// Sınavdaki sıra: önce Türkçe, sonra Genel Kültür, en son Matematik (süre biterse en sondakiler boş kalır)
const ORDER = ['turkce', 'tarih', 'cografya', 'vatandaslik', 'guncel', 'matematik'];
// Hız ölçümüne girenler: ilk kez görülen sorular. Hata defteri ve tekrar edilen sorular sayılmaz (cevabı akılda kalır).
const TIMED = new Set(['deneme', 'cikmis', 'hoca', 'ders', 'kontrol']);

function timedSamples(st) {
  const seen = new Set(), out = [];
  for (const x of st.log || []) {
    const again = x.k && seen.has(x.k);
    if (x.k) seen.add(x.k);
    if (again || !TIMED.has(x.src) || !(x.sec > 3 && x.sec <= 600)) continue;
    out.push(x);
  }
  return out;
}
const median = (xs) => { const a = [...xs].sort((p, q) => p - q); return a.length ? (a.length % 2 ? a[a.length >> 1] : (a[a.length / 2 - 1] + a[a.length / 2]) / 2) : null; };

// Ders ders tempo: medyan sn (az veri varsa tipik süreye doğru çekilir), hız etiketi, okuma hızı
export function timeModel(st = store.get()) {
  const xs = timedSamples(st);
  const per = {};
  for (const s of SUBJECTS) {
    const mine = xs.filter((x) => x.s === s.id);
    const secs = mine.map((x) => x.sec);
    const med = median(secs);
    const sec = med != null ? (med * secs.length + PRIOR_SEC[s.id] * 3) / (secs.length + 3) : PRIOR_SEC[s.id];
    const ok = mine.filter((x) => x.ok === 1).map((x) => x.sec), bad = mine.filter((x) => x.ok === 0).map((x) => x.sec);
    const ratio = sec / BUDGET[s.id];
    per[s.id] = {
      sec, n: secs.length, med, budget: BUDGET[s.id], ratio,
      label: secs.length < 3 ? 'veri az' : ratio > 1.25 ? 'yavaş' : ratio < 0.7 ? 'hızlı' : 'tempoda',
      okSec: median(ok), badSec: median(bad),
    };
  }
  // Okuma hızı: metinli sorularda karakter/sn (Türkçe paragraf en iyi ölçü); ~6 karakter = 1 kelime
  const rd = xs.filter((x) => x.len > 150 && x.sec > 8).map((x) => x.len / x.sec);
  const cps = median(rd);
  const reading = cps ? { wpm: Math.round(cps / 6 * 60), n: rd.length } : null;
  return { per, reading, samples: xs.length, limitMin: EXAM_MIN };
}

// 130 dakikaya sığdırma: her derste işaretleyeceği sorular kendi temposunda, boş bırakacakları için okuma+geçme (~%35 süre).
// Süre biterse sıradaki derslerin işaretlenecek soruları boşa döner.
export function timeFit(per, tm) {
  let left = EXAM_MIN * 60;
  const out = {};
  let need = 0;
  for (const id of ORDER) {
    const p = per[id], t = tm.per[id];
    const attempt = p.D + p.Y, skip = p.B;
    const cost = attempt * t.sec + skip * t.sec * 0.35;
    need += cost;
    const f = cost <= 0 ? 1 : Math.max(0, Math.min(1, left / cost));
    left = Math.max(0, left - cost);
    out[id] = { f, min: cost / 60 };
  }
  return { per: out, needMin: need / 60, limitMin: EXAM_MIN, spareMin: EXAM_MIN - need / 60 };
}

// 2024 ön lisans P93 dağılımına göre yaklaşık çevirme (35 net≈67, 45≈72, 60≈80)
export function puan(net) { return Math.round((50.5 + 0.49 * net) * 10) / 10; }

export function gainFor(id, before, after) { return lessonNet(id, after) - lessonNet(id, before); }

export const fmtNet = (n) => (Math.round(n * 10) / 10).toFixed(1).replace('.', ',');
