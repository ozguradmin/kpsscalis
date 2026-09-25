// Ortak arayüz parçaları: bildirim, sesli okuma, soru çizimi, tema.
import { inline, md, esc, renderViz } from './viz.js';
import { store } from './store.js';
import { icon } from './icons.js';

export const LETTERS = ['A', 'B', 'C', 'D', 'E'];
export const plain = (s) => String(s || '').replace(/\*\*|==/g, '').replace(/(^|[\s(])_(.+?)_(?=[\s).,;:!?]|$)/g, '$1$2');

export function toast(msg, ms = 2800) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => t.classList.remove('show'), ms);
}

export function fmtMin(sec) {
  const m = Math.round((sec || 0) / 60);
  if (m < 60) return `${m} dk`;
  return `${Math.floor(m / 60)} sa ${m % 60} dk`;
}
export function fmtDur(sec) {
  sec = Math.max(0, Math.round(sec || 0));
  const m = Math.floor(sec / 60), s = sec % 60;
  if (!m) return `${s} sn`;
  if (m < 60) return s ? `${m} dk ${s} sn` : `${m} dk`;
  return `${Math.floor(m / 60)} sa ${m % 60} dk`;
}

// ---------- tema ----------
const mq = window.matchMedia('(prefers-color-scheme: dark)');
export function effectiveTheme() {
  const t = store.get().settings.theme;
  return t === 'light' || t === 'dark' ? t : mq.matches ? 'dark' : 'light';
}
export function applyTheme() {
  const t = effectiveTheme();
  document.documentElement.dataset.theme = t;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = t === 'dark' ? '#111114' : '#F6F5F7';
  try { localStorage.setItem('kpss-theme', t); } catch (e) { /* yoksay */ }
}
mq.addEventListener?.('change', () => applyTheme());
export function toggleTheme() {
  const next = effectiveTheme() === 'dark' ? 'light' : 'dark';
  store.update((s) => { s.settings.theme = next; });
  applyTheme();
  return next;
}
export const themeIcon = () => (effectiveTheme() === 'dark' ? icon.sun : icon.moon);

// ---------- sesli okuma (tarayıcının Türkçe sesi) ----------
// iOS'ta speechSynthesis.speaking bazen takılı kalır; durumu kendimiz tutarız.
let speakingBtn = null;
let speakToken = 0;
let warned = false;
function trVoice() {
  const vs = window.speechSynthesis.getVoices();
  return vs.find((v) => /^tr(-|_|$)/i.test(v.lang)) || null;
}
if ('speechSynthesis' in window) window.speechSynthesis.onvoiceschanged = () => {};

export function stopSpeaking() {
  speakToken++;
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  if (speakingBtn) { speakingBtn.classList.remove('on'); speakingBtn.innerHTML = icon.speak; speakingBtn.setAttribute('aria-label', 'Sesli dinle'); }
  speakingBtn = null;
}

export function speak(text, btn) {
  if (!('speechSynthesis' in window)) { toast('Bu tarayıcı sesli okumayı desteklemiyor'); return; }
  const synth = window.speechSynthesis;
  if (btn && speakingBtn === btn) { stopSpeaking(); return; }
  stopSpeaking();
  const my = ++speakToken;
  const clean = plain(text).replace(/[#*_`>|]/g, ' ').replace(/\s+/g, ' ').trim();
  if (!clean) return;
  // Uzun metinleri cümlelere böl: Chrome/Safari tek parçada 15 sn sonra susabiliyor
  const parts = clean.match(/[^.!?…:]+[.!?…:]*/g) || [clean];
  const chunks = [];
  let cur = '';
  for (const p of parts) { if ((cur + p).length > 220 && cur) { chunks.push(cur); cur = p; } else cur += p; }
  if (cur.trim()) chunks.push(cur);
  const voice = trVoice();
  if (!voice && !warned) { warned = true; toast('Telefonunda Türkçe ses yoksa okuma İngilizce aksanlı olabilir. iPhone: Ayarlar › Erişilebilirlik › Seslendirilen İçerik › Sesler › Türkçe', 5200); }
  if (btn) { speakingBtn = btn; btn.classList.add('on'); btn.innerHTML = icon.stop; btn.setAttribute('aria-label', 'Okumayı durdur'); }
  let started = false;
  chunks.forEach((c, i) => {
    const u = new SpeechSynthesisUtterance(c.trim());
    u.lang = 'tr-TR'; u.rate = 0.98;
    if (voice) u.voice = voice;
    u.onstart = () => { started = true; };
    if (i === chunks.length - 1) u.onend = () => { if (my === speakToken) stopSpeaking(); };
    u.onerror = () => { if (my === speakToken) stopSpeaking(); };
    synth.speak(u);
  });
  if (synth.paused) synth.resume();
  setTimeout(() => {
    if (my === speakToken && !started && !synth.speaking) {
      stopSpeaking();
      toast('Ses çıkmadı: telefon sessiz modda olabilir. Yan tuştan sessizi kapatıp sesi aç.', 4200);
    }
  }, 1600);
}

// ---------- hatalı soru bildirimi (yapay zekâ soruları) ----------
const reported = new Set();
document.addEventListener('click', async (e) => {
  const b = e.target.closest('[data-report]');
  if (!b) return;
  const key = b.dataset.report;
  if (!confirm('Bu soruda hata olduğunu mu düşünüyorsun? (İki doğru şık, yanlış bilgi, anlaşılmaz kök…) Soru bankadan çıkarılır.')) return;
  reported.add(key);
  b.outerHTML = '<div class="small muted" style="margin-top:8px">Bildirildi, bankadan çıkarıldı. Teşekkürler!</div>';
  store.update((s) => { if (s.wrong[key]) s.wrong[key].fixed = true; });
  try { await fetch('/api/bank/report', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id: key }) }); } catch (err) { /* çevrimdışı */ }
});

