"use client";

/**
 * SiteFooter — quiet site-wide footer.
 *
 * Holds the secondary nav links that used to crowd the desktop top bar
 * (Distributions / Weekly / Methodology) plus a thin colophon line. The
 * goal is editorial restraint — a single hairline rule, sparse typography,
 * no marketing CTAs. Renders on every page via app/layout.tsx.
 *
 * The Round-4 nav lost the ☰ overflow so the secondary links have lived
 * top-right since then; with the theme toggle in the same cluster the
 * row got too dense. The footer is the natural editorial home for them.
 */
import Link from "next/link";

const SECONDARY = [
  { label: "Distributions", href: "/distributions" },
  { label: "Weekly", href: "/weekly" },
  { label: "Methodology", href: "/methodology" },
];

const LEGAL = [
  { label: "Community", href: "/community" },
  { label: "Compare", href: "/compare" },
  { label: "Learn", href: "/learn" },
  { label: "Calculators", href: "/calculators" },
];

export default function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <div className="site-footer__rule" aria-hidden />
      <div className="site-footer__row">
        <div className="site-footer__brand">
          <Link href="/" className="site-footer__logo">
            Buy<span style={{ color: "var(--stamp)" }}>VEQT</span>
          </Link>
          <span className="site-footer__tagline">
            <em>The VEQT Daily</em> &mdash; an independent broadsheet on the boring fund.
          </span>
        </div>

        <nav aria-label="Site sections" className="site-footer__nav">
          <div className="site-footer__col">
            <div className="site-footer__col-head">Reference</div>
            {SECONDARY.map((l) => (
              <Link key={l.href} href={l.href} className="site-footer__link">
                {l.label}
              </Link>
            ))}
          </div>
          <div className="site-footer__col">
            <div className="site-footer__col-head">Sections</div>
            {LEGAL.map((l) => (
              <Link key={l.href} href={l.href} className="site-footer__link">
                {l.label}
              </Link>
            ))}
          </div>
        </nav>
      </div>

      <div className="site-footer__colophon">
        <span>
          &copy; {year} BuyVEQT. Not investment advice. Data from Vanguard
          Canada &amp; Yahoo Finance.
        </span>
        <span className="site-footer__edition">
          Vol. I &middot; Edition {year - 2018}
        </span>
      </div>

      <style jsx>{`
        .site-footer {
          /* Hidden on mobile — TabBar already crowds the bottom edge.
             Show on lg+ where the desktop nav sits. */
          display: none;
          padding: 0 32px 32px;
          margin-top: 60px;
          max-width: 1400px;
          margin-left: auto;
          margin-right: auto;
          font-family: var(--font-sans);
          color: var(--ink-mute);
        }
        @media (min-width: 1024px) {
          .site-footer {
            display: block;
          }
        }
        .site-footer__rule {
          height: 1px;
          background: var(--rule-soft);
          margin-bottom: 28px;
        }
        .site-footer__row {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 48px;
          align-items: start;
          margin-bottom: 24px;
        }
        .site-footer__brand {
          display: flex;
          flex-direction: column;
          gap: 6px;
          max-width: 48ch;
        }
        .site-footer__logo {
          font-family: var(--font-display);
          font-weight: 500;
          font-size: 22px;
          color: var(--ink);
          text-decoration: none;
          letter-spacing: -0.015em;
        }
        .site-footer__tagline {
          font-family: var(--font-serif);
          font-style: italic;
          font-size: 13.5px;
          color: var(--ink-soft);
          line-height: 1.45;
        }
        .site-footer__tagline em {
          font-family: var(--font-display);
          font-style: italic;
          font-weight: 500;
          color: var(--ink);
        }
        .site-footer__nav {
          display: grid;
          grid-template-columns: repeat(2, minmax(140px, auto));
          gap: 36px;
          align-items: start;
        }
        .site-footer__col {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .site-footer__col-head {
          font-family: var(--font-sans);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--ink-mute);
          margin-bottom: 4px;
        }
        .site-footer__link {
          font-family: var(--font-serif);
          font-size: 14px;
          color: var(--ink-soft);
          text-decoration: none;
          transition: color 0.15s;
        }
        .site-footer__link:hover {
          color: var(--ink);
          border-bottom: 1px solid var(--stamp);
          padding-bottom: 1px;
          margin-bottom: -2px;
        }
        .site-footer__colophon {
          padding-top: 20px;
          border-top: 1px solid var(--rule-hair);
          display: flex;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
          font-size: 11px;
          color: var(--ink-mute);
          letter-spacing: 0.04em;
        }
        .site-footer__edition {
          font-family: var(--font-display);
          font-style: italic;
        }
      `}</style>
    </footer>
  );
}
