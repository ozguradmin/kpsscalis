// İlan kaynakları. Her kaynak normalize edilmiş ilan listesi döndürür.
// Seçim ölçütü: herkesin baktığı büyük panolar yerine az bilinen, farklı dillerdeki panolar ve şirketlerin kendi ATS sayfaları.
import { fetchJSON, fetchText, htmlToText, parseRSS, toTs, clip, hostOf } from '../lib/util.js';

const MAXDESC = 9000;

export function detectLang(text) {
  const s = String(text || '').slice(0, 3000).toLowerCase();
  if (/[а-яё]/.test(s)) return /[іїєґ]/.test(s) ? 'uk' : 'ru';
  const score = (re) => (s.match(re) || []).length;
  const c = {
    tr: score(/\b(ve|için|bir|ile|olarak|deneyim|çalış\w*)\b|[ğış]/g),
    pt: score(/\b(você|vaga|para|com|uma|são|experiência|trabalho|nós|ção)\b|ção|ções/g),
    es: score(/\b(trabajo|empresa|para|con|una|experiencia|buscamos|somos|y|el)\b|ñ/g),
    de: score(/\b(und|wir|für|mit|der|die|das|sie|erfahrung|kenntnisse)\b|ß/g),
    pl: score(/\b(oraz|jest|dla|praca|doświadczenie|się|firma)\b|[ąęłśżź]/g),
    fr: score(/\b(nous|vous|pour|avec|une|poste|expérience|les|des)\b/g),
    nl: score(/\b(wij|voor|het|een|met|ervaring|jouw|je)\b/g),
    it: score(/\b(siamo|lavoro|per|con|una|esperienza|della)\b/g),
    en: score(/\b(the|and|you|with|for|we|our|experience|will|are)\b/g),
  };
  const best = Object.entries(c).sort((a, b) => b[1] - a[1])[0];
  return best[1] >= 3 ? best[0] : 'en';
}

function job(o) {
  const description = clip(o.description || '', MAXDESC);
  return {
    source: o.source,
    external_id: String(o.external_id ?? o.url),
    url: o.url,
    apply_url: o.apply_url || o.url,
    company: (o.company || '').trim() || hostOf(o.url),
    title: (o.title || '').trim(),
    location: clip(o.location || '', 300),
    description,
    salary: o.salary ? clip(String(o.salary), 120) : null,
    tags: o.tags ? clip(Array.isArray(o.tags) ? o.tags.join(', ') : String(o.tags), 300) : null,
    posted_at: toTs(o.posted_at),
    remote_hint: o.remote_hint || null,
    lang: o.lang || detectLang(`${o.title} ${description}`),
  };
}

// ---------------- kaynaklar ----------------
// cadence: dakika cinsinden tarama sıklığı. label: panelde görünen ad. kind: board | aggregator | ats
const TORRE_ROLES = ['full stack developer', 'frontend developer', 'react developer', 'mobile developer', 'ai trainer', 'qa tester', 'content creator', 'social media manager'];
const WORKABLE_Q = ['', 'developer', 'react', 'frontend', 'AI trainer', 'content', 'social media', 'Turkish', 'türkçe', 'desarrollador', 'desenvolvedor', 'entwickler', 'développeur', 'sviluppatore', 'programista'];

async function workableSearch(params, pages = 3) {
  const out = [];
  let token = '';
  for (let p = 0; p < pages; p++) {
    const qs = new URLSearchParams({ workplace: 'remote', ...params, ...(token ? { pageToken: token } : {}) });
    const d = await fetchJSON(`https://jobs.workable.com/api/v1/jobs?${qs}`);
    out.push(...(d.jobs || []));
    token = d.nextPageToken;
    if (!token) break;
  }
  return out;
}
const workableJob = (source, j) => job({ source, external_id: j.id, url: j.url, company: j.company?.title, title: j.title,
  location: [...(j.locations || []).filter((l) => l !== 'TELECOMMUTE'), 'remote'].join(' · '),
  description: htmlToText([j.description, j.requirementsSection, j.benefitsSection].join('\n')), tags: [j.department, j.employmentType],
  posted_at: j.created, lang: /^[a-z]{2}$/.test(j.language || '') ? j.language : undefined, remote_hint: 'remote' });

