// Model seçimi için değerlendirme seti: gerçek ilan kalıplarından türetilmiş, cevabı net vakalar.
export const TRIAGE = [
  { id: 'pt-br-only', text: 'Vaga: Desenvolvedor(a) Front-end Pleno (React). Modelo: 100% remoto, apenas para residentes no Brasil. Contratação CLT, benefícios: VR, plano de saúde. Requisitos: React, TypeScript, português fluente.', want: { turkey_ok: false, langs: ['pt'], scam: false, family: 'frontend' } },
  { id: 'pt-global', text: 'Oportunidade internacional: Full Stack Developer (Node.js + React). Trabalho remoto de qualquer lugar do mundo, contrato como contractor (pagamento em USD). Comunicação do time em inglês (intermediário suficiente).', want: { turkey_ok: true, langs: ['en'], scam: false, family: 'fullstack' } },
  { id: 'es-latam', text: 'Buscamos Desarrollador Backend (Node.js). Trabajo 100% remoto para personas residentes en Latinoamérica (LATAM). Pago en USD, inglés B2.', want: { turkey_ok: false, langs: ['en'], scam: false, family: 'backend' } },
  { id: 'es-native', text: 'Anotador/a de datos para IA — 100% remoto global, freelance por horas. Requisito: español nativo de España, excelente ortografía.', want: { turkey_ok: true, langs: ['es'], scam: false, family: 'ai_training' } },
  { id: 'pl-b2b', text: 'Frontend Developer (Vue). Praca zdalna, kontrakt B2B, wymagana bardzo dobra znajomość języka polskiego oraz zamieszkanie w Polsce.', want: { turkey_ok: false, langs: ['pl'], scam: false, family: 'frontend' } },
  { id: 'de-eu', text: 'Softwareentwickler (m/w/d) TypeScript — Remote innerhalb der EU möglich. Fließende Deutschkenntnisse (C1) zwingend erforderlich.', want: { turkey_ok: false, langs: ['de'], scam: false, family: 'fullstack' } },
  { id: 'de-worldwide', text: 'Wir suchen: React/TypeScript Entwickler*in — Full Remote weltweit, Freelance/Contractor. Unsere Arbeitssprache ist Englisch, Deutsch ist nicht nötig. Erfahrung mit Cloudflare Workers ein Plus.', want: { turkey_ok: true, langs: ['en'], scam: false, family: 'frontend' } },
  { id: 'ru-any', text: 'Вакансия: Frontend-разработчик (React, TypeScript). Удалённо, из любой страны. Команда общается на русском языке.', want: { turkey_ok: true, langs: ['ru'], scam: false, family: 'frontend' } },
  { id: 'en-turkish-ai', text: 'Turkish Language AI Trainer (Freelance). Fully remote, open worldwide. Native Turkish speakers wanted to evaluate and write AI model responses in Turkish. Flexible hours, paid hourly.', want: { turkey_ok: true, langs: ['tr'], scam: false, family: 'ai_training' } },
  { id: 'en-us-w2', text: 'Senior Rust Engineer. Remote (US only). W2 employees; must be authorized to work in the United States without sponsorship.', want: { turkey_ok: false, langs: ['en'], scam: false, family: 'backend' } },
  { id: 'en-emea', text: 'Frontend Engineer (React/TypeScript) — Remote, EMEA time zones (UTC-1 to UTC+4). Contractors welcome in any EMEA country.', want: { turkey_ok: true, langs: ['en'], scam: false, family: 'frontend' } },
  { id: 'ua-only', text: 'Middle React Developer. Віддалено. Розглядаємо лише кандидатів, які перебувають в Україні. Українська мова обовʼязкова.', want: { turkey_ok: false, langs: ['uk'], scam: false, family: 'frontend' } },
  { id: 'scam', text: 'WORK FROM HOME!!! Earn $5,000/week as a Data Entry Assistant. No experience needed. Pay a one-time $49 registration fee for your training kit. Contact our HR on WhatsApp/Telegram now.', want: { turkey_ok: true, langs: ['en'], scam: true, family: 'other' } },
  { id: 'tr-remote', text: 'React Native Geliştirici — Tamamen uzaktan, Türkiye’nin her yerinden çalışabilirsiniz. Serbest çalışan (fatura) veya bordrolu seçenekleri var.', want: { turkey_ok: true, langs: ['tr'], scam: false, family: 'mobile' } },
];

export const LETTER_JOB = { title: 'Frontend Engineer (React/TypeScript)', company: 'Nordlicht Labs', text: 'Remote (EMEA). You will build internal dashboards and customer-facing web apps with React and TypeScript, deploy on Cloudflare Workers, and work closely with product. Nice to have: mobile experience (Capacitor/React Native), experience shipping to app stores.' };

export const FORM = {
  job: 'Frontend Engineer at Nordlicht Labs (remote EMEA)',
  fields: [
    { id: 'first_name', label: 'First name', type: 'text', required: true },
    { id: 'last_name', label: 'Last name', type: 'text', required: true },
    { id: 'email', label: 'Email', type: 'email', required: true },
    { id: 'phone', label: 'Phone', type: 'tel', required: true },
    { id: 'linkedin', label: 'LinkedIn profile', type: 'url' },
    { id: 'us_auth', label: 'Are you legally authorized to work in the United States?', type: 'select', options: ['Yes', 'No'], required: true },
    { id: 'react_years', label: 'How many years of professional experience do you have with React?', type: 'number', required: true },
    { id: 'rate', label: 'Expected hourly rate (USD)', type: 'number' },
    { id: 'start', label: 'When can you start?', type: 'select', options: ['Immediately', 'In 2 weeks', 'In 1 month', 'Later'] },
    { id: 'location', label: 'Where are you currently based? (City, Country)', type: 'text', required: true },
    { id: 'german', label: 'Do you speak German fluently?', type: 'radio', options: ['Yes', 'No'], required: true },
  ],
  expect: { first_name: 'Özgür', last_name: 'Güler', email: 'destek@ozgurguler.tech', us_auth: 'No', react_years: '3', rate: '30', start: 'Immediately', location: /mardin/i, german: 'No' },
};

export const PROFILE_BRIEF = `Candidate: Özgür Güler, based in Mardin, Türkiye (Turkish citizen). Languages: Turkish (native), English (intermediate, prefers written/async communication). Software & digital product developer: TypeScript, JavaScript, React, Next.js, Node.js, Hono, Capacitor, SQL/D1, Cloudflare Workers, Firebase. Coding since April 2023 (~3 years). Founder/developer of 4 published mobile products (Dönerci tycoon game, Coğrafist geography education app, Print Fast thermal printing app, WTF Yapay Zekâ Android app 50K+ downloads). Built Galaktik Uzay multilingual AI content platform (Cloudflare Workers, Hono, D1, Next.js, Azure OpenAI), Whisper Web Scribe (speech-to-text), LLM Evaluation Toolkit. Grew social accounts to 1M+ followers. Education: Oral and Dental Health associate degree, 2026. Email destek@ozgurguler.tech, phone +90 553 728 42 32, LinkedIn https://www.linkedin.com/in/%C3%B6zg%C3%BCr-g-133a33219/, portfolio https://ozgurguler.tech/en. Expected rate 20 USD/hour, can start immediately. Not authorized to work in the US; works as a remote contractor.`;
