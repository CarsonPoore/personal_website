# Client Pathways + First-Visit Loader Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ask "Who's the work for?" once, on a first-visit homepage loader or a slim path bar, and tailor every page to the answer: local businesses, founders, or nonprofits.

**Architecture:** A client-side "path layer" on top of the static, hand-written HTML site.
- An inline head snippet sets `<html data-path>` before first paint.
- `path.css` drives copy variants and emphasis from that attribute.
- `path.js` owns state and the audience mapping, and does the DOM work: bar, loader, nav, list sorting, and "Next for you".
- A one-off Node script injects the snippet, assets, and bar placeholder into every page. Pages with bespoke tailoring are edited by hand.

**Tech Stack:** Plain HTML/CSS/ES5-style JS (matches `site.js`), Node 25 `node:test` for unit tests (no package.json, no deps), and the Claude Browser preview for UI verification.

**Spec:** `docs/superpowers/specs/2026-10-09-client-pathways-design.md`

## Deviations from spec (deliberate, found while reading the code)

- **Link tagging is done at runtime from `path.js` `MAP`**, not by stamping `data-for` attributes on ~60 pages. One source of truth, and no attribute churn. `data-for` is still used for hand-authored blocks (the homepage doors).
- **Contact has no form.** The booking widget is a mock that emails. So the path rides in the `mailto:` subject instead of a hidden input.
- **Pricing uses path callouts and a badge instead of re-ordering sections.** This gets the same emphasis without moving large pricing blocks.
- **Homepage FAQ ordering is dropped.** None of the four FAQ items is audience-specific.

## Global Constraints

- Path keys: exactly `local`, `founders`, `nonprofits`, plus `none` for "Just looking". Storage key: `localStorage["cp.path"]`. URL override: `?path=<key>`.
- Tailor, don't hide. No content is removed from the HTML. Off-path items are reordered or collapsed into `<details class="cpp-more">`.
- The loader appears **only on the homepage (`/`), only when nothing is stored**, and never for crawler user agents.
- No JS means today's site, unchanged. Every path UI element is hidden unless `html.cpp-js` is present.
- No flash of generic copy for a returning visitor. No layout shift from the bar, since its height is reserved by CSS from first paint.
- CSS class prefix `cpp-`. **Do not use `.path`.** It already exists on the hub pages' `section.path`.
- Reuse tokens from `styles.css :root` (`--navy`, `--navy-2`, `--navy-3`, `--cobalt`, `--amber`, `--cream`, `--cream-2`, `--bone`, `--stone-2`, `--ink`, `--ink-2`, `--line`, `--ease`, `--sans`). No new colors.
- JS style: an IIFE in ES5 syntax like `site.js` (`var`, `function`). No build step.
- All new user-facing copy must pass the `carson-poore-consulting-voice` skill. Load it before finalizing strings in Tasks 4, 5, 6, and 8.
- Cache-bust: `path.css?v=20261009-1`, `path.js?v=20261009-1`. Bump the suffix on any later edit.
- Excluded from rollout: `docs/`, `dist/`, `motion/`, `node_modules/`, `.superpowers/`, `screenshots/`, `uploads/`, `media/`, `src/`.

## Review Focus

1. **localStorage throws** (Safari private mode, blocked site data). The snippet and `path.js` must not crash. The loader still closes, and the choice applies for that page view. Pinned in Task 2 (snippet test) and Task 1 (`resolve` with null).
2. **Unknown or hostile `?path=`** (`?path=<script>`, `?path=LOCAL`). It must be ignored, never written to storage, and never put into the DOM. Pinned in Task 2 (snippet test) and Task 1 (`norm`).
3. **`path.js` fails to load** (blocked or 404) while the loader is pending. Content must not stay hidden: the snippet failsafe clears `data-loader` after 4 s. Pinned in Task 2 (snippet test with fake timers).
4. **Repeated path switches.** List sorting must be idempotent and restore the original order on `none`. Items must not be duplicated, and `details` wrappers must not stack. Pinned in Task 1 (`partition` stability) and Task 3 (browser check: switch 3× then `none`, compare DOM order).
5. **Visitor with a path lands on another audience's hub.** The path is not auto-switched, and the bar offers to switch. Pinned in Task 3 (browser check).

---

### Task 1: `path.js` core (state rules + audience mapping) with unit tests

**Files:**
- Create: `path.js`
- Create: `tests/path.test.mjs`

**Interfaces:**
- Produces (Node `module.exports` / browser `window.CPPath`):
  - `KEYS: string[]` (`["local","founders","nonprofits"]`), `LABEL`, `CHIP`, `HUB`: `{[key]: string}`
  - `MAP: {[cleanHref]: string[]}`, `ARTICLES: [slug, title, paths[]][]`
  - `norm(k) → key|"none"|null`
  - `resolve(param, stored) → {path: key|"none"|null, persist: boolean}`
  - `cleanHref(href) → "/services/seo"` (strips origin, query, hash, `.html`, trailing slash; `/index` becomes `/`)
  - `pathsFor(href) → string[]|null`
  - `isFor(paths, key) → boolean` (true if paths null, key null, or key `"none"`)
  - `partition(items, key, getPaths) → {mine, other}` (stable)
  - `nextFor(key, currentHref, n) → [{href, title}]`
  - `hubKey(pathname) → key|null`
  - Browser only (Task 3): `get()`, `set(key)`, `clear()`, event `cp:path` on `document` with `detail.path`.

- [ ] **Step 1: Write the failing tests**

`tests/path.test.mjs`:
```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readdirSync } from "node:fs";
const require = createRequire(import.meta.url);
const P = require("../path.js");

test("norm accepts only known keys", () => {
  for (const k of ["local", "founders", "nonprofits", "none"]) assert.equal(P.norm(k), k);
  for (const k of ["LOCAL", "<script>", "", null, undefined, "toString"]) assert.equal(P.norm(k), null);
});

test("resolve: valid param wins and persists; else stored; else null", () => {
  assert.deepEqual(P.resolve("founders", "local"), { path: "founders", persist: true });
  assert.deepEqual(P.resolve("bogus", "local"), { path: "local", persist: false });
  assert.deepEqual(P.resolve(null, null), { path: null, persist: false });
  assert.deepEqual(P.resolve(null, "junk"), { path: null, persist: false });
});

test("cleanHref normalises", () => {
  assert.equal(P.cleanHref("https://carsonpoore.com/services/seo.html?x=1#y"), "/services/seo");
  assert.equal(P.cleanHref("/for/founders/"), "/for/founders");
  assert.equal(P.cleanHref("/articles/index.html"), "/articles/");
  assert.equal(P.cleanHref("/"), "/");
  assert.equal(P.cleanHref(""), "/");
});

test("pathsFor and isFor", () => {
  assert.deepEqual(P.pathsFor("/services/google-ad-grants"), ["nonprofits"]);
  assert.equal(P.pathsFor("/about"), null);
  assert.equal(P.isFor(null, "local"), true);
  assert.equal(P.isFor(["nonprofits"], "none"), true);
  assert.equal(P.isFor(["nonprofits"], "local"), false);
});

test("partition is stable and complete", () => {
  const items = ["/services/branding", "/services/local-seo", "/about", "/services/google-ad-grants", "/services/seo"];
  const r = P.partition(items, "local", P.pathsFor);
  assert.deepEqual(r.mine, ["/services/local-seo", "/about", "/services/seo"]);
  assert.deepEqual(r.other, ["/services/branding", "/services/google-ad-grants"]);
  const again = P.partition([...r.mine, ...r.other], "none", P.pathsFor);
  assert.equal(again.other.length, 0);
});

test("nextFor excludes current article and respects n", () => {
  const n = P.nextFor("nonprofits", "/articles/nonprofit-google-ad-grant", 3);
  assert.equal(n.length, 3);
  assert.ok(n.every((a) => a.href !== "/articles/nonprofit-google-ad-grant"));
  assert.ok(n.every((a) => P.pathsFor(a.href).includes("nonprofits")));
});

test("hubKey", () => {
  assert.equal(P.hubKey("/for/founders"), "founders");
  assert.equal(P.hubKey("/for/nonprofits.html"), "nonprofits");
  assert.equal(P.hubKey("/services"), null);
});

test("every article and tool file is mapped", () => {
  const arts = readdirSync(new URL("../articles", import.meta.url)).filter((f) => f.endsWith(".html") && f !== "index.html");
  for (const f of arts) assert.ok(P.pathsFor("/articles/" + f), "unmapped article " + f);
  const tools = readdirSync(new URL("../tools", import.meta.url)).filter((f) => f.endsWith(".html"));
  for (const f of tools) assert.ok(P.pathsFor("/tools/" + f), "unmapped tool " + f);
  const svcs = readdirSync(new URL("../services", import.meta.url)).filter((f) => f.endsWith(".html"));
  for (const f of svcs) assert.ok(P.pathsFor("/services/" + f), "unmapped service " + f);
});
```

- [ ] **Step 2: Run the tests and confirm they fail**

Run: `node --test tests/`
Expected: FAIL with `Cannot find module '../path.js'`.

- [ ] **Step 3: Write the core of `path.js`**

