// Assemble the guide's data from check outcomes, validate it, and write it.

import { writeFile, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { RULES, CHECK_OF } from './rules/catalog.js';
import { slug, normalizeHost } from './domain.js';
import { validateGuideData } from './contract.js';

export const ENGINE_VERSION = '0.1.0';
export const RULES_VERSION = '2026-11-08';

/** Turn one outcome into a finding with text, fix and evidence. */
export function toFinding(o, { stack = [], rerun = '' } = {}) {
  const rule = RULES[o.rule];
  if (!rule) throw new Error(`No rule in the catalog for outcome "${o.rule}"`);
  const claims = typeof rule.claims === 'function' ? rule.claims(o) : rule.claims;
  return {
    id: `${o.rule}.${slug(o.site)}`,
    rule: o.rule,
    site: o.site,
    state: o.state,
    title: rule.title(o),
    sentence: rule.sentence(o),
    why: rule.why(o),
    area: rule.area,
    topic: rule.topic,
    rank: rule.rank,
    who: rule.who,
    time: rule.time,
    claims,
    question: rule.question || null,
    fix: rule.fix(o, stack),
    verify: rule.verify(o),
    evidence: o.evidence,
    ...(o.scope ? { scope: o.scope } : {}),
    recheck: { state: o.state, text: `Run the check again to update this finding: ${rerun || `pnpm check --site ${o.site} --out <guide folder>`}` },
    engine: `engine ${ENGINE_VERSION}, rules ${RULES_VERSION}`,
  };
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export function formatWhen(date) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Zagreb', year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(date).map((p) => [p.type, p.value]));
  return `${Number(parts.day)} ${MONTHS[Number(parts.month) - 1]} ${parts.year}, ${parts.hour}:${parts.minute}`;
}

const OPEN = new Set(['observed', 'could_not_check', 'needs_your_answer', 'needs_a_specialist']);

/**
 * Compare with the previous scan. An earlier open finding is fixed only when
 * this run completed the same check on the same site and did not see it. When
 * the check did not run, failed or could not reach the site, the finding is
 * carried forward as still open, because this run cannot confirm a fix.
 * @param {any} prev the previous guide data, or null
 * @param {any[]} findings this run's findings
 * @param {{ domain: string, checked?: string[] }[]} sites the sites this run scanned, with the checks each one completed
 */
const PAGE_CHECKS = new Set(['browser', 'consent-order', 'reject', 'accept']);

/** The pages a finding was seen on: its scope, else the pages its evidence names, else the home page. */
function scopePages(f) {
  if (f.scope && Array.isArray(f.scope.pages) && f.scope.pages.length) return f.scope.pages;
  const named = (f.evidence || []).map((e) => (/ on (\/\S*)$/.exec(e.a || '') || / on (\/\S*)$/.exec(e.c || '') || [])[1]).filter(Boolean);
  return named.length ? [...new Set(named)] : ['/'];
}

/**
 * True only when this run repeated the check that produced the finding, on
 * the pages it was seen on, with no failed request that could have produced it.
 */
function confirmedAbsent(f, cov) {
  const rule = f.rule || f.id.split('.')[0];
  const check = CHECK_OF[rule];
  if (!check || !cov.checked.has(check) || cov.uncertain.has(rule)) return false;
  if (!PAGE_CHECKS.has(check)) return true;
  return scopePages(f).every((p) => cov.okPages.has(p));
}

/** Why a finding counts as fixed, when it was retired rather than seen again. */
function fixedWhy(f, cov) {
  return cov.retired[CHECK_OF[f.rule || f.id.split('.')[0]]] || '';
}

// Findings from two runs are the same finding when rule and site match. The
// id is not used, because its slug changed for hyphenated hosts.
const ruleOf = (f) => f.rule || f.id.split('.')[0];
const findingKey = (f) => `${ruleOf(f)}|${normalizeHost(f.site)}`;

export function diffFindings(prev, findings, sites) {
  if (!prev) return { fixed: [], added: [], carried: [] };
  const coverage = new Map(sites.map((s) => [normalizeHost(s.domain), { checked: new Set(s.checked || []), okPages: new Set(s.okPages || []), uncertain: new Set(s.uncertain || []), retired: s.retired || {} }]));
  const before = new Map(prev.findings.filter((f) => OPEN.has(f.state)).map((f) => [findingKey(f), f]));
  const now = new Map(findings.filter((f) => OPEN.has(f.state)).map((f) => [findingKey(f), f]));
  const fixed = [];
  const carried = [];
  for (const [key, f] of before) {
    const cov = coverage.get(normalizeHost(f.site));
    if (now.has(key) || !cov) continue;
    if (confirmedAbsent(f, cov)) fixed.push({ t: f.title, site: f.site, ...(fixedWhy(f, cov) ? { why: fixedWhy(f, cov) } : {}) });
    else carried.push(f);
  }
  return {
    fixed,
    added: [...now.entries()].filter(([key]) => !before.has(key)).map(([, f]) => ({ id: f.id, t: f.title, site: f.site })),
    carried,
  };
}

const PANE_OF_CHECK = { reject: 'B', accept: 'C' };

/**
 * A carried finding is still open, so the rows it cites are check, never ok,
 * and the pane it belongs to stops saying no known tracker loaded. Pane
 * marks from the analysis only see this run's findings, so this runs after
 * carry-forward.
 */
function markCarriedPanes(sites, carried) {
  for (const f of carried) {
    const site = sites.find((s) => normalizeHost(s.domain) === normalizeHost(f.site));
    const pane = site?.panes?.find((p) => p.id === (PANE_OF_CHECK[CHECK_OF[ruleOf(f)]] || 'A'));
    if (!pane) continue;
    const mark = (row) => { if (row[2] === 'ok') row[2] = 'check'; };
    for (const e of f.evidence || []) {
      if (e.k === 'request') {
        for (const r of pane.requests) if ((r[0] === e.a && !/^first party,/.test(r[1])) || (r[0].includes('/') && String(e.b).startsWith(`https://${r[0]}`))) mark(r);
      } else if (e.k === 'iframe') {
        let host = '';
        try { host = new URL(e.b).hostname; } catch { /* not a URL */ }
        for (const r of pane.requests) if (host && r[0] === host) mark(r);
      } else if (e.k === 'cookie' || e.k === 'storage') {
        for (const r of pane.storage) if (r[1] === e.a || r[1].startsWith(`${e.a} (`)) mark(r);
      }
    }
    const open = ' An earlier finding for this state stays open, because this run could not confirm it.';
    pane.note = pane.note.replace(/ No known tracker loaded (before a choice|after Reject)\./, '');
    if (!pane.note.includes(open)) pane.note += open;
  }
}

/** An earlier finding this run could not check again, kept open with a note. */
function carryForward(f, prevWhen) {
  const seenAt = f.seenAt || prevWhen;
  const note = { k: 'note', a: 'Not checked again', b: `This run could not repeat this check, so the result from ${seenAt} stays open.`, c: '' };
  // The id is rebuilt with this engine's slug, so it never clashes with a new finding.
  return { ...f, id: `${ruleOf(f)}.${slug(f.site)}`, carried: true, seenAt, evidence: [note, ...(f.evidence || []).filter((e) => e.a !== note.a)] };
}

/**
 * Build the object the guide reads.
 * @param {{ sites: any[], vantage: {country: string, eu: boolean}, when: Date, prev?: any, consentSite?: string, rerun?: string }} input
 */
export function buildGuideData({ sites, vantage, when, prev = null, consentSite, rerun }) {
  const findings = sites
    .flatMap((s) => s.outcomes.map((o) => toFinding(o, { stack: s.stack, rerun })))
    .sort((a, b) => a.rank - b.rank || a.site.localeCompare(b.site));
  const diff = diffFindings(prev, findings, sites);
  // seenAt keeps the date of the run that saw it, across several carried runs.
  for (const f of diff.carried) findings.push(carryForward(f, prev.run.when));
  markCarriedPanes(sites, diff.carried);
  findings.sort((a, b) => a.rank - b.rank || a.site.localeCompare(b.site));
  const pick = sites.find((s) => s.domain === consentSite) || sites.find((s) => s.panes && s.panes.length) || sites[0];
  const where = vantage.eu ? `run from ${vantage.country}` : `run from ${vantage.country}, outside the EU`;
  const data = {
    sample: false,
    run: {
      when: formatWhen(when),
      prev: prev ? prev.run.when : 'no earlier run',
      engine: `engine ${ENGINE_VERSION} · rules ${RULES_VERSION} · ${where}`,
      from: vantage.country,
      fromEU: vantage.eu,
    },
    sites: sites.map((s) => ({ domain: s.domain, role: s.role || '', pages: s.pages || 0, stack: s.stack || [], checked: s.checked || [], okPages: s.okPages || [], uncertain: s.uncertain || [], retired: s.retired || {} })),
    diff: { fixed: diff.fixed, added: diff.added },
    findings,
    consent: { site: pick ? pick.domain : '', panes: pick ? pick.panes || [] : [] },
    consentBySite: Object.fromEntries(sites.filter((s) => s.panes && s.panes.length).map((s) => [s.domain, { site: s.domain, panes: s.panes }])),
    dns: sites.filter((s) => s.dns).map((s) => ({ domain: s.domain, sends: s.dns.label, rows: s.dns.rows })),
  };
  return data;
}

export async function readPrevious(outDir) {
  try {
    const text = await readFile(join(outDir, 'scan-data.js'), 'utf8');
    const json = text.slice(text.indexOf('export default ') + 'export default '.length).trim().replace(/;\s*$/, '');
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/** Validate, then write scan-data.js as an ES module the guide imports. */
export async function writeGuideData(outDir, data) {
  const errors = validateGuideData(data);
  if (errors.length) throw new Error(`scan data failed validation:\n- ${errors.join('\n- ')}`);
  const file = join(outDir, 'scan-data.js');
  const body = `// Written by the Sort My Sites checker. Run it again to refresh. Do not edit by hand.\nexport default ${JSON.stringify(data, null, 1)};\n`;
  await writeFile(file, body, 'utf8');
  return file;
}
