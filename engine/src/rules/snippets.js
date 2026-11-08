// Copy-ready code for the fixes. Built from what the run saw on the site,
// such as the Google tag id, the font families and the domain name.

import { zoneNames, heldDmarcText, LEGACY_DMARC_TAGS, REJECT_NOTE } from '../dns.js';

const lines = (...xs) => xs.flat().join('\n');

export function gaGatePlain(gaId = 'G-XXXXXXXXXX') {
  return lines(
    '<!-- 1. Delete the tag that loads Google Analytics on its own:',
    `     <script async src="https://www.googletagmanager.com/gtag/js?id=${gaId}"></script>`,
    '     and the inline script with gtag(\'config\', ...) next to it. -->',
    '<!-- 2. Paste this in <head> instead. -->',
    '<script>',
    '  window.dataLayer = window.dataLayer || [];',
    '  function gtag() { dataLayer.push(arguments); }',
    "  gtag('consent', 'default', {",
    "    ad_storage: 'denied',",
    "    ad_user_data: 'denied',",
    "    ad_personalization: 'denied',",
    "    analytics_storage: 'denied'",
    '  });',
    '',
    '  function loadAnalytics() {',
    '    if (window.analyticsLoaded) return;',
    '    window.analyticsLoaded = true;',
    "    gtag('consent', 'update', { analytics_storage: 'granted' });",
    "    var s = document.createElement('script');",
    '    s.async = true;',
    `    s.src = 'https://www.googletagmanager.com/gtag/js?id=${gaId}';`,
    '    document.head.appendChild(s);',
    "    gtag('js', new Date());",
    `    gtag('config', '${gaId}');`,
    '  }',
    '',
    '  // Call these from your banner buttons.',
    '  window.acceptAnalytics = function () {',
    "    localStorage.setItem('analytics-consent', 'yes');",
    '    loadAnalytics();',
    '  };',
    '  window.rejectAnalytics = function () {',
    "    localStorage.setItem('analytics-consent', 'no');",
    '  };',
    '',
    "  if (localStorage.getItem('analytics-consent') === 'yes') loadAnalytics();",
    '</script>',
  );
}

export function trackerGatePlain(vendors) {
  return lines(
    '<!-- Move every tracking tag into loadTrackers(), so nothing runs before Accept. -->',
    '<script>',
    '  function loadTrackers() {',
    '    if (window.trackersLoaded) return;',
    '    window.trackersLoaded = true;',
    `    // Paste the vendor snippet for each tool here, unchanged: ${vendors.join(', ')}.`,
    '  }',
    '',
    '  window.acceptTrackers = function () {',
    "    localStorage.setItem('tracking-consent', 'yes');",
    '    loadTrackers();',
    '  };',
    '  window.rejectTrackers = function () {',
    "    localStorage.setItem('tracking-consent', 'no');",
    '  };',
    '',
    "  if (localStorage.getItem('tracking-consent') === 'yes') loadTrackers();",
    '</script>',
  );
}

export function gaGateNext(gaId = 'G-XXXXXXXXXX') {
  return lines(
    '// app/consent-analytics.tsx',
    "'use client';",
    '',
    "import Script from 'next/script';",
    "import { useEffect, useState } from 'react';",
    '',
    `const GA_ID = '${gaId}';`,
    '',
    'export function ConsentAnalytics() {',
    '  const [allowed, setAllowed] = useState(false);',
    '',
    '  useEffect(() => {',
    "    setAllowed(localStorage.getItem('analytics-consent') === 'yes');",
    '    const onAccept = () => setAllowed(true);',
    "    window.addEventListener('analytics-consent', onAccept);",
    "    return () => window.removeEventListener('analytics-consent', onAccept);",
    '  }, []);',
    '',
    '  if (!allowed) return null;',
    '  return (',
    '    <>',
    '      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />',
    '      <Script id="ga4-init" strategy="afterInteractive">',
    "        {`window.dataLayer = window.dataLayer || [];",
    'function gtag(){dataLayer.push(arguments);}',
    "gtag('js', new Date());",
    "gtag('config', '${GA_ID}');`}",
    '      </Script>',
    '    </>',
    '  );',
    '}',
    '',
    "// Banner Accept button: localStorage.setItem('analytics-consent', 'yes')",
    "// then window.dispatchEvent(new Event('analytics-consent')).",
    '// In app/layout.tsx, render <ConsentAnalytics /> inside <body> and remove',
    '// any <GoogleAnalytics /> or gtag <Script> that loads on its own.',
  );
}

