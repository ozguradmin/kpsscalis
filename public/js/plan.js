// 9 günlük plan: 25 Eylül – 3 Ekim 2026. Sınav: 4 Ekim 2026 Pazar 10.15.
import TURKCE from './content/turkce.js';
import MATEMATIK from './content/matematik.js';
import TARIH from './content/tarih.js';
import COGRAFYA from './content/cografya.js';
import VATANDASLIK from './content/vatandaslik.js';
import GUNCEL from './content/guncel.js';
import { EXTRA_LESSONS } from './content/extra.js';
import BOOST from './content/boost.js';

export const EXAM = new Date('2026-10-04T10:15:00+03:00');
export const DOOR_CLOSE = '10.00';
export const STUDY_DAYS = ['2026-09-25', '2026-09-26', '2026-09-27', '2026-09-28', '2026-09-29', '2026-09-30', '2026-10-01', '2026-10-02', '2026-10-03'];

export const SUBJECTS = [
  { id: 'turkce', name: 'Türkçe', short: 'Tü', letter: 'T', q: 30, color: 'tr' },
  { id: 'matematik', name: 'Matematik', short: 'Ma', letter: 'M', q: 30, color: 'mat' },
  { id: 'tarih', name: 'Tarih', short: 'Ta', letter: 'T', q: 27, color: 'tar' },
  { id: 'cografya', name: 'Coğrafya', short: 'Co', letter: 'C', q: 18, color: 'cog' },
  { id: 'vatandaslik', name: 'Vatandaşlık', short: 'Va', letter: 'V', q: 9, color: 'vat' },
  { id: 'guncel', name: 'Güncel & Kültür', short: 'Gü', letter: 'G', q: 6, color: 'gun' },
];
export const SUBJECT = Object.fromEntries(SUBJECTS.map((s) => [s.id, s]));

const ALL = [...TURKCE, ...MATEMATIK, ...TARIH, ...COGRAFYA, ...VATANDASLIK, ...GUNCEL];

// Çıkmış sorulara göre güçlendirme (content/boost.js): ÖSYM'nin bu dersten sorup anlatımda eksik kalan bilgiler yeni kartlar olarak eklenir,
// "Kendini yokla" ve ders sonu hızlı kontrol soruları ÖSYM ayarındaki (denetlenmiş) sürümleriyle değişir.
for (const l of [...ALL, ...EXTRA_LESSONS]) {
  const b = BOOST[l.id];
  if (!b) continue;
  for (const c of b.checks || []) if (l.cards[c.i]?.k === 'check') l.cards[c.i] = { k: 'check', q: c.q, o: c.o, a: c.a, ex: c.ex };
  const add = [];
  (b.cards || []).forEach((c, i) => {
    add.push({ h: c.h, b: c.b, e: 'Çıkmışlarda sorulan', ...(c.note ? { note: c.note } : {}) });
    for (const q of (b.newchecks || []).filter((x) => x.after === i)) add.push({ k: 'check', q: q.q, o: q.o, a: q.a, ex: q.ex });
  });
  if (add.length) l.cards.push(...add);
  if (b.quiz && b.quiz.length) l.quiz = [...b.quiz.map((q) => ({ q: q.q, o: q.o, a: q.a, ex: q.ex })), ...(l.quiz || []).slice(b.quiz.length)];
}
export const LESSONS = Object.fromEntries([...ALL, ...EXTRA_LESSONS].map((l) => [l.id, l]));
export const EXTRA = EXTRA_LESSONS;

export function lessonsOfDay(day) {
  return SUBJECTS.map((s) => ALL.find((l) => l.s === s.id && l.day === day)).filter(Boolean);
}

export const DAY_THEMES = [
  '',
  'Temeli at: paragraf, işlemler, Millî Mücadele',
  'Cepheler ve ilk taktikler',
  'Cumhuriyet ve inkılaplar',
  'Atatürk ilkeleri, sözel mantık',
  'İlk Türkler, yüzde-kâr, nüfus',
  'Osmanlı kuruluş, grafikler, tarım',
  'Osmanlı kurumları, madenler, 657',
  'Osmanlı son dönem, haklar, karışık',
  'Genel tekrar ve sınav provası',
];

const DAY_NAMES = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
const MONTHS = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];

export function prettyDate(key, withDay = true) {
  const d = new Date(key + 'T12:00:00+03:00');
  const s = `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`;
  return withDay ? `${s} ${DAY_NAMES[d.getUTCDay()]}` : s;
}
