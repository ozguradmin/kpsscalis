// Özgür İş Ajanı paneli — bağımlılıksız tek sayfa uygulama.
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const app = $('#app');
const state = { actions: 0 };

async function api(path, opts = {}) {
  const r = await fetch('/api' + path, { ...opts, headers: { 'content-type': 'application/json', ...(opts.headers || {}) }, body: opts.body ? JSON.stringify(opts.body) : undefined });
  if (r.status === 401) { renderLogin(); throw new Error('login'); }
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.error || r.statusText);
  return j;
}
const post = (p, body = {}) => api(p, { method: 'POST', body });

function toast(msg, ms = 2600) {
  const t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); t.textContent = msg; document.body.appendChild(t);
  setTimeout(() => t.remove(), ms);
}

// ---------- zaman ----------
const TR = 3 * 3600000;
const toMs = (ts) => typeof ts === 'string' ? Date.parse(ts) : Number(ts);
function when(ts) {
  if (!ts) return '';
  const t = toMs(ts), d = Date.now() - t;
  if (d < 0) { const f = -d; return f < 3600000 ? `${Math.round(f / 60000)} dk sonra` : f < 86400000 ? `${Math.round(f / 3600000)} sa sonra` : `${Math.round(f / 86400000)} gün sonra`; }
  if (d < 60000) return 'az önce';
  if (d < 3600000) return `${Math.round(d / 60000)} dk önce`;
  if (d < 86400000) return `${Math.round(d / 3600000)} sa önce`;
  if (d < 7 * 86400000) return `${Math.round(d / 86400000)} gün önce`;
  return new Date(t + TR).toISOString().slice(0, 10);
}
const clock = (ts) => new Date(toMs(ts) + TR).toISOString().slice(11, 16);
const dateTime = (ts) => ts ? new Date(toMs(ts) + TR).toISOString().replace('T', ' ').slice(0, 16) : '—';
const usd = (n) => `${Number(n || 0).toFixed(Number(n) < 1 ? 3 : 2)} $`;

// ---------- sözlük ----------
// Başvuru durumları posta damgası gibi gösterilir. "confirmed" = şirketin otomatik "alındı" e-postası; olumlu dönüş değildir.
const APP_ST = {
  queued: ['Sırada', 'dead'], prepared: ['Hazırlanıyor', 'live'], applying: ['Başvuruyor', 'live'],
  submitted: ['Gönderildi', 'sent'], confirmed: ['Alındı', 'recv'],
  next_step: ['Sonraki adım', 'good'], interview: ['Mülakat', 'good'], offer: ['Teklif', 'good'],
  rejected: ['Olumsuz', 'dead'], needs_human: ['Sana kaldı', 'hot'], not_eligible: ['Uygun değil', 'dead'],
  closed: ['İlan kapalı', 'dead'], blocked: ['Engel', 'wait'], failed: ['Olmadı', 'wait'], cancelled: ['İptal', 'dead'],
};
const APP_HELP = {
  submitted: 'Form gönderildi; şirketten henüz e-posta yok.',
  confirmed: 'Şirketin sistemi otomatik "başvurunuz alındı" e-postası yolladı. Kanıt olarak iyi ama henüz olumlu dönüş değil.',
  next_step: 'Şirket bir sonraki adımı istedi (test, form, görev).',
  interview: 'Mülakat daveti geldi.', offer: 'İş teklifi geldi.',
  needs_human: 'Robot doğrulaması ya da elle yapılması gereken bir adım var.',
  failed: 'Teknik nedenle gönderilemedi; sistem bir kez daha dener.', blocked: 'Site başvuruya izin vermedi (üyelik, davet, ücret).',
};
const JOB_ST = { new: ['Elemede', ''], approved: ['Başvurulacak', 'blue'], review: ['İncelemede', ''], rejected: ['Elendi', ''], queued: ['Sırada', 'blue'], applied: ['Başvuruldu', 'ok'], needs_human: ['Sana kaldı', 'bad'], expired: ['Süresi geçti', ''], blocked: ['Engel', 'warn'], apply_failed: ['Olmadı', 'warn'] };
const MAIL_CAT = { verification: ['Doğrulama', ''], confirmation: ['Alındı bildirimi', 'blue'], rejection: ['Olumsuz', ''], interview: ['Mülakat', 'ok'], assessment: ['Sonraki adım', 'ok'], recruiter: ['İşveren mesajı', 'warn'], offer: ['Teklif', 'ok'], reminder: ['Hatırlatma', ''], survey: ['Anket', ''], newsletter: ['Bülten', ''], other: ['Diğer', ''] };
const stamp = (s) => { const [l, c] = APP_ST[s] || [s, 'dead']; return `<span class="stamp ${c}" title="${esc(APP_HELP[s] || '')}">${esc(l)}</span>`; };
const chip = (map, s) => { const [l, c] = map[s] || [s, '']; return `<span class="chip ${c}">${esc(l)}</span>`; };
const fitBox = (f) => f == null ? '' : `<span class="fit ${f >= 75 ? 'hi' : f >= 55 ? 'mid' : ''}" title="Uyum puanı">${f}</span>`;
const safeArr = (s) => { try { return Array.isArray(s) ? s : JSON.parse(s || '[]') || []; } catch (e) { return []; } };

