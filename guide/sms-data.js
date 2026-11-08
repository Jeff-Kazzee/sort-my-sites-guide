// Sort My Sites: edition layer. Her domains as defaults, her eight asks, start order, earning-online guides.
export default {
  sites: [
    { domain: "tamara.rocks", role: "Personal site and free workshop", lang: "EN" },
    { domain: "nosastra.co", role: "Studio site", lang: "EN, HR" },
    { domain: "welcomebook.eu", role: "Guest guide for hosts", lang: "HR" },
    { domain: "vibeordev.com", role: "AI quiz", lang: "EN" }
  ],

  asks: [
    { n: 1, t: "Five email addresses. Are they set up right?", a: "Probably one mailbox and four aliases is all you need. The checker reads the DNS for every domain and shows what to paste.", href: "#/topic/inbox", cta: "Sort the inboxes", tint: "mint", icon: "alternate_email" },
    { n: 2, t: "Campaigns that don't land.", a: "Two separate problems. Deliverability is DNS. Permission is ZEK Art. 50. Fix both and campaigns start landing.", href: "#/topic/campaigns", cta: "Fix campaigns", tint: "pink", icon: "campaign" },
    { n: 3, t: "Too many sites and products.", a: "Give each one a label: keep, merge, park or shut down. Parking is cheap and reversible.", href: "#/topic/sort", cta: "Sort the sites", tint: "lav", icon: "stacks" },
    { n: 4, t: "All on Vercel. Customers in Croatia.", a: "Fine. Two checks matter: which plan each paid site is on, and whether you accepted the DPA.", href: "#/topic/hosting", cta: "Check hosting", tint: "teal", icon: "cloud" },
    { n: 5, t: "GDPR, cookies, analytics. Am I breaking rules?", a: "A more useful question: what runs before a visitor chooses? Remove what nobody reads. Ask first for the rest.", href: "#/topic/analytics", cta: "See what loads", tint: "peach", icon: "cookie" },
    { n: 6, t: "AI that actually helps run the business.", a: "Drafts only, enforced by a broker, tested on fake mail first. Treat it as an engineering problem.", href: "#/topic/ai-inbox", cta: "Build the helper", tint: "lav", icon: "edit_note" },
    { n: 7, t: "A friend said Hetzner Storage Box.", a: "Great for encrypted backups. It can't host anything. Here is a tested Supabase backup recipe.", href: "#/topic/hosting", cta: "Get the recipe", tint: "mint", icon: "backup" },
    { n: 8, t: "Where do I even start?", a: "One hour. Six blocks of ten minutes. Then a week, then a month. Most things can wait if you write them down.", href: "#/topic/start", cta: "Start the hour", tint: "pink", icon: "flag" }
  ],

  thisWeek: [
    { t: "Run the checker on every domain", d: "Ten minutes. Gives you most of your inventory.", href: "#/report", tint: "mint", cols: "1.1fr", note: "ten minutes, tops" },
    { t: "One inbox, four aliases, DMARC at p=none", d: "Paste three records. Replies stop getting lost.", href: "#/topic/inbox", tint: "lav", cols: "1.1fr", note: "your loudest pain first" },
    { t: "Label every site", d: "Keep, merge, park or shut down.", href: "#/topic/sort", tint: "pink", cols: "0.8fr", note: "if unsure, park it" }
  ],

  groups: [
    { id: "start", name: "Start here", ids: ["start", "sort"] },
    { id: "mail", name: "Email, your loudest pain", ids: ["inbox", "signups", "campaigns"] },
    { id: "site", name: "Your sites", ids: ["analytics", "referral", "storage"] },
    { id: "earn", name: "Earning online", ids: ["pricing", "saas", "terms", "promo", "copyright", "payments", "eusell", "dataact"] },
    { id: "work", name: "Clients and hosting", ids: ["clients", "hosting"] },
    { id: "ai", name: "AI that helps", ids: ["ai-inbox", "ai-product"] },
    { id: "biz", name: "Money admin", ids: ["tax"] }
  ],

  icons: { start: "flag", sort: "stacks", pricing: "sell", terms: "contract", promo: "campaign", copyright: "copyright", payments: "credit_card", eusell: "public", dataact: "swap_horiz" },
  related: { start: ["F-GDPR-RIGHTS", "N-HR-AUTH", "N-HR-COOKIE-CONSENT", "N-HR-TRADER-INFO"], sort: ["F-GDPR-RIGHTS", "F-GDPR-PROCESSOR", "F-EMAIL", "N-HR-TRADER-INFO"], pricing: ["N-HR-TRADER-INFO", "N-HR-CONSUMER-INFO", "F-CONSUMER"], terms: ["F-CONSUMER", "N-HR-CONSUMER-INFO", "F-GDPR-PROCESSOR"], promo: ["F-ECOMMERCE", "F-EMAIL"], copyright: ["F-AI", "F-GDPR-PROCESSOR"], payments: ["N-HR-CONSUMER-WITHDRAW", "F-CONSUMER"], eusell: ["F-TAX", "F-CONSUMER"], dataact: ["F-GDPR-PROCESSOR", "F-CONSUMER"] },
  tryit: { start: ["Ten minutes. One command.", "Run your first check", "#/report"], sort: ["Fill one inventory row per site.", "Open the checklist", "#/checklists"], pricing: ["Check your price lines with the selling questions.", "Answer selling questions", "#/questions/selling"], terms: ["Find out who your buyers are first.", "Answer selling questions", "#/questions/selling"], promo: ["Check a promo email before it goes out.", "Can I send this email?", "#/decide"], copyright: ["Work out your role on a client project.", "Am I controller or processor?", "#/decide"], payments: ["Answer the selling questions first.", "Answer selling questions", "#/questions/selling"], eusell: ["Your accountant needs four facts.", "Answer tax questions", "#/questions/tax"], dataact: ["Check what your SaaS terms promise.", "Open Subscriptions", "#/topic/saas"] },
  world: {
    start: { uk: "Same order works. UK data requests also have a one-month clock.", us: "No federal clock. Some states give 45 days for requests." },
    sort: { uk: "Same logic. UK GDPR also wants data deleted when the purpose ends.", us: "State laws ask for deletion on request, if they apply to you at all." },
    pricing: { uk: "The DMCC Act 2024 bans drip pricing. Show the full price up front.", us: "The FTC fees rule targets hidden fees in some sectors. Showing the full price is the safe habit." },
    terms: { uk: "UK consumer law has similar unfair-terms rules.", us: "Clickwrap terms hold up best when people actively agree." },
    promo: { uk: "The CMA and ASA expect #ad on paid posts.", us: "The FTC endorsement guides expect a clear disclosure, close to the claim." },
    copyright: { uk: "UK law has a special rule for computer-generated works. Still unsettled for AI.", us: "The Copyright Office refuses protection for purely AI-generated material." },
    payments: { uk: "Surcharges on consumer card payments are banned in the UK too.", us: "Surcharging is allowed in most states, with card-network caps." },
    eusell: { uk: "No geo-blocking rule. UK VAT on digital services from the first sale.", us: "Sales tax on SaaS in some states, after economic nexus." },
    dataact: { uk: "No equivalent switching law.", us: "No equivalent switching law." }
  },

  topics: {
    start: {
      title: "Where to start: your first hour, week and month", tint: "#FDE9EE",
      line: "You are not doing everything wrong. You are doing many things at once, and nobody gave you a list.",
      minute: "Spend one hour in six blocks of ten minutes: run the checker, list your mailboxes, pick the one offer that pays you, fix three findings, answer the open questions and book your specialist questions. Then one week on the basics for the sites you keep, and one month on the dated items. Most findings can wait a few weeks if you write them down. Four cannot: anything that runs on devices before visitors choose, a person asking about their data, someone saying stop emailing me, and a data breach.",
      remember: ["Four things have a clock. The rest gets a date.", "Protect the offer that pays you first.", "Park instead of fixing what you won't keep."],
      facts: [
        { f: "Which offer brings in the money?", w: "Its checkout, form, mail and domain get protected first." },
        { f: "What runs before a visitor chooses?", w: "The most common finding, and the fastest to fix." },
        { f: "Has anyone asked about their data, or said stop?", w: "These have a clock, so they jump the queue." },
        { f: "Fewer than 10 staff and under EUR 2 million?", w: "May take accessibility off your services list for now." }
      ],
      steps: [
        { t: "Minutes 0 to 10. Run the checker on every domain", d: "While it runs, list every domain you pay for at your registrar. Add any you forgot and run again.", v: "The report has a section for each domain you own." },
        { t: "Minutes 10 to 20. List your mailboxes and aliases", d: "Address, mailbox or alias, domain, who reads it, which tools send as it. No passwords.", v: "The list matches your mail host's admin console." },
        { t: "Minutes 20 to 30. Pick the one offer that pays you", d: "Write down its domain, its checkout or signup form, its confirmation email and its vendors.", v: "You can point to all four in the report." },
        { t: "Minutes 30 to 40. Fix the top three findings", d: "On the money domain: a tracker before a choice, a form with no notice, a mail DNS gap. Only those.", v: "Run the re-check for each fix." },
        { t: "Minutes 40 to 50. Answer the open questions", d: "Answer what you know. \"I don't know\" keeps the related checks visible.", v: "answers.json holds your answers, with the date." },
        { t: "Minutes 50 to 60. Book your specialist questions", d: "Copy the needs-a-specialist items into two lists. Book one call with each. Send the list ahead.", v: "Both calls are in your calendar with the list attached." },
        { t: "Week 1. One small task a day", d: "Re-run the checker. Label every site. Park what you won't keep. One notice and trader info per kept site. One real inbox. Export list evidence. Set up the two clocks.", v: "Seven ticks by Friday." },
        { t: "Month 1. The dated things", d: "Merge and shut down. Check the checkout's withdrawal function. Price list before 17 Nov. AI marking before 2 Dec. Vendor DPAs. One test restore. Accountant call about eRačun and OSS.", v: "Re-run everything and compare with the hour-one report." }
      ],
      traps: ["Rewriting the privacy notice before you know what the site loads.", "Fixing findings on a site you're about to park.", "Starting the AI inbox helper before mail and vendors are in order.", "Putting a data request on the \"later\" list. It has a one-month clock."],
      deeper: [
        { h: "The four clocks", b: "Answer a data request within one month. Stop marketing as soon as someone objects, with no balancing test. Report a qualifying breach within 72 hours where feasible. Trackers before a choice affect every visitor today.", src: "GDPR Arts. 12(3), 21(2) to (3), 33(1). AZOP breach page." },
        { h: "Three boxes for everything else", b: "Now: anything with a clock, anything on devices before a choice, anything on the money offer. This month: fixes that touch people's data or money, and dates in the next two months. Later, with a date: hardening that affects nobody yet, parked sites, regimes that may not apply.", src: "Practical guide, our reading." },
        { h: "Checkout rules already in force", b: "Since 19 June 2026, online consumer contracts need a prominent withdrawal function, a confirm step and a dated acknowledgement.", src: "ZZP as amended by NN 59/2026, new Art. 81a. Directive (EU) 2023/2673." }
      ],
      ask: { counsel: ["Does the 17 November price-list duty cover my offer, and how do I publish it?", "Which of my findings, if any, should not wait a month?"], accountant: ["From which date do I issue eRačun, and what changes with OSS on 1 January 2027?"] }
    },

    sort: {
      title: "Too many sites: keep, merge, park or shut down", tint: "#EEEAFB",
      line: "You don't have to fix every site. You have to decide what each one is for.",
      minute: "Give every site or product one label: keep, merge, park or shut down. Base it on five facts: money in, active users, your maintenance time, the data it holds and its legal surface. If you're unsure, park it. Parking is cheap and reversible. Deleting data is not. Each label has a tail: merging can change who the controller is, shutting down means deleting or returning data and handling paid time, a parked page with an old tag still needs consent, and a retired domain still needs a mail policy.",
      remember: ["Unsure? Park it.", "A parked page with a tag still needs a banner.", "Never let a domain with logins expire."],
      facts: [
        { f: "Money in over the last 12 months?", w: "Separates keep from park or shut down." },
        { f: "Hours a month to keep it running?", w: "Earns little, costs hours: a merge or shut-down candidate." },
        { f: "Paying customers with time left?", w: "What you promised on duration still counts." },
        { f: "Was the domain ever used for logins or resets?", w: "Then renew it for years. A new owner could reset your passwords." }
      ],
      steps: [
        { t: "Fill one inventory row per site", d: "Domains, what it does, money in, active users, paid customers left, hours, data held, forms, trackers, sending domain, label and date.", v: "Every domain from your registrar has a row." },
        { t: "Label each one with the decision rule", d: "Keep if it earns or has users and fits your time. Merge if it serves the same audience as a kept site. Park if you want it later. Shut down if it costs time and holds data.", v: "No row without a label." },
        { t: "Park properly", d: "Static page. No trackers, no forms, no data collection.", v: "A private-window check shows no third parties and no forms on it." },
        { t: "Shut down in order", d: "Stop renewals. Decide what paid customers get. Tell users with a date. Give an export window. Sort data into delete, keep by law, keep minimal suppression. Ask vendors to delete. Update notices. Take it down.", v: "A saved deletion confirmation from every vendor." },
        { t: "Retire each domain on purpose", d: "Path A: keep MX and one alias for a while. Path B: null MX, SPF -all, DMARC p=reject. Check wildcards first.", v: "dig shows the records you chose." },
        { t: "Renew anything that carried logins", d: "Auto-renew for several years. Move accounts off its addresses before ever letting it go.", v: "Registrar shows auto-renew on." },
        { t: "Tell your accountant", d: "A product that ends changes your revenue lines.", v: "One email sent." }
      ],
      traps: ["Deleting the list and the unsubscribe record together. People who said no come back on the next import.", "Merging two newsletters into one list. Each joined for one sender and topic.", "A shutdown email that sells another product.", "Leaving forms live on a parked page."],
      deeper: [
        { h: "Your vendors must return or delete", b: "Under your DPA you choose return or deletion at the end of the service. Include backups and save the confirmation.", src: "GDPR Art. 28(3)(g)." },
        { h: "Merging can change the controller", b: "It stays the same only if the same legal entity runs both sites. Pick the surviving notice on purpose and rewrite it for the merged purposes.", src: "GDPR Arts. 4(7), 13, 6(4)." },
        { h: "A small suppression record can outlive the list", b: "Keep just enough to never mail people who objected.", src: "GDPR Art. 21(3)." }
      ],
      ask: { counsel: ["For a product I shut down, do I refund unused paid time or run to the end of term?"], accountant: ["How do I record a product ending in my obrt?"] }
    },

    pricing: {
      title: "Prices, discounts and the new price list", tint: "#FFF3D6", overview: "partly",
      line: "What your product pages have to show, and the rule behind every \"was\" price.",
      minute: "Show the full price, say whether VAT is included or not charged, and say what's included. From 17 November 2026 Croatian traders with a website also publish a current price list, though the ministry's publication rule isn't out yet. If you ever announce a discount, the \"was\" price has to be the lowest price you charged in the 30 days before. Fake \"was\" prices are one of the most checked things in EU consumer law.",
      remember: ["Full price, VAT status, what's in.", "\"Was\" means your lowest price in 30 days.", "Price list on the site from 17 Nov."],
      facts: [
        { f: "Do consumers buy, or only businesses?", w: "Most price rules protect consumers." },
        { f: "Are you in the VAT register?", w: "Decides whether you write \"VAT included\" or \"VAT not charged\"." },
        { f: "Do you ever run discounts or launch prices?", w: "That brings in the 30-day prior-price rule." }
      ],
      steps: [
        { t: "Fix every price line", d: "Amount, per month or per year, VAT included or not charged in wording your accountant confirms, and what the price covers.", v: "Read each pricing section aloud. A buyer knows the full cost." },
        { t: "Publish a dated price list", d: "One page with every current price, matching what you invoice.", v: "The page exists, is dated, and matches your last invoice." },
        { t: "Keep a price history", d: "A small file or table with each price and the dates it applied.", v: "You can show your lowest price over any 30-day window." },
        { t: "Write discounts against that history", d: "\"Was EUR 49, now EUR 39\" only if EUR 49 was your lowest price in the 30 days before the discount.", v: "Check the claim against the history before you publish." },
        { t: "Watch for the ministry rule", d: "The publication method for the price list is still pending.", v: "A calendar reminder to check monthly." }
      ],
      traps: ["\"Launch price\" with no earlier price to compare to.", "A \"was\" price you only charged for a day.", "\"Prices exclude VAT\" when you're not in the VAT register."],
      deeper: [
        { h: "Price list from 17 November 2026", b: "A new Croatian duty for traders with websites. The method of publication is left to a ministerial rule that was not verified yet.", src: "ZZP as amended by NN 59/2026, Art. 7(9) and 7(12). Claims N-HR-TRADER-INFO-10, N-HR-CONSUMER-INFO-02." },
        { h: "Prices must be clear", b: "Show prices clearly, and say whether tax, delivery and other costs are included.", src: "ZET Art. 6(2). Claim N-HR-TRADER-INFO-02." },
        { h: "The 30-day prior-price rule", b: "When you announce a price reduction, the prior price is the lowest price you applied in at least the 30 days before. Overview, not yet in the claim-by-claim research.", src: "Directive 98/6/EC Art. 6a, inserted by Directive (EU) 2019/2161." }
      ],
      ask: { counsel: ["Does the price-list duty cover a subscription service, and has the ministry rule been issued?", "How does the prior-price rule apply to a launch discount on a new product?"], accountant: ["What exact VAT wording should my prices carry?"] }
    },

    terms: {
      title: "Terms for your SaaS and studio work", tint: "#E3F4F6", overview: "yes",
      line: "Two documents: one for product buyers, one for client projects.",
      minute: "Your SaaS terms and your studio terms do different jobs. SaaS terms cover renewal, cancellation, availability, what happens to data and how you change the terms. Studio terms cover scope, payment, who owns what, and your role with the client's data. For consumer buyers, unfair terms are not binding, so keep them plain and balanced. Terms never replace a processing agreement where you handle someone's customer data.",
      remember: ["SaaS terms and studio terms are different.", "Plain and balanced for consumers.", "Terms are not a DPA."],
      facts: [
        { f: "Are any buyers consumers?", w: "Unfair-terms and withdrawal rules then apply." },
        { f: "Do you host or touch client data?", w: "Then you also need an Art. 28 agreement." },
        { f: "Who owns the code and design at the end?", w: "Decide it in writing before the project starts." }
      ],
      steps: [
        { t: "List what each set of terms covers", d: "SaaS: price, renewal, cancellation, availability, support, data on exit, changes. Studio: scope, milestones, payment, IP, AI tools used, data role.", v: "Both outlines fit on one page each." },
        { t: "Link the right terms at the right step", d: "SaaS terms at checkout, before payment. Studio terms with the quote.", v: "A test order shows the terms link before Pay." },
        { t: "Add the processing agreement", d: "For client sites you host and for SaaS customers who put their own customers' data in.", v: "Every active client and SaaS account has an accepted version and date." },
        { t: "Plan how you change terms", d: "Notice by email, a date, and a way to leave.", v: "A short change clause is in both." },
        { t: "Have a lawyer read them once", d: "Bring the outlines and your three biggest worries.", v: "Written comments saved." }
      ],
      traps: ["Copying another SaaS's terms with their governing law still in.", "Silent auto-renewal for consumers.", "Studio terms that say nothing about who owns the work."],
      deeper: [
        { h: "Consumer contracts", b: "Pre-contract information, withdrawal and durable confirmation apply to consumer buyers. See Subscriptions.", src: "ZZP Art. 60, 79, 81a. Claims N-HR-CONSUMER-INFO, N-HR-CONSUMER-WITHDRAW." },
        { h: "Unfair terms", b: "Standard terms that create a significant imbalance against a consumer are not binding. Overview, not yet in the claim-by-claim research.", src: "Directive 93/13/EEC. ZZP unfair-terms provisions." }
      ],
      ask: { counsel: ["Can you review my SaaS and studio terms outlines?", "Which governing law and liability cap suit a one-person studio?"], accountant: [] }
    },

    promo: {
      title: "Promoting your work: ads and disclosure", tint: "#FDE9EE", overview: "yes",
      line: "Paid posts, partner links and collaborations need a clear label.",
      minute: "If you're paid, gifted or given a commission to talk about something, say so clearly at the start, in the language your audience reads. In Croatia a plain label like \"oglas\" or \"plaćena suradnja\" works better than a hashtag buried at the end. The same goes for your own promotions: an email or post that sells is marketing, so the email permission rules still apply.",
      remember: ["Paid, gifted or affiliate? Say so first.", "Label in the audience's language.", "Promo email still needs permission."],
      facts: [
        { f: "Were you paid, gifted or on commission?", w: "Any of those makes it an ad." },
        { f: "Where does it appear?", w: "Each platform's built-in paid-partnership label helps." }
      ],
      steps: [
        { t: "Label every paid or gifted post", d: "First line or on the image: \"oglas\", \"plaćena suradnja\" or \"ad\".", v: "Visible without tapping \"more\"." },
        { t: "Mark affiliate links", d: "A short line near the link.", v: "Every affiliate link has a label next to it." },
        { t: "Keep promo email inside the rules", d: "Permission, your name and a free stop link.", v: "See Email campaigns." }
      ],
      traps: ["#ad hidden among 20 hashtags.", "Disclosure only in a bio."],
      deeper: [
        { h: "Hidden advertising", b: "Using editorial content to promote a product you paid for, without making that clear, is a banned practice in EU consumer law. Overview, not yet in the claim-by-claim research.", src: "Directive 2005/29/EC Annex I point 11." },
        { h: "Commercial communications online", b: "Commercial messages must be clearly identifiable, with the sender identified.", src: "Directive 2000/31/EC Art. 6. Claim family F-ECOMMERCE." }
      ],
      ask: { counsel: ["Which Croatian guidance applies to my posts about my own products and partners?"], accountant: ["How do I book gifted products and affiliate income?"] }
    },

    copyright: {
      title: "Copyright and AI output in client work", tint: "#EEEAFB", overview: "yes",
      line: "Who owns what you make with AI, and what to put in the contract.",
      minute: "EU copyright protects human creative choices. Output that an AI produced with little human shaping may not be protected at all, so you can't always transfer \"all rights\" to a client. Write contracts that assign whatever rights exist, say which AI tools you used, and promise only what you control. Check each model provider's terms on output ownership and on using client inputs.",
      remember: ["Copyright needs a human's creative choices.", "Assign what exists. Don't promise more.", "Say which AI tools you used."],
      facts: [
        { f: "How much did you shape the output?", w: "More human choices, more chance of protection." },
        { f: "What do the model's terms say?", w: "Some vendors claim nothing. Some restrict use." }
      ],
      steps: [
        { t: "Add an AI clause to your studio terms", d: "Which tools, for what, and that you review all output.", v: "The clause is in your quote template." },
        { t: "Assign rights carefully", d: "\"All rights that exist in the deliverables\", plus a licence for anything that isn't protectable.", v: "Read it as the client would." },
        { t: "Check input rules", d: "Don't paste client confidential material into tools whose terms allow training on it.", v: "Each AI tool you use is on a business plan with training off." }
      ],
      traps: ["Promising exclusive ownership of pure AI output.", "Using a consumer AI plan for client files."],
      deeper: [
        { h: "Originality", b: "Protection needs the author's own intellectual creation. Overview, not yet in the claim-by-claim research.", src: "CJEU C-5/08 Infopaq. Zakon o autorskom pravu i srodnim pravima, NN 111/2021." },
        { h: "The data side", b: "Client files in an AI tool are personal data processing too. See the AI inbox helper and Client sites guides.", src: "GDPR Art. 28. Claim family F-GDPR-PROCESSOR." }
      ],
      ask: { counsel: ["Can you check my AI and IP clause for client work?"], accountant: [] }
    },

    payments: {
      title: "Stripe checkout: SCA and surcharges", tint: "#E9F7F0", overview: "partly",
      line: "Strong authentication, no card surcharges, and the withdrawal button.",
      minute: "Stripe handles most of the payment law for you. Strong customer authentication (3-D Secure) runs automatically on EU cards, so use Stripe's own Checkout or Payment Element rather than custom card fields. You can't add a surcharge for paying by consumer card in the EU. And since 19 June 2026, online consumer contracts also need a prominent withdrawal function.",
      remember: ["Let Stripe run 3-D Secure.", "No card surcharges for consumers.", "Withdrawal button since 19 June 2026."],
      facts: [
        { f: "Stripe Checkout, Payment Element, or custom?", w: "Stripe's own UI handles SCA without extra work." },
        { f: "Do consumers buy?", w: "Brings in the surcharge ban and the withdrawal function." }
      ],
      steps: [
        { t: "Use Stripe Checkout or the Payment Element", d: "Not your own card fields.", v: "A test EU card triggers the 3-D Secure screen." },
        { t: "Remove any card fee", d: "One price whatever card the consumer uses.", v: "Checkout shows no payment-method fee." },
        { t: "Label the pay button", d: "Make clear the click means paying, like \"Pay now\" or \"Narudžba s obvezom plaćanja\".", v: "The button text says payment." },
        { t: "Add the withdrawal function", d: "\"raskid ugovora\", a confirm step and a dated acknowledgement. See Subscriptions.", v: "Run it on a test account." },
        { t: "Fiscalise consumer payments", d: "Card and bank-transfer consumer payments need a fiscalised receipt. Ask your accountant which tool.", v: "One fiscalised receipt per payment type." }
      ],
      traps: ["A \"card fee\" line at checkout.", "Custom card fields that skip 3-D Secure."],
      deeper: [
        { h: "Withdrawal function", b: "Since 19 June 2026 covered online consumer contracts need a withdrawal function, confirmation and durable acknowledgement.", src: "ZZP Art. 81a, NN 59/2026. Claim N-HR-CONSUMER-WITHDRAW-04." },
        { h: "SCA and surcharges", b: "Payment services rules require strong customer authentication for most online card payments and ban surcharges on consumer card payments covered by the interchange rules. Overview, not yet in the claim-by-claim research.", src: "Directive (EU) 2015/2366 Arts. 62(4) and 97." }
      ],
      ask: { counsel: [], accountant: ["Which tool fiscalises my Stripe consumer payments?"] }
    },

    eusell: {
      title: "Selling across the EU: geo-blocking and OSS", tint: "#FFF3D6", overview: "partly",
      line: "Same price for every EU buyer, and VAT where the consumer lives above EUR 10,000.",
      minute: "Two rules once you sell beyond Croatia. You can't block or redirect EU buyers by country, or give them worse terms because of where they live. You don't have to deliver everywhere, but SaaS buyers must be able to buy on the same terms. And once your cross-border consumer sales of digital services pass EUR 10,000 a year, VAT is charged at the buyer's country rate, usually through OSS.",
      remember: ["No country blocks for EU buyers.", "EUR 10,000 is the VAT switch.", "Keep two proofs of buyer location."],
      facts: [
        { f: "Do you sell to consumers in other EU countries?", w: "Brings in the EUR 10,000 rule and OSS." },
        { f: "Is your product an electronically supplied service?", w: "Automated SaaS usually is. Hand-built work may not be." }
      ],
      steps: [
        { t: "Remove country blocks and redirects", d: "Every EU buyer reaches the same checkout.", v: "Load the site through a VPN in another EU country." },
        { t: "Track cross-border consumer sales", d: "A running yearly total toward EUR 10,000.", v: "Matches your invoice records." },
        { t: "Store two proofs of location", d: "For example billing country and IP country.", v: "Recent EU consumer orders each have two." },
        { t: "Ask your accountant about OSS", d: "And the 1 January 2027 changes.", v: "A written answer." }
      ],
      traps: ["Auto-redirecting visitors to a country site they can't buy from.", "Assuming under EUR 60,000 means no foreign VAT."],
      deeper: [
        { h: "The EUR 10,000 rule", b: "Combines qualifying cross-border electronic services and intra-EU distance sales of goods.", src: "VAT Directive Art. 59c. Claim family F-TAX." },
        { h: "Geo-blocking", b: "Traders may not block access or apply different general conditions to EU customers for electronically supplied services, other than copyrighted content, based on nationality or residence. Overview, not yet in the claim-by-claim research.", src: "Regulation (EU) 2018/302 Arts. 3 and 4(1)(b)." }
      ],
      ask: { counsel: [], accountant: ["Am I near EUR 10,000 in cross-border consumer sales?", "Do I need OSS now, or from 2027?"] }
    },

    dataact: {
      title: "SaaS switching under the Data Act", tint: "#E3F4F6", overview: "yes",
      line: "If you sell SaaS, customers must be able to leave and take their data.",
      minute: "The Data Act has applied since 12 September 2025. Its switching chapter covers data processing services, which includes SaaS. Customers must be able to switch to another provider or take their data out, with notice of at most two months and a transition of up to 30 days. Switching charges end on 12 January 2027. There is a lighter regime for custom-built services and test versions. Small size does not exempt you from the switching chapter.",
      remember: ["Customers can leave with their data.", "Max two months notice, 30-day transition.", "No switching fees from 12 Jan 2027."],
      facts: [
        { f: "Is it a standard SaaS, or custom-built per client?", w: "Custom-built services get a lighter regime." },
        { f: "Can customers export their data today?", w: "If yes, most of the work is done." }
      ],
      steps: [
        { t: "Build a full export", d: "A one-click export of everything the customer put in, in a common format.", v: "Export a test account and re-import it." },
        { t: "Put switching terms in your SaaS terms", d: "Notice period, transition period, export formats, deletion after exit.", v: "The terms page has a section on leaving." },
        { t: "Drop any exit fees", d: "By 12 January 2027 at the latest.", v: "No exit charge in your price list." }
      ],
      traps: ["Export that only covers part of the data.", "Exit fees hidden as \"migration support\"."],
      deeper: [
        { h: "Switching between data processing services", b: "Providers must remove obstacles to switching and give contractual rights on notice, transition and data export. Overview, not yet in the claim-by-claim research.", src: "Regulation (EU) 2023/2854, Chapter VI, Arts. 23 to 31, and Art. 50." }
      ],
      ask: { counsel: ["Does my SaaS fall under Data Act Chapter VI, or the custom-built exception in Art. 31?"], accountant: [] }
    }
  },

  saasTitle: "Subscriptions and renewals",

  fixPack: {
    privacyRows: [
      { tool: "Vercel Analytics", purpose: "Page statistics", note: "Decide: remove, or load after Accept." },
      { tool: "Visitor counter", purpose: "Visit total", note: "Decide: remove the counter or its cookie." },
      { tool: "Google Fonts", purpose: "Fonts", note: "Self-host and remove this row." },
      { tool: "FormSubmit", purpose: "Delivers form messages", note: "Name it as a recipient. Check its terms." },
      { tool: "Workshop form", purpose: "Send the workshop link and one reminder", note: "Retention: a short time after the event." },
      { tool: "Contact form", purpose: "Answer your message", note: "Retention: as long as the conversation needs." }
    ],
    workshopForm: "<form action=\"https://formsubmit.co/…\" method=\"post\">\n  <label for=\"email\">Email</label>\n  <input id=\"email\" name=\"email\" type=\"email\" required>\n\n  <p class=\"notice\">\n    I use your email to send the workshop link and one reminder.\n    <a href=\"/privacy\">Privacy</a>\n  </p>\n\n  <label>\n    <input type=\"checkbox\" name=\"future_workshops\" value=\"yes\">\n    Email me about future workshops. Unsubscribe any time.\n  </label>\n\n  <button type=\"submit\">Save my seat</button>\n</form>",
    contactForm: "<form action=\"https://formsubmit.co/…\" method=\"post\">\n  <label for=\"name\">Name</label>\n  <input id=\"name\" name=\"name\">\n  <label for=\"email\">Email</label>\n  <input id=\"email\" name=\"email\" type=\"email\" required>\n  <label for=\"msg\">Message</label>\n  <textarea id=\"msg\" name=\"message\" required></textarea>\n\n  <p class=\"notice\">\n    I use this to reply to you. FormSubmit delivers it.\n    <a href=\"/privacy\">Privacy</a>\n  </p>\n\n  <button type=\"submit\">Send</button>\n</form>",
    readme: ["Keep: your own pages, self-hosted fonts.", "Decide: Vercel Analytics and the visitor counter. Remove if nobody reads them, or load after Accept.", "Self-host fonts: download the .woff2 files, add @font-face, delete the Google Fonts link.", "Re-run: pnpm check --site tamara.rocks and confirm nothing optional loads before a choice."]
  }
};
