# Blog batch progress (started 2026-10-09 ~10:45pm ET)

Stage 1 samples: 3/3 done (website-cost, get-recommended-by-chatgpt, nonprofit-marketing-small-budget)
Stage 2 remaining 21 articles: 21/21 DONE
Stage 3 scripted QA: script ready; 3/3 samples PASS (bylines normalized). Mobile 375px checked on nonprofit sample: OK
Stage 4 batched QA review: DONE (4 reviewers, all 24 PASS)
Stage 4b blog hub /articles: BUILT (docs/tools/build-blog-index.py → articles/index.html). 8 topics, search, sticky topic chips, #topic deep links, Start-here row, CollectionPage+ItemList schema. Filter/search/hash tested; no h-scroll at 375px. Rebuild after each batch.
Stage 5 integrate: DONE — 67 pages nav dropdown + footer, 31 article breadcrumbs, sitemap +25, llms +25, resources.html; browser-checked desktop + 375px. Committed + pushed.

## Decision log
- Carson said "go and keep building" after samples → full batch approved.
- Article stat cap raised 4 → 5–8 (my recommendation; messaging-map.md updated). Non-article pages stay at 2.
- Byline standardized to "Last updated: Oct 9, 2026" (website-cost sample said "Updated"; normalize in Stage 3).
- Sonnet for remaining 21 per model-tiering memory; Opus was used for the 3 samples.
- Blog hub lives at /articles (articles/index.html, generated). Topics: Local search & Google, Websites, Ads & analytics, Content/email/social, CRM/AI/automation, Strategy & budget, Hiring marketing help, Nonprofits.
- Strategy group (diy, one-page-plan, startup-gtm) + web/AI group (chatbot, redesign, not-getting-leads) back: 6/21. diy has 4 stats (under 5 floor, within old cap) — accepted.
- FLAGS for Stage 4 / Carson: (1) live small-business-marketing-budget attributes 7–8% to SBA; agent couldn't find it on sba.gov (old SBA page, now removed?). (2) HBR 2011 "7x within an hour" only verified secondhand. (3) Google 2016 "53% abandon after 3s" — website-cost sample cut it as stale; redesign + not-getting-leads use it (flagged as 2016). Decision: cut it for consistency in Stage 4.
- Ads/ROI group back: 9/21. Flags for Carson: no Meta-ads-management claim made (site never says CPC runs Meta ads); line "A $1,200 retainer costs more than $1,000 of ad spend..." in google-ads-cost needs his OK; "$500/mo floor" is labeled opinion.
- Content group back: 12/21. QA source floor relaxed to 4 unique linked sources (several stats can share one source).
- Local group back: 15/21 (+coaching files present, report pending; CRM pending).
- FLAGS (live pages, pre-existing): "3-pack gets 126% more traffic" attributed to BrightLocal on not-showing-up-on-google + /services/local-seo — traces to SOCi, not BrightLocal. "40+ reviews at 4.5+ → 3.7x 3-pack" (not-showing-up, /tools/local-visibility) unverifiable. Not changed in this run; listed for Carson.
- Coaching group back: 18/21. Verified canonical==filename on all articles (sibling agent ran another agent's build.py once).
- CRM group back. FLAG: HubSpot @5,000 contacts = $13,680/yr in gohighlevel-vs-hubspot (MH Pro + contact block) vs $14,880/yr live on /services/crm-gohighlevel + is-gohighlevel-worth-it (likely incl. Sales Hub seats). Article explains both; service page may need reconciling.
- resources.html updated: counts 7→31, 6 featured articles, 'Browse all 31 articles' → /articles. Budget dek says 'common 7–8% guideline' (not 'SBA's') pending Carson's call on the SBA attribution. Sitemap/llms + integrate-blog.py run AFTER QA (avoid racing reviewers' article edits).
- QA local/hiring done (4 edits; +Credo source to consultant-cost). I cut unverified "Outerbox: narrow jobs start in low thousands". 
- QA content/ads done (7 edits): retainer line softened; explicit "We don't manage Facebook or Instagram ads" in ads-vs-fb; removed unbacked CPC claims in email/social.
- Sent web/strategy reviewer an extra fix: chatgpt article GBP-vs-websites citation wording (42% websites as group, GBP 28.5% largest single platform).
- FLAG: services/local-seo.html still says "126% more traffic, per BrightLocal" (live, outside batch).
- QA CRM done (small edits). HBR 7x CONFIRMED via HBR preview text (Wayback) → keep everywhere; told web reviewer. HubSpot gap = exactly one Sales Hub Pro seat ($1,200/yr); article now says so. Unverified-but-kept: HubSpot annual $800 line, Workato Mar 2026 figures.
