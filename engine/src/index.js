// The engine entry point: check each site in turn and build the guide data.

import { relative } from 'node:path';
import { readMailDns, mailOutcomes, mailRows, mailLabel, dohResolver, SPF_RULES } from './dns.js';
import { readTransport, transportOutcomes, stackFromHeaders } from './transport.js';
import { launchBrowser, runBrowserStates } from './browser.js';
import { analyzeBrowser } from './analyze.js';
import { buildGuideData } from './report.js';
import { normalizeHost } from './domain.js';

export { validateGuideData } from './contract.js';
export { buildGuideData, writeGuideData, readPrevious, toFinding } from './report.js';
export { mockResolver, dohResolver } from './dns.js';
export { RULES } from './rules/catalog.js';

const EU = new Set(['AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE']);

/** Where this run comes from, by the country of its public IP. Only the country is kept. */
export async function detectVantage() {
  try {
    const res = await fetch('https://www.cloudflare.com/cdn-cgi/trace', { signal: AbortSignal.timeout(8000) });
    const loc = ((await res.text()).match(/^loc=([A-Z]{2})$/m) || [])[1] || 'unknown';
    return { country: loc, eu: EU.has(loc) };
  } catch {
    return { country: 'unknown', eu: false };
  }
}

/**
 * @param {{
 *   sites: { domain: string, role?: string }[],
 *   checks?: { dns?: boolean, transport?: boolean, browser?: boolean },
 *   resolver?: { resolve: Function, names?: string[] },
 *   vantage?: { country: string, eu: boolean },
 *   browserOptions?: object,
 *   urlFor?: (domain: string) => string,
 *   outDir?: string,
 *   prev?: any,
 *   consentSite?: string,
 *   rerun?: string,
 *   log?: (msg: string) => void,
 *   now?: Date,
 * }} opts
 */
/** True when HTTPS answered with a status, so its headers were read. */
export function transportCompleted(t) {
  return !!(t && t.https && !t.https.error && t.https.status);
}

/** One entry per host: case and a trailing dot do not make a second site. */
export function uniqueSites(sites) {
  const seen = new Map();
  for (const s of sites) {
    const domain = normalizeHost(s.domain);
    if (!seen.has(domain)) seen.set(domain, { ...s, domain });
  }
  return [...seen.values()];
}

export async function scanSites(opts) {
  const checks = { dns: true, transport: true, browser: true, ...(opts.checks || {}) };
  const log = opts.log || (() => {});
  const resolver = opts.resolver || dohResolver();
  const vantage = opts.vantage || (await detectVantage());
  const urlFor = opts.urlFor || ((d) => `https://${d}/`);
  log(`Vantage: ${vantage.country} (${vantage.eu ? 'EU' : 'outside the EU'})`);

  const results = [];
  const browser = checks.browser ? await launchBrowser() : null;
  try {
    for (const s of uniqueSites(opts.sites)) {
      // checked lists the checks that completed. The diff uses it to tell a fix from a gap.
      const site = { domain: s.domain, role: s.role || '', outcomes: [], stack: [], pages: 0, panes: [], dns: null, checked: [], okPages: [], uncertain: [] };
      if (checks.dns) {
        log(`${s.domain}: DNS`);
        const d = await readMailDns(s.domain, resolver);
        site.outcomes.push(...mailOutcomes(d));
        // An unread inherited DMARC policy means the DNS check did not finish.
        if (!d.errors.length && !d.dmarcError) site.checked.push('dns');
        // A failed SPF include leaves every SPF rule unconfirmed for this run.
        if (d.spf?.tempErrors?.length) site.uncertain.push(...SPF_RULES);
        site.dns = { rows: mailRows(d), label: mailLabel(d) };
      }
      let transportOk = true;
      if (checks.transport) {
        log(`${s.domain}: transport`);
        const t = await (opts.readTransport || readTransport)(s.domain);
        const tOut = transportOutcomes(t);
        site.outcomes.push(...tOut);
        site.stack.push(...stackFromHeaders(t.https?.headers || {}));
        transportOk = !tOut.some((o) => o.rule === 'site-unreachable');
        // Only an HTTPS answer with a status means headers were read. A
        // certificate failure gives cert-invalid with no headers, so the
        // transport check did not finish and old header findings stay open.
        if (transportOk && transportCompleted(t)) site.checked.push('transport');
      }
      if (checks.browser && transportOk) {
        log(`${s.domain}: browser states`);
        const capture = await runBrowserStates(browser, urlFor(s.domain), opts.browserOptions || {});
        const a = analyzeBrowser({ domain: s.domain, capture, vantage, now: (opts.now || new Date()).getTime() });
        site.outcomes.push(...a.outcomes);
        site.panes = a.panes;
        site.pages = a.pages;
        site.checked.push(...a.checked);
        site.okPages = a.okPages;
        site.uncertain = [...new Set([...site.uncertain, ...a.uncertain])];
        for (const x of a.stack) if (!site.stack.includes(x)) site.stack.push(x);
      }
      if (opts.outDir) {
        for (const o of site.outcomes) for (const e of o.evidence) if (e.k === 'shot' && e.a.startsWith('/')) e.a = relative(opts.outDir, e.a);
      }
      results.push(site);
    }
  } finally {
    if (browser) await browser.close();
  }
  return buildGuideData({ sites: results, vantage, when: opts.now || new Date(), prev: opts.prev || null, consentSite: opts.consentSite, rerun: opts.rerun });
}
