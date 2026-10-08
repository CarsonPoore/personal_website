# JSON-LD base — copy and adapt per page type

One `<script type="application/ld+json">` per page, a single `@graph`. The Organization node ships on EVERY page exactly as below (entity consistency); add page-type nodes to the same graph. No telephone/street (service-area business; none published). sameAs intentionally empty until Carson supplies profile URLs (morning TODO).

## Organization node (every page, verbatim)
```json
{
  "@type": "ProfessionalService",
  "@id": "https://carsonpoore.com/#org",
  "name": "Carson Poore Consulting",
  "url": "https://carsonpoore.com/",
  "logo": "https://carsonpoore.com/brand/cpc-mark-royalblue.svg",
  "image": "https://carsonpoore.com/brand/carson-headshot.png",
  "email": "carson@carsonpoore.com",
  "description": "A growth consultancy in Indianapolis with four practices — marketing, technical, strategy, and coaching — for small businesses, founders, and nonprofits. Prices published on the site.",
  "address": { "@type": "PostalAddress", "addressLocality": "Indianapolis", "addressRegion": "IN", "addressCountry": "US" },
  "areaServed": [
    { "@type": "City", "name": "Indianapolis" },
    { "@type": "State", "name": "Indiana" },
    { "@type": "Country", "name": "United States" }
  ],
  "priceRange": "$1,200–$4,800/month",
  "founder": { "@id": "https://carsonpoore.com/about#carson" }
}
```

## Person node (About page full; elsewhere reference by @id in author/founder)
```json
{
  "@type": "Person",
  "@id": "https://carsonpoore.com/about#carson",
  "name": "Carson Poore",
  "jobTitle": "Founder",
  "worksFor": { "@id": "https://carsonpoore.com/#org" },
  "image": "https://carsonpoore.com/brand/carson-headshot.png",
  "knowsAbout": ["Marketing strategy", "Local SEO", "Google Ads", "Marketing automation", "AI agents", "GoHighLevel", "GA4", "Fractional CMO services", "Nonprofit marketing"]
}
```

## Per page type (add to the @graph)
- **Service/pathway pages:** `Service` { name, description, provider: {"@id": ".../#org"}, serviceType, areaServed (City Indianapolis + State Indiana; add Country United States on technical/coaching/analytics/ai/crm pages) } + `Offer` with price/priceCurrency only where a real published price applies ($3,000 strategy). + BreadcrumbList.
- **Pricing page:** `OfferCatalog` with the three tiers + strategy engagement as Offers (price, priceCurrency "USD", description includes 3-month minimum and 8-client cap).
- **Articles:** `Article` { headline, description, author: {"@id": ".../about#carson"}, publisher: {"@id": ".../#org"}, datePublished: "2026-10-08", dateModified: "2026-10-08", mainEntityOfPage: canonical URL }.
- **FAQ sections (any page):** `FAQPage` with mainEntity Question/acceptedAnswer — text must mirror the visible on-page Q&A exactly.
- **Breadcrumbs (every page below top level):** `BreadcrumbList` with itemListElement positions matching the visible crumb trail.
- **Tools:** `WebApplication` { name, applicationCategory: "BusinessApplication", operatingSystem: "Web", offers: { "@type": "Offer", "price": "0", "priceCurrency": "USD" } } + BreadcrumbList.

Every page also gets a visible `Last updated: October 2026` line (class `updated`) near the footer or byline.
