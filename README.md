# Carson Poore — Personal Site

Astro 6, vanilla CSS, deployed on Vercel. Single-page consulting-positioned site.

## Stack
- Astro 6 (static output)
- Inter + JetBrains Mono + Instrument Serif (Google Fonts)
- IntersectionObserver for scroll-reveal
- No framework, no Tailwind

## Structure
```
src/
  layouts/Base.astro       # html shell, fonts, nav + footer
  components/
    Nav.astro
    Hero.astro             # name, headline, ticker
    Position.astro         # the wedge
    Method.astro           # 5 numbered steps
    Worldview.astro        # 6 contrarian beliefs
    Filter.astro           # who this is for / not for
    Refuse.astro           # what I refuse to be confused with
    About.astro            # faith-as-values
    Contact.astro          # pitch + filter questions
    Footer.astro
  pages/index.astro        # composes the page
  scripts/reveal.ts        # IntersectionObserver scroll-reveal
  styles/global.css        # design tokens + primitives
public/
  assets/cp-mark.png
```

## Develop
```
npm install
npm run dev      # http://localhost:4321
npm run build    # static output in dist/
```

## Deploy
Vercel auto-detects Astro. `vercel.json` adds clean URLs and immutable cache for `/assets/*`.

## Edit content
Copy is held inline in each component (`src/components/*.astro`) so a single section can be updated without touching the others. Headline/pitch live in `Hero.astro` and `Contact.astro`.
