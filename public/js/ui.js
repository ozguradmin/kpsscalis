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
// Varsayılan aydınlık; seçilen tema localStorage + senkronda kalır.
export function effectiveTheme() {
  return store.get().settings.theme === 'dark' ? 'dark' : 'light';
}
export function applyTheme() {
  const t = effectiveTheme();
  document.documentElement.dataset.theme = t;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = t === 'dark' ? '#111114' : '#F6F5F7';
  try { localStorage.setItem('kpss-theme', t); } catch (e) { /* yoksay */ }
}

// ---------- sesli okuma ----------
// Önce Cartesia'nın doğal Türkçe sesi (/api/tts, <audio> ile: iPhone sessizdeyken de çalar).
// Servis yoksa telefonun kendi Türkçe sesine (speechSynthesis) düşer.
let speakingBtn = null;
let speakToken = 0;
let warned = false;
let serverTTS = true;
const audio = typeof Audio !== 'undefined' ? new Audio() : null;
if (audio) audio.preload = 'auto';
const clipCache = new Map(); // metin → blob URL
let silentUrl = null;

function silentWav() {
  if (silentUrl) return silentUrl;
  const n = 400, buf = new ArrayBuffer(44 + n * 2), v = new DataView(buf);
  const w = (o, str) => { for (let i = 0; i < str.length; i++) v.setUint8(o + i, str.charCodeAt(i)); };
  w(0, 'RIFF'); v.setUint32(4, 36 + n * 2, true); w(8, 'WAVE'); w(12, 'fmt '); v.setUint32(16, 16, true);
  v.setUint16(20, 1, true); v.setUint16(22, 1, true); v.setUint32(24, 8000, true); v.setUint32(28, 16000, true);
  v.setUint16(32, 2, true); v.setUint16(34, 16, true); w(36, 'data'); v.setUint32(40, n * 2, true);
  silentUrl = URL.createObjectURL(new Blob([buf], { type: 'audio/wav' }));
  return silentUrl;
}

function trVoice() {
  const vs = window.speechSynthesis.getVoices();
  return vs.find((v) => /^tr(-|_|$)/i.test(v.lang)) || null;
}
if ('speechSynthesis' in window) window.speechSynthesis.onvoiceschanged = () => {};

function setBtn(btn, on) {
  if (!btn) return;
  btn.classList.toggle('on', on);
  btn.innerHTML = on ? icon.stop : icon.speak;
  btn.setAttribute('aria-label', on ? 'Okumayı durdur' : 'Sesli dinle');
}

export function stopSpeaking() {
  speakToken++;
  if (audio) { audio.pause(); audio.onended = null; }
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  setBtn(speakingBtn, false);
  speakingBtn = null;
}

function chunkText(clean, max) {
  const parts = clean.match(/[^.!?…:;]+[.!?…:;]*/g) || [clean];
  const chunks = [];
  let cur = '';
  for (const p of parts) { if ((cur + p).length > max && cur) { chunks.push(cur.trim()); cur = p; } else cur += p; }
  if (cur.trim()) chunks.push(cur.trim());
  return chunks;
}

async function fetchClip(text) {
  if (clipCache.has(text)) return clipCache.get(text);
  const r = await fetch('/api/tts', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ text }) });
  if (r.status === 503) { serverTTS = false; throw new Error('kapali'); }
  if (!r.ok) throw new Error('tts ' + r.status);
  const url = URL.createObjectURL(await r.blob());
  clipCache.set(text, url);
  if (clipCache.size > 60) { const [k, u] = clipCache.entries().next().value; URL.revokeObjectURL(u); clipCache.delete(k); }
  return url;
}

function playUrl(url, my) {
  return new Promise((resolve, reject) => {
    if (my !== speakToken) return resolve();
    audio.onended = () => resolve();
    audio.onerror = () => reject(new Error('oynatılamadı'));
    audio.src = url;
    audio.play().catch(reject);
  });
}

async function speakServer(chunks, my) {
  let next = fetchClip(chunks[0]);
  for (let i = 0; i < chunks.length; i++) {
    const url = await next;
    if (my !== speakToken) return;
    if (i + 1 < chunks.length) { next = fetchClip(chunks[i + 1]); next.catch(() => {}); }
    await playUrl(url, my);
  }
}

