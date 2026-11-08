// Sort My Sites: questionnaire, agent commands and agent checklists. No sample data.
// The sample report shows what a run looks like. It is not a real site.
export default {
  sample: true,
  run: { engine: "rules 2026-11-07" },
  sites: [], diff: { fixed: [], added: [] }, findings: [], consent: { site: "", panes: [] }, dns: [],

  questionnaire: [
    { id: "site", name: "Your sites", icon: "language", gate: null, qs: [
      { id: "Q-178", t: "What runs before a visitor chooses anything?", type: "text", topic: "analytics" },
      { id: "Q-182", t: "Are optional choices off until someone ticks them?", type: "yn", topic: "analytics" },
      { id: "Q-184", t: "Can a visitor reject on the first screen as easily as accept?", type: "yn", topic: "analytics" },
      { id: "Q-189", t: "Does tracking really stop after someone withdraws?", type: "yn", topic: "analytics" },
      { id: "Q-031", t: "For each tool you keep, which thing the visitor asked for needs it?", type: "text", topic: "analytics" },
      { id: "Q-049", t: "Is each site commercial? Paid services, payments, or paid work on it.", type: "yn", topic: "hosting" }
    ] },
    { id: "vendors", name: "Your tools and vendors", icon: "hub", gate: null, qs: [
      { id: "Q-083", t: "For each tool, who decides what the data is for?", type: "text", topic: "clients" },
      { id: "Q-086", t: "Does each tool's DPA cover your exact plan, and did you accept it?", type: "yn", topic: "hosting" },
      { id: "Q-108", t: "Is each US vendor's exact company on the Data Privacy Framework list?", type: "yn", topic: "hosting" },
      { id: "Q-075", t: "Who receives data, and from which countries can they reach it?", type: "text", topic: "clients" }
    ] },
    { id: "email", name: "Email", icon: "mail", gate: { t: "Do you send any email from your domains, beyond one-to-one replies?" }, qs: [
      { id: "Q-213", t: "Is each email you send a service message, a promotion, or a mix?", type: "text", topic: "campaigns" },
      { id: "Q-214", t: "Did you get a recorded yes before sending any promotion?", type: "yn", topic: "campaigns" },
      { id: "Q-199", t: "Are your recipients companies, obrtnici, named employees or private people?", type: "text", topic: "campaigns" },
      { id: "Q-062", t: "Does an unsubscribe reach every list and tool?", type: "yn", topic: "campaigns" }
    ] },
    { id: "selling", name: "Selling online", icon: "shopping_bag", gate: { t: "Do you take orders or payments online?" }, qs: [
      { id: "Q-161", t: "Do any of your buyers buy as private people?", type: "yn", topic: "saas" },
      { id: "Q-216", t: "Is the seller an obrt, a d.o.o., or something else?", type: "text", topic: "saas" },
      { id: "Q-220", t: "Does your site show prices or take consumer orders?", type: "yn", topic: "saas" },
      { id: "Q-191", t: "Do consumers in Croatia sign up or buy through your site or app?", type: "yn", topic: "saas" }
    ] },
    { id: "tax", name: "Tax and invoicing", icon: "receipt_long", gate: null, qs: [
      { id: "Q-148", t: "Are you inside the EUR 60,000 small-taxpayer exemption, and do you hold a PDV ID?", type: "text", topic: "tax" },
      { id: "Q-150", t: "Are you set up to receive eRačun now, and to issue it from 1 January 2027?", type: "yn", topic: "tax" },
      { id: "Q-139", t: "What does each sale contain: automated software, hand-built work, or a mix?", type: "text", topic: "tax" }
    ] },
    { id: "ai", name: "AI", icon: "forum", gate: { t: "Do you build, sell or use AI tools in your work?" }, qs: [
      { id: "Q-001", t: "Which AI systems and models do you build on or use?", type: "text", topic: "ai-product" },
      { id: "Q-005", t: "When did each version first go live?", type: "text", topic: "ai-product" },
      { id: "Q-131", t: "Could prompts, mail or uploads hold health, beliefs or criminal-record data?", type: "yn", topic: "ai-inbox" }
    ] }
  ],

  agentCmds: [
    { cmd: "pnpm check --site tamara.rocks --site nosastra.co --site welcomebook.eu --site vibeordev.com", what: "Run every check on the domains you name. Writes scan-data.js into the guide." },
    { cmd: "nslookup -type=TXT tamara.rocks", what: "Shows the SPF record and any other TXT records on the domain." },
    { cmd: "nslookup -type=TXT _dmarc.tamara.rocks", what: "Shows the DMARC policy, including p and sp." },
    { cmd: "npx serve .", what: "Serves this guide locally, so your agent can read the pages too." }
  ],
  mcpTools: [
    ["list_questions", "Open questions, grouped, with the claims behind each."],
    ["answer_question", "Write one answer to answers.json, marked as agent-supplied."],
    ["run_check", "Run the checker on a domain you already named."],
    ["get_report", "Read report.json, or one finding with its evidence."],
    ["get_rule", "Fetch one claim with its source and locator."],
    ["list_use_cases", "The 12 project guides and the questions that decide them."]
  ],
  agentRules: ["Works only on domains you name.", "Never submits forms, logs in or probes ports.", "Never says a site is compliant.", "Marks its answers as agent-supplied so you can confirm them.", "Prepares plan changes, DPA acceptance and DNS edits. You press the button."],

  agentLists: {
    analytics: ["Remove dead tags that return 404. Verify: the host is gone from Third parties.", "Remove analytics nobody reads. Verify: no analytics request on first load.", "Self-host fonts and icons. Verify: no font or icon CDN in the network log.", "Strip emails and form values from analytics events. Verify: inspect payloads in the network log.", "Gate any kept tool behind Accept. Verify: the four-state check shows nothing before a choice."],
    storage: ["Grep for localStorage, sessionStorage, indexedDB and document.cookie. List each key. Verify: matches DevTools after a full play-through.", "Remove any write of an email address to storage. Verify: no value matches /@/.", "Gate keys used only for stats. Verify: absent with no choice and after Reject.", "Add a \"remember my name\" toggle, off by default. Verify: no name key with it off.", "Make the waitlist box unticked and optional. Verify: the result renders with it empty."],
    signups: ["Add a one-line notice and privacy link above the submit button. Verify: visible without scrolling past the button.", "Add one unticked checkbox per marketing purpose. Verify: no checked attribute on load.", "Store each choice with a UTC timestamp and wording version. Verify: one test row with all three.", "Keep form values out of analytics. Verify: the test address only appears in your own endpoint's request.", "Strip promotion from service templates. Verify: each template is marked service."],
    referral: ["Find every page that loads the script. Verify: a list of files and pages.", "Load it only after Accept. Stop on withdraw. Verify: zero requests in states A, B and D.", "Send the referrer origin and path only. Verify: capture one request and list its fields.", "No storage and no device reads. Verify: grep for screen., navigator.language and storage calls.", "Send with credentials: 'omit'. Verify: no cookie header."],
    inbox: ["Record current MX, SPF and DMARC with TTLs before any change.", "Probe two random labels for a wildcard. If both resolve, stop before proposing a null MX.", "Count SPF lookups. Flag more than 10.", "Flag a sending domain with no MX and no Reply-To route.", "Write a rollback note, then diff the records after the owner applies the change."],
    campaigns: ["List every form that collects an email. Verify: a grep finds no form outside the list.", "No marketing box pre-checked. Verify: a test asserts the default stores no purpose.", "Store a consent record per contact. Verify: a test row holds the exact text version.", "Refuse to queue contacts with an unknown route. Verify: a unit test returns zero recipients.", "Add sender name, reply address and a free unsubscribe to the template. Verify: all present in a render."],
    clients: ["Create a service inventory per client. Verify: every observed third party appears.", "Add SUBPROCESSORS.md to each client repo. Verify: matches the vendor register.", "List every form endpoint. Verify: none missing from the inventory.", "Keep secrets in environment variables. Verify: a secret scan finds none.", "Use synthetic data in fixtures and seeds. Verify: no real emails or phone numbers."],
    saas: ["Add a required buyerCapacity field: business or private. Verify: a test order stores it.", "Build the trader-information page and link it in every footer. Verify: every footer link returns 200.", "Show \"per year\", the VAT note and renewal terms beside the price. Verify: grep each price.", "Add a dated price-list page. Verify: prices match the owner's source file.", "Add the Croatian pre-contract page and model form. Verify: lang=\"hr\" and the form link returns 200."],
    "ai-product": ["Draft the system card from the code. Verify: models, vendors and prompts listed with file paths.", "Add the AI disclosure to every chat surface. Verify: a test sees it before the first reply.", "List every server-side model or vector call. Verify: each appears in the vendor register.", "Keep prompts and documents out of analytics and error logs. Verify: a forced failure leaks no text.", "Scope retrieval by tenant. Verify: two synthetic tenants cannot see each other's marker."],
    "ai-inbox": ["Confirm the baseline file exists. Verify: path and date.", "List the scopes the credential grants. Verify: from the provider's token info.", "Build the broker with create_draft and apply_label only. Verify: send, forward and delete are refused.", "Redact signatures, phones, IBANs and quoted history before the model. Verify: diff against expected.", "Constrain output to {label, draft_body}. Verify: adversarial mail produces no extra field."],
    hosting: ["Build hosting-inventory.md from project settings. Verify: every live domain once.", "Set the function region near the database, if the owner agrees. Verify: the owner checks the deployment.", "Add a scheduled pg_dump plus restic backup with secrets from CI. Verify: a new snapshot appears.", "Add a failure alert to the job. Verify: a forced failure sends it.", "Script a test restore into a scratch project. Verify: the owner records the time it took."],
    tax: ["Add buyerCapacity, buyerCountry, buyerTaxId and paymentMethod to orders. Verify: a test order stores them.", "Store the VIES result for EU VAT numbers. Verify: one valid and one invalid test.", "Read the VAT note from one config value. Verify: changing it changes site and invoice.", "Number invoices in one unbroken sequence. Verify: ten test invoices, no gaps.", "Report yearly totals toward EUR 60,000 and EUR 10,000. Verify: matches invoice records."]
  }
};
