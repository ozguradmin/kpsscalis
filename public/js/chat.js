// Yapay zekâ hoca: tam ekran sohbet. Cevaplar akış hâlinde gelir; hoca araç kullanır
// (ders notları, Vikipedi, test, görsel, kart) ve sohbet içine etkileşimli bloklar koyar.
import { marked } from '../vendor/marked.esm.js';
import DOMPurify from '../vendor/purify.es.mjs';
import { esc, inline, renderViz } from './viz.js';
import { SUBJECT, LESSONS } from './plan.js';
import { store, logAnswer, startTimer, qLen } from './store.js';
import { icon } from './icons.js';
import { questionHTML, bindStrike, bindGuess, markAnswered, activeNow, prepQ, LETTERS, toast, speak, stopSpeaking, plain } from './ui.js';
import { buildProfile } from './profile.js';

marked.setOptions({ gfm: true, breaks: true });
const HKEY = 'kpss-ozgur-chat2'; // { konu: mesajlar }: sekmedeki hoca ile her soru/ekrandaki hoca ayrı sohbettir
const MAX_KEEP = 40;
let mode = 'fast';
let busy = false;
let thread = 'tab';
let hist = loadHistory(); // [{ role, parts:[{t:'text',v}|{t:'block',b}], ctx?, hidden? }]

function allThreads() { try { return JSON.parse(localStorage.getItem(HKEY) || '{}'); } catch (e) { return {}; } }
function loadHistory() {
  const t = allThreads()[thread];
  return Array.isArray(t && t.m) ? t.m : [];
}
function saveHistory() {
  try {
    const all = allThreads();
    all[thread] = { at: Date.now(), m: hist.slice(-MAX_KEEP) };
    const keys = Object.keys(all).filter((k) => k !== 'tab').sort((a, b) => all[b].at - all[a].at);
    keys.slice(25).forEach((k) => delete all[k]); // en eski soru sohbetlerini at
    localStorage.setItem(HKEY, JSON.stringify(all));
  } catch (e) { /* dolu olabilir */ }
}

export function renderMarkdown(text) {
  const clean = String(text || '').replace(/<think>[\s\S]*?(<\/think>|$)/g, '');
  const html = DOMPurify.sanitize(marked.parse(clean), { USE_PROFILES: { html: true }, FORBID_TAGS: ['style', 'img', 'iframe', 'form', 'input'], FORBID_ATTR: ['style'] });
  // Tabloları kaydırılabilir yap, linkleri yeni sekmede aç
  return html.replace(/<a /g, '<a target="_blank" rel="noopener" ');
}

// Sunucuya giden metin: bloklar kısa bir açıklamayla temsil edilir
function toServerText(m) {
  return m.parts.map((p) => {
    if (p.t === 'text') return p.v;
    const b = p.b;
    if (b.type === 'quiz') return `[Ekranda "${b.title}" başlıklı ${b.questions.length} soruluk test gösterildi${b.state && b.state.done ? '; Özgür çözdü' : ''}]`;
    if (b.type === 'viz') return `[Görsel gösterildi: ${b.title || b.viz.type}]`;
    if (b.type === 'card') return `[Tekrar destesine kart eklendi: ${b.f}]`;
    if (b.type === 'result') return b.text;
    return '';
  }).join('\n').trim();
}

// ---------- bağlam ----------
function ctxLabel(ctx) {
  if (!ctx) return '';
  const l = ctx.lessonId && LESSONS[ctx.lessonId];
  return [l ? `${SUBJECT[l.s]?.name || 'Ekstra'} · ${plain(l.title)}` : '', ctx.step || ''].filter(Boolean).join(' · ');
}

// ---------- blok çizimi ----------
function blockHTML(b, mi, pi) {
  if (b.type === 'viz') return `<div class="block"><div class="bh"><span class="eyebrow">${esc(b.title || 'Görsel')}</span></div><div class="bb">${renderViz(b.viz)}</div></div>`;
  if (b.type === 'card') return `<div class="block"><div class="bh"><span class="eyebrow">Tekrar destene eklendi</span>${icon.cards}</div><div class="bb"><b>${inline(b.f)}</b><div class="small muted" style="margin-top:4px">${inline(b.b)}</div></div></div>`;
  if (b.type === 'result') return `<div class="block"><div class="bh"><span class="eyebrow">Test sonucun</span></div><div class="bb"><div class="row" style="gap:18px"><div><div style="font:800 34px var(--display)" class="num">${esc(b.net)}</div><div class="small muted">net</div></div><div class="small">${esc(b.line)}</div></div></div></div>`;
  if (b.type === 'quiz') return quizBlockHTML(b, mi, pi);
  return '';
}

