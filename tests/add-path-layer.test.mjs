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
