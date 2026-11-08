// The rules catalog. Each check outcome names a rule here, and the rule turns
// it into a finding the owner can act on: what is wrong, why it matters, the
// fix with copy-ready code, who does it and how long it takes.
//
// Rank bands follow the brief: 100 tracking before or after a choice, 200
// forms and notices, 300 spoofable email, 400 trader details, 500 the rest.
// Claims are ids in research/. Hygiene rules cite none. Every claim is a draft
// today, so the text says what the research library says, not what the law is.

import * as S from './snippets.js';
import { REJECT_NOTE } from '../dns.js';

const YOU = 'You';
const DEV = 'Your developer';
const YOU_OR_DEV = 'You or your developer';
const DNS_YOU = 'You, in your domain\'s DNS panel';

/** What the parent fix of dmarc-inherited-none does to the parent domain itself. */
const parentFixNote = (inh, tag) => {
  if (!inh.invalid) return `Only ${tag} changes, so ${inh.org} itself keeps its policy, and every other tag stays.`;
  if (inh.invalid === 'p') return `It also sets p=none in place of the p value that is not valid. Receivers already read the record as p=none, so ${inh.org} itself keeps the policy it has today. Every other tag stays.`;
  const p = String(inh.tags.p).toLowerCase();
  return `It also repairs the ${inh.invalid} value that is not valid. Today receivers read the whole record as p=none. After the fix they read all of it again, so ${inh.org} itself gets p=${p}, the policy its record already asks for.${p === 'reject' ? `\n${REJECT_NOTE}` : ''}`;
};