```js
/* Client pathways: one remembered answer to "Who's the work for?" tailors every page.
   Spec: docs/superpowers/specs/2026-10-09-client-pathways-design.md */
(function (root) {
  "use strict";
  var L = "local", F = "founders", N = "nonprofits";
  var KEYS = [L, F, N];
  var STORE = "cp.path";
  var LABEL = { local: "Local business", founders: "Founders", nonprofits: "Nonprofits" };
  var CHIP = { local: "Local business", founders: "Founder or startup", nonprofits: "Nonprofit" };
  var HUB = { local: "/for/local-businesses", founders: "/for/founders", nonprofits: "/for/nonprofits" };

  var MAP = {
    "/services/marketing": [L, F, N], "/services/branding": [F, N], "/services/content-marketing": [F, N],
    "/services/social-media": [L, N], "/services/video-photo": [L, F, N], "/services/seo": [L, F],
    "/services/local-seo": [L, N], "/services/google-ad-grants": [N], "/services/technical": [L, F, N],
    "/services/websites": [L, F, N], "/services/ai-automation": [L, F], "/services/crm-gohighlevel": [L, N],
    "/services/google-ads": [L, F], "/services/analytics": [F, N], "/services/strategy": [F, N],
    "/services/coaching": [L, F],
    "/tools/local-visibility": [L, N], "/tools/checkup": [L, F, N], "/tools/marketing-budget": [L, F],
    "/tools/90-day-plan": [F, N], "/tools/ai-opportunity-finder": [L, F],
    "/for/local-businesses": [L], "/for/founders": [F], "/for/nonprofits": [N]
  };
  // Order matters: nextFor() suggests the first matches, so each path's flagship reads come first.
  var ARTICLES = [
    ["nonprofit-google-ad-grant", "Google Ad Grants: the $10,000 your nonprofit isn’t spending", [N]],
    ["nonprofit-marketing-small-budget", "Nonprofit marketing on a small budget: 5 moves that work", [N]],
    ["startup-go-to-market-no-budget", "How to market a startup with no budget", [F]],
    ["when-to-hire-fractional-cmo", "When to hire a fractional CMO (and when to wait)", [F]],
    ["not-showing-up-on-google", "Why isn’t my business showing up on Google? 5 free fixes", [L]],
    ["google-business-profile-optimization", "Google Business Profile optimization checklist", [L]],
    ["one-page-marketing-plan", "How to write a one-page marketing plan", [F, N]],
    ["measure-marketing-roi", "How to measure marketing ROI for a small business", [F, N]],
    ["how-to-get-more-google-reviews", "How to get more Google reviews, within Google’s rules", [L]],
    ["website-not-getting-leads", "Why isn’t my website getting leads? 5 fixable causes", [L]],
    ["small-business-email-marketing", "Email marketing for small business: how often to send", [F, N]],
    ["fractional-cmo-cost", "What does a fractional CMO cost? Real 2026 numbers", [F]],
    ["fractional-cmo-vs-marketing-agency", "Fractional CMO vs. marketing agency: which one?", [F]],
    ["marketing-consultant-cost", "How much does a marketing consultant cost?", [F]],
    ["ga4-for-small-business", "GA4 setup for small business: what to turn on and read", [F, N]],
    ["how-often-to-post-on-social-media", "How often should a small business post on social media?", [L, N]],
    ["does-blogging-still-work", "Is blogging still worth it for small business?", [F, N]],
    ["website-redesign-or-refresh", "Website redesign vs. refresh: which does your site need?", [F, N]],
    ["local-seo-indianapolis", "Local SEO in Indianapolis: what Indy businesses should do", [L]],
    ["automate-lead-follow-up", "How to automate lead follow-up (and keep a human in it)", [L]],
    ["get-recommended-by-chatgpt", "How to get your business recommended by ChatGPT", [L, F]],
    ["ai-agents-for-small-business", "How to use AI agents in a small business", [F]],
    ["google-ads-vs-facebook-ads", "Google Ads vs Facebook Ads for a local business", [L]],
    ["google-ads-cost-small-business", "How much do Google Ads cost a small business?", [L]],
    ["small-business-marketing-budget", "How much should a small business spend on marketing?", [L]],
    ["small-business-website-cost", "How much does a small business website cost?", [L]],
    ["diy-marketing-vs-hiring", "Do your own marketing or hire someone? A simple test", [L]],
    ["is-gohighlevel-worth-it", "Is GoHighLevel worth it? What it really costs to run", [L]],
    ["gohighlevel-vs-hubspot", "GoHighLevel vs HubSpot: real costs and who each fits", [L]],
    ["best-crm-for-small-business", "Best CRM for small business: picks by business type", [L]],
    ["ai-chatbot-for-website", "Is an AI chatbot worth it for a small business website?", [L]]
  ];
  ARTICLES.forEach(function (a) { MAP["/articles/" + a[0]] = a[2]; });

  function norm(k) { return KEYS.indexOf(k) > -1 || k === "none" ? k : null; }
  function resolve(param, stored) {
    if (norm(param)) return { path: param, persist: true };
    return { path: norm(stored), persist: false };
  }
  function cleanHref(href) {
    var p = String(href || "").replace(/^https?:\/\/[^/]+/, "").split(/[?#]/)[0];
    p = p.replace(/\.html$/, "").replace(/\/index$/, "/").replace(/(.)\/$/, "$1");
    if (p === "/articles") p = "/articles/";
    return p || "/";
  }
  function pathsFor(href) { var p = cleanHref(href); return Object.prototype.hasOwnProperty.call(MAP, p) ? MAP[p] : null; }
  function isFor(paths, key) { return !paths || !norm(key) || key === "none" || paths.indexOf(key) > -1; }
  function partition(items, key, getPaths) {
    var mine = [], other = [];
    items.forEach(function (it) { (isFor(getPaths(it), key) ? mine : other).push(it); });
    return { mine: mine, other: other };
  }
  function nextFor(key, currentHref, n) {
    var here = cleanHref(currentHref);
    return ARTICLES.filter(function (a) { return a[2].indexOf(key) > -1 && "/articles/" + a[0] !== here; })
      .slice(0, n).map(function (a) { return { href: "/articles/" + a[0], title: a[1] }; });
  }
  function hubKey(pathname) {
    var p = cleanHref(pathname);
    for (var i = 0; i < KEYS.length; i++) if (HUB[KEYS[i]] === p) return KEYS[i];
    return null;
  }

  var api = { KEYS: KEYS, STORE: STORE, LABEL: LABEL, CHIP: CHIP, HUB: HUB, MAP: MAP, ARTICLES: ARTICLES,
    norm: norm, resolve: resolve, cleanHref: cleanHref, pathsFor: pathsFor, isFor: isFor,
    partition: partition, nextFor: nextFor, hubKey: hubKey };

  if (typeof module === "object" && module.exports) { module.exports = api; return; }
  root.CPPath = api;
  /* BROWSER LAYER: added in Task 3 */
})(this);
```

Note: `cleanHref("/articles/index.html")` → strip `.html` → `/articles/index` → `/articles/`. The `(.)\/$` rule must not strip that trailing slash back off, so `/articles` is mapped back to `/articles/` explicitly.

- [ ] **Step 4: Run the tests and confirm they pass**

Run: `node --test tests/`
Expected: all 8 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add path.js tests/path.test.mjs
git commit -m "Add path.js core: audience mapping and path state rules"
```

---

### Task 2: Head snippet, rollout script, base `path.css`

**Files:**
- Create: `scripts/path-snippet.html` (the canonical inline snippet; the script reads it)
- Create: `scripts/add-path-layer.mjs`
- Create: `tests/add-path-layer.test.mjs`
- Create: `tests/path-snippet.test.mjs`
- Create: `path.css`
- Modify: every page `*.html` outside the excluded dirs (by script)

**Interfaces:**
- Consumes: nothing at runtime. The snippet duplicates `norm`/`resolve` logic on purpose (it must run before any file loads).
- Produces:
  - `export function injectPathLayer(html, snippet) → {html, changed: boolean, warnings: string[]}`
  - `export function listPages(rootDir) → string[]`
  - Each page gets `<html data-path="…">`, `html.cpp-js`, and optionally `data-loader="pending"`.
  - Each page gets `<div class="cpp-bar" role="region" aria-label="Your path"></div>` right after `</header>`.

- [ ] **Step 1: Write the snippet file**

`scripts/path-snippet.html` (keep it on one line inside the `<script>`):
```html
<!-- cp-path:head --><script>(function(d,w){d.classList.add("cpp-js");var k=["local","founders","nonprofits","none"],u=null,s=null;try{u=new URLSearchParams(w.location.search).get("path")}catch(e){}try{s=w.localStorage.getItem("cp.path")}catch(e){}if(k.indexOf(u)>-1){try{w.localStorage.setItem("cp.path",u)}catch(e){}s=u}if(k.indexOf(s)>-1){d.setAttribute("data-path",s)}else if((w.location.pathname==="/"||w.location.pathname==="/index.html")&&!/bot|crawl|spider|slurp|preview/i.test(w.navigator.userAgent)){d.setAttribute("data-loader","pending");w.setTimeout(function(){if(d.getAttribute("data-loader")==="pending"&&!w.CPPath)d.removeAttribute("data-loader")},4000)}})(document.documentElement,window)</script>
```

- [ ] **Step 2: Write the failing snippet tests**

`tests/path-snippet.test.mjs` runs the snippet in a `vm` sandbox with fake `document`, `localStorage`, `location`, and timers:
```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const src = readFileSync(new URL("../scripts/path-snippet.html", import.meta.url), "utf8")
  .match(/<script>([\s\S]*)<\/script>/)[1];

