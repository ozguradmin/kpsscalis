// Özgür İş Ajanı paneli — bağımlılıksız tek sayfa uygulama.
const $ = (s, el = document) => el.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const app = $('#app');
let state = { counts: {}, actions: 0 };

async function api(path, opts = {}) {
  const r = await fetch('/api' + path, { ...opts, headers: { 'content-type': 'application/json', ...(opts.headers || {}) }, body: opts.body ? JSON.stringify(opts.body) : undefined });
  if (r.status === 401) { renderLogin(); throw new Error('login'); }
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.error || r.statusText);
  return j;
}
const post = (p, body = {}) => api(p, { method: 'POST', body });

function toast(msg, ms = 2600) {
  const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg; document.body.appendChild(t);
  setTimeout(() => t.remove(), ms);
}

const TR = 3 * 3600000;
function when(ts) {
  if (!ts) return '';
  const t = typeof ts === 'string' ? Date.parse(ts) : Number(ts);
  const d = Date.now() - t;
  if (d < 60000) return 'az önce';
  if (d < 3600000) return `${Math.round(d / 60000)} dk önce`;
  if (d < 86400000) return `${Math.round(d / 3600000)} sa önce`;
  if (d < 7 * 86400000) return `${Math.round(d / 86400000)} gün önce`;
  return new Date(t + TR).toISOString().slice(0, 10);
}
function clock(ts) { return new Date(Number(ts) + TR).toISOString().slice(11, 16); }
function dateTime(ts) { if (!ts) return '—'; const t = typeof ts === 'string' ? Date.parse(ts) : Number(ts); return new Date(t + TR).toISOString().replace('T', ' ').slice(0, 16); }
const usd = (n) => `${Number(n || 0).toFixed(Number(n) < 1 ? 3 : 2)} $`;

const JOB_ST = { new: ['Yeni', ''], approved: ['Başvurulacak', 'acc'], review: ['İncelemede', 'info'], rejected: ['Elendi', ''], queued: ['Sırada', 'acc'], applied: ['Başvuruldu', 'ok'], needs_human: ['Sana kaldı', 'warn'], expired: ['Süresi geçti', ''], blocked: ['Engel', 'bad'], apply_failed: ['Başarısız', 'bad'] };
const APP_ST = { queued: ['Sırada', ''], prepared: ['Hazırlandı', 'info'], applying: ['Başvuruyor…', 'acc'], submitted: ['Gönderildi', 'ok'], confirmed: ['Onaylandı', 'ok'], next_step: ['Sonraki adım', 'warn'], interview: ['Mülakat', 'warn'], offer: ['Teklif', 'ok'], rejected: ['Olumsuz', 'bad'], needs_human: ['Sana kaldı', 'warn'], not_eligible: ['Uygun değil', ''], closed: ['İlan kapalı', ''], blocked: ['Engel', 'bad'], failed: ['Başarısız', 'bad'], cancelled: ['İptal', ''] };
const MAIL_CAT = { verification: ['Doğrulama', ''], confirmation: ['Başvuru onayı', 'ok'], rejection: ['Olumsuz', 'bad'], interview: ['Mülakat', 'warn'], assessment: ['Sonraki adım/test', 'warn'], recruiter: ['İşveren mesajı', 'info'], offer: ['Teklif', 'ok'], reminder: ['Hatırlatma', ''], survey: ['Anket', ''], newsletter: ['Bülten', ''], other: ['Diğer', ''] };
const pill = (map, s) => { const [l, c] = map[s] || [s, '']; return `<span class="pill ${c}">${esc(l)}</span>`; };
const fitPill = (f) => f == null ? '' : `<span class="fit" style="background:${f >= 75 ? 'var(--ok-soft)' : f >= 55 ? 'var(--accent-soft)' : 'var(--panel2)'};color:${f >= 75 ? 'var(--ok)' : f >= 55 ? 'var(--accent)' : 'var(--muted)'}">${f}</span>`;

