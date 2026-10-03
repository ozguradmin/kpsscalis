// Browser Run oturumu: sayfa gözlemi (form alanları, düğmeler, hatalar), eylemler ve ekran kaydı.
import puppeteer from '@cloudflare/puppeteer';
import { now, uid, sleep, clip } from '../lib/util.js';

// Sayfadaki etkileşimli öğeleri numaralayıp modele verilecek sade bir görünüm çıkarır.
// Not: page.evaluate'e string veriyoruz; paketleyicinin fonksiyon gövdesini bozmasını önler.
export const SNAPSHOT_JS = `(() => {
  const vis = (el) => { const r = el.getBoundingClientRect(); const st = getComputedStyle(el); return r.width > 1 && r.height > 1 && st.visibility !== 'hidden' && st.display !== 'none' && st.opacity !== '0'; };
  const txt = (s, n = 160) => (s || '').replace(/\\s+/g, ' ').trim().slice(0, n);
  const labelOf = (el) => {
    let t = '';
    if (el.id) { const l = document.querySelector('label[for="' + CSS.escape(el.id) + '"]'); if (l) t = l.innerText; }
    if (!t) { const l = el.closest('label'); if (l) t = l.innerText; }
    if (!t && el.getAttribute('aria-labelledby')) t = el.getAttribute('aria-labelledby').split(' ').map((i) => document.getElementById(i)?.innerText || '').join(' ');
    if (!t) t = el.getAttribute('aria-label') || '';
    if (!t) { const fs = el.closest('fieldset'); const lg = fs && fs.querySelector('legend'); if (lg) t = lg.innerText; }
    if (!t) { let p = el.parentElement; for (let i = 0; i < 3 && p && !t; i++, p = p.parentElement) { const c = p.querySelector('label, legend, .label, [class*=label], [class*=Label], h3, h4, p'); if (c && !c.contains(el) && txt(c.innerText)) t = c.innerText; } }
    if (!t) t = el.getAttribute('placeholder') || el.getAttribute('name') || '';
    return txt(t, 220);
  };
  const out = { url: location.href, title: document.title, fields: [], buttons: [], links: [], errors: [], captcha: false, iframes: [] };
  let n = 0;
  const tag = (el) => { if (!el.dataset.agentId) el.dataset.agentId = 'e' + (++n) + '_' + Math.random().toString(36).slice(2, 5); return el.dataset.agentId; };
  const radios = {};
  document.querySelectorAll('input, textarea, select, [role=combobox], [role=textbox][contenteditable=true], [contenteditable=true]').forEach((el) => {
    const type = (el.getAttribute('type') || el.tagName).toLowerCase();
    if (['hidden', 'submit', 'button', 'image', 'reset'].includes(type)) return;
    const isFile = type === 'file';
    // Özel tasarımlı radyo/onay kutularında gerçek input gizlidir; etiketi görünüyorsa alanı yine de listele
    const lbl = (type === 'radio' || type === 'checkbox') ? (el.closest('label') || (el.id && document.querySelector('label[for="' + CSS.escape(el.id) + '"]'))) : null;
    if (!isFile && !vis(el) && !(lbl && vis(lbl))) return;
    const f = { id: tag(el), kind: el.getAttribute('role') === 'combobox' && el.tagName !== 'SELECT' ? 'combobox' : el.tagName === 'SELECT' ? 'select' : el.tagName === 'TEXTAREA' ? 'textarea' : el.isContentEditable && el.tagName !== 'INPUT' ? 'richtext' : type, label: labelOf(el), required: el.required || el.getAttribute('aria-required') === 'true' || /\\*\\s*$/.test(labelOf(el)) };
    if (el.name) f.name = el.name.slice(0, 60);
    if (el.tagName === 'SELECT') f.options = [...el.options].map((o) => txt(o.text, 80)).filter(Boolean).slice(0, 60);
    if (type === 'radio' || type === 'checkbox') {
      f.checked = el.checked;
      const own = txt((el.closest('label') || document.querySelector('label[for="' + CSS.escape(el.id || '_') + '"]') || el.parentElement || {}).innerText, 120);
      f.option = own;
      if (type === 'radio' && el.name) { const g = radios[el.name] = radios[el.name] || []; g.push(f); }
      const grp = el.closest('fieldset, [role=radiogroup], [role=group]');
      if (grp) { const lg = grp.querySelector('legend, label, [class*=label], h3, h4, p'); if (lg) f.group = txt(lg.innerText, 200); }
    } else if (!isFile) f.value = txt(el.value ?? el.innerText, 120);
    if (isFile) f.accept = el.getAttribute('accept') || '';
    if (el.getAttribute('aria-invalid') === 'true') f.invalid = true;
    out.fields.push(f);
  });
  document.querySelectorAll('button, [role=button], input[type=submit], input[type=button], a.button, a[class*=btn], a[class*=Button], a:not([href]), [onclick], [class*=cursor-pointer]').forEach((el) => {
    if (el.closest('button') && el.tagName !== 'BUTTON') return; // düğme içindeki span'ı ikinci kez sayma
    if (!vis(el)) return;
    const t = txt(el.innerText || el.value || el.getAttribute('aria-label'), 80);
    if (!t || (!/^(BUTTON|INPUT|A)$/.test(el.tagName) && t.length > 40)) return;
    out.buttons.push({ id: tag(el), text: t, type: el.type || '', disabled: !!el.disabled || el.getAttribute('aria-disabled') === 'true' });
  });
  document.querySelectorAll('a[href]').forEach((el) => {
    if (!vis(el)) return;
    const t = txt(el.innerText, 60);
    if ((el.getAttribute('href') || '').startsWith('#') || (el.hash && el.href.split('#')[0] === location.href.split('#')[0])) return; // sayfa içi çapa
    // Başvuru formu / e-posta bağlantıları (Google Forms, Typeform, Tally, mailto…) en başa: metin "this form" bile olsa ajan görsün
    if (/docs\\.google\\.com\\/forms|forms\\.gle|typeform\\.com|tally\\.so|jotform|airtable\\.com\\/(app|shr)|forms\\.office|hsforms|^mailto:/i.test(el.href)) out.links.unshift({ id: tag(el), text: t || 'form', href: el.href.slice(0, 200) });
    else if (/apply|başvur|bewerb|postul|candidat|inscri|sign ?up|register|log ?in|sign ?in|continue|next|submit|career|jobs?\\b|hiring|отклик|откликнуться|подать|кандид|aplicar/i.test(t + ' ' + el.href)) out.links.push({ id: tag(el), text: t, href: el.href.slice(0, 200) });
  });
  document.querySelectorAll('[role=alert], .error, .errors, [class*=error], [class*=Error], [class*=invalid]').forEach((el) => { if (vis(el)) { const t = txt(el.innerText, 200); if (t && !out.errors.includes(t)) out.errors.push(t); } });
  document.querySelectorAll('iframe').forEach((f) => { const s = f.src || ''; if (/recaptcha|hcaptcha|turnstile|challenges\\.cloudflare|arkoselabs|funcaptcha/i.test(s)) { const r = f.getBoundingClientRect(); if (r.width > 60 && r.height > 60) out.captcha = true; } else if (s && vis(f)) out.iframes.push(s.slice(0, 300)); });
  const ts = document.querySelector('input[name="cf-turnstile-response"]');
  if (ts && !ts.value) out.captcha = true;
  if (document.querySelector('.g-recaptcha:not([data-size=invisible]), .h-captcha:not([data-size=invisible]), .cf-turnstile, [id^=cf-chl-widget], #amzn-captcha-verify-button, [class*=amzn-captcha], iframe[title*="Cloudflare security"], iframe[title*="hCaptcha" i][src*="checkbox"]') || /verify you are human|confirm you are (a )?human|i'm not a robot|robot değilim|security check|human verification/i.test(document.body.innerText.slice(0, 5000))) out.captcha = true;
  const main = document.querySelector('main, [role=main], form, #content, .content') || document.body;
  out.text = txt(main.innerText, 3500);
  out.fields = out.fields.slice(0, 90); out.buttons = out.buttons.slice(0, 40); out.links = out.links.slice(0, 25); out.errors = out.errors.slice(0, 10);
  return out;
})()`;

