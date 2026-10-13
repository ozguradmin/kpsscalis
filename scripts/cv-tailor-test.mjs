// Başvuruya özel CV testi (yerel Chrome): node --import ./test/register.mjs scripts/cv-tailor-test.mjs [çıktı klasörü]
// Uyarlanmış CV'ler tasarım denetiminden geçmeli; taşan/bozuk olanlar yakalanmalı.
import puppeteer from 'puppeteer-core';
import { writeFileSync } from 'node:fs';
import { applySpec, renderCheckedPdf, checkSummary, CV_TITLES } from '../src/apply/cv.js';
import { CV_DATA } from '../src/cv-data.js';

const out = process.argv[2];
let fail = 0;
const ok = (c, m) => { console.log(`${c ? 'OK  ' : 'FAIL'} ${m}`); if (!c) fail++; };
const browser = await puppeteer.launch({ executablePath: process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });

const SUM_MOBILE = 'I build and ship mobile apps and games on my own, from idea to store release. I have 4 apps live on the app stores, including WTF Yapay Zekâ with 50,000+ downloads and Dönerci, a 3D Godot game in 5 languages. I handle design, code, in-app purchases, subscriptions and store releases myself, and I also work on web projects with React and Next.js.';
const SUM_FULL = 'I build web products end to end with React, Next.js, TypeScript and Node.js. I made ONOPO Store, an e-commerce site with iyzico payments and an admin panel, and Galaktik Uzay, an AI news site that publishes in 6 languages on Cloudflare Workers. I also have 4 apps live on the app stores and take projects from idea to launch on my own.';
const SUM_TR = 'Web ürünlerini uçtan uca geliştiriyorum: React, Next.js, TypeScript ve Node.js. iyzico ödemeli ve yönetim panelli ONOPO Store e-ticaret sitesini ve 6 dilde otomatik yayın yapan Galaktik Uzay haber sitesini yaptım. Mağazalarda yayında 4 uygulamam var; projelerimi fikirden yayına kadar tek başıma götürüyorum.';
const cases = [
  ['base', 'en', {}, true],
  ['mobile', 'en', { title: 'mobile_only', summary: { en: SUM_MOBILE }, order: { indie: ['wtf', 'cografist', 'printfast', 'donerci'], skills: ['mobile', 'web', 'ai'] } }, true],
  ['fullstack', 'en', { title: 'fullstack', summary: { en: SUM_FULL }, order: { indie: ['galaktik', 'cografist'], skills: ['web', 'ai', 'mobile'], sections: ['experience', 'skills', 'projects', 'social'] } }, true],
  ['fullstack_tr', 'tr', { title: 'fullstack', summary: { tr: SUM_TR }, order: { indie: ['galaktik', 'cografist'], skills: ['web', 'ai', 'mobile'] } }, true],
  ['ai_tr', 'tr', { title: 'ai', order: { projects: ['llmeval', 'speech', 'whisper', 'automation'], skills: ['ai'], sections: ['projects', 'experience', 'skills', 'social'] } }, true],
  ['content', 'en', { title: 'content', order: { sections: ['social', 'experience', 'projects', 'skills'], projects: ['automation'] } }, true],
  ['game', 'en', { title: 'game', order: { indie: ['donerci'] } }, true],
  // Bozuk olması gerekenler: çok uzun özet sayfayı taşırır, çok uzun unvan tek satıra sığmaz
  ['overflow', 'en', { summary: { en: SUM_FULL.repeat(4) } }, false],
];
for (const [name, lang, spec, expect] of cases) {
  const cv = applySpec(lang, spec);
  const res = await renderCheckedPdf(browser, cv);
  ok(res.ok === expect, `${name}: ${res.ok ? `geçti (özet ${res.summaryLines} satır, alt kenar ${res.bottom.toFixed(0)}pt)` : 'reddedildi: ' + res.issues.join('; ')}`);
  if (res.ok && out) writeFileSync(`${out}/${name}.pdf`, res.pdf);
}
const longTitle = applySpec('en', {}); longTitle.title = 'Senior Principal Mobile, Game, Web, Backend, Cloud and AI Developer & Architect';
const lt = await renderCheckedPdf(browser, longTitle);
ok(!lt.ok && lt.issues.some((i) => /title/.test(i)), 'çok uzun unvan yakalandı: ' + (lt.issues || []).join('; '));
for (const [k, v] of Object.entries(CV_TITLES)) for (const lang of ['en', 'tr']) {
  const r = await renderCheckedPdf(browser, applySpec(lang, { title: k }));
  if (!r.ok) ok(false, `unvan ${k}/${lang} sığmadı: ${r.issues.join('; ')}`);
}
ok(true, 'izinli unvanların hepsi iki dilde sığıyor (yukarıda FAIL yoksa)');
await browser.close();

// Özet denetimi (modelsiz kısımlar)
const base = CV_DATA.en.sections[0].text, job = { company: 'Acme' };
ok(await checkSummary(null, {}, SUM_FULL, base, job, '') === null, 'temiz özet geçer');
ok(/uzunluk/.test(await checkSummary(null, {}, SUM_FULL.repeat(2), base, job, '')), 'uzun özet reddedilir');
ok(/tire/.test(await checkSummary(null, {}, SUM_FULL.replace('. I made', ' — I made'), base, job, '')), 'uzun tire reddedilir');
ok(/şirket/.test(await checkSummary(null, {}, SUM_FULL.replace('I build web', 'At Acme I build web'), base, job, '')), 'şirket adı reddedilir');
ok(/teknoloji/.test(await checkSummary(null, {}, SUM_FULL.replace('Node.js.', 'Node.js and Flutter.'), base, job, CV_DATA.en.sections.map((s) => s.text || '').join(' '))), 'CV dışı teknoloji reddedilir');
console.log(fail ? `${fail} test başarısız` : 'hepsi geçti');
process.exit(fail ? 1 : 0);