function speakBrowser(clean, my) {
  if (!('speechSynthesis' in window)) { toast('Bu tarayıcı sesli okumayı desteklemiyor'); stopSpeaking(); return; }
  const synth = window.speechSynthesis;
  const chunks = chunkText(clean, 220);
  const voice = trVoice();
  if (!voice && !warned) { warned = true; toast('Telefonunda Türkçe ses yoksa okuma aksanlı olabilir. iPhone: Ayarlar › Erişilebilirlik › Seslendirilen İçerik › Sesler › Türkçe', 5200); }
  let started = false;
  chunks.forEach((c, i) => {
    const u = new SpeechSynthesisUtterance(c);
    u.lang = 'tr-TR'; u.rate = 0.98;
    if (voice) u.voice = voice;
    u.onstart = () => { started = true; };
    if (i === chunks.length - 1) u.onend = () => { if (my === speakToken) stopSpeaking(); };
    u.onerror = () => { if (my === speakToken) stopSpeaking(); };
    synth.speak(u);
  });
  setTimeout(() => {
    if (my === speakToken && !started && !synth.speaking) { stopSpeaking(); toast('Ses çıkmadı: telefon sessiz modda olabilir.', 4200); }
  }, 1600);
}

export function speak(text, btn) {
  if (btn && speakingBtn === btn) { stopSpeaking(); return; }
  stopSpeaking();
  const my = ++speakToken;
  const clean = plain(text).replace(/[#*_`>|]/g, ' ').replace(/\s+/g, ' ').trim();
  if (!clean) return;
  speakingBtn = btn || null;
  setBtn(btn, true);
  if (serverTTS && audio) {
    // iOS: oynatma izni kullanıcının dokunuşunda alınmalı → önce sessiz bir ses çal
    audio.src = silentWav();
    audio.play().catch(() => {});
    speakServer(chunkText(clean, 420), my)
      .then(() => { if (my === speakToken) stopSpeaking(); })
      .catch(() => { if (my === speakToken) speakBrowser(clean, my); });
  } else speakBrowser(clean, my);
}

// ---------- hatalı soru bildirimi (yapay zekâ soruları) ----------
// Tek dokunuşla silinmez: hakem incelemesi yapılır, sonuç Özgür'e açıklanır.
const reported = new Set();
document.addEventListener('click', async (e) => {
  const b = e.target.closest('[data-report]');
  if (!b) return;
  const key = b.dataset.report;
  const reason = window.prompt('Bu soruda ne hatalı? (isteğe bağlı: ör. "B de doğru", "bilgi yanlış", "anlaşılmıyor")', '');
  if (reason === null) return;
  reported.add(key);
  const box = document.createElement('div');
  box.className = 'small muted';
  box.style.marginTop = '8px';
  box.innerHTML = '<span class="typing"><i></i><i></i><i></i></span> Hakem inceliyor (10-30 sn)…';
  b.replaceWith(box);
  try {
    const r = await fetch('/api/bank/report', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id: key, reason }) });
    const d = await r.json();
    if (!r.ok) throw new Error(d.error || 'olmadı');
    if (d.removed) store.update((s) => { if (s.wrong[key]) s.wrong[key].fixed = true; });
    box.className = 'note' + (d.removed ? '' : ' exam');
    box.innerHTML = `<div class="eyebrow">${d.removed ? 'Haklıydın: soru bankadan çıkarıldı' : `Hakem soruyu geçerli buldu (doğru: ${esc(d.answer || '')})`}</div>${esc(d.why || '')}`;
  } catch (err) {
    box.textContent = 'İnceleme şu an yapılamadı (bağlantı). Sonra tekrar dene.';
    reported.delete(key);
  }
});