export class Recorder {
  constructor(env, { appId = null, title = '', days = 3 } = {}) {
    this.env = env; this.id = uid('rec_'); this.appId = appId; this.seq = 0; this.timeline = []; this.title = title; this.days = days; this.started = false;
  }
  async start(sessionId = null) {
    const t = now();
    await this.env.DB.prepare('INSERT INTO recordings (id, app_id, created_at, expires_at, frames, title, session_id) VALUES (?,?,?,?,0,?,?)').bind(this.id, this.appId, t, t + this.days * 86400000, this.title, sessionId).run();
    this.started = true;
  }
  async shot(page, label) {
    if (!this.started) return null;
    try {
      const buf = await page.screenshot({ type: 'jpeg', quality: 42 });
      const seq = ++this.seq;
      const key = `rec/${this.id}/${String(seq).padStart(4, '0')}.jpg`;
      await this.env.R2.put(key, buf, { httpMetadata: { contentType: 'image/jpeg' }, customMetadata: { label: clip(label, 200), ts: String(now()) } });
      this.timeline.push({ seq, ts: now(), label: clip(label, 300), url: clip(page.url(), 300) });
      await this.env.DB.prepare('UPDATE recordings SET frames=? WHERE id=?').bind(seq, this.id).run();
      await this.env.R2.put(`rec/${this.id}/timeline.json`, JSON.stringify(this.timeline), { httpMetadata: { contentType: 'application/json' } }).catch(() => {});
      return key;
    } catch (e) { return null; }
  }
  note(label, data) { this.timeline.push({ ts: now(), label: clip(label, 500), data }); }
  async finish() {
    if (!this.started) return;
    await this.env.R2.put(`rec/${this.id}/timeline.json`, JSON.stringify(this.timeline), { httpMetadata: { contentType: 'application/json' } });
  }
}

