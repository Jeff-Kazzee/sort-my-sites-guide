# Sort My Sites: owner's manual

This is your private guide for your four sites. It shows what a check found on each site, what each result means, and how to fix it. It is not legal advice. Sources were checked on 7 November 2026.

Contents:

1. Open the guide
2. Find your way
3. Read a finding
4. Your first scan: what we found
5. Fix it, step by step
6. Answer these questions
7. Check again
8. What is in this folder
9. Good to know

## 1. Open the guide

The guide needs a small web server, because it reads its content from the `.js` files in this folder. If you open `index.html` with a double-click, most browsers show an empty page.

To open it on your computer:

1. Open a terminal in this folder.
2. Type `npx serve guide` and press Enter.
3. Open the address that the terminal shows, for example `http://localhost:3000`.

To put it online:

1. Make a new Vercel project from this repository.
2. Set the root directory to `guide`.
3. Do not add a build step. The `guide` folder holds plain static files.

**Caution:** `guide/scan-data.js` lists the weak points of your sites. Do not put the guide on a public address while that file is in it. Delete the file from the deployment, or keep the deployment private.

## 2. Find your way

The menu on the left has four groups.

| Group | Page | Use it to |
|---|---|---|
| Your sites | Start | See what to do first, and the next dates. |
| | Report | See all results from the last scan, site by site. |
| | Consent states | See what loads on a site before and after a cookie choice. |
| | Email and DNS | See your mail records now, and the records to add. |
| Your answers | Questions | Answer the questions that change your results. |
| | Checklists | Tick the steps that you completed. |
| Learn | Guides, Basics, Decide, Dates, World, Library | Read the rules in plain words, with their sources. |
| Hand off | Agent, Specialists, Fix pack, About | Give tasks to an AI agent, prepare questions for a lawyer or an accountant, and copy ready-made code. |

Use the buttons in the top bar to change the language (EN or HR) and the theme (Day or Night). The scan results (finding titles, fixes and DNS notes) are in English only. The rest of the guide changes to Croatian.

The "Copy the re-run command" buttons do not scan anything themselves. They copy the scan command, so you can run it in a terminal in this folder.

## 3. Read a finding

Each result in the Report is a finding. Each finding has one status.

| Status | What it means | What to do |
|---|---|---|
| Observed | The scan saw the problem, and the evidence is attached. | Do the fix. |
| Not seen this run | The scan looked for it and did not see it. This is not proof that it is absent. | Nothing, unless you know more. |
| Could not check | The scan could not reach or press something. This is not good news. It is a gap. | Check it by hand, or scan again from the EU. |
| Needs your answer | The result depends on a fact that only you know. | Answer the question. |
| Needs a specialist | The result depends on a legal opinion. | Send the question to a lawyer. |

There is no score and no "compliant" badge. A site with no findings is not proof that the site is correct.

Open a finding to see these parts:

- **The title and one sentence.** These tell you what is wrong.
- **Evidence.** This shows what the scan saw: requests, cookies, DNS records or form details.
- **Why it matters.** This tells you the rule, in plain words. The rule names link to the Library.
- **The fix.** This gives copy-ready code. If there is more than one tab, pick the tab for your setup.
- **Who and how long.** This tells you who does the fix and the time that it takes.
- **Check it worked.** This tells you how to make sure that the fix works.

The re-check button on a finding copies the scan command. To scan again, see section 7.

## 4. Your first scan: what we found

The scan ran on 8 November 2026, at 16:42 Croatian time. It read the public pages of your four sites, like a visitor. It did not log in and it did not send any form.

**Important:** the scan ran from a server in the United States. Many cookie banners show only to visitors in the EU, so the scan marks consent results from outside the EU as "Could not check". We also read the code of all four sites by hand. None of them has a consent tool or a cookie banner, and none of them changes what it shows by country. So an EU visitor gets the same pages as the scan did, and there is no banner to press Reject or Accept on. Scan again from Croatia to confirm this.

### Summary

| Site | Observed | Needs your answer | Needs a specialist | Could not check |
|---|---|---|---|---|
| tamara.rocks | 5 | 6 | 1 | 0 |
| nosastra.co | 4 | 2 | 1 | 0 |
| welcomebook.eu | 6 | 4 | 0 | 0 |
| vibeordev.com | 4 | 5 | 1 | 1 |

### What the scan saw on each site

**tamara.rocks** (personal site and free workshop)