export const SOURCES = [
  {
    // Workable'ın küresel araması: çoğu küçük/orta şirket; "Türkiye" konumlu uzaktan ilanlar doğrudan Türkiye'den işe alır
    id: 'workable_tr', label: 'Workable — Türkiye\'den uzaktan', cadence: 120, lang: 'en',
    async fetch() {
      const seen = new Set(), out = [];
      for (const q of ['', 'developer', 'yazılım', 'content', 'AI']) {
        for (const j of await workableSearch({ location: 'Turkey', ...(q ? { query: q } : {}) }, q ? 1 : 7).catch(() => [])) {
          if (seen.has(j.id)) continue;
          seen.add(j.id);
          out.push({ ...workableJob('workable_tr', j), location: `${(j.locations || []).filter((l) => l !== 'TELECOMMUTE').join(' · ')} · remote (Türkiye'den)` });
        }
      }
      if (!out.length) throw new Error('Workable yanıt vermedi');
      return out;
    },
  },
  {
    id: 'workable', label: 'Workable küresel (çok dilli, küçük şirketler)', cadence: 240, lang: 'en',
    async fetch() {
      const seen = new Set(), out = [];
      for (const q of WORKABLE_Q.filter(Boolean)) {
        for (const j of await workableSearch({ query: q }, 1).catch(() => [])) {
          if (seen.has(j.id) || Date.now() - Date.parse(j.created) > 21 * 86400000) continue;
          seen.add(j.id);
          out.push(workableJob('workable', j));
        }
      }
      return out;
    },
  },
  {
    // Torre: Latin Amerika ağırlıklı küçük şirketler; sadece "her yerden" uzaktan ve ücreti makul olanlar
    id: 'torre', label: 'Torre (küçük şirketler, her yerden uzaktan)', cadence: 360, lang: 'en',
    async fetch() {
      const hits = new Map();
      for (const role of TORRE_ROLES) {
        const d = await fetch('https://search.torre.co/opportunities/_search?size=20&lang=en&aggregate=false', {
          method: 'POST', headers: { 'content-type': 'application/json', 'user-agent': 'Mozilla/5.0' },
          body: JSON.stringify({ and: [{ remote: { term: true } }, { 'skill/role': { text: role, proficiency: 'proficient' } }] }),
        }).then((r) => r.ok ? r.json() : { results: [] }).catch(() => ({ results: [] }));
        for (const r of d.results || []) {
          const pay = r.compensation?.data;
          if (r.place?.locationType !== 'remote_anywhere' || r.status !== 'open') continue;
          if (pay?.maxHourlyUSD && r.compensation.visible && pay.maxHourlyUSD < 12) continue; // aday ~30 $/sa bekliyor
          if (Date.now() - Date.parse(r.created) > 45 * 86400000) continue;
          hits.set(r.id, r);
        }
      }
      const out = [];
      for (const r of [...hits.values()].slice(0, 40)) {
        const d = await fetchJSON(`https://torre.ai/api/suite/opportunities/${r.id}`).catch(() => null);
        const langs = (d?.languages || []).map((l) => `${l.language?.name} (${l.fluency})`).join(', ');
        const details = (d?.details || []).map((x) => x.content).filter((x) => x && x !== '-').join('\n');
        const pay = r.compensation?.visible && r.compensation.data ? `${r.compensation.data.minAmount}-${r.compensation.data.maxAmount} ${r.compensation.data.currency}/${r.compensation.data.periodicity}` : null;
        out.push(job({ source: 'torre', external_id: r.id, url: `https://torre.ai/post/${r.id}-${r.slug}`, company: (r.organizations || [])[0]?.name, title: r.objective,
          location: 'Remote (anywhere)', description: `${r.tagline || ''}\nLanguages: ${langs}\nSkills: ${(r.skills || []).map((s) => s.name).join(', ')}\n${details}`, salary: pay, posted_at: r.created, remote_hint: 'remote' }));
      }
      return out;
    },
  },
  {
    id: 'getonbrd', label: 'Get on Board (Latin Amerika, İspanyolca)', cadence: 240, lang: 'es',
    async fetch() {
      const out = [];
      for (const q of ['developer', 'javascript', 'react', 'typescript', 'frontend', 'full stack', 'mobile', 'qa', 'content', 'ai']) {
        try {
          const d = await fetchJSON(`https://www.getonbrd.com/api/v0/search/jobs?query=${encodeURIComponent(q)}&per_page=60&page=1&remote=true&expand=%5B%22company%22%5D`);
          for (const j of d.data || []) {
            const a = j.attributes || {};
            if (a.remote_modality && !/fully_remote|remote/.test(a.remote_modality)) continue;
            out.push(job({ source: 'getonbrd', external_id: j.id, url: j.links?.public_url || `https://www.getonbrd.com/jobs/${j.id}`, company: a.company?.data?.attributes?.name || a.company?.data?.id || '', title: a.title,
              location: [a.remote_modality, a.remote_zone, (a.countries || []).join(', ')].filter(Boolean).join(' · '),
              description: htmlToText([a.description, a.functions, a.desirable, a.benefits].join('\n')), salary: a.min_salary ? `${a.min_salary}-${a.max_salary} USD/ay` : null,
              posted_at: a.published_at, lang: /^[a-z]{2}$/.test(a.lang || '') ? a.lang : undefined, remote_hint: 'remote' }));
          }
        } catch (e) { if (!out.length && q === 'developer') throw e; }
      }
      return out;
    },
  },
  {
    id: 'remotar', label: 'Remotar (Brezilya, Portekizce)', cadence: 360, lang: 'pt',
    async fetch() {
      const out = [];
      for (let page = 1; page <= 3; page++) {
        const d = await fetchJSON(`https://api.remotar.com.br/jobs?page=${page}`);
        for (const j of d.data || []) {
          if (j.type && j.type !== 'remote') continue;
          out.push(job({ source: 'remotar', external_id: j.id, url: `https://remotar.com.br/job/${j.id}`, apply_url: j.externalLink || `https://remotar.com.br/job/${j.id}`, company: j.company?.name || j.companyDisplayName, title: j.title,
            location: [j.city, j.state, j.country?.name || 'Brasil'].filter(Boolean).join(', '), description: htmlToText(`${j.subtitle || ''}\n${j.description || ''}\n${j.moreInfos || ''}`), posted_at: j.createdAt, lang: 'pt', remote_hint: 'remote' }));
        }
      }
      return out;
    },
  },
  {
    id: 'djinni', label: 'Djinni (Ukrayna, tam uzaktan)', cadence: 180, lang: 'en',
    async fetch() {
      const items = parseRSS(await fetchText('https://djinni.co/jobs/rss/?remote_type=full_remote'));
      return items.map((i) => job({ source: 'djinni', external_id: i.guid, url: i.link, company: i.author || '', title: i.title, description: htmlToText(i.description), posted_at: i.pubDate, location: 'Full remote', remote_hint: 'remote' }));
    },
  },
  {
    id: 'dou', label: 'DOU (Ukrayna, uzaktan)', cadence: 240, lang: 'uk',
    async fetch() {
      const items = parseRSS(await fetchText('https://jobs.dou.ua/vacancies/feeds/?remote'));
      return items.map((i) => {
        const m = i.title.match(/^(.*?) в (.*?), (.*)$/);
        return job({ source: 'dou', external_id: i.guid, url: i.link, company: m ? m[2] : '', title: m ? m[1] : i.title, location: m ? m[3] : 'віддалено', description: htmlToText(i.description), posted_at: i.pubDate, remote_hint: 'remote' });
      });
    },
  },
  {
    id: 'habr', label: 'Habr Kariyer (Rusça, uzaktan)', cadence: 360, lang: 'ru',
    async fetch() {
      const out = [];
      for (let page = 1; page <= 2; page++) {
        const d = await fetchJSON(`https://career.habr.com/api/frontend/vacancies?remote=true&per_page=50&page=${page}&sort=date`);
        for (const v of d.list || []) {
          out.push(job({ source: 'habr', external_id: v.id, url: `https://career.habr.com${v.href}`, company: v.company?.title || v.company?.alias_name, title: v.title,
            location: (v.locations || []).map((l) => l.title).join(', ') || 'Удалённо', description: [(v.divisions || []).map((x) => x.title).join(', '), (v.skills || []).map((x) => x.title).join(', '), v.salary?.formatted].filter(Boolean).join('\n'),
            posted_at: v.publishedDate?.date, lang: 'ru', remote_hint: 'remote', salary: v.salary?.formatted }));
        }
      }
      return out;
    },
  },
  {
    id: 'arbeitnow', label: 'Arbeitnow (Almanya)', cadence: 240, lang: 'de',
    async fetch() {
      const out = [];
      for (let page = 1; page <= 3; page++) {
        const d = await fetchJSON(`https://www.arbeitnow.com/api/job-board-api?page=${page}`);
        for (const j of d.data || []) {
          if (!j.remote) continue;
          out.push(job({ source: 'arbeitnow', external_id: j.slug, url: j.url, company: j.company_name, title: j.title, location: `${j.location || ''} (remote)`, description: htmlToText(j.description), tags: [...(j.tags || []), ...(j.job_types || [])], posted_at: j.created_at, remote_hint: 'remote' }));
        }
      }
      return out;
    },
  },
  {
    id: 'landingjobs', label: 'Landing.jobs (Portekiz/AB)', cadence: 480, lang: 'en',
    async fetch() {
      const out = [];
      for (let off = 0; off < 150; off += 50) {
        const d = await fetchJSON(`https://landing.jobs/api/v1/jobs?limit=50&offset=${off}`);
        for (const j of d || []) {
          if (!j.remote) continue;
          out.push(job({ source: 'landingjobs', external_id: j.id, url: j.url, company: (j.url.match(/\/at\/([^/]+)/) || [])[1]?.replace(/-/g, ' '), title: j.title,
            location: (j.locations || []).map((l) => `${l.city || ''} ${l.country_code || ''}`).join(', ') + ' (remote)', description: htmlToText([j.role_description, j.main_requirements, j.nice_to_have, j.perks].join('\n')),
            salary: j.gross_salary_low ? `${j.gross_salary_low}-${j.gross_salary_high} ${j.currency_code}/yıl` : null, tags: j.tags, posted_at: j.published_at, remote_hint: 'remote' }));
        }
        if (!d || d.length < 50) break;
      }
      return out;
    },
  },
  {
    id: 'alignerr', label: 'Alignerr (yapay zekâ eğitimi, dil bazlı)', cadence: 360, lang: 'en',
    async fetch() {
      const d = await fetchJSON('https://www.alignerr.com/api/jobs');
      return (d.jobs || []).map((j) => job({ source: 'alignerr', external_id: j.id, url: `https://www.alignerr.com${j.applyUrl}`, company: 'Alignerr (Labelbox)', title: j.title, location: j.location, description: htmlToText(j.description), salary: j.pay, tags: [j.category, j.originalCategory], remote_hint: 'remote' }));
    },
  },
  {
    id: 'himalayas', label: 'Himalayas', cadence: 180, lang: 'en',
    async fetch() {
      const out = [];
      let cursor = '';
      for (let i = 0; i < 3; i++) {
        const d = await fetchJSON(`https://himalayas.app/jobs/api?limit=100${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ''}`);
        for (const j of d.jobs || []) {
          out.push(job({ source: 'himalayas', external_id: j.guid, url: j.applicationLink || j.guid, company: j.companyName, title: j.title,
            location: (j.locationRestrictions || []).length ? `Remote: ${(j.locationRestrictions || []).join(', ')}` : 'Remote (worldwide)', description: htmlToText(j.description),
            salary: j.minSalary ? `${j.minSalary}-${j.maxSalary} ${j.currency || ''}/${j.salaryPeriod || ''}` : null, tags: [...(j.categories || []), j.employmentType], posted_at: j.pubDate, remote_hint: 'remote' }));
        }
        cursor = d.nextCursor;
        if (!cursor) break;
      }
      return out;
    },
  },
  {
    id: 'jobicy', label: 'Jobicy', cadence: 240, lang: 'en',
    async fetch() {
      const d = await fetchJSON('https://jobicy.com/api/v2/remote-jobs?count=100');
      return (d.jobs || []).map((j) => job({ source: 'jobicy', external_id: j.id, url: j.url, company: j.companyName, title: j.jobTitle, location: `Remote: ${j.jobGeo}`, description: htmlToText(j.jobDescription), tags: [...(j.jobIndustry || []), ...(j.jobType || []), j.jobLevel], posted_at: j.pubDate, remote_hint: 'remote', salary: j.annualSalaryMin ? `${j.annualSalaryMin}-${j.annualSalaryMax} ${j.salaryCurrency}` : null }));
    },
  },
  {
    id: 'workingnomads', label: 'Working Nomads', cadence: 360, lang: 'en',
    async fetch() {
      const d = await fetchJSON('https://www.workingnomads.com/api/exposed_jobs/');
      return (d || []).map((j) => job({ source: 'workingnomads', external_id: j.url, url: j.url, company: j.company_name, title: j.title, location: `Remote: ${j.location || ''}`, description: htmlToText(j.description), tags: [j.category_name, j.tags], posted_at: j.pub_date, remote_hint: 'remote' }));
    },
  },
  {
    id: '4dayweek', label: '4 Day Week', cadence: 480, lang: 'en',
    async fetch() {
      const d = await fetchJSON('https://4dayweek.io/api/jobs?limit=100');
      return (d.jobs || []).filter((j) => j.work_arrangement === 'remote').map((j) => job({ source: '4dayweek', external_id: j.id, url: `https://4dayweek.io/remote-job/${j.slug}`, company: j.company_name, title: j.title,
        location: 'Remote: ' + (j.locations || []).map((l) => l.country || l.continent).filter(Boolean).join(', '), description: `${j.category || ''} · ${j.level || ''} · ${j.schedule_type || ''}`, posted_at: j.posted, remote_hint: 'remote' }));
    },
  },
  {
    id: 'remotive', label: 'Remotive', cadence: 360, lang: 'en',
    async fetch() {
      const d = await fetchJSON('https://remotive.com/api/remote-jobs?limit=300');
      return (d.jobs || []).map((j) => job({ source: 'remotive', external_id: j.id, url: j.url, company: j.company_name, title: j.title, location: `Remote: ${j.candidate_required_location || ''}`, description: htmlToText(j.description), tags: [...(j.tags || []), j.category, j.job_type], salary: j.salary, posted_at: j.publication_date, remote_hint: 'remote' }));
    },
  },
  {
    id: 'remoteok', label: 'Remote OK', cadence: 360, lang: 'en',
    async fetch() {
      const d = await fetchJSON('https://remoteok.com/api');
      return (d || []).filter((j) => j && j.id && j.position).map((j) => job({ source: 'remoteok', external_id: j.id, url: j.url, apply_url: j.apply_url || j.url, company: j.company, title: j.position, location: `Remote: ${j.location || ''}`, description: htmlToText(j.description), tags: j.tags, posted_at: j.date, remote_hint: 'remote', salary: j.salary_min ? `${j.salary_min}-${j.salary_max} USD` : null }));
    },
  },
  {
    id: 'wwr', label: 'We Work Remotely', cadence: 360, lang: 'en',
    async fetch() {
      const items = parseRSS(await fetchText('https://weworkremotely.com/remote-jobs.rss'));
      return items.map((i) => { const [company, ...t] = i.title.split(':'); return job({ source: 'wwr', external_id: i.guid, url: i.link, company, title: t.join(':').trim() || i.title, description: htmlToText(i.description), posted_at: i.pubDate, location: 'Remote', remote_hint: 'remote' }); });
    },
  },
  {
    id: 'jobspresso', label: 'Jobspresso', cadence: 480, lang: 'en',
    async fetch() {
      const items = parseRSS(await fetchText('https://jobspresso.co/feed/?post_type=job_listing'));
      return items.map((i) => job({ source: 'jobspresso', external_id: i.guid, url: i.link, company: htmlToText(i.author).split('⚲')[0].trim(), title: i.title, description: htmlToText(i.description), posted_at: i.pubDate, location: 'Remote', remote_hint: 'remote' }));
    },
  },
  {
    id: 'nodesk', label: 'NoDesk', cadence: 480, lang: 'en',
    async fetch() {
      const items = parseRSS(await fetchText('https://nodesk.co/remote-jobs/index.xml'));
      return items.map((i) => job({ source: 'nodesk', external_id: i.guid, url: i.link, title: i.title, company: (i.title.match(/ at (.+)$/) || [])[1] || '', description: htmlToText(i.description), posted_at: i.pubDate, location: 'Remote', remote_hint: 'remote' }));
    },
  },
  {
    id: 'tecnoempleo', label: 'Tecnoempleo (İspanya, teletrabajo)', cadence: 480, lang: 'es',
    async fetch() {
      const items = parseRSS(await fetchText('https://www.tecnoempleo.com/alertas-empleo-rss.php'));
      return items.filter((i) => /teletrabajo|remoto|remote/i.test(`${i.title} ${i.description}`)).map((i) => job({ source: 'tecnoempleo', external_id: i.guid, url: i.link, title: i.title, description: htmlToText(i.description), posted_at: i.pubDate, location: 'Teletrabajo', lang: 'es', remote_hint: 'remote' }));
    },
  },
  {
    id: 'hn', label: 'Hacker News "Who is hiring" (REMOTE)', cadence: 720, lang: 'en',
    async fetch() {
      const s = await fetchJSON('https://hn.algolia.com/api/v1/search_by_date?tags=story,author_whoishiring&hitsPerPage=5');
      const story = (s.hits || []).find((h) => /who is hiring/i.test(h.title));
      if (!story) return [];
      const c = await fetchJSON(`https://hn.algolia.com/api/v1/search?tags=comment,story_${story.objectID}&hitsPerPage=1000`);
      const out = [];
      for (const h of c.hits || []) {
        if (h.parent_id !== Number(story.objectID)) continue; // sadece üst seviye ilanlar
        const text = htmlToText(h.comment_text || '', 6000);
        if (!/remote/i.test(text.slice(0, 400))) continue;
        const first = text.split('\n')[0];
        const parts = first.split('|').map((x) => x.trim());
        out.push(job({ source: 'hn', external_id: h.objectID, url: `https://news.ycombinator.com/item?id=${h.objectID}`, company: parts[0], title: parts.slice(1, 3).join(' | ') || first.slice(0, 120), location: parts.find((p) => /remote/i.test(p)) || 'Remote', description: text, posted_at: h.created_at, remote_hint: 'remote' }));
      }
      return out;
    },
  },
];