// ---------- sorular ----------
// Şıkları karıştır: doğru cevap hep aynı harfte toplanmasın. Sayısal sıralı ve öncüllü (I, II…) şıklara dokunma.
export function prepQ(q) {
  if (!q || !Array.isArray(q.o)) return q;
  const numeric = q.o.every((o) => /^[\s\d.,/−\-+%°:×]+(\s*(TL|lira|yıl|yaş|ay|gün|saat|dk|dakika|kg|km|m|cm|metre|kişi|tane|adet|derece|birim|birimkare))?$/i.test(String(o).trim()));
  const roman = q.o.some((o) => /^(Yalnız\s)?(I{1,3}|IV|V)(\s|$|,)/.test(String(o).trim()));
  const ordered = q.o.every((o) => /^[IVX]+$/.test(String(o).trim()));
  if (numeric || roman || ordered || q.fixed) return { ...q };
  const idx = q.o.map((_, i) => i);
  for (let i = idx.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
  return { ...q, o: idx.map((i) => q.o[i]), a: idx.indexOf(q.a), _map: idx };
}

export function qtext(s) {
  // Soru kökü: satır sonlarını ve I./II./III. öncüllerini koru
  return String(s).split('\n').map((ln) => {
    const r = ln.match(/^\s*(I{1,3}V?|IV|V)\.\s+(.*)$/);
    return r ? `<span class="roman"><b>${r[1]}.</b> ${inline(r[2])}</span>` : ln.trim() ? `<p>${inline(ln)}</p>` : '';
  }).join('');
}

export function questionText(q, pick) {
  return `${plain(q.q)}\n${q.o.map((o, j) => `${LETTERS[j]}) ${plain(o)}`).join('\n')}\nDoğru cevap: ${LETTERS[q.a]}${q.ex ? `\nAçıklama: ${plain(q.ex)}` : ''}` +
    (pick != null ? `\nÖzgür'ün cevabı: ${pick === -1 ? 'boş bıraktı' : LETTERS[pick] + (pick === q.a ? ' (doğru)' : ' (yanlış)')}` : '');
}

// Tek soru: kök + şıklar + (cevaplandıysa) geri bildirim
export function questionHTML(q, pick, { head = '', guess = null, struck = [] } = {}) {
  let h = head + `<div class="qstem">${qtext(q.q)}</div>`;
  if (q.viz) h += renderViz(q.viz);
  h += `<div class="opts" role="radiogroup">${q.o.map((o, j) => {
    const cls = pick == null ? (struck.includes(j) ? 'struck' : '') : j === q.a ? 'right' : j === pick ? 'wrong' : 'dim';
    const fill = pick != null && (j === q.a || j === pick) ? `filled ${j === q.a ? 'right' : 'wrong'}` : '';
    return `<button class="opt ${cls}" data-opt="${j}" ${pick != null ? 'disabled' : ''} role="radio" aria-checked="${pick === j}"><span class="bubble ${fill}">${LETTERS[j]}</span><span>${inline(o)}</span></button>`;
  }).join('')}</div>`;
  if (pick == null && guess != null) {
    h += `<div class="row between" style="margin-top:-4px"><span class="elim-hint">Emin olmadığın şıkkı elemek için basılı tut</span><button class="chip ${guess ? 'on' : ''}" data-guess type="button">${icon.sparkQ}<span>Tahmin</span></button></div>`;
  }
  if (pick != null) {
    const ok = pick === q.a;
    const rep = q.key && String(q.key).startsWith('ai:') ? (reported.has(q.key) ? '<div class="small muted" style="margin-top:8px">Bildirildi, bankadan çıkarıldı.</div>' : `<button class="chip" data-report="${esc(q.key)}" type="button" style="margin-top:10px;box-shadow:none">${icon.flag}<span>Soru hatalı mı? Bildir</span></button>`) : '';
    h += `<div class="feedback ${ok ? 'ok' : 'no'}"><h3>${ok ? (guess ? 'Doğru, ama tahmindi' : 'Doğru!') : pick === -1 ? `Boş bıraktın · doğrusu ${LETTERS[q.a]}` : `Yanlış · doğrusu ${LETTERS[q.a]}`}</h3>${md(q.ex || '')}${q.tip ? `<div class="tip"><b>İpucu:</b> ${inline(q.tip)}</div>` : ''}${q.ai ? '<div class="small muted" style="margin-top:8px">Yapay zekâ yazdı, iki kez denetlendi.</div>' : ''}${rep}</div>`;
  }
  return h;
}

// Uzun basınca şık eleme (üzerini çiz)
export function bindStrike(root, struck, redraw) {
  root.querySelectorAll('.opt[data-opt]:not([disabled])').forEach((b) => {
    let t = null, fired = false;
    const start = () => { fired = false; t = setTimeout(() => { fired = true; const j = Number(b.dataset.opt); const i = struck.indexOf(j); if (i >= 0) struck.splice(i, 1); else struck.push(j); if (navigator.vibrate) navigator.vibrate(12); redraw(); }, 420); };
    const end = () => clearTimeout(t);
    b.addEventListener('pointerdown', start);
    ['pointerup', 'pointerleave', 'pointercancel'].forEach((e) => b.addEventListener(e, end));
    b.addEventListener('contextmenu', (e) => e.preventDefault());
    b.addEventListener('click', (e) => { if (fired) { e.stopImmediatePropagation(); e.preventDefault(); } }, true);
  });
}

export { esc, inline, md, renderViz };
