// Küçük yardımcılar: kimlik, zaman, metin temizleme, zaman aşımlı fetch.

export const now = () => Date.now();
export const DAY = 86400000;
export const HOUR = 3600000;
export const MIN = 60000;

export function uid(prefix = '') {
  const b = new Uint8Array(9);
  crypto.getRandomValues(b);
  return prefix + [...b].map((x) => x.toString(36).padStart(2, '0')).join('').slice(0, 14);
}

export async function sha256(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(String(text)));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Türkiye saatine göre gün anahtarı (YYYY-MM-DD)
export function dayKey(t = Date.now()) {
  return new Date(t + 3 * HOUR).toISOString().slice(0, 10);
}

export function trTime(t) {
  if (!t) return '';
  return new Date(Number(t) + 3 * HOUR).toISOString().replace('T', ' ').slice(0, 16);
}

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', '#39': "'", hellip: '…', mdash: '—', ndash: '–', rsquo: '’', lsquo: '‘', ldquo: '“', rdquo: '”', bull: '•' };
export function decodeEntities(s) {
  return String(s || '').replace(/&(#x?[0-9a-f]+|[a-z0-9]+);/gi, (m, e) => {
    if (e[0] === '#') {
      const n = e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(n) ? String.fromCodePoint(n) : m;
    }
    return ENTITIES[e.toLowerCase()] ?? m;
  });
}

export function htmlToText(html, max = 12000) {
  if (!html) return '';
  let s = decodeEntities(String(html)); // bazı API'ler HTML'i kaçışlı döndürüyor (Greenhouse)
  s = s.replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|h[1-6]|tr|ul|ol|section)>/gi, '\n')
    .replace(/<li[^>]*>/gi, '• ')
    .replace(/<[^>]+>/g, ' ');
  s = decodeEntities(s).replace(/[ \t\f\v ]+/g, ' ').replace(/\n\s*\n\s*/g, '\n').trim();
  return s.length > max ? s.slice(0, max) + '…' : s;
}

export function clip(s, n) {
  s = String(s ?? '');
  return s.length > n ? s.slice(0, n - 1) + '…' : s;
}

export function normKey(s) {
  return String(s || '').toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .replace(/\b(gmbh|inc|llc|ltd|sp\. z o\.o\.|s\.a\.|bv|ag|oy|ab|srl|sas)\b/g, '')
    .replace(/[^a-z0-9]+/g, ' ').trim();
}

export async function fetchT(url, opts = {}, ms = 25000) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort('timeout'), ms);
  try {
    const headers = { 'user-agent': 'Mozilla/5.0 (compatible; OzgurJobAgent/2.0; +https://ozgurguler.tech)', accept: 'application/json, text/xml, application/rss+xml, */*', ...(opts.headers || {}) };
    return await fetch(url, { ...opts, headers, signal: ctl.signal });
  } finally { clearTimeout(t); }
}

export async function fetchJSON(url, opts = {}, ms) {
  const r = await fetchT(url, opts, ms);
  if (!r.ok) throw new Error(`HTTP ${r.status} ${url.slice(0, 80)}`);
  return r.json();
}

export async function fetchText(url, opts = {}, ms) {
  const r = await fetchT(url, opts, ms);
  if (!r.ok) throw new Error(`HTTP ${r.status} ${url.slice(0, 80)}`);
  return r.text();
}

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export function safeJSON(s, fallback = null) {
  if (s == null || s === '') return fallback;
  if (typeof s === 'object') return s;
  try { return JSON.parse(s); } catch (e) { return fallback; }
}

export function toTs(v) {
  if (v == null || v === '') return null;
  if (typeof v === 'number') return v < 1e12 ? v * 1000 : v;
  if (/^\d+$/.test(String(v))) { const n = Number(v); return n < 1e12 ? n * 1000 : n; }
  const t = Date.parse(v);
  return Number.isFinite(t) ? t : null;
}

// Basit RSS/Atom ayrıştırıcı (Workers'ta DOMParser yok)
export function parseRSS(xml) {
  const items = [];
  const blocks = String(xml).match(/<(item|entry)[\s>][\s\S]*?<\/\1>/gi) || [];
  const tag = (b, t) => {
    const m = b.match(new RegExp(`<${t}[^>]*>([\\s\\S]*?)<\\/${t}>`, 'i'));
    if (!m) return '';
    return m[1].replace(/^<!\[CDATA\[/, '').replace(/\]\]>$/, '').trim();
  };
  for (const b of blocks) {
    let link = tag(b, 'link');
    if (!link) { const m = b.match(/<link[^>]*href="([^"]+)"/i); link = m ? m[1] : ''; }
    items.push({
      title: decodeEntities(tag(b, 'title')),
      link: decodeEntities(link).trim(),
      guid: tag(b, 'guid') || tag(b, 'id') || link,
      description: tag(b, 'description') || tag(b, 'content:encoded') || tag(b, 'content') || tag(b, 'summary'),
      pubDate: tag(b, 'pubDate') || tag(b, 'published') || tag(b, 'updated') || tag(b, 'dc:date'),
      author: tag(b, 'dc:creator') || tag(b, 'author'),
      category: tag(b, 'category'),
    });
  }
  return items;
}

export function b64(buf) {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  return btoa(s);
}

export function hostOf(url) {
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch (e) { return ''; }
}

export function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...headers } });
}
