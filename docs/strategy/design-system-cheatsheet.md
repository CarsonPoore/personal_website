# CPC site v2 — design-system cheat sheet (give to every build agent)

Plain HTML/CSS/JS. No build step, no framework. Every page is a complete standalone file. Shared styles in `/styles.css`, behavior in `/site.js`, decorative loops in `/motion-a.css` `/motion-b.css` `/motion-c.css` (+ `/motion-d.css` for v2 additions).

## Palette (CSS vars in :root)
- `--navy #0B1B33` dark backdrop (heroes, footers, statement bands) · `--navy-2 #142647` raised surface on navy
- `--cobalt #1E4FD8` primary action/accent · `--amber #E0A030` sparse emphasis (one word, key number) — never a background or long text
- `--bone #F8F7F4` page bg · `--stone-2 #eaedf1` alt light bg · `--ink-2 #3a4560` body text on light · `--cream-2 #c8cee0` body text on navy
- **No gradients, ever. Flat fills only.** Depth = layering, shadow, scale contrast. Headlines on dark are white — the signature move.
- Figtree only. Hierarchy by weight/size: 800–900 headlines, 700 labels, 400 body. Type scale vars `--step--1` … `--step-6`.

## Section system
`<section class="section">` bone bg · `section--stone` · `section--navy` · `section--cobalt` · `section--tight`. Headings/body auto-recolor per variant. `.wrap` (1320px) / `.wrap--narrow` (920) / `.wrap--wide` (1520).

## Components (classes that already exist — reuse, don't reinvent)
- `.eyebrow` small-caps label w/ amber tick (`eyebrow--plain` no tick) · `.label` tiny caps label
- `.btn btn--primary|--ghost|--ghost-light|--dark|--amber` pills; arrow: `<span class="arr">→</span>` · `.tlink` underline link · `.row-cta` button row
- `.sec-head` section heading block (eyebrow + h2 + `.sec-head__intro`)
- `.cards` + `.card`/`.card__num` numbered card grid (3-up) · `.icon-tiles` + `.icon-tile` circle-icon tiles (`icon-tile__icon--amber|--navy`, inline svg 26px)
- `.split` 2-col grid · `.approach` split w/ `.approach__title` stacked triplet + `.process-list` numbered rail list
- `.svc-list` + `.svc`/`.svc__idx`/`.svc__title`/`.svc__body` big numbered service rows (services page)
- `.steps`/`.step`/`.step__num`(giant numeral)/`.step__label`/`.step__body` (method) · `.method-rail` sticky rail w/ IntersectionObserver active state
- `.tier-grid` + `.inv-card`(`--featured` navy version)/`.inv-card__price`/`.inv-list`/`.inv-card__terms` pricing tiers · `.every-tier` · `.price-flag` · `.reassure`
- `.fit-grid`/`.fit-card`(`__yes`/`__no`) for/not-for lists · `.q-list` numbered question list · `.pull` pull quote (em = amber) · `.stat-row`/`.stat__num`/`.stat__lbl`
- `.values`/`.value`/`.value__name` · `.faith` quiet note band · `.about-card` · `.portrait` · `.case-grid`/`.case` work cards · `.holding`
- `.marquee`/`.marquee__track` scrolling ticker (dup content 2× for loop) · `.closing` full-bleed cobalt CTA band (`.closing__inner`)
- `.placeholder--portrait|--square|--wide|--tall` image placeholders · `.feat-media` photo card w/ flat color block accents
- Helpers: `.mt-sm|md|lg|xl`, `.hl-amber`, `.hl-cobalt`
- Reveal: add `class="reveal"` (+ `data-delay="1..5"`) to anything that should fade up on scroll. site.js IntersectionObserver handles it; reduced-motion safe. Hero copy uses delays 1/2/3.

## Page chrome
Every page: fixed `.nav` (navy → bone on scroll) + `.mobile-menu` + `.footer` (4-col grid: brand / tagline / Explore / Get started) + `<body class="page">` (page-in animation). **v2 canonical chrome (exact nav/footer markup) is in `docs/strategy/chrome-v2.html` — copy it verbatim; do not improvise nav items.**

## Hero patterns
- Home: `.hero` navy, `.hero__grid` asymmetric copy/media, `.hero__media` photo + flat `hero__block-a/b/c` color blocks, `.hero__coords` vertical coordinates strip (hidden <1180px).
- Inner pages: `.page-hero` navy, centered-left: eyebrow → h1 (one `<em>` highlighted word, amber via `.page-hero em` or `.hl-amber`) → `.hero__sub`.
- Blueprint frame details (brand signature): hairline grid lines, bracket corner marks, small annotation labels ("REF. 01", "SEC. 02 / 04", coordinates). Present on home hero; echo sparingly on key pages.