- The workshop form and the contact form have no privacy notice next to them.
- The home page has no link to a privacy notice.
- The domain has no mail records: no MX, no SPF and no DMARC.
- The fonts Fraunces and Nunito load from Google Fonts.
- Four security headers are missing.
- The contact form sends messages to FormSubmit, a third-party form service.
- The site stores a cookie named `tamara_rocks_visitor` for 12 months, before any choice.
- The page loads icons from `cdn.simpleicons.org`.
- Vercel Web Analytics runs before any choice.

**nosastra.co** (studio site)

- The project form has no privacy notice next to it. The footer has a Privacy Policy link, but it is not next to the form.
- DMARC is set to `p=none`. This only collects reports. Forged mail still gets delivered.
- The font Manrope loads from Google Fonts.
- Four security headers are missing.
- The page loads a script from `signal-by-nosastra.vercel.app`.
- Vercel Web Analytics runs before any choice.
- Mail is set up correctly otherwise: Zoho MX, one SPF record and DKIM keys for Zoho and Resend.

**welcomebook.eu** (guest guide for hosts)

- The contact form has no privacy notice next to it.
- The home page has no link to a privacy notice.
- The site shows prices ("Izrada od €99 po sezoni"), but we found no trader details: no OIB, no register entry and no legal form.
- The domain has no mail records: no MX, no SPF and no DMARC.
- The fonts Baloo 2, Nunito Sans and Fraunces load from Google Fonts.
- Four security headers are missing.
- The page loads a script from `xpmetric.com`.
- The page also asks for a script from `umami-tamara.vercel.app`, but that address returns an error (404). Your Umami statistics do not run on this site.
- The site stores `landing.lang` in local storage.

**vibeordev.com** (AI quiz)

- Google Analytics (`G-27YQEFBZD8`) loads on the first page view and sets the `_ga` cookies, before any choice. The Report marks this "Could not check", because the scan ran from the US. The site code shows that it is the same for every visitor: the code loads Google Analytics at start-up, has no banner and never asks for consent. Treat this as a real problem.
- The home page has no link to a privacy notice.
- The domain has no mail records: no MX, no SPF and no DMARC.
- The fonts Inter and Space Grotesk load from Google Fonts.
- Four security headers are missing.
- The page reads quiz scores from a Supabase project.
- The site stores `vctd:leaderboard:v3` in local storage.
- Vercel Web Analytics runs before any choice.

## 5. Fix it, step by step

Do the fixes in this order. The first fixes protect the people who use your sites. The later fixes are hygiene.

### Fix 1. Add a privacy notice link and a notice line on each form

Sites: all four. Who: you. Time: about 15 minutes for each form, after you have a privacy notice.

1. Write one privacy notice for each site. It tells people who you are, what you collect, why, which tools receive it, how long you keep it and how they use their rights. The Fix pack page in the guide helps you write it.
2. Put a link to the notice in the footer of every page.
3. Put a notice line above the submit button of each form:

```html
<p class="form-notice">
  We use your details only to answer this message.
  Read how in our <a href="/privacy">privacy notice</a>.
</p>
```

For welcomebook.eu, use Croatian:

```html
<p class="form-notice">
  Vaše podatke koristimo samo da odgovorimo na ovu poruku.
  Više u <a href="/privatnost">izjavi o privatnosti</a>.
</p>
```

The workshop form on tamara.rocks is a signup, not a message, so it needs its own notice. Set the time in brackets yourself:

```html
<p class="form-notice">
  We use your email to confirm your place at the free live AI workshop,
  and to send you the joining link and one reminder before it starts.
  We delete it [two weeks after the workshop].
  Read how in our <a href="/privacy">privacy notice</a>.
</p>
```

If you also use the address for a recording or for future workshops, name that use in the notice, or put it behind the box in step 4.

4. If the workshop form also sends news about future workshops, add one box. It must not be ticked when the page opens.

```html
<label>
  <input type="checkbox" name="marketing" value="yes">
  Send me news about future workshops. Optional. You can unsubscribe at any time.
</label>
```

Make sure that it worked: the notice line and its link show above each submit button.

### Fix 2. Protect your domains from forged email

Sites: tamara.rocks, welcomebook.eu and vibeordev.com. Who: you, in the DNS panel of each domain. Time: 10 minutes for each domain.

These three domains have no mail records. Anybody can send mail that shows your domain in the From line.

1. Find out if any tool sends mail as the domain. For example, the workshop signup on tamara.rocks can send a confirmation email. Look at the sender address of that email.
2. **If the domain sends no mail,** add these three records:

