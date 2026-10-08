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
| A | Research sweep (10 parallel agents: 3 ICPs, local+national SEO, AEO/GEO, competitors, lead magnets, humanization, design) | ⏳ running | docs/research/* |
| B | Strategy: sitemap, ICP doc, client profiles, messaging map, template system | queued | docs/strategy/* |
| C | Core rebuild: home, 4 pathway hubs, nav/footer system | queued | ~6 pages |
| D | Service pages + client-type pages | queued | ~12 pages |
| E | Lead magnets + resources hub | queued | ~6 pages |
| F | SEO/AEO articles | queued | ~7 pages |
| G | Sitewide QA (links, schema, mobile, voice pass), sitemap.xml, robots.txt, llms.txt, final deploy | queued | — |

ETA per stage: A ~30–45m · B ~20m · C ~60–90m · D ~90m · E ~60m · F ~60m · G ~45m.

## Decision log
- 8:30pm — Coaching pricing: pathway ships with the offer fully described; any *new* published number is anchored to the existing public tiers and flagged here for morning review (money copy = calm, no wit).
- 8:30pm — Extended .gitignore (node_modules, dist, .astro, .claude, .superpowers, src) and .vercelignore (this file, docs/).
- 8:30pm — Batch rule adapted for away-mode: first 2–3 pages of each batch are built as the template, QA'd hard, then the batch follows that proven template. No approval pauses per the long-runs rule.