## Motion loops (Remotion-rendered, in /media/motion/)
Embed pattern (poster PNG + VP9-alpha webm + HEVC-alpha mp4; site.js picks codec, lazy-plays on visibility, respects reduced-motion):
```html
<video class="motion-loop" muted loop playsinline preload="none"
  poster="/media/motion/NAME.png" data-webm="/media/motion/NAME.webm"
  data-hevc="/media/motion/NAME-hevc.mp4" width="W" height="H" aria-hidden="true"></video>
```
Available loops: a-hero-route (1920×160 route strip), a-approach-rail (56px vertical rail), a-closing-field (full-bleed bg), a-services-link (connector behind icon tiles), a-404-path, a-ticket-dial (inline dial), a-ticket-perf, b-svc-engine, b-svc-traced (full-bleed line), b-method-start (plumb line), b-retainer-cadence (band under tiers), b-eight-seats (inline), c-mission-roads (full-bleed bg), c-values-glyphs (4-cell strip), c-work-ghost-mark, c-contact-path, c-cal-ruler, c-handoff, central-indiana, method-stack, one-roof, proof-line, tactics-to-system, tier-stack. Placement CSS in motion-a/b/c.css; new placements go in motion-d.css with `pointer-events:none`, `aria-hidden`, decorative only. Reuse loops on new pages where the metaphor fits (e.g. proof-line on work/case content, tactics-to-system on strategy pages, one-roof on services hub, central-indiana on local pages).

## Brand assets (/brand/)
cpc-mark-offwhite.svg (on navy/cobalt) · cpc-mark-royalblue.svg (on light) · cpc-mark-navy.svg · cpc-lockup-white.svg · cpc-signature-bracket-offwhite.svg · cpc-grain-dark.png / cpc-grain-soft.png (0.06–0.12 opacity washes) · carson-headshot.png · client-image.png. Logo never rotated/skewed, ever.

## v2 technical conventions (NEW — differ from v1, follow exactly)
1. **All internal links root-absolute and extensionless:** `href="/services/google-ads"`, `href="/"`, never `services.html` or relative paths. Assets root-absolute: `/styles.css?v=20261008-1`, `/brand/...`, `/media/motion/...`.
2. New page files live at e.g. `services/google-ads.html`, `for/small-business.html`, `resources/NAME.html`, `articles/NAME.html` — Vercel cleanUrls serves them extensionless.
3. Head block every page: charset, viewport, `<title>` (≤60 chars, brand-voiced), meta description (140–160 chars), canonical `<link rel="canonical" href="https://carsonpoore.com/PATH">`, OG title/description/type/url, Figtree Google Fonts links, favicon `/brand/cpc-mark-royalblue.svg`, `/styles.css?v=20261008-1`, motion css only if used, `<script defer src="/site.js?v=20261008-1"></script>`.
4. JSON-LD per page type (one `<script type="application/ld+json">` before `</head>`): all pages → Organization ref; service pages → Service + BreadcrumbList + FAQPage (if FAQ present); articles → Article + FAQPage; local pages → ProfessionalService w/ areaServed; about → Person (Carson Poore). NAP consistent: Carson Poore Consulting, Indianapolis, IN, carson@carsonpoore.com.
5. Accessibility: one h1 per page, logical heading order, alt text on real images, `aria-hidden` on decorative, visible focus, WCAG AA contrast (body on light = `--ink-2`, never `--muted` for long copy), `prefers-reduced-motion` respected (the shared systems already do).
6. Every page ends with a `.closing` CTA band (vary the copy per page — never identical boilerplate) before the footer.
7. FAQ sections: `<section>` with h2 + semantic blocks (details/summary styled, or h3+p). Questions phrased as real searches ("What does a fractional CMO cost?").

## Voice (full guide: carson-poore-consulting-voice skill — distilled)
Candid friend who happens to be a strategist. Write to one person ("you"). "We" for CPC (first-person "I" only in founder notes/ticket page). Open by recognizing the reader, not CPC. Short sentences, contractions, active verbs, real numbers as numerals. One `<em>` highlighted idea per headline, sentence case. CTAs specific + low-pressure ("Book a discovery call", "Read the five steps" — never "Learn more"/"Get started now"). NO: hype (game-changing, skyrocket, unlock), jargon (funnel, leverage, synergy, ROI-driven, seamless, elevate, robust, delve), pushy urgency, vague claims ("drives results"), fear-led openers. Money/pricing copy: calm, straight, zero wit. Humor = clever reframes in headlines only, never on money. Every page leaves the reader feeling seen, then energized, with one doable next step.

## Humanity pass (apply while writing, not after)
Ban: "It's not just X, it's Y" constructions · stacked triads · em-dash chains · uniform sentence rhythm · "In today's..." openers · summary endings that restate · over-parallel headings. Use: specific Indiana details, real numbers, varied sentence length (a 4-word sentence beside a 24-word one), occasional mid-thought asides, concrete verbs.
