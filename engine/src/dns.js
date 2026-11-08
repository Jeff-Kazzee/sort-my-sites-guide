// Email and DNS checks over DNS-over-HTTPS. The resolver is injectable, so
// tests run against a fixed zone map and never touch the network.

import { randomBytes } from 'node:crypto';
import { isIPv4, isIPv6 } from 'node:net';
import { registrableDomain } from './domain.js';

const TYPE_NUM = { A: 1, CNAME: 5, SOA: 6, MX: 15, TXT: 16, AAAA: 28 };
const bareName = (n) => String(n || '').toLowerCase().replace(/\.$/, '');
const STATUS = { 0: 'NOERROR', 2: 'SERVFAIL', 3: 'NXDOMAIN' };

export const DOH_RESOLVERS = [
  { name: 'Cloudflare', url: 'https://cloudflare-dns.com/dns-query' },
  { name: 'Google', url: 'https://dns.google/resolve' },
];

export const DKIM_SELECTORS = [
  'google', 'selector1', 'selector2', 'default', 'dkim', 'mail', 'k1', 'k2', 'k3', 's1', 's2',
  'fm1', 'fm2', 'fm3', 'zoho', 'zmail', 'protonmail', 'protonmail2', 'protonmail3', 'resend',
  'mxvault', 'smtp', 'hs1', 'hs2', 'mandrill', 'mte1', 'pm', 'everlytickey1', 'sig1', 'key1', 'dk',
];

/** Join the quoted pieces of a TXT answer: "v=spf1 a" "b" becomes "v=spf1 ab". */
export function joinTxt(data) {
  const parts = String(data).match(/"((?:[^"\\]|\\.)*)"/g);
  if (!parts) return String(data);
  return parts.map((p) => p.slice(1, -1).replace(/\\(.)/g, '$1')).join('');
}

