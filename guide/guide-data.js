// Sort My Sites guide content. Sources checked 7 Nov 2026. Not legal advice.
export default {
  checked: "7 November 2026",
  groups: [
    { id: "site", name: "Your websites", ids: ["analytics", "storage", "signups", "referral"] },
    { id: "mail", name: "Email", ids: ["inbox", "campaigns"] },
    { id: "work", name: "Clients and selling", ids: ["clients", "saas"] },
    { id: "ai", name: "AI", ids: ["ai-product", "ai-inbox"] },
    { id: "biz", name: "Running the business", ids: ["hosting", "tax"] }
  ],

  basics: [
    { n: "1", h: "Two hats", b: "For your own leads, clients and invoices you are the controller. You decide why the data exists. When you host or maintain something that holds a client's customer data, you usually act for the client. That makes you their processor.", hook: "Whose data? Who decides?" },
    { n: "2", h: "Say it where they type", b: "When you collect data, tell the person at that moment. One line next to the form, with a link to the full notice. A notice that first shows up in the confirmation email is late.", hook: "Notice before submit." },
    { n: "3", h: "Marketing email needs a yes first", b: "In Croatia, promotional email to a person needs consent before you send. One narrow exception covers your own past buyers about your own similar products. A free signup is usually not a sale.", hook: "No yes, no newsletter." },
    { n: "4", h: "No cookies is not the test", b: "The rule covers storing anything on a visitor's device and reading from it. localStorage counts. A script that tells the browser to send data can count. If it is not strictly needed for what the visitor asked for, it waits for consent.", hook: "Stored or read? Needed?" },
    { n: "5", h: "A DPA has to bind your plan", b: "Every tool that handles personal data for you needs a processing agreement. Check it covers your exact plan. Some public DPAs cover paid plans only. Some do nothing until you accept them in the dashboard.", hook: "Right plan, accepted, dated." },
    { n: "6", h: "Location is not the whole story", b: "An EU data centre does not settle GDPR. What counts is who can reach the data, under which contract, and where their support staff and sub-processors sit.", hook: "Who can reach it?" },
    { n: "7", h: "Show who you are", b: "Every site that offers a service shows your business name, seat, email, registration and VAT details. One click from every page.", hook: "Name, seat, email, numbers." },
    { n: "8", h: "Removing beats assessing", b: "Every script, font and counter is either something you delete or something you have to assess. Deleting is almost always the smaller job.", hook: "Delete what nobody reads." }
  ],

  dates: [
    { d: "28 Jun 2025", h: "Accessibility act applies", b: "Croatia's accessibility law (NN 89/2025). Consumer e-commerce can be covered. Microenterprises that provide services can be exempt.", tag: "Accessibility" },
    { d: "1 Jan 2026", h: "eRačun starts", b: "VAT-registered businesses issue and receive e-invoices. Businesses outside the VAT register start receiving them.", tag: "Tax" },
    { d: "Jun 2026", h: "Online withdrawal function", b: "Consumer contracts made online need a withdrawal function. Labelled \"raskid ugovora\", with a confirm step and a dated acknowledgement.", tag: "Selling" },
    { d: "2 Aug 2026", h: "AI chat must say it is AI", b: "AI Act transparency rules apply. A chat that talks to people makes clear it is AI by the first interaction.", tag: "AI" },
    { d: "17 Nov 2026", h: "Price list on your website", b: "Traders with a website publish a current price list. Implementing details are still pending.", tag: "Selling" },
    { d: "2 Dec 2026", h: "Mark AI-generated text", b: "Machine-readable marking deadline for text-generating systems already on the market before 2 August 2026.", tag: "AI" },
    { d: "1 Jan 2027", h: "Issue eRačun outside the VAT register", b: "Businesses outside the VAT register start issuing e-invoices to domestic business buyers.", tag: "Tax" },
    { d: "2 Apr 2027", h: "New EU cross-border enforcement rules", b: "Changes how authorities cooperate. It does not change the 72-hour breach rule or the one-month reply clock.", tag: "Privacy" }
  ],

  glossary: [
    { t: "AZOP", d: "Agencija za zaštitu osobnih podataka. Croatia's data protection authority, based in Zagreb." },
    { t: "Controller", d: "Whoever decides why and how personal data is used." },
    { t: "Processor", d: "Whoever handles personal data on the controller's behalf and on its instructions." },
    { t: "Sub-processor", d: "A vendor your processor work relies on. Your client has to authorise it." },
    { t: "DPA", d: "Data processing agreement. The written contract between a controller and a processor (GDPR Art. 28)." },
    { t: "DPF", d: "EU-US Data Privacy Framework. Covers only US companies actively on the official list." },
    { t: "SCCs", d: "Standard Contractual Clauses. A transfer route for vendors outside the EEA. Pick the right module." },
    { t: "ZEK", d: "Zakon o elektroničkim komunikacijama. Electronic Communications Act. Art. 43(4) covers device storage. Art. 50 covers marketing email." },
    { t: "ZZP", d: "Zakon o zaštiti potrošača. Consumer Protection Act." },
    { t: "ZET", d: "Zakon o elektroničkoj trgovini. Electronic Commerce Act. Art. 6 lists what your site must say about you." },
    { t: "Obrt", d: "Sole trade. An obrtnik is a natural person, so the legal-person email exception does not cover them." },
    { t: "d.o.o.", d: "Limited company. A legal person, so never a consumer." },
    { t: "PDV", d: "Porez na dodanu vrijednost. VAT. A PDV ID is separate from being in the VAT register." },
    { t: "eRačun", d: "Croatian e-invoice under the Fiscalisation Act (NN 89/2025)." },
    { t: "Potrošač", d: "Consumer. A natural person buying outside their trade or profession." },
    { t: "Raskid ugovora", d: "Withdrawal from the contract. The label the online withdrawal button needs." },
    { t: "SPF, DKIM, DMARC", d: "DNS records that prove mail sent as your domain is really yours. Each sending tool needs to fit them." },
    { t: "Null MX", d: "A DNS record (0 .) that says a domain receives no mail." },
    { t: "Strictly necessary", d: "Needed for something the visitor asked for. Your statistics are not in this group." },
    { t: "Provider (AI Act)", d: "Whoever supplies an AI system under its own name. A wrapper on someone else's model can still make you the provider." },
    { t: "Deployer (AI Act)", d: "Whoever uses an AI system at work under its own authority." },
    { t: "Microenterprise", d: "Fewer than 10 staff and at most EUR 2 million revenue or balance sheet." }
  ],

  topics: {
    "analytics": {
      title: "Analytics and tracking", tint: "#E9F7F0", accent: "#3BAD82",
      line: "Every script, font and counter on your sites. Keep, remove, or ask first.",
      minute: "Every script, counter, font and form service on your site is either something you remove or something you assess. Removing is usually the smaller job. The rule covers storing information on a device and reading from it. In Croatia that is ZEK Art. 43(4), and there is no general analytics exemption. So anything that stores or reads on the device and is not strictly needed for what the visitor asked for waits for consent. That means a banner with a Reject button as easy as Accept, and a notice that matches what the live site does.",
      remember: ["\"Cookieless\" does not mean no consent.", "Nothing optional loads before a choice.", "Reject is one click, same as Accept."],
      facts: [
        { f: "What loads before the visitor chooses anything?", w: "If nothing optional loads, you may not need a banner at all." },
        { f: "Does each tool store or read anything on the device?", w: "Cookies, localStorage, sessionStorage and reading screen size or language all count." },
        { f: "What does each script really do?", w: "Judge by the network log, not the vendor's label." },
        { f: "Does your notice match the live site?", w: "\"No cookies\" next to a Google Fonts request does not match." },
        { f: "Do requests really stop after Reject?", w: "A saved \"rejected\" flag proves nothing. The network log does." }
      ],
      steps: [
        { t: "List every tool on each page", d: "Scripts, fonts, icons, pixels, iframes, counters and form destinations. Note who receives data and why you have it.", v: "Compare your list with the network panel in a private window." },
        { t: "Remove dead tags", d: "Delete any tag whose script returns 404 or points at a project you no longer run. The browser still sends the visitor's IP on every load.", v: "Reload. The request is gone from the network log." },
        { t: "Remove GA4 if you do not read it", d: "Delete the tag. If you keep it, load it only after Accept.", v: "On first load, no request to the Google tag host and no _ga cookie." },
        { t: "Remove the visitor counter", d: "A visit total is not something the visitor asked for. Drop it, or at least the returning-visitor cookie.", v: "No counter cookie or request after first load." },
        { t: "Self-host fonts and icons", d: "Download the files and serve them from your own domain.", v: "No request to a font or icon CDN in the network log." },
        { t: "Decide on each remaining tool", d: "If nobody reads the numbers, remove it. If you keep it, it goes behind consent unless a written assessment says otherwise.", v: "One line per tool: kept, why, and under which choice." },
        { t: "Build the banner right", d: "Accept and Reject on the first layer, same size and weight. No pre-ticked boxes. A link on every page to change your mind.", v: "Test four clean sessions: no choice, Reject, Accept, then withdraw and reload." },
        { t: "Update the notice", d: "List every tool that stays, what it does, who receives data and for how long.", v: "Read the notice next to the network log. Every row matches." }
      ],
      traps: ["\"We use no cookies\" while the page writes to localStorage.", "Consent Mode settings that still send requests before a choice.", "Hidden sections that still fetch images from third parties.", "\"Legitimate interest\" used to skip device-access consent. It does not replace it."],
      deeper: [
        { h: "The core rule", b: "Storing information on a device, or reading what is already there, needs consent after clear information. The information does not have to be personal data. Two exceptions: access only to transmit a communication, and access strictly necessary for a service the visitor asked for.", src: "ePrivacy Directive Art. 5(3). ZEK NN 76/2022 Art. 43(4). CJEU Planet49 C-673/17, paras 68 to 71." },
        { h: "Analytics is not strictly necessary by default", b: "Page statistics serve you, not the visitor. No Croatian analytics exemption was found. A server-side count on data you already hold may avoid new device access, but still needs a GDPR look.", src: "EDPB Guidelines 2/2023. AZOP guidance." },
        { h: "Fonts and icon CDNs", b: "Every CDN request sends the visitor's IP to someone else. That is at least a recipient to list in your notice, and possibly a transfer. Self-hosting removes the question.", src: "GDPR Arts. 13 and 44." },
        { h: "Email pixels", b: "A tracking pixel in an email reads from the device when the message opens. Treat it like a tracking script.", src: "EDPB Guidelines 2/2023." }
      ],
      ask: { counsel: ["If I keep a cookieless analytics tool without consent, is it in scope of ZEK Art. 43(4) for my exact setup?", "Is a third-party font CDN a device-access question or only a disclosure and transfer question?", "Which consent records should I keep, and for how long?"], accountant: [] }
    },

    "storage": {
      title: "Quizzes, waitlists and browser storage", tint: "#FFF3D6", accent: "#E07B3A",
      line: "localStorage, leaderboards and launch lists.",
      minute: "Writing anything to localStorage is storage on the visitor's device. It needs consent unless it is strictly needed for something the visitor asked for. Game state the quiz needs may pass. Counters kept for you, and a second copy of an email already on your server, usually do not. A waitlist email that announces a launch is marketing, so it needs its own unticked opt-in. A public leaderboard publishes personal data when a name can identify someone.",
      remember: ["localStorage is storage. It counts.", "Show the result first. Ask for email after.", "A waitlist is a marketing list."],
      facts: [
        { f: "Which keys does the code write or read?", w: "Each key gets its own answer. Quiz progress and a copy of an email are different." },
        { f: "Does a result computed in the browser leave the device?", w: "Kept local, it is local use. Sent to analytics or a database, it needs its own assessment." },
        { f: "Is the leaderboard public, and can a name identify someone?", w: "Then you are publishing personal data. Say so where they type." },
        { f: "Might children play?", w: "Consent rules for children have an age limit. Check it before you rely on consent." }
      ],
      steps: [
        { t: "List every key and every network call", d: "Play the quiz, join the leaderboard and sign up in a fresh browser profile. Write down each key, what it holds and every request that leaves.", v: "Compare with the Application tab in developer tools. Repeat in a new profile." },
        { t: "Stop writing the email to the browser", d: "If the server already stores the signup, the local copy is not needed.", v: "Submit a test signup and search localStorage for @. Nothing." },
        { t: "Delete keys that only feed your stats", d: "Counters, flags and history kept only for your numbers go.", v: "After a quiz in a fresh profile, only game state and chosen settings remain." },
        { t: "Give the rest a limit", d: "In-progress state goes in sessionStorage, or gets a timestamp and a purge. \"Remember my name\" sits behind a toggle.", v: "Close and reopen the browser. Session keys are gone." },
        { t: "Add the notice where people type", d: "Next to the name field: what shows publicly, for how long, how to remove it. Next to the waitlist field: what you send and who sends it.", v: "Read the form on a phone without scrolling away from it." },
        { t: "Separate the waitlist opt-in", d: "Its own unticked box, one purpose. Never gate the quiz result behind it.", v: "Finish the quiz with the box empty. The result still shows." },
        { t: "Plan removal", d: "A way to take a leaderboard entry down and delete a waitlist address on request.", v: "Remove a test entry end to end." }
      ],
      traps: ["\"Enter your email to see your result.\" That ties the quiz to marketing.", "One box for \"updates and news\". Two purposes, two boxes.", "Leaving necessary keys out of the notice. No banner needed, but explain them.", "Treating a waitlist as a customer list for the customer exception."],
      deeper: [
        { h: "Strictly necessary, key by key", b: "The exemption is judged per key and per purpose. Game state for the quiz the player is playing can qualify. A key that serves the player and you at once needs a closer look.", src: "ZEK Art. 43(4), second sentence. EDPB Guidelines 2/2023." },
        { h: "The hosted database is your processor", b: "Supabase or similar holds the signups for you. Check the DPA covers your plan and accept it.", src: "GDPR Art. 28." },
        { h: "Children", b: "If you rely on consent and children may sign up, a national age limit applies. Croatia sets it at 16 under its GDPR implementing act. Confirm before relying on it.", src: "GDPR Art. 8." }
      ],
      ask: { counsel: ["Does each necessary key pass the strictly-necessary test for my exact quiz?", "Which age rule applies if players come from several countries?"], accountant: [] }
    },

    "signups": {
      title: "Free workshop signups", tint: "#FDE9EE", accent: "#E8637E",
      line: "Collecting emails for a free event, without turning it into a newsletter.",
      minute: "A signup collects personal data, so a short notice goes on the form, before submit. The confirmation, joining link and reminder are service messages. Anything that promotes later workshops, a newsletter or a paid offer is marketing, and in Croatia that needs prior consent. The customer exception probably does not fit a free signup. So ask about future offers with a separate unticked box, record each choice, and decide where the list lives and when you delete it before you open signups.",
      remember: ["Notice under the email field.", "Event mail stays event mail.", "One unticked box per marketing purpose."],
      facts: [
        { f: "What does the form collect and which tools touch it?", w: "An email field alone is a short notice. Analytics or a video embed add lines." },
        { f: "When does the person see the notice?", w: "Next to the form, before submit, is on time." },
        { f: "Is each email service, promotion or a mix?", w: "A confirmation that pitches a paid course is mixed. The pitch brings in marketing rules." },
        { f: "How long do you keep each list?", w: "The event list, the marketing list and the unsubscribe record need separate periods." }
      ],
      steps: [
        { t: "Put a one-line notice under the email field", d: "\"We use your email to send the workshop link and one reminder. See Privacy.\"", v: "Open the page in a private window and read it before submitting." },
        { t: "Collect only what the event needs", d: "Email is usually enough. Make a name optional, or drop it.", v: "Match every field to a purpose in the notice." },
        { t: "Add one unticked box per marketing purpose", d: "\"Email me about future workshops. Unsubscribe any time.\" No \"I agree to the privacy policy\" box.", v: "Submit with every box empty. Signup still works." },
        { t: "Record each choice", d: "Address, each purpose chosen, time in UTC, page, and a version id for the wording shown.", v: "Make a test signup and read the stored row." },
        { t: "Keep service emails clean", d: "No upsell and no \"join our news\" in the confirmation, link or reminder.", v: "Read each template and mark it service, promotion or mixed." },
        { t: "Turn off open and click tracking for event mail", d: "If you want it later, put it behind consent.", v: "In a test message, look for a 1x1 image and rewritten links." },
        { t: "Check the email provider", d: "DPA covers your plan, where data lives, sub-processor list, DPF entry or SCCs for any US path.", v: "Save the DPA version and the date you accepted it." },
        { t: "Set retention", d: "The event list ends shortly after the event. The marketing list lasts while consent stands.", v: "A scheduled deletion job or a dated calendar task exists." }
      ],
      traps: ["Treating a free signup as permission for newsletters.", "A pitch hidden in the joining-link email.", "One blanket re-permission email to an old list. That email can itself be marketing.", "Pre-ticked boxes, or one box covering several purposes."],
      deeper: [
        { h: "What the notice has to cover", b: "Who you are and how to reach you, each purpose and its legal basis, recipients, any transfer outside the EEA, retention, and the person's rights, including withdrawing consent and complaining to AZOP. Layered is fine: key facts at the form, full notice one click away.", src: "GDPR Art. 13. WP260 rev.01 paras 35 to 36." },
        { h: "Free signups and the customer exception", b: "The CJEU in Inteligo Media treated one free account tied to paid content as a sale context. That does not make every free event signup a sale. Default to consent.", src: "ZEK Art. 50(2). CJEU C-654/23, 13 Nov 2025." },
        { h: "What valid consent looks like", b: "Freely given, specific, informed and unambiguous. An active choice. Separate from the event. As easy to withdraw as to give. And you can show it.", src: "GDPR Arts. 4(11) and 7." }
      ],
      ask: { counsel: ["Can a free workshop signup ever count as a sale under ZEK Art. 50(2)?", "For a co-hosted event, are we separate controllers, joint controllers, or controller and processor?"], accountant: ["If the free workshop leads to paid sessions, which invoice and VAT rules apply to the paid part?"] }
    },

    "referral": {
      title: "AI-referral tracking script", tint: "#EEEAFB", accent: "#7B6BD6",
      line: "Counting visits from AI assistants on your sites and client sites.",
      minute: "A script that reads where a visitor came from and tells the browser to send that to a server is likely device access, even if it stores nothing and sends no ID. Measuring AI referrals helps you, not the visitor, so it is not strictly necessary. The smallest safe routes: remove it, or run it only after consent, with a notice that names it and a payload cut to the fewest fields. On a client's site the client decides and you need a written agreement before it goes live.",
      remember: ["Sending counts, even with no storage.", "Smaller payload is better, not exempt.", "On client sites, the client decides."],
      facts: [
        { f: "Does the script store or read anything, even in memory?", w: "A random ID held for one page load is still on the device." },
        { f: "Does the browser compute a result and send it?", w: "A yes or no computed locally and sent out is still access." },
        { f: "Whose site is it on?", w: "On a client site the client is likely the controller. You are likely the processor." }
      ],
      steps: [
        { t: "Decide whether you need the number", d: "If nobody reads the report, remove the script everywhere.", v: "Search the built site for the tag and endpoint host." },
        { t: "Stop it running before a choice", d: "Load it only after Accept for analytics. Reject as easy as Accept.", v: "Load with an AI referrer in four states: none, Reject, Accept, withdrawn. Record requests." },
        { t: "Cut the payload", d: "Referrer origin only, page path without query string, and a site label.", v: "Read the request body in the network log." },
        { t: "Send no ID and read no device properties", d: "No screen size, language or time zone.", v: "Read the script for screen., navigator.language and storage calls." },
        { t: "Send without cookies, to your own domain", d: "credentials: omit. An endpoint on your or the client's domain.", v: "Check the cookie header and destination host." },
        { t: "Keep aggregates, drop the rest", d: "Truncate IPs at ingestion. Store counts per day, path and referrer origin.", v: "Read a day of stored data. No IPs, no full URLs." },
        { t: "Sign terms before it goes on a client site", d: "A short processing agreement and a line for the client's notice.", v: "Signed copy on file per client." }
      ],
      traps: ["\"It sets no cookies, so no banner.\"", "\"We delete IPs on the server.\" The request still carried the address.", "Testing without the referrer. The script may only fire from an AI source."],
      deeper: [
        { h: "Why sending counts", b: "EDPB guidance treats instructing the browser to send information as gaining access to it. Storage and access are separate operations, and either brings a tool into scope.", src: "EDPB Guidelines 2/2023 on Art. 5(3)." },
        { h: "No analytics exemption fits", b: "The checked Croatian sources show no exemption for audience measurement. Referral counting serves the site owner.", src: "ZEK Art. 43(4)." }
      ],
      ask: { counsel: ["Is my cut-down referral script in scope of ZEK Art. 43(4) for my exact payload?", "On a client site, who answers for the banner?"], accountant: [] }
    },

    "inbox": {
      title: "One inbox, several domains", tint: "#E3F4F6", accent: "#1A8A8A",
      line: "Fewer mailboxes, every sender authenticated, unused domains locked.",
      minute: "Most one-person businesses need one real mailbox. Every other address can be an alias that delivers into it. Each tool that sends as your domain is a separate sending identity and needs SPF or its own subdomain, a DKIM key and DMARC. Before migrating, check whether a paid tier at your current host already gives you aliases and extra domains. An upgrade in place avoids a risky MX cutover.",
      remember: ["One mailbox, many aliases.", "Every sending tool fits SPF, DKIM, DMARC.", "Domains that send nothing say so."],
      facts: [
        { f: "Which tools send as each domain?", w: "Each one needs its own SPF entry or subdomain and a DKIM key." },
        { f: "Does each domain send or receive mail at all?", w: "Decides between a mail setup and a non-mail policy." },
        { f: "Are there wildcard DNS records?", w: "A wildcard can swallow mail for subdomains. Check before you change anything." },
        { f: "Who controls DNS and the registrar?", w: "Decides who can make and roll back changes." }
      ],
      steps: [
        { t: "Write an inventory", d: "Each domain, each address (mailbox or alias), each tool that sends as it. No passwords.", v: "Matches the mail host console and each tool's domain settings." },
        { t: "Read one real header from each sender", d: "From, Reply-To, Return-Path, DKIM d=, and Authentication-Results.", v: "dmarc=pass, with DKIM or envelope domain aligned to From." },
        { t: "Check an upgrade in place first", d: "Confirm aliases, extra domains, send-as and IMAP on your current plan.", v: "A dated screenshot of the plan page." },
        { t: "Collapse to one mailbox", d: "hello@ and info@ become aliases. Replies go out from the alias the mail came to.", v: "Write to each alias from outside, reply, check the From." },
        { t: "Give each sending domain a reply route", d: "Reply-To your main mailbox, or MX plus one alias. Root SPF and DMARC at p=none.", v: "Reply to a real confirmation from outside. It lands." },
        { t: "Route DMARC reports to their own alias", d: "rua to dmarc@ with a filter. Drop ruf, it can carry message content.", v: "_dmarc shows the new rua." },
        { t: "Lock domains that send nothing", d: "Null MX 0 . , SPF v=spf1 -all, DMARC p=reject. Check wildcards first.", v: "dig shows all three records." },
        { t: "Tighten DMARC slowly", d: "Read reports for a few weeks, then move from none to quarantine to reject.", v: "Reports show only your own senders passing." }
      ],
      traps: ["Cutting over MX without a rollback plan.", "A sending domain with no MX, so replies vanish.", "Adding a wildcard MX before checking preview subdomains.", "A US sending region treated as where your data lives."],
      deeper: [
        { h: "The law cares about what you send", b: "Marketing to individuals in Croatia needs prior consent. Every promotional email shows the sender and a free way to stop. See the Email campaigns guide.", src: "ZEK Art. 50." },
        { h: "Your mail host is your processor", b: "It stores your clients' messages. You need its DPA for your plan, and a transfer route for any US entity.", src: "GDPR Art. 28. GDPR Chapter V." },
        { h: "Gmail sender rules are vendor rules", b: "Authentication and one-click unsubscribe for bulk senders come from Google's guidelines, not law. Following them keeps you out of spam.", src: "Google email sender guidelines." }
      ],
      ask: { counsel: ["Does each vendor's DPA and transfer route hold for this exact account and plan?", "Before any AI tool reads client mail: roles, basis, confidentiality and transfers."], accountant: ["How are foreign mail subscriptions invoiced and booked for VAT?"] }
    },

    "campaigns": {
      title: "Email campaigns", tint: "#FDE9EE", accent: "#E8637E",
      line: "Mixed lists, Croatian rules, and the proof you need.",
      minute: "A marketing email to a person needs prior consent (ZEK Art. 50(1)). One narrow exception lets you mail your own past consumer buyers about your own similar products, if they did not refuse and can object in every email. The consent rule does not cover legal persons like a d.o.o., but an obrtnik is a natural person and stays covered. Every promotional email, to anyone, shows who sent it and gives a free way to stop.",
      remember: ["Every contact gets a route: consent, customer, company or service-only.", "Obrt is a person. d.o.o. is not.", "Unknown means consent needed."],
      facts: [
        { f: "Who is the recipient?", w: "Consumer, obrtnik, company or a named employee. Each takes a different route. Check the register, not the domain." },
        { f: "Where did each address come from?", w: "Which form, which wording, and whether they refused marketing then." },
        { f: "Did a sale happen?", w: "The customer route needs an address you got from your own consumer for a sale." },
        { f: "Can you prove the route?", w: "Consent wording, date and choice, or an order record." }
      ],
      steps: [
        { t: "Pause lists whose source you cannot show", d: "Keep sending real service messages.", v: "For each list: form, wording, date range, objections." },
        { t: "Keep old evidence", d: "New consent text does not create consent for old signups. No blanket re-permission blast.", v: "Old form wording and signup records archived and dated." },
        { t: "Tag every contact with a route", d: "consent, customer, legal_person or service_only. Plus legal form and mailbox type.", v: "No contact in a campaign segment has route unknown." },
        { t: "Fix each signup form", d: "One unticked choice per purpose. Event separate from news. Privacy link at the form.", v: "Submit with every box empty. No marketing flag stored." },
        { t: "Make every campaign carry three things", d: "Your business name, a reply address and a free stop link.", v: "Send a test. Click stop. You leave every list." },
        { t: "Store a consent record per contact", d: "Wording version, UTC time, page, purposes, double opt-in time if used.", v: "Pull five contacts and show each record." },
        { t: "One suppression list for everything", d: "Every import and automation reads it before sending.", v: "Import an old CSV with a suppressed address. It stays unmailable." }
      ],
      traps: ["Company domain treated as a company. Check the register.", "Mailing past buyers of one product about an unrelated one.", "Calling a renewal pitch a service message.", "Asking for IPs and device data just to make consent look stronger."],
      deeper: [
        { h: "The customer route is narrow", b: "All must hold: same trader, a consumer, collection for a sale, your own similar offer, a free way to object at collection and in every message, no refusal, and lawful collection. Bought lists and partner offers never qualify.", src: "ZEK Art. 50(2). ePrivacy Art. 13(2)." },
        { h: "Send permission and GDPR basis are separate", b: "ZEK decides whether you may send. GDPR decides whether you may hold and use the data. Where the customer exception applies, Inteligo says no separate Art. 6 test is needed for the sending.", src: "GDPR Arts. 6 and 95. CJEU C-654/23." },
        { h: "Objection must reach everything", b: "A stop request applies to every list, tool and automation, including copies imported later.", src: "GDPR Art. 21(3)." }
      ],
      ask: { counsel: ["Does Art. 50(4) cover a named employee at a company, or only role addresses?", "Which country's rules apply to recipients outside Croatia?"], accountant: ["How long must I keep order records so the customer route stays provable?"] }
    },

    "clients": {
      title: "Client sites, apps and email", tint: "#EEEAFB", accent: "#7B6BD6",
      line: "Building, hosting and maintaining things for other businesses.",
      minute: "You wear two hats. For your own leads, contacts and invoices you are the controller. When you host, maintain or set up something that holds a client's customer data, you usually act as their processor, and your vendors become your sub-processors. That needs a written contract with the client, their sign-off on your vendors, a breach routine and an exit plan. The simplest setup puts domain, hosting and mail in the client's name, with you as an invited user.",
      remember: ["Client's accounts, you invited.", "One DPA per client you process for.", "Free hobby plans are not for paid work."],
      facts: [
        { f: "Whose account holds each service?", w: "Decides whose DPA applies and how hard handover is." },
        { f: "Can you see or change personal data?", w: "If you never touch it, you may not be a processor at all." },
        { f: "Do you reuse client data for yourself?", w: "Case studies or cross-client dashboards make you a controller for that." },
        { f: "Which plan is each vendor account on?", w: "Some DPAs cover paid plans only. Some free plans bar commercial use." },
        { f: "Do you register domains or run DNS for clients?", w: "Some NIS2 categories apply regardless of size." }
      ],
      steps: [
        { t: "Make one service inventory", d: "Per client, per service: account owner, plan, who pays, who has admin, personal data inside, vendor, DPA, region.", v: "Every row has an owner and a plan, or says unknown." },
        { t: "Mark your role for each activity", d: "Controller, processor, none, or ask counsel.", v: "No activity left blank." },
        { t: "Check the plan behind every paid project", d: "Move to a plan that allows commercial use, or into the client's account.", v: "Billing page shows the plan. DPA version and date recorded." },
        { t: "Accept vendor DPAs in your accounts", d: "Record version and date. Look up US vendors on the DPF list by exact entity.", v: "A dated record per vendor." },
        { t: "Sign a DPA with each client", d: "Cover Art. 28(3). Annex your sub-processors from the inventory.", v: "One signed copy per client. Annex matches inventory." },
        { t: "Give each client its notice inputs", d: "Send the recipient list and transfer routes for its site.", v: "Their notice lists those recipients." },
        { t: "Remove what nobody uses", d: "Dead tags and analytics nobody reads on client sites.", v: "Network log shows them gone." },
        { t: "Write a one-page breach and rights routine", d: "Who you call at each client, how fast, and what you send. AZOP reporting is the client's step.", v: "One dated contact per client on file." },
        { t: "Set a vendor change routine", d: "Subscribe to sub-processor change notices. Forward relevant ones with an objection window.", v: "One test notice sent." }
      ],
      traps: ["Client work on a free hobby plan.", "A DPF badge on a vendor site taken as proof.", "Keeping admin access after a handover nobody asked you to keep.", "Using client leads in your own marketing."],
      deeper: [
        { h: "Roles are per activity", b: "Code and design alone are not processing. Hosting a form backend in your account is. Admin access to a mailbox is. Reusing data for yourself makes you a controller for that purpose.", src: "GDPR Arts. 4(7), 4(8), 28(10). EDPB Guidelines 07/2020." },
        { h: "Breaches", b: "As processor you tell the client without undue delay. The client decides whether to tell AZOP within 72 hours.", src: "GDPR Arts. 33(1) and 33(2)." },
        { h: "Each client site needs its own trader info", b: "The client's name, seat and numbers on their site, not yours.", src: "ZET Art. 6." },
        { h: "NIS2 is usually out by size", b: "Small studios are usually outside NIS2. Domain registration services and DNS providers can be in regardless of size. Worth one check.", src: "NIS2 Directive. Croatian Cybersecurity Act NN 14/2024." }
      ],
      ask: { counsel: ["Is my client DPA enough under Art. 28(3)? What liability limit and audit terms suit a one-person studio?", "Past work ran on a plan whose DPA did not cover it. What is the fix, and do I tell the client?", "Does my domain or DNS work make me a NIS2 entity?"], accountant: ["When I pay for hosting and re-bill the client, how do I invoice it?", "From which date do I issue or receive eRačun for business clients?"] }
    },

    "saas": {
      title: "Selling a yearly subscription", tint: "#FFF3D6", accent: "#E07B3A",
      line: "A SaaS for businesses and private buyers, under Croatian consumer law.",
      minute: "Some buyers are companies or sole traders. Others are private people. A company is never a consumer, but a private buyer may be one, and that switches on the consumer rules: information in Croatian before the contract, a 14-day withdrawal right, a durable confirmation and, for online contracts, a withdrawal function. From 17 November 2026 a price list goes on your website. If buyers put their own customers' data in your product, you are usually their processor.",
      remember: ["Ask every buyer: business or private?", "Price says per year, VAT and renewal.", "Consumers get 14 days."],
      facts: [
        { f: "Is each buyer acting outside a trade or profession?", w: "Only then are they a consumer." },
        { f: "Digital service, digital content, or human-made?", w: "Withdrawal exceptions differ for each." },
        { f: "Checkout, or orders by email only?", w: "An online checkout brings the order-flow duties and the withdrawal function." },
        { f: "Did a consumer ask you to start within 14 days?", w: "Without that request you cannot charge for time used before withdrawal." },
        { f: "Staff and revenue last year?", w: "Under 10 staff and EUR 2 million may exempt you from the accessibility act." }
      ],
      steps: [
        { t: "Record buyer status at order time", d: "One required field: buying for a business, or as a private person.", v: "Open the last order. The field is there." },
        { t: "Put trader details on every selling site", d: "ZET Art. 6 fields, plus phone, email and a complaints address for consumers.", v: "One click from the home page." },
        { t: "Fix the price line", d: "Per year. VAT included or not charged, in words your accountant confirms. Renewal terms next to it.", v: "Read it aloud. Full yearly cost and renewal are clear." },
        { t: "Publish a price list by 17 Nov 2026", d: "Current, dated, matching what you invoice.", v: "The page exists and matches your last invoice." },
        { t: "Give private buyers the pre-contract pack in Croatian", d: "Identity, price, duration, renewal, functionality, and withdrawal info using the NN 105/2026 model.", v: "A private buyer receives it before paying. Keep a copy." },
        { t: "Send a durable confirmation", d: "Terms, withdrawal info and the model form, before access starts.", v: "Place a test order. Every item arrives." },
        { t: "Add an early-start request", d: "Private buyers who want access now ask expressly and acknowledge the effect on withdrawal.", v: "Order record holds the request text and timestamp." },
        { t: "Build the withdrawal function if you sell online", d: "\"raskid ugovora\", a \"potvrditi raskid ugovora\" step, and a dated acknowledgement.", v: "Run it on a test account." },
        { t: "Sign a processing agreement with each customer", d: "An accepted online agreement covering Art. 28(3), with your sub-processors listed.", v: "Each active account shows an accepted version and date." }
      ],
      traps: ["Assuming every renter is a business.", "\"Prices exclude VAT\" when you are not in the VAT register.", "Starting service for a consumer without the express request."],
      deeper: [
        { h: "Missing withdrawal info costs a year", b: "If you do not give withdrawal information, the period extends by up to one year.", src: "ZZP Art. 80." },
        { h: "Accessibility act", b: "Likely only if consumers conclude contracts through your site and you are not a microenterprise. The State Inspectorate supervises.", src: "NN 89/2025, amended NN 114/2026." },
        { h: "Who is a consumer", b: "A natural person acting outside their trade. A d.o.o. never is. A sole trader buying for the business is not. A private renter is an open case and depends on purpose and scale.", src: "ZZP NN 19/2022 Art. 4. Directive 2011/83 recital 17." }
      ],
      ask: { counsel: ["How do I classify a private renter who buys a yearly subscription?", "Is my product a digital service, digital content or both?", "How does the microenterprise test work in my first year?"], accountant: ["Is my product an electronically supplied service for VAT?", "Am I inside the EUR 60,000 small-taxpayer exemption?"] }
    },

    "ai-product": {
      title: "Selling an AI assistant", tint: "#E3F4F6", accent: "#0891B2",
      line: "A branded assistant on someone else's model, sold to professionals.",
      minute: "If you sell an assistant under your own name, you are probably its provider under the AI Act, even when the model belongs to someone else. Since 2 August 2026 a chat must make clear it is AI by the first interaction. Text-generating systems already on the market before then must add machine-readable marking by 2 December 2026. GDPR is often the bigger job: prompts, uploads, the retrieval index and logs all hold personal data, and for professional customers you are usually their processor with the model vendor as your sub-processor.",
      remember: ["Your name on it makes you the provider.", "Say it is AI in the chat itself.", "Legal, medical, financial: separate check."],
      facts: [
        { f: "Which models and vendors, and what you add on top?", w: "Write it down. It is the start of your system card." },
        { f: "When was each version first on the market?", w: "Before or after 2 August 2026 decides the marking deadline." },
        { f: "Is the use listed in Annex III?", w: "Recruitment, credit, education admissions and justice are high-risk areas." },
        { f: "Do you use customer content for yourself?", w: "Training or cross-customer retrieval changes your GDPR role." },
        { f: "Can prompts hold sensitive data?", w: "Legal, HR and health files often do. Art. 9 applies." }
      ],
      steps: [
        { t: "Write a one-page system card", d: "Models, vendors, your brand, market dates, intended users and purpose, forbidden uses. Two lines on Art. 5 and Annex III.", v: "Card is dated and complete." },
        { t: "Add the AI line at first interaction", d: "\"You are chatting with an AI assistant\" in the chat itself, in every embed.", v: "Fresh private window and a phone. Visible without scrolling. Read by a screen reader." },
        { t: "Write the AI literacy note", d: "What it does, what it must not see, failure modes, how outputs get checked, who to call.", v: "Dated, names the version." },
        { t: "Put provider info everywhere", d: "Legal name, address, email, registration and VAT on a page linked from site, app and chat.", v: "Loads from the footer on every domain." },
        { t: "Confirm terms for each vendor account", d: "DPA, sub-processors, region, prompt retention, training use. Off consumer plans.", v: "Each vendor has an \"accepted on\" date and a saved copy." },
        { t: "Plan machine-readable marking", d: "If generating text and on the market before 2 Aug 2026, ship marking by 2 Dec 2026.", v: "Output carries the marking. Test it." },
        { t: "Wire rights requests to the index and logs", d: "Deletion reaches the vector store, logs and backups.", v: "Delete a test document end to end." }
      ],
      traps: ["\"We only call an API, so we are not a provider.\"", "\"It is a demo.\" Real users on a live product are not testing.", "\"Article 50 starts in December.\" Only marking does. Chat disclosure already applies.", "Treating a proposal like the Digital Omnibus as law."],
      deeper: [
        { h: "Small size is no exemption", b: "The AI Act reaches providers placing systems on the EU market, wherever they are based. AI literacy is simplified for small firms, not removed.", src: "AI Act Arts. 2(1), 3(1), 4." },
        { h: "High-risk dates moved, the rest did not", b: "Prohibitions, literacy and transparency already apply. Only high-risk obligations moved to 2027.", src: "AI Act Art. 113, as amended." },
        { h: "A disclaimer does not settle sector rules", b: "A legal, medical or investment assistant needs its own sector check.", src: "Sector rules vary by profession." }
      ],
      ask: { counsel: ["Am I provider, deployer or both for each product?", "Does my use touch Annex III?", "Do my processor terms work in both directions?"], accountant: ["How do I invoice an AI subscription to EU businesses and consumers?"] }
    },

    "ai-inbox": {
      title: "AI inbox helper", tint: "#E9F7F0", accent: "#3BAD82",
      line: "Labels and drafts only. You read, edit and send every reply.",
      minute: "The helper may do three things at most: suggest a label, write a draft and add a task line. You read, edit and send every reply yourself. A cautious order: measure a normal week first, then test on made-up mail behind an enforced draft-only limit, then sort out processor terms, notices and retention, and only then real mail. Client mail waits until counsel answers the role and confidentiality questions. Stopping at any step is a fine result.",
      remember: ["Drafts only, enforced, not promised.", "Fake mail before real mail.", "Client mail waits for counsel."],
      facts: [
        { f: "Which AI system, provider and plan?", w: "A consumer chat plan, a business seat and an API key carry different terms." },
        { f: "Which mail would it read?", w: "Your own mail, leads and client threads are different inputs. Quoted history brings in third parties." },
        { f: "How long is each copy kept?", w: "Workflow logs, digests, backups and the model provider's logs all count." },
        { f: "Can mail hold sensitive data?", w: "Health or beliefs arrive in free text. A keyword filter does not keep them out." }
      ],
      steps: [
        { t: "Write the goal and a baseline week", d: "Fewer inboxes, faster replies, or fewer missed messages. Count messages and inbox minutes for one normal week.", v: "Written before anything is bought." },
        { t: "Confirm a read route on your current provider", d: "A read-only credential, and the scopes it actually grants.", v: "A written scope list." },
        { t: "Build the draft-only boundary", d: "A small broker holds the token and exposes only \"create draft\" and \"apply one label\". Redact signatures, phones, IBANs and quoted history first.", v: "Call send, forward, delete and move through it. Each is refused." },
        { t: "Test on synthetic mail", d: "Include messages that tell the helper to send or forward.", v: "Log of refusals and observed behaviour." },
        { t: "Turn off stored content in the workflow tool", d: "No saved executions with message bodies.", v: "Run once. Check the execution log holds no content." },
        { t: "Sort terms before real mail", d: "DPA for your plan, no training on your content, transfer route, notice line, retention.", v: "Each vendor row dated and saved." }
      ],
      traps: ["Gmail's compose scope can send. No Gmail scope allows drafts without send.", "A workflow with no Send step is not a boundary. The credential still can.", "An approval prompt is not a boundary.", "Filtering after the fetch. The tool already saw it."],
      deeper: [
        { h: "Every provider in the path needs a contract", b: "Mail host, workflow tool, model provider. Each needs written Art. 28 terms that bind your plan.", src: "GDPR Art. 28." },
        { h: "Tell the people whose mail it reads", b: "Senders and people in quoted threads. Your notice needs a line about the helper.", src: "GDPR Arts. 13 and 14." },
        { h: "AI Act role", b: "Using it for your own business makes you a deployer. AI literacy applies.", src: "AI Act Arts. 3(4) and 4." }
      ],
      ask: { counsel: ["Before client mail: roles, basis, confidentiality, client authorisation, transfers.", "Does my notice cover senders and quoted third parties?"], accountant: [] }
    },

    "hosting": {
      title: "Hosting and backups", tint: "#EEEAFB", accent: "#7B6BD6",
      line: "Plans, DPAs, regions and a restore you have actually tested.",
      minute: "A storage box is a cheap remote disk for backup files. It does not run sites, functions, databases or mail. An EU data centre does not settle GDPR either. Two checks matter first and both are smaller than a migration: which plan each commercial site sits on, since a free hobby plan can forbid commercial use and fall outside the vendor's DPA, and whether you have ever restored your database from a backup. A backup is proven only after a test restore works and you wrote down the result.",
      remember: ["Commercial site, commercial plan.", "A backup is a restore you tested.", "EU region is not a GDPR fix."],
      facts: [
        { f: "Is each site commercial?", w: "Advertises services, takes payment, or someone is paid to build it." },
        { f: "Which plan and DPA bind each account?", w: "Some DPAs cover paid plans only. Some are opt-in." },
        { f: "Have you ever restored?", w: "Free database plans may have no backups at all." },
        { f: "What do spend controls do?", w: "Pause can take every site in the team offline, client sites included." }
      ],
      steps: [
        { t: "Write a one-page hosting inventory", d: "Per site: host, team, plan, function region, database and its plan, account owner, yours or a client's.", v: "Every live domain appears once with an owner." },
        { t: "Check the plan for each commercial site", d: "Move commercial sites to a plan that allows commercial use.", v: "Billing page shows the paid plan and the project sits in that team." },
        { t: "Accept and save each DPA", d: "Host, database, backup storage, backup runner. Check it covers your plan.", v: "A dated copy of each." },
        { t: "Decide how spend controls behave", d: "Alerts only, or pause. Move client sites to their own team if pausing.", v: "The choice is written down." },
        { t: "Set functions near your database", d: "For example \"regions\": [\"fra1\"] in vercel.json.", v: "Deployment details show the region." },
        { t: "Decide what a backup must hold", d: "How much data loss and downtime you accept, per site.", v: "One line per site." },
        { t: "Run a test restore", d: "Restore into a scratch project. Time it.", v: "Write down the date, the time it took and what broke." },
        { t: "Encrypt off-site copies", d: "Encrypt before upload. Store the key somewhere else.", v: "Restore from the encrypted copy works." }
      ],
      traps: ["\"Moving to an EU storage box makes us GDPR safe.\"", "\"Our host has a DPA, so we are covered.\" Check your plan.", "\"The vendor does daily snapshots.\" Not on every plan.", "\"A budget prevents surprise bills.\" Alone it only alerts."],
      deeper: [
        { h: "Security includes restoring", b: "GDPR asks for the ability to restore availability and access in time, and for regular testing.", src: "GDPR Art. 32(1)(c) and (d)." },
        { h: "A lost backup can be a breach", b: "A leaked or lost backup with personal data is a breach. Assess it within 72 hours.", src: "GDPR Art. 33." },
        { h: "Self-hosting is a job", b: "Patching, monitoring and restores become yours. It rarely saves money for a one-person business.", src: "Practical guidance." },
        { h: "VAT on foreign hosting invoices", b: "Foreign hosting may need your PDV ID and self-assessed VAT. See Invoicing and VAT.", src: "Croatian VAT Act." }
      ],
      ask: { counsel: ["Past client work ran on a hobby plan. What now?"], accountant: ["Do my foreign hosting invoices need a PDV ID and reverse charge?"] }
    },

    "tax": {
      title: "Invoicing and VAT as an obrt", tint: "#FFF3D6", accent: "#E07B3A",
      line: "Four status facts, two thresholds, and eRačun.",
      minute: "An obrt label tells you little about tax. Your accountant needs four separate facts: your income-tax regime, whether you are in the VAT register, whether you hold a PDV ID for cross-border services, and who your buyers are. eRačun phases in: VAT-registered businesses issue and receive from 1 January 2026. Businesses outside the register receive from 2026 and issue from 1 January 2027. Being under EUR 60,000 does not shield you from VAT on some foreign services you buy.",
      remember: ["VAT register and PDV ID are two questions.", "You already receive eRačun in 2026.", "Track EUR 60,000 and EUR 10,000."],
      facts: [
        { f: "What does each sale contain?", w: "Automated online service, hand-built work, or consulting. Decides the place of supply abroad." },
        { f: "Is each buyer a business or a consumer?", w: "Different place-of-supply, invoice and fiscalisation rules." },
        { f: "Which foreign tools do you pay for?", w: "Some need your PDV ID and reverse charge." },
        { f: "How do consumers pay?", w: "Bank transfers from consumers are fiscalised too, from 2026." }
      ],
      steps: [
        { t: "Write down your four status facts", d: "Legal form, income-tax regime, VAT register status and PDV ID status, each dated.", v: "Each line names its source." },
        { t: "List what you sell and to whom", d: "Per product: automated, hand-built or mixed, and the buyer types.", v: "Every product on your site appears." },
        { t: "List foreign tools you pay for", d: "Billing entity, country, and whether your PDV ID is on the billing profile.", v: "Each row matches a real invoice." },
        { t: "Check eRačun receiving for 2026", d: "Access point, authorised person, and who fiscalises received eRačun within five working days.", v: "A received eRačun shows as fiscalised." },
        { t: "Plan issuing from 1 Jan 2027", d: "Pick the tool. Ask whether MIKROeRAČUN fits.", v: "Accountant names tool and start date in writing." },
        { t: "Confirm consumer payment fiscalisation", d: "Including bank transfers. MIKROeRAČUN does not cover consumer receipts.", v: "One fiscalised receipt per payment type." },
        { t: "Track two thresholds", d: "Domestic turnover toward EUR 60,000. Cross-border consumer digital sales toward EUR 10,000.", v: "Totals match invoices." },
        { t: "Fill the transaction matrix with your accountant", d: "Each buyer type and payment method: document, fiscalisation route, VAT treatment.", v: "One written answer per cell." }
      ],
      traps: ["\"Under EUR 60,000\" read as \"no VAT anywhere\".", "Treating VAT register status and PDV ID as one thing.", "\"eRačun starts in 2027.\" Receiving already started.", "\"Five working days\" applied to everything. That is for received invoices."],
      deeper: [
        { h: "OSS and the SME scheme are different", b: "OSS is how you report VAT on consumer sales to other EU states. The cross-border SME exemption is a separate scheme.", src: "VAT Directive. Croatian VAT Act." },
        { h: "Selling to EU businesses", b: "Usually reverse charge. The invoice needs both VAT numbers and the reverse-charge wording.", src: "VAT Directive Art. 196." },
        { h: "What your website says about tax", b: "Prices state whether VAT is included. If you are outside the register, say VAT is not charged, in words your accountant confirms.", src: "ZET Art. 6(2)." }
      ],
      ask: { counsel: [], accountant: ["What is my income-tax regime, VAT status and PDV ID status, in writing?", "Which foreign subscriptions need self-assessed VAT?", "Which tool issues my eRačun from 2027?", "How are consumer bank transfers fiscalised?"] }
    }
  },

  regions: [
    { id: "eu", flag: "EU", name: "European Union", depth: "Researched", how: "18 rule families, 375 claims with exact sources.", points: [
      "GDPR follows your EU establishment. It applies to everything you do with personal data, wherever the people are.",
      "Cookie and device rules are national laws built on the ePrivacy Directive. Each country has its own wording.",
      "The AI Act, DSA, accessibility act, GPSR, NIS2 and CRA are EU-wide. Most reach a small studio only through specific features.",
      "VAT on digital services to consumers in other EU states switches to their rate above EUR 10,000 a year."
    ] },
    { id: "hr", flag: "HR", name: "Croatia", depth: "Researched", how: "10 national topic packs. Croatian text controls.", points: [
      "AZOP supervises privacy. Breaches go to AZOP within 72 hours when they qualify.",
      "ZEK Art. 43(4) is the cookie rule. No analytics exemption was found.",
      "ZEK Art. 50 is the marketing email rule. Obrt counts as a person, d.o.o. does not.",
      "ZZP covers consumer sales. ZET Art. 6 covers what your site says about you.",
      "Accessibility act NN 89/2025, amended NN 114/2026. eRačun under the Fiscalisation Act."
    ] },
    { id: "uk", flag: "UK", name: "United Kingdom", depth: "Overview", how: "Checked against public sources. Not from the claim-by-claim pack.", points: [
      "UK GDPR applies when you offer services to people in the UK. A non-UK business with regular UK work may need a UK representative.",
      "Since 5 Feb 2026, UK cookie law (PECR) lets first-party analytics that only produce aggregate stats run without consent, if you explain it and give a free way to object. Ads and cross-site tracking still need consent.",
      "Marketing email: consent for individuals and sole traders. A \"soft opt-in\" covers people who bought or negotiated with you, for similar products. Companies need no consent but still get your name and an opt-out.",
      "PECR fines now go up to GBP 17.5 million or 4% of turnover.",
      "Data flows from the EU to the UK are covered by an adequacy decision.",
      "Selling digital services to UK consumers: non-UK sellers register for UK VAT from the first sale."
    ] },
    { id: "us", flag: "US", name: "United States", depth: "Overview", how: "US vendor transfer rules are researched. The rest is an overview.", points: [
      "No federal GDPR. About 20 states have privacy laws in force in 2026. Most start at 100,000 residents a year. Connecticut and Rhode Island start at 35,000. California also applies above USD 26.6 million revenue.",
      "Small studios are usually under these thresholds. Your EU-grade setup already covers most of what they ask.",
      "CAN-SPAM lets you email without prior consent, but every commercial email needs a postal address and an opt-out you honour within 10 business days.",
      "Under-13 users bring COPPA. The updated rule applies from April 2026.",
      "Pixels and session replay attract wiretap lawsuits in California. Another reason to remove what you do not read.",
      "US vendors: transfers from the EU rely on the exact entity being on the Data Privacy Framework list, or on SCCs."
    ] },
    { id: "else", flag: "+", name: "Elsewhere", depth: "Pointers", how: "Only if you have customers there.", points: [
      "Canada (CASL): consent before commercial email, with narrow implied-consent routes. Stricter than the US.",
      "Switzerland (nFADP): close to GDPR. Swiss-US transfers have their own DPF list.",
      "Other EU states: the shared EU rules apply. National cookie and email wording has not been researched yet. France, Germany and Ireland are next."
    ] }
  ],

  matrix: {
    cols: ["EU", "HR", "UK", "US"],
    rows: [
      { t: "Privacy basics", c: ["r", "r", "o", "o"] },
      { t: "Cookies and scripts", c: ["r", "r", "o", "o"] },
      { t: "Marketing email", c: ["r", "r", "o", "o"] },
      { t: "Selling to consumers", c: ["r", "r", "o", "-"] },
      { t: "Trader info on your site", c: ["r", "r", "-", "-"] },
      { t: "Accessibility", c: ["r", "r", "-", "o"] },
      { t: "AI products", c: ["r", "e", "-", "o"] },
      { t: "Transfers to vendors", c: ["r", "e", "o", "r"] },
      { t: "VAT and invoicing", c: ["r", "r", "o", "o"] }
    ]
  },

  world: {
    "analytics": { uk: "First-party analytics that only produce aggregate stats may run without consent since 5 Feb 2026, with a clear notice and a free way to object. GA-style third-party tracking and ads still need consent.", us: "No general cookie-consent law. State laws give an opt-out from \"sale\" or \"sharing\" for ads, and several require honouring Global Privacy Control." },
    "storage": { uk: "Same as analytics. Keys that only adjust appearance, like a theme setting, now have their own exception.", us: "If the quiz targets under-13s, COPPA needs verifiable parental consent first." },
    "signups": { uk: "The soft opt-in covers people who bought or negotiated with you. A free signup probably does not. Ask with a box.", us: "CAN-SPAM allows mailing without prior consent, with a postal address and a working opt-out. Canada needs consent first." },
    "referral": { uk: "The new statistics exception may cover first-party aggregate counts, with notice and a free opt-out. Third-party endpoints make it harder.", us: "No consent rule. Name it in the notice if a state privacy law applies to you." },
    "inbox": { uk: "DNS works the same everywhere. Gmail and Yahoo bulk-sender rules apply worldwide.", us: "Same. Your US mail host is a transfer. Check its DPF entry." },
    "campaigns": { uk: "Consent for individuals and sole traders. Soft opt-in for customers. Companies need no consent but get identity and opt-out. Fines up to GBP 17.5 million.", us: "CAN-SPAM opt-out model. Postal address in every email. Honour opt-outs within 10 business days. Designing to the Croatian rule covers it." },
    "clients": { uk: "UK GDPR has the same processor contract rule. Data can flow EU to UK under adequacy.", us: "US state laws call you a \"service provider\" or \"processor\" and want a contract when the client is covered." },
    "saas": { uk: "UK consumers get 14 days to cancel. New subscription rules under the DMCC Act 2024 are being phased in. UK VAT on digital services from the first sale.", us: "Some states tax SaaS once you pass their economic nexus threshold, often USD 100,000 in sales." },
    "ai-product": { uk: "No AI Act. UK GDPR covers the data in prompts and files.", us: "No federal AI law. A few states (Colorado, California, Utah) add disclosure or high-risk duties. Check before selling there." },
    "ai-inbox": { uk: "UK GDPR covers it the same way.", us: "US model vendors are a transfer. Check the exact entity on the DPF list and keep the DPA." },
    "hosting": { uk: "UK hosts are covered by EU adequacy.", us: "US hosts: check the exact entity on the DPF list. A badge on their site is not proof." },
    "tax": { uk: "Digital services to UK consumers: register for UK VAT from the first sale.", us: "No VAT. Sales tax may apply to SaaS in some states after economic nexus." }
  },

  deciders: [
    { id: "email", title: "Can I send this email?", icon: "mail", start: "a",
      nodes: {
        a: { q: "Does the email promote something? A newsletter, offer, launch or upsell counts.", o: [["Yes, it promotes", "b"], ["No, it is about something they asked for", "R:service"], ["It is mixed", "b"]] },
        b: { q: "Who gets it?", o: [["A person, or an obrt", "c"], ["A company (d.o.o., j.d.o.o.)", "R:company"], ["Not sure", "c"]] },
        c: { q: "Do you have a recorded yes for this purpose?", o: [["Yes, with date and wording", "R:ok"], ["No", "d"], ["Sort of. An old list.", "d"]] },
        d: { q: "Did they buy from you, is this your own similar product, and could they say no when you collected the address?", o: [["Yes to all three", "R:customer"], ["No, or not sure", "R:stop"]] }
      },
      results: {
        service: { tone: "go", h: "Send it. It is a service message.", b: "Confirmations, joining links and reminders need no marketing permission. Keep upsells out, or it becomes mixed.", topic: "signups" },
        company: { tone: "go", h: "You may send, with your name and a free stop link.", b: "In Croatia the consent rule does not cover legal persons. Check the register, not the domain. A named employee's address is still personal data.", topic: "campaigns" },
        ok: { tone: "go", h: "Send it.", b: "Show who you are and include a free unsubscribe. Stop as soon as they object, in every tool.", topic: "campaigns" },
        customer: { tone: "maybe", h: "Probably fine under the customer exception.", b: "Only your own similar products, only to people who bought, and a stop link in every email. A free signup is usually not a sale.", topic: "campaigns" },
        stop: { tone: "stop", h: "Do not send yet.", b: "Ask for consent at the next natural moment, like a signup or purchase. A mass \"may we email you?\" message can itself count as marketing.", topic: "campaigns" }
      }
    },
    { id: "script", title: "Does this script need consent?", icon: "code", start: "a",
      nodes: {
        a: { q: "Does it store or read anything on the device, or tell the browser to send data somewhere?", o: [["Yes", "b"], ["No", "R:out"], ["No idea", "R:check"]] },
        b: { q: "Is it strictly needed for something the visitor asked for? Login, cart, their consent choice, security.", o: [["Yes", "R:needed"], ["No, it is for me", "c"]] },
        c: { q: "Does anyone actually read what it produces?", o: [["Yes", "R:consent"], ["Not really", "R:remove"]] }
      },
      results: {
        out: { tone: "go", h: "Probably outside the device rule.", b: "If it still touches personal data, list it in the notice.", topic: "analytics" },
        check: { tone: "maybe", h: "Find out first.", b: "Open a private window, load the page and read the network and storage tabs. That is the answer.", topic: "analytics" },
        needed: { tone: "go", h: "No consent needed.", b: "Explain it in the notice anyway. Necessary does not mean invisible.", topic: "storage" },
        remove: { tone: "go", h: "Remove it.", b: "The smallest fix there is. No banner, no notice line, no vendor to check.", topic: "analytics" },
        consent: { tone: "stop", h: "Load it only after Accept.", b: "EU and Croatia: consent first, Reject as easy as Accept. UK: first-party aggregate stats may skip consent with notice and opt-out.", topic: "analytics" }
      }
    },
    { id: "role", title: "Am I controller or processor?", icon: "badge", start: "a",
      nodes: {
        a: { q: "Whose people is the data about?", o: [["My own leads, clients or subscribers", "R:controller"], ["My client's customers or visitors", "b"]] },
        b: { q: "Can you see or change that data? Hosting in your account, admin access, form backend.", o: [["Yes", "c"], ["No, I only build", "R:none"]] },
        c: { q: "Do you use any of it for your own purpose? Case study, your own marketing, cross-client stats.", o: [["No", "R:processor"], ["Yes", "R:mixed"]] }
      },
      results: {
        controller: { tone: "go", h: "You are the controller.", b: "You decide why. You need a basis, a notice and DPAs with your own vendors.", topic: "clients" },
        none: { tone: "go", h: "Probably not processing for them.", b: "Code and design alone are not processing. Hand over cleanly and drop access you do not need.", topic: "clients" },
        processor: { tone: "maybe", h: "You are their processor.", b: "Sign a DPA with the client. List your sub-processors. Agree a breach routine.", topic: "clients" },
        mixed: { tone: "stop", h: "Controller for that purpose.", b: "Stop the reuse, or agree it with the client openly and find your own basis.", topic: "clients" }
      }
    }
  ]
};
