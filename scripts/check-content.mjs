// İçerik denetimi: her gün 6 ders, her soru 5 seçenekli ve doğru cevap indeksi geçerli mi?
import TURKCE from '../public/js/content/turkce.js';
import MATEMATIK from '../public/js/content/matematik.js';
import TARIH from '../public/js/content/tarih.js';
import COGRAFYA from '../public/js/content/cografya.js';
import VATANDASLIK from '../public/js/content/vatandaslik.js';
import GUNCEL from '../public/js/content/guncel.js';
import { EXTRA_LESSONS, STRATEGY } from '../public/js/content/extra.js';
import { ILLER } from '../public/js/trmap.js';

const all = [...TURKCE, ...MATEMATIK, ...TARIH, ...COGRAFYA, ...VATANDASLIK, ...GUNCEL, ...EXTRA_LESSONS];
const errors = [];
const ids = new Set();
let q = 0, cards = 0, flash = 0;
const answerPos = [0, 0, 0, 0, 0];
for (const l of all) {
  if (ids.has(l.id)) errors.push(`tekrar eden id ${l.id}`);
  ids.add(l.id);
  for (const k of ['id', 's', 'title', 'cards']) if (!l[k]) errors.push(`${l.id}: ${k} eksik`);
  for (const [i, c] of (l.cards || []).entries()) {
    cards++;
    if (c.k === 'check' && !(Array.isArray(c.o) && Number.isInteger(c.a) && c.a >= 0 && c.a < c.o.length)) errors.push(`${l.id} kart ${i}: check hatalı`);
    if (c.k === 'steps' && !(Array.isArray(c.steps) && c.steps.length)) errors.push(`${l.id} kart ${i}: steps boş`);
    for (const v of c.vizs || (c.viz ? [c.viz] : [])) {
      if (v.type === 'map') for (const g of v.groups || []) for (const k of g.iller) if (!ILLER[k]) errors.push(`${l.id}: bilinmeyen il ${k}`);
    }
  }
  for (const [i, x] of (l.quiz || []).entries()) {
    q++;
    if (!Array.isArray(x.o) || x.o.length !== 5) errors.push(`${l.id} soru ${i + 1}: 5 seçenek değil`);
    if (!Number.isInteger(x.a) || x.a < 0 || x.a > 4) errors.push(`${l.id} soru ${i + 1}: cevap indeksi hatalı`);
    else answerPos[x.a]++;
    if (!x.ex) errors.push(`${l.id} soru ${i + 1}: açıklama yok`);
    if (new Set(x.o).size !== x.o.length) errors.push(`${l.id} soru ${i + 1}: aynı seçenek iki kez`);
  }
  flash += (l.flash || []).length;
}
for (let d = 1; d <= 9; d++) {
  const n = all.filter((l) => l.day === d).length;
  if (n !== 6) errors.push(`${d}. gün ${n} ders içeriyor`);
}
console.log(`${all.length} ders, ${cards} kart, ${q} soru, ${flash} bilgi kartı, ${STRATEGY.length} strateji bölümü`);
console.log('Doğru cevap dağılımı A-E:', answerPos.join(' / '));
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log('İçerik denetimi temiz.');
