// Find a consent banner and its reject, accept and settings controls.
// Known consent tools are matched by selector first. Text in seven languages
// is the fallback. Selectors pierce open shadow roots, and every frame is
// searched, because some tools render inside an iframe.

export const CMPS = [
  { id: 'cookiebot', name: 'Cookiebot', root: '#CybotCookiebotDialog', reject: ['#CybotCookiebotDialogBodyButtonDecline'], accept: ['#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll', '#CybotCookiebotDialogBodyButtonAccept'], settings: ['#CybotCookiebotDialogBodyButtonDetails', '#CybotCookiebotDialogBodyLevelButtonCustomize'] },
  { id: 'onetrust', name: 'OneTrust', root: '#onetrust-banner-sdk', reject: ['#onetrust-reject-all-handler', '.ot-pc-refuse-all-handler'], accept: ['#onetrust-accept-btn-handler'], settings: ['#onetrust-pc-btn-handler'] },
  { id: 'usercentrics', name: 'Usercentrics', root: '#usercentrics-root, #usercentrics-cmp-ui, #uc-center-container', reject: ['[data-testid="uc-deny-all-button"]', '#deny'], accept: ['[data-testid="uc-accept-all-button"]', '#accept'], settings: ['[data-testid="uc-more-button"]'] },
  { id: 'cookieyes', name: 'CookieYes', root: '.cky-consent-container', reject: ['.cky-btn-reject'], accept: ['.cky-btn-accept'], settings: ['.cky-btn-customize'] },
  { id: 'didomi', name: 'Didomi', root: '#didomi-host, #didomi-popup, #didomi-notice', reject: ['#didomi-notice-disagree-button', '.didomi-continue-without-agreeing'], accept: ['#didomi-notice-agree-button'], settings: ['#didomi-notice-learn-more-button'] },
  { id: 'iubenda', name: 'iubenda', root: '#iubenda-cs-banner', reject: ['.iubenda-cs-reject-btn'], accept: ['.iubenda-cs-accept-btn'], settings: ['.iubenda-cs-customize-btn'] },
  { id: 'klaro', name: 'Klaro', root: '.klaro .cookie-notice, .klaro .cookie-modal', reject: ['.cn-decline', '.cm-btn-decline'], accept: ['.cm-btn-accept-all', '.cm-btn-success'], settings: ['.cn-learn-more'] },
  { id: 'osano', name: 'Osano', root: '.osano-cm-dialog', reject: ['.osano-cm-denyAll', '.osano-cm-deny'], accept: ['.osano-cm-accept-all', '.osano-cm-accept'], settings: ['.osano-cm-manage'] },
  { id: 'complianz', name: 'Complianz', root: '.cmplz-cookiebanner, #cmplz-cookiebanner-container', reject: ['.cmplz-deny'], accept: ['.cmplz-accept'], settings: ['.cmplz-view-preferences'] },
  { id: 'borlabs', name: 'Borlabs Cookie', root: '#BorlabsCookieBox, .brlbs-cmpnt-dialog', reject: ['._brlbs-refuse-btn a', '._brlbs-refuse', '[data-borlabs-cookie-actions="refuse"]'], accept: ['._brlbs-btn-accept-all a', '[data-borlabs-cookie-actions="accept-all"]'], settings: ['._brlbs-manage-btn a'] },
  { id: 'termly', name: 'Termly', root: '[data-testid="termly-banner"], #termly-code-snippet-support', reject: ['[data-tid="banner-decline"]'], accept: ['[data-tid="banner-accept"]'], settings: ['[data-tid="banner-preferences"]'] },
  { id: 'funding-choices', name: 'Google consent message', root: '.fc-consent-root', reject: ['.fc-cta-do-not-consent'], accept: ['.fc-cta-consent'], settings: ['.fc-cta-manage-options'] },
];

