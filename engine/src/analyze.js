// Pure analysis of a browser capture: which requests and stored items are
// trackers, which outcomes the run supports, and the consent panes. The
// vantage rule lives here. A run from outside the EU that sees no banner
// cannot say what an EU visitor gets, so consent-order outcomes become
// could_not_check.

import { hostOf, sameSite, cookieHost, registrableDomain } from './domain.js';
import { identifyUrl, identifyHost, identifyCookie, cookieIsTracker, vendorIsTracker } from './vendors.js';

const PRIVACY_LINK = /privac|privatnost|zaštit[aei] (osobnih )?podataka|osobni(h)? podata|datenschutz|confidentialit|protection des données|gdpr/i;
const IDENTITY = [
  ['OIB', /\bOIB[:\s]*\d{11}\b/i],
  ['VAT number', /\b(PDV|VAT|USt-?IdNr|TVA|IVA)\b[^\n]{0,30}?\b[A-Z]{2}?\d{8,12}\b/i],
  ['Register entry', /\b(MBS|MBO|sudski registar|obrtni registar|trgovački sud|company number|registration number|Handelsregister|registergericht)\b/i],
  ['Legal form', /\b(d\.o\.o\.|j\.d\.o\.o\.|obrt|GmbH|Ltd\.?|LLC|S\.L\.|S\.A\.R\.L\.|B\.V\.|j\.t\.d\.)(?=[\s,.)]|$)/i],
];
const CONTACT = [
  ['Email', /[\w.+-]+@[\w-]+\.[\w.-]+/],
  ['Postal address', /\b\d{5}\s+\p{Lu}[\p{Ll}]+/u],
];
const COMMERCE = /(\d[\d.,]*\s?(€|eur\b))|(€\s?\d)|\b(cijena|cjenik|price|pricing|buy now|kupi|naruči|checkout|košarica|add to cart|plaćanje|payment)\b/i;

const EMPTY_STORAGE = { local: [], session: [], idb: [], sw: [] };

/** The text around the first selling signal, so the owner can see what we matched. */
function commerceSnippet(text) {
  const m = COMMERCE.exec(text);
  if (!m) return '';
  return `"${text.slice(Math.max(0, m.index - 40), m.index + m[0].length + 30).replace(/\s+/g, ' ').trim()}"`;
}

// A request only counts as loaded when the browser saw a successful
// response. A blocked, aborted or failed request is an attempt, not a load.
function classifyRequest(r, siteHost) {
  const host = hostOf(r.url);
  const vendor = identifyUrl(r.url, siteHost);
  const first = sameSite(host, siteHost);
  const loaded = !r.failed && r.status >= 200 && r.status < 400;
  return { ...r, host, first, vendor, loaded, tracker: vendorIsTracker(vendor), cookieless: !!vendor?.cookieless };
}

// A form's purpose, only as far as the page itself states it. The action path
// and the button text are the page's own words. Anything else is "other" and
// gets a notice with the purpose left for the owner to fill in.
const EVENT_WORDS = /workshop|radionic|webinar|event|rsvp|\bbook(ing)?\b|reserv|rezerv|ticket|save my spot|\bseat\b|\bspot\b/i;
const NEWSLETTER_WORDS = /newsletter|subscribe|pretplat|mailing list/i;

/**
 * contact: has a message field, so it exists to answer that message.
 * event: the path or button names an event, booking or place.
 * newsletter: the path or button names a newsletter or subscription.
 * other: anything else, such as a lead form with a neutral "Continue".
 */
function formKind(f) {
  if (f.fields.includes('message')) return 'contact';
  let path = '';
  try { path = f.action ? new URL(f.action).pathname : ''; } catch { /* keep empty */ }
  const words = `${path} ${f.submitText || ''}`;
  if (EVENT_WORDS.test(words)) return 'event';
  if (NEWSLETTER_WORDS.test(words)) return 'newsletter';
  return 'other';
}

const pathOf = (u) => { try { return new URL(u).pathname || '/'; } catch { return '/'; } };

const YOUTUBE_PLAYER = /youtube(-nocookie)?\.com\/(embed\/|iframe_api|player_api|s\/player\/)|www-widgetapi|www-embed-player/;

function classifyCookie(c, siteHost) {
  const host = cookieHost(c.domain);
  const first = sameSite(host, siteHost);
  const info = identifyCookie(c.name);
  const vendor = first ? null : identifyHost(host);
  // A cookie set by a vendor with its own rule (YouTube, Maps) belongs to that rule.
  const ownRule = vendor && !vendor.tracker && ['video', 'maps'].includes(vendor.purpose);
  const tracker = !ownRule && (cookieIsTracker(info) || vendorIsTracker(vendor));
  return { ...c, host, first, info, vendor, tracker, owner: vendor ? vendor.name : info ? info.platform : '' };
}

