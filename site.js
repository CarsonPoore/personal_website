/* Carson Poore Consulting — shared behavior */
(function () {
  // Nav scroll state
  const nav = document.querySelector(".nav");
  if (nav) {
    const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  // Mobile menu
  const burger = document.querySelector(".nav__burger");
  const menu = document.querySelector(".mobile-menu");
  if (burger && menu) {
    burger.addEventListener("click", () => {
      const open = menu.classList.toggle("is-open");
      burger.setAttribute("aria-expanded", String(open));
      menu.setAttribute("aria-hidden", String(!open));
    });
    menu.querySelectorAll("a").forEach(a => a.addEventListener("click", () => menu.classList.remove("is-open")));
  }

  // Reveal on scroll
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const els = document.querySelectorAll(".reveal");
  if (!prefersReduced && "IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    els.forEach(el => io.observe(el));
  } else {
    els.forEach(el => el.classList.add("in"));
  }

  // Clear legacy accent override from previous design system
  try { localStorage.removeItem("cp.accent"); } catch (e) {}

  // Active nav link — clean, extensionless, nested paths (v2)
  const norm = p => ("/" + (p || "").replace(/\/+$/, "").replace(/\.html$/, "").replace(/^\/+/, "")).toLowerCase() || "/";
  const here = norm(location.pathname) === "/index" ? "/" : norm(location.pathname);
  const seg1 = "/" + (here.split("/")[1] || "");
  document.querySelectorAll(".nav__links a, .nav__links .nav__item > a, .mobile-menu a").forEach(a => {
    const raw = (a.getAttribute("href") || "").split("#")[0];
    if (!raw) return;
    const href = norm(raw) === "/index" ? "/" : norm(raw);
    if (href === here || (href !== "/" && here.startsWith(href + "/"))) a.classList.add("is-active");
  });
  // Section highlight: /services/* lights Services, /for/* lights Who we help,
  // /tools/* and /articles/* light Resources
  document.querySelectorAll(".nav__item > a, .nav__links > a").forEach(a => {
    const raw = (a.getAttribute("href") || "").split("#")[0];
    if (!raw) return;
    const href = norm(raw);
    if (href === seg1 && seg1 !== "/") a.classList.add("is-active");
    if ((seg1 === "/tools" || seg1 === "/articles") && href === "/resources") a.classList.add("is-active");
  });
  if (seg1 === "/for") document.querySelectorAll(".nav__toggle").forEach(b => b.classList.add("is-active"));

  // Dropdowns: hover/focus opens them (CSS); click/tap toggles; Escape and outside clicks close
  const items = document.querySelectorAll(".nav__item.has-drop");
  const closeAll = except => items.forEach(it => {
    if (it === except) return;
    it.classList.remove("is-open");
    const b = it.querySelector(".nav__toggle"); if (b) b.setAttribute("aria-expanded", "false");
  });
  document.querySelectorAll(".nav__toggle").forEach(btn => {
    btn.addEventListener("click", e => {
      e.stopPropagation();
      const it = btn.closest(".nav__item");
      const open = !it.classList.contains("is-open");
      closeAll(it);
      it.classList.toggle("is-open", open);
      btn.setAttribute("aria-expanded", String(open));
    });
  });
  document.addEventListener("click", e => { if (!e.target.closest(".nav__item.has-drop")) closeAll(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeAll(); });

  // Sticky mobile booking bar: after the hero, hidden while the closing band shows,
  // never on contact, ticket, or pages without a closing band (404)
  (function () {
    const closing = document.querySelector(".closing");
    const hero = document.querySelector(".hero, .page-hero");
    if (!closing || !hero || /^\/(contact|ticket)(\.html)?$/.test(location.pathname)) return;
    const bar = document.createElement("div");
    bar.className = "mbar";
    bar.innerHTML = '<span>30 minutes, no pitch.</span><a class="btn btn--primary" href="/contact">Book a free call <span class="arr">→</span></a>';
    document.body.appendChild(bar);
    document.body.classList.add("has-mbar");
    if (!("IntersectionObserver" in window)) { bar.classList.add("is-on"); return; }
    let pastHero = false, closingOn = false;
    const sync = () => bar.classList.toggle("is-on", pastHero && !closingOn);
    new IntersectionObserver(([e]) => { pastHero = !e.isIntersecting && e.boundingClientRect.top < 0; sync(); }).observe(hero);
    new IntersectionObserver(([e]) => { closingOn = e.isIntersecting; sync(); }).observe(closing);
  })();

  // Contact: scheduling mock
  const cal = document.querySelector("[data-sched]");
  if (cal) initScheduler(cal);

  function initScheduler(root) {
    const monthEl = root.querySelector("[data-sched-month]");
    const gridEl = root.querySelector("[data-sched-grid]");
    const slotsEl = root.querySelector("[data-sched-slots]");
    const confirmEl = root.querySelector("[data-sched-confirm]");
    const prev = root.querySelector("[data-sched-prev]");
    const next = root.querySelector("[data-sched-next]");

    // Use a fixed reference date so the page is deterministic
    let view = new Date(2026, 5, 1); // June 2026
    const today = new Date(2026, 5, 4);
    let selectedDay = null;
    let selectedSlot = null;

    const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    const dow = ["S","M","T","W","T","F","S"];

    // Pre-seed available days deterministically
    function isAvailable(d, m, y) {
      // Available: most Tue/Wed/Thu in current month >= today
      const dt = new Date(y, m, d);
      const day = dt.getDay();
      if (dt < today) return false;
      return [2,3,4].includes(day);
    }

    function render() {
      gridEl.innerHTML = "";
      const y = view.getFullYear();
      const m = view.getMonth();
      monthEl.textContent = `${months[m]} ${y}`;

      dow.forEach(d => {
        const el = document.createElement("div");
        el.className = "sched__dow";
        el.textContent = d;
        gridEl.appendChild(el);
      });

      const first = new Date(y, m, 1);
      const startDay = first.getDay();
      const daysInMonth = new Date(y, m+1, 0).getDate();

      for (let i = 0; i < startDay; i++) {
        const el = document.createElement("div");
        gridEl.appendChild(el);
      }
      for (let d = 1; d <= daysInMonth; d++) {
        const btn = document.createElement("button");
        btn.className = "sched__day";
        btn.textContent = d;
        const avail = isAvailable(d, m, y);
        if (avail) btn.classList.add("is-available");
        else btn.disabled = true;
        if (today.getDate() === d && today.getMonth() === m && today.getFullYear() === y) btn.classList.add("is-today");
        if (selectedDay && selectedDay.d === d && selectedDay.m === m && selectedDay.y === y) btn.classList.add("is-selected");
        btn.addEventListener("click", () => {
          if (!avail) return;
          selectedDay = { d, m, y };
          selectedSlot = null;
          confirmEl.classList.remove("is-on");
          render();
          renderSlots();
        });
        gridEl.appendChild(btn);
      }
    }

    function renderSlots() {
      slotsEl.innerHTML = "";
      if (!selectedDay) {
        const p = document.createElement("p");
        p.style.color = "var(--muted)";
        p.style.fontSize = "0.92rem";
        p.textContent = "Pick a date with a dot. Times are Eastern.";
        slotsEl.appendChild(p);
        return;
      }
      const times = ["9:00 AM", "10:00 AM", "11:30 AM", "1:00 PM", "2:30 PM", "4:00 PM"];
      times.forEach(t => {
        const b = document.createElement("button");
        b.className = "sched__slot";
        b.innerHTML = `<span>${t}</span><span class="arr">→</span>`;
        if (selectedSlot === t) b.classList.add("is-selected");
        b.addEventListener("click", () => {
          selectedSlot = t;
          renderSlots();
          const { d, m, y } = selectedDay;
          confirmEl.innerHTML = `
            <strong>Picked.</strong> ${["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][new Date(y,m,d).getDay()]}, ${months[m]} ${d} at ${t} ET.
            In the real build this connects to Cal.com — for now, email <a href="mailto:carson@carsonpoore.com" class="tlink">carson@carsonpoore.com</a> and we'll confirm.
          `;
          confirmEl.classList.add("is-on");
        });
        slotsEl.appendChild(b);
      });
    }

    prev.addEventListener("click", () => { view = new Date(view.getFullYear(), view.getMonth() - 1, 1); selectedDay = null; selectedSlot = null; confirmEl.classList.remove("is-on"); render(); renderSlots(); });
    next.addEventListener("click", () => { view = new Date(view.getFullYear(), view.getMonth() + 1, 1); selectedDay = null; selectedSlot = null; confirmEl.classList.remove("is-on"); render(); renderSlots(); });

    render();
    renderSlots();
  }
})();

// Blueprint frame on navy heroes — hairline grid, bracket corners, annotation labels
(function () {
  const STEP = 156;

  document.querySelectorAll(".hero, .closing").forEach(hero => {
    const closing = hero.classList.contains("closing");
    const bp = document.createElement("div");
    bp.className = "bp";
    bp.setAttribute("aria-hidden", "true");
    for (let x = STEP; x < 3200; x += STEP) {
      const l = document.createElement("span");
      l.className = "bp__line bp__line--v";
      l.style.left = x + "px";
      bp.appendChild(l);
    }
    for (let y = STEP; y < 1800; y += STEP) {
      const l = document.createElement("span");
      l.className = "bp__line bp__line--h";
      l.style.top = y + "px";
      bp.appendChild(l);
    }
    ["tl", "tr", "br", "bl"].forEach(c => {
      const k = document.createElement("span");
      k.className = "bp__corner bp__corner--" + c;
      bp.appendChild(k);
    });
    hero.insertBefore(bp, hero.firstChild);
  });
})();

// Motion loops — play only while on screen; honor reduced motion (poster only)
(function () {
  const vids = document.querySelectorAll("video.motion-loop");
  if (!vids.length) return;
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");

  // Transparent loops carry data-webm (VP9 alpha) + data-hevc (HEVC alpha).
  // WebKit (Safari, every iOS browser) only renders alpha from HEVC.
  const ua = navigator.userAgent;
  const webkitOnly = /AppleWebKit/.test(ua) && !/Chrome|Chromium|Edg|Firefox|OPR/.test(ua);
  vids.forEach(v => {
    if (v.dataset.webm && !v.getAttribute("src")) v.src = webkitOnly ? (v.dataset.hevc || v.dataset.webm) : v.dataset.webm;
  });

  vids.forEach(v => {
    // JS takes over playback from the autoplay attribute
    v.removeAttribute("autoplay");
    v.autoplay = false;
    v.muted = true;
    if (!v.paused) v.pause();
  });

  const play = v => {
    if (mq.matches) return;
    if (v.preload === "none") v.preload = "auto";
    const p = v.play();
    if (p && p.catch) p.catch(() => {});
  };

  if (!("IntersectionObserver" in window)) {
    vids.forEach(play);
    return;
  }

  const visible = new Set();
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { visible.add(e.target); play(e.target); }
      else { visible.delete(e.target); e.target.pause(); }
    });
  }, { threshold: 0.25 });
  vids.forEach(v => io.observe(v));

  // React if the user toggles reduced motion while the page is open
  const onChange = () => {
    if (mq.matches) vids.forEach(v => { v.pause(); try { v.currentTime = 0; } catch (e) {} });
    else visible.forEach(play);
  };
  // Resume after a background tab becomes visible again
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) visible.forEach(play);
  });
  if (mq.addEventListener) mq.addEventListener("change", onChange);
  else if (mq.addListener) mq.addListener(onChange);
})();

