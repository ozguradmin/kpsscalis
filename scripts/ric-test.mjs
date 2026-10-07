import { makeEnv } from '../test/env.mjs';
import { migrate } from '../src/lib/db.js';
import { SOURCES } from '../src/sources/index.js';
const env = makeEnv(); await migrate(env);
const src = SOURCES.find((x) => x.id === 'remote_cos');
const list = []; 
for (let k = 0; k < 3; k++) { const t = Date.now(); const r = await src.fetch(env); list.push(...r); console.log('run', k, r.length, 'jobs', (Date.now() - t) / 1000, 's'); }
console.log('cached companies', (await (await env.R2.get('cache/remoteintech.json')).json()).length);
for (const j of list) console.log(' OPEN:', j.company, j.apply_url, '|', j.description.slice(0, 160).replace(/\n/g, ' '));
console.log('boards', (await env.DB.prepare("SELECT id, company FROM boards WHERE added_from='remoteintech'").all()).results);
