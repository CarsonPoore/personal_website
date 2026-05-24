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

  // Tweaks persistence
  const root = document.documentElement;
  const ACCENTS = {
    copper:  { hex: "#9f7557", strong: "#7a5841", soft: "#f0e6dd" },
    rose:    { hex: "#a27164", strong: "#7d544a", soft: "#f1e3df" },
    slate:   { hex: "#617e82", strong: "#475f63", soft: "#dbe3e4" },
    black:   { hex: "#1a1a1a", strong: "#000000", soft: "#e8e8e8" }
  };

  function applyAccent(name) {
    const a = ACCENTS[name] || ACCENTS.copper;
    root.style.setProperty("--accent", a.hex);
    root.style.setProperty("--accent-strong", a.strong);
    root.style.setProperty("--accent-soft", a.soft);
  }

  const savedAccent = localStorage.getItem("cp.accent") || "copper";
  applyAccent(savedAccent);

  // Build tweaks UI if present
  const tweaks = document.querySelector(".tweaks");
  const tweaksToggle = document.querySelector(".tweaks-toggle");
  if (tweaks && tweaksToggle) {
    tweaks.querySelectorAll(".swatch").forEach(b => {
      const k = b.dataset.accent;
      if (k === savedAccent) b.classList.add("is-active");
      b.addEventListener("click", () => {
        tweaks.querySelectorAll(".swatch").forEach(x => x.classList.remove("is-active"));
        b.classList.add("is-active");
        applyAccent(k);
        localStorage.setItem("cp.accent", k);
      });
    });
    tweaksToggle.addEventListener("click", () => {
      tweaks.classList.add("is-open");
      tweaksToggle.style.display = "none";
    });
    const close = tweaks.querySelector(".tweaks__close");
    if (close) close.addEventListener("click", () => {
      tweaks.classList.remove("is-open");
      tweaksToggle.style.display = "";
    });
  }

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
            In the real build this connects to Cal.com — for now, email <a href="mailto:carsonpoore@gmail.com" class="tlink">carsonpoore@gmail.com</a> and we'll confirm.
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