const list = (xs) => (xs.length <= 1 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`);
const has = (stack, name) => (stack || []).includes(name);

const trackerFix = (o, stack) => {
  const vendors = o.data.vendors || [];
  const google = vendors.some((v) => /google/i.test(v));
  const gaId = (o.data.googleIds || []).find((x) => x.startsWith('G-'));
  const tabs = [{ label: 'Plain HTML', code: google && vendors.length === 1 ? S.gaGatePlain(gaId) : google ? `${S.gaGatePlain(gaId)}\n\n${S.trackerGatePlain(vendors.filter((v) => !/google/i.test(v)))}` : S.trackerGatePlain(vendors) }];
  if (has(stack, 'Next.js') && google) tabs.push({ label: 'Next.js App Router', code: S.gaGateNext(gaId) });
  if (has(stack, 'WordPress')) tabs.push({ label: 'WordPress', code: S.WORDPRESS_CONSENT });
  return tabs;
};

export const RULES = {
  'tracker-before-choice': {
    area: 'Before a choice', topic: 'analytics', rank: 100, who: DEV, time: '1 to 2 hours',
    claims: ['F-DEVICE-01', 'F-DEVICE-13', 'N-HR-COOKIE-CONSENT-01', 'N-HR-COOKIE-CONSENT-07'],
    title: (o) => (o.state !== 'could_not_check' ? `${list(o.data.vendors)} ${o.data.vendors.length > 1 ? 'load' : 'loads'} before the visitor chooses`
      : o.data.reason === 'failed' ? `Could not confirm whether ${list(o.data.vendors)} ${o.data.vendors.length > 1 ? 'load' : 'loads'} before a choice`
        : `Could not tell what an EU visitor gets before a choice on ${o.site}`),
    sentence: (o) => {
      if (o.state === 'could_not_check' && o.data.reason === 'failed') return `The page asked for ${list(o.data.vendors)} before any choice, but the request did not complete in this run, so we did not see it run. Run the check again.`;
      const stored = o.data.stored || [];
      const also = stored.length ? ` ${o.data.vendors.length > 1 ? 'They' : 'It'} also stored ${list(stored.slice(0, 4))}${stored.length > 4 ? ' and more' : ''} on the device.` : '';
      if (o.state === 'could_not_check') return `From outside the EU we saw ${list(o.data.vendors)} load with no banner, but EU visitors may get a banner that stops it.${also} Run the check from an EU connection to know.`;
      return `${list(o.data.vendors)} ${o.data.vendors.length > 1 ? 'load' : 'loads'} on the first page view, before anyone presses Accept or Reject.${also}`;
    },
    why: () => 'The research library says storing or reading anything on a visitor\'s device needs consent first, unless it is strictly needed for what the visitor asked for. Analytics and advertising are not strictly needed just because they are useful to you. In Croatia the rule is Article 43(4) of the Electronic Communications Act.',
    fix: trackerFix,
    verify: () => 'Open the site in a fresh private window and do not touch the banner. The Network tab should show no request to these tools, and Application should show no cookie from them.',
  },
  'tracker-after-reject': {
    area: 'Consent banner', topic: 'analytics', rank: 110, who: DEV, time: '1 to 2 hours',
    claims: ['F-DEVICE-01', 'N-HR-COOKIE-CONSENT-01', 'N-HR-COOKIE-WITHDRAW-09'],
    title: (o) => `${list(o.data.vendors)} still ${o.data.vendors.length > 1 ? 'run' : 'runs'} after Reject`,
    sentence: (o) => `We pressed Reject and reloaded. ${list(o.data.vendors)} still loaded, so the banner does not do what it says.`,
    why: () => 'A reject that does not stop tracking gives the visitor no real choice. The research library says consent must come before the tracking, and that the mechanism should be tested by rejecting and watching what still loads.',
    fix: (o, stack) => {
      const tabs = [{ label: 'Consent tool', code: '1. Open your consent tool and find the list of scripts it blocks.\n2. Add every tool from the evidence list to the marketing or statistics category.\n3. Make sure each tag loads only through the tool. Remove any copy hard-coded in your theme or layout.\n4. Press Reject in a private window and check the Network tab stays empty for these hosts.' }];
      return tabs.concat(trackerFix(o, stack));
    },
    verify: () => 'Fresh private window, press Reject, reload. No request to these tools should appear.',
  },
  'consent-mode-default-granted': {
    area: 'Before a choice', topic: 'analytics', rank: 120, who: DEV, time: '30 minutes',
    claims: ['F-DEVICE-01', 'F-GDPR-BASIS-05', 'N-HR-COOKIE-CONSENT-01'],
    title: () => 'Google Consent Mode starts as granted',
    sentence: () => 'Your page tells Google tags that the visitor already agreed, before the visitor has chosen anything.',
    why: () => 'The research library says consent has to be a clear action by the visitor. A default of granted treats silence as a yes.',
    fix: () => [{ label: 'Plain HTML', code: "<script>\n  window.dataLayer = window.dataLayer || [];\n  function gtag() { dataLayer.push(arguments); }\n  // This must run before any Google tag loads.\n  gtag('consent', 'default', {\n    ad_storage: 'denied',\n    ad_user_data: 'denied',\n    ad_personalization: 'denied',\n    analytics_storage: 'denied'\n  });\n</script>" }],
    verify: () => "In the browser console, type dataLayer and look for the 'consent', 'default' entry. Every value should be denied.",
  },
  'no-reject-option': {
    area: 'Consent banner', topic: 'analytics', rank: 130, who: YOU_OR_DEV, time: '30 minutes',
    claims: ['N-HR-COOKIE-WITHDRAW-02', 'N-HR-COOKIE-WITHDRAW-03'],
    title: () => 'The banner has no way to say no',
    sentence: () => 'The banner offers Accept but no Reject, on the first screen or behind its settings.',
    why: () => 'The research library says AZOP\'s 2026 guidance asks for accept and reject to be equally easy on the first banner layer.',
    fix: () => [{ label: 'Banner buttons', code: '<div class="consent-banner" role="dialog" aria-label="Cookie choice">\n  <p>We use analytics only if you agree. <a href="/privacy">Details</a></p>\n  <button type="button" onclick="rejectAnalytics()">Reject all</button>\n  <button type="button" onclick="acceptAnalytics()">Accept all</button>\n</div>\n<!-- Same size, same colour weight, side by side. -->' }],
    verify: () => 'Fresh private window. Reject should sit next to Accept, with the same size and weight.',
  },
  'reject-second-layer': {
    area: 'Consent banner', topic: 'analytics', rank: 140, who: YOU_OR_DEV, time: '15 minutes',
    claims: ['N-HR-COOKIE-WITHDRAW-02'],
    title: () => 'Reject is hidden behind settings',
    sentence: () => 'Accept takes one click. Rejecting takes two, because Reject only appears after opening the settings.',
    why: () => 'The research library says AZOP\'s 2026 guidance asks for accept and reject to be equally easy on the first layer.',
    fix: () => [{ label: 'Consent tool', code: '1. In your consent tool, open the banner layout settings.\n2. Turn on a "Reject all" button on the first layer.\n3. Give it the same style as "Accept all".' }],
    verify: () => 'Fresh private window. Reject all should be visible without opening settings.',
  },
  'consent-banner-not-operable': {
    area: 'Consent banner', topic: 'analytics', rank: 135, who: YOU, time: '5 minutes',
    claims: [],
    title: () => 'Could not press the banner',
    sentence: () => 'A cookie banner appeared, but the checker found no button it could press, so the reject and accept states were not checked.',
    why: () => 'Without pressing the banner we cannot see what loads after a choice. This is not good news, only a gap.',
    fix: () => [{ label: 'By hand', code: '1. Open the site in a fresh private window with DevTools on the Network tab.\n2. Press Reject. Reload.\n3. Note every request to an analytics or advertising host.\n4. Repeat in a new window with Accept.' }],
    verify: () => 'Check the screenshot, then do the two runs by hand.',
  },
  'reject-not-checked': {
    area: 'Consent banner', topic: 'analytics', rank: 136, who: YOU, time: '5 minutes',
    claims: [],
    title: () => 'Could not check what happens after Reject',
    sentence: (o) => {
      const r = o.data?.reason;
      if (r === 'banner-returned') return 'We pressed Reject, but the banner came back after the reload, so the choice was not stored. We do not know what loads after Reject.';
      if (r === 'save-not-reject') return `The settings layer offers Save, not Reject, and a Save here would keep ${list(o.data.optionalOn || ['an optional choice'])} switched on. We did not press it, so we do not know what loads after Reject.`;
      if (r === 'control-outside-layer') return 'The Reject control we found sits outside the consent layer, so we did not press it. We do not know what loads after Reject.';
      return `The Reject run did not finish in this run${r ? ` (${r})` : ''}, so we do not know what loads after it.`;
    },
    why: () => 'This is a gap in the check, not a result.',
    fix: () => [{ label: 'By hand', code: '1. Fresh private window, DevTools on the Network tab.\n2. Press Reject, then reload.\n3. Note every analytics or advertising host that still loads.' }],
    verify: () => 'Run the check again. If it fails twice, do the steps by hand.',
  },
  'storage-not-read': {
    area: 'Before a choice', topic: 'storage', rank: 185, who: YOU, time: '5 minutes',
    claims: [],
    title: () => 'Could not read what the site stores',
    sentence: (o) => `The browser refused to read ${list(o.data.stores || ['a store'])} in this run, so we do not know what the site keeps there before a choice.`,
    why: () => 'This is a gap in the check, not a result. An empty store and a store we could not read look the same unless we say so.',
    fix: () => [{ label: 'By hand', code: '1. Fresh private window, DevTools open.\n2. Application, then Local storage and Session storage.\n3. List each key before you press anything.' }],
    verify: () => 'Run the check again.',
  },
  'accept-not-checked': {
    area: 'Consent banner', topic: 'analytics', rank: 590, who: YOU, time: '5 minutes',
    claims: [],
    title: () => 'Could not check what happens after Accept',
    sentence: () => 'Pressing Accept failed in this run, so we cannot list what visitors get after they agree.',
    why: () => 'Your privacy notice should name what runs after Accept. This run could not see it.',
    fix: () => [{ label: 'By hand', code: '1. Fresh private window, DevTools on the Network tab.\n2. Press Accept, then reload.\n3. List every third-party host. Compare it with your privacy notice.' }],
    verify: () => 'Run the check again.',
  },
  'consent-mode-denied-pings': {
    area: 'Before a choice', topic: 'analytics', rank: 150, who: 'A lawyer', time: '30 minutes with counsel',
    claims: ['F-DEVICE-10', 'F-DEVICE-M02', 'N-HR-COOKIE-CONSENT-M03'],
    title: () => 'Google tags send cookieless pings before a choice',
    sentence: () => 'Consent Mode is set to denied, so no Google cookie is set, but the Google tag still loads and sends measurement requests before the visitor chooses.',
    why: () => 'Whether cookieless pings need consent is not settled. The research library says cookieless analytics are not exempt by default, and that unknown IP origin does not take a request outside the device rule.',
    fix: () => [
      { label: 'Question for a lawyer', code: 'Our site loads the Google tag before consent with Consent Mode set to denied, so it sends cookieless measurement pings with the visitor\'s IP address. Under Croatian ZEK Article 43(4) and the EDPB Guidelines 2/2023, do these pings need prior consent, or may we keep them?' },
      { label: 'Safe option', code: S.gaGatePlain() },
    ],
    verify: () => 'If you choose the safe option: a fresh private window should show no request to google-analytics.com or googletagmanager.com before Accept.',
  },
  'cookieless-analytics-before-choice': {
    area: 'Before a choice', topic: 'analytics', rank: 160, who: 'A lawyer', time: '30 minutes with counsel',
    claims: ['F-DEVICE-10', 'F-DEVICE-11', 'N-HR-COOKIE-CONSENT-M03'],
    title: (o) => `${list(o.data.vendors)} ${o.data.vendors.length > 1 ? 'load' : 'loads'} before a choice`,
    sentence: (o) => `${list(o.data.vendors)} is sold as cookie-free and loads on the first page view. Whether that needs consent depends on what it reads from the device.`,
    why: () => 'The research library says "cookieless" is not an exemption by itself, and Croatian first-party or cookieless labels do not create one either. A specialist has to look at what the script actually does.',
    fix: (o) => [{ label: 'Question for a lawyer', code: `Our site runs ${list(o.data.vendors)} before any consent choice. It sets no cookies. Under ZEK Article 43(4) and EDPB Guidelines 2/2023, does it read or store anything on the device that needs consent, or can it run before a choice?` }],
    verify: () => 'Keep the vendor\'s own description of what the script reads, and the lawyer\'s answer, with your records.',
  },
  'unidentified-third-party': {
    area: 'Before a choice', topic: 'analytics', rank: 170, who: YOU, time: '15 minutes',
    question: 'Q-178',
    claims: ['N-HR-COOKIE-CONSENT-01', 'N-HR-COOKIE-CONSENT-07'],
    title: (o) => `${o.data.hosts.length} unknown ${o.data.hosts.length > 1 ? 'services load' : 'service loads'} before a choice`,
    sentence: (o) => `The page contacts ${list(o.data.hosts.slice(0, 4))}${o.data.hosts.length > 4 ? ' and others' : ''} on first load. We do not know these, so tell us what each one does.`,
    why: () => 'Every third party that loads gets the visitor\'s IP address. If one of them tracks, it needs consent first. We do not guess, so you name them.',
    fix: () => [{ label: 'What to do', code: '1. Search your code for each host name.\n2. Write down which tool it is and what it is for.\n3. If it is analytics, advertising or anything you do not need, gate it behind Accept or remove it.\n4. Answer question Q-178 in Questions.' }],
    verify: () => 'Each host is either removed, gated behind Accept, or named in your privacy notice as needed.',
  },
  'storage-unknown-before-choice': {
    area: 'Before a choice', topic: 'storage', rank: 180, who: YOU_OR_DEV, time: '30 minutes',
    question: 'Q-028',
    claims: ['F-DEVICE-06', 'F-DEVICE-07'],
    title: (o) => `${o.data.count} stored ${o.data.count > 1 ? 'items' : 'item'} we could not identify`,
    sentence: () => 'The site saves these keys on the visitor\'s device before any choice. We could not match them to a known tool, so tell us what each one does.',
    why: () => 'The research library says localStorage and other device storage fall under the same rule as cookies. A key that only does what the visitor asked for, such as a theme or a cart, is fine. A key used for statistics needs consent.',
    fix: () => [{ label: 'Find them', code: "// Run in your project folder to find where each key is written:\n// grep -rn \"localStorage\\|sessionStorage\\|document.cookie\" src/\n//\n// Then, for keys used only for statistics, write them after Accept:\nif (localStorage.getItem('analytics-consent') === 'yes') {\n  localStorage.setItem('visits', String(Number(localStorage.getItem('visits') || 0) + 1));\n}" }],
    verify: () => 'Fresh private window. Application, then Local storage and Cookies. Only keys the visitor asked for should be there.',
  },
  'third-party-fonts': {
    area: 'Embeds and fonts', topic: 'analytics', rank: 510, who: DEV, time: '30 minutes',
    claims: ['F-GDPR-BASIS-04', 'F-GDPR-TRANSFER-01'],
    title: (o) => `Fonts load from ${list(o.data.vendors)}`,
    sentence: (o) => `When we loaded the page ${o.data.page || '/'}, it asked ${list(o.data.vendors)} for fonts, which sends the visitor's IP address there. Hosting the font files yourself removes this.`,
    why: () => 'The research library says each use of personal data, including an IP address, needs a legal basis, and that sending it to a company outside the EEA is a transfer that needs its own route. Self-hosted fonts look the same and send nothing.',
    fix: (o, stack) => {
      const tabs = [{ label: 'Plain HTML', code: S.fontsPlain(o.data.families || []) }];
      if (has(stack, 'Next.js') && o.data.google) tabs.push({ label: 'Next.js App Router', code: S.fontsNext(o.data.families || []) });
      if (has(stack, 'WordPress')) tabs.push({ label: 'WordPress', code: '1. Install a plugin that downloads Google Fonts to your site, for example OMGF.\n2. Turn on its option to remove the original Google Fonts links.\n3. Clear your cache and check the Network tab.' });
      return tabs;
    },
    verify: () => 'Network tab, filter "font". Every font should come from your own domain.',
  },
  'youtube-embed': {
    area: 'Embeds and fonts', topic: 'analytics', rank: 190, who: DEV, time: '30 minutes',
    claims: ['F-DEVICE-01', 'F-DEVICE-06', 'N-HR-COOKIE-CONSENT-01'],
    title: (o) => (o.state !== 'could_not_check' ? 'YouTube loads before the visitor chooses'
      : o.data.reason === 'failed' ? 'Could not tell whether the YouTube player loads before a choice'
        : 'Could not tell whether YouTube waits for a choice for EU visitors'),
    sentence: (o) => {
      if (o.state === 'could_not_check' && o.data.reason === 'failed') return 'The page embeds a YouTube player, but the player did not load in this run, so we did not see what it does. Run the check again.';
      if (o.state === 'could_not_check') return 'From outside the EU the YouTube player loaded with the page. An EU visitor may get a banner that blocks it. Run the check from an EU connection.';
      return 'The YouTube player loads with the page, so Google can store data on the visitor\'s device before anyone presses Play or Accept.';
    },
    why: () => 'The research library says device storage needs consent unless it is strictly needed for what the visitor asked for. Nobody asked for the video yet. Loading it on click fixes that.',
    fix: (o) => [
      { label: 'Click to load', code: S.youtubeClickToLoad(o.data.videoIds || []) },
      { label: 'youtube-nocookie', code: S.youtubeNocookie(o.data.videoIds || []) },
    ],
    verify: () => 'Fresh private window. No request to youtube.com until you press Play.',
  },
  'maps-embed': {
    area: 'Embeds and fonts', topic: 'analytics', rank: 515, who: DEV, time: '20 minutes',
    claims: ['F-DEVICE-01', 'F-GDPR-TRANSFER-01'],
    title: (o) => (o.state !== 'could_not_check' ? 'Google Maps loads with the page'
      : o.data?.reason === 'failed' ? 'Could not tell whether the Google map loads before a choice'
        : 'Could not tell whether Google Maps waits for a choice for EU visitors'),
    sentence: (o) => (o.state !== 'could_not_check' ? 'The map loads on first view and sends the visitor\'s IP address to Google, before anyone asks for it.'
      : o.data?.reason === 'failed' ? 'The page embeds a Google map, but the map did not load in this run, so we did not see what it does. Run the check again.'
        : 'From outside the EU the map loaded with the page. Run the check from an EU connection.'),
    why: () => 'The research library says device access needs consent unless strictly needed, and that sending data to a company outside the EEA is a transfer. A link or a click-to-load map avoids both.',
    fix: () => [{ label: 'Click to load', code: S.MAPS_CLICK_TO_LOAD }],
    verify: () => 'Fresh private window. No request to google.com/maps or maps.googleapis.com until you ask for the map.',
  },
  'form-no-notice': {
    area: 'Forms', topic: 'signups', rank: 200, who: YOU_OR_DEV, time: '15 minutes',
    claims: ['F-GDPR-NOTICE-01', 'F-GDPR-NOTICE-07'],
    title: (o) => (o.data.count > 1 ? `${o.data.count} forms have no privacy notice next to them` : 'A form has no privacy notice next to it'),
    sentence: (o) => `${o.data.count > 1 ? 'These forms collect' : 'The form collects'} personal details but ${o.data.count > 1 ? 'show' : 'shows'} no line or link saying who gets them and why.${(o.data.kinds || []).some((k) => k !== 'contact') ? ' Only you know what a signup or other form is for, so its notice leaves that part for you to fill in.' : ''}`,
    why: () => 'The research library says people must get the privacy information when you collect their data, which means at the form, not somewhere else on the site.',
    fix: (o) => {
      const kinds = o.data.kinds && o.data.kinds.length ? o.data.kinds : ['contact'];
      const tabs = [];
      if (kinds.includes('event')) tabs.push({ label: 'Event or booking form', code: S.EVENT_NOTICE });
      if (kinds.includes('newsletter')) tabs.push({ label: 'Newsletter signup', code: S.NEWSLETTER_NOTICE });
      if (kinds.includes('other')) tabs.push({ label: 'Other form', code: S.OTHER_NOTICE });
      if (kinds.includes('contact')) tabs.push({ label: 'Contact form', code: S.FORM_NOTICE });
      return tabs;
    },
    verify: () => 'The notice line and its link are visible above the submit button, without scrolling past it.',
  },
  'marketing-box-preticked': {
    area: 'Forms', topic: 'signups', rank: 205, who: YOU_OR_DEV, time: '10 minutes',
    claims: ['F-GDPR-BASIS-05', 'F-EMAIL-05'],
    title: () => 'The marketing box is ticked before the visitor touches it',
    sentence: () => 'A newsletter or marketing checkbox is already ticked when the page loads, so people sign up without choosing to.',
    why: () => 'The research library says consent must be a clear action by the person. A box that is ticked for them is not consent, and marketing email needs consent you can prove.',
    fix: () => [{ label: 'Plain HTML', code: S.MARKETING_BOX }],
    verify: () => 'View the page source. The marketing checkbox has no checked attribute.',
  },
  'marketing-bundled': {
    area: 'Forms', topic: 'signups', rank: 206, who: YOU_OR_DEV, time: '15 minutes',
    claims: ['F-GDPR-BASIS-05'],
    title: () => 'One checkbox covers both the terms and marketing',
    sentence: () => 'The only checkbox asks people to accept your terms and to get marketing in one go, so they cannot say yes to one and no to the other.',
    why: () => 'The research library says a consent request must be separate from other matters, and specific to its purpose.',
    fix: () => [{ label: 'Plain HTML', code: S.BUNDLED_SPLIT }],
    verify: () => 'The form can be sent with the marketing box empty.',
  },
  'form-third-party': {
    area: 'Forms', topic: 'clients', rank: 250, who: YOU, time: '20 minutes',
    question: 'Q-086',
    claims: ['F-GDPR-PROCESSOR-01', 'F-GDPR-PROCESSOR-04'],
    title: (o) => `Form messages go to ${list(o.data.vendors)}`,
    sentence: (o) => `What people type into the form is sent to ${list(o.data.vendors)}, not to your own server. Check you have their data processing agreement for your plan.`,
    why: () => 'A service that stores messages for you is usually your processor. The research library says you need an agreement with it that covers your exact account and plan.',
    fix: (o) => [{ label: 'What to do', code: `1. Find the data processing agreement (DPA) of ${list(o.data.vendors)}.\n2. Check it covers your plan, including a free plan if you use one.\n3. Note where it stores data.\n4. Name the service in your privacy notice.\n5. Answer question Q-086 in Questions.` }],
    verify: () => 'Your privacy notice names the form service, and you have its DPA saved.',
  },
  'privacy-link-missing': {
    area: 'Notices and trader details', topic: 'signups', rank: 210, who: YOU, time: '1 to 2 hours',
    claims: ['F-GDPR-NOTICE-07', 'F-GDPR-NOTICE-09'],
    title: () => 'No link to a privacy notice on the home page',
    sentence: (o) => (o.state === 'observed' ? 'The home page collects data or loads other services, but links to no privacy notice.' : 'The home page links to no privacy notice. Tell us whether the site collects any personal data at all.'),
    why: () => 'The research library says people must get the privacy information when their data is collected, and that a website notice must be easy to reach.',
    fix: () => [{ label: 'Plain HTML', code: S.PRIVACY_FOOTER }],
    verify: () => 'Every page has a footer link to the notice, and it opens.',
  },
  'trader-info-missing': {
    area: 'Notices and trader details', topic: 'saas', rank: 400, who: 'You, with your accountant', time: '30 minutes',
    question: 'Q-049',
    claims: (o) => (o.state === 'observed' ? ['N-HR-TRADER-INFO-01', 'F-ECOMMERCE-02'] : ['F-ECOMMERCE-01', 'F-ECOMMERCE-02']),
    title: () => 'No trader details found',
    sentence: (o) => (o.state === 'observed'
      ? 'The site shows prices or takes payments, but we found no business name with OIB, register entry or legal form on the pages we read.'
      : 'We found no business name with OIB, register entry or legal form. If the site is commercial, it needs them. Tell us whether it is.'),
    why: () => 'The research library says a commercial site must show who runs it, where, and how to reach them, plus register and VAT details where they apply. In Croatia that is Article 6 of the Electronic Commerce Act.',
    fix: () => [{ label: 'Plain HTML', code: S.TRADER_FOOTER }],
    verify: () => 'The footer shows the business name, address, OIB and email on every page.',
  },
  'dmarc-missing': {
    area: 'Email and DNS', topic: 'inbox', rank: 300, who: DNS_YOU, time: '10 minutes',
    claims: [],
    title: (o) => `${o.site} has no DMARC record`,
    sentence: (o) => `${o.site} has no DMARC record, so the domain does not ask inboxes to block mail that fakes your address.`,
    why: () => 'Without DMARC, the domain allows mail that puts your address in the From line. Each inbox then decides alone what to do with it. Large mailbox providers also expect DMARC from senders.',
    fix: (o) => [{ label: 'DNS record', code: S.dmarcSuggestion(o.site, o.data.suggest, 'Start at p=none and create the dmarc@ alias first. After a few weeks of clean reports, move to p=quarantine.\nIf this domain sends no mail at all, ask for p=reject instead.') }],
    verify: (o) => `Run nslookup -type=TXT _dmarc.${o.site}. It returns the new record.`,
  },
  'dmarc-policy-none': {
    area: 'Email and DNS', topic: 'inbox', rank: 310, who: DNS_YOU, time: '10 minutes, after a few weeks of reports',
    claims: [],
    title: (o) => `DMARC on ${o.site} only watches`,
    sentence: (o) => (o.data.testing
      ? `${o.site} has DMARC set to p=${o.data.tags.p} with t=y, which asks inboxes to apply one level lower while it tests. That is none, so the domain still allows mail that fails the check.`
      : `${o.site} has DMARC set to p=none. This asks inboxes only for reports, so the domain still allows mail that fails the check.`),
    why: () => 'p=none is the right first step. It becomes a gap when it stays forever, because the domain never asks inboxes to block mail that fails the check.',
    fix: (o) => {
      const tags = o.data.tags || { p: 'none' };
      const site = o.site;
      const first = S.dmarcSuggestion(site, o.data.suggest, o.data.testing ? S.dmarcKeepNote(tags, 't')
        : o.data.suggestAll ? `${S.dmarcKeepNote(tags, 'p and sp')}\nsp=none is added so every subdomain stays where it is today, at reports only.` : S.dmarcKeepNote(tags));
      if (!o.data.suggestAll) return [{ label: 'DNS record', code: first }];
      return [
        { label: 'This domain only', code: first },
        { label: 'This domain and every subdomain', code: S.dmarcSuggestion(site, o.data.suggestAll, `This record has no sp, so p also covers every subdomain of ${site}, including ones this scan did not check and names that do not exist.\nUse this only if every subdomain that sends mail sends it through tools you have set up.\n${S.dmarcKeepNote(tags)}`) },
      ];
    },
    verify: (o) => (o.data.testing ? `nslookup -type=TXT _dmarc.${o.site} shows no t=y.` : `nslookup -type=TXT _dmarc.${o.site} shows p=quarantine.`),
  },
  'dmarc-inherited-none': {
    area: 'Email and DNS', topic: 'inbox', rank: 311, who: DNS_YOU, time: '10 minutes, after a few weeks of reports',
    claims: [],
    title: (o) => `${o.site} inherits a DMARC policy of none`,
    sentence: (o) => `${o.site} has no DMARC record of its own, so the RFC 9989 tree walk finds ${o.data.inherited.from}. ${o.data.inherited.invalid ? `Its ${o.data.inherited.invalid} value is not valid, so receivers read it as p=none, which` : `Its ${o.data.inherited.via}=none`} asks only for reports, so the domain still allows mail that fails the check. Choose whether to fix only this subdomain or every subdomain of ${o.data.inherited.org}.`,
    why: () => 'With no record of its own, a subdomain takes its policy from its Organizational Domain, using sp for a subdomain that exists and np for one that does not (RFC 9989, sections 4.7 and 4.10.1). A record at the subdomain changes only it. Raising sp or np on the parent changes every subdomain at once, including ones this scan never read.',
    fix: (o) => {
      const inh = o.data.inherited;
      const tag = o.data.suggest.tag || 'sp';
      const tabs = [];
      if (o.data.here) tabs.push({ label: 'Only this subdomain', code: S.dmarcSuggestion(o.site, o.data.here, `This record replaces the inherited one for ${o.site} only. It copies the reporting tags from ${inh.from}, so reports keep arriving.\nChange it only after the reports show nothing but your own mail tools for a few weeks.`) });
      tabs.push({ label: `Every subdomain of ${inh.org}`, code: S.dnsRecord('TXT', S.recordName(inh.org, '_dmarc', o.data.suggest.zone), o.data.suggest.value, `This changes the ${inh.org} record, not ${o.site}. ${parentFixNote(inh, tag)}\nAnswer first: it changes every subdomain of ${inh.org}, including ones this scan did not check${tag === 'np' ? ' and names that do not exist' : ''}. Use it only if every subdomain that sends mail sends it through tools you have set up.\nDo not add a record at _dmarc.${o.site} that is weaker than this, because a record there replaces the inherited one.`) });
      return tabs;
    },
    verify: (o) => `nslookup -type=TXT _dmarc.${o.site} shows your new record, or nslookup -type=TXT ${o.data.inherited.from} shows ${o.data.suggest.tag || 'sp'}=quarantine.`,
  },
  'dmarc-unreadable': {
    area: 'Email and DNS', topic: 'inbox', rank: 590, who: YOU, time: '5 minutes',
    claims: [],
    title: (o) => `Could not read the DMARC policy that applies to ${o.site}`,
    sentence: (o) => `${o.site} has no DMARC record of its own, and the lookup of ${o.data.from}, a name the RFC 9989 tree walk has to read, failed. We cannot tell which policy applies.`,
    why: () => 'This is a gap in the run, not a result. It is not reported as a missing record, because the inherited record may exist.',
    fix: (o) => [{ label: 'By hand', code: `nslookup -type=TXT ${o.data.from}\nnslookup -type=TXT _dmarc.${o.site}` }],
    verify: () => 'Run the check again.',
  },
  'dmarc-invalid': {
    area: 'Email and DNS', topic: 'inbox', rank: 305, who: DNS_YOU, time: '10 minutes',
    claims: [],
    title: (o) => `The DMARC record on ${o.site} is broken`,
    sentence: (o) => (o.data.count > 1 ? 'There is more than one DMARC record, so receivers ignore them all (RFC 9989, section 4.10).'
      : o.data.bad ? `The ${o.data.bad} value in the DMARC record is not valid, so receivers read the record as p=none if it has a valid rua, and as no DMARC at all otherwise (RFC 9989, section 4.10.1).`
        : 'The DMARC record has no valid policy, so receivers do not use it as written.'),
    why: () => 'A DMARC record that cannot be read protects nothing.',
    fix: (o) => [{ label: 'DNS record', code: o.data.tags
      ? S.dmarcSuggestion(o.site, o.data.suggest, 'This sets a valid p, drops an sp or np that is not valid, and keeps your other tags.')
      : S.dmarcSuggestion(o.site, o.data.suggest, 'There is more than one DMARC record. Keep one, merge its tags into this, and delete the others.', true) }],
    verify: (o) => `nslookup -type=TXT _dmarc.${o.site} returns exactly one record.`,
  },
  'spf-missing': {
    area: 'Email and DNS', topic: 'inbox', rank: 315, who: DNS_YOU, time: '10 minutes',
    claims: [],
    title: (o) => `${o.site} takes mail but has no SPF record`,
    sentence: (o) => `Mail arrives at ${o.site}, but no SPF record says which servers may send as it.`,
    why: () => 'Without SPF, receiving servers cannot tell your real mail from forged mail, and your own messages are more likely to land in spam.',
    fix: (o) => [{ label: 'DNS record', code: S.dnsRecord('TXT', S.recordName(o.site, '', o.data.zone), `v=spf1 ${S.spfIncludeFor(o.data.mx)} ~all`, 'Add one include for each other tool that sends as this domain, such as a newsletter tool.') }],
    verify: (o) => `nslookup -type=TXT ${o.site} shows one line starting with v=spf1.`,
  },
  'spf-multiple': {
    area: 'Email and DNS', topic: 'inbox', rank: 302, who: DNS_YOU, time: '15 minutes',
    claims: [],
    title: (o) => `${o.site} has two SPF records, so both fail`,
    sentence: () => 'There is more than one SPF record. Receiving servers treat that as an error and SPF fails for all your mail.',
    why: () => 'SPF allows exactly one record per domain.',
    fix: () => [{ label: 'DNS record', code: 'Merge the records into one. Keep every include from both, then one ending.\nExample: v=spf1 include:_spf.google.com include:sendgrid.net ~all\nDelete the old records.' }],
    verify: (o) => `nslookup -type=TXT ${o.site} shows exactly one v=spf1 line.`,
  },
  'spf-too-many-lookups': {
    area: 'Email and DNS', topic: 'inbox', rank: 303, who: DNS_YOU, time: '30 minutes',
    claims: [],
    title: (o) => `The SPF record on ${o.site} needs ${o.data.lookups} lookups`,
    sentence: (o) => `SPF allows 10 DNS lookups. This record needs ${o.data.lookups}, so receivers treat it as broken.`,
    why: () => 'RFC 7208 sets the limit at 10. Past it, SPF returns an error and your mail loses that protection.',
    fix: (o) => [{ label: 'What to change', code: `Current: ${o.data.record}\n\n1. Remove each include for a tool you no longer use.\n2. Move bulk mail tools to a subdomain such as news.${o.site}, with their own SPF.\n3. Run the check again until the count is 10 or less.` }],
    verify: () => 'The DNS page shows the lookup count at 10 or less.',
  },
  'spf-allows-anyone': {
    area: 'Email and DNS', topic: 'inbox', rank: 301, who: DNS_YOU, time: '10 minutes',
    claims: [],
    title: (o) => `The SPF record on ${o.site} lets any server send as you`,
    sentence: (o) => (o.data.via
      ? `The record includes ${o.data.via}, whose own SPF passes every sender, so every server in the world may send your mail.`
      : 'The record ends in +all, which tells inboxes that every server in the world may send your mail.'),
    why: () => 'A record that passes every server is worse than none, because it tells inboxes that every server may send as you.',
    fix: (o) => [{ label: 'DNS record', code: o.data.via
      ? `Remove include:${o.data.via} from:\n${o.data.record}\n\nIf that service sends mail for you, ask it for an include that lists only its own servers.`
      : S.dnsRecord('TXT', S.recordName(o.site, '', o.data.zone), o.data.record.replace(/[+]?all\s*$/i, '~all')) }],
    verify: (o) => `nslookup -type=TXT ${o.site} shows the record ending in ~all or -all.`,
  },
  'spf-neutral': {
    area: 'Email and DNS', topic: 'inbox', rank: 320, who: DNS_YOU, time: '10 minutes',
    claims: [],
    title: (o) => `The SPF record on ${o.site} ends in ?all`,
    sentence: () => 'The record ends in ?all, which tells receivers nothing about mail from other servers.',
    why: () => '?all tells receivers nothing about mail from other servers. ~all or -all asks them to treat it with suspicion.',
    fix: (o) => [{ label: 'DNS record', code: S.dnsRecord('TXT', S.recordName(o.site, '', o.data.zone), o.data.record.replace(/\?all\s*$/i, '~all')) }],
    verify: (o) => `nslookup -type=TXT ${o.site} shows the record ending in ~all or -all.`,
  },
  'spf-unreadable': {
    area: 'Email and DNS', topic: 'inbox', rank: 589, who: YOU, time: '5 minutes',
    claims: [],
    title: (o) => `Could not read every SPF include for ${o.site}`,
    sentence: (o) => `The lookup of ${list((o.data.failed || []).map((x) => x.split(':')[0]))} failed in this run, so we cannot say whether SPF works for ${o.site}.`,
    why: () => 'A failed lookup is a temporary error, not a result. Receivers that hit the same failure cannot check SPF either.',
    fix: (o) => [{ label: 'By hand', code: (o.data.failed || []).map((x) => `nslookup -type=TXT ${x.split(':')[0]}`).join('\n') || `nslookup -type=TXT ${o.site}` }],
    verify: () => 'Run the check again.',
  },
  'spf-syntax': {
    area: 'Email and DNS', topic: 'inbox', rank: 304, who: DNS_YOU, time: '15 minutes',
    claims: [],
    title: (o) => `The SPF record on ${o.site} has an error`,
    sentence: () => 'Part of the SPF record is not valid, so receivers may ignore all of it.',
    why: () => 'A broken SPF record gives no protection.',
    fix: () => [{ label: 'What to change', code: 'Fix or remove each term listed in the evidence. A valid record looks like:\nv=spf1 include:_spf.google.com ~all' }],
    verify: () => 'The DNS page shows the SPF row as Looks good.',
  },
  'no-mail-lock-incomplete': {
    area: 'Email and DNS', topic: 'inbox', rank: 330, who: DNS_YOU, time: '10 minutes',
    claims: [],
    title: (o) => (o.state === 'needs_your_answer' ? `Does anything send mail as ${o.site}?` : `${o.site} takes no mail but is not locked`),
    sentence: (o) => (o.state === 'needs_your_answer'
      ? `${o.site} takes no mail (null MX) and has no SPF record, so nothing says whether a tool sends mail as it. If nothing does, lock it. If something does, list those senders in SPF.`
      : `${o.site} says it receives no mail, but its ${list(o.data.missing.map((m) => m.toUpperCase()))} still ${o.data.missing.length > 1 ? 'allow' : 'allows'} others to send as it.`),
    why: () => 'A domain that sends no mail can still appear in a forged From line. These three records tell inboxes that no mail from it is real.',
    fix: (o) => [{ label: 'DNS records', code: [
      ...(o.data.missing.includes('spf') ? [S.dnsRecord('TXT', S.recordName(o.site, '', o.data.zone), 'v=spf1 -all')] : []),
      ...(o.data.missing.includes('dmarc') ? [S.dmarcSuggestion(o.site, o.data.dmarc)] : []),
    ].join('\n\n') + `\n\nFirst check that no tool sends mail as ${o.site}.` }].concat(o.state === 'needs_your_answer'
      ? [{ label: 'Something sends for it', code: `Add one SPF record that lists each tool that sends as ${o.site}:\n` + S.dnsRecord('TXT', S.recordName(o.site, '', o.data.zone), 'v=spf1 include:<each sending tool> ~all') }]
      : []),
    verify: () => 'The DNS page shows the SPF and DMARC rows as Looks good.',
  },
  'mail-use-unknown': {
    area: 'Email and DNS', topic: 'inbox', rank: 340, who: YOU, time: '10 minutes',
    claims: [],
    title: (o) => `Does ${o.site} send or receive mail?`,
    sentence: (o) => `${o.site} has no mail host. If it takes no mail, lock it. If it does, add its mail records.`,
    why: () => 'A domain with no mail records gives inboxes no rule for mail in its name, and replies to it can get lost.',
    fix: (o) => [
      { label: 'It sends and takes no mail', code: [S.dnsRecord('MX', S.recordName(o.site, '', o.data.zone), '0 .'), S.dnsRecord('TXT', S.recordName(o.site, '', o.data.zone), 'v=spf1 -all'), S.dmarcSuggestion(o.site, o.data.none)].join('\n\n') + (o.data.wildcard ? '\n\nRandom subdomains resolve here. Check preview and app subdomains first.' : '') },
      { label: 'It sends mail', code: o.data.sends?.held
        ? 'Copy the MX, SPF and DKIM records from your mail host\'s setup page.\n' + S.dmarcSuggestion(o.site, o.data.sends)
        : 'Copy the MX, SPF and DKIM records from your mail host\'s setup page, then add:\n' + S.dmarcSuggestion(o.site, o.data.sends) },
    ],
    verify: () => 'The DNS page shows MX, SPF and DMARC rows for this domain.',
  },
  'dkim-not-found': {
    area: 'Email and DNS', topic: 'inbox', rank: 350, who: YOU, time: '10 minutes',
    claims: [],
    title: (o) => (o.state === 'could_not_check' ? `Could not check DKIM on ${o.site}` : `No DKIM key at common names on ${o.site}`),
    sentence: (o) => (o.state === 'could_not_check'
      ? 'Random subdomains resolve on this domain, so probing selector names cannot tell a real key from the wildcard.'
      : 'We tried the common selector names and found no key. Your mail host may use a name we did not try, so this is not proof it is missing.'),
    why: () => 'DKIM signs your mail so inboxes can trust it. DMARC relies on it.',
    fix: () => [{ label: 'Find your selector', code: '1. Send yourself a message from this domain.\n2. Open it and show the original message or headers.\n3. Find the DKIM-Signature line and read the s= value. That is your selector.\n4. If there is no DKIM-Signature line, turn on DKIM in your mail host and add the record it gives you.' }],
    verify: () => 'The header of a sent message shows dkim=pass.',
  },
  'dns-unreadable': {
    area: 'Email and DNS', topic: 'inbox', rank: 591, who: YOU, time: '5 minutes',
    claims: [],
    title: (o) => `Could not read DNS for ${o.site}`,
    sentence: () => 'The DNS-over-HTTPS resolvers did not answer, so mail records were not checked.',
    why: () => 'This is a gap in the run, not a result.',
    fix: (o) => [{ label: 'By hand', code: `nslookup -type=MX ${o.site}\nnslookup -type=TXT ${o.site}\nnslookup -type=TXT _dmarc.${o.site}` }],
    verify: () => 'Run the check again.',
  },
  'https-missing': {
    area: 'Security and hosting', topic: 'hosting', rank: 500, who: DEV, time: '30 minutes',
    claims: [],
    title: (o) => `${o.site} does not answer over HTTPS`,
    sentence: () => 'The site works over plain HTTP only, so what visitors type travels unencrypted.',
    why: () => 'Browsers mark such pages as not secure, and anyone on the same network can read or change them.',
    fix: () => [{ label: 'What to do', code: '1. Turn on HTTPS in your host. Most hosts give a free certificate.\n2. Redirect every http:// address to https://.\n3. Run the check again.' }],
    verify: (o) => `https://${o.site}/ opens with a padlock.`,
  },
  'cert-invalid': {
    area: 'Security and hosting', topic: 'hosting', rank: 501, who: DEV, time: '30 minutes',
    claims: [],
    title: (o) => `The certificate on ${o.site} is not trusted`,
    sentence: () => 'Browsers reject the HTTPS certificate, so visitors see a warning before the page.',
    why: () => 'Most visitors leave at a certificate warning, and it trains them to click through real attacks.',
    fix: () => [{ label: 'What to do', code: '1. Open your host\'s domain or SSL settings.\n2. Reissue the certificate for the exact name, with and without www.\n3. Run the check again.' }],
    verify: (o) => `https://${o.site}/ opens with no warning.`,
  },
  'cert-expiring': {
    area: 'Security and hosting', topic: 'hosting', rank: 502, who: DEV, time: '15 minutes',
    claims: [],
    title: (o) => `The certificate on ${o.site} expires in ${o.data.days} days`,
    sentence: (o) => `The HTTPS certificate runs out in ${o.data.days} days. After that, browsers show a warning.`,
    why: () => 'Automatic renewal usually handles this. A certificate this close to expiry suggests renewal is failing.',
    fix: () => [{ label: 'What to do', code: '1. Check the renewal settings in your host.\n2. Renew now if it is a manual certificate.\n3. Run the check again.' }],
    verify: () => 'The expiry date is months away.',
  },
  'http-no-redirect': {
    area: 'Security and hosting', topic: 'hosting', rank: 530, who: DEV, time: '15 minutes',
    claims: [],
    title: (o) => `http://${o.site} does not move visitors to HTTPS`,
    sentence: () => 'Typing the address without https keeps the visitor on the unencrypted version.',
    why: () => 'Old links and typed addresses land on HTTP. A redirect makes every visit encrypted.',
    fix: () => [
      { label: 'nginx', code: 'server {\n  listen 80;\n  server_name example.com www.example.com;\n  return 301 https://$host$request_uri;\n}' },
      { label: 'Apache .htaccess', code: 'RewriteEngine On\nRewriteCond %{HTTPS} off\nRewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]' },
    ],
    verify: (o) => `curl -I http://${o.site}/ shows 301 and a Location starting with https://.`,
  },
  'hsts-missing': {
    area: 'Security and hosting', topic: 'hosting', rank: 560, who: DEV, time: '10 minutes',
    claims: [],
    title: () => 'Browsers are not told to always use HTTPS',
    sentence: () => 'The site sends no Strict-Transport-Security header, so a browser may still try plain HTTP first.',
    why: () => 'HSTS closes the short gap before the redirect, where a network attacker can step in. It is a hygiene step, not a legal rule.',
    fix: (o, stack) => S.securityHeaders(['strict-transport-security'], stack),
    verify: (o) => `curl -I https://${o.site}/ shows a strict-transport-security line.`,
  },
  'security-headers-missing': {
    area: 'Security and hosting', topic: 'hosting', rank: 580, who: DEV, time: '30 minutes',
    claims: [],
    title: (o) => `${o.data.missing.length} security ${o.data.missing.length > 1 ? 'headers are' : 'header is'} missing`,
    sentence: (o) => `The site does not send ${list(o.data.missing)}. These headers limit what injected code and other sites can do with your pages.`,
    why: () => 'These are hygiene notes, not legal findings. Start the Content Security Policy in report-only mode and tighten it once nothing breaks.',
    fix: (o, stack) => S.securityHeaders(o.data.missing, stack),
    verify: (o) => `curl -I https://${o.site}/ shows each header.`,
  },
  'hosting-plan': {
    area: 'Security and hosting', topic: 'hosting', rank: 550, who: YOU, time: '10 minutes',
    question: 'Q-049',
    claims: ['F-ECOMMERCE-01'],
    title: (o) => `Which ${o.data.hosting.name} plan is ${o.site} on?`,
    sentence: (o) => `${o.site} is served by ${o.data.hosting.name}. Some free plans do not allow commercial use or are not covered by the host's data processing agreement, so tell us which plan this is.`,
    why: (o) => (o.data.hosting.planNote ? `${o.data.hosting.planNote} (source: ${o.data.hosting.source}, checked ${o.data.hosting.checked}). Whether your site counts as commercial is question Q-049.` : 'Free hosting plans often limit commercial use. Whether your site counts as commercial is question Q-049.'),
    fix: (o) => [{ label: 'What to do', code: `1. Open the ${o.data.hosting.name} dashboard and note the plan for this project.\n2. If the site earns money or promotes paid work and the plan is a free hobby plan, move it to a paid plan.\n3. Answer question Q-049 in Questions.` }],
    verify: () => 'Your hosting inventory lists the plan for every live domain.',
  },
  'site-unreachable': {
    area: 'Security and hosting', topic: 'hosting', rank: 592, who: YOU, time: '5 minutes',
    claims: [],
    title: (o) => `Could not reach ${o.site}`,
    sentence: () => 'The site did not answer over HTTPS or HTTP, so nothing on it was checked.',
    why: () => 'This is a gap in the run, not a result.',
    fix: (o) => [{ label: 'By hand', code: `curl -I https://${o.site}/` }],
    verify: () => 'Run the check again.',
  },
  'site-not-loaded': {
    area: 'Before a choice', topic: 'analytics', rank: 593, who: YOU, time: '5 minutes',
    claims: [],
    title: (o) => `The browser could not load ${o.site}`,
    sentence: () => 'The page did not load in the test browser, so tracking, forms and notices were not checked.',
    why: () => 'This is a gap in the run, not a result.',
    fix: (o) => [{ label: 'By hand', code: `Open https://${o.site}/ in a fresh private window with DevTools on the Network tab, then follow the steps in the Consent states page.` }],
    verify: () => 'Run the check again.',
  },
};