function quizBlockHTML(b, mi, pi) {
  const st = (b.state ||= { i: 0, answers: {}, guess: {}, done: false });
  const n = b.questions.length;
  const dots = quizDots(b);
  if (st.done) {
    const d = b.questions.filter((q, j) => st.answers[j] === q.a).length;
    const y = b.questions.filter((q, j) => st.answers[j] != null && st.answers[j] !== -1 && st.answers[j] !== q.a).length;
    return `<div class="block" data-block="${mi}:${pi}"><div class="bh"><span class="eyebrow">${esc(b.title)}</span>${dots}</div>
      <div class="bb"><div class="row" style="gap:16px"><div><div style="font:800 34px var(--display)" class="num">${d}/${n}</div><div class="small muted">doğru</div></div>
      <div class="small">${y} yanlış · ${n - d - y} boş · net <b>${(d - y / 4).toFixed(2).replace('.', ',')}</b></div></div></div>
      <div class="bf"><button class="btn ghost sm" data-review>Soruları gözden geçir</button></div></div>`;
  }
  const q = b.questions[st.i];
  const pick = st.answers[st.i];
  return `<div class="block" data-block="${mi}:${pi}"><div class="bh"><span class="eyebrow">${esc(b.title)} · ${st.i + 1}/${n}</span>${dots}</div>
    <div class="bb">${questionHTML(q, pick, { guess: pick == null ? !!st.guess[st.i] : st.guess[st.i], struck: st.struck || [] })}</div>
    ${quizFoot(b)}</div>`;
}
function quizDots(b) {
  const st = b.state;
  return `<div class="qnav">${b.questions.map((q, j) => `<i class="${j === st.i && !st.done ? 'cur' : st.answers[j] == null ? '' : st.answers[j] === q.a ? 'ok' : 'no'}"></i>`).join('')}</div>`;
}
function quizFoot(b) {
  const st = b.state, n = b.questions.length, pick = st.answers[st.i];
  return `<div class="bf"><button class="btn ghost sm" data-qprev ${st.i ? '' : 'disabled'}>${icon.back}Önceki</button>
    ${pick == null ? `<button class="btn ghost sm" data-qblank>Boş bırak</button>` : st.i < n - 1 ? `<button class="btn sm" data-qnext>Sonraki${icon.fwd}</button>` : `<button class="btn ink sm" data-qfinish>Bitir ve analiz et</button>`}</div>`;
}

