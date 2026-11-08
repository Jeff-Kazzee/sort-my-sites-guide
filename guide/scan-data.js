// Written by the Sort My Sites checker. Run it again to refresh. Do not edit by hand.
export default {
 "sample": false,
 "run": {
  "when": "8 Nov 2026, 20:55",
  "prev": "8 Nov 2026, 16:42",
  "engine": "engine 0.1.0 · rules 2026-11-08 · run from US, outside the EU",
  "from": "US",
  "fromEU": false
 },
 "sites": [
  {
   "domain": "tamara.rocks",
   "role": "",
   "pages": 2,
   "stack": [
    "Vercel"
   ],
   "checked": [
    "dns",
    "transport",
    "browser"
   ],
   "okPages": [
    "/",
    "/blogs/blog.html"
   ],
   "uncertain": [],
   "retired": {}
  },
  {
   "domain": "nosastra.co",
   "role": "",
   "pages": 2,
   "stack": [
    "Vercel"
   ],
   "checked": [
    "dns",
    "transport",
    "browser"
   ],
   "okPages": [
    "/",
    "/privacy.html"
   ],
   "uncertain": [],
   "retired": {}
  },
  {
   "domain": "welcomebook.eu",
   "role": "",
   "pages": 1,
   "stack": [
    "Vercel"
   ],
   "checked": [
    "dns",
    "transport",
    "browser"
   ],
   "okPages": [
    "/"
   ],
   "uncertain": [
    "unidentified-third-party"
   ],
   "retired": {}
  },
  {
   "domain": "vibeordev.com",
   "role": "",
   "pages": 1,
   "stack": [
    "Vercel"
   ],
   "checked": [
    "dns",
    "transport",
    "browser"
   ],
   "okPages": [
    "/"
   ],
   "uncertain": [],
   "retired": {}
  }
 ],
 "diff": {
  "fixed": [],
  "added": []
 },
 "findings": [
  {
   "id": "tracker-before-choice.vibeordev-com",
   "rule": "tracker-before-choice",
   "site": "vibeordev.com",
   "state": "could_not_check",
   "title": "Could not tell what an EU visitor gets before a choice on vibeordev.com",
   "sentence": "From outside the EU we saw Google tag (gtag.js) and Google Analytics load with no banner, but EU visitors may get a banner that stops it. They also stored _ga and _ga_27YQEFBZD8 on the device. Run the check from an EU connection to know.",
   "why": "The research library says storing or reading anything on a visitor's device needs consent first, unless it is strictly needed for what the visitor asked for. Analytics and advertising are not strictly needed just because they are useful to you. In Croatia the rule is Article 43(4) of the Electronic Communications Act.",
   "area": "Before a choice",
   "topic": "analytics",
   "rank": 100,
   "who": "Your developer",
   "time": "1 to 2 hours",
   "claims": [
    "F-DEVICE-01",
    "F-DEVICE-13",
    "N-HR-COOKIE-CONSENT-01",
    "N-HR-COOKIE-CONSENT-07"
   ],
   "question": null,
   "fix": [
    {
     "label": "Plain HTML",
     "code": "<!-- 1. Delete the tag that loads Google Analytics on its own:\n     <script async src=\"https://www.googletagmanager.com/gtag/js?id=G-27YQEFBZD8\"></script>\n     and the inline script with gtag('config', ...) next to it. -->\n<!-- 2. Paste this in <head> instead. -->\n<script>\n  window.dataLayer = window.dataLayer || [];\n  function gtag() { dataLayer.push(arguments); }\n  gtag('consent', 'default', {\n    ad_storage: 'denied',\n    ad_user_data: 'denied',\n    ad_personalization: 'denied',\n    analytics_storage: 'denied'\n  });\n\n  function loadAnalytics() {\n    if (window.analyticsLoaded) return;\n    window.analyticsLoaded = true;\n    gtag('consent', 'update', { analytics_storage: 'granted' });\n    var s = document.createElement('script');\n    s.async = true;\n    s.src = 'https://www.googletagmanager.com/gtag/js?id=G-27YQEFBZD8';\n    document.head.appendChild(s);\n    gtag('js', new Date());\n    gtag('config', 'G-27YQEFBZD8');\n  }\n\n  // Call these from your banner buttons.\n  window.acceptAnalytics = function () {\n    localStorage.setItem('analytics-consent', 'yes');\n    loadAnalytics();\n  };\n  window.rejectAnalytics = function () {\n    localStorage.setItem('analytics-consent', 'no');\n  };\n\n  if (localStorage.getItem('analytics-consent') === 'yes') loadAnalytics();\n</script>\n\n<!-- Move every tracking tag into loadTrackers(), so nothing runs before Accept. -->\n<script>\n  function loadTrackers() {\n    if (window.trackersLoaded) return;\n    window.trackersLoaded = true;\n    // Paste the vendor snippet for each tool here, unchanged: .\n  }\n\n  window.acceptTrackers = function () {\n    localStorage.setItem('tracking-consent', 'yes');\n    loadTrackers();\n  };\n  window.rejectTrackers = function () {\n    localStorage.setItem('tracking-consent', 'no');\n  };\n\n  if (localStorage.getItem('tracking-consent') === 'yes') loadTrackers();\n</script>"
    }
   ],
   "verify": "Open the site in a fresh private window and do not touch the banner. The Network tab should show no request to these tools, and Application should show no cookie from them.",
   "evidence": [
    {
     "k": "request",
     "a": "www.googletagmanager.com",
     "b": "https://www.googletagmanager.com/gtag/js?id=G-27YQEFBZD8",
     "c": "+0.8 s, HTTP 200"
    },
    {
     "k": "request",
     "a": "www.google-analytics.com",
     "b": "https://www.google-analytics.com/g/collect?v=2&tid=G-27YQEFBZD8&gtm=45je6b41v9255038208za208zd9255038208xf1&_p=1794167738446&gcd=13l3l3l3l1l...",
     "c": "+1.5 s, HTTP 204"
    },
    {
     "k": "cookie",
     "a": "_ga",
     "b": "vibeordev.com, first party, Google Analytics",
     "c": "13 months"
    },
    {
     "k": "cookie",
     "a": "_ga_27YQEFBZD8",
     "b": "vibeordev.com, first party, Google Analytics",
     "c": "13 months"
    },
    {
     "k": "vantage",
     "a": "Run from US",
     "b": "outside the EU, and no banner appeared. Banners often show only to EU visitors. Run the check from an EU connection.",
     "c": ""
    }
   ],
   "scope": {
    "pages": [
     "/"
    ]
   },
   "recheck": {
    "state": "could_not_check",
    "text": "Run the check again to update this finding: pnpm check --site tamara.rocks --site nosastra.co --site welcomebook.eu --site vibeordev.com --out <guide folder>"
   },
   "engine": "engine 0.1.0, rules 2026-11-08"
  },
  {
   "id": "cookieless-analytics-before-choice.nosastra-co",
   "rule": "cookieless-analytics-before-choice",
   "site": "nosastra.co",
   "state": "needs_a_specialist",
   "title": "Vercel Web Analytics loads before a choice",
   "sentence": "Vercel Web Analytics is sold as cookie-free and loads on the first page view. Whether that needs consent depends on what it reads from the device.",
   "why": "The research library says \"cookieless\" is not an exemption by itself, and Croatian first-party or cookieless labels do not create one either. A specialist has to look at what the script actually does.",
   "area": "Before a choice",
   "topic": "analytics",
   "rank": 160,
   "who": "A lawyer",
   "time": "30 minutes with counsel",
   "claims": [
    "F-DEVICE-10",
    "F-DEVICE-11",
    "N-HR-COOKIE-CONSENT-M03"
   ],
   "question": null,
   "fix": [
    {
     "label": "Question for a lawyer",
     "code": "Our site runs Vercel Web Analytics before any consent choice. It sets no cookies. Under ZEK Article 43(4) and EDPB Guidelines 2/2023, does it read or store anything on the device that needs consent, or can it run before a choice?"
    }
   ],
   "verify": "Keep the vendor's own description of what the script reads, and the lawyer's answer, with your records.",
   "evidence": [
    {
     "k": "request",
     "a": "www.nosastra.co",
     "b": "https://www.nosastra.co/_vercel/insights/script.js",
     "c": "+0.8 s, HTTP 200"
    }
   ],
   "scope": {
    "pages": [
     "/"
    ]
   },
   "recheck": {
    "state": "needs_a_specialist",
    "text": "Run the check again to update this finding: pnpm check --site tamara.rocks --site nosastra.co --site welcomebook.eu --site vibeordev.com --out <guide folder>"
   },
   "engine": "engine 0.1.0, rules 2026-11-08"
  },
  {
   "id": "cookieless-analytics-before-choice.tamara-rocks",
   "rule": "cookieless-analytics-before-choice",
   "site": "tamara.rocks",
   "state": "needs_a_specialist",
   "title": "Vercel Web Analytics loads before a choice",
   "sentence": "Vercel Web Analytics is sold as cookie-free and loads on the first page view. Whether that needs consent depends on what it reads from the device.",
   "why": "The research library says \"cookieless\" is not an exemption by itself, and Croatian first-party or cookieless labels do not create one either. A specialist has to look at what the script actually does.",
   "area": "Before a choice",
   "topic": "analytics",
   "rank": 160,
   "who": "A lawyer",
   "time": "30 minutes with counsel",
   "claims": [
    "F-DEVICE-10",
    "F-DEVICE-11",
    "N-HR-COOKIE-CONSENT-M03"
   ],
   "question": null,
   "fix": [
    {
     "label": "Question for a lawyer",
     "code": "Our site runs Vercel Web Analytics before any consent choice. It sets no cookies. Under ZEK Article 43(4) and EDPB Guidelines 2/2023, does it read or store anything on the device that needs consent, or can it run before a choice?"
    }
   ],
   "verify": "Keep the vendor's own description of what the script reads, and the lawyer's answer, with your records.",
   "evidence": [
    {
     "k": "request",
     "a": "www.tamara.rocks",
     "b": "https://www.tamara.rocks/_vercel/insights/script.js",
     "c": "+0.3 s, HTTP 200"
    }
   ],
   "scope": {
    "pages": [
     "/"
    ]
   },
   "recheck": {
    "state": "needs_a_specialist",
    "text": "Run the check again to update this finding: pnpm check --site tamara.rocks --site nosastra.co --site welcomebook.eu --site vibeordev.com --out <guide folder>"
   },
   "engine": "engine 0.1.0, rules 2026-11-08"
  },
  {
   "id": "cookieless-analytics-before-choice.vibeordev-com",
   "rule": "cookieless-analytics-before-choice",
   "site": "vibeordev.com",
   "state": "needs_a_specialist",
   "title": "Vercel Web Analytics loads before a choice",
   "sentence": "Vercel Web Analytics is sold as cookie-free and loads on the first page view. Whether that needs consent depends on what it reads from the device.",
   "why": "The research library says \"cookieless\" is not an exemption by itself, and Croatian first-party or cookieless labels do not create one either. A specialist has to look at what the script actually does.",
   "area": "Before a choice",
   "topic": "analytics",
   "rank": 160,
   "who": "A lawyer",
   "time": "30 minutes with counsel",
   "claims": [
    "F-DEVICE-10",
    "F-DEVICE-11",
    "N-HR-COOKIE-CONSENT-M03"
   ],
   "question": null,
   "fix": [
    {
     "label": "Question for a lawyer",
     "code": "Our site runs Vercel Web Analytics before any consent choice. It sets no cookies. Under ZEK Article 43(4) and EDPB Guidelines 2/2023, does it read or store anything on the device that needs consent, or can it run before a choice?"
    }
   ],
   "verify": "Keep the vendor's own description of what the script reads, and the lawyer's answer, with your records.",
   "evidence": [
    {
     "k": "request",
     "a": "www.vibeordev.com",
     "b": "https://www.vibeordev.com/_vercel/insights/script.js",
     "c": "+0.8 s, HTTP 200"
    }
   ],
   "scope": {
    "pages": [
     "/"
    ]
   },
   "recheck": {
    "state": "needs_a_specialist",
    "text": "Run the check again to update this finding: pnpm check --site tamara.rocks --site nosastra.co --site welcomebook.eu --site vibeordev.com --out <guide folder>"
   },
   "engine": "engine 0.1.0, rules 2026-11-08"
  },
  {
   "id": "unidentified-third-party.nosastra-co",
   "rule": "unidentified-third-party",
   "site": "nosastra.co",
   "state": "needs_your_answer",
   "title": "1 unknown service loads before a choice",
   "sentence": "The page contacts signal-by-nosastra.vercel.app on first load. We do not know these, so tell us what each one does.",
   "why": "Every third party that loads gets the visitor's IP address. If one of them tracks, it needs consent first. We do not guess, so you name them.",
   "area": "Before a choice",
   "topic": "analytics",
   "rank": 170,
   "who": "You",
   "time": "15 minutes",
   "claims": [
    "N-HR-COOKIE-CONSENT-01",
    "N-HR-COOKIE-CONSENT-07"
   ],
   "question": "Q-178",
   "fix": [
    {
     "label": "What to do",
     "code": "1. Search your code for each host name.\n2. Write down which tool it is and what it is for.\n3. If it is analytics, advertising or anything you do not need, gate it behind Accept or remove it.\n4. Answer question Q-178 in Questions."
    }
   ],
   "verify": "Each host is either removed, gated behind Accept, or named in your privacy notice as needed.",
   "evidence": [
    {
     "k": "request",
     "a": "signal-by-nosastra.vercel.app",
     "b": "https://signal-by-nosastra.vercel.app/signal.js",
     "c": "+0.3 s, HTTP 200"
    }
   ],
   "scope": {
    "pages": [
     "/"
    ]
   },
   "recheck": {
    "state": "needs_your_answer",
    "text": "Run the check again to update this finding: pnpm check --site tamara.rocks --site nosastra.co --site welcomebook.eu --site vibeordev.com --out <guide folder>"
   },
   "engine": "engine 0.1.0, rules 2026-11-08"
  },
  {
   "id": "unidentified-third-party.tamara-rocks",
   "rule": "unidentified-third-party",
   "site": "tamara.rocks",
   "state": "needs_your_answer",
   "title": "1 unknown service loads before a choice",
   "sentence": "The page contacts cdn.simpleicons.org on first load. We do not know these, so tell us what each one does.",
   "why": "Every third party that loads gets the visitor's IP address. If one of them tracks, it needs consent first. We do not guess, so you name them.",
   "area": "Before a choice",
   "topic": "analytics",
   "rank": 170,
   "who": "You",
   "time": "15 minutes",
   "claims": [
    "N-HR-COOKIE-CONSENT-01",
    "N-HR-COOKIE-CONSENT-07"
   ],
   "question": "Q-178",
   "fix": [
    {
     "label": "What to do",
     "code": "1. Search your code for each host name.\n2. Write down which tool it is and what it is for.\n3. If it is analytics, advertising or anything you do not need, gate it behind Accept or remove it.\n4. Answer question Q-178 in Questions."
    }
   ],
   "verify": "Each host is either removed, gated behind Accept, or named in your privacy notice as needed.",
   "evidence": [
    {
     "k": "request",
     "a": "cdn.simpleicons.org",
     "b": "https://cdn.simpleicons.org/langchain",
     "c": "+0.3 s, HTTP 200"
    }
   ],
   "scope": {
    "pages": [
     "/"
    ]
   },
   "recheck": {
    "state": "needs_your_answer",
    "text": "Run the check again to update this finding: pnpm check --site tamara.rocks --site nosastra.co --site welcomebook.eu --site vibeordev.com --out <guide folder>"
   },
   "engine": "engine 0.1.0, rules 2026-11-08"
  },
  {
   "id": "unidentified-third-party.vibeordev-com",
   "rule": "unidentified-third-party",
   "site": "vibeordev.com",
   "state": "needs_your_answer",
   "title": "1 unknown service loads before a choice",
   "sentence": "The page contacts sgvzghfntliuafzfndes.supabase.co on first load. We do not know these, so tell us what each one does.",
   "why": "Every third party that loads gets the visitor's IP address. If one of them tracks, it needs consent first. We do not guess, so you name them.",
   "area": "Before a choice",
   "topic": "analytics",
   "rank": 170,
   "who": "You",
   "time": "15 minutes",
   "claims": [
    "N-HR-COOKIE-CONSENT-01",
    "N-HR-COOKIE-CONSENT-07"
   ],
   "question": "Q-178",
   "fix": [
    {
     "label": "What to do",
     "code": "1. Search your code for each host name.\n2. Write down which tool it is and what it is for.\n3. If it is analytics, advertising or anything you do not need, gate it behind Accept or remove it.\n4. Answer question Q-178 in Questions."
    }
   ],
   "verify": "Each host is either removed, gated behind Accept, or named in your privacy notice as needed.",
   "evidence": [
    {
     "k": "request",
     "a": "sgvzghfntliuafzfndes.supabase.co",
     "b": "https://sgvzghfntliuafzfndes.supabase.co/rest/v1/scores?select=id%2Cname%2Cscore%2Ctime_ms%2Cpersona_id%2Cpersona_name%2Cpersona_emoji%2Ccre...",
     "c": "+0.8 s, HTTP 200"
    }
   ],
   "scope": {
    "pages": [
     "/"
    ]
   },
   "recheck": {
    "state": "needs_your_answer",
    "text": "Run the check again to update this finding: pnpm check --site tamara.rocks --site nosastra.co --site welcomebook.eu --site vibeordev.com --out <guide folder>"
   },
   "engine": "engine 0.1.0, rules 2026-11-08"
  },
  {
   "id": "unidentified-third-party.welcomebook-eu",
   "rule": "unidentified-third-party",
   "site": "welcomebook.eu",
   "state": "needs_your_answer",
   "title": "1 unknown service loads before a choice",
   "sentence": "The page contacts xpmetric.com on first load. We do not know these, so tell us what each one does.",
   "why": "Every third party that loads gets the visitor's IP address. If one of them tracks, it needs consent first. We do not guess, so you name them.",
   "area": "Before a choice",
   "topic": "analytics",
   "rank": 170,
   "who": "You",
   "time": "15 minutes",
   "claims": [
    "N-HR-COOKIE-CONSENT-01",
    "N-HR-COOKIE-CONSENT-07"
   ],
   "question": "Q-178",
   "fix": [
    {
     "label": "What to do",
     "code": "1. Search your code for each host name.\n2. Write down which tool it is and what it is for.\n3. If it is analytics, advertising or anything you do not need, gate it behind Accept or remove it.\n4. Answer question Q-178 in Questions."
    }
   ],
   "verify": "Each host is either removed, gated behind Accept, or named in your privacy notice as needed.",
   "evidence": [
    {
     "k": "request",
     "a": "xpmetric.com",
     "b": "https://xpmetric.com/p.js",
     "c": "+0.3 s, HTTP 200"
    }
   ],
   "scope": {
    "pages": [
     "/"
    ]
   },
   "recheck": {
    "state": "needs_your_answer",
    "text": "Run the check again to update this finding: pnpm check --site tamara.rocks --site nosastra.co --site welcomebook.eu --site vibeordev.com --out <guide folder>"
   },
   "engine": "engine 0.1.0, rules 2026-11-08"
  },
  {
   "id": "storage-unknown-before-choice.tamara-rocks",
   "rule": "storage-unknown-before-choice",
   "site": "tamara.rocks",
   "state": "needs_your_answer",
   "title": "1 stored item we could not identify",
   "sentence": "The site saves these keys on the visitor's device before any choice. We could not match them to a known tool, so tell us what each one does.",
   "why": "The research library says localStorage and other device storage fall under the same rule as cookies. A key that only does what the visitor asked for, such as a theme or a cart, is fine. A key used for statistics needs consent.",
   "area": "Before a choice",
   "topic": "storage",
   "rank": 180,
   "who": "You or your developer",
   "time": "30 minutes",
   "claims": [
    "F-DEVICE-06",
    "F-DEVICE-07"
   ],
   "question": "Q-028",
   "fix": [
    {
     "label": "Find them",
     "code": "// Run in your project folder to find where each key is written:\n// grep -rn \"localStorage\\|sessionStorage\\|document.cookie\" src/\n//\n// Then, for keys used only for statistics, write them after Accept:\nif (localStorage.getItem('analytics-consent') === 'yes') {\n  localStorage.setItem('visits', String(Number(localStorage.getItem('visits') || 0) + 1));\n}"
    }
   ],
   "verify": "Fresh private window. Application, then Local storage and Cookies. Only keys the visitor asked for should be there.",
   "evidence": [
    {
     "k": "cookie",
     "a": "tamara_rocks_visitor",
     "b": "www.tamara.rocks, first party",
     "c": "12 months"
    }
   ],
   "scope": {
    "pages": [
     "/"
    ]
   },
   "recheck": {
    "state": "needs_your_answer",
    "text": "Run the check again to update this finding: pnpm check --site tamara.rocks --site nosastra.co --site welcomebook.eu --site vibeordev.com --out <guide folder>"
   },
   "engine": "engine 0.1.0, rules 2026-11-08"
  },
  {
   "id": "storage-unknown-before-choice.vibeordev-com",
   "rule": "storage-unknown-before-choice",
   "site": "vibeordev.com",
   "state": "needs_your_answer",
   "title": "1 stored item we could not identify",
   "sentence": "The site saves these keys on the visitor's device before any choice. We could not match them to a known tool, so tell us what each one does.",
   "why": "The research library says localStorage and other device storage fall under the same rule as cookies. A key that only does what the visitor asked for, such as a theme or a cart, is fine. A key used for statistics needs consent.",
   "area": "Before a choice",
   "topic": "storage",
   "rank": 180,
   "who": "You or your developer",
   "time": "30 minutes",
   "claims": [
    "F-DEVICE-06",
    "F-DEVICE-07"
   ],
   "question": "Q-028",
   "fix": [
    {
     "label": "Find them",
     "code": "// Run in your project folder to find where each key is written:\n// grep -rn \"localStorage\\|sessionStorage\\|document.cookie\" src/\n//\n// Then, for keys used only for statistics, write them after Accept:\nif (localStorage.getItem('analytics-consent') === 'yes') {\n  localStorage.setItem('visits', String(Number(localStorage.getItem('visits') || 0) + 1));\n}"
    }
   ],
   "verify": "Fresh private window. Application, then Local storage and Cookies. Only keys the visitor asked for should be there.",
   "evidence": [
    {
     "k": "storage",
     "a": "vctd:leaderboard:v3",
     "b": "localStorage",
     "c": ""
    }
   ],
   "scope": {
    "pages": [
     "/"
    ]
   },
   "recheck": {
    "state": "needs_your_answer",
    "text": "Run the check again to update this finding: pnpm check --site tamara.rocks --site nosastra.co --site welcomebook.eu --site vibeordev.com --out <guide folder>"
   },
   "engine": "engine 0.1.0, rules 2026-11-08"
  },
  {
   "id": "storage-unknown-before-choice.welcomebook-eu",
   "rule": "storage-unknown-before-choice",
   "site": "welcomebook.eu",
   "state": "needs_your_answer",
   "title": "1 stored item we could not identify",
   "sentence": "The site saves these keys on the visitor's device before any choice. We could not match them to a known tool, so tell us what each one does.",
   "why": "The research library says localStorage and other device storage fall under the same rule as cookies. A key that only does what the visitor asked for, such as a theme or a cart, is fine. A key used for statistics needs consent.",
   "area": "Before a choice",
   "topic": "storage",
   "rank": 180,
   "who": "You or your developer",
   "time": "30 minutes",
   "claims": [
    "F-DEVICE-06",
    "F-DEVICE-07"
   ],
   "question": "Q-028",
   "fix": [
    {
     "label": "Find them",
     "code": "// Run in your project folder to find where each key is written:\n// grep -rn \"localStorage\\|sessionStorage\\|document.cookie\" src/\n//\n// Then, for keys used only for statistics, write them after Accept:\nif (localStorage.getItem('analytics-consent') === 'yes') {\n  localStorage.setItem('visits', String(Number(localStorage.getItem('visits') || 0) + 1));\n}"
    }
   ],
   "verify": "Fresh private window. Application, then Local storage and Cookies. Only keys the visitor asked for should be there.",
   "evidence": [
    {
     "k": "storage",
     "a": "landing.lang",
     "b": "localStorage",
     "c": ""
    }
   ],
   "scope": {
    "pages": [
     "/"
    ]
   },
   "recheck": {
    "state": "needs_your_answer",
    "text": "Run the check again to update this finding: pnpm check --site tamara.rocks --site nosastra.co --site welcomebook.eu --site vibeordev.com --out <guide folder>"
   },
   "engine": "engine 0.1.0, rules 2026-11-08"
  },
  {
   "id": "form-no-notice.nosastra-co",
   "rule": "form-no-notice",
   "site": "nosastra.co",
   "state": "observed",
   "title": "A form has no privacy notice next to it",
   "sentence": "The form collects personal details but shows no line or link saying who gets them and why.",
   "why": "The research library says people must get the privacy information when you collect their data, which means at the form, not somewhere else on the site.",
   "area": "Forms",
   "topic": "signups",
   "rank": 200,
   "who": "You or your developer",
   "time": "15 minutes",
   "claims": [
    "F-GDPR-NOTICE-01",
    "F-GDPR-NOTICE-07"
   ],
   "question": null,
   "fix": [
    {
     "label": "Contact form",
     "code": "<!-- Put this above the submit button of each contact form. -->\n<p class=\"form-notice\">\n  We use your details only to answer this message.\n  Read how in our <a href=\"/privacy\">privacy notice</a>.\n</p>"
    }
   ],
   "verify": "The notice line and its link are visible above the submit button, without scrolling past it.",
   "evidence": [
    {
     "k": "form",
     "a": "form:nth-of-type(1) on /",
     "b": "GET (sent by script)",
     "c": "contact form: name, email, company, message, button \"Send enquiry\""
    }
   ],
   "scope": {
    "pages": [
     "/"
    ]
   },
   "recheck": {
    "state": "observed",
    "text": "Run the check again to update this finding: pnpm check --site tamara.rocks --site nosastra.co --site welcomebook.eu --site vibeordev.com --out <guide folder>"
   },
   "engine": "engine 0.1.0, rules 2026-11-08"
  },
  {
   "id": "form-no-notice.tamara-rocks",
   "rule": "form-no-notice",
   "site": "tamara.rocks",
   "state": "observed",
   "title": "2 forms have no privacy notice next to them",
   "sentence": "These forms collect personal details but show no line or link saying who gets them and why. Only you know what a signup or other form is for, so its notice leaves that part for you to fill in.",
   "why": "The research library says people must get the privacy information when you collect their data, which means at the form, not somewhere else on the site.",
   "area": "Forms",
   "topic": "signups",
   "rank": 200,
   "who": "You or your developer",
   "time": "15 minutes",
   "claims": [
    "F-GDPR-NOTICE-01",
    "F-GDPR-NOTICE-07"
   ],
   "question": null,
   "fix": [
    {
     "label": "Event or booking form",
     "code": "<!-- Put this above the submit button of each event or booking form.\n     Replace every part in [brackets]. Only you know what the form is for. -->\n<p class=\"form-notice\">\n  We use the details you enter here to [confirm your place at the event and send you what you need to join it].\n  We keep them until [the event is over]. Read how in our <a href=\"/privacy\">privacy notice</a>.\n</p>\n<!-- To send news or offers as well, add a separate box that is not ticked. -->"
    },
    {
     "label": "Contact form",
     "code": "<!-- Put this above the submit button of each contact form. -->\n<p class=\"form-notice\">\n  We use your details only to answer this message.\n  Read how in our <a href=\"/privacy\">privacy notice</a>.\n</p>"
    }
   ],
   "verify": "The notice line and its link are visible above the submit button, without scrolling past it.",
   "evidence": [
    {
     "k": "form",
     "a": "form:nth-of-type(1) on /",
     "b": "POST https://www.tamara.rocks/api/workshop-signup",
     "c": "event form: _honey, email, button \"Save my spot\""
    },
    {
     "k": "form",
     "a": "form:nth-of-type(2) on /",
     "b": "POST https://formsubmit.co/0692d2802e45e5422362d55e07e22acf",
     "c": "contact form: _honey, name, email, business, message, button \"Send it →\""
    }
   ],
   "scope": {
    "pages": [
     "/"
    ]
   },
   "recheck": {
    "state": "observed",
    "text": "Run the check again to update this finding: pnpm check --site tamara.rocks --site nosastra.co --site welcomebook.eu --site vibeordev.com --out <guide folder>"
   },
   "engine": "engine 0.1.0, rules 2026-11-08"
  },
  {
   "id": "form-no-notice.welcomebook-eu",
   "rule": "form-no-notice",
   "site": "welcomebook.eu",
   "state": "observed",
   "title": "A form has no privacy notice next to it",
   "sentence": "The form collects personal details but shows no line or link saying who gets them and why.",
   "why": "The research library says people must get the privacy information when you collect their data, which means at the form, not somewhere else on the site.",
   "area": "Forms",
   "topic": "signups",
   "rank": 200,
   "who": "You or your developer",
   "time": "15 minutes",
   "claims": [
    "F-GDPR-NOTICE-01",
    "F-GDPR-NOTICE-07"
   ],
   "question": null,
   "fix": [
    {
     "label": "Contact form",
     "code": "<!-- Put this above the submit button of each contact form. -->\n<p class=\"form-notice\">\n  We use your details only to answer this message.\n  Read how in our <a href=\"/privacy\">privacy notice</a>.\n</p>"
    }
   ],
   "verify": "The notice line and its link are visible above the submit button, without scrolling past it.",
   "evidence": [
    {
     "k": "form",
     "a": "form:nth-of-type(1) on /",
     "b": "GET (sent by script)",
     "c": "contact form: text, email, message, button \"Pošalji poruku\""
    }
   ],
   "scope": {
    "pages": [
     "/"
    ]
   },
   "recheck": {
    "state": "observed",
    "text": "Run the check again to update this finding: pnpm check --site tamara.rocks --site nosastra.co --site welcomebook.eu --site vibeordev.com --out <guide folder>"
   },
   "engine": "engine 0.1.0, rules 2026-11-08"
  },
  {
   "id": "privacy-link-missing.tamara-rocks",
   "rule": "privacy-link-missing",
   "site": "tamara.rocks",
   "state": "observed",
   "title": "No link to a privacy notice on the home page",
   "sentence": "The home page collects data or loads other services, but links to no privacy notice.",
   "why": "The research library says people must get the privacy information when their data is collected, and that a website notice must be easy to reach.",
   "area": "Notices and trader details",
   "topic": "signups",
   "rank": 210,
   "who": "You",
   "time": "1 to 2 hours",
   "claims": [
    "F-GDPR-NOTICE-07",
    "F-GDPR-NOTICE-09"
   ],
   "question": null,
   "fix": [
    {
     "label": "Plain HTML",
     "code": "<!-- Link the notice from every page, for example in the footer. -->\n<footer>\n  <a href=\"/privacy\">Privacy notice</a>\n</footer>\n<!-- The notice itself says who you are, what you collect, why, which\n     tools receive it, how long you keep it and how people use their rights. -->"
    }
   ],
   "verify": "Every page has a footer link to the notice, and it opens.",
   "evidence": [
    {
     "k": "page",
     "a": "https://www.tamara.rocks/",
     "b": "15 links read, none to a privacy notice",
     "c": ""
    }
   ],
   "scope": {
    "pages": [
     "/"
    ]
   },
   "recheck": {
    "state": "observed",
    "text": "Run the check again to update this finding: pnpm check --site tamara.rocks --site nosastra.co --site welcomebook.eu --site vibeordev.com --out <guide folder>"
   },
   "engine": "engine 0.1.0, rules 2026-11-08"
  },
  {
   "id": "privacy-link-missing.vibeordev-com",
   "rule": "privacy-link-missing",
   "site": "vibeordev.com",
   "state": "observed",
   "title": "No link to a privacy notice on the home page",
   "sentence": "The home page collects data or loads other services, but links to no privacy notice.",
   "why": "The research library says people must get the privacy information when their data is collected, and that a website notice must be easy to reach.",
   "area": "Notices and trader details",
   "topic": "signups",
   "rank": 210,
   "who": "You",
   "time": "1 to 2 hours",
   "claims": [
    "F-GDPR-NOTICE-07",
    "F-GDPR-NOTICE-09"
   ],
   "question": null,
   "fix": [
    {
     "label": "Plain HTML",
     "code": "<!-- Link the notice from every page, for example in the footer. -->\n<footer>\n  <a href=\"/privacy\">Privacy notice</a>\n</footer>\n<!-- The notice itself says who you are, what you collect, why, which\n     tools receive it, how long you keep it and how people use their rights. -->"
    }
   ],
   "verify": "Every page has a footer link to the notice, and it opens.",
   "evidence": [
    {
     "k": "page",
     "a": "https://www.vibeordev.com/",
     "b": "1 links read, none to a privacy notice",
     "c": ""
    }
   ],
   "scope": {
    "pages": [
     "/"
    ]
   },
   "recheck": {
    "state": "observed",
    "text": "Run the check again to update this finding: pnpm check --site tamara.rocks --site nosastra.co --site welcomebook.eu --site vibeordev.com --out <guide folder>"
   },
   "engine": "engine 0.1.0, rules 2026-11-08"
  },
  {
   "id": "privacy-link-missing.welcomebook-eu",
   "rule": "privacy-link-missing",
   "site": "welcomebook.eu",
   "state": "observed",
   "title": "No link to a privacy notice on the home page",
   "sentence": "The home page collects data or loads other services, but links to no privacy notice.",
   "why": "The research library says people must get the privacy information when their data is collected, and that a website notice must be easy to reach.",
   "area": "Notices and trader details",
   "topic": "signups",
   "rank": 210,
   "who": "You",
   "time": "1 to 2 hours",
   "claims": [
    "F-GDPR-NOTICE-07",
    "F-GDPR-NOTICE-09"
   ],
   "question": null,
   "fix": [
    {
     "label": "Plain HTML",
     "code": "<!-- Link the notice from every page, for example in the footer. -->\n<footer>\n  <a href=\"/privacy\">Privacy notice</a>\n</footer>\n<!-- The notice itself says who you are, what you collect, why, which\n     tools receive it, how long you keep it and how people use their rights. -->"
    }
   ],
   "verify": "Every page has a footer link to the notice, and it opens.",
   "evidence": [
    {
     "k": "page",
     "a": "https://www.welcomebook.eu/",
     "b": "26 links read, none to a privacy notice",
     "c": ""
    }
   ],
   "scope": {
    "pages": [
     "/"
    ]
   },
   "recheck": {
    "state": "observed",
    "text": "Run the check again to update this finding: pnpm check --site tamara.rocks --site nosastra.co --site welcomebook.eu --site vibeordev.com --out <guide folder>"
   },
   "engine": "engine 0.1.0, rules 2026-11-08"
  },
  {
   "id": "form-third-party.tamara-rocks",
   "rule": "form-third-party",
   "site": "tamara.rocks",
   "state": "needs_your_answer",
   "title": "Form messages go to FormSubmit",
   "sentence": "What people type into the form is sent to FormSubmit, not to your own server. Check you have their data processing agreement for your plan.",
   "why": "A service that stores messages for you is usually your processor. The research library says you need an agreement with it that covers your exact account and plan.",
   "area": "Forms",
   "topic": "clients",
   "rank": 250,
   "who": "You",
   "time": "20 minutes",
   "claims": [
    "F-GDPR-PROCESSOR-01",
    "F-GDPR-PROCESSOR-04"
   ],
   "question": "Q-086",
   "fix": [
    {
     "label": "What to do",
     "code": "1. Find the data processing agreement (DPA) of FormSubmit.\n2. Check it covers your plan, including a free plan if you use one.\n3. Note where it stores data.\n4. Name the service in your privacy notice.\n5. Answer question Q-086 in Questions."
    }
   ],
   "verify": "Your privacy notice names the form service, and you have its DPA saved.",
   "evidence": [
    {
     "k": "form",
     "a": "form:nth-of-type(2) on /",
     "b": "POST https://formsubmit.co/0692d2802e45e5422362d55e07e22acf",
     "c": "FormSubmit"
    }
   ],
   "scope": {
    "pages": [
     "/"
    ]
   },
   "recheck": {
    "state": "needs_your_answer",
    "text": "Run the check again to update this finding: pnpm check --site tamara.rocks --site nosastra.co --site welcomebook.eu --site vibeordev.com --out <guide folder>"
   },
   "engine": "engine 0.1.0, rules 2026-11-08"
  },
  {
   "id": "dmarc-missing.tamara-rocks",
   "rule": "dmarc-missing",
   "site": "tamara.rocks",
   "state": "observed",
   "title": "tamara.rocks has no DMARC record",
   "sentence": "tamara.rocks has no DMARC record, so the domain does not ask inboxes to block mail that fakes your address.",
   "why": "Without DMARC, the domain allows mail that puts your address in the From line. Each inbox then decides alone what to do with it. Large mailbox providers also expect DMARC from senders.",
   "area": "Email and DNS",
   "topic": "inbox",
   "rank": 300,
   "who": "You, in your domain's DNS panel",
   "time": "10 minutes",
   "claims": [],
   "question": null,
   "fix": [
    {
     "label": "DNS record",
     "code": "Type:  TXT\nName:  _dmarc\nValue: v=DMARC1; p=none; rua=mailto:dmarc@tamara.rocks;\n\nStart at p=none and create the dmarc@ alias first. After a few weeks of clean reports, move to p=quarantine.\nIf this domain sends no mail at all, ask for p=reject instead."
    }
   ],
   "verify": "Run nslookup -type=TXT _dmarc.tamara.rocks. It returns the new record.",
   "evidence": [
    {
     "k": "dns",
     "a": "_dmarc.tamara.rocks",
     "b": "no record",
     "c": ""
    }
   ],
   "recheck": {
    "state": "observed",
    "text": "Run the check again to update this finding: pnpm check --site tamara.rocks --site nosastra.co --site welcomebook.eu --site vibeordev.com --out <guide folder>"
   },
   "engine": "engine 0.1.0, rules 2026-11-08"
  },
  {
   "id": "dmarc-missing.vibeordev-com",
   "rule": "dmarc-missing",
   "site": "vibeordev.com",
   "state": "observed",
   "title": "vibeordev.com has no DMARC record",
   "sentence": "vibeordev.com has no DMARC record, so the domain does not ask inboxes to block mail that fakes your address.",
   "why": "Without DMARC, the domain allows mail that puts your address in the From line. Each inbox then decides alone what to do with it. Large mailbox providers also expect DMARC from senders.",
   "area": "Email and DNS",
   "topic": "inbox",
   "rank": 300,
   "who": "You, in your domain's DNS panel",
   "time": "10 minutes",
   "claims": [],
   "question": null,
   "fix": [
    {
     "label": "DNS record",
     "code": "Type:  TXT\nName:  _dmarc\nValue: v=DMARC1; p=none; rua=mailto:dmarc@vibeordev.com;\n\nStart at p=none and create the dmarc@ alias first. After a few weeks of clean reports, move to p=quarantine.\nIf this domain sends no mail at all, ask for p=reject instead."
    }
   ],
   "verify": "Run nslookup -type=TXT _dmarc.vibeordev.com. It returns the new record.",
   "evidence": [
    {
     "k": "dns",
     "a": "_dmarc.vibeordev.com",
     "b": "no record",
     "c": ""
    }
   ],
   "recheck": {
    "state": "observed",
    "text": "Run the check again to update this finding: pnpm check --site tamara.rocks --site nosastra.co --site welcomebook.eu --site vibeordev.com --out <guide folder>"
   },
   "engine": "engine 0.1.0, rules 2026-11-08"
  },
  {
   "id": "dmarc-missing.welcomebook-eu",
   "rule": "dmarc-missing",
   "site": "welcomebook.eu",
   "state": "observed",
   "title": "welcomebook.eu has no DMARC record",
   "sentence": "welcomebook.eu has no DMARC record, so the domain does not ask inboxes to block mail that fakes your address.",
   "why": "Without DMARC, the domain allows mail that puts your address in the From line. Each inbox then decides alone what to do with it. Large mailbox providers also expect DMARC from senders.",
   "area": "Email and DNS",
   "topic": "inbox",
   "rank": 300,
   "who": "You, in your domain's DNS panel",
   "time": "10 minutes",
   "claims": [],
   "question": null,
   "fix": [
    {
     "label": "DNS record",
     "code": "Type:  TXT\nName:  _dmarc\nValue: v=DMARC1; p=none; rua=mailto:dmarc@welcomebook.eu;\n\nStart at p=none and create the dmarc@ alias first. After a few weeks of clean reports, move to p=quarantine.\nIf this domain sends no mail at all, ask for p=reject instead."
    }
   ],
   "verify": "Run nslookup -type=TXT _dmarc.welcomebook.eu. It returns the new record.",
   "evidence": [
    {
     "k": "dns",
     "a": "_dmarc.welcomebook.eu",
     "b": "no record",
     "c": ""
    }
   ],
   "recheck": {
    "state": "observed",
    "text": "Run the check again to update this finding: pnpm check --site tamara.rocks --site nosastra.co --site welcomebook.eu --site vibeordev.com --out <guide folder>"
   },
   "engine": "engine 0.1.0, rules 2026-11-08"
  },
  {
   "id": "dmarc-policy-none.nosastra-co",
   "rule": "dmarc-policy-none",
   "site": "nosastra.co",
   "state": "observed",
   "title": "DMARC on nosastra.co only watches",
   "sentence": "nosastra.co has DMARC set to p=none. This asks inboxes only for reports, so the domain still allows mail that fails the check.",
   "why": "p=none is the right first step. It becomes a gap when it stays forever, because the domain never asks inboxes to block mail that fails the check.",
   "area": "Email and DNS",
   "topic": "inbox",
   "rank": 310,
   "who": "You, in your domain's DNS panel",
   "time": "10 minutes, after a few weeks of reports",
   "claims": [],
   "question": null,
   "fix": [
    {
     "label": "DNS record",
     "code": "Type:  TXT\nName:  _dmarc\nValue: v=DMARC1; p=quarantine; rua=mailto:hello@nosastra.co; ruf=mailto:hello@nosastra.co; sp=none; adkim=r; aspf=r; pct=100;\n\nOnly p changes. Every other tag stays as you set it.\nChange it only after the reports show nothing but your own mail tools for a few weeks.\nMoving to p=reject is your decision. RFC 9989 section 7.4 warns that reject can break mail sent through mailing lists and forwarding, and says domains whose users post to mailing lists should not publish it.\nsp=none keeps every subdomain at reports only. Raising sp changes every subdomain of this domain, including ones this scan did not check, so decide it on its own.\nruf sends failure reports to hello@nosastra.co. They can hold parts of messages, so a separate alias is safer than a main inbox.\npct is from RFC 7489. RFC 9989 removed it (Appendix C.5.2), so newer receivers ignore it. It stays because older receivers still read it."
    }
   ],
   "verify": "nslookup -type=TXT _dmarc.nosastra.co shows p=quarantine.",
   "evidence": [
    {
     "k": "dns",
     "a": "DMARC",
     "b": "v=DMARC1; p=none; rua=mailto:hello@nosastra.co; ruf=mailto:hello@nosastra.co; sp=none; adkim=r; aspf=r; pct=100",
     "c": ""
    }
   ],
   "recheck": {
    "state": "observed",
    "text": "Run the check again to update this finding: pnpm check --site tamara.rocks --site nosastra.co --site welcomebook.eu --site vibeordev.com --out <guide folder>"
   },
   "engine": "engine 0.1.0, rules 2026-11-08"
  },
  {
   "id": "mail-use-unknown.tamara-rocks",
   "rule": "mail-use-unknown",
   "site": "tamara.rocks",
   "state": "needs_your_answer",
   "title": "Does tamara.rocks send or receive mail?",
   "sentence": "tamara.rocks has no mail host. If it takes no mail, lock it. If it does, add its mail records.",
   "why": "A domain with no mail records gives inboxes no rule for mail in its name, and replies to it can get lost.",
   "area": "Email and DNS",
   "topic": "inbox",
   "rank": 340,
   "who": "You",
   "time": "10 minutes",
   "claims": [],
   "question": null,
   "fix": [
    {
     "label": "It sends and takes no mail",
     "code": "Type:  MX\nName:  @\nValue: 0 .\n\nType:  TXT\nName:  @\nValue: v=spf1 -all\n\nType:  TXT\nName:  _dmarc\nValue: v=DMARC1; p=reject;\n\nRandom subdomains resolve here. Check preview and app subdomains first."
    },
    {
     "label": "It sends mail",
     "code": "Copy the MX, SPF and DKIM records from your mail host's setup page, then add:\nType:  TXT\nName:  _dmarc\nValue: v=DMARC1; p=none; rua=mailto:dmarc@tamara.rocks;"
    }
   ],
   "verify": "The DNS page shows MX, SPF and DMARC rows for this domain.",
   "evidence": [
    {
     "k": "dns",
     "a": "MX",
     "b": "none",
     "c": ""
    },
    {
     "k": "dns",
     "a": "SPF",
     "b": "none",
     "c": ""
    },
    {
     "k": "dns",
     "a": "DMARC",
     "b": "none",
     "c": ""
    }
   ],
   "recheck": {
    "state": "needs_your_answer",
    "text": "Run the check again to update this finding: pnpm check --site tamara.rocks --site nosastra.co --site welcomebook.eu --site vibeordev.com --out <guide folder>"
   },
   "engine": "engine 0.1.0, rules 2026-11-08"
  },
  {
   "id": "mail-use-unknown.vibeordev-com",
   "rule": "mail-use-unknown",
   "site": "vibeordev.com",
   "state": "needs_your_answer",
   "title": "Does vibeordev.com send or receive mail?",
   "sentence": "vibeordev.com has no mail host. If it takes no mail, lock it. If it does, add its mail records.",
   "why": "A domain with no mail records gives inboxes no rule for mail in its name, and replies to it can get lost.",
   "area": "Email and DNS",
   "topic": "inbox",
   "rank": 340,
   "who": "You",
   "time": "10 minutes",
   "claims": [],
   "question": null,
   "fix": [
    {
     "label": "It sends and takes no mail",
     "code": "Type:  MX\nName:  @\nValue: 0 .\n\nType:  TXT\nName:  @\nValue: v=spf1 -all\n\nType:  TXT\nName:  _dmarc\nValue: v=DMARC1; p=reject;\n\nRandom subdomains resolve here. Check preview and app subdomains first."
    },
    {
     "label": "It sends mail",
     "code": "Copy the MX, SPF and DKIM records from your mail host's setup page, then add:\nType:  TXT\nName:  _dmarc\nValue: v=DMARC1; p=none; rua=mailto:dmarc@vibeordev.com;"
    }
   ],
   "verify": "The DNS page shows MX, SPF and DMARC rows for this domain.",
   "evidence": [
    {
     "k": "dns",
     "a": "MX",
     "b": "none",
     "c": ""
    },
    {
     "k": "dns",
     "a": "SPF",
     "b": "none",
     "c": ""
    },
    {
     "k": "dns",
     "a": "DMARC",
     "b": "none",
     "c": ""
    }
   ],
   "recheck": {
    "state": "needs_your_answer",
    "text": "Run the check again to update this finding: pnpm check --site tamara.rocks --site nosastra.co --site welcomebook.eu --site vibeordev.com --out <guide folder>"
   },
   "engine": "engine 0.1.0, rules 2026-11-08"
  },
  {
   "id": "mail-use-unknown.welcomebook-eu",
   "rule": "mail-use-unknown",
   "site": "welcomebook.eu",
   "state": "needs_your_answer",
   "title": "Does welcomebook.eu send or receive mail?",
   "sentence": "welcomebook.eu has no mail host. If it takes no mail, lock it. If it does, add its mail records.",
   "why": "A domain with no mail records gives inboxes no rule for mail in its name, and replies to it can get lost.",
   "area": "Email and DNS",
   "topic": "inbox",
   "rank": 340,
   "who": "You",
   "time": "10 minutes",
   "claims": [],
   "question": null,
   "fix": [
    {
     "label": "It sends and takes no mail",
     "code": "Type:  MX\nName:  @\nValue: 0 .\n\nType:  TXT\nName:  @\nValue: v=spf1 -all\n\nType:  TXT\nName:  _dmarc\nValue: v=DMARC1; p=reject;\n\nRandom subdomains resolve here. Check preview and app subdomains first."
    },
    {
     "label": "It sends mail",
     "code": "Copy the MX, SPF and DKIM records from your mail host's setup page, then add:\nType:  TXT\nName:  _dmarc\nValue: v=DMARC1; p=none; rua=mailto:dmarc@welcomebook.eu;"
    }
   ],
   "verify": "The DNS page shows MX, SPF and DMARC rows for this domain.",
   "evidence": [
    {
     "k": "dns",
     "a": "MX",
     "b": "none",
     "c": ""
    },
    {
     "k": "dns",
     "a": "SPF",
     "b": "none",
     "c": ""
    },
    {
     "k": "dns",
     "a": "DMARC",
     "b": "none",
     "c": ""
    }
   ],
   "recheck": {
    "state": "needs_your_answer",
    "text": "Run the check again to update this finding: pnpm check --site tamara.rocks --site nosastra.co --site welcomebook.eu --site vibeordev.com --out <guide folder>"
   },
   "engine": "engine 0.1.0, rules 2026-11-08"
  },
  {
   "id": "trader-info-missing.tamara-rocks",
   "rule": "trader-info-missing",
   "site": "tamara.rocks",
   "state": "needs_your_answer",
   "title": "No trader details found",
   "sentence": "We found no business name with OIB, register entry or legal form. If the site is commercial, it needs them. Tell us whether it is.",
   "why": "The research library says a commercial site must show who runs it, where, and how to reach them, plus register and VAT details where they apply. In Croatia that is Article 6 of the Electronic Commerce Act.",
   "area": "Notices and trader details",
   "topic": "saas",
   "rank": 400,
   "who": "You, with your accountant",
   "time": "30 minutes",
   "claims": [
    "F-ECOMMERCE-01",
    "F-ECOMMERCE-02"
   ],
   "question": "Q-049",
   "fix": [
    {
     "label": "Plain HTML",
     "code": "<!-- Fill in your own details. Ask your accountant which register entry applies. -->\n<footer>\n  <p>\n    [Business name], [obrt or d.o.o.], [street and number], [postcode] [city], Croatia<br>\n    OIB: [11 digits]. Registered in [obrtni registar or sudski registar], number [number].<br>\n    Email: <a href=\"mailto:[your address]\">[your address]</a>\n  </p>\n  <a href=\"/impressum\">Impressum</a>\n</footer>"
    }
   ],
   "verify": "The footer shows the business name, address, OIB and email on every page.",
   "evidence": [
    {
     "k": "page",
     "a": "Pages read",
     "b": "/, /blogs/blog.html",
     "c": ""
    },
    {
     "k": "page",
     "a": "Not found",
     "b": "OIB, VAT number, Register entry, Legal form",
     "c": ""
    },
    {
     "k": "page",
     "a": "Found",
     "b": "nothing",
     "c": ""
    }
   ],
   "scope": {
    "pages": [
     "/"
    ]
   },
   "recheck": {
    "state": "needs_your_answer",
    "text": "Run the check again to update this finding: pnpm check --site tamara.rocks --site nosastra.co --site welcomebook.eu --site vibeordev.com --out <guide folder>"
   },
   "engine": "engine 0.1.0, rules 2026-11-08"
  },
  {
   "id": "trader-info-missing.vibeordev-com",
   "rule": "trader-info-missing",
   "site": "vibeordev.com",
   "state": "needs_your_answer",
   "title": "No trader details found",
   "sentence": "We found no business name with OIB, register entry or legal form. If the site is commercial, it needs them. Tell us whether it is.",
   "why": "The research library says a commercial site must show who runs it, where, and how to reach them, plus register and VAT details where they apply. In Croatia that is Article 6 of the Electronic Commerce Act.",
   "area": "Notices and trader details",
   "topic": "saas",
   "rank": 400,
   "who": "You, with your accountant",
   "time": "30 minutes",
   "claims": [
    "F-ECOMMERCE-01",
    "F-ECOMMERCE-02"
   ],
   "question": "Q-049",
   "fix": [
    {
     "label": "Plain HTML",
     "code": "<!-- Fill in your own details. Ask your accountant which register entry applies. -->\n<footer>\n  <p>\n    [Business name], [obrt or d.o.o.], [street and number], [postcode] [city], Croatia<br>\n    OIB: [11 digits]. Registered in [obrtni registar or sudski registar], number [number].<br>\n    Email: <a href=\"mailto:[your address]\">[your address]</a>\n  </p>\n  <a href=\"/impressum\">Impressum</a>\n</footer>"
    }
   ],
   "verify": "The footer shows the business name, address, OIB and email on every page.",
   "evidence": [
    {
     "k": "page",
     "a": "Pages read",
     "b": "/",
     "c": ""
    },
    {
     "k": "page",
     "a": "Not found",
     "b": "OIB, VAT number, Register entry, Legal form",
     "c": ""
    },
    {
     "k": "page",
     "a": "Found",
     "b": "nothing",
     "c": ""
    }
   ],
   "scope": {
    "pages": [
     "/"
    ]
   },
   "recheck": {
    "state": "needs_your_answer",
    "text": "Run the check again to update this finding: pnpm check --site tamara.rocks --site nosastra.co --site welcomebook.eu --site vibeordev.com --out <guide folder>"
   },
   "engine": "engine 0.1.0, rules 2026-11-08"
  },
  {
   "id": "trader-info-missing.welcomebook-eu",
   "rule": "trader-info-missing",
   "site": "welcomebook.eu",
   "state": "observed",
   "title": "No trader details found",
   "sentence": "The site shows prices or takes payments, but we found no business name with OIB, register entry or legal form on the pages we read.",
   "why": "The research library says a commercial site must show who runs it, where, and how to reach them, plus register and VAT details where they apply. In Croatia that is Article 6 of the Electronic Commerce Act.",
   "area": "Notices and trader details",
   "topic": "saas",
   "rank": 400,
   "who": "You, with your accountant",
   "time": "30 minutes",
   "claims": [
    "N-HR-TRADER-INFO-01",
    "F-ECOMMERCE-02"
   ],
   "question": "Q-049",
   "fix": [
    {
     "label": "Plain HTML",
     "code": "<!-- Fill in your own details. Ask your accountant which register entry applies. -->\n<footer>\n  <p>\n    [Business name], [obrt or d.o.o.], [street and number], [postcode] [city], Croatia<br>\n    OIB: [11 digits]. Registered in [obrtni registar or sudski registar], number [number].<br>\n    Email: <a href=\"mailto:[your address]\">[your address]</a>\n  </p>\n  <a href=\"/impressum\">Impressum</a>\n</footer>"
    }
   ],
   "verify": "The footer shows the business name, address, OIB and email on every page.",
   "evidence": [
    {
     "k": "page",
     "a": "Pages read",
     "b": "/",
     "c": ""
    },
    {
     "k": "page",
     "a": "Not found",
     "b": "OIB, VAT number, Register entry, Legal form",
     "c": ""
    },
    {
     "k": "page",
     "a": "Found",
     "b": "Email",
     "c": ""
    },
    {
     "k": "page",
     "a": "Selling signal",
     "b": "\"probaj demo Kontaktirajte me Izrada od €99 po sezoni · QR kod uključen\"",
     "c": ""
    }
   ],
   "scope": {
    "pages": [
     "/"
    ]
   },
   "recheck": {
    "state": "observed",
    "text": "Run the check again to update this finding: pnpm check --site tamara.rocks --site nosastra.co --site welcomebook.eu --site vibeordev.com --out <guide folder>"
   },
   "engine": "engine 0.1.0, rules 2026-11-08"
  },
  {
   "id": "third-party-fonts.nosastra-co",
   "rule": "third-party-fonts",
   "site": "nosastra.co",
   "state": "observed",
   "title": "Fonts load from Google Fonts",
   "sentence": "When we loaded the page /, it asked Google Fonts for fonts, which sends the visitor's IP address there. Hosting the font files yourself removes this.",
   "why": "The research library says each use of personal data, including an IP address, needs a legal basis, and that sending it to a company outside the EEA is a transfer that needs its own route. Self-hosted fonts look the same and send nothing.",
   "area": "Embeds and fonts",
   "topic": "analytics",
   "rank": 510,
   "who": "Your developer",
   "time": "30 minutes",
   "claims": [
    "F-GDPR-BASIS-04",
    "F-GDPR-TRANSFER-01"
   ],
   "question": null,
   "fix": [
    {
     "label": "Plain HTML",
     "code": "<!-- 1. Remove every tag like this from your pages:\n     <link href=\"https://fonts.googleapis.com/css2?family=...\" rel=\"stylesheet\"> -->\n<!-- 2. Download the woff2 files for each family and weight into /fonts on your site. -->\n<!-- 3. Add one @font-face block per family and weight: -->\n<style>\n  @font-face {\n    font-family: 'Manrope';\n    src: url('/fonts/manrope-400.woff2') format('woff2');\n    font-weight: 400;\n    font-style: normal;\n    font-display: swap;\n  }\n</style>"
    }
   ],
   "verify": "Network tab, filter \"font\". Every font should come from your own domain.",
   "evidence": [
    {
     "k": "request",
     "a": "fonts.googleapis.com",
     "b": "https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap",
     "c": "+0.3 s, HTTP 200"
    }
   ],
   "scope": {
    "pages": [
     "/"
    ]
   },
   "recheck": {
    "state": "observed",
    "text": "Run the check again to update this finding: pnpm check --site tamara.rocks --site nosastra.co --site welcomebook.eu --site vibeordev.com --out <guide folder>"
   },
   "engine": "engine 0.1.0, rules 2026-11-08"
  },
  {
   "id": "third-party-fonts.tamara-rocks",
   "rule": "third-party-fonts",
   "site": "tamara.rocks",
   "state": "observed",
   "title": "Fonts load from Google Fonts",
   "sentence": "When we loaded the page /, it asked Google Fonts for fonts, which sends the visitor's IP address there. Hosting the font files yourself removes this.",
   "why": "The research library says each use of personal data, including an IP address, needs a legal basis, and that sending it to a company outside the EEA is a transfer that needs its own route. Self-hosted fonts look the same and send nothing.",
   "area": "Embeds and fonts",
   "topic": "analytics",
   "rank": 510,
   "who": "Your developer",
   "time": "30 minutes",
   "claims": [
    "F-GDPR-BASIS-04",
    "F-GDPR-TRANSFER-01"
   ],
   "question": null,
   "fix": [
    {
     "label": "Plain HTML",
     "code": "<!-- 1. Remove every tag like this from your pages:\n     <link href=\"https://fonts.googleapis.com/css2?family=...\" rel=\"stylesheet\"> -->\n<!-- 2. Download the woff2 files for each family and weight into /fonts on your site. -->\n<!-- 3. Add one @font-face block per family and weight: -->\n<style>\n  @font-face {\n    font-family: 'Fraunces';\n    src: url('/fonts/fraunces-400.woff2') format('woff2');\n    font-weight: 400;\n    font-style: normal;\n    font-display: swap;\n  }\n  @font-face {\n    font-family: 'Nunito';\n    src: url('/fonts/nunito-400.woff2') format('woff2');\n    font-weight: 400;\n    font-style: normal;\n    font-display: swap;\n  }\n  @font-face {\n    font-family: 'Caveat';\n    src: url('/fonts/caveat-400.woff2') format('woff2');\n    font-weight: 400;\n    font-style: normal;\n    font-display: swap;\n  }\n</style>"
    }
   ],
   "verify": "Network tab, filter \"font\". Every font should come from your own domain.",
   "evidence": [
    {
     "k": "request",
     "a": "fonts.googleapis.com",
     "b": "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,500;0,9..144,700;1,9..144,300;1,9..144,500&family=Nun...",
     "c": "+0.3 s, HTTP 200"
    },
    {
     "k": "request",
     "a": "fonts.gstatic.com",
     "b": "https://fonts.gstatic.com/s/nunito/v32/XRXV3I6Li01BKofINeaB.woff2",
     "c": "+1.0 s, HTTP 200"
    }
   ],
   "scope": {
    "pages": [
     "/"
    ]
   },
   "recheck": {
    "state": "observed",
    "text": "Run the check again to update this finding: pnpm check --site tamara.rocks --site nosastra.co --site welcomebook.eu --site vibeordev.com --out <guide folder>"
   },
   "engine": "engine 0.1.0, rules 2026-11-08"
  },
  {
   "id": "third-party-fonts.vibeordev-com",
   "rule": "third-party-fonts",
   "site": "vibeordev.com",
   "state": "observed",
   "title": "Fonts load from Google Fonts",
   "sentence": "When we loaded the page /, it asked Google Fonts for fonts, which sends the visitor's IP address there. Hosting the font files yourself removes this.",
   "why": "The research library says each use of personal data, including an IP address, needs a legal basis, and that sending it to a company outside the EEA is a transfer that needs its own route. Self-hosted fonts look the same and send nothing.",
   "area": "Embeds and fonts",
   "topic": "analytics",
   "rank": 510,
   "who": "Your developer",
   "time": "30 minutes",
   "claims": [
    "F-GDPR-BASIS-04",
    "F-GDPR-TRANSFER-01"
   ],
   "question": null,
   "fix": [
    {
     "label": "Plain HTML",
     "code": "<!-- 1. Remove every tag like this from your pages:\n     <link href=\"https://fonts.googleapis.com/css2?family=...\" rel=\"stylesheet\"> -->\n<!-- 2. Download the woff2 files for each family and weight into /fonts on your site. -->\n<!-- 3. Add one @font-face block per family and weight: -->\n<style>\n  @font-face {\n    font-family: 'Inter';\n    src: url('/fonts/inter-400.woff2') format('woff2');\n    font-weight: 400;\n    font-style: normal;\n    font-display: swap;\n  }\n  @font-face {\n    font-family: 'Space Grotesk';\n    src: url('/fonts/space-grotesk-400.woff2') format('woff2');\n    font-weight: 400;\n    font-style: normal;\n    font-display: swap;\n  }\n</style>"
    }
   ],
   "verify": "Network tab, filter \"font\". Every font should come from your own domain.",
   "evidence": [
    {
     "k": "request",
     "a": "fonts.googleapis.com",
     "b": "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap",
     "c": "+0.3 s, HTTP 200"
    },
    {
     "k": "request",
     "a": "fonts.gstatic.com",
     "b": "https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa1ZL7.woff2",
     "c": "+0.8 s, HTTP 200"
    }
   ],
   "scope": {
    "pages": [
     "/"
    ]
   },
   "recheck": {
    "state": "observed",
    "text": "Run the check again to update this finding: pnpm check --site tamara.rocks --site nosastra.co --site welcomebook.eu --site vibeordev.com --out <guide folder>"
   },
   "engine": "engine 0.1.0, rules 2026-11-08"
  },
  {
   "id": "third-party-fonts.welcomebook-eu",
   "rule": "third-party-fonts",
   "site": "welcomebook.eu",
   "state": "observed",
   "title": "Fonts load from Google Fonts",
   "sentence": "When we loaded the page /, it asked Google Fonts for fonts, which sends the visitor's IP address there. Hosting the font files yourself removes this.",
   "why": "The research library says each use of personal data, including an IP address, needs a legal basis, and that sending it to a company outside the EEA is a transfer that needs its own route. Self-hosted fonts look the same and send nothing.",
   "area": "Embeds and fonts",
   "topic": "analytics",
   "rank": 510,
   "who": "Your developer",
   "time": "30 minutes",
   "claims": [
    "F-GDPR-BASIS-04",
    "F-GDPR-TRANSFER-01"
   ],
   "question": null,
   "fix": [
    {
     "label": "Plain HTML",
     "code": "<!-- 1. Remove every tag like this from your pages:\n     <link href=\"https://fonts.googleapis.com/css2?family=...\" rel=\"stylesheet\"> -->\n<!-- 2. Download the woff2 files for each family and weight into /fonts on your site. -->\n<!-- 3. Add one @font-face block per family and weight: -->\n<style>\n  @font-face {\n    font-family: 'Baloo 2';\n    src: url('/fonts/baloo-2-400.woff2') format('woff2');\n    font-weight: 400;\n    font-style: normal;\n    font-display: swap;\n  }\n  @font-face {\n    font-family: 'Nunito Sans';\n    src: url('/fonts/nunito-sans-400.woff2') format('woff2');\n    font-weight: 400;\n    font-style: normal;\n    font-display: swap;\n  }\n  @font-face {\n    font-family: 'Fraunces';\n    src: url('/fonts/fraunces-400.woff2') format('woff2');\n    font-weight: 400;\n    font-style: normal;\n    font-display: swap;\n  }\n  @font-face {\n    font-family: 'Hanken Grotesk';\n    src: url('/fonts/hanken-grotesk-400.woff2') format('woff2');\n    font-weight: 400;\n    font-style: normal;\n    font-display: swap;\n  }\n</style>"
    }
   ],
   "verify": "Network tab, filter \"font\". Every font should come from your own domain.",
   "evidence": [
    {
     "k": "request",
     "a": "fonts.googleapis.com",
     "b": "https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;600;700&family=Nunito+Sans:ital,wght@0,400;0,600;0,700;0,800&display=swap",
     "c": "+0.3 s, HTTP 200"
    },
    {
     "k": "request",
     "a": "fonts.gstatic.com",
     "b": "https://fonts.gstatic.com/s/fraunces/v38/6NU78FyLNQOQZAnv9bYEvDiIdE9Ea92uemAk_WBq8U_9v0c2Wa0KxC9TeA.woff2",
     "c": "+1.0 s, HTTP 200"
    }
   ],
   "scope": {
    "pages": [
     "/"
    ]
   },
   "recheck": {
    "state": "observed",
    "text": "Run the check again to update this finding: pnpm check --site tamara.rocks --site nosastra.co --site welcomebook.eu --site vibeordev.com --out <guide folder>"
   },
   "engine": "engine 0.1.0, rules 2026-11-08"
  },
  {
   "id": "hosting-plan.nosastra-co",
   "rule": "hosting-plan",
   "site": "nosastra.co",
   "state": "needs_your_answer",
   "title": "Which Vercel plan is nosastra.co on?",
   "sentence": "nosastra.co is served by Vercel. Some free plans do not allow commercial use or are not covered by the host's data processing agreement, so tell us which plan this is.",
   "why": "Vercel's terms, section 4, say: \"You shall only use the Services under a Hobby plan for your personal or non-commercial use.\" Its public DPA names Pro and Enterprise customers. (source: https://vercel.com/legal/terms, checked 2026-11-07). Whether your site counts as commercial is question Q-049.",
   "area": "Security and hosting",
   "topic": "hosting",
   "rank": 550,
   "who": "You",
   "time": "10 minutes",
   "claims": [
    "F-ECOMMERCE-01"
   ],
   "question": "Q-049",
   "fix": [
    {
     "label": "What to do",
     "code": "1. Open the Vercel dashboard and note the plan for this project.\n2. If the site earns money or promotes paid work and the plan is a free hobby plan, move it to a paid plan.\n3. Answer question Q-049 in Questions."
    }
   ],
   "verify": "Your hosting inventory lists the plan for every live domain.",
   "evidence": [
    {
     "k": "header",
     "a": "Host",
     "b": "Vercel",
     "c": "x-vercel-cache, x-vercel-id"
    }
   ],
   "recheck": {
    "state": "needs_your_answer",
    "text": "Run the check again to update this finding: pnpm check --site tamara.rocks --site nosastra.co --site welcomebook.eu --site vibeordev.com --out <guide folder>"
   },
   "engine": "engine 0.1.0, rules 2026-11-08"
  },
  {
   "id": "hosting-plan.tamara-rocks",
   "rule": "hosting-plan",
   "site": "tamara.rocks",
   "state": "needs_your_answer",
   "title": "Which Vercel plan is tamara.rocks on?",
   "sentence": "tamara.rocks is served by Vercel. Some free plans do not allow commercial use or are not covered by the host's data processing agreement, so tell us which plan this is.",
   "why": "Vercel's terms, section 4, say: \"You shall only use the Services under a Hobby plan for your personal or non-commercial use.\" Its public DPA names Pro and Enterprise customers. (source: https://vercel.com/legal/terms, checked 2026-11-07). Whether your site counts as commercial is question Q-049.",
   "area": "Security and hosting",
   "topic": "hosting",
   "rank": 550,
   "who": "You",
   "time": "10 minutes",
   "claims": [
    "F-ECOMMERCE-01"
   ],
   "question": "Q-049",
   "fix": [
    {
     "label": "What to do",
     "code": "1. Open the Vercel dashboard and note the plan for this project.\n2. If the site earns money or promotes paid work and the plan is a free hobby plan, move it to a paid plan.\n3. Answer question Q-049 in Questions."
    }
   ],
   "verify": "Your hosting inventory lists the plan for every live domain.",
   "evidence": [
    {
     "k": "header",
     "a": "Host",
     "b": "Vercel",
     "c": "x-vercel-cache, x-vercel-id"
    }
   ],
   "recheck": {
    "state": "needs_your_answer",
    "text": "Run the check again to update this finding: pnpm check --site tamara.rocks --site nosastra.co --site welcomebook.eu --site vibeordev.com --out <guide folder>"
   },
   "engine": "engine 0.1.0, rules 2026-11-08"
  },
  {
   "id": "hosting-plan.vibeordev-com",
   "rule": "hosting-plan",
   "site": "vibeordev.com",
   "state": "needs_your_answer",
   "title": "Which Vercel plan is vibeordev.com on?",
   "sentence": "vibeordev.com is served by Vercel. Some free plans do not allow commercial use or are not covered by the host's data processing agreement, so tell us which plan this is.",
   "why": "Vercel's terms, section 4, say: \"You shall only use the Services under a Hobby plan for your personal or non-commercial use.\" Its public DPA names Pro and Enterprise customers. (source: https://vercel.com/legal/terms, checked 2026-11-07). Whether your site counts as commercial is question Q-049.",
   "area": "Security and hosting",
   "topic": "hosting",
   "rank": 550,
   "who": "You",
   "time": "10 minutes",
   "claims": [
    "F-ECOMMERCE-01"
   ],
   "question": "Q-049",
   "fix": [
    {
     "label": "What to do",
     "code": "1. Open the Vercel dashboard and note the plan for this project.\n2. If the site earns money or promotes paid work and the plan is a free hobby plan, move it to a paid plan.\n3. Answer question Q-049 in Questions."
    }
   ],
   "verify": "Your hosting inventory lists the plan for every live domain.",
   "evidence": [
    {
     "k": "header",
     "a": "Host",
     "b": "Vercel",
     "c": "x-vercel-cache, x-vercel-id"
    }
   ],
   "recheck": {
    "state": "needs_your_answer",
    "text": "Run the check again to update this finding: pnpm check --site tamara.rocks --site nosastra.co --site welcomebook.eu --site vibeordev.com --out <guide folder>"
   },
   "engine": "engine 0.1.0, rules 2026-11-08"
  },
  {
   "id": "hosting-plan.welcomebook-eu",
   "rule": "hosting-plan",
   "site": "welcomebook.eu",
   "state": "needs_your_answer",
   "title": "Which Vercel plan is welcomebook.eu on?",
   "sentence": "welcomebook.eu is served by Vercel. Some free plans do not allow commercial use or are not covered by the host's data processing agreement, so tell us which plan this is.",
   "why": "Vercel's terms, section 4, say: \"You shall only use the Services under a Hobby plan for your personal or non-commercial use.\" Its public DPA names Pro and Enterprise customers. (source: https://vercel.com/legal/terms, checked 2026-11-07). Whether your site counts as commercial is question Q-049.",
   "area": "Security and hosting",
   "topic": "hosting",
   "rank": 550,
   "who": "You",
   "time": "10 minutes",
   "claims": [
    "F-ECOMMERCE-01"
   ],
   "question": "Q-049",
   "fix": [
    {
     "label": "What to do",
     "code": "1. Open the Vercel dashboard and note the plan for this project.\n2. If the site earns money or promotes paid work and the plan is a free hobby plan, move it to a paid plan.\n3. Answer question Q-049 in Questions."
    }
   ],
   "verify": "Your hosting inventory lists the plan for every live domain.",
   "evidence": [
    {
     "k": "header",
     "a": "Host",
     "b": "Vercel",
     "c": "x-vercel-cache, x-vercel-id"
    }
   ],
   "recheck": {
    "state": "needs_your_answer",
    "text": "Run the check again to update this finding: pnpm check --site tamara.rocks --site nosastra.co --site welcomebook.eu --site vibeordev.com --out <guide folder>"
   },
   "engine": "engine 0.1.0, rules 2026-11-08"
  },
  {
   "id": "security-headers-missing.nosastra-co",
   "rule": "security-headers-missing",
   "site": "nosastra.co",
   "state": "observed",
   "title": "4 security headers are missing",
   "sentence": "The site does not send content-security-policy, x-content-type-options, referrer-policy and permissions-policy. These headers limit what injected code and other sites can do with your pages.",
   "why": "These are hygiene notes, not legal findings. Start the Content Security Policy in report-only mode and tighten it once nothing breaks.",
   "area": "Security and hosting",
   "topic": "hosting",
   "rank": 580,
   "who": "Your developer",
   "time": "30 minutes",
   "claims": [],
   "question": null,
   "fix": [
    {
     "label": "vercel.json",
     "code": "{\n  \"headers\": [\n    {\n      \"source\": \"/(.*)\",\n      \"headers\": [\n        {\n          \"key\": \"Content-Security-Policy-Report-Only\",\n          \"value\": \"default-src 'self'; frame-ancestors 'self'\"\n        },\n        {\n          \"key\": \"X-Content-Type-Options\",\n          \"value\": \"nosniff\"\n        },\n        {\n          \"key\": \"Referrer-Policy\",\n          \"value\": \"strict-origin-when-cross-origin\"\n        },\n        {\n          \"key\": \"Permissions-Policy\",\n          \"value\": \"camera=(), microphone=(), geolocation=()\"\n        }\n      ]\n    }\n  ]\n}"
    },
    {
     "label": "nginx",
     "code": "add_header Content-Security-Policy-Report-Only \"default-src 'self'; frame-ancestors 'self'\" always;\nadd_header X-Content-Type-Options \"nosniff\" always;\nadd_header Referrer-Policy \"strict-origin-when-cross-origin\" always;\nadd_header Permissions-Policy \"camera=(), microphone=(), geolocation=()\" always;"
    },
    {
     "label": "Apache .htaccess",
     "code": "<IfModule mod_headers.c>\n  Header always set Content-Security-Policy-Report-Only \"default-src 'self'; frame-ancestors 'self'\"\n  Header always set X-Content-Type-Options \"nosniff\"\n  Header always set Referrer-Policy \"strict-origin-when-cross-origin\"\n  Header always set Permissions-Policy \"camera=(), microphone=(), geolocation=()\"\n</IfModule>"
    }
   ],
   "verify": "curl -I https://nosastra.co/ shows each header.",
   "evidence": [
    {
     "k": "header",
     "a": "content-security-policy",
     "b": "not sent",
     "c": "https://www.nosastra.co/"
    },
    {
     "k": "header",
     "a": "x-content-type-options",
     "b": "not sent",
     "c": "https://www.nosastra.co/"
    },
    {
     "k": "header",
     "a": "referrer-policy",
     "b": "not sent",
     "c": "https://www.nosastra.co/"
    },
    {
     "k": "header",
     "a": "permissions-policy",
     "b": "not sent",
     "c": "https://www.nosastra.co/"
    }
   ],
   "recheck": {
    "state": "observed",
    "text": "Run the check again to update this finding: pnpm check --site tamara.rocks --site nosastra.co --site welcomebook.eu --site vibeordev.com --out <guide folder>"
   },
   "engine": "engine 0.1.0, rules 2026-11-08"
  },
  {
   "id": "security-headers-missing.tamara-rocks",
   "rule": "security-headers-missing",
   "site": "tamara.rocks",
   "state": "observed",
   "title": "4 security headers are missing",
   "sentence": "The site does not send content-security-policy, x-content-type-options, referrer-policy and permissions-policy. These headers limit what injected code and other sites can do with your pages.",
   "why": "These are hygiene notes, not legal findings. Start the Content Security Policy in report-only mode and tighten it once nothing breaks.",
   "area": "Security and hosting",
   "topic": "hosting",
   "rank": 580,
   "who": "Your developer",
   "time": "30 minutes",
   "claims": [],
   "question": null,
   "fix": [
    {
     "label": "vercel.json",
     "code": "{\n  \"headers\": [\n    {\n      \"source\": \"/(.*)\",\n      \"headers\": [\n        {\n          \"key\": \"Content-Security-Policy-Report-Only\",\n          \"value\": \"default-src 'self'; frame-ancestors 'self'\"\n        },\n        {\n          \"key\": \"X-Content-Type-Options\",\n          \"value\": \"nosniff\"\n        },\n        {\n          \"key\": \"Referrer-Policy\",\n          \"value\": \"strict-origin-when-cross-origin\"\n        },\n        {\n          \"key\": \"Permissions-Policy\",\n          \"value\": \"camera=(), microphone=(), geolocation=()\"\n        }\n      ]\n    }\n  ]\n}"
    },
    {
     "label": "nginx",
     "code": "add_header Content-Security-Policy-Report-Only \"default-src 'self'; frame-ancestors 'self'\" always;\nadd_header X-Content-Type-Options \"nosniff\" always;\nadd_header Referrer-Policy \"strict-origin-when-cross-origin\" always;\nadd_header Permissions-Policy \"camera=(), microphone=(), geolocation=()\" always;"
    },
    {
     "label": "Apache .htaccess",
     "code": "<IfModule mod_headers.c>\n  Header always set Content-Security-Policy-Report-Only \"default-src 'self'; frame-ancestors 'self'\"\n  Header always set X-Content-Type-Options \"nosniff\"\n  Header always set Referrer-Policy \"strict-origin-when-cross-origin\"\n  Header always set Permissions-Policy \"camera=(), microphone=(), geolocation=()\"\n</IfModule>"
    }
   ],
   "verify": "curl -I https://tamara.rocks/ shows each header.",
   "evidence": [
    {
     "k": "header",
     "a": "content-security-policy",
     "b": "not sent",
     "c": "https://www.tamara.rocks/"
    },
    {
     "k": "header",
     "a": "x-content-type-options",
     "b": "not sent",
     "c": "https://www.tamara.rocks/"
    },
    {
     "k": "header",
     "a": "referrer-policy",
     "b": "not sent",
     "c": "https://www.tamara.rocks/"
    },
    {
     "k": "header",
     "a": "permissions-policy",
     "b": "not sent",
     "c": "https://www.tamara.rocks/"
    }
   ],
   "recheck": {
    "state": "observed",
    "text": "Run the check again to update this finding: pnpm check --site tamara.rocks --site nosastra.co --site welcomebook.eu --site vibeordev.com --out <guide folder>"
   },
   "engine": "engine 0.1.0, rules 2026-11-08"
  },
  {
   "id": "security-headers-missing.vibeordev-com",
   "rule": "security-headers-missing",
   "site": "vibeordev.com",
   "state": "observed",
   "title": "4 security headers are missing",
   "sentence": "The site does not send content-security-policy, x-content-type-options, referrer-policy and permissions-policy. These headers limit what injected code and other sites can do with your pages.",
   "why": "These are hygiene notes, not legal findings. Start the Content Security Policy in report-only mode and tighten it once nothing breaks.",
   "area": "Security and hosting",
   "topic": "hosting",
   "rank": 580,
   "who": "Your developer",
   "time": "30 minutes",
   "claims": [],
   "question": null,
   "fix": [
    {
     "label": "vercel.json",
     "code": "{\n  \"headers\": [\n    {\n      \"source\": \"/(.*)\",\n      \"headers\": [\n        {\n          \"key\": \"Content-Security-Policy-Report-Only\",\n          \"value\": \"default-src 'self'; frame-ancestors 'self'\"\n        },\n        {\n          \"key\": \"X-Content-Type-Options\",\n          \"value\": \"nosniff\"\n        },\n        {\n          \"key\": \"Referrer-Policy\",\n          \"value\": \"strict-origin-when-cross-origin\"\n        },\n        {\n          \"key\": \"Permissions-Policy\",\n          \"value\": \"camera=(), microphone=(), geolocation=()\"\n        }\n      ]\n    }\n  ]\n}"
    },
    {
     "label": "nginx",
     "code": "add_header Content-Security-Policy-Report-Only \"default-src 'self'; frame-ancestors 'self'\" always;\nadd_header X-Content-Type-Options \"nosniff\" always;\nadd_header Referrer-Policy \"strict-origin-when-cross-origin\" always;\nadd_header Permissions-Policy \"camera=(), microphone=(), geolocation=()\" always;"
    },
    {
     "label": "Apache .htaccess",
     "code": "<IfModule mod_headers.c>\n  Header always set Content-Security-Policy-Report-Only \"default-src 'self'; frame-ancestors 'self'\"\n  Header always set X-Content-Type-Options \"nosniff\"\n  Header always set Referrer-Policy \"strict-origin-when-cross-origin\"\n  Header always set Permissions-Policy \"camera=(), microphone=(), geolocation=()\"\n</IfModule>"
    }
   ],
   "verify": "curl -I https://vibeordev.com/ shows each header.",
   "evidence": [
    {
     "k": "header",
     "a": "content-security-policy",
     "b": "not sent",
     "c": "https://www.vibeordev.com/"
    },
    {
     "k": "header",
     "a": "x-content-type-options",
     "b": "not sent",
     "c": "https://www.vibeordev.com/"
    },
    {
     "k": "header",
     "a": "referrer-policy",
     "b": "not sent",
     "c": "https://www.vibeordev.com/"
    },
    {
     "k": "header",
     "a": "permissions-policy",
     "b": "not sent",
     "c": "https://www.vibeordev.com/"
    }
   ],
   "recheck": {
    "state": "observed",
    "text": "Run the check again to update this finding: pnpm check --site tamara.rocks --site nosastra.co --site welcomebook.eu --site vibeordev.com --out <guide folder>"
   },
   "engine": "engine 0.1.0, rules 2026-11-08"
  },
  {
   "id": "security-headers-missing.welcomebook-eu",
   "rule": "security-headers-missing",
   "site": "welcomebook.eu",
   "state": "observed",
   "title": "4 security headers are missing",
   "sentence": "The site does not send content-security-policy, x-content-type-options, referrer-policy and permissions-policy. These headers limit what injected code and other sites can do with your pages.",
   "why": "These are hygiene notes, not legal findings. Start the Content Security Policy in report-only mode and tighten it once nothing breaks.",
   "area": "Security and hosting",
   "topic": "hosting",
   "rank": 580,
   "who": "Your developer",
   "time": "30 minutes",
   "claims": [],
   "question": null,
   "fix": [
    {
     "label": "vercel.json",
     "code": "{\n  \"headers\": [\n    {\n      \"source\": \"/(.*)\",\n      \"headers\": [\n        {\n          \"key\": \"Content-Security-Policy-Report-Only\",\n          \"value\": \"default-src 'self'; frame-ancestors 'self'\"\n        },\n        {\n          \"key\": \"X-Content-Type-Options\",\n          \"value\": \"nosniff\"\n        },\n        {\n          \"key\": \"Referrer-Policy\",\n          \"value\": \"strict-origin-when-cross-origin\"\n        },\n        {\n          \"key\": \"Permissions-Policy\",\n          \"value\": \"camera=(), microphone=(), geolocation=()\"\n        }\n      ]\n    }\n  ]\n}"
    },
    {
     "label": "nginx",
     "code": "add_header Content-Security-Policy-Report-Only \"default-src 'self'; frame-ancestors 'self'\" always;\nadd_header X-Content-Type-Options \"nosniff\" always;\nadd_header Referrer-Policy \"strict-origin-when-cross-origin\" always;\nadd_header Permissions-Policy \"camera=(), microphone=(), geolocation=()\" always;"
    },
    {
     "label": "Apache .htaccess",
     "code": "<IfModule mod_headers.c>\n  Header always set Content-Security-Policy-Report-Only \"default-src 'self'; frame-ancestors 'self'\"\n  Header always set X-Content-Type-Options \"nosniff\"\n  Header always set Referrer-Policy \"strict-origin-when-cross-origin\"\n  Header always set Permissions-Policy \"camera=(), microphone=(), geolocation=()\"\n</IfModule>"
    }
   ],
   "verify": "curl -I https://welcomebook.eu/ shows each header.",
   "evidence": [
    {
     "k": "header",
     "a": "content-security-policy",
     "b": "not sent",
     "c": "https://www.welcomebook.eu/"
    },
    {
     "k": "header",
     "a": "x-content-type-options",
     "b": "not sent",
     "c": "https://www.welcomebook.eu/"
    },
    {
     "k": "header",
     "a": "referrer-policy",
     "b": "not sent",
     "c": "https://www.welcomebook.eu/"
    },
    {
     "k": "header",
     "a": "permissions-policy",
     "b": "not sent",
     "c": "https://www.welcomebook.eu/"
    }
   ],
   "recheck": {
    "state": "observed",
    "text": "Run the check again to update this finding: pnpm check --site tamara.rocks --site nosastra.co --site welcomebook.eu --site vibeordev.com --out <guide folder>"
   },
   "engine": "engine 0.1.0, rules 2026-11-08"
  }
 ],
 "consent": {
  "site": "tamara.rocks",
  "panes": [
   {
    "id": "A",
    "label": "No choice yet",
    "sub": "First load, nothing pressed",
    "note": "No banner appeared. 2 more items are findings in the report. 3 items need your answer or a specialist. Run from US, outside the EU.",
    "requests": [
     [
      "www.tamara.rocks",
      "first party, 8 requests",
      "ok"
     ],
     [
      "fonts.googleapis.com",
      "Google Fonts, fonts",
      "bad"
     ],
     [
      "cdn.simpleicons.org",
      "unidentified third party",
      "check"
     ],
     [
      "fonts.gstatic.com",
      "Google Fonts, fonts",
      "bad"
     ],
     [
      "www.tamara.rocks/_vercel/insights/script.js",
      "Vercel Web Analytics, analytics",
      "check"
     ],
     [
      "www.tamara.rocks/_vercel/speed-insights/script.js",
      "Vercel Speed Insights, monitoring",
      "ok"
     ]
    ],
    "storage": [
     [
      "cookie, 1st party",
      "tamara_rocks_visitor (12 months)",
      "check"
     ]
    ]
   }
  ]
 },
 "consentBySite": {
  "tamara.rocks": {
   "site": "tamara.rocks",
   "panes": [
    {
     "id": "A",
     "label": "No choice yet",
     "sub": "First load, nothing pressed",
     "note": "No banner appeared. 2 more items are findings in the report. 3 items need your answer or a specialist. Run from US, outside the EU.",
     "requests": [
      [
       "www.tamara.rocks",
       "first party, 8 requests",
       "ok"
      ],
      [
       "fonts.googleapis.com",
       "Google Fonts, fonts",
       "bad"
      ],
      [
       "cdn.simpleicons.org",
       "unidentified third party",
       "check"
      ],
      [
       "fonts.gstatic.com",
       "Google Fonts, fonts",
       "bad"
      ],
      [
       "www.tamara.rocks/_vercel/insights/script.js",
       "Vercel Web Analytics, analytics",
       "check"
      ],
      [
       "www.tamara.rocks/_vercel/speed-insights/script.js",
       "Vercel Speed Insights, monitoring",
       "ok"
      ]
     ],
     "storage": [
      [
       "cookie, 1st party",
       "tamara_rocks_visitor (12 months)",
       "check"
      ]
     ]
    }
   ]
  },
  "nosastra.co": {
   "site": "nosastra.co",
   "panes": [
    {
     "id": "A",
     "label": "No choice yet",
     "sub": "First load, nothing pressed",
     "note": "No banner appeared. 1 more item is a finding in the report. 2 items need your answer or a specialist. Run from US, outside the EU.",
     "requests": [
      [
       "www.nosastra.co",
       "first party, 11 requests",
       "ok"
      ],
      [
       "signal-by-nosastra.vercel.app",
       "unidentified third party",
       "check"
      ],
      [
       "fonts.googleapis.com",
       "Google Fonts, fonts",
       "bad"
      ],
      [
       "www.nosastra.co/_vercel/insights/script.js",
       "Vercel Web Analytics, analytics",
       "check"
      ],
      [
       "www.nosastra.co/_vercel/speed-insights/script.js",
       "Vercel Speed Insights, monitoring",
       "ok"
      ]
     ],
     "storage": []
    }
   ]
  },
  "welcomebook.eu": {
   "site": "welcomebook.eu",
   "panes": [
    {
     "id": "A",
     "label": "No choice yet",
     "sub": "First load, nothing pressed",
     "note": "No banner appeared. 2 more items are findings in the report. 2 items need your answer or a specialist. Run from US, outside the EU.",
     "requests": [
      [
       "www.welcomebook.eu",
       "first party, 13 requests",
       "ok"
      ],
      [
       "umami-tamara.vercel.app",
       "unidentified third party, did not load",
       "ok"
      ],
      [
       "xpmetric.com",
       "unidentified third party",
       "check"
      ],
      [
       "fonts.googleapis.com",
       "Google Fonts, fonts",
       "bad"
      ],
      [
       "fonts.gstatic.com",
       "Google Fonts, fonts",
       "bad"
      ]
     ],
     "storage": [
      [
       "localStorage",
       "landing.lang",
       "check"
      ]
     ]
    }
   ]
  },
  "vibeordev.com": {
   "site": "vibeordev.com",
   "panes": [
    {
     "id": "A",
     "label": "No choice yet",
     "sub": "First load, nothing pressed",
     "note": "No banner appeared. 4 tracker items loaded before any choice. 2 more items are findings in the report. 3 items need your answer or a specialist. Run from US, outside the EU.",
     "requests": [
      [
       "www.vibeordev.com",
       "first party, 6 requests",
       "ok"
      ],
      [
       "fonts.googleapis.com",
       "Google Fonts, fonts",
       "bad"
      ],
      [
       "www.googletagmanager.com",
       "Google tag (gtag.js), analytics",
       "bad"
      ],
      [
       "sgvzghfntliuafzfndes.supabase.co",
       "unidentified third party",
       "check"
      ],
      [
       "fonts.gstatic.com",
       "Google Fonts, fonts",
       "bad"
      ],
      [
       "www.google-analytics.com",
       "Google Analytics, analytics",
       "bad"
      ],
      [
       "www.vibeordev.com/_vercel/insights/script.js",
       "Vercel Web Analytics, analytics",
       "check"
      ],
      [
       "www.vibeordev.com/_vercel/speed-insights/script.js",
       "Vercel Speed Insights, monitoring",
       "ok"
      ]
     ],
     "storage": [
      [
       "cookie, 1st party",
       "_ga (13 months)",
       "bad"
      ],
      [
       "cookie, 1st party",
       "_ga_27YQEFBZD8 (13 months)",
       "bad"
      ],
      [
       "localStorage",
       "vctd:leaderboard:v3",
       "check"
      ]
     ]
    }
   ]
  }
 },
 "dns": [
  {
   "domain": "tamara.rocks",
   "sends": "unclear (no MX)",
   "rows": [
    {
     "type": "MX",
     "name": "tamara.rocks",
     "now": "none",
     "next": "0 .",
     "note": "No mail host. If this domain takes no mail, add a null MX.",
     "state": "warn"
    },
    {
     "type": "SPF",
     "name": "tamara.rocks",
     "now": "none",
     "next": "v=spf1 -all",
     "note": "If nothing sends as this domain, use v=spf1 -all. If a tool sends as it, list that tool instead. Check before you add it.",
     "state": "warn"
    },
    {
     "type": "DMARC",
     "name": "_dmarc.tamara.rocks",
     "now": "none",
     "next": "v=DMARC1; p=none; rua=mailto:dmarc@tamara.rocks;",
     "note": "Start at p=none and read the reports for a few weeks.",
     "state": "add"
    },
    {
     "type": "Wildcard",
     "name": "*.tamara.rocks",
     "now": "Random names resolve",
     "next": "",
     "note": "Check preview, app and mail subdomains before you lock this domain down.",
     "state": "warn"
    }
   ]
  },
  {
   "domain": "nosastra.co",
   "sends": "mail (MX found)",
   "rows": [
    {
     "type": "MX",
     "name": "nosastra.co",
     "now": "10 mx.zoho.eu, 20 mx2.zoho.eu, 50 mx3.zoho.eu",
     "next": "",
     "note": "These hosts receive mail for the domain.",
     "state": "ok"
    },
    {
     "type": "SPF",
     "name": "nosastra.co",
     "now": "v=spf1 include:zohomail.eu include:eu.zcsend.net ~all",
     "next": "",
     "note": "3 of 10 lookups used.",
     "state": "ok"
    },
    {
     "type": "DMARC",
     "name": "_dmarc.nosastra.co",
     "now": "v=DMARC1; p=none; rua=mailto:hello@nosastra.co; ruf=mailto:hello@nosastra.co; sp=none; adkim=r; aspf=r; pct=100",
     "next": "v=DMARC1; p=quarantine; rua=mailto:hello@nosastra.co; ruf=mailto:hello@nosastra.co; sp=none; adkim=r; aspf=r; pct=100;",
     "note": "p=none only asks for reports. When the reports show only your own senders, move to quarantine. Only p changes.",
     "state": "change"
    },
    {
     "type": "DKIM",
     "name": "<selector>._domainkey.nosastra.co",
     "now": "Key at zoho, resend",
     "next": "",
     "note": "A signing key is published.",
     "state": "ok"
    },
    {
     "type": "MTA-STS",
     "name": "_mta-sts.nosastra.co",
     "now": "none",
     "next": "",
     "note": "Optional. Tells senders to use TLS when delivering to you.",
     "state": "warn"
    },
    {
     "type": "TLS-RPT",
     "name": "_smtp._tls.nosastra.co",
     "now": "none",
     "next": "v=TLSRPTv1; rua=mailto:tls-reports@nosastra.co",
     "note": "Optional. Sends you reports about TLS delivery problems.",
     "state": "warn"
    },
    {
     "type": "Wildcard",
     "name": "*.nosastra.co",
     "now": "Random names resolve",
     "next": "",
     "note": "Check preview, app and mail subdomains before you lock this domain down.",
     "state": "warn"
    }
   ]
  },
  {
   "domain": "welcomebook.eu",
   "sends": "unclear (no MX)",
   "rows": [
    {
     "type": "MX",
     "name": "welcomebook.eu",
     "now": "none",
     "next": "0 .",
     "note": "No mail host. If this domain takes no mail, add a null MX.",
     "state": "warn"
    },
    {
     "type": "SPF",
     "name": "welcomebook.eu",
     "now": "none",
     "next": "v=spf1 -all",
     "note": "If nothing sends as this domain, use v=spf1 -all. If a tool sends as it, list that tool instead. Check before you add it.",
     "state": "warn"
    },
    {
     "type": "DMARC",
     "name": "_dmarc.welcomebook.eu",
     "now": "none",
     "next": "v=DMARC1; p=none; rua=mailto:dmarc@welcomebook.eu;",
     "note": "Start at p=none and read the reports for a few weeks.",
     "state": "add"
    },
    {
     "type": "Wildcard",
     "name": "*.welcomebook.eu",
     "now": "Random names resolve",
     "next": "",
     "note": "Check preview, app and mail subdomains before you lock this domain down.",
     "state": "warn"
    }
   ]
  },
  {
   "domain": "vibeordev.com",
   "sends": "unclear (no MX)",
   "rows": [
    {
     "type": "MX",
     "name": "vibeordev.com",
     "now": "none",
     "next": "0 .",
     "note": "No mail host. If this domain takes no mail, add a null MX.",
     "state": "warn"
    },
    {
     "type": "SPF",
     "name": "vibeordev.com",
     "now": "none",
     "next": "v=spf1 -all",
     "note": "If nothing sends as this domain, use v=spf1 -all. If a tool sends as it, list that tool instead. Check before you add it.",
     "state": "warn"
    },
    {
     "type": "DMARC",
     "name": "_dmarc.vibeordev.com",
     "now": "none",
     "next": "v=DMARC1; p=none; rua=mailto:dmarc@vibeordev.com;",
     "note": "Start at p=none and read the reports for a few weeks.",
     "state": "add"
    },
    {
     "type": "Wildcard",
     "name": "*.vibeordev.com",
     "now": "Random names resolve",
     "next": "",
     "note": "Check preview, app and mail subdomains before you lock this domain down.",
     "state": "warn"
    }
   ]
  }
 ]
};
