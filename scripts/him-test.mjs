import { makeEnv } from '../test/env.mjs';
import { migrate } from '../src/lib/db.js';
import { SOURCES } from '../src/sources/index.js';
const env = makeEnv(); await migrate(env);
const t = Date.now(); const r = await SOURCES.find((x) => x.id === 'himalayas').fetch(env);
console.log('jobs', r.length, (Date.now() - t) / 1000, 's');
for (const j of r.slice(0, 8)) console.log(' ', j.company, '|', j.title, '|', j.location.slice(0, 60));
console.log('boards', (await env.DB.prepare('SELECT id, company FROM boards').all()).results);
