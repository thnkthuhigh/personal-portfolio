import type { Language, ThemeName, TranslationEntry } from "../data/templateData";

export const THEME_KEY = "portfolio_theme";
export const LANGUAGE_KEY = "portfolio_lang";

const MOBILE_NAV_BREAKPOINT = 900;
const THEME_COLORS: Record<ThemeName, string> = {
  light: "#f4f6f8",
  dark: "#0f141a",
};

function getThemeMeta(): HTMLMetaElement | null {
  return document.querySelector<HTMLMetaElement>("#theme-color-meta");
}

function getRootTheme(): ThemeName {
  const current = document.documentElement.getAttribute("data-theme");
  return current === "dark" ? "dark" : "light";
}

export function getInitialLanguage(): Language {
  const params = new URLSearchParams(window.location.search);
  const fromQuery = params.get("lang");

  if (fromQuery === "en" || fromQuery === "vi") {
    return fromQuery;
  }

  const saved = window.localStorage.getItem(LANGUAGE_KEY);
  return saved === "en" ? "en" : "vi";
}

export function persistLanguage(language: Language): void {
  window.localStorage.setItem(LANGUAGE_KEY, language);
}

export function applyTranslationEntries(entries: TranslationEntry[]): void {
  for (const entry of entries) {
    const node = document.querySelector<HTMLElement>(entry.selector);

    if (!node) {
      continue;
    }

    if (entry.html) {
      node.innerHTML = entry.text;
    } else {
      node.textContent = entry.text;
    }
  }
}

export function syncChromeLanguage(
  language: Language,
  labels: {
    themeLabel: string;
    menuOpen: string;
    menuClose: string;
    mobileMenuAria: string;
  },
): void {
  const themeToggle = document.getElementById("theme-toggle");
  const languageToggle = document.getElementById("language-toggle");
  const mobileMenu = document.getElementById("mobile-menu");
  const menuToggle = document.getElementById("menu-toggle");

  document.documentElement.lang = language;

  if (themeToggle) {
    themeToggle.setAttribute(
      "aria-label",
      language === "en" ? "Toggle light/dark theme" : "Đổi giao diện sáng/tối",
    );

    const themeText = themeToggle.querySelector<HTMLElement>(".theme-text");
    if (themeText) {
      themeText.textContent = labels.themeLabel;
    }
  }

  if (languageToggle) {
    languageToggle.setAttribute(
      "aria-label",
      language === "en" ? "Choose language" : "Chọn ngôn ngữ",
    );
  }

  if (mobileMenu) {
    mobileMenu.setAttribute("aria-label", labels.mobileMenuAria);
  }

  if (menuToggle) {
    const isOpen =
      document.getElementById("mobile-menu")?.classList.contains("is-open") ??
      false;
    menuToggle.setAttribute(
      "aria-label",
      isOpen ? labels.menuClose : labels.menuOpen,
    );
  }
}

export function setTheme(theme: ThemeName): void {
  document.documentElement.setAttribute("data-theme", theme);
  window.localStorage.setItem(THEME_KEY, theme);
  getThemeMeta()?.setAttribute("content", THEME_COLORS[theme]);
}

export function initializeTheme(): void {
  const saved = window.localStorage.getItem(THEME_KEY);
  setTheme(saved === "dark" ? "dark" : "light");
}

export function toggleTheme(): void {
  setTheme(getRootTheme() === "light" ? "dark" : "light");
}

function setMobileMenuState(isOpen: boolean, labels: { menuOpen: string; menuClose: string }): void {
  const mobileMenu = document.getElementById("mobile-menu");
  const menuToggle = document.getElementById("menu-toggle");

  if (!mobileMenu || !menuToggle) {
    return;
  }

  mobileMenu.classList.toggle("is-open", isOpen);
  menuToggle.classList.toggle("is-open", isOpen);
  menuToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  menuToggle.setAttribute("aria-label", isOpen ? labels.menuClose : labels.menuOpen);
  document.body.classList.toggle("mobile-menu-open", isOpen);
}

