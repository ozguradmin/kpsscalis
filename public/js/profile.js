// Hoca'ya giden "Özgür'ün durumu": ilerleme, ustalık, yanlışlar, denemeler, tahmini net.
import { store, todayKey, dueCards } from './store.js';
import { SUBJECTS, LESSONS, STUDY_DAYS } from './plan.js';
import { estimate, mastery, fmtNet, YIELD } from './net.js';

export function dayIndex() {
  const k = todayKey();
  const i = STUDY_DAYS.indexOf(k);
  return i >= 0 ? i + 1 : k < STUDY_DAYS[0] ? 1 : 9;
}

export function studiedIds(st = store.get()) {
  return Object.entries(st.lessons).filter(([id, l]) => LESSONS[id] && (l.done || l.started)).map(([id]) => id);
}

export function buildProfile() {
  const st = store.get();
  const day = dayIndex();
  const est = estimate(st);
  const log = st.log || [];
  const lines = [];
  lines.push(`Bugün ${todayKey()}, ${day}. çalışma günü (9 günden). Toplam çalışma: ${Math.round(Object.values(st.days || {}).reduce((a, b) => a + b, 0) / 60)} dk, bugün ${Math.round((st.days[todayKey()] || 0) / 60)} dk.`);
  lines.push(`Tahmini net şu an ${fmtNet(est.total)} (başlangıç tahmini ${fmtNet(est.start)}, yaklaşık ${est.puan} puan).`);
  for (const s of SUBJECTS) {
    const ls = Object.values(LESSONS).filter((l) => l.s === s.id && l.day).sort((a, b) => a.day - b.day);
    const done = ls.filter((l) => st.lessons[l.id]?.done);
    const next = ls.find((l) => !st.lessons[l.id]?.done);
    const p = est.per[s.id];
    lines.push(`${s.name} (${s.q} soru): ${done.length}/9 ders bitti, tahmini ${fmtNet(p.now)} net${done.length ? '; biten: ' + done.map((l) => `${l.id} %${Math.round(mastery(l.id, st) * 100)}`).join(', ') : ''}${next ? `; sıradaki ${next.id} (${next.day}. gün)` : ''}.`);
  }
  const behind = Object.values(LESSONS).filter((l) => l.day && l.day < day && !st.lessons[l.id]?.done).map((l) => l.id);
  if (behind.length) lines.push(`Geride kalan dersler: ${behind.join(', ')}.`);
  // zayıf dersler: çalışılmış ama ustalığı düşük, sınav değeri yüksek
  const weak = studiedIds(st).map((id) => ({ id, p: mastery(id, st), y: YIELD[id] || 0 })).filter((x) => x.p < 0.55).sort((a, b) => b.y * (1 - b.p) - a.y * (1 - a.p)).slice(0, 5);
  if (weak.length) lines.push(`Zayıf ve değerli konular: ${weak.map((w) => `${w.id} (%${Math.round(w.p * 100)})`).join(', ')}.`);
  const recent = log.slice(-60);
  if (recent.length) {
    const ok = recent.filter((x) => x.ok === 1).length, bad = recent.filter((x) => x.ok === 0).length, blank = recent.filter((x) => x.ok === -1).length;
    const guessed = recent.filter((x) => x.g).length, guessOk = recent.filter((x) => x.g && x.ok === 1).length;
    lines.push(`Son ${recent.length} cevap: ${ok} doğru, ${bad} yanlış, ${blank} boş${guessed ? `; ${guessed} tahmin (${guessOk} tuttu)` : ''}. Toplam çözdüğü soru: ${log.length}.`);
  }
  const mocks = (st.extra.mocks || []).slice(-3);
  if (mocks.length) lines.push(`Son mini denemeler: ${mocks.map((m) => `${fmtNet(m.d - m.y / 4)} net/${m.n} soru`).join(', ')}.`);
  const openWrong = Object.entries(st.wrong || {}).filter(([, w]) => !w.fixed);
  lines.push(`Hata defterinde ${openWrong.length} açık soru; tekrar zamanı gelen ${dueCards().length} kart.`);

  const okKeys = [...new Set(log.filter((x) => x.ok === 1 && x.k).map((x) => x.k))].slice(-200);
  const wrong = openWrong.slice(-30).map(([k, w]) => {
    const n = log.filter((x) => x.k === k && x.ok === 0).length;
    const last = [...log].reverse().find((x) => x.k === k);
    return { k, p: last ? last.p : null, n, q: k.startsWith('ai:') && st.qbank?.[k] ? st.qbank[k].q.slice(0, 300) : undefined };
  });
  return { today: `${todayKey()} (${day}. gün)`, day, studied: studiedIds(st), ok: okKeys, wrong, text: lines.join('\n') };
}
