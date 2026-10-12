/* Motion is optional. Content never depends on an animation completing. */
const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
let motionPaused = false;
try { motionPaused = localStorage.getItem("portfolio-motion") === "paused"; } catch {}

window.portfolioMotion = {
  get enabled() { return !motionPaused && !motionQuery.matches; },
  get reduced() { return motionQuery.matches; },
};

function prefersReducedMotion() { return !window.portfolioMotion.enabled; }

function setupMotionControl() {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "motion-toggle";
  document.querySelector(".footer-inner")?.append(button);
  function update() {
    const enabled = window.portfolioMotion.enabled;
    document.documentElement.dataset.motion = enabled ? "full" : "paused";
    button.textContent = motionQuery.matches ? "Reduced motion" : enabled ? "Pause motion" : "Enable motion";
    button.setAttribute("aria-label", motionQuery.matches ? "Reduced motion enabled by your device" : enabled ? "Pause decorative motion" : "Enable decorative motion");
    button.setAttribute("aria-pressed", String(!enabled));
    button.disabled = motionQuery.matches;
    window.dispatchEvent(new Event("portfolio-motionchange"));
  }
  button.addEventListener("click", () => {
    motionPaused = !motionPaused;
    try { localStorage.setItem("portfolio-motion", motionPaused ? "paused" : "full"); } catch {}
    update();
  });
  motionQuery.addEventListener("change", update);
  update();
}

function setupQuoteSequence() {
  const stage = document.querySelector("[data-quote-stage]");
  const quotes = window.portfolioData?.quotes || [];
  if (!stage || !quotes.length) return;
  const text = stage.querySelector("[data-quote-text]");
  const author = stage.querySelector("[data-quote-author]");
  const number = stage.querySelector("[data-quote-number]");
  stage.setAttribute("aria-live", "off");
  let index = 0;
  let timer;
  let turnTimer;
  let visible = false;
  let paused = false;
  let hovering = false;
  let focusing = false;
  const controls = document.createElement("div");
  controls.className = "quote-controls";
  controls.setAttribute("role", "group");
  controls.setAttribute("aria-label", "Quote navigation");
  controls.innerHTML = '<button type="button" data-quote-prev aria-label="Previous quote">←</button><span data-quote-position></span><button type="button" data-quote-next aria-label="Next quote">→</button><button type="button" data-quote-pause>Pause quotes</button><span class="visually-hidden" aria-live="polite" data-quote-announcement></span>';
  stage.after(controls);
  const pause = controls.querySelector("[data-quote-pause]");
  function schedule() {
    clearTimeout(timer);
    const disabled = prefersReducedMotion();
    pause.textContent = paused || disabled ? "Play quotes" : "Pause quotes";
    pause.disabled = disabled;
    pause.setAttribute("aria-pressed", String(paused || disabled));
    if (disabled || paused || !visible || hovering || focusing || document.hidden || quotes.length < 2) return;
    timer = setTimeout(() => show(index + 1), Math.max(8000, quotes[index].text.split(/\s+/).length * 300 + 2000));
  }
  function show(next, manual = false) {
    index = (next + quotes.length) % quotes.length;
    clearTimeout(turnTimer);
    stage.classList.remove("is-changing");
    text.textContent = `"${quotes[index].text}"`;
    author.textContent = `- ${quotes[index].author}`;
    number.textContent = `QUOTE PANEL ${String(index + 1).padStart(2, "0")}`;
    controls.querySelector("[data-quote-position]").textContent = `${String(index + 1).padStart(2, "0")} / ${String(quotes.length).padStart(2, "0")}`;
    if (!prefersReducedMotion() && visible) {
      stage.classList.add("is-changing");
      turnTimer = setTimeout(() => stage.classList.remove("is-changing"), 560);
    }
    if (manual) controls.querySelector("[data-quote-announcement]").textContent = `Quote ${index + 1} of ${quotes.length}. ${quotes[index].text} — ${quotes[index].author}`;
    schedule();
  }
  // Measure every quote at the actual width, so changing pages cannot move content below.
  function reserveHeight() {
    const clone = stage.cloneNode(true);
    clone.className = "quote-panel manga-panel quote-measure";
    clone.removeAttribute("data-quote-stage");
    clone.setAttribute("aria-hidden", "true");
    clone.inert = true;
    clone.style.width = `${stage.getBoundingClientRect().width}px`;
    clone.style.minHeight = "0";
    stage.parentElement.append(clone);
    let height = 0;
    for (const quote of quotes) {
      clone.querySelector("[data-quote-text]").textContent = `"${quote.text}"`;
      clone.querySelector("[data-quote-author]").textContent = `- ${quote.author}`;
      height = Math.max(height, clone.getBoundingClientRect().height);
    }
    clone.remove();
    stage.style.minHeight = `${Math.ceil(height)}px`;
  }
  controls.querySelector("[data-quote-prev]").addEventListener("click", () => show(index - 1, true));
  controls.querySelector("[data-quote-next]").addEventListener("click", () => show(index + 1, true));
  pause.addEventListener("click", () => { paused = !paused; schedule(); });
  const region = stage.parentElement;
  region.addEventListener("pointerenter", event => { if (event.pointerType === "mouse") { hovering = true; schedule(); } });
  region.addEventListener("pointerleave", () => { hovering = false; schedule(); });
  region.addEventListener("focusin", () => { focusing = true; schedule(); });
  region.addEventListener("focusout", () => { focusing = region.contains(document.activeElement); setTimeout(() => { focusing = region.contains(document.activeElement); schedule(); }, 0); });
  if ("IntersectionObserver" in window) new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; schedule(); }).observe(stage);
  else visible = true;
  let width = 0;
  if ("ResizeObserver" in window) new ResizeObserver(([entry]) => {
    if (Math.abs(width - entry.contentRect.width) < 1) return;
    width = entry.contentRect.width;
    reserveHeight();
  }).observe(stage);
  document.fonts?.ready.then(reserveHeight);
  document.addEventListener("visibilitychange", schedule);
  window.addEventListener("portfolio-motionchange", () => { stage.classList.remove("is-changing"); schedule(); });
  show(0);
  reserveHeight();
}