function lifetime(expires, now) {
  if (!expires || expires < 0) return 'session';
  const days = Math.round((expires * 1000 - now) / 86400000);
  if (days < 1) return 'under a day';
  if (days < 60) return `${days} days`;
  return `${Math.round(days / 30.4)} months`;
}

const evReq = (r) => ({ k: 'request', a: r.host, b: r.url.length > 140 ? r.url.slice(0, 140) + '...' : r.url, c: `+${(r.t / 1000).toFixed(1)} s, ${r.failed ? `failed (${r.failed})` : r.status ? `HTTP ${r.status}` : 'no response'}` });
const evCookie = (c, now) => ({ k: 'cookie', a: c.name, b: `${c.host}, ${c.first ? 'first party' : 'third party'}${c.owner ? ', ' + c.owner : ''}`, c: lifetime(c.expires, now) });

/**
 * One entry per key, preferring a request that loaded. A retry that worked
 * must not be hidden behind the failed attempt before it.
 */
function bestBy(list, key) {
  const best = new Map();
  for (const r of list) {
    const k = key(r);
    const cur = best.get(k);
    if (!cur || (!cur.loaded && r.loaded)) best.set(k, r);
  }
  return [...best.values()];
}

const evStorage = (k, storage) => ({ k: 'storage', a: k, b: storage.session.includes(k) && !storage.local.includes(k) ? 'sessionStorage' : 'localStorage', c: identifyCookie(k)?.platform || '' });

/** What the choice state tried, what it pressed, and what stayed on. */
const choiceEv = (st) => [
  { k: 'banner', a: 'Tested', b: st.attempted || 'reject', c: '' },
  { k: 'banner', a: 'Pressed', b: st.pressed || 'none', c: st.control || '' },
  ...(st.optionalOn && st.optionalOn.length ? [{ k: 'banner', a: 'Still on', b: st.optionalOn.join(', '), c: 'optional choices a Save would keep' }] : []),
];

function uniqueBy(list, key) {
  const seen = new Set();
  return list.filter((x) => { const k = key(x); if (seen.has(k)) return false; seen.add(k); return true; });
}

function consentDefaults(calls) {
  const defaults = calls.filter((c) => c.cmd === 'default');
  const global = defaults.filter((c) => !c.params.region);
  const denied = global.some((c) => c.params.analytics_storage === 'denied' && (c.params.ad_storage === 'denied' || c.params.ad_storage === undefined));
  const granted = global.filter((c) => c.params.analytics_storage === 'granted' || c.params.ad_storage === 'granted');
  return { defaults, denied, granted };
}

function trackerSet(requests, cookies) {
  const reqs = requests.filter((r) => r.tracker && r.loaded && !(r.first && !r.vendor));
  const cks = cookies.filter((c) => c.tracker);
  const names = uniqueBy([...reqs.map((r) => r.vendor.name), ...cks.map((c) => c.owner || c.name)], (x) => x);
  return { reqs, cks, names, any: reqs.length > 0 || cks.length > 0 };
}

/**
 * @param {{ domain: string, capture: any, vantage: { country: string, eu: boolean }, now?: number }} input
 */
