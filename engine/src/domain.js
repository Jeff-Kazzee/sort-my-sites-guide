// Registrable-domain helpers. A small suffix list covers the shared hosting
// suffixes and two-label country suffixes this engine meets most often. Hosts
// outside it fall back to the last two labels.

const TWO_LABEL_SUFFIXES = new Set([
  'co.uk', 'org.uk', 'ac.uk', 'gov.uk', 'com.hr', 'from.hr', 'iz.hr', 'name.hr',
  'com.au', 'net.au', 'co.nz', 'com.br', 'co.jp', 'co.at', 'or.at', 'com.pl', 'com.es',
  'vercel.app', 'netlify.app', 'github.io', 'pages.dev', 'workers.dev', 'web.app',
  'firebaseapp.com', 'herokuapp.com', 'onrender.com', 'fly.dev', 'azurewebsites.net',
  'cloudfront.net', 'framer.app', 'framer.website', 'webflow.io', 'myshopify.com',
  'wixsite.com', 'squarespace.com', 'blogspot.com', 'wordpress.com', 'gitlab.io',
]);

/** @param {string} host */
export function normalizeHost(host) {
  return String(host || '').toLowerCase().replace(/\.$/, '').replace(/^\[|\]$/g, '');
}

/** @param {string} host */
export function registrableDomain(host) {
  const h = normalizeHost(host);
  if (/^[\d.]+$/.test(h) || h.includes(':')) return h;
  const parts = h.split('.');
  if (parts.length <= 2) return h;
  const lastTwo = parts.slice(-2).join('.');
  return TWO_LABEL_SUFFIXES.has(lastTwo) ? parts.slice(-3).join('.') : lastTwo;
}

/** @param {string} a @param {string} b */
export function sameSite(a, b) {
  return registrableDomain(a) === registrableDomain(b);
}

/** Cookie domains look like ".example.com". */
export function cookieHost(domain) {
  return normalizeHost(String(domain || '').replace(/^\./, ''));
}

/** @param {string} url */
export function hostOf(url) {
  try { return normalizeHost(new URL(url).hostname); } catch { return ''; }
}

/**
 * Stable id fragment for a host, used in finding ids and screenshot names.
 * A hyphen becomes two hyphens and a dot becomes one, so shop.example.com and
 * shop-example.com stay apart, and a host with no hyphen keeps the slug it
 * always had. Any other character is written as its code point.
 */
export function slug(domain) {
  return normalizeHost(domain)
    .replace(/[^a-z0-9.-]/g, (ch) => `_${ch.codePointAt(0).toString(16)}_`)
    .replace(/-/g, '--')
    .replace(/\./g, '-');
}