// ---------- küçük Markdown (beyin cevapları) ----------
function md(src) {
  const inline = (s) => esc(s)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[\s(])\*([^*\s][^*]*)\*(?=[\s).,;:!?]|$)/g, '$1<em>$2</em>')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+|#\/[^\s)]*)\)/g, (m, t, u) => `<a href="${u}"${u.startsWith('http') ? ' target="_blank" rel="noopener"' : ''}>${t}</a>`);
  const lines = String(src || '').replace(/\r/g, '').split('\n');
  const out = [];
  let list = null, para = [];
  const flushP = () => { if (para.length) { out.push(`<p>${para.map(inline).join('<br>')}</p>`); para = []; } };
  const flushL = () => { if (list) { out.push(`<${list.t}>${list.items.map((x) => `<li>${inline(x)}</li>`).join('')}</${list.t}>`); list = null; } };
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (/^```/.test(l)) {
      flushP(); flushL();
      const code = []; i++;
      while (i < lines.length && !/^```/.test(lines[i])) code.push(lines[i++]);
      out.push(`<pre><code>${esc(code.join('\n'))}</code></pre>`); continue;
    }
    if (/^\s*\|.*\|\s*$/.test(l) && /^\s*\|?\s*:?-{2,}/.test(lines[i + 1] || '')) {
      flushP(); flushL();
      const cells = (r) => r.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
      const head = cells(l); i += 2;
      const rows = [];
      while (i < lines.length && /^\s*\|.*\|\s*$/.test(lines[i])) rows.push(cells(lines[i++]));
      i--;
      out.push(`<div class="tbl"><table><tr>${head.map((h) => `<th>${inline(h)}</th>`).join('')}</tr>${rows.map((r) => `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join('')}</tr>`).join('')}</table></div>`); continue;
    }
    let m;
    if ((m = l.match(/^(#{1,4})\s+(.*)$/))) { flushP(); flushL(); out.push(`<h3>${inline(m[2])}</h3>`); continue; }
    if (/^\s*([-*_])(\s*\1){2,}\s*$/.test(l)) { flushP(); flushL(); out.push('<hr>'); continue; }
    if ((m = l.match(/^\s*>\s?(.*)$/))) { flushP(); flushL(); out.push(`<blockquote>${inline(m[1])}</blockquote>`); continue; }
    if ((m = l.match(/^\s*[-*•]\s+(.*)$/))) { flushP(); if (!list || list.t !== 'ul') { flushL(); list = { t: 'ul', items: [] }; } list.items.push(m[1]); continue; }
    if ((m = l.match(/^\s*\d+[.)]\s+(.*)$/))) { flushP(); if (!list || list.t !== 'ol') { flushL(); list = { t: 'ol', items: [] }; } list.items.push(m[1]); continue; }
    if (!l.trim()) { flushP(); flushL(); continue; }
    if (list && /^\s{2,}\S/.test(l)) { list.items[list.items.length - 1] += ' ' + l.trim(); continue; }
    flushL(); para.push(l);
  }
  flushP(); flushL();
  return out.join('');
}

// ---------- simgeler ----------
const I = {
  home: '<path d="M4 11l8-6 8 6v8a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z"/>',
  send: '<rect x="3" y="6" width="18" height="13" rx="1.5"/><path d="M3.5 7l8.5 6.5L20.5 7"/>',
  brain: '<path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/><circle cx="12" cy="12" r="3"/>',
  hand: '<path d="M8 13V6.5a1.5 1.5 0 0 1 3 0V12M11 11V5a1.5 1.5 0 0 1 3 0v6M14 11V6.5a1.5 1.5 0 0 1 3 0V14c0 4-2.5 7-6 7-2.6 0-4-1.3-5.4-3.5L3.8 14.8a1.5 1.5 0 0 1 2.4-1.8L8 15"/>',
  more: '<circle cx="5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="19" cy="12" r="1.3"/>',
};
const icon = (k) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${I[k]}</svg>`;

// ---------- giriş ----------
function renderLogin() {
  app.innerHTML = `<div class="login"><form id="lf">
    <h1>İş Ajanı</h1><p>Özgür Güler adına uzaktan iş arayan ve başvuran sistemin paneli.</p>
    <label class="f" for="pw">Parola</label><input type="password" id="pw" autocomplete="current-password" autofocus>
    <div class="err" id="le" role="alert"></div>
    <button class="btn pri" style="width:100%;margin-top:6px">Giriş yap</button></form></div>`;
  $('#lf').onsubmit = async (e) => {
    e.preventDefault();
    const r = await fetch('/api/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ password: $('#pw').value }) });
    const j = await r.json().catch(() => ({}));
    if (r.ok) { location.hash = '#/'; router(); } else $('#le').textContent = j.error || 'Parola yanlış.';
  };
}

// ---------- iskelet ----------
const GROUPS = [
  ['Takip', [['#/', 'Genel'], ['#/basvurular', 'Başvurular'], ['#/yapilacaklar', 'Sana kalanlar'], ['#/posta', 'E-posta']]],
  ['Ajan', [['#/beyin', 'Beyin'], ['#/ilanlar', 'İlanlar'], ['#/kaynaklar', 'Kaynaklar'], ['#/kayitlar', 'Ekran kayıtları'], ['#/hafiza', 'Hafıza']]],
  ['Sistem', [['#/hesaplar', 'Hesaplar ve girişler'], ['#/modeller', 'Modeller ve maliyet'], ['#/gunluk', 'Günlük'], ['#/ayarlar', 'Ayarlar']]],
];
const TABS = [['#/', 'home', 'Genel'], ['#/basvurular', 'send', 'Başvurular'], ['#/beyin', 'brain', 'Beyin'], ['#/yapilacaklar', 'hand', 'Sana'], ['#/menu', 'more', 'Daha']];
const badge = (h) => h === '#/yapilacaklar' && state.actions ? `<span class="count">${state.actions}</span>` : '';

function shell(active, inner = '<div class="empty">Yükleniyor…</div>') {
  const nav = GROUPS.map(([g, items]) => `<div class="navgroup"><div class="h">${g}</div>${items.map(([h, l]) => `<a href="${h}" class="${active === h ? 'on' : ''}"${active === h ? ' aria-current="page"' : ''}><span>${l}</span>${badge(h)}</a>`).join('')}</div>`).join('');
  app.innerHTML = `<div class="shell"><aside class="side"><a class="wordmark" href="#/">İş Ajanı <small>Özgür Güler</small></a>${nav}<div class="foot"><span>v2</span><button id="lo">Çıkış</button></div></aside>
    <div style="min-width:0"><header class="mhead"><a class="wordmark" href="#/">İş Ajanı</a><span id="hh"></span></header><main id="main">${inner}</main></div></div>
    <nav class="tabbar" aria-label="Ana gezinme">${TABS.map(([h, i, l]) => `<a href="${h}" class="${active === h ? 'on' : ''}">${icon(i)}<span>${l}</span>${badge(h)}</a>`).join('')}</nav>`;
  $('#lo').onclick = logout;
}
async function logout(e) { e?.preventDefault(); await post('/logout'); renderLogin(); }
const setMain = (html) => { $('#main').innerHTML = html; window.scrollTo(0, 0); };
const head = (title, lede = '', right = '', back = '') => `<div class="page-h"><div>${back ? `<a class="back" href="${back[0]}">← ${back[1]}</a>` : ''}<h1>${title}</h1>${lede ? `<p class="lede">${lede}</p>` : ''}</div>${right ? `<div class="row wrap">${right}</div>` : ''}</div>`;
const ev = (e) => `<div class="e ${e.level}"><div class="tm">${clock(e.ts)}</div><div class="x"><span class="tag">${esc(e.type)}</span>${esc(e.msg)}</div></div>`;

// ---------- Genel ----------
async function viewOverview() {
  shell('#/');
  const d = await api('/overview');
  state.actions = d.actions.length;
  const s = d.summary, a = s.applications || {};
  const sent = ['submitted', 'confirmed', 'interview', 'next_step', 'offer', 'rejected'].reduce((n, k) => n + (a[k] || 0), 0);
  const positive = (a.interview || 0) + (a.next_step || 0) + (a.offer || 0);
  const tickAge = d.settings.last_tick ? Date.now() - d.settings.last_tick : Infinity;
  const ok = tickAge < 25 * 60000;
  const health = `<span class="health ${ok ? '' : 'bad'}"><i></i>${ok ? `Çalışıyor · son tur ${when(d.settings.last_tick)}` : `Son tur ${d.settings.last_tick ? when(d.settings.last_tick) : 'yok'}; kontrol et`}</span>`;
  $('#hh').innerHTML = health;
  const today = d.recent.filter((r) => Date.now() - toMs(r.updated_at) < 86400000);
  const SENT = ['submitted', 'confirmed', 'next_step', 'interview', 'offer'];
  const shown = today.filter((r) => SENT.includes(r.status) || ['needs_human', 'applying', 'prepared'].includes(r.status));
  const todaySent = today.filter((r) => SENT.includes(r.status)).length;
  const misses = today.filter((r) => ['failed', 'blocked', 'not_eligible', 'closed'].includes(r.status)).length;
  const days = []; for (let i = 13; i >= 0; i--) days.push(new Date(Date.now() + TR - i * 86400000).toISOString().slice(0, 10));
  const tmap = Object.fromEntries(d.trend.map((x) => [x.d, x]));
  const max = Math.max(1, ...days.map((k) => tmap[k]?.found || 0));
  const bars = days.map((k) => { const f = tmap[k]?.found || 0, g = tmap[k]?.ok || 0; return `<div class="b" title="${k}: ${f} ilan, ${g} uygun"><span class="a1" style="height:${(f - g) / max * 100}%"></span><span class="a2" style="height:${Math.max(g ? 3 : 0, g / max * 100)}%"></span></div>`; }).join('');
  const budgetPct = Math.min(100, d.ai_cost_today / d.settings.daily_ai_budget_usd * 100);
  const brPct = Math.min(100, d.browser_hours_month / d.settings.monthly_browser_hours * 100);
  const backlog = Object.values(s.triage_backlog || {}).reduce((x, y) => x + y, 0);
  setMain(`
    <div class="page-h" style="margin-bottom:14px"><div><div class="eyebrow">Son 24 saat</div></div><div class="row wrap"><button class="btn sm" id="pz">${d.settings.paused ? 'Devam ettir' : 'Duraklat'}</button><button class="btn sm pri" id="tk">Şimdi bir tur çalıştır</button></div></div>
    ${d.settings.paused ? '<div class="note red" style="margin-bottom:16px">Sistem duraklatıldı: yeni ilan aranmıyor, başvuru yapılmıyor.</div>' : ''}
    <div class="bag">
      <section class="hero" aria-label="Günün özeti">
        <div class="row between wrap"><span class="eyebrow">Bugünün postası</span><span class="desk-only">${health}</span></div>
        <div class="big">${todaySent}<small>başvuru gönderildi</small></div>
        <p class="said">${s.jobs_24h.toLocaleString('tr')} yeni ilan tarandı, ${s.approved_waiting} ilan başvuru sırasında. Günlük sınır ${d.settings.daily_apply_limit}.</p>
        <div class="stamps tilt">${shown.length ? shown.map((r) => `<a href="#/basvuru/${r.id}" title="${esc(r.company)} — ${esc(r.title)}">${stamp(r.status)} <span class="small">${esc(r.company)}</span></a>`).join('') : '<span class="muted small">Bugün henüz başvuru yok.</span>'}</div>
        ${misses ? `<p class="small muted" style="margin:12px 0 0">${misses} deneme olmadı (site engeli, davetle alım, uygunluk). <a href="#/basvurular?status=failed">Gör</a></p>` : ''}
      </section>
      ${d.actions.length ? `<a class="todo" href="#/yapilacaklar"><span class="eyebrow">Sana kalanlar</span><span class="big">${d.actions.length}</span>
        <ul>${d.actions.slice(0, 3).map((x) => `<li>${esc(x.title)}</li>`).join('')}</ul><span class="small">Hepsini gör →</span></a>`
        : '<div class="todo calm"><span class="eyebrow">Sana kalanlar</span><span class="big">0</span><span class="small muted">Şu an senin yapman gereken bir şey yok. Önemli bir gelişme olursa Gmail\'ine e-posta gelir.</span></div>'}
    </div>
    <div class="funnel" aria-label="Başvuru hunisi">
      <div><b>${s.jobs_total.toLocaleString('tr')}</b><span>ilan tarandı</span></div>
      <div><b>${(s.approved_waiting || 0) + sent}</b><span>uygun bulundu</span></div>
      <div><b>${sent}</b><span>başvuru gönderildi</span></div>
      <div title="${esc(APP_HELP.confirmed)}"><b>${(a.confirmed || 0) + positive}</b><span>"alındı" e-postası</span></div>
      <div class="pos"><b>${positive}</b><span>olumlu dönüş</span></div>
    </div>
    <div class="grid g2">
      <section class="sheet flush"><div class="row between" style="padding:14px 18px 4px"><h2 style="margin:0">Son başvurular</h2><a class="small" href="#/basvurular">Tümü</a></div>
        <div class="list">${d.recent.length ? d.recent.map((r) => `<a class="item" href="#/basvuru/${r.id}"><div class="main"><div class="t">${esc(r.company)}</div><div class="m">${esc(r.title)}</div></div><div class="r">${stamp(r.status)}<span>${when(r.updated_at)}</span></div></a>`).join('') : '<div class="empty">Henüz başvuru yok.</div>'}</div></section>
      <div class="stack">
        <section class="sheet"><div class="row between"><h2>Son 14 gün</h2><div class="legend"><span><i style="background:var(--line)"></i>taranan</span><span><i style="background:var(--blue)"></i>uygun</span></div></div>
          <div class="bars">${bars}</div><div class="bars lbl">${days.map((k, i) => `<span>${i % 2 ? '' : k.slice(8)}</span>`).join('')}</div></section>
        <section class="sheet"><h2>Şu an</h2>
          ${d.running.length ? `<div class="list" style="margin:0 -18px 12px">${d.running.map((r) => `<a class="item" href="#/basvuru/${r.id}"><div class="main"><div class="t">${esc(r.company)}</div><div class="m">${esc(r.title)}</div></div><div class="r">${stamp(r.status)}</div></a>`).join('')}</div>` : '<p class="muted small" style="margin:0 0 12px">Şu an süren başvuru yok.</p>'}
          <div class="small row between"><span>Yapay zekâ bugün</span><span class="num">${usd(d.ai_cost_today)} / ${d.settings.daily_ai_budget_usd} $</span></div><div class="meter"><i style="width:${budgetPct}%"></i></div>
          <div class="small row between" style="margin-top:12px"><span>Tarayıcı bu ay</span><span class="num">${d.browser_hours_month.toFixed(1)} / ${d.settings.monthly_browser_hours} sa</span></div><div class="meter"><i style="width:${brPct}%"></i></div>
          <p class="tiny muted" style="margin:10px 0 0">Eleme kuyruğunda ${backlog} ilan var. Tüm maliyet Cloudflare kredisinden karşılanıyor.</p></section>
      </div>
    </div>
    <section class="sheet flush" style="margin-top:16px"><div class="row between" style="padding:14px 18px 4px"><h2 style="margin:0">Canlı akış</h2><a class="small" href="#/gunluk">Günlük</a></div><div class="feed">${d.events.slice(0, 14).map(ev).join('')}</div></section>`);
  $('#tk').onclick = async (e) => { e.target.disabled = true; e.target.textContent = 'Çalışıyor…'; try { await post('/run/tick'); toast('Tur tamamlandı'); } catch (x) { toast(x.message); } viewOverview(); };
  $('#pz').onclick = async () => { await post('/settings', { key: 'paused', value: !d.settings.paused }); viewOverview(); };
}

// ---------- İlanlar ----------
async function viewJobs(params) {
  const st = params.get('status') || 'eligible', q = params.get('q') || '', page = Number(params.get('page') || 0);
  shell('#/ilanlar');
  const d = await api(`/jobs?status=${st}&q=${encodeURIComponent(q)}&page=${page}`);
  const c = d.counts;
  const tabs = [['eligible', 'Uygun', (c.approved || 0) + (c.review || 0) + (c.queued || 0)], ['approved', 'Başvurulacak', c.approved], ['review', 'İncelemede', c.review], ['applied', 'Başvuruldu', c.applied], ['needs_human', 'Sana kaldı', c.needs_human], ['new', 'Elemede', c.new], ['rejected', 'Elendi', c.rejected]];
  setMain(`${head('İlanlar', 'Küçük şirketlerin kariyer sayfalarından, farklı dillerdeki panolardan ve Türkiye\'ye açık uzaktan ilanlardan toplanır. Ünlü şirketler geri planda tutulur.')}
    <form id="sf" role="search" style="margin-bottom:12px"><input type="search" id="q" placeholder="Başlık, şirket ya da konum ara" value="${esc(q)}" aria-label="İlan ara"></form>
    <div class="filters">${tabs.map(([k, l, n]) => `<button data-st="${k}" class="${st === k ? 'on' : ''}">${l}<span class="n">${n || 0}</span></button>`).join('')}</div>
    <section class="sheet flush"><div class="list">${d.rows.length ? d.rows.map((j) => `<a class="item" href="#/ilan/${j.id}">${fitBox(j.fit)}<div class="main"><div class="t">${esc(j.title)}</div><div class="m">${esc(j.company || '')} · ${esc(j.location || '')} · ${esc(j.source)}${j.lang && j.lang !== 'en' ? ' · ' + j.lang.toUpperCase() : ''}${j.reason ? `<br>${esc(j.reason)}` : ''}</div></div><div class="r">${chip(JOB_ST, j.status)}<span>${when(j.discovered_at)}</span></div></a>`).join('') : '<div class="empty">Bu filtrede ilan yok.</div>'}</div></section>
    <div class="row between" style="margin-top:12px"><button class="btn sm" id="pv" ${page ? '' : 'disabled'}>Önceki</button><span class="small muted">Sayfa ${page + 1}</span><button class="btn sm" id="nx" ${d.rows.length < 50 ? 'disabled' : ''}>Sonraki</button></div>`);
  const go = (s, p = 0) => { location.hash = `#/ilanlar?status=${s}&q=${encodeURIComponent($('#q').value)}${p ? `&page=${p}` : ''}`; };
  $$('[data-st]').forEach((b) => b.onclick = () => go(b.dataset.st));
  $('#sf').onsubmit = (e) => { e.preventDefault(); go(st); };
  $('#pv').onclick = () => go(st, page - 1);
  $('#nx').onclick = () => go(st, page + 1);
}