export async function openBrowser(env, { recording = true } = {}) {
  const browser = await puppeteer.launch(env.BROWSER, { keep_alive: 600000, recording });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });
  await page.setExtraHTTPHeaders({ 'accept-language': 'en-US,en;q=0.9,tr;q=0.8' });
  // alert/confirm/beforeunload pencereleri sayfayı kilitler (evaluate sonsuza dek bekler): hepsini kabul et
  page.on('dialog', (d) => { d.accept().catch(() => {}); });
  // Yeni sekme/pencere açan başvuru düğmeleri aynı sekmede açılsın (ajan tek sekmeyi izler)
  await page.evaluateOnNewDocument(`(() => { const o = window.open; window.open = function (u) { if (u && typeof u === 'string' && !/^javascript:/i.test(u)) { location.href = u; return window; } return o.apply(this, arguments); }; document.addEventListener('click', (e) => { const a = e.target && e.target.closest && e.target.closest('a[target]'); if (a) a.removeAttribute('target'); }, true); })()`).catch(() => {});
  let sessionId = null;
  try { sessionId = browser.sessionId(); } catch (e) { /* eski sürüm */ }
  return { browser, page, sessionId };
}

// Çerez/izin bandını kapat (Workable vb. bant arka planı Gönder düğmesinin üstünü örtüp tıklamayı yutuyor)
const CONSENT_JS = `(() => {
  const vis = (e) => { const r = e.getBoundingClientRect(); const s = getComputedStyle(e); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none'; };
  const direct = document.querySelector('#onetrust-reject-all-handler, #onetrust-accept-btn-handler, #CybotCookiebotDialogBodyButtonDecline, [data-ui="cookie-consent-decline"], [data-ui="cookie-consent-accept"], .cc-deny, .cc-dismiss');
  if (direct && vis(direct)) { direct.click(); return 'kapatıldı'; }
  const RX = /^(decline all|reject all|reject|decline|deny|only necessary|necessary only|accept all|accept|allow all|i agree|agree|got it|ok|tümünü reddet|reddet|kabul et|tümünü kabul et)$/i;
  const boxes = [...document.querySelectorAll('[id*="cookie" i], [class*="cookie" i], [id*="consent" i], [class*="consent" i], [data-ui*="cookie" i], [aria-label*="cookie" i], [role="dialog"], [class*="gdpr" i]')].filter(vis);
  for (const box of boxes) {
    if (!/cookie|çerez|consent|gdpr/i.test(box.innerText || '')) continue;
    const btns = [...box.querySelectorAll('button, a[role="button"], [role="button"]')].filter((b) => vis(b) && RX.test((b.innerText || b.getAttribute('aria-label') || '').trim()));
    const pick = btns.find((b) => /decline|reject|deny|necessary|reddet/i.test(b.innerText)) || btns[0];
    if (pick) { pick.click(); return 'kapatıldı'; }
  }
  return '';
})()`;
export async function dismissConsent(page) {
  try { const r = await page.evaluate(CONSENT_JS); if (r) await sleep(500); return r; } catch (e) { return ''; }
}

