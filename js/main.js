function selectAll(selector, scope = document) {
  return Array.from(scope.querySelectorAll(selector));
}

function createElement(tag, options = {}) {
  const element = document.createElement(tag);

  if (options.className) {
    element.className = options.className;
  }

  if (options.text !== undefined) {
    element.textContent = options.text;
  }

  if (options.attributes) {
    Object.entries(options.attributes).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        element.setAttribute(key, value);
      }
    });
  }

  return element;
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function setText(selector, value) {
  selectAll(selector).forEach((node) => {
    node.textContent = value;
  });
}

function getBrandName(name) {
  return name.toUpperCase().replace(/\s+/g, "_");
}

function renderStatusNode(node, label) {
  node.replaceChildren();
  node.append(
    createElement("span", {
      className: "status-dot",
      attributes: { "aria-hidden": "true" },
    }),
    createElement("span", { text: label }),
  );
}

function renderTagList(container, tags) {
  container.replaceChildren();
  tags.forEach((tag) => {
    container.append(createElement("span", { className: "tag", text: tag }));
  });
}

function renderDetailList(container, items) {
  container.replaceChildren();

  items.forEach(({ label, value }) => {
    const group = createElement("div");
    group.append(
      createElement("dt", { text: label }),
      createElement("dd", { text: value }),
    );
    container.append(group);
  });
}

function appendProjectActions(
  container,
  project,
  buttonClass = "button button-secondary",
) {
  const actions = createElement("div", { className: "project-actions" });
  let hasAction = false;

  if (project.githubUrl) {
    actions.append(
      createElement("a", {
        className: buttonClass,
        text: "GitHub",
        attributes: {
          href: project.githubUrl,
          target: "_blank",
          rel: "noreferrer",
        },
      }),
    );
    hasAction = true;
  }

  if (project.liveUrl) {
    actions.append(
      createElement("a", {
        className: buttonClass,
        text: "Live Demo",
        attributes: {
          href: project.liveUrl,
          target: "_blank",
          rel: "noreferrer",
        },
      }),
    );
    hasAction = true;
  }

  if (!hasAction && project.linkNote) {
    actions.append(
      createElement("span", {
        className: "manga-note",
        text: project.linkNote,
      }),
    );
  }

  container.append(actions);
}

function createProjectFact(label, value) {
  const fact = createElement("section", { className: "project-fact" });
  fact.append(
    createElement("h3", { text: label }),
    createElement("p", { text: value }),
  );
  return fact;
}

function createSvgElement(tag, options = {}) {
  const element = document.createElementNS("http://www.w3.org/2000/svg", tag);

  if (options.className) {
    element.setAttribute("class", options.className);
  }

  if (options.text !== undefined) {
    element.textContent = options.text;
  }

  if (options.attributes) {
    Object.entries(options.attributes).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        element.setAttribute(key, value);
      }
    });
  }

  return element;
}

function createInkDivider() {
  const divider = createElement("div", {
    className: "ink-divider",
    attributes: { "aria-hidden": "true" },
  });

  const svg = createSvgElement("svg", {
    attributes: {
      viewBox: "0 0 1000 72",
      preserveAspectRatio: "none",
    },
  });

  const path = createSvgElement("path", {
    attributes: {
      d: "M0 36 C72 20, 120 50, 180 36 S300 20, 380 36 S520 52, 620 36 S760 18, 860 36 S940 50, 1000 36",
    },
  });

  svg.append(path);
  divider.append(svg);
  return divider;
}

function ensureChapterLabel(container, text) {
  if (!container) return;

  let label = container.querySelector(":scope > .chapter-label");

  if (!label) {
    label = createElement("p", { className: "chapter-label", text });
    container.prepend(label);
    return;
  }

  label.textContent = text;
}

function ensurePanelStamp(container, text, position = "top-right") {
  if (!container || container.querySelector(":scope > .panel-stamp")) return;

  const stamp = createElement("span", {
    className: `panel-stamp panel-stamp-${position}`,
    text,
    attributes: { "aria-hidden": "true" },
  });

  container.append(stamp);
}