export function setupMobileMenu(labels: {
  menuOpen: string;
  menuClose: string;
}): () => void {
  const mobileMenu = document.getElementById("mobile-menu");
  const menuToggle = document.getElementById("menu-toggle");

  if (!mobileMenu || !menuToggle) {
    return () => undefined;
  }

  const onMenuClick = () => {
    const nextState = !mobileMenu.classList.contains("is-open");
    setMobileMenuState(nextState, labels);
  };

  const closeMenu = () => {
    setMobileMenuState(false, labels);
  };

  const onResize = () => {
    if (window.innerWidth > MOBILE_NAV_BREAKPOINT) {
      closeMenu();
    }
  };

  const onDocumentClick = (event: MouseEvent) => {
    const target = event.target;

    if (!(target instanceof Node)) {
      return;
    }

    if (
      !mobileMenu.classList.contains("is-open") ||
      mobileMenu.contains(target) ||
      menuToggle.contains(target)
    ) {
      return;
    }

    closeMenu();
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape" && mobileMenu.classList.contains("is-open")) {
      closeMenu();
    }
  };

  menuToggle.addEventListener("click", onMenuClick);

  const mobileLinks = Array.from(mobileMenu.querySelectorAll("a"));
  for (const link of mobileLinks) {
    link.addEventListener("click", closeMenu);
  }

  window.addEventListener("resize", onResize);
  document.addEventListener("click", onDocumentClick);
  document.addEventListener("keydown", onKeyDown);

  return () => {
    menuToggle.removeEventListener("click", onMenuClick);
    for (const link of mobileLinks) {
      link.removeEventListener("click", closeMenu);
    }
    window.removeEventListener("resize", onResize);
    document.removeEventListener("click", onDocumentClick);
    document.removeEventListener("keydown", onKeyDown);
  };
}

export function setupHomeAnchorBehavior(): () => void {
  const homeLinks = Array.from(
    document.querySelectorAll<HTMLAnchorElement>('a[href="#home"]'),
  );

  if (homeLinks.length === 0) {
    return () => undefined;
  }

  const scrollToTop = (behavior: ScrollBehavior) => {
    window.scrollTo({ top: 0, behavior });
  };

  if (window.location.hash === "#home") {
    window.requestAnimationFrame(() => {
      scrollToTop("auto");
    });
  }

  const onLinkClick = (event: Event) => {
    event.preventDefault();

    if (window.location.hash !== "#home") {
      window.history.pushState(null, "", "#home");
    }

    scrollToTop("smooth");
  };

  const onHashChange = () => {
    if (window.location.hash === "#home") {
      scrollToTop("auto");
    }
  };

  for (const link of homeLinks) {
    link.addEventListener("click", onLinkClick);
  }

  window.addEventListener("hashchange", onHashChange);

  return () => {
    for (const link of homeLinks) {
      link.removeEventListener("click", onLinkClick);
    }
    window.removeEventListener("hashchange", onHashChange);
  };
}

export function setupHeaderScroll(): () => void {
  const header = document.getElementById("site-header");

  if (!header) {
    return () => undefined;
  }

  let ticking = false;
  const update = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 8);
    ticking = false;
  };

  const onScroll = () => {
    if (ticking) {
      return;
    }

    ticking = true;
    window.requestAnimationFrame(update);
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  return () => {
    window.removeEventListener("scroll", onScroll);
  };
}

export function setupScrollProgress(): () => void {
  const progressFill = document.querySelector<HTMLElement>("#scroll-progress span");

  if (!progressFill) {
    return () => undefined;
  }

  let ticking = false;

  const update = () => {
    const maxScroll =
      document.documentElement.scrollHeight - window.innerHeight;
    const ratio = maxScroll > 0 ? window.scrollY / maxScroll : 0;
    const percent = Math.min(100, Math.max(0, ratio * 100));
    progressFill.style.width = `${percent.toFixed(2)}%`;
    ticking = false;
  };

  const onScroll = () => {
    if (ticking) {
      return;
    }

    ticking = true;
    window.requestAnimationFrame(update);
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  return () => {
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onScroll);
  };
}

export function setupSpotlightCards(): () => void {
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!finePointer || reducedMotion) {
    return () => undefined;
  }

  const targets = Array.from(
    document.querySelectorAll<HTMLElement>(
      ".trust-item, .snapshot-card, .skill-card, .project-card, .timeline-item, .process-card, .project-panel, .contact-form, .faq-item, .cv-inline-card",
    ),
  );

  if (targets.length === 0) {
    return () => undefined;
  }

  const cleanupEntries = targets.map((target) => {
    const onPointerMove = (event: PointerEvent) => {
      const rect = target.getBoundingClientRect();
      target.style.setProperty("--mx", `${event.clientX - rect.left}px`);
      target.style.setProperty("--my", `${event.clientY - rect.top}px`);
    };

    const onPointerLeave = () => {
      target.style.removeProperty("--mx");
      target.style.removeProperty("--my");
    };

    target.addEventListener("pointermove", onPointerMove);
    target.addEventListener("pointerleave", onPointerLeave);

    return () => {
      target.removeEventListener("pointermove", onPointerMove);
      target.removeEventListener("pointerleave", onPointerLeave);
    };
  });

  return () => {
    for (const cleanup of cleanupEntries) {
      cleanup();
    }
  };
}

