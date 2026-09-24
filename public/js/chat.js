// Yapay zekâ hoca: alttan açılan sohbet paneli. Cevaplar akış hâlinde gelir.
import { esc, inline } from './viz.js';
import { SUBJECT, SUBJECTS, LESSONS, STUDY_DAYS } from './plan.js';
import { store, todayKey } from './store.js';

const history = []; // bu oturumdaki konuşma
let mode = 'fast';
let busy = false;

const strip = (s) => String(s || '').replace(/\*\*|==/g, '');

function progressSummary() {
  // Hoca'nın Özgür'ün durumunu bilmesi için kısa bir özet
  const st = store.get();
  const k = todayKey();
  const idx = STUDY_DAYS.indexOf(k);
  const lines = [];
  lines.push(`Bugün: ${k}${idx >= 0 ? ` (${idx + 1}. çalışma günü, 9 günden)` : ''}.`);
  const minutes = Math.round(Object.values(st.days || {}).reduce((a, b) => a + b, 0) / 60);
  lines.push(`Toplam çalışma: ${minutes} dk.`);
  for (const sub of SUBJECTS) {
    const ls = Object.values(LESSONS).filter((l) => l.s === sub.id && l.day);
    const done = ls.filter((l) => st.lessons[l.id]?.done);
    const right = done.reduce((a, l) => a + (st.lessons[l.id].score || 0), 0);
    const tot = done.reduce((a, l) => a + (st.lessons[l.id].total || 0), 0);
    const next = ls.sort((a, b) => a.day - b.day).find((l) => !st.lessons[l.id]?.done);
    lines.push(`${sub.name}: ${done.length}/${ls.length} ders bitti${tot ? `, doğru oranı %${Math.round((right / tot) * 100)}` : ''}${next ? `; sıradaki: ${next.day}. gün “${next.title}”` : ''}.`);
  }
  const wrong = Object.values(st.wrong || {}).filter((w) => !w.fixed).length;
  lines.push(`Hata defterinde ${wrong} çözülmemiş soru var.`);
  return lines.join('\n');
}

export function lessonSummary(lesson) {
  if (!lesson) return '';
  const out = [];
  for (const c of lesson.cards || []) {
    if (c.h) out.push(`# ${strip(c.h)}`);
    if (c.b) out.push(strip(c.b));
    if (c.mn) out.push(`Kodlama: ${c.mn.code} — ${strip(c.mn.t)}`);
    if (c.note) out.push(`Not: ${strip(c.note.t)}`);
    if (c.steps) out.push(c.steps.map((s) => strip([s.t, s.m].filter(Boolean).join(' '))).join('\n'));
    const vizs = c.vizs || (c.viz ? [c.viz] : []);
    for (const v of vizs) {
      if (v.type === 'timeline') out.push(v.items.map((i) => `${i.y}: ${strip(i.t)}${i.d ? ' (' + strip(i.d) + ')' : ''}`).join('\n'));
      if (v.type === 'table') out.push([v.head, ...v.rows].filter(Boolean).map((r) => r.map(strip).join(' | ')).join('\n'));
      if (v.type === 'mnemonic') out.push(v.lines.map(([l, t]) => `${l}: ${strip(t)}`).join('\n'));
      if (v.type === 'compare') out.push(v.cols.map((c2) => `${strip(c2.h)}: ${c2.items.map(strip).join('; ')}`).join('\n'));
      if (v.type === 'flow') out.push(v.items.map(strip).join(' → '));
      if (v.type === 'cards') out.push(v.items.map(([h, t]) => `${strip(h)}: ${strip(t)}`).join('\n'));
      if (v.type === 'map' && v.groups) out.push(v.groups.map((g) => `${strip(g.label || '')}: ${g.iller.join(', ')}`).join('\n'));
    }
  }
  return out.join('\n').slice(0, 7000);
}

