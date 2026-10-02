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

async function workableDirect(params, pages) {
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
// Workable, Cloudflare Workers'tan gelen doğrudan istekleri reddediyor; o zaman tek tarayıcı oturumunda sitenin kendi sayfasından ararız
async function workableSearchAll(env, searches) {
  const res = [];
  let directOk = true;
  for (const [params, pages] of searches) {
    if (!directOk) break;
    try { res.push(...(await workableDirect(params, pages))); } catch (e) { directOk = false; }
  }
  if (directOk || !env?.BROWSER) return res;
  const { default: puppeteer } = await import('@cloudflare/puppeteer');
  const browser = await puppeteer.launch(env.BROWSER);
  try {
    const page = await browser.newPage();
    await page.goto('https://jobs.workable.com/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    return await page.evaluate(async (searches) => {
      const out = [];
      for (const [params, pages] of searches) {
        let token = '';
        for (let p = 0; p < pages; p++) {
          const qs = new URLSearchParams({ workplace: 'remote', ...params, ...(token ? { pageToken: token } : {}) });
          const r = await fetch('/api/v1/jobs?' + qs);
          if (!r.ok) break;
          const d = await r.json();
          out.push(...(d.jobs || []));
          token = d.nextPageToken;
          if (!token) break;
        }
      }
      return out;
    }, searches);
  } finally { await browser.close().catch(() => {}); }
}
const workableJob = (source, j) => job({ source, external_id: j.id, url: j.url, company: j.company?.title, title: j.title,
  location: [...(j.locations || []).filter((l) => l !== 'TELECOMMUTE'), 'remote'].join(' · '),
  description: htmlToText([j.description, j.requirementsSection, j.benefitsSection].join('\n')), tags: [j.department, j.employmentType],
  posted_at: j.created, lang: /^[a-z]{2}$/.test(j.language || '') ? j.language : undefined, remote_hint: 'remote' });


