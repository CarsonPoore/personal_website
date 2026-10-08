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
| C | Template batch: home, services hub, marketing pathway, local-seo service, fractional-CMO article, ICP deliverable | ⏳ running | 5 pages + docs |
| D | Service pages + client-type pages | queued | ~12 pages |
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
