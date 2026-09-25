import { store, pull, startTimer, todayKey, addCards, gradeCard, dueCards, isOnline, logAnswer } from './store.js';
import { SUBJECTS, SUBJECT, LESSONS, EXTRA, STUDY_DAYS, EXAM, DOOR_CLOSE, lessonsOfDay, prettyDate, DAY_THEMES } from './plan.js';
import { renderViz, md, inline, esc } from './viz.js';
import { openChat, mountChat } from './chat.js';
import { STRATEGY } from './content/extra.js';
import { icon } from './icons.js';
import { toast, fmtMin, fmtDur, applyTheme, speak, stopSpeaking, prepQ, questionHTML, questionText, bindStrike, plain, LETTERS } from './ui.js';
import { cardText, strip } from './text.js';
import { estimate, lessonNet, fmtNet, YIELD, mastery } from './net.js';
import { yksRows } from './yks.js';
import { studiedIds } from './profile.js';

const $app = document.getElementById('app');
const $tab = document.getElementById('tabbar');
let cleanup = null;
applyTheme();

// ---------- kabuk yardımcıları ----------
function topbar({ eyebrow = '', title = '', back = null, right = '', line = true }) {
  return `<header class="topbar ${line ? 'line' : ''}">${back ? `<a class="iconbtn" href="${back}" aria-label="Geri">${icon.back}</a>` : ''}
    <div class="ttl"><span class="eyebrow">${eyebrow}</span><b>${title}</b></div>${right}</header>`;
}
function page({ top, body, tabs = true, cls = '' }) {
  return `<div class="view ${tabs ? 'with-tabs' : ''} ${cls}">${top}<div class="scroll" id="sc">${body}</div></div>`;
}
const sc = () => document.getElementById('sc');

document.addEventListener('click', (e) => {
  const g = e.target.closest('[data-go]');
  if (g) location.hash = `#/ders/${g.dataset.go}`;
});

function nowTR() { return new Date(); }

function dayInfo() {
  const k = todayKey();
  const idx = STUDY_DAYS.indexOf(k);
  const examKey = '2026-10-04';
  if (k === examKey) return { mode: 'exam', day: 9, left: 0 };
  if (k > examKey) return { mode: 'after', day: 9, left: 0 };
  if (idx === -1) return { mode: 'before', day: 1, left: STUDY_DAYS.length };
  return { mode: 'study', day: idx + 1, left: STUDY_DAYS.length - idx };
}

const lessonState = (id) => store.get().lessons[id] || {};
const subjTag = (s) => `<span class="tag" data-s="${s}">${esc(SUBJECT[s] ? SUBJECT[s].name : 'Ekstra')}</span>`;

function greet() {
  const h = (nowTR().getUTCHours() + 3) % 24;
  if (h < 5) return 'Geç oldu Özgür, uyku da çalışmanın parçası';
  if (h < 12) return 'Günaydın Özgür';
  if (h < 18) return 'İyi günler Özgür';
  return 'İyi akşamlar Özgür';
}

function countdownText() {
  let ms = EXAM - nowTR();
  if (ms <= 0) return 'Sınav başladı. Başarılar Özgür!';
  const d = Math.floor(ms / 86400000); ms -= d * 86400000;
  const h = Math.floor(ms / 3600000); ms -= h * 3600000;
  const m = Math.floor(ms / 60000); ms -= m * 60000;
  const s = Math.floor(ms / 1000);
  return `Sınava ${d} g ${String(h).padStart(2, '0')} sa ${String(m).padStart(2, '0')} dk ${String(s).padStart(2, '0')} sn`;
}

// ---------- tab bar ----------
function renderTabs(active) {
  if (!active) { $tab.hidden = true; return; }
  $tab.hidden = false;
  const due = dueCards().length;
  const tabs = [
    ['#/', 'Bugün', icon.home, 'home'],
    ['#/plan', 'Plan', icon.plan, 'plan'],
    ['#/tekrar', 'Tekrar', icon.cards, 'tekrar'],
    ['#/hoca', 'Hoca', icon.ai, 'hoca'],
    ['#/daha', 'Daha', icon.more, 'daha'],
  ];
  $tab.innerHTML = `<div class="in">${tabs.map(([h, l, ic, k]) => `<a href="${h}" class="${active === k ? 'on' : ''}" ${active === k ? 'aria-current="page"' : ''}>${ic}<span>${l}</span>${k === 'tekrar' && due ? `<span class="badge">${due > 99 ? '99+' : due}</span>` : ''}</a>`).join('')}</div>`;
}
let activeTab = 'home';
function setTab(t) { activeTab = t; renderTabs(t); }

