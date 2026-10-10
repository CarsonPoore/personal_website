# Client pathways + first-visit loader — design

Date: 2026-10-09 · Status: draft for review

## Intent

Visitors come from three different worlds: local businesses, founders and startups, and nonprofits. Today the pathways are buried in a "Who we help" dropdown and one homepage section, so everyone reads the same site, including material meant for the other two audiences. The goal is to ask one question early ("Who's the work for?") and then show each visitor a site that leads with their world.

**Decided with Carson**
- Tailor, don't hide. Content for other audiences is de-emphasized, reordered, or collapsed behind "Other …", but it is never removed from the HTML. This keeps SEO intact and protects people who pick the wrong path.
- The loader appears on the **first visit to the homepage only**. Other entry pages get a slim path bar instead.

**Success**
- A first-time homepage visitor answers the question in one click. Every page they visit afterward leads with their path.
- No flash of the generic layout on load. No layout shift. Nothing breaks without JS.
- A path can be switched from any page in one click.
- Crawlers and no-JS visitors see the current site, unchanged.

## Paths

| Key | Label | Hub |
|---|---|---|
| `local` | Local business | `/for/local-businesses` |
| `founders` | Founder or startup | `/for/founders` |
| `nonprofits` | Nonprofit | `/for/nonprofits` |
| *(none)* | Just looking | — (generic site, as today) |

## Architecture

New files:
- **`path.js`**: the only module that reads or writes path state. It exposes `CPPath.get()`, `CPPath.set(key)`, and `CPPath.clear()`, and dispatches a `cp:path` event when the path changes. It also builds the loader, the path bar, and every re-ordering or collapse. Loaded with `defer` on every page.
- **`path.css`**: all path-conditional styles, keyed on `html[data-path="…"]`.
- **Inline head snippet** (about 6 lines, identical on every page, placed before the CSS links). It reads `?path=` (which takes precedence and is saved) or `localStorage["cp.path"]`, then sets `document.documentElement.dataset.path` before first paint. On the homepage, when no choice has been stored at all, it also sets `data-loader="pending"`.

State:
- `localStorage["cp.path"]` holds `local` | `founders` | `nonprofits` | `none`. `none` means the visitor chose "Just looking" or dismissed the bar. All access is wrapped in try/catch. If storage is unavailable, the path is held in memory for the current page only.
- `?path=<key>` sets the path and persists it, for ads, emails, and QR codes. The parameter is removed from the address bar with `history.replaceState`.

Markup conventions (added to existing pages):
- `data-for="local founders"` marks a block as relevant to those paths. Untagged blocks are relevant to everyone.
- In a list wrapped with `data-path-sort`, children tagged for the current path move to the top. The others move into a trailing `<details class="path-more"><summary>Other …</summary>` that `path.js` creates. The original order is restored when the path is `none`.
- `data-path-copy="founders"` on alternate copy spans. By default, CSS shows the untagged generic span and hides the alternates. When a path is set, its alternate is shown and the generic span is hidden. Crawlers see the generic copy and the alternates as normal text. This is used only for short strings: headlines, subheads, CTAs.

## Components

### 1. Loader (homepage only, first visit)
- Shown when `data-loader="pending"`. The overlay is defined in `index.html` markup and is visible through CSS from the first paint, so there is no flash of the homepage underneath.
- Sequence: the CPC mark draws in (about 900 ms), then the question fades up: **"Who's the work for?"** Below it are three photo cards (reusing the homepage card photos), each with a one-line descriptor, plus a quiet "Just looking around" text button.
- Choosing a card sets the path, the overlay fades out (300 ms), and focus moves to the homepage `h1`. The homepage is already tailored underneath.
- Accessibility: `role="dialog"`, `aria-modal`, labelled by the question, and focus trapped. Esc counts as "Just looking." Cards are real buttons.
- `prefers-reduced-motion`: the draw-in animation is skipped and the question appears immediately.
- No JS: the overlay is hidden by default. Only the inline snippet adds `data-loader`, and `path.css` is what shows the overlay.
- Failsafe: if `path.js` has not loaded within 4 s, the snippet's timeout removes `data-loader`.

### 2. Path bar (every page except while the loader is showing)
- A slim strip directly under the nav.
- No choice stored: "Who are you here for?" followed by three chips and a ×. The × stores `none`.
- Path set: "You're on the **Founders** path · See your next steps → · Switch." Switch opens the three chips inline, plus "Show everything."
- `none` stored: the bar is hidden. The footer gets a "Choose your path" link that reopens it.
- Height is reserved in CSS whenever `data-path` or a pending state exists, so there is no layout shift.

### 3. Nav
- When a path is set, the "Who we help" dropdown label becomes "Your path." The current hub is listed first and marked, and the other two stay available underneath.
- In the Services dropdown, path-relevant services get a small dot and are listed first within each column.
- In the mobile menu, the same order applies, and the path's hub link is pinned to the top.

### 4. Per-page tailoring