async function dohQuery(resolver, name, type) {
  const url = `${resolver.url}?name=${encodeURIComponent(name)}&type=${type}`;
  const res = await fetch(url, { headers: { accept: 'application/dns-json' }, signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error(`${resolver.name} answered HTTP ${res.status}`);
  const body = await res.json();
  const want = TYPE_NUM[type];
  const answers = (body.Answer || []).filter((a) => a.type === want || a.type === TYPE_NUM.CNAME)
    .map((a) => ({ type: a.type === TYPE_NUM.CNAME ? 'CNAME' : type, name: bareName(a.name), data: type === 'TXT' && a.type === want ? joinTxt(a.data) : a.data, ttl: a.TTL }));
  // The SOA in the authority section names the zone that holds the queried name.
  const authority = (body.Authority || []).filter((a) => a.type === TYPE_NUM.SOA).map((a) => bareName(a.name));
  return { status: STATUS[body.Status] || `RCODE${body.Status}`, answers, authority };
}

/**
 * A resolver that asks Cloudflare and Google and records whether they agree.
 * @returns {{ resolve(name: string, type: string): Promise<{status: string, answers: {type: string, data: string, ttl?: number}[], agree?: boolean, error?: string}>, names: string[] }}
 */
export function dohResolver(resolvers = DOH_RESOLVERS) {
  return {
    names: resolvers.map((r) => r.name),
    async resolve(name, type) {
      const results = await Promise.allSettled(resolvers.map((r) => dohQuery(r, name, type)));
      const ok = results.filter((r) => r.status === 'fulfilled').map((r) => r.value);
      if (!ok.length) return { status: 'ERROR', answers: [], error: results.map((r) => r.reason?.message).join('; ') };
      const key = (r) => r.status + '|' + r.answers.filter((a) => a.type === type).map((a) => a.data).sort().join(',');
      return { ...ok[0], agree: ok.every((r) => key(r) === key(ok[0])) };
    },
  };
}

/**
 * A resolver over a fixed zone map, for tests. Keys are "name|TYPE".
 * A key "*.domain|TYPE" answers every name under domain that has no record.
 * A key "zone|SOA" makes zone the DNS zone of every name at or under it, as
 * the authority section of a real answer does.
 */
export function mockResolver(zones) {
  return {
    names: ['fixture zone'],
    async resolve(name, type) {
      const n = name.toLowerCase().replace(/\.$/, '');
      if (type === 'SOA') {
        const labels = n.split('.');
        const apex = labels.map((_, i) => labels.slice(i).join('.')).find((z) => zones[`${z}|SOA`]);
        const exists = Object.keys(zones).some((k) => k.startsWith(n + '|'));
        if (!apex) return { status: exists ? 'NOERROR' : 'NXDOMAIN', answers: [], authority: [], agree: true };
        if (apex === n) return { status: 'NOERROR', answers: zones[`${n}|SOA`].map((data) => ({ type, name: n, data })), authority: [], agree: true };
        return { status: exists ? 'NOERROR' : 'NXDOMAIN', answers: [], authority: [apex], agree: true };
      }
      if (zones[`${n}|${type}`]) return { status: 'NOERROR', answers: zones[`${n}|${type}`].map((data) => ({ type, data })), agree: true };
      const labels = n.split('.');
      for (let i = 1; i < labels.length - 1; i++) {
        const wild = `*.${labels.slice(i).join('.')}|${type}`;
        if (zones[wild]) return { status: 'NOERROR', answers: zones[wild].map((data) => ({ type, data })), agree: true };
      }
      const exists = Object.keys(zones).some((k) => k.startsWith(n + '|'));
      return { status: exists ? 'NOERROR' : 'NXDOMAIN', answers: [], agree: true };
    },
  };
}

const txtOf = (r) => r.answers.filter((a) => a.type === 'TXT').map((a) => a.data);

/** Parse an SPF record into terms. Unknown terms are syntax errors. */
export function parseSpf(record) {
  const terms = record.trim().split(/\s+/).slice(1);
  // terms holds what an evaluation can reach. RFC 7208 section 5.1: mechanisms
  // after "all" are never tested, so they cost no lookups.
  const out = { terms: [], errors: [], all: null, redirect: null, ignored: [], afterAll: 0 };
  const seenModifiers = new Set();
  for (const t of terms) {
    const m = t.match(/^([+\-~?]?)(all|include|a|mx|ptr|ip4|ip6|exists)(?=$|[:/])(.*)$/i);
    const mod = t.match(/^([a-z][a-z0-9_.-]*)=(.*)$/i);
    if (m) {
      const q = m[1] || '+';
      const mech = m[2].toLowerCase();
      // A term with an invalid argument makes the record a permerror (RFC
      // 7208 section 4.6.1). It is reported and never evaluated, so
      // "all:x" is never read as an all-pass policy.
      const problem = spfArgProblem(mech, m[3]);
      if (problem) { out.errors.push(`"${t}" ${problem}`); continue; }
      if (out.all !== null) { out.afterAll++; continue; }
      if (mech === 'all') out.all = q;
      out.terms.push({ q, mech, value: m[3].startsWith(':') ? m[3].slice(1).split('/')[0] : '' });
    } else if (mod) {
      // Section 6: redirect and exp are defined, each at most once, and each
      // needs a domain. Any other modifier is ignored.
      const name = mod[1].toLowerCase();
      if (name === 'redirect' || name === 'exp') {
        if (!isDomainSpec(mod[2])) out.errors.push(`"${t}" has no valid target`);
        else if (seenModifiers.has(name)) out.errors.push(`"${t}" repeats the ${name} modifier`);
        else if (name === 'redirect') out.redirect = mod[2];
        seenModifiers.add(name);
      } else {
        out.ignored.push(t);
      }
    } else {
      out.errors.push(`"${t}" is not a valid SPF term`);
    }
  }
  // Section 6.1: redirect is ignored when the record has an "all" mechanism.
  if (out.all !== null) out.redirect = null;
  return out;
}

// RFC 7208 section 7.1 grammar:
//   domain-spec   = macro-string domain-end
//   domain-end    = ( "." toplabel [ "." ] ) / macro-expand
//   macro-string  = *( macro-expand / macro-literal )
//   macro-expand  = ( "%{" macro-letter transformers *delimiter "}" ) / "%%" / "%_" / "%-"
//   macro-literal = visible characters except "%"
//   macro-letter  = s l o d i p h c r t v,  transformers = *DIGIT [ "r" ]
//   delimiter     = . - + , / _ =
// Section 7.2 allows c, r and t only in explanation text, never in a
// domain-spec. Section 7.3: a digit transformer must be nonzero.
const MACRO_EXPAND = /%\{[slodiphv](?:[1-9]\d*)?r?[.\-+,/_=]*\}|%[%_-]/iy;
const TOPLABEL = /^(?:[a-z0-9]*[a-z][a-z0-9]*|[a-z0-9]+-[a-z0-9-]*[a-z0-9])$/i;

/** Split a macro-string into tokens, or null when it breaks the grammar. */
function macroTokens(s) {
  const out = [];
  let i = 0;
  while (i < s.length) {
    if (s[i] === '%') {
      MACRO_EXPAND.lastIndex = i;
      const m = MACRO_EXPAND.exec(s);
      if (!m) return null;
      out.push({ macro: true, text: m[0] });
      i += m[0].length;
    } else {
      const c = s.charCodeAt(i);
      if (c < 0x21 || c > 0x7e) return null;
      out.push({ macro: false, text: s[i] });
      i++;
    }
  }
  return out;
}

/** True when s is a domain-spec (RFC 7208 section 7.1). */
export function isDomainSpec(s) {
  const tokens = macroTokens(String(s || ''));
  if (!tokens || !tokens.length) return false;
  if (tokens[tokens.length - 1].macro) return true;
  // Otherwise it must end in "." toplabel, with an optional final dot. The
  // toplabel is made of literals only.
  let lits = '';
  for (let k = tokens.length - 1; k >= 0 && !tokens[k].macro; k--) lits = tokens[k].text + lits;
  const body = lits.endsWith('.') ? lits.slice(0, -1) : lits;
  const dot = body.lastIndexOf('.');
  if (dot < 0) return false;
  return TOPLABEL.test(body.slice(dot + 1));
}

const prefixOk = (s, max) => /^\d{1,3}$/.test(s) && Number(s) <= max;
const domainArg = (arg) => arg.startsWith(':') && isDomainSpec(arg.slice(1));

/**
 * What is wrong with a mechanism's argument, or '' when it is valid. RFC 7208
 * sections 5.1 to 5.7: all takes none, include and exists need a domain, a
 * and mx take an optional domain and prefix lengths, ip4 and ip6 need an
 * address with an optional prefix length, ptr takes an optional domain.
 */
function spfArgProblem(mech, arg) {
  if (mech === 'all') return arg ? 'takes no argument' : '';
  if (mech === 'include' || mech === 'exists') return domainArg(arg) ? '' : (arg ? 'has an invalid domain' : 'has no domain');
  if (mech === 'ptr') return !arg || domainArg(arg) ? '' : 'has an invalid domain';
  if (mech === 'a' || mech === 'mx') {
    // The domain may hold "/" inside a macro, so the prefix lengths are read
    // from the end.
    const mm = arg.match(/^(?::(.+?))?(?:\/(\d+))?(?:\/\/(\d+))?$/);
    if (!mm) return 'has an invalid argument';
    if (mm[1] !== undefined && !isDomainSpec(mm[1])) return 'has an invalid domain';
    if (mm[2] !== undefined && !prefixOk(mm[2], 32)) return 'has an invalid IPv4 prefix length';
    if (mm[3] !== undefined && !prefixOk(mm[3], 128)) return 'has an invalid IPv6 prefix length';
    return '';
  }
  if (mech === 'ip4') {
    const mm = arg.match(/^:([^/]+)(?:\/(\d+))?$/);
    if (!mm || !isIPv4(mm[1])) return 'needs a valid IPv4 address';
    return mm[2] === undefined || prefixOk(mm[2], 32) ? '' : 'has an invalid IPv4 prefix length';
  }
  if (mech === 'ip6') {
    const body = arg.startsWith(':') ? arg.slice(1) : '';
    const slash = body.lastIndexOf('/');
    const addr = slash < 0 ? body : body.slice(0, slash);
    // Node accepts a zone such as "%eth0", which SPF does not (section 5.6).
    if (!addr || addr.includes('%') || !isIPv6(addr)) return 'needs a valid IPv6 address';
    return slash < 0 || prefixOk(body.slice(slash + 1), 128) ? '' : 'has an invalid IPv6 prefix length';
  }
  return '';
}

/** Rules about SPF. A failed include lookup leaves all of them unconfirmed. */
export const SPF_RULES = ['spf-missing', 'spf-multiple', 'spf-too-many-lookups', 'spf-allows-anyone', 'spf-neutral', 'spf-syntax', 'spf-unreadable', 'no-mail-lock-incomplete'];

/** True only for the record that authorises no sender at all. */
export function spfAuthorisesNobody(record) {
  return /^v=spf1\s+-all$/i.test(String(record || '').trim().replace(/\s+/g, ' '));
}

async function getSpf(resolver, domain) {
  const r = await resolver.resolve(domain, 'TXT');
  return { status: r.status, records: txtOf(r).filter((t) => /^v=spf1(\s|$)/i.test(t)) };
}

const LOOKUP_TERMS = new Set(['include', 'a', 'mx', 'ptr', 'exists']);
const COUNT_CEILING = 40;

/**
 * Count the DNS lookups an SPF check can need, following include and redirect.
 *
 * The count follows the worst evaluation path that can happen: terms are
 * evaluated in order (RFC 7208 section 4.6.2), and no mechanism matches
 * unless it must. Two kinds of term must match and end the evaluation, so
 * nothing after them is counted: "all", and an include whose record passes
 * every sender (section 5.2, include matches when the included check passes).
 * An include reached on two paths is counted on both (section 4.6.4). Only a
 * domain that repeats on its own path is a loop.
 *
 * alwaysPass is true when every path through this record ends in pass, so an
 * include of it always matches. passVia names the include that makes it so.
 */
export async function countSpfLookups(resolver, domain, record, path = [domain], state = { count: 0 }) {
  const parsed = parseSpf(record);
  const notes = [];
  state.tempErrors ||= [];
  state.permErrors ||= [];
  const done = (alwaysPass, passVia = '') => {
    if (path.length === 1 && state.count > COUNT_CEILING) notes.push(`Counting stopped after ${COUNT_CEILING} lookups.`);
    return { count: state.count, notes: [...new Set(notes)], alwaysPass, passVia, tempErrors: [...new Set(state.tempErrors)], permErrors: [...new Set(state.permErrors)] };
  };
  const follow = async (target) => {
    if (path.includes(target)) { notes.push(`${target} includes itself through ${path.join(' > ')}`); return null; }
    // A target with a macro depends on the message being checked, so it can
    // only be looked up after expansion (section 5.2). It is counted, not
    // followed, and is never an error.
    if (target.includes('%')) { notes.push(`${target} uses a macro, so its record depends on each message and was not followed.`); return null; }
    if (state.count > COUNT_CEILING) return null;
    const sub = await getSpf(resolver, target);
    // Any answer other than NOERROR or NXDOMAIN (SERVFAIL, REFUSED as RCODE5,
    // a timeout, an unknown code) is a temporary error (RFC 7208 section
    // 5.2). It leaves the SPF result unknown, so nothing is closed by it.
    if (sub.status !== 'NOERROR' && sub.status !== 'NXDOMAIN') {
      state.tempErrors.push(`${target}: ${sub.status}`);
      notes.push(`The lookup of ${target} failed (${sub.status}), so SPF cannot be judged in this run.`);
      return null;
    }
    // An include or redirect target with no SPF record, or more than one, is
    // a permanent error (sections 4.5, 5.2 and 6.1). Receivers treat the
    // whole record as broken.
    if (sub.records.length !== 1) {
      const why = `the SPF target ${target} has ${sub.records.length ? 'more than one SPF record' : 'no SPF record'}`;
      state.permErrors.push(why);
      notes.push(why);
      return null;
    }
    const inner = await countSpfLookups(resolver, target, sub.records[0], [...path, target], state);
    notes.push(...inner.notes);
    return inner;
  };
  // While every term so far would give pass on a match, this record can only pass.
  let onlyPass = true;
  for (const t of parsed.terms) {
    if (t.mech === 'all') return done(onlyPass && t.q === '+');
    if (LOOKUP_TERMS.has(t.mech)) state.count++;
    if (t.mech === 'include' && t.value) {
      const inner = await follow(t.value);
      if (inner && inner.alwaysPass) {
        notes.push(`include:${t.value} passes every sender, so the terms after it are never evaluated.`);
        return done(onlyPass && t.q === '+', inner.passVia || t.value);
      }
    }
    if (t.q !== '+') onlyPass = false;
  }
  if (parsed.redirect) {
    state.count++;
    const inner = await follow(parsed.redirect);
    return done(onlyPass && !!inner?.alwaysPass, inner?.passVia || (inner?.alwaysPass ? parsed.redirect : ''));
  }
  return done(false);
}

// DMARC follows RFC 9989 (May 2026), which obsoletes RFC 7489 and RFC 9091.
// The RFC 7489 reading is kept beside it, because receivers that have not
// moved still use it, and the two can disagree (RFC 9989 Appendix C.3).

/** Tags RFC 9989 removed (Appendix C.5.2). A rebuild keeps them, a fix never adds them. */
export const LEGACY_DMARC_TAGS = ['pct', 'rf', 'ri'];

/**
 * Rebuild a DMARC record from its existing tags, changing only what `change`
 * names. Every other tag the owner set stays, in its order, so a fix never
 * drops sp, np, t, psd, adkim, aspf, rua, ruf or fo. The legacy pct, rf and
 * ri stay too, because older receivers still read them. A change set to
 * undefined removes that tag.
 */
export function rebuildDmarc(tags, change) {
  // RFC 9989 section 4.7: v must be the first tag. p follows it by
  // convention. The key order of the rest is kept.
  const out = { v: 'DMARC1', p: undefined };
  for (const [k, v] of Object.entries(tags || {})) if (k !== 'v') out[k] = v;
  const c = { ...change };
  for (const k of LEGACY_DMARC_TAGS) if (!Object.hasOwn(tags || {}, k)) delete c[k];
  Object.assign(out, c);
  return Object.entries(out).filter(([, v]) => v !== undefined && v !== '').map(([k, v]) => `${k}=${v}`).join('; ') + ';';
}

/** Parse "v=DMARC1; p=none; rua=..." into a tag map. */
export function parseDmarc(record) {
  const tags = {};
  for (const part of record.split(';')) {
    const [k, ...v] = part.split('=');
    if (k && v.length) tags[k.trim().toLowerCase()] = v.join('=').trim();
  }
  return tags;
}

export const POLICY_STRENGTH = { none: 0, quarantine: 1, reject: 2 };
const ONE_LOWER = { reject: 'quarantine', quarantine: 'none', none: 'none' };
const policyOf = (p) => String(p ?? '').trim().toLowerCase();
const validPolicy = (p) => Object.hasOwn(POLICY_STRENGTH, policyOf(p));
export const policyStrength = (p) => POLICY_STRENGTH[policyOf(p)] ?? -1;
// RFC 9989 section 4.7: v must be the first tag, and its value is exactly
// "DMARC1", case sensitive. Any other record is ignored.
const isDmarc = (t) => /^v\s*=\s*DMARC1\s*(;|$)/.test(String(t).trim());
const looksLikeDmarc = (t) => /^v\s*=\s*dmarc1/i.test(String(t).trim());
// A lookup either answered (the name has records or does not exist) or failed.
const lookupFailed = (r) => r.status !== 'NOERROR' && r.status !== 'NXDOMAIN';
const failText = (name, r) => `${name}: ${r.error || r.status}`;

/** True when rua lists at least one syntactically valid URI (RFC 9989 section 4.10.1). */
const hasValidRua = (tags) => String(tags.rua ?? '').split(',').some((u) => /^[a-z][a-z0-9+.-]*:[^\s,!]+/i.test(u.trim()));

/**
 * The policy a record asks for at one domain, per RFC 9989 section 4.10.1.
 * `self` is true when the record is the domain's own. Otherwise sp applies to
 * an existing subdomain and np to a name that does not exist (section 4.7).
 * A record with no valid p, or with an sp or np that is not valid, counts as
 * p=none when rua is valid, and as no DMARC at all otherwise. t=y asks
 * receivers to apply one level lower (section 4.7). `legacy` reads the record
 * as RFC 7489 did, with no np and no t.
 * @returns {{ requested: string|null, applied: string|null, via: string|null, testing: boolean, invalid: string }}
 */
export function policyFrom(tags, { self, exists = true, legacy = false }) {
  const bad = !validPolicy(tags.p) ? 'p' : tags.sp !== undefined && !validPolicy(tags.sp) ? 'sp' : !legacy && tags.np !== undefined && !validPolicy(tags.np) ? 'np' : '';
  if (bad) {
    const requested = hasValidRua(tags) ? 'none' : null;
    return { requested, applied: requested, via: requested ? 'p' : null, testing: false, invalid: bad };
  }
  const via = self ? 'p' : !legacy && !exists && tags.np !== undefined ? 'np' : tags.sp !== undefined ? 'sp' : 'p';
  const requested = policyOf(tags[via]);
  const testing = !legacy && policyOf(tags.t) === 'y' && requested !== 'none';
  return { requested, applied: testing ? ONE_LOWER[requested] : requested, via, testing, invalid: '' };
}

/**
 * RFC 9989 section 4.10: the names a DNS Tree Walk asks for, starting with
 * `domain` itself. A name with more than eight labels jumps to its last
 * seven (step 4), so the walk makes at most eight queries.
 */
export function treeWalkNames(domain) {
  const labels = domain.split('.');
  const names = [domain];
  for (let rest = labels.slice(Math.max(1, labels.length - 7)); rest.length; rest = rest.slice(1)) names.push(rest.join('.'));
  return names;
}

/**
 * RFC 9989 section 4.10.2: pick the Organizational Domain from the records a
 * walk from `start` found, longest name first. psd=n marks it, psd=y marks
 * the name one label below, and otherwise the record with the fewest labels
 * wins. With no record at all, `start` is its own Organizational Domain.
 */
export function organizationalDomain(start, found) {
  for (const f of found) {
    const psd = policyOf(f.tags.psd);
    if (psd === 'n') return f.name;
    if (psd === 'y' && f.name !== start) return start.split('.').slice(-(f.name.split('.').length + 1)).join('.');
  }
  return found.length ? found[found.length - 1].name : start;
}

/** RFC 9989 section 4.10 steps 2 and 6: keep the record only when exactly one DMARC record answers. */
const singleDmarc = (r) => {
  const recs = txtOf(r).filter(isDmarc);
  return recs.length === 1 ? recs[0] : null;
};

/**
 * DMARC policy discovery, RFC 9989 section 4.10.1. The policy record is the
 * domain's own, else its Organizational Domain's, else its PSD's. `lookup`
 * answers TXT queries. A failed query anywhere in the walk returns `error`,
 * because a record at that name could change the answer, so the policy is
 * unknown, never missing.
 */
export async function discoverDmarc(domain, lookup, exists) {
  const queried = [];
  const ask = async (name) => {
    queried.push(`_dmarc.${name}`);
    return lookup(`_dmarc.${name}`);
  };
  const own = await ask(domain);
  if (lookupFailed(own)) return { error: failText(`_dmarc.${domain}`, own), queried };
  const mine = singleDmarc(own);
  if (mine) {
    const tags = parseDmarc(mine);
    return { source: 'own', domain, from: `_dmarc.${domain}`, record: mine, tags, org: null, queried, ...policyFrom(tags, { self: true }) };
  }
  // The walk starts at the parent (section 4.10.1) and stops early only at a
  // record with psd=y or psd=n (section 4.10, step 6).
  const found = [];
  for (const name of treeWalkNames(domain).slice(1)) {
    const r = await ask(name);
    if (lookupFailed(r)) return { error: failText(`_dmarc.${name}`, r), queried };
    const rec = singleDmarc(r);
    if (!rec) continue;
    const tags = parseDmarc(rec);
    found.push({ name, record: rec, tags });
    if (['y', 'n'].includes(policyOf(tags.psd))) break;
  }
  const org = organizationalDomain(domain, found);
  // The section 4.10.1 note: a PSD policy applies only when the
  // Organizational Domain publishes no record.
  const at = found.find((f) => f.name === org) || found.find((f) => policyOf(f.tags.psd) === 'y');
  if (!at) return { source: 'none', domain: null, from: null, org, queried, requested: null, applied: null, via: null };
  return { source: at.name === org ? 'org' : 'psd', domain: at.name, from: `_dmarc.${at.name}`, record: at.record, tags: at.tags, org, queried, ...policyFrom(at.tags, { self: false, exists }) };
}

/**
 * The RFC 7489 reading (section 6.6.3), for receivers that still use it. The
 * Organizational Domain comes from registrableDomain, which uses this
 * engine's short suffix list, not the full Public Suffix List. Under RFC
 * 7489, more than one record at the domain ends discovery with no policy.
 */
export async function legacyDmarc(domain, lookup) {
  const org = registrableDomain(domain);
  const own = await lookup(`_dmarc.${domain}`);
  if (lookupFailed(own)) return { error: failText(`_dmarc.${domain}`, own), org };
  const mine = txtOf(own).filter(isDmarc);
  if (mine.length > 1) return { source: 'own', domain, from: `_dmarc.${domain}`, org, requested: null, applied: null, via: null };
  if (mine.length === 1) {
    const tags = parseDmarc(mine[0]);
    return { source: 'own', domain, from: `_dmarc.${domain}`, record: mine[0], tags, org, ...policyFrom(tags, { self: true, legacy: true }) };
  }
  if (org === domain) return { source: 'none', domain: null, from: null, org, requested: null, applied: null, via: null };
  const r = await lookup(`_dmarc.${org}`);
  if (lookupFailed(r)) return { error: failText(`_dmarc.${org}`, r), org };
  const rec = singleDmarc(r);
  if (!rec) return { source: 'none', domain: null, from: null, org, requested: null, applied: null, via: null };
  const tags = parseDmarc(rec);
  return { source: 'org', domain: org, from: `_dmarc.${org}`, record: rec, tags, org, ...policyFrom(tags, { self: false, legacy: true }) };
}

/** True when RFC 9989 and RFC 7489 receivers are asked for different policies here. */
function readingsDisagree(policy, legacy) {
  if (policy.error || legacy.error) return false;
  return (policy.requested ?? null) !== (legacy.requested ?? null) || (!!policy.requested && policy.from !== legacy.from);
}

/**
 * Record names for a domain, relative to its organizational zone. For
 * app.example.com, label('_dmarc') is "_dmarc.app" in the example.com zone,
 * and full('_dmarc') is "_dmarc.app.example.com". For example.com itself,
 * label('') is "@".
 *
 * `zone` is the DNS zone that holds the name, read from the SOA in a DNS
 * answer. With no argument it falls back to registrableDomain, a guess from
 * this engine's short suffix list. Null means the zone is unknown: label()
 * then gives the full name and `known` is false, so no output claims a zone
 * the scan did not establish.
 */
export function zoneNames(domain, zone = registrableDomain(domain)) {
  const known = !!zone && (domain === zone || domain.endsWith(`.${zone}`));
  const rel = !known || domain === zone ? '' : domain.slice(0, -(zone.length + 1));
  return {
    org: known ? zone : null,
    known,
    rel,
    isSub: !known || rel !== '',
    label: (l = '') => (known ? [l, rel].filter(Boolean).join('.') || '@' : [l, domain].filter(Boolean).join('.')),
    full: (l = '') => [l, domain].filter(Boolean).join('.'),
  };
}

/** The DNS zone holding `name`, from the SOA in an answer, or null when the answer does not establish one. */
function zoneFromSoa(r, name) {
  if (lookupFailed(r) || r.answers.some((x) => x.type === 'CNAME')) return null;
  const apex = bareName(r.answers.find((x) => x.type === 'SOA')?.name ?? r.authority?.[0]);
  return apex && (name === apex || name.endsWith(`.${apex}`)) ? apex : null;
}

/**
 * The strongest policy receivers are asked to apply here today, under either
 * reading. A record published at the domain replaces it for both kinds of
 * receiver, so no suggestion may ask for less.
 */
function dmarcFloor(d) {
  const readings = [d.policy, d.legacy].filter((r) => r && !r.error && r.requested);
  if (!readings.length) return null;
  return readings.reduce((a, b) => (policyStrength(b.requested) > policyStrength(a.requested) ? b : a));
}

/** The inherited record a record at the domain would replace, from either reading. */
const replacedRecord = (d) => [d.policy, d.legacy].find((r) => r && !r.error && r.tags && (r.source === 'org' || r.source === 'psd')) || null;

// What each policy asks of the domain's subdomains (sp), and of names under
// it that do not exist (np), with the fallbacks of RFC 9989 section 4.7.
const spOf = (t) => t.sp ?? t.p;
const npOf = (t) => t.np ?? t.sp ?? t.p;

/**
 * The single gate for every DMARC record suggested at the scanned domain.
 * 0. Unknown discovery: when a lookup failed, what applies is unknown, so
 *    nothing is suggested (`unknown`).
 * 1. Never weaker: p is raised to at least what applies today under RFC 9989
 *    or RFC 7489, because a record here replaces an inherited one. Strict
 *    alignment (adkim=s, aspf=s) in a record that applies stays strict. sp
 *    and np never fall below what the record they replace asks of
 *    subdomains. Reporting tags come along, so reports keep arriving.
 * 2. Never p=reject for a domain that may send mail (RFC 9989 section 7.4
 *    and Appendix C.6), unless this owner's own record already asks for it,
 *    or the caller asks for reject for a domain that sends no mail. When the
 *    first rule would force reject, nothing is suggested (`held`).
 */
export function suggestDmarc(d, tags, change) {
  const n = zoneNames(d.domain, d.zone ?? null);
  const out = { name: n.label('_dmarc'), fullName: n.full('_dmarc'), zone: n.org, floor: null, floorFrom: null };
  if (d.dmarcError) return { ...out, value: null, unknown: true };
  const floor = dmarcFloor(d);
  const replaced = replacedRecord(d);
  const base = { ...(replaced && d.policy.source !== 'own' ? reportingTags(replaced.tags) : {}), ...(tags || {}) };
  const c = { ...change };
  if (replaced && !tags?.rua && replaced.tags.rua) delete c.rua;
  const next = () => ({ ...base, ...c });
  // A value that is not valid would make the whole record count as p=none
  // (RFC 9989 section 4.10.1), so a suggestion never carries one.
  if (!validPolicy(next().p)) c.p = 'none';
  for (const k of ['sp', 'np']) if (next()[k] !== undefined && !validPolicy(next()[k])) c[k] = undefined;
  if (floor && policyStrength(next().p) < policyStrength(floor.requested)) c.p = floor.requested;
  for (const k of ['adkim', 'aspf']) {
    const strict = [d.policy, d.legacy].some((r) => r && !r.error && r.requested && policyOf(r.tags?.[k]) === 's');
    if (strict && policyOf(next()[k]) !== 's') c[k] = 's';
  }
  // The record whose subdomain policy a record here would take over: the
  // domain's own, or a PSD's. A record under an Organizational Domain does
  // not change its subdomains (RFC 9989 section 4.7, the sp note).
  const governing = ['own', 'psd'].includes(d.policy.source) && !d.policy.invalid ? d.policy.tags : null;
  if (governing) {
    if (policyStrength(spOf(next())) < policyStrength(spOf(governing))) c.sp = policyOf(spOf(governing));
    if (policyStrength(npOf(next())) < policyStrength(npOf(governing))) c.np = policyOf(npOf(governing));
  }
  Object.assign(out, { floor: floor?.requested ?? null, floorFrom: floor?.from ?? null });
  const forcedReject = policyOf(c.p) === 'reject' && policyOf(change.p) !== 'reject' && policyOf(tags?.p) !== 'reject';
  if (forcedReject && !noMailAtAll(d)) return { ...out, value: null, held: true };
  return { ...out, value: rebuildDmarc(base, c), held: false };
}

/** The reporting and alignment tags a subdomain record copies from its parent, so reports keep arriving. */
const reportingTags = (tags) => Object.fromEntries(['rua', 'ruf', 'fo', 'adkim', 'aspf'].filter((k) => tags?.[k] !== undefined).map((k) => [k, tags[k]]));

/**
 * The change on the parent record for an inherited none: raise the tag that
 * applies here, sp for an existing subdomain or np for a name that does not
 * exist. It changes every subdomain of that domain, including ones this scan
 * never read, so the report asks the owner first (needs_your_answer).
 */
export function suggestOrgDmarc(d) {
  const i = d.inherited;
  const tag = i.via === 'np' ? 'np' : 'sp';
  // A tag that is not valid makes the whole record count as p=none (RFC 9989
  // section 4.10.1), so the fix repairs it. An invalid p becomes p=none, which
  // is how receivers read the record today. An invalid sp or np goes.
  const change = { [tag]: 'quarantine' };
  if (!validPolicy(i.tags.p)) change.p = 'none';
  for (const k of ['sp', 'np']) if (k !== tag && i.tags[k] !== undefined && !validPolicy(i.tags[k])) change[k] = undefined;
  return { name: '_dmarc', fullName: i.from, zone: d.parentZone ?? null, tag, value: rebuildDmarc(i.tags, change), floor: null };
}

const randomLabel = () => 'sms-' + randomBytes(6).toString('hex');

/**
 * Read the public mail setup of one domain.
 * @param {string} domain
 * @param {{ resolve: Function, names?: string[] }} resolver
 */
export async function readMailDns(domain, resolver) {
  const q = (name, type) => resolver.resolve(name, type);
  const [mx, rootTxt, dmarcTxt, mtaSts, tlsRpt, a] = await Promise.all([
    q(domain, 'MX'), q(domain, 'TXT'), q(`_dmarc.${domain}`, 'TXT'), q(`_mta-sts.${domain}`, 'TXT'), q(`_smtp._tls.${domain}`, 'TXT'), q(domain, 'A'),
  ]);
  const errors = [mx, rootTxt, dmarcTxt].filter((r) => r.status === 'ERROR' || r.status === 'SERVFAIL').map((r) => r.error || r.status);

  const mxHosts = mx.answers.filter((x) => x.type === 'MX').map((x) => {
    const [pref, host] = String(x.data).split(/\s+/);
    return { pref: Number(pref), host: (host || '').replace(/\.$/, '') || '.' };
  });
  const nullMx = mxHosts.length === 1 && mxHosts[0].pref === 0 && (mxHosts[0].host === '' || mxHosts[0].host === '.');

  const spfRecords = txtOf(rootTxt).filter((t) => /^v=spf1(\s|$)/i.test(t));
  let spf = null;
  if (spfRecords.length >= 1) {
    const parsed = parseSpf(spfRecords[0]);
    const lookups = await countSpfLookups(resolver, domain, spfRecords[0]);
    spf = { record: spfRecords[0], count: spfRecords.length, all: parsed.all, errors: [...parsed.errors, ...lookups.permErrors], lookups: lookups.count, notes: lookups.notes, ignored: parsed.ignored, afterAll: parsed.afterAll, alwaysPass: lookups.alwaysPass, passVia: lookups.passVia, tempErrors: lookups.tempErrors };
  }

  const dmarcRecords = txtOf(dmarcTxt).filter(isDmarc);
  const dmarc = dmarcRecords.length ? { record: dmarcRecords[0], count: dmarcRecords.length, all: dmarcRecords, tags: parseDmarc(dmarcRecords[0]) } : null;
  // Records that look like DMARC but break the v tag rule are ignored by receivers.
  const dmarcIgnored = txtOf(dmarcTxt).filter((t) => looksLikeDmarc(t) && !isDmarc(t));

  // RFC 9989 Appendix A.4: a name exists when any query for it is not
  // NXDOMAIN. It decides between sp and np for an inherited policy.
  const nameExists = [mx, rootTxt, a].some((r) => r.status === 'NOERROR');
  const answers = new Map([[`_dmarc.${domain}`, Promise.resolve(dmarcTxt)]]);
  const lookup = (name) => {
    if (!answers.has(name)) answers.set(name, q(name, 'TXT'));
    return answers.get(name);
  };
  const policy = await discoverDmarc(domain, lookup, nameExists);
  const legacy = await legacyDmarc(domain, lookup);
  // A failed lookup in either reading leaves what applies unknown:
  // dmarcError, never "missing".
  const dmarcError = policy.error || legacy.error || '';
  const inherited = policy.source === 'org' || policy.source === 'psd'
    ? { from: policy.from, org: policy.domain, source: policy.source, record: policy.record, count: 1, tags: policy.tags, effective: policy.requested, applied: policy.applied, testing: policy.testing, via: policy.via, invalid: policy.invalid }
    : null;
  const dmarcDisagree = readingsDisagree(policy, legacy);
  // The zones that hold the DMARC names, from SOA answers. Null when unknown.
  const zone = zoneFromSoa(await q(`_dmarc.${domain}`, 'SOA'), `_dmarc.${domain}`);
  const parentZone = inherited && inherited.source === 'org' ? zoneFromSoa(await q(inherited.from, 'SOA'), inherited.from) : null;

  const wildLabels = [randomLabel(), randomLabel()];
  const wildResults = await Promise.all(wildLabels.map((l) => q(`${l}.${domain}`, 'A')));
  const wildcard = wildResults.every((r) => r.answers.length > 0);

  const dkimAnswers = await Promise.all(DKIM_SELECTORS.map((sel) => q(`${sel}._domainkey.${domain}`, 'TXT')));
  const dkim = DKIM_SELECTORS.filter((sel, i) => dkimAnswers[i].answers.some((x) => x.type === 'CNAME' || /(^|;)\s*(p=|k=rsa|k=ed25519|v=DKIM1)/i.test(String(x.data))));

  return {
    domain,
    resolvers: resolver.names || [],
    agree: [mx, rootTxt, dmarcTxt].every((r) => r.agree !== false),
    errors,
    exists: a.status !== 'NXDOMAIN' || mx.status !== 'NXDOMAIN',
    mx: mxHosts,
    nullMx,
    spf,
    spfRecords,
    dmarc,
    dmarcIgnored,
    policy,
    legacy,
    dmarcDisagree,
    nameExists,
    zone,
    parentZone,
    inherited,
    dmarcError,
    mtaSts: txtOf(mtaSts).some((t) => /^v=STSv1/i.test(t)),
    tlsRpt: txtOf(tlsRpt).some((t) => /^v=TLSRPTv1/i.test(t)),
    wildcard,
    dkim,
  };
}

/**
 * Turn a mail DNS reading into outcomes. Each outcome names a rule in the
 * catalog and the status this run supports.
 */
export function mailOutcomes(d) {
  const out = [];
  const site = d.domain;
  // Every DNS outcome carries the zone the scan established, or null, so
  // record names never claim a zone the scan did not read.
  const add = (rule, state, evidence, data = {}) => out.push({ rule, state, site, evidence, data: { zone: d.zone ?? null, ...data } });
  if (d.errors.length) {
    add('dns-unreadable', 'could_not_check', [{ k: 'dns', a: 'Lookup failed', b: d.errors.join('; '), c: '' }]);
    return out;
  }
  const receives = d.mx.length > 0 && !d.nullMx;
  const ev = (k, a, b) => ({ k, a, b, c: '' });

  // Null MX says the domain receives no mail. It says nothing about sending.
  // Only "v=spf1 -all" authorises no sender, so a null-MX domain whose SPF
  // lists senders is a sending domain and gets the normal checks below.
  if (d.nullMx && !d.spfRecords.length) {
    // Null MX only says no mail comes in. With no SPF, nothing says whether
    // tools send as this domain, so locking it is a question, not a fix.
    const missing = ['spf'];
    if (d.dmarcError) add('dmarc-unreadable', 'could_not_check', [ev('dns', 'Lookup failed', d.dmarcError)], { from: d.dmarcError.split(':')[0] });
    else if (!dmarcLocked(d)) missing.push('dmarc');
    add('no-mail-lock-incomplete', 'needs_your_answer', [ev('dns', 'MX', '0 . (takes no mail)'), ev('dns', 'SPF', 'none'), dmarcEvidence(d)], { missing, dmarc: missing.includes('dmarc') ? suggestDmarc(d, d.dmarc?.tags || {}, { p: 'reject' }) : null });
    return out;
  }
  if (noMailAtAll(d)) {
    const missing = [];
    // An inherited reject already covers this domain, when both readings agree on it.
    if (d.dmarcError) add('dmarc-unreadable', 'could_not_check', [ev('dns', 'Lookup failed', d.dmarcError)], { from: d.dmarcError.split(':')[0] });
    else if (!dmarcLocked(d)) missing.push('dmarc');
    if (missing.length) {
      add('no-mail-lock-incomplete', 'observed', [ev('dns', 'MX', '0 . (takes no mail)'), ev('dns', 'SPF', d.spf ? d.spf.record : 'none'), dmarcEvidence(d)], { missing, dmarc: missing.includes('dmarc') ? suggestDmarc(d, d.dmarc?.tags || {}, { p: 'reject' }) : null });
    }
    return out;
  }

  if (!d.mx.length) {
    add('mail-use-unknown', 'needs_your_answer', [ev('dns', 'MX', 'none'), ev('dns', 'SPF', d.spf ? d.spf.record : 'none'), dmarcEvidence(d)], { wildcard: d.wildcard, sends: suggestDmarc(d, d.dmarc?.tags || {}, { p: d.dmarc?.tags?.p || 'none', rua: d.dmarc?.tags?.rua || `mailto:dmarc@${site}` }), none: suggestDmarc(d, {}, { p: 'reject' }) });
  }

  if (d.spfRecords.length > 1) {
    add('spf-multiple', 'observed', d.spfRecords.map((r) => ev('dns', 'SPF', r)));
  } else if (d.spf) {
    if (d.spf.tempErrors?.length) add('spf-unreadable', 'could_not_check', [ev('dns', 'SPF', d.spf.record), ...d.spf.tempErrors.map((e) => ev('dns', 'Lookup failed', e))], { failed: d.spf.tempErrors });
    if (d.spf.errors.length) add('spf-syntax', 'observed', [ev('dns', 'SPF', d.spf.record), ...d.spf.errors.map((e) => ev('dns', 'Error', e))]);
    if (d.spf.lookups > 10) add('spf-too-many-lookups', 'observed', [ev('dns', 'SPF', d.spf.record), ev('dns', 'Lookups', `${d.spf.lookups} (the limit is 10)`)], { lookups: d.spf.lookups, record: d.spf.record });
    if (d.spf.all === '+' || d.spf.alwaysPass) add('spf-allows-anyone', 'observed', [ev('dns', 'SPF', d.spf.record), ...(d.spf.all !== '+' && d.spf.passVia ? [ev('dns', 'Passes every sender through', `include:${d.spf.passVia}`)] : [])], { record: d.spf.record, via: d.spf.all === '+' ? '' : d.spf.passVia });
    else if (d.spf.all === '?') add('spf-neutral', 'observed', [ev('dns', 'SPF', d.spf.record)], { record: d.spf.record });
  } else if (receives) {
    add('spf-missing', 'observed', [ev('dns', 'MX', d.mx.map((m) => m.host).join(', ')), ev('dns', 'SPF', 'none')], { mx: d.mx });
  }

  const inh = d.inherited;
  if (d.dmarcError) {
    add('dmarc-unreadable', 'could_not_check', [ev('dns', 'Lookup failed', d.dmarcError)], { from: d.dmarcError.split(':')[0] });
  } else if (d.dmarc && (d.dmarc.count > 1 || d.policy.invalid)) {
    // Two records are all discarded (RFC 9989 section 4.10, step 2), so the
    // walk goes on and the floor may come from a parent. A bad p, sp or np
    // counts as p=none with a valid rua, and as no DMARC without one.
    const one = d.dmarc.count === 1;
    add('dmarc-invalid', 'observed', [ev('dns', 'DMARC', d.dmarc.all.join(' | ')), ...(one ? [] : [dmarcEvidence(d)]), ...disagreeEvidence(d)], { record: d.dmarc.record, count: d.dmarc.count, bad: one ? d.policy.invalid : '', tags: one ? d.dmarc.tags : null, suggest: suggestDmarc(d, one ? d.dmarc.tags : {}, invalidChange(d)) });
  } else if (d.dmarc) {
    // p=none, or quarantine in test mode (t=y), which receivers apply as none.
    if (d.policy.applied === 'none') {
      const c = policyNoneChange(d);
      add('dmarc-policy-none', 'observed', [ev('dns', 'DMARC', d.dmarc.record), ...disagreeEvidence(d)], {
        tags: d.dmarc.tags, testing: d.policy.testing,
        suggest: suggestDmarc(d, d.dmarc.tags, c.suggest),
        suggestAll: c.all ? suggestDmarc(d, d.dmarc.tags, c.all) : null,
      });
    }
  } else if (inh && inh.effective === 'none' && inh.source === 'org') {
    // The parent publishes none for this subdomain. A record here changes
    // only this subdomain. Raising sp or np on the parent changes every
    // subdomain, including unscanned ones, so it waits for the owner.
    add('dmarc-inherited-none', 'needs_your_answer', [ev('dns', `_dmarc.${site}`, 'no record'), dmarcEvidence(d), ...disagreeEvidence(d)], { inherited: inh, here: suggestDmarc(d, {}, { p: 'quarantine' }), suggest: suggestOrgDmarc(d) });
  } else if (!inh || !inh.effective || inh.effective === 'none') {
    // No usable record applies, or only a PSD's none, which the owner cannot
    // change. Either way the fix is a record of the domain's own.
    add('dmarc-missing', 'observed', [ev('dns', `_dmarc.${site}`, 'no record'), ...d.dmarcIgnored.map((r) => ev('dns', `_dmarc.${site} (ignored, v must be exactly DMARC1)`, r)), ...(inh ? [dmarcEvidence(d)] : []), ...disagreeEvidence(d)], { receives, suggest: suggestDmarc(d, {}, { p: 'none', rua: `mailto:dmarc@${site}` }) });
  }

  if (receives && !d.dkim.length) {
    add('dkim-not-found', d.wildcard ? 'could_not_check' : 'not_observed', [ev('dns', 'Selectors tried', DKIM_SELECTORS.join(', ')), ev('dns', 'Wildcard', d.wildcard ? 'random names resolve' : 'no')], { wildcard: d.wildcard });
  }
  return out;
}

/** The change that repairs an invalid own record. The gate repairs p, sp and np. This keeps rua. */
function invalidChange(d) {
  const tags = d.dmarc.count === 1 ? d.dmarc.tags : {};
  return { rua: tags.rua || `mailto:dmarc@${d.domain}` };
}

/**
 * The change for an own record that receivers apply as none. p=none moves to
 * quarantine. Quarantine in test mode drops t=y. With no sp, p also covers
 * every subdomain (RFC 9989 section 4.7), so the first suggestion pins
 * sp=none and changes only this domain. `all` raises the subdomains too.
 */
function policyNoneChange(d) {
  const tags = d.dmarc.tags;
  const change = d.policy.requested === 'none' ? { p: 'quarantine' } : { t: undefined };
  const subdomainsFollow = !!change.p && tags.sp === undefined;
  return { suggest: subdomainsFollow ? { ...change, sp: 'none' } : change, all: subdomainsFollow ? change : null, subdomainsFollow };
}

/** RFC 9989 section 7.4 and Appendix C.6, said once for every place that mentions reject. */
export const REJECT_NOTE = 'Moving to p=reject is your decision. RFC 9989 section 7.4 warns that reject can break mail sent through mailing lists and forwarding, and says domains whose users post to mailing lists should not publish it.';

/** DNS shows what a domain asks for, not what happens to its mail. */
export const DNS_ONLY_NOTE = 'This check reads DNS only. It does not show whether your mail passes SPF, DKIM or DMARC alignment. The aggregate reports show that.';

/** Why the gate suggests no record: one strong enough would be p=reject on a domain that may send mail. */
export function heldDmarcText(site, s, existing = false) {
  const first = existing
    ? `Delete the records at ${s.fullName}, so the p=reject that ${s.floorFrom} publishes for ${site} applies, or keep exactly one that also asks for reject.`
    : `Do not add a record at ${s.fullName}. ${s.floorFrom} already publishes p=reject for ${site}, and a record at ${s.fullName} replaces it, so any record there must also ask for reject.`;
  return `${first} This report does not suggest p=reject for a domain that may send mail, because RFC 9989 section 7.4 warns that it can break mailing lists and forwarding. Keeping reject is a decision for whoever runs ${s.floorFrom}.`;
}

/** How a reading names its policy, such as "sp=reject at _dmarc.example.com". */
function readingText(r) {
  if (!r.from) return 'no DMARC record';
  if (r.invalid) return `${r.from}, whose ${r.invalid} value is not valid, so it counts as ${r.requested ? 'p=none' : 'no DMARC at all'}`;
  if (!r.requested) return `${r.from}, which is not usable`;
  return `${r.via}=${r.requested}${r.testing ? ` in test mode (t=y, applied as ${r.applied})` : ''} at ${r.from}`;
}

function dmarcEvidence(d) {
  const inh = d.inherited;
  if (d.dmarc && d.policy.source === 'own') return { k: 'dns', a: 'DMARC', b: d.dmarc.record, c: '' };
  if (inh) return { k: 'dns', a: `DMARC policy record found by the RFC 9989 tree walk: ${inh.from}${inh.source === 'psd' ? ' (a public suffix record)' : ''}`, b: inh.record, c: inh.invalid ? `not valid for subdomains: ${readingText(d.policy)}` : inh.effective ? `asks for ${readingText(d.policy)} here` : 'not usable' };
  return { k: 'dns', a: 'DMARC', b: 'none', c: '' };
}

/** True when both readings ask for reject here, so a domain with no mail is already locked. */
function dmarcLocked(d) {
  return d.policy.requested === 'reject' && d.legacy.requested === 'reject';
}

/** The note that RFC 9989 and RFC 7489 receivers read different policies here. */
function disagreeText(d) {
  return `RFC 9989 receivers find ${readingText(d.policy)}. Receivers that still follow RFC 7489 find ${readingText(d.legacy)}. This engine's RFC 7489 reading uses its own short suffix list, not the full Public Suffix List. A record of your own at _dmarc.${d.domain} gives both the same answer (RFC 9989 Appendix C.3).`;
}

const disagreeEvidence = (d) => (d.dmarcDisagree ? [{ k: 'dns', a: 'RFC 9989 and RFC 7489 disagree', b: disagreeText(d), c: '' }] : []);

/** A null-MX domain whose SPF is missing or authorises nobody: it takes and sends no mail. */
function noMailAtAll(d) {
  return d.nullMx && d.spfRecords.length === 1 && spfAuthorisesNobody(d.spf.record);
}

/** Rows for the guide's Email and DNS page. States are ok, change, add or warn. */
export function mailRows(d) {
  const site = d.domain;
  const rows = [];
  const row = (type, name, now, state, note, next = '') => rows.push({ type, name, now, next, note, state });
  if (d.errors.length) {
    row('DNS', site, 'Lookup failed', 'warn', 'The resolvers did not answer. Run the check again later.');
    return rows;
  }
  const receives = d.mx.length > 0 && !d.nullMx;
  if (d.nullMx) row('MX', site, '0 .', 'ok', 'Null MX: this domain takes no mail.');
  else if (receives) row('MX', site, d.mx.map((m) => `${m.pref} ${m.host}`).join(', '), 'ok', 'These hosts receive mail for the domain.');
  else row('MX', site, 'none', 'warn', 'No mail host. If this domain takes no mail, add a null MX.', '0 .');

  const noMail = noMailAtAll(d);
  if (noMail) {
    const ok = !!d.spf;
    row('SPF', site, d.spf ? d.spf.record : 'none', ok ? 'ok' : 'add', ok ? 'Nothing may send as this domain.' : 'A domain with no mail can refuse all senders.', ok ? '' : 'v=spf1 -all');
  } else if (d.nullMx && d.spfRecords.length === 1) {
    row('SPF', site, d.spf.record, 'warn', 'This domain takes no mail, but its SPF lets the listed servers send as it. If none of them send for you, use v=spf1 -all.');
  } else if (d.spfRecords.length > 1) {
    row('SPF', site, d.spfRecords.join(' | '), 'change', 'Two SPF records make both fail. Merge them into one.');
  } else if (d.spf && d.spf.tempErrors?.length) {
    row('SPF', site, d.spf.record, 'warn', `Could not read ${d.spf.tempErrors.join(', ')}. RFC 7208 treats that as a temporary error, so SPF cannot be judged in this run.`);
  } else if (d.spf) {
    const bad = d.spf.errors.length || d.spf.lookups > 10 || d.spf.all === '+' || d.spf.all === '?';
    const note = d.spf.errors.length ? `SPF has an error: ${d.spf.errors[0]}. Receivers treat the whole record as broken.` : d.spf.lookups > 10 ? `${d.spf.lookups} lookups. The limit is 10, so receivers treat SPF as broken.` : d.spf.all === '+' ? '+all lets any server send as this domain.' : d.spf.all === '?' ? '?all tells receivers nothing. Use ~all or -all.' : `${d.spf.lookups} of 10 lookups used.`;
    row('SPF', site, d.spf.record, bad ? 'change' : 'ok', note);
  } else {
    // With no MX, or null MX and no SPF, nothing says whether a tool sends as
    // this domain, so -all is a choice to check first, not a record to add.
    if (receives) row('SPF', site, 'none', 'add', 'Add one SPF record that lists your mail host.', 'v=spf1 include:<your mail host> ~all');
    else row('SPF', site, 'none', 'warn', 'If nothing sends as this domain, use v=spf1 -all. If a tool sends as it, list that tool instead. Check before you add it.', 'v=spf1 -all');
  }

  const dmarcName = `_dmarc.${site}`;
  const inh = d.inherited;
  const pol = d.policy;
  const extra = d.dmarcDisagree ? ` ${disagreeText(d)}` : '';
  const next = (s) => (s.held ? '' : s.value);
  const held = (s) => (s.held ? ` ${heldDmarcText(site, s)}` : '');
  if (d.dmarcError) {
    row('DMARC', dmarcName, 'Lookup failed', 'warn', `Could not read ${d.dmarcError.split(':')[0]}, a name the RFC 9989 tree walk has to read before it knows which policy applies. Run the check again.`);
  } else if (d.dmarc && (d.dmarc.count > 1 || pol.invalid)) {
    const s = suggestDmarc(d, d.dmarc.count === 1 ? d.dmarc.tags : {}, invalidChange(d));
    const why = d.dmarc.count > 1 ? 'There is more than one DMARC record, so receivers ignore them all.' : `The ${pol.invalid} value is not valid, so receivers read this record as ${pol.requested ? 'p=none' : 'no DMARC at all'}.`;
    row('DMARC', dmarcName, d.dmarc.all.join(' | '), 'change', why + (s.held ? ` ${heldDmarcText(site, s, d.dmarc.count > 1)}` : '') + extra, next(s));
  } else if (d.dmarc) {
    const tags = d.dmarc.tags;
    const p = pol.requested;
    if (noMail && p !== 'reject') {
      row('DMARC', dmarcName, d.dmarc.record, 'change', 'A domain with no mail can ask inboxes to reject everything. Only p changes.', suggestDmarc(d, tags, { p: 'reject' }).value);
    } else if (pol.applied === 'none') {
      const { suggest, subdomainsFollow } = policyNoneChange(d);
      const s = suggestDmarc(d, tags, suggest);
      const note = pol.testing
        ? 't=y asks receivers to apply one level lower while you test, so this quarantine acts as none. Remove t=y when the reports show only your own senders. Only t changes.'
        : `p=none only asks for reports. When the reports show only your own senders, move to quarantine.${subdomainsFollow ? ' This record has no sp, so p also covers every subdomain. The suggestion adds sp=none so only this domain changes. Raising the subdomains is a separate choice in the report.' : ' Only p changes.'}`;
      row('DMARC', dmarcName, d.dmarc.record, 'change', note + held(s) + extra, next(s));
    } else {
      const testing = pol.testing ? ` in test mode (t=y), which receivers apply as ${pol.applied}` : '';
      const reject = p === 'quarantine' && !noMail ? ` ${REJECT_NOTE}` : '';
      row('DMARC', dmarcName, d.dmarc.record, pol.testing || d.dmarcDisagree ? 'warn' : 'ok', `Asks receivers to ${p} mail that fails DMARC${testing}.${tags.rua ? '' : ' Add rua to get reports.'}${reject} ${DNS_ONLY_NOTE}${extra}`);
    }
  } else if (inh && inh.effective && !(inh.effective === 'none' && inh.source === 'psd')) {
    if (inh.effective === 'none') {
      const s = suggestDmarc(d, {}, { p: 'quarantine' });
      const tag = suggestOrgDmarc(d).tag;
      const now = inh.invalid ? `No record here. ${inh.from} is not valid for subdomains, so it counts as p=none` : `No record here. Inherits ${inh.via}=none from ${inh.from}`;
      const says = inh.invalid ? `${inh.from} has an ${inh.invalid} value that is not valid, so receivers read the whole record as p=none for this subdomain` : `${inh.from} publishes ${inh.via}=none for this subdomain`;
      row('DMARC', dmarcName, now, 'change', `${says}, so it only asks for reports. A record here with p=quarantine changes only this subdomain. Raising ${tag} on the ${inh.org} record changes every subdomain of ${inh.org}, including ones this scan did not check, so the report asks you first.${held(s)}${extra}`, next(s));
    } else {
      const testing = inh.testing ? ` in test mode (t=y), applied as ${inh.applied}` : '';
      const s = d.dmarcDisagree ? suggestDmarc(d, {}, { p: 'none' }) : null;
      row('DMARC', dmarcName, `No record here. Inherits ${inh.via}=${inh.effective} from ${inh.from}`, d.dmarcDisagree || inh.testing ? 'warn' : 'ok', `The record at ${inh.from} asks receivers to apply ${inh.via}=${inh.effective}${testing} to this subdomain. Do not add a record here unless it is at least as strict as ${inh.effective}, because a record here replaces the inherited one. ${DNS_ONLY_NOTE}${s ? held(s) : ''}${extra}`, s ? next(s) : '');
    }
  } else {
    const s = suggestDmarc(d, {}, noMail ? { p: 'reject' } : { p: 'none', rua: `mailto:dmarc@${site}` });
    const now = inh ? `none here. The RFC 9989 tree walk finds ${readingText(pol)}` : 'none';
    row('DMARC', dmarcName, now, 'add', (noMail ? 'Asks inboxes to reject anything claiming to be this domain.' : 'Start at p=none and read the reports for a few weeks.') + held(s) + extra, next(s));
  }

  if (receives) {
    row('DKIM', `<selector>._domainkey.${site}`, d.dkim.length ? `Key at ${d.dkim.join(', ')}` : 'No key at common selector names', d.dkim.length ? 'ok' : 'warn',
      d.dkim.length ? 'A signing key is published.' : d.wildcard ? 'Random names resolve here, so selector probing proves nothing.' : 'Your host may use another selector name. Read it from the s= tag in a real message header.');
    row('MTA-STS', `_mta-sts.${site}`, d.mtaSts ? 'present' : 'none', d.mtaSts ? 'ok' : 'warn', 'Optional. Tells senders to use TLS when delivering to you.');
    row('TLS-RPT', `_smtp._tls.${site}`, d.tlsRpt ? 'present' : 'none', d.tlsRpt ? 'ok' : 'warn', 'Optional. Sends you reports about TLS delivery problems.', d.tlsRpt ? '' : `v=TLSRPTv1; rua=mailto:tls-reports@${site}`);
  }
  row('Wildcard', `*.${site}`, d.wildcard ? 'Random names resolve' : 'Random names do not resolve', d.wildcard ? 'warn' : 'ok',
    d.wildcard ? 'Check preview, app and mail subdomains before you lock this domain down.' : 'Two random subdomains returned no address.');
  return rows;
}

/** The short "sends" label on the Email and DNS page. */
export function mailLabel(d) {
  if (d.errors.length) return 'unknown (lookup failed)';
  // Null MX is about receiving. Sending comes from SPF.
  if (d.nullMx) {
    if (noMailAtAll(d)) return 'nothing (null MX and SPF -all)';
    if (d.spfRecords.length) return 'no mail in, sends through its SPF senders';
    return 'no mail in, sending unknown';
  }
  if (d.mx.length) return 'mail (MX found)';
  return 'unclear (no MX)';
}
