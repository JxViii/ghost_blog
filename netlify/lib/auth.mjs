// Session handling shared by every function.
//
// Env vars:
//   ADMIN_PASSWORD   password for the editor / post manager
//   READER_PASSWORD  password shared with everyone you give access to
//
// Changing a password logs out everyone who used it.
// The key that signs the cookies is generated once and kept in Netlify Blobs.

import { getStore } from "@netlify/blobs";

const COOKIE_NAME = "session";
const READER_MAX_AGE = 60 * 60 * 24 * 30; // 30 days
const ADMIN_MAX_AGE = 60 * 60 * 12;       // 12 hours

const encoder = new TextEncoder();

const toBase64Url = (bytes) =>
  btoa(String.fromCharCode(...new Uint8Array(bytes)))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

const fromBase64Url = (str) => {
  const b64 = str.replace(/-/g, "+").replace(/_/g, "/");
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
};

async function getSecret() {
  const store = getStore({ name: "auth-config", consistency: "strong" });

  let stored = await store.get("session-secret", { type: "json" });
  if (!stored) {
    const secret = toBase64Url(crypto.getRandomValues(new Uint8Array(48)));
    // onlyIfNew: if two requests race on the first run, both end up using the same secret
    await store.setJSON("session-secret", { secret }, { onlyIfNew: true });
    stored = await store.get("session-secret", { type: "json" });
  }

  if (!stored?.secret) throw new Error("Couldn't load the session secret");
  return stored.secret;
}

let keyPromise = null;
function getKey() {
  keyPromise ??= getSecret()
    .then((secret) => crypto.subtle.importKey(
      "raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]
    ))
    .catch((e) => { keyPromise = null; throw e; });
  return keyPromise;
}

async function hmac(data) {
  return new Uint8Array(await crypto.subtle.sign("HMAC", await getKey(), encoder.encode(data)));
}

// Constant time comparison of two strings (hashing first makes lengths equal)
async function safeEqual(a, b) {
  const [ha, hb] = await Promise.all([hmac(`cmp:${a}`), hmac(`cmp:${b}`)]);
  let diff = 0;
  for (let i = 0; i < ha.length; i++) diff |= ha[i] ^ hb[i];
  return diff === 0;
}

// Fingerprint of the password stored in the cookie, so a password change revokes sessions
async function fingerprint(password) {
  return toBase64Url((await hmac(`fp:${password}`)).slice(0, 16));
}

function getAccounts() {
  const accounts = [];

  const admin = Netlify.env.get("ADMIN_PASSWORD");
  if (admin) accounts.push({ name: "admin", role: "admin", password: admin });

  const reader = Netlify.env.get("READER_PASSWORD");
  if (reader) accounts.push({ name: "reader", role: "reader", password: reader });

  return accounts;
}

export async function findAccount(password) {
  if (typeof password !== "string" || !password) return null;

  // Check every account so the response time doesn't reveal anything
  let match = null;
  for (const account of getAccounts()) {
    if (await safeEqual(password, account.password) && !match) match = account;
  }
  return match;
}

export async function createSessionCookie(account) {
  const maxAge = account.role === "admin" ? ADMIN_MAX_AGE : READER_MAX_AGE;
  const payload = toBase64Url(encoder.encode(JSON.stringify({
    n: account.name,
    r: account.role,
    v: await fingerprint(account.password),
    exp: Math.floor(Date.now() / 1000) + maxAge,
  })));
  const token = `${payload}.${toBase64Url(await hmac(payload))}`;
  return `${COOKIE_NAME}=${token}; Path=/; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Strict`;
}

export function clearSessionCookie() {
  return `${COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict`;
}

function readCookie(request) {
  const header = request.headers.get("cookie") ?? "";
  for (const part of header.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === COOKIE_NAME) return rest.join("=");
  }
  return null;
}

// Returns { name, role } for a valid session, null otherwise
export async function getSession(request) {
  const token = readCookie(request);
  if (!token) return null;

  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  try {
    const valid = await crypto.subtle.verify(
      "HMAC", await getKey(), fromBase64Url(signature), encoder.encode(payload)
    );
    if (!valid) return null;

    const { n, r, v, exp } = JSON.parse(new TextDecoder().decode(fromBase64Url(payload)));
    if (typeof exp !== "number" || exp < Date.now() / 1000) return null;

    // The account must still exist with the same password and role
    const account = getAccounts().find((a) => a.name === n && a.role === r);
    if (!account || v !== await fingerprint(account.password)) return null;

    return { name: account.name, role: account.role };
  } catch {
    return null;
  }
}

// Blocks requests coming from other sites (defense in depth on top of SameSite=Strict)
export function isCrossSite(request) {
  const site = request.headers.get("sec-fetch-site");
  return site !== null && site !== "same-origin" && site !== "none";
}

export const noStore = { "Cache-Control": "private, no-store", "Vary": "Cookie" };

// Returns a Response if the request is not allowed, null if it can continue
export async function requireRole(request, role) {
  if (request.method !== "GET" && isCrossSite(request))
    return Response.json({ error: "Forbidden" }, { status: 403, headers: noStore });

  const session = await getSession(request);
  if (!session)
    return Response.json({ error: "Login required" }, { status: 401, headers: noStore });

  if (role === "admin" && session.role !== "admin")
    return Response.json({ error: "Admin only" }, { status: 403, headers: noStore });

  return null;
}
