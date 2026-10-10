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
    setTimeout: (fn) => timers.push(fn), CPPathLoader: cpPath ? true : undefined };
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