function mdLite(text) {
  // Model çıktısı için güvenli, basit markdown
  const lines = esc(text).split('\n');
  let html = '', list = null;
  const close = () => { if (list) { html += `</${list}>`; list = null; } };
  for (let ln of lines) {
    const ul = ln.match(/^\s*[-*•]\s+(.*)/);
    const ol = ln.match(/^\s*\d+[.)]\s+(.*)/);
    const hd = ln.match(/^\s*#{1,4}\s+(.*)/);
    if (ul) { if (list !== 'ul') { close(); html += '<ul>'; list = 'ul'; } html += `<li>${fmt(ul[1])}</li>`; continue; }
    if (ol) { if (list !== 'ol') { close(); html += '<ol>'; list = 'ol'; } html += `<li>${fmt(ol[1])}</li>`; continue; }
    close();
    if (hd) { html += `<h4>${fmt(hd[1])}</h4>`; continue; }
    if (ln.trim()) html += `<p>${fmt(ln)}</p>`;
  }
  close();
  return html;
}
const fmt = (s) => s.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/`([^`]+)`/g, '<code>$1</code>').replace(/(^|\s)\*(\S.*?\S|\S)\*(?=\s|$|[.,;:!?])/g, '$1<i>$2</i>');

export function openChat(ctx = {}) {
  const root = document.getElementById('sheet-root');
  const lesson = ctx.lesson || null;
  const subject = lesson ? (SUBJECT[lesson.s]?.name || '') : '';
  root.innerHTML = `<div class="sheet-backdrop" data-close></div>
    <section class="bsheet" role="dialog" aria-modal="true" aria-label="Hoca ile sohbet">
      <div class="grab"></div>
      <header class="row between">
        <div><div class="eyebrow">Yapay zekâ hoca</div><b style="font-size:15px">${lesson ? esc(subject + ' · ' + lesson.title) : 'Genel soru'}</b></div>
        <div class="row" style="gap:8px"><div class="seg" id="mode"><button data-m="fast" class="${mode === 'fast' ? 'on' : ''}">Hızlı</button><button data-m="deep" class="${mode === 'deep' ? 'on' : ''}">Derin</button></div>
        <button class="iconbtn" data-close aria-label="Kapat"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>
      </header>
      <div class="chatlog" id="log"></div>
      <div class="composer">
        <div class="chips scroll" id="sugg" style="margin-bottom:8px"></div>
        <form id="cf"><textarea id="ci" rows="1" placeholder="Sorunu yaz…" aria-label="Sorun"></textarea><button class="btn" style="min-height:46px;padding:0 16px" aria-label="Gönder">Sor</button></form>
      </div>
    </section>`;
  const log = root.querySelector('#log');
  const input = root.querySelector('#ci');
  const close = () => { root.innerHTML = ''; document.removeEventListener('keydown', onKey); };
  const onKey = (e) => { if (e.key === 'Escape') close(); };
  document.addEventListener('keydown', onKey);
  root.querySelectorAll('[data-close]').forEach((b) => b.onclick = close);
  root.querySelectorAll('#mode button').forEach((b) => b.onclick = () => { mode = b.dataset.m; root.querySelectorAll('#mode button').forEach((x) => x.classList.toggle('on', x === b)); });

  const suggestions = ctx.question
    ? ['Bu soruyu adım adım çöz', 'Yanlış şıklar neden yanlış?', 'Buna benzer bir soru sor', 'Bunu nasıl ezberlerim?']
    : lesson
      ? ['Bunu daha basit anlat', 'Günlük hayattan örnek ver', 'Bir kodlama öner', 'Bana 3 soru sor']
      : ['Bugün neye çalışmalıyım?', 'Paragraf sorularında hız taktiği', 'Matematikte hangi soruları çözmeliyim?'];
  root.querySelector('#sugg').innerHTML = suggestions.map((s) => `<button class="chip" type="button">${esc(s)}</button>`).join('');
  root.querySelectorAll('#sugg .chip').forEach((b) => b.onclick = () => send(b.textContent));

  const drawHistory = () => {
    log.innerHTML = history.length ? history.map((m) => `<div class="msg ${m.role === 'user' ? 'me' : 'bot'}">${m.role === 'user' ? esc(m.content).replace(/\n/g, '<br>') : mdLite(m.content)}</div>`).join('')
      : `<div class="msg bot"><p>Merhaba Özgür! ${lesson ? `Şu an <b>${esc(lesson.title)}</b> dersindesin.` : ''} ${ctx.question ? 'Baktığın soruyu gördüm. Ne sormak istersin?' : 'Takıldığın yeri yaz; en basit hâliyle anlatayım.'}</p></div>`;
    log.scrollTop = log.scrollHeight;
  };
  drawHistory();

  const context = lesson || ctx.question || ctx.card ? {
    subject, title: lesson ? lesson.title : '',
    summary: ctx.summary || '',
    question: ctx.question || ctx.card || '',
  } : null;

  async function send(text) {
    text = (text || '').trim();
    if (!text || busy) return;
    busy = true;
    input.value = '';
    history.push({ role: 'user', content: text });
    drawHistory();
    const bubble = document.createElement('div');
    bubble.className = 'msg bot';
    bubble.innerHTML = '<span class="typing"><i></i><i></i><i></i></span>';
    log.appendChild(bubble);
    log.scrollTop = log.scrollHeight;
    let answer = '';
    try {
      const res = await fetch('/api/chat', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ messages: history, lesson: context, mode, progress: progressSummary() }),
      });
      if (!res.ok || !res.body) {
        let msg = 'Hoca şu an cevap veremiyor.';
        try { msg = (await res.json()).error || msg; } catch (e) {}
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
          if (ev.thinking && !answer) bubble.innerHTML = '<span class="small muted">Düşünüyor…</span> <span class="typing"><i></i><i></i><i></i></span>';
          if (ev.t) { answer += ev.t; bubble.innerHTML = mdLite(answer); log.scrollTop = log.scrollHeight; }
          if (ev.error) throw new Error(ev.error);
        }
      }
      if (!answer) throw new Error('Boş cevap geldi, tekrar dene.');
      history.push({ role: 'assistant', content: answer });
    } catch (e) {
      bubble.innerHTML = `<p><b>Bağlantı sorunu:</b> ${esc(e.message)}</p><p class="small muted">İnternet bağlantını kontrol et. Uygulamanın geri kalanı internetsiz de çalışır.</p>`;
      history.pop();
    } finally {
      busy = false;
    }
  }

  root.querySelector('#cf').onsubmit = (e) => { e.preventDefault(); send(input.value); };
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input.value); } });
  input.addEventListener('input', () => { input.style.height = 'auto'; input.style.height = Math.min(140, input.scrollHeight) + 'px'; });
  if (ctx.prompt) send(ctx.prompt);
  else setTimeout(() => input.focus(), 250);
}

export { inline };