export const WORDPRESS_CONSENT = lines(
  '1. Install a consent plugin that blocks scripts until the visitor accepts,',
  '   for example Complianz or CookieYes.',
  '2. Turn on script blocking for every tool in the evidence list.',
  '3. If you use Site Kit by Google, turn on Consent Mode in its settings.',
  '4. Clear your cache plugin, then run the check again.',
);

const nextFontName = (family) => family.trim().replace(/\s+/g, '_');

export function fontsPlain(families) {
  const fams = families.length ? families : ['Your Font'];
  return lines(
    '<!-- 1. Remove every tag like this from your pages:',
    '     <link href="https://fonts.googleapis.com/css2?family=..." rel="stylesheet"> -->',
    '<!-- 2. Download the woff2 files for each family and weight into /fonts on your site. -->',
    '<!-- 3. Add one @font-face block per family and weight: -->',
    '<style>',
    ...fams.map((f) => lines(
      '  @font-face {',
      `    font-family: '${f}';`,
      `    src: url('/fonts/${f.toLowerCase().replace(/\s+/g, '-')}-400.woff2') format('woff2');`,
      '    font-weight: 400;',
      '    font-style: normal;',
      '    font-display: swap;',
      '  }',
    )),
    '</style>',
  );
}

export function fontsNext(families) {
  const fams = families.length ? families : ['Inter'];
  const names = fams.map(nextFontName);
  return lines(
    '// app/layout.tsx',
    `import { ${names.join(', ')} } from 'next/font/google';`,
    '',
    '// next/font downloads the files at build time and serves them from your own domain.',
    ...names.map((n) => `const ${n.toLowerCase()} = ${n}({ subsets: ['latin', 'latin-ext'], display: 'swap' });`),
    '',
    'export default function RootLayout({ children }) {',
    '  return (',
    `    <html lang="hr" className={${names[0].toLowerCase()}.className}>`,
    '      <body>{children}</body>',
    '    </html>',
    '  );',
    '}',
    '// Then delete every <link> to fonts.googleapis.com.',
  );
}

export function youtubeClickToLoad(ids) {
  const id = ids[0] || 'VIDEO_ID';
  return lines(
    '<!-- Replace each YouTube iframe with this box. YouTube loads only when the visitor presses Play. -->',
    `<div class="video" data-id="${id}">`,
    '  <button type="button">Play video (loads YouTube, which sets cookies)</button>',
    '</div>',
    '<script>',
    "  document.querySelectorAll('.video').forEach(function (box) {",
    "    box.querySelector('button').addEventListener('click', function () {",
    "      box.innerHTML = '<iframe width=\"560\" height=\"315\" src=\"https://www.youtube-nocookie.com/embed/' +",
    "        box.dataset.id + '?autoplay=1\" title=\"YouTube video\" allow=\"autoplay; encrypted-media\" allowfullscreen></iframe>';",
    '    });',
    '  });',
    '</script>',
  );
}

export function youtubeNocookie(ids) {
  const id = ids[0] || 'VIDEO_ID';
  return lines(
    '<!-- The smaller change: switch the domain. YouTube still stores data once the video plays. -->',
    `<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/${id}"`,
    '  title="YouTube video" allow="encrypted-media" allowfullscreen></iframe>',
  );
}

export const MAPS_CLICK_TO_LOAD = lines(
  '<!-- Show a link or a static picture first. Load the map only when the visitor asks. -->',
  '<div class="map">',
  '  <a href="https://maps.google.com/?q=YOUR+ADDRESS" target="_blank" rel="noopener">Open the map in Google Maps</a>',
  '  <button type="button">Show the map here (loads Google Maps)</button>',
  '</div>',
  '<script>',
  "  document.querySelector('.map button').addEventListener('click', function () {",
  "    document.querySelector('.map').innerHTML = '<iframe width=\"600\" height=\"400\" loading=\"lazy\" src=\"PASTE_YOUR_EMBED_URL\"></iframe>';",
  '  });',
  '</script>',
);

export const FORM_NOTICE = lines(
  '<!-- Put this above the submit button of each contact form. -->',
  '<p class="form-notice">',
  '  We use your details only to answer this message.',
  '  Read how in our <a href="/privacy">privacy notice</a>.',
  '</p>',
);