// ---------- Y Combinator girişimleri + şirketlerin kendi siteleri ----------
const YC_PAGE = (h) => { const m = String(h).match(/data-page="([^"]+)"/); if (!m) return null; try { return JSON.parse(m[1].replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')); } catch (e) { return null; } };
const HIRING_MAIL = /\b((?:jobs|careers|career|hiring|join|talent|recruiting|recruitment|work|hr|apply|kariyer|ik)@[a-z0-9.-]+\.[a-z]{2,})\b/i;
const CAREER_LINK = /href="([^"]*(?:careers?|jobs|join-us|joinus|work-with-us|we-are-hiring|hiring|kariyer)[^"]*)"/i;

// Şirketin kendi sitesinden kariyer sayfasını, ATS panosunu ve işe alım e-postasını bul
export async function scanCompanySite(website) {
  const out = { ats: [], email: null, careers: null };
  if (!website) return out;
  let base; try { base = new URL(/^https?:/.test(website) ? website : `https://${website}`); } catch (e) { return out; }
  const pages = [base.href];
  try {
    const home = await fetchText(base.href, {}, 12000);
    const cl = home.match(CAREER_LINK);
    if (cl) { try { const u = new URL(cl[1], base); if (u.hostname.endsWith(base.hostname.replace(/^www\./, '')) || detectATS(u.href)) pages.push(u.href); } catch (e) { /* */ } }
    for (const h of [home]) scanHtml(h);
    if (pages[1]) { out.careers = pages[1]; if (!detectATS(pages[1])) scanHtml(await fetchText(pages[1], {}, 12000).catch(() => '')); }
  } catch (e) { /* site açılmadı */ }
  return out;
  function scanHtml(h) {
    for (const m of String(h).matchAll(/https?:\/\/[^\s"'<>]+/g)) { const a = detectATS(m[0]); if (a && !out.ats.some((x) => x.slug === a.slug && x.ats === a.ats)) out.ats.push(a); }
    const e = String(h).match(HIRING_MAIL); if (e && !out.email) out.email = e[1].toLowerCase();
  }
}

// Şirket adından ATS panosunu tahmin et: greenhouse/lever/ashby/workable/recruitee slug denemeleri (her şirket bir kez denenir)
// YC başvuru bağlantısı (account.ycombinator.com/authenticate?…signup_job_id=N) yerine doğrudan Work at a Startup ilan sayfası:
// kayıtlı WaaS oturumuyla "Apply" → kısa mesaj kutusu. Giriş sayfası Browser Run'ı bot sayıp reddediyor.
export function waasUrl(u) {
  const m = String(u || '').match(/signup_job_id(?:%3D|=)(\d+)/i);
  return m ? `https://www.workatastartup.com/jobs/${m[1]}` : u;
}

export async function probeCompanyBoards(env, companies, from, max = 12) {
  const key = 'cache/ats_probe.json';
  const obj = await env.R2.get(key);
  const tried = obj ? await obj.json() : {};
  let n = 0, found = 0;
  for (const [name, hint] of companies) {
    if (n >= max) break;
    const base = String(name || '').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/\b(inc|llc|ltd|gmbh|corp|co|sa|s\.a|bv|ag|limited|technologies|technology)\b\.?/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
    if (!base || tried[base] || FAMOUS.test(name)) continue;
    n++;
    const slugs = [...new Set([hint, base.replace(/ /g, ''), base.replace(/ /g, '-')].filter(Boolean))].slice(0, 3);
    let hit = null;
    for (const slug of slugs) {
      const checks = [
        ['greenhouse', `https://boards-api.greenhouse.io/v1/boards/${slug}/jobs`, (d) => Array.isArray(d.jobs)],
        ['lever', `https://api.lever.co/v0/postings/${slug}?mode=json&limit=1`, (d) => Array.isArray(d)],
        ['ashby', `https://api.ashbyhq.com/posting-api/job-board/${slug}`, (d) => Array.isArray(d.jobs)],
        ['workable', `https://apply.workable.com/api/v1/widget/accounts/${slug}`, (d) => Array.isArray(d.jobs)],
        ['recruitee', `https://${slug}.recruitee.com/api/offers/`, (d) => Array.isArray(d.offers)],
      ];
      for (const [ats, u, ok] of checks) {
        try { const d = await fetchJSON(u, {}, 8000); if (ok(d)) { hit = { ats, slug }; break; } } catch (e) { /* yok */ }
      }
      if (hit) break;
    }
    tried[base] = hit ? `${hit.ats}:${hit.slug}` : '-';
    if (hit) { found++; await env.DB.prepare('INSERT OR IGNORE INTO boards (id, ats, slug, company, added_at, added_from) VALUES (?,?,?,?,?,?)').bind(`${hit.ats}:${hit.slug}`, hit.ats, hit.slug, name, Date.now(), from).run(); }
  }
  await env.R2.put(key, JSON.stringify(tried), { httpMetadata: { contentType: 'application/json' } });
  return { probed: n, found };
}

export const SOURCES = [
  {
    // YC'nin herkese açık girişim listesi: küçük, uzaktan çalışan, işe alım yapan şirketler. Her turda 20 şirket; ilanları + kendi siteleri
    id: 'yc', label: 'Y Combinator girişimleri (küçük ekip, uzaktan)', cadence: 60, lang: 'en',
    async fetch(env) {
      let list = null;
      const c = await env.R2.get('cache/yc_hiring.json');
      if (c && Date.now() - new Date(c.uploaded).getTime() < 86400000) list = await c.json();
      else {
        const all = await fetchJSON('https://yc-oss.github.io/api/companies/hiring.json', {}, 45000);
        list = all.filter((x) => x.status === 'Active' && (x.team_size || 0) <= 80 && (x.regions || []).some((r) => /remote/i.test(r)))
          .map((x) => ({ slug: x.slug, name: x.name, website: x.website, one: x.one_liner, size: x.team_size, batch: x.batch, full: (x.regions || []).includes('Fully Remote'), regions: x.regions }))
          .sort((a, b) => (b.full - a.full) || String(b.batch).localeCompare(String(a.batch)));
        await env.R2.put('cache/yc_hiring.json', JSON.stringify(list), { httpMetadata: { contentType: 'application/json' } });
      }
      const row = await env.DB.prepare("SELECT value FROM settings WHERE key='yc_cursor'").first();
      let cur = Number(row ? JSON.parse(row.value) : 0) || 0;
      if (cur >= list.length) cur = 0;
      const batch = list.slice(cur, cur + 20);
      await env.DB.prepare("INSERT INTO settings (key, value, updated_at, updated_by) VALUES ('yc_cursor', ?1, ?2, 'yc') ON CONFLICT(key) DO UPDATE SET value=?1, updated_at=?2").bind(JSON.stringify(cur + batch.length), Date.now()).run();
      const out = [];
      for (let i = 0; i < batch.length; i += 5) {
        await Promise.all(batch.slice(i, i + 5).map(async (co) => {
          try {
            const pg = YC_PAGE(await fetchText(`https://www.ycombinator.com/companies/${co.slug}/jobs`, {}, 15000));
            const posts = (pg?.props?.jobPostings || []).filter((j) => {
              const loc = j.location || '';
              if (!/remote/i.test(loc) && !(co.full && !loc)) return false;
              // "Remote (US; CA)" gibi ülke listeli ilanlarda Türkiye/Avrupa/dünya geçmiyorsa atla
              const lim = loc.match(/Remote \(([^)]*)\)/i);
              return !lim || /\b(TR|Turkey|Türkiye|EMEA|Europe|EU|Worldwide|Anywhere|Global)\b/i.test(lim[1]);
            });
            for (const j of posts.slice(0, 4)) {
              const d = YC_PAGE(await fetchText(`https://www.ycombinator.com${j.url}`, {}, 15000).catch(() => ''));
              const jj = d?.props?.job || j;
              out.push(job({ source: 'yc', external_id: j.id, url: `https://www.ycombinator.com${j.url}`, apply_url: waasUrl(jj.applyUrl || j.applyUrl), company: co.name, title: j.title,
                location: `${j.location || 'Remote'}${co.full ? ' · fully remote company' : ''}`,
                description: `${co.name} (YC ${co.batch}, ${co.size || '?'} people): ${co.one || ''}\nRole: ${j.prettyRole || ''} ${j.roleSpecificType || ''} · ${j.type || ''} · min experience ${j.minExperience || '-'} · visa: ${j.visa || '-'}\n${jj.description || ''}`,
                salary: j.salaryRange || null, tags: [j.role, j.roleSpecificType], remote_hint: 'remote' }));
            }
            // Şirketin kendi sitesi: ATS panosu (başka ilanlar) ya da işe alım e-postası (açık başvuru)
            const site = await scanCompanySite(co.website);
            for (const a of site.ats) await env.DB.prepare('INSERT OR IGNORE INTO boards (id, ats, slug, company, added_at, added_from) VALUES (?,?,?,?,?,?)').bind(`${a.ats}:${a.slug}`, a.ats, a.slug, co.name, Date.now(), 'yc-site').run();
            if (!posts.length && !site.ats.length && site.email && co.full) {
              out.push(job({ source: 'yc', external_id: `open:${co.slug}`, url: site.careers || co.website, apply_url: `mailto:${site.email}`, company: co.name, title: 'Open application (remote)',
                location: 'Remote (fully remote company)', description: `${co.name} (YC ${co.batch}, ${co.size || '?'} people) is a fully remote startup: ${co.one || ''}\nNo specific opening is listed, but the company publishes a hiring address (${site.email}) on its website. An open application by email is possible.\nRegions: ${(co.regions || []).join(', ')}`, remote_hint: 'remote' }));
            }
          } catch (e) { /* bu şirket atlandı */ }
        }));
      }
      return out;
    },
  },
  {
    // Workable'ın küresel araması: çoğu küçük/orta şirket; "Türkiye" konumlu uzaktan ilanlar doğrudan Türkiye'den işe alır
    id: 'workable_tr', label: 'Workable — Türkiye\'den uzaktan', cadence: 120, lang: 'en',
    async fetch(env) {
      const seen = new Set(), out = [];
      const jobs = await workableSearchAll(env, [[{ location: 'Turkey' }, 7], ...['developer', 'yazılım', 'content', 'AI'].map((q) => [{ location: 'Turkey', query: q }, 1])]);
      for (const j of jobs) {
        if (seen.has(j.id)) continue;
        seen.add(j.id);
        out.push({ ...workableJob('workable_tr', j), location: `${(j.locations || []).filter((l) => l !== 'TELECOMMUTE').join(' · ')} · remote (Türkiye'den)` });
      }
      if (!out.length) throw new Error('Workable yanıt vermedi');
      return out;
    },
  },
  {
    id: 'workable', label: 'Workable küresel (çok dilli, küçük şirketler)', cadence: 240, lang: 'en',
    async fetch(env) {
      const seen = new Set(), out = [];
      for (const j of await workableSearchAll(env, WORKABLE_Q.filter(Boolean).map((q) => [{ query: q }, 1]))) {
        if (seen.has(j.id) || Date.now() - Date.parse(j.created) > 21 * 86400000) continue;
        seen.add(j.id);
        out.push(workableJob('workable', j));
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
    // Himalayas araması "Türkiye'den başvurulabilir" filtresiyle: bölge kısıtlı ilanlar baştan gelmez.
    // İlanı açan şirketin kendi başvuru sistemi (Greenhouse/Lever/Ashby/Workable/Recruitee) bulunursa pano olarak eklenir; ajan Himalayas girişine takılmadan oradan başvurur.
    id: 'himalayas', label: 'Himalayas — Türkiye\'ye açık ilanlar', cadence: 120, lang: 'en',
    async fetch(env) {
      const seen = new Map();
      const QS = ['developer', 'frontend', 'react', 'full stack', 'javascript', 'typescript', 'mobile', 'AI trainer', 'AI', 'content', 'social media', 'qa', 'turkish', 'support', ''];
      for (const q of QS) {
        for (let off = 0; off < (q ? 40 : 100); off += 20) {
          const d = await fetchJSON(`https://himalayas.app/jobs/api/search?country=Turkey&limit=20&offset=${off}${q ? `&q=${encodeURIComponent(q)}` : ''}`).catch(() => null);
          const list = d?.jobs || [];
          for (const j of list) if (!seen.has(j.guid)) seen.set(j.guid, j);
          if (list.length < 20) break;
        }
      }
      const out = [];
      for (const j of seen.values()) {
        if (j.pubDate && Date.now() - j.pubDate * 1000 > 40 * 86400000) continue;
        const lr = j.locationRestrictions || [];
        out.push(job({ source: 'himalayas', external_id: j.guid, url: j.applicationLink || j.guid, company: j.companyName, title: j.title,
          location: lr.length ? `Remote — Türkiye dahil ${lr.length} ülke${lr.length <= 6 ? ': ' + lr.join(', ') : ''}` : 'Remote (worldwide, Türkiye dahil)',
          description: htmlToText(j.description), salary: j.minSalary ? `${j.minSalary}-${j.maxSalary} ${j.currency || ''}/${j.salaryPeriod || ''}` : null,
          tags: [...(j.categories || []), j.employmentType, j.seniority, `himalayas:${j.companySlug || ''}`], posted_at: j.pubDate, remote_hint: 'remote' }));
      }
      if (env) await probeCompanyBoards(env, [...new Map(out.map((o) => [o.company, (o.tags || '').match(/himalayas:([a-z0-9-]+)/)?.[1] || ''])).entries()], 'himalayas-tr').catch(() => {});
      return out;
    },
  },
  {
    id: 'jobicy', label: 'Jobicy', cadence: 240, lang: 'en',
    async fetch() {
      const d = await fetchJSON('https://jobicy.com/api/v2/remote-jobs?count=100&geo=turkiye');
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
        // HN metni uzun bağlantıları "…" ile kısaltır; gerçek adresler href'lerde
        const hrefs = [...String(h.comment_text || '').matchAll(/href="([^"]+)"/g)].map((m) => m[1].replace(/&#x2F;/g, '/').replace(/&amp;/g, '&').replace(/&#x3D;/g, '=').replace(/&#x3F;/g, '?'));
        const text = htmlToText(h.comment_text || '', 6000) + (hrefs.length ? `\nLinks: ${[...new Set(hrefs)].join(' ')}` : '');
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