async function viewJob(id) {
  shell('#/ilanlar');
  const j = await api('/jobs/' + id);
  const a = j.analysis || {};
  const SCALE = { tiny: 'çok küçük', small: 'küçük', mid: 'orta', large: 'büyük', famous: 'ünlü (rekabet çok yüksek)' };
  const kv = (k, v) => `<dt>${k}</dt><dd>${v}</dd>`;
  setMain(`${head(esc(j.title), `${esc(j.company)} · ${esc(j.location || '')} · ${esc(j.source)}`, `${chip(JOB_ST, j.status)} ${fitBox(j.fit)}`, ['#/ilanlar', 'İlanlar'])}
    <div class="actions">
      <button class="btn pri" data-d="apply_now">Hemen başvur</button><button class="btn" data-d="approve">Sıraya al</button><button class="btn danger" data-d="reject">Reddet</button><button class="btn" id="ra">Yeniden analiz et</button>
      <a class="btn" href="${esc(j.url)}" target="_blank" rel="noopener">İlanı aç ↗</a></div>
    <div class="grid g2">
      <section class="sheet"><h2>Değerlendirme</h2>${j.reason ? `<p style="margin:0 0 14px">${esc(j.reason)}</p>` : ''}
        <dl class="kv">
          ${kv('Türkiye\'den olur mu', `${a.turkey_ok === true || j.turkey_ok === 1 ? 'Evet' : a.turkey_ok === false ? 'Hayır' : 'Belirsiz'} ${a.location_rule ? `<span class="muted">— ${esc(a.location_rule)}</span>` : ''}`)}
          ${kv('Şirket', `${esc(SCALE[a.company_scale] || '—')}${a.hire_chance != null ? ` · işe alınma şansı ${a.hire_chance}/100` : ''}`)}
          ${kv('Dil şartı', `${esc((a.languages_required || safeArr(j.langs_required)).join(', ') || '—')} ${a.english_level_needed ? `· İngilizce: ${esc(a.english_level_needed)}` : ''}`)}
          ${kv('Başvuru yolu', `${esc(a.apply_method || '—')} ${a.apply_email ? `· ${esc(a.apply_email)}` : ''} ${a.needs_account ? '· hesap gerekli' : ''}`)}
          ${kv('Görüşme / video', `${a.requires_video ? 'video istiyor · ' : ''}${esc(a.requires_calls || '—')}`)}
          ${kv('Sözleşme / ücret', `${esc(a.contract || '—')} ${a.salary || j.salary ? '· ' + esc(a.salary || j.salary) : ''}`)}
          ${kv('Sende olan', esc((a.candidate_has || []).join(', ') || '—'))}
          ${kv('Eksik', esc((a.candidate_missing || []).join(', ') || '—'))}
          ${kv('Öne çıkarılacak', esc(a.pitch || '—'))}
          ${kv('Riskler', esc((a.red_flags || []).join(', ') || '—'))}
          ${j.jev ? kv('Jev hızlı yargı', `<span class="mono">Türkiye ${j.jev.turkey_ok} · başka dil ${j.jev.other_language} · şüphe ${j.jev.scam} · uyum ${j.jev.fit}/4</span>`) : ''}
        </dl>
        ${j.applications?.length ? `<h3>Başvurular</h3><div class="list" style="margin:0 -18px">${j.applications.map((x) => `<a class="item" href="#/basvuru/${x.id}"><div class="main"><div class="t small">${dateTime(x.created_at)}</div><div class="m">${esc(x.error || '')}</div></div><div class="r">${stamp(x.status)}</div></a>`).join('')}</div>` : ''}
      </section>
      <section class="sheet"><h2>İlan metni</h2><div class="pre" style="max-height:560px;overflow:auto">${esc(j.description || '')}</div></section>
    </div>`);
  $$('[data-d]').forEach((b) => b.onclick = async () => { b.disabled = true; try { const r = await post(`/jobs/${id}/decision`, { decision: b.dataset.d }); toast(r.note || 'Tamam'); if (r.appId) location.hash = '#/basvuru/' + r.appId; else viewJob(id); } catch (e) { toast(e.message); b.disabled = false; } });
  $('#ra').onclick = async (e) => { e.target.disabled = true; e.target.textContent = 'Analiz ediliyor…'; await post(`/jobs/${id}/reanalyze`); viewJob(id); };
}

