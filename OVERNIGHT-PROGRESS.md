# Overnight rebuild — carsonpoore.com v2

Started: Oct 7, 2026, 8:30pm ET · Target: done before morning · Deploys to main in stages.

## Locked decisions (from Carson's 8 answers)
1. **Identity:** Growth consultancy. 4 practices: Marketing · Technical · Strategy · Coaching & Growth.
2. **Technical claims:** AI agents & automation, websites & web apps, CRM/ops/data, Google Ads, GA4, GoHighLevel, data management.
3. **Market:** Indy/central-Indiana local hub + national reach for technical & coaching.
4. **Client pathways:** local small businesses · founders & startups · nonprofits.
5. **Lead magnets:** instant download, no email gate, book-a-call CTA inside.
6. **Coaching offer:** fractional CMO / advisory retainer.
7. **Scale:** ~25–35 pages.
8. **Deploy:** push to main all night.

## Stages
| # | Stage | Status | Pages/outputs |
|---|-------|--------|----------------|
| A | Research sweep (10 agents, 160 web lookups, 0 errors) | ✅ done 9:10pm | docs/research/* (10 files) |
| B | Strategy: 36-page blueprint, messaging map, canonical chrome, schema base, copy-QA gates, v2 CSS/JS layer | ✅ done 9:40pm | docs/strategy/*, styles.css v2 layer, site.js |
| C | Template batch: 5 pages + ICP deliverable, builder+QA all passed | ✅ done | index, services, services/marketing, services/local-seo, articles/fractional-cmo-cost, docs/deliverables/icp-profiles.md |
| D | Pathways, services, client pages, 5 tools, resources hub | ✅ done | 18 pages |
| E | Core rewrites (method, pricing, about, contact, work, ticket, 404) | ✅ built | 7 pages |
| F | Articles | ✅ 7/7 built | articles/* |
| G | Final wave + voice QA (6 Sonnet batches) + 1 Fable review + browser tests + ship | ✅ shipped | 36/36 pass audit; 5/5 tools tested |

ETA per stage: A ~30–45m · B ~20m · C ~60–90m · D ~90m · E ~60m · F ~60m · G ~45m.

## Decision log
- 8:30pm — Coaching pricing: pathway ships with the offer fully described; any *new* published number is anchored to the existing public tiers and flagged here for morning review (money copy = calm, no wit).
- 8:30pm — Extended .gitignore (node_modules, dist, .astro, .claude, .superpowers, src) and .vercelignore (this file, docs/).
- 8:30pm — Batch rule adapted for away-mode: first 2–3 pages of each batch are built as the template, QA'd hard, then the batch follows that proven template. No approval pauses per the long-runs rule.
- 9:40pm — Voice correction: blueprint drifted to solo-operator "I" voice; kept the site's standing team "we" voice (per voice skill + Carson's earlier "shift voice to team" commit). Differentiator reworded to "one team, four practices."
- 9:40pm — Nav: Services + "Who we help" dropdowns (CSS-only, keyboard-accessible), Pricing keeps /investment URL, About moves to footer/mobile. /ticket stays off nav+footer (QR campaign page).
- 9:40pm — NAP ships without phone/street (none published — service-area business). sameAs empty: need Carson's LinkedIn + GBP URLs in the morning.
- 9:40pm — All internal links now root-absolute extensionless; local preview switched to `npx serve` (respects cleanUrls).
- ~10:30pm — STALL: account monthly spend limit hit mid-Phase-C; 6 builders completed, 5 QA agents failed. Held the push (new nav links would 404 on live site with half the sitemap missing).
- 9:45am Oct 8 — Carson said "try again"; limit window reset. Resumed C's QA from cache + launched D (18 pages). Overnight target slipped to late morning because of the limit, not the pipeline.
- Decision: tools link to /contact with a plain link (no score-param gimmick). No NEW pricing published anywhere: coaching/advisory presented inside the existing $1,200/$2,400/$4,800 tiers.
- 10:05am — Phase C QA green (5/5). Canon fix: coaching category range reconciled to the sourced $3,000–$15,000 (MarketerHire/GoFractional) in messaging-map + index; crumbs-in-hero declared canonical. Morning TODOs: home hero photo still hot-links Unsplash (v1 pattern — self-host later?); spot-check BrightLocal 93% figure; footer h4 heading-skip accepted for launch.
- 10:05am — Carson (live): tier agent models by task. E/F/G waves run Sonnet (mechanical/template work), Opus (writing-heavy), Fable only for hardest judgment. D was already in flight.
- ~10:40am — Second spend-limit stall mid-D (5 of 18 built) and at E+F start (0 of 13). Carson cleared it; resumed both with model tiering on everything not yet cached (opus writers, sonnet QA).
- ~3:55pm — Carson: Fable gated to ~5% (one final review). All agents now carry explicit models: Opus for checkup + founders, Sonnet for 4 tools/resources/all QA, Fable for one 6-page review. Per-page QA agents replaced by docs/qa/audit.js (free scripted checks) + 6 batched Sonnet voice-QA agents.
- ~3:55pm — Scripted audit: 29/29 existing pages pass (chrome, schema, links, assets, one h1, no truncation). sitemap.xml (34 URLs, ticket+404 excluded), robots.txt (AI crawlers allowed), llms.txt written.
- ~4:30pm — Final wave: 14 agents, 0 errors. Fable review (6 pages) made 5 fixes. I fixed: 76% "near me" stat re-attributed to Google (not BrightLocal) on 3 pages; google-ads past-history claim turned into stated policy; coaching cap wording matched to /investment's "eight retainer clients at a time"; "See work we've done" → "How we report results"; /contact now reads check-up/visibility results, shows them, and prefills Cal.com booking notes.
- Browser-verified: all 5 tools end to end (zero console errors), contact handoff, mobile home at 375px (no horizontal overflow).

## Carson's decision list (needs you, not me)
1. **Strategy credit:** if a $3,000 strategy client continues to a retainer, is the $3,000 credited? Pages say "start with strategy, then keep us on" — one sentence on /investment answers it.
2. **What counts toward the 8-client cap?** Retainers only (current wording everywhere now), or strategy + project work too?
3. **/investment legacy claims under the new model:** "Most clients start here" badge on $2,400; "full team behind it" / "Dedicated team capacity" on $4,800. True today?
4. **Project-work list** still sells Photography, Video, Product design, Brand identity — keep on the rate card or fold under Marketing/Technical?
5. **Stat spot-checks (all cited, none verified against live primary sources):** vcita 2025 churn survey; Housecall Pro/Hearth $80 vs $45 leads; BlitzMetrics $14,775 story; GHL $3,564 vs HubSpot $14,880; superscout $892M/147 deals (founders page); MarketerHire/GoFractional $3K–$15K (coaching cites Chief Outsiders/Kalungi instead — pick one pair); crm-gohighlevel "$300 to $5,000-plus" consultant range has no named source — name or cut.
6. **Profiles for entity SEO:** send LinkedIn (company + personal) and Google Business Profile URLs → I add them to every page's sameAs. Then: verify Google Search Console + Bing Webmaster Tools, submit /sitemap.xml to both (ChatGPT search relies on Bing's index).
7. **Home hero photo** still hot-links Unsplash (v1 pattern) — self-host?
8. **90-Day Plan Starter** capitalization: Title Case product name vs footer's sentence case.

