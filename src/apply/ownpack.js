// "Kendi tarayıcından gönder" paketi: formun gerçek sorularını (Workable herkese açık form API'si) okuyup her birine
// CV'ye dayalı cevap hazırlar. Form okunamazsa her formda çıkan standart alanlar (özet, deneyim, eğitim, ücret…) yine hazır olur.
import { CORE, payFor, DEFAULT_RATE } from '../profile.js';
import { answerQuestion } from './materials.js';
import { allRows } from '../lib/db.js';
import { clip, humanize, safeJSON } from '../lib/util.js';

async function facts(env) {
  const rows = await allRows(env, "SELECT key, value FROM facts WHERE key IN ('expected_hourly_rate_usd','earliest_start_preference','coding_start_year')");
  return Object.fromEntries(rows.map((r) => [r.key, safeJSON(r.value, r.value)]));
}

// Her başvuru formunda sık çıkan alanlar (CV ve profildeki gerçek bilgilerle). Ücret ilanın aralığına göre (payFor).
export async function standardAnswers(env, job = null) {
  const f = await facts(env);
  const rate = Number(f.expected_hourly_rate_usd) || DEFAULT_RATE;
  return {
    summary: humanize(`Software and digital product developer based in Türkiye (UTC+3). Since 2023 I have built and shipped four mobile apps on the App Store and Google Play (Dönerci, Coğrafist, Print Fast and WTF Yapay Zekâ, the last one with 50K+ Android downloads) and Galaktik Uzay, a multilingual AI content platform running on Cloudflare Workers, Hono, D1 and Azure OpenAI. I work full stack with TypeScript, React, Next.js and Node.js, use AI coding tools every day, and prefer async, written communication.`),
    experience: `Title: Founder and Product Developer (self-employed)\nCompany: Own products (independent)\nDates: April 2023 to present\nDescription: Built and published four mobile apps on the App Store and Google Play (React, TypeScript, Capacitor, Firebase, RevenueCat) and the Galaktik Uzay AI content platform (Cloudflare Workers, Hono, D1, Next.js, Azure OpenAI). Built full-stack websites for two businesses (ONOPO Store, Ivricambi).`,
    education: 'School: Istanbul Yeni Yüzyıl University\nDegree: Associate degree, Oral and Dental Health\nYears: 2024 to 2026',
    compensation: `${payFor(job, rate).text}, open to discussion`,
    years: '3',
    start: 'Immediately',
    authorization: 'I live in Türkiye and work remotely as a contractor, so I do not need visa sponsorship for remote work. I am not authorized to work in the US, UK or EU as an employee.',
    location: `${CORE.city}, ${CORE.country_en}`,
    website: `${CORE.portfolio}\n${CORE.github}`,
  };
}

// Workable: jobs.workable.com/view/<id> veya apply.workable.com/[hesap/]j/<kod>
async function workableForm(job) {
  const u = String(job.apply_url || job.url || '');
  const urls = [];
  let m = u.match(/jobs\.workable\.com\/view\/([A-Za-z0-9]+)/);
  if (m) urls.push(`https://jobs.workable.com/api/v1/jobs/${m[1]}/form`);
  m = u.match(/apply\.workable\.com\/(?:([a-z0-9-]+)\/)?j\/([A-Z0-9]+)/i);
  if (m) { if (m[1]) urls.push(`https://apply.workable.com/api/v2/accounts/${m[1]}/jobs/${m[2]}/form`); urls.push(`https://apply.workable.com/api/v1/jobs/${m[2]}/form`); }
  for (const x of urls) {
    try {
      const r = await fetch(x, { headers: { 'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/130 Safari/537.36', accept: 'application/json' } });
      if (!r.ok) continue;
      const d = await r.json();
      const secs = Array.isArray(d) ? d : d.sections || d.form || [];
      const fields = secs.flatMap((s) => s.fields || []);
      if (fields.length) return fields;
    } catch (e) { /* sonraki adres */ }
  }
  return null;
}

// Paket: [{ label, value }] (formdaki sırayla). Dosya alanları için not düşülür.
export async function buildOwnPack(env, settings, app, job) {
  const std = await standardAnswers(env, job);
  const fields = await workableForm(job).catch(() => null);
  const out = [];
  const add = (label, value) => { if (value) out.push({ label: clip(String(label).replace(/\s+/g, ' ').trim(), 160), value: String(value) }); };
  if (!fields) {
    add('Summary / About you', std.summary); add('Experience', std.experience); add('Education', std.education);
    add('Expected compensation', std.compensation); add('Years of experience (TypeScript / React)', std.years);
    add('Notice period / start date', std.start); add('Work authorization / sponsorship', std.authorization);
    return { items: out, fromForm: false };
  }
  for (const f of fields) {
    const id = String(f.id || ''), label = String(f.label || id), L = label.toLowerCase(), type = String(f.type || '');
    if (type === 'file' || /^(firstname|lastname|email|phone)$/.test(id)) continue; // kimlik bilgileri ve CV ayrıca veriliyor
    if (id === 'address' || /address|location|city/.test(L)) { add(label, std.location); continue; }
    if (id === 'summary') { add(label, std.summary); continue; }
    if (id === 'experience') { add(label, std.experience); continue; }
    if (id === 'education') { add(label, std.education); continue; }
    if (id === 'cover_letter') { continue; } // ön yazı en üstte
    if (/linkedin/.test(L)) { add(label, CORE.linkedin); continue; }
    if (/website|github|portfolio|personal site/.test(L)) { add(label, std.website); continue; }
    if (/compensation|salary|rate|pay expectation|expected (pay|salary)/.test(L)) { add(label, std.compensation); continue; }
    if (type === 'number' && /year/.test(L)) { add(label, std.years); continue; }
    if (/notice|start date|when can you start|availability to start/.test(L)) { add(label, std.start); continue; }
    if (/authori[sz]|visa|sponsor|right to work|work permit/.test(L)) { add(label, std.authorization); continue; }
    const choices = (f.choices || f.options || []).map((c) => c.body || c.label || c.name || c).filter((x) => typeof x === 'string');
    const q = choices.length ? `${label}\nOptions: ${choices.join(' | ')}\nReply with exactly one of the options, nothing else.` : label;
    try { add(label, await answerQuestion(env, settings, job, q, { maxWords: type === 'paragraph' ? 120 : 40 })); }
    catch (e) { add(label, '(cevap üretilemedi; kısa ve dürüst yaz)'); }
  }
  return { items: out, fromForm: true };
}