function run({ search = "", pathname = "/", stored = null, ua = "Mozilla/5.0", throwStorage = false, cpPath = false }) {
  const attrs = {}; const classes = new Set(); const timers = []; const store = { "cp.path": stored };
  const de = {
    classList: { add: (c) => classes.add(c) },
    setAttribute: (k, v) => { attrs[k] = String(v); },
    getAttribute: (k) => (k in attrs ? attrs[k] : null),
    removeAttribute: (k) => { delete attrs[k]; },
  };
  const ls = {
    getItem: (k) => { if (throwStorage) throw new Error("blocked"); return store[k]; },
    setItem: (k, v) => { if (throwStorage) throw new Error("blocked"); store[k] = v; },
  };
  const win = { location: { search, pathname }, localStorage: ls, navigator: { userAgent: ua },
    setTimeout: (fn) => timers.push(fn), CPPath: cpPath ? {} : undefined };
  vm.runInNewContext(src, { document: { documentElement: de }, window: win, URLSearchParams });
  return { attrs, classes, store, timers };
}

test("adds cpp-js always", () => assert.ok(run({}).classes.has("cpp-js")));
test("stored path applies", () => assert.equal(run({ pathname: "/about", stored: "founders" }).attrs["data-path"], "founders"));
test("param overrides and persists", () => {
  const r = run({ search: "?path=nonprofits", stored: "local" });
  assert.equal(r.attrs["data-path"], "nonprofits"); assert.equal(r.store["cp.path"], "nonprofits");
});
test("bogus param ignored, never stored", () => {
  const r = run({ search: "?path=%3Cscript%3E", pathname: "/about" });
  assert.equal(r.attrs["data-path"], undefined); assert.equal(r.store["cp.path"], null);
});
test("loader pending only on home with nothing stored", () => {
  assert.equal(run({ pathname: "/" }).attrs["data-loader"], "pending");
  assert.equal(run({ pathname: "/about" }).attrs["data-loader"], undefined);
  assert.equal(run({ pathname: "/", stored: "none" }).attrs["data-loader"], undefined);
});
test("no loader for crawlers", () => assert.equal(run({ ua: "Googlebot/2.1" }).attrs["data-loader"], undefined));
test("storage throwing does not crash and param still applies for this view", () => {
  const r = run({ search: "?path=local", throwStorage: true });
  assert.equal(r.attrs["data-path"], "local");
});
test("failsafe clears loader if path.js never loaded", () => {
  const r = run({ pathname: "/" }); r.timers.forEach((f) => f());
  assert.equal(r.attrs["data-loader"], undefined);
});
test("failsafe leaves loader if path.js loaded", () => {
  const r = run({ pathname: "/", cpPath: true }); r.timers.forEach((f) => f());
  assert.equal(r.attrs["data-loader"], "pending");
});
```
The last two tests read `w.CPPath` at timer time. The sandbox `win` object is the same reference, so `cpPath: true` covers the case where path.js loaded.

- [ ] **Step 3: Write the failing rollout tests**

`tests/add-path-layer.test.mjs`:
```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { injectPathLayer, listPages } from "../scripts/add-path-layer.mjs";

const SNIP = "<!-- cp-path:head --><script>/*x*/</script>";
const PAGE = `<!doctype html><html><head>
<meta name="viewport" content="width=device-width, initial-scale=1" />
<link rel="stylesheet" href="/styles.css" />
</head><body><header class="nav"><div></div></header>
<div class="mobile-menu"></div><main></main></body></html>`;

test("injects snippet before first stylesheet, assets before </head>, bar after header", () => {
  const r = injectPathLayer(PAGE, SNIP);
  assert.ok(r.changed);
  assert.ok(r.html.indexOf("cp-path:head") < r.html.indexOf('href="/styles.css"'));
  assert.match(r.html, /<link rel="stylesheet" href="\/path\.css\?v=20261009-1" \/>\n<script defer src="\/path\.js\?v=20261009-1"><\/script>\n<\/head>/);
  assert.match(r.html, /<\/header>\n<div class="cpp-bar" role="region" aria-label="Your path"><\/div>/);
});
test("idempotent", () => {
  const once = injectPathLayer(PAGE, SNIP).html;
  const twice = injectPathLayer(once, SNIP);
  assert.equal(twice.changed, false); assert.equal(twice.html, once);
});
test("warns and skips bar when no nav header", () => {
  const r = injectPathLayer(PAGE.replace('<header class="nav">', "<header>"), SNIP);
  assert.ok(r.warnings.some((w) => /nav header/.test(w)));
  assert.ok(!r.html.includes("cpp-bar"));
});
test("leaves non-documents alone", () => {
  const r = injectPathLayer("<div>fragment</div>", SNIP);
  assert.equal(r.changed, false);
});
test("listPages excludes build and doc dirs", () => {
  const pages = listPages(new URL("..", import.meta.url).pathname);
  assert.ok(pages.some((p) => p.endsWith("/index.html")));
  assert.ok(pages.every((p) => !/\/(docs|dist|motion|node_modules|\.superpowers|screenshots|uploads|media|src)\//.test(p)));
});
```

- [ ] **Step 4: Run the tests and confirm they fail**

Run: `node --test tests/`
Expected: the new files FAIL. The snippet tests should pass already, because the snippet exists. If any snippet test fails, fix the snippet first. The rollout tests fail with `Cannot find module '../scripts/add-path-layer.mjs'`.

- [ ] **Step 5: Write `scripts/add-path-layer.mjs`**

```js
// One-off, idempotent: adds the client-pathways head snippet, path.css/js, and the path bar slot to every page.
// Usage: node scripts/add-path-layer.mjs
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const EXCLUDE = new Set(["docs", "dist", "motion", "node_modules", ".superpowers", "screenshots", "uploads", "media", "src", "scripts", "tests", ".git", ".claude"]);
const ASSETS = '<link rel="stylesheet" href="/path.css?v=20261009-1" />\n<script defer src="/path.js?v=20261009-1"></script>\n';
const BAR = '<div class="cpp-bar" role="region" aria-label="Your path"></div>';

export function injectPathLayer(html, snippet) {
  const warnings = [];
  if (html.includes("cp-path:head") || !/<\/head>/i.test(html)) return { html, changed: false, warnings };
  let out = html;
  const firstCss = out.search(/<link rel="stylesheet"/);
  const headEnd = out.search(/<\/head>/i);
  const at = firstCss > -1 && firstCss < headEnd ? firstCss : headEnd;
  out = out.slice(0, at) + snippet.trim() + "\n" + out.slice(at);
  out = out.replace(/<\/head>/i, ASSETS + "</head>");
  if (/<header class="nav[" ]/.test(out)) {
    out = out.replace(/(<header class="nav[" ][\s\S]*?<\/header>)/, "$1\n" + BAR);
  } else {
    warnings.push("no nav header; bar slot not added");
  }
  return { html: out, changed: true, warnings };
}

export function listPages(rootDir) {
  const out = [];
  (function walk(dir) {
    for (const name of readdirSync(dir)) {
      if (EXCLUDE.has(name)) continue;
      const p = join(dir, name);
      if (statSync(p).isDirectory()) walk(p);
      else if (name.endsWith(".html")) out.push(p);
    }
  })(rootDir);
  return out;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const root = join(dirname(fileURLToPath(import.meta.url)), "..");
  const snippet = readFileSync(join(root, "scripts/path-snippet.html"), "utf8");
  let n = 0;
  for (const file of listPages(root)) {
    const r = injectPathLayer(readFileSync(file, "utf8"), snippet);
    r.warnings.forEach((w) => console.warn(file.replace(root, "") + ": " + w));
    if (r.changed) { writeFileSync(file, r.html); n++; }
  }
  console.log("updated " + n + " pages");
}
```

- [ ] **Step 6: Run the tests and confirm they pass**

Run: `node --test tests/`
Expected: all PASS.

- [ ] **Step 7: Write the base `path.css`**

```css
/* Client pathways. Spec: docs/superpowers/specs/2026-10-09-client-pathways-design.md
   Everything is inert without html.cpp-js (set by the inline head snippet). */

/* Copy variants: generic copy shows by default; a path shows its own variant instead. */
html:not([data-path="local"]) [data-path-copy="local"],
html:not([data-path="founders"]) [data-path-copy="founders"],
html:not([data-path="nonprofits"]) [data-path-copy="nonprofits"] { display: none !important; }
html[data-path="local"] [data-path-generic],
html[data-path="founders"] [data-path-generic],
html[data-path="nonprofits"] [data-path-generic] { display: none !important; }
.cpp-set { display: contents; }