// ---------- Başvurular ----------
async function viewApps(params) {
  const st = params.get('status') || '';
  shell('#/basvurular');
  const d = await api('/applications' + (st ? `?status=${st}` : ''));
  const c = d.counts;
  const tabs = [['', 'Tümü'], ['submitted', 'Gönderildi'], ['confirmed', 'Alındı'], ['next_step', 'Sonraki adım'], ['interview', 'Mülakat'], ['needs_human', 'Sana kaldı'], ['failed', 'Olmadı'], ['rejected', 'Olumsuz']];
  setMain(`${head('Başvurular', 'Her başvurunun ön yazısı, form cevapları, son ekran görüntüsü ve e-postaları kanıt olarak saklanır.')}
    <div class="filters">${tabs.map(([k, l]) => `<button data-st="${k}" class="${st === k ? 'on' : ''}">${l}${k ? `<span class="n">${c[k] || 0}</span>` : ''}</button>`).join('')}</div>
    <section class="sheet flush"><div class="list">${d.rows.length ? d.rows.map((a) => `<a class="item" href="#/basvuru/${a.id}"><div class="main"><div class="t">${esc(a.company)} <span class="sub">— ${esc(a.title)}</span></div><div class="m">${esc(a.source)}${a.method ? ' · ' + esc(a.method) : ''}${a.error ? ' · ' + esc(a.error) : ''}</div></div><div class="r">${stamp(a.status)}<span>${when(a.submitted_at || a.updated_at)}</span></div></a>`).join('') : '<div class="empty">Bu filtrede başvuru yok.</div>'}</div></section>
    <details class="sheet" style="margin-top:16px"><summary>Durumlar ne anlama geliyor?</summary>
      <dl class="kv" style="margin-top:12px">${['submitted', 'confirmed', 'next_step', 'interview', 'offer', 'needs_human', 'failed', 'blocked'].map((k) => `<dt>${stamp(k)}</dt><dd class="small">${esc(APP_HELP[k] || '')}</dd>`).join('')}</dl></details>`);
  $$('[data-st]').forEach((b) => b.onclick = () => { location.hash = '#/basvurular' + (b.dataset.st ? `?status=${b.dataset.st}` : ''); });
}

async function viewApp(id) {
  shell('#/basvurular');
  const a = await api('/applications/' + id);
  const ev0 = a.evidence || {};
  const answers = a.answers && typeof a.answers === 'object' ? Object.entries(a.answers) : [];
  const live = ['applying', 'prepared', 'queued'].includes(a.status);
  const kv = (k, v) => `<dt>${k}</dt><dd>${v}</dd>`;
  setMain(`${head(esc(a.company), `${esc(a.title)} · ${esc(a.location || '')} · ${esc(a.source)}`, `<span class="tilt">${stamp(a.status)}</span>`, ['#/basvurular', 'Başvurular'])}
    ${APP_HELP[a.status] && !a.error ? `<div class="note ${a.status === 'needs_human' ? 'red' : ''}" style="margin-bottom:14px">${esc(APP_HELP[a.status])}</div>` : ''}
    <div class="actions">
      ${['failed', 'needs_human', 'blocked', 'queued'].includes(a.status) ? '<button class="btn pri" id="rt">Yeniden dene</button><button class="btn" id="ho">Canlı devral</button>' : ''}
      ${a.live_url ? `<a class="btn" href="${esc(a.live_url)}" target="_blank" rel="noopener">Canlı tarayıcı ↗</a>` : ''}
      <a class="btn" href="${esc(a.apply_url || a.url)}" target="_blank" rel="noopener">Başvuru sayfası ↗</a>
      <select id="ms" style="width:auto;flex:1 1 180px" aria-label="Durumu elle değiştir"><option value="">Durumu elle değiştir…</option>${['submitted', 'confirmed', 'next_step', 'interview', 'offer', 'rejected', 'cancelled'].map((s) => `<option value="${s}">${APP_ST[s][0]}</option>`).join('')}</select>
    </div>
    ${a.error ? `<div class="note ${['failed', 'blocked'].includes(a.status) ? 'warn' : ''}" style="margin-bottom:14px">${esc(a.error)}</div>` : ''}
    ${live ? '<div class="note" style="margin-bottom:14px">Başvuru sürüyor; bu sayfa 10 saniyede bir yenilenir.</div>' : ''}
    <div class="grid g2">
      <section class="sheet"><h2>Kanıt</h2>
        <dl class="kv">
          ${kv('Oluşturuldu', dateTime(a.created_at))}${kv('Gönderildi', dateTime(a.submitted_at))}
          ${kv('Yöntem', `${esc(a.method || '—')} · ${a.steps || 0} adım · tarayıcı ${Math.round((a.browser_ms || 0) / 1000)} sn`)}
          ${kv('Son adres', `<span class="mono">${esc(ev0.finalUrl || ev0.final_url || '—')}</span>`)}
          ${a.confirmation ? kv('Alındı e-postası', `${esc(a.confirmation.subject || '')} <span class="muted">(${esc(a.confirmation.from || '')})</span>`) : ''}
          ${ev0.messageId ? kv('E-posta kimliği', `<span class="mono">${esc(ev0.messageId)}</span> <span class="muted">(gönderim kabul edildi)</span>`) : ''}
        </dl>
        ${ev0.finalShot ? `<a href="/api/file/${esc(ev0.finalShot)}" target="_blank" style="display:block;margin-top:14px"><img src="/api/file/${esc(ev0.finalShot)}" style="width:100%;border-radius:9px;border:1px solid var(--line)" alt="Başvurunun son ekranı" loading="lazy"></a><div class="tiny muted" style="margin-top:4px">Son ekranın tam görüntüsü (kalıcı kanıt)</div>` : ''}
        ${ev0.finalText ? `<details style="margin-top:10px"><summary>Son sayfanın metni</summary><div class="pre small">${esc(ev0.finalText)}</div></details>` : ''}
        <h3>Ekran kayıtları <span class="tiny">(3 gün saklanır)</span></h3>
        ${a.recordings.length ? `<div class="list" style="margin:0 -18px">${a.recordings.map((r) => `<a class="item" href="#/kayit/${r.id}"><div class="main"><div class="t small">▶ ${dateTime(r.created_at)}</div><div class="m">${r.frames} kare · ${r.deleted ? 'silindi' : `silinme ${dateTime(r.expires_at)}`}</div></div></a>`).join('')}</div>` : '<p class="muted small" style="margin:0">Kayıt yok.</p>'}
      </section>
      <section class="sheet"><h2>Ön yazı</h2>${a.letter ? `<div class="letter">${esc(a.letter)}</div>` : '<p class="muted small">Henüz yazılmadı.</p>'}
        <h3>Form cevapları</h3>${answers.length ? `<div class="scroll-x"><table class="t">${answers.map(([k, v]) => `<tr><td class="muted" style="width:45%">${esc(k)}</td><td>${esc(typeof v === 'object' ? JSON.stringify(v) : v)}</td></tr>`).join('')}</table></div>` : '<p class="muted small" style="margin:0">Kayıtlı cevap yok.</p>'}
      </section>
    </div>
    <div class="grid g2" style="margin-top:16px">
      <section class="sheet flush"><h2>İlgili e-postalar</h2><div class="list">${a.mails.length ? a.mails.map((m) => `<a class="item" href="#/eposta/${encodeURIComponent(m.id)}"><div class="main"><div class="t">${esc(m.subject)}</div><div class="m">${esc(m.from_addr)} · ${esc(m.summary || '')}</div></div><div class="r">${chip(MAIL_CAT, m.category)}<span>${when(m.received_at)}</span></div></a>`).join('') : '<div class="empty">Henüz e-posta yok.</div>'}</div></section>
      <section class="sheet flush"><h2>Olaylar</h2><div class="feed">${a.events.map(ev).join('') || '<div class="empty">—</div>'}</div></section>
    </div>`);
  const rt = $('#rt'), ho = $('#ho');
  if (rt) rt.onclick = async () => { await post(`/applications/${id}/retry`); toast('Yeniden başlatıldı'); viewApp(id); };
  if (ho) ho.onclick = async () => { await post(`/applications/${id}/retry`, { handoff: true }); toast('Başlatıldı. Robot doğrulaması çıkarsa canlı bağlantı "Sana kalanlar"a ve Gmail\'ine gelir.', 5000); viewApp(id); };
  $('#ms').onchange = async (e) => { if (!e.target.value) return; await post(`/applications/${id}/status`, { status: e.target.value }); toast('Güncellendi'); viewApp(id); };
  if (live) setTimeout(() => { if (location.hash === '#/basvuru/' + id) viewApp(id); }, 10000);
}