function ensureSingleElement(container, selector, builder) {
  if (!container || container.querySelector(selector)) return;
  container.append(builder());
}

function buildHeroSpeedLines() {
  const svg = createSvgElement("svg", {
    className: "hero-speed-lines",
    attributes: {
      viewBox: "0 0 700 700",
      preserveAspectRatio: "none",
      "aria-hidden": "true",
    },
  });

  const lines = [
    [350, 350, 350, 12],
    [350, 350, 470, 26],
    [350, 350, 570, 78],
    [350, 350, 650, 174],
    [350, 350, 664, 286],
    [350, 350, 620, 410],
    [350, 350, 522, 536],
    [350, 350, 408, 656],
    [350, 350, 278, 648],
    [350, 350, 158, 612],
    [350, 350, 56, 500],
    [350, 350, 18, 372],
    [350, 350, 38, 250],
    [350, 350, 96, 136],
    [350, 350, 190, 54],
    [350, 350, 308, 18],
  ];

  lines.forEach(([x1, y1, x2, y2]) => {
    svg.append(
      createSvgElement("line", {
        attributes: { x1, y1, x2, y2 },
      }),
    );
  });

  return svg;
}

function buildPaperScrap() {
  const scrap = createElement("div", {
    className: "scroll-ornament scroll-paper-scrap",
    attributes: {
      "data-scroll-ornament": "paper-scrap",
      "aria-hidden": "true",
    },
  });

  scrap.append(
    createElement("span", { className: "paper-scrap-texture" }),
    createElement("span", { className: "paper-scrap-ink" }),
  );

  return scrap;
}

function decorateHomePage() {
  ensureChapterLabel(
    document.querySelector(".hero-copy"),
    "CHAPTER 01 — THE ORIGIN",
  );
  ensureChapterLabel(
    document.querySelector(".identity-panel"),
    "CHAPTER 02 — THE PHILOSOPHY",
  );
  ensureChapterLabel(
    document.querySelector(".philosophy-inner"),
    "CHAPTER 03 — THE JOURNEY",
  );
  ensureChapterLabel(
    document.querySelector(".story-panel:first-child"),
    "CHAPTER 04 — THE ARSENAL",
  );
  ensureChapterLabel(
    document.querySelector(".section-heading"),
    "CHAPTER 05 — THE MISSIONS",
  );
  ensureChapterLabel(
    document.querySelector(".contact-inner"),
    "CHAPTER 06 — NEXT CHAPTER",
  );

  ensurePanelStamp(document.querySelector(".identity-panel"), "02");
  ensurePanelStamp(document.querySelector(".quote-panel"), "03");
  ensurePanelStamp(document.querySelector(".story-panel:first-child"), "04");
  ensurePanelStamp(document.querySelector(".current-project-panel"), "05");
  ensurePanelStamp(document.querySelector(".contact-inner"), "06");
}

function decorateExperiencePage() {
  ensureChapterLabel(
    document.querySelector(".page-hero"),
    "CHAPTER 03 — THE JOURNEY",
  );
}

function decorateProjectsPage() {
  ensureChapterLabel(
    document.querySelector(".page-hero"),
    "CHAPTER 04 — THE ARSENAL",
  );
  ensurePanelStamp(document.querySelector(".projects-section"), "04");
}

function decorateResumePage() {
  ensureChapterLabel(
    document.querySelector(".page-hero"),
    "CHAPTER 05 — THE MISSIONS",
  );
}