/* Path bar: height reserved from first paint so nothing shifts when path.js fills it. */
.cpp-bar { display: none; }
html.cpp-js:not([data-path="none"]):not([data-loader]) .cpp-bar {
  display: block; min-height: 44px;
  background: var(--navy-2); color: var(--cream-2);
  border-top: 1px solid var(--navy-3); border-bottom: 1px solid var(--navy-3);
  font: 500 var(--step--1)/1.3 var(--sans);
}
.cpp-bar__inner { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 14px; min-height: 44px; padding-block: 6px; }
.cpp-bar strong { color: var(--cream); font-weight: 700; }
.cpp-bar a { color: var(--cream); text-decoration: underline; text-underline-offset: 3px; }
.cpp-chip, .cpp-btn {
  font: inherit; cursor: pointer; border-radius: 999px; padding: 5px 12px;
  border: 1px solid var(--navy-3); background: transparent; color: var(--cream);
  transition: background .2s var(--ease), border-color .2s var(--ease);
}
.cpp-chip:hover, .cpp-btn:hover { border-color: var(--cobalt-3); background: rgba(59,107,255,.14); }
.cpp-btn--solid { background: var(--cobalt); border-color: var(--cobalt); }
.cpp-x { margin-left: auto; background: none; border: 0; color: var(--cream-2); font-size: 20px; line-height: 1; cursor: pointer; padding: 4px 8px; }
.cpp-chip:focus-visible, .cpp-btn:focus-visible, .cpp-x:focus-visible { outline: 2px solid var(--amber); outline-offset: 2px; }
@media (max-width: 640px) { .cpp-bar__inner { gap: 6px 10px; } .cpp-bar__lead { flex-basis: 100%; } }

/* "Other …" collapse used by data-path-sort lists */
.cpp-more { grid-column: 1 / -1; margin-top: 12px; }
.cpp-more > summary { cursor: pointer; font: 600 var(--step--1)/1.4 var(--sans); color: var(--ink-2); padding: 8px 0; }
.cpp-more__body { margin-top: 12px; }

