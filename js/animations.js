function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function setupQuoteSequence() {
  const stage = document.querySelector("[data-quote-stage]");
  if (!stage || !window.portfolioData) return;

  const quotes = portfolioData.quotes || [];
  const textNode = stage.querySelector("[data-quote-text]");
  const authorNode = stage.querySelector("[data-quote-author]");
  const numberNode = stage.querySelector("[data-quote-number]");
  const panelShapes = ["shape-rect", "shape-wide", "shape-tall", "shape-diagonal"];
  let activeIndex = 0;

  function setQuoteShape(index) {
    stage.classList.remove(...panelShapes);
    stage.classList.add(panelShapes[index % panelShapes.length]);
  }

  function renderReadingWords(quote) {
    textNode.replaceChildren();
    textNode.append(document.createTextNode("\"") );

    quote.text.split(/(\s+)/).forEach((part) => {
      if (/^\s+$/.test(part)) {
        textNode.append(document.createTextNode(part));
        return;
      }

      const word = document.createElement("span");
      word.className = "quote-word";
      word.textContent = part;
      word.style.setProperty("--word-index", textNode.querySelectorAll(".quote-word").length);
      textNode.append(word);
    });

    textNode.append(document.createTextNode("\""));
  }

  function getReadingDuration(quote) {
    const wordCount = quote.text.trim().split(/\s+/).length;
    // The next page only turns once the final word has had time to light up.
    return Math.max(4800, Math.min(12000, wordCount * 250 + 1700));
  }

  function renderQuote(index, immediate = false) {
    const quote = quotes[index];
    if (!quote || !textNode || !authorNode || !numberNode) return 0;

    const update = () => {
      setQuoteShape(index);
      numberNode.textContent = `QUOTE PANEL ${String(index + 1).padStart(2, "0")}`;
      renderReadingWords(quote);
      authorNode.textContent = `- ${quote.author}`;
      stage.classList.remove("is-reading");
      // Render at the turn's narrow midpoint, then allow the page to finish unfolding.
      window.setTimeout(() => stage.classList.remove("is-changing"), 600);

      if (!prefersReducedMotion()) {
        window.requestAnimationFrame(() => stage.classList.add("is-reading"));
      }
    };

    if (immediate || prefersReducedMotion()) {
      update();
    } else {
      stage.classList.add("is-changing");
      window.setTimeout(update, 550);
    }

    return getReadingDuration(quote);
  }

  function showNextQuote() {
    const duration = renderQuote(activeIndex, activeIndex === 0);
    if (prefersReducedMotion() || quotes.length < 2) return;

    window.setTimeout(() => {
      activeIndex = (activeIndex + 1) % quotes.length;
      showNextQuote();
    }, duration);
  }

  showNextQuote();
}

function setupScrollOrnaments() {
  const shuriken = document.querySelector("[data-scroll-shuriken]");
  const paperScrap = document.querySelector('[data-scroll-ornament="paper-scrap"]');

  if (!shuriken && !paperScrap) return;

  if (prefersReducedMotion()) {
    if (shuriken) {
      shuriken.classList.add("is-resting");
    }

    if (paperScrap) {
      paperScrap.classList.add("is-resting");
    }
    return;
  }

  let ticking = false;

  function update() {
    const scrollMax = Math.max(
      document.documentElement.scrollHeight - window.innerHeight,
      1,
    );
    const progress = window.scrollY / scrollMax;
    const viewportHeight = window.innerHeight;

    if (shuriken) {
      const track = Math.max(viewportHeight - shuriken.offsetHeight - 180, 80);
      const y = progress * track;
      const x = Math.sin(progress * Math.PI * 2) * 14;
      const rotation = progress * 260;

      shuriken.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${rotation}deg)`;
    }

    if (paperScrap) {
      const track = Math.max(viewportHeight * 0.68, 160);
      const y = 160 + progress * track;
      const sway = Math.sin(progress * Math.PI * 4 + 0.7) * 12;
      const tilt = -10 + Math.sin(progress * Math.PI * 5) * 4;
      paperScrap.style.transform = `translate3d(${sway}px, ${y}px, 0) rotate(${tilt}deg)`;
    }

    ticking = false;
  }

  function requestUpdate() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(update);
  }

  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);
  requestUpdate();
}

function setupColorInvitation() {
  const journey = document.querySelector(".philosophy-band");
  const toggle = document.querySelector("[data-theme-toggle]");
  if (!journey || !toggle || prefersReducedMotion() || !("IntersectionObserver" in window)) return;

  let journeyIsVisible = false;
  const updateInvitation = () => {
    toggle.classList.toggle(
      "color-invitation",
      journeyIsVisible && document.documentElement.dataset.theme === "ink",
    );
  };

  new IntersectionObserver(
    ([entry]) => {
      journeyIsVisible = entry.isIntersecting;
      updateInvitation();
    },
    { threshold: 0.45 },
  ).observe(journey);

  window.addEventListener("portfolio-themechange", updateInvitation);
}

function setupPropInteractions() {
  const shuriken = document.querySelector("[data-scroll-shuriken]");
  if (!shuriken || prefersReducedMotion()) return;

  shuriken.addEventListener("click", () => {
    shuriken.classList.remove("is-spinning");
    void shuriken.offsetWidth;
    shuriken.classList.add("is-spinning");

    const splash = document.createElement("span");
    splash.className = "ink-click-splash";
    splash.style.left = `${shuriken.getBoundingClientRect().left + shuriken.offsetWidth / 2}px`;
    splash.style.top = `${shuriken.getBoundingClientRect().top + shuriken.offsetHeight / 2}px`;
    splash.setAttribute("aria-hidden", "true");
    document.body.append(splash);
    window.setTimeout(() => splash.remove(), 650);
  });
}

function setupRevealAnimations() {
  const revealNodes = document.querySelectorAll(".manga-reveal, .ink-divider");

  if (prefersReducedMotion() || !("IntersectionObserver" in window)) {
    revealNodes.forEach((node) => node.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16 },
  );

  revealNodes.forEach((node) => observer.observe(node));
}

function initializeAnimations() {
  setupQuoteSequence();
  setupScrollOrnaments();
  setupColorInvitation();
  setupPropInteractions();
  setupRevealAnimations();
}

document.addEventListener("DOMContentLoaded", initializeAnimations);
