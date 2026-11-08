// HTTPS, redirect, HSTS, certificate and security-header checks. These are
// hygiene notes, not legal findings, so their outcomes cite no claims.

import tls from 'node:tls';
import { isIP } from 'node:net';
import { detectHosting } from './vendors.js';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36';

async function follow(url, maxHops = 6) {
  const chain = [];
  let current = url;
  for (let i = 0; i < maxHops; i++) {
    const res = await fetch(current, { redirect: 'manual', headers: { 'user-agent': UA }, signal: AbortSignal.timeout(12000) });
    const headers = Object.fromEntries(res.headers.entries());
    chain.push({ url: current, status: res.status, location: headers.location || '' });
    await res.body?.cancel();
    if (res.status >= 300 && res.status < 400 && headers.location) {
      current = new URL(headers.location, current).href;
      continue;
    }
    return { chain, final: current, status: res.status, headers };
  }
  return { chain, final: current, status: 0, headers: {}, error: 'too many redirects' };
}

function certificate(host, port) {
  return new Promise((resolve) => {
    // SNI takes a host name only, never an IP address.
    const socket = tls.connect({ host, port, servername: isIP(host) ? undefined : host, rejectUnauthorized: false, timeout: 10000 }, () => {
      const cert = socket.getPeerCertificate();
      const out = { authorized: socket.authorized, error: socket.authorizationError ? String(socket.authorizationError) : '', validTo: cert.valid_to || '', issuer: cert.issuer?.O || cert.issuer?.CN || '' };
      socket.end();
      resolve(out);
    });
    socket.on('error', (e) => resolve({ authorized: false, error: e.message, validTo: '', issuer: '' }));
    socket.on('timeout', () => { socket.destroy(); resolve({ authorized: false, error: 'timeout', validTo: '', issuer: '' }); });
  });
}

/**
 * Read transport facts for a domain from the network. The ports are for
 * tests against local servers. A real run uses 443 and 80.
 */
export async function readTransport(domain, { httpsPort = 443, httpPort = 80 } = {}) {
  const out = { domain, https: null, http: null, cert: null };
  const origin = (scheme, port, usual) => `${scheme}://${domain}${port === usual ? '' : `:${port}`}/`;
  try { out.https = await follow(origin('https', httpsPort, 443)); } catch (e) { out.https = { error: e.cause?.code || e.message }; }
  try { out.http = await follow(origin('http', httpPort, 80)); } catch (e) { out.http = { error: e.cause?.code || e.message }; }
  out.cert = await certificate(domain, httpsPort);
  return out;
}

// Node's codes for a certificate the client refuses. A refused port, a reset
// socket or a timeout is a network failure, not a certificate verdict.
const CERT_ERROR = /^(CERT_[A-Z_]+|DEPTH_ZERO_SELF_SIGNED_CERT|SELF_SIGNED_CERT_IN_CHAIN|UNABLE_TO_GET_ISSUER_CERT(_LOCALLY)?|UNABLE_TO_VERIFY_LEAF_SIGNATURE|UNABLE_TO_DECRYPT_CERT_SIGNATURE|ERR_TLS_CERT_ALTNAME_INVALID|HOSTNAME_MISMATCH)$/;

export const SECURITY_HEADERS = ['content-security-policy', 'x-content-type-options', 'referrer-policy', 'permissions-policy'];

/** Turn transport facts into outcomes. Pure, so tests can feed it fixed input. */
export function transportOutcomes(t, now = new Date()) {
  const out = [];
  const site = t.domain;
  const add = (rule, state, evidence, data = {}) => out.push({ rule, state, site, evidence, data });
  const ev = (k, a, b, c = '') => ({ k, a, b, c });

  // A certificate the client refuses means HTTPS answers with a defect. It is
  // not missing HTTPS. The headers stay unread, because the fetch stopped.
  const httpsCert = CERT_ERROR.test(t.https?.error || '') ? t.https.error : '';
  const probeCert = CERT_ERROR.test(t.cert?.error || '') ? t.cert.error : '';
  const httpsRead = !!(t.https && !t.https.error && t.https.status);

  if (!httpsRead && !httpsCert && !probeCert) {
    if (t.http && !t.http.error && t.http.status) {
      add('https-missing', 'observed', [ev('http', `https://${site}/`, t.https?.error || 'no answer'), ev('http', `http://${site}/`, String(t.http.status))]);
    } else {
      add('site-unreachable', 'could_not_check', [ev('http', `https://${site}/`, t.https?.error || 'no answer'), ev('http', `http://${site}/`, t.http?.error || 'no answer')]);
    }
    return out;
  }

  if (httpsCert || probeCert) {
    add('cert-invalid', 'observed', [ev('tls', 'Certificate', probeCert || httpsCert), ...(httpsCert ? [ev('http', `https://${site}/`, httpsCert)] : [])]);
  } else if (t.cert && t.cert.validTo) {
    const days = Math.floor((new Date(t.cert.validTo) - now) / 86400000);
    if (days < 14) add('cert-expiring', 'observed', [ev('tls', 'Expires', t.cert.validTo, `${days} days`)], { days });
  }

  if (t.http && !t.http.error && t.http.chain?.length) {
    const lands = new URL(t.http.final).protocol === 'https:';
    if (!lands) add('http-no-redirect', 'observed', t.http.chain.map((h) => ev('http', h.url, String(h.status), h.location)));
  }
  if (!httpsRead) return out;

  const h = t.https.headers || {};
  const hsts = h['strict-transport-security'];
  if (!hsts) add('hsts-missing', 'observed', [ev('header', 'Strict-Transport-Security', 'not sent', t.https.final)]);

  const missing = SECURITY_HEADERS.filter((name) => !(name in h));
  if (missing.length) add('security-headers-missing', 'observed', missing.map((m) => ev('header', m, 'not sent', t.https.final)), { missing });

  const hosting = detectHosting(h);
  if (hosting) add('hosting-plan', 'needs_your_answer', [ev('header', 'Host', hosting.name, Object.keys(h).filter((k) => hosting.headers.includes(k)).join(', ') || h.server || '')], { hosting });
  return out;
}

/** Stack hints from headers. Page hints are added by the browser run. */
export function stackFromHeaders(headers = {}) {
  const s = new Set();
  const hosting = detectHosting(headers);
  if (hosting) s.add(hosting.name);
  const powered = String(headers['x-powered-by'] || '').toLowerCase();
  if (powered.includes('next.js')) s.add('Next.js');
  if (powered.includes('php')) s.add('PHP');
  if (powered.includes('express')) s.add('Express');
  return [...s];
}