export function setupReveal(): () => void {
  const revealElements = Array.from(
    document.querySelectorAll<HTMLElement>("[data-reveal]"),
  );

  if (revealElements.length === 0) {
    return () => undefined;
  }

  const observer = new IntersectionObserver(
    (entries, currentObserver) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) {
          continue;
        }

        entry.target.classList.add("is-visible");
        currentObserver.unobserve(entry.target);
      }
    },
    {
      threshold: 0.15,
      rootMargin: "0px 0px -10% 0px",
    },
  );

  for (const element of revealElements) {
    observer.observe(element);
  }

  return () => {
    observer.disconnect();
  };
}

export function setupActiveNav(): () => void {
  const header = document.getElementById("site-header");
  const navLinks = Array.from(
    document.querySelectorAll<HTMLAnchorElement>(".nav-link"),
  );
  const navTargets = new Set(
    navLinks
      .map((link) => link.getAttribute("href") ?? "")
      .filter((href) => href.startsWith("#")),
  );
  const sections = Array.from(
    document.querySelectorAll<HTMLElement>("main section[id]"),
  ).filter((section) => navTargets.has(`#${section.id}`));

  if (!header || navLinks.length === 0 || sections.length === 0) {
    return () => undefined;
  }

  const navOrderIds = navLinks
    .map((link) => (link.getAttribute("href") ?? "").replace("#", ""))
    .filter(Boolean);
  const sectionIdSet = new Set(sections.map((section) => section.id));
  const defaultId =
    navOrderIds.find((id) => sectionIdSet.has(id)) ?? sections[0].id;

  const setActive = (sectionId: string) => {
    for (const link of navLinks) {
      link.classList.toggle(
        "is-active",
        link.getAttribute("href") === `#${sectionId}`,
      );
    }
  };

  const onLinkClick = (event: Event) => {
    const target = event.currentTarget;

    if (!(target instanceof HTMLAnchorElement)) {
      return;
    }

    const href = target.getAttribute("href") ?? "";

    if (href.startsWith("#")) {
      setActive(href.slice(1));
    }
  };

  const updateActiveByPosition = () => {
    const topAnchor = window.scrollY + header.offsetHeight + 18;
    let currentId = defaultId;

    for (const section of sections) {
      if (section.offsetTop <= topAnchor) {
        currentId = section.id;
      }
    }

    setActive(currentId);
  };

  let ticking = false;
  const onScroll = () => {
    if (ticking) {
      return;
    }

    ticking = true;
    window.requestAnimationFrame(() => {
      updateActiveByPosition();
      ticking = false;
    });
  };

  const onHashChange = () => {
    const hashId = window.location.hash.replace("#", "");

    if (hashId && navTargets.has(`#${hashId}`)) {
      setActive(hashId);
    }
  };

  for (const link of navLinks) {
    link.addEventListener("click", onLinkClick);
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  window.addEventListener("hashchange", onHashChange);
  updateActiveByPosition();

  return () => {
    for (const link of navLinks) {
      link.removeEventListener("click", onLinkClick);
    }
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onScroll);
    window.removeEventListener("hashchange", onHashChange);
  };
}

export function setupCaseSectionNav(): () => void {
  const links = Array.from(
    document.querySelectorAll<HTMLAnchorElement>(".project-case-nav a"),
  );

  if (links.length === 0) {
    return () => undefined;
  }

  const items = links
    .map((link) => {
      const href = link.getAttribute("href") ?? "";

      if (!href.startsWith("#")) {
        return null;
      }

      const section = document.querySelector<HTMLElement>(href);

      if (!section) {
        return null;
      }

      return {
        id: href.slice(1),
        link,
        section,
      };
    })
    .filter(
      (
        item,
      ): item is {
        id: string;
        link: HTMLAnchorElement;
        section: HTMLElement;
      } => item !== null,
    );

  if (items.length === 0) {
    return () => undefined;
  }

  const setActive = (id: string) => {
    for (const item of items) {
      item.link.classList.toggle("is-active", item.id === id);
    }
  };

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((left, right) => right.intersectionRatio - left.intersectionRatio);

      if (visible.length === 0) {
        return;
      }

      const current = items.find((item) => item.section === visible[0].target);

      if (current) {
        setActive(current.id);
      }
    },
    {
      rootMargin: "-28% 0px -52% 0px",
      threshold: [0.2, 0.45, 0.7],
    },
  );

  for (const item of items) {
    observer.observe(item.section);
  }

  setActive(items[0].id);

  return () => {
    observer.disconnect();
  };
}
