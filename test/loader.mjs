// Node'da Worker kodunu çalıştırmak için: .sql metin olarak, cloudflare:workers ve @cloudflare/puppeteer taklitleri
import fs from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
const here = new URL('.', import.meta.url);
export async function resolve(spec, ctx, next) {
  if (spec === 'cloudflare:workers') return { url: new URL('stub-workers.mjs', here).href, shortCircuit: true };
  if (spec === '@cloudflare/puppeteer') return { url: new URL('stub-puppeteer.mjs', here).href, shortCircuit: true };
  return next(spec, ctx);
}
export async function load(url, ctx, next) {
  if (url.endsWith('.sql')) return { format: 'module', source: `export default ${JSON.stringify(fs.readFileSync(fileURLToPath(url), 'utf8'))};`, shortCircuit: true };
  return next(url, ctx);
}
