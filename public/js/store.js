// İlerleme: tarayıcıda (localStorage) tutulur, Cloudflare D1 ile senkronlanır.
const KEY = 'kpss-ozgur-v1';

const blank = () => ({
  v: 1,
  lessons: {},     // id → { done, doneAt, started, time, score, total, attempts }
  cards: {},       // bilgi kartı id → { box, due }
  wrong: {},       // "dersId#soruNo" → { at, fixed }
  days: {},        // "YYYY-MM-DD" → saniye
  extra: {},       // ekstra soru/ders kayıtları
  aiQs: {},        // dersId → üretilen sorular
  log: [],         // her cevap: { k, l, s, ok (1/0/-1 boş), src, at, sec, g (tahmin) }
  settings: { theme: 'auto', tts: true },
  updatedAt: 0,
});

let state = load();
const listeners = new Set();
let syncTimer = null;
let online = true;

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...blank(), ...JSON.parse(raw) };
  } catch (e) { /* gizli sekme vb. */ }
  return blank();
}

function persist() {
  state.updatedAt = Date.now();
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* yoksay */ }
  listeners.forEach((fn) => fn(state));
  clearTimeout(syncTimer);
  syncTimer = setTimeout(push, 1500);
}

export const store = {
  get: () => state,
  on(fn) { listeners.add(fn); return () => listeners.delete(fn); },
  update(fn) { fn(state); persist(); },
  reset() { state = blank(); persist(); },
};

// ---------- sunucu senkronu ----------

function mergeInto(a, b) {
  // İki cihazdaki ilerlemeyi birleştir: tamamlanan ders tamamlanmış kalır, süreler en büyüğü alır.
  const out = { ...blank(), ...a };
  for (const [id, l] of Object.entries(b.lessons || {})) {
    const m = out.lessons[id] || {};
    out.lessons[id] = {
      ...m, ...l,
      done: !!(m.done || l.done),
      doneAt: Math.min(m.doneAt || Infinity, l.doneAt || Infinity) === Infinity ? undefined : Math.min(m.doneAt || Infinity, l.doneAt || Infinity),
      time: Math.max(m.time || 0, l.time || 0),
      attempts: Math.max(m.attempts || 0, l.attempts || 0),
      score: (l.attempts || 0) >= (m.attempts || 0) ? l.score : m.score,
      total: (l.attempts || 0) >= (m.attempts || 0) ? l.total : m.total,
    };
  }
  for (const [id, c] of Object.entries(b.cards || {})) {
    const m = out.cards[id];
    if (!m || (c.seen || 0) > (m.seen || 0)) out.cards[id] = c;
  }
  for (const [id, w] of Object.entries(b.wrong || {})) {
    const m = out.wrong[id];
    out.wrong[id] = m ? { ...m, ...w, fixed: !!(m.fixed && w.fixed) } : w;
  }
  for (const [d, s] of Object.entries(b.days || {})) out.days[d] = Math.max(out.days[d] || 0, s);
  const seen = new Set();
  out.log = [...(a.log || []), ...(b.log || [])].filter((x) => { const id = `${x.k}|${x.at}`; if (seen.has(id)) return false; seen.add(id); return true; })
    .sort((x, y) => x.at - y.at).slice(-LOG_MAX);
  out.extra = { ...(b.extra || {}), ...(a.extra || {}) };
  out.aiQs = { ...(b.aiQs || {}), ...(a.aiQs || {}) };
  out.settings = { ...(b.settings || {}), ...(a.settings || {}) };
  return out;
}

export async function pull() {
  try {
    const res = await fetch('/api/progress', { cache: 'no-store' });
    if (!res.ok) throw new Error(res.status);
    const { data } = await res.json();
    online = true;
    if (data) {
      state = mergeInto(state, data);
      try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
      listeners.forEach((fn) => fn(state));
    }
    return true;
  } catch (e) {
    online = false;
    return false;
  }
}

