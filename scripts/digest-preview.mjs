import { makeEnv } from '../test/env.mjs';
import { migrate, getSettings } from '../src/lib/db.js';
import { dailyDigest } from '../src/mail.js';
const env = makeEnv(); await migrate(env);
let sent = null; env.EMAIL = { send: async (m) => { sent = m; return { messageId: 'x' }; } };
await dailyDigest(env, await getSettings(env));
console.log(sent.subject); console.log(sent.text);
