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
    // Keep everything in place when the list has nothing for this path; a heading over an empty list reads as broken.
    var anyMine = parts.mine.some(function (n) { return !!itemPaths(n); });
    if (!anyMine) parts = { mine: list._cppOrig, other: [] };
    if (list.hasAttribute("data-path-sort-keep")) { parts = { mine: parts.mine.concat(parts.other), other: [] }; }
    parts.mine.forEach(function (n) { list.appendChild(n); });
    if (!parts.other.length) return;
    var more = h("details", "cpp-more");
    more.appendChild(h("summary", null, (list.getAttribute("data-path-sort") || "Other options") + " (" + parts.other.length + ")"));
    // Grid/flex lists lend their layout classes to the collapsed body; block lists (cards with their own chrome) don't.
    var keep = /grid|flex/.test(getComputedStyle(list).display)
      ? list.className.split(/\s+/).filter(function (c) { return c && c !== "reveal" && c.indexOf("a-") !== 0; }).join(" ") : "";
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

  function render() {
    var k = on();
    renderBar(false); tailorNav(k);
    [].forEach.call(document.querySelectorAll("[data-path-sort]"), function (l) { sortList(l, k); });
    tailorMailto(k); renderFooterLink(); renderNextFor(k);
  }

  /* ---- Loader (filled in Task 4) ---- */
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
})(this);