// ---------- giriş ----------
function renderLogin() {
  app.innerHTML = `<div class="login"><form class="card" id="lf">
    <div class="brand" style="padding:0 0 14px"><div class="dot">✦</div><div>İş Ajanı<small>Özgür Güler</small></div></div>
    <label class="f">Parola</label><input type="password" id="pw" autocomplete="current-password" autofocus>
    <div class="err" id="le"></div>
    <button class="btn pri" style="width:100%;justify-content:center;margin-top:6px">Giriş</button></form></div>`;
  $('#lf').onsubmit = async (e) => {
    e.preventDefault();
    const r = await fetch('/api/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ password: $('#pw').value }) });
    const j = await r.json().catch(() => ({}));
    if (r.ok) { location.hash = '#/'; boot(); } else $('#le').textContent = j.error || 'Giriş başarısız';
  };
}

// ---------- iskelet ----------
const NAV = [
  ['#/', '◎', 'Genel'], ['#/basvurular', '✉', 'Başvurular'], ['#/ilanlar', '☰', 'İlanlar'], ['#/beyin', '✦', 'Beyin'], ['#/yapilacaklar', '!', 'Sana kalanlar'],
  ['#/posta', '@', 'E-posta'], ['#/kayitlar', '▶', 'Kayıtlar'], ['#/kaynaklar', '⌘', 'Kaynaklar'], ['#/modeller', '◈', 'Modeller & maliyet'], ['#/gunluk', '≡', 'Günlük'], ['#/ayarlar', '⚙', 'Ayarlar'],
];
function shell(active, inner) {
  const nav = NAV.map(([h, i, l]) => `<a href="${h}" class="${active === h ? 'on' : ''}"><span>${i}</span>${l}${h === '#/yapilacaklar' && state.actions ? `<span class="n">${state.actions}</span>` : ''}</a>`).join('');
  const tabs = [['#/', '◎', 'Genel'], ['#/basvurular', '✉', 'Başvuru'], ['#/beyin', '✦', 'Beyin'], ['#/yapilacaklar', '!', 'Sana'], ['#/menu', '⋯', 'Daha']];
  app.innerHTML = `<div class="shell"><aside class="side"><div class="brand"><div class="dot">✦</div><div>İş Ajanı<small>Özgür Güler · v2</small></div></div><nav class="nav">${nav}</nav><div class="foot"><a href="#" id="lo">Çıkış</a></div></aside><main id="main">${inner}</main></div>
    <nav class="tabbar">${tabs.map(([h, i, l]) => `<a href="${h}" class="${active === h ? 'on' : ''}"><b>${i}</b>${l}${h === '#/yapilacaklar' && state.actions ? `<span class="n">${state.actions}</span>` : ''}</a>`).join('')}</nav>`;
  $('#lo').onclick = async (e) => { e.preventDefault(); await post('/logout'); renderLogin(); };
}
const setMain = (html) => { $('#main').innerHTML = html; };

// ---------- Genel ----------
async function viewOverview() {
  shell('#/', '<div class="empty">Yükleniyor…</div>');
  const d = await api('/overview');
  state.actions = d.actions.length;
  const s = d.summary, a = s.applications || {};
  const sent = (a.submitted || 0) + (a.confirmed || 0) + (a.interview || 0) + (a.next_step || 0) + (a.offer || 0) + (a.rejected || 0);
  const tickAge = d.settings.last_tick ? Date.now() - d.settings.last_tick : Infinity;
  const health = tickAge < 25 * 60000 ? `<span class="pill ok">● Çalışıyor · son tur ${when(d.settings.last_tick)}</span>` : `<span class="pill bad">● Son tur ${d.settings.last_tick ? when(d.settings.last_tick) : 'hiç'} — kontrol et</span>`;
  const days = []; for (let i = 13; i >= 0; i--) days.push(new Date(Date.now() + TR - i * 86400000).toISOString().slice(0, 10));
  const tmap = Object.fromEntries(d.trend.map((x) => [x.d, x])), amap = Object.fromEntries(d.appTrend.map((x) => [x.d, x.n]));
  const max = Math.max(1, ...days.map((k) => tmap[k]?.found || 0));
  const bars = days.map((k) => { const f = tmap[k]?.found || 0, ok = tmap[k]?.ok || 0; return `<div class="b" title="${k}: ${f} ilan, ${ok} uygun, ${amap[k] || 0} başvuru"><span class="a1" style="height:${(f - ok) / max * 100}%"></span><span class="a2" style="height:${Math.max(ok ? 3 : 0, ok / max * 100)}%"></span></div>`; }).join('');
  const lbl = days.map((k, i) => `<span>${i % 2 ? '' : k.slice(8)}</span>`).join('');
  const budgetPct = Math.min(100, d.ai_cost_today / d.settings.daily_ai_budget_usd * 100);
  const brPct = Math.min(100, d.browser_hours_month / d.settings.monthly_browser_hours * 100);
  setMain(`
    <div class="top"><div><h1>Merhaba Özgür</h1><div class="sub">Sistem senin yerine ilan arıyor, eliyor ve başvuruyor. ${health}</div></div>
      <div class="row"><button class="btn sm" id="pz">${d.settings.paused ? '▶ Devam ettir' : '⏸ Duraklat'}</button><button class="btn sm pri" id="tk">Şimdi bir tur çalıştır</button></div></div>
    ${d.settings.paused ? '<div class="alert bad">Sistem duraklatıldı. Yeni ilan arama ve başvuru yapılmıyor.</div><div class="sp"></div>' : ''}
    ${d.actions.length ? `<div class="alert"><b>${d.actions.length} şey sana kaldı</b> — mülakat davetleri, robot doğrulamaları gibi sadece senin yapabileceğin işler. <a href="#/yapilacaklar">Gör →</a></div><div class="sp"></div>` : ''}
    <div class="grid g4">
      <div class="card stat"><div class="k">Son 24 saat</div><div class="v">${s.jobs_24h}</div><div class="d">yeni ilan tarandı · toplam ${s.jobs_total.toLocaleString('tr')}</div></div>
      <div class="card stat"><div class="k">Başvurulacak</div><div class="v">${s.approved_waiting}</div><div class="d">uygun bulundu, sırada</div></div>
      <div class="card stat"><div class="k">Gönderilen</div><div class="v">${sent}</div><div class="d">${s.submitted_7d} tanesi son 7 günde · bugün ${d.usage.applications || 0}/${d.settings.daily_apply_limit}</div></div>
      <div class="card stat"><div class="k">Olumlu dönüş</div><div class="v">${(a.confirmed || 0) + (a.interview || 0) + (a.next_step || 0) + (a.offer || 0)}</div><div class="d">${a.interview || 0} mülakat · ${a.confirmed || 0} onay · ${a.offer || 0} teklif</div></div>
    </div><div class="sp"></div>
    <div class="grid g2">
      <div class="card"><div class="row between"><h2>Son 14 gün</h2><div class="legend"><span><i style="background:var(--line)"></i>taranan</span><span><i style="background:var(--accent)"></i>uygun</span></div></div><div class="bars">${bars}</div><div class="bars lbl" style="height:auto">${lbl}</div></div>
      <div class="card"><h2>Şu an</h2>
        ${d.running.length ? d.running.map((r) => `<a class="item" href="#/basvuru/${r.id}"><div class="main"><div class="t">${esc(r.company)}</div><div class="m">${esc(r.title)}</div></div><div class="r">${pill(APP_ST, r.status)}<br>${r.rec ? `<a href="#/kayit/${r.rec}">▶ izle</a>` : ''}</div></a>`).join('') : '<div class="muted small">Şu an süren başvuru yok.</div>'}
        <div class="sp"></div>
        <div class="small row between"><span>Yapay zekâ bugün</span><b>${usd(d.ai_cost_today)} / ${d.settings.daily_ai_budget_usd} $</b></div><div class="meter"><i style="width:${budgetPct}%"></i></div>
        <div class="sp" style="height:8px"></div>
        <div class="small row between"><span>Tarayıcı bu ay</span><b>${d.browser_hours_month.toFixed(1)} / ${d.settings.monthly_browser_hours} saat</b></div><div class="meter"><i style="width:${brPct}%"></i></div>
        <div class="tiny muted" style="margin-top:6px">Hepsi Cloudflare kredinden ve ücretsiz kotalardan karşılanıyor. Eleme kuyruğu: ${Object.values(s.triage_backlog || {}).reduce((x, y) => x + y, 0)} ilan.</div>
      </div>
    </div><div class="sp"></div>
    <div class="grid g2">
      <div class="card"><div class="row between"><h2>Son başvurular</h2><a class="small" href="#/basvurular">Tümü →</a></div><div class="list">${d.recent.length ? d.recent.map((r) => `<a class="item" href="#/basvuru/${r.id}"><div class="main"><div class="t">${esc(r.company)}</div><div class="m">${esc(r.title)} · ${esc(r.source)}</div></div><div class="r">${pill(APP_ST, r.status)}<br>${when(r.updated_at)}</div></a>`).join('') : '<div class="empty">Henüz başvuru yok. İlk turdan sonra burada görünecek.</div>'}</div></div>
      <div class="card"><div class="row between"><h2>Canlı akış</h2><a class="small" href="#/gunluk">Günlük →</a></div><div class="feed">${d.events.slice(0, 18).map(ev).join('')}</div></div>
    </div>`);
  $('#tk').onclick = async (e) => { e.target.disabled = true; e.target.textContent = 'Çalışıyor…'; try { await post('/run/tick'); toast('Tur tamamlandı'); } catch (x) { toast(x.message); } viewOverview(); };
  $('#pz').onclick = async () => { await post('/settings', { key: 'paused', value: !d.settings.paused }); viewOverview(); };
}
const ev = (e) => `<div class="e ${e.level}"><div class="tm">${clock(e.ts)}</div><div class="x"><span class="tag">${esc(e.type)}</span>${esc(e.msg)}</div></div>`;

// ---------- İlanlar ----------
async function viewJobs(params) {
  const st = params.get('status') || 'eligible', q = params.get('q') || '', page = Number(params.get('page') || 0);
  shell('#/ilanlar', '<div class="empty">Yükleniyor…</div>');
  const d = await api(`/jobs?status=${st}&q=${encodeURIComponent(q)}&page=${page}`);
  const c = d.counts;
  const tabs = [['eligible', 'Uygun', (c.approved || 0) + (c.review || 0) + (c.queued || 0)], ['approved', 'Başvurulacak', c.approved], ['review', 'İncelemede', c.review], ['applied', 'Başvuruldu', c.applied], ['needs_human', 'Sana kaldı', c.needs_human], ['new', 'Elemede', c.new], ['rejected', 'Elendi', c.rejected]];
  setMain(`<div class="top"><div><h1>İlanlar</h1><div class="sub">Az bilinen ve farklı dillerdeki panolardan, şirketlerin kendi kariyer sayfalarından toplanıyor.</div></div>
    <form id="sf" style="min-width:220px"><input type="search" id="q" placeholder="Başlık, şirket, konum…" value="${esc(q)}"></form></div>
    <div class="tabs">${tabs.map(([k, l, n]) => `<button data-st="${k}" class="${st === k ? 'on' : ''}">${l} ${n != null ? `<span class="muted">${n || 0}</span>` : ''}</button>`).join('')}</div>
    <div class="card"><div class="list">${d.rows.length ? d.rows.map((j) => `<a class="item" href="#/ilan/${j.id}">${fitPill(j.fit)}<div class="main"><div class="t">${esc(j.title)}</div><div class="m">${esc(j.company || '')} · ${esc(j.location || '')} · <span class="tiny">${esc(j.source)}${j.lang && j.lang !== 'en' ? ' · ' + j.lang.toUpperCase() : ''}</span>${j.reason ? `<br>${esc(j.reason)}` : ''}</div></div><div class="r">${pill(JOB_ST, j.status)}<br>${when(j.discovered_at)}</div></a>`).join('') : '<div class="empty">Bu filtrede ilan yok.</div>'}</div>
    <div class="row between" style="margin-top:10px"><button class="btn sm" id="pv" ${page ? '' : 'disabled'}>← Önceki</button><span class="small muted">Sayfa ${page + 1}</span><button class="btn sm" id="nx" ${d.rows.length < 50 ? 'disabled' : ''}>Sonraki →</button></div></div>`);
  document.querySelectorAll('[data-st]').forEach((b) => b.onclick = () => { location.hash = `#/ilanlar?status=${b.dataset.st}&q=${encodeURIComponent($('#q').value)}`; });
  $('#sf').onsubmit = (e) => { e.preventDefault(); location.hash = `#/ilanlar?status=${st}&q=${encodeURIComponent($('#q').value)}`; };
  $('#pv').onclick = () => { location.hash = `#/ilanlar?status=${st}&q=${encodeURIComponent(q)}&page=${page - 1}`; };
  $('#nx').onclick = () => { location.hash = `#/ilanlar?status=${st}&q=${encodeURIComponent(q)}&page=${page + 1}`; };
}

async function viewJob(id) {
  shell('#/ilanlar', '<div class="empty">Yükleniyor…</div>');
  const j = await api('/jobs/' + id);
  const a = j.analysis || {};
  setMain(`<div class="top"><div><a class="small muted" href="#/ilanlar">← İlanlar</a><h1>${esc(j.title)}</h1><div class="sub">${esc(j.company)} · ${esc(j.location || '')} · ${esc(j.source)}</div></div>
    <div class="row wrap">${pill(JOB_ST, j.status)} ${fitPill(j.fit)}</div></div>
    <div class="row wrap" style="margin-bottom:14px">
      <button class="btn pri" data-d="apply_now">Hemen başvur</button><button class="btn" data-d="approve">Sıraya al</button><button class="btn danger" data-d="reject">Reddet</button><button class="btn" id="ra">Yeniden analiz</button>
      <a class="btn" href="${esc(j.url)}" target="_blank" rel="noopener">İlanı aç ↗</a></div>
    <div class="grid g2">
      <div class="card"><h2>Değerlendirme</h2>${j.reason ? `<p>${esc(j.reason)}</p>` : ''}
        <div class="kv small">
          <div>Türkiye'den olur mu</div><div>${a.turkey_ok === true ? '✓ Evet' : a.turkey_ok === false ? '✗ Hayır' : j.turkey_ok === 1 ? '✓ Evet' : '?'} ${a.location_rule ? `<span class="muted">— ${esc(a.location_rule)}</span>` : ''}</div>
          <div>Dil şartı</div><div>${esc((a.languages_required || safeArr(j.langs_required)).join(', ') || '—')} ${a.english_level_needed ? `· İngilizce: ${esc(a.english_level_needed)}` : ''}</div>
          <div>Başvuru yolu</div><div>${esc(a.apply_method || '—')} ${a.apply_email ? `· ${esc(a.apply_email)}` : ''} ${a.needs_account ? '· hesap gerekli' : ''}</div>
          <div>Görüşme/video</div><div>${a.requires_video ? 'video istiyor · ' : ''}${esc(a.requires_calls || '—')}</div>
          <div>Sözleşme / ücret</div><div>${esc(a.contract || '—')} ${a.salary || j.salary ? '· ' + esc(a.salary || j.salary) : ''}</div>
          <div>Sende olan</div><div>${esc((a.candidate_has || []).join(', ') || '—')}</div>
          <div>Eksik</div><div>${esc((a.candidate_missing || []).join(', ') || '—')}</div>
          <div>Öne çıkarılacak</div><div>${esc(a.pitch || '—')}</div>
          <div>Riskler</div><div>${esc((a.red_flags || []).join(', ') || '—')}</div>
          ${j.jev ? `<div>Jev hızlı yargı</div><div class="mono">TR ${j.jev.turkey_ok} · başka dil ${j.jev.other_language} · şüphe ${j.jev.scam} · uyum ${j.jev.fit}/4</div>` : ''}
        </div>
        ${j.applications?.length ? `<div class="sp"></div><h3>Başvurular</h3>${j.applications.map((x) => `<a class="item" href="#/basvuru/${x.id}"><div class="main">${pill(APP_STorDef(x.status), x.status)} <span class="small muted">${dateTime(x.created_at)}</span><div class="m">${esc(x.error || '')}</div></div></a>`).join('')}` : ''}
      </div>
      <div class="card"><h2>İlan metni</h2><div class="pre" style="max-height:560px;overflow:auto">${esc(j.description || '')}</div></div>
    </div>`);
  document.querySelectorAll('[data-d]').forEach((b) => b.onclick = async () => { b.disabled = true; try { const r = await post(`/jobs/${id}/decision`, { decision: b.dataset.d }); toast(r.note || 'Tamam'); if (r.appId) location.hash = '#/basvuru/' + r.appId; else viewJob(id); } catch (e) { toast(e.message); b.disabled = false; } });
  $('#ra').onclick = async (e) => { e.target.disabled = true; e.target.textContent = 'Analiz ediliyor…'; await post(`/jobs/${id}/reanalyze`); viewJob(id); };
}
const safeArr = (s) => { try { return Array.isArray(s) ? s : JSON.parse(s || '[]') || []; } catch (e) { return []; } };
const APP_STorDef = () => APP_ST;

// ---------- Başvurular ----------
async function viewApps(params) {
  const st = params.get('status') || '';
  shell('#/basvurular', '<div class="empty">Yükleniyor…</div>');
  const d = await api('/applications' + (st ? `?status=${st}` : ''));
  const c = d.counts;
  const tabs = [['', 'Tümü'], ['submitted', 'Gönderildi'], ['confirmed', 'Onaylandı'], ['interview', 'Mülakat'], ['next_step', 'Sonraki adım'], ['needs_human', 'Sana kaldı'], ['failed', 'Başarısız'], ['rejected', 'Olumsuz']];
  setMain(`<div class="top"><div><h1>Başvurular</h1><div class="sub">Her başvurunun ön yazısı, form cevapları, ekran görüntüsü ve e-postaları kanıt olarak saklanır.</div></div></div>
    <div class="tabs">${tabs.map(([k, l]) => `<button data-st="${k}" class="${st === k ? 'on' : ''}">${l} ${k ? `<span class="muted">${c[k] || 0}</span>` : ''}</button>`).join('')}</div>
    <div class="card"><div class="list">${d.rows.length ? d.rows.map((a) => `<a class="item" href="#/basvuru/${a.id}"><div class="main"><div class="t">${esc(a.company)} <span class="muted" style="font-weight:400">— ${esc(a.title)}</span></div><div class="m">${esc(a.source)}${a.method ? ' · ' + esc(a.method) : ''}${a.error ? ' · ' + esc(a.error) : ''}</div></div><div class="r">${pill(APP_ST, a.status)}<br>${when(a.submitted_at || a.updated_at)}${a.rec ? '<br>▶ kayıt' : ''}</div></a>`).join('') : '<div class="empty">Bu filtrede başvuru yok.</div>'}</div></div>`);
  document.querySelectorAll('[data-st]').forEach((b) => b.onclick = () => { location.hash = '#/basvurular' + (b.dataset.st ? `?status=${b.dataset.st}` : ''); });
}

async function viewApp(id) {
  shell('#/basvurular', '<div class="empty">Yükleniyor…</div>');
  const a = await api('/applications/' + id);
  const ev0 = a.evidence || {};
  const answers = a.answers && typeof a.answers === 'object' ? Object.entries(a.answers) : [];
  const live = ['applying', 'prepared', 'queued'].includes(a.status);
  setMain(`<div class="top"><div><a class="small muted" href="#/basvurular">← Başvurular</a><h1>${esc(a.company)}</h1><div class="sub">${esc(a.title)} · ${esc(a.location || '')} · ${esc(a.source)}</div></div><div>${pill(APP_ST, a.status)}</div></div>
    <div class="row wrap" style="margin-bottom:14px">
      ${['failed', 'needs_human', 'blocked', 'queued'].includes(a.status) ? '<button class="btn pri" id="rt">Yeniden dene</button><button class="btn" id="ho">Canlı devral (ben yardım edeceğim)</button>' : ''}
      ${a.live_url ? `<a class="btn" href="${esc(a.live_url)}" target="_blank" rel="noopener">Canlı tarayıcıyı aç ↗</a>` : ''}
      <a class="btn" href="${esc(a.apply_url || a.url)}" target="_blank" rel="noopener">Başvuru sayfası ↗</a>
      <select id="ms" style="width:auto"><option value="">Durumu elle değiştir…</option>${['submitted', 'confirmed', 'interview', 'next_step', 'offer', 'rejected', 'cancelled'].map((s) => `<option value="${s}">${APP_ST[s][0]}</option>`).join('')}</select>
    </div>
    ${a.error ? `<div class="alert ${a.status === 'failed' || a.status === 'blocked' ? 'bad' : ''}">${esc(a.error)}</div><div class="sp"></div>` : ''}
    ${live ? '<div class="alert">Başvuru sürüyor; sayfa 10 sn\'de bir yenilenir.</div><div class="sp"></div>' : ''}
    <div class="grid g2">
      <div class="card"><h2>Kanıt</h2>
        <div class="kv small">
          <div>Oluşturuldu</div><div>${dateTime(a.created_at)}</div>
          <div>Gönderildi</div><div>${dateTime(a.submitted_at)}</div>
          <div>Yöntem</div><div>${esc(a.method || '—')} · ${a.steps || 0} adım · tarayıcı ${Math.round((a.browser_ms || 0) / 1000)} sn</div>
          <div>Son adres</div><div class="mono" style="word-break:break-all">${esc(ev0.finalUrl || ev0.final_url || '—')}</div>
          ${a.confirmation ? `<div>Onay e-postası</div><div>${esc(a.confirmation.subject || '')} <span class="muted">(${esc(a.confirmation.from || '')})</span></div>` : ''}
          ${ev0.messageId ? `<div>E-posta kimliği</div><div class="mono">${esc(ev0.messageId)} <span class="muted">(gönderim kabul edildi)</span></div>` : ''}
        </div>
        ${ev0.finalShot ? `<div class="sp"></div><a href="/api/file/${esc(ev0.finalShot)}" target="_blank"><img src="/api/file/${esc(ev0.finalShot)}" style="width:100%;border-radius:10px;border:1px solid var(--line)" alt="son ekran" loading="lazy"></a><div class="tiny muted">Son ekranın tam görüntüsü (kalıcı kanıt)</div>` : ''}
        ${ev0.finalText ? `<details style="margin-top:8px"><summary>Son sayfanın metni</summary><div class="pre small">${esc(ev0.finalText)}</div></details>` : ''}
        <div class="sp"></div><h3>Ekran kayıtları <span class="muted small">(3 gün saklanır)</span></h3>
        ${a.recordings.length ? a.recordings.map((r) => `<a class="item" href="#/kayit/${r.id}"><div class="main"><div class="t">▶ ${dateTime(r.created_at)}</div><div class="m">${r.frames} kare · ${r.deleted ? 'silindi' : `silinme: ${dateTime(r.expires_at)}`}</div></div></a>`).join('') : '<div class="muted small">Kayıt yok.</div>'}
      </div>
      <div class="card"><h2>Ön yazı</h2>${a.letter ? `<div class="letter">${esc(a.letter)}</div>` : '<div class="muted small">Henüz yazılmadı.</div>'}
        <div class="sp"></div><h2>Form cevapları</h2>${answers.length ? `<table class="t">${answers.map(([k, v]) => `<tr><td class="muted" style="width:45%">${esc(k)}</td><td>${esc(typeof v === 'object' ? JSON.stringify(v) : v)}</td></tr>`).join('')}</table>` : '<div class="muted small">Kayıtlı cevap yok.</div>'}
      </div>
    </div><div class="sp"></div>
    <div class="grid g2">
      <div class="card"><h2>İlgili e-postalar</h2>${a.mails.length ? a.mails.map((m) => `<a class="item" href="#/eposta/${encodeURIComponent(m.id)}"><div class="main"><div class="t">${esc(m.subject)}</div><div class="m">${esc(m.from_addr)} · ${esc(m.summary || '')}</div></div><div class="r">${pill(MAIL_CAT, m.category)}<br>${when(m.received_at)}</div></a>`).join('') : '<div class="muted small">Henüz yok.</div>'}</div>
      <div class="card"><h2>Olaylar</h2><div class="feed">${a.events.map(ev).join('') || '<div class="muted small">—</div>'}</div></div>
    </div>`);
  const rt = $('#rt'), ho = $('#ho');
  if (rt) rt.onclick = async () => { await post(`/applications/${id}/retry`); toast('Yeniden başlatıldı'); viewApp(id); };
  if (ho) ho.onclick = async () => { await post(`/applications/${id}/retry`, { handoff: true }); toast('Başlatıldı. Robot doğrulaması çıkarsa "Sana kalanlar"da canlı bağlantı belirecek.', 5000); viewApp(id); };
  $('#ms').onchange = async (e) => { if (!e.target.value) return; await post(`/applications/${id}/status`, { status: e.target.value }); toast('Güncellendi'); viewApp(id); };
  if (live) setTimeout(() => { if (location.hash === '#/basvuru/' + id) viewApp(id); }, 10000);
}

// ---------- Kayıtlar ----------
async function viewRecs() {
  shell('#/kayitlar', '<div class="empty">Yükleniyor…</div>');
  const rows = await api('/recordings');
  setMain(`<div class="top"><div><h1>Çalışma kayıtları</h1><div class="sub">Ajanın tarayıcıda yaptığı her adımın ekran görüntüleri. 3 gün sonra otomatik silinir (kota yemesin diye).</div></div></div>
    <div class="card"><div class="list">${rows.length ? rows.map((r) => `<a class="item" href="#/kayit/${r.id}"><div class="main"><div class="t">▶ ${esc(r.company || r.title || r.id)}</div><div class="m">${esc(r.title || '')} · ${r.frames} kare</div></div><div class="r">${r.app_status ? pill(APP_ST, r.app_status) : ''}<br>${dateTime(r.created_at)}<br><span class="tiny">silinme ${when(r.expires_at).replace('önce', 'sonra')}</span></div></a>`).join('') : '<div class="empty">Henüz kayıt yok.</div>'}</div></div>`);
}

async function viewPlayer(id) {
  shell('#/kayitlar', '<div class="empty">Yükleniyor…</div>');
  const r = await api('/recordings/' + id);
  const frames = r.frames;
  const tl = r.timeline || [];
  const labelFor = (i) => { const f = tl.filter((x) => x.seq)[i]; return f ? `${clock(f.ts)} · ${f.label}` : ''; };
  setMain(`<div class="top"><div><a class="small muted" href="#/kayitlar">← Kayıtlar</a><h1>${esc(r.title || 'Kayıt')}</h1><div class="sub">${frames.length} kare · ${dateTime(r.created_at)} · silinme ${dateTime(r.expires_at)}${r.app_id ? ` · <a href="#/basvuru/${r.app_id}">başvuruya git</a>` : ''}</div></div></div>
    ${frames.length ? `<div class="player"><img id="fr" src="/api/file/${frames[0]}" alt=""><div class="cap" id="cap">${esc(labelFor(0))}</div></div>
    <div class="ctrl"><button class="btn sm" id="pp">▶ Oynat</button><input type="range" id="sl" min="0" max="${frames.length - 1}" value="0"><select id="sp" style="width:auto"><option value="1500">1x</option><option value="700">2x</option><option value="300">4x</option></select><span class="small muted" id="ix">1/${frames.length}</span></div>
    <div class="thumbs" id="th">${frames.map((f, i) => `<img data-i="${i}" src="/api/file/${f}" loading="lazy" class="${i ? '' : 'on'}">`).join('')}</div>` : '<div class="empty">Kare yok (silinmiş olabilir).</div>'}
    <div class="sp"></div><div class="card"><h2>Ajanın düşünceleri ve adımları</h2><div class="feed">${tl.map((x) => `<div class="e"><div class="tm">${clock(x.ts)}</div><div class="x">${x.seq ? `<b>#${x.seq}</b> ` : ''}${esc(x.label)}${x.data?.actions ? `<details><summary>eylemler</summary><div class="pre mono">${esc(JSON.stringify(x.data.actions, null, 1))}</div></details>` : ''}</div></div>`).join('') || '<div class="muted small">Zaman çizelgesi yok.</div>'}</div></div>`);
  if (!frames.length) return;
  let i = 0, timer = null;
  const show = (k) => { i = Math.max(0, Math.min(frames.length - 1, k)); $('#fr').src = '/api/file/' + frames[i]; $('#cap').textContent = labelFor(i); $('#sl').value = i; $('#ix').textContent = `${i + 1}/${frames.length}`; document.querySelectorAll('#th img').forEach((im) => im.classList.toggle('on', Number(im.dataset.i) === i)); };
  const stop = () => { clearInterval(timer); timer = null; $('#pp').textContent = '▶ Oynat'; };
  $('#pp').onclick = () => { if (timer) return stop(); if (i >= frames.length - 1) show(0); $('#pp').textContent = '⏸ Durdur'; timer = setInterval(() => { if (i >= frames.length - 1 || !$('#fr')) return stop(); show(i + 1); }, Number($('#sp').value)); };
  $('#sl').oninput = (e) => { stop(); show(Number(e.target.value)); };
  $('#th').onclick = (e) => { if (e.target.dataset.i) { stop(); show(Number(e.target.dataset.i)); } };
}

// ---------- E-posta ----------
async function viewMail(params) {
  const cat = params.get('c') || '';
  shell('#/posta', '<div class="empty">Yükleniyor…</div>');
  const rows = await api('/mail' + (cat ? `?category=${cat}` : ''));
  const cats = [['', 'Tümü'], ['interview', 'Mülakat'], ['assessment', 'Sonraki adım'], ['recruiter', 'İşveren'], ['offer', 'Teklif'], ['confirmation', 'Onay'], ['rejection', 'Olumsuz'], ['verification', 'Doğrulama']];
  setMain(`<div class="top"><div><h1>E-posta</h1><div class="sub">destek@ozgurguler.tech kutusu okunup sınıflandırılıyor ve başvurulara bağlanıyor.</div></div></div>
    <div class="tabs">${cats.map(([k, l]) => `<button data-c="${k}" class="${cat === k ? 'on' : ''}">${l}</button>`).join('')}</div>
    <div class="card"><div class="list">${rows.length ? rows.map((m) => `<a class="item" href="#/eposta/${encodeURIComponent(m.id)}"><div class="main"><div class="t">${esc(m.subject)}</div><div class="m">${esc(m.from_addr)}${m.company ? ' · ' + esc(m.company) : ''}${m.summary ? ' · ' + esc(m.summary) : ''}${m.code ? ` · kod <b>${esc(m.code)}</b>` : ''}</div></div><div class="r">${pill(MAIL_CAT, m.category)}<br>${when(m.received_at)}</div></a>`).join('') : '<div class="empty">E-posta yok.</div>'}</div></div>`);
  document.querySelectorAll('[data-c]').forEach((b) => b.onclick = () => { location.hash = '#/posta' + (b.dataset.c ? `?c=${b.dataset.c}` : ''); });
}

async function viewMailOne(id) {
  shell('#/posta', '<div class="empty">Yükleniyor…</div>');
  const m = await api('/mail/' + encodeURIComponent(id));
  setMain(`<div class="top"><div><a class="small muted" href="#/posta">← E-posta</a><h1>${esc(m.subject)}</h1><div class="sub">${esc(m.from_name || '')} &lt;${esc(m.from_address || m.from_addr)}&gt; · ${dateTime(m.received_at)} ${m.category ? pill(MAIL_CAT, m.category) : ''}</div></div></div>
    ${m.summary ? `<div class="alert">${esc(m.summary)}</div><div class="sp"></div>` : ''}
    <div class="grid g2"><div class="card"><h2>İçerik</h2><div class="pre">${esc(m.text_body || '')}</div></div>
    <div class="card"><h2>Cevap</h2><div class="small muted">Taslağı ajan yazdı. Düzenleyip gönderebilirsin; gönderim "kabul edildi" olarak kaydedilir, teslim ayrıca izlenir.</div>
      <textarea id="rp" style="min-height:220px;margin-top:8px">${esc(m.draft || '')}</textarea>
      <div class="row" style="margin-top:8px"><button class="btn pri" id="sd">Gönder</button>${m.app_id ? `<a class="btn" href="#/basvuru/${m.app_id}">Başvuruya git</a>` : ''}</div></div></div>`);
  $('#sd').onclick = async (e) => { if (!$('#rp').value.trim()) return toast('Metin boş'); e.target.disabled = true; try { await post(`/mail/${encodeURIComponent(id)}/reply`, { text: $('#rp').value }); toast('Gönderim kabul edildi'); } catch (x) { toast(x.message); e.target.disabled = false; } };
}

// ---------- Beyin ----------
async function viewBrain() {
  shell('#/beyin', '');
  const rows = (await api('/chat')).reverse();
  setMain(`<div class="top"><div><h1>Beyin</h1><div class="sub">Sisteme soru sor, ayar değiştir, başvuru yaptır. Her şeyi veritabanından okuyarak cevaplar.</div></div><a class="btn sm" href="#/hafiza">Hafıza</a></div>
    <div class="chat card"><div class="msgs" id="ms">${rows.map(bubble).join('') || '<div class="empty">Merhaba! Örneğin: "Bugün neler yaptın?", "Mülakat daveti var mı?", "Günlük başvuru sınırını 12 yap".</div>'}</div>
      <div class="chips">${['Bugün neler yaptın?', 'Hangi başvurular olumlu döndü?', 'Neden bu kadar ilan eleniyor?', 'Kaynakların performansı nasıl?', 'Bu hafta ne kadar harcadık?'].map((c) => `<button>${c}</button>`).join('')}</div>
      <form class="composer" id="cf"><textarea id="ci" placeholder="Beyne yaz…" rows="1"></textarea><button class="btn pri">Gönder</button></form></div>`);
  const box = $('#ms'); box.scrollTop = box.scrollHeight;
  const send = async (text) => {
    if (!text.trim()) return;
    box.insertAdjacentHTML('beforeend', bubble({ role: 'user', content: text }));
    box.insertAdjacentHTML('beforeend', '<div class="typing" id="ty">Beyin düşünüyor… (araçları kullanıyor olabilir)</div>');
    box.scrollTop = box.scrollHeight; $('#ci').value = '';
    try { const r = await post('/chat', { message: text }); $('#ty')?.remove(); box.insertAdjacentHTML('beforeend', bubble({ role: 'assistant', content: r.text, meta: JSON.stringify({ trace: r.trace, model: r.model }) })); }
    catch (e) { $('#ty')?.remove(); box.insertAdjacentHTML('beforeend', bubble({ role: 'assistant', content: 'Hata: ' + e.message })); }
    box.scrollTop = box.scrollHeight;
  };
  $('#cf').onsubmit = (e) => { e.preventDefault(); send($('#ci').value); };
  $('#ci').onkeydown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send($('#ci').value); } };
  document.querySelectorAll('.chips button').forEach((b) => b.onclick = () => send(b.textContent));
}
function bubble(m) {
  let meta = {}; try { meta = JSON.parse(m.meta || '{}'); } catch (e) { /* */ }
  const tr = meta.trace?.length ? `<div class="tr">araçlar: ${meta.trace.map((t) => esc(t.tool)).join(', ')}${meta.model ? ' · ' + esc(meta.model.split('/').pop()) : ''}</div>` : '';
  return `<div class="msg ${m.role}">${esc(m.content)}${tr}</div>`;
}