// ---------- ana bileşen ----------
// container: içine tam ekran sohbet görünümü çizilir. opts.onClose varsa kapatma düğmesi gösterilir.
export function mountChat(container, ctx = {}, opts = {}) {
  let context = ctx.lessonId || ctx.question || ctx.screen ? ctx : null;
  thread = opts.thread || 'tab';
  hist = loadHistory();
  const stopTimer = startTimer('hoca'); // hocayla geçen süre de çalışma süresidir
  const obs = new MutationObserver(() => { if (!container.isConnected || !container.querySelector('#log')) { stopTimer(); obs.disconnect(); } });
  obs.observe(document.body, { childList: true, subtree: true });
  container.innerHTML = `<div class="view ${opts.withTabs ? 'with-tabs chatview' : ''}">
    <header class="topbar line">
      ${opts.onClose ? `<button class="iconbtn" data-close aria-label="Kapat">${icon.close}</button>` : `<span class="ico ink">${icon.ai}</span>`}
      <div class="ttl"><span class="eyebrow">Yapay zekâ hoca</span><b>Hoca</b></div>
      <div class="seg" id="mode" role="tablist" aria-label="Cevap modu"><button data-m="fast" class="${mode === 'fast' ? 'on' : ''}">Hızlı</button><button data-m="deep" class="${mode === 'deep' ? 'on' : ''}">Derin</button></div>
      <button class="chip" data-new aria-label="Sohbeti sıfırla" style="box-shadow:none">${icon.refresh}<span>Sıfırla</span></button>
    </header>
    <div class="scroll" id="log-sc"><div class="chatlog" id="log"></div></div>
    <div class="composer">
      <div id="ctxbar"></div>
      <div class="chips scroll-x" id="sugg"></div>
      <form id="cf"><textarea id="ci" rows="1" placeholder="Hocaya yaz…" aria-label="Mesajın" enterkeyhint="send"></textarea><button class="send" aria-label="Gönder">${icon.send}</button></form>
    </div></div>`;
  const log = container.querySelector('#log');
  const sc = container.querySelector('#log-sc');
  const input = container.querySelector('#ci');
  const sendBtn = container.querySelector('.send');
  const atBottom = () => sc.scrollHeight - sc.scrollTop - sc.clientHeight < 80;
  const toBottom = (force) => { if (force || atBottom()) sc.scrollTop = sc.scrollHeight; };

  if (opts.onClose) container.querySelector('[data-close]').onclick = () => { stopSpeaking(); opts.onClose(); };
  container.querySelectorAll('#mode button').forEach((b) => b.onclick = () => { mode = b.dataset.m; container.querySelectorAll('#mode button').forEach((x) => x.classList.toggle('on', x === b)); toast(mode === 'deep' ? 'Derin mod: daha dikkatli ama daha yavaş (20-40 sn)' : 'Hızlı mod'); });
  container.querySelector('[data-new]').onclick = () => { if (busy) return; if (hist.length && !confirm('Bu sohbet silinsin mi? (Diğer sohbetler etkilenmez.)')) return; hist = []; saveHistory(); draw(); drawSugg(); toast('Sohbet sıfırlandı'); };

  function drawCtx() {
    const bar = container.querySelector('#ctxbar');
    // Hoca bu ekranı/soruyu görüyor. Çarpı: ekranı unutsun, genel konuş (yanlışlıkla kapatılırsa sohbet açıkken geri gelmez)
    bar.innerHTML = context ? `<div class="ctxbar">${icon.eye}<span style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">Görüyorum: ${esc(ctxLabel(context))}</span><button class="ctxx" data-unctx aria-label="Hoca bu ekranı dikkate almasın">${icon.close}</button></div>` : '';
    const u = bar.querySelector('[data-unctx]');
    if (u) u.onclick = () => { context = null; drawCtx(); drawSugg(); toast('Hoca artık bu ekranı dikkate almıyor; genel soru sorabilirsin.'); };
  }

  function drawSugg() {
    const list = context && context.question
      ? ['Bu soruyu adım adım çöz', 'Yanlış şıklar neden yanlış?', 'Buna benzer 3 soruluk test yap', 'Bunu nasıl akılda tutarım?']
      : context
        ? ['Bunu daha basit anlat', 'Günlük hayattan örnek ver', 'Bir kodlama öner', 'Bu konudan 5 soruluk test yap']
        : hist.length
          ? ['Devam et', 'Bunu tabloyla göster', 'Bana test yap']
          : ['Bugün neye çalışmalıyım?', 'Çalıştığım konulardan 5 soruluk test yap', 'Yanlışlarımı analiz et', 'Cumhurbaşkanının yetkilerini sınava göre özetle', 'Kurtuluş Savaşı cephelerini zaman çizgisiyle anlat', 'Paragraf sorularında hız taktiği'];
    const box = container.querySelector('#sugg');
    box.innerHTML = list.map((s) => `<button class="chip" type="button">${esc(s)}</button>`).join('');
    box.querySelectorAll('.chip').forEach((b) => b.onclick = () => send(b.textContent));
  }

  function msgHTML(m, mi) {
    if (m.hidden) return '';
    if (m.role === 'user') {
      const res = m.parts.find((p) => p.t === 'block' && p.b.type === 'result');
      if (res) return `<div class="msg bot">${blockHTML(res.b)}</div>`;
      return `<div class="msg me">${esc(m.parts.map((p) => p.v || '').join('')).replace(/\n/g, '<br>')}</div>`;
    }
    const body = m.parts.map((p, pi) => p.t === 'text' ? `<div class="md">${renderMarkdown(p.v)}</div>` : blockHTML(p.b, mi, pi)).join('');
    const srcs = m.sources && m.sources.length ? `<div class="sources">${m.sources.slice(0, 6).map((s) => s.u ? `<a href="${esc(s.u)}" target="_blank" rel="noopener">${esc(s.t)}</a>` : `<span>${esc(s.t)}</span>`).join('')}</div>` : '';
    const tools = m.parts.some((p) => p.t === 'text' && p.v.trim()) ? `<div class="row" style="gap:6px;margin-top:6px"><button class="iconbtn" style="width:34px;height:34px;border-radius:10px;box-shadow:none" data-speak="${mi}" aria-label="Sesli oku">${icon.speak}</button></div>` : '';
    return `<div class="msg bot"><div class="bubble-ai"><span class="avatar">${icon.ai}</span><div class="content">${body}${m.status ? `<div class="status"><span class="spin"></span>${esc(m.status)}</div>` : ''}${m.error ? `<div class="feedback no" style="margin-top:8px"><b>Olmadı:</b> ${esc(m.error)}<div style="margin-top:8px"><button class="btn ghost sm" data-retry>${icon.refresh}Tekrar dene</button></div></div>` : ''}${srcs}${!m.streaming ? tools : ''}</div></div></div>`;
  }

  function draw() {
    const welcome = `<div class="msg bot"><div class="bubble-ai"><span class="avatar">${icon.ai}</span><div class="content md"><p>Merhaba Özgür! ${context ? `Şu an <b>${esc(ctxLabel(context))}</b> ekranına bakıyorsun; onu görüyorum, direkt sorabilirsin.` : 'Konu anlatırım, soru çözerim, istersen burada <b>test</b> yaparım ve sonucunu analiz ederim. Çalıştığın dersleri ve yanlışlarını biliyorum.'}</p></div></div></div>`;
    const vis = hist.filter((m) => !m.hidden);
    log.innerHTML = vis.length ? hist.map(msgHTML).join('') : welcome;
    bindBlocks();
    toBottom(true);
  }

  function redrawMsg(mi) {
    const nodes = [...log.children];
    const idx = hist.slice(0, mi).filter((m) => !m.hidden).length;
    const node = nodes[idx];
    const html = msgHTML(hist[mi], mi);
    if (node) { const t = document.createElement('div'); t.innerHTML = html; node.replaceWith(t.firstElementChild || t); }
    else log.insertAdjacentHTML('beforeend', html);
    bindBlocks();
  }

  function bindBlocks() {
    log.querySelectorAll('[data-speak]').forEach((b) => b.onclick = () => {
      const m = hist[Number(b.dataset.speak)];
      speak(m.parts.filter((p) => p.t === 'text').map((p) => p.v).join('\n'), b);
    });
    log.querySelectorAll('[data-retry]').forEach((b) => b.onclick = () => {
      const lastUser = [...hist].reverse().find((m) => m.role === 'user');
      if (!lastUser) return;
      while (hist.length && hist[hist.length - 1] !== lastUser) hist.pop();
      hist.pop();
      send(lastUser.parts.map((p) => p.v || '').join(''), { hidden: lastUser.hidden, ctx: lastUser.ctx });
    });
    log.querySelectorAll('[data-block]').forEach((el) => {
      const [mi, pi] = el.dataset.block.split(':').map(Number);
      const b = hist[mi].parts[pi].b;
      const st = b.state;
      const q = b.questions[st.i];
      if (!st.done) { st.seen ||= {}; if (st.seen[st.i] == null) st.seen[st.i] = activeNow(); }
      const redraw = () => { saveHistory(); const y = sc.scrollTop; redrawMsg(mi); sc.scrollTop = y; };
      // cevap: soruyu yeniden çizme; şıklar, geri bildirim, noktalar ve alt düğmeler yerinde güncellenir
      const answered = (pick) => {
        markAnswered(el.querySelector('.bb'), b.questions[st.i], pick, st.guess[st.i]);
        el.querySelector('.qnav').outerHTML = quizDots(b);
        el.querySelector('.bf').outerHTML = quizFoot(b);
        bindFoot();
        saveHistory();
        requestAnimationFrame(() => el.querySelector('.feedback')?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }));
      };
      el.querySelectorAll('[data-opt]').forEach((o) => o.onclick = () => {
        if (st.answers[st.i] != null) return;
        const pick = Number(o.dataset.opt);
        st.answers[st.i] = pick;
        st.struck = [];
        record(b, st.i, pick);
        answered(pick);
      });
      if (!st.done && st.answers[st.i] == null) bindStrike(el, (st.struck ||= []));
      bindGuess(el, () => !!st.guess[st.i], (v) => { st.guess[st.i] = v; saveHistory(); });
      const bindFoot = () => {
        const on = (sel, fn) => { const x = el.querySelector(sel); if (x) x.onclick = fn; };
        on('[data-qprev]', () => { st.i = Math.max(0, st.i - 1); st.struck = []; redraw(); });
        on('[data-qnext]', () => { st.i = Math.min(b.questions.length - 1, st.i + 1); st.struck = []; redraw(); });
        on('[data-qblank]', () => { st.answers[st.i] = -1; record(b, st.i, -1); answered(-1); });
        on('[data-qfinish]', () => finishQuiz(b, mi));
        on('[data-review]', () => { st.done = false; st.i = 0; redraw(); });
      };
      bindFoot();
      void q;
    });
  }

  function record(b, i, pick) {
    const q = b.questions[i];
    const ok = pick === -1 ? -1 : pick === q.a ? 1 : 0;
    const key = q.key || null;
    const orig = pick >= 0 && q._map ? q._map[pick] : pick;
    const t0 = b.state.seen && b.state.seen[i];
    const secs = t0 != null ? Math.min(600, activeNow() - t0) : undefined;
    logAnswer({ k: key, l: q.l || null, s: LESSONS[q.l]?.s || null, ok, p: orig, src: 'hoca', g: b.state.guess[i] ? 1 : 0, sec: secs, len: qLen(q) });
    if (key) store.update((s) => {
      if (ok !== 1) {
        s.wrong[key] = { at: Date.now(), fixed: false };
        if (key.startsWith('ai:') || key.startsWith('real:')) { (s.qbank ||= {})[key] = { q: q.q, o: q._orig || q.o, a: q._origA ?? q.a, ex: q.ex, tip: q.tip, l: q.l, img: q.img, real: q.real, needimg: q.needimg, src: q.src }; }
      } else if (s.wrong[key]) s.wrong[key].fixed = true;
    });
  }

  function finishQuiz(b, mi) {
    const st = b.state;
    b.questions.forEach((q, j) => { if (st.answers[j] == null) { st.answers[j] = -1; record(b, j, -1); } });
    st.done = true;
    saveHistory();
    redrawMsg(mi);
    const d = b.questions.filter((q, j) => st.answers[j] === q.a).length;
    const y = b.questions.filter((q, j) => st.answers[j] !== -1 && st.answers[j] !== q.a).length;
    const n = b.questions.length;
    const detail = b.questions.map((q, j) => {
      const a = st.answers[j];
      const l = LESSONS[q.l];
      return `Soru ${j + 1}${l ? ` (${q.l} · ${plain(l.title)})` : ''}: ${a === -1 ? 'BOŞ' : a === q.a ? 'DOĞRU' : 'YANLIŞ'}${st.guess[j] ? ' [tahmin]' : ''}\n${plain(q.q).slice(0, 400)}\nŞıklar: ${q.o.map((o, k) => `${LETTERS[k]}) ${plain(o)}`).join(' | ')}\nÖzgür: ${a === -1 ? '-' : LETTERS[a]} · Doğru: ${LETTERS[q.a]}`;
    }).join('\n\n');
    const text = `[TEST SONUCU] "${b.title}": ${d} doğru, ${y} yanlış, ${n - d - y} boş (net ${(d - y / 4).toFixed(2)}).\n\n${detail}\n\nSonucumu analiz et.`;
    send(text, { resultBlock: { type: 'result', net: (d - y / 4).toFixed(2).replace('.', ','), line: `${d} doğru · ${y} yanlış · ${n - d - y} boş — analiz ediyorum…`, text } });
  }

  async function send(text, o = {}) {
    text = (text || '').trim();
    if (!text || busy) return;
    busy = true;
    sendBtn.disabled = true;
    input.value = ''; input.style.height = '';
    const userMsg = { role: 'user', parts: o.resultBlock ? [{ t: 'block', b: o.resultBlock }] : [{ t: 'text', v: text }], ctx: o.ctx || context || undefined, hidden: o.hidden };
    hist.push(userMsg);
    const bot = { role: 'assistant', parts: [], status: 'Düşünüyorum…', streaming: true, sources: [] };
    hist.push(bot);
    const mi = hist.length - 1;
    draw();
    container.querySelector('#sugg').innerHTML = '';
    let raf = 0;
    const schedule = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; redrawMsg(mi); toBottom(); }); };
    const curText = () => { let p = bot.parts[bot.parts.length - 1]; if (!p || p.t !== 'text') { p = { t: 'text', v: '' }; bot.parts.push(p); } return p; };
    try {
      const msgs = hist.slice(0, -1).slice(-16).map((m) => ({ role: m.role, content: m.role === 'user' && m.parts[0]?.b?.type === 'result' ? m.parts[0].b.text : toServerText(m) })).filter((m) => m.content);
      const res = await fetch('/api/chat', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ messages: msgs, context: userMsg.ctx || null, mode, profile: buildProfile() }),
      });
      if (!res.ok || !res.body) {
        let msg = 'Hoca şu an cevap veremiyor.';
        try { msg = (await res.json()).error || msg; } catch (e) { /* yoksay */ }
        throw new Error(msg);
      }
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let buf = '';
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        let idx;
        while ((idx = buf.indexOf('\n\n')) >= 0) {
          const chunk = buf.slice(0, idx).trim();
          buf = buf.slice(idx + 2);
          if (!chunk.startsWith('data:')) continue;
          let ev; try { ev = JSON.parse(chunk.slice(5)); } catch (e) { continue; }
          if (ev.status) { bot.status = ev.status; schedule(); }
          if (ev.sources) { bot.sources.push(...ev.sources.filter((s) => !bot.sources.some((x) => x.t === s.t))); }
          if (ev.block) {
            const b = ev.block;
            if (b.type === 'quiz') b.questions = b.questions.map((q) => { const p = prepQ(q); p._orig = q.o; p._origA = q.a; return p; });
            if (b.type === 'card') addCustomCard(b.f, b.b);
            bot.parts.push({ t: 'block', b });
            bot.status = 'Yazıyorum…';
            schedule();
          }
          if (ev.t) { curText().v += ev.t; bot.status = ''; schedule(); }
          if (ev.error) throw new Error(ev.error);
        }
      }
      bot.status = '';
      bot.streaming = false;
      if (!bot.parts.length) throw new Error('Boş cevap geldi.');
    } catch (e) {
      bot.status = '';
      bot.streaming = false;
      bot.error = /Failed to fetch|NetworkError|Load failed/i.test(e.message) ? 'İnternet bağlantısı yok gibi. Bağlanınca tekrar dene; uygulamanın geri kalanı internetsiz çalışır.' : e.message;
    } finally {
      cancelAnimationFrame(raf);
      busy = false;
      sendBtn.disabled = false;
      saveHistory();
      redrawMsg(mi);
      toBottom();
      drawSugg();
    }
  }

  container.querySelector('#cf').onsubmit = (e) => { e.preventDefault(); send(input.value); };
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey && !('ontouchstart' in window)) { e.preventDefault(); send(input.value); } });
  input.addEventListener('input', () => { input.style.height = 'auto'; input.style.height = Math.min(140, input.scrollHeight) + 'px'; });

  drawCtx();
  draw();
  drawSugg();
  if (ctx.prompt) send(ctx.prompt);
  return { send };
}

