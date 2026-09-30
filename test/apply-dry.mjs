// Tarayıcı ajanını gerçek bir başvuru formunda DENEME modunda çalıştırır (son gönderim engellenir).
import fs from 'node:fs';
import { makeEnv } from './env.mjs';
import { migrate, allRows } from '../src/lib/db.js';
import { createApplication, prepare, submit } from '../src/apply/index.js';

const [url, title = 'Software Engineer', company = 'Test Co'] = process.argv.slice(2);
const env = makeEnv();
env.DRY_RUN = true;
await migrate(env);
await env.DB.prepare("INSERT INTO jobs (id, source, url, apply_url, ats, company, title, location, description, discovered_at, last_seen_at, dedupe, status, stage, fit, analysis, lang) VALUES ('j_test','test',?,?,NULL,?,?, 'Remote', 'Remote role building web apps with React and TypeScript.', 1, 1, 'd', 'approved', 4, 80, ?, 'en')")
  .bind(url, url, company, title, JSON.stringify({ pitch: 'Ships full-stack TypeScript products on Cloudflare Workers', apply_method: 'ats_form' })).run();
const appId = await createApplication(env, 'j_test');
const t = Date.now();
console.log('prepare', await prepare(env, appId));
const a0 = await env.DB.prepare('SELECT letter FROM applications WHERE id=?').bind(appId).first();
console.log('--- LETTER ---\n' + a0.letter + '\n---');
const res = await submit(env, appId);
console.log('RESULT', res, `${((Date.now() - t) / 1000).toFixed(0)}s`);
const app = await env.DB.prepare('SELECT status, error, answers, steps FROM applications WHERE id=?').bind(appId).first();
console.log(app.status, app.steps, app.error);
console.log('ANSWERS', app.answers);
const out = '/tmp/claude-0/r/frames';
fs.rmSync(out, { recursive: true, force: true }); fs.mkdirSync(out, { recursive: true });
for (const [k, v] of env.R2._m) if (k.endsWith('.jpg')) fs.writeFileSync(`${out}/${k.replace(/\//g, '_')}`, v.buf);
const tl = [...env.R2._m.entries()].find(([k]) => k.endsWith('timeline.json'));
if (tl) for (const x of JSON.parse(tl[1].buf.toString())) console.log(x.seq ? `#${x.seq}` : '  ', x.label);
console.log('usage', await allRows(env, 'SELECT model, task, calls, ROUND(cost,4) cost, errors FROM ai_usage'));
process.exit(0);