/* Custom cursor: cobalt dot + trailing ring. Fine pointers only; off for reduced motion. */
(function () {
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const dot = document.createElement("div");
  const ring = document.createElement("div");
  dot.className = "cursor-dot";
  ring.className = "cursor-ring";
  dot.setAttribute("aria-hidden", "true");
  ring.setAttribute("aria-hidden", "true");
  document.body.append(ring, dot);
  document.documentElement.classList.add("has-cursor");

  const HOVER = "a, button, [role='button'], label, summary, select, .btn";
  // Dark = nearest opaque background is dark. Cached per element.
  const darkCache = new WeakMap();
  const isDark = el => {
    for (let n = el; n && n !== document.documentElement; n = n.parentElement) {
      if (darkCache.has(n)) return darkCache.get(n);
      const m = getComputedStyle(n).backgroundColor.match(/[\d.]+/g);
      if (m && (m[3] === undefined || +m[3] > 0.5)) {
        const dark = 0.299 * m[0] + 0.587 * m[1] + 0.114 * m[2] < 110;
        darkCache.set(el, dark);
        return dark;
      }
    }
    return false;
  };
  const TEXT = "input, textarea, [contenteditable='true']";
  let x = -100, y = -100, rx = x, ry = y, raf = 0;

  const tick = () => {
    rx += (x - rx) * 0.2;
    ry += (y - ry) * 0.2;
    ring.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`;
    raf = Math.abs(x - rx) + Math.abs(y - ry) > 0.1 ? requestAnimationFrame(tick) : 0;
  };

  document.addEventListener("mousemove", e => {
    x = e.clientX; y = e.clientY;
    dot.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
    document.documentElement.classList.remove("cursor-out");
    const t = e.target instanceof Element ? e.target : null;
    document.documentElement.classList.toggle("cursor-hover", !!(t && t.closest(HOVER)));
    document.documentElement.classList.toggle("cursor-text", !!(t && t.closest(TEXT)));
    document.documentElement.classList.toggle("cursor-dark", !!(t && isDark(t)));
    if (!raf) raf = requestAnimationFrame(tick);
  }, { passive: true });

  document.addEventListener("mouseleave", () => document.documentElement.classList.add("cursor-out"));
  document.addEventListener("mousedown", () => document.documentElement.classList.add("cursor-down"));
  document.addEventListener("mouseup", () => document.documentElement.classList.remove("cursor-down"));
})();
