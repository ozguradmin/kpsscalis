import { makeEnv } from '../test/env.mjs';
import { migrate, getSettings } from '../src/lib/db.js';
import { dispatch } from '../src/apply/index.js';
import { mailTick } from '../src/mail.js';
const env = makeEnv(); await migrate(env);
const s = await getSettings(env);
console.log('dispatch', await dispatch(env, { ...s, auto_apply: true, paused: false }, { max: 1 }));
console.log('mail', await mailTick(env, s).catch((e) => 'ERR ' + e.message));