// ---------- Kayıtlar ----------
async function viewRecs() {
  shell('#/kayitlar');
  const rows = await api('/recordings');
  setMain(`${head('Ekran kayıtları', 'Ajanın tarayıcıda attığı her adımın görüntüsü. 3 gün sonra kendiliğinden silinir.')}
    <section class="sheet flush"><div class="list">${rows.length ? rows.map((r) => `<a class="item" href="#/kayit/${r.id}"><div class="main"><div class="t">${esc(r.company || r.title || r.id)}</div><div class="m">${esc(r.title || '')} · ${r.frames} kare · ${dateTime(r.created_at)}</div></div><div class="r">${r.app_status ? stamp(r.app_status) : ''}<span>silinme ${when(r.expires_at)}</span></div></a>`).join('') : '<div class="empty">Henüz kayıt yok.</div>'}</div></section>`);
}

async function viewPlayer(id) {
  shell('#/kayitlar');
  const r = await api('/recordings/' + id);
  const frames = r.frames, tl = r.timeline || [];
  const labelFor = (i) => { const f = tl.filter((x) => x.seq)[i]; return f ? `${clock(f.ts)} · ${f.label}` : ''; };
  setMain(`${head(esc(r.title || 'Kayıt'), `${frames.length} kare · ${dateTime(r.created_at)} · silinme ${dateTime(r.expires_at)}${r.app_id ? ` · <a href="#/basvuru/${r.app_id}">başvuruya git</a>` : ''}`, '', ['#/kayitlar', 'Kayıtlar'])}
    ${frames.length ? `<div class="player"><img id="fr" src="/api/file/${frames[0]}" alt="Kayıt karesi"><div class="cap" id="cap">${esc(labelFor(0))}</div></div>
    <div class="ctrl"><button class="btn sm" id="pp">Oynat</button><input type="range" id="sl" min="0" max="${frames.length - 1}" value="0" aria-label="Kare"><select id="sp" aria-label="Hız"><option value="1500">1x</option><option value="700">2x</option><option value="300">4x</option></select><span class="small muted num" id="ix">1/${frames.length}</span></div>
    <div class="thumbs" id="th">${frames.map((f, i) => `<img data-i="${i}" src="/api/file/${f}" loading="lazy" alt="" class="${i ? '' : 'on'}">`).join('')}</div>` : '<div class="empty">Kare yok; süresi dolup silinmiş olabilir.</div>'}
    <section class="sheet flush" style="margin-top:16px"><h2>Ajanın düşünceleri ve adımları</h2><div class="feed">${tl.map((x) => `<div class="e"><div class="tm">${clock(x.ts)}</div><div class="x">${x.seq ? `<b>#${x.seq}</b> ` : ''}${esc(x.label)}${x.data?.actions ? `<details><summary>eylemler</summary><div class="pre mono">${esc(JSON.stringify(x.data.actions, null, 1))}</div></details>` : ''}</div></div>`).join('') || '<div class="empty">Zaman çizelgesi yok.</div>'}</div></section>`);
  if (!frames.length) return;
  let i = 0, timer = null;
  const show = (k) => { i = Math.max(0, Math.min(frames.length - 1, k)); $('#fr').src = '/api/file/' + frames[i]; $('#cap').textContent = labelFor(i); $('#sl').value = i; $('#ix').textContent = `${i + 1}/${frames.length}`; $$('#th img').forEach((im) => im.classList.toggle('on', Number(im.dataset.i) === i)); };
  const stop = () => { clearInterval(timer); timer = null; $('#pp').textContent = 'Oynat'; };
  $('#pp').onclick = () => { if (timer) return stop(); if (i >= frames.length - 1) show(0); $('#pp').textContent = 'Durdur'; timer = setInterval(() => { if (i >= frames.length - 1 || !$('#fr')) return stop(); show(i + 1); }, Number($('#sp').value)); };
  $('#sl').oninput = (e) => { stop(); show(Number(e.target.value)); };
  $('#th').onclick = (e) => { if (e.target.dataset.i) { stop(); show(Number(e.target.dataset.i)); } };
}

// ---------- E-posta ----------
async function viewMail(params) {
  const cat = params.get('c') || '';
  shell('#/posta');
  const rows = await api('/mail' + (cat ? `?category=${cat}` : ''));
  const cats = [['', 'Tümü'], ['interview', 'Mülakat'], ['assessment', 'Sonraki adım'], ['recruiter', 'İşveren'], ['offer', 'Teklif'], ['confirmation', 'Alındı'], ['rejection', 'Olumsuz'], ['verification', 'Doğrulama']];
  setMain(`${head('E-posta', 'destek@ozgurguler.tech kutusu okunur, sınıflandırılır ve başvurulara bağlanır. Mülakat, teklif ve işveren mesajları ayrıca Gmail\'ine bildirilir.')}
    <div class="filters">${cats.map(([k, l]) => `<button data-c="${k}" class="${cat === k ? 'on' : ''}">${l}</button>`).join('')}</div>
    <section class="sheet flush"><div class="list">${rows.length ? rows.map((m) => `<a class="item" href="#/eposta/${encodeURIComponent(m.id)}"><div class="main"><div class="t">${esc(m.subject)}</div><div class="m">${esc(m.from_addr)}${m.company ? ' · ' + esc(m.company) : ''}${m.summary ? ' · ' + esc(m.summary) : ''}${m.code ? ` · kod <b>${esc(m.code)}</b>` : ''}</div></div><div class="r">${chip(MAIL_CAT, m.category)}<span>${when(m.received_at)}</span></div></a>`).join('') : '<div class="empty">E-posta yok.</div>'}</div></section>`);
  $$('[data-c]').forEach((b) => b.onclick = () => { location.hash = '#/posta' + (b.dataset.c ? `?c=${b.dataset.c}` : ''); });
}

async function viewMailOne(id) {
  shell('#/posta');
  const m = await api('/mail/' + encodeURIComponent(id));
  setMain(`${head(esc(m.subject), `${esc(m.from_name || '')} &lt;${esc(m.from_address || m.from_addr)}&gt; · ${dateTime(m.received_at)}`, m.category ? chip(MAIL_CAT, m.category) : '', ['#/posta', 'E-posta'])}
    ${m.summary ? `<div class="note" style="margin-bottom:16px">${esc(m.summary)}</div>` : ''}
    <div class="grid g2"><section class="sheet"><h2>İçerik</h2><div class="pre">${esc(m.text_body || '')}</div></section>
    <section class="sheet"><h2>Cevap</h2><p class="small muted" style="margin:0 0 8px">Taslağı ajan yazdı. Düzenleyip gönderebilirsin; gönderim önce "kabul edildi" olarak kaydedilir, teslim ayrıca izlenir.</p>
      <textarea id="rp" style="min-height:220px" aria-label="Cevap metni">${esc(m.draft || '')}</textarea>
      <div class="row wrap" style="margin-top:10px"><button class="btn pri" id="sd">Cevabı gönder</button>${m.app_id ? `<a class="btn" href="#/basvuru/${m.app_id}">Başvuruya git</a>` : ''}</div></section></div>`);
  $('#sd').onclick = async (e) => { if (!$('#rp').value.trim()) return toast('Metin boş'); e.target.disabled = true; try { await post(`/mail/${encodeURIComponent(id)}/reply`, { text: $('#rp').value }); toast('Cevap gönderildi (kabul edildi)'); } catch (x) { toast(x.message); e.target.disabled = false; } };
}

// ---------- Beyin ----------
async function viewBrain() {
  shell('#/beyin');
  const rows = (await api('/chat')).reverse();
  setMain(`${head('Beyin', 'Sisteme soru sor, ayar değiştir, başvuru yaptır. Cevaplar veritabanından okunur.', '<a class="btn sm" href="#/hafiza">Hafıza</a>')}
    <div class="chat"><div class="msgs" id="ms" aria-live="polite">${rows.map(bubble).join('') || '<p class="muted">Örneğin: "Bugün neler yaptın?", "Mülakat daveti var mı?", "Günlük başvuru sınırını 12 yap".</p>'}</div>
      <div class="dock"><div class="chips">${['Bugün neler yaptın?', 'Olumlu dönen var mı?', 'Neden bu kadar ilan eleniyor?', 'Hangi kaynaklar işe yarıyor?', 'Bu hafta ne kadar harcadık?'].map((c) => `<button type="button">${c}</button>`).join('')}</div>
      <form class="composer" id="cf"><textarea id="ci" placeholder="Beyne yaz" rows="1" aria-label="Mesaj"></textarea><button class="btn pri">Gönder</button></form></div></div>`);
  const box = $('#ms'), ta = $('#ci');
  const toEnd = () => window.scrollTo(0, document.body.scrollHeight);
  toEnd();
  ta.oninput = () => { ta.style.height = 'auto'; ta.style.height = Math.min(160, ta.scrollHeight) + 'px'; };
  const send = async (text) => {
    if (!text.trim()) return;
    if (!box.querySelector('.msg')) box.innerHTML = '';
    box.insertAdjacentHTML('beforeend', bubble({ role: 'user', content: text }));
    box.insertAdjacentHTML('beforeend', '<div class="typing" id="ty">Beyin düşünüyor, veritabanına bakıyor</div>');
    ta.value = ''; ta.oninput(); toEnd();
    try { const r = await post('/chat', { message: text }); $('#ty')?.remove(); box.insertAdjacentHTML('beforeend', bubble({ role: 'assistant', content: r.text, meta: JSON.stringify({ trace: r.trace, model: r.model }) })); }
    catch (e) { $('#ty')?.remove(); box.insertAdjacentHTML('beforeend', bubble({ role: 'assistant', content: 'Cevap alınamadı: ' + e.message })); }
    toEnd();
  };
  $('#cf').onsubmit = (e) => { e.preventDefault(); send(ta.value); };
  ta.onkeydown = (e) => { if (e.key === 'Enter' && !e.shiftKey && !matchMedia('(pointer: coarse)').matches) { e.preventDefault(); send(ta.value); } };
  $$('.chips button').forEach((b) => b.onclick = () => send(b.textContent));
}
function bubble(m) {
  let meta = {}; try { meta = JSON.parse(m.meta || '{}'); } catch (e) { /* */ }
  if (m.role === 'user') return `<div class="msg user">${esc(m.content)}</div>`;
  const tr = meta.trace?.length ? `<div class="meta">${meta.trace.map((t) => esc(t.tool)).join(' · ')}${meta.model ? ' — ' + esc(meta.model.split('/').pop()) : ''}</div>` : '';
  return `<div class="msg assistant"><div class="md">${md(m.content)}</div>${tr}</div>`;
}