// ---------- sorular ----------
// Şıkları karıştır: doğru cevap hep aynı harfte toplanmasın. Sayısal sıralı ve öncüllü (I, II…) şıklara dokunma.
export function prepQ(q) {
  if (!q || !Array.isArray(q.o)) return q;
  if (q.real) return { ...q }; // gerçek soruda şık sırası görüntüdeki gibi kalmalı
  const numeric = q.o.every((o) => /^[\s\d.,/−\-+%°:×]+(\s*(TL|lira|yıl|yaş|ay|gün|saat|dk|dakika|kg|km|m|cm|metre|kişi|tane|adet|derece|birim|birimkare))?$/i.test(String(o).trim()));
  const roman = q.o.some((o) => /^(Yalnız\s)?(I{1,3}|IV|V)(\s|$|,)/.test(String(o).trim()));
  const ordered = q.o.every((o) => /^[IVX]+$/.test(String(o).trim()));
  if (numeric || roman || ordered || q.fixed) return { ...q };
  const idx = q.o.map((_, i) => i);
  for (let i = idx.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
  return { ...q, o: idx.map((i) => q.o[i]), a: idx.indexOf(q.a), _map: idx };
}

// OCR/LaTeX artıklarını temizle: $...$, \frac{a}{b}, \cdot, satır sonu tireleri ("duy- gusal")
export function cleanQ(s) {
  let t = String(s == null ? '' : s);
  t = t.replace(/\\\(|\\\)|\$/g, '');
  for (let k = 0; k < 3; k++) t = t.replace(/\\frac\s*\{([^{}]*)\}\s*\{([^{}]*)\}/g, (m, a, b) => `${/^[\w,.]+$/.test(a) ? a : '(' + a + ')'}/${/^[\w,.]+$/.test(b) ? b : '(' + b + ')'}`);
  t = t.replace(/\\sqrt\s*\{([^{}]*)\}/g, '√($1)').replace(/\\(cdot|times)/g, '·').replace(/\\div/g, '÷').replace(/\\(left|right)\s*/g, '')
    .replace(/\\(le|leq)\b/g, '≤').replace(/\\(ge|geq)\b/g, '≥').replace(/\\neq\b/g, '≠').replace(/\\pi\b/g, 'π').replace(/\\%/g, '%')
    .replace(/\^\{([^{}]*)\}/g, '^$1').replace(/\\,|\\;|\\!|\\ /g, ' ').replace(/[⁣]/g, '');
  t = t.replace(/([a-zçğıöşü])- ([a-zçğıöşü])/g, '$1$2');
  const SUP = { 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹', '-': '⁻', n: 'ⁿ', x: 'ˣ' };
  t = t.replace(/\^(-?[0-9]+|[nx])/g, (m, e) => [...e].map((c) => SUP[c] || c).join(''));
  return t;
}

// Soru metnini parça (paragraf/öncüller) ve soru kökü olarak ayır
export function splitStem(raw) {
  let t = cleanQ(raw).replace(/\r/g, '').trim();
  // aynı satıra sıkışmış öncülleri ayır: "... I. xxx II. yyy III. zzz"
  if (/(^|\s)I\.\s/.test(t) && /\sII\.\s/.test(t)) t = t.replace(/\s+(?=(?:I{1,3}|IV|V)\.\s)/g, '\n');
  let lines = t.split('\n').map((x) => x.trim()).filter(Boolean);
  // son öncül soru köküyle birleşmişse ayır: "III. kentlerde ... azalması durumlarından hangileri ...?"
  const lr = lines[lines.length - 1] || '';
  if (/^(I{1,3}|IV|V)\.\s/.test(lr) && /\?\s*$/.test(lr)) {
    const m = lr.match(/^(.*?)\s+((?:\S+(?:larından|lerinden|lardan|lerden|dakilerden|daki)\s+)?(?:hangileri|hangisi)\b.*\?)\s*$/);
    if (m) lines = [...lines.slice(0, -1), m[1], m[2].charAt(0).toLocaleUpperCase('tr') + m[2].slice(1)];
  }
  let root = '', body = lines;
  const last = lines[lines.length - 1] || '';
  if (lines.length > 1 && /\?\s*$/.test(last)) { root = last; body = lines.slice(0, -1); }
  else if (lines.length && /\?\s*$/.test(last) && last.length > 160) {
    // tek satır: son soru cümlesini kök yap
    const m = last.match(/^(.*[.!…:”"'])\s+([^.!?…]*\?)\s*$/s);
    if (m && m[2].length < 260) { root = m[2]; body = [...lines.slice(0, -1), m[1]]; }
  }
  return { body, root };
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

function stemHTML(raw) {
  const { body, root } = splitStem(raw);
  const bodyHTML = qtext(body.join('\n'));
  if (!root) return `<div class="qstem">${bodyHTML}</div>`;
  return `<div class="qstem">${body.length ? `<div class="qpass">${bodyHTML}</div>` : ''}<div class="qroot">${inline(root)}</div></div>`;
}

// Tek soru: kök + şıklar + (cevaplandıysa) geri bildirim
function feedbackHTML(q, pick, guess) {
  const ok = pick === q.a;
  const rep = q.key && String(q.key).startsWith('ai:') ? (reported.has(q.key) ? '<div class="small muted" style="margin-top:8px">İnceleme istendi.</div>' : `<button class="chip" data-report="${esc(q.key)}" type="button" style="margin-top:10px;box-shadow:none">${icon.flag}<span>Soru hatalı mı? Bildir</span></button>`) : '';
  return `<div class="feedback ${ok ? 'ok' : 'no'}"><h3>${ok ? (guess ? 'Doğru, ama tahmindi' : 'Doğru!') : pick === -1 ? `Boş bıraktın · doğrusu ${LETTERS[q.a]}` : `Yanlış · doğrusu ${LETTERS[q.a]}`}</h3>${md(q.ex || '')}${q.tip ? `<div class="tip"><b>İpucu:</b> ${inline(q.tip)}</div>` : ''}${q.ai ? '<div class="small muted" style="margin-top:8px">Yapay zekâ yazdı, iki kez denetlendi.</div>' : ''}${rep}</div>`;
}

const guessLabel = (on) => on ? `${icon.check}<span>Tahmin olarak işaretli</span>` : `${icon.sparkQ}<span>Emin değilim (tahmin)</span>`;

export function questionHTML(q, pick, { head = '', guess = null, struck = [] } = {}) {
  // Gerçek ÖSYM sorusu: kitapçıktaki orijinal görüntü (altı çizili yerler, harita, grafik aynen)
  let h = head + (q.real ? `<div class="realtag">${icon.flag}<span>Gerçek ÖSYM sorusu · ${esc(q.src || '')}</span></div>` : '') + (q.real && q.img
    ? `<img class="qimg" src="${esc(q.img.includes('?') ? q.img : q.img + '?v=3')}" alt="${esc(String(q.q || '').slice(0, 200))}" decoding="async">`
    : stemHTML(q.q));
  if (q.viz) h += renderViz(q.viz);
  h += `<div class="opts" role="radiogroup">${q.o.map((o, j) => {
    const cls = pick == null ? (struck.includes(j) ? 'struck' : '') : j === q.a ? 'right' : j === pick ? 'wrong' : 'dim';
    const fill = pick != null && (j === q.a || j === pick) ? `filled ${j === q.a ? 'right' : 'wrong'}` : '';
    const label = q.real && q.img && (q.needimg || !o) ? `<span class="muted small">${o ? inline(cleanQ(o)) : 'Görseldeki ' + LETTERS[j] + ' şıkkı'}</span>` : `<span>${inline(cleanQ(o))}</span>`;
    return `<button class="opt ${cls}" data-opt="${j}" ${pick != null ? 'disabled' : ''} role="radio" aria-checked="${pick === j}"><span class="bubble ${fill}">${LETTERS[j]}</span>${label}</button>`;
  }).join('')}</div>`;
  if (pick == null) h += `<div class="guessrow"><span class="elim-hint">Şıkkı elemek için üstüne basılı tut</span></div>`;
  if (pick != null) h += feedbackHTML(q, pick, guess);
  return h;
}

// Cevap verilince soruyu yeniden çizmeden günceller (görsel yeniden yüklenmez, sayfa kaymaz)
export function markAnswered(root, q, pick, guess) {
  root.querySelectorAll('.opt[data-opt]').forEach((b) => {
    const j = Number(b.dataset.opt);
    b.disabled = true;
    b.classList.remove('struck', 'sel');
    b.classList.add(j === q.a ? 'right' : j === pick ? 'wrong' : 'dim');
    b.setAttribute('aria-checked', String(j === pick));
    if (j === q.a || j === pick) b.querySelector('.bubble')?.classList.add('filled', j === q.a ? 'right' : 'wrong');
  });
  root.querySelector('.guessrow')?.remove();
  root.querySelector('.feedback')?.remove();
  root.querySelector('.opts')?.insertAdjacentHTML('afterend', feedbackHTML(q, pick, guess));
}

// "Emin değilim" işareti: yeniden çizmeden aç/kapat
let guessHinted = false;
export function bindGuess(root, get, set) {
  const b = root.querySelector('[data-guess]');
  if (!b) return;
  b.onclick = (e) => {
    e.preventDefault();
    const on = !get();
    set(on);
    b.classList.toggle('on', on);
    b.innerHTML = guessLabel(on);
    if (on && !guessHinted) { guessHinted = true; toast('Bu cevap "tahmin" olarak kaydedilecek. Analiz, tahminlerinin ne kadar tuttuğunu ayrıca hesaplar.', 3600); }
  };
}

// Basılı tutunca şıkkın üstünü çiz (yeniden çizmeden). iPhone'da pointer olayları uzun basışta kesilebildiği için
// dokunmatikte touch olayları kullanılır; parmak 12 px'den fazla kayarsa (kaydırma) iptal olur.
export function bindStrike(root, struck) {
  const touch = 'ontouchstart' in window;
  root.querySelectorAll('.opt[data-opt]:not([disabled])').forEach((b) => {
    if (b._strike) return;
    b._strike = true;
    let t = null, fired = false, sx = 0, sy = 0;
    const toggle = () => {
      fired = true;
      const j = Number(b.dataset.opt);
      const i = struck.indexOf(j);
      if (i >= 0) struck.splice(i, 1); else struck.push(j);
      b.classList.toggle('struck', i < 0);
      if (navigator.vibrate) navigator.vibrate(12);
    };
    const start = (x, y) => { fired = false; sx = x; sy = y; clearTimeout(t); t = setTimeout(toggle, 420); };
    const move = (x, y) => { if (Math.abs(x - sx) > 12 || Math.abs(y - sy) > 12) clearTimeout(t); };
    const end = () => clearTimeout(t);
    if (touch) {
      b.addEventListener('touchstart', (e) => { const p = e.touches[0]; start(p.clientX, p.clientY); }, { passive: true });
      b.addEventListener('touchmove', (e) => { const p = e.touches[0]; move(p.clientX, p.clientY); }, { passive: true });
      b.addEventListener('touchend', (e) => { end(); if (fired) e.preventDefault(); });
      b.addEventListener('touchcancel', end);
    } else {
      b.addEventListener('pointerdown', (e) => start(e.clientX, e.clientY));
      b.addEventListener('pointermove', (e) => move(e.clientX, e.clientY));
      ['pointerup', 'pointerleave', 'pointercancel'].forEach((ev) => b.addEventListener(ev, end));
    }
    b.addEventListener('contextmenu', (e) => e.preventDefault());
    b.addEventListener('click', (e) => { if (fired) { fired = false; e.stopImmediatePropagation(); e.preventDefault(); } }, true);
  });
}

// Aktif süre saati: uygulama görünürken ve son 60 sn içinde dokunma/kaydırma varken ilerler.
// Soru süreleri bununla ölçülür: telefonu bırakıp gidersen süre işlemez.
let activeSec = 0, lastInput = Date.now();
['pointerdown', 'keydown', 'touchstart', 'wheel'].forEach((ev) => window.addEventListener(ev, () => { lastInput = Date.now(); }, { passive: true, capture: true }));
window.addEventListener('scroll', () => { lastInput = Date.now(); }, { passive: true, capture: true });
setInterval(() => { if (document.visibilityState === 'visible' && Date.now() - lastInput < 60000) activeSec++; }, 1000);
export const activeNow = () => activeSec;
export const activeSince = (t) => (t == null ? undefined : Math.min(600, activeSec - t));

export { esc, inline, md, renderViz };
