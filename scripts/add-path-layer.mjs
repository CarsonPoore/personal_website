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
