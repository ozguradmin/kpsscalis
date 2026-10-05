// Aday profili: CV metni + onaylı gerçekler (facts). Başvurularda SADECE buradaki bilgiler kullanılır.
import { CV_EN, CV_TR } from './cv-text.js';
import { allRows } from './lib/db.js';
import { safeJSON, b64 } from './lib/util.js';

export { CV_EN, CV_TR };

// Özgür'ün kendi söylediği ve CV'deki temel gerçekler.
// facts tablosu bunları geçersiz kılabilir.
export const CORE = {
  full_name: 'Özgür Güler',
  first_name: 'Özgür',
  last_name: 'Güler',
  email: 'destek@ozgurguler.tech',
  phone: '+90 553 728 42 32',
  phone_local: '5537284232',
  location: 'Mardin, Türkiye',
  city: 'Mardin',
  country: 'Türkiye',
  country_en: 'Turkey',
  country_code: 'TR',
  timezone: 'Europe/Istanbul (UTC+3)',
  linkedin: 'https://www.linkedin.com/in/%C3%B6zg%C3%BCr-g-133a33219/',
  github: 'https://github.com/ozguradmin',
  portfolio: 'https://ozgurguler.tech/en',
  portfolio_tr: 'https://ozgurguler.tech/',
  cv_url_en: 'https://ozgurguler.tech/pro/Ozgur_Guler_CV_English.pdf',
  cv_url_tr: 'https://ozgurguler.tech/pro/Ozgur_Guler_CV.pdf',
  languages: [{ code: 'tr', level: 'native' }, { code: 'en', level: 'intermediate (B1-B2), comfortable in writing; prefers async/written communication' }],
  work_authorization: 'Turkish citizen living in Türkiye; works remotely as an independent contractor. Not authorized to work in the US/EU/UK without sponsorship; does not need sponsorship for remote contractor work from Türkiye.',
  coding_since: 'April 2023',
  years_experience_software: 3,
  expected_hourly_usd: 30,
  start: 'Immediately',
  employment_preference: 'Remote only; contractor/freelance or full-time remote',
  education: 'İstanbul Yeni Yüzyıl University, Oral and Dental Health (Associate Degree), graduation 2026',
  date_of_birth: '2002-11-02',
  gender_disclosure: 'Prefer not to say',
  prefers: 'Written/async communication; no face-video recordings; not comfortable with English voice/video calls',
};

export async function loadFacts(env) {
  const rows = await allRows(env, 'SELECT key, value, source, confidence FROM facts');
  const facts = {};
  for (const r of rows) facts[r.key] = { value: safeJSON(r.value, r.value), source: r.source, confidence: r.confidence };
  return facts;
}

// Modellere verilen profil özeti (kısa, doğru, tekrar kullanılabilir)
export async function profileContext(env, { withFacts = true, maxFacts = 80 } = {}) {
  let factLines = '';
  if (withFacts) {
    const facts = await loadFacts(env);
    const useful = Object.entries(facts)
      .filter(([k, v]) => !String(k).startsWith('form_answer_') && !String(k).startsWith('legal_consent_') && !/^"?I do not have direct formal/.test(JSON.stringify(v.value)))
      .slice(0, maxFacts)
      .map(([k, v]) => `- ${k}: ${typeof v.value === 'string' ? v.value : JSON.stringify(v.value)}`.slice(0, 300));
    factLines = factLines + useful.join('\n');
  }
  return `CANDIDATE CORE FACTS (authoritative):
${Object.entries(CORE).map(([k, v]) => `- ${k}: ${typeof v === 'string' ? v : JSON.stringify(v)}`).join('\n')}

CV (English, authoritative):
${CV_EN}
${factLines ? `\nADDITIONAL CONFIRMED FACTS:\n${factLines}` : ''}`;
}

export const HONESTY_RULES = `HONESTY RULES (never break):
- Use ONLY facts from the candidate profile/CV. Never invent employers, job titles, degrees, certifications, years, metrics, clients or skills.
- Never claim fluency in a language the candidate does not have (Turkish native, English intermediate). Never write that the candidate is a native English speaker.
- If a question asks for experience the candidate does not have, answer honestly and briefly bridge to the closest real experience.
- Do not mention that an AI/agent is writing or submitting the application. Do not make claims about personally not using AI either.
- Legal/consent questions: answer truthfully (e.g., not authorized to work in the US; located in Türkiye).
- Never promise working hours, time-zone overlap (e.g. "4+ hours with US Pacific"), start dates, salary or availability that are not in the profile. You may say: based in Türkiye (UTC+3), async-friendly, can start immediately.
- Mobile apps are built with React + TypeScript + Capacitor (web tech wrapped for iOS/Android), NOT React Native, Flutter, Swift or Kotlin. Never claim React Native/Flutter/native experience; if a job asks for it, say the apps were built with React + Capacitor and that the React/TypeScript skills transfer.
- Counts must match the CV exactly: FOUR apps published on the App Store / Google Play (Dönerci, Coğrafist, Print Fast, WTF Yapay Zekâ) plus Galaktik Uzay, a live web platform (not a store app) = five products in total. Say "four" only when talking about store/mobile apps; "five products" is correct only for the total including Galaktik Uzay.`;

// CV PDF'lerini R2'de önbelleğe alır (form yüklemeleri ve e-posta ekleri için)
export async function cvPdf(env, lang = 'en') {
  const key = `assets/cv_${lang}.pdf`;
  const obj = await env.R2.get(key);
  if (obj && Date.now() - new Date(obj.uploaded).getTime() < 3 * 86400000) return new Uint8Array(await obj.arrayBuffer());
  const url = lang === 'tr' ? CORE.cv_url_tr : CORE.cv_url_en;
  try {
    const r = await fetch(url, { cf: { cacheTtl: 0 } });
    if (!r.ok) throw new Error('cv ' + r.status);
    const buf = new Uint8Array(await r.arrayBuffer());
    if (buf.length > 10000) { await env.R2.put(key, buf, { httpMetadata: { contentType: 'application/pdf' } }); return buf; }
  } catch (e) { /* önbellektekini kullan */ }
  if (obj) return new Uint8Array(await obj.arrayBuffer());
  throw new Error('CV PDF alınamadı');
}

export async function cvBase64(env, lang = 'en') {
  return b64(await cvPdf(env, lang));
}
