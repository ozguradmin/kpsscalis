// Kayıtlı oturumlar: Özgür bir siteye (Google, LinkedIn, YC, Himalayas…) bir kez canlı tarayıcıdan giriş yapar,
// çerezler şifreli saklanır ve ajan sonraki başvurularda aynı oturumla açılır.
import { seal, unseal } from './lib/auth.js';
import { now, clip } from './lib/util.js';
import { log, allRows, addAction } from './lib/db.js';

// Kayıtlı alan adı (ör. accounts.google.com → google.com, x.co.uk → x.co.uk)
export function regDomain(host) {
  const h = String(host || '').replace(/^\./, '').toLowerCase();
  const p = h.split('.');
  if (p.length <= 2) return h;
  const sld = p[p.length - 2];
  return (/^(co|com|org|net|gov|edu|ac)$/.test(sld) && p[p.length - 1].length === 2) ? p.slice(-3).join('.') : p.slice(-2).join('.');
}

// Tarayıcıdaki tüm çerezleri alan adına göre şifreleyip sakla
export async function saveSessions(env, page, { only = null, note = null } = {}) {
  const cdp = await page.createCDPSession();
  const { cookies } = await cdp.send('Network.getAllCookies');
  const by = new Map();
  for (const c of cookies || []) {
    if (c.expires > 0 && c.expires * 1000 < now()) continue;
    const d = regDomain(c.domain);
    if (only && !only.includes(d)) continue;
    if (!by.has(d)) by.set(d, []);
    by.get(d).push({ name: c.name, value: c.value, domain: c.domain, path: c.path, expires: c.expires, httpOnly: c.httpOnly, secure: c.secure, sameSite: c.sameSite });
  }
  let saved = 0;
  for (const [d, list] of by) {
    if (list.length < 2 && !only) continue; // tek izleme çerezi olan siteleri saklama
    await env.DB.prepare('INSERT INTO sessions (domain, cookies, count, updated_at, note) VALUES (?,?,?,?,?) ON CONFLICT(domain) DO UPDATE SET cookies=excluded.cookies, count=excluded.count, updated_at=excluded.updated_at, note=COALESCE(excluded.note, sessions.note)')
      .bind(d, await seal(env, JSON.stringify(list)), list.length, now(), note).run();
    saved++;
  }
  return saved;
}

// Kayıtlı oturumları tarayıcıya yükle (hepsi; kimlik sağlayıcılar da dahil ki "Google ile giriş" çalışsın)
export async function loadSessions(env, page) {
  const rows = await allRows(env, 'SELECT domain, cookies FROM sessions ORDER BY updated_at DESC LIMIT 40');
  if (!rows.length) return 0;
  const cdp = await page.createCDPSession();
  let n = 0;
  for (const r of rows) {
    try {
      const list = JSON.parse(await unseal(env, r.cookies));
      await cdp.send('Network.setCookies', { cookies: list.map((c) => ({ ...c, expires: c.expires > 0 ? c.expires : undefined })) });
      n += list.length;
    } catch (e) { /* bozuk kayıt: atla */ }
  }
  return n;
}

// Canlı giriş görevi: tarayıcıyı verilen adreste açar, bağlantıyı e-postalar, Özgür giriş yaparken çerezleri dakikada bir kaydeder
export async function liveLogin(env, settings, { url, openBrowser, liveHandoff, alertUser, waitMin = 25 }) {
  const { browser, page } = await openBrowser(env, { recording: false });
  const target = new URL(url);
  const dom = regDomain(target.hostname);
  try {
    await loadSessions(env, page);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
    const h = await liveHandoff(page, { instructions: `Özgür, ${target.hostname} hesabına giriş yap (gerekirse Google ile). Girişi bitirince "Done"a bas; oturumu kaydedeceğim.`, waitMs: waitMin * 60000 });
    await addAction(env, { kind: 'handoff', title: `${target.hostname}: giriş yap (oturum kaydedilecek)`, detail: `${waitMin} dk açık. Giriş yap, bitince "Done"a bas.`, url: h.url, priority: 1, ttlMs: waitMin * 60000, dedupe: 'login_' + dom });
    await alertUser(env, settings, { key: `login_${dom}_${now()}`, url: h.url, subject: `Giriş: ${target.hostname} (${waitMin} dk açık)`, text: `İstediğin giriş ekranı hazır. "Canlı tarayıcı" bağlantısını aç, ${target.hostname} hesabına giriş yap (Google/LinkedIn ile girilebiliyorsa onu kullanabilirsin), sonra "Done"a bas.\nOturum şifreli saklanacak; ajan bu sitede sonraki başvurularda tekrar giriş istemeden devam edecek.` });
    let stop = false;
    // Dakikada bir kaydet: "Done"a basılmasa da oturum kaybolmaz (ve tarayıcı oturumu canlı kalır)
    const keep = (async () => { while (!stop) { await new Promise((r) => setTimeout(r, 45000)); if (!stop) await saveSessions(env, page, { note: 'canlı giriş' }).catch(() => 0); } })();
    const r = await h.done;
    stop = true; await keep.catch(() => {});
    const n = await saveSessions(env, page, { note: 'canlı giriş' });
    await env.DB.prepare("UPDATE actions SET status='done' WHERE id=?").bind('login_' + dom).run();
    await log(env, 'account', `${target.hostname}: canlı giriş ${r?.success ? 'tamamlandı' : 'süresi doldu'}; ${n} alan adının oturumu kaydedildi`, { data: { url: clip(page.url(), 200) } });
    return { ok: true, done: !!r?.success, saved: n };
  } finally {
    await browser.close().catch(() => {});
  }
}
