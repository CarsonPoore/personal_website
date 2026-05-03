// Scroll-reveal for [data-reveal], [data-reveal-stagger], [data-zoom],
// [data-slide-l], [data-slide-r], [data-slide-stagger].
// Toggles .is-in once the element crosses the viewport threshold.

const STAGGER_MS = 90;

function init() {
  const targets = document.querySelectorAll<HTMLElement>(
    '[data-reveal], [data-reveal-stagger], [data-zoom], [data-slide-l], [data-slide-r], [data-slide-stagger]'
  );
  if (!targets.length) return;

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        const el = e.target as HTMLElement;
        el.classList.add('is-in');

        if (el.hasAttribute('data-reveal-stagger') || el.hasAttribute('data-slide-stagger')) {
          const kids = Array.from(el.children) as HTMLElement[];
          kids.forEach((k, i) => {
            k.style.transitionDelay = `${i * STAGGER_MS}ms`;
          });
        }
        io.unobserve(el);
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.1 }
  );

  targets.forEach((t) => io.observe(t));
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