// The checker cannot see what a form is for beyond what the page says, so
// only the contact notice states a purpose outright. Every other notice keeps
// the purpose and the retention in brackets for the owner to fill in. The
// event and newsletter versions only change the example in the brackets.
const purposeNotice = (comment, purpose, keep) => lines(
  `<!-- Put this above the submit button of each ${comment}.`,
  '     Replace every part in [brackets]. Only you know what the form is for. -->',
  '<p class="form-notice">',
  `  We use the details you enter here to ${purpose}.`,
  `  We keep them until ${keep}. Read how in our <a href="/privacy">privacy notice</a>.`,
  '</p>',
  '<!-- To send news or offers as well, add a separate box that is not ticked. -->',
);

export const EVENT_NOTICE = purposeNotice('event or booking form', '[confirm your place at the event and send you what you need to join it]', '[the event is over]');
export const NEWSLETTER_NOTICE = purposeNotice('newsletter signup', '[send you the newsletter you asked for]', '[you unsubscribe]');
export const OTHER_NOTICE = purposeNotice('form', '[say what you do with what people send here]', '[say when you delete it]');

/**
 * What a rebuilt DMARC record keeps, so the owner sees nothing was dropped.
 * `changed` names what the fix changes, "p" by default.
 */
export function dmarcKeepNote(tags, changed = 'p') {
  const notes = [`Only ${changed} changes. Every other tag stays as you set it.`, 'Change it only after the reports show nothing but your own mail tools for a few weeks.'];
  if (changed === 'p' || changed === 'p and sp') notes.push(REJECT_NOTE);
  if (tags.sp === 'none') notes.push('sp=none keeps every subdomain at reports only. Raising sp changes every subdomain of this domain, including ones this scan did not check, so decide it on its own.');
  if (String(tags.t).toLowerCase() === 'y') notes.push('t=y asks receivers to apply one level lower while you test, so with t=y quarantine acts as none. Remove t=y when the reports look clean.');
  if (tags.ruf) notes.push(`ruf sends failure reports to ${tags.ruf.replace(/^mailto:/i, '')}. They can hold parts of messages, so a separate alias is safer than a main inbox.`);
  const legacy = LEGACY_DMARC_TAGS.filter((k) => tags[k] !== undefined);
  if (legacy.length) {
    const one = legacy.length === 1;
    notes.push(`${legacy.join(' and ')} ${one ? 'is' : 'are'} from RFC 7489. RFC 9989 removed ${one ? 'it' : 'them'} (Appendix C.5.2), so newer receivers ignore ${one ? 'it' : 'them'}. ${one ? 'It stays' : 'They stay'} because older receivers still read ${one ? 'it' : 'them'}.`);
  }
  if (tags.pct && tags.pct !== '100') notes.push(`pct=${tags.pct} asks older receivers to apply the policy to ${tags.pct}% of failing mail.`);
  return notes.join('\n');
}

/**
 * A DMARC record from the gate (suggestDmarc), or why there is none. Every
 * DMARC value a fix shows comes through here, so no value skips the gate.
 */
export function dmarcSuggestion(site, s, note = '', existing = false) {
  if (s?.held) return heldDmarcText(site, s, existing);
  if (!s?.value) return `No DMARC record is suggested for ${site}, because the policy that applies to it could not be read. Run the check again.`;
  return dnsRecord('TXT', recordName(site, '_dmarc', s.zone), s.value, note);
}

export const MARKETING_BOX = lines(
  '<!-- One box per marketing purpose. No checked attribute, and not required. -->',
  '<label>',
  '  <input type="checkbox" name="marketing" value="yes">',
  '  Send me news about future events. Optional. You can unsubscribe any time.',
  '</label>',
);

export const BUNDLED_SPLIT = lines(
  '<!-- Split the one box into a notice and a separate optional box. -->',
  '<p class="form-notice">',
  '  By sending this form you agree to our <a href="/terms">terms</a>.',
  '  Read how we use your details in our <a href="/privacy">privacy notice</a>.',
  '</p>',
  '<label>',
  '  <input type="checkbox" name="marketing" value="yes">',
  '  Send me news and offers. Optional.',
  '</label>',
);

export const PRIVACY_FOOTER = lines(
  '<!-- Link the notice from every page, for example in the footer. -->',
  '<footer>',
  '  <a href="/privacy">Privacy notice</a>',
  '</footer>',
  '<!-- The notice itself says who you are, what you collect, why, which',
  '     tools receive it, how long you keep it and how people use their rights. -->',
);

