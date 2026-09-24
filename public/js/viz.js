// Görsel anlatım bileşenleri: zaman çizgisi, harita, tablo, cümle ögeleri, kodlama, Venn, grafik...
import { ILLER, MAP_W, MAP_H, PROJ } from './trmap.js';

export const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// Küçük biçimlendirme: **kalın**, ==vurgu==, _italik_, satır sonları, "- " madde listeleri
export function md(text) {
  if (!text) return '';
  const lines = String(text).split('\n');
  let html = '';
  let inList = false;
  for (const raw of lines) {
    const line = raw.trimEnd();
    const li = line.match(/^\s*[-•]\s+(.*)$/);
    if (li) {
      if (!inList) { html += '<ul>'; inList = true; }
      html += `<li>${inline(li[1])}</li>`;
      continue;
    }
    if (inList) { html += '</ul>'; inList = false; }
    if (line.trim() === '') continue;
    html += `<p>${inline(line)}</p>`;
  }
  if (inList) html += '</ul>';
  return html;
}
export function inline(s) {
  return esc(s)
    .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
    .replace(/==(.+?)==/g, '<mark>$1</mark>')
    .replace(/(^|[\s(])_(.+?)_(?=[\s).,;:!?]|$)/g, '$1<i>$2</i>');
}

const COLORS = {
  ink: 'var(--ink)', tr: 'var(--tr)', mat: 'var(--mat)', tar: 'var(--tar)', cog: 'var(--cog)', vat: 'var(--vat)', gun: 'var(--gun)',
  red: '#E03131', orange: '#F08C00', yellow: '#E8B500', green: '#2F9E44', teal: '#0C8599', blue: '#1C7ED6', indigo: '#4263EB',
  violet: '#7048E8', pink: '#D6336C', brown: '#8D5B3A', gray: '#868E96', dark: 'var(--graphite)',
};
const col = (c) => COLORS[c] || c || 'var(--ink)';
const delay = (i, step = 90) => `animation-delay:${i * step}ms`;

// Cümle ögeleri renkleri
const ROLE = {
  'yüklem': ['#FFE3E3', '#E03131'],
  'özne': ['#E7F5FF', '#1C7ED6'],
  'belirtili nesne': ['#EBFBEE', '#2F9E44'],
  'belirtisiz nesne': ['#F4FCE3', '#5C940D'],
  'nesne': ['#EBFBEE', '#2F9E44'],
  'yer tamlayıcısı': ['#FFF4E6', '#E8590C'],
  'zarf tümleci': ['#F3F0FF', '#7048E8'],
  'edat tümleci': ['#E6FCF5', '#0C8599'],
  'cümle dışı': ['#F1F3F5', '#868E96'],
};

export function renderViz(v) {
  if (!v) return '';
  const fn = R[v.type];
  if (!fn) return '';
  const body = fn(v);
  const cap = v.caption ? `<figcaption>${inline(v.caption)}</figcaption>` : '';
  return `<figure class="viz viz-${v.type}" ${v.s ? `data-s="${v.s}"` : ''}>${body}${cap}</figure>`;
}

