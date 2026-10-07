import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const ROOT = new URL('../public', import.meta.url).pathname, B = 'https://ozgur-is-ajani.ozgurglr256.workers.dev';
const cookie = fs.readFileSync(process.env.CJ, 'utf8').split('\n').filter((l) => l.includes('ajan_oturum')).map((l) => { const p = l.split('\t'); return `${p[5]}=${p[6]}`; }).join('; ');
http.createServer(async (req, res) => {
  if (req.url.startsWith('/api/')) {
    if (req.method !== 'GET') { res.writeHead(200, { 'content-type': 'application/json' }); return res.end('{"ok":true,"note":"(yerel test)"}'); }
    const r = await fetch(B + req.url, { headers: { cookie } }); const b = Buffer.from(await r.arrayBuffer());
    res.writeHead(r.status, { 'content-type': r.headers.get('content-type') || 'application/json' }); return res.end(b);
  }
  let f = path.join(ROOT, req.url.split('?')[0]); if (f.endsWith('/')) f += 'index.html';
  if (!fs.existsSync(f)) f = path.join(ROOT, 'index.html');
  const ext = path.extname(f); res.writeHead(200, { 'content-type': { '.js': 'text/javascript', '.css': 'text/css', '.html': 'text/html' }[ext] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
}).listen(8788, () => console.log('ok 8788'));