function addCustomCard(f, b) {
  let h = 0; for (const c of f) h = (h * 31 + c.charCodeAt(0)) | 0;
  const id = `c:${(h >>> 0).toString(36)}`;
  store.update((s) => {
    (s.custom ||= {})[id] = { f, b, at: Date.now() };
    if (!s.cards[id]) s.cards[id] = { box: 0, due: Date.now(), seen: 0 };
  });
}

// Ders ekranındaki köşe düğmesinden açılan tam ekran hoca
export function openChat(ctx = {}) {
  const root = document.getElementById('sheet-root');
  root.innerHTML = '<div class="overlay" role="dialog" aria-modal="true" aria-label="Hoca ile sohbet"></div>';
  const ov = root.firstElementChild;
  let pushed = false;
  const onKey = (e) => { if (e.key === 'Escape') close(); };
  const doClose = () => {
    document.removeEventListener('keydown', onKey);
    window.removeEventListener('popstate', onPop);
    stopSpeaking();
    ov.classList.add('closing');
    setTimeout(() => { if (root.firstElementChild === ov) root.innerHTML = ''; }, 190);
  };
  // Telefonun geri hareketi sohbeti kapatsın (dersten çıkarmasın)
  const onPop = () => { pushed = false; doClose(); };
  const close = () => { if (pushed) window.history.back(); else doClose(); };
  document.addEventListener('keydown', onKey);
  // Her soru/ekran kendi sohbetini açar; aynı soruya dönünce o sohbet kaldığı yerden sürer
  const seed = ctx.prompt ? `p${Date.now()}` : `${ctx.lessonId || ''}|${ctx.step || ''}|${String(ctx.question || ctx.screen || '').slice(0, 120)}`;
  let h = 0; for (const c of seed) h = (h * 31 + c.charCodeAt(0)) | 0;
  mountChat(ov, ctx, { onClose: close, thread: 'q' + (h >>> 0).toString(36) });
  try { window.history.pushState({ chat: 1 }, ''); pushed = true; window.addEventListener('popstate', onPop); } catch (e) { pushed = false; }
}
