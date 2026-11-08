import { readFileSync } from 'node:fs';
import { normalizeHost } from './domain.js';

const dataDir = new URL('../data/', import.meta.url);
const VENDORS = JSON.parse(readFileSync(new URL('vendors.json', dataDir), 'utf8'));

let OCD = { cookies: [] };
try {
  OCD = JSON.parse(readFileSync(new URL('open-cookie-database/cookies.json', dataDir), 'utf8'));
} catch {
  // The cookie table is optional. Without it, cookies are identified by vendor host only.
}

const withPaths = VENDORS.vendors.filter((v) => v.paths && v.paths.length);
const withoutPaths = VENDORS.vendors.filter((v) => !v.paths || !v.paths.length);
const firstPartyPathVendors = VENDORS.vendors.filter((v) => v.firstPartyPaths && v.firstPartyPaths.length);

const exactCookies = new Map();
const prefixCookies = [];
for (const [name, platform, category, wildcard] of OCD.cookies) {
  const entry = { name, platform, category, wildcard: !!wildcard };
  // Short wildcard prefixes such as "_s" or "tp" would match unrelated cookies
  // and report them as trackers. Keep a prefix only when it is long enough or
  // ends in a separator.
  if (wildcard) { if (name.length >= 4 || /[_\-.]$/.test(name)) prefixCookies.push(entry); }
  else if (!exactCookies.has(name)) exactCookies.set(name, entry);
}
prefixCookies.sort((a, b) => b.name.length - a.name.length);

export const TRACKER_PURPOSES = new Set(['analytics', 'advertising', 'session-replay']);

const hostMatches = (host, h) => host === h || host.endsWith('.' + h);

/** @param {string} host */
export function identifyHost(host) {
  const h = normalizeHost(host);
  return withoutPaths.find((v) => v.hosts.some((x) => hostMatches(h, x)))
    || withPaths.find((v) => v.hosts.some((x) => hostMatches(h, x)))
    || null;
}

/**
 * Identify the vendor behind a request URL. Vendors that share a host with
 * another service (Google) are told apart by path.
 * @param {string} url
 * @param {string} [siteHost] the scanned site, for first-party vendor paths
 */
export function identifyUrl(url, siteHost) {
  let u;
  try { u = new URL(url); } catch { return null; }
  const host = normalizeHost(u.hostname);
  if (siteHost && (host === normalizeHost(siteHost) || host.endsWith('.' + normalizeHost(siteHost)))) {
    return firstPartyPathVendors.find((v) => v.firstPartyPaths.some((p) => u.pathname.startsWith(p))) || null;
  }
  for (const v of withPaths) {
    if (v.hosts.some((h) => hostMatches(host, h)) && v.paths.some((p) => u.pathname.startsWith(p))) return v;
  }
  return withoutPaths.find((v) => v.hosts.some((h) => hostMatches(host, h))) || null;
}

/** Look a cookie name up in the Open Cookie Database table. */
export function identifyCookie(name) {
  if (exactCookies.has(name)) return exactCookies.get(name);
  return prefixCookies.find((c) => name.startsWith(c.name)) || null;
}

/** A cookie is a tracker when the cookie table files it under analytics or marketing. */
export function cookieIsTracker(info) {
  return !!info && /^(analytics|marketing)$/i.test(info.category || '');
}

/** True for vendors whose purpose needs a choice before they run. */
export function vendorIsTracker(v) {
  return !!v && v.tracker === true;
}

/** Hosting fingerprint from response headers. */
export function detectHosting(headers) {
  const h = Object.fromEntries(Object.entries(headers || {}).map(([k, v]) => [k.toLowerCase(), String(v)]));
  const server = (h.server || '').toLowerCase();
  for (const host of VENDORS.hosts) {
    if (host.headers.some((name) => name in h)) return host;
    if (host.server && server.includes(host.server)) return host;
  }
  return null;
}

export const vendorTable = VENDORS;
export const cookieTableInfo = { source: OCD.source || null, commit: OCD.commit || null, fetched: OCD.fetched || null, rows: OCD.cookies.length };
