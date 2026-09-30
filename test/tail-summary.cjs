// wrangler tail --format json çıktısını özetler (olaylar çok satırlı JSON olarak gelir)
const fs = require('fs');
const raw = fs.readFileSync(process.argv[2] || 'tail.jsonl', 'utf8');
const objs = [];
let depth = 0, buf = '', inStr = false, esc = false;
for (const ch of raw) {
  if (depth > 0 || ch === '{') buf += ch;
  if (inStr) { if (esc) esc = false; else if (ch === '\\') esc = true; else if (ch === '"') inStr = false; continue; }
  if (ch === '"') { if (depth > 0) inStr = true; }
  else if (ch === '{') depth++;
  else if (ch === '}') { depth--; if (depth === 0) { objs.push(buf); buf = ''; } }
}
console.log('olay:', objs.length);
for (const o of objs) {
  let e; try { e = JSON.parse(o); } catch { continue; }
  const ev = e.event || {};
  const kind = ev.request ? `${ev.request.method} ${String(ev.request.url).replace(/^https:\/\/[^/]+/, '')}` : ev.cron ? `cron ${ev.cron}` : (ev.workflowName || ev.type || Object.keys(ev).join(','));
  const bad = e.outcome !== 'ok' || (e.exceptions || []).length || (e.logs || []).some((x) => x.level !== 'log');
  if (!bad && ev.request && /\/api\/(overview|applications|recordings|file|jobs|events|chat|health)/.test(kind)) continue;
  const ts = e.eventTimestamp ? new Date(e.eventTimestamp).toISOString().slice(11, 19) : '';
  console.log(`[${e.outcome}] ${kind} cpu=${e.cpuTime ?? ''}ms wall=${e.wallTime ?? ''}ms ${ts}`);
  for (const x of e.exceptions || []) console.log('   EXC', x.name, String(x.message).slice(0, 500));
  for (const x of e.logs || []) if (x.level !== 'log' || bad) console.log('   ', x.level, JSON.stringify(x.message).slice(0, 500));
}
