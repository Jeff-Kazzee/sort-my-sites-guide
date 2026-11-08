// Clean-session browser runs. Each state gets a fresh context with nothing
// stored: A loads and waits, B presses reject, C presses accept. One browser
// and one context are open at a time.

import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { extractPage, readStorage } from './page-extract.js';
import { waitForBanner, findSecondLayerReject } from './banner.js';
import { slug } from './domain.js';

export const DESKTOP_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36';

// Pages worth reading for forms and trader details. Legal and privacy pages
// often carry the business name, address and OIB.
const FOLLOW = /kontakt|contact|prijav|sign ?up|signup|register|registr|newsletter|subscribe|pretplat|radionic|workshop|impressum|imprint|impresum|pravn|legal|privac|privatnost|terms|uvjeti|o nama|about/i;

/** A 2xx or 3xx final response. */
export const httpOk = (status) => status >= 200 && status < 400;

export async function launchBrowser() {
  return chromium.launch({ headless: true, args: ['--disable-dev-shm-usage'] });
}

async function newContext(browser, opts) {
  const context = await browser.newContext({
    locale: 'hr-HR',
    timezoneId: 'Europe/Zagreb',
    userAgent: DESKTOP_UA,
    viewport: { width: 1366, height: 900 },
    extraHTTPHeaders: { 'accept-language': 'hr-HR,hr;q=0.9,en;q=0.8' },
    serviceWorkers: 'allow',
  });
  if (opts.setupContext) await opts.setupContext(context);
  return context;
}

// A request event only says the page asked. status and failed say whether it
// arrived, so the analysis never reports a blocked or broken script as loaded.
function record(context, t0) {
  const requests = [];
  const byRequest = new Map();
  context.on('request', (r) => {
    let frame = '';
    try { frame = r.frame().url(); } catch { /* service worker requests have no frame */ }
    const entry = { url: r.url(), type: r.resourceType(), method: r.method(), t: Date.now() - t0, frame, status: 0, failed: '' };
    requests.push(entry);
    byRequest.set(r, entry);
  });
  context.on('response', (res) => {
    const entry = byRequest.get(res.request());
    if (entry) entry.status = res.status();
  });
  context.on('requestfailed', (r) => {
    const entry = byRequest.get(r);
    if (entry) entry.failed = r.failure()?.errorText || 'failed';
  });
  return requests;
}

async function settle(page, extraMs) {
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(extraMs);
}

async function snapshot(context, page) {
  const cookies = (await context.cookies()).map((c) => ({ name: c.name, domain: c.domain, expires: c.expires, path: c.path }));
  // A read that fails is not an empty store, so every store is marked unread.
  const storage = await page.evaluate(readStorage).catch(() => ({ local: [], session: [], idb: [], sw: [], unreadable: ['localStorage', 'sessionStorage', 'IndexedDB', 'service worker'] }));
  return { cookies, storage };
}

async function open(page, url) {
  const res = await page.goto(url, { waitUntil: 'load', timeout: 30000 });
  return { status: res ? res.status() : 0, url: page.url() };
}

async function shot(page, opts, name) {
  if (!opts.shotsDir) return '';
  await mkdir(opts.shotsDir, { recursive: true });
  const file = join(opts.shotsDir, `${name}.png`);
  await page.screenshot({ path: file, fullPage: false }).catch(() => {});
  return file;
}

const describeControl = (c) => (c ? c.how : '');

async function stateA(browser, url, opts) {
  const context = await newContext(browser, opts);
  const t0 = Date.now();
  const requests = record(context, t0);
  try {
    const page = await context.newPage();
    const nav = await open(page, url);
    // Only a 2xx or 3xx final response is a loaded page, the same rule as the
    // response gate. An error page is read, but the state does not count.
    const homeOk = httpOk(nav.status);
    await settle(page, opts.waitMs ?? 5000);
    await page.evaluate(() => window.scrollTo(0, document.body ? document.body.scrollHeight : 0)).catch(() => {});
    await page.waitForTimeout(1500);
    const banner = await waitForBanner(page, 1500);
    const home = await page.evaluate(extractPage);
    const snap = await snapshot(context, page);
    const shotFile = banner ? await shot(page, opts, `${slug(new URL(url).hostname)}-A`) : '';
    const homeRequests = requests.slice();

    // A small page budget: follow contact, signup and imprint links to read
    // their forms and trader details. Their requests stay out of pane A.
    const host = new URL(nav.url).hostname;
    const seen = new Set([nav.url.split('#')[0]]);
    const extra = [];
    const candidates = home.links.filter((l) => {
      try { return new URL(l.href).hostname === host && FOLLOW.test(l.text + ' ' + new URL(l.href).pathname); } catch { return false; }
    });
    for (const l of candidates) {
      const target = l.href.split('#')[0];
      if (seen.has(target) || extra.length >= (opts.pageBudget ?? 4)) continue;
      seen.add(target);
      try {
        const res = await open(page, target);
        if (!httpOk(res.status)) {
          extra.push({ url: target, status: res.status, error: `HTTP ${res.status}`, text: '', links: [], forms: [], iframes: [], consentCalls: [], stack: [] });
          continue;
        }
        await page.waitForTimeout(1500);
        extra.push({ ...(await page.evaluate(extractPage)), status: res.status });
      } catch (e) {
        extra.push({ url: target, error: e.message, text: '', links: [], forms: [], iframes: [], consentCalls: [], stack: [] });
      }
    }
    return {
      ok: homeOk, status: nav.status, ...(homeOk ? {} : { error: `the home page answered HTTP ${nav.status}` }), finalUrl: nav.url, requests: homeRequests, ...snap, home, extra,
      banner: banner ? { cmp: banner.cmp, tcf: banner.tcf, reject: describeControl(banner.reject), accept: describeControl(banner.accept), settings: describeControl(banner.settings), rootFound: banner.rootFound } : null,
      shot: shotFile,
    };
  } catch (e) {
    return { ok: false, error: e.message, requests, cookies: [], storage: { local: [], session: [], idb: [], sw: [] }, home: null, extra: [], banner: null };
  } finally {
    await context.close();
  }
}