async function viewMemory() {
  shell('#/hafiza');
  const rows = await api('/memory');
  setMain(`${head('Hafıza', 'Beynin öğrendiği dersler, kurallar ve senin tercihlerin. Her sabahki öz değerlendirmede güncellenir.', '', ['#/beyin', 'Beyin'])}
    <section class="sheet flush"><div class="list">${rows.length ? rows.map((m) => `<div class="item"><div class="main"><div class="t" style="font-weight:500;${m.active ? '' : 'opacity:.5'}">${esc(m.text)}</div><div class="m">${esc(m.kind)} · ${esc(m.source || '')} · ${when(m.created_at)}</div></div><div class="r"><button class="btn sm" data-id="${m.id}">${m.active ? 'Kapat' : 'Aç'}</button></div></div>`).join('') : '<div class="empty">Henüz hafıza yok.</div>'}</div></section>`);
  $$('[data-id]').forEach((b) => b.onclick = async () => { await post(`/memory/${b.dataset.id}/toggle`); viewMemory(); });
}

// ---------- Sana kalanlar ----------
async function viewActions() {
  shell('#/yapilacaklar');
  const rows = await api('/actions');
  const open = rows.filter((r) => r.status === 'open');
  state.actions = open.length;
  const KIND = { interview: 'Mülakat', assessment: 'Sonraki adım', offer: 'Teklif', recruiter: 'İşveren mesajı', handoff: 'Robot doğrulaması', needs_human: 'Elle tamamla', manual: 'Senin işin' };
  const item = (r) => `<div class="item" style="${r.status === 'open' ? '' : 'opacity:.55'}"><div class="main"><div class="row between" style="align-items:flex-start"><div class="t">${esc(r.title)}</div><span class="chip ${r.priority === 1 ? 'bad' : ''}">${esc(KIND[r.kind] || r.kind)}</span></div>
      <div class="m" style="-webkit-line-clamp:5">${esc(r.detail || '')}</div>
      <div class="row wrap" style="margin-top:10px">${r.url ? `<a class="btn sm pri" href="${esc(r.url)}" target="_blank" rel="noopener">Aç ↗</a>` : ''}${r.app_id && r.status === 'open' && ['needs_human', 'handoff'].includes(r.kind) ? `<button class="btn sm pri" data-ho="${r.app_id}">Yeniden başlat + canlı devral</button>` : ''}${r.app_id ? `<a class="btn sm" href="#/basvuru/${r.app_id}">Başvuru</a>` : ''}${r.status === 'open' ? `<button class="btn sm" data-id="${r.id}">Yaptım</button>` : ''}<span class="tiny muted">${when(r.created_at)}</span></div></div></div>`;
  setMain(`${head('Sana kalanlar', 'Sistem bunları beklemeden işine devam eder. Burada yalnızca senin yapabileceğin işler var: mülakat, robot doğrulaması, teklif. Yenileri Gmail\'ine de gelir.')}
    <section class="sheet flush"><div class="list">${open.length ? open.map(item).join('') : '<div class="empty">Şu an sana kalan bir iş yok.</div>'}</div></section>
    ${rows.length > open.length ? `<details style="margin-top:16px"><summary>Tamamlananlar (${rows.length - open.length})</summary><section class="sheet flush" style="margin-top:8px"><div class="list">${rows.filter((r) => r.status !== 'open').map(item).join('')}</div></section></details>` : ''}`);
  $$('[data-id]').forEach((b) => b.onclick = async () => { await post(`/actions/${b.dataset.id}/done`); viewActions(); });
  $$('[data-ho]').forEach((b) => b.onclick = async () => { b.disabled = true; await post(`/applications/${b.dataset.ho}/retry`, { handoff: true }); toast('Başladı. Ajan formu doldurup robot doğrulamasında seni bekleyecek; canlı bağlantı Gmail\'ine ve buraya gelecek (2-4 dk).', 6000); setTimeout(viewActions, 1500); });
}


// ---------- Hesaplar ve girişler ----------
async function viewAccounts() {
  shell('#/hesaplar');
  const d = await api('/accounts');
  const QUICK = [['Google', 'https://accounts.google.com/'], ['LinkedIn', 'https://www.linkedin.com/login'], ['Y Combinator (Work at a Startup)', 'https://account.ycombinator.com/'], ['Himalayas', 'https://himalayas.app/login'], ['Torre', 'https://torre.ai/'], ['Wellfound', 'https://wellfound.com/login'], ['micro1', 'https://jobs.micro1.ai/']];
  setMain(`${head('Hesaplar ve girişler', 'Bazı siteler başvuru için hesap ya da "Google ile giriş" istiyor. Buradan bir kez canlı tarayıcıda giriş yaparsın; oturum şifreli saklanır ve ajan sonraki başvurularda aynı oturumla devam eder.')}
    <section class="sheet"><h2>Bir siteye giriş yap</h2>
      <p class="small muted" style="margin:0 0 10px">Düğmeye bas: 1-2 dakika içinde canlı tarayıcı bağlantısı Gmail'ine ve "Sana kalanlar"a gelir. Aç, giriş yap, "Done"a bas. Oturum dakikada bir de kendiliğinden kaydedilir.</p>
      <div class="row wrap">${QUICK.map(([l, u]) => `<button class="btn sm" data-login="${u}">${l}</button>`).join('')}</div>
      <form id="lg" class="row" style="margin-top:12px"><input type="text" id="lu" placeholder="Başka bir site: https://…" inputmode="url" aria-label="Site adresi"><button class="btn pri">Aç</button></form>
    </section>
    <section class="sheet flush" style="margin-top:16px"><h2>Kayıtlı oturumlar (${d.sessions.length})</h2>
      <div class="list">${d.sessions.length ? d.sessions.map((x) => `<div class="item"><div class="main"><div class="t">${esc(x.domain)}</div><div class="m">${x.count} çerez · ${esc(x.note || '')} · ${when(x.updated_at)}</div></div><div class="r"><button class="btn sm danger" data-del="${esc(x.domain)}">Sil</button></div></div>`).join('') : '<div class="empty">Henüz kayıtlı oturum yok.</div>'}</div></section>
    <section class="sheet flush" style="margin-top:16px"><h2>Açılan hesaplar (${d.accounts.length})</h2>
      <div class="list">${d.accounts.length ? d.accounts.map((x) => `<div class="item"><div class="main"><div class="t">${esc(x.site)}</div><div class="m">${esc(x.username || '')} · ${x.has_password ? 'şifre kasada (şifreli)' : 'şifresiz (e-posta kodu/bağlantısı)'} · ${esc(x.notes || '')}</div></div><div class="r"><span>${when(x.updated_at)}</span></div></div>`).join('') : '<div class="empty">Henüz hesap yok.</div>'}</div></section>
    <details class="sheet" style="margin-top:16px"><summary>Google ile giriş nasıl çalışır?</summary><p class="small" style="margin:10px 0 0">destek@ozgurguler.tech bir Google hesabı değil. "Google ile giriş" isteyen siteler için en temizi, destek@ozgurguler.tech adresiyle bir Google hesabı açmak (Google, Gmail olmayan adresle hesap açmaya izin verir: accounts.google.com → Hesap oluştur → "Mevcut e-posta adresimi kullan"). Böylece tüm siteler aynı e-postayı görür ve gelen postaları ajan okuyabilir. Sonra yukarıdan "Google"a basıp bir kez giriş yaparsın. Google bazen başka bir cihazdan gelen oturumu yeniden doğrulama isteyebilir; o zaman bu sayfadan tekrar giriş yapman yeterli.</p></details>`);
  const start = async (u) => { try { const r = await post('/sessions/login', { url: u }); toast(r.note || 'Başladı', 6000); } catch (e) { toast(e.message); } };
  $$('[data-login]').forEach((b) => b.onclick = () => start(b.dataset.login));
  $('#lg').onsubmit = (e) => { e.preventDefault(); const u = $('#lu').value.trim(); if (u) start(/^https?:/.test(u) ? u : 'https://' + u); };
  $$('[data-del]').forEach((b) => b.onclick = async () => { await post(`/sessions/${encodeURIComponent(b.dataset.del)}/delete`); viewAccounts(); });
}