| Page | Change |
|---|---|
| Homepage | Hero `h1`, subhead, and primary CTA switch to the path's hub hero copy (already written on the `/for/*` pages). The "Three kinds of clients" section shows the visitor's card at full width; the other two shrink to links. The services grid and pricing teaser use `data-path-sort`. The FAQ puts path-tagged questions first. |
| `/for/*` hubs | A new "Your next steps" numbered rail near the top: 1 your problem (anchor), 2 relevant services, 3 pricing for you, 4 a free tool, 5 book a call. It is always visible, because the hubs are the path spine. |
| `/services` and dropdown | `data-path-sort` on the service list. Non-path services go under "Other services." |
| `/investment` | `nonprofits`: the reduced-rate note moves up into a callout above the tiers. `founders`: the strategy engagement and project pricing come before the retainers. `local`: retainers lead, with the System tier marked "most local businesses pick this." |
| `/articles` | The default filter becomes the path's topics. Everything else is under "More articles." Article pages get "Next for you" links (2–3 path-tagged articles + hub). |
| `/tools` (resources) | `data-path-sort`. |
| `/contact`, `/ticket` | The audience field is prefilled. If the form has no such field, a hidden `path` input is added so the submission carries it. |
| `/method`, `/about`, `/work`, `/ownership` | Path bar only. In `/work`, case studies get `data-path-sort` if tagged. |

## Path mapping (draft — please check)

**Services**
| Service | local | founders | nonprofits |
|---|---|---|---|
| Marketing (practice) | ● | ● | ● |
| Branding | | ● | ● |
| Content marketing | | ● | ● |
| Social media | ● | | ● |
| Video & photo | ● | ● | ● |
| SEO & AI search | ● | ● | |
| Local SEO | ● | | ● |
| Google Ad Grants | | | ● |
| Technical (practice) | ● | ● | ● |
| Web design & development | ● | ● | ● |
| AI & automation | ● | ● | |
| GoHighLevel & CRM | ● | | ● |
| Google Ads | ● | ● | |
| GA4 & analytics | | ● | ● |
| Strategy & planning | | ● | ● |
| Coaching & growth | ● | ● | |

**Articles**
- **local:** google-business-profile-optimization, how-to-get-more-google-reviews, local-seo-indianapolis, not-showing-up-on-google, google-ads-vs-facebook-ads, google-ads-cost-small-business, website-not-getting-leads, automate-lead-follow-up, is-gohighlevel-worth-it, gohighlevel-vs-hubspot, best-crm-for-small-business, how-often-to-post-on-social-media, small-business-website-cost, small-business-marketing-budget, diy-marketing-vs-hiring, ai-chatbot-for-website, get-recommended-by-chatgpt
- **founders:** startup-go-to-market-no-budget, fractional-cmo-cost, fractional-cmo-vs-marketing-agency, when-to-hire-fractional-cmo, marketing-consultant-cost, one-page-marketing-plan, measure-marketing-roi, ga4-for-small-business, ai-agents-for-small-business, does-blogging-still-work, small-business-email-marketing, website-redesign-or-refresh, get-recommended-by-chatgpt
- **nonprofits:** nonprofit-google-ad-grant, nonprofit-marketing-small-budget, small-business-email-marketing, how-often-to-post-on-social-media, one-page-marketing-plan, measure-marketing-roi, ga4-for-small-business, does-blogging-still-work, website-redesign-or-refresh

**Tools**
| Tool | local | founders | nonprofits |
|---|---|---|---|
| Local visibility check | ● | | ● |
| Five-step check-up | ● | ● | ● |
| Marketing budget calculator | ● | ● | |
| 90-day plan starter | | ● | ● |
| AI opportunity finder | ● | ● | |

**Primary CTA per path**
- local: "Run the free local visibility check" → `/tools/local-visibility`. Secondary: book a call.
- founders: "Book a strategy call" → `/contact?path=founders`. Secondary: 90-day plan.
- nonprofits: "See if you qualify for $10k/mo in free ads" → `/services/google-ad-grants`. Secondary: book a call.

## Copy

Hero copy reuses the existing `/for/*` hero lines, which already passed copy QA. New strings (the loader question and card descriptors, path bar text, "Other …" labels, the next-steps rail) are written under the `carson-poore-consulting-voice` skill and checked against `docs/` copy QA gates.

## Rollout across pages

`chrome-v2` already standardises the head and nav. A one-off Node script (`scripts/add-path-layer.mjs`, run once and kept in the repo) does three things:
- inserts the head snippet plus the `path.css` and `path.js` tags into every `*.html` page outside `docs/`, `dist/`, `motion/`, and `.superpowers/`;
- adds a `data-for` attribute to each nav, footer, and listing link whose `href` matches the mapping above;
- is idempotent, using a marker comment.

Homepage, hub, investment, and contact edits are done by hand.

## Error handling / edge cases
- An unknown `?path=` value is ignored.
- Storage blocked: the loader still works for that page view. The bar shows on the next page, because the choice could not be saved.
- Visitor with a path set lands on another audience's hub (from search): the path is **not** switched automatically. The bar offers "Looks like you're reading the Nonprofits page — switch?"
- Bots: the loader markup sits after main content in the DOM and only shows when the snippet's JS runs. Crawlers get the plain page.
- Back/forward cache: `pageshow` re-reads the stored path, so a path switched in one tab applies when you return.

## Testing
- Browser preview on the homepage, a hub, `/services`, `/investment`, `/articles`, an article, and `/contact`, once for each of local, founders, nonprofits, and none, plus the pending loader state.
- First-paint check: throttle the network and confirm no generic-copy flash and no CLS from the path bar.
- Keyboard-only loader run. Screen reader names via the accessibility tree.
- Reduced-motion run, no-JS run (the page matches today's site), and mobile at 375px.
- `?path=nonprofits` deep link persists across navigation and is removed from the URL.

## Out of scope
- Server-side personalization, analytics events (can be added later, with a hook in `CPPath.set`), and new per-path pages beyond the existing hubs.
- Rewriting article bodies per path.