/* Nav marks */
.nav__drop a.is-path { font-weight: 700; }
.nav__drop a.is-path::before, .nav__drop-sub.cpp-dot::after {
  content: ""; display: inline-block; width: 6px; height: 6px; border-radius: 50%;
  background: var(--amber); margin: 0 8px 2px 0; vertical-align: middle;
}
.nav__drop-sub.cpp-dot::after { margin: 0 0 2px 8px; }
.cpp-mobile-pin { font-weight: 700; color: var(--amber) !important; }
.cpp-footer-link { background: none; border: 0; padding: 0; color: inherit; text-decoration: underline; cursor: pointer; font: inherit; margin-top: 8px; }
```
Later tasks append to this file. Keep each task's block under its own comment header.

- [ ] **Step 8: Run the rollout on the site**

Run: `node scripts/add-path-layer.mjs`
Expected: `updated N pages`, where N equals `node -e "import('./scripts/add-path-layer.mjs').then(m=>console.log(m.listPages('.').length))"`. Any warnings should list only pages without a nav header (for example `404.html`, if it has none). Record the warnings in the commit message.
Then run it again. Expected: `updated 0 pages`.
Spot check: `git diff --stat | tail -1` and `grep -c "cp-path:head" index.html about.html articles/index.html` (each should be 1).

- [ ] **Step 9: Browser smoke test**

Load the Claude Browser preview (`preview_start` with the existing launch config; if none exists, create `.claude/launch.json` with `npx serve -l 4321 .` per the repo's dev-server history) and open `/about`. Expected: no console errors, page identical to before, and a 44px empty navy strip under the nav. The strip stays empty until Task 3; that's expected.

- [ ] **Step 10: Commit**

```bash
git add scripts/ tests/ path.css $(git diff --name-only)
git commit -m "Add path head snippet, rollout script, base path.css; inject across pages"
```

---

### Task 3: Browser layer: state API, path bar, nav, list sorting, mailto, footer link

**Files:**
- Modify: `path.js` (replace the `/* BROWSER LAYER: added in Task 3 */` line)

**Interfaces:**
- Consumes: Task 1 core functions. Task 2 `html[data-path]`, `.cpp-bar`, and CSS classes `cpp-bar__inner`, `cpp-chip`, `cpp-btn`, `cpp-btn--solid`, `cpp-x`, `cpp-more`, `cpp-more__body`, `is-path`, `cpp-dot`, `cpp-mobile-pin`, `cpp-footer-link`.
- Produces:
  - `CPPath.get()`, `CPPath.set(key)`, `CPPath.clear()`
  - `document` event `cp:path`
  - Generic `[data-path-sort="<Other label>"]` list behavior (later tasks only add the attribute)
  - Optional `data-for="local founders"` on any item overrides href lookup
  - `[data-path-sort-keep]` sorts without collapsing

- [ ] **Step 1: Write the browser layer**

Replace the placeholder comment line with:
```js
  var html = document.documentElement;
  var dismissedHub = false;

  function readStore() { try { return localStorage.getItem(STORE); } catch (e) { return null; } }
  function writeStore(v) { try { if (v == null) localStorage.removeItem(STORE); else localStorage.setItem(STORE, v); } catch (e) {} }
  function get() { return norm(html.getAttribute("data-path")); }
  function on() { var k = get(); return k && k !== "none" ? k : null; }
  function emit() { document.dispatchEvent(new CustomEvent("cp:path", { detail: { path: get() } })); }
  function set(k) {
    k = norm(k); if (!k) return;
    writeStore(k); html.setAttribute("data-path", k); html.removeAttribute("data-loader");
    render(); emit();
  }
  function clear() { writeStore(null); html.removeAttribute("data-path"); render(); emit(); }

  function h(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function button(cls, text, fn) { var b = h("button", cls, text); b.type = "button"; b.addEventListener("click", fn); return b; }
  function focusBar() { var f = document.querySelector(".cpp-bar button, .cpp-bar a"); if (f) f.focus({ preventScroll: true }); }

  /* ---- Path bar ---- */
  function chips(exclude) {
    return KEYS.filter(function (k) { return k !== exclude; }).map(function (k) {
      return button("cpp-chip", CHIP[k], function () { set(k); focusBar(); });
    });
  }
  function renderBar(switching) {
    var bar = document.querySelector(".cpp-bar"); if (!bar) return;
    var k = on(), hub = hubKey(location.pathname), inner = h("div", "wrap cpp-bar__inner");
    bar.textContent = "";
    if (k && switching) {
      inner.appendChild(h("span", "cpp-bar__lead", "Switch to:"));
      chips(k).forEach(function (c) { inner.appendChild(c); });
      inner.appendChild(button("cpp-btn", "Show everything", function () { set("none"); }));
      inner.appendChild(button("cpp-btn", "Cancel", function () { renderBar(false); focusBar(); }));
    } else if (k && hub && hub !== k && !dismissedHub) {
      inner.appendChild(h("span", "cpp-bar__lead", "You’re reading the " + LABEL[hub] + " page."));
      inner.appendChild(button("cpp-btn cpp-btn--solid", "Switch to this path", function () { set(hub); focusBar(); }));
      inner.appendChild(button("cpp-btn", "Stay on " + LABEL[k], function () { dismissedHub = true; renderBar(false); focusBar(); }));
    } else if (k) {
      var lead = h("span", "cpp-bar__lead"); lead.appendChild(document.createTextNode("You’re on the "));
      lead.appendChild(h("strong", null, LABEL[k])); lead.appendChild(document.createTextNode(" path"));
      inner.appendChild(lead);
      if (hub !== k) { var a = h("a", null, "See your next steps →"); a.href = HUB[k]; inner.appendChild(a); }
      inner.appendChild(button("cpp-btn", "Switch", function () { renderBar(true); focusBar(); }));
    } else if (!get()) {
      inner.appendChild(h("span", "cpp-bar__lead", "Who are you here for?"));
      chips(null).forEach(function (c) { inner.appendChild(c); });
      var x = button("cpp-x", "×", function () { set("none"); }); x.setAttribute("aria-label", "Hide this");
      inner.appendChild(x);
    }
    bar.appendChild(inner);
  }

  /* ---- Lists ---- */
  function itemPaths(it) {
    if (it.getAttribute && it.getAttribute("data-for")) return it.getAttribute("data-for").split(/\s+/);
    var a = it.matches && it.matches("a[href]") ? it : (it.querySelector ? it.querySelector("a[href]") : null);
    return a ? pathsFor(a.getAttribute("href")) : null;
  }
  function sortList(list, k) {
    if (!list._cppOrig) list._cppOrig = [].slice.call(list.children);
    var old = list.querySelector(":scope > .cpp-more"); if (old) list.removeChild(old);
    var parts = k ? partition(list._cppOrig, k, itemPaths) : { mine: list._cppOrig, other: [] };
    if (list.hasAttribute("data-path-sort-keep")) { parts = { mine: parts.mine.concat(parts.other), other: [] }; }
    parts.mine.forEach(function (n) { list.appendChild(n); });
    if (!parts.other.length) return;
    var more = h("details", "cpp-more");
    more.appendChild(h("summary", null, (list.getAttribute("data-path-sort") || "Other options") + " (" + parts.other.length + ")"));
    var keep = list.className.split(/\s+/).filter(function (c) { return c && c !== "reveal" && c.indexOf("a-") !== 0; }).join(" ");
    var body = h("div", "cpp-more__body " + keep);
    parts.other.forEach(function (n) { if (n.classList) n.classList.add("in"); body.appendChild(n); });
    more.appendChild(body); list.appendChild(more);
  }
  // Within a nav column, keep each head in place and sort only the run of sub-links that follows it.
  function sortRuns(container, subCls, k) {
    if (!container._cppOrig) container._cppOrig = [].slice.call(container.children);
    var out = [], run = [];
    function flush() {
      if (!run.length) return;
      var p = k ? partition(run, k, itemPaths) : { mine: run, other: [] };
      out = out.concat(p.mine, p.other); run = [];
    }
    container._cppOrig.forEach(function (n) { if (n.classList.contains(subCls)) run.push(n); else { flush(); out.push(n); } });
    flush();
    out.forEach(function (n) { container.appendChild(n); });
  }

  /* ---- Nav ---- */
  function tailorNav(k) {
    var drop = document.querySelector('.nav__drop[aria-label="Who we help"]');
    if (drop) {
      var t = drop.previousElementSibling;
      if (t && !t.hasAttribute("data-cpp-text")) t.setAttribute("data-cpp-text", t.textContent);
      if (t) t.textContent = k ? "Your path" : t.getAttribute("data-cpp-text");
      sortList(drop, null);
      if (k) { var hubA = drop.querySelector('a[href="' + HUB[k] + '"]'); if (hubA) drop.insertBefore(hubA, drop.firstChild); }
      [].forEach.call(drop.querySelectorAll("a"), function (a) { a.classList.toggle("is-path", !!k && cleanHref(a.getAttribute("href")) === HUB[k]); });
    }
    [].forEach.call(document.querySelectorAll(".nav__drop--wide .nav__col"), function (col) {
      sortRuns(col, "nav__drop-sub", k);
      [].forEach.call(col.querySelectorAll(".nav__drop-sub"), function (a) {
        var p = pathsFor(a.getAttribute("href"));
        a.classList.toggle("cpp-dot", !!k && !!p && p.length < 3 && p.indexOf(k) > -1);
      });
    });
    var mm = document.querySelector(".mobile-menu");
    if (mm) {
      var pin = mm.querySelector(".cpp-mobile-pin"); if (pin) mm.removeChild(pin);
      sortRuns(mm, "mobile-menu__sub", k);
      if (k) { pin = h("a", "cpp-mobile-pin", "Your path: " + LABEL[k] + " →"); pin.href = HUB[k]; mm.insertBefore(pin, mm.firstChild); }
    }
  }

  /* ---- Contact / ticket: carry the path into the email subject ---- */
  function tailorMailto(k) {
    if (!/^\/(contact|ticket)(\.html)?$/.test(location.pathname)) return;
    [].forEach.call(document.querySelectorAll('main a[href^="mailto:"]'), function (a) {
      if (!a.hasAttribute("data-cpp-href")) a.setAttribute("data-cpp-href", a.getAttribute("href"));
      var base = a.getAttribute("data-cpp-href");
      if (!k) { a.setAttribute("href", base); return; }
      var tag = "(" + LABEL[k] + " path)";
      a.setAttribute("href", /[?&]subject=/.test(base)
        ? base.replace(/([?&]subject=)([^&]*)/, function (m, p, s) { return p + s + encodeURIComponent(" " + tag); })
        : base + (base.indexOf("?") > -1 ? "&" : "?") + "subject=" + encodeURIComponent("Free call " + tag));
    });
  }

  /* ---- Footer: way back to the question after "Just looking" ---- */
  function renderFooterLink() {
    var brand = document.querySelector(".footer__brand"); if (!brand) return;
    var b = brand.querySelector(".cpp-footer-link"); if (b) brand.removeChild(b);
    if (get() !== "none") return;
    brand.appendChild(button("cpp-footer-link", "Choose your path", function () { clear(); window.scrollTo(0, 0); focusBar(); }));
  }

  /* ---- Article pages: "Next for you" (filled in Task 7) ---- */
  function renderNextFor(k) {}

  function render() {
    var k = on();
    renderBar(false); tailorNav(k);
    [].forEach.call(document.querySelectorAll("[data-path-sort]"), function (l) { sortList(l, k); });
    tailorMailto(k); renderFooterLink(); renderNextFor(k);
  }

  /* ---- Loader (filled in Task 4) ---- */
  function initLoader() {}

  api.get = get; api.set = set; api.clear = clear;
  if (/[?&]path=/.test(location.search)) {
    try { var u = new URL(location.href); u.searchParams.delete("path"); history.replaceState(history.state, "", u.pathname + u.search + u.hash); } catch (e) {}
  }
  initLoader(); render();
  window.addEventListener("pageshow", function (e) {
    if (!e.persisted) return;
    var s = norm(readStore());
    if (s) html.setAttribute("data-path", s); else html.removeAttribute("data-path");
    render();
  });
```
In the core section, move `root.CPPath = api;` so it stays where it is: it runs before this block, so `window.CPPath` exists by the time the snippet's failsafe timer fires.

Note on the "Who we help" dropdown: `sortList(drop, null)` restores the original order first, then the hub link is moved to the top. On `none` it simply restores.

- [ ] **Step 2: Re-run the unit tests (the Node export must still work)**

Run: `node --test tests/`
Expected: PASS. The browser block is never reached in Node because of the early `return`.

- [ ] **Step 3: Browser verification: bar states**

In the preview, for each URL run `localStorage.clear()` and reload, then exercise:
1. `/about`, nothing stored: the bar reads "Who are you here for?" with 3 chips and ×. Click "Founder or startup". The bar reads "You're on the **Founders** path · See your next steps → · Switch". `localStorage["cp.path"] === "founders"`.
2. Switch: the chips for the other two, "Show everything", and "Cancel" appear. Pick "Nonprofit" and the label updates.
3. "Show everything": the bar disappears. The footer shows "Choose your path". Click it: the bar prompt returns and the page scrolls to the top.
4. With founders stored, open `/for/nonprofits`. The bar reads "You're reading the Nonprofits page." with "Switch to this path" and "Stay on Founders". "Stay" shows the normal founders bar, and the stored path is unchanged.
5. `/about?path=local`: the URL bar shows `/about` with no parameter, and the path is local.
6. Run `localStorage.setItem = () => { throw new Error() }` in the console, then click a chip. The bar updates with no console error.
Use `read_page` for text and `read_console_messages` with `onlyErrors`. Expected: no errors.

- [ ] **Step 4: Browser verification: nav, mobile, idempotent sorting (Review Focus 4)**

With `founders` set: the Services dropdown subs for Branding, Content marketing, SEO, Google Ads, AI, and Analytics carry `.cpp-dot`, and founder-relevant subs come first under each head. Check with `javascript_tool`: `[...document.querySelectorAll('.nav__drop--wide .nav__col a')].map(a=>a.textContent)`. "Who we help" reads "Your path", with Founders first and bold.
Then run `['local','nonprofits','founders','none'].forEach(k=>CPPath.set(k))` and compare the column link order with the original HTML order. They must be identical, and `document.querySelectorAll('.cpp-more').length === 0`.
Mobile (`resize_window` mobile): open the burger. "Your path: Founders →" is the first link.

- [ ] **Step 5: Browser verification: contact mailto**

On `/contact` with nonprofits set: the main mailto is `mailto:carson@carsonpoore.com?subject=Free%20call%20(Nonprofits%20path)`. On `/ticket`, the subject is `Ticket%20redemption%20(Nonprofits%20path)`.

- [ ] **Step 6: Commit**

```bash
git add path.js
git commit -m "Path layer: state API, path bar, nav tailoring, list sorting, contact subject"
```

---

### Task 4: First-visit homepage loader

**Files:**
- Modify: `index.html` (loader markup immediately before the closing `</body>`; `tabindex="-1"` on the hero `h1`)
- Modify: `path.js` (`initLoader`)
- Modify: `path.css` (loader block)

**Interfaces:**
- Consumes: the snippet's `data-loader="pending"`, plus `set()` and `render()` from Task 3.
- Produces: `.cpp-loader` overlay. Picking sets the path and leaves focus on `main h1`.

- [ ] **Step 1: Load the voice skill and finalize copy**

Invoke `carson-poore-consulting-voice`. Check these strings against it, and edit wording only if a rule fails (then record the edit in the commit message):
- Question: "Who's the work for?"
- Sub: "Pick one and the site leads with what matters to you. Switch any time."
- Local business: "Shops, trades, salons, and restaurants that need the neighbors to find them."
- Founder or startup: "You built the thing. Now it needs people."
- Nonprofit: "A small staff, a big mission, and up to $10,000 a month in free Google ads to use."
- Skip: "Just looking around"

- [ ] **Step 2: Add the loader markup to `index.html`**

Insert before `</body>`:
```html
<div class="cpp-loader" role="dialog" aria-modal="true" aria-labelledby="cpp-q" hidden>
  <div class="cpp-loader__inner">
    <div class="cpp-loader__mark" aria-hidden="true">
      <svg viewBox="0 0 100 100" class="cpp-loader__ring"><circle cx="50" cy="50" r="46" /></svg>
      <img src="/brand/cpc-mark-offwhite.svg" alt="" width="56" height="56" />
    </div>
    <div class="cpp-loader__ask">
      <h2 id="cpp-q">Who&rsquo;s the work for?</h2>
      <p>Pick one and the site leads with what matters to you. Switch any time.</p>
      <div class="cpp-loader__cards">
        <button type="button" class="cpp-card" data-pick="local">
          <img src="/media/photos/home-1-local-shop.jpg" alt="" width="600" height="375" />
          <strong>Local business</strong>
          <span>Shops, trades, salons, and restaurants that need the neighbors to find them.</span>
        </button>
        <button type="button" class="cpp-card" data-pick="founders">
          <img src="/media/photos/home-2-founders-whiteboard.jpg" alt="" width="600" height="375" />
          <strong>Founder or startup</strong>
          <span>You built the thing. Now it needs people.</span>
        </button>
        <button type="button" class="cpp-card" data-pick="nonprofits">
          <img src="/media/photos/home-3-nonprofit-volunteers.jpg" alt="" width="600" height="375" />
          <strong>Nonprofit</strong>
          <span>A small staff, a big mission, and up to $10,000 a month in free Google ads to use.</span>
        </button>
      </div>
      <button type="button" class="cpp-loader__skip" data-pick="none">Just looking around</button>
    </div>
  </div>
</div>
```
Change the hero `<h1 class="reveal" data-delay="1">` to `<h1 class="reveal" data-delay="1" tabindex="-1">`.

- [ ] **Step 3: Append the loader CSS to `path.css`**

```css
/* ---- First-visit loader (homepage) ---- */
html[data-loader="pending"] { background: var(--navy); }
html[data-loader="pending"] body > *:not(.cpp-loader) { visibility: hidden; }
html[data-loader="pending"] .cpp-loader, .cpp-loader.is-leaving { display: grid !important; }
.cpp-loader {
  position: fixed; inset: 0; z-index: 200; place-items: center; overflow-y: auto;
  background: var(--navy); color: var(--cream); padding: 24px 16px;
}
.cpp-loader.is-leaving { animation: cpp-fade .3s var(--ease) forwards; }
.cpp-loader__inner { width: min(1040px, 100%); display: grid; justify-items: center; gap: 28px; }
.cpp-loader__mark { position: relative; width: 104px; height: 104px; display: grid; place-items: center; }
.cpp-loader__mark img { animation: cpp-pop .5s .25s var(--ease) both; }
.cpp-loader__ring { position: absolute; inset: 0; transform: rotate(-90deg); }
.cpp-loader__ring circle { fill: none; stroke: var(--amber); stroke-width: 2; stroke-dasharray: 290; stroke-dashoffset: 290; animation: cpp-draw .8s var(--ease) forwards; }
.cpp-loader__ask { display: grid; justify-items: center; gap: 14px; text-align: center; opacity: 0; transform: translateY(12px); transition: opacity .4s var(--ease), transform .4s var(--ease); }
.cpp-loader.is-asking .cpp-loader__ask { opacity: 1; transform: none; }
.cpp-loader.is-asking .cpp-loader__mark { width: 64px; height: 64px; transition: width .4s var(--ease), height .4s var(--ease); }
.cpp-loader h2 { font: 800 var(--step-4, 2.4rem)/1.05 var(--sans); color: var(--cream); margin: 0; }
.cpp-loader p { color: var(--cream-2); margin: 0; }
.cpp-loader__cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; width: 100%; margin-top: 10px; }
.cpp-card {
  display: grid; gap: 8px; text-align: left; cursor: pointer; padding: 0 0 16px; overflow: hidden;
  background: var(--navy-2); border: 1px solid var(--navy-3); border-radius: 8px; color: var(--cream-2); font: inherit;
  transition: transform .2s var(--ease), border-color .2s var(--ease);
}
.cpp-card img { width: 100%; aspect-ratio: 16 / 10; object-fit: cover; display: block; }
.cpp-card strong { color: var(--cream); font-size: var(--step-1, 1.2rem); padding: 4px 16px 0; }
.cpp-card span { padding: 0 16px; font-size: var(--step--1); line-height: 1.45; }
.cpp-card:hover, .cpp-card:focus-visible { transform: translateY(-3px); border-color: var(--amber); outline: none; }
.cpp-loader__skip { background: none; border: 0; color: var(--cream-2); text-decoration: underline; text-underline-offset: 3px; cursor: pointer; font: inherit; padding: 8px; }
.cpp-loader__skip:focus-visible { outline: 2px solid var(--amber); outline-offset: 2px; }
@media (max-width: 760px) {
  .cpp-loader { place-items: start center; }
  .cpp-loader__cards { grid-template-columns: 1fr; }
  .cpp-card { grid-template-columns: 96px 1fr; grid-template-rows: auto 1fr; padding: 0; align-items: center; }
  .cpp-card img { grid-row: 1 / 3; height: 100%; aspect-ratio: auto; }
  .cpp-card strong { padding: 12px 12px 0; }
  .cpp-card span { padding: 0 12px 12px; }
}
@keyframes cpp-draw { to { stroke-dashoffset: 0; } }
@keyframes cpp-pop { from { opacity: 0; transform: scale(.85); } to { opacity: 1; transform: none; } }
@keyframes cpp-fade { to { opacity: 0; visibility: hidden; } }
@media (prefers-reduced-motion: reduce) {
  .cpp-loader *, .cpp-loader { animation: none !important; transition: none !important; }
  .cpp-loader__ring circle { stroke-dashoffset: 0; }
  .cpp-loader__ask { opacity: 1; transform: none; }
}
```
Before relying on `--step-1` and `--step-4`, confirm they exist (`grep -n "\-\-step-4" styles.css`). The fallbacks in `var()` cover the case where they don't.

- [ ] **Step 4: Implement `initLoader` in `path.js`**

Replace `function initLoader() {}` with:
```js
  function initLoader() {
    var box = document.querySelector(".cpp-loader");
    if (!box || html.getAttribute("data-loader") !== "pending") return;
    var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
    var others = [].filter.call(document.body.children, function (n) { return n !== box && n.tagName !== "SCRIPT"; });
    others.forEach(function (n) { n.inert = true; });
    setTimeout(function () {
      box.classList.add("is-asking");
      var first = box.querySelector(".cpp-card"); if (first) first.focus({ preventScroll: true });
    }, reduce ? 0 : 900);
    function close(k) {
      box.classList.add("is-leaving");
      others.forEach(function (n) { n.inert = false; });
      set(k);
      setTimeout(function () {
        box.classList.remove("is-leaving", "is-asking");
        var h1 = document.querySelector("main h1"); if (h1) h1.focus({ preventScroll: true });
      }, reduce ? 0 : 300);
    }
    box.addEventListener("click", function (e) { var b = e.target.closest("[data-pick]"); if (b) close(b.getAttribute("data-pick")); });
    document.addEventListener("keydown", function esc(e) {
      if (e.key === "Escape" && html.getAttribute("data-loader") === "pending") { document.removeEventListener("keydown", esc); close("none"); }
    });
  }
