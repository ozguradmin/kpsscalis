// ozgurguler.tech/pro/*.pdf içeriği (17 Ekim 2026, sade tek sayfa CV, Ahenk eklendi). Kaynak: cv-data.js.
// CV PDF'i değişince cv-data.js'i güncelle ve CV_VERSION'ı artır: R2'deki PDF önbelleği yenilenir.
import { CV_DATA, cvToText } from './cv-data.js';

export const CV_VERSION = '2026-10-17';
export const CV_EN = cvToText(CV_DATA.en);
export const CV_TR = cvToText(CV_DATA.tr);

// Eski (30 Eylül) CV'deki doğru ama yeni tek sayfalık CV'ye sığmayan teknik ayrıntılar. Form sorularında ve
// teknik cevaplarda kullanılabilir (uydurma sayılmaz); ön yazı önce yukarıdaki CV'ye dayanır.
export const CV_DETAILS_EN = `- Stack also used: JavaScript, Hono, SQL / D1, Google Cloud, Oracle Cloud, Vercel, Git, GitHub Actions.
- APIs/integrations: REST APIs, Meta Graph API, YouTube API, X API, RevenueCat, WordPress REST API.
- Dönerci: shop expansion, staff, second branch, missions/rewards and offline earnings systems; rewarded ads, in-app purchases, multilingual store flows.
- Coğrafist: built with React, TypeScript and Capacitor; Firebase and RevenueCat integrations; progression systems.
- Print Fast: ESC/POS and CPCL printer support, receipt/label design, product catalog, templates, offline use.
- Galaktik Uzay: automated news discovery, content generation, image discovery, WordPress publishing and scheduled tasks with Cloudflare Workers, Hono, D1, Next.js and Azure OpenAI.
- WTF Yapay Zekâ: also has a web platform (AI news and easy guides, updated in 2026).
- ONOPO Store and Ivricambi: frontend and backend built from scratch, responsive interfaces.
- LLM Evaluation Toolkit: TypeScript; compares OpenAI-compatible multilingual models on structured output quality, source alignment, language consistency, latency, token use, cost and reliability.
- Works with AI-assisted development daily (design, integration, debugging, testing, code review).`;
