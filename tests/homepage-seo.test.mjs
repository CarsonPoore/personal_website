import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const text = (s) => s.replace(/<[^>]+>/g, "").replace(/&rsquo;/g, "’").replace(/\s+/g, " ").trim();

test("raw-HTML crawlers see exactly one headline in the homepage h1", () => {
  const h1s = html.match(/<h1[\s\S]*?<\/h1>/g);
  assert.equal(h1s.length, 1);
  assert.equal(text(h1s[0]), "Let’s make your business impossible to overlook.");
});

test("hero subhead holds only the generic sentence as text", () => {
  const sub = html.match(/<p class="hero__sub[^"]*"[^>]*>[\s\S]*?<\/p>/)[0];
  assert.ok(!/Word of mouth|pre-seed|executive and development directors/.test(text(sub)));
});

test("path alternates live in attributes for every path", () => {
  for (const k of ["local", "founders", "nonprofits"]) {
    assert.match(html, new RegExp('<h1[^>]*data-alt-' + k + '="'));
    assert.match(html, new RegExp('<p class="hero__sub[^>]*data-alt-' + k + '="'));
  }
});