/** B or C: a fresh context, find the banner, press one control, reload, record. */
async function stateChoice(browser, url, which, opts) {
  const context = await newContext(browser, opts);
  const t0 = Date.now();
  const requests = record(context, t0);
  const name = `${slug(new URL(url).hostname)}-${which === 'reject' ? 'B' : 'C'}`;
  try {
    const page = await context.newPage();
    await open(page, url);
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    const banner = await waitForBanner(page, opts.bannerWaitMs ?? 8000);
    if (!banner) return { ran: false, reason: 'no-banner', requests: [], cookies: [], storage: { local: [], session: [], idb: [], sw: [] } };
    let control = which === 'reject' ? banner.reject : banner.accept;
    let layer = 1;
    // attempted is the choice this state tests. pressed is the kind of control
    // actually pressed, so a Save in the settings layer is never reported as
    // a Reject button.
    let pressed = which;
    if (!control && which === 'reject' && banner.settings) {
      await banner.settings.el.click({ timeout: 5000 }).catch(() => {});
      await page.waitForTimeout(1200);
      control = await findSecondLayerReject(page);
      layer = 2;
      // A reject or save outside any overlay may belong to the page, so it is
      // not pressed. It still exists, so this is no proof that reject is missing.
      if (control?.outsideLayer) {
        const file = await shot(page, opts, name);
        return { ran: false, reason: 'control-outside-layer', attempted: which, pressed: 'none', shot: file, layer, control: control.how, requests: [], cookies: [], storage: { local: [], session: [], idb: [], sw: [] } };
      }
      if (control?.kind === 'save') {
        pressed = 'save';
        // Save with an optional choice still on agrees to that choice. The
        // checker never changes the owner's toggles, so this is not a reject.
        if (!control.optionalOn || control.optionalOn.length) {
          const file = await shot(page, opts, name);
          return { ran: false, reason: 'save-not-reject', attempted: which, pressed: 'none', optionalOn: control.optionalOn || ['the choices could not be read'], shot: file, layer, control: control.how, requests: [], cookies: [], storage: { local: [], session: [], idb: [], sw: [] } };
        }
      }
    }
    if (!control) {
      const file = await shot(page, opts, name);
      return { ran: false, reason: 'no-control', shot: file, layer, requests: [], cookies: [], storage: { local: [], session: [], idb: [], sw: [] } };
    }
    const before = await snapshot(context, page);
    // Everything recorded from here on follows the press, including requests
    // the click handler sends before click() resolves.
    const mark = requests.length;
    const clickedAt = Date.now() - t0;
    const clicked = await control.el.click({ timeout: 5000 }).then(() => true).catch(() => control.el.click({ timeout: 5000, force: true }).then(() => true).catch(() => false));
    if (!clicked) {
      const file = await shot(page, opts, name);
      return { ran: false, reason: 'click-failed', shot: file, layer, control: control.how, requests: [], cookies: [], storage: { local: [], session: [], idb: [], sw: [] } };
    }
    await page.waitForTimeout(2500);
    await page.reload({ waitUntil: 'load', timeout: 30000 }).catch(() => {});
    await settle(page, opts.choiceWaitMs ?? 3000);
    const still = await waitForBanner(page, 500);
    const snap = await snapshot(context, page);
    const file = await shot(page, opts, name);
    const had = new Set(before.cookies.map((c) => `${c.name}|${c.domain}`));
    const newCookies = snap.cookies.filter((c) => !had.has(`${c.name}|${c.domain}`));
    return { ran: true, attempted: which, pressed, layer, control: control.how, clickedAt, bannerAfter: !!still, requests: requests.slice(mark), ...snap, newCookies, shot: file };
  } catch (e) {
    return { ran: false, reason: 'error', error: e.message, requests: [], cookies: [], storage: { local: [], session: [], idb: [], sw: [] } };
  } finally {
    await context.close();
  }
}

/**
 * Run states A, B and C for one site, one context at a time.
 * @param {import('playwright').Browser} browser
 * @param {string} url
 * @param {{ setupContext?: Function, shotsDir?: string, waitMs?: number, pageBudget?: number, bannerWaitMs?: number, choiceWaitMs?: number }} opts
 */
export async function runBrowserStates(browser, url, opts = {}) {
  const A = await stateA(browser, url, opts);
  if (!A.ok) return { url, A, B: null, C: null };
  const target = A.finalUrl || url;
  const B = A.banner ? await stateChoice(browser, target, 'reject', opts) : null;
  const C = A.banner ? await stateChoice(browser, target, 'accept', opts) : null;
  return { url: target, A, B, C };
}