## Round 2 — Carson's answers applied (Oct 8, afternoon)
1. Strategy credit: half the $3,000 ($1,500) credited toward a retainer — on /investment (copy + OfferCatalog), /services/strategy, /services, coaching, founders, technical, marketing, llms.txt.
2. 8-client cap counts every client — all "eight retainer clients" / "clients, total" wording now "eight clients at a time", incl. schema.
3. Tier claims stay (fee chart coming).
4. Project work: kept on /investment AND named inside Marketing (brand identity, photography, video) and Technical (web design & development, product design) on /services + both practice pages.
5. Stats: 118 stat references cut (max 2 per page, 4 per article, short inline attribution, all "Sources:" captions removed).
6. LinkedIn added to every footer + founder sameAs in every page's schema. No GBP yet.
7. Home hero photo self-hosted at /media/photos/home-hero-crew.jpg (Unsplash, Nate Johnston).
8. Tool names Title Case everywhere.
- Grey text: 250 items cut (eyebrows, side notes, source captions, labels); Blueprint Ref/Sec/coordinate labels removed from site.js; hero coordinates removed; "Last updated" kept on articles only; 7 motion loops re-rendered without burned-in Ref./Fig./coordinate captions.
- Still yours: verify Google Search Console + Bing Webmaster Tools and submit /sitemap.xml (needs your Google/Microsoft logins).
