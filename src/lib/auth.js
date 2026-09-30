// Panel girişi: PBKDF2 parola özeti (D1 secrets), HMAC imzalı oturum çerezi, IP başına deneme sınırı.
import { getSecret, setSecret } from './db.js';
import { b64, now } from './util.js';

const enc = new TextEncoder();
const COOKIE = 'ajan_oturum';
const SESSION_DAYS = 30;

function fromB64(s) { return Uint8Array.from(atob(s), (c) => c.charCodeAt(0)); }
function b64url(buf) { return b64(buf).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }

export async function hashPassword(password, iterations = 100000) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations }, key, 256);
  return `pbkdf2$${iterations}$${b64(salt)}$${b64(bits)}`;
}

async function verifyPassword(password, stored) {
  const [alg, it, saltB, hashB] = String(stored).split('$');
  if (alg !== 'pbkdf2') return false;
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = new Uint8Array(await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: fromB64(saltB), iterations: Number(it) }, key, 256));
  const want = fromB64(hashB);
  if (bits.length !== want.length) return false;
  let diff = 0;
  for (let i = 0; i < bits.length; i++) diff |= bits[i] ^ want[i];
  return diff === 0;
}

async function sessionKey(env) {
  let k = await getSecret(env, 'session_key');
  if (!k) {
    k = b64(crypto.getRandomValues(new Uint8Array(32)));
    await setSecret(env, 'session_key', k);
  }
  return crypto.subtle.importKey('raw', fromB64(k), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}

async function sign(env, payload) {
  const key = await sessionKey(env);
  const body = b64url(enc.encode(JSON.stringify(payload)));
  const sig = b64url(await crypto.subtle.sign('HMAC', key, enc.encode(body)));
  return `${body}.${sig}`;
}

// E-postadaki tek tıklık bağlantılar için imza (ör. "başvuruyu yeniden başlat ve canlı devral")
export async function signLink(env, payload) { return sign(env, payload); }
export async function verifyLink(env, token) {
  const [body, sig] = String(token || '').split('.');
  if (!body || !sig) return null;
  const key = await sessionKey(env);
  const un = (x) => Uint8Array.from(atob(x.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((x.length + 3) % 4)), (c) => c.charCodeAt(0));
  if (!(await crypto.subtle.verify('HMAC', key, un(sig), enc.encode(body)))) return null;
  try { const p = JSON.parse(new TextDecoder().decode(un(body))); return p.exp && p.exp < now() ? null : p; } catch (e) { return null; }
}

export async function readSession(env, request) {
  const cookie = request.headers.get('cookie') || '';
  const m = cookie.match(new RegExp(`${COOKIE}=([^;]+)`));
  if (!m) return null;
  const [body, sig] = m[1].split('.');
  if (!body || !sig) return null;
  const key = await sessionKey(env);
  const ok = await crypto.subtle.verify('HMAC', key, Uint8Array.from(atob(sig.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((sig.length + 3) % 4)), (c) => c.charCodeAt(0)), enc.encode(body));
  if (!ok) return null;
  try {
    const p = JSON.parse(new TextDecoder().decode(fromB64(body.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((body.length + 3) % 4))));
    const epoch = Number((await getSecret(env, 'session_epoch')) || 0);
    if (p.exp < now() || (p.epoch || 0) < epoch) return null;
    return p;
  } catch (e) { return null; }
}

export async function login(env, request) {
  const ip = request.headers.get('cf-connecting-ip') || 'x';
  const recent = await env.DB.prepare('SELECT COUNT(*) n FROM logins WHERE ip=? AND ok=0 AND ts>?').bind(ip, now() - 15 * 60000).first();
  if ((recent?.n || 0) >= 8) return { ok: false, status: 429, error: 'Çok fazla hatalı deneme. 15 dakika sonra tekrar dene.' };
  let password = '';
  try { password = String((await request.json()).password || ''); } catch (e) { /* boş */ }
  const stored = await getSecret(env, 'password_hash');
  const ok = !!stored && password.length > 0 && (await verifyPassword(password, stored));
  await env.DB.prepare('INSERT INTO logins (ip, ts, ok) VALUES (?, ?, ?)').bind(ip, now(), ok ? 1 : 0).run();
  if (!ok) return { ok: false, status: 401, error: stored ? 'Parola yanlış.' : 'Parola henüz tanımlanmadı.' };
  const epoch = Number((await getSecret(env, 'session_epoch')) || 0);
  const token = await sign(env, { u: 'ozgur', exp: now() + SESSION_DAYS * 86400000, epoch });
  return { ok: true, cookie: `${COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${SESSION_DAYS * 86400}` };
}

export function logoutCookie() {
  return `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

// Hesap parolalarını (iş sitelerinde açılan hesaplar) saklamak için AES-GCM
async function vaultKey(env) {
  let k = await getSecret(env, 'vault_key');
  if (!k) { k = b64(crypto.getRandomValues(new Uint8Array(32))); await setSecret(env, 'vault_key', k); }
  return crypto.subtle.importKey('raw', fromB64(k), 'AES-GCM', false, ['encrypt', 'decrypt']);
}
export async function seal(env, text) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await vaultKey(env), enc.encode(text));
  return `${b64(iv)}.${b64(ct)}`;
}
export async function unseal(env, sealed) {
  if (!sealed) return null;
  const [iv, ct] = sealed.split('.');
  const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: fromB64(iv) }, await vaultKey(env), fromB64(ct));
  return new TextDecoder().decode(pt);
}
export function strongPassword() {
  const a = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
  const b = crypto.getRandomValues(new Uint8Array(18));
  return [...b].map((x) => a[x % a.length]).join('') + '!7a';
}