const R = {
  timeline(v) {
    return `<div class="tl">${v.items.map((it, i) => `
      <div class="ev ${it.key ? 'key' : ''}" style="${delay(i, 110)}${it.c ? `;--s:${col(it.c)}` : ''}">
        <div class="yr">${esc(it.y)}</div>
        <div class="tx">${inline(it.t)}${it.d ? `<small>${inline(it.d)}</small>` : ''}</div>
      </div>`).join('')}</div>`;
  },

  table(v) {
    return `<div class="tablewrap"><table class="vtable">
      ${v.head ? `<thead><tr>${v.head.map((h) => `<th>${inline(h)}</th>`).join('')}</tr></thead>` : ''}
      <tbody>${v.rows.map((r) => `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join('')}</tr>`).join('')}</tbody>
    </table></div>`;
  },

  sentence(v) {
    return `<div class="sent">${v.parts.map(([w, role], i) => {
      const [bg, fg] = ROLE[(role || '').toLowerCase()] || ['var(--ink-soft)', 'var(--ink)'];
      return `<div class="w" style="--c:${bg};--cc:${fg};${delay(i, 140)}"><span>${esc(w)}</span><span>${esc(role || '')}</span></div>`;
    }).join('')}</div>`;
  },

  mnemonic(v) {
    return `<div class="mnem">${v.lines.map(([L, t], i) => `
      <div class="ln" style="${delay(i, 120)}"><div class="L">${esc(L)}</div><div>${inline(t)}</div></div>`).join('')}</div>`;
  },

  compare(v) {
    return `<div class="cmp" style="--cols:${v.cols.length}">${v.cols.map((c) => `
      <div class="col" style="--cc:${col(c.c)}"><h4>${inline(c.h)}</h4><ul>${c.items.map((x) => `<li>${inline(x)}</li>`).join('')}</ul></div>`).join('')}</div>`;
  },

  flow(v) {
    return `<div class="flow">${v.items.map((x, i) => `${i ? '<div class="arr" aria-hidden="true">↓</div>' : ''}<div class="fs" style="${delay(i, 160)}">${inline(x)}</div>`).join('')}</div>`;
  },

  org(v) {
    return `<div class="org"><div class="root"><span class="box">${inline(v.root)}</span></div>
      <div class="kids">${v.kids.map((k) => `<div class="kid" style="--cc:${col(k.c)}"><h4>${inline(k.h)}</h4>${k.items ? `<ul>${k.items.map((x) => `<li>${inline(x)}</li>`).join('')}</ul>` : ''}</div>`).join('')}</div></div>`;
  },

  grid(v) {
    // Sözel mantık tablosu. cells: { "satır|sütun": "✓" | "x" | metin }
    const cells = v.cells || {};
    return `<div class="lgrid"><table><thead><tr><th></th>${v.cols.map((c) => `<th>${esc(c)}</th>`).join('')}</tr></thead>
      <tbody>${v.rows.map((r) => `<tr><th>${esc(r)}</th>${v.cols.map((c) => {
        const val = cells[`${r}|${c}`];
        const cls = val === '✓' ? 'ok new' : val === 'x' ? 'x new' : val ? 'new' : '';
        return `<td class="${cls}">${val === 'x' ? '✕' : esc(val || '')}</td>`;
      }).join('')}</tr>`).join('')}</tbody></table></div>`;
  },

  map(v) {
    const hl = {};
    (v.groups || []).forEach((g) => g.iller.forEach((k) => { hl[k] = col(g.c); }));
    const paths = Object.entries(ILLER).map(([k, il]) =>
      `<path class="il ${hl[k] ? 'hl' : ''}" d="${il.d}" ${hl[k] ? `style="--hl:${hl[k]}"` : ''}><title>${esc(il.n)}</title></path>`).join('');
    const labels = (v.labels !== false ? (v.groups || []) : []).flatMap((g) => g.show === false ? [] : g.iller.map((k) => {
      const il = ILLER[k]; if (!il) return '';
      return `<text class="lbl" x="${il.c[0]}" y="${il.c[1] + 5}" text-anchor="middle">${esc(g.short ? g.short : il.n)}</text>`;
    })).join('');
    const pins = (v.pins || []).map((p) => {
      const x = (p.lon - PROJ.lon0) * PROJ.k * PROJ.s;
      const y = (PROJ.lat1 - p.lat) * PROJ.s;
      const anchor = p.a || 'start';
      const dx = anchor === "end" ? -15 : anchor === "middle" ? 0 : 15;
      const dy = p.dy != null ? p.dy : 9;
      return `<g class="pin"><circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${p.r || 10}" ${p.c ? `style="fill:${col(p.c)}"` : ''}/>
        <text class="lbl" x="${(x + dx).toFixed(0)}" y="${(y + dy).toFixed(0)}" text-anchor="${anchor}">${esc(p.t)}</text></g>`;
    }).join('');
    const legend = (v.groups || []).filter((g) => g.label).map((g) => `<span><i style="background:${col(g.c)}"></i>${inline(g.label)}</span>`).join('');
    return `<div class="map-wrap"><svg viewBox="-10 -10 ${MAP_W + 20} ${MAP_H + 20}" role="img" aria-label="${esc(v.alt || 'Türkiye haritası')}">
      ${paths}${labels}${pins}</svg>${legend ? `<div class="map-legend">${legend}</div>` : ''}</div>`;
  },

  bars(v) {
    const max = Math.max(...v.items.map((i) => i[1]));
    return `<div class="bars">${v.items.map(([l, val, disp], i) => `
      <div class="bar"><span>${inline(l)}</span><span class="track"><span class="fill" style="width:${(val / max) * 100}%;${delay(i, 100)}${v.c ? `;background:${col(v.c)}` : ''}"></span></span><b class="num">${esc(disp ?? val)}</b></div>`).join('')}</div>`;
  },

  pie(v) {
    const total = v.items.reduce((a, i) => a + i[1], 0);
    const palette = v.colors || ['ink', 'dark', 'orange', 'teal', 'violet', 'green', 'blue'];
    let a0 = -Math.PI / 2;
    const R0 = 90, r0 = v.donut === false ? 0 : 48;
    const segs = v.items.map(([l, val], i) => {
      const a1 = a0 + (val / total) * Math.PI * 2;
      const large = a1 - a0 > Math.PI ? 1 : 0;
      const p = (r, a) => `${(100 + r * Math.cos(a)).toFixed(2)},${(100 + r * Math.sin(a)).toFixed(2)}`;
      const d = r0
        ? `M${p(R0, a0)} A${R0},${R0} 0 ${large} 1 ${p(R0, a1)} L${p(r0, a1)} A${r0},${r0} 0 ${large} 0 ${p(r0, a0)} Z`
        : `M100,100 L${p(R0, a0)} A${R0},${R0} 0 ${large} 1 ${p(R0, a1)} Z`;
      const mid = (a0 + a1) / 2;
      const lx = 100 + (r0 ? (R0 + r0) / 2 : R0 * 0.6) * Math.cos(mid);
      const ly = 100 + (r0 ? (R0 + r0) / 2 : R0 * 0.6) * Math.sin(mid);
      a0 = a1;
      const pct = Math.round((val / total) * 100);
      return { d, c: col(palette[i % palette.length]), l, pct, lx, ly };
    });
    return `<div class="row" style="flex-wrap:wrap;justify-content:center;gap:18px">
      <svg viewBox="0 0 200 200" style="width:190px">${segs.map((s) => `<path d="${s.d}" style="fill:${s.c}" stroke="var(--surface)" stroke-width="2"/>`).join('')}
      ${segs.map((s) => s.pct >= 7 ? `<text x="${s.lx.toFixed(1)}" y="${(s.ly + 5).toFixed(1)}" text-anchor="middle" style="fill:#fff;font:700 14px var(--display)">${v.showPct === false ? '' : '%' + s.pct}</text>` : '').join('')}
      ${v.center ? `<text x="100" y="106" text-anchor="middle" style="fill:var(--graphite);font:800 20px var(--display)">${esc(v.center)}</text>` : ''}</svg>
      <div class="map-legend" style="flex-direction:column">${segs.map((s) => `<span><i style="background:${s.c}"></i>${inline(s.l)}</span>`).join('')}</div></div>`;
  },

  fraction(v) {
    return `<div class="pizza">${v.items.map(([n, d, label]) => {
      const slices = [];
      for (let i = 0; i < d; i++) {
        const a0 = -Math.PI / 2 + (i / d) * Math.PI * 2;
        const a1 = -Math.PI / 2 + ((i + 1) / d) * Math.PI * 2;
        const p = (a) => `${(50 + 44 * Math.cos(a)).toFixed(2)},${(50 + 44 * Math.sin(a)).toFixed(2)}`;
        const path = d === 1 ? `<circle cx="50" cy="50" r="44"` : `<path d="M50,50 L${p(a0)} A44,44 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${p(a1)} Z"`;
        slices.push(`${path} style="fill:${i < n ? 'var(--mat)' : 'var(--surface)'}" stroke="var(--graphite)" stroke-width="1.5"/>`);
      }
      return `<figure><svg viewBox="0 0 100 100" style="width:${v.size || 96}px">${slices.join('')}</svg><figcaption>${esc(label || `${n}/${d}`)}</figcaption></figure>`;
    }).join(v.op ? `<span style="font:800 30px var(--display)">${esc(v.op)}</span>` : '')}</div>`;
  },

  venn(v) {
    const t = (x, y, s, big) => `<text x="${x}" y="${y}" text-anchor="middle" style="fill:var(--graphite);font:${big ? 800 : 700} ${big ? 26 : 15}px ${big ? 'var(--display)' : 'var(--body)'}">${esc(s)}</text>`;
    return `<svg viewBox="0 0 320 200">
      <rect x="2" y="2" width="316" height="196" rx="14" style="fill:none;stroke:var(--line);stroke-width:2"/>
      <circle cx="120" cy="105" r="72" style="fill:var(--tr);fill-opacity:.18;stroke:var(--tr);stroke-width:2.5"/>
      <circle cx="200" cy="105" r="72" style="fill:var(--mat);fill-opacity:.18;stroke:var(--mat);stroke-width:2.5"/>
      ${t(92, 28, v.a)}${t(228, 28, v.b)}
      ${t(88, 114, v.onlyA ?? '', true)}${t(160, 114, v.both ?? '', true)}${t(232, 114, v.onlyB ?? '', true)}
      ${v.outside != null ? t(292, 186, v.outside, true) : ''}
    </svg>`;
  },

  numberline(v) {
    const W = 320, pad = 20, n = v.to - v.from;
    const x = (val) => pad + ((val - v.from) / n) * (W - 2 * pad);
    let ticks = '';
    for (let i = v.from; i <= v.to; i++) ticks += `<line x1="${x(i)}" x2="${x(i)}" y1="46" y2="58" style="stroke:var(--graphite);stroke-width:1.5"/><text x="${x(i)}" y="78" text-anchor="middle" style="fill:var(--muted);font:600 13px var(--body)">${i}</text>`;
    const marks = (v.marks || []).map((m) => `<circle cx="${x(m.v)}" cy="52" r="7" style="fill:${col(m.c || 'ink')}"/><text x="${x(m.v)}" y="30" text-anchor="middle" style="fill:${col(m.c || 'ink')};font:800 16px var(--display)">${esc(m.t)}</text>`).join('');
    const jumps = (v.jumps || []).map((j) => {
      const x1 = x(j.from), x2 = x(j.to), mx = (x1 + x2) / 2;
      return `<path d="M${x1},44 Q${mx},${10} ${x2},44" style="fill:none;stroke:${col(j.c || 'mat')};stroke-width:2.5" marker-end="url(#ah)"/><text x="${mx}" y="18" text-anchor="middle" style="fill:${col(j.c || 'mat')};font:800 14px var(--display)">${esc(j.t)}</text>`;
    }).join('');
    return `<svg viewBox="0 0 ${W} 90"><defs><marker id="ah" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" style="fill:var(--mat)"/></marker></defs>
      <line x1="${pad - 8}" x2="${W - pad + 8}" y1="52" y2="52" style="stroke:var(--graphite);stroke-width:2"/>${ticks}${jumps}${marks}</svg>`;
  },

  balance(v) {
    return `<svg viewBox="0 0 320 170" class="balance">
      <polygon points="160,150 140,168 180,168" style="fill:var(--graphite)"/>
      <line x1="160" y1="70" x2="160" y2="152" style="stroke:var(--graphite);stroke-width:4"/>
      <line x1="40" y1="70" x2="280" y2="70" style="stroke:var(--graphite);stroke-width:5;stroke-linecap:round"/>
      <line x1="70" y1="70" x2="50" y2="112" style="stroke:var(--muted);stroke-width:2"/><line x1="70" y1="70" x2="90" y2="112" style="stroke:var(--muted);stroke-width:2"/>
      <line x1="250" y1="70" x2="230" y2="112" style="stroke:var(--muted);stroke-width:2"/><line x1="250" y1="70" x2="270" y2="112" style="stroke:var(--muted);stroke-width:2"/>
      <path d="M20,112 Q70,140 120,112 Z" style="fill:var(--tr-soft);stroke:var(--tr);stroke-width:2"/>
      <path d="M200,112 Q250,140 300,112 Z" style="fill:var(--mat-soft);stroke:var(--mat);stroke-width:2"/>
      <text x="70" y="104" text-anchor="middle" style="fill:var(--graphite);font:800 22px var(--display)">${esc(v.left)}</text>
      <text x="250" y="104" text-anchor="middle" style="fill:var(--graphite);font:800 22px var(--display)">${esc(v.right)}</text>
      <text x="160" y="40" text-anchor="middle" style="fill:var(--ink);font:700 14px var(--body)">${esc(v.note || 'İki taraf hep dengede kalır')}</text>
    </svg>`;
  },

  cards(v) {
    // Küçük bilgi kutucukları (ör. "Sulh hukuk — küçük davalar")
    return `<div class="grid2">${v.items.map(([h, t, c], i) => `<div class="stat" style="${c ? `border-top:3px solid ${col(c)}` : ''};${delay(i, 80)}"><div style="font-family:var(--display);font-weight:700;font-size:18px;${c ? `color:${col(c)}` : ''}">${inline(h)}</div><div class="small" style="margin-top:4px">${inline(t)}</div></div>`).join('')}</div>`;
  },

  svg(v) {
    // İçerik dosyalarında elle çizilmiş özel çizimler için
    return v.svg;
  },
};
