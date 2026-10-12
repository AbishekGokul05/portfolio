(function () {
  const storageKey = "portfolio-theme";
  const root = document.documentElement;
  root.dataset.scripting = "enabled";

  function getStoredTheme() {
    try {
      return window.localStorage.getItem(storageKey);
    } catch (error) {
      return null;
    }
  }

  function saveTheme(theme) {
    try {
      window.localStorage.setItem(storageKey, theme);
    } catch (error) {
      return;
    }
  }

  function getInitialTheme() {
    const stored = getStoredTheme();
    if (stored === "ink" || stored === "color") {
      return stored;
    }

    return window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: light)").matches
      ? "color"
      : "ink";
  }

  function applyTheme(theme, persist) {
    const nextTheme = theme === "color" ? "color" : "ink";
    root.dataset.theme = nextTheme;

    if (persist) {
      saveTheme(nextTheme);
    }

    window.dispatchEvent(
      new CustomEvent("portfolio-themechange", { detail: { theme: nextTheme } }),
    );
  }

  function transitionTheme(nextTheme) {
    // Theme colors switch directly, without a full-screen transition effect.
    applyTheme(nextTheme, true);
  }

  function setupThemeToggle() {
    const toggle = document.querySelector("[data-theme-toggle]");
    if (!toggle) return;

    function updateToggle() {
      const colorMode = root.dataset.theme === "color";
      toggle.setAttribute("aria-pressed", String(colorMode));
      toggle.setAttribute(
        "aria-label",
        colorMode ? "Switch to ink manga mode" : "Switch to colored manga mode",
      );
    }

    toggle.addEventListener("click", () => {
      const nextTheme = root.dataset.theme === "color" ? "ink" : "color";
      transitionTheme(nextTheme);
    });

    window.addEventListener("portfolio-themechange", updateToggle);
    updateToggle();
  }

  applyTheme(getInitialTheme(), false);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupThemeToggle);
  } else {
    setupThemeToggle();
  }

  window.portfolioTheme = {
    get() {
      return root.dataset.theme;
    },
    set(theme) {
      applyTheme(theme, true);
    },
  };
})();