/** Every claim id any rule can cite, for the claims test. */
export function allClaimIds() {
  const ids = new Set();
  for (const rule of Object.values(RULES)) {
    if (typeof rule.claims === 'function') {
      for (const state of ['observed', 'needs_your_answer', 'could_not_check']) for (const c of rule.claims({ state })) ids.add(c);
    } else {
      for (const c of rule.claims) ids.add(c);
    }
  }
  return [...ids];
}

/**
 * The check each rule belongs to. A finding from an earlier run is fixed only
 * when this run completed the same check on the same site and the rule did
 * not fire. consent-order needs an EU run or a seen banner, because from
 * outside the EU a missing tracker can mean the site hides it there.
 */
const GROUPS = {
  dns: ['spf-unreadable', 'dmarc-missing', 'dmarc-policy-none', 'dmarc-invalid', 'dmarc-inherited-none', 'dmarc-unreadable', 'spf-missing', 'spf-multiple', 'spf-too-many-lookups', 'spf-allows-anyone', 'spf-neutral', 'spf-syntax', 'no-mail-lock-incomplete', 'mail-use-unknown', 'dkim-not-found', 'dns-unreadable'],
  transport: ['https-missing', 'cert-invalid', 'cert-expiring', 'http-no-redirect', 'hsts-missing', 'security-headers-missing', 'hosting-plan', 'site-unreachable'],
  'consent-order': ['tracker-before-choice', 'consent-mode-default-granted', 'youtube-embed', 'maps-embed', 'no-reject-option', 'consent-banner-not-operable'],
  reject: ['tracker-after-reject', 'reject-second-layer', 'reject-not-checked'],
  accept: ['accept-not-checked'],
  browser: ['storage-not-read', 'consent-mode-denied-pings', 'cookieless-analytics-before-choice', 'unidentified-third-party', 'storage-unknown-before-choice', 'third-party-fonts', 'form-no-notice', 'marketing-box-preticked', 'marketing-bundled', 'form-third-party', 'privacy-link-missing', 'trader-info-missing', 'site-not-loaded'],
};
export const CHECK_OF = Object.fromEntries(Object.entries(GROUPS).flatMap(([group, rules]) => rules.map((r) => [r, group])));
