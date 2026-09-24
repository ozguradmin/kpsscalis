import { store, pull, startTimer, todayKey, addCards, gradeCard, dueCards, isOnline } from './store.js';
import { SUBJECTS, SUBJECT, LESSONS, EXTRA, STUDY_DAYS, EXAM, DOOR_CLOSE, lessonsOfDay, prettyDate, DAY_THEMES } from './plan.js';
import { renderViz, md, inline, esc } from './viz.js';
import { openChat, lessonSummary } from './chat.js';
import { STRATEGY } from './content/extra.js';

const $app = document.getElementById('app');
const $tab = document.getElementById('tabbar');
const LETTERS = ['A', 'B', 'C', 'D', 'E'];
let cleanup = null;

// ---------- tema ----------
function applyTheme() {
  const t = store.get().settings.theme;
  if (t === 'light' || t === 'dark') document.documentElement.dataset.theme = t;
  else delete document.documentElement.dataset.theme;
}
applyTheme();

// ---------- yardımcılar ----------
const icon = {
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  plan: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="7" cy="7" r="2.5"/><circle cx="17" cy="7" r="2.5" fill="currentColor"/><circle cx="7" cy="17" r="2.5" fill="currentColor"/><circle cx="17" cy="17" r="2.5"/></svg>',
  cards: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><rect x="3" y="6" width="14" height="14" rx="2.5"/><path d="M7 3h11a3 3 0 0 1 3 3v11"/></svg>',
  chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M4 5h16v11H9l-5 4z"/><path d="M8 9h8M8 12h5"/></svg>',
  more: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h10"/></svg>',
  back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  speak: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/></svg>',
  chev: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M9 6l6 6-6 6"/></svg>',
  play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21.6 7.2a3 3 0 0 0-2.1-2.1C17.7 4.6 12 4.6 12 4.6s-5.7 0-7.5.5A3 3 0 0 0 2.4 7.2 31 31 0 0 0 2 12a31 31 0 0 0 .4 4.8 3 3 0 0 0 2.1 2.1c1.8.5 7.5.5 7.5.5s5.7 0 7.5-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 22 12a31 31 0 0 0-.4-4.8zM10 15.2V8.8l5.2 3.2z"/></svg>',
  spark: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z"/></svg>',
};

export function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => t.classList.remove('show'), 2600);
}

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

function lessonState(id) { return store.get().lessons[id] || {}; }

function subjTag(s) {
  const sub = SUBJECT[s];
  return `<span class="tag" data-s="${s}">${esc(sub ? sub.name : s)}</span>`;
}

function fmtMin(sec) {
  const m = Math.round((sec || 0) / 60);
  if (m < 60) return `${m} dk`;
  return `${Math.floor(m / 60)} sa ${m % 60} dk`;
}

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