// ---------- router ----------
const routes = [
  [/^#?\/?$/, viewHome, 'home'],
  [/^#\/plan$/, viewPlan, 'plan'],
  [/^#\/gun\/(\d)$/, viewDay, 'plan'],
  [/^#\/ders\/([\w-]+)$/, viewLesson, null],
  [/^#\/tekrar$/, viewReview, 'tekrar'],
  [/^#\/hatalar$/, viewMistakes, null],
  [/^#\/hoca$/, viewTutor, 'hoca'],
  [/^#\/daha$/, viewMore, 'daha'],
  [/^#\/strateji$/, viewStrategy, 'daha'],
  [/^#\/deneme$/, viewMock, null],
  [/^#\/istatistik$/, viewStats, 'daha'],
  [/^#\/ayarlar$/, viewSettings, 'daha'],
  [/^#\/ekstra$/, viewExtra, 'daha'],
  [/^#\/uret$/, viewGenerate, 'daha'],
  [/^#\/cikmis$/, viewPast, 'daha'],
  [/^#\/cikmis\/([\w-]+)$/, (id) => startPast({ lessons: [id], title: LESSONS[id] ? strip(LESSONS[id].title) : 'Çıkmış sorular' }), null],
];

function route() {
  if (cleanup) { cleanup(); cleanup = null; }
  stopSpeaking();
  document.getElementById('sheet-root').innerHTML = '';
  const h = location.hash || '#/';
  for (const [re, fn, tab] of routes) {
    const m = h.match(re);
    if (m) {
      activeTab = tab;
      renderTabs(tab);
      fn(...m.slice(1));
      return;
    }
  }
  location.hash = '#/';
}
window.addEventListener('hashchange', route);

// ---------- Ana sayfa ----------
function viewHome() {
  const info = dayInfo();
  if (info.mode === 'exam') return viewExamDay();
  const s = store.get();
  const today = lessonsOfDay(info.day);
  const doneCount = today.filter((l) => lessonState(l.id).done).length;
  const next = today.find((l) => !lessonState(l.id).done);
  const behind = [];
  for (let d = 1; d < info.day; d++) lessonsOfDay(d).forEach((l) => { if (!lessonState(l.id).done) behind.push(l); });
  const due = dueCards().length;
  const todaySec = s.days[todayKey()] || 0;
  const est = estimate(s);
  snapshot(est);
  const mist = openMistakes().length;

  const heroNum = info.mode === 'before' ? 9 : info.left;
  const heroSub = info.mode === 'before'
    ? '25 Eylül\'de 1. gün başlıyor.'
    : info.left === 1 ? `Bugün son çalışma günü. Yarın kapı <b>${DOOR_CLOSE}</b>'da kapanır.` : '4 Ekim Pazar 10.15 · sınav günü sayılmaz';

  $app.innerHTML = page({
    top: topbar({ eyebrow: 'KPSS Ön Lisans · 2026', title: 'Aday: Özgür', right: `<a class="iconbtn" href="#/ayarlar" aria-label="Ayarlar">${icon.settings}</a>` }),
    body: `
    <section class="hero" style="margin-top:14px">
      <div class="greet">${greet()}</div>
      <div class="big num">${heroNum}<small>çalışma<br>günü kaldı</small></div>
      <div class="small muted" style="margin-top:6px">${heroSub}</div>
      <div class="clock num" id="clock">${countdownText()}</div>
    </section>

    <div class="statrow">
      <a class="stat ink" href="#/istatistik" style="text-decoration:none"><div class="v num">${Math.round(est.low)}–${Math.round(est.high)}</div><div class="l">bugün girsen net · ≈${Math.round(est.puan)} puan</div></a>
      <div class="stat"><div class="v num">${Math.round(todaySec / 60)}<small> dk</small></div><div class="l">bugün çalıştın</div></div>
      <a class="stat" href="#/tekrar" style="text-decoration:none;color:inherit"><div class="v num">${due}</div><div class="l">kart tekrar bekliyor</div></a>
    </div>
    ${Math.abs(est.gain) >= 0.1 ? `<div class="gain" style="margin-top:8px;${est.gain < 0 ? 'background:var(--warn-soft);color:var(--warn)' : ''}">${icon.trend}<span>YKS geçmişine göre başlangıcın ${fmtNet(est.start)} net · şimdi <b>${est.gain > 0 ? '+' : ''}${fmtNet(est.gain)}</b></span></div>` : ''}

    <section class="card">
      <div class="row between">
        <div><div class="eyebrow">${info.mode === 'before' ? 'İlk gün önizleme' : `Bugün · ${info.day}. gün`}</div>
          <h2 style="margin-top:3px">${prettyDate(STUDY_DAYS[info.day - 1])}</h2></div>
        <div style="text-align:right"><div style="font:800 30px var(--display)" class="num">${doneCount}/6</div><div class="small muted">ders</div></div>
      </div>
      <p class="small muted" style="margin:4px 0 10px">${esc(DAY_THEMES[info.day])}</p>
      <div class="progressbar"><i style="transform:scaleX(${doneCount / 6})"></i></div>
      <div style="margin-top:6px">${today.map(lessonRow).join('')}</div>
      ${next ? `<a class="btn ink block" href="#/ders/${next.id}" style="margin-top:6px">${lessonState(next.id).started ? 'Kaldığın yerden devam et' : 'Sıradaki derse başla'} · ${esc(SUBJECT[next.s].name)}</a>`
        : `<div class="note" style="--s:var(--right)"><div class="eyebrow">Bugünkü plan tamam</div>Harika iş Özgür. Tekrar kartlarını çevir, <a href="#/deneme">mini deneme</a> çöz ya da dinlen; beyin öğrendiklerini uykuda yerleştirir.</div>`}
    </section>

    ${behind.length ? `<a class="rowlink" href="#/gun/${behind[0].day}" style="border-color:color-mix(in srgb, var(--warn) 50%, transparent)"><span class="ico" style="color:var(--warn)">${icon.flag}</span><span><span class="t">${behind.length} ders önceki günlerden bekliyor</span><span class="m">Bugünküleri bitirince bunlara geç. Her biri ~10 dk.</span></span><span class="go">${icon.chev}</span></a>` : ''}
    ${mist ? `<a class="rowlink" href="#/hatalar"><span class="ico ink">${icon.notebook}</span><span><span class="t">Hata defterinde ${mist} soru</span><span class="m">Yanlışı doğruya çevirmek en ucuz net.</span></span><span class="go">${icon.chev}</span></a>` : ''}
    ${!lessonState('ex-tar2').done && info.day >= 2 ? `<a class="rowlink" href="#/ders/ex-tar2" data-s="tarih"><span class="ico" style="color:var(--tar)">${icon.bolt}</span><span><span class="t">Yüksek getirili ekstra: son dönem Osmanlı ve 1945 sonrası</span><span class="m">Geçmiş sınavlarda tarih sorularının ~üçte biri · ~14 dk</span></span><span class="go">${icon.chev}</span></a>` : ''}
    <a class="rowlink" href="#/deneme"><span class="ico">${icon.timer}</span><span><span class="t">Mini deneme</span><span class="m">Sadece çalıştığın konulardan, süreli, net hesabıyla</span></span><span class="go">${icon.chev}</span></a>

    <section style="margin-top:22px">
      <div class="row between" style="margin-bottom:10px"><h3>Cevap kâğıdın</h3><a href="#/plan" class="small">Planın tamamı</a></div>
      ${sheet(info)}
      <p class="small muted" style="margin-top:8px">Her satır bir gün, her baloncuk bir ders. Bitirdiğin dersin baloncuğu kurşun kalemle dolar.</p>
    </section>`,
  });

  const clock = document.getElementById('clock');
  const iv = setInterval(() => { clock.textContent = countdownText(); }, 1000);
  cleanup = () => clearInterval(iv);
}

// Günlük tahmin geçmişi: her günün son tahmini saklanır (gün gün nasıl değiştiğini görmek için)
function snapshot(est) {
  const k = todayKey();
  const cur = store.get().trend?.[k];
  const v = { net: Math.round(est.total * 10) / 10, low: Math.round(est.low), high: Math.round(est.high), puan: Math.round(est.puan) };
  if (!cur || cur.net !== v.net || cur.low !== v.low || cur.high !== v.high) store.update((s) => { (s.trend ||= {})[k] = v; });
}

function lessonRow(l) {
  const st = lessonState(l.id);
  const sub = SUBJECT[l.s];
  return `<a class="rowlink ${st.done ? 'done' : ''}" href="#/ders/${l.id}" data-s="${l.s}" style="margin:7px 0">
    <span class="bubble s ${st.done ? 'filled' : st.started ? 'started' : ''}">${sub ? sub.short : '+'}</span>
    <span><span class="t">${esc(l.title)}</span><span class="m">${esc(sub ? sub.name : 'Ekstra')} · ${st.done ? `bitti${st.total ? ` · ${st.score ?? 0}/${st.total}` : ''}${st.lastSec ? ` · ${fmtDur(st.lastSec)}` : ''}` : `~${l.min || 10} dk${YIELD[l.id] ? ` · sınavda ~${String(YIELD[l.id]).replace('.', ',')} soru` : ''}`}</span></span>
    <span class="go">${icon.chev}</span></a>`;
}

function sheet(info) {
  return `<div class="sheet"><table>
    <thead><tr><th>Gün</th>${SUBJECTS.map((s) => `<th>${s.short}</th>`).join('')}</tr></thead>
    <tbody>${STUDY_DAYS.map((k, i) => {
      const d = i + 1;
      const ls = lessonsOfDay(d);
      return `<tr class="${info.day === d && info.mode === 'study' ? 'is-today' : ''}">
        <td><span class="dayno num">${d}</span> <span class="daydate">${prettyDate(k, false)}</span></td>
        ${SUBJECTS.map((s) => {
          const l = ls.find((x) => x.s === s.id);
          if (!l) return '<td></td>';
          const st = lessonState(l.id);
          return `<td><button class="bubble ${st.done ? 'filled' : st.started ? 'started' : ''}" data-go="${l.id}" aria-label="${d}. gün ${s.name}: ${esc(l.title)}${st.done ? ' (bitti)' : ''}">${s.short}</button></td>`;
        }).join('')}
      </tr>`;
    }).join('')}</tbody></table></div>`;
}

// ---------- Plan ----------
function viewPlan() {
  const info = dayInfo();
  const all = Object.values(LESSONS).filter((l) => l.day);
  const done = all.filter((l) => lessonState(l.id).done).length;
  $app.innerHTML = page({
    top: topbar({ eyebrow: '9 günlük plan', title: `${done}/${all.length} ders bitti` }),
    body: `<div style="margin-top:14px">${sheet(info)}</div>
    <div style="margin-top:18px">
    ${STUDY_DAYS.map((k, i) => {
      const d = i + 1;
      const ls = lessonsOfDay(d);
      const dd = ls.filter((l) => lessonState(l.id).done).length;
      const isToday = info.day === d && info.mode === 'study';
      return `<a class="rowlink" href="#/gun/${d}" ${isToday ? 'style="border-color:var(--ink)"' : ''}>
        <span class="bubble ${dd === ls.length ? 'filled' : dd ? 'started' : ''}">${d}</span>
        <span><span class="t">${prettyDate(k)}${isToday ? ' · bugün' : ''}</span><span class="m">${esc(DAY_THEMES[d])} · ${dd}/${ls.length}</span></span>
        <span class="go">${icon.chev}</span></a>`;
    }).join('')}
    <div class="rowlink" style="border-color:var(--ink)">
      <span class="ico ink">${icon.flag}</span>
      <span><span class="t">4 Ekim Pazar · Sınav günü</span><span class="m">Ders yok. Kimlik, giriş belgesi. Kapı ${DOOR_CLOSE}'da kapanır.</span></span><span></span>
    </div></div>`,
  });
}

function viewDay(d) {
  d = Number(d);
  const ls = lessonsOfDay(d);
  $app.innerHTML = page({
    top: topbar({ eyebrow: `${d}. gün`, title: prettyDate(STUDY_DAYS[d - 1]), back: '#/plan' }),
    body: `<p class="muted" style="margin-top:14px">${esc(DAY_THEMES[d])}</p>${ls.map(lessonRow).join('')}
    <p class="small muted">Her dersi istediğin kadar tekrar açabilirsin. Bitmiş bir dersi yeniden yapmak en iyi tekrar yöntemlerinden biridir.</p>`,
  });
}

// ---------- Ders oynatıcı ----------
function viewLesson(id) {
  const lesson = LESSONS[id];
  if (!lesson) { location.hash = '#/'; return; }
  const timer = startTimer(id);
  const sub = SUBJECT[lesson.s] || { name: 'Ekstra', short: '+' };

  // Isınma: bu dersin konusundan, tekrar zamanı gelmiş en fazla 3 kart (aralıklı geri çağırma)
  const warm = dueCards().filter((cid) => cid.split('#')[0] !== id && LESSONS[cid.split('#')[0]]?.s === lesson.s).slice(0, 3);
  const steps = [];
  if (warm.length) steps.push({ k: 'warm', ids: warm });
  // Ön soru (pretesting): dersi görmeden tahmin etmek, sonra öğrenileni daha kalıcı yapar. Puanlamaya girmez.
  if (lesson.quiz && lesson.quiz.length) steps.push({ k: 'pre', q: prepQ(lesson.quiz[0]) });
  let cardNo = 0;
  const cardsTotal = lesson.cards.length;
  lesson.cards.forEach((c, ci) => steps.push(c.k === 'check' ? { ...prepQ(c), _ci: ci, _no: ++cardNo } : { ...c, _ci: ci, _no: ++cardNo }));
  const quiz = (lesson.quiz || []).map(prepQ);
  quiz.forEach((q, i) => steps.push({ k: 'quiz', q, i }));
  steps.push({ k: 'result' });

  const st = { i: 0, answers: {}, checks: {}, guess: {}, struck: [], completed: false, last: -1, shown: {} };
  const saved = lessonState(id);
  if (saved.pos && !saved.done && saved.pos < steps.length - 1) st.i = saved.pos;
  const s0 = store.get();
  const before = { lessons: { [id]: JSON.parse(JSON.stringify(s0.lessons[id] || {})) }, log: (s0.log || []).filter((x) => x.l === id) };
  const estBefore = estimate(s0).total;

  let qCount = quiz.length;
  const tickHTML = () => steps.map((s, i) => `<i class="${s.k === 'quiz' ? 'q' : ''} ${i < st.i ? 'done' : ''} ${i === st.i ? 'cur' : ''}"></i>`).join('');

  $app.innerHTML = `<div class="view player" data-s="${lesson.s}">
    <header class="topbar">
      <a class="iconbtn" href="${lesson.day ? '#/' : '#/ekstra'}" aria-label="Dersten çık">${icon.close}</a>
      <div class="ttl"><span class="eyebrow" style="color:var(--s)">${esc(sub.name)}${lesson.day ? ` · ${lesson.day}. gün` : ''}</span><b>${esc(lesson.title)}</b></div>
      <button class="iconbtn" id="tts" aria-label="Sesli dinle">${icon.speak}</button>
    </header>
    <div class="ticks" id="ticks"></div>
    <div class="scroll" id="sc"><div class="stage" id="stage"></div></div>
    <div class="actionbar"><button class="fab" id="fab" aria-label="Hocaya sor: bu ekranı görür">${icon.ai}</button><div class="in" id="bar"></div></div>
  </div>`;
  const $stage = document.getElementById('stage');
  const $bar = document.getElementById('bar');
  const $ticks = document.getElementById('ticks');
  const $tts = document.getElementById('tts');

  function go(n) {
    stopSpeaking();
    st.i = Math.max(0, Math.min(steps.length - 1, n));
    st.struck = [];
    store.update((s) => { const l = (s.lessons[id] ||= {}); l.started = true; if (steps[st.i].k !== 'result') l.pos = st.i; });
    render();
  }

  // Hoca'nın "ekranı görmesi" için bağlam
  function aiContext() {
    const step = steps[st.i];
    const c = { lessonId: id };
    if (step.k === 'quiz') {
      c.step = `Ders sonu sorusu ${step.i + 1}/${qCount}`;
      c.question = questionText(step.q, st.answers[step.i]);
      c.answer = st.answers[step.i] == null ? 'Henüz cevaplamadı (ipucu isteyebilir; cevabı hemen söyleme, yönlendir).' : st.answers[step.i] === -1 ? 'Boş bıraktı' : st.answers[step.i] === step.q.a ? 'Doğru yaptı' : `Yanlış yaptı: ${LETTERS[st.answers[step.i]]} dedi, doğrusu ${LETTERS[step.q.a]}`;
    } else if (step.k === 'check') {
      c.step = `Anlatım kartı ${step._no}/${cardsTotal} (kendini yokla sorusu)`;
      const pick = st.checks[st.i];
      c.question = questionText(step, pick == null ? undefined : pick);
      c.screen = cardText({ h: step.h, b: step.b });
    } else if (step.k === 'pre') {
      c.step = 'Dersten önce ön soru (tahmin)';
      c.question = questionText({ ...step.q, a: undefined, ex: '' }).replace(/\nDoğru cevap: undefined/, '');
      c.answer = 'Ön soru: cevabı SÖYLEME, dersin sonunda görecek. Sadece merak uyandıracak kısa bir ipucu ver.';
    } else if (step.k === 'warm') {
      c.step = 'Isınma: önceki derslerden tekrar kartları';
      c.screen = step.ids.map((cid) => { const k = cardById(cid); return k ? `${plain(k.f)} → ${plain(k.b)}` : ''; }).join('\n');
    } else if (step.k === 'result') {
      c.step = 'Ders sonu sonuç ekranı';
      const right = quiz.filter((q, i) => st.answers[i] === q.a).length;
      c.screen = `Ders bitti: ${right}/${qCount} doğru.\n` + quiz.map((q, i) => `Soru ${i + 1}: ${st.answers[i] == null || st.answers[i] === -1 ? 'boş' : st.answers[i] === q.a ? 'doğru' : 'yanlış'} — ${plain(q.q).slice(0, 140)}`).join('\n');
    } else {
      c.step = `Anlatım kartı ${step._no}/${cardsTotal}${step.h ? `: ${plain(step.h)}` : ''}`;
      c.screen = cardText(step) + (step.k === 'steps' ? `\n(Adımların ${st.checks[st.i] || 1}/${step.steps.length} tanesi açık)` : '');
    }
    return c;
  }
  document.getElementById('fab').onclick = () => openChat(aiContext());

  function speakText() {
    const step = steps[st.i];
    if (step.k === 'quiz') return plain(step.q.q) + '. ' + step.q.o.map((o, j) => `${LETTERS[j]}: ${plain(o)}`).join('. ');
    if (step.k === 'pre') return 'Ön soru. ' + plain(step.q.q) + '. ' + step.q.o.map((o, j) => `${LETTERS[j]}: ${plain(o)}`).join('. ');
    if (step.k === 'warm') return 'Isınma. ' + step.ids.map((cid) => plain(cardById(cid)?.f || '')).join('. ');
    if (step.k === 'result') return `Ders bitti Özgür. ${quiz.filter((q, i) => st.answers[i] === q.a).length} doğru.`;
    return [step.h, step.b, step.q, step.o && step.o.map((o, j) => `${LETTERS[j]}: ${o}`).join('. '), step.mn && `Kodlama: ${step.mn.code}. ${step.mn.t}`, step.note && step.note.t].filter(Boolean).map(plain).join('. ');
  }
  $tts.onclick = () => speak(speakText(), $tts);

  function render() {
    const step = steps[st.i];
    if (step.k === 'result' && !st.completed) complete();
    if (st.shown[st.i] == null) st.shown[st.i] = Date.now();
    const moved = st.last !== st.i;
    const back = st.i < st.last;
    st.last = st.i;
    $ticks.innerHTML = tickHTML();
    let html = '';
    const prevBtn = `<button class="btn ghost square" data-prev ${st.i ? '' : 'disabled'} aria-label="Geri">${icon.back}</button>`;
    let bar = '';
    if (step.k === 'warm') {
      html = `<div class="eyebrow">Isınma · önceki derslerden</div><h2>Hatırlıyor musun?</h2>
        <p class="muted small">Önce hatırlamaya çalış, sonra bulanık yere dokun. Hatırlamaya çalışmak, tekrar okumaktan çok daha kalıcıdır.</p>
        ${step.ids.map((cid) => { const c = cardById(cid); return c ? `<div class="card flat tight"><b>${inline(c.f)}</b><div class="hidden-ans" data-reveal style="margin-top:6px">${inline(c.b)}</div></div>` : ''; }).join('')}`;
      bar = `<button class="btn" data-next>Derse geç${icon.fwd}</button>`;
    } else if (step.k === 'pre') {
      const pick = st.pre;
      html = `<div class="eyebrow">Ön soru · bilmen beklenmiyor</div><h2>Dersten önce bir tahmin</h2>
        <p class="muted small">Konuyu görmeden tahmin et. Bilimsel olarak kanıtlı: önce tahmin etmek, cevabı merak ettirir ve öğrendiğini daha iyi tutarsın. Puanlamaya ve tahmini netine girmez.</p>` +
        `<div class="qstem">${questionHTML(step.q, null, {}).split('<div class="opts"')[0]}</div>` +
        `<div class="opts">${step.q.o.map((o, j) => `<button class="opt ${pick === j ? 'sel' : ''} ${pick != null && pick !== j ? 'dim' : ''}" data-pre="${j}" ${pick != null ? 'disabled' : ''}><span class="bubble ${pick === j ? 'filled' : ''}">${LETTERS[j]}</span><span>${inline(o)}</span></button>`).join('')}</div>` +
        (pick != null ? `<div class="note"><div class="eyebrow">Tahminin kaydedildi</div>Doğru cevabı söylemiyorum: bu soru dersin sonunda tekrar karşına gelecek. Anlatımda cevabı yakalamaya çalış.</div>` : '');
      bar = prevBtn + (pick != null ? `<button class="btn" data-next>Derse başla${icon.fwd}</button>` : `<button class="btn ghost" data-next>Hiç fikrim yok, geç</button>`);
    } else if (step.k === 'quiz') {
      const pick = st.answers[step.i];
      html = questionHTML(step.q, pick, {
        head: `<div class="eyebrow">Soru ${step.i + 1} / ${qCount}${step.q.real ? ' · sınav ayarı' : ''}</div>`,
        guess: pick == null ? !!st.guess[step.i] : st.guess[step.i], struck: st.struck,
      });
      bar = prevBtn + (pick == null
        ? `<button class="btn ghost" data-skip>Boş bırak</button>`
        : `<button class="btn" data-next>${step.i === qCount - 1 ? 'Sonucu gör' : 'Sonraki soru'}${icon.fwd}</button>`);
    } else if (step.k === 'result') {
      html = resultHTML();
      bar = `<a class="btn ghost square" href="${lesson.day ? '#/' : '#/ekstra'}" aria-label="Ana sayfa">${icon.home}</a>${nextLessonBtn()}`;
    } else {
      html = cardHTML(step, st.i);
      if (step.k === 'check') {
        bar = prevBtn + (st.checks[st.i] != null ? `<button class="btn" data-next>Devam${icon.fwd}</button>` : '<button class="btn" disabled>Bir şık seç</button>');
      } else if (step.k === 'steps') {
        const shown = st.checks[st.i] || 1;
        bar = prevBtn + (shown < step.steps.length ? `<button class="btn ink" data-more>Sonraki adım (${shown}/${step.steps.length})</button>` : `<button class="btn" data-next>Anladım, devam${icon.fwd}</button>`);
      } else {
        bar = prevBtn + `<button class="btn" data-next>Devam${icon.fwd}</button>`;
      }
    }
    $stage.className = `stage${moved ? ' enter' : ''}${back ? ' back' : ''}`;
    $stage.innerHTML = html;
    $bar.innerHTML = bar;
    if (moved) sc().scrollTop = 0;
    bind(step);
  }

  function bind(step) {
    const root = document.querySelector('.view.player');
    root.querySelectorAll('[data-next]').forEach((b) => b.onclick = () => go(st.i + 1));
    root.querySelectorAll('[data-prev]').forEach((b) => b.onclick = () => go(st.i - 1));
    $stage.querySelectorAll('[data-reveal]').forEach((b) => b.onclick = () => b.classList.add('show'));
    const more = $bar.querySelector('[data-more]');
    if (more) more.onclick = () => { st.checks[st.i] = (st.checks[st.i] || 1) + 1; render(); const all = $stage.querySelectorAll('.step'); all[all.length - 1]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); };
    if (step.k === 'pre') {
      $stage.querySelectorAll('[data-pre]').forEach((b) => b.onclick = () => {
        if (st.pre != null) return;
        st.pre = Number(b.dataset.pre);
        logAnswer({ k: `${id}#on`, l: id, s: lesson.s, ok: st.pre === step.q.a ? 1 : 0, src: 'on-test' });
        render();
      });
    }
    if (step.k === 'check') {
      $stage.querySelectorAll('[data-opt]').forEach((b) => b.onclick = () => {
        if (st.checks[st.i] != null) return;
        const pick = Number(b.dataset.opt);
        st.checks[st.i] = pick;
        logAnswer({ k: `${id}#c${step._ci}`, l: id, s: lesson.s, ok: pick === step.a ? 1 : 0, p: step._map ? step._map[pick] : pick, src: 'kontrol', sec: secSince(st.shown[st.i]) });
        render();
        $stage.querySelector('.feedback')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
    }
    if (step.k === 'quiz') {
      const redraw = () => render();
      $stage.querySelectorAll('[data-opt]').forEach((b) => b.onclick = () => {
        if (st.answers[step.i] != null) return;
        answer(step, Number(b.dataset.opt));
        render();
        $stage.querySelector('.feedback')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
      if (st.answers[step.i] == null) bindStrike($stage, st.struck, redraw);
      const g = $stage.querySelector('[data-guess]');
      if (g) g.onclick = () => { st.guess[step.i] = !st.guess[step.i]; render(); };
      const skip = $bar.querySelector('[data-skip]');
      if (skip) skip.onclick = () => { answer(step, -1); render(); };
    }
    if (step.k === 'result') bindResult();
  }

  function answer(step, pick) {
    st.answers[step.i] = pick;
    const q = step.q;
    const wid = q.real ? q.key : `${id}#${step.i}`;
    const ok = pick === -1 ? -1 : pick === q.a ? 1 : 0;
    logAnswer({ k: wid, l: id, s: lesson.s, ok, p: pick >= 0 && q._map ? q._map[pick] : pick, src: q.real ? 'cikmis' : 'ders', g: st.guess[step.i] ? 1 : 0, sec: secSince(st.shown[st.i]) });
    store.update((s) => {
      if (ok !== 1) {
        s.wrong[wid] = { at: Date.now(), fixed: false };
        if (q.real) (s.qbank ||= {})[wid] = { q: q.q, o: q.o, a: q.a, ex: q.ex, tip: q.tip, l: id, img: q.img, real: true, needimg: q.needimg, src: q.src, s: lesson.s };
      } else if (s.wrong[wid]) s.wrong[wid].fixed = true;
    });
  }

  // Dersin sonuna o konunun gerçek ÖSYM soruları (sayısı konunun sınavdaki ağırlığına göre)
  async function addRealQuestions() {
    const n = Math.max(2, Math.min(6, Math.round((YIELD[id] || 1) / 1.6)));
    const done = (store.get().log || []).filter((x) => x.ok === 1 && x.k && x.k.startsWith('real:')).map((x) => x.k).slice(-250);
    try {
      const r = await fetch(`/api/real?l=${id}&n=${n}&x=${done.join(',')}`);
      const qs = ((await r.json()).questions || []);
      if (!qs.length || st.completed) return;
      const at = steps.findIndex((x) => x.k === 'result');
      const add = qs.map((q) => {
        quiz.push({ ...q, ex: q.bilgi ? `**Sınanan bilgi:** ${q.bilgi}` : '', tip: `Bu soru ${q.src} sınavında soruldu.` });
        return { k: 'quiz', q: quiz[quiz.length - 1], i: quiz.length - 1 };
      });
      steps.splice(at, 0, ...add);
      qCount = quiz.length;
      if (steps[st.i].k !== 'result') render();
    } catch (e) { /* çevrimdışı: sadece ders soruları */ }
  }

  function cardHTML(c, i) {
    let h = '';
    if (c.k === 'video') {
      return `<div class="eyebrow">İstersen izle</div><h2>${inline(c.h || 'Videolu anlatım')}</h2>${md(c.b || '')}
        ${(c.links || []).map(([t, q]) => `<a class="video-link" target="_blank" rel="noopener" href="https://www.youtube.com/results?search_query=${encodeURIComponent(q)}">${icon.play}<span>${esc(t)}<span class="small muted" style="display:block;font-weight:400">YouTube'da ara: “${esc(q)}”</span></span></a>`).join('')}`;
    }
    h += `<div class="eyebrow">${c.k === 'check' ? 'Kendini yokla' : c.k === 'steps' ? 'Adım adım' : c.k === 'reveal' ? 'Önce tahmin et' : c.e || 'Öğren'} · ${c._no}/${cardsTotal}</div>`;
    if (c.h) h += `<h2>${inline(c.h)}</h2>`;
    if (c.b) h += `<div class="body">${md(c.b)}</div>`;
    const vizs = c.vizs || (c.viz ? [c.viz] : []);
    h += vizs.map(renderViz).join('');
    if (c.k === 'steps') {
      const shown = st.checks[i] || 1;
      h += `<div class="steps">${c.steps.slice(0, shown).map((s) => `<div class="step"><div>${s.t ? `<div>${inline(s.t)}</div>` : ''}${s.m ? `<div class="math">${inline(s.m)}</div>` : ''}${s.viz ? renderViz(s.viz) : ''}</div></div>`).join('')}</div>`;
    }
    if (c.k === 'reveal') {
      h += `<div class="card flat"><b>${inline(c.q)}</b><div class="hidden-ans" data-reveal style="margin-top:10px">${md(c.ans)}</div><div class="small muted" style="margin-top:6px">Kafanda cevapla, sonra bulanık yere dokun.</div></div>`;
    }
    if (c.k === 'check') {
      const pick = st.checks[i];
      h += questionHTML({ q: c.q, o: c.o, a: c.a, ex: c.ex }, pick);
    }
    if (c.mn) h += `<div class="mnemo"><div class="eyebrow">Kodlama</div><div class="code">${esc(c.mn.code)}</div><div>${inline(c.mn.t)}</div></div>`;
    if (c.note) h += `<div class="note ${c.note.exam ? 'exam' : ''}"><div class="eyebrow">${esc(c.note.h || 'Sınavda')}</div>${inline(c.note.t)}</div>`;
    return h;
  }

  let result = null;
  function complete() {
    st.completed = true;
    timer.flush();
    const sessionSec = Math.round(timer.elapsed());
    const right = quiz.filter((q, i) => st.answers[i] === q.a).length;
    store.update((s) => {
      const l = (s.lessons[id] ||= {});
      const firstTime = !l.done;
      l.done = true; l.doneAt = l.doneAt || Date.now(); l.pos = 0;
      l.attempts = (l.attempts || 0) + 1; l.score = right; l.total = qCount;
      l.lastSec = sessionSec;
      l.bestSec = l.bestSec ? Math.min(l.bestSec, sessionSec) : sessionSec;
      if (firstTime) { l.firstScore = right; l.firstSec = sessionSec; }
    });
    addCards((lesson.flash || []).map((_, i) => `${id}#${i}`));
    const after = store.get();
    result = { right, sessionSec, gain: lessonNet(id, after) - lessonNet(id, before), est: estimate(after).total, totalSec: after.lessons[id].time || 0 };
    result.estGain = result.est - estBefore;
  }

  function resultHTML() {
    const r = result;
    const wrong = quiz.filter((q, i) => st.answers[i] != null && st.answers[i] !== -1 && st.answers[i] !== q.a).length;
    const blank = qCount - r.right - wrong;
    const net = r.right - wrong / 4;
    const pct = qCount ? r.right / qCount : 1;
    const msg = pct >= 0.8 ? 'Çok iyi! Bu konu sende.' : pct >= 0.5 ? 'Güzel gidiyor. Yanlışlar hata defterine yazıldı; yarın tekrar karşına çıkacak.' : 'Normal: ilk karşılaşma böyle olur. Önemli olan tekrar. Yanlışları hata defterinde bir kez daha çöz.';
    return `<div class="result">
      <div class="eyebrow">Ders bitti</div>
      <span class="bubble hero-b s" id="bigb">${esc(sub.short)}</span>
      <div class="bigscore num">${r.right}/${qCount}</div>
      <p class="muted" style="margin:2px 0 8px">doğru · ${wrong} yanlış · ${blank} boş · net <b>${net.toFixed(2).replace('.', ',')}</b></p>
      ${r.gain >= 0.05 ? `<div class="gain">${icon.trend}<span>Tahmini netine <b>+${fmtNet(r.gain)}</b> eklendi</span></div>` : r.gain <= -0.05 ? `<div class="gain" style="background:var(--warn-soft);color:var(--warn)"><span>Bu sonuç tahminini <b>${fmtNet(r.gain)}</b> net düşürdü. Dürüst olalım: konu henüz oturmadı; hata defteri ve tekrar kartları bunu düzeltir.</span></div>` : `<div class="small muted" style="margin:6px 0">Tahmini net değişmedi: ders içi sorular kolaydır, asıl kanıt deneme ve karışık testlerden gelir.</div>`}
      <p style="margin:10px 0">${msg}</p>
      <div class="grid3" style="text-align:left;margin:14px 0">
        <div class="stat"><div class="v num" style="font-size:22px">${fmtDur(r.sessionSec)}</div><div class="l">bu seferki süre</div></div>
        <div class="stat"><div class="v num" style="font-size:22px">${fmtNet(r.est)}</div><div class="l">tahmini toplam net</div></div>
        <div class="stat"><div class="v num" style="font-size:22px">${(lesson.flash || []).length}</div><div class="l">kart destene eklendi</div></div>
      </div>
      <div class="stack" style="text-align:left">
        <button class="rowlink" data-ai-review><span class="ico ink">${icon.ai}</span><span><span class="t">Hoca sonucumu yorumlasın</span><span class="m">Yanlışlarının nedenini ve sıradaki adımı söyler</span></span><span class="go">${icon.chev}</span></button>
        <a class="rowlink" href="#/cikmis/${id}"><span class="ico" style="color:var(--right)">${icon.flag}</span><span><span class="t">Bu konunun çıkmış soruları</span><span class="m">Geçmiş yıllarda ÖSYM'nin bu konudan sorduğu gerçek sorular</span></span><span class="go">${icon.chev}</span></a>
        <button class="rowlink" data-gen><span class="ico">${icon.spark}</span><span><span class="t">Bu konudan yeni sorularla test</span><span class="m">Hoca yeni ÖSYM tarzı sorular yazar, sohbette çözersin</span></span><span class="go">${icon.chev}</span></button>
        <button class="rowlink" data-restart><span class="ico">${icon.refresh}</span><span><span class="t">Dersi baştan tekrar et</span><span class="m">Tekrar, kalıcılığın en güçlü yolu</span></span><span class="go">${icon.chev}</span></button>
      </div>
    </div>`;
  }

  function nextLessonBtn() {
    if (!lesson.day) return `<a class="btn ink" href="#/ekstra">Ekstra konular</a>`;
    const today = lessonsOfDay(lesson.day);
    const nxt = today.find((l) => l.id !== id && !lessonState(l.id).done);
    return nxt ? `<a class="btn ink" href="#/ders/${nxt.id}">Sıradaki: ${esc(SUBJECT[nxt.s].name)}${icon.fwd}</a>` : `<a class="btn ink" href="#/tekrar">Tekrar kartlarına geç${icon.fwd}</a>`;
  }

  function bindResult() {
    requestAnimationFrame(() => setTimeout(() => document.getElementById('bigb')?.classList.add('filled'), 250));
    $stage.querySelector('[data-restart]').onclick = () => { st.answers = {}; st.checks = {}; st.guess = {}; st.pre = undefined; st.completed = false; timer.resetSession(); go(0); };
    $stage.querySelector('[data-ai-review]').onclick = () => {
      const c = aiContext();
      openChat({ ...c, prompt: 'Bu dersin sonucunu yorumla: nerede hata yaptım, neden, neyi tekrar etmeliyim?' });
    };
    $stage.querySelector('[data-gen]').onclick = () => openChat({ lessonId: id, step: 'Ders sonu', prompt: `${lesson.id} dersinden 5 yeni soruluk test yap (kaynak: yeni).` });
  }

  render();
  addRealQuestions();
  cleanup = () => timer();
}

const secSince = (t) => (t ? Math.min(900, Math.round((Date.now() - t) / 1000)) : undefined);

function cardById(cid) {
  if (cid.startsWith('c:')) {
    const c = store.get().custom?.[cid];
    return c ? { f: c.f, b: c.b, l: null } : null;
  }
  const [lid, n] = cid.split('#');
  const l = LESSONS[lid];
  const c = l && l.flash && l.flash[Number(n)];
  return c ? { f: c[0], b: c[1], l } : null;
}

// ---------- Soru oynatıcı (hata defteri, mini deneme) ----------
// qs: [{ q, o, a, ex, tip, key, l, s }]; reveal: 'instant' (hemen geri bildirim) | 'end'
function questionRunner({ title, eyebrow, qs, reveal = 'instant', minutes = null, exit = '#/daha', src, onFinish }) {
  const st = { i: 0, answers: {}, guess: {}, struck: [], last: -1, started: Date.now(), finished: false, spent: {}, cur: 0, enter: Date.now() };
  const tick = () => { const n = Date.now(); st.spent[st.cur] = (st.spent[st.cur] || 0) + (n - st.enter) / 1000; st.enter = n; st.cur = st.i; };
  setTab(null);
  $app.innerHTML = `<div class="view player">
    <header class="topbar">
      <a class="iconbtn" href="${exit}" aria-label="Çık">${icon.close}</a>
      <div class="ttl"><span class="eyebrow">${esc(eyebrow)}</span><b id="rt">${esc(title)}</b></div>
      ${minutes ? `<span class="chip num" id="clock" style="box-shadow:none">${minutes}:00</span>` : ''}
      <button class="iconbtn" id="tts" aria-label="Sesli dinle">${icon.speak}</button>
    </header>
    <div class="ticks" id="ticks"></div>
    <div class="scroll" id="sc"><div class="stage" id="stage"></div></div>
    <div class="actionbar"><button class="fab" id="fab" aria-label="Hocaya sor">${icon.ai}</button><div class="in" id="bar"></div></div>
  </div>`;
  const $stage = document.getElementById('stage');
  const $bar = document.getElementById('bar');
  const timer = startTimer(src);
  let iv = null;
  if (minutes) {
    iv = setInterval(() => {
      const left = Math.max(0, minutes * 60 - Math.round((Date.now() - st.started) / 1000));
      const el = document.getElementById('clock');
      if (el) el.textContent = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`;
      if (!left) finish();
    }, 1000);
  }
  cleanup = () => { clearInterval(iv); timer(); };

  document.getElementById('tts').onclick = (e) => { const q = qs[st.i]; speak(plain(q.q) + '. ' + q.o.map((o, j) => `${LETTERS[j]}: ${plain(o)}`).join('. '), e.currentTarget); };
  document.getElementById('fab').onclick = () => {
    const q = qs[st.i];
    const pick = st.answers[st.i];
    const showAns = reveal === 'instant' || st.finished;
    openChat({ lessonId: q.l, step: `${title} · soru ${st.i + 1}/${qs.length}`, question: showAns ? questionText(q, pick) : questionText({ ...q, a: undefined, ex: '' }).replace(/\nDoğru cevap: undefined/, ''), answer: showAns ? undefined : 'Deneme sürüyor: cevabı SÖYLEME, sadece konuyu hatırlatacak kısa bir ipucu ver.' });
  };

  function draw() {
    tick();
    const q = qs[st.i];
    const pick = st.answers[st.i];
    const moved = st.last !== st.i;
    const back = st.i < st.last;
    st.last = st.i;
    document.getElementById('ticks').innerHTML = qs.map((x, j) => `<i class="${st.answers[j] != null ? 'done' : ''} ${j === st.i ? 'cur' : ''}"></i>`).join('');
    const head = `<div class="row between"><span class="eyebrow">Soru ${st.i + 1} / ${qs.length}</span>${q.s ? subjTag(q.s) : ''}</div>`;
    if (reveal === 'instant') {
      $stage.innerHTML = questionHTML(q, pick, { head, guess: pick == null ? !!st.guess[st.i] : st.guess[st.i], struck: st.struck });
    } else {
      // deneme: işaretle, değiştirebil, sonuç sonda
      $stage.innerHTML = head + questionHTML(q, null, {}).split('<div class="opts"')[0] +
        `<div class="opts">${q.o.map((o, j) => `<button class="opt ${pick === j ? 'sel' : ''} ${st.struck.includes(j) ? 'struck' : ''}" data-opt="${j}"><span class="bubble ${pick === j ? 'filled' : ''}">${LETTERS[j]}</span><span>${inline(o)}</span></button>`).join('')}</div>
        <div class="row between"><span class="elim-hint">Basılı tutarak şık ele</span><button class="chip ${st.guess[st.i] ? 'on' : ''}" data-guess>${icon.sparkQ}<span>Tahmin</span></button></div>`;
    }
    $stage.className = `stage${moved ? ' enter' : ''}${back ? ' back' : ''}`;
    const prev = `<button class="btn ghost square" data-prev ${st.i ? '' : 'disabled'} aria-label="Önceki">${icon.back}</button>`;
    const last = st.i === qs.length - 1;
    if (reveal === 'instant') {
      $bar.innerHTML = prev + (pick == null ? `<button class="btn ghost" data-blank>Boş bırak</button>` : last ? `<button class="btn ink" data-finish>Bitir</button>` : `<button class="btn" data-next>Sonraki${icon.fwd}</button>`);
    } else {
      $bar.innerHTML = prev + (last ? `<button class="btn ink" data-finish>Denemeyi bitir</button>` : `<button class="btn" data-next>${pick != null ? 'Sonraki' : 'Boş geç'}${icon.fwd}</button>`);
    }
    if (moved) sc().scrollTop = 0;
    $stage.querySelectorAll('[data-opt]').forEach((b) => b.onclick = () => {
      const j = Number(b.dataset.opt);
      if (reveal === 'instant') {
        if (pick != null) return;
        st.answers[st.i] = j; st.struck = [];
        record(st.i, j);
        draw();
        $stage.querySelector('.feedback')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } else { st.answers[st.i] = st.answers[st.i] === j ? undefined : j; draw(); }
    });
    if (pick == null || reveal !== 'instant') bindStrike($stage, st.struck, draw);
    const g = $stage.querySelector('[data-guess]'); if (g) g.onclick = () => { st.guess[st.i] = !st.guess[st.i]; draw(); };
    const on = (sel, fn) => { const x = $bar.querySelector(sel); if (x) x.onclick = fn; };
    on('[data-prev]', () => { st.i--; st.struck = []; draw(); });
    on('[data-next]', () => { st.i++; st.struck = []; draw(); });
    on('[data-blank]', () => { st.answers[st.i] = -1; record(st.i, -1); draw(); });
    on('[data-finish]', () => {
      const empty = qs.filter((_, j) => st.answers[j] == null).length;
      if (reveal !== 'instant' && empty && !confirm(`${empty} soru boş. Denemeyi bitirmek istiyor musun?`)) return;
      finish();
    });
  }

  function record(i, pick) {
    tick();
    const q = qs[i];
    const ok = pick === -1 || pick == null ? -1 : pick === q.a ? 1 : 0;
    logAnswer({ k: q.key || null, l: q.l || null, s: q.s || null, ok, p: pick >= 0 && q._map ? q._map[pick] : pick, src, g: st.guess[i] ? 1 : 0, sec: Math.min(900, Math.round(st.spent[i] || 0)) || undefined });
    if (q.key) store.update((s) => {
      if (ok === 1) { if (s.wrong[q.key]) s.wrong[q.key].fixed = true; }
      else {
        s.wrong[q.key] = { at: Date.now(), fixed: false };
        if (q.key.startsWith('ai:') || q.key.startsWith('real:')) (s.qbank ||= {})[q.key] = { q: q.q, o: q._orig || q.o, a: q._origA ?? q.a, ex: q.ex, tip: q.tip, l: q.l, img: q.img, real: q.real, needimg: q.needimg, src: q.src, s: q.s };
      }
    });
  }

  function finish() {
    if (st.finished) return;
    st.finished = true;
    clearInterval(iv);
    if (reveal !== 'instant') qs.forEach((_, j) => record(j, st.answers[j] == null ? -1 : st.answers[j]));
    timer.flush();
    onFinish({ qs, answers: st.answers, guess: st.guess, sec: Math.round((Date.now() - st.started) / 1000) });
  }
  draw();
}

function resultAnalysisPrompt(title, qs, answers, guess) {
  const d = qs.filter((q, j) => answers[j] === q.a).length;
  const y = qs.filter((q, j) => answers[j] != null && answers[j] !== -1 && answers[j] !== q.a).length;
  const detail = qs.map((q, j) => {
    const a = answers[j];
    return `Soru ${j + 1}${q.l ? ` (${q.l} · ${plain(LESSONS[q.l]?.title || '')})` : ''}: ${a == null || a === -1 ? 'BOŞ' : a === q.a ? 'DOĞRU' : 'YANLIŞ'}${guess[j] ? ' [tahmin]' : ''}\n${plain(q.q).slice(0, 300)}\nÖzgür: ${a == null || a === -1 ? '-' : LETTERS[a]} · Doğru: ${LETTERS[q.a]}`;
  }).join('\n\n');
  return `[TEST SONUCU] "${title}": ${d} doğru, ${y} yanlış, ${qs.length - d - y} boş (net ${(d - y / 4).toFixed(2)}).\n\n${detail}\n\nSonucumu analiz et.`;
}

// ---------- Tekrar kartları ----------
function viewReview() {
  const ids = dueCards();
  const all = Object.keys(store.get().cards).filter((c) => cardById(c));
  if (!ids.length) {
    $app.innerHTML = page({
      top: topbar({ eyebrow: 'Aralıklı tekrar', title: `${all.length} kart destede` }),
      body: `<div class="empty"><span class="bubble filled"></span><h2>Şu an tekrar edilecek kart yok</h2>
      <p>Bir dersi bitirince o dersin bilgi kartları buraya eklenir. Kartlar sen unutmadan hemen önce (1, 2, 4 gün sonra) tekrar karşına çıkar.</p>
      ${all.length ? `<button class="btn ghost" id="allcards">Yine de 20 kart çalış</button>` : `<a class="btn" href="#/">Bugünkü derslere git</a>`}</div>
      <a class="rowlink" href="#/hatalar"><span class="ico ink">${icon.notebook}</span><span><span class="t">Hata defteri</span><span class="m">${openMistakes().length} soru yeniden çözülmeyi bekliyor</span></span><span class="go">${icon.chev}</span></a>`,
    });
    const b = document.getElementById('allcards');
    if (b) b.onclick = () => flashSession(all.sort(() => Math.random() - 0.5).slice(0, 20));
    return;
  }
  flashSession(ids.sort(() => Math.random() - 0.5));
}

function flashSession(ids) {
  let i = 0;
  let flipped = false;
  const stats = { 2: 0, 1: 0, 0: 0 };
  setTab(null);
  $app.innerHTML = `<div class="view player">
    <header class="topbar"><a class="iconbtn" href="#/" aria-label="Çık">${icon.close}</a><div class="ttl"><span class="eyebrow" id="fe"></span><b id="ft"></b></div><button class="iconbtn" id="tts" aria-label="Sesli dinle">${icon.speak}</button></header>
    <div style="padding:0 var(--gutter) 8px"><div class="progressbar"><i id="fp" style="transform:scaleX(0)"></i></div></div>
    <div class="scroll" id="sc" style="display:flex;flex-direction:column"><div id="fc-wrap" style="flex:1;display:flex;flex-direction:column;justify-content:center"></div></div>
    <div class="actionbar"><div class="in" id="bar"></div></div></div>`;
  const draw = () => {
    if (i >= ids.length) {
      setTab('tekrar');
      $app.innerHTML = page({
        top: topbar({ eyebrow: 'Aralıklı tekrar', title: 'Bitti' }),
        body: `<div class="result" style="margin-top:20px"><div class="eyebrow">Tekrar bitti</div><span class="bubble hero-b filled"></span>
        <h2>${ids.length} kart çalıştın</h2><p class="muted">Biliyordum ${stats[2]} · Emin değildim ${stats[1]} · Bilmiyordum ${stats[0]}</p>
        <p>Bilmediklerin 10 dakika sonra, emin olmadıkların yarın tekrar gelecek.</p><a class="btn block" href="#/">Ana sayfa</a></div>`,
      });
      return;
    }
    const c = cardById(ids[i]);
    if (!c) { i++; return draw(); }
    document.getElementById('fe').textContent = `Tekrar · ${i + 1}/${ids.length}`;
    document.getElementById('ft').textContent = c.l ? `${SUBJECT[c.l.s]?.name || ''} · ${strip(c.l.title)}` : 'Hocanın eklediği kart';
    document.getElementById('fp').style.transform = `scaleX(${i / ids.length})`;
    document.getElementById('fc-wrap').innerHTML = `<div class="flash ${flipped ? 'flip' : ''}" id="fc" role="button" aria-label="Kartı çevir"><div class="in">
        <div class="face"><span class="eyebrow">Soru · dokun ve çevir</span>${inline(c.f)}</div>
        <div class="face back"><span class="eyebrow">Cevap</span>${inline(c.b)}</div></div></div>`;
    document.getElementById('bar').innerHTML = flipped
      ? `<button class="btn ghost" data-g="0" style="color:var(--wrong)">Bilmiyordum</button><button class="btn ghost" data-g="1">Emin değil</button><button class="btn ok" data-g="2">Biliyordum</button>`
      : `<button class="btn block" id="flipbtn">Cevabı göster</button>`;
    document.getElementById('fc').onclick = () => { flipped = !flipped; draw(); };
    const fb = document.getElementById('flipbtn');
    if (fb) fb.onclick = () => { flipped = true; draw(); };
    document.getElementById('tts').onclick = (e) => speak(plain(flipped ? c.b : c.f), e.currentTarget);
    document.querySelectorAll('[data-g]').forEach((b) => b.onclick = () => {
      const g = Number(b.dataset.g);
      stats[g]++;
      gradeCard(ids[i], g);
      // "Biliyordum/Bilmiyordum" analize az ağırlıkla girer; "emin değilim" girmez
      if (c.l && g !== 1) logAnswer({ k: `kart:${ids[i]}`, l: c.l.id, s: c.l.s, ok: g === 2 ? 1 : 0, src: 'kart' });
      i++; flipped = false; stopSpeaking(); draw();
    });
  };
  draw();
}

// ---------- Hata defteri ----------
function mistakeQuestion(k) {
  if (k.startsWith('ai:') || k.startsWith('real:')) { const q = store.get().qbank?.[k]; return q ? { ...q } : null; }
  const [lid, qi] = k.split('#');
  if (!/^\d+$/.test(qi || '')) return null;
  const q = LESSONS[lid]?.quiz?.[Number(qi)];
  return q ? { ...q, l: lid } : null;
}
function openMistakes() {
  return Object.entries(store.get().wrong).filter(([, w]) => !w.fixed).map(([k]) => k).filter((k) => mistakeQuestion(k));
}

function viewMistakes() {
  const keys = openMistakes();
  if (!keys.length) {
    setTab('daha');
    $app.innerHTML = page({
      top: topbar({ eyebrow: 'Hata defteri', title: 'Defter temiz', back: '#/daha' }),
      body: `<div class="empty"><span class="bubble filled"></span><h2>Çözülmemiş hata yok</h2><p>Yanlış yaptığın ya da boş bıraktığın her soru buraya düşer. Doğru çözdüğün an defterden silinir.</p><a class="btn" href="#/">Bugünkü derslere dön</a></div>`,
    });
    return;
  }
  const qs = keys.map((k) => { const q = mistakeQuestion(k); const p = prepQ(q); p._orig = q.o; p._origA = q.a; return { ...p, key: k, s: LESSONS[q.l]?.s }; });
  questionRunner({
    title: `${qs.length} açık soru`, eyebrow: 'Hata defteri', qs, reveal: 'instant', exit: '#/', src: 'hata',
    onFinish: ({ answers, guess }) => {
      const fixed = qs.filter((q, j) => answers[j] === q.a).length;
      setTab('daha');
      $app.innerHTML = page({
        top: topbar({ eyebrow: 'Hata defteri', title: 'Tur bitti', back: '#/daha' }),
        body: `<div class="result" style="margin-top:18px"><span class="bubble hero-b filled"></span><div class="bigscore num">${fixed}/${qs.length}</div>
          <p>${fixed} hatayı düzelttin. ${qs.length - fixed ? `${qs.length - fixed} soru defterde kaldı; yarın tekrar dene.` : 'Defter tertemiz!'}</p>
          <div class="stack"><button class="btn ink block" id="ai">${icon.ai}Hoca hatalarımı analiz etsin</button><a class="btn ghost block" href="#/">Ana sayfa</a></div></div>`,
      });
      document.getElementById('ai').onclick = () => openChat({ prompt: resultAnalysisPrompt('Hata defteri turu', qs, answers, guess) });
    },
  });
}

// ---------- Hoca (tam ekran sohbet) ----------
function viewTutor() {
  mountChat($app, {}, { withTabs: true });
}

// ---------- Daha fazla ----------
function viewMore() {
  const mist = openMistakes().length;
  const items = [
    ['#/cikmis', 'Çıkmış sorular', '2010-2026 arası gerçek ÖSYM soruları, konu konu', icon.flag],
    ['#/deneme', 'Mini deneme', 'Çalıştığın konulardan, süreli, net hesabıyla', icon.timer],
    ['#/hatalar', 'Hata defteri', `${mist} soru yeniden çözülmeyi bekliyor`, icon.notebook],
    ['#/strateji', 'Sınav stratejisi', '4 yanlış 1 doğru hesabı, süre planı, soru sırası', icon.target],
    ['#/ekstra', 'Ekstra konular', 'Günlük planın dışında, canın çalışmak isterse', icon.layers],
    ['#/uret', 'Yapay zekâ ile soru üret', 'İstediğin konudan yeni ÖSYM tarzı sorular', icon.spark],
    ['#/istatistik', 'Gerçekçi analiz', 'Bugün girsen kaç doğru, kaç yanlış, kaç net; YKS geçmişin', icon.chart],
    ['#/ayarlar', 'Ayarlar', 'Tema, sesli okuma, senkron', icon.settings],
  ];
  $app.innerHTML = page({
    top: topbar({ eyebrow: 'Daha fazla', title: 'Ekstra çalışma ve ayarlar' }),
    body: `<div style="margin-top:10px">${items.map(([h, t, m, ic]) => `<a class="rowlink" href="${h}"><span class="ico">${ic}</span><span><span class="t">${t}</span><span class="m">${m}</span></span><span class="go">${icon.chev}</span></a>`).join('')}</div>`,
  });
}

function viewStrategy() {
  $app.innerHTML = page({
    top: topbar({ eyebrow: 'Sınav stratejisi', title: 'Netini kurtaran kurallar', back: '#/daha' }),
    body: `${STRATEGY.map((c) => `<section class="card">${c.h ? `<h3>${inline(c.h)}</h3>` : ''}${c.b ? `<div class="body">${md(c.b)}</div>` : ''}${(c.vizs || (c.viz ? [c.viz] : [])).map(renderViz).join('')}${c.note ? `<div class="note exam"><div class="eyebrow">${esc(c.note.h || 'Unutma')}</div>${inline(c.note.t)}</div>` : ''}</section>`).join('')}
    <section class="card"><h3>Boş mu bırakayım, işaretleyeyim mi?</h3>
      <p class="small muted">Kaç şıkkı kesin eleyebildiğini seç, işaretlemenin sana ortalama ne kazandıracağını gör.</p>
      <div class="chips" id="elim">${[0, 1, 2, 3].map((n) => `<button class="chip" data-n="${n}">${n} şık eledim</button>`).join('')}</div>
      <div id="elimout" style="margin-top:12px"></div></section>`,
  });
  const out = document.getElementById('elimout');
  const show = (n) => {
    const k = 5 - n;
    const ev = (1 / k) - ((k - 1) / k) * 0.25;
    out.innerHTML = `<div class="note ${ev > 0.001 ? '' : 'exam'}" style="--s:${ev > 0.001 ? 'var(--right)' : 'var(--warn)'}">
      <div class="eyebrow">${k} şık arasında tahmin</div>
      Doğru olma şansı <b>1/${k}</b>. Ortalama kazanç soru başına <b>${ev >= 0 ? '+' : ''}${ev.toFixed(3).replace('.', ',')} net</b>.
      ${n === 0 ? 'Hiç eleyemiyorsan tahmin ortalamada 0 getirir; <b>boş bırakmak</b> daha güvenli.' : 'En az bir şıkkı eminlikle eleyebiliyorsan <b>işaretle</b>: uzun vadede kazandırır.'}</div>`;
    document.querySelectorAll('#elim .chip').forEach((c) => c.classList.toggle('on', Number(c.dataset.n) === n));
  };
  document.querySelectorAll('#elim .chip').forEach((c) => c.onclick = () => show(Number(c.dataset.n)));
  show(1);
}

// ---------- Mini deneme: sadece çalışılan konulardan ----------
const MOCK_SHARE = { turkce: 30, matematik: 30, tarih: 27, cografya: 18, vatandaslik: 9, guncel: 6 };

function mockPool() {
  const s = store.get();
  const studied = new Set(studiedIds(s));
  const log = s.log || [];
  const okCount = {};
  log.forEach((x) => { if (x.k && x.ok === 1) okCount[x.k] = (okCount[x.k] || 0) + 1; });
  const pool = [];
  for (const id of studied) {
    const l = LESSONS[id];
    (l.quiz || []).forEach((q, i) => pool.push({ ...q, key: `${id}#${i}`, l: id, s: l.s, w: 1 / (1 + (okCount[`${id}#${i}`] || 0) * 1.5) }));
  }
  Object.entries(s.qbank || {}).forEach(([k, q]) => { if (q.l && studied.has(q.l)) pool.push({ ...q, key: k, s: LESSONS[q.l]?.s, w: 1.2 }); });
  Object.entries(s.aiQs || {}).forEach(([lid, arr]) => { if (studied.has(lid)) (arr || []).forEach((q) => pool.push({ ...q, key: q.key || null, l: lid, s: LESSONS[lid]?.s, w: 0.9 })); });
  return { pool, studied: [...studied] };
}

function pickMock(pool, n) {
  const bySub = {};
  pool.forEach((q) => (bySub[q.s] ||= []).push(q));
  const subs = Object.keys(bySub);
  const shareSum = subs.reduce((a, s) => a + (MOCK_SHARE[s] || 5), 0);
  const out = [];
  subs.forEach((s) => {
    const want = Math.max(1, Math.round((n * (MOCK_SHARE[s] || 5)) / shareSum));
    const arr = bySub[s].map((q) => ({ q, r: Math.random() * q.w })).sort((a, b) => b.r - a.r).map((x) => x.q);
    out.push(...arr.slice(0, want));
  });
  // sınav sırası: Türkçe, Matematik, Tarih, Coğrafya, Vatandaşlık, Güncel
  const order = SUBJECTS.map((x) => x.id);
  return out.slice(0, n).sort((a, b) => order.indexOf(a.s) - order.indexOf(b.s));
}

function viewMock() {
  setTab('daha');
  const { pool, studied } = mockPool();
  const bySub = SUBJECTS.map((s) => ({ s, n: pool.filter((q) => q.s === s.id).length, ls: studied.filter((id) => LESSONS[id].s === s.id).length })).filter((x) => x.n);
  let size = Math.min(20, pool.length);
  let addAI = false;
  const draw = () => {
    $app.innerHTML = page({
      top: topbar({ eyebrow: 'Mini deneme', title: 'Çalıştığın konulardan', back: '#/daha' }),
      body: studied.length ? `
        <p class="muted" style="margin-top:14px">Deneme sadece <b>çalıştığın ${studied.length} dersten</b> gelir; önce henüz doğru çözmediğin sorular seçilir. Soru dağılımı gerçek sınav oranlarına göre ayarlanır.</p>
        <div class="card flat">${bySub.map((x) => `<div class="subjbar" data-s="${x.s.id}"><span class="tag">${esc(x.s.name)}</span><span class="small muted">${x.ls} ders</span><span class="small num" style="text-align:right">${x.n} soru</span></div>`).join('')}</div>
        <div class="card flat"><b>Soru sayısı</b><div class="seg" id="size" style="margin-top:8px;display:flex">${[10, 20, 30].map((n) => `<button data-n="${n}" class="${size === n ? 'on' : ''}" ${n > pool.length + 10 ? 'disabled' : ''} style="flex:1">${n}</button>`).join('')}</div>
          <p class="small muted" style="margin:8px 0 0">Süre: soru başına 65 sn (gerçek sınav temposu).</p>
          <label class="row" style="margin-top:12px;gap:10px"><input type="checkbox" id="ai" ${addAI ? 'checked' : ''} style="width:22px;height:22px;accent-color:var(--ink)"><span class="small"><b>Yapay zekâ ile taze sorular ekle.</b> En zayıf 2 konundan yeni ÖSYM tarzı sorular yazılır (20-40 sn).</span></label></div>
        <button class="btn ink block" id="start">${icon.timer}Denemeye başla</button>`
        : `<div class="empty"><span class="bubble"></span><h2>Önce bir ders bitir</h2><p>Mini deneme sadece çalıştığın konulardan soru getirir; kafana göre değil. Bugünün ilk dersini bitirince burası açılır.</p><a class="btn ink" href="#/">Bugünkü derslere git</a></div>`,
    });
    document.querySelectorAll('#size button').forEach((b) => b.onclick = () => { size = Number(b.dataset.n); draw(); });
    const ai = document.getElementById('ai'); if (ai) ai.onchange = () => { addAI = ai.checked; };
    const st = document.getElementById('start'); if (st) st.onclick = start;
  };
  async function start() {
    let extra = [];
    // Gerçek ÖSYM soruları: çalıştığın derslerden, sınava en yakın malzeme
    try {
      const done = new Set((store.get().log || []).filter((x) => x.ok === 1 && x.k && x.k.startsWith('real:')).map((x) => x.k));
      const r = await fetch(`/api/real?l=${studied.join(',')}&n=${size * 2}&x=${[...done].slice(-200).join(',')}`);
      const d = await r.json();
      (d.questions || []).forEach((q) => pool.push({ ...q, w: 1.8 }));
    } catch (e) { /* çevrimdışı */ }
    // Doğrulanmış yapay zekâ soru bankasından da çek (çevrimdışıysa atla)
    try {
      const r = await fetch(`/api/bank?l=${studied.join(',')}&n=${size}`);
      const d = await r.json();
      const have = new Set(pool.map((q) => q.key));
      (d.questions || []).forEach((q) => { if (!have.has(q.key)) pool.push({ ...q, s: LESSONS[q.l]?.s, w: 1.1 }); });
    } catch (e) { /* bankasız devam */ }
    if (addAI) {
      const btn = document.getElementById('start');
      btn.disabled = true; btn.innerHTML = '<span class="typing"><i></i><i></i><i></i></span>Sorular yazılıyor…';
      const weak = studied.map((id) => ({ id, p: mastery(id), y: YIELD[id] || 0 })).sort((a, b) => b.y * (1 - b.p) - a.y * (1 - a.p)).slice(0, 2);
      const res = await Promise.allSettled(weak.map((w) => fetch('/api/questions', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ lessonId: w.id, count: 3, level: 'hard' }) }).then((r) => r.json()).then((d) => (d.questions || []).map((q) => ({ ...q, l: w.id, s: LESSONS[w.id].s, key: `ai:${hashStr(q.q)}` })))));
      res.forEach((r) => { if (r.status === 'fulfilled') extra.push(...r.value); });
      if (!extra.length) toast('Yeni soru yazılamadı; bankadaki sorularla devam ediyoruz.');
      else store.update((s) => { extra.forEach((q) => { (s.aiQs[q.l] ||= []).push({ ...q }); s.aiQs[q.l] = s.aiQs[q.l].slice(-30); }); });
    }
    const base = pickMock(pool, Math.max(1, size - extra.length));
    const qs = [...base, ...extra].sort((a, b) => SUBJECTS.findIndex((x) => x.id === a.s) - SUBJECTS.findIndex((x) => x.id === b.s))
      .map((q) => { const p = prepQ(q); p._orig = q.o; p._origA = q.a; return p; });
    questionRunner({
      title: `${qs.length} soru`, eyebrow: 'Mini deneme', qs, reveal: 'end', minutes: Math.max(5, Math.round((qs.length * 65) / 60)), exit: '#/daha', src: 'deneme',
      onFinish: (r) => mockResult(r),
    });
  }
  draw();
}

function hashStr(s) { let h = 0; for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) | 0; return (h >>> 0).toString(36); }

function mockResult({ qs, answers, guess, sec }) {
  const by = {};
  let D = 0, Y = 0;
  qs.forEach((q, j) => {
    const b = (by[q.s] ||= { d: 0, y: 0, n: 0 });
    b.n++;
    if (answers[j] == null || answers[j] === -1) return;
    if (answers[j] === q.a) { b.d++; D++; } else { b.y++; Y++; }
  });
  store.update((s) => { (s.extra.mocks ||= []).push({ at: Date.now(), d: D, y: Y, n: qs.length, sec }); });
  setTab('daha');
  const net = D - Y / 4;
  const scaled = (net / qs.length) * 120;
  $app.innerHTML = page({
    top: topbar({ eyebrow: 'Mini deneme', title: 'Sonuç', back: '#/daha' }),
    body: `<div class="result" style="margin-top:12px"><span class="bubble hero-b filled"></span>
      <div class="bigscore num">${fmtNet(net)}</div><p class="muted">net · ${D} doğru · ${Y} yanlış · ${qs.length - D - Y} boş · ${fmtDur(sec)}</p>
      <p class="small">Bu tempoyla 120 soruluk sınavda yaklaşık <b>${fmtNet(scaled)} net</b> (çalıştığın konular için).</p></div>
      <div class="card flat">${Object.entries(by).map(([sid, b]) => `<div class="subjbar" data-s="${sid}"><span class="tag">${esc(SUBJECT[sid]?.name || sid)}</span><div class="progressbar"><i style="transform:scaleX(${b.d / b.n});background:var(--s)"></i></div><span class="small num">${b.d}/${b.n}</span></div>`).join('')}</div>
      <div class="stack"><button class="btn ink block" id="ai">${icon.ai}Hoca sonucumu analiz etsin</button>
      <button class="btn ghost block" id="rev">Soruları cevaplarıyla gözden geçir</button>
      <a class="btn ghost block" href="#/hatalar">${icon.notebook}Yanlışlarımı çöz</a></div>
      <div id="revbox"></div>`,
  });
  document.getElementById('ai').onclick = () => openChat({ prompt: resultAnalysisPrompt('Mini deneme', qs, answers, guess) });
  document.getElementById('rev').onclick = (e) => {
    e.currentTarget.remove();
    document.getElementById('revbox').innerHTML = qs.map((q, j) => `<div class="card flat">${questionHTML(q, answers[j] == null ? -1 : answers[j], { head: `<div class="row between"><span class="eyebrow">Soru ${j + 1}</span>${q.s ? subjTag(q.s) : ''}</div>` })}</div>`).join('');
  };
}

// ---------- Çıkmış sorular ----------
async function viewPast() {
  const studied = new Set(studiedIds());
  let stats = {};
  let sub = 'all';
  const draw = () => {
    const total = Object.values(stats).reduce((a, b) => a + b, 0);
    const ls = Object.values(LESSONS).filter((l) => (sub === 'all' || l.s === sub) && stats[l.id]).sort((a, b) => (a.day || 99) - (b.day || 99) || a.s.localeCompare(b.s));
    $app.innerHTML = page({
      top: topbar({ eyebrow: 'Çıkmış sorular', title: total ? `${total} gerçek ÖSYM sorusu` : 'Gerçek ÖSYM soruları', back: '#/daha' }),
      body: `<p class="muted small" style="margin-top:14px">2010-2026 arası ön lisans, ortaöğretim ve lisans kitapçıklarından; senin derslerine göre ayrıldı. Soru kitapçıktaki orijinal hâliyle gelir (şekil, harita, altı çizili yerler dahil). Doğru çözdüğün soru tekrar gelmez. Ön lisans ve son yılların soruları önce gelir.</p>
        <button class="btn ink block" id="mix" ${studied.size ? '' : 'disabled'}>${icon.bolt}Çalıştığım konulardan karışık 10 soru</button>
        <div class="chips scroll-x" style="margin:14px 0 4px">${[['all', 'Tümü'], ...SUBJECTS.map((x) => [x.id, x.name])].map(([k, n]) => `<button class="chip ${sub === k ? 'on' : ''}" data-sub="${k}">${n}</button>`).join('')}</div>
        ${total ? ls.map((l) => `<a class="rowlink" href="#/cikmis/${l.id}" data-s="${l.s}"><span class="bubble s ${studied.has(l.id) ? 'filled' : ''}">${SUBJECT[l.s]?.short || '+'}</span><span><span class="t">${esc(l.title)}</span><span class="m">${stats[l.id]} soru${studied.has(l.id) ? ' · çalıştın' : l.day ? ` · ${l.day}. gün` : ''}</span></span><span class="go">${icon.chev}</span></a>`).join('') : '<div class="empty"><p>Soru listesi yükleniyor… İnternet yoksa bu bölüm açılmaz.</p></div>'}`,
    });
    document.querySelectorAll('[data-sub]').forEach((b) => b.onclick = () => { sub = b.dataset.sub; draw(); });
    const mix = document.getElementById('mix');
    if (mix) mix.onclick = () => startPast({ lessons: [...studied], title: 'Çalıştığın konulardan' });
  };
  draw();
  try { stats = await (await fetch('/api/real/stats')).json(); } catch (e) { stats = {}; }
  if (location.hash === '#/cikmis') draw();
}

async function startPast({ lessons, title, n = 10 }) {
  setTab(null);
  $app.innerHTML = `<div class="view"><div class="empty" style="margin-top:30vh"><span class="typing"><i></i><i></i><i></i></span><p>Sorular getiriliyor…</p></div></div>`;
  const done = (store.get().log || []).filter((x) => x.ok === 1 && x.k && x.k.startsWith('real:')).map((x) => x.k).slice(-250);
  let qs = [];
  try { qs = (await (await fetch(`/api/real?l=${lessons.join(',')}&n=${n}&x=${done.join(',')}`)).json()).questions || []; } catch (e) { qs = []; }
  if (!qs.length) {
    setTab('daha');
    $app.innerHTML = page({ top: topbar({ eyebrow: 'Çıkmış sorular', title, back: '#/cikmis' }), body: `<div class="empty"><h2>Soru kalmadı ya da bağlantı yok</h2><p>Bu konunun çıkmış sorularının hepsini doğru çözmüş olabilirsin. Başka bir konu seç.</p><a class="btn" href="#/cikmis">Konulara dön</a></div>` });
    return;
  }
  qs = qs.map((q) => ({ ...q, ex: q.bilgi ? `**Sınanan bilgi:** ${q.bilgi}` : '', tip: `Bu soru ${q.src} sınavında soruldu.` }));
  questionRunner({
    title, eyebrow: 'Çıkmış sorular', qs, reveal: 'instant', exit: '#/cikmis', src: 'cikmis',
    onFinish: ({ answers, guess }) => {
      const d = qs.filter((q, j) => answers[j] === q.a).length;
      const y = qs.filter((q, j) => answers[j] != null && answers[j] !== -1 && answers[j] !== q.a).length;
      setTab('daha');
      $app.innerHTML = page({
        top: topbar({ eyebrow: 'Çıkmış sorular', title: 'Sonuç', back: '#/cikmis' }),
        body: `<div class="result" style="margin-top:14px"><span class="bubble hero-b filled"></span><div class="bigscore num">${d}/${qs.length}</div>
          <p class="muted">${y} yanlış · net ${(d - y / 4).toFixed(2).replace('.', ',')}</p>
          <p>Bunlar gerçek sınav soruları; tahmini netin bu sonuca tam ağırlıkla güncellendi. Yanlışların hata defterine eklendi.</p>
          <div class="stack"><button class="btn ink block" id="ai">${icon.ai}Hoca sonucumu analiz etsin</button><a class="btn ghost block" href="#/cikmis">Başka konu seç</a></div></div>`,
      });
      document.getElementById('ai').onclick = () => openChat({ prompt: resultAnalysisPrompt(`Çıkmış sorular: ${title}`, qs, answers, guess) });
    },
  });
}

// ---------- Ekstra ----------
function viewExtra() {
  $app.innerHTML = page({
    top: topbar({ eyebrow: 'Ekstra konular', title: 'Canın çalışmak isterse', back: '#/daha' }),
    body: `<p class="muted" style="margin-top:14px">Bunlar günlük planda yok. Günlük dersleri bitirdiysen ve hâlâ enerjin varsa buradan devam et.</p>${EXTRA.map(lessonRow).join('')}`,
  });
}

function viewGenerate() {
  const opts = Object.values(LESSONS).filter((l) => l.quiz);
  const studied = new Set(studiedIds());
  $app.innerHTML = page({
    top: topbar({ eyebrow: 'Yapay zekâ', title: 'Yeni soru üret', back: '#/daha' }),
    body: `<p class="muted" style="margin-top:14px">Bir konu seç; hoca o dersin notlarına ve gerçek ÖSYM soru üslubuna bakarak yeni sorular yazsın. Sorular sohbette etkileşimli test olarak gelir, bitince sonucunu yorumlar.</p>
    <label class="small" for="lsel"><b>Konu</b></label>
    <select id="lsel" class="field" style="margin:6px 0 14px">
      ${SUBJECTS.map((s) => `<optgroup label="${s.name}">${opts.filter((l) => l.s === s.id).map((l) => `<option value="${l.id}" ${studied.has(l.id) ? '' : ''}>${l.day ? l.day + '. gün · ' : 'Ekstra · '}${esc(l.title)}${studied.has(l.id) ? ' ✓' : ''}</option>`).join('')}</optgroup>`).join('')}
    </select>
    <div class="row" style="margin-bottom:14px"><div class="seg" id="lvl"><button class="on" data-l="kolay">Kolay-orta</button><button data-l="sinav">Sınav ayarı</button></div>
      <div class="seg" id="cnt"><button data-n="3">3</button><button class="on" data-n="5">5</button><button data-n="8">8</button></div></div>
    <button class="btn ink block" id="gen">${icon.spark}Soruları yaz</button>`,
  });
  let level = 'kolay', n = 5;
  document.querySelectorAll('#lvl button').forEach((b) => b.onclick = () => { level = b.dataset.l; document.querySelectorAll('#lvl button').forEach((x) => x.classList.toggle('on', x === b)); });
  document.querySelectorAll('#cnt button').forEach((b) => b.onclick = () => { n = Number(b.dataset.n); document.querySelectorAll('#cnt button').forEach((x) => x.classList.toggle('on', x === b)); });
  document.getElementById('gen').onclick = () => {
    const l = LESSONS[document.getElementById('lsel').value];
    openChat({ lessonId: l.id, step: 'Soru üretme', prompt: `${l.id} dersinden ${n} yeni soruluk test yap (kaynak: yeni, zorluk: ${level}).` });
  };
}

// ---------- Gerçekçi analiz ve istatistik ----------
function insights(s, est) {
  const log = s.log || [];
  const out = [];
  const tr = est.per.turkce;
  out.push(`<b>Türkçe:</b> YKS'de Türkçe sorularının ~%91'ini işaretledin; işaretlediklerinin ~%29'u yanlıştı. 2024'te 12 yanlış = <b>3 net kayıp</b>. Bugün beklenen: ${fmtNet(tr.D)} doğru, ${fmtNet(tr.Y)} yanlış. En hızlı kazanç: iki şık arasında kalmadığın soruyu boş bırakmak.`);
  out.push(`<b>Matematik:</b> YKS'de 160 sorudan sadece 13'ünü işaretledin ve 10'u doğruydu: bilmediğini boş bırakma disiplinin iyi. KPSS'de 30 sorunun ~15'i (işlem, kesir, yüzde, problem, grafik) çalışarak yapılabilir; geometriye girme.`);
  out.push(`<b>Tarih zayıf, coğrafya görece iyi:</b> AYT'de tarih sorularının sadece %37'sini işaretleyip %55'ini tutturdun; coğrafyada %87 işaretleyip %66 tutturdun. Tarihte her ders net getirir, coğrafyada yorum gücünü bilgiyle desteklemek yeter.`);
  const g = log.filter((x) => x.g && x.ok !== -1);
  if (g.length >= 5) {
    const r = g.filter((x) => x.ok === 1).length / g.length;
    out.push(`<b>Tahminlerin:</b> "tahmin" işaretlediğin ${g.length} sorudan ${g.filter((x) => x.ok === 1).length} tanesi tuttu (%${Math.round(r * 100)}). ${r > 0.3 ? 'Bu oran %20\'nin üstünde: en az bir şıkkı eleyebildiğinde işaretlemen kârlı.' : r >= 0.2 ? 'Bu oran başa baş: sadece en az 2 şık eleyebildiğinde işaretle.' : 'Bu oran %20\'nin altında: tahminler sana net kaybettiriyor, emin değilsen boş bırak.'}`);
  } else out.push('<b>Tahminlerin:</b> Soru çözerken emin olmadığında "Tahmin" düğmesine bas; 5 tahminden sonra işaretlemenin sana kazandırıp kazandırmadığını burada göreceksin.');
  const t = est.time;
  const slow = SUBJECTS.filter((x) => t.per[x.id].n >= 5 && t.per[x.id].sec > (x.id === 'matematik' ? 150 : x.id === 'turkce' ? 95 : 55));
  out.push(`<b>Süre:</b> ${t.per.turkce.n + t.per.tarih.n + t.per.cografya.n >= 10 ? 'Uygulamadaki hızınla' : 'Ortalama bir adayın hızıyla (henüz yeterli verin yok)'} tüm sınava bakmak ~${Math.round(t.needMin)} dk sürer; süre 130 dk. ${t.needMin > 125 ? '<b>Süre yetmeyebilir</b>: Genel Kültür\'de bilmediğin soruda 30 saniyeden fazla durma.' : 'Süre yetiyor; kalan zamanı Türkçe paragrafları dikkatli okumaya ver.'}${slow.length ? ` Yavaş olduğun dersler: ${slow.map((x) => x.name).join(', ')}.` : ''}`);
  const ev = Object.values(est.per).reduce((a, p) => a + p.evidence, 0);
  out.push(ev < 30 ? '<b>Güven:</b> Henüz az soru çözdün; tahmin büyük ölçüde YKS geçmişine dayanıyor. Mini deneme ve hocanın karışık testleri tahmini en hızlı netleştiren şey.' : `<b>Güven:</b> Tahmin ${Math.round(ev)} soruluk ağırlıklı kanıta dayanıyor. Deneme sonuçları ders içi sorulardan daha çok sayılır.`);
  return out;
}

function viewStats() {
  const s = store.get();
  const totalSec = Object.values(s.days).reduce((a, b) => a + b, 0);
  const lessons = Object.values(LESSONS).filter((l) => l.day);
  const done = lessons.filter((l) => s.lessons[l.id]?.done);
  const est = estimate(s);
  snapshot(est);
  const log = s.log || [];
  const acc = log.filter((x) => x.ok !== -1);
  const rows = yksRows();
  const trend = Object.entries(store.get().trend || {}).sort(([a], [b]) => (a < b ? -1 : 1));
  $app.innerHTML = page({
    top: topbar({ eyebrow: 'Gerçekçi analiz', title: 'Bugün sınava girsen', back: '#/daha' }),
    body: `
    <section class="card" style="margin-top:14px">
      <div class="eyebrow">Tahmini sonuç · %80 ihtimalle bu aralıkta</div>
      <div class="row" style="align-items:flex-end;gap:14px;margin-top:6px"><div style="font:800 50px/0.9 var(--display)" class="num">${Math.round(est.low)}–${Math.round(est.high)}</div><div class="small muted" style="padding-bottom:4px">net · en olası <b>${fmtNet(est.total)}</b><br>puan ≈ <b>${Math.round(est.puanLow)}–${Math.round(est.puanHigh)}</b></div></div>
      <p class="small" style="margin:10px 0 2px">Bu tahmin anlık: her çözdüğün soruda yeniden hesaplanır. Beklenen: <b>${Math.round(est.D)}</b> doğru, <b>${Math.round(est.Y)}</b> yanlış, <b>${Math.round(est.B)}</b> boş. YKS geçmişine göre başlangıç tahmini: ${fmtNet(est.start)} net.</p>
      <div class="tablewrap" style="margin-top:10px"><table class="vtable"><thead><tr><th>Ders</th><th>D</th><th>Y</th><th>B</th><th>Net</th></tr></thead><tbody>
      ${SUBJECTS.map((x) => { const e = est.per[x.id]; return `<tr data-s="${x.id}"><td style="color:var(--s)">${x.name}<div class="small muted" style="font-weight:400">${x.q} soru · senden ${Math.round(e.evidence)} cevap</div></td><td class="num">${fmtNet(e.D)}</td><td class="num">${fmtNet(e.Y)}</td><td class="num">${fmtNet(e.B)}</td><td class="num"><b>${fmtNet(e.now)}</b></td></tr>`; }).join('')}
      </tbody></table></div>
    </section>

    <section class="card flat"><h3>Gün gün tahmin</h3>
      <p class="small muted" style="margin:4px 0 8px">Her çözdüğün soruyla anında güncellenir; burada her günün son hâli kalır.</p>
      ${trend.length ? `<div class="tablewrap"><table class="vtable"><thead><tr><th>Gün</th><th>Net</th><th>Aralık</th><th>Puan</th></tr></thead><tbody>${trend.map(([d, v], i) => { const prev = i ? trend[i - 1][1].net : null; const diff = prev == null ? '' : ` <span class="small" style="color:${v.net >= prev ? 'var(--right)' : 'var(--wrong)'}">${v.net >= prev ? '+' : ''}${fmtNet(v.net - prev)}</span>`; return `<tr><td>${prettyDate(d, false)}</td><td class="num"><b>${fmtNet(v.net)}</b>${diff}</td><td class="num">${v.low}–${v.high}</td><td class="num">≈${v.puan}</td></tr>`; }).join('')}</tbody></table></div>` : ''}
    </section>

    <section class="card flat"><h3>Ne görüyorum?</h3><ul class="small" style="padding-left:1.1em;margin:8px 0 0">${insights(s, est).map((x) => `<li style="margin:.5em 0">${x}</li>`).join('')}</ul></section>

    <section class="card flat"><h3>Nasıl hesaplanıyor?</h3>
      <p class="small">Seni mutlu etmek için değil, doğruyu göstermek için: başlangıç noktası, hiç çalışmadan girdiğin <b>4 YKS'deki</b> davranışın (her derste soruların ne kadarını işaretlediğin ve ne kadarını tutturduğun). Sonra her çözdüğün soru tahmini günceller: <b>deneme ve hocanın testleri</b> tam sayılır; ders içi sorular kolay olduğu için <b>yarım</b> sayılır ve doğruları iskontolanır; eski cevapların ağırlığı günler geçtikçe azalır (unutma). <b>Ders bitirmek tek başına net getirmez</b>, sadece soru performansı getirir. Konuların sınavdaki ağırlığı 2014-2020 kitapçıklarındaki 294 sorudan hesaplandı.</p></section>

    <h3 style="margin:22px 0 6px">YKS geçmişin (net = D − Y/4)</h3>
    <div class="tablewrap"><table class="vtable"><thead><tr><th>Test</th>${rows[0].years.map((y) => `<th>${y.y}</th>`).join('')}</tr></thead><tbody>
      ${rows.map((r) => `<tr><td>${r.label}<div class="small muted" style="font-weight:400">${r.n} soru</div></td>${r.years.map((y) => `<td class="num">${fmtNet(y.net)}<div class="small muted">${y.d}D ${y.w}Y</div></td>`).join('')}</tr>`).join('')}
    </tbody></table></div>
    <p class="small muted">Türkçe 2021'den 2023'e 11'den 25 nete çıktı: yorum gücün çalışmadan da gelişmiş. KPSS'de 30 Türkçe sorusu, netinin yarısından fazlasını getirecek.</p>

    <div class="grid2" style="margin-top:18px">
      <div class="stat"><div class="v num">${fmtMin(totalSec)}</div><div class="l">toplam çalışma</div></div>
      <div class="stat"><div class="v num">${done.length}/${lessons.length}</div><div class="l">ders bitti</div></div>
      <div class="stat"><div class="v num">${log.length}</div><div class="l">çözülen soru</div></div>
      <div class="stat"><div class="v num">${acc.length ? '%' + Math.round((acc.filter((x) => x.ok === 1).length / acc.length) * 100) : '–'}</div><div class="l">uygulamadaki doğru oranı</div></div>
    </div>
    <h3 style="margin:22px 0 6px">Günlere göre</h3>
    <div class="card flat">${renderViz({ type: 'bars', items: STUDY_DAYS.map((k, i) => [`${i + 1}. gün`, Math.max(0.001, (s.days[k] || 0) / 60), `${Math.round((s.days[k] || 0) / 60)} dk`]), c: 'ink' })}</div>
    ${(s.extra.mocks || []).length ? `<h3 style="margin:22px 0 6px">Mini denemeler</h3><div class="card flat">${s.extra.mocks.map((m, i) => `<div class="row between" style="padding:4px 0"><span>${i + 1}. deneme</span><b class="num">${fmtNet(m.d - m.y / 4)} net / ${m.n}</b></div>`).join('')}</div>` : ''}`,
  });
}

// ---------- Ayarlar ----------
function viewSettings() {
  const s = store.get();
  $app.innerHTML = page({
    top: topbar({ eyebrow: 'Ayarlar', title: 'Uygulama', back: '#/daha' }),
    body: `
    <section class="card flat" style="margin-top:14px"><div class="row"><span class="ico">${icon.moon}</span><h3 style="flex:1">Görünüm</h3></div>
      <div class="seg" id="theme" style="margin-top:12px;display:flex">${[['light', 'Aydınlık', icon.sun], ['dark', 'Gece', icon.moon]].map(([k, l, ic]) => `<button data-t="${k}" class="${(s.settings.theme === 'dark' ? 'dark' : 'light') === k ? 'on' : ''}" style="flex:1;display:inline-flex;align-items:center;justify-content:center;gap:6px">${ic}${l}</button>`).join('')}</div>
      <p class="small muted" style="margin:8px 0 0">Seçimin bu cihazda ve senkronda saklanır; uygulamayı kapatıp açsan da aynı kalır.</p></section>
    <section class="card flat"><div class="row"><span class="ico">${icon.speak}</span><h3 style="flex:1">Sesli okuma</h3></div>
      <p class="small">Ders ekranındaki hoparlör, kartı telefonunun Türkçe sesiyle okur. Ses gelmiyorsa telefonun sessiz modda olabilir. iPhone'da daha iyi ses için: Ayarlar › Erişilebilirlik › Seslendirilen İçerik › Sesler › Türkçe.</p>
      <button class="btn ghost sm" id="ttstest">${icon.speak}Dene</button></section>
    <section class="card flat"><div class="row"><span class="ico">${icon.sync}</span><h3 style="flex:1">Senkron</h3></div><p class="small">İlerlemen bu cihazda ve Cloudflare'deki veritabanında saklanır; telefonla bilgisayar arasında otomatik eşleşir.</p>
      <p class="small">Durum: <b>${isOnline() ? 'Bağlı' : 'Çevrimdışı (bu cihazda saklanıyor)'}</b></p>
      <button class="btn ghost sm" id="syncnow">${icon.sync}Şimdi eşitle</button></section>
    <section class="card flat"><div class="row"><span class="ico">${icon.phone}</span><h3 style="flex:1">Telefona ekle</h3></div><p class="small">Safari'de paylaş düğmesi › <b>Ana Ekrana Ekle</b> dersen uygulama gibi tam ekran açılır ve internetsiz de çalışır (yapay zekâ hariç).</p></section>
    <section class="card flat"><div class="row"><span class="ico" style="color:var(--wrong)">${icon.trash}</span><h3 style="flex:1">Sıfırla</h3></div><p class="small">Her şeyi siler: dersler, çözdüğün tüm sorular, yanlışlar, hata defteri, kartlar, denemeler, hoca sohbeti ve tahmin geçmişi. Analiz YKS'ye dayalı başlangıca döner. Bulutta ve diğer cihazlarda da silinir. Sadece tema kalır. Geri alınamaz.</p><button class="btn ghost sm" id="reset" style="color:var(--wrong)">İlerlemeyi sıfırla</button></section>`,
  });
  document.querySelectorAll('#theme button').forEach((b) => b.onclick = () => { store.update((x) => { x.settings.theme = b.dataset.t; }); applyTheme(); viewSettings(); });
  document.getElementById('syncnow').onclick = async () => { const ok = await pull(); toast(ok ? 'Eşitlendi' : 'Sunucuya ulaşılamadı'); viewSettings(); };
  document.getElementById('ttstest').onclick = (e) => speak('Merhaba Özgür. Bugün de birlikte çalışıyoruz. Hadi başlayalım.', e.currentTarget);
  document.getElementById('reset').onclick = () => { if (confirm('Her şey silinsin mi? Çözdüğün sorular, yanlışlar ve analiz sıfırlanır. Geri alınamaz.')) { store.reset(); toast('Sıfırlandı: analiz başlangıca döndü'); location.hash = '#/'; } };
}

// ---------- Sınav günü ----------
function viewExamDay() {
  $app.innerHTML = page({
    top: topbar({ eyebrow: '4 Ekim 2026 · Pazar', title: 'Aday: Özgür' }),
    body: `<section class="exam-banner" style="margin-top:14px"><div class="eyebrow">Bugün sınav günü</div><h1 style="font-size:44px;margin:6px 0">Başarılar Özgür</h1>
      <p>Sınav <b>10.15</b>'te başlar. Kapı <b>10.00</b>'da kapanır; en geç 09.30'da binanın önünde ol.</p>
      <div class="clock num" id="clock">${countdownText()}</div></section>
    <section class="card"><h3>Yanına al</h3><ul>
      <li><b>Nüfus cüzdanı / kimlik kartı</b> (süresi geçmemiş, fotoğraflı) ya da geçerli pasaport</li>
      <li>Sınava giriş belgesi (ais.osym.gov.tr; bina ve salon bilgin için)</li>
      <li>Telefon, saat, kalem götürme; kalemi ÖSYM verir.</li></ul></section>
    <section class="card"><h3>Salondaki planın</h3>${md(STRATEGY.find((x) => x.id === 'order')?.b || '')}</section>
    <section class="card"><h3>Son 5 dakikalık göz atma</h3><p>Yeni bir şey öğrenmeye çalışma. İstersen sadece <a href="#/tekrar">tekrar kartlarından</a> birkaçını çevir. Derin nefes: 4 saniye al, 4 tut, 6 ver.</p></section>`,
  });
  const clock = document.getElementById('clock');
  const iv = setInterval(() => { clock.textContent = countdownText(); }, 1000);
  cleanup = () => clearInterval(iv);
}

// ---------- başlat ----------
store.on(() => { if (!$tab.hidden) renderTabs(activeTab); });
route();
pull().then((changed) => { if (changed && ['', '#/', '#/plan', '#/istatistik'].includes(location.hash)) route(); });

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}));
}