// ---------------- ATS panoları (şirketlerin kendi kariyer sayfaları) ----------------
export const ATS_PATTERNS = [
  { ats: 'greenhouse', re: /(?:boards|job-boards)(?:\.eu)?\.greenhouse\.io\/(?:embed\/job_board\?for=)?([a-z0-9_-]+)/i },
  { ats: 'lever', re: /jobs(?:\.eu)?\.lever\.co\/([a-z0-9_.-]+)/i },
  { ats: 'ashby', re: /jobs\.ashbyhq\.com\/([a-z0-9_.%-]+)/i },
  { ats: 'recruitee', re: /\/\/([a-z0-9-]+)\.recruitee\.com/i },
  { ats: 'workable', re: /apply\.workable\.com\/([a-z0-9_-]+)/i },
  { ats: 'personio', re: /\/\/([a-z0-9-]+)\.jobs\.personio\.(?:de|com)/i },
  { ats: 'teamtailor', re: /\/\/([a-z0-9-]+)\.teamtailor\.com/i },
  { ats: 'breezy', re: /\/\/([a-z0-9-]+)\.breezy\.hr/i },
  { ats: 'smartrecruiters', re: /(?:careers|jobs)\.smartrecruiters\.com\/([a-z0-9_-]+)/i },
];

export function detectATS(url) {
  if (!url) return null;
  for (const p of ATS_PATTERNS) {
    const m = String(url).match(p.re);
    if (m && !['embed', 'jobs', 'api', 'v1', 'o', 'apply'].includes(m[1].toLowerCase())) return { ats: p.ats, slug: decodeURIComponent(m[1]).toLowerCase() };
  }
  return null;
}

