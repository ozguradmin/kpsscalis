// Worker ortamının Node taklidi: D1 (node:sqlite), Workers AI (REST), R2 (bellek), e-posta ve workflow taklitleri.
import { DatabaseSync } from 'node:sqlite';
const ACC = '3c39c225b3a27de7822833feb24b65b1';

function d1(file = ':memory:') {
  const db = new DatabaseSync(file);
  const norm = (v) => (v === undefined ? null : typeof v === 'boolean' ? (v ? 1 : 0) : v);
  const mk = (sql, args = []) => {
    // D1 ?1 ?2 numaralı parametrelerini destekle
    const numbered = /\?\d+/.test(sql);
    const bindArgs = () => {
      if (!numbered) return args.map(norm);
      const o = {}; args.forEach((v, i) => { o[String(i + 1)] = norm(v); });
      return [o];
    };
    const stmt = () => db.prepare(numbered ? sql.replace(/\?(\d+)/g, ':$1') : sql);
    return {
      bind: (...a) => mk(sql, a),
      first: async (col) => { const r = stmt().get(...bindArgs()); return r ? (col ? r[col] : { ...r }) : null; },
      all: async () => ({ results: stmt().all(...bindArgs()).map((r) => ({ ...r })), success: true }),
      run: async () => { const r = stmt().run(...bindArgs()); return { success: true, meta: { changes: Number(r.changes), last_row_id: Number(r.lastInsertRowid) } }; },
      _exec: () => { const r = stmt().run(...bindArgs()); return { success: true, meta: { changes: Number(r.changes) } }; },
    };
  };
  return {
    prepare: (sql) => mk(sql),
    batch: async (stmts) => { db.exec('BEGIN'); try { const out = stmts.map((s) => s._exec()); db.exec('COMMIT'); return out; } catch (e) { db.exec('ROLLBACK'); throw e; } },
    exec: async (sql) => db.exec(sql),
    _db: db,
  };
}

function r2() {
  const m = new Map();
  return {
    put: async (k, v, o = {}) => { const buf = typeof v === 'string' ? Buffer.from(v) : Buffer.from(v instanceof ArrayBuffer ? new Uint8Array(v) : v); m.set(k, { buf, o, uploaded: new Date() }); },
    get: async (k) => { const x = m.get(k); if (!x) return null; return { body: x.buf, uploaded: x.uploaded, httpMetadata: x.o.httpMetadata, arrayBuffer: async () => x.buf.buffer.slice(x.buf.byteOffset, x.buf.byteOffset + x.buf.length), json: async () => JSON.parse(x.buf.toString()), text: async () => x.buf.toString() }; },
    list: async ({ prefix = '' } = {}) => ({ objects: [...m.keys()].filter((k) => k.startsWith(prefix)).map((key) => ({ key })), truncated: false }),
    delete: async (ks) => { for (const k of [].concat(ks)) m.delete(k); },
    _m: m,
  };
}

export function makeEnv({ dbFile = ':memory:' } = {}) {
  const TOKEN = process.env.CF_TOKEN;
  const mail = d1();
  mail._db.exec(`CREATE TABLE messages (id TEXT PRIMARY KEY, thread_id TEXT, folder TEXT, direction TEXT, from_address TEXT, from_name TEXT, to_json TEXT DEFAULT '[]', cc_json TEXT DEFAULT '[]', reply_to_address TEXT, subject TEXT, preview TEXT DEFAULT '', text_body TEXT DEFAULT '', html_body TEXT DEFAULT '', rfc_message_id TEXT, in_reply_to TEXT, received_at TEXT, is_read INTEGER DEFAULT 0, is_starred INTEGER DEFAULT 0, created_at TEXT, delivery_status TEXT, provider_message_id TEXT)`);
  const sent = [];
  return {
    DB: d1(dbFile),
    MAILDB: mail,
    OLDDB: null,
    R2: r2(),
    AI: { run: async (model, body) => {
      for (let i = 0; i < 3; i++) {
        const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${ACC}/ai/run/${model}`, { method: 'POST', headers: { authorization: `Bearer ${TOKEN}`, 'content-type': 'application/json' }, body: JSON.stringify(body) });
        const j = await res.json().catch(() => ({}));
        if (res.ok) return j.result;
        if (i === 2 || ![429, 500, 502, 503, 504].includes(res.status)) throw new Error(`AI ${res.status} ${JSON.stringify(j.errors || j).slice(0, 200)}`);
        await new Promise((r) => setTimeout(r, 2500 * (i + 1)));
      }
    } },
    TYPESAFE_KEY: process.env.TYPESAFE_KEY,
    BROWSER: {},
    APPLY: { create: async ({ id, params }) => ({ id, params }) },
    EMAIL: { send: async (m) => { sent.push(m); return { messageId: 'test-' + sent.length }; } },
    ASSETS: { fetch: async () => new Response('assets') },
    _sent: sent,
  };
}
