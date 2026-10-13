// Yerel Chrome ile CV HTML'ini PDF'e basar (tasarım karşılaştırması için): node --import ./test/register.mjs scripts/cv-render-local.mjs <çıktı klasörü>
import puppeteer from 'puppeteer-core';
import { writeFileSync } from 'node:fs';
import { CV_DATA } from '../src/cv-data.js';
import { renderCvHtml } from '../src/apply/cv.js';
const out = process.argv[2] || '.';
const browser = await puppeteer.launch({ executablePath: process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
for (const lang of ['en', 'tr']) {
  const p = await browser.newPage();
  await p.setContent(renderCvHtml(CV_DATA[lang]), { waitUntil: 'networkidle0' });
  await p.evaluate(() => document.fonts.ready);
  writeFileSync(`${out}/base_${lang}.pdf`, await p.pdf({ printBackground: true, preferCSSPageSize: true }));
  await p.close();
}
await browser.close();
console.log('ok');
