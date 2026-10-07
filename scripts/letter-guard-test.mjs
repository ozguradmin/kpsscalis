// Ön yazı uydurma denetimi: model profilde olmayan ücret/saat/örtüşme/olay hikâyesi yazarsa yeniden yazılır, inat ederse o cümleler çıkarılır.
// LLM taklit edilir (CF_TOKEN gerekmez). Çalıştır: node --import ./test/register.mjs scripts/letter-guard-test.mjs
import { makeEnv } from '../test/env.mjs';
import { migrate, getSettings } from '../src/lib/db.js';
import { coverLetter } from '../src/apply/materials.js';

const BAD = `You build a web app for fractional operators, and I build products where small edge cases decide whether a user comes back. I shipped four mobile apps, including Coğrafist with 30+ learning modes and Print Fast with Bluetooth printer support.\n\nOne bug that was easy to miss: in Coğrafist, after finishing a quiz, the progress bar showed the previous score. Steps: finish a quiz. Expected: new score. Actual: old score.\n\nI am in Mardin, Türkiye (UTC+3). Bangkok is UTC+7, so I have four hours of weekday overlap in the afternoon. I can start immediately and give about 15 hours a week. My expected pay is $700 per month. I write bug reports in English and prefer async written communication.\n\nI would be glad to walk a flow and show you how I report. My portfolio is at ozgurguler.tech/en.\n\nÖzgür Güler`;
const GOOD = BAD.split('\n\n').filter((p, i) => i !== 1 && i !== 2).join('\n\n').replace('Bluetooth printer support.', 'Bluetooth printer support. I am based in Türkiye (UTC+3) and prefer async written communication, and I would gladly write a sample bug report for one of your flows.');

const env = makeEnv(); await migrate(env); // migrate süreç başına bir kez çalışır: tek ortam
await env.DB.prepare("INSERT OR REPLACE INTO facts (key, value, source, confidence, updated_at) VALUES ('expected_hourly_rate_usd','30','test',1,0), ('preferred_weekly_hours','35','test',1,0)").run();

async function run(name, letters) {
  const prompts = []; let i = 0;
  env.AI.run = async (model, body) => {
    const sys = body.messages[0].content;
    if (/You verify claims/.test(sys)) return { choices: [{ message: { content: '{"ok":true,"issues":[]}' } }] };
    prompts.push(body.messages.at(-1).content);
    return { choices: [{ message: { content: JSON.stringify({ letter: letters[Math.min(i++, letters.length - 1)] }) } }] };
  };
  const s = await getSettings(env);
  const r = await coverLetter(env, s, { title: 'QA Tester', company: 'Vantum', lang: 'en', description: 'QA tester, write reproducible bugs. 15 hours a week, $700 per month.', analysis: '{}' });
  const ok = (c, m) => { console.log((c ? 'OK  ' : 'FAIL') + ' ' + name + ': ' + m); if (!c) process.exitCode = 1; };
  return { r, prompts, ok };
}

{ // model ikinci denemede düzeliyor
  const { r, prompts, ok } = await run('düzelen', [BAD, GOOD]);
  ok(prompts.length === 2 && /IMPORTANT: .*pay figure/.test(prompts[1]) && /Do not invent stories/.test(prompts[1]), 'yeniden yazma isteği gerekçeleriyle gitti');
  ok(r.text === GOOD && r.warnings.length === 0, 'temiz metin, uyarı yok');
}
{ // model inat ediyor: uydurma cümleler çıkarılmalı
  const { r, ok } = await run('inatçı', [BAD]);
  ok(!/\$700|15 hours|overlap|Steps:|One bug/i.test(r.text), 'uydurma kalmadı');
  ok(/Coğrafist with 30\+ learning modes/.test(r.text) && /Özgür Güler$/.test(r.text), 'doğru kısımlar duruyor');
  ok(r.warnings.length === 4 && r.warnings.every((w) => w.startsWith('çıkarıldı:')), 'uyarılar kaydedildi: ' + r.warnings.join(' | '));
}