export function analyzeBrowser({ domain, capture, vantage, now = Date.now() }) {
  const outcomes = [];
  const site = domain;
  // scope names the pages an outcome was seen on. A later run can only call it
  // fixed after loading those pages again. It defaults to the home page.
  let homePath = '/';
  const add = (rule, state, evidence, data = {}, scope = { pages: [homePath] }) => outcomes.push({ rule, state, site, evidence, data, scope });
  const A = capture.A;
  // A page loaded only on a 2xx or 3xx final response. A capture without a
  // status (older tests) is taken as loaded.
  const pageOk = (p) => p && (p.status === undefined || (p.status >= 200 && p.status < 400));
  if (!A || !A.ok || !pageOk(A)) {
    add('site-not-loaded', 'could_not_check', [{ k: 'browser', a: capture.url, b: A?.error || (A?.status ? `HTTP ${A.status}` : 'no answer'), c: '' }]);
    return { outcomes, panes: [], stack: [], pages: 0, checked: [], okPages: [], uncertain: [] };
  }
  const siteHost = hostOf(A.finalUrl || capture.url) || domain;
  homePath = pathOf(A.finalUrl || capture.url);
  const reqA = A.requests.map((r) => classifyRequest(r, siteHost));
  const cookiesA = A.cookies.map((c) => classifyCookie(c, siteHost));
  const storageA = A.storage || EMPTY_STORAGE;
  const home = A.home;
  const pages = [home, ...A.extra.filter((p) => !p.error && pageOk(p))];
  const banner = A.banner;
  const vantageOk = !!vantage?.eu || !!banner;
  const vantageNote = { k: 'vantage', a: `Run from ${vantage?.country || 'unknown'}`, b: vantage?.eu ? 'inside the EU' : 'outside the EU, and no banner appeared. Banners often show only to EU visitors. Run the check from an EU connection.', c: '' };
  const gated = (state) => (vantageOk ? state : 'could_not_check');
  const withVantage = (ev) => (vantageOk ? ev : [...ev, vantageNote]);

  // Before any choice.
  const t = trackerSet(reqA, cookiesA);
  const cm = consentDefaults(home.consentCalls || []);
  const trackerStorage = [...storageA.local, ...storageA.session].filter((k) => cookieIsTracker(identifyCookie(k)));
  const attempted = reqA.filter((r) => r.tracker && !r.loaded);
  // A known analytics or marketing key in localStorage or sessionStorage is a
  // tracker on its own, with no request or cookie needed.
  const storageNames = [...new Set(trackerStorage.map((k) => identifyCookie(k)?.platform || k))];
  const trackerAny = t.any || trackerStorage.length > 0;
  if (!trackerAny && attempted.length) {
    add('tracker-before-choice', 'could_not_check', withVantage(uniqueBy(attempted, (r) => r.host).slice(0, 8).map(evReq)), { vendors: [...new Set(attempted.map((r) => r.vendor.name))], reason: 'failed', stored: [] });
  }
  if (trackerAny) {
    const googleOnly = t.reqs.length > 0 && t.reqs.every((r) => r.vendor?.id === 'google-analytics' || r.vendor?.id === 'google-tag') && t.cks.length === 0 && trackerStorage.length === 0;
    if (googleOnly && cm.denied) {
      add('consent-mode-denied-pings', 'needs_a_specialist', [...uniqueBy(t.reqs, (r) => r.host + r.type).slice(0, 6).map(evReq), { k: 'consent', a: 'Consent Mode default', b: JSON.stringify(cm.defaults[0]?.params || {}), c: '' }]);
    } else {
      const ev = [...uniqueBy(t.reqs, (r) => r.host).slice(0, 8).map(evReq), ...uniqueBy(t.cks, (c) => c.name).slice(0, 8).map((c) => evCookie(c, now)), ...trackerStorage.slice(0, 8).map((k) => evStorage(k, storageA))];
      const ids = [...new Set(t.reqs.map((r) => (r.url.match(/[?&](?:id|tid)=(G-[A-Z0-9]+|GTM-[A-Z0-9]+|AW-[0-9]+)/) || [])[1]).filter(Boolean))];
      const stored = [...new Set([...t.cks.map((c) => c.name), ...trackerStorage])];
      add('tracker-before-choice', gated('observed'), withVantage(ev), { vendors: [...new Set([...t.names, ...storageNames])], googleIds: ids, bannerFound: !!banner, stored, reason: vantageOk ? '' : 'vantage' });
    }
  }
  if (cm.granted.length) {
    add('consent-mode-default-granted', gated('observed'), withVantage([{ k: 'consent', a: "gtag('consent', 'default')", b: JSON.stringify(cm.granted[0].params), c: '' }]));
  }

  const cookieless = uniqueBy(reqA.filter((r) => r.cookieless && r.loaded), (r) => r.vendor.id);
  if (cookieless.length) add('cookieless-analytics-before-choice', 'needs_a_specialist', cookieless.map(evReq), { vendors: cookieless.map((r) => r.vendor.name) });

  const unknown = uniqueBy(reqA.filter((r) => !r.first && !r.vendor && r.host && r.loaded), (r) => registrableDomain(r.host));
  if (unknown.length) add('unidentified-third-party', 'needs_your_answer', unknown.slice(0, 12).map(evReq), { hosts: unknown.map((r) => r.host) });

  const storageUnknown = [
    ...cookiesA.filter((c) => c.first && !c.info && !c.tracker).map((c) => evCookie(c, now)),
    ...storageA.local.filter((k) => !identifyCookie(k)).map((k) => ({ k: 'storage', a: k, b: 'localStorage', c: '' })),
    ...storageA.session.filter((k) => !identifyCookie(k)).map((k) => ({ k: 'storage', a: k, b: 'sessionStorage', c: '' })),
    ...storageA.idb.map((k) => ({ k: 'storage', a: k, b: 'IndexedDB', c: '' })),
    ...storageA.sw.map((k) => ({ k: 'storage', a: k, b: 'service worker', c: '' })),
  ];
  if (storageUnknown.length) add('storage-unknown-before-choice', 'needs_your_answer', storageUnknown.slice(0, 12), { count: storageUnknown.length });
  // A store that threw when read is not an empty store. Say so.
  const unreadable = storageA.unreadable || [];
  if (unreadable.length) add('storage-not-read', 'could_not_check', unreadable.map((s) => ({ k: 'storage', a: s, b: 'could not be read in this run', c: '' })), { stores: unreadable });

  const fonts = uniqueBy(reqA.filter((r) => r.vendor?.purpose === 'fonts' && r.loaded), (r) => r.host);
  if (fonts.length) {
    const families = [...new Set(reqA.filter((r) => r.vendor?.id === 'google-fonts' && /\/css2?\b/.test(r.url)).flatMap((r) => [...new URL(r.url).searchParams.getAll('family')].map((f) => f.split(':')[0])))];
    // Requests are recorded for the home page only, so the finding names it.
    add('third-party-fonts', 'observed', fonts.map(evReq), { vendors: [...new Set(fonts.map((r) => r.vendor.name))], google: fonts.some((r) => r.vendor.id === 'google-fonts'), families, page: homePath });
  }

  const ytFrames = pages.flatMap((p) => p.iframes).filter((s) => /(^|\.)youtube\.com\/embed\//.test(s.replace(/^https?:\/\//, '')));
  // An iframe element says the page embeds a player. Only a successful
  // response for the embed frame or the player script says the player loaded.
  // A thumbnail image is neither.
  const ytPlayer = reqA.filter((r) => r.vendor?.id === 'youtube' && (r.type === 'document' || YOUTUBE_PLAYER.test(r.url)));
  const ytLoaded = ytPlayer.filter((r) => r.loaded);
  const ids = [...new Set(ytFrames.map((s) => (s.match(/\/embed\/([\w-]{6,})/) || [])[1]).filter(Boolean))];
  const frameEv = ytFrames.slice(0, 4).map((s) => ({ k: 'iframe', a: 'YouTube embed', b: s, c: '' }));
  if (ytLoaded.length) {
    add('youtube-embed', gated('observed'), withVantage([...frameEv, ...uniqueBy(ytLoaded, (r) => r.host).slice(0, 4).map(evReq)]), { videoIds: ids });
  } else if (ytPlayer.length) {
    add('youtube-embed', 'could_not_check', withVantage([...frameEv, ...uniqueBy(ytPlayer, (r) => r.host).slice(0, 4).map(evReq)]), { videoIds: ids, reason: 'failed' });
  }
  const mapFrames = pages.flatMap((p) => p.iframes).filter((s) => /google\.[a-z.]+\/maps|maps\.google\./.test(s));
  // The same rule as YouTube: an iframe says the page embeds a map, only a
  // successful Maps response says it loaded.
  const mapAll = reqA.filter((r) => r.vendor?.purpose === 'maps');
  const mapReqs = mapAll.filter((r) => r.loaded);
  const mapEv = mapFrames.slice(0, 3).map((s) => ({ k: 'iframe', a: 'Google Maps embed', b: s, c: '' }));
  if (mapReqs.length) {
    add('maps-embed', gated('observed'), withVantage([...mapEv, ...uniqueBy(mapReqs, (r) => r.host).slice(0, 3).map(evReq)]));
  } else if (mapAll.length) {
    add('maps-embed', 'could_not_check', withVantage([...mapEv, ...uniqueBy(mapAll, (r) => r.host).slice(0, 3).map(evReq)]), { reason: 'failed' });
  }

  // Forms, on every page the run read.
  const forms = pages.flatMap((p) => (p.forms || []).filter((f) => f.personal && !f.isSearch).map((f) => ({ ...f, page: p.url })));
  const fEv = (f, extra = '') => ({ k: 'form', a: `${f.selector} on ${new URL(f.page).pathname}`, b: `${f.method.toUpperCase()} ${f.action || '(sent by script)'}`, c: extra || f.fields.join(', ') });
  const formScope = (list) => ({ pages: [...new Set(list.map((f) => pathOf(f.page)))] });
  const noNotice = forms.filter((f) => !f.hasNotice).map((f) => ({ ...f, kind: formKind(f) }));
  if (noNotice.length) add('form-no-notice', 'observed', noNotice.slice(0, 6).map((f) => fEv(f, `${f.kind} form: ${f.fields.join(', ')}${f.submitText ? `, button "${f.submitText}"` : ''}`)), { count: noNotice.length, kinds: [...new Set(noNotice.map((f) => f.kind))] }, formScope(noNotice));
  const preticked = forms.filter((f) => f.marketingBoxes.some((b) => b.checked));
  if (preticked.length) add('marketing-box-preticked', 'observed', preticked.flatMap((f) => f.marketingBoxes.filter((b) => b.checked).map((b) => ({ k: 'checkbox', a: b.name || 'checkbox', b: b.label.slice(0, 120), c: `ticked on load, on ${pathOf(f.page)}` }))), {}, formScope(preticked));
  const bundled = forms.filter((f) => f.bundledBoxes.length && !f.marketingBoxes.some((b) => b.checked));
  if (bundled.length) add('marketing-bundled', 'observed', bundled.map((f) => ({ k: 'checkbox', a: f.bundledBoxes[0].name || 'checkbox', b: f.bundledBoxes[0].label.slice(0, 120), c: `one box for terms and marketing, on ${pathOf(f.page)}` })), {}, formScope(bundled));
  const relayed = forms.filter((f) => f.action && !sameSite(hostOf(f.action), siteHost));
  if (relayed.length) {
    add('form-third-party', 'needs_your_answer', relayed.map((f) => fEv(f, identifyUrl(f.action)?.name || 'unidentified third party')), { vendors: [...new Set(relayed.map((f) => identifyUrl(f.action)?.name || 'an unidentified third party'))] }, formScope(relayed));
  }

  // Notice and trader details.
  const privacyLink = home.links.find((l) => PRIVACY_LINK.test(l.text + ' ' + l.href));
  if (!privacyLink) {
    const handlesData = forms.length > 0 || reqA.some((r) => !r.first);
    add('privacy-link-missing', handlesData ? 'observed' : 'needs_your_answer', [{ k: 'page', a: home.url, b: `${home.links.length} links read, none to a privacy notice`, c: '' }]);
  }
  const text = pages.map((p) => p.text || '').join('\n');
  // A privacy notice names other companies (processors, Google Ireland Ltd),
  // so a legal form found only there says nothing about the site owner.
  const ownText = pages.filter((p) => !/priva|gdpr|cookie|kolac|kolač/i.test(new URL(p.url).pathname)).map((p) => p.text || '').join('\n');
  const identity = IDENTITY.filter(([n, re]) => re.test(n === 'Legal form' ? ownText : text)).map(([n]) => n);
  if (!identity.length) {
    const commerce = COMMERCE.test(text) || reqA.some((r) => r.vendor?.purpose === 'payments');
    const contact = CONTACT.filter(([, re]) => re.test(text)).map(([n]) => n);
    add('trader-info-missing', commerce ? 'observed' : 'needs_your_answer', [
      { k: 'page', a: 'Pages read', b: pages.map((p) => new URL(p.url).pathname).join(', '), c: '' },
      { k: 'page', a: 'Not found', b: IDENTITY.map(([n]) => n).join(', '), c: '' },
      { k: 'page', a: 'Found', b: contact.join(', ') || 'nothing', c: '' },
      ...(commerce ? [{ k: 'page', a: 'Selling signal', b: commerceSnippet(text) || 'payment code on the page', c: '' }] : []),
    ], { commerce });
  }

  // Choices.
  // Pane A marks every row that an open finding before a choice cites.
  const panes = [paneA(reqA, cookiesA, storageA, siteHost, banner, vantage, now, evidenceMarks(outcomes))];
  const beforeChoices = outcomes.length;
  if (banner) {
    const shotEv = A.shot ? [{ k: 'shot', a: A.shot, b: '', c: '' }] : [];
    const bannerEv = { k: 'banner', a: banner.cmp ? banner.cmp.name : 'Banner found by its text', b: `reject: ${banner.reject || 'none'}, accept: ${banner.accept || 'none'}, settings: ${banner.settings || 'none'}`, c: '' };
    const B = capture.B;
    const C = capture.C;
    if (!banner.reject && !banner.accept && !banner.settings) {
      add('consent-banner-not-operable', 'could_not_check', [bannerEv, ...shotEv]);
    } else if (B && B.ran && B.bannerAfter) {
      // The banner came back after the reload, so the choice was not stored.
      // What loaded then is a fresh first visit, not the result of Reject.
      add('reject-not-checked', 'could_not_check', [bannerEv, ...choiceEv(B), { k: 'banner', a: 'After reload', b: 'the banner was back, so the choice was not stored', c: '' }, ...(B.shot ? [{ k: 'shot', a: B.shot, b: '', c: '' }] : [])], { reason: 'banner-returned', attempted: B.attempted || 'reject', pressed: B.pressed || '' });
    } else if (B && B.ran) {
      const reqB = B.requests.map((r) => classifyRequest(r, siteHost));
      const ckB = (B.newCookies || []).map((c) => classifyCookie(c, siteHost));
      const tb = trackerSet(reqB, ckB);
      // A tracker key that appears after Reject, and not before any choice, was written after the choice.
      const keysA = new Set([...storageA.local, ...storageA.session]);
      const storageB = B.storage || EMPTY_STORAGE;
      const newTrackerKeys = [...storageB.local, ...storageB.session].filter((k) => !keysA.has(k) && cookieIsTracker(identifyCookie(k)));
      if (tb.any || newTrackerKeys.length) add('tracker-after-reject', 'observed', [bannerEv, ...uniqueBy(tb.reqs, (r) => r.host).slice(0, 8).map(evReq), ...uniqueBy(tb.cks, (c) => c.name).slice(0, 6).map((c) => evCookie(c, now)), ...newTrackerKeys.slice(0, 6).map((k) => evStorage(k, storageB))], { vendors: [...new Set([...tb.names, ...newTrackerKeys.map((k) => identifyCookie(k)?.platform || k)])] });
      if (B.layer === 2) add('reject-second-layer', 'observed', [bannerEv, { k: 'banner', a: 'Reject found after', b: `pressing ${banner.settings}`, c: '2 clicks' }]);
      panes.push(paneChoice('B', reqB, B.cookies.map((c) => classifyCookie(c, siteHost)), storageB, siteHost, `Pressed ${B.control}${B.layer === 2 ? ' after opening settings' : ''} (tested ${B.attempted || 'reject'}, pressed ${B.pressed || 'reject'}), then reloaded.`, now, evidenceMarks(outcomes.slice(beforeChoices))));
    } else if (B && !B.ran && B.reason === 'no-control' && banner.accept) {
      add('no-reject-option', 'observed', [bannerEv, ...(B.shot ? [{ k: 'shot', a: B.shot, b: '', c: '' }] : shotEv)]);
    } else {
      add('reject-not-checked', 'could_not_check', [bannerEv, ...(B ? choiceEv(B) : []), { k: 'browser', a: 'Reject run', b: B ? (B.error || B.reason) : 'not run', c: '' }, ...(B?.shot ? [{ k: 'shot', a: B.shot, b: '', c: '' }] : shotEv)], { reason: B ? B.reason || 'error' : 'not-run', attempted: B?.attempted || 'reject', pressed: B?.pressed || 'none', optionalOn: B?.optionalOn || [] });
    }
    if (C && C.ran) {
      panes.push(paneChoice('C', C.requests.map((r) => classifyRequest(r, siteHost)), C.cookies.map((c) => classifyCookie(c, siteHost)), C.storage || EMPTY_STORAGE, siteHost, `Pressed ${C.control}, then reloaded. This is what visitors get after they agree.`, now));
    } else if (banner.accept) {
      add('accept-not-checked', 'could_not_check', [bannerEv, { k: 'browser', a: 'Accept run', b: C ? (C.error || C.reason) : 'not run', c: '' }]);
    }
  }

  // Which checks this run completed. A finding from an earlier run counts as
  // fixed only when its check is in this list.
  const checked = ['browser'];
  if (vantageOk) checked.push('consent-order');
  // A state with a failed request that could have been optional is
  // inconclusive: we cannot say what would have loaded had it arrived.
  // A store that could not be read is inconclusive too, and a banner that
  // came back after reload means the choice was never stored.
  const inconclusive = (st) => (st.storage?.unreadable || []).length > 0 || st.requests.some((r) => {
    const c = classifyRequest(r, siteHost);
    return !c.loaded && (c.tracker || c.cookieless || (!c.first && !c.vendor));
  });
  if (capture.B?.ran && !capture.B.bannerAfter && !inconclusive(capture.B)) checked.push('reject');
  if (capture.C?.ran && !inconclusive(capture.C)) checked.push('accept');
  // An EU run with no banner and nothing optional before a choice has no
  // Reject or Accept to press. That retires old reject and accept findings,
  // with the reason kept so the report can say why.
  const optional = reqA.some((r) => r.tracker || r.cookieless || (!r.first && !r.vendor)) || t.cks.length > 0 || trackerStorage.length > 0 || storageUnknown.length > 0 || unreadable.length > 0;
  const retired = {};
  if (!banner && vantage?.eu && !optional) {
    for (const group of ['reject', 'accept']) {
      if (checked.includes(group)) continue;
      checked.push(group);
      retired[group] = 'An EU run saw no banner and nothing optional before a choice, so there is no Reject or Accept left to check.';
    }
  }

  // A finding can only be called fixed when the page it was on loaded in this
  // run (okPages) and no request that could have produced it failed
  // (uncertain). A 503 for a font or a blocked tracker is a gap, not a fix.
  const okPages = [...new Set(pages.map((p) => pathOf(p.url)))];
  const failedA = reqA.filter((r) => !r.loaded);
  const uncertain = new Set();
  if (failedA.some((r) => r.tracker)) { uncertain.add('tracker-before-choice'); uncertain.add('consent-mode-denied-pings'); }
  if (failedA.some((r) => r.cookieless)) uncertain.add('cookieless-analytics-before-choice');
  if (failedA.some((r) => r.vendor?.purpose === 'fonts')) uncertain.add('third-party-fonts');
  if (failedA.some((r) => r.vendor?.id === 'youtube')) uncertain.add('youtube-embed');
  if (failedA.some((r) => r.vendor?.purpose === 'maps')) uncertain.add('maps-embed');
  if (failedA.some((r) => !r.first && !r.vendor)) uncertain.add('unidentified-third-party');
  if (unreadable.length) { uncertain.add('storage-unknown-before-choice'); uncertain.add('tracker-before-choice'); }

  const stack = [...new Set(pages.flatMap((p) => p.stack || []))];
  return { outcomes, panes, stack, pages: pages.length, banner, checked, okPages, uncertain: [...uncertain], retired };
}

// Pane rows have three states. bad: a tracker that arrived, or the evidence
// of an observed finding. check: the evidence of a finding that needs the
// owner's answer, a specialist, or a recheck. ok: nothing in the report is
// about it. A row the report asks about is never shown as fine.
export const ROW_STATES = ['ok', 'check', 'bad'];
const SEVERITY = { ok: 0, check: 1, bad: 2 };
const worse = (a, b) => (SEVERITY[b] > SEVERITY[a] ? b : a);
const OPEN_STATES = new Set(['observed', 'could_not_check', 'needs_your_answer', 'needs_a_specialist']);
const NO_MARKS = { hosts: new Map(), urls: new Map(), names: new Map() };

/** For each host, request URL and stored name, the worst open finding that cites it. */
function evidenceMarks(outs) {
  const marks = { hosts: new Map(), urls: new Map(), names: new Map() };
  const put = (m, k, st) => { if (k) m.set(k, worse(m.get(k) || 'ok', st)); };
  for (const o of outs) {
    if (!OPEN_STATES.has(o.state)) continue;
    const st = o.state === 'observed' ? 'bad' : 'check';
    for (const e of o.evidence || []) {
      if (e.k === 'request') { put(marks.hosts, e.a, st); put(marks.urls, String(e.b).replace(/\.\.\.$/, ''), st); }
      else if (e.k === 'iframe') { try { put(marks.hosts, new URL(e.b).hostname, st); } catch { /* not a URL */ } }
      else if (e.k === 'cookie' || e.k === 'storage') put(marks.names, e.a, st);
    }
  }
  return marks;
}

const urlMark = (url, marks) => [...marks.urls].reduce((st, [k, v]) => (url.startsWith(k) ? worse(st, v) : st), 'ok');

// A red dot means a tracker that arrived. Cookies have no loaded flag, because
// a cookie that exists was stored.
const arrived = (x) => x.loaded !== false;

/**
 * The state a row gets from what it is, before any finding marks it. In A,
 * and in B after Reject, cookieless analytics, unidentified third parties and
 * unidentified storage are open questions in the report, so they are check.
 * In C the visitor agreed, so only the findings can mark a row.
 */
function classify(mode) {
  const open = mode === 'A' || mode === 'B';
  return {
    request: (r) => (open && r.tracker && arrived(r) ? 'bad' : open && r.loaded && (r.cookieless || (!r.first && !r.vendor)) ? 'check' : 'ok'),
    cookie: (c) => (open && c.tracker ? 'bad' : open && c.first && !c.info ? 'check' : 'ok'),
    key: (k) => (open && cookieIsTracker(identifyCookie(k)) ? 'bad' : open && !identifyCookie(k) ? 'check' : 'ok'),
    other: () => (open ? 'check' : 'ok'),
  };
}

function storageRows(cookies, storage, cls, marks, now) {
  const rows = cookies.map((c) => [`cookie, ${c.first ? '1st' : '3rd'} party`, `${c.name} (${lifetime(c.expires, now)})`, worse(cls.cookie(c), marks.names.get(c.name) || 'ok')]);
  for (const k of storage.local) rows.push(['localStorage', k, worse(cls.key(k), marks.names.get(k) || 'ok')]);
  for (const k of storage.session) rows.push(['sessionStorage', k, worse(cls.key(k), marks.names.get(k) || 'ok')]);
  for (const k of storage.unreadable || []) rows.push([k, 'could not be read', 'check']);
  for (const k of storage.idb) rows.push(['IndexedDB', k, worse(cls.other(), marks.names.get(k) || 'ok')]);
  for (const k of storage.sw) rows.push(['service worker', k, worse(cls.other(), marks.names.get(k) || 'ok')]);
  return rows.slice(0, 40);
}

function requestRows(reqs, siteHost, cls, marks) {
  const third = bestBy(reqs.filter((r) => !r.first), (r) => r.host);
  const label = (r) => (r.vendor ? `${r.vendor.name}, ${r.vendor.purpose}` : 'unidentified third party') + (r.loaded ? '' : ', did not load');
  const rows = third.map((r) => [r.host, label(r), worse(cls.request(r), marks.hosts.get(r.host) || 'ok')]);
  const firstN = reqs.filter((r) => r.first).length;
  const firstTracker = reqs.filter((r) => r.first && r.vendor);
  for (const r of bestBy(firstTracker, (x) => x.vendor.id)) rows.push([`${siteHost}${new URL(r.url).pathname}`, label(r), worse(cls.request(r), urlMark(r.url, marks))]);
  if (firstN) rows.unshift([siteHost, `first party, ${firstN} requests`, 'ok']);
  return rows.slice(0, 40);
}

/** Counts for a pane note: trackers alone, other findings, and open questions. */
function paneCounts(reqs, cookies, storage, siteHost, mode, marks, now) {
  const cls = classify(mode);
  const requests = requestRows(reqs, siteHost, cls, marks);
  const storageR = storageRows(cookies, storage, cls, marks, now);
  const rows = [...requests, ...storageR];
  // Trackers are counted from what they are, so a font finding is not called a tracker.
  const trackerRows = [...requestRows(reqs, siteHost, cls, NO_MARKS), ...storageRows(cookies, storage, cls, NO_MARKS, now)].filter((r) => r[2] === 'bad').length;
  const bad = rows.filter((r) => r[2] === 'bad').length;
  return { requests, storage: storageR, trackers: trackerRows, otherBad: Math.max(0, bad - trackerRows), check: rows.filter((r) => r[2] === 'check').length };
}

function countNote(c, when) {
  const parts = [];
  if (c.trackers) parts.push(`${c.trackers} tracker items loaded ${when}.`);
  if (c.otherBad) parts.push(`${c.otherBad} more ${c.otherBad > 1 ? 'items are findings' : 'item is a finding'} in the report.`);
  if (c.check) parts.push(`${c.check} ${c.check > 1 ? 'items need' : 'item needs'} your answer or a specialist.`);
  return parts.join(' ');
}

function paneA(reqs, cookies, storage, siteHost, banner, vantage, now, marks = NO_MARKS) {
  const c = paneCounts(reqs, cookies, storage, siteHost, 'A', marks, now);
  const where = vantage?.eu ? '' : ` Run from ${vantage?.country || 'an unknown place'}, outside the EU.`;
  const counted = countNote(c, 'before any choice');
  const note = (banner ? `A banner appeared${banner.cmp ? ` (${banner.cmp.name})` : ''}.` : 'No banner appeared.') + (counted ? ` ${counted}` : ' No known tracker loaded before a choice.') + where;
  return { id: 'A', label: 'No choice yet', sub: 'First load, nothing pressed', note, requests: c.requests, storage: c.storage };
}

function paneChoice(id, reqs, cookies, storage, siteHost, note, now, marks = NO_MARKS) {
  const isReject = id === 'B';
  const c = paneCounts(reqs, cookies, storage, siteHost, isReject ? 'B' : 'C', marks, now);
  const counted = isReject ? countNote({ ...c, trackers: c.trackers }, 'after Reject').replace(/tracker items loaded after Reject/, 'tracker items still loaded after Reject') : '';
  return {
    id,
    label: isReject ? 'Rejected' : 'Accepted',
    sub: isReject ? 'A fresh browser, then Reject' : 'A fresh browser, then Accept',
    note: note + (isReject ? (counted ? ` ${counted}` : ' No known tracker loaded after Reject.') : ''),
    requests: c.requests,
    storage: c.storage,
  };
}