```
Type: MX    Name: @       Priority: 0    Value: .
Type: TXT   Name: @       Value: v=spf1 -all
Type: TXT   Name: _dmarc  Value: v=DMARC1; p=reject;
```

If your DNS panel does not accept the MX record with the value `.`, do not add it. Add the other two records.

3. **If the domain sends mail,** copy the SPF and DKIM records from the setup page of the tool that sends. Then add this record. First, make an alias `dmarc@` that forwards to your inbox.

```
Type: TXT   Name: _dmarc  Value: v=DMARC1; p=none; rua=mailto:dmarc@tamara.rocks
```

Change `tamara.rocks` to the domain that you set up.

**Caution:** on all four domains, random subdomains answer (for example `anything.tamara.rocks`). This often comes from a wildcard record that your DNS host adds. Before you add the three records, make sure that no preview site or app on a subdomain sends mail.

Make sure that it worked: type `nslookup -type=TXT _dmarc.tamara.rocks`. The result shows the new record.

### Fix 3. Move nosastra.co DMARC from watch to enforce

Site: nosastra.co. Who: you, in the DNS panel. Time: 10 minutes, after a few weeks of reports.

1. Read the DMARC reports that arrive at hello@nosastra.co for two to four weeks.
2. Make sure that the reports show only Zoho and Resend as senders.
3. Change the DMARC record to:

```
Type: TXT   Name: _dmarc  Value: v=DMARC1; p=quarantine; rua=mailto:hello@nosastra.co; ruf=mailto:hello@nosastra.co; sp=none; adkim=r; aspf=r; pct=100;
```

This keeps every other part of your record and changes only `p`. Two more things to think about:

- `sp=none` keeps subdomains at "watch only". If no subdomain sends mail, change it to `sp=quarantine` too.
- `ruf` sends failure reports, and they can contain parts of messages. Point it at a separate alias, for example `ruf=mailto:dmarc-failures@nosastra.co`, not at your main inbox.

### Fix 4. Add trader details to welcomebook.eu

Site: welcomebook.eu. Who: you, with your accountant. Time: 30 minutes.

The site shows prices, so it is a commercial site. A commercial site in Croatia must show who runs it (Electronic Commerce Act, Article 6). Add these details to the footer of every page:

```html
<footer>
  <p>
    [Business name], [obrt or d.o.o.], [street and number], [postcode] [city], Croatia<br>
    OIB: [11 digits]. Registered in [obrtni registar or sudski registar], number [number].<br>
    Email: <a href="mailto:[your address]">[your address]</a>
  </p>
</footer>
```

Ask your accountant which register entry and which VAT note apply to you.

### Fix 5. Host your fonts yourself

Sites: all four. Who: you or your developer. Time: 30 minutes for each site.

Each page view now sends the IP address of the visitor to Google. If you host the font files yourself, the fonts look the same and nothing goes to Google.

1. Download the `.woff2` files of each font into a `/fonts` folder on the site. The fonts are:
   - tamara.rocks: Fraunces, Nunito
   - nosastra.co: Manrope
   - welcomebook.eu: Baloo 2, Nunito Sans, Fraunces
   - vibeordev.com: Inter, Space Grotesk
2. Remove every `<link href="https://fonts.googleapis.com/...">` tag from the pages.
3. Add one `@font-face` block for each font and weight:

```css
@font-face {
  font-family: 'Manrope';
  src: url('/fonts/manrope-400.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
```

Make sure that it worked: open the site, open DevTools, then the Network tab. Filter on "font". Every font comes from your own domain.

### Fix 6. Add security headers

Sites: all four. Who: you or your developer. Time: 15 minutes for each site.

All four sites are on Vercel. Add a `vercel.json` file in the root of each project:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" },
        { "key": "Content-Security-Policy-Report-Only", "value": "default-src 'self'; frame-ancestors 'self'" }
      ]
    }
  ]
}
```

The Content Security Policy starts in report-only mode. It does not block anything yet. When the browser console shows no reports for a week, change the key to `Content-Security-Policy` and add the hosts that your site needs.

Make sure that it worked: type `curl -I https://www.nosastra.co/`. The result shows each header.

### Fix 7. Load Google Analytics on vibeordev.com only after Accept

Site: vibeordev.com. Who: you or your developer. Time: 1 to 2 hours.

