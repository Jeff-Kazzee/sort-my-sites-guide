// Runs inside the page through page.evaluate, so it must not reference
// anything outside its own body. It reads the DOM and never submits a form.

export function extractPage() {
  const clean = (s) => String(s || '').replace(/\s+/g, ' ').trim();
  const textOf = (el) => clean(el ? (el.innerText || el.textContent) : '');
  const PRIVACY = /privac|privatnost|zaštit[aei] (osobnih )?podataka|osobni(h)? podata|datenschutz|confidentialit|protection des données|gdpr|informativa/i;
  const MARKETING = /newsletter|marketing|novost|obavijest|ponud|promo|offers|updates|future (workshops|events)|buduć|mailing|news\b|e-?mail list/i;
  const TERMS = /terms|uvjet|pravil|privac|privatnost|agree|slažem|prihvaćam|conditions/i;
  const footerEl = document.querySelector('footer, [role="contentinfo"]');

  const links = [...document.querySelectorAll('a[href]')].slice(0, 500).map((a) => ({
    text: textOf(a).slice(0, 80) || clean(a.getAttribute('aria-label') || a.title || ''),
    href: a.href,
    footer: !!a.closest('footer, [role="contentinfo"], [class*="footer" i], [id*="footer" i]'),
  }));

  const personal = (f) => f.type === 'email' || f.type === 'tel' || f.tag === 'textarea'
    || /e-?mail|name|ime|prezime|phone|telefon|mobitel|message|poruka|address|adresa|company|tvrtka/i.test(f.name + ' ' + f.auto + ' ' + f.placeholder);

  const forms = [...document.querySelectorAll('form')].map((form, index) => {
    const inputs = [...form.querySelectorAll('input, textarea, select')];
    const fields = inputs
      .filter((x) => !['hidden', 'submit', 'button', 'reset', 'image', 'checkbox', 'radio'].includes((x.type || '').toLowerCase()))
      .map((x) => ({ tag: x.tagName.toLowerCase(), type: (x.type || '').toLowerCase(), name: x.name || x.id || '', auto: x.autocomplete || '', placeholder: x.placeholder || '' }));
    const boxes = inputs.filter((x) => (x.type || '').toLowerCase() === 'checkbox').map((x) => {
      const label = (x.labels && x.labels[0]) ? textOf(x.labels[0]) : textOf(x.closest('label') || x.parentElement);
      return { name: x.name || x.id || '', label: label.slice(0, 240), checked: x.checked, required: x.required };
    });
    const isSearch = form.matches('[role="search"]') || (fields.length > 0 && fields.every((f) => f.type === 'search' || /^(q|s|search|query|pretraga)$/i.test(f.name)));
    let hasNotice = false;
    let noticeHow = '';
    let near = form;
    for (let up = 0; up < 4 && near && near !== document.body && !hasNotice; up++) {
      if (up > 0 && footerEl && near.contains(footerEl)) break;
      const a = [...near.querySelectorAll('a[href]')].find((l) => PRIVACY.test(textOf(l) + ' ' + l.getAttribute('href')));
      if (a) { hasNotice = true; noticeHow = `link "${textOf(a).slice(0, 60)}"${up ? ' next to the form' : ' in the form'}`; }
      near = near.parentElement;
    }
    const submit = form.querySelector('button[type="submit"], input[type="submit"], button:not([type])');
    const submitText = submit ? (submit.value && submit.tagName === 'INPUT' ? submit.value : textOf(submit)).slice(0, 60) : '';
    const id = form.id ? '#' + form.id : `form:nth-of-type(${index + 1})`;
    const action = form.getAttribute('action') ? form.action : '';
    return {
      selector: id,
      action,
      submitText,
      scripted: !form.getAttribute('action'),
      method: (form.getAttribute('method') || 'get').toLowerCase(),
      fields: fields.map((f) => f.type === 'email' ? 'email' : f.type === 'tel' ? 'phone' : f.tag === 'textarea' ? 'message' : (f.name || f.type || f.tag)),
      personal: fields.some(personal),
      isSearch,
      boxes,
      marketingBoxes: boxes.filter((b) => MARKETING.test(b.label)),
      bundledBoxes: boxes.length === 1 && MARKETING.test(boxes[0].label) && TERMS.test(boxes[0].label) ? boxes : [],
      hasNotice,
      noticeHow,
    };
  });

  // Only src loads a frame. A URL kept in data-src waits for a click or a
  // consent script, so it is not an embed that loaded.
  const iframes = [...document.querySelectorAll('iframe')].map((f) => f.src).filter((s) => /^https?:/.test(s));

  const consentCalls = [];
  try {
    for (const e of (Array.isArray(window.dataLayer) ? window.dataLayer : [])) {
      if (e && typeof e === 'object' && e[0] === 'consent') consentCalls.push({ cmd: String(e[1]), params: JSON.parse(JSON.stringify(e[2] || {})) });
    }
  } catch (_) { /* a page can replace dataLayer with anything */ }

  const gen = document.querySelector('meta[name="generator" i]');
  const html = document.documentElement.outerHTML.slice(0, 400000);
  const stack = [];
  if (document.getElementById('__next') || document.getElementById('__NEXT_DATA__') || /\/_next\/static\//.test(html)) stack.push('Next.js');
  if (/\/wp-content\/|\/wp-includes\//.test(html)) stack.push('WordPress');
  if (document.documentElement.hasAttribute('data-wf-site')) stack.push('Webflow');
  if (/cdn\.shopify\.com/.test(html)) stack.push('Shopify');
  if (document.querySelector('astro-island') || /\/_astro\//.test(html)) stack.push('Astro');
  if (window.__NUXT__ || document.getElementById('__nuxt')) stack.push('Nuxt');
  if (/framerusercontent\.com/.test(html)) stack.push('Framer');
  if (/static\.wixstatic\.com/.test(html)) stack.push('Wix');
  if (gen) {
    const g = gen.content || '';
    for (const [re, name] of [[/wordpress/i, 'WordPress'], [/webflow/i, 'Webflow'], [/astro/i, 'Astro'], [/hugo/i, 'Hugo'], [/jekyll/i, 'Jekyll'], [/gatsby/i, 'Gatsby'], [/squarespace/i, 'Squarespace'], [/wix/i, 'Wix'], [/framer/i, 'Framer'], [/eleventy/i, 'Eleventy']]) if (re.test(g) && !stack.includes(name)) stack.push(name);
  }

  return {
    url: location.href,
    title: document.title,
    lang: document.documentElement.lang || '',
    text: (document.body ? document.body.innerText : '').slice(0, 30000),
    links,
    forms,
    iframes,
    consentCalls,
    tcf: typeof window.__tcfapi === 'function',
    stack,
  };
}

/**
 * Device storage the page can see. IndexedDB names need the async API. A
 * store that throws goes in unreadable, because an empty list would claim
 * that nothing was stored.
 */
export async function readStorage() {
  const out = { local: [], session: [], idb: [], sw: [], unreadable: [] };
  try { out.local = Object.keys(localStorage); } catch (_) { out.unreadable.push('localStorage'); }
  try { out.session = Object.keys(sessionStorage); } catch (_) { out.unreadable.push('sessionStorage'); }
  try { if (indexedDB.databases) out.idb = (await indexedDB.databases()).map((d) => d.name).filter(Boolean); } catch (_) { out.unreadable.push('IndexedDB'); }
  try { if (navigator.serviceWorker) out.sw = (await navigator.serviceWorker.getRegistrations()).map((r) => r.scope); } catch (_) { out.unreadable.push('service worker'); }
  return out;
}