```

- [ ] **Step 5: Browser verification**

1. `localStorage.clear()` and reload `/`. The navy overlay appears from first paint, with no homepage flash. Take a screenshot during the first 500 ms using a `computer` screenshot right after `navigate`. The ring draws, then the question and cards fade up. Focus is on the "Local business" card (`document.activeElement.dataset.pick`).
2. Tab cycles only through the 3 cards and the skip link (the homepage is inert). Click "Nonprofit": the overlay fades, the homepage is visible, focus is on the hero h1, and `localStorage["cp.path"] === "nonprofits"`. Reload: no loader.
3. Clear and reload, then press Esc. The path is `none`, and there is no bar on the homepage.
4. Reduced motion (Playwright `browser_emulate_media` with `reducedMotion: "reduce"`, then reload `/` after `localStorage.clear()`): the question and cards are visible immediately, with no ring animation.
5. No-JS: open `/` with JS disabled. If the preview can't do that, use Playwright `browser_run_code_unsafe` with `javaScriptEnabled: false` in a new context. No overlay is visible.
6. Failsafe (Playwright `browser_run_code_unsafe`: `await page.route('**/path.js*', r => r.abort())`, clear storage, reload `/`): after 4 s the overlay is gone and the homepage is visible.
7. Mobile at 375px: the cards stack as horizontal rows, the whole question fits or scrolls, and there is no horizontal scroll.

- [ ] **Step 6: Commit**

```bash
git add index.html path.js path.css
git commit -m "Add first-visit homepage loader asking who the work is for"
```

---

### Task 5: Homepage tailoring (hero copy, CTAs, "Who we help" doors)

**Files:**
- Modify: `index.html` (hero `h1`, `.hero__sub`, `.hero__cta`, the three `.icon-tile`s)
- Modify: `path.css` (homepage block)

**Interfaces:**
- Consumes: the `[data-path-copy]`, `[data-path-generic]`, and `.cpp-set` CSS from Task 2.
- Produces: none.

- [ ] **Step 1: Replace the hero copy with variants**

`h1` (keep the single element, swap its contents):
```html
<h1 class="reveal" data-delay="1" tabindex="-1"><span data-path-generic>Let&rsquo;s make your business <em>impossible to overlook.</em></span><span data-path-copy="local">Word of mouth built it. Let&rsquo;s make it <em>easy to find.</em></span><span data-path-copy="founders">You built the thing. Now let&rsquo;s get it to <em>people.</em></span><span data-path-copy="nonprofits">Nonprofit marketing for the person already wearing <em>five hats</em>.</span></h1>
```
`.hero__sub`: wrap the existing sentence in `<span data-path-generic>…</span>` and add three spans. Copy the text verbatim from the `.hero__sub` of `for/local-businesses.html:336`, `for/founders.html:369`, and `for/nonprofits.html:331`, each in `<span data-path-copy="KEY">…</span>`.

`.hero__cta`:
```html
<div class="hero__cta reveal" data-delay="3">
  <span class="cpp-set" data-path-generic><a href="/contact" class="btn btn--primary">Book a free call <span class="arr">→</span></a><a href="/tools/checkup" class="btn btn--ghost-light">Take the Five-Step Check-Up</a></span>
  <span class="cpp-set" data-path-copy="local"><a href="/tools/local-visibility" class="btn btn--primary">Run the free local visibility check <span class="arr">→</span></a><a href="/contact" class="btn btn--ghost-light">Book a free call</a></span>
  <span class="cpp-set" data-path-copy="founders"><a href="/contact" class="btn btn--primary">Book a strategy call <span class="arr">→</span></a><a href="/tools/90-day-plan" class="btn btn--ghost-light">Build a 90-day plan</a></span>
  <span class="cpp-set" data-path-copy="nonprofits"><a href="/services/google-ad-grants" class="btn btn--primary">See if you qualify for free Google ads <span class="arr">→</span></a><a href="/contact" class="btn btn--ghost-light">Book a free call</a></span>