// Sayfa işlemleri için üst süre: donmuş bir sekme ajanı sonsuza dek bekletmesin
export function withTimeout(p, ms, what = 'işlem') {
  let t; return Promise.race([p, new Promise((_, rej) => { t = setTimeout(() => rej(new Error(`${what} ${Math.round(ms / 1000)} sn içinde bitmedi (sayfa yanıt vermiyor)`)), ms); })]).finally(() => clearTimeout(t));
}

export async function snapshot(page) {
  await withTimeout(dismissConsent(page), 15000, 'çerez bandı').catch(() => {});
  try { return await withTimeout(page.evaluate(SNAPSHOT_JS), 25000, 'sayfa okuma'); } catch (e) { return { url: page.url(), error: String(e.message), fields: [], buttons: [], links: [], errors: [], text: '' }; }
}

const sel = (id) => `[data-agent-id="${id}"]`;

async function settle(page, ms = 1500) {
  try { await page.waitForNetworkIdle({ idleTime: 500, timeout: ms + 2500 }); } catch (e) { /* ağ hiç susmayabilir */ }
}

// React/Vue kontrollü alanlarda değer yazma: yerel setter + input/change olayları
const SET_VALUE_JS = (id, value) => `(() => {
  const el = document.querySelector('[data-agent-id="${id}"]');
  if (!el) return 'yok';
  el.focus();
  if (el.isContentEditable && el.tagName !== 'INPUT' && el.tagName !== 'TEXTAREA') { el.innerText = ${JSON.stringify(value)}; el.dispatchEvent(new InputEvent('input', { bubbles: true })); return 'ok'; }
  const proto = el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(proto, 'value').set;
  setter.call(el, ${JSON.stringify(value)});
  el.dispatchEvent(new Event('input', { bubbles: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
  el.dispatchEvent(new Event('blur', { bubbles: true }));
  return 'ok';
})()`;

const UPLOAD_JS = (id, b64, name, mime) => `(() => {
  const el = document.querySelector('[data-agent-id="${id}"]');
  if (!el) return 'yok';
  const bin = atob(${JSON.stringify(b64)});
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  const file = new File([bytes], ${JSON.stringify(name)}, { type: ${JSON.stringify(mime)} });
  const dt = new DataTransfer();
  dt.items.add(file);
  el.files = dt.files;
  el.dispatchEvent(new Event('input', { bubbles: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
  return 'ok:' + el.files.length;
})()`;

// Açılır liste seçenekleri arasında en iyi eşleşmeyi bulur (Associates ~ Associate, Turkey ~ Türkiye (+90) ...)
const MATCH_FN = `(want, list) => {
  const norm = (s) => (s || '').toLowerCase().normalize('NFKD').replace(/[\\u0300-\\u036f]/g, '').replace(/ı/g, 'i').replace(/[^a-z0-9+]+/g, ' ').trim();
  const alias = { turkiye: 'turkey', 'republic of turkey': 'turkey', usa: 'united states', uk: 'united kingdom' };
  const w = alias[norm(want)] || norm(want);
  const wt = w.split(' ').filter(Boolean);
  let best = -1, bestScore = 0;
  list.forEach((t, i) => {
    const o = norm(t); if (!o) return;
    let sc = 0;
    if (o === w) sc = 100; else if (o.startsWith(w) || w.startsWith(o)) sc = 85; else if (o.includes(w)) sc = 75;
    else {
      const ot = o.split(' ');
      const hits = wt.filter((a) => ot.some((b) => a.length >= 3 && b.length >= 3 && (a.startsWith(b) || b.startsWith(a)))).length;
      sc = Math.round(hits / Math.max(wt.length, 1) * 70 - Math.max(0, ot.length - wt.length) * 3);
    }
    if (sc > bestScore) { bestScore = sc; best = i; }
  });
  return bestScore >= 40 ? best : -1;
}`;