function decorateCommonPanels() {
  const portraitBoard = document.querySelector(".portrait-board");
  const heroCopy = document.querySelector(".hero-copy");
  const currentProjectSection = document.querySelector(
    ".current-project-section",
  );
  const currentProjectPanel = document.querySelector(
    "[data-current-project-card]",
  );
  const contactInner = document.querySelector(".contact-inner");
  const quotePanel = document.querySelector(".quote-panel");

  if (portraitBoard) {
    portraitBoard.classList.add("portrait-board--ornate");
    ensureSingleElement(
      portraitBoard,
      ".hero-speed-lines",
      buildHeroSpeedLines,
    );
    ensureSingleElement(portraitBoard, ".portrait-nameplate", () =>
      createElement("span", {
        className: "portrait-nameplate manga-caption",
        text: "ABISHEK GOKUL",
      }),
    );
  }

  if (heroCopy) {
    ensureSingleElement(heroCopy, ".sound-effect-whoosh", () =>
      createElement("p", {
        className: "sound-effect sound-effect-whoosh",
        text: "WHOOSH",
        attributes: { "aria-hidden": "true" },
      }),
    );
  }

  if (currentProjectSection) {
    ensureSingleElement(currentProjectSection, ".sound-effect-zap", () =>
      createElement("p", {
        className: "sound-effect sound-effect-zap",
        text: "ZAP",
        attributes: { "aria-hidden": "true" },
      }),
    );
  }

  if (currentProjectPanel) {
    currentProjectPanel.classList.add("featured-panel");
  }

  if (contactInner) {
    ensureSingleElement(contactInner, ".contact-ending-mark", () =>
      createElement("span", {
        className: "contact-ending-mark",
        text: "THE END",
        attributes: { "aria-hidden": "true" },
      }),
    );

    ensureSingleElement(contactInner, ".contact-signature", () =>
      createElement("div", {
        className: "contact-signature manga-caption",
        text: "ABISHEK GOKUL / AI-ML ENGINEER",
        attributes: { "aria-hidden": "true" },
      }),
    );

    ensureSingleElement(contactInner, ".contact-ink-splash", () =>
      createElement("span", {
        className: "contact-ink-splash",
        attributes: { "aria-hidden": "true" },
      }),
    );
  }

  if (quotePanel) {
    quotePanel.classList.add("featured-panel");
    ensureSingleElement(quotePanel, ".quote-annotation-left", () =>
      createElement("span", {
        className: "quote-annotation quote-annotation-left",
        text: "* 01",
        attributes: { "aria-hidden": "true" },
      }),
    );
    ensureSingleElement(quotePanel, ".quote-annotation-right", () =>
      createElement("span", {
        className: "quote-annotation quote-annotation-right",
        text: "* 02",
        attributes: { "aria-hidden": "true" },
      }),
    );
    ensureSingleElement(quotePanel, ".quote-bleed-a", () =>
      createElement("span", {
        className: "quote-bleed quote-bleed-a",
        attributes: { "aria-hidden": "true" },
      }),
    );
    ensureSingleElement(quotePanel, ".quote-bleed-b", () =>
      createElement("span", {
        className: "quote-bleed quote-bleed-b",
        attributes: { "aria-hidden": "true" },
      }),
    );
  }
}

function insertInkDividers(page) {
  const dividerPlans = {
    home: [
      ".hero-spread",
      ".quote-sequence",
      ".identity-section",
      ".philosophy-band",
      ".story-grid",
      ".current-project-section",
    ],
    experience: [".page-hero"],
    projects: [".page-hero"],
    resume: [".page-hero"],
  };

  const targets = dividerPlans[page] || [];

  targets.forEach((selector) => {
    const section = document.querySelector(selector);
    if (
      !section ||
      section.nextElementSibling?.classList.contains("ink-divider")
    )
      return;
    section.insertAdjacentElement("afterend", createInkDivider());
  });
}

function addJapanesePrintDetails(page) {
  if (document.querySelector(".jp-print-frame")) return;

  const labels = {
    home: "創造の記録",
    experience: "歩み",
    projects: "作品集",
    resume: "履歴書",
  };

  const frame = createElement("div", {
    className: "jp-print-frame",
    attributes: { "aria-hidden": "true" },
  });
  const verticalTitle = createElement("span", {
    className: "jp-vertical-title",
    text: labels[page] || "創造",
  });
  const hanko = createElement("span", {
    className: "jp-hanko",
    text: "創",
  });

  frame.append(verticalTitle, hanko);
  document.body.prepend(frame);
}

