# Shared brief for blog-batch article agents

Site: carsonpoore.com (Carson Poore Consulting, Indianapolis growth consultancy). Repo /Users/Carson/personal_website, plain static HTML, Vercel cleanUrls. Today: 2026-10-09.

## Before writing (once per agent)
1. Invoke Skill `carson-poore-consulting-voice` and follow it strictly; skim `carson-poore-consulting-brand`.
2. Read the three approved samples and copy their exact structure/chrome (head, nav, breadcrumb, footer, same CSS/JS cache-bust versions, byline with "Last updated: Oct 9, 2026", answer block, `.table-scroll` table, FAQ, tool-handoff band, Keep reading, Where to next, closing "Book a free call" CTA, JSON-LD @graph with Organization node verbatim + Article + FAQPage + BreadcrumbList):
   - articles/get-recommended-by-chatgpt.html
   - articles/nonprofit-marketing-small-budget.html
   - articles/not-showing-up-on-google.html
3. Read docs/copy-qa-checklist.md (pass all 24 gates), docs/strategy/messaging-map.md (binding rules: never-publish list, pricing language, tool names), docs/research/aeo-geo.md.
4. Read the article's primary service/tool/pathway page(s) so claims and prices match. Never invent CPC prices or claims; use only what the site states.

## Each article
- Answer the target query in the first 50 words with concrete specifics; reasoning after.
- 1,400–2,200 words. Mostly question-style H2s (vary at least one). At least one table.
- 5–8 external statistics, each with a named source inline and linked; every one verified via WebSearch/WebFetch in this session. Unverifiable → cut. No fabricated URLs.
- 4–6 FAQs; FAQPage JSON-LD text must match visible FAQ exactly. Article JSON-LD datePublished/dateModified 2026-10-09, author Carson Poore.
- Title ≤ 60 chars, meta description 140–160 chars, canonical, og tags (og:image ok).
- Honest "when it's not worth it / who should skip" angle where it fits.
- Exactly one h1, no em dashes in body copy, no horizontal scroll at 375px (tables in their own scroll wrapper).
- Reuse existing photos in /media (keep credit comments) and existing hero motion; no new media.
- Internal links: primary service/tool page + /investment where pricing comes up + 2 related /articles (existing ones or others from docs/strategy/blog-batch-plan.md by slug).
- Don't overlap: an article on a neighbouring topic gets a summary + link, not repeated detail.

## Boundaries
- Write ONLY your assigned articles/<slug>.html files. Do not edit resources.html, sitemap.xml, llms.txt, footer, or any other file. Do not commit.
- Return per article: path, title, meta description, word count, sources cited, judgment calls.
