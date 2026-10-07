import { SOURCES } from '../src/sources/index.js';
for (const id of ['workable_tr', 'workable', 'torre']) {
  const s = SOURCES.find((x) => x.id === id);
  const t = Date.now();
  try { const r = await s.fetch(); console.log(id, r.length, Date.now() - t, 'ms'); for (const j of r.slice(0, 6)) console.log('  ', j.company, '|', j.title, '|', j.location, '|', j.lang, '|', j.description.length); }
  catch (e) { console.log(id, 'ERR', e.message); }
}