function addJapaneseMicroLabels() {
  const labels = {
    "#home-heading": "始まり",
    "#identity-heading": "概要",
    "#qualification-heading": "技術",
    "#experience-summary-heading": "経歴",
    "#current-project-heading": "任務",
    "#projects-page-title": "作品集",
    "#experience-page-title": "経歴",
    "#resume-title": "履歴書",
    "#contact-heading": "連絡先",
  };

  Object.entries(labels).forEach(([selector, label]) => {
    const heading = document.querySelector(selector);
    if (!heading || heading.querySelector(".jp-micro-label")) return;
    heading.append(createElement("span", { className: "jp-micro-label", text: label, attributes: { "aria-hidden": "true" } }));
  });
}

function addChapterProgress(page) {
  if (document.querySelector(".chapter-progress")) return;

  const plans = {
    home: [[".hero-spread", "起"], [".identity-section", "承"], [".story-grid", "転"], [".contact-band", "結"]],
    experience: [[".page-hero", "起"], [".journey-section", "経"]],
    projects: [[".page-hero", "起"], [".projects-section", "作"]],
    resume: [[".page-hero", "起"], [".resume-layout", "履"]],
  };
  const rail = createElement("nav", { className: "chapter-progress", attributes: { "aria-label": "Chapter progress" } });

  (plans[page] || []).forEach(([selector, label], index) => {
    const target = document.querySelector(selector);
    if (!target) return;
    const id = target.id || `manga-chapter-${index + 1}`;
    if (!target.id) target.id = id;
    rail.append(createElement("a", { text: label, attributes: { href: `#${id}`, "aria-label": `Go to chapter ${index + 1}` } }));
  });
  document.body.append(rail);
}

function enhanceMangaDecorations(page) {
  document.body.classList.add("manga-enhanced", "page-opening");
  window.setTimeout(() => document.body.classList.remove("page-opening"), 760);
  addJapanesePrintDetails(page);
  addJapaneseMicroLabels();
  addChapterProgress(page);

  decorateCommonPanels();
  insertInkDividers(page);

  if (page === "home") {
    decorateHomePage();
  }

  if (page === "experience") {
    decorateExperiencePage();
  }

  if (page === "projects") {
    decorateProjectsPage();
  }

  if (page === "resume") {
    decorateResumePage();
  }

  const shuriken = document.querySelector("[data-scroll-shuriken]");
  if (shuriken) {
    shuriken.parentElement?.append(buildPaperScrap());
  } else {
    document.body.append(buildPaperScrap());
  }
}

function getProjectPopup() {
  let popup = document.querySelector("[data-project-popup]");

  if (popup) {
    return popup;
  }

  popup = createElement("div", {
    className: "project-popup",
    attributes: {
      "data-project-popup": "true",
      "aria-hidden": "true",
    },
  });
  popup.tabIndex = -1;

  const backdrop = createElement("button", {
    className: "project-popup-backdrop",
    attributes: {
      type: "button",
      "aria-label": "Close project details",
      "data-project-popup-backdrop": "true",
    },
  });

  const windowPanel = createElement("section", {
    className: "project-popup-window manga-panel",
    attributes: {
      role: "dialog",
      "aria-modal": "true",
      "aria-labelledby": "project-popup-title",
    },
  });

  windowPanel.append(
    createElement("button", {
      className: "project-popup-close",
      text: "×",
      attributes: { type: "button", "aria-label": "Close case file", "data-project-popup-close": "true" },
    }),
    createElement("div", {
      className: "project-popup-media",
      attributes: { "data-project-popup-media": "true" },
    }),
    createElement("div", {
      className: "project-popup-body",
      attributes: { "data-project-popup-body": "true" },
    }),
  );

  popup.append(backdrop, windowPanel);
  document.body.append(popup);

  const hidePopup = () => {
    popup.classList.remove("is-open");
    popup.setAttribute("aria-hidden", "true");
    document.body.classList.remove("project-popup-open");
  };

  backdrop.addEventListener("click", hidePopup);
  windowPanel.querySelector("[data-project-popup-close]").addEventListener("click", hidePopup);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      hidePopup();
    }
  });

  popup.hidePopup = hidePopup;
  return popup;
}

