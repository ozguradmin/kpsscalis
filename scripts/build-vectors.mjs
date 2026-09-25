// Bilgi tabanı parçalarının anlam vektörlerini (bge-m3) üretir → public/kb/vectors.bin + vectors.json
// Kullanım: CF_API_TOKEN=... CF_ACCOUNT_ID=... node scripts/build-vectors.mjs   (ya da .dev.vars dosyası)
import fs from 'fs';
import { CHUNKS } from '../src/kb.js';

const vars = fs.existsSync('.dev.vars') ? Object.fromEntries(fs.readFileSync('.dev.vars', 'utf8').split('\n').filter((l) => l.includes('=')).map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^"|"$/g, '')]; })) : {};
const TOKEN = process.env.CF_API_TOKEN || vars.CF_API_TOKEN;
const ACC = process.env.CF_ACCOUNT_ID || vars.CF_ACCOUNT_ID;
if (!TOKEN || !ACC) { console.error('CF_API_TOKEN / CF_ACCOUNT_ID yok'); process.exit(1); }

async function embed(texts) {
  for (let t = 0; t < 4; t++) {
    const r = await fetch(`https://api.cloudflare.com/client/v4/accounts/${ACC}/ai/run/@cf/baai/bge-m3`, { method: 'POST', headers: { Authorization: `Bearer ${TOKEN}`, 'content-type': 'application/json' }, body: JSON.stringify({ text: texts }) });
    if (r.ok) return (await r.json()).result.data;
    console.error('tekrar', r.status, (await r.text()).slice(0, 200));
    await new Promise((s) => setTimeout(s, 2000 * (t + 1)));
  }
  throw new Error('embed başarısız');
}

const docs = CHUNKS.map((c) => `${c.where}\n${c.title}\n${c.text}`.slice(0, 2000));
const vecs = [];
for (let i = 0; i < docs.length; i += 32) {
  vecs.push(...(await embed(docs.slice(i, i + 32))));
  process.stdout.write(`\r${vecs.length}/${docs.length}`);
}
const dim = vecs[0].length, n = vecs.length;
const buf = Buffer.alloc(n * 4 + n * dim);
vecs.forEach((v, i) => {
  const norm = Math.sqrt(v.reduce((a, x) => a + x * x, 0)) || 1;
  const u = v.map((x) => x / norm);
  const mx = Math.max(...u.map(Math.abs)) || 1;
  buf.writeFloatLE(mx / 127, i * 4);
  u.forEach((x, d) => buf.writeInt8(Math.round((x / mx) * 127), n * 4 + i * dim + d));
});
fs.writeFileSync('public/kb/vectors.bin', buf);
fs.writeFileSync('public/kb/vectors.json', JSON.stringify({ model: '@cf/baai/bge-m3', dim, ids: CHUNKS.map((c) => c.id) }));
console.log(`\n${n} vektör, ${dim} boyut, ${(buf.length / 1024).toFixed(0)} KB`);
