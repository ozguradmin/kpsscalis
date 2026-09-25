// Tahmini net motoru.
// Her dersin sınavda "kaç soruyu" kapsadığı (y) ve Özgür'ün o konudaki ustalığı (p) üzerinden
// beklenen neti hesaplar. Beklenen net/soru = p − (1 − p) · w  (w: yanlış işaretleme payı).
// Kaynak: 2014, 2018, 2020 ön lisans kitapçıklarındaki 294 sorunun konu sınıflandırması (docs/ARASTIRMA.md).
import { LESSONS, SUBJECTS } from './plan.js';
import { store } from './store.js';

// Dersin ÖSYM sınavında kapsadığı ortalama soru sayısı (derslerin toplamı ders kotasını aşmaz)
export const YIELD = {
  // Türkçe: 2014-2020 kitapçıklarında soruların ~%75'i paragraf türü (ana düşünce, anlam, yapı)
  tr1: 6.5, tr2: 6, tr3: 7, tr4: 3, tr5: 1, tr6: 2.5, tr7: 1.5, tr8: 1.5, tr9: 1,
  // Matematik: problemler ve sayısal mantık öne çıkıyor; ~4-5 soru geometri/cebir (planda yok)
  mat1: 3, mat2: 2, mat3: 4, mat4: 1.5, mat5: 2.5, mat6: 2.5, mat7: 5, mat8: 3, mat9: 1.5, 'ex-mat1': 1,
  // Tarih: soruların ~üçte biri 19. yy Osmanlı yenileşmesi + 1945 sonrası
  tar1: 2.6, tar2: 1.8, tar3: 2.6, tar4: 2.6, tar5: 2.6, tar6: 2.6, tar7: 1.5, tar8: 2.2, tar9: 5, 'ex-tar2': 3, 'ex-tar1': 0.5,
  cog1: 1.2, cog2: 2.2, cog3: 2.5, cog4: 1.9, cog5: 2.5, cog6: 2.8, cog7: 1.3, cog8: 2.8, cog9: 0.5, 'ex-cog1': 0.3,
  // Vatandaşlık: 657 DMK, yargı ve kişiler hukuku en sık
  vat1: 0.4, vat2: 1.4, vat3: 0.4, vat4: 0.8, vat5: 1.2, vat6: 1.5, vat7: 1.8, vat8: 1.0, vat9: 0.3, 'ex-vat1': 0.2,
  // Güncel: en çok "kültür büyükleri", sonra ödüller ve gündem
  gun1: 0.5, gun2: 0.4, gun3: 1, gun4: 0.5, gun5: 1, gun6: 1.8, gun7: 0.4, gun8: 0.4, gun9: 0,
  'ex-tr1': 0,
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