function buildProjectPopupContent(project) {
  const popupBody = createElement("div", { className: "project-popup-stack" });

  popupBody.append(
    createElement("span", {
      className: "panel-number",
      text: project.category,
    }),
    createElement("h2", {
      attributes: { id: "project-popup-title" },
      text: project.title,
    }),
    createElement("p", {
      className: "project-popup-summary",
      text: project.description,
    }),
    createElement("p", {
      className: "project-popup-problem",
      text: project.problem,
    }),
    createProjectFact("Technical approach", project.approach),
    createProjectFact("Deployment status", project.deployment),
    createProjectFact("AI flag", project.aiFlag),
  );

  const tools = createElement("section", {
    className: "project-fact project-tools",
  });
  tools.append(createElement("h3", { text: "Tools" }));
  const toolTags = createElement("div", { className: "tag-row" });
  renderTagList(toolTags, project.technologies);
  tools.append(toolTags);

  const links = createElement("section", {
    className: "project-fact project-links-fact",
  });
  links.append(createElement("h3", { text: "Link" }));
  appendProjectActions(links, project, "inline-link");

  popupBody.append(tools, links);

  return popupBody;
}

function openProjectPopup(project) {
  const popup = getProjectPopup();
  const media = popup.querySelector("[data-project-popup-media]");
  const body = popup.querySelector("[data-project-popup-body]");

  media.replaceChildren(
    createElement("img", {
      attributes: {
        src: project.image,
        alt: `${project.title} project preview`,
      },
    }),
    createElement("span", {
      className: `project-status status-${slugify(project.status)}`,
      text: project.status,
    }),
  );

  body.replaceChildren(buildProjectPopupContent(project));
  popup.classList.add("is-open");
  popup.setAttribute("aria-hidden", "false");
  document.body.classList.add("project-popup-open");
}

function closeProjectPopup() {
  const popup = document.querySelector("[data-project-popup]");

  if (!popup) {
    return;
  }

  popup.classList.remove("is-open");
  popup.setAttribute("aria-hidden", "true");
  document.body.classList.remove("project-popup-open");
}

function renderSiteChrome() {
  const { profile, contact, status } = portfolioData;

  setText("[data-brand-name], [data-footer-brand]", getBrandName(profile.name));
  setText("[data-profile-name]", profile.name);
  setText("[data-profile-title]", profile.title);
  setText("[data-profile-intro]", profile.intro);
  setText("[data-profile-summary]", profile.summary);
  setText("[data-profile-location]", profile.location);
  setText("[data-status-text]", status.label);
  setText("[data-contact-copy]", contact.copy);
  setText(
    "[data-footer-copy]",
    `(c) ${new Date().getFullYear()} ${profile.name}. Built like a chapter.`,
  );

  selectAll("[data-status-label]").forEach((node) => {
    renderStatusNode(node, status.label);
  });

  selectAll("[data-profile-image]").forEach((image) => {
    image.src = profile.image;
    image.alt = `Portrait of ${profile.name}`;
  });

  selectAll("[data-profile-email], [data-footer-email]").forEach((link) => {
    link.href = `mailto:${contact.email}`;
    link.textContent = contact.email;
  });

  selectAll("[data-profile-github], [data-footer-github]").forEach((link) => {
    link.href = contact.github;
  });

  selectAll("[data-profile-linkedin], [data-footer-linkedin]").forEach(
    (link) => {
      link.href = contact.linkedin;
    },
  );
}

function setupActiveNavigation() {
  const currentPage = document.body.dataset.page;

  selectAll(".main-nav a").forEach((link) => {
    const href = link.getAttribute("href") || "";
    const active =
      (currentPage === "home" && href === "index.html") ||
      (currentPage !== "home" && href === `${currentPage}.html`);

    if (active) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

function setupMobileMenu() {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".main-nav");

  if (!toggle || !nav) return;

  toggle.addEventListener("click", () => {
    const expanded = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!expanded));
    nav.classList.toggle("is-open", !expanded);
  });

  nav.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    }
  });
}