async function push() {
  try {
    const res = await fetch('/api/progress', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ data: state }),
    });
    online = res.ok;
  } catch (e) { online = false; }
}

export const isOnline = () => online;

// ---------- cevap günlüğü ----------
// Özgür'ün çözdüğü her soru: hoca, net tahmini ve akıllı deneme buradan beslenir.
const LOG_MAX = 1500;
export function logAnswer(e) {
  store.update((s) => {
    (s.log ||= []).push({ at: Date.now(), ...e });
    if (s.log.length > LOG_MAX) s.log = s.log.slice(-LOG_MAX);
  });
}

// ---------- zaman takibi ----------
// Ders ekranında aktif geçen süreyi sayar; sekme gizlenince veya 2 dk hareketsiz kalınca durur.
export function startTimer(lessonId) {
  let last = Date.now();
  let lastInput = Date.now();
  let acc = 0;
  const onInput = () => { lastInput = Date.now(); };
  const tick = () => {
    const now = Date.now();
    if (document.visibilityState === 'visible' && now - lastInput < 120000) acc += (now - last) / 1000;
    if (acc < 0) acc = 0;
    last = now;
    if (acc >= 15) flush();
  };
  const flush = () => {
    const secs = Math.round(acc);
    if (!secs) return;
    acc -= secs;
    session += secs;
    store.update((s) => {
      const l = (s.lessons[lessonId] ||= {});
      l.time = (l.time || 0) + secs;
      l.started = true;
      const d = todayKey();
      s.days[d] = (s.days[d] || 0) + secs;
    });
  };
  let session = 0;
  const flushed = flush;
  const iv = setInterval(tick, 1000);
  ['pointerdown', 'keydown', 'touchstart'].forEach((e) => window.addEventListener(e, onInput, { passive: true }));
  window.addEventListener('scroll', onInput, { passive: true, capture: true });
  const stop = () => {
    tick(); flushed();
    clearInterval(iv);
    ['pointerdown', 'keydown', 'touchstart'].forEach((e) => window.removeEventListener(e, onInput));
    window.removeEventListener('scroll', onInput, { capture: true });
  };
  stop.flush = () => { tick(); flushed(); };
  // bu oturumda geçen aktif süre (sn)
  stop.elapsed = () => session + acc;
  stop.resetSession = () => { session = 0; acc = 0; };
  return stop;
}

export function todayKey(d = new Date()) {
  // Türkiye saati (UTC+3)
  const t = new Date(d.getTime() + 3 * 3600 * 1000);
  return t.toISOString().slice(0, 10);
}

// ---------- aralıklı tekrar (Leitner kutuları) ----------
const INTERVAL_DAYS = [0, 1, 2, 4, 7];

export function cardState(id) { return state.cards[id] || null; }

export function addCards(ids) {
  store.update((s) => {
    for (const id of ids) if (!s.cards[id]) s.cards[id] = { box: 0, due: Date.now(), seen: 0 };
  });
}

export function gradeCard(id, grade) {
  // grade: 2 = biliyordum, 1 = emin değilim, 0 = bilmiyordum
  store.update((s) => {
    const c = (s.cards[id] ||= { box: 0, due: Date.now(), seen: 0 });
    c.seen = (c.seen || 0) + 1;
    if (grade === 2) c.box = Math.min(c.box + 1, INTERVAL_DAYS.length - 1);
    else if (grade === 0) c.box = 0;
    const days = grade === 0 ? 0 : grade === 1 ? Math.max(1, INTERVAL_DAYS[c.box] / 2) : INTERVAL_DAYS[c.box];
    c.due = grade === 0 ? Date.now() + 10 * 60 * 1000 : startOfDay(Date.now() + days * 86400000);
  });
}

function startOfDay(ms) {
  const k = todayKey(new Date(ms));
  return Date.parse(k + 'T00:00:00+03:00');
}

export function dueCards() {
  const now = Date.now();
  return Object.entries(state.cards).filter(([, c]) => c.due <= now).map(([id]) => id);
}