The site code loads Google Analytics for every visitor at start-up, with no banner. Do the fix in the Report. Open the finding "Could not tell what an EU visitor gets before a choice on vibeordev.com". The fix tab has the code that loads Google Analytics only after the visitor presses Accept. You also need a banner with Accept and Reject buttons that are equally easy to press. Another option is to remove Google Analytics and use a tool that needs no consent. Ask a specialist before you decide that a tool needs no consent.

## 6. Answer these questions

These results need a fact that only you know. Answer them on the Questions page.

| Question | Sites | Why it matters |
|---|---|---|
| Which Vercel plan is each site on? | All four | Vercel's terms say that a Hobby plan is for personal or non-commercial use only. Its data processing agreement names Pro and Enterprise customers. A site that earns money or shows prices needs a paid plan. |
| Is the site commercial? | tamara.rocks, vibeordev.com | If yes, it needs trader details like Fix 4. |
| What does each unknown service do? | All four | `cdn.simpleicons.org`, `signal-by-nosastra.vercel.app`, `xpmetric.com` and the Supabase project. If a service tracks visitors, it must wait for Accept. |
| What does each stored item do? | tamara.rocks, welcomebook.eu, vibeordev.com | `tamara_rocks_visitor`, `landing.lang`, `vctd:leaderboard:v3`. An item that only does what the visitor asked for (a language choice, a quiz score) is fine. An item for statistics must wait for Accept. |
| Do you have a data processing agreement with FormSubmit? | tamara.rocks | FormSubmit stores the messages that people send. You need its agreement for your plan. |

Send this question to a lawyer:

- Vercel Web Analytics runs before any choice on tamara.rocks, nosastra.co and vibeordev.com. It sets no cookies. Does it need consent under Article 43(4) of the Croatian Electronic Communications Act? The Specialists page has the full question.

## 7. Check again

The checker is in the `engine` folder. The guide calls a scan "the outside check", because it sees only what a visitor sees. You need Node 24 and pnpm.

To set it up one time, type these commands in this folder:

```sh
pnpm install
pnpm exec playwright install --only-shell chromium
```

To scan again, type this command in this folder:

```sh
pnpm check --site tamara.rocks --site nosastra.co --site welcomebook.eu --site vibeordev.com
```

- Run it from an EU connection, so the scan can see your cookie banners. Your first scan after you get this guide is the first scan from the EU.
- The command writes a new `guide/scan-data.js`. The guide shows the new results when you reload it.
- The Report shows what you fixed and what is new since the last scan.

What the checker does:

- It opens each site in a new browser three times: with no choice, after Reject and after Accept. Each time, it records what loads and what the site stores.
- It reads the mail records (MX, SPF, DMARC and DKIM) through the public DNS services of Cloudflare and Google.
- It checks HTTPS, redirects, certificates and security headers.
- It reads the forms and links on the home page. It does not send a form and it does not log in.
- It asks `cloudflare.com/cdn-cgi/trace` for the country of your connection.

It does not check these yet:

- Withdrawing consent after Accept. Do this by hand: accept, open the cookie settings, withdraw, reload, and look at the Network tab in DevTools.
- Pages after the home page, and pages behind a login.
- Tracking from the server.
- Accessibility.

## 8. What is in this folder

| Path | What it holds |
|---|---|
| `guide/index.html` | The guide |
| `guide/support.js` | The small runtime that the guide needs |
| `guide/scan-data.js` | The results of the last scan. Do not edit it by hand. |
| `guide/guide-data.js` | Guides, basics, dates, glossary, world notes, deciders |
| `guide/sms-data.js` | Your eight questions, start order, earning-online guides, fix pack |
| `guide/kit-data.js` | Questionnaire, agent commands, agent checklists |
| `guide/modules-data.js` | The full research modules, with sources |
| `guide/rules-data.js` | The research library: 375 rules with sources |
| `guide/i18n.js` | English and Croatian text |
| `engine/` | The checker, with its rules, fixes and vendor list |
| `package.json` | The `check` command and the one dependency, Playwright |

If you delete `guide/scan-data.js`, the guide shows the empty report.

## 9. Good to know

- Your ticks and answers stay in your browser. The guide sends nothing anywhere.
- The guide loads its own fonts from Google, and React and Babel from unpkg. Host them yourself before you put the guide online (see Fix 5).
- The research rules behind each finding are still drafts. Each "why" says "the research library says" for that reason.
- The scan can make mistakes. Each finding shows its evidence. If the evidence looks wrong, tell Jeff.
- This guide is not legal advice. For a legal decision, use the Specialists page.
