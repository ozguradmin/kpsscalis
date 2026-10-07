import { makeEnv } from '../test/env.mjs';
import { migrate, getSettings } from '../src/lib/db.js';
import { buildOwnPack } from '../src/apply/ownpack.js';
const env = makeEnv(); await migrate(env);
await env.DB.prepare("INSERT OR REPLACE INTO facts (key, value, source, confidence, updated_at) VALUES ('expected_hourly_rate_usd','30','t',1,1)").run().catch((e) => console.log('facts', e.message));
const job = { apply_url: 'https://jobs.workable.com/view/fLy62TknZwjgsCAsgR5q8A/remote-frontend-software-engineer-in-pretoria-at-hyperdev', title: 'Frontend Software Engineer', company: 'HyperDev' };
const p = await buildOwnPack(env, await getSettings(env), {}, job);
console.log('fromForm', p.fromForm); for (const i of p.items) console.log('##', i.label, '\n  ', i.value.replace(/\n/g, ' / ').slice(0, 220));