async function viewMemory() {
  shell('#/beyin', '<div class="empty">Yükleniyor…</div>');
  const rows = await api('/memory');
  setMain(`<div class="top"><div><a class="small muted" href="#/beyin">← Beyin</a><h1>Hafıza</h1><div class="sub">Beynin öğrendiği dersler, kurallar ve senin tercihlerin. Günlük öz değerlendirmeyle güncellenir.</div></div></div>
    <div class="card"><div class="list">${rows.length ? rows.map((m) => `<div class="item"><div class="main"><div class="t" style="font-weight:500;${m.active ? '' : 'opacity:.5'}">${esc(m.text)}</div><div class="m">${esc(m.kind)} · ${esc(m.source || '')} · ${when(m.created_at)}</div></div><div class="r"><button class="btn sm" data-id="${m.id}">${m.active ? 'Pasifleştir' : 'Etkinleştir'}</button></div></div>`).join('') : '<div class="empty">Henüz hafıza yok.</div>'}</div></div>`);
  document.querySelectorAll('[data-id]').forEach((b) => b.onclick = async () => { await post(`/memory/${b.dataset.id}/toggle`); viewMemory(); });
}

// ---------- Sana kalanlar ----------
async function viewActions() {
  shell('#/yapilacaklar', '<div class="empty">Yükleniyor…</div>');
  const rows = await api('/actions');
  const open = rows.filter((r) => r.status === 'open');
  state.actions = open.length;
  const KIND = { interview: 'Mülakat', assessment: 'Sonraki adım', offer: 'Teklif', recruiter: 'İşveren mesajı', handoff: 'Canlı devral', needs_human: 'Elle tamamla' };
  setMain(`<div class="top"><div><h1>Sana kalanlar</h1><div class="sub">Sistem hiçbirinde beklemez; bunlar yalnızca senin yapabileceğin şeyler (mülakat, robot doğrulaması, teklif).</div></div></div>
    <div class="card"><div class="list">${rows.length ? rows.map((r) => `<div class="item" style="${r.status === 'open' ? '' : 'opacity:.55'}"><div class="main"><div class="t">${esc(r.title)}</div><div class="m" style="-webkit-line-clamp:4">${esc(r.detail || '')}</div>
      <div class="row wrap" style="margin-top:6px">${r.url ? `<a class="btn sm pri" href="${esc(r.url)}" target="_blank" rel="noopener">Aç ↗</a>` : ''}${r.app_id ? `<a class="btn sm" href="#/basvuru/${r.app_id}">Başvuru</a>` : ''}${r.status === 'open' ? `<button class="btn sm" data-id="${r.id}">Tamamlandı</button>` : ''}</div></div>
      <div class="r"><span class="pill ${r.priority === 1 ? 'warn' : ''}">${esc(KIND[r.kind] || r.kind)}</span><br>${when(r.created_at)}</div></div>`).join('') : '<div class="empty">Şu an sana kalan bir şey yok. 🎉</div>'}</div></div>`);
  document.querySelectorAll('[data-id]').forEach((b) => b.onclick = async () => { await post(`/actions/${b.dataset.id}/done`); viewActions(); });
}

