// The shape the guide reads, checked in code. The guide crashes on an unknown
// state or a missing array, so the CLI refuses to write data that fails here.

export const FINDING_STATES = ['observed', 'not_observed', 'could_not_check', 'needs_your_answer', 'needs_a_specialist'];
export const DNS_ROW_STATES = ['ok', 'change', 'add', 'warn'];
// bad: a problem. check: needs the owner's answer, a specialist or a recheck. ok: nothing in the report.
export const DOT_STATES = ['bad', 'check', 'ok'];

const isStr = (x) => typeof x === 'string';
const isArr = Array.isArray;

/** @returns {string[]} problems, empty when the data is valid */
export function validateGuideData(d) {
  const errs = [];
  const need = (cond, msg) => { if (!cond) errs.push(msg); };
  need(d && typeof d === 'object', 'data is not an object');
  if (!d || typeof d !== 'object') return errs;

  need(d.run && isStr(d.run.when) && isStr(d.run.prev) && isStr(d.run.engine), 'run needs when, prev and engine strings');
  need(isArr(d.sites), 'sites must be an array');
  for (const s of d.sites || []) {
    need(isStr(s.domain) && s.domain, 'site needs a domain');
    need(isArr(s.stack), `site ${s.domain}: stack must be an array`);
    need(typeof s.pages === 'number', `site ${s.domain}: pages must be a number`);
    need(isStr(s.role), `site ${s.domain}: role must be a string`);
  }
  need(d.diff && isArr(d.diff.fixed) && isArr(d.diff.added), 'diff needs fixed and added arrays');
  for (const x of d.diff?.fixed || []) need(isStr(x.t) && isStr(x.site), 'diff.fixed items need t and site');
  for (const x of d.diff?.added || []) need(isStr(x.t) && isStr(x.site) && isStr(x.id), 'diff.added items need id, t and site');

  need(isArr(d.findings), 'findings must be an array');
  const ids = new Set();
  for (const f of d.findings || []) {
    const at = `finding ${f.id}`;
    need(isStr(f.id) && f.id && !ids.has(f.id), `${at}: id must be a unique string`);
    ids.add(f.id);
    need(FINDING_STATES.includes(f.state), `${at}: unknown state "${f.state}"`);
    need(f.recheck && FINDING_STATES.includes(f.recheck.state) && isStr(f.recheck.text), `${at}: recheck needs a known state and text`);
    need(f.recheck && f.recheck.state === f.state, `${at}: recheck.state must equal state, so the button never shows a result the run did not see`);
    for (const k of ['site', 'title', 'sentence', 'why', 'area', 'topic', 'time', 'who', 'verify']) need(isStr(f[k]) && f[k].length > 0, `${at}: ${k} must be a non-empty string`);
    need(typeof f.rank === 'number', `${at}: rank must be a number`);
    need(isArr(f.claims) && f.claims.every(isStr), `${at}: claims must be an array of ids`);
    need(isArr(f.evidence) && f.evidence.every((e) => isStr(e.k) && isStr(e.a) && isStr(e.b) && isStr(e.c)), `${at}: evidence items need k, a, b and c strings`);
    need(isArr(f.fix) && f.fix.length > 0 && f.fix.every((x) => isStr(x.label) && isStr(x.code) && x.code.length > 0), `${at}: fix needs at least one {label, code}`);
    need((d.sites || []).some((s) => s.domain === f.site), `${at}: site ${f.site} is not in sites`);
  }

  need(d.consent && isStr(d.consent.site) && isArr(d.consent.panes), 'consent needs site and panes');
  for (const p of d.consent?.panes || []) {
    need(['A', 'B', 'C', 'D'].includes(p.id) && isStr(p.label) && isStr(p.sub) && isStr(p.note), `pane ${p.id}: needs id, label, sub and note`);
    need(isArr(p.requests) && p.requests.every((r) => isArr(r) && r.length === 3 && isStr(r[0]) && isStr(r[1]) && DOT_STATES.includes(r[2])), `pane ${p.id}: requests must be [host, type, bad|check|ok]`);
    need(isArr(p.storage) && p.storage.every((r) => isArr(r) && r.length === 3 && isStr(r[0]) && isStr(r[1]) && DOT_STATES.includes(r[2])), `pane ${p.id}: storage must be [kind, name, bad|check|ok]`);
  }

  need(isArr(d.dns), 'dns must be an array');
  for (const dm of d.dns || []) {
    need(isStr(dm.domain) && isStr(dm.sends) && isArr(dm.rows), `dns ${dm.domain}: needs domain, sends and rows`);
    for (const r of dm.rows || []) need(isStr(r.type) && isStr(r.name) && isStr(r.now) && isStr(r.note) && isStr(r.next) && DNS_ROW_STATES.includes(r.state), `dns ${dm.domain} ${r.type}: row needs type, name, now, next, note and a known state`);
  }
  return errs;
}
