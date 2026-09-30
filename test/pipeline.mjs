// Uçtan uca yerel deneme: şema → kaynak tarama → eleme (Jev + LLM + analiz)
import { makeEnv } from './env.mjs';
import { migrate, getSettings, allRows } from '../src/lib/db.js';
import { runSource, seedBoards, pollBoards } from '../src/discover.js';
import { triageTick } from '../src/triage.js';
import { SOURCES } from '../src/sources/index.js';

const env = makeEnv({ dbFile: '/tmp/claude-0/r/test.db' });
await migrate(env);
const settings = await getSettings(env);
const only = (process.argv[2] || 'getonbrd,djinni,remotar,alignerr').split(',');
for (const id of only) { const s = SOURCES.find((x) => x.id === id); console.log(id, await runSource(env, s)); }
await seedBoards(env);
console.log('boards', (await pollBoards(env, 4)).map((b) => `${b.id}:${b.added ?? b.error}`).join(' '));
for (let i = 0; i < Number(process.argv[3] || 2); i++) {
  const t = Date.now();
  const st = await triageTick(env, settings, { n0: 500, n1: 40, n2: 16, n3: 6 });
  console.log('triage', i, JSON.stringify(st), `${((Date.now() - t) / 1000).toFixed(1)}s`);
}
console.log(await allRows(env, 'SELECT status, stage, COUNT(*) n FROM jobs GROUP BY status, stage'));
console.log('reject reasons', await allRows(env, "SELECT substr(reason,1,50) r, COUNT(*) n FROM jobs WHERE status='rejected' GROUP BY r ORDER BY n DESC LIMIT 15"));
for (const j of await allRows(env, "SELECT title, company, source, status, fit, priority, reason, lang FROM jobs WHERE stage>=4 ORDER BY priority DESC LIMIT 25")) console.log(`[${j.status}] ${j.fit} ${j.priority} ${j.source}/${j.lang} ${j.company} — ${j.title} :: ${j.reason}`);
console.log('ai usage', await allRows(env, 'SELECT model, task, calls, ROUND(cost,5) cost, errors FROM ai_usage'));