const PICK_OPTION_JS = (want) => `(() => {
  const match = ${MATCH_FN};
  const opts = [...document.querySelectorAll('[role=option], [class*=option]:not(select):not([class*=options]), li[id*=option], .select__option, [data-value]')].filter((o) => { const r = o.getBoundingClientRect(); return r.width > 1 && r.height > 1 && o.innerText.trim(); });
  if (!opts.length) return 'seçenek yok';
  const i = match(${JSON.stringify(want)}, opts.map((o) => o.innerText.trim()));
  if (i < 0) return 'bulunamadı: ' + opts.slice(0, 10).map((o) => o.innerText.trim()).join(' | ');
  opts[i].scrollIntoView({ block: 'center' });
  opts[i].click();
  return 'ok: ' + opts[i].innerText.trim().slice(0, 60);
})()`;

const LIST_OPTIONS_JS = `(() => [...document.querySelectorAll('[role=option], .select__option, li[id*=option]')].filter((o) => { const r = o.getBoundingClientRect(); return r.width > 1 && r.height > 1; }).map((o) => o.innerText.trim()).filter(Boolean).slice(0, 80))()`;

const NATIVE_SELECT_JS = (id, want) => `(() => {
  const match = ${MATCH_FN};
  const el = document.querySelector('[data-agent-id="${id}"]');
  if (!el) return null;
  const i = match(${JSON.stringify(want)}, [...el.options].map((o) => o.text));
  if (i < 0) return null;
  el.value = el.options[i].value;
  el.dispatchEvent(new Event('input', { bubbles: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
  return el.options[i].text;
})()`;

// Bayraklı telefon alanları (intl-tel-input, react-phone-input-2, react-phone-number-input, MUI tel…): ülke açılır listesini aç
const PHONE_TOGGLE_JS = (id) => `(() => {
  const el = document.querySelector('[data-agent-id="${id}"]');
  if (!el) return 'yok';
  const hint = (el.type === 'tel') || /phone|telefon|mobile|tel\\b/i.test([el.name, el.id, el.placeholder, el.getAttribute('aria-label'), el.autocomplete].join(' '));
  if (!hint) return 'telefon değil';
  const box = el.parentElement?.closest('.iti, .react-tel-input, .PhoneInput, [class*=phone i], [class*=Phone], [class*=tel-input]') || el.parentElement?.parentElement || el.parentElement;
  const sel = box?.querySelector('select');
  if (sel && [...sel.options].some((o) => /^(TR|tr)$/.test(o.value) || /turkey|türkiye/i.test(o.text))) {
    const o = [...sel.options].find((o) => /^(TR|tr)$/.test(o.value) || /turkey|türkiye/i.test(o.text));
    sel.value = o.value; sel.dispatchEvent(new Event('input', { bubbles: true })); sel.dispatchEvent(new Event('change', { bubbles: true }));
    return 'native';
  }
  const btn = box?.querySelector('.iti__selected-country, .iti__selected-flag, .iti__flag-container button, .selected-flag, .flag-dropdown, button[aria-haspopup], [role=combobox], button[class*=flag i], button[class*=country i], div[class*=flag i][tabindex]');
  if (!btn || btn === el) return 'bayrak yok';
  btn.scrollIntoView({ block: 'center' });
  btn.click();
  return 'açıldı';
})()`;
const PHONE_PICK_TR_JS = `(() => {
  const vis = (o) => { const r = o.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(o).visibility !== 'hidden'; };
  const direct = [...document.querySelectorAll('[data-country-code="tr"], [data-country-code="TR"], li[data-dial-code="90"], [data-value="TR"], [data-value="tr"], [data-iso2="tr"]')].filter(vis);
  const cands = direct.length ? direct : [...document.querySelectorAll('li, [role=option], [class*=country i] div, [class*=option]')].filter((o) => vis(o) && /^\\W*(turkey|türkiye|turkiye)\\b|\\b(turkey|türkiye)\\s*\\(?\\+?90\\)?/i.test(o.innerText.trim()));
  if (!cands.length) return 'Türkiye seçeneği yok';
  cands[0].scrollIntoView({ block: 'center' });
  cands[0].click();
  return 'ok';
})()`;
async function setPhoneTurkey(page, id) {
  const t = await page.evaluate(PHONE_TOGGLE_JS(id)).catch(() => 'hata');
  if (t === 'native') return 'ülke: Türkiye';
  if (t !== 'açıldı') return null;
  await new Promise((r) => setTimeout(r, 350));
  let p = await page.evaluate(PHONE_PICK_TR_JS).catch(() => 'hata');
  if (p !== 'ok') {
    // Arama kutulu listeler: "Turk" yaz
    const search = await page.$('input[type=search], .iti__search-input, .search-box, [role=listbox] input, [class*=search i] input');
    if (search) { await search.type('Turk', { delay: 20 }).catch(() => {}); await new Promise((r) => setTimeout(r, 300)); p = await page.evaluate(PHONE_PICK_TR_JS).catch(() => 'hata'); }
  }
  if (p !== 'ok') await page.keyboard.press('Escape').catch(() => {});
  return p === 'ok' ? 'ülke: Türkiye' : `ülke seçilemedi (${p})`;
}

