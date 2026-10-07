import { createRequire } from 'node:module';
const require = createRequire('/opt/node22/lib/node_modules/');
const { chromium, devices } = require('playwright');
const [, , scheme = 'dark', ...routes] = process.argv;
const b = await chromium.launch();
const ctx = await b.newContext({ ...devices['iPhone 13'], colorScheme: scheme });
const p = await ctx.newPage();
const errs = []; p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
for (const r of routes) {
  await p.goto('http://localhost:8788/' + r, { waitUntil: 'networkidle' }); await p.waitForTimeout(800);
  const sw = await p.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth]);
  const name = (r.replace(/[#/?=&]/g, '_') || 'home') + '_' + scheme;
  await p.screenshot({ path: `${process.env.SP}/s_${name}.png`, fullPage: process.env.FULL === '1' });
  console.log(r, 'scrollWidth', sw);
}
console.log('errors', errs);
await b.close();
