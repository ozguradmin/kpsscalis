// Başvuruya özel CV: aynı tasarım (ozgurguler.tech/pro/*.pdf, ReportLab), sadece unvan, özet ve sıralama ilana göre değişir.
// İçerik cv-data.js'ten gelir; yeni bilgi eklenmez. Basılan PDF tasarım denetiminden geçmezse orijinal CV kullanılır.
import { CV_DATA } from '../cv-data.js';
import { CV_VERSION } from '../cv-text.js';
import { cvPdf, profileContext, HONESTY_RULES, STYLE_RULES } from '../profile.js';
import { llm } from '../lib/llm.js';
import { clip, safeJSON } from '../lib/util.js';
import { log, bumpUsage } from '../lib/db.js';
import { truthCheck, letterRedFlags, unsupportedTech } from './materials.js';

// İzin verilen unvanlar: her biri CV'deki gerçek işlere dayanır, tek satıra sığar
export const CV_TITLES = {
  default: { en: 'Mobile, Game & Web Developer', tr: 'Mobil, Oyun ve Web Geliştirici' },
  mobile: { en: 'Mobile App & Game Developer', tr: 'Mobil Uygulama ve Oyun Geliştirici' },
  mobile_only: { en: 'Mobile App Developer', tr: 'Mobil Uygulama Geliştirici' },
  game: { en: 'Game Developer (Godot)', tr: 'Oyun Geliştirici (Godot)' },
  fullstack: { en: 'Full-Stack Developer', tr: 'Full-Stack Geliştirici' },
  frontend: { en: 'Frontend Developer (React)', tr: 'Frontend Geliştirici (React)' },
  web: { en: 'Web Developer', tr: 'Web Geliştirici' },
  ai: { en: 'Software Developer, AI & Automation', tr: 'Yazılım Geliştirici, Yapay Zekâ ve Otomasyon' },
  content: { en: 'Content Creator & Developer', tr: 'İçerik Üreticisi ve Geliştirici' },
};

// Sabit (değişken olmayan) Inter: Chrome değişken fontu PDF'e Type3 gömüyor, ATS'ler metni okuyamayabiliyor
const FONT_CDN = 'https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.18/files';
const RANGES = { latin: 'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+2074,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD',
  'latin-ext': 'U+0100-02AF,U+0304,U+0308,U+0329,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF' };
