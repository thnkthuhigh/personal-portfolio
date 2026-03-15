import { useEffect, useState } from "react";
import { PageBackground } from "../components/PageBackground";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";
import {
  getMergedProjectCase,
  getUiText,
  projectTranslations,
  type Language,
} from "../data/templateData";
import {
  applyTranslationEntries,
  getInitialLanguage,
  initializeTheme,
  persistLanguage,
  setupCaseSectionNav,
  setupHeaderScroll,
  setupMobileMenu,
  setupReveal,
  setupScrollProgress,
  setupSpotlightCards,
  syncChromeLanguage,
} from "../lib/siteEffects";

const PROJECT_NAV_LINKS = [
  { href: "index.html#projects", label: "Quay lại dự án" },
  { href: "index.html#contact", label: "Liên hệ" },
] as const;

const PROJECT_MOBILE_LINKS = [
  { href: "index.html#home", label: "Trang chủ" },
  { href: "index.html#projects", label: "Quay lại dự án" },
  { href: "index.html#contact", label: "Liên hệ" },
] as const;

const DETAIL_SECTIONS = [
  {
    id: "project-architecture",
    title: "Kiến trúc UI & luồng dữ liệu",
    key: "architecture",
  },
  {
    id: "project-tech-decisions",
    title: "Technical Decisions",
    key: "technicalDecisions",
  },
  {
    id: "project-role-scope",
    title: "Phần tôi trực tiếp phụ trách",
    key: "roleScope",
  },
  {
    id: "project-evidence",
    title: "Artifacts có thể chia sẻ",
    key: "evidence",
  },
  {
    id: "project-challenges",
    title: "Thách thức kỹ thuật",
    key: "challenges",
  },
  {
    id: "project-lessons",
    title: "Bài học rút ra",
    key: "lessons",
  },
] as const;

function getProjectIdFromLocation(): string {
  return new URLSearchParams(window.location.search).get("id") ?? "";
}

