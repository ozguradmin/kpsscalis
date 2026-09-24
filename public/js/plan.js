// 9 günlük plan: 25 Eylül – 3 Ekim 2026. Sınav: 4 Ekim 2026 Pazar 10.15.
import TURKCE from './content/turkce.js';
import MATEMATIK from './content/matematik.js';
import TARIH from './content/tarih.js';
import COGRAFYA from './content/cografya.js';
import VATANDASLIK from './content/vatandaslik.js';
import GUNCEL from './content/guncel.js';
import { EXTRA_LESSONS } from './content/extra.js';

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