const FONT_FACES = [400, 600, 700].flatMap((w) => Object.entries(RANGES).map(([r, u]) => `@font-face{font-family:Inter;font-style:normal;font-weight:${w};font-display:block;src:url(${FONT_CDN}/inter-${r}-${w}-normal.woff2) format('woff2');unicode-range:${u}}`)).join('\n');
const NAVY = '#14325c', INK = '#1e1e1e', GREY = '#5a6270';
const esc = (x) => String(x ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const lab = (it) => (it.href ? `<a class="l" href="${esc(it.href)}">${esc(it.label)}</a>: ` : `<b>${esc(it.label)}:</b> `);

// Ölçüler orijinal PDF'ten (pt): kenar 57, yazı alanı 481.3; ad 24 kalın, unvan 12.5, iletişim 9.0, başlık 10.8 + 0.7 çizgi, metin 9.8 / 13.72 satır (17 Ekim sürümü)
export function renderCvHtml(cv) {
  const sec = (s) => {
    let body = '';
    if (s.type === 'text') body = `<p class="tx">${esc(s.text)}</p>`;
    else if (s.type === 'groups') body = s.groups.map((g) => `<div class="grp"><div class="gh">${esc(g.h)}</div><ul>${g.items.map((it) => `<li>${lab(it)}${esc(it.text)}</li>`).join('')}</ul></div>`).join('');
    else if (s.type === 'list') body = `<ul class="pl">${s.items.map((it) => `<li>${lab(it)}${esc(it.text)}</li>`).join('')}</ul>`;
    else if (s.type === 'rows') body = `<div class="rows">${s.rows.map((r) => `<div class="row"><b>${esc(r.label)}:</b> ${esc(r.text)}</div>`).join('')}</div>`;
    else if (s.type === 'edu') body = `<p class="tx"><b>${esc(s.label)}</b> · ${esc(s.text)}</p>`;
    return `<section class="s-${s.type}" data-id="${s.id}"><h2>${esc(s.h)}</h2>${body}</section>`;
  };
  return `<!doctype html><html><head><meta charset="utf-8">
<style>
${FONT_FACES}
@page{size:595.28pt 841.89pt;margin:0}
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:595.28pt}
body{font-family:Inter,sans-serif;color:${INK};padding:49.77pt 57pt 0 57pt;-webkit-print-color-adjust:exact;font-kerning:none;font-feature-settings:"kern" 0,"calt" 0,"liga" 0;text-rendering:optimizeSpeed}
a{color:${NAVY};text-decoration:none}
b{font-weight:600}
.name{font-weight:700;font-size:24pt;line-height:29pt;color:${NAVY};white-space:nowrap}
.title{font-weight:600;font-size:12.5pt;line-height:15pt;color:${GREY};margin-top:-.81pt;white-space:nowrap}
.contact{font-size:9pt;line-height:12pt;margin-top:4.34pt;white-space:nowrap}
section{margin-top:13.01pt}
section:first-of-type{margin-top:14.55pt}
h2{font-weight:700;font-size:10.8pt;line-height:12.4pt;color:${NAVY};padding-bottom:3.41pt;border-bottom:.7pt solid ${NAVY}}
.tx,.row,li{font-size:9.8pt;line-height:13.72pt}
.tx{margin-top:5.03pt}
.rows{margin-top:5.03pt}
h2+.grp{margin-top:5.83pt}
.grp+.grp{margin-top:6.86pt}
.s-groups{padding-bottom:6pt}
.gh{font-weight:600;font-size:10.4pt;line-height:13pt}
ul{list-style:none}
li{position:relative;padding-left:12pt;margin-top:2.5pt}
.pl{padding-top:2.48pt}
li::before{content:'•';position:absolute;left:1pt;top:0;font-family:Helvetica,Arial,sans-serif;font-size:10pt}
li a.l{font-weight:600}
li b{font-weight:600}
</style></head><body>
<div class="name">${esc(cv.name)}</div>
<div class="title">${esc(cv.title)}</div>
<div class="contact">${cv.contact.map((c) => (c.href ? `<a href="${esc(c.href)}">${esc(c.t)}</a>` : esc(c.t))).join(' · ')}</div>
${cv.sections.map(sec).join('\n')}
</body></html>`;
}

// ---------- İlana göre uyarlama: unvan (izinli listeden), özet (CV'deki gerçeklerle yeniden yazım), sıralama ----------
const clone = (x) => JSON.parse(JSON.stringify(x));
const reorder = (arr, ids) => {
  if (!Array.isArray(ids)) return arr;
  const by = new Map(arr.map((x) => [x.id, x]));
  const out = [...new Set(ids)].filter((id) => by.has(id)).map((id) => by.get(id));
  return [...out, ...arr.filter((x) => !out.includes(x))];
};
const MIDDLE = ['experience', 'projects', 'skills', 'social'];

// spec → CV nesnesi. Özet ve unvan dışında metin değişmez, sadece sıra değişir. Özet ilk, eğitim son kalır.
export function applySpec(lang, spec = {}) {
  const cv = clone(CV_DATA[lang]);
  const t = CV_TITLES[spec.title];
  if (t) cv.title = t[lang];
  const sec = (id) => cv.sections.find((s) => s.id === id);
  if (spec.summary?.[lang]) sec('summary').text = spec.summary[lang];
  const ex = sec('experience');
  ex.groups[0].items = reorder(ex.groups[0].items, spec.order?.indie);
  sec('projects').items = reorder(sec('projects').items, spec.order?.projects);
  sec('skills').rows = reorder(sec('skills').rows, spec.order?.skills);
  const mid = reorder(MIDDLE.map((id) => ({ id })), spec.order?.sections).map((x) => x.id);
  cv.sections = [sec('summary'), ...mid.map(sec), sec('education')];
  return cv;
}

const TITLE_HELP = {
  default: 'general, or the job mixes mobile, games and web',
  mobile: 'mobile app roles where games also count (consumer apps, app stores)',
  mobile_only: 'pure mobile app developer roles (iOS/Android, React/Capacitor, hybrid apps)',
  game: 'game developer roles (Godot, casual/mobile games, game design)',
  fullstack: 'full-stack web roles (frontend + backend, Node.js, APIs, databases)',
  frontend: 'frontend / React / UI engineer roles',
  web: 'web developer roles (websites, e-commerce, catalog sites)',
  ai: 'AI engineering, LLM, automation, AI training/evaluation/rater/tutor roles',
  content: 'content creator, social media, video, community or growth roles',
};

function cvText(lang) {
  const item = (i) => `[${i.id}] ${i.label}: ${i.text}`;
  return CV_DATA[lang].sections.map((s) => `${s.h} [${s.id}]\n` + (s.type === 'text' ? s.text
    : s.type === 'groups' ? s.groups.map((g) => `${g.h}\n${g.items.map(item).join('\n')}`).join('\n')
      : s.type === 'list' ? s.items.map(item).join('\n')
        : s.type === 'rows' ? s.rows.map(item).join('\n') : `${s.label} · ${s.text}`)).join('\n');
}

// Özet doğrulaması: uzunluk (tek sayfa ve aynı görünüm), tire, şirket adı, uydurma kalıpları, CV dışı teknoloji, denetçi
export async function checkSummary(env, settings, text, base, job, profile) {
  const t = String(text || '').replace(/\s+/g, ' ').trim();
  if (!t) return 'boş';
  if (t.length < base.length * 0.7 || t.length > base.length * 1.1) return `uzunluk ${t.length} (temel ${base.length})`;
  if (/[—–]/.test(t)) return 'uzun tire';
  if (/[*#]/.test(t)) return 'biçim işareti';
  if (job.company && job.company.length > 2 && t.toLowerCase().includes(job.company.toLowerCase())) return 'şirket adı geçiyor';
  const flags = letterRedFlags(t);
  if (flags.length) return flags.map((f) => f.label).join(', ');
  const fake = unsupportedTech(t, profile);
  if (fake.length) return 'CV dışı teknoloji: ' + fake.join(', ');
  if (env) { const c = await truthCheck(env, settings, t); if (!c.ok) return 'denetçi: ' + c.issues.join('; '); }
  return null;
}

export async function tailorSpec(env, settings, job) {
  const a = safeJSON(job.analysis, {}) || {};
  const turkish = job.lang === 'tr' || a.language === 'tr';
  const base = { en: CV_DATA.en.sections[0].text, tr: CV_DATA.tr.sections[0].text };
  const ids = (s) => CV_DATA.en.sections.find((x) => x.id === s);
  const sys = `You tailor a one-page CV to a specific job WITHOUT changing any facts. The design is fixed: you only pick the title, rewrite the short summary, and reorder items so the most relevant achievements come first.
${HONESTY_RULES}
${STYLE_RULES}
Return ONLY JSON:
{"title":"<one key>","summary_en":"...",${turkish ? '"summary_tr":"...",' : ''}"indie":[item ids],"projects":[item ids],"skills":[row ids],"sections":[section ids],"why":"one short sentence in Turkish: what you emphasized and why"}
TITLE keys (pick the one that truthfully matches the job; "default" if unsure):
${Object.entries(CV_TITLES).map(([k, v]) => `- ${k}: "${v.en}" (${TITLE_HELP[k]})`).join('\n')}
SUMMARY: rewrite the base summary in first person, 3-4 sentences, ${Math.round(base.en.length * 0.8)}-${Math.round(base.en.length * 1.05)} characters, so the facts most relevant to this job come first. Use ONLY facts written in the CV below: no new numbers, tools, employers or claims, and do not copy the job's requirements. Do not mention the company name. Keep the social media sentence only if the job is about content, social media, marketing, community or growth; otherwise replace it with another CV fact.${turkish ? ' summary_tr is the same summary in natural Turkish, similar length to the Turkish base summary.' : ''}
ORDER ids: indie ${JSON.stringify(ids('experience').groups[0].items.map((i) => i.id))}, projects ${JSON.stringify(ids('projects').items.map((i) => i.id))}, skills ${JSON.stringify(ids('skills').rows.map((r) => r.id))}, sections ${JSON.stringify(MIDDLE)} (summary stays first and education last; move "social" up only for content/social media roles).`;
  const user = `CV:\n${cvText('en')}\n\nBASE SUMMARY (EN, ${base.en.length} chars): ${base.en}${turkish ? `\nBASE SUMMARY (TR, ${base.tr.length} chars): ${base.tr}` : ''}\n\nJOB: ${job.title} at ${job.company}\nMust-haves: ${(a.must_haves || []).join('; ')}\n\n${clip(job.description, 4000)}`;
  const o = await llm(env, settings, { task: 'answers', json: true, maxTokens: 1200, temperature: 0.3, messages: [{ role: 'system', content: sys }, { role: 'user', content: user }] });
  const j = o.json || {};
  const spec = { v: CV_VERSION, title: CV_TITLES[j.title] ? j.title : 'default', order: { indie: j.indie, projects: j.projects, skills: j.skills, sections: j.sections }, summary: {}, why: clip(j.why || '', 300), notes: [] };
  const profile = await profileContext(env, { maxFacts: 40 });
  for (const lang of turkish ? ['en', 'tr'] : ['en']) {
    const s = String(j[`summary_${lang}`] || '').replace(/\s+/g, ' ').trim();
    if (!s) continue;
    const bad = await checkSummary(env, settings, s, base[lang], job, profile);
    if (bad) spec.notes.push(`${lang} özeti kullanılmadı (${bad})`); else spec.summary[lang] = s;
  }
  return spec;
}

// ---------- Basım ve tasarım denetimi ----------
// Sayfada çalışır: fontlar yüklendi mi, her şey tek sayfaya ve yazı alanına sığıyor mu, satırlar üst üste biniyor mu, tek satırlık alanlar taşıyor mu
const LAYOUT_CHECK = `(() => {
  const PT = 96 / 72, issues = [];
  const weights = new Set([...document.fonts].filter((f) => f.family.replace(/"/g, '') === 'Inter' && f.status === 'loaded').map((f) => String(f.weight)));
  for (const w of ['400', '600', '700']) if (!weights.has(w)) issues.push('Inter ' + w + ' yüklenmedi');
  const r = (el) => el.getBoundingClientRect();
  const all = [...document.body.querySelectorAll('*')];
  const bottom = Math.max(...all.map((el) => r(el).bottom)) / PT;
  if (bottom > 800) issues.push('sayfa taşıyor: alt kenar ' + bottom.toFixed(1) + 'pt');
  for (const el of all) { const x = r(el); if (x.width && (x.right / PT > 538.8 || x.left / PT < 56.5)) { issues.push('yazı alanı dışına taşan öğe: ' + (el.textContent || el.tagName).slice(0, 30)); break; } }
  for (const sel of ['.name', '.title', '.contact']) { const el = document.querySelector(sel); const lh = parseFloat(getComputedStyle(el).lineHeight); if (r(el).height > lh * 1.5 || el.scrollWidth > el.clientWidth + 1) issues.push(sel + ' tek satıra sığmıyor'); }
  const blocks = [...document.querySelectorAll('.name,.title,.contact,h2,.tx,.row,li,.gh')];
  for (let i = 1; i < blocks.length; i++) if (r(blocks[i]).top < r(blocks[i - 1]).bottom - 1.5 * PT) { issues.push('üst üste binen satırlar: ' + (blocks[i].textContent || '').slice(0, 30)); break; }
  const sum = document.querySelector('section[data-id=summary] .tx');
  const lines = Math.round(r(sum).height / (13.85 * PT));
  if (lines > 5) issues.push('özet ' + lines + ' satır');
  return { issues, bottom, summaryLines: lines };
})()`;

export async function renderCheckedPdf(browser, cv) {
  const page = await browser.newPage();
  try {
    await page.setContent(renderCvHtml(cv), { waitUntil: 'networkidle0', timeout: 30000 });
    await page.evaluate('document.fonts.ready.then(() => true)');
    const check = await page.evaluate(LAYOUT_CHECK);
    const text = await page.evaluate('document.body.innerText');
    const want = cv.sections.flatMap((s) => [s.h, ...(s.groups || []).flatMap((g) => g.items.map((i) => i.label)), ...(s.items || []).map((i) => i.label), ...(s.rows || []).map((x) => x.label)]);
    const miss = want.find((m) => !text.includes(m));
    if (miss) check.issues.push('eksik: ' + miss);
    if (check.issues.length) return { ok: false, issues: check.issues };
    const pdf = new Uint8Array(await page.pdf({ printBackground: true, preferCSSPageSize: true }));
    const raw = new TextDecoder('latin1').decode(pdf);
    const pages = (raw.match(/\/Type\s*\/Page[^s]/g) || []).length;
    if (pages !== 1) return { ok: false, issues: [`PDF ${pages} sayfa`] };
    if (/\/Subtype\s*\/Type3/.test(raw)) return { ok: false, issues: ['font Type3 gömüldü (ATS metni okuyamayabilir)'] };
    return { ok: true, pdf, summaryLines: check.summaryLines, bottom: check.bottom };
  } finally { await page.close().catch(() => {}); }
}

// ---------- Başvuruda kullanım ----------
const specKey = (appId) => `cv/${appId}.json`;
const pdfKey = (appId, lang) => `cv/${appId}_${CV_VERSION}_${lang}.pdf`;

// prepare() çağırır: ilana göre spec üretip R2'ye yazar (tarayıcı gerekmez; basım CV kullanılacağı an yapılır)
export async function prepareCv(env, settings, appId, job) {
  if (settings.tailor_cv === false) return null;
  try {
    const spec = await tailorSpec(env, settings, job);
    await env.R2.put(specKey(appId), JSON.stringify(spec), { httpMetadata: { contentType: 'application/json' } });
    await log(env, 'cv', `CV uyarlandı (${job.company}): unvan "${CV_TITLES[spec.title].en}"${Object.keys(spec.summary).length ? ', özet ilana göre yazıldı' : ''}${spec.notes.length ? '; ' + spec.notes.join('; ') : ''}`, { ref: appId, level: spec.notes.length ? 'warn' : 'info', data: { title: spec.title, order: spec.order, summary: spec.summary, why: spec.why } });
    return spec;
  } catch (e) {
    await log(env, 'cv', `CV uyarlanamadı (${job.company}), orijinal CV kullanılacak: ${clip(e.message, 200)}`, { ref: appId, level: 'warn' });
    return null;
  }
}

// Başvuruda yüklenecek/eklenecek CV: uyarlanmış PDF (tasarım denetiminden geçtiyse) ya da orijinal CV
export async function cvForApp(env, appId, lang = 'en', { browser = null } = {}) {
  const base = async (why) => ({ bytes: await cvPdf(env, lang), tailored: false, why });
  if (!appId) return base('başvuru yok');
  const cached = await env.R2.get(pdfKey(appId, lang));
  if (cached) return { bytes: new Uint8Array(await cached.arrayBuffer()), tailored: true };
  const so = await env.R2.get(specKey(appId));
  const spec = so ? safeJSON(await so.text(), null) : null;
  if (!spec || spec.v !== CV_VERSION || spec.failed?.[lang]) return base(!spec ? 'uyarlama yok' : spec.v !== CV_VERSION ? 'CV sürümü değişti' : 'tasarım denetimi daha önce geçmedi');
  let own = null;
  const t0 = Date.now();
  try {
    if (!browser) { const puppeteer = (await import('@cloudflare/puppeteer')).default; own = await puppeteer.launch(env.BROWSER, { keep_alive: 60000 }); }
    const res = await renderCheckedPdf(browser || own, applySpec(lang, spec));
    if (!res.ok) {
      spec.failed = { ...(spec.failed || {}), [lang]: res.issues };
      await env.R2.put(specKey(appId), JSON.stringify(spec), { httpMetadata: { contentType: 'application/json' } });
      await log(env, 'cv', `Uyarlanmış CV tasarım denetiminden geçmedi (${lang}), orijinal CV kullanıldı: ${clip(res.issues.join('; '), 300)}`, { ref: appId, level: 'warn' });
      return base('tasarım denetimi');
    }
    await env.R2.put(pdfKey(appId, lang), res.pdf, { httpMetadata: { contentType: 'application/pdf' } });
    return { bytes: res.pdf, tailored: true };
  } catch (e) {
    await log(env, 'cv', `Uyarlanmış CV basılamadı (${lang}), orijinal CV kullanıldı: ${clip(e.message, 200)}`, { ref: appId, level: 'warn' });
    return base('basım hatası');
  } finally {
    if (own) {
      await Promise.race([own.close(), new Promise((r) => setTimeout(r, 5000))]).catch(() => {});
      await bumpUsage(env, 'browser_ms', Date.now() - t0).catch(() => {});
    }
  }
}
