// Özgür'ün 2021-2024 YKS sonuçları (sadece doğru/yanlış sayıları; kimlik bilgisi yok).
// Hiç çalışmadan girdiği sınavlar: gerçekçi başlangıç tahmininin kalibrasyonu buradan gelir.
export const YKS = {
  2021: { tr: [16, 19], sos: [9, 8], mat: [2, 0], ed: [4, 6], t1: [2, 2], c1: [5, 1], t2: [1, 3], c2: [4, 4], fel: [3, 8] },
  2022: { tr: [24, 15], sos: [11, 6], mat: [1, 1], ed: [8, 2], t1: [3, 1], c1: [5, 0], t2: [1, 3], c2: [7, 3], fel: [5, 4] },
  2023: { tr: [27, 9], sos: [14, 5], mat: [5, 0], ed: [10, 1], t1: [1, 1], c1: [2, 3], t2: [3, 1], c2: [6, 3], fel: [3, 3] },
  2024: { tr: [25, 12], sos: [14, 1], mat: [2, 2], ed: [5, 4], t1: [3, 1], c1: [5, 1], t2: [3, 2], c2: [5, 5], fel: [4, 4] },
};
export const YKS_N = { tr: 40, sos: 20, mat: 40, ed: 24, t1: 10, c1: 6, t2: 11, c2: 11, fel: 12 };
export const YKS_LABEL = { tr: 'TYT Türkçe', sos: 'TYT Sosyal', mat: 'TYT Matematik', ed: 'AYT Edebiyat', t1: 'AYT Tarih-1', t2: 'AYT Tarih-2', c1: 'AYT Coğrafya-1', c2: 'AYT Coğrafya-2', fel: 'AYT Felsefe' };

// KPSS derslerine taşınan başlangıç davranışı: a = soruların ne kadarını işaretliyor, c = işaretlediğinde doğru oranı.
// Nasıl bulundu (docs/ARASTIRMA.md "YKS geçmişi"):
// - Türkçe: TYT Türkçe 2023-2024 → işaretleme %91, doğruluk %71 (2021'den beri sürekli yükseliyor).
// - Matematik: TYT'de 4 yılda 160 sorudan 13'ünü işaretlemiş (%8), doğruluk %77. KPSS matematiği TYT'den kolay → a 0.15.
// - Tarih: AYT Tarih-1/2 → işaretleme %37, doğruluk %55. Ön lisans tarihi AYT'den kolay → a 0.45, c 0.55.
// - Coğrafya: AYT Coğrafya-1/2 → işaretleme %87, doğruluk %66; KPSS daha çok ezber bilgi → a 0.72, c 0.58.
// - Vatandaşlık, Güncel: YKS karşılığı yok; saf bilgi dersleri → temkinli.
export const PRIOR = {
  turkce: { a: 0.91, c: 0.71 },
  matematik: { a: 0.15, c: 0.7 },
  tarih: { a: 0.45, c: 0.55 },
  cografya: { a: 0.72, c: 0.58 },
  vatandaslik: { a: 0.5, c: 0.4 },
  guncel: { a: 0.5, c: 0.42 },
};

// Soru başına ortalama süre tahmini (sn), veri gelene kadar
export const PRIOR_SEC = { turkce: 80, matematik: 120, tarih: 35, cografya: 40, vatandaslik: 30, guncel: 25 };

export function yksRows() {
  return Object.keys(YKS_N).map((k) => ({
    k, label: YKS_LABEL[k], n: YKS_N[k],
    years: Object.entries(YKS).map(([y, r]) => ({ y, d: r[k][0], w: r[k][1], net: r[k][0] - r[k][1] / 4 })),
  }));
}
