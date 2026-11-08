#!/usr/bin/env node
// pnpm check --site a.example --site b.example --out <guide folder>

import { parseArgs } from 'node:util';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { scanSites, readPrevious, writeGuideData } from './index.js';
import { parseSiteArgs } from './sites.js';

const USAGE = `Usage: pnpm check --site <domain> [--site <domain> ...] --out <guide folder>

Options:
  --site <domain>         A domain to check. Repeat for each site.
  --role <domain>=<text>  A short label for a site, shown in the report.
  --out <folder>          Where to write scan-data.js. Usually the guide folder.
  --consent-site <domain> Which site the Consent states page shows. Default: the first one with a browser run.
  --no-browser            Skip the browser states.
  --no-transport          Skip the HTTPS and header checks.
  --no-dns                Skip the email and DNS checks.
  --json <file>           Also write the full report as JSON.

The checker reads public pages as a visitor would. It never logs in and never submits a form.`;

function fail(msg) {
  process.stderr.write(`${msg}\n\n${USAGE}\n`);
  process.exit(2);
}

const { values } = parseArgs({
  args: process.argv.slice(2).filter((a) => a !== '--'),
  options: {
    site: { type: 'string', multiple: true },
    role: { type: 'string', multiple: true },
    out: { type: 'string' },
    'consent-site': { type: 'string' },
    'no-browser': { type: 'boolean' },
    'no-transport': { type: 'boolean' },
    'no-dns': { type: 'boolean' },
    json: { type: 'string' },
    help: { type: 'boolean', short: 'h' },
  },
  strict: true,
});

if (values.help) { process.stdout.write(USAGE + '\n'); process.exit(0); }
if (!values.site || !values.site.length) fail('Name at least one --site.');
if (!values.out) fail('Name the --out folder.');

const parsed = parseSiteArgs(values.site);
if (parsed.errors.length) fail(parsed.errors.join('\n'));
const domains = parsed.domains;
const roles = Object.fromEntries((values.role || []).map((r) => { const i = r.indexOf('='); return [r.slice(0, i).trim().toLowerCase(), r.slice(i + 1).trim()]; }));

// pnpm runs scripts from the repo root. INIT_CWD is the folder the user typed the command in.
const cwd = process.env.INIT_CWD || process.cwd();
const outDir = resolve(cwd, values.out);
await mkdir(outDir, { recursive: true });
const prev = await readPrevious(outDir);
const rerun = `pnpm check ${domains.map((d) => `--site ${d}`).join(' ')} --out <guide folder>`;

const started = Date.now();
const data = await scanSites({
  sites: domains.map((d) => ({ domain: d, role: roles[d] || '' })),
  checks: { browser: !values['no-browser'], transport: !values['no-transport'], dns: !values['no-dns'] },
  browserOptions: { shotsDir: join(outDir, 'scan-shots') },
  outDir,
  prev,
  consentSite: values['consent-site'],
  rerun,
  log: (m) => process.stdout.write(`[${((Date.now() - started) / 1000).toFixed(0)} s] ${m}\n`),
});

const file = await writeGuideData(outDir, data);
if (values.json) await writeFile(resolve(cwd, values.json), JSON.stringify(data, null, 2));

const byState = {};
for (const f of data.findings) byState[f.state] = (byState[f.state] || 0) + 1;
process.stdout.write(`\nWrote ${file}\nRun: ${data.run.when}, ${data.run.engine}\n`);
for (const s of data.sites) {
  const fs = data.findings.filter((f) => f.site === s.domain);
  process.stdout.write(`  ${s.domain}: ${fs.length} findings (${fs.map((f) => `${f.rule}=${f.state}`).join(', ') || 'none'})\n`);
}
process.stdout.write(`States: ${JSON.stringify(byState)}\n`);
