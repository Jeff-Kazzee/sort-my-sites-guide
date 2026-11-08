// The --site arguments, cleaned up: scheme, path, case and a trailing dot
// removed, repeats dropped, and anything that is not a domain name refused.

import { normalizeHost } from './domain.js';

const DOMAIN = /^(?=.{1,253}$)([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i;

/** @param {string[]} args @returns {{ domains: string[], errors: string[] }} */
export function parseSiteArgs(args) {
  const domains = [];
  const errors = [];
  for (const raw of args) {
    const d = normalizeHost(String(raw).trim().replace(/^https?:\/\//i, '').replace(/\/.*$/, ''));
    if (!DOMAIN.test(d)) errors.push(`"${raw}" is not a domain name.`);
    else if (!domains.includes(d)) domains.push(d);
  }
  return { domains, errors };
}