function renderHomePage() {
  const education = portfolioData.education[0];
  const latestExperience = portfolioData.experience[0];
  const educationSummary = document.querySelector("[data-education-summary]");
  const experiencePreview = document.querySelector("[data-experience-preview]");

  if (educationSummary && education) {
    renderDetailList(educationSummary, [
      { label: "Degree", value: education.degree },
      { label: "Institution", value: education.institution },
      { label: "Duration", value: education.years },
      { label: "Specialization", value: education.specialization },
    ]);
  }

  if (experiencePreview && latestExperience) {
    const heading = createElement("h3", { text: latestExperience.role });
    const meta = createElement("p", {
      className: "panel-meta",
      text: `${latestExperience.organization} / ${latestExperience.start} - ${latestExperience.end}`,
    });
    const description = createElement("p", {
      text: latestExperience.description,
    });
    const tags = createElement("div", { className: "tag-row" });
    renderTagList(tags, latestExperience.technologies);
    experiencePreview.replaceChildren(heading, meta, description, tags);
  }

  renderCurrentProject();
}

function renderCurrentProject() {
  const container = document.querySelector("[data-current-project-card]");
  const project = getCurrentProject();

  if (!container || !project) return;

  const media = createElement("div", { className: "current-project-media" });
  media.append(
    createElement("img", {
      attributes: {
        src: project.image,
        alt: `${project.title} project preview`,
      },
    }),
    createElement("span", {
      className: `project-status status-${slugify(project.status)}`,
      text: project.status,
    }),
  );

  const body = createElement("div", { className: "current-project-body" });
  const meta = createElement("div", { className: "project-meta-row" });
  meta.append(
    createElement("span", {
      className: "manga-caption small",
      text: project.category,
    }),
    createElement("span", {
      className: "manga-caption small",
      text: project.deployment,
    }),
  );

  const title = createElement("h3", { text: project.title });
  const description = createElement("p", { text: project.description });
  const problem = createElement("p", {
    className: "project-problem",
    text: project.problem,
  });
  const tags = createElement("div", { className: "tag-row" });
  renderTagList(tags, project.technologies);

  body.append(meta, title, description, problem, tags);
  appendProjectActions(body, project);
  container.replaceChildren(media, body);
}

function renderExperiencePage() {
  const container = document.querySelector("[data-experience-timeline]");
  if (!container) return;

  const nodes = [
    ...portfolioData.education.map((item) => ({
      kind: "education",
      label: "Education",
      title: item.degree,
      subtitle: item.institution,
      dates: item.years,
      location: item.location,
      description: item.description,
      bullets: [item.specialization],
      technologies: item.technologies,
    })),
    ...portfolioData.experience.map((item) => ({
      kind: "experience",
      label: item.type,
      title: item.role,
      subtitle: item.organization,
      dates: `${item.start} - ${item.end}`,
      location: item.location,
      description: item.description,
      bullets: item.responsibilities,
      technologies: item.technologies,
    })),
    {
      kind: "status",
      label: "Current",
      title: portfolioData.status.currentHeadline,
      subtitle: portfolioData.status.label,
      dates: "Now",
      location: portfolioData.profile.location,
      description: portfolioData.status.note,
      bullets: [],
      technologies: ["Python", "AI Products", "Curiosity"],
    },
  ];

  const fragment = document.createDocumentFragment();

  nodes.forEach((node, index) => {
    const wrapper = createElement("article", {
      className: `journey-node ${node.kind}-node manga-reveal`,
    });
    const marker = createElement("div", {
      className: "journey-marker",
      text: String(index + 1).padStart(2, "0"),
      attributes: { "aria-hidden": "true" },
    });
    const card = createElement("div", {
      className: "journey-card manga-panel",
    });

    const label = createElement("span", {
      className: "panel-number",
      text: node.label,
    });
    const title = createElement("h2", { text: node.title });
    const subtitle = createElement("p", {
      className: "node-subtitle",
      text: node.subtitle,
    });
    const meta = createElement("p", {
      className: "panel-meta",
      text: `${node.dates} / ${node.location}`,
    });
    const description = createElement("p", { text: node.description });

    card.append(label, title, subtitle, meta, description);

    if (node.bullets.length) {
      const list = createElement("ul", { className: "node-list" });
      node.bullets.forEach((bullet) => {
        list.append(createElement("li", { text: bullet }));
      });
      card.append(list);
    }

    const tags = createElement("div", { className: "tag-row" });
    renderTagList(tags, node.technologies);
    card.append(tags);

    wrapper.append(marker, card);
    fragment.append(wrapper);
  });

  container.replaceChildren(fragment);
}

