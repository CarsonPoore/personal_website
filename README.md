[README.md](https://github.com/user-attachments/files/28201004/README.md)
# Carson Poore Consulting — Website

Static multi-page marketing site for Carson Poore Consulting. Built as plain HTML/CSS/JS — no build step, no framework, deploys directly to Vercel as a static site.

## Stack

- **HTML / CSS / JS** — no build step
- **Fonts:** Archivo (Akzidenz-Grotesk substitute) for display, Jost (Futura substitute) for body — both via Google Fonts
- **Scheduling:** Cal.com inline embed on `/contact`
- **Hosting:** Vercel (static)

## Structure

```
.
├── index.html         # Home
├── services.html      # Services
├── method.html        # The method (5 steps)
├── investment.html    # Pricing / packages
├── about.html         # About Carson
├── contact.html       # Contact + Cal.com embed
├── work.html          # Work (case studies — currently a holding line)
├── 404.html           # Not found
├── styles.css         # All site styles
├── site.js            # Nav, reveals, tweaks
├── motion.js          # Scroll-driven motion
├── vercel.json        # Clean URLs + cache headers
└── brand/             # Logo + photography
    ├── cp-monogram.png
    ├── carson-headshot.png
    ├── client-image.png
    └── letterhead.png
```

## Client pathways

Visitors pick who the work is for (local business, founder, nonprofit, or "just looking"), and every page leads with that path. Spec: `docs/superpowers/specs/2026-10-09-client-pathways-design.md`.

- `path.js` holds the audience mapping (`MAP`, `ARTICLES`) and all path behaviour: the path bar, nav tailoring, `data-path-sort` lists, "Next for you" on articles, and the homepage loader. Add a new service, tool, or article to `MAP`/`ARTICLES` or the mapping test fails.
- `path.css` holds the copy variants (`data-path-generic` / `data-path-copy="founders"`), the bar, the loader, and per-page styles.
- Every page carries an inline head snippet (`scripts/path-snippet.html`) that sets `<html data-path>` before first paint, plus a `.cpp-bar` slot after the nav. On a new page, run `node scripts/add-path-layer.mjs`; it is idempotent.
- Link to a path directly with `?path=local|founders|nonprofits`, for ads, emails, and QR codes.
- Tests: `node --test "tests/*.test.mjs"`.
- Bump the `?v=` on `path.css` / `path.js` in `scripts/add-path-layer.mjs` and across pages whenever either file changes. Vercel caches them as immutable.

## Local preview

Any static server. The simplest:

```bash
python3 -m http.server 4000
# open http://localhost:4000
```

Or with Node:

```bash
npx serve .
```

## Deploy to Vercel

### Option 1 — Vercel CLI

```bash
npm i -g vercel
vercel       # first run links the project
vercel --prod
```

### Option 2 — GitHub + Vercel dashboard

1. Push this repo to GitHub.
2. In Vercel: **Add New → Project → Import** the repo.
3. **Framework preset:** Other. **Build command:** leave empty. **Output directory:** `./`.
4. Deploy.

### Custom domain

In the Vercel project: **Settings → Domains → Add** `carsonpoore.com` and `www.carsonpoore.com`. Point the registrar's DNS at the records Vercel shows. SSL is automatic.

## What `vercel.json` does

- **`cleanUrls: true`** — strips `.html` from URLs (`/services`, not `/services.html`)
- **`trailingSlash: false`** — canonical no-trailing-slash
- **Headers** — 1-year immutable cache on images/fonts/CSS/JS (cache-busting query strings change when assets do)
- **404** — Vercel auto-serves `404.html` for unmatched routes

## Editing

Everything is plain HTML. Edit pages directly. Shared styles in `styles.css`. Cache-bust query strings (e.g. `?v=…`) on `<link>` and `<script>` tags should be bumped when their files change — easy to script, or do by hand.

## Contact

[carson@carsonpoore.com](mailto:carson@carsonpoore.com)