// Tohum listesi bilinçli olarak küçük: ünlü şirketler (binlerce başvuru alan) yerine ilanlardan öğrenilen küçük şirketler taranır.
// Burada sadece Türkiye'den işe alan küçük/orta Türk şirketleri ve küçük bir Polonya ajansı var.
export const SEED_BOARDS = [
  ['recruitee', 'espeo'], ['ashby', 'codeway'], ['ashby', 'agavegames'], ['lever', 'iyzico'],
];
export const SEED_VERSION = 3;

// Herkesin başvurduğu ünlü şirketler: panoları taranmaz, ilanları geri plana düşer
export const FAMOUS = /\b(google|meta|amazon|apple|microsoft|netflix|binance|okx|coinbase|stripe|shopify|gitlab|github|vercel|cloudflare|canonical|mozilla|wikimedia|elastic|grafana|duolingo|getyourguide|n26|bitpanda|posthog|supabase|linear|railway|zapier|replit|lovable|clickhouse|sanity|toptal|mercor|outreach|udemy|trendyol|insider|tether|openai|anthropic|airbnb|uber|spotify|atlassian|canva|figma|notion|datadog|mongodb|hashicorp|automattic|invisible|meridial|micro1|dataannotation|outlier|scale ai|turing|imerit|alignerr|labelbox|remote\.com|deel|oyster)\b/i;

