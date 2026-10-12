(() => {
  function initialize() {
    const motion = () => window.portfolioMotion?.enabled ?? !matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fine = matchMedia('(hover: hover) and (pointer: fine)');
    const header = document.querySelector('.site-header');
    if (header && 'ResizeObserver' in window) new ResizeObserver(([entry]) => {
      document.documentElement.style.setProperty('--header-height', `${Math.ceil(entry.borderBoxSize?.[0]?.blockSize || header.offsetHeight)}px`);
    }).observe(header);

    document.querySelectorAll('.portrait-board, .project-card').forEach(node => {
      node.dataset.tilt = '';
      let frame = 0;
      let rect;
      let x = 0;
      let y = 0;
      const reset = () => {
        cancelAnimationFrame(frame);
        frame = 0;
        for (const name of ['--tilt-x', '--tilt-y', '--tilt-px', '--tilt-py']) node.style.removeProperty(name);
      };
      node.addEventListener('pointerenter', () => { rect = node.getBoundingClientRect(); });
      node.addEventListener('pointermove', event => {
        if (!motion() || !fine.matches || event.pointerType !== 'mouse') return;
        rect ||= node.getBoundingClientRect();
        x = Math.max(-1, Math.min(1, (event.clientX - rect.left) / rect.width * 2 - 1));
        y = Math.max(-1, Math.min(1, (event.clientY - rect.top) / rect.height * 2 - 1));
        if (!frame) frame = requestAnimationFrame(() => {
          node.style.setProperty('--tilt-x', `${-y * 2.5}deg`);
          node.style.setProperty('--tilt-y', `${x * 3.5}deg`);
          node.style.setProperty('--tilt-px', `${x * 7}px`);
          node.style.setProperty('--tilt-py', `${y * 5}px`);
          frame = 0;
        });
      });
      node.addEventListener('pointerleave', reset);
      node.addEventListener('pointercancel', reset);
      window.addEventListener('portfolio-motionchange', reset);
      window.addEventListener('scroll', () => { rect = null; }, { passive: true });
    });

    const contact = document.querySelector('.contact-inner');
    if (contact && !contact.querySelector('.contact-lantern')) {
      const lantern = document.createElement('div');
      lantern.className = 'contact-lantern';
      lantern.setAttribute('aria-hidden', 'true');
      lantern.innerHTML = '<i class="lantern-cord"></i><div class="lantern-body"><span>創</span></div>';
      contact.prepend(lantern);
      if ('IntersectionObserver' in window) new IntersectionObserver(([entry]) => lantern.classList.toggle('is-in-view', entry.isIntersecting)).observe(lantern);
    }

    const journey = document.querySelector('.journey-map');
    document.querySelectorAll('.journey-marker').forEach(marker => { marker.dataset.number = marker.textContent; });
    const chapters = [...document.querySelectorAll('.chapter-progress a')].map(link => ({ link, target: document.querySelector(link.getAttribute('href')) })).filter(item => item.target);
    let progressFrame = 0;
    function updateProgress() {
      progressFrame = 0;
      let current = chapters[0];
      for (const item of chapters) if (item.target.getBoundingClientRect().top < innerHeight * .5) current = item;
      for (const item of chapters) {
        if (item === current) item.link.setAttribute('aria-current', 'location');
        else item.link.removeAttribute('aria-current');
      }
      if (journey) {
        const rect = journey.getBoundingClientRect();
        const progress = Math.max(0, Math.min(100, (innerHeight * .65 - rect.top) / rect.height * 100));
        journey.style.setProperty('--journey-progress', `${progress}%`);
        journey.querySelectorAll('.journey-node').forEach(node => node.classList.toggle('is-current', node.getBoundingClientRect().top < innerHeight * .7));
      }
    }
    function requestProgress() { if (!progressFrame) progressFrame = requestAnimationFrame(updateProgress); }
    if (chapters.length || journey) {
      addEventListener('scroll', requestProgress, { passive: true });
      addEventListener('resize', requestProgress, { passive: true });
      updateProgress();
    }

    const study = document.querySelector('[data-origami-study]');
    if (!study) return;
    let started = false;
    let nearby = false;
    function loadScene() {
      if (started || !nearby || !motion() || navigator.connection?.saveData) return;
      started = true;
      study.dataset.sceneState = 'loading';
      const start = async () => {
        try {
          const { mountOrigami } = await import('./origami.bundle.js');
          mountOrigami(study);
        } catch (error) {
          study.dataset.sceneState = 'unavailable';
          // Decorative enhancement only: the local SVG and all content remain available.
          console.warn('Origami illustration is using its static fallback.', error.message);
        }
      };
      if ('requestIdleCallback' in window) requestIdleCallback(start, { timeout: 1800 });
      else setTimeout(start, 150);
    }
    if ('IntersectionObserver' in window) new IntersectionObserver(([entry]) => { nearby = entry.isIntersecting; loadScene(); }, { rootMargin: '100px' }).observe(study);
    else { nearby = true; loadScene(); }
    addEventListener('portfolio-motionchange', loadScene);
  }
  // Deferred scripts run in the interactive state, before main.js's DOMContentLoaded renderer.
  if (document.readyState !== 'complete') document.addEventListener('DOMContentLoaded', initialize, { once: true });
  else initialize();
})();