function speak(text) {
  if (!('speechSynthesis' in window)) { toast('Bu tarayıcı sesli okumayı desteklemiyor'); return; }
  const synth = window.speechSynthesis;
  if (synth.speaking) { synth.cancel(); return; }
  const u = new SpeechSynthesisUtterance(text.replace(/[*=_#]/g, ''));
  u.lang = 'tr-TR';
  u.rate = 0.95;
  const v = synth.getVoices().find((x) => x.lang && x.lang.toLowerCase().startsWith('tr'));
  if (v) u.voice = v;
  synth.speak(u);
}
const plain = (s) => String(s || '').replace(/\*\*|==|_/g, '');

// ---------- tab bar ----------
function renderTabs(active) {
  const due = dueCards().length;
  const tabs = [
    ['#/', 'Bugün', icon.home, 'home'],
    ['#/plan', 'Plan', icon.plan, 'plan'],
    ['#/tekrar', 'Tekrar', icon.cards, 'tekrar'],
    ['#/hoca', 'Hoca', icon.chat, 'hoca'],
    ['#/daha', 'Daha fazla', icon.more, 'daha'],
  ];
  $tab.innerHTML = `<div class="in">${tabs.map(([h, l, ic, k]) => `<a href="${h}" class="${active === k ? 'on' : ''}" ${active === k ? 'aria-current="page"' : ''}>${ic}<span>${l}</span>${k === 'tekrar' && due ? `<span class="badge">${due > 99 ? '99+' : due}</span>` : ''}</a>`).join('')}</div>`;
}

// ---------- router ----------
const routes = [
  [/^#?\/?$/, viewHome, 'home'],
  [/^#\/plan$/, viewPlan, 'plan'],
  [/^#\/gun\/(\d)$/, viewDay, 'plan'],
  [/^#\/ders\/([\w-]+)$/, viewLesson, null],
  [/^#\/tekrar$/, viewReview, 'tekrar'],
  [/^#\/hatalar$/, viewMistakes, 'daha'],
  [/^#\/hoca$/, viewTutor, 'hoca'],
  [/^#\/daha$/, viewMore, 'daha'],
  [/^#\/strateji$/, viewStrategy, 'daha'],
  [/^#\/deneme$/, viewMock, null],
  [/^#\/istatistik$/, viewStats, 'daha'],
  [/^#\/ayarlar$/, viewSettings, 'daha'],
  [/^#\/ekstra$/, viewExtra, 'daha'],
  [/^#\/uret$/, viewGenerate, 'daha'],
];

function route() {
  if (cleanup) { cleanup(); cleanup = null; }
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  const h = location.hash || '#/';
  document.body.classList.remove('player');
  for (const [re, fn, tab] of routes) {
    const m = h.match(re);
    if (m) {
      renderTabs(tab);
      fn(...m.slice(1));
      if (!h.startsWith('#/ders/') && !h.startsWith('#/deneme')) window.scrollTo(0, 0);
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

  const heroNum = info.mode === 'before' ? 9 : info.left;
  const heroSub = info.mode === 'before'
    ? `Yarın (25 Eylül) 1. gün başlıyor. İstersen ilk dersi bugünden aç.`
    : info.left === 1 ? 'Bugün son çalışma günü. Yarın sınav: kapı <b>' + DOOR_CLOSE + '</b>\'da kapanır.' : `Sınav <b>4 Ekim Pazar 10.15</b>. Sınav gününü saymıyoruz, o gün sınava giriyoruz.`;

  $app.innerHTML = `
    <header class="formhead">
      <div><div class="eyebrow">KPSS Ön Lisans · 2026</div><div class="who">Aday: Özgür</div></div>
      <a class="iconbtn" href="#/ayarlar" aria-label="Ayarlar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg></a>
    </header>
    <section class="hero">
      <div class="muted small" style="font-weight:700">${greet()}</div>
      <div class="big num">${heroNum}<small>çalışma<br>günü kaldı</small></div>
      <p class="sub">${heroSub}</p>
      <div class="clock num" id="clock">${countdownText()}</div>
    </section>

    <section class="card ink">
      <div class="row between">
        <div>
          <div class="eyebrow">${info.mode === 'before' ? 'İlk gün önizleme' : `Bugün · ${info.day}. gün`}</div>
          <h2 style="margin-top:4px">${prettyDate(STUDY_DAYS[info.day - 1])}</h2>
        </div>
        <div style="text-align:right"><div style="font:800 30px var(--display)" class="num">${doneCount}/6</div><div class="small muted">ders bitti</div></div>
      </div>
      <p class="muted small" style="margin:6px 0 10px">${esc(DAY_THEMES[info.day])} · bugün ${fmtMin(todaySec)} çalıştın</p>
      <div class="progressbar"><i style="width:${(doneCount / 6) * 100}%"></i></div>
      ${today.map(lessonItem).join('')}
      ${next ? `<a class="btn ink block" href="#/ders/${next.id}" style="margin-top:6px">${lessonState(next.id).started ? 'Kaldığın yerden devam et' : 'Sıradaki derse başla'}: ${esc(SUBJECT[next.s].name)}</a>`
        : `<div class="note" style="--s:var(--right)"><div class="eyebrow">Bugünkü plan tamam</div>Harika iş Özgür. İstersen tekrar kartlarını çevir ya da <a href="#/ekstra">ekstra konulara</a> bak. Yoksa dinlen, beyin öğrendiklerini uykuda yerleştirir.</div>`}
    </section>

    ${behind.length ? `<a class="card flat row between" href="#/plan" style="text-decoration:none;color:inherit;border-color:var(--warn)">
      <div><div class="eyebrow" style="color:var(--warn)">Geride kalan</div><b>${behind.length} ders önceki günlerden bekliyor</b><div class="small muted">Bugünküleri bitirince bunlara geç. Her biri ~10 dk.</div></div>${icon.chev}</a>` : ''}

    <a class="card flat row between" href="#/tekrar" style="text-decoration:none;color:inherit">
      <div><div class="eyebrow">Aralıklı tekrar</div><b>${due ? `${due} kart tekrar zamanı geldi` : 'Tekrar edilecek kart yok'}</b>
      <div class="small muted">${due ? '3-4 dakika sürer. Unutmayı durduran şey bu.' : 'Ders bitirdikçe kartlar buraya gelir.'}</div></div>${icon.chev}</a>

    <section style="margin-top:26px">
      <div class="row between" style="margin-bottom:10px"><h3>Cevap kâğıdın</h3><a href="#/plan" class="small">Planın tamamı</a></div>
      ${sheet(info)}
      <p class="small muted" style="margin-top:8px">Her satır bir gün, her baloncuk bir ders. Bitirdiğin dersin baloncuğu kurşun kalemle dolar.</p>
    </section>`;

  const clock = document.getElementById('clock');
  const iv = setInterval(() => { clock.textContent = countdownText(); }, 1000);
  cleanup = () => clearInterval(iv);
}

function lessonItem(l) {
  const st = lessonState(l.id);
  const sub = SUBJECT[l.s];
  return `<a class="lesson-item ${st.done ? 'done' : ''}" href="#/ders/${l.id}" data-s="${l.s}">
    <span class="bubble ${st.done ? 'filled' : st.started ? 'started' : ''}" style="border-color:var(--s);color:var(--s)">${sub.short}</span>
    <span><span class="t">${esc(l.title)}</span><div class="m">${esc(sub.name)} · ${st.done ? `bitti · ${st.score ?? 0}/${st.total ?? 0} doğru` : `~${l.min || 10} dk · ${esc(l.why || '')}`}</div></span>
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

document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-go]');
  if (b) location.hash = `#/ders/${b.dataset.go}`;
});

// ---------- Plan ----------
function viewPlan() {
  const info = dayInfo();
  const total = Object.values(LESSONS).filter((l) => l.day).length;
  const done = Object.values(LESSONS).filter((l) => l.day && lessonState(l.id).done).length;
  $app.innerHTML = `
    <header class="formhead"><div><div class="eyebrow">9 günlük plan</div><div class="who">${done}/${total} ders bitti</div></div></header>
    ${sheet(info)}
    <div style="margin-top:22px">
    ${STUDY_DAYS.map((k, i) => {
      const d = i + 1;
      const ls = lessonsOfDay(d);
      const dd = ls.filter((l) => lessonState(l.id).done).length;
      return `<a class="lesson-item" href="#/gun/${d}" style="grid-template-columns:auto 1fr auto">
        <span class="bubble ${dd === ls.length ? 'filled' : dd ? 'started' : ''} ${info.day === d && info.mode === 'study' ? 'today' : ''}">${d}</span>
        <span><span class="t">${prettyDate(k)}${info.day === d && info.mode === 'study' ? ' · bugün' : ''}</span><div class="m">${esc(DAY_THEMES[d])} · ${dd}/${ls.length}</div></span>
        <span class="go">${icon.chev}</span></a>`;
    }).join('')}
    <div class="lesson-item" style="grid-template-columns:auto 1fr;border-color:var(--ink)">
      <span class="bubble" style="border-color:var(--graphite);color:var(--graphite)">S</span>
      <span><span class="t">4 Ekim Pazar · Sınav günü</span><div class="m">Ders yok. Sabah hafif kahvaltı, kimlik, giriş belgesi. Kapı ${DOOR_CLOSE}'da kapanır.</div></span>
    </div></div>`;
}

function viewDay(d) {
  d = Number(d);
  const ls = lessonsOfDay(d);
  $app.innerHTML = `
    <header class="formhead"><a class="iconbtn" href="#/plan" aria-label="Plana dön">${icon.back}</a>
      <div style="flex:1"><div class="eyebrow">${d}. gün</div><div class="who">${prettyDate(STUDY_DAYS[d - 1])}</div></div></header>
    <p class="muted">${esc(DAY_THEMES[d])}</p>
    ${ls.map(lessonItem).join('')}
    <p class="small muted">Her dersi istediğin kadar tekrar açabilirsin. Bitmiş bir dersi yeniden yapmak, en iyi tekrar yöntemlerinden biridir.</p>`;
}

// ---------- Ders oynatıcı ----------
function viewLesson(id) {
  const lesson = LESSONS[id];
  if (!lesson) { location.hash = '#/'; return; }
  document.body.classList.add('player');
  const stopTimer = startTimer(id);

  // Isınma: bu dersin konusundan, tekrar zamanı gelmiş en fazla 3 kart (aralıklı geri çağırma)
  const warm = dueCards().filter((cid) => cid.split('#')[0] !== id && LESSONS[cid.split('#')[0]]?.s === lesson.s).slice(0, 3);
  const steps = [];
  if (warm.length) steps.push({ k: 'warm', ids: warm });
  lesson.cards.forEach((c) => steps.push(c.k === 'check' ? prepQ(c) : c));
  const quiz = (lesson.quiz || []).map(prepQ);
  quiz.forEach((q, i) => steps.push({ k: 'quiz', q, i }));
  steps.push({ k: 'result' });

  const st = { i: 0, answers: {}, checks: {} };
  const saved = lessonState(id);
  if (saved.pos && !saved.done && saved.pos < steps.length - 1) st.i = saved.pos;

  const summary = lessonSummary(lesson);
  const sub = SUBJECT[lesson.s] || { name: 'Ekstra', id: lesson.s };

  function top() {
    return `<div class="player-top"><div class="row">
      <a class="iconbtn" href="${lesson.day ? '#/' : '#/ekstra'}" aria-label="Dersten çık">${icon.close}</a>
      <div class="ttl"><span class="tag" data-s="${lesson.s}">${esc(sub.name)}${lesson.day ? ` · ${lesson.day}. gün` : ''}</span><b>${esc(lesson.title)}</b></div>
      <button class="iconbtn" id="tts" aria-label="Sesli dinle">${icon.speak}</button>
    </div>
    <div class="ticks">${steps.map((s, i) => `<i class="${s.k === 'quiz' ? 'q' : ''} ${i < st.i ? 'done' : ''} ${i === st.i ? 'cur' : ''}"></i>`).join('')}</div></div>`;
  }

  function go(n) {
    st.i = Math.max(0, Math.min(steps.length - 1, n));
    store.update((s) => { const l = (s.lessons[id] ||= {}); l.started = true; l.pos = st.i; });
    render();
    window.scrollTo(0, 0);
  }

  function render() {
    const step = steps[st.i];
    let html = top() + `<div class="stage" data-s="${lesson.s}">`;
    let bottom = '';
    let speakText = '';
    if (step.k === 'warm') {
      html += `<div class="eyebrow">Isınma · önceki derslerden</div><h2>Hatırlıyor musun?</h2>
        <p class="muted">Önce hatırlamaya çalış, sonra karta dokunup cevaba bak. Hatırlamaya çalışmak, tekrar okumaktan çok daha kalıcıdır.</p>
        ${step.ids.map((cid, j) => { const c = cardById(cid); return c ? `<div class="card flat"><b>${inline(c.f)}</b><div class="hidden-ans" data-reveal style="margin-top:8px">${inline(c.b)}</div></div>` : ''; }).join('')}`;
      bottom = `<button class="btn block" data-next>Derse geç</button>`;
      speakText = 'Isınma soruları.';
    } else if (step.k === 'quiz') {
      html += quizHTML(step.q, step.i, quiz.length, st.answers[step.i]);
      const ans = st.answers[step.i];
      bottom = ans == null
        ? `<button class="btn ghost" data-skip>Boş bırak</button>`
        : `<button class="btn ghost" data-ask>Hoca'ya sor</button><button class="btn" data-next>${step.i === quiz.length - 1 ? 'Sonucu gör' : 'Sonraki soru'}</button>`;
      speakText = plain(step.q.q) + '. ' + step.q.o.map((o, j) => `${LETTERS[j]}: ${o}`).join('. ');
    } else if (step.k === 'result') {
      html += resultHTML();
      bottom = '';
    } else {
      html += cardHTML(step, st.i);
      speakText = [step.h, step.b, step.q, step.mn && step.mn.t].filter(Boolean).map(plain).join('. ');
      if (step.k === 'check') {
        const done = st.checks[st.i] != null;
        bottom = done ? `<button class="btn ghost" data-prev>Geri</button><button class="btn" data-next>Devam</button>` : `<button class="btn ghost" data-prev ${st.i ? '' : 'disabled'}>Geri</button><button class="btn" disabled>Cevabı seç</button>`;
      } else if (step.k === 'steps') {
        const shown = st.checks[st.i] || 1;
        bottom = shown < step.steps.length
          ? `<button class="btn ghost" data-prev ${st.i ? '' : 'disabled'}>Geri</button><button class="btn ink" data-more>Sonraki adım</button>`
          : `<button class="btn ghost" data-prev>Geri</button><button class="btn" data-next>Anladım, devam</button>`;
      } else {
        bottom = `<button class="btn ghost" data-prev ${st.i ? '' : 'disabled'}>Geri</button><button class="btn" data-next>Devam</button>`;
      }
    }
    if (step.k !== 'result' && step.k !== 'quiz' && step.k !== 'warm') html += `<button class="askinline" data-ask>${icon.chat}<span>Anlamadın mı? Hocaya sor, başka türlü anlatsın</span></button>`;
    html += '</div>';
    if (bottom) html += `<div class="bottombar"><div class="in">${bottom}</div></div>`;
    $app.innerHTML = html;
    document.getElementById('tts').onclick = () => speak(speakText || lesson.title);
    bind(step);
  }

  function bind(step) {
    $app.querySelectorAll('[data-next]').forEach((b) => b.onclick = () => go(st.i + 1));
    $app.querySelectorAll('[data-prev]').forEach((b) => b.onclick = () => go(st.i - 1));
    $app.querySelectorAll('[data-reveal]').forEach((b) => b.onclick = () => b.classList.add('show'));
    $app.querySelectorAll('[data-ask]').forEach((b) => b.onclick = () => {
      const q = step.k === 'quiz' ? step.q : step.k === 'check' ? step : null;
      openChat({ lesson, summary, question: q ? questionText(q) : null, card: step.k !== 'quiz' ? plain([step.h, step.b].filter(Boolean).join('\n')) : null });
    });
    const more = $app.querySelector('[data-more]');
    if (more) more.onclick = () => { st.checks[st.i] = (st.checks[st.i] || 1) + 1; render(); const all = $app.querySelectorAll('.step'); all[all.length - 1]?.scrollIntoView({ behavior: 'smooth', block: 'center' }); };
    if (step.k === 'check') {
      $app.querySelectorAll('[data-opt]').forEach((b) => b.onclick = () => {
        if (st.checks[st.i] != null) return;
        st.checks[st.i] = Number(b.dataset.opt);
        render();
      });
    }
    if (step.k === 'quiz') {
      $app.querySelectorAll('[data-opt]').forEach((b) => b.onclick = () => {
        if (st.answers[step.i] != null) return;
        const pick = Number(b.dataset.opt);
        st.answers[step.i] = pick;
        const wid = `${id}#${step.i}`;
        store.update((s) => {
          if (pick !== step.q.a) s.wrong[wid] = { at: Date.now(), fixed: false };
          else if (s.wrong[wid]) s.wrong[wid].fixed = true;
        });
        render();
        document.querySelector('.feedback')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
      const skip = $app.querySelector('[data-skip]');
      if (skip) skip.onclick = () => { st.answers[step.i] = -1; render(); };
    }
    if (step.k === 'result') bindResult();
  }

  function cardHTML(c, i) {
    let h = '';
    if (c.k === 'video') {
      return `<div class="eyebrow">İstersen izle</div><h2>${inline(c.h || 'Videolu anlatım')}</h2>${md(c.b || '')}
        ${(c.links || []).map(([t, q]) => `<a class="video-link" target="_blank" rel="noopener" href="https://www.youtube.com/results?search_query=${encodeURIComponent(q)}">${icon.play}<span>${esc(t)}<div class="small muted" style="font-weight:400">YouTube'da ara: “${esc(q)}”</div></span></a>`).join('')}`;
    }
    h += `<div class="eyebrow">${c.k === 'check' ? 'Kendini yokla' : c.k === 'steps' ? 'Adım adım' : c.k === 'reveal' ? 'Önce tahmin et' : c.e || 'Öğren'}</div>`;
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
      h += `<div class="qstem">${qtext(c.q)}</div><div class="opts">${c.o.map((o, j) => {
        const cls = pick == null ? '' : j === c.a ? 'right' : j === pick ? 'wrong' : 'dim';
        return `<button class="opt ${cls}" data-opt="${j}" ${pick != null ? 'disabled' : ''}><span class="bubble ${pick != null && (j === c.a || j === pick) ? 'filled ' + (j === c.a ? 'right' : 'wrong') : ''}">${LETTERS[j]}</span><span>${inline(o)}</span></button>`;
      }).join('')}</div>`;
      if (pick != null) h += `<div class="feedback ${pick === c.a ? 'ok' : 'no'}"><h3>${pick === c.a ? 'Doğru!' : 'Olmadı, sorun değil'}</h3>${md(c.ex || '')}</div>`;
    }
    if (c.mn) h += `<div class="mnemo"><div class="eyebrow">Kodlama</div><div class="code">${esc(c.mn.code)}</div><div>${inline(c.mn.t)}</div></div>`;
    if (c.note) h += `<div class="note ${c.note.exam ? 'exam' : ''}"><div class="eyebrow">${esc(c.note.h || 'Sınavda')}</div>${inline(c.note.t)}</div>`;
    return h;
  }

  function resultHTML() {
    const ans = Object.values(st.answers);
    const right = quiz.filter((q, i) => st.answers[i] === q.a).length;
    const wrong = quiz.filter((q, i) => st.answers[i] != null && st.answers[i] !== -1 && st.answers[i] !== q.a).length;
    const blank = quiz.length - right - wrong;
    const net = right - wrong / 4;
    const secs = lessonState(id).time || 0;
    const pct = quiz.length ? right / quiz.length : 1;
    const msg = pct >= 0.8 ? 'Çok iyi! Bu konu sende.' : pct >= 0.5 ? 'Güzel gidiyor. Yanlışlar hata defterine yazıldı, yarın tekrar karşına çıkacak.' : 'Normal: ilk karşılaşma böyle olur. Önemli olan tekrar. Yanlışları hata defterinde bir kez daha çöz.';
    return `<div class="result">
      <div class="eyebrow">Ders bitti</div>
      <span class="bubble hero-b" id="bigb">${esc(sub.short || '✓')}</span>
      <div class="bigscore num">${right}/${quiz.length}</div>
      <p class="muted">doğru · ${wrong} yanlış · ${blank} boş · net <b>${net.toFixed(2).replace('.', ',')}</b></p>
      <p>${msg}</p>
      <div class="grid2" style="text-align:left;margin:18px 0">
        <div class="stat"><div class="v num">${fmtMin(secs)}</div><div class="l">bu derste geçen süre</div></div>
        <div class="stat"><div class="v num">${(lesson.flash || []).length}</div><div class="l">bilgi kartı tekrar destene eklendi</div></div>
      </div>
      <div class="stack">
        ${nextLessonBtn()}
        <button class="btn ghost block" data-gen>${icon.spark} Bu konudan yeni sorular üret</button>
        <button class="btn ghost block" data-restart>Dersi baştan tekrar et</button>
        <a class="btn ghost block" href="#/">Ana sayfaya dön</a>
      </div>
      <div id="genbox" style="text-align:left"></div>
    </div>`;
  }

  function nextLessonBtn() {
    if (!lesson.day) return '';
    const today = lessonsOfDay(lesson.day);
    const nxt = today.find((l) => l.id !== id && !lessonState(l.id).done);
    return nxt ? `<a class="btn ink block" href="#/ders/${nxt.id}">Sıradaki: ${esc(SUBJECT[nxt.s].name)} · ${esc(nxt.title)}</a>` : `<a class="btn ink block" href="#/tekrar">Günün dersleri bitti · Tekrar kartlarına geç</a>`;
  }

  function bindResult() {
    const right = quiz.filter((q, i) => st.answers[i] === q.a).length;
    store.update((s) => {
      const l = (s.lessons[id] ||= {});
      const firstTime = !l.done;
      l.done = true; l.doneAt = l.doneAt || Date.now(); l.pos = 0;
      l.attempts = (l.attempts || 0) + 1; l.score = right; l.total = quiz.length;
      if (firstTime) l.firstScore = right;
    });
    addCards((lesson.flash || []).map((_, i) => `${id}#${i}`));
    requestAnimationFrame(() => setTimeout(() => document.getElementById('bigb')?.classList.add('filled'), 250));
    $app.querySelector('[data-restart]').onclick = () => { st.answers = {}; st.checks = {}; go(0); };
    $app.querySelector('[data-gen]').onclick = (e) => generateInto(lesson, document.getElementById('genbox'), e.currentTarget);
  }

  render();
  cleanup = () => stopTimer();
}


// Şıkları karıştır: doğru cevap hep aynı harfte toplanmasın. Sayısal sıralı ve öncüllü (I, II…) şıklara dokunma.
function prepQ(q) {
  if (!q || !Array.isArray(q.o)) return q;
  const numeric = q.o.every((o) => /^[\s\d.,/−\-+%°:]+$/.test(String(o)));
  const roman = q.o.some((o) => /^(Yalnız\s)?(I{1,3}|IV|V)(\s|$|,)/.test(String(o).trim()));
  const ordered = q.o.every((o) => /^[IVX]+$/.test(String(o).trim()));
  if (numeric || roman || ordered || q.fixed) return q;
  const idx = q.o.map((_, i) => i);
  for (let i = idx.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
  return { ...q, o: idx.map((i) => q.o[i]), a: idx.indexOf(q.a) };
}

function qtext(s) {
  // Soru kökü: satır sonlarını ve I./II./III. öncüllerini koru
  return String(s).split('\n').map((ln) => {
    const r = ln.match(/^\s*(I{1,3}V?|IV|V)\.\s+(.*)$/);
    return r ? `<span class="roman"><b>${r[1]}.</b> ${inline(r[2])}</span>` : `<p style="margin:.4em 0">${inline(ln)}</p>`;
  }).join('');
}

function questionText(q) {
  return `${plain(q.q)}\n${q.o.map((o, j) => `${LETTERS[j]}) ${plain(o)}`).join('\n')}\nDoğru cevap: ${LETTERS[q.a]}${q.ex ? `\nAçıklama: ${plain(q.ex)}` : ''}`;
}

function quizHTML(q, i, n, pick) {
  let h = `<div class="eyebrow">Soru ${i + 1} / ${n}${q.ai ? ' · yapay zekâ üretti' : ''}</div><div class="qstem" style="margin-top:8px">${qtext(q.q)}</div>`;
  if (q.viz) h += renderViz(q.viz);
  h += `<div class="opts">${q.o.map((o, j) => {
    const cls = pick == null ? '' : j === q.a ? 'right' : j === pick ? 'wrong' : 'dim';
    const fill = pick != null && (j === q.a || j === pick) ? `filled ${j === q.a ? 'right' : 'wrong'}` : '';
    return `<button class="opt ${cls}" data-opt="${j}" ${pick != null ? 'disabled' : ''}><span class="bubble ${fill}">${LETTERS[j]}</span><span>${inline(o)}</span></button>`;
  }).join('')}</div>`;
  if (pick != null) {
    const ok = pick === q.a;
    h += `<div class="feedback ${ok ? 'ok' : 'no'}"><h3>${ok ? 'Doğru!' : pick === -1 ? `Boş bıraktın · doğrusu ${LETTERS[q.a]}` : `Yanlış · doğrusu ${LETTERS[q.a]}`}</h3>${md(q.ex || '')}${q.tip ? `<div class="tip"><b>İpucu:</b> ${inline(q.tip)}</div>` : ''}</div>`;
  }
  return h;
}

function cardById(cid) {
  const [lid, n] = cid.split('#');
  const l = LESSONS[lid];
  const c = l && l.flash && l.flash[Number(n)];
  return c ? { f: c[0], b: c[1], l } : null;
}

// ---------- Soru üretme (yapay zekâ) ----------
async function generateInto(lesson, box, btn, level = 'easy') {
  if (btn) { btn.disabled = true; btn.innerHTML = '<span class="typing"><i></i><i></i><i></i></span> Sorular hazırlanıyor (10-60 sn)'; }
  try {
    const res = await fetch('/api/questions', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ subject: SUBJECT[lesson.s]?.name || lesson.s, topic: lesson.title, summary: lessonSummary(lesson), count: 5, level }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Hata');
    store.update((s) => { s.aiQs[lesson.id] = [...(s.aiQs[lesson.id] || []), ...data.questions].slice(-30); });
    runMiniQuiz(box, data.questions, `${lesson.title} · yeni sorular`);
    if (btn) btn.remove();
  } catch (e) {
    if (btn) { btn.disabled = false; btn.innerHTML = `${icon.spark} Tekrar dene`; }
    box.innerHTML = `<div class="note exam"><div class="eyebrow">Soru üretilemedi</div>${esc(e.message)}. İnternet bağlantını kontrol edip tekrar dene.</div>`;
  }
}

function runMiniQuiz(box, questions, title) {
  const answers = {};
  const draw = () => {
    box.innerHTML = `<h3 style="margin:22px 0 6px">${esc(title)}</h3>` + questions.map((q, i) => `<div class="card flat" data-qi="${i}">${quizHTML(q, i, questions.length, answers[i])}${answers[i] != null ? `<button class="btn ghost sm" data-askq="${i}">Hoca'ya sor</button>` : ''}</div>`).join('');
    box.querySelectorAll('[data-qi]').forEach((card) => {
      const i = Number(card.dataset.qi);
      card.querySelectorAll('[data-opt]').forEach((b) => b.onclick = () => { if (answers[i] != null) return; answers[i] = Number(b.dataset.opt); draw(); box.querySelector(`[data-qi="${i}"]`).scrollIntoView({ block: 'nearest' }); });
    });
    box.querySelectorAll('[data-askq]').forEach((b) => b.onclick = () => openChat({ question: questionText(questions[Number(b.dataset.askq)]) }));
  };
  draw();
}

// ---------- Tekrar kartları ----------
function viewReview() {
  const ids = dueCards();
  const all = Object.keys(store.get().cards);
  if (!ids.length) {
    $app.innerHTML = `<header class="formhead"><div><div class="eyebrow">Aralıklı tekrar</div><div class="who">${all.length} kart destede</div></div></header>
      <div class="empty"><span class="bubble filled"></span><h2>Şu an tekrar edilecek kart yok</h2>
      <p>Bir dersi bitirince o dersin bilgi kartları buraya eklenir. Kartlar sen unutmadan hemen önce (1, 2, 4 gün sonra) tekrar karşına çıkar.</p>
      ${all.length ? `<button class="btn ghost" id="allcards">Yine de tüm kartları çalış</button>` : `<a class="btn" href="#/">Bugünkü derslere git</a>`}</div>
      <a class="card flat row between" href="#/hatalar" style="text-decoration:none;color:inherit"><div><div class="eyebrow">Hata defteri</div><b>${openMistakes().length} soru yeniden çözülmeyi bekliyor</b></div>${icon.chev}</a>`;
    const b = document.getElementById('allcards');
    if (b) b.onclick = () => flashSession(all.sort(() => Math.random() - 0.5).slice(0, 30));
    return;
  }
  flashSession(ids.sort(() => Math.random() - 0.5));
}

function flashSession(ids) {
  let i = 0;
  let flipped = false;
  const stats = { 2: 0, 1: 0, 0: 0 };
  const draw = () => {
    if (i >= ids.length) {
      $app.innerHTML = `<div class="result"><div class="eyebrow">Tekrar bitti</div><span class="bubble hero-b filled">✓</span>
        <h2>${ids.length} kart çalıştın</h2><p class="muted">Biliyordum ${stats[2]} · Emin değildim ${stats[1]} · Bilmiyordum ${stats[0]}</p>
        <p>Bilmediklerin 10 dakika sonra, emin olmadıkların yarın tekrar gelecek.</p><a class="btn block" href="#/">Ana sayfa</a></div>`;
      renderTabs('tekrar');
      return;
    }
    const c = cardById(ids[i]);
    if (!c) { i++; return draw(); }
    $app.innerHTML = `<header class="formhead"><div><div class="eyebrow">Tekrar · ${i + 1}/${ids.length}</div><div class="who">${esc(SUBJECT[c.l.s]?.name || '')} · ${esc(c.l.title)}</div></div></header>
      <div class="progressbar"><i style="width:${(i / ids.length) * 100}%"></i></div>
      <div class="flash ${flipped ? 'flip' : ''}" id="fc"><div class="in">
        <div class="face"><span class="eyebrow">Soru · dokun ve çevir</span>${inline(c.f)}</div>
        <div class="face back"><span class="eyebrow">Cevap</span>${inline(c.b)}</div></div></div>
      ${flipped ? `<div class="grid2" style="grid-template-columns:1fr 1fr 1fr;gap:8px">
          <button class="btn ghost" data-g="0" style="border-color:var(--wrong);color:var(--wrong)">Bilmiyordum</button>
          <button class="btn ghost" data-g="1">Emin değildim</button>
          <button class="btn" data-g="2" style="background:var(--right);border-color:var(--right)">Biliyordum</button></div>`
        : `<button class="btn block" id="flipbtn">Cevabı göster</button>`}
      <button class="btn ghost sm" id="speakc" style="margin-top:12px">${icon.speak} Sesli oku</button>`;
    document.getElementById('fc').onclick = () => { flipped = !flipped; draw(); };
    const fb = document.getElementById('flipbtn');
    if (fb) fb.onclick = () => { flipped = true; draw(); };
    document.getElementById('speakc').onclick = () => speak(plain(flipped ? c.b : c.f));
    $app.querySelectorAll('[data-g]').forEach((b) => b.onclick = () => {
      const g = Number(b.dataset.g);
      stats[g]++;
      gradeCard(ids[i], g);
      i++; flipped = false; draw();
    });
  };
  draw();
}

// ---------- Hata defteri ----------
function openMistakes() {
  return Object.entries(store.get().wrong).filter(([, w]) => !w.fixed).map(([k]) => k).filter((k) => {
    const [lid, qi] = k.split('#');
    return LESSONS[lid] && LESSONS[lid].quiz && LESSONS[lid].quiz[Number(qi)];
  });
}

function viewMistakes() {
  const keys = openMistakes();
  $app.innerHTML = `<header class="formhead"><a class="iconbtn" href="#/daha" aria-label="Geri">${icon.back}</a><div style="flex:1"><div class="eyebrow">Hata defteri</div><div class="who">${keys.length} açık soru</div></div></header>
    ${keys.length ? `<p class="muted">Yanlış yaptığın sorular burada. Doğru çözdüğün an defterden silinir. Sınavdan önce bu listeyi sıfırlamaya çalış.</p><div id="mbox"></div>`
      : `<div class="empty"><span class="bubble filled"></span><h2>Defter temiz</h2><p>Yanlış yaptığın her soru buraya düşer. Şu an çözülmemiş hata yok.</p></div>`}`;
  if (!keys.length) return;
  const box = document.getElementById('mbox');
  const answers = {};
  const shuffled = keys.map((k) => { const [lid, qi] = k.split('#'); return prepQ(LESSONS[lid].quiz[Number(qi)]); });
  const draw = () => {
    box.innerHTML = keys.map((k, i) => {
      const [lid] = k.split('#');
      const q = shuffled[i];
      return `<div class="card flat" data-qi="${i}">${subjTag(LESSONS[lid].s)} <span class="small muted">${esc(LESSONS[lid].title)}</span>${quizHTML(q, i, keys.length, answers[i])}</div>`;
    }).join('');
    box.querySelectorAll('[data-qi]').forEach((card) => {
      const i = Number(card.dataset.qi);
      card.querySelectorAll('[data-opt]').forEach((b) => b.onclick = () => {
        if (answers[i] != null) return;
        const q = shuffled[i];
        answers[i] = Number(b.dataset.opt);
        if (answers[i] === q.a) store.update((s) => { s.wrong[keys[i]].fixed = true; });
        draw();
        box.querySelector(`[data-qi="${i}"]`).scrollIntoView({ block: 'nearest' });
      });
    });
  };
  draw();
}

// ---------- Hoca (yapay zekâ) ----------
function viewTutor() {
  $app.innerHTML = `<header class="formhead"><div><div class="eyebrow">Yapay zekâ hoca</div><div class="who">İstediğini sor</div></div></header>
    <p>Hoca, 2026 KPSS Ön Lisans müfredatını ve senin seviyeni biliyor. Anlamadığın bir konuyu, çözemediğin bir soruyu ya da “bana 3 soru sor” gibi isteklerini yazabilirsin.</p>
    <div class="stack">
      ${[
        ['Kurtuluş Savaşı cephelerini bana hikâye gibi anlat', 'tarih'],
        ['Cümlenin ögelerini nasıl bulurum? Basit anlat', 'turkce'],
        ['Yaş problemlerini şıklardan deneyerek nasıl çözerim?', 'matematik'],
        ['Türkiye’nin iklim tiplerini bir kodlamayla ezberlet', 'cografya'],
        ['Cumhurbaşkanının yetkilerini sınava göre özetle', 'vatandaslik'],
        ['Sınavda 4 yanlış 1 doğruyu götürüyorsa ne zaman boş bırakmalıyım?', 'guncel'],
      ].map(([t, s]) => `<button class="lesson-item" data-s="${s}" data-q="${esc(t)}" style="width:100%;text-align:left;grid-template-columns:auto 1fr"><span class="bubble" style="border-color:var(--s);color:var(--s)">?</span><span class="t">${esc(t)}</span></button>`).join('')}
    </div>
    <button class="btn ink block" id="openchat" style="margin-top:10px">${icon.chat} Sohbeti aç</button>`;
  $app.querySelectorAll('[data-q]').forEach((b) => b.onclick = () => openChat({ prompt: b.dataset.q }));
  document.getElementById('openchat').onclick = () => openChat({});
}

// ---------- Daha fazla ----------
function viewMore() {
  const mist = openMistakes().length;
  $app.innerHTML = `<header class="formhead"><div><div class="eyebrow">Daha fazla</div><div class="who">Ekstra çalışma ve ayarlar</div></div></header>
    ${[
      ['#/strateji', 'Sınav stratejisi', '4 yanlış 1 doğru hesabı, süre planı, soru sırası, sınav sabahı', 'S'],
      ['#/hatalar', 'Hata defteri', `${mist} soru yeniden çözülmeyi bekliyor`, 'H'],
      ['#/deneme', 'Mini deneme', 'Karışık 24 soru, süreli, net hesabıyla', 'D'],
      ['#/ekstra', 'Ekstra konular', 'Günlük planın dışında, canın çalışmak isterse', 'E'],
      ['#/uret', 'Yapay zekâ ile soru üret', 'İstediğin konudan yeni sorular', '✦'],
      ['#/istatistik', 'İstatistik', 'Ne kadar çalıştın, hangi derste nasılsın', '%'],
      ['#/ayarlar', 'Ayarlar', 'Tema, sesli okuma, senkron', '⚙'],
    ].map(([h, t, m, b]) => `<a class="lesson-item" href="${h}"><span class="bubble">${b}</span><span><span class="t">${t}</span><div class="m">${m}</div></span><span class="go">${icon.chev}</span></a>`).join('')}`;
}

function viewStrategy() {
  $app.innerHTML = `<header class="formhead"><a class="iconbtn" href="#/daha" aria-label="Geri">${icon.back}</a><div style="flex:1"><div class="eyebrow">Sınav stratejisi</div><div class="who">Netini kurtaran kurallar</div></div></header>
    ${STRATEGY.map((c) => `<section class="card">${c.h ? `<h3>${inline(c.h)}</h3>` : ''}${c.b ? `<div class="body">${md(c.b)}</div>` : ''}${(c.vizs || (c.viz ? [c.viz] : [])).map(renderViz).join('')}${c.note ? `<div class="note exam"><div class="eyebrow">${esc(c.note.h || 'Unutma')}</div>${inline(c.note.t)}</div>` : ''}</section>`).join('')}
    <section class="card"><h3>Boş mu bırakayım, işaretleyeyim mi?</h3>
      <p class="small muted">Kaç şıkkı kesin eleyebildiğini seç, işaretlemenin sana ortalama ne kazandıracağını gör.</p>
      <div class="chips" id="elim">${[0, 1, 2, 3].map((n) => `<button class="chip" data-n="${n}">${n} şık eledim</button>`).join('')}</div>
      <div id="elimout" style="margin-top:12px"></div></section>`;
  const out = document.getElementById('elimout');
  const show = (n) => {
    const k = 5 - n;
    const ev = (1 / k) * 1 - ((k - 1) / k) * 0.25;
    out.innerHTML = `<div class="note ${ev > 0.001 ? '' : 'exam'}" style="--s:${ev > 0.001 ? 'var(--right)' : 'var(--warn)'}">
      <div class="eyebrow">${k} şık arasında tahmin</div>
      Doğru olma şansı <b>1/${k}</b>. Ortalama kazanç soru başına <b>${ev >= 0 ? '+' : ''}${ev.toFixed(3).replace('.', ',')} net</b>.
      ${n === 0 ? 'Hiç eleyemiyorsan tahmin ortalamada 0 getirir; <b>boş bırakmak</b> daha güvenli.' : 'En az bir şıkkı eminlikle eleyebiliyorsan <b>işaretle</b>: uzun vadede kazandırır.'}</div>`;
    document.querySelectorAll('#elim .chip').forEach((c) => c.style.borderColor = Number(c.dataset.n) === n ? 'var(--graphite)' : '');
  };
  document.querySelectorAll('#elim .chip').forEach((c) => c.onclick = () => show(Number(c.dataset.n)));
  show(1);
}

// ---------- Mini deneme ----------
function viewMock() {
  document.body.classList.add('player');
  const s = store.get();
  const pool = {};
  Object.values(LESSONS).forEach((l) => (l.quiz || []).forEach((q, i) => {
    const key = l.s;
    (pool[key] ||= []).push({ ...prepQ(q), _k: `${l.id}#${i}`, _s: l.s, _done: !!s.lessons[l.id]?.done });
  }));
  // Gerçek sınav oranlarına yakın 24 soru: Tü 6, Ma 6, Ta 5, Co 4, Va 2, Gü 1
  const plan = { turkce: 6, matematik: 6, tarih: 5, cografya: 4, vatandaslik: 2, guncel: 1 };
  const qs = [];
  for (const [sid, n] of Object.entries(plan)) {
    const arr = (pool[sid] || []).sort(() => Math.random() - 0.5).sort((a, b) => (b._done ? 1 : 0) - (a._done ? 1 : 0));
    qs.push(...arr.slice(0, n));
  }
  const answers = {};
  const started = Date.now();
  let i = 0;
  const limitMin = 26;
  const draw = () => {
    const q = qs[i];
    const left = Math.max(0, limitMin * 60 - Math.round((Date.now() - started) / 1000));
    $app.innerHTML = `<div class="player-top"><div class="row"><a class="iconbtn" href="#/daha" aria-label="Denemeden çık">${icon.close}</a>
      <div class="ttl"><span class="tag">Mini deneme</span><b>Soru ${i + 1}/${qs.length} · <span id="mt" class="num">${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}</span></b></div></div>
      <div class="ticks">${qs.map((_, j) => `<i class="${answers[j] != null ? 'done' : ''} ${j === i ? 'cur' : ''}"></i>`).join('')}</div></div>
      <div class="stage">${subjTag(q._s)}<div class="qstem" style="margin-top:8px">${qtext(q.q)}</div>${q.viz ? renderViz(q.viz) : ''}
      <div class="opts">${q.o.map((o, j) => `<button class="opt ${answers[i] === j ? 'sel' : ''}" data-opt="${j}"><span class="bubble ${answers[i] === j ? 'filled' : ''}">${LETTERS[j]}</span><span>${inline(o)}</span></button>`).join('')}</div></div>
      <div class="bottombar"><div class="in"><button class="btn ghost" id="pv" ${i ? '' : 'disabled'}>Önceki</button>
      ${i < qs.length - 1 ? `<button class="btn" id="nx">${answers[i] != null ? 'Sonraki' : 'Boş geç'}</button>` : `<button class="btn ink" id="fin">Denemeyi bitir</button>`}</div></div>`;
    $app.querySelectorAll('[data-opt]').forEach((b) => b.onclick = () => { const j = Number(b.dataset.opt); answers[i] = answers[i] === j ? undefined : j; draw(); });
    document.getElementById('pv').onclick = () => { i--; draw(); };
    const nx = document.getElementById('nx'); if (nx) nx.onclick = () => { i++; draw(); window.scrollTo(0, 0); };
    const fin = document.getElementById('fin'); if (fin) fin.onclick = finish;
  };
  const iv = setInterval(() => {
    const el = document.getElementById('mt');
    const left = Math.max(0, limitMin * 60 - Math.round((Date.now() - started) / 1000));
    if (el) el.textContent = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`;
    if (!left) finish();
  }, 1000);
  const stopTimer = startTimer('deneme');
  cleanup = () => { clearInterval(iv); stopTimer(); };
  function finish() {
    clearInterval(iv);
    const by = {};
    let D = 0, Y = 0;
    qs.forEach((q, j) => {
      const b = (by[q._s] ||= { d: 0, y: 0, n: 0 });
      b.n++;
      if (answers[j] == null) return;
      if (answers[j] === q.a) { b.d++; D++; } else { b.y++; Y++; store.update((s) => { s.wrong[q._k] = { at: Date.now(), fixed: false }; }); }
    });
    store.update((s) => { (s.extra.mocks ||= []).push({ at: Date.now(), d: D, y: Y, n: qs.length }); });
    document.body.classList.remove('player');
    renderTabs('daha');
    $app.innerHTML = `<div class="result"><div class="eyebrow">Mini deneme sonucu</div><span class="bubble hero-b filled">N</span>
      <div class="bigscore num">${(D - Y / 4).toFixed(2).replace('.', ',')}</div><p class="muted">net · ${D} doğru · ${Y} yanlış · ${qs.length - D - Y} boş</p>
      <div class="card flat" style="text-align:left">${Object.entries(by).map(([sid, b]) => `<div class="subjbar" data-s="${sid}"><span class="tag">${esc(SUBJECT[sid].name)}</span><div class="progressbar"><i style="width:${(b.d / b.n) * 100}%;background:var(--s)"></i></div><span class="small num">${b.d}/${b.n}</span></div>`).join('')}</div>
      <p class="small muted">Yanlışların hata defterine eklendi.</p>
      <div class="stack"><a class="btn block" href="#/hatalar">Yanlışlarımı çöz</a><a class="btn ghost block" href="#/deneme" onclick="location.reload()">Yeni deneme</a></div></div>`;
    window.scrollTo(0, 0);
  }
  draw();
}

// ---------- Ekstra ----------
function viewExtra() {
  $app.innerHTML = `<header class="formhead"><a class="iconbtn" href="#/daha" aria-label="Geri">${icon.back}</a><div style="flex:1"><div class="eyebrow">Ekstra konular</div><div class="who">Canın çalışmak isterse</div></div></header>
    <p class="muted">Bunlar günlük planda yok. Günlük dersleri bitirdiysen ve hâlâ enerjin varsa buradan devam et. Her biri en az 1-2 soru getirebilecek konular.</p>
    ${EXTRA.map((l) => { const st = lessonState(l.id); return `<a class="lesson-item" href="#/ders/${l.id}" data-s="${l.s}"><span class="bubble ${st.done ? 'filled' : ''}" style="border-color:var(--s);color:var(--s)">${SUBJECT[l.s]?.short || '+'}</span><span><span class="t">${esc(l.title)}</span><div class="m">${esc(SUBJECT[l.s]?.name || '')} · ~${l.min || 10} dk · ${esc(l.why || '')}</div></span><span class="go">${icon.chev}</span></a>`; }).join('')}`;
}

function viewGenerate() {
  const opts = Object.values(LESSONS).filter((l) => l.quiz);
  $app.innerHTML = `<header class="formhead"><a class="iconbtn" href="#/daha" aria-label="Geri">${icon.back}</a><div style="flex:1"><div class="eyebrow">Yapay zekâ</div><div class="who">Yeni soru üret</div></div></header>
    <p class="muted">Bir konu seç; hoca o dersin notlarına bakarak ÖSYM tarzında 5 yeni soru yazsın. Her sorunun açıklaması da gelir.</p>
    <label class="small" for="lsel"><b>Konu</b></label>
    <select id="lsel" style="width:100%;min-height:48px;border-radius:14px;border:1.5px solid var(--line);background:var(--surface);padding:0 12px;margin:6px 0 12px">
      ${SUBJECTS.map((s) => `<optgroup label="${s.name}">${opts.filter((l) => l.s === s.id).map((l) => `<option value="${l.id}">${l.day ? l.day + '. gün · ' : 'Ekstra · '}${esc(l.title)}</option>`).join('')}</optgroup>`).join('')}
    </select>
    <div class="row" style="margin-bottom:12px"><div class="seg" id="lvl"><button class="on" data-l="easy">Kolay-orta</button><button data-l="hard">Sınav ayarı</button></div></div>
    <button class="btn ink block" id="gen">${icon.spark} 5 soru üret</button>
    <div id="genbox"></div>`;
  let level = 'easy';
  document.querySelectorAll('#lvl button').forEach((b) => b.onclick = () => { level = b.dataset.l; document.querySelectorAll('#lvl button').forEach((x) => x.classList.toggle('on', x === b)); });
  document.getElementById('gen').onclick = (e) => {
    const l = LESSONS[document.getElementById('lsel').value];
    const btn = e.currentTarget;
    generateInto(l, document.getElementById('genbox'), null, level).then(() => { btn.disabled = false; });
    btn.disabled = true;
    document.getElementById('genbox').innerHTML = '<div class="card flat row"><span class="typing"><i></i><i></i><i></i></span> Sorular hazırlanıyor. Kolay seviye ~15 sn, sınav ayarı ~1 dk sürebilir…</div>';
  };
}

// ---------- İstatistik ----------
function viewStats() {
  const s = store.get();
  const totalSec = Object.values(s.days).reduce((a, b) => a + b, 0);
  const lessons = Object.values(LESSONS).filter((l) => l.day);
  const done = lessons.filter((l) => s.lessons[l.id]?.done);
  const perSub = SUBJECTS.map((sub) => {
    const ls = lessons.filter((l) => l.s === sub.id);
    const d = ls.filter((l) => s.lessons[l.id]?.done);
    const right = d.reduce((a, l) => a + (s.lessons[l.id].score || 0), 0);
    const tot = d.reduce((a, l) => a + (s.lessons[l.id].total || 0), 0);
    const time = ls.reduce((a, l) => a + (s.lessons[l.id]?.time || 0), 0);
    return { sub, n: ls.length, d: d.length, acc: tot ? right / tot : null, time };
  });
  $app.innerHTML = `<header class="formhead"><a class="iconbtn" href="#/daha" aria-label="Geri">${icon.back}</a><div style="flex:1"><div class="eyebrow">İstatistik</div><div class="who">Özgür'ün çalışma karnesi</div></div></header>
    <div class="grid2">
      <div class="stat"><div class="v num">${fmtMin(totalSec)}</div><div class="l">toplam çalışma</div></div>
      <div class="stat"><div class="v num">${done.length}/${lessons.length}</div><div class="l">ders bitti</div></div>
      <div class="stat"><div class="v num">${Object.keys(s.cards).length}</div><div class="l">bilgi kartı destede</div></div>
      <div class="stat"><div class="v num">${openMistakes().length}</div><div class="l">açık hata</div></div>
    </div>
    <h3 style="margin:24px 0 8px">Derslere göre</h3>
    ${perSub.map((p) => `<div class="card flat" data-s="${p.sub.id}"><div class="row between"><span class="tag">${p.sub.name}</span><span class="small muted">${p.sub.q} soru · ${fmtMin(p.time)}</span></div>
      <div class="subjbar" style="grid-template-columns:90px 1fr 50px"><span class="small">Bitirilen</span><div class="progressbar"><i style="width:${(p.d / p.n) * 100}%;background:var(--s)"></i></div><span class="small num">${p.d}/${p.n}</span></div>
      <div class="subjbar" style="grid-template-columns:90px 1fr 50px"><span class="small">Doğru oranı</span><div class="progressbar"><i style="width:${(p.acc || 0) * 100}%;background:var(--graphite)"></i></div><span class="small num">${p.acc == null ? '–' : '%' + Math.round(p.acc * 100)}</span></div></div>`).join('')}
    <h3 style="margin:24px 0 8px">Günlere göre</h3>
    <div class="card flat">${renderViz({ type: 'bars', items: STUDY_DAYS.map((k, i) => [`${i + 1}. gün`, Math.max(0.001, (s.days[k] || 0) / 60), `${Math.round((s.days[k] || 0) / 60)} dk`]), c: 'ink' })}</div>
    ${(s.extra.mocks || []).length ? `<h3 style="margin:24px 0 8px">Mini denemeler</h3><div class="card flat">${s.extra.mocks.map((m, i) => `<div class="row between"><span>${i + 1}. deneme</span><b class="num">${(m.d - m.y / 4).toFixed(2).replace('.', ',')} net / ${m.n}</b></div>`).join('')}</div>` : ''}`;
}

// ---------- Ayarlar ----------
function viewSettings() {
  const s = store.get();
  $app.innerHTML = `<header class="formhead"><a class="iconbtn" href="#/daha" aria-label="Geri">${icon.back}</a><div style="flex:1"><div class="eyebrow">Ayarlar</div><div class="who">Uygulama</div></div></header>
    <section class="card flat"><h3>Görünüm</h3><div class="seg" id="theme" style="margin-top:10px">
      ${[['auto', 'Otomatik'], ['light', 'Açık'], ['dark', 'Koyu']].map(([k, l]) => `<button data-t="${k}" class="${s.settings.theme === k ? 'on' : ''}">${l}</button>`).join('')}</div></section>
    <section class="card flat"><h3>Senkron</h3><p class="small">İlerlemen bu cihazda ve Cloudflare'deki veritabanında saklanır; telefonla bilgisayar arasında otomatik eşleşir.</p>
      <p class="small">Durum: <b id="syncst">${isOnline() ? 'Bağlı' : 'Çevrimdışı (bu cihazda saklanıyor)'}</b></p>
      <button class="btn ghost sm" id="syncnow">Şimdi eşitle</button></section>
    <section class="card flat"><h3>Sesli okuma</h3><p class="small">Ders ekranındaki hoparlör simgesi, kartı Türkçe sesle okur. Ses, telefonunun Türkçe sesini kullanır.</p>
      <button class="btn ghost sm" id="ttstest">${icon.speak} Dene</button></section>
    <section class="card flat"><h3>Uygulamayı telefona ekle</h3><p class="small">Tarayıcı menüsünden <b>Ana ekrana ekle</b> dersen uygulama gibi tam ekran açılır ve internetsiz de çalışır (yapay zekâ hariç).</p></section>
    <section class="card flat"><h3>Sıfırla</h3><p class="small">Tüm ilerlemeyi siler. Geri alınamaz.</p><button class="btn ghost sm" id="reset" style="color:var(--wrong);border-color:var(--wrong)">İlerlemeyi sıfırla</button></section>`;
  document.querySelectorAll('#theme button').forEach((b) => b.onclick = () => { store.update((x) => { x.settings.theme = b.dataset.t; }); applyTheme(); viewSettings(); });
  document.getElementById('syncnow').onclick = async () => { const ok = await pull(); toast(ok ? 'Eşitlendi' : 'Sunucuya ulaşılamadı'); viewSettings(); };
  document.getElementById('ttstest').onclick = () => speak('Merhaba Özgür. Bugün de birlikte çalışıyoruz.');
  document.getElementById('reset').onclick = () => { if (confirm('Tüm ilerleme silinsin mi?')) { store.reset(); toast('Sıfırlandı'); location.hash = '#/'; } };
}

// ---------- Sınav günü ----------
function viewExamDay() {
  $app.innerHTML = `<header class="formhead"><div><div class="eyebrow">4 Ekim 2026 · Pazar</div><div class="who">Aday: Özgür</div></div></header>
    <section class="exam-banner"><div class="eyebrow">Bugün sınav günü</div><h1 style="font-size:44px;margin:6px 0">Başarılar Özgür</h1>
      <p>Sınav <b>10.15</b>'te başlar. Kapı <b>10.00</b>'da kapanır; en geç 09.30'da binanın önünde ol.</p>
      <div class="clock num" id="clock" style="color:var(--paper)">${countdownText()}</div></section>
    <section class="card"><h3>Yanına al</h3><ul>
      <li><b>Nüfus cüzdanı / kimlik kartı</b> (süresi geçmemiş, fotoğraflı) ya da geçerli pasaport</li>
      <li>Sınava giriş belgesi (ais.osym.gov.tr; yanında olması önerilir, bina ve salon bilgin için)</li>
      <li>Telefon, saat, kalem götürme; kalemi ÖSYM verir. Yanına alman yasak eşyaları ÖSYM'nin listesinden kontrol et.</li></ul></section>
    <section class="card"><h3>Salondaki planın</h3>${md(STRATEGY.find((x) => x.id === 'order')?.b || '')}</section>
    <section class="card"><h3>Son 5 dakikalık göz atma</h3><p>Yeni bir şey öğrenmeye çalışma. İstersen sadece <a href="#/tekrar">tekrar kartlarından</a> birkaçını çevir. Derin nefes: 4 saniye al, 4 tut, 6 ver.</p></section>`;
  const clock = document.getElementById('clock');
  const iv = setInterval(() => { clock.textContent = countdownText(); }, 1000);
  cleanup = () => clearInterval(iv);
}

// ---------- başlat ----------
store.on(() => {
  const h = location.hash || '#/';
  const active = h.startsWith('#/plan') || h.startsWith('#/gun') ? 'plan' : h.startsWith('#/tekrar') ? 'tekrar' : h.startsWith('#/hoca') ? 'hoca' : h === '#/' || h === '' ? 'home' : 'daha';
  if (!document.body.classList.contains('player')) renderTabs(active);
});
route();
pull().then((changed) => { if (changed && (location.hash === '' || location.hash === '#/' || location.hash.startsWith('#/plan'))) route(); });

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}));
}
