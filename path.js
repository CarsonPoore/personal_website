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