const REMOTEISH = /remote|anywhere|worldwide|global|distributed|home ?office|telework|teletrabajo|remoto|zdaln|удал[её]н|віддал|uzaktan|emea|europe|türk|turkey|istanbul/i;

export async function fetchBoard(ats, slug, cap = 300) {
  const out = [];
  const done = () => out.length >= cap;
  if (ats === 'greenhouse') {
    const d = await fetchJSON(`https://boards-api.greenhouse.io/v1/boards/${slug}/jobs?content=true`);
    for (const j of d.jobs || []) {
      if (done()) break;
      const loc = [j.location?.name, ...(j.offices || []).map((o) => o.name)].filter(Boolean).join(' · ');
      const desc = htmlToText(j.content);
      if (!REMOTEISH.test(loc) && !REMOTEISH.test(desc.slice(0, 1500))) continue;
      out.push(job({ source: `ats:${ats}`, external_id: j.id, url: j.absolute_url, company: j.company_name || slug, title: j.title, location: loc, description: desc, posted_at: j.first_published || j.updated_at, lang: j.language }));
    }
  } else if (ats === 'lever') {
    const d = await fetchJSON(`https://api.lever.co/v0/postings/${slug}?mode=json`);
    for (const j of d || []) {
      if (done()) break;
      const loc = [j.categories?.location, ...(j.categories?.allLocations || []), j.workplaceType, j.country].filter(Boolean).join(' · ');
      if (j.workplaceType !== 'remote' && !REMOTEISH.test(loc)) continue;
      out.push(job({ source: `ats:${ats}`, external_id: j.id, url: j.hostedUrl, apply_url: j.applyUrl, company: slug, title: j.text, location: loc, description: htmlToText([j.descriptionPlain || j.description, ...(j.lists || []).map((l) => `${l.text}\n${htmlToText(l.content)}`), j.additionalPlain].join('\n')), posted_at: j.createdAt, tags: [j.categories?.team, j.categories?.commitment] }));
    }
  } else if (ats === 'ashby') {
    const d = await fetchJSON(`https://api.ashbyhq.com/posting-api/job-board/${slug}?includeCompensation=true`);
    for (const j of d.jobs || []) {
      const loc = [j.location, ...(j.secondaryLocations || []).map((l) => l.location), j.workplaceType].filter(Boolean).join(' · ');
      if (!j.isRemote && j.workplaceType !== 'Remote' && !REMOTEISH.test(loc)) continue;
      out.push(job({ source: `ats:${ats}`, external_id: j.id, url: j.jobUrl, apply_url: j.applyUrl, company: slug, title: j.title, location: loc, description: j.descriptionPlain || htmlToText(j.descriptionHtml), posted_at: j.publishedAt, salary: j.compensation?.scrapeableCompensationSalarySummary, tags: [j.department, j.team, j.employmentType] }));
    }
  } else if (ats === 'recruitee') {
    const d = await fetchJSON(`https://${slug}.recruitee.com/api/offers/`);
    for (const j of d.offers || []) {
      if (!j.remote && !REMOTEISH.test(`${j.location} ${j.title}`)) continue;
      out.push(job({ source: `ats:${ats}`, external_id: j.id, url: j.careers_url, apply_url: j.careers_apply_url, company: j.company_name || slug, title: j.title, location: `${j.location || ''}${j.remote ? ' (remote)' : ''}`, description: htmlToText(`${j.description}\n${j.requirements}`), posted_at: j.published_at }));
    }
  } else if (ats === 'workable') {
    const d = await fetchJSON(`https://apply.workable.com/api/v1/widget/accounts/${slug}`);
    for (const j of d.jobs || []) {
      if (!j.telecommuting && !REMOTEISH.test(`${j.city} ${j.country} ${j.title}`)) continue;
      out.push(job({ source: `ats:${ats}`, external_id: j.shortcode, url: j.url || j.shortlink, apply_url: j.application_url || j.url, company: d.name || slug, title: j.title, location: [j.city, j.country, j.telecommuting ? 'remote' : ''].filter(Boolean).join(', '), description: htmlToText(j.description || ''), posted_at: j.published_on || j.created_at }));
    }
  } else if (ats === 'personio') {
    const xml = await fetchText(`https://${slug}.jobs.personio.de/xml`);
    for (const b of xml.match(/<position>[\s\S]*?<\/position>/g) || []) {
      const t = (k) => ((b.match(new RegExp(`<${k}>([\\s\\S]*?)<\\/${k}>`)) || [])[1] || '').replace(/^<!\[CDATA\[|\]\]>$/g, '');
      const loc = `${t('office')} ${t('additionalOffices')}`;
      const desc = htmlToText(b.replace(/<name>[\s\S]*?<\/name>/g, ''));
      if (!REMOTEISH.test(`${loc} ${t('name')} ${desc.slice(0, 800)}`)) continue;
      out.push(job({ source: `ats:${ats}`, external_id: t('id'), url: `https://${slug}.jobs.personio.de/job/${t('id')}`, company: t('subcompany') || slug, title: t('name'), location: loc, description: desc, posted_at: t('createdAt') }));
    }
  } else if (ats === 'teamtailor') {
    const items = parseRSS(await fetchText(`https://${slug}.teamtailor.com/jobs.rss`));
    for (const i of items) {
      const desc = htmlToText(i.description);
      if (!REMOTEISH.test(`${i.title} ${desc.slice(0, 1200)}`)) continue;
      out.push(job({ source: `ats:${ats}`, external_id: i.guid, url: i.link, company: slug, title: i.title, description: desc, posted_at: i.pubDate }));
    }
  } else if (ats === 'breezy') {
    const d = await fetchJSON(`https://${slug}.breezy.hr/json`);
    for (const j of d || []) {
      const loc = [j.location?.name, j.location?.is_remote ? 'remote' : ''].filter(Boolean).join(' ');
      if (!j.location?.is_remote && !REMOTEISH.test(loc)) continue;
      out.push(job({ source: `ats:${ats}`, external_id: j.id, url: j.url, company: j.company?.name || slug, title: j.name, location: loc, description: '', posted_at: j.published_date }));
    }
  } else if (ats === 'smartrecruiters') {
    const d = await fetchJSON(`https://api.smartrecruiters.com/v1/companies/${slug}/postings?limit=100`);
    for (const j of d.content || []) {
      if (!j.location?.remote && !REMOTEISH.test(JSON.stringify(j.location || {}))) continue;
      out.push(job({ source: `ats:${ats}`, external_id: j.id, url: `https://jobs.smartrecruiters.com/${slug}/${j.id}`, company: j.company?.name || slug, title: j.name, location: [j.location?.city, j.location?.country, j.location?.remote ? 'remote' : ''].filter(Boolean).join(', '), description: '', posted_at: j.releasedDate }));
    }
  }
  return out;
}
