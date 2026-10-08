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
| D | 3 pathways + 6 services + 3 client pages + 5 tools + resources hub | ⏳ running | 18 pages |
| E | Lead magnets + resources hub | queued | ~6 pages |
| F | SEO/AEO articles | queued | ~7 pages |
| G | Sitewide QA (links, schema, mobile, voice pass), sitemap.xml, robots.txt, llms.txt, final deploy | queued | — |

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
