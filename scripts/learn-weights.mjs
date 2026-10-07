import { makeEnv } from '../test/env.mjs';
import { migrate } from '../src/lib/db.js';
import { learnSourceWeights } from '../src/brain.js';
const env = makeEnv(); await migrate(env);
console.log(await learnSourceWeights(env));
