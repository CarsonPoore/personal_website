# Carson Poore — Personal Site

Static HTML portfolio / personal site.

## Files
- `index.html` — the full site (single-file, self-contained)
- `assets/cp-mark.png` — logo mark
- `vercel.json` — clean-URL + cache config

## Deploy to Vercel
1. Push this folder to a new GitHub repo.
2. Go to https://vercel.com/new → Import the repo → Deploy. No build step needed.

## Edit content
Open `index.html` in any text editor. Look for these comment markers:
- `<!-- NAV -->`
- `<!-- HERO -->`
- `<!-- NOW -->`
- `<!-- ABOUT -->`
- `<!-- WRITING -->`
- `<!-- BOOKS -->`
- `<!-- PRESS -->`
- `<!-- MANIFESTO -->`
- `<!-- CONTACT -->`

### Add a book
Find `<!-- BOOKS -->`, copy one `<article class="book">…</article>` block, paste it inside `<div class="books-grid">`, and update the title / author / month / takeaway.

### Add a writing post
Find `<!-- WRITING -->`, copy a `<article class="post">…</article>` block, update headline/body/date/metric.

### Update experience / "Now"
Find `<!-- NOW -->`, update the timestamp and the four `<article class="now-card">` entries.

Save, refresh the browser — that's it. Commit + push to redeploy on Vercel.