// Tek eylemi uygular; sonucu kısa metin olarak döndürür
export async function act(page, a, ctx) {
  const { op } = a;
  try {
    if (op === 'fill' || op === 'type') {
      let v = String(a.value ?? '');
      const handle = await page.$(sel(a.id));
      if (!handle) return `fill ${a.id}: öğe yok`;
      // Türk numarası + bayraklı alan: önce ülkeyi Türkiye yap, sonra alanın beklediği biçimde yaz
      if (/^\s*(\+?90|0)?\s*5\d{2}[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}\s*$/.test(v)) {
        const c = await setPhoneTurkey(page, a.id);
        if (c) {
          const digits = v.replace(/\D/g, '').replace(/^90/, '').replace(/^0/, '');
          const cur = await page.$eval(sel(a.id), (el) => el.value || '').catch(() => '');
          await handle.click({ clickCount: 3 }).catch(() => {});
          await page.keyboard.press('Backspace').catch(() => {});
          // Alan alan kodunu kendisi yazıyorsa (+90 önekli) sadece ulusal numarayı yaz
          const pre = await page.$eval(sel(a.id), (el) => el.value || '').catch(() => '');
          await handle.type(/\+?90/.test(pre) || /\+?90/.test(cur) ? digits : `+90${digits}`, { delay: 15 });
          const fin = await page.$eval(sel(a.id), (el) => el.value || '').catch(() => '');
          if (!fin.replace(/\D/g, '').includes(digits)) { await handle.click({ clickCount: 3 }).catch(() => {}); await page.keyboard.press('Backspace').catch(() => {}); await handle.type(digits, { delay: 15 }); }
          return `fill ${a.id}: telefon (${c}) → ${await page.$eval(sel(a.id), (el) => el.value || '').catch(() => '?')}`;
        }
      }
      const r = await page.evaluate(SET_VALUE_JS(a.id, v));
      // Bazı alanlar gerçek tuş olayı ister (otomatik tamamlama, telefon maskesi)
      if (a.keys || v.length < 60) {
        const now2 = await page.$eval(sel(a.id), (el) => el.value ?? el.innerText).catch(() => null);
        if (now2 !== v) { await handle.click({ clickCount: 3 }).catch(() => {}); await page.keyboard.press('Backspace').catch(() => {}); await handle.type(v, { delay: 8 }); }
      }
      if (a.enter) await page.keyboard.press('Enter');
      return `fill ${a.id}: ${r}`;
    }
    if (op === 'select') {
      const handle = await page.$(sel(a.id));
      if (!handle) return `select ${a.id}: öğe yok`;
      const tagName = await handle.evaluate((el) => el.tagName);
      if (tagName === 'SELECT') {
        const val = await page.evaluate(NATIVE_SELECT_JS(a.id, String(a.value)));
        return val ? `select ${a.id}: ${val}` : `select ${a.id}: seçenek bulunamadı (${a.value})`;
      }
      // Arama kutulu açılır liste (react-select vb.): önce aç ve seçeneklere bak, yoksa ilk kelimeyi yazıp süz
      await handle.evaluate((el) => el.scrollIntoView({ block: 'center' }));
      await handle.click().catch(() => {});
      await sleep(500);
      let r = await page.evaluate(PICK_OPTION_JS(a.value));
      if (!r.startsWith('ok')) {
        const word = String(a.value).split(/[\s(,]+/).find((x) => x.length >= 2) || String(a.value);
        await handle.type(word.slice(0, 12), { delay: 25 }).catch(() => {});
        await sleep(900);
        r = await page.evaluate(PICK_OPTION_JS(a.value));
        if (!r.startsWith('ok')) {
          for (let k = 0; k < 12; k++) await page.keyboard.press('Backspace').catch(() => {});
          await handle.type(String(a.value).slice(0, 40), { delay: 20 }).catch(() => {});
          await sleep(900);
          r = await page.evaluate(PICK_OPTION_JS(a.value));
          if (!r.startsWith('ok')) {
            // Eşleşme yok: kutuyu temizle, listeyi boş filtreyle aç, tüm seçenekleri modele bildir
            for (let k = 0; k < 45; k++) await page.keyboard.press('Backspace').catch(() => {});
            await sleep(500);
            const all = await page.evaluate(LIST_OPTIONS_JS).catch(() => []);
            await page.keyboard.press('Escape').catch(() => {});
            r = `eşleşme yok. Bu listedeki seçenekler: ${all.length ? all.join(' | ') : '(görünmüyor)'} — birini birebir yazarak tekrar dene`;
          }
        }
      }
      await sleep(250);
      return `select ${a.id}: ${r}`;
    }
    if (op === 'check' || op === 'uncheck' || op === 'radio') {
      const handle = await page.$(sel(a.id));
      if (!handle) return `${op} ${a.id}: öğe yok`;
      const checked = await handle.evaluate((el) => el.checked);
      const want = op !== 'uncheck';
      if (checked !== want) {
        // Önce gerçek kullanıcı gibi: görünür etikete fareyle tıkla (React/Ashby gibi formlar durumu ancak böyle günceller)
        const lab = await handle.evaluateHandle((el) => el.closest('label') || (el.id && document.querySelector(`label[for="${CSS.escape(el.id)}"]`)) || null);
        const labEl = lab.asElement();
        let done = false;
        if (labEl) {
          await labEl.evaluate((l) => l.scrollIntoView({ block: 'center' }));
          const box = await labEl.boundingBox();
          if (box && box.width > 2 && box.height > 2) { await page.mouse.click(box.x + Math.min(12, box.width / 2), box.y + box.height / 2); done = true; await sleep(200); }
        }
        if (!done || (await handle.evaluate((el) => el.checked)) !== want) {
          const box = await handle.boundingBox();
          if (box && box.width > 2 && box.height > 2) await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
          else await handle.evaluate((el) => el.scrollIntoView({ block: 'center' })).then(() => handle.click()).catch(async () => { await handle.evaluate((el) => el.click()); });
        }
      }
      const after = await handle.evaluate((el) => el.checked);
      if (after !== want) await handle.evaluate((el) => { const l = el.closest('label') || (el.id && document.querySelector(`label[for="${CSS.escape(el.id)}"]`)); if (l) { l.scrollIntoView({ block: 'center' }); l.click(); } });
      if ((await handle.evaluate((el) => el.checked)) !== want) {
        // Son çare: React/Vue durumunu da güncelleyecek şekilde değeri ayarla ve olayları tetikle
        await handle.evaluate((el, want) => { const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'checked').set; set.call(el, want); el.dispatchEvent(new MouseEvent('click', { bubbles: true })); el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); }, want);
      }
      return `${op} ${a.id}: ${await handle.evaluate((el) => el.checked)}`;
    }
    if (op === 'upload') {
      const which = a.file || 'cv_en';
      const f = await ctx.file(which);
      const r = await page.evaluate(UPLOAD_JS(a.id, f.b64, f.name, f.mime));
      await sleep(1200);
      return `upload ${a.id} (${f.name}): ${r}`;
    }
    if (op === 'click') {
      const handle = await page.$(sel(a.id));
      if (!handle) return `click ${a.id}: öğe yok`;
      await handle.evaluate((el) => { el.scrollIntoView({ block: 'center' }); const a = el.closest('a'); if (a) a.removeAttribute('target'); const f = el.closest('form'); if (f) f.removeAttribute('target'); });
      // Öğenin üstünü başka bir katman (çerez bandı, modal arka planı, sabit alt çubuk) örtüyor mu?
      const covered = async () => handle.evaluate((el) => { const r = el.getBoundingClientRect(); const t = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2); return t && !el.contains(t) && !t.contains(el) ? `${t.tagName.toLowerCase()}${t.id ? '#' + t.id : ''}${typeof t.className === 'string' && t.className ? '.' + t.className.split(' ')[0] : ''}` : ''; }).catch(() => '');
      let cov = await covered();
      if (cov) { await dismissConsent(page); await handle.evaluate((el) => el.scrollIntoView({ block: 'center' })).catch(() => {}); cov = await covered(); }
      const nav = page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 8000 }).catch(() => null);
      // Örtülüyse fare tıklaması katmana gider; DOM üzerinden tıkla
      if (cov) await handle.evaluate((el) => el.click());
      else await handle.click().catch(async () => { await handle.evaluate((el) => el.click()); });
      await Promise.race([nav, sleep(3500)]);
      await settle(page);
      return `click ${a.id}: ok${cov ? ` (üstü ${cov} ile örtülüydü; doğrudan tıklandı)` : ''} → ${clip(page.url(), 120)}`;
    }
    if (op === 'press') { await page.keyboard.press(a.key || 'Enter'); await settle(page); return `press ${a.key}`; }
    if (op === 'goto') { await page.goto(a.url, { waitUntil: 'domcontentloaded', timeout: 30000 }); await settle(page); return `goto ${clip(a.url, 100)}`; }
    if (op === 'scroll') { await page.evaluate(`window.scrollBy(0, ${Number(a.dy) || 700})`); await sleep(400); return 'scroll'; }
    if (op === 'wait') { await sleep(Math.min(15000, Number(a.ms) || 2000)); return `wait ${a.ms}`; }
    if (op === 'email_code' || op === 'email_link') {
      const found = await ctx.waitForMail(a.hint || '', op === 'email_link' ? 'link' : 'code');
      if (!found) return `${op}: e-posta gelmedi`;
      if (op === 'email_link') { await page.goto(found, { waitUntil: 'domcontentloaded', timeout: 30000 }); await settle(page); return `email_link: açıldı ${clip(found, 80)}`; }
      if (a.id) { await page.evaluate(SET_VALUE_JS(a.id, found)); const h = await page.$(sel(a.id)); const v = await page.$eval(sel(a.id), (el) => el.value).catch(() => ''); if (h && v !== found) await h.type(found, { delay: 20 }); }
      return `email_code: ${found} ${a.id ? 'yazıldı' : 'bulundu'}`;
    }
    return `bilinmeyen eylem: ${op}`;
  } catch (e) {
    return `${op} hata: ${clip(e.message, 160)}`;
  }
}

// Canlı devralma: CAPTCHA vb. için Live View bağlantısı üretir ve (istenirse) insanı bekler
export async function liveHandoff(page, { instructions, waitMs = 0 }) {
  const cdp = await page.createCDPSession();
  const { devtoolsFrontendUrl } = await cdp.send('Cloudflare.getLiveView', { mode: 'tab', expiresInMs: 3600000 });
  if (!waitMs) return { url: devtoolsFrontendUrl, done: null };
  const done = new Promise((resolve) => { cdp.once('Cloudflare.handoffComplete', (r) => resolve(r)); setTimeout(() => resolve({ success: false, reason: 'timeout' }), waitMs + 5000); });
  await cdp.send('Cloudflare.handoff', { instructions, timeout: waitMs });
  return { url: devtoolsFrontendUrl, done };
}