export function ProjectDetailPage() {
  const [language, setLanguage] = useState<Language>(() => getInitialLanguage());
  const projectId = getProjectIdFromLocation();
  const detail = getMergedProjectCase(projectId, language);
  const ui = getUiText(language);

  useEffect(() => {
    persistLanguage(language);
    applyTranslationEntries(projectTranslations[language] ?? projectTranslations.vi);
    syncChromeLanguage(language, ui);
  }, [language, ui]);

  useEffect(() => {
    initializeTheme();

    const cleanups = [
      setupMobileMenu({
        menuOpen: ui.menuOpen,
        menuClose: ui.menuClose,
      }),
      setupHeaderScroll(),
      setupScrollProgress(),
      setupSpotlightCards(),
      setupReveal(),
      setupCaseSectionNav(),
    ];

    return () => {
      cleanups.forEach((cleanup) => cleanup());
    };
  }, [language, ui.menuClose, ui.menuOpen]);

  useEffect(() => {
    document.title = detail
      ? `${detail.title} | Case Study`
      : `${ui.notFoundTitle} | Case Study`;
  }, [detail, ui.notFoundTitle]);

  const cover = detail?.gallery.find(
    (item) => typeof item.image === "string" && item.image.length > 0,
  );
  const hasVideo = Boolean(detail?.videoFile || detail?.videoEmbed);

  return (
    <>
      <a className="skip-link" href="#project-main">
        Bỏ qua điều hướng
      </a>
      <div className="scroll-progress" id="scroll-progress" aria-hidden="true">
        <span></span>
      </div>
      <PageBackground />
      <SiteHeader
        language={language}
        onLanguageChange={setLanguage}
        brandHref="index.html#home"
        brandLabel={language === "en" ? "Back to portfolio" : "Về trang chính"}
        navLabel={language === "en" ? "Case study navigation" : "Điều hướng case study"}
        mobileNavLabel={language === "en" ? "Mobile navigation" : "Điều hướng di động"}
        navLinks={PROJECT_NAV_LINKS}
        mobileLinks={PROJECT_MOBILE_LINKS}
      />

      <main id="project-main" className="project-main">
        <section className="section project-hero-section" id="case-overview">
          <div className="container">
            <div className="project-hero-card" data-reveal="up" data-delay="80">
              <p className="project-case-badge" id="project-case-badge">
                {detail?.badge ?? "Case Study"}
              </p>
              <h1 id="project-case-title">
                {detail?.title ?? ui.notFoundTitle}
              </h1>
              <p className="project-case-summary" id="project-case-summary">
                {detail?.summary ?? ui.notFoundSummary}
              </p>
              <div className="project-case-meta" id="project-case-meta">
                {detail?.meta.map((item) => <span key={item}>{item}</span>)}
              </div>
              <div className="project-hero-media" id="project-hero-media">
                {cover?.image ? (
                  <img
                    src={cover.image}
                    alt={cover.alt || `${detail?.title ?? "Case"} cover preview`}
                    loading="eager"
                    decoding="async"
                  />
                ) : (
                  <div className="project-hero-media-fallback">
                    {language === "en"
                      ? "Case preview media will appear here when a cover image is added."
                      : "Case preview media sẽ hiển thị tại đây khi bạn thêm ảnh cover."}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="section project-nav-section">
          <div className="container">
            <nav className="project-case-nav" aria-label="Mục case study" data-reveal="up">
              <a href="#case-overview">Tổng quan</a>
              <a href="#case-story">Story</a>
              <a href="#case-details">Chi tiết kỹ thuật</a>
              <a href="#case-media">Media</a>
              <a href="#case-proof">Kết quả</a>
              <a href="#case-security">NDA</a>
            </nav>
          </div>
        </section>

        <section className="section project-story-section" id="case-story">
          <div className="container project-story-grid">
            <article className="project-panel" data-reveal="up">
              <h2>Problem</h2>
              <p id="project-story-problem">{detail?.problem ?? ""}</p>
            </article>
            <article className="project-panel" data-reveal="up" data-delay="80">
              <h2>Solution</h2>
              <p id="project-story-solution">{detail?.solution ?? ""}</p>
            </article>
            <article className="project-panel" data-reveal="up" data-delay="160">
              <h2>Impact</h2>
              <p id="project-story-impact">
                {detail?.storyImpact ?? detail?.impact.slice(0, 2).join(" ")}
              </p>
            </article>
          </div>
        </section>

        <section className="section project-media-section" id="case-media">
          <div className="container project-media-grid">
            <article className="project-panel" data-reveal="up">
              <h2>Video walkthrough</h2>
              <div className="project-video" id="project-video">
                {detail?.videoFile ? (
                  <video controls preload="metadata" poster={detail.videoPoster || undefined}>
                    <source src={detail.videoFile} type="video/mp4" />
                  </video>
                ) : detail?.videoEmbed ? (
                  <iframe
                    src={detail.videoEmbed}
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={`${detail.title} walkthrough`}
                  ></iframe>
                ) : (
                  <div className="video-placeholder">
                    <strong>{language === "en" ? "Not available" : "Không có sẵn"}</strong>
                  </div>
                )}
              </div>
              <p className="project-panel-note" id="project-video-note">
                {hasVideo
                  ? detail?.videoNote || ""
                  : language === "en"
                    ? "Not available."
                    : "Không có sẵn."}
              </p>
            </article>

            <article className="project-panel" data-reveal="up" data-delay="80">
              <h2>Ảnh minh hoạ chính</h2>
              <div className="project-gallery" id="project-gallery">
                {detail?.gallery.map((item) =>
                  item.image ? (
                    <figure key={`${item.title}-${item.image}`} className="gallery-item gallery-item-media">
                      <img
                        src={item.image}
                        alt={item.alt || item.title}
                        loading="lazy"
                        decoding="async"
                      />
                      <figcaption className="gallery-item-caption">
                        <strong>{item.title}</strong>
                        <span>{item.desc}</span>
                      </figcaption>
                    </figure>
                  ) : (
                    <div key={`${item.title}-${item.desc}`} className="gallery-item">
                      <strong>{item.title}</strong>
                      <span>{item.desc}</span>
                    </div>
                  ),
                )}
              </div>
            </article>
          </div>
        </section>

        <section className="section project-detail-section" id="case-details">
          <div className="container project-detail-grid">
            <article className="project-panel project-panel-wide" data-reveal="up">
              <h2>Sơ đồ kiến trúc</h2>
              <figure className="architecture-diagram">
                {detail?.architectureDiagram ? (
                  <img
                    id="project-architecture-diagram"
                    src={detail.architectureDiagram}
                    alt={`${detail.title} architecture diagram`}
                    loading="lazy"
                  />
                ) : (
                  <img id="project-architecture-diagram" alt="Architecture diagram" />
                )}
                <figcaption id="project-architecture-caption">
                  {detail?.architectureCaption ||
                    (language === "en"
                      ? "Architecture diagram illustrating UI structure, data flow, and module organization decisions."
                      : "Sơ đồ kiến trúc minh họa cấu trúc UI, data flow và các quyết định tổ chức module.")}
                </figcaption>
              </figure>
            </article>

            {DETAIL_SECTIONS.map((section, index) => (
              <article
                key={section.id}
                className="project-panel"
                data-reveal="up"
                data-delay={index % 2 === 1 ? "80" : undefined}
              >
                <h2>{section.title}</h2>
                <ul id={section.id}>
                  {(detail?.[section.key] ?? []).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="section project-proof-section" id="case-proof">
          <div className="container">
            <div className="project-proof-grid" id="project-proof-grid" data-reveal="up">
              {detail?.proof.length ? (
                detail.proof.map((item) => (
                  <article key={`${item.value}-${item.label}`} className="proof-item">
                    <strong>{item.value}</strong>
                    <span>{item.label}</span>
                  </article>
                ))
              ) : (
                <article className="proof-item">
                  <strong>Case Study</strong>
                  <span>
                    {language === "en"
                      ? "Detailed impact metrics will be updated with real production data."
                      : "Chi tiết kết quả sẽ được cập nhật theo dữ liệu thực tế."}
                  </span>
                </article>
              )}
            </div>
          </div>
        </section>

        <section className="section project-security-section" id="case-security">
          <div className="container">
            <article className="project-panel" data-reveal="up">
              <h2>Phạm vi bảo mật / NDA</h2>
              <p id="project-nda">{detail?.nda ?? ""}</p>
            </article>
          </div>
        </section>

        <section className="section project-footer-section">
          <div className="container project-footer-card" data-reveal="up">
            <div className="project-footer-links" id="project-links">
              {detail?.links.map((link) =>
                link.href ? (
                  <a key={`${link.label}-${link.href}`} href={link.href} target="_blank" rel="noopener noreferrer">
                    {link.label}
                  </a>
                ) : (
                  <span key={link.label}>{link.label}</span>
                ),
              )}
            </div>
            <div className="project-footer-cta">
              <a className="btn btn-secondary" href="index.html#projects">
                Quay lại portfolio
              </a>
              <a className="btn btn-primary" href="index.html#contact">
                Trao đổi thêm về dự án
              </a>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter
        text="Nguyễn Chí Thanh. Case Study."
        backHref="index.html#home"
        backLabel="Về trang chính"
      />
    </>
  );
}
