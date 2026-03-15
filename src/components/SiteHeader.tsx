import type { Language } from "../data/templateData";
import { toggleTheme } from "../lib/siteEffects";

interface HeaderLink {
  href: string;
  label: string;
}

interface SiteHeaderProps {
  language: Language;
  onLanguageChange: (language: Language) => void;
  brandHref: string;
  brandLabel: string;
  navLabel: string;
  mobileNavLabel: string;
  navLinks: readonly HeaderLink[];
  mobileLinks: readonly HeaderLink[];
}

export function SiteHeader({
  language,
  onLanguageChange,
  brandHref,
  brandLabel,
  navLabel,
  mobileNavLabel,
  navLinks,
  mobileLinks,
}: SiteHeaderProps) {
  return (
    <header className="site-header" id="site-header">
      <div className="container header-inner">
        <a href={brandHref} className="brand" aria-label={brandLabel}>
          <span className="brand-signature">Nguyễn Chí Thanh</span>
        </a>

        <nav className="site-nav" aria-label={navLabel}>
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className="nav-link">
              {link.label}
            </a>
          ))}
        </nav>

        <div className="header-actions">
          <div
            className="language-toggle"
            id="language-toggle"
            role="group"
            aria-label={language === "en" ? "Choose language" : "Chọn ngôn ngữ"}
          >
            <button
              type="button"
              className={`lang-btn${language === "vi" ? " is-active" : ""}`}
              data-lang="vi"
              onClick={() => onLanguageChange("vi")}
            >
              VI
            </button>
            <button
              type="button"
              className={`lang-btn${language === "en" ? " is-active" : ""}`}
              data-lang="en"
              onClick={() => onLanguageChange("en")}
            >
              EN
            </button>
          </div>
          <button
            type="button"
            className="theme-toggle"
            id="theme-toggle"
            aria-label={
              language === "en"
                ? "Toggle light/dark theme"
                : "Đổi giao diện sáng/tối"
            }
            onClick={toggleTheme}
          >
            <span className="theme-icon" aria-hidden="true">
              ◐
            </span>
            <span className="theme-text">Theme</span>
          </button>
          <button
            type="button"
            className="menu-toggle"
            id="menu-toggle"
            aria-controls="mobile-menu"
            aria-expanded="false"
            aria-label={language === "en" ? "Open menu" : "Mở menu"}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>

      <div className="mobile-menu" id="mobile-menu" aria-label={mobileNavLabel}>
        {mobileLinks.map((link) => (
          <a key={link.href} href={link.href} className="mobile-link">
            {link.label}
          </a>
        ))}
      </div>
    </header>
  );
}