export const TRADER_FOOTER = lines(
  '<!-- Fill in your own details. Ask your accountant which register entry applies. -->',
  '<footer>',
  '  <p>',
  '    [Business name], [obrt or d.o.o.], [street and number], [postcode] [city], Croatia<br>',
  '    OIB: [11 digits]. Registered in [obrtni registar or sudski registar], number [number].<br>',
  '    Email: <a href="mailto:[your address]">[your address]</a>',
  '  </p>',
  '  <a href="/impressum">Impressum</a>',
  '</footer>',
);

const SPF_INCLUDES = [
  [/google\.com$|googlemail\.com$/, 'include:_spf.google.com'],
  [/protection\.outlook\.com$/, 'include:spf.protection.outlook.com'],
  [/zoho\.(eu|com|in)$/, (h) => `include:zohomail.${h.match(/zoho\.(eu|com|in)$/)[1]}`],
  [/protonmail\.ch$/, 'include:_spf.protonmail.ch'],
  [/messagingengine\.com$/, 'include:spf.messagingengine.com'],
  [/improvmx\.com$/, 'include:spf.improvmx.com'],
  [/forwardemail\.net$/, 'include:spf.forwardemail.net'],
  [/migadu\.com$/, 'include:spf.migadu.com'],
  [/mx\.cloudflare\.net$/, 'include:_spf.mx.cloudflare.net'],
];

/** The SPF include for a known mail host, or a placeholder. */
export function spfIncludeFor(mx) {
  for (const m of mx || []) {
    for (const [re, inc] of SPF_INCLUDES) if (re.test(m.host)) return typeof inc === 'function' ? inc(m.host) : inc;
  }
  return 'include:<your mail host>';
}

/**
 * The name to type in the DNS panel. For a subdomain it is relative to the
 * zone, with the full name beside it, because "@" or "_dmarc" there would
 * land on the parent domain instead. `zone` is the zone the scan read from
 * DNS. Null means it is unknown, so only the full name is given.
 */
export function recordName(site, label = '', zone = undefined) {
  const n = zoneNames(site, zone);
  if (!n.known) return `${n.full(label)} (the full name. The scan could not tell which DNS zone holds it, so check how your DNS panel names records under your domain)`;
  return n.isSub ? `${n.label(label)} (in the ${n.org} zone, full name ${n.full(label)})` : n.label(label);
}

export function dnsRecord(type, name, value, note = '') {
  return lines(`Type:  ${type}`, `Name:  ${name}`, `Value: ${value}`, note ? `\n${note}` : '').trimEnd();
}

export function securityHeaders(missing, stack) {
  const values = {
    'strict-transport-security': 'max-age=31536000; includeSubDomains',
    'x-content-type-options': 'nosniff',
    'referrer-policy': 'strict-origin-when-cross-origin',
    'permissions-policy': 'camera=(), microphone=(), geolocation=()',
    'content-security-policy': "default-src 'self'; frame-ancestors 'self'",
  };
  const pairs = missing.map((m) => [m, values[m]]).filter(([, v]) => v);
  // A new CSP starts in report-only mode, so it cannot break the site on day one.
  const name = (m) => (m === 'content-security-policy' ? 'Content-Security-Policy-Report-Only' : m.split('-').map((w) => w[0].toUpperCase() + w.slice(1)).join('-'));
  const tabs = [];
  if (stack.includes('Vercel')) {
    tabs.push({ label: 'vercel.json', code: JSON.stringify({ headers: [{ source: '/(.*)', headers: pairs.map(([k, v]) => ({ key: name(k), value: v })) }] }, null, 2) });
  }
  if (stack.includes('Netlify')) {
    tabs.push({ label: 'Netlify _headers', code: lines('/*', ...pairs.map(([k, v]) => `  ${name(k)}: ${v}`)) });
  }
  if (stack.includes('Next.js')) {
    tabs.push({ label: 'next.config.js', code: lines('module.exports = {', '  async headers() {', '    return [{', "      source: '/(.*)',", '      headers: [', ...pairs.map(([k, v]) => `        { key: '${name(k)}', value: "${v}" },`), '      ],', '    }];', '  },', '};') });
  }
  tabs.push({ label: 'nginx', code: lines(...pairs.map(([k, v]) => `add_header ${name(k)} "${v}" always;`)) });
  tabs.push({ label: 'Apache .htaccess', code: lines('<IfModule mod_headers.c>', ...pairs.map(([k, v]) => `  Header always set ${name(k)} "${v}"`), '</IfModule>') });
  return tabs;
}
