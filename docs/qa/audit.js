// Mechanical QA for carsonpoore.com v2 — run: node docs/qa/audit.js [files...]
// Checks every page in blueprint.json (or the files given) for structure, chrome,
// SEO basics, schema validity, link discipline, banned copy, and guardrails.
const fs = require("fs");
const path = require("path");
const ROOT = path.resolve(__dirname, "../..");
const bp = require(path.join(ROOT, "docs/strategy/blueprint.json"));
const allowed = new Set(bp.sitemap.map(p => p.path).concat(["/", "/#who-we-help"]));
const files = process.argv.slice(2).length
  ? process.argv.slice(2)
  : bp.sitemap.map(p => p.file.replace(/^\//, ""));

const BANNED = /\b(delve|robust|seamless|elevate|tapestry|testament|pivotal|meticulous|foster|bolster|leverage|holistic|empower|unlock|streamline|synergy|funnel|game[- ]chang\w*|skyrocket|crush it|next level|business coach|in today's)\b/gi;
const NEGPAR = /\b(not just|not only|isn't just|more than just)\b/gi;
const ALLOWED_PRICES = new Set(["1,200", "2,400", "4,800", "3,000"]);
const decode = s => s.replace(/&rsquo;/g, "’").replace(/&lsquo;/g, "‘").replace(/&ldquo;/g, "“").replace(/&rdquo;/g, "”")
  .replace(/&ndash;/g, "–").replace(/&mdash;/g, "—").replace(/&amp;/g, "&").replace(/&nbsp;/g, " ").replace(/&#39;/g, "'").replace(/&quot;/g, '"');

let failCount = 0;
for (const f of files) {
  const fp = path.join(ROOT, f);
  if (!fs.existsSync(fp)) { console.log(`✗ ${f}: MISSING`); failCount++; continue; }
  const h = fs.readFileSync(fp, "utf8");
  const issues = [], warns = [];
  const is404 = f === "404.html", isTicket = f === "ticket.html";
  const urlPath = "/" + f.replace(/\.html$/, "").replace(/^index$/, "");

  // completeness
  if (!/<\/html>\s*$/i.test(h)) issues.push("file does not end with </html> (truncated?)");
  if (!h.includes("footer--v2")) issues.push("v2 footer missing");
  if (!h.includes('class="nav__drop"')) issues.push("v2 nav missing");
  if (!is404 && !/class="closing/.test(h)) issues.push(".closing band missing");
  const opens = (h.match(/<section\b/g) || []).length, closes = (h.match(/<\/section>/g) || []).length;
  if (opens !== closes) issues.push(`unbalanced <section>: ${opens} open / ${closes} close`);
  const dOpen = (h.match(/<div\b/g) || []).length, dClose = (h.match(/<\/div>/g) || []).length;
  if (dOpen !== dClose) issues.push(`unbalanced <div>: ${dOpen}/${dClose}`);

  // seo basics
  const title = decode((h.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || "");
  const meta = decode((h.match(/name="description"\s+content="([^"]*)"/) || [])[1] || "");
  if (!title) issues.push("no <title>"); else if (title.length > 62) warns.push(`title ${title.length}ch`);
  if (!is404) {
    if (meta.length < 130 || meta.length > 165) warns.push(`meta ${meta.length}ch`);
    const canon = (h.match(/rel="canonical"\s+href="([^"]+)"/) || [])[1];
    const want = "https://carsonpoore.com" + (urlPath === "/" ? "/" : urlPath);
    if (!canon) issues.push("no canonical"); else if (canon !== want && canon !== want.replace(/\/$/, "")) issues.push(`canonical ${canon} ≠ ${want}`);
    if (f.startsWith("articles/") && !/class="[^"]*\bupdated\b/.test(h)) warns.push("article missing .updated line");
  }
  if (is404 || isTicket) { if (!/name="robots"[^>]*noindex/.test(h)) issues.push("missing noindex"); }
  const h1 = (h.match(/<h1[\s>]/g) || []).length;
  if (h1 !== 1) issues.push(`${h1} <h1> elements`);
  if (/gradient/i.test(h)) issues.push("contains 'gradient'");

  // schema
  const blocks = [...h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  if (!is404 && !blocks.length) issues.push("no JSON-LD");
  for (const m of blocks) {
    try {
      const j = JSON.parse(m[1]);
      const g = j["@graph"] || [j];
      if (!is404 && !g.some(n => n["@id"] === "https://carsonpoore.com/#org")) issues.push("JSON-LD missing #org node");
      const faq = g.find(n => n["@type"] === "FAQPage");
      if (faq) {
        const vis = decode(h.replace(/<script[\s\S]*?<\/script>/g, "").replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ");
        for (const q of faq.mainEntity || []) {
          const qn = decode(q.name).replace(/\s+/g, " ").trim();
          if (!vis.includes(qn)) issues.push(`FAQ question not visible verbatim: "${qn.slice(0, 50)}…"`);
        }
      }
    } catch (e) { issues.push("JSON-LD parse error: " + e.message.slice(0, 60)); }
  }

  // links + assets
  const hrefs = [...h.matchAll(/href="([^"]+)"/g)].map(m => m[1]);
  for (const x of new Set(hrefs)) {
    if (/^(https?:|mailto:|tel:|#)/.test(x)) continue;
    if (/\.(css|js|svg|png|jpg|jpeg|webp|webm|mp4|xml|txt|ico)(\?|$)/.test(x)) {
      if (!x.startsWith("/")) issues.push(`relative asset ${x}`);
      else if (!fs.existsSync(path.join(ROOT, x.split("?")[0]))) issues.push(`missing asset ${x}`);
      continue;
    }
    if (!x.startsWith("/")) { issues.push(`relative link ${x}`); continue; }
    if (/\.html/.test(x)) { issues.push(`.html link ${x}`); continue; }
    const c = x.split("?")[0].split("#")[0] || "/";
    if (!allowed.has(c) && !x.startsWith("/#")) issues.push(`link off-sitemap ${x}`);
  }
  for (const m of h.matchAll(/(?:src|poster|data-webm|data-hevc)="(\/[^"?]+)/g)) {
    if (!fs.existsSync(path.join(ROOT, m[1]))) issues.push(`missing media ${m[1]}`);
  }

  // copy
  const text = decode(h.replace(/<script[\s\S]*?<\/script>/g, "").replace(/<style[\s\S]*?<\/style>/g, "").replace(/<[^>]+>/g, " "));
  const bad = [...new Set((text.match(BANNED) || []).map(s => s.toLowerCase()))];
  if (bad.length) issues.push("banned: " + bad.join(", "));
  const np = (text.match(NEGPAR) || []).length;
  if (np) warns.push(`negative-parallelism x${np}`);
  const prices = [...text.matchAll(/\$(\d{1,3}(?:,\d{3})+|\d+)(?:\s*(?:\/|a |per )\s*mo)/gi)].map(m => m[1]).filter(p => !ALLOWED_PRICES.has(p));
  if (prices.length) warns.push("non-canonical monthly prices: " + [...new Set(prices)].join(", ") + " (ok only if cited market data)");
  const words = text.split(/\s+/).filter(Boolean).length;
  const em = (text.match(/—/g) || []).length;
  if (em / Math.max(words, 1) > 1 / 120) warns.push(`em-dash density ${em}/${words}w`);

  const ok = !issues.length;
  if (!ok) failCount++;
  console.log(`${ok ? "✓" : "✗"} ${f} (${words}w)${issues.length ? "\n    ISSUES: " + issues.join(" | ") : ""}${warns.length ? "\n    warn: " + warns.join(" | ") : ""}`);
}
console.log(`\n${files.length - failCount}/${files.length} pass`);
process.exitCode = failCount ? 1 : 0;
