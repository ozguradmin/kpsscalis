// Tahmini net motoru.
// Her dersin sınavda "kaç soruyu" kapsadığı (y) ve Özgür'ün o konudaki ustalığı (p) üzerinden
// beklenen neti hesaplar. Beklenen net/soru = p − (1 − p) · w  (w: yanlış işaretleme payı).
// Kaynak: docs/ARASTIRMA.md'deki soru dağılımı (2014-2024 ön lisans kitapçıkları).
import { LESSONS, SUBJECTS } from './plan.js';
import { store } from './store.js';

// Dersin ÖSYM sınavında kapsadığı ortalama soru sayısı (derslerin toplamı ders kotasını aşmaz)
export const YIELD = {
  tr1: 6, tr2: 3, tr3: 5, tr4: 4, tr5: 1, tr6: 2, tr7: 2, tr8: 3, tr9: 4,
  mat1: 4, mat2: 2, mat3: 2, mat4: 1, mat5: 2, mat6: 2, mat7: 3, mat8: 2, mat9: 2,
  tar1: 3.5, tar2: 3.5, tar3: 2, tar4: 3, tar5: 2, tar6: 3, tar7: 3, tar8: 2.5, tar9: 4.5,
  cog1: 1.5, cog2: 3, cog3: 2, cog4: 2, cog5: 2, cog6: 2, cog7: 1.5, cog8: 2, cog9: 2,
  vat1: 1.5, vat2: 1, vat3: 1, vat4: 1, vat5: 1, vat6: 1, vat7: 1, vat8: 0.8, vat9: 0.7,
  gun1: 1, gun2: 0.7, gun3: 1, gun4: 0.8, gun5: 0.5, gun6: 0.8, gun7: 0.5, gun8: 0.4, gun9: 0.3,
  'ex-mat1': 1.5, 'ex-tar1': 1, 'ex-cog1': 0.8, 'ex-vat1': 0.6, 'ex-tr1': 0,
};
const SUBJ_Q = Object.fromEntries(SUBJECTS.map((s) => [s.id, s.q]));

// Hiç çalışmadan başlangıç ustalığı: yorum soruları iyi, bilgi ve matematik zayıf
const P0_LESSON = { tr1: 0.5, tr2: 0.45, tr3: 0.45, tr8: 0.35, tr9: 0.5, tr4: 0.25 };
const P0_SUBJ = { turkce: 0.25, matematik: 0.12, tarih: 0.18, cografya: 0.2, vatandaslik: 0.18, guncel: 0.22 };
const P_MAX = 0.85;
const W = 0.12;

export const p0 = (id) => P0_LESSON[id] ?? P0_SUBJ[LESSONS[id]?.s] ?? 0.2;
const f = (p) => Math.max(0, p - (1 - p) * W);

// Dersin ustalığı: ders sonu testi + sonraki tüm cevaplar (hata defteri, deneme, üretilen sorular)
export function mastery(id, st = store.get()) {
  const base = p0(id);
  const l = st.lessons[id];
  const log = (st.log || []).filter((x) => x.l === id && x.ok !== -1);
  let acc = null;
  if (log.length) {
    // yeni cevaplar daha ağır basar
    let wsum = 0, s = 0;
    log.forEach((x, i) => { const w = 1 + i / log.length; wsum += w; s += (x.ok ? 1 : 0) * w; });
    acc = s / wsum;
  } else if (l && l.done && l.total) acc = (l.score || 0) / l.total;
  if (acc == null) return base;
  // Ders bitmiş olsa bile sınav sorusu ders sorusundan zordur: kazancın %85'ini say
  const studied = l && l.done ? 1 : 0.6;
  return base + (P_MAX - base) * acc * 0.85 * studied;
}

export function lessonNet(id, st) { return (YIELD[id] || 0) * f(mastery(id, st)); }

export function estimate(st = store.get()) {
  const per = {};
  let total = 0, start = 0;
  for (const s of SUBJECTS) {
    const ids = Object.keys(YIELD).filter((id) => LESSONS[id]?.s === s.id && YIELD[id] > 0);
    const covered = ids.reduce((a, id) => a + YIELD[id], 0);
    const rest = Math.max(0, SUBJ_Q[s.id] - covered);
    const now = ids.reduce((a, id) => a + lessonNet(id, st), 0) + rest * f(P0_SUBJ[s.id]);
    const base = ids.reduce((a, id) => a + YIELD[id] * f(p0(id)), 0) + rest * f(P0_SUBJ[s.id]);
    per[s.id] = { now, base, q: SUBJ_Q[s.id] };
    total += now; start += base;
  }
  return { total, start, gain: total - start, per, puan: puan(total) };
}

// 2024 ön lisans P93 dağılımına göre yaklaşık çevirme (35 net≈67, 45≈72, 60≈80)
export function puan(net) { return Math.round((50.5 + 0.49 * net) * 10) / 10; }

// Bir dersin sonunda "bu ders sana kaç net kazandırdı": dersten önceki ve sonraki durum farkı
export function gainFor(id, before, after) {
  return lessonNet(id, after) - lessonNet(id, before);
}

export const fmtNet = (n) => (Math.round(n * 10) / 10).toFixed(1).replace('.', ',');
