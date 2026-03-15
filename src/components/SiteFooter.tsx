interface SiteFooterProps {
  text: string;
  backHref: string;
  backLabel: string;
}

export function SiteFooter({ text, backHref, backLabel }: SiteFooterProps) {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <p>
          © <span id="current-year">{new Date().getFullYear()}</span> {text}
        </p>
        <a href={backHref} className="back-top">
          {backLabel}
        </a>
      </div>
    </footer>
  );
}