function setupScrollOrnaments() {
  const star = document.querySelector("[data-scroll-shuriken]");
  const charm = document.querySelector(".scroll-paper-scrap");
  const wide = matchMedia("(min-width: 1280px)");
  let frame = 0;
  let scrollMax = 1;
  let track = 1;
  function measure() {
    scrollMax = Math.max(document.documentElement.scrollHeight - innerHeight, 1);
    track = Math.max(innerHeight - 240, 80);
    requestUpdate();
  }
  function update() {
    frame = 0;
    if (!wide.matches || prefersReducedMotion() || document.hidden) return;
    const progress = Math.min(1, Math.max(0, scrollY / scrollMax));
    star?.style.setProperty("--ornament-y", `${progress * track}px`);
    star?.style.setProperty("--ornament-turn", `${progress * 300}deg`);
    charm?.style.setProperty("--ornament-y", `${progress * track * .55}px`);
  }
  function requestUpdate() {
    if (!frame && wide.matches && !prefersReducedMotion()) frame = requestAnimationFrame(update);
  }
  addEventListener("scroll", requestUpdate, { passive: true });
  addEventListener("resize", measure, { passive: true });
  addEventListener("portfolio-motionchange", measure);
  if ("ResizeObserver" in window) new ResizeObserver(measure).observe(document.body);
  star?.addEventListener("click", () => {
    if (prefersReducedMotion()) return;
    star.getAnimations().forEach(animation => animation.cancel());
    star.animate([{ rotate: "0deg" }, { rotate: "720deg" }], { duration: 850, easing: "cubic-bezier(.16,1,.3,1)" });
  });
  measure();
}

function setupRevealAnimations() {
  const nodes = document.querySelectorAll(".manga-reveal, .ink-divider");
  // The baseline is visible, including when JS, observers or motion are unavailable.
  nodes.forEach(node => node.classList.add("is-visible"));
  if (!("IntersectionObserver" in window)) return;
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    if (!prefersReducedMotion() && entry.target.getBoundingClientRect().top > 0) {
      entry.target.animate([{ opacity: .2, translate: "0 16px" }, { opacity: 1, translate: "0 0" }], { duration: 420, easing: "cubic-bezier(.2,.8,.2,1)" });
    }
    observer.unobserve(entry.target);
  }), { threshold: .08 });
  nodes.forEach(node => { if (!node.closest(".hero-spread")) observer.observe(node); });
  window.addEventListener("portfolio-motionchange", () => {
    if (prefersReducedMotion()) nodes.forEach(node => node.getAnimations().forEach(animation => animation.cancel()));
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setupMotionControl();
  setupQuoteSequence();
  setupScrollOrnaments();
  setupRevealAnimations();
});