// ---------- Kaynaklar ----------
async function viewSources() {
  shell('#/kaynaklar');
  const d = await api('/sources');
  setMain(`${head('Kaynaklar', 'İlan panoları ve ilanlardan öğrenilen şirket kariyer sayfaları. Beyin, sonuçlara göre kaynakların ağırlığını ayarlar.')}
    <section class="sheet flush scroll-x"><table class="t"><tr><th>Kaynak</th><th>Son tarama</th><th>Son tur</th><th>Toplam</th><th>Uygun</th><th>Başvuru</th><th></th></tr>
    ${d.sources.map((s) => `<tr><td><b>${esc(s.label)}</b><div class="tiny muted">${esc(s.id)} · ${s.cadence} dk'da bir</div></td><td>${s.state.last ? when(s.state.last) : '—'} ${s.state.ok === false ? `<div class="tiny" style="color:var(--bad)">${esc(s.state.err || '')}</div>` : ''}</td><td class="num">${s.state.seen != null ? `${s.state.seen} / ${s.state.added} yeni` : '—'}</td><td class="num">${s.stats.n || 0}</td><td class="num">${s.stats.ok || 0}</td><td class="num">${s.stats.applied || 0}</td><td><button class="btn sm" data-run="${s.id}">Tara</button></td></tr>`).join('')}</table></section>
    <section class="sheet flush" style="margin-top:16px"><h2>Şirket kariyer sayfaları (${d.boards.filter((b) => b.status === 'active').length} etkin)</h2><p class="small muted" style="margin:0;padding:0 18px 8px">İlanlardan otomatik öğrenilir. Herkesin başvurduğu ünlü şirketlerin sayfaları taranmaz.</p>
    <div class="scroll-x"><table class="t"><tr><th>Şirket</th><th>Sistem</th><th>Nereden</th><th>Bulunan</th><th>Son tarama</th><th>Durum</th></tr>${d.boards.map((b) => `<tr><td>${esc(b.company || b.slug)}</td><td>${esc(b.ats)}</td><td class="tiny">${esc(b.added_from || '')}</td><td class="num">${b.jobs_seen}</td><td>${b.last_polled ? when(b.last_polled) : '—'}</td><td>${b.status === 'active' ? '<span class="chip ok">etkin</span>' : b.status === 'famous' ? '<span class="chip">ünlü, atlanıyor</span>' : '<span class="chip">kapalı</span>'}</td></tr>`).join('')}</table></div></section>`);
  $$('[data-run]').forEach((b) => b.onclick = async () => { b.disabled = true; b.textContent = '…'; try { const r = await post('/run/' + b.dataset.run); toast(r.error ? 'Hata: ' + r.error : `${r.seen} ilan, ${r.added} yeni`); } catch (e) { toast(e.message); } viewSources(); });
}

// ---------- Modeller ve maliyet ----------
async function viewModels() {
  shell('#/modeller');
  const [m, c] = await Promise.all([api('/models'), api('/costs')]);
  const tasks = Object.keys(m.defaults);
  const TASK = { triage: 'Ön eleme', analysis: 'Derin analiz', letter: 'Ön yazı', answers: 'Form cevapları', agent: 'Tarayıcı ajanı', agent_hard: 'Zor sayfalar', mail: 'E-posta özeti', brain: 'Beyin (sohbet)', review: 'Öz değerlendirme', judge: 'Doğruluk denetimi' };
  const ev0 = m.evals[0];
  setMain(`${head('Modeller ve maliyet', 'Her görev için model, haftalık yarışmayla seçilir. Tüm yapay zekâ Cloudflare Workers AI üzerinde (Startup kredisi); hızlı evet/hayır yargıları TypeSafe Jev ile.', '<button class="btn sm" id="ev">Yarışmayı şimdi çalıştır</button>')}
    <div class="funnel" style="grid-template-columns:repeat(3,minmax(0,1fr))">
      <div><b>${usd(c.total)}</b><span>kurulumdan beri</span></div><div><b>${usd(c.daily[0]?.cost)}</b><span>bugün · ${c.daily[0]?.calls || 0} çağrı</span></div><div><b>2.500 $</b><span>Workers AI kredisi</span></div></div>
    <section class="sheet flush scroll-x"><h2>Görev → model</h2><table class="t"><tr><th>Görev</th><th>Kullanılan (yedekler)</th></tr>${tasks.map((t) => `<tr><td>${TASK[t] || t}</td><td class="mono">${esc([m.custom[t], ...m.defaults[t].filter((x) => x !== m.custom[t])].filter(Boolean).map((x) => x.split('/').pop()).join(' → '))}</td></tr>`).join('')}</table></section>
    ${ev0 ? `<section class="sheet flush scroll-x" style="margin-top:16px"><h2>Son model yarışması <span class="muted small">${dateTime(ev0.ts)}</span></h2><table class="t"><tr><th>Model</th><th>Eleme</th><th>Form</th><th>Araç</th><th>Ön yazı</th><th>Maliyet</th><th>Gecikme</th></tr>${(ev0.results || []).sort((a, b) => (b.triage + b.form + (b.letterScore || b.letter || 0)) - (a.triage + a.form + (a.letterScore || a.letter || 0))).map((r) => `<tr><td class="mono">${esc(r.model.split('/').pop())}</td><td class="num">${(+r.triage).toFixed(2)}</td><td class="num">${(+r.form).toFixed(2)}</td><td class="num">${r.tools}</td><td class="num">${(+(r.letterScore ?? r.letter ?? 0)).toFixed(2)}</td><td class="num">${(+r.cost).toFixed(4)} $</td><td class="num">${r.p50} ms</td></tr>`).join('')}</table></section>` : ''}
    <section class="sheet flush scroll-x" style="margin-top:16px"><h2>Son 7 gün kullanım</h2><table class="t"><tr><th>Model</th><th>Görev</th><th>Çağrı</th><th>Girdi</th><th>Çıktı</th><th>Hata</th><th>Maliyet</th></tr>${m.usage.map((u) => `<tr><td class="mono">${esc(u.model.split('/').pop())}</td><td>${TASK[u.task] || esc(u.task)}</td><td class="num">${u.calls}</td><td class="num">${(u.in_tok / 1000).toFixed(0)}k</td><td class="num">${(u.out_tok / 1000).toFixed(0)}k</td><td class="num">${u.errors}</td><td class="num">${(+u.cost).toFixed(4)} $</td></tr>`).join('') || '<tr><td colspan="7" class="muted">Henüz yok</td></tr>'}</table></section>
    <section class="sheet flush scroll-x" style="margin-top:16px"><h2>Günlük</h2><table class="t"><tr><th>Gün</th><th>Yapay zekâ</th><th>Tarayıcı</th><th>Başvuru</th><th>E-posta</th><th>Jev token</th></tr>${c.usage.map((u) => { const ai = c.daily.find((x) => x.day === u.day); return `<tr><td class="num">${u.day}</td><td class="num">${usd(ai?.cost)}</td><td class="num">${Math.round((u.browser_ms || 0) / 60000)} dk</td><td class="num">${u.applications || 0}</td><td class="num">${u.emails_sent || 0}</td><td class="num">${(u.jev_tokens || 0).toLocaleString('tr')}</td></tr>`; }).join('')}</table></section>`);
  $('#ev').onclick = async (e) => { e.target.disabled = true; const r = await post('/run/eval'); toast(r.note || 'Başladı', 4000); };
}

// ---------- Günlük ----------
async function viewLog(params) {
  const type = params.get('t') || '';
  shell('#/gunluk');
  const rows = await api('/events' + (type ? `?type=${type}` : ''));
  const types = [['', 'Tümü'], ['apply', 'Başvuru'], ['discover', 'Keşif'], ['triage', 'Eleme'], ['mail', 'E-posta'], ['alert', 'Bildirim'], ['brain', 'Beyin'], ['account', 'Hesap'], ['eval', 'Model'], ['tick', 'Tur']];
  setMain(`${head('Günlük', 'Sistemin yaptığı her şey. 60 gün saklanır.')}
    <div class="filters">${types.map(([t, l]) => `<button data-t="${t}" class="${type === t ? 'on' : ''}">${l}</button>`).join('')}</div>
    <section class="sheet flush"><div class="feed">${rows.map((e) => `<div class="e ${e.level}"><div class="tm">${clock(e.ts)}<br>${new Date(e.ts + TR).toISOString().slice(5, 10)}</div><div class="x"><span class="tag">${esc(e.type)}</span>${esc(e.msg)}${e.ref && e.ref.startsWith('app_') ? ` <a class="tiny" href="#/basvuru/${e.ref}">başvuru</a>` : ''}${e.data ? `<details><summary>ayrıntı</summary><div class="pre mono">${esc(e.data)}</div></details>` : ''}</div></div>`).join('') || '<div class="empty">Kayıt yok.</div>'}</div></section>`);
  $$('[data-t]').forEach((b) => b.onclick = () => { location.hash = '#/gunluk' + (b.dataset.t ? `?t=${b.dataset.t}` : ''); });
}

// ---------- Ayarlar ----------
async function viewSettings() {
  shell('#/ayarlar');
  const [s, facts] = await Promise.all([api('/settings'), api('/facts')]);
  const F = [
    ['auto_apply', 'Otomatik başvuru', 'bool', 'uygun ilanlara kendi başına başvurur'],
    ['paused', 'Duraklat', 'bool', 'tüm otomatik işler durur'],
    ['daily_apply_limit', 'Günlük başvuru sınırı', 'num'],
    ['min_fit_apply', 'Otomatik başvuru için en düşük uyum', 'num', '0-100'],
    ['min_fit_review', 'Bunun altındaki ilanlar elenir', 'num'],
    ['daily_ai_budget_usd', 'Günlük yapay zekâ bütçesi ($)', 'num', '2.500 $/yıl ≈ 6,8 $/gün'],
    ['daily_browser_minutes', 'Günlük tarayıcı dakikası', 'num', 'ayda 10 saat dahil, sonrası 0,09 $/saat'],
    ['monthly_browser_hours', 'Aylık tarayıcı saati sınırı', 'num'],
    ['handoff_wait_minutes', 'Robot doğrulamasında seni bekleme (dk)', 'num', 'gündüz ya da panel açıkken'],
    ['recording_days', 'Ekran kaydı saklama (gün)', 'num'],
    ['alert_email', 'Anında bildirim adresi', 'text', 'mülakat, teklif, işveren mesajı, robot doğrulaması'],
    ['digest_email', 'Sabah özet e-postası', 'bool'],
    ['auto_reply_mail', 'İşveren sorularına otomatik cevap', 'bool', 'kapalıyken taslak hazırlar, sen gönderirsin'],
    ['prefer_async_roles', 'Yazılı/asenkron işleri öne al', 'bool'],
  ];
  const input = ([k, l, t, h]) => `<div><label class="f" for="s_${k}">${l}${h ? ` <span>— ${h}</span>` : ''}</label>${t === 'bool' ? `<select id="s_${k}" data-k="${k}" data-t="bool"><option value="true" ${s[k] ? 'selected' : ''}>Açık</option><option value="false" ${!s[k] ? 'selected' : ''}>Kapalı</option></select>` : `<input id="s_${k}" data-k="${k}" data-t="${t}" type="${t === 'num' ? 'number' : 'text'}" inputmode="${t === 'num' ? 'decimal' : 'text'}" value="${esc(s[k] ?? '')}">`}</div>`;
  setMain(`${head('Ayarlar', 'Değişiklikler anında kaydedilir. Beyin de bu ayarları sonuçlarına göre, belirli sınırlar içinde günceller.')}
    <section class="sheet"><div class="grid g2" style="gap:0 20px">${F.map(input).join('')}</div></section>
    <section class="sheet" style="margin-top:16px"><h2>Başvurularda kullanılan CV</h2><p class="small muted" style="margin:0 0 10px">ozgurguler.tech'teki CV'lerin kopyası; 3 günde bir yenilenir. İlan dili Türkçeyse Türkçe, değilse İngilizce CV yüklenir.</p>
      <div class="row wrap"><a class="btn sm pri" href="/api/cv/en" target="_blank" rel="noopener">İngilizce CV'yi aç</a><a class="btn sm" href="/api/cv/en?download=1">İndir</a><a class="btn sm pri" href="/api/cv/tr" target="_blank" rel="noopener">Türkçe CV'yi aç</a><a class="btn sm" href="/api/cv/tr?download=1">İndir</a></div>
      <details style="margin-top:10px"><summary>Ajanın okuduğu CV metni (İngilizce)</summary><div class="pre small" id="cvt">Yükleniyor…</div></details></section>
    <div class="grid g2" style="margin-top:16px">
      <section class="sheet"><h2>Engelli şirketler ve alan adları</h2><label class="f" for="bc">Şirketler <span>(virgülle)</span></label><input id="bc" data-k="blocked_companies" data-t="arr" type="text" value="${esc((s.blocked_companies || []).join(', '))}"><label class="f" for="bd">Alan adları</label><input id="bd" data-k="blocked_domains" data-t="arr" type="text" value="${esc((s.blocked_domains || []).join(', '))}"></section>
      <section class="sheet"><h2>Öğrenilmiş kurallar</h2><p class="small muted" style="margin:0 0 8px">Beynin öz değerlendirmede eklediği kurallar.</p>${Object.entries(s.prompt_addenda || {}).map(([k, v]) => `<details><summary>${esc(k)}</summary><div class="pre small">${esc(v)}</div></details>`).join('') || '<p class="muted small" style="margin:0">Henüz yok.</p>'}
        <h3>Rol ağırlıkları</h3><div class="mono">${esc(JSON.stringify(s.role_weights))}</div><h3>Kaynak ağırlıkları</h3><div class="mono">${esc(JSON.stringify(s.source_weights))}</div></section>
    </div>
    <section class="sheet flush" style="margin-top:16px"><div class="row between" style="padding:14px 18px 0"><h2 style="margin:0">Profil bilgileri (${facts.length})</h2><button class="btn sm" id="af">Bilgi ekle</button></div><p class="small muted" style="margin:6px 0 8px;padding:0 18px">Başvurularda yalnızca CV ve buradaki bilgiler kullanılır.</p>
      <div class="scroll-x" style="max-height:420px;overflow:auto"><table class="t">${facts.map((f) => `<tr><td class="mono" style="width:32%">${esc(f.key)}</td><td class="small">${esc(String(f.value).slice(0, 300))}</td><td class="tiny muted">${esc(String(f.source || '').slice(0, 40))}</td></tr>`).join('')}</table></div></section>
    <section class="sheet" style="margin-top:16px"><h2>Bakım</h2><div class="row wrap"><button class="btn sm" data-run="mail">E-postaları şimdi işle</button><button class="btn sm" data-run="triage">Eleme turu</button><button class="btn sm" data-run="review">Öz değerlendirme yap</button><button class="btn sm" data-run="digest">Özet e-postası gönder</button></div></section>`);
  $$('[data-k]').forEach((el) => el.onchange = async () => {
    const t = el.dataset.t; let v = el.value;
    if (t === 'bool') v = v === 'true'; else if (t === 'num') v = Number(v); else if (t === 'arr') v = v.split(',').map((x) => x.trim()).filter(Boolean);
    try { await post('/settings', { key: el.dataset.k, value: v }); toast('Kaydedildi'); } catch (e) { toast(e.message); }
  });
  api('/cv/en?format=text').then((r) => { const el = $('#cvt'); if (el) el.textContent = r.text; }).catch(() => {});
  $('#af').onclick = async () => { const k = prompt('Anahtar (ör. notice_period):'); if (!k) return; const v = prompt('Değer:'); if (v == null) return; await post('/facts', { key: k, value: v }); viewSettings(); };
  $$('[data-run]').forEach((b) => b.onclick = async () => { b.disabled = true; try { const r = await post('/run/' + b.dataset.run); toast(typeof r === 'object' ? (r.summary || r.note || 'Tamam') : 'Tamam', 5000); } catch (e) { toast(e.message); } b.disabled = false; });
}

function viewMenu() {
  shell('#/menu', `${head('Menü')}${GROUPS.map(([g, items]) => `<div class="eyebrow" style="margin:18px 0 8px">${g}</div><section class="sheet flush"><div class="list">${items.map(([h, l]) => `<a class="item" href="${h}"><div class="main"><div class="t">${l}</div></div>${badge(h)}<div class="r">→</div></a>`).join('')}</div></section>`).join('')}
    <div style="margin-top:20px"><button class="btn" id="lo2">Çıkış yap</button></div>`);
  $('#lo2').onclick = logout;
}

// ---------- yönlendirme ----------
async function router() {
  const [path, qs] = (location.hash.slice(1) || '/').split('?');
  const params = new URLSearchParams(qs || '');
  const seg = path.split('/').filter(Boolean);
  try {
    if (!seg.length) return await viewOverview();
    switch (seg[0]) {
      case 'ilanlar': return await viewJobs(params);
      case 'ilan': return await viewJob(seg[1]);
      case 'basvurular': return await viewApps(params);
      case 'basvuru': return await viewApp(seg[1]);
      case 'kayitlar': return await viewRecs();
      case 'kayit': return await viewPlayer(seg[1]);
      case 'posta': return await viewMail(params);
      case 'eposta': return await viewMailOne(decodeURIComponent(seg[1]));
      case 'beyin': return await viewBrain();
      case 'hafiza': return await viewMemory();
      case 'yapilacaklar': return await viewActions();
      case 'kaynaklar': return await viewSources();
      case 'modeller': return await viewModels();
      case 'hesaplar': return await viewAccounts();
      case 'gunluk': return await viewLog(params);
      case 'ayarlar': return await viewSettings();
      case 'menu': return viewMenu();
      default: return await viewOverview();
    }
  } catch (e) {
    if (e.message === 'login') return;
    const m = $('#main');
    const msg = `<div class="note red">Sayfa yüklenemedi: ${esc(e.message)}. <a href="#" onclick="location.reload();return false">Yeniden dene</a></div>`;
    if (m) m.innerHTML = msg; else app.innerHTML = `<div class="boot">${msg}</div>`;
  }
}
window.addEventListener('hashchange', router);
router();