// ---------- Kaynaklar ----------
async function viewSources() {
  shell('#/kaynaklar', '<div class="empty">Yükleniyor…</div>');
  const d = await api('/sources');
  setMain(`<div class="top"><div><h1>Kaynaklar</h1><div class="sub">İlan panoları (farklı ülkeler/diller) ve ilanlardan öğrenilen şirket kariyer sayfaları. Beyin başarıya göre ağırlıkları ayarlar.</div></div></div>
    <div class="card scroll-x"><table class="t"><tr><th>Kaynak</th><th>Son tarama</th><th>Son tur</th><th>Toplam</th><th>Uygun</th><th>Başvuru</th><th></th></tr>
    ${d.sources.map((s) => `<tr><td><b>${esc(s.label)}</b><div class="tiny muted">${esc(s.id)} · ${s.cadence} dk'da bir</div></td><td>${s.state.last ? when(s.state.last) : '—'} ${s.state.ok === false ? `<div class="tiny" style="color:var(--bad)">${esc(s.state.err || '')}</div>` : ''}</td><td>${s.state.seen != null ? `${s.state.seen} ilan · ${s.state.added} yeni` : '—'}</td><td>${s.stats.n || 0}</td><td>${s.stats.ok || 0}</td><td>${s.stats.applied || 0}</td><td><button class="btn sm" data-run="${s.id}">Tara</button></td></tr>`).join('')}</table></div>
    <div class="sp"></div><div class="card"><h2>Şirket kariyer sayfaları (${d.boards.length})</h2><div class="small muted">ATS'ler: Greenhouse, Lever, Ashby, Recruitee, Workable, Personio, Teamtailor, Breezy, SmartRecruiters. Yeni şirketler ilanlardan otomatik öğrenilir.</div>
    <div class="scroll-x"><table class="t"><tr><th>Şirket</th><th>ATS</th><th>Nereden</th><th>Bulunan</th><th>Son tarama</th><th>Durum</th></tr>${d.boards.map((b) => `<tr><td>${esc(b.company || b.slug)}</td><td>${esc(b.ats)}</td><td class="tiny">${esc(b.added_from || '')}</td><td>${b.jobs_seen}</td><td>${b.last_polled ? when(b.last_polled) : '—'}</td><td>${b.status === 'active' ? '<span class="pill ok">aktif</span>' : '<span class="pill">kapalı</span>'}</td></tr>`).join('')}</table></div></div>`);
  document.querySelectorAll('[data-run]').forEach((b) => b.onclick = async () => { b.disabled = true; b.textContent = '…'; try { const r = await post('/run/' + b.dataset.run); toast(r.error ? 'Hata: ' + r.error : `${r.seen} ilan, ${r.added} yeni`); } catch (e) { toast(e.message); } viewSources(); });
}

// ---------- Modeller & maliyet ----------
async function viewModels() {
  shell('#/modeller', '<div class="empty">Yükleniyor…</div>');
  const [m, c] = await Promise.all([api('/models'), api('/costs')]);
  const tasks = Object.keys(m.defaults);
  const TASK = { triage: 'Ön eleme', analysis: 'Derin analiz', letter: 'Ön yazı', answers: 'Form cevapları', agent: 'Tarayıcı ajanı', agent_hard: 'Zor sayfalar', mail: 'E-posta', brain: 'Beyin (sohbet)', review: 'Öz değerlendirme', judge: 'Doğruluk denetimi' };
  const ev0 = m.evals[0];
  setMain(`<div class="top"><div><h1>Modeller & maliyet</h1><div class="sub">Her görev için en iyi model haftalık yarışmayla seçilir. Tüm yapay zekâ Cloudflare Workers AI (Startup kredisi) üzerinden; hızlı elemeler için TypeSafe Jev.</div></div><button class="btn sm" id="ev">Model yarışmasını şimdi çalıştır</button></div>
    <div class="grid g3">
      <div class="card stat"><div class="k">Toplam yapay zekâ</div><div class="v">${usd(c.total)}</div><div class="d">kurulumdan beri</div></div>
      <div class="card stat"><div class="k">Bugün</div><div class="v">${usd(c.daily[0]?.cost)}</div><div class="d">${c.daily[0]?.calls || 0} çağrı</div></div>
      <div class="card stat"><div class="k">Yıllık kredi</div><div class="v">2.500 $</div><div class="d">Workers AI sınırı (Startup Tier 3, toplam 10.000 $)</div></div>
    </div><div class="sp"></div>
    <div class="card scroll-x"><h2>Görev → model</h2><table class="t"><tr><th>Görev</th><th>Kullanılan (yedekler)</th></tr>${tasks.map((t) => `<tr><td>${TASK[t] || t}</td><td class="mono">${esc([m.custom[t], ...m.defaults[t].filter((x) => x !== m.custom[t])].filter(Boolean).map((x) => x.split('/').pop()).join(' → '))}</td></tr>`).join('')}</table></div>
    <div class="sp"></div>
    ${ev0 ? `<div class="card scroll-x"><h2>Son model yarışması <span class="muted small">${dateTime(ev0.ts)}</span></h2><table class="t"><tr><th>Model</th><th>Eleme</th><th>Form</th><th>Araç</th><th>Ön yazı</th><th>Maliyet</th><th>Gecikme</th></tr>${(ev0.results || []).sort((a, b) => (b.triage + b.form + (b.letterScore || b.letter || 0)) - (a.triage + a.form + (a.letterScore || a.letter || 0))).map((r) => `<tr><td class="mono">${esc(r.model.split('/').pop())}</td><td>${(+r.triage).toFixed(2)}</td><td>${(+r.form).toFixed(2)}</td><td>${r.tools}</td><td>${(+(r.letterScore ?? r.letter ?? 0)).toFixed(2)}</td><td>${(+r.cost).toFixed(4)} $</td><td>${r.p50} ms</td></tr>`).join('')}</table><div class="tiny muted">Seçilen: ${esc(JSON.stringify(ev0.chosen))}</div></div><div class="sp"></div>` : ''}
    <div class="card scroll-x"><h2>Son 7 gün kullanım</h2><table class="t"><tr><th>Model</th><th>Görev</th><th>Çağrı</th><th>Girdi</th><th>Çıktı</th><th>Hata</th><th>Maliyet</th></tr>${m.usage.map((u) => `<tr><td class="mono">${esc(u.model.split('/').pop())}</td><td>${TASK[u.task] || esc(u.task)}</td><td>${u.calls}</td><td>${(u.in_tok / 1000).toFixed(0)}k</td><td>${(u.out_tok / 1000).toFixed(0)}k</td><td>${u.errors}</td><td>${(+u.cost).toFixed(4)} $</td></tr>`).join('') || '<tr><td colspan="7" class="muted">Henüz yok</td></tr>'}</table></div>
    <div class="sp"></div>
    <div class="card scroll-x"><h2>Günlük</h2><table class="t"><tr><th>Gün</th><th>Yapay zekâ</th><th>Tarayıcı</th><th>Başvuru</th><th>E-posta</th><th>Jev token</th></tr>${c.usage.map((u) => { const ai = c.daily.find((x) => x.day === u.day); return `<tr><td>${u.day}</td><td>${usd(ai?.cost)}</td><td>${Math.round((u.browser_ms || 0) / 60000)} dk</td><td>${u.applications || 0}</td><td>${u.emails_sent || 0}</td><td>${(u.jev_tokens || 0).toLocaleString('tr')}</td></tr>`; }).join('')}</table></div>`);
  $('#ev').onclick = async (e) => { e.target.disabled = true; const r = await post('/run/eval'); toast(r.note || 'Başladı', 4000); };
}

// ---------- Günlük ----------
async function viewLog(params) {
  const type = params.get('t') || '';
  shell('#/gunluk', '<div class="empty">Yükleniyor…</div>');
  const rows = await api('/events' + (type ? `?type=${type}` : ''));
  const types = ['', 'discover', 'triage', 'apply', 'mail', 'brain', 'account', 'eval', 'tick'];
  setMain(`<div class="top"><div><h1>Günlük</h1><div class="sub">Sistemin yaptığı her şey (60 gün saklanır).</div></div></div>
    <div class="tabs">${types.map((t) => `<button data-t="${t}" class="${type === t ? 'on' : ''}">${t || 'Tümü'}</button>`).join('')}</div>
    <div class="card feed">${rows.map((e) => `<div class="e ${e.level}"><div class="tm">${clock(e.ts)}<br><span class="tiny">${new Date(e.ts + TR).toISOString().slice(5, 10)}</span></div><div class="x"><span class="tag">${esc(e.type)}</span>${esc(e.msg)}${e.ref ? ` <a class="tiny" href="#/${e.ref.startsWith('app_') ? 'basvuru/' + e.ref : 'kaynaklar'}">${esc(e.ref)}</a>` : ''}${e.data ? `<details><summary>ayrıntı</summary><div class="pre mono">${esc(e.data)}</div></details>` : ''}</div></div>`).join('') || '<div class="empty">Kayıt yok</div>'}</div>`);
  document.querySelectorAll('[data-t]').forEach((b) => b.onclick = () => { location.hash = '#/gunluk' + (b.dataset.t ? `?t=${b.dataset.t}` : ''); });
}

// ---------- Ayarlar ----------
async function viewSettings() {
  shell('#/ayarlar', '<div class="empty">Yükleniyor…</div>');
  const [s, facts] = await Promise.all([api('/settings'), api('/facts')]);
  const F = [
    ['auto_apply', 'Otomatik başvuru', 'bool', 'Uygun ilanlara kendi başına başvursun'],
    ['paused', 'Duraklat', 'bool', 'Tüm otomatik işler durur'],
    ['daily_apply_limit', 'Günlük başvuru sınırı', 'num'],
    ['min_fit_apply', 'Otomatik başvuru için en düşük uyum (0-100)', 'num'],
    ['min_fit_review', 'Bunun altı elensin', 'num'],
    ['daily_ai_budget_usd', 'Günlük yapay zekâ bütçesi ($)', 'num', '2.500 $/yıl ≈ 6,8 $/gün'],
    ['daily_browser_minutes', 'Günlük tarayıcı dakikası', 'num', 'Browser Run ücretsiz kotası ayda 10 saat'],
    ['monthly_browser_hours', 'Aylık tarayıcı saati üst sınırı', 'num'],
    ['handoff_wait_minutes', 'Robot doğrulamasında seni bekleme süresi (dk)', 'num', 'Sadece panel açıkken bekler'],
    ['recording_days', 'Ekran kaydı saklama (gün)', 'num'],
    ['auto_reply_mail', 'İşveren sorularına otomatik cevap', 'bool', 'Kapalıyken taslak hazırlar, sen gönderirsin'],
    ['digest_email', 'Günlük özet e-postası', 'bool'],
    ['prefer_async_roles', 'Yazılı/asenkron işleri öne al', 'bool'],
    ['notify_email', 'Bildirim adresi', 'text'],
  ];
  const input = ([k, l, t, h]) => `<div><label class="f">${l}${h ? ` <span class="tiny">— ${h}</span>` : ''}</label>${t === 'bool' ? `<select data-k="${k}" data-t="bool"><option value="true" ${s[k] ? 'selected' : ''}>Açık</option><option value="false" ${!s[k] ? 'selected' : ''}>Kapalı</option></select>` : `<input data-k="${k}" data-t="${t}" type="${t === 'num' ? 'number' : 'text'}" value="${esc(s[k])}">`}</div>`;
  setMain(`<div class="top"><div><h1>Ayarlar</h1><div class="sub">Beyin de bu ayarları kendi sonuçlarına göre (sınırlar içinde) günceller. Değişiklikler anında kaydedilir.</div></div></div>
    <div class="card"><div class="grid g2">${F.map(input).join('')}</div></div><div class="sp"></div>
    <div class="grid g2">
      <div class="card"><h2>Engelli şirketler / alan adları</h2><label class="f">Şirketler (virgülle)</label><input data-k="blocked_companies" data-t="arr" type="text" value="${esc((s.blocked_companies || []).join(', '))}"><label class="f">Alan adları</label><input data-k="blocked_domains" data-t="arr" type="text" value="${esc((s.blocked_domains || []).join(', '))}"></div>
      <div class="card"><h2>Öğrenilmiş kurallar</h2><div class="small muted">Beynin öz değerlendirmede eklediği kurallar (eleme, analiz, ön yazı, ajan).</div>${Object.entries(s.prompt_addenda || {}).map(([k, v]) => `<details><summary>${esc(k)}</summary><div class="pre small">${esc(v)}</div></details>`).join('') || '<div class="muted small">Henüz yok</div>'}
        <div class="sp"></div><h3>Rol ağırlıkları</h3><div class="mono">${esc(JSON.stringify(s.role_weights))}</div><h3 style="margin-top:8px">Kaynak ağırlıkları</h3><div class="mono">${esc(JSON.stringify(s.source_weights))}</div></div>
    </div><div class="sp"></div>
    <div class="card"><div class="row between"><h2>Profil bilgileri (${facts.length})</h2><button class="btn sm" id="af">+ Bilgi ekle</button></div><div class="small muted">Başvurularda yalnızca CV ve buradaki bilgiler kullanılır.</div>
      <div class="scroll-x" style="max-height:420px;overflow:auto"><table class="t">${facts.map((f) => `<tr><td class="mono" style="width:32%">${esc(f.key)}</td><td class="small">${esc(String(f.value).slice(0, 300))}</td><td class="tiny muted">${esc(String(f.source || '').slice(0, 40))}</td></tr>`).join('')}</table></div></div>
    <div class="sp"></div><div class="card"><h2>Bakım</h2><div class="row wrap"><button class="btn sm" data-run="mail">E-postaları şimdi işle</button><button class="btn sm" data-run="triage">Eleme turu</button><button class="btn sm" data-run="review">Öz değerlendirme yap</button><button class="btn sm" data-run="digest">Özet e-postası gönder</button></div></div>`);
  document.querySelectorAll('[data-k]').forEach((el) => el.onchange = async () => {
    const t = el.dataset.t; let v = el.value;
    if (t === 'bool') v = v === 'true'; else if (t === 'num') v = Number(v); else if (t === 'arr') v = v.split(',').map((x) => x.trim()).filter(Boolean);
    try { await post('/settings', { key: el.dataset.k, value: v }); toast('Kaydedildi'); } catch (e) { toast(e.message); }
  });
  $('#af').onclick = async () => { const k = prompt('Anahtar (ör. notice_period):'); if (!k) return; const v = prompt('Değer:'); if (v == null) return; await post('/facts', { key: k, value: v }); viewSettings(); };
  document.querySelectorAll('[data-run]').forEach((b) => b.onclick = async () => { b.disabled = true; try { const r = await post('/run/' + b.dataset.run); toast(typeof r === 'object' ? (r.summary || r.note || 'Tamam') : 'Tamam', 5000); } catch (e) { toast(e.message); } b.disabled = false; });
}

function viewMenu() {
  shell('#/menu', `<h1>Menü</h1><div class="sp"></div><div class="card"><div class="list">${NAV.map(([h, i, l]) => `<a class="item" href="${h}"><div class="main"><div class="t">${i}&nbsp; ${l}</div></div><div class="r">→</div></a>`).join('')}<a class="item" href="#" id="lo2"><div class="main"><div class="t">⎋&nbsp; Çıkış</div></div></a></div></div>`);
  $('#lo2').onclick = async (e) => { e.preventDefault(); await post('/logout'); renderLogin(); };
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
      case 'gunluk': return await viewLog(params);
      case 'ayarlar': return await viewSettings();
      case 'menu': return viewMenu();
      default: return await viewOverview();
    }
  } catch (e) {
    if (e.message !== 'login') { const m = $('#main'); if (m) m.innerHTML = `<div class="alert bad">Hata: ${esc(e.message)}</div>`; else app.innerHTML = `<div class="boot">Hata: ${esc(e.message)}</div>`; }
  }
}
function boot() { router(); }
window.addEventListener('hashchange', router);
boot();
