// Pin a section vertically and translate its inner track horizontally
// based on scroll progress through the section.
// Activates only at >= 1000px viewport. Falls back to natural vertical layout otherwise.

function init() {
  const containers = document.querySelectorAll<HTMLElement>('[data-h-scroll]');
  if (!containers.length) return;

  const mq = window.matchMedia('(min-width: 1000px)');
  let active = mq.matches;

  function setup(c: HTMLElement) {
    const track = c.querySelector<HTMLElement>('[data-h-track]');
    if (!track) return;

    const onScroll = () => {
      if (!active) {
        track.style.transform = '';
        return;
      }
      const rect = c.getBoundingClientRect();
      const total = c.offsetHeight - window.innerHeight;
      if (total <= 0) return;
      const progress = Math.max(0, Math.min(1, -rect.top / total));
      const distance = track.scrollWidth - window.innerWidth + 64; // +slop
      track.style.transform = `translate3d(${-progress * distance}px, 0, 0)`;

      // emit progress for any UI that wants it (e.g. step counter)
      c.style.setProperty('--h-progress', String(progress));
      const stepN = c.querySelectorAll('[data-h-step]').length;
      const cur = Math.min(stepN, Math.floor(progress * stepN) + 1);
      c.dataset.current = String(cur).padStart(2, '0');
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
  }

  mq.addEventListener('change', () => {
    active = mq.matches;
    containers.forEach((c) => {
      const track = c.querySelector<HTMLElement>('[data-h-track]');
      if (track && !active) track.style.transform = '';
    });
    window.dispatchEvent(new Event('scroll'));
  });

  containers.forEach((c) => setup(c));
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
