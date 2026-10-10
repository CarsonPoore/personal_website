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
