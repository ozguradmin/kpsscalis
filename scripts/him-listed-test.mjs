// Himalayas "ilan hâlâ yayında mı" denetimi: gerçek API'ye karşı (hız sınırı yüzünden istekler arasında bekler)
// Kullanım: node --import ./test/register.mjs scripts/him-listed-test.mjs
import { himalayasListed } from '../src/sources/index.js';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const CASES = [
  ['micro1/jobs/turkish-bilingual-expert', 'Turkish Bilingual Expert'],
  ['micro1/jobs/evaluation-specialist-recent-grad-6119027108', 'Evaluation Specialist/Recent Grad'],
  ['inv/jobs/swe-bench-ai-task-auditor-freelance-ai-trainer-project', 'SWE-Bench AI Task Auditor - Freelance AI Trainer Project'],
  ['micro1/jobs/human-data-manager-1981865690', 'Human Data Manager'],
  ['micro1/jobs/video-data-annotator-966806508', 'Video Data Annotator'],
  ['telus-digital/jobs/full-stack-ai-logic-expert-ai-community-5029362594', 'Full-Stack AI Logic Expert (AI Community)'],
  ['micro1/jobs/frontend-ui-engineer?utm_source=api', 'Frontend / UI Engineer'],
  ['yok-boyle-sirket/jobs/olmayan-ilan-123', 'Zxqv Olmayan Ilan Basligi 9917'],
];
for (const [slug, title] of CASES) {
  const r = await himalayasListed({}, { external_id: `https://himalayas.app/companies/${slug}`, title });
  console.log(String(r).padEnd(6), title);
  await sleep(6000);
}