function renderProjectsPage() {
  const grid = document.querySelector("[data-projects-grid]");
  if (!grid) return;

  getProjectPopup();

  const fragment = document.createDocumentFragment();

  portfolioData.projects.forEach((project) => {
    const card = createElement("article", {
      className: `project-card manga-panel manga-reveal project-${slugify(project.category)}${project.featured ? " featured" : ""}`,
    });
    const imageWrap = createElement("div", { className: "project-image-box" });
    imageWrap.append(
      createElement("img", {
        attributes: {
          src: project.image,
          alt: `${project.title} project preview`,
          loading: project.featured ? "eager" : "lazy",
        },
      }),
      createElement("span", {
        className: `project-status status-${slugify(project.status)}`,
        text: project.status,
      }),
    );

    const body = createElement("div", { className: "project-card-body" });
    const cover = createElement("div", { className: "project-cover" });
    const coverMeta = createElement("div", { className: "project-cover-meta" });
    coverMeta.append(
      createElement("span", {
        className: "panel-number",
        text: project.category,
      }),
      createElement("span", {
        className: "manga-caption small",
        text: project.status,
      }),
    );
    const techRow = createElement("div", { className: "project-tech-row" });
    project.technologies.slice(0, 3).forEach((technology) => {
      techRow.append(createElement("button", {
        className: "project-tech",
        text: technology,
        attributes: { type: "button", "data-project-tech": technology, "aria-pressed": "false" },
      }));
    });
    const openCaseFile = createElement("button", {
      className: "project-more",
      text: "Open Case File →",
      attributes: { type: "button" },
    });
    openCaseFile.addEventListener("click", () => openProjectPopup(project));

    cover.append(
      coverMeta,
      createElement("h2", { text: project.title }),
      createElement("p", { text: project.description }),
      techRow,
      openCaseFile,
    );

    body.append(cover);
    card.append(imageWrap, body);

    fragment.append(card);
  });

  grid.replaceChildren(fragment);

  let activeTechnology = null;
  selectAll("[data-project-tech]", grid).forEach((button) => {
    button.addEventListener("click", () => {
      const technology = button.dataset.projectTech;
      activeTechnology = activeTechnology === technology ? null : technology;

      selectAll(".project-card", grid).forEach((card) => {
        const matches = !activeTechnology || selectAll("[data-project-tech]", card)
          .some((tag) => tag.dataset.projectTech === activeTechnology);
        card.classList.toggle("is-tech-match", Boolean(activeTechnology && matches));
        card.classList.toggle("is-tech-muted", Boolean(activeTechnology && !matches));
      });
      selectAll("[data-project-tech]", grid).forEach((tag) => {
        tag.setAttribute("aria-pressed", String(tag.dataset.projectTech === activeTechnology));
      });
    });
  });
}

function initializePage() {
  renderSiteChrome();
  setupActiveNavigation();
  setupMobileMenu();

  const currentPage = document.body.dataset.page;

  if (currentPage === "home") {
    renderHomePage();
  }

  if (currentPage === "experience") {
    renderExperiencePage();
  }

  if (currentPage === "projects") {
    renderProjectsPage();
  }

  enhanceMangaDecorations(currentPage);
}

document.addEventListener("DOMContentLoaded", initializePage);
