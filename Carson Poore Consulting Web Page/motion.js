/* Carson Poore Consulting — motion enhancements */
(function () {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ── Scroll progress bar ───────────────────────────────────────────────
  const bar = document.createElement("div");
  bar.className = "scroll-progress";
  document.body.appendChild(bar);
  function updateProgress() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const pct = Math.max(0, Math.min(100, (window.scrollY / max) * 100));
    bar.style.width = pct + "%";
  }
  window.addEventListener("scroll", updateProgress, { passive: true });
  updateProgress();

  if (reduceMotion) return; // skip the rest

  // ── Split headlines into word-spans ───────────────────────────────────
  document.querySelectorAll("[data-split]").forEach(el => {
    const html = el.innerHTML;
    // simple word split that preserves inline <em>
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    const out = document.createElement("span");
    out.className = "split-text";

    function walk(node, parentOut) {
      node.childNodes.forEach(n => {
        if (n.nodeType === 3) {
          n.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) {
              parentOut.appendChild(document.createTextNode(" "));
            } else {
              const w = document.createElement("span");
              w.className = "split-word";
              const inner = document.createElement("span");
              inner.textContent = part;
              w.appendChild(inner);
              parentOut.appendChild(w);
            }
          });
        } else if (n.nodeType === 1) {
          const clone = n.cloneNode(false);
          parentOut.appendChild(clone);
          walk(n, clone);
        }
      });
    }
    walk(tmp, out);
    el.innerHTML = "";
    el.appendChild(out);

    // observe for entry
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          out.classList.add("in");
          // stagger via inline transition-delay
          out.querySelectorAll(".split-word > span").forEach((w, i) => {
            w.style.transitionDelay = (i * 0.045) + "s";
          });
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.2 });
    obs.observe(el);
  });

  // ── Magnetic buttons ──────────────────────────────────────────────────
  document.querySelectorAll(".btn--primary, [data-magnetic]").forEach(btn => {
    btn.setAttribute("data-magnetic", "");
    let raf = 0;
    btn.addEventListener("mousemove", (e) => {
      const r = btn.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      const strength = 0.18;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        btn.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
      });
    });
    btn.addEventListener("mouseleave", () => {
      cancelAnimationFrame(raf);
      btn.style.transform = "";
    });
  });

  // ── Card tilt on hover ────────────────────────────────────────────────
  document.querySelectorAll(".card").forEach(card => {
    let raf = 0;
    card.addEventListener("mousemove", (e) => {
      const r = card.getBoundingClientRect();
      const cx = (e.clientX - r.left) / r.width - 0.5;
      const cy = (e.clientY - r.top) / r.height - 0.5;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        card.style.transform = `perspective(1200px) rotateY(${cx * 3.2}deg) rotateX(${-cy * 3.2}deg) translateY(-3px)`;
      });
    });
    card.addEventListener("mouseleave", () => {
      cancelAnimationFrame(raf);
      card.style.transform = "";
    });
  });

  // ── Mouse-follow parallax on hero mark (disabled per design feedback) ─

  // ── Parallax on placeholder images + step visuals ─────────────────────
  const parallaxEls = document.querySelectorAll("[data-parallax], .placeholder, .step__visual");
  if (parallaxEls.length && "IntersectionObserver" in window) {
    const items = [];
    parallaxEls.forEach(el => {
      el.dataset.parallaxSpeed = el.dataset.parallaxSpeed || "0.06";
      items.push({ el, speed: parseFloat(el.dataset.parallaxSpeed) });
    });
    let ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const vh = window.innerHeight;
        items.forEach(({ el, speed }) => {
          const r = el.getBoundingClientRect();
          if (r.bottom < -200 || r.top > vh + 200) return;
          const center = r.top + r.height / 2;
          const offset = (center - vh / 2) * -speed;
          el.style.transform = `translateY(${offset.toFixed(1)}px)`;
        });
        ticking = false;
      });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  // ── Section bg shift on scroll into view ──────────────────────────────
  const shiftSections = document.querySelectorAll(".section[data-bg]");
  if (shiftSections.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          document.body.style.transition = "background-color 1s var(--ease)";
          document.body.style.backgroundColor = e.target.dataset.bg;
        }
      });
    }, { rootMargin: "-40% 0px -40% 0px" });
    shiftSections.forEach(s => io.observe(s));
  }

  // ── Marquee speed-up on hover (handled in CSS); pause on visibility hidden
  document.addEventListener("visibilitychange", () => {
    document.querySelectorAll(".marquee__track").forEach(t => {
      t.style.animationPlayState = document.hidden ? "paused" : "";
    });
  });

  // ── Method rail dot trail (extend existing observer with a glow trail)
  // (kept lean — the existing IntersectionObserver in method.html already handles active state)
})();