</div>
```
Check the new CTA labels with the voice skill.

- [ ] **Step 2: Tag the three doors**

Add `data-for="local"`, `data-for="founders"`, and `data-for="nonprofits"` to the three `.icon-tile` elements in `#who-we-help`.

- [ ] **Step 3: Append the homepage CSS to `path.css`**

```css
/* ---- Homepage: the chosen door spans the row, the other two shrink to links ---- */
html[data-path="local"] .icon-tile[data-for="local"],
html[data-path="founders"] .icon-tile[data-for="founders"],
html[data-path="nonprofits"] .icon-tile[data-for="nonprofits"] {
  order: -1; grid-column: 1 / -1;
  display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr); column-gap: clamp(20px, 3vw, 40px); align-content: center;
}
html[data-path="local"] .icon-tile[data-for="local"] .card-photo,
html[data-path="founders"] .icon-tile[data-for="founders"] .card-photo,
html[data-path="nonprofits"] .icon-tile[data-for="nonprofits"] .card-photo { grid-row: 1 / span 5; margin: 0; }
html[data-path="local"] .icon-tile:not([data-for="local"]) :is(.card-photo, p, .icon-tile__icon),
html[data-path="founders"] .icon-tile:not([data-for="founders"]) :is(.card-photo, p, .icon-tile__icon),
html[data-path="nonprofits"] .icon-tile:not([data-for="nonprofits"]) :is(.card-photo, p, .icon-tile__icon) { display: none; }
html[data-path="local"] .icon-tiles,
html[data-path="founders"] .icon-tiles,
html[data-path="nonprofits"] .icon-tiles { grid-template-columns: repeat(2, 1fr); }
html[data-path]:not([data-path="none"]) .icon-tiles .a-svc-link { display: none; }
@media (max-width: 780px) {
  html[data-path] .icon-tiles { grid-template-columns: 1fr; }
  html[data-path] .icon-tile[data-for] { grid-template-columns: 1fr !important; }
  html[data-path] .icon-tile .card-photo { grid-row: auto !important; }
}
```

- [ ] **Step 4: Browser verification**

For each of local, founders, and nonprofits (set with `CPPath.set` in the console): screenshot the hero. The h1, sub, and CTAs match that path, with no generic copy visible. `#who-we-help` shows the chosen door spanning the row with its photo, and the other two as compact link tiles below. With `none`: the original homepage, pixel-identical to before. Compare against a screenshot taken before this task.
Returning visitor flash check: set founders, then throttle via Playwright `browser_run_code_unsafe` (`page.route('**/*.css', r => setTimeout(() => r.continue(), 1500))`), reload, and screenshot at 300 ms. The founders h1 should show, or nothing at all, but never the generic h1.
Mobile 375px: the tiles stack and there is no overflow.

- [ ] **Step 5: Commit**

```bash
git add index.html path.css
git commit -m "Tailor homepage hero, CTAs, and doors to the chosen path"
```

---

### Task 6: Hub "Your next steps" rail

**Files:**
- Modify: `for/local-businesses.html`, `for/founders.html`, `for/nonprofits.html` (a rail section right after the hero `</section>`, plus `id="problem"` on the first content section)
- Modify: `investment.html` (`id="nonprofit-rate"` on the nonprofit note `<section class="wrap">` at about line 618)
- Modify: `path.css` (rail block)

**Interfaces:**
- Consumes: none.
- Produces: static, crawlable rails. The anchor `#nonprofit-rate` is used by Task 8.

- [ ] **Step 1: Check the rail copy with the voice skill, then insert the rails**

Founders (`for/founders.html`, after the hero section closes; add `id="problem"` to the `<section class="section">` at about line 389):
```html
<section class="cpp-rail" aria-labelledby="cpp-rail-h">
  <div class="wrap">
    <h2 id="cpp-rail-h" class="cpp-rail__h">Your next steps</h2>
    <ol class="cpp-rail__list">
      <li><a href="#problem"><span>The problem</span>Not enough people know it exists</a></li>
      <li><a href="/services/strategy"><span>The work</span>Strategy first, then a CMO who builds</a></li>
      <li><a href="/investment"><span>The price</span>$3,000 to start, retainers after</a></li>
      <li><a href="/tools/90-day-plan"><span>Free tool</span>Build your 90-day plan</a></li>
      <li><a href="/contact"><span>Talk</span>Book a strategy call</a></li>
    </ol>
  </div>
</section>
```
Local (`for/local-businesses.html`; add `id="problem"` to its first `<section class="section">` after the hero):
```html
      <li><a href="#problem"><span>The problem</span>Good work that&rsquo;s hard to find</a></li>
      <li><a href="/services/local-seo"><span>The work</span>Local SEO and fast lead follow-up</a></li>
      <li><a href="/investment"><span>The price</span>Retainers from $1,200 a month</a></li>
      <li><a href="/tools/local-visibility"><span>Free tool</span>Can Indianapolis find you?</a></li>
      <li><a href="/contact"><span>Talk</span>Book a free call</a></li>
```
Nonprofits (`for/nonprofits.html`; add `id="problem"` likewise):
```html
      <li><a href="#problem"><span>The problem</span>Marketing on ten spare minutes</a></li>
      <li><a href="/services/google-ad-grants"><span>The work</span>Put the $10,000 Ad Grant to use</a></li>
      <li><a href="/investment#nonprofit-rate"><span>The price</span>How the nonprofit rate works</a></li>
      <li><a href="/tools/90-day-plan"><span>Free tool</span>Build your 90-day plan</a></li>
      <li><a href="/contact"><span>Talk</span>Book a free call</a></li>
```
Each of the last two uses the same `<section class="cpp-rail">…<ol class="cpp-rail__list">` wrapper as founders. Before using the local and nonprofit "problem" lines, confirm each hub's first section heading matches; adjust the line to paraphrase that section's h2.

- [ ] **Step 2: Append the rail CSS**

```css
/* ---- Hub "Your next steps" rail (static; always visible) ---- */
.cpp-rail { background: var(--stone-2); border-bottom: 1px solid var(--line); padding: 20px 0; }
.cpp-rail__h { font: 700 var(--step--1)/1 var(--sans); text-transform: uppercase; letter-spacing: .08em; color: var(--ink-2); margin: 0 0 12px; }
.cpp-rail__list { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; counter-reset: cpp; }
.cpp-rail__list li { counter-increment: cpp; }
.cpp-rail__list a {
  display: grid; gap: 4px; height: 100%; padding: 12px 14px 12px 44px; position: relative;
  background: var(--bone); border: 1px solid var(--line); border-radius: 6px;
  color: var(--ink); text-decoration: none; font: 600 var(--step--1)/1.35 var(--sans);
  transition: border-color .2s var(--ease), transform .2s var(--ease);
}
.cpp-rail__list a::before { content: counter(cpp, decimal-leading-zero); position: absolute; left: 14px; top: 12px; color: var(--amber); font-weight: 800; }
.cpp-rail__list a span { font-weight: 500; color: var(--ink-2); font-size: .85em; }
.cpp-rail__list a:hover, .cpp-rail__list a:focus-visible { border-color: var(--cobalt); transform: translateY(-2px); }
@media (max-width: 960px) { .cpp-rail__list { grid-template-columns: 1fr; } }
```

- [ ] **Step 3: Browser verification**

On each hub: the rail sits between the hero and the first section. The `#problem` link scrolls to the right section, without being hidden under the sticky nav (if it is hidden, add `scroll-margin-top: 96px` to `#problem` in `path.css`). All five links resolve (`read_network_requests` after clicking each, or `fetch(href).then(r=>r.status)` for each href is 200). At 375px the rail stacks vertically with no horizontal scroll. With JS disabled the rail is still present.

- [ ] **Step 4: Commit**

```bash
git add for/ investment.html path.css
git commit -m "Add 'Your next steps' rail to the three audience hubs"
```

---

### Task 7: Services, tools, and articles listings + "Next for you" on article pages

**Files:**
- Modify: `services.html` (each `.idx-group`)
- Modify: `resources.html` (`.res-tools`)
- Modify: `articles/index.html` (a "For you" chip and its inline filter script)
- Modify: `path.js` (`renderNextFor`)
- Modify: `path.css` (next-for-you block)

**Interfaces:**
- Consumes: the `[data-path-sort]` behavior and `CPPath.get`, `CPPath.isFor`, `CPPath.pathsFor`, `CPPath.nextFor`, and the `cp:path` event from Task 3.
- Produces: none.

