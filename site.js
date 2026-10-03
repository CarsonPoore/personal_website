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
    burger.addEventListener("click", () => menu.classList.toggle("is-open"));
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

  // Active nav link based on path
  const path = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  document.querySelectorAll(".nav__links a, .mobile-menu a").forEach(a => {
    const href = (a.getAttribute("href") || "").toLowerCase();
    if (href === path || (path === "" && href === "index.html") || (path === "index.html" && href === "index.html")) {
      a.classList.add("is-active");
    }
  });

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
  const PAGES = ["index", "services", "method", "investment", "work", "about", "contact"];
  const page = ((location.pathname.split("/").pop() || "index").toLowerCase().replace(/\.html$/, "")) || "index";
  const idx = PAGES.indexOf(page);
  const pad = n => String(n).padStart(2, "0");
  const refLabel = idx >= 0 ? `Ref. CPC-${pad(idx + 1)}` : "Ref. CPC-00";
  const secLabel = idx >= 0 ? `Sec. ${pad(idx + 1)} / ${pad(PAGES.length)}` : "Indianapolis, IN";
  const STEP = 156;

  document.querySelectorAll(".hero").forEach(hero => {
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
    [["tl", refLabel], ["br", secLabel]].forEach(([pos, text]) => {
      const t = document.createElement("span");
      t.className = "bp__label bp__label--" + pos;
      t.textContent = text;
      bp.appendChild(t);
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