const REJECT = [
  'reject all', 'reject', 'decline all', 'decline', 'deny all', 'deny', 'refuse all', 'refuse', 'only necessary', 'necessary only', 'use necessary cookies only', 'only essential', 'essential only', 'continue without accepting',
  'odbij sve', 'odbij', 'odbaci sve', 'odbaci', 'ne prihvaćam', 'nastavi bez prihvaćanja', 'odbij neobavezne', 'odbij kolačiće', 'samo nužni', 'samo nužne', 'samo neophodni', 'samo neophodne', 'samo nužno',
  'alle ablehnen', 'ablehnen', 'nur notwendige', 'nur essenzielle',
  'tout refuser', 'refuser', 'continuer sans accepter',
  'rifiuta tutto', 'rifiuta', 'solo necessari',
  'rechazar todo', 'rechazar', 'solo necesarias',
  'alles weigeren', 'weigeren', 'alleen noodzakelijke',
];
const ACCEPT = [
  'accept all', 'accept all cookies', 'accept cookies', 'accept', 'allow all', 'allow all cookies', 'allow', 'agree', 'i agree', 'agree and close', 'ok', 'okay', 'got it', 'i understand',
  'prihvati sve', 'prihvati', 'prihvaćam', 'prihvaćam sve', 'slažem se', 'dopusti sve', 'dozvoli sve', 'u redu', 'razumijem',
  'alle akzeptieren', 'akzeptieren', 'zustimmen', 'einverstanden',
  'tout accepter', 'accepter', "j'accepte",
  'accetta tutto', 'accetta', 'accetto',
  'aceptar todo', 'aceptar', 'acepto',
  'alles accepteren', 'accepteren', 'akkoord',
];
const SETTINGS = [
  'settings', 'cookie settings', 'preferences', 'manage preferences', 'manage cookies', 'customize', 'customise', 'more options', 'options', 'manage',
  'postavke', 'postavke kolačića', 'prilagodi', 'upravljaj', 'više opcija',
  'einstellungen', 'anpassen', 'paramètres', 'personnaliser', 'impostazioni', 'personalizza', 'configuración', 'configurar', 'instellingen', 'aanpassen',
];
const SAVE = ['save', 'save choices', 'save settings', 'save preferences', 'confirm choices', 'confirm my choices', 'spremi', 'spremi postavke', 'potvrdi', 'potvrdi odabir', 'auswahl speichern', 'speichern', 'enregistrer', 'salva', 'guardar', 'opslaan'];

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const phrase = (list) => new RegExp('^\\s*(?:' + list.slice().sort((a, b) => b.length - a.length).map(esc).join('|') + ')(?:\\s+(?:all|cookies|sve|kolačiće|alle))?\\s*[.!]?\\s*$', 'i');
export const REJECT_RE = phrase(REJECT);
export const ACCEPT_RE = phrase(ACCEPT);
export const SETTINGS_RE = phrase(SETTINGS);
export const SAVE_RE = phrase(SAVE);
export const COOKIE_WORDS = /cookie|kolačić|kolacic|privol|consent|einwilligung|consentement|traceurs/i;
const GENERIC_ROOT = '[id*="cookie" i], [class*="cookie" i], [id*="consent" i], [class*="consent" i], [id*="gdpr" i], [class*="gdpr" i], [aria-label*="cookie" i], [aria-label*="kolačić" i], [role="dialog"], [aria-modal="true"]';

async function firstVisible(locator) {
  const n = Math.min(await locator.count().catch(() => 0), 20);
  for (let i = 0; i < n; i++) {
    const el = locator.nth(i);
    if (await el.isVisible().catch(() => false)) return el;
  }
  return null;
}

async function bySelectors(frame, selectors) {
  for (const sel of selectors || []) {
    const el = await firstVisible(frame.locator(sel));
    if (el) return { el, how: sel };
  }
  return null;
}

// True when the element sits in a fixed or sticky layer or a dialog, which is
// where banners live. A button in the page body with the same words is not one.
const inOverlay = (el) => el.evaluate((node) => {
  for (let n = node; n && n !== document.body; n = n.parentElement) {
    if (n.matches('dialog, [role="dialog"], [aria-modal="true"]')) return true;
    const p = getComputedStyle(n).position;
    if (p === 'fixed' || p === 'sticky') return true;
  }
  return false;
}).catch(() => false);

async function byText(frame, re, { overlayOnly = false } = {}) {
  for (const role of ['button', 'link']) {
    const loc = frame.getByRole(role, { name: re });
    const n = Math.min(await loc.count().catch(() => 0), 20);
    for (let i = 0; i < n; i++) {
      const el = loc.nth(i);
      if (!(await el.isVisible().catch(() => false))) continue;
      if (overlayOnly && !(await inOverlay(el))) continue;
      return { el, how: `${role} named "${(await el.innerText().catch(() => '')).trim().slice(0, 40)}"` };
    }
  }
  return null;
}

async function genericRoot(frame) {
  return frame.evaluate(({ sel, words }) => {
    const re = new RegExp(words, 'i');
    for (const el of document.querySelectorAll(sel)) {
      const r = el.getBoundingClientRect();
      if (r.width < 50 || r.height < 20) continue;
      const s = getComputedStyle(el);
      if (s.display === 'none' || s.visibility === 'hidden' || Number(s.opacity) === 0) continue;
      let layer = el.matches('dialog, [role="dialog"], [aria-modal="true"]');
      for (let n = el; !layer && n && n !== document.body; n = n.parentElement) {
        const p = getComputedStyle(n).position;
        if (p === 'fixed' || p === 'sticky') layer = true;
      }
      if (layer && re.test(el.innerText || '')) return el.id ? '#' + el.id : el.tagName.toLowerCase();
    }
    return '';
  }, { sel: GENERIC_ROOT, words: COOKIE_WORDS.source }).catch(() => '');
}