- [ ] **Step 1: Tag the lists**

- `services.html`: add `data-path-sort="Other services"` to each of the four `<div class="idx-group …">`. Each group's `h3` is untagged, so it stays first.
- `resources.html`: change `<div class="practice-grid res-tools mt-lg">` to `<div class="practice-grid res-tools mt-lg" data-path-sort="Other tools">`.

- [ ] **Step 2: Add "For you" to the articles index**

In `articles/index.html`, insert before the `All` chip:
`<button type="button" class="topic-chip" data-topic="foryou" aria-pressed="false" hidden>For you</button>`

In the inline filter script:
- In `apply()`, replace the two lines that compute `inTopic` and `hit`:
```js
      var inTopic = topic === 'all' || topic === 'foryou' || s.dataset.topic === topic;
```
```js
        var hit = inTopic && (topic !== 'foryou' || forYou(c)) && (!term || c.dataset.search.indexOf(term) !== -1);
```
- In the status line, add the foryou case:
```js
    status.textContent = term ? shown + (shown === 1 ? ' article' : ' articles') + ' match “' + q.value.trim() + '”'
      : topic === 'all' ? '' : topic === 'foryou' ? shown + ' articles picked for your path. Choose All to see every article.'
      : shown + (shown === 1 ? ' article' : ' articles') + ' in this topic';
```
- Add a helper above `apply()`:
```js
  function pathOn() { var k = window.CPPath && CPPath.get(); return k && k !== 'none' ? k : null; }
  function forYou(c) { var k = pathOn(); return !!k && CPPath.isFor(CPPath.pathsFor(c.getAttribute('href')), k); }
```
- In `setTopic`, the check uses `chips.some(function (c) { return !c.hidden && c.dataset.topic === t; })`.
- Replace the final `setTopic(location.hash.slice(1) || 'all', false);` with:
```js
  var fy = document.querySelector('.topic-chip[data-topic="foryou"]');
  function boot() {
    fy.hidden = !pathOn();
    setTopic(location.hash.slice(1) || (pathOn() ? 'foryou' : 'all'), false);
  }
  document.addEventListener('cp:path', boot);
  if (window.CPPath) boot(); else document.addEventListener('DOMContentLoaded', boot);
```
(The inline script runs before the deferred `path.js`; deferred scripts finish before `DOMContentLoaded`.)

- [ ] **Step 3: Implement `renderNextFor` in `path.js`**

Replace `function renderNextFor(k) {}` with:
```js
  function renderNextFor(k) {
    var old = document.querySelector(".cpp-next"); if (old) old.parentNode.removeChild(old);
    var here = cleanHref(location.pathname);
    if (!k || here.indexOf("/articles/") !== 0 || here === "/articles/") return;
    var picks = nextFor(k, here, 3); if (!picks.length) return;
    var sec = h("section", "cpp-next"), wrap = h("div", "wrap"), list = h("ul", "cpp-next__list");
    wrap.appendChild(h("h2", "cpp-next__h", "Next for you"));
    picks.forEach(function (p) { var li = h("li"), a = h("a", null, p.title); a.href = p.href; li.appendChild(a); list.appendChild(li); });
    wrap.appendChild(list);
    var hub = h("a", "tlink", "Everything for the " + LABEL[k] + " path →"); hub.href = HUB[k]; wrap.appendChild(hub);
    sec.appendChild(wrap);
    var anchor = document.querySelector(".next-strip") || document.querySelector("footer");
    if (anchor) anchor.parentNode.insertBefore(sec, anchor);
  }
```
CSS:
```css
/* ---- Article pages: Next for you ---- */
.cpp-next { padding: clamp(32px, 5vw, 56px) 0; border-top: 1px solid var(--line); }
.cpp-next__h { font: 800 var(--step-2, 1.5rem)/1.1 var(--sans); margin: 0 0 16px; }
.cpp-next__list { list-style: none; padding: 0; margin: 0 0 16px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.cpp-next__list a { display: block; height: 100%; padding: 16px; border: 1px solid var(--line); border-radius: 6px; color: var(--ink); text-decoration: none; font-weight: 600; background: var(--bone); }
.cpp-next__list a:hover, .cpp-next__list a:focus-visible { border-color: var(--cobalt); }
@media (max-width: 760px) { .cpp-next__list { grid-template-columns: 1fr; } }
```

- [ ] **Step 4: Browser verification**

1. `/services` with local set: in the Marketing group, Social media, Video & photo, SEO, and Local SEO come first, and "Other services (3)" collapses Branding, Content, and Ad Grants. Open it: the items are visible and not stuck at opacity 0. Switch to `none`: the original order returns and there is no `details`.
2. `/resources#tools` with nonprofits set: Check-Up, Local visibility, and 90-day plan come first, and "Other tools (2)" holds the rest.
3. `/articles` with founders set: the "For you" chip is visible and active, and the status reads "13 articles picked for your path…". `/articles#ads` still opens Ads. With `none`, the "For you" chip is hidden and All is active. Switching path from the bar on this page re-runs the filter.
4. `/articles/fractional-cmo-cost` with founders set: "Next for you" shows 3 founder articles, not including the current one, plus the hub link, above "Where to next". Switch to local and the block re-renders with local picks.

- [ ] **Step 5: Commit**

```bash
git add services.html resources.html articles/index.html path.js path.css
git commit -m "Path-aware services, tools, and article listings; Next for you on articles"
```

---

### Task 8: Pricing page tailoring

**Files:**
- Modify: `investment.html` (two callouts above `.tier-grid`, a badge in the System card)
- Modify: `path.css` (pricing block)

**Interfaces:**
- Consumes: the copy-variant CSS from Task 2 and `#nonprofit-rate` from Task 6.
- Produces: none.

- [ ] **Step 1: Check the copy with the voice skill, then insert the callouts**

Immediately before `<div class="tier-grid">`:
```html
<p class="cpp-callout reveal" data-path-copy="nonprofits"><strong>Nonprofit?</strong> You pay a reduced rate on every tier below. <a class="tlink" href="#nonprofit-rate">How the nonprofit rate works</a></p>
<p class="cpp-callout reveal" data-path-copy="founders"><strong>Most founders start with the $3,000 strategy engagement</strong> and decide on a retainer after. <a class="tlink" href="/services/strategy">What&rsquo;s in it</a> &middot; <a class="tlink" href="#projects">Project pricing</a></p>
```
In the System card (`<h3 class="inv-card__name mt-sm">System</h3>`), insert just before that h3:
`<span class="cpp-badge" data-path-copy="local">Most local businesses pick this</span>`

- [ ] **Step 2: Append the pricing CSS**

```css
/* ---- Pricing callouts ---- */
.cpp-callout { margin: 0 0 24px; padding: 14px 18px; border-left: 3px solid var(--amber); background: var(--bone-2); color: var(--ink); border-radius: 0 6px 6px 0; }
.cpp-badge { display: inline-block; font: 700 var(--step--1)/1 var(--sans); color: var(--navy); background: var(--amber); border-radius: 999px; padding: 5px 10px; }
```

- [ ] **Step 3: Browser verification**

`/investment`:
- With nonprofits set: only the nonprofit callout shows, and its link scrolls to the nonprofit note.
- With founders set: only the founders callout shows.
- With local set: only the System badge shows.
- With `none` and with no-JS: none of them show.
- The tier-grid layout is unchanged; compare a screenshot.

- [ ] **Step 4: Commit**

```bash
git add investment.html path.css
git commit -m "Path-aware pricing callouts"
```

---

### Task 9: Full QA pass and wrap-up

**Files:**
- Modify: `llms.txt` (one line describing the paths and the `?path=` links), if it lists site features
- Modify: `README.md` (a short "Client pathways" section: files, mapping lives in `path.js`, rollout script, how to add a page)

- [ ] **Step 1: Unit tests**

Run: `node --test tests/`
Expected: all PASS.

- [ ] **Step 2: Cross-page sweep**

For each path in [local, founders, nonprofits, none, unset], visit `/`, `/for/founders`, `/services`, `/services/seo`, `/investment`, `/resources`, `/articles`, `/articles/nonprofit-google-ad-grant`, `/contact`, and `/404`. Collect `read_console_messages({onlyErrors:true})` and check that `document.querySelectorAll('.cpp-more .cpp-more').length === 0`.
Expected: zero errors and no nested collapses.

- [ ] **Step 3: Accessibility pass on the loader and bar**

Use `read_page` on `/` with the loader pending: the dialog is named "Who's the work for?", there are 4 buttons with names, and the bar region is named "Your path". Run a keyboard-only pass of the bar on `/about`.

- [ ] **Step 4: Mobile and layout shift**

At 375px, check `/`, `/for/nonprofits`, `/investment`, and `/articles` with a path set: no horizontal scroll (`document.documentElement.scrollWidth <= innerWidth`). For CLS, use `new PerformanceObserver(...)` via `javascript_tool` on a reload with founders set. Expected: layout-shift total < 0.02, with nothing attributable to `.cpp-bar`.

- [ ] **Step 5: Docs and commit**

```bash
git add README.md llms.txt
git commit -m "Document client pathways"
```

- [ ] **Step 6: Report**

Give a one-paragraph summary with screenshots of the loader, the founders homepage, and the nonprofits pricing callout. Ask before pushing to `main`.