async function frameMentionsCookies(frame) {
  const text = await frame.evaluate(() => (document.body ? document.body.innerText : '').slice(0, 40000)).catch(() => '');
  return COOKIE_WORDS.test(text);
}

/**
 * Look for a consent banner in every frame of the page.
 * @returns {Promise<null | { cmp: {id: string, name: string} | null, frame: any, reject: any, accept: any, settings: any, rootFound: boolean, tcf: boolean }>}
 */
export async function findBanner(page) {
  const tcf = await page.evaluate(() => typeof window.__tcfapi === 'function').catch(() => false);
  for (const frame of page.frames()) {
    for (const cmp of CMPS) {
      const root = await firstVisible(frame.locator(cmp.root));
      if (!root) continue;
      // Only the tool root and frames nested inside it own these controls.
      const scopes = [root];
      for (let i = 0; i < scopes.length; i++) {
        for (const handle of await scopes[i].locator('iframe').elementHandles()) {
          const child = await handle.contentFrame();
          if (child) scopes.push(child);
        }
      }
      const inTool = async (selectors, re) => {
        for (const scope of scopes) {
          const control = (await bySelectors(scope, selectors)) || (await byText(scope, re));
          if (control) return control;
        }
        return null;
      };
      const reject = await inTool(cmp.reject, REJECT_RE);
      const accept = await inTool(cmp.accept, ACCEPT_RE);
      const settings = await inTool(cmp.settings, SETTINGS_RE);
      return { cmp: { id: cmp.id, name: cmp.name }, frame, reject, accept, settings, rootFound: true, tcf };
    }
  }
  for (const frame of page.frames()) {
    if (!(await frameMentionsCookies(frame))) continue;
    const overlay = { overlayOnly: frame === page.mainFrame() };
    const reject = await byText(frame, REJECT_RE, overlay);
    const accept = await byText(frame, ACCEPT_RE, overlay);
    const settings = await byText(frame, SETTINGS_RE, overlay);
    const root = await genericRoot(frame);
    if (reject || accept || root) return { cmp: null, frame, reject, accept, settings, rootFound: !!root, rootHow: root, tcf };
  }
  return null;
}

/** Wait up to `ms` for a banner to appear. */
export async function waitForBanner(page, ms = 8000) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    const b = await findBanner(page);
    if (b) return b;
    await page.waitForTimeout(500);
  }
  return null;
}

// The optional choices still switched on in the consent layer around a
// control: enabled checkboxes and switches that are on. The layer is the
// outermost dialog or fixed box, so toggles above a sticky footer count.
// null means they could not be read.
const optionalChoicesOn = (el) => el.evaluate((node) => {
  let layer = null;
  for (let n = node; n && n !== document.body; n = n.parentElement) {
    const p = getComputedStyle(n).position;
    if (n.matches('dialog, [role="dialog"], [aria-modal="true"]') || p === 'fixed' || p === 'sticky') layer = n;
  }
  const on = [...(layer || document.body).querySelectorAll('input[type="checkbox"], [role="switch"], [role="checkbox"]')].filter((x) => {
    const isInput = x.tagName === 'INPUT';
    const checked = isInput ? x.checked : x.getAttribute('aria-checked') === 'true';
    const disabled = isInput ? x.disabled : x.getAttribute('aria-disabled') === 'true';
    return checked && !disabled;
  });
  return on.map((x) => ((x.labels && x.labels[0] ? x.labels[0].innerText : '') || x.getAttribute('aria-label') || x.name || x.id || 'unnamed choice').trim().slice(0, 60));
}).catch(() => null);

/**
 * After opening settings, look for a reject control, else a save control, in
 * the consent layer. In the main frame only controls in an overlay are
 * pressed, so the page's own Save button never is. kind says which was found.
 * A save control also carries optionalOn, the choices still on in its layer,
 * because pressing Save with one of them on agrees to it. A matching control
 * outside any overlay comes back with outsideLayer, so the caller can say the
 * reject was not checked instead of saying there is none.
 */
export async function findSecondLayerReject(page) {
  for (const frame of page.frames()) {
    const scope = { overlayOnly: frame === page.mainFrame() };
    const reject = await byText(frame, REJECT_RE, scope);
    if (reject) return { ...reject, kind: 'reject' };
    const save = await byText(frame, SAVE_RE, scope);
    if (save) return { ...save, kind: 'save', optionalOn: await optionalChoicesOn(save.el) };
  }
  const main = page.mainFrame();
  const outside = (await byText(main, REJECT_RE)) || (await byText(main, SAVE_RE));
  return outside ? { ...outside, kind: 'outside', outsideLayer: true } : null;
}
