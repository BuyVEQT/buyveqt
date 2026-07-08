"use client";

/**
 * SiteFooter — Instrument grammar. Renders on every page via
 * app/layout.tsx.
 *
 * Two layers:
 *   1. Link columns (desktop-only, ≥lg): 1px ink top rule, uppercase
 *      micro-label links (Reference: Distributions / Weekly / Methodology;
 *      Sections: Community / Compare / Learn / Calculators) + colophon.
 *   2. The INK BAND — the signature sign-off. Ink background, white
 *      9.5px w600 0.22em uppercase: "BUYVEQT — ONE FUND. THE WHOLE
 *      WORLD." / "EST. 2019 · TSX: VEQT". Renders on ALL viewports;
 *      on mobile it sits above the fixed TabBar (cleared via margin).
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
    <footer className="ins-footer ins-shell">
      <div className="ins-footer__links">
        <div className="ins-footer__rule" aria-hidden />
        <div className="ins-footer__row">
          <div className="ins-footer__brand">
            <Link href="/" className="ins-footer__logo">
              BUYVEQT
            </Link>
          </div>

          <nav aria-label="Site sections" className="ins-footer__nav">
            <div className="ins-footer__col">
              <div className="ins-footer__col-head">Reference</div>
              {SECONDARY.map((l) => (
                <Link key={l.href} href={l.href} className="ins-footer__link">
                  {l.label}
                </Link>
              ))}
            </div>
            <div className="ins-footer__col">
              <div className="ins-footer__col-head">Sections</div>
              {LEGAL.map((l) => (
                <Link key={l.href} href={l.href} className="ins-footer__link">
                  {l.label}
                </Link>
              ))}
            </div>
          </nav>
        </div>

        <div className="ins-footer__colophon">
          <span>
            &copy; {year} BuyVEQT. Not investment advice. Data from Vanguard
            Canada &amp; Yahoo Finance.
          </span>
          <span className="ins-tnum">
            Vol. I &middot; Edition {year - 2018}
          </span>
        </div>
      </div>

      <div className="ins-footer__band">
        <span>BUYVEQT — ONE FUND. THE WHOLE WORLD.</span>
        <span className="ins-tnum">EST. 2019 · TSX: VEQT</span>
      </div>

      {/* Global (not scoped) on purpose: styled-jsx doesn't attach its
          scope class to <Link> components, which left every footer link
          unstyled. Selectors all carry the unique ins-footer prefix. */}
      <style jsx global>{`
        .ins-footer {
          font-family: var(--ins-font);
          background: var(--ins-paper);
          /* Breathing room ABOVE the rule stays on the white footer
             itself (padding, not margin) — a transparent margin let the
             themed body color show through as a dark band between the
             page and the footer. */
          padding-top: 0;
          /* Mobile: clear the fixed TabBar so the ink band sits above
             it instead of underneath. */
          margin-bottom: calc(76px + env(safe-area-inset-bottom, 0px));
        }
        @media (min-width: 1024px) {
          .ins-footer {
            padding-top: 60px;
            margin-bottom: 0;
          }
        }

        /* Link columns — desktop only. */
        .ins-footer__links {
          display: none;
        }
        @media (min-width: 1024px) {
          .ins-footer__links {
            display: block;
            max-width: 1400px;
            margin: 0 auto;
            padding: 0 40px 26px;
          }
        }
        .ins-footer__rule {
          height: 1px;
          background: var(--ins-ink);
          margin-bottom: 26px;
        }
        .ins-footer__row {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 48px;
          align-items: start;
          margin-bottom: 26px;
        }
        .ins-footer__brand {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .ins-footer__logo {
          font-size: 15px;
          font-weight: 800;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--ins-ink);
          text-decoration: none;
          align-self: flex-start;
        }
        .ins-footer__nav {
          display: grid;
          grid-template-columns: repeat(2, minmax(150px, auto));
          gap: 40px;
          align-items: start;
        }
        .ins-footer__col {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .ins-footer__col-head {
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--ins-gray-600);
          margin-bottom: 2px;
        }
        .ins-footer__link {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--ins-gray-700);
          text-decoration: none;
          transition: color 0.15s;
          align-self: flex-start;
        }
        .ins-footer__link:hover {
          color: var(--ins-ink);
        }
        .ins-footer__colophon {
          padding-top: 14px;
          border-top: 1px solid var(--ins-hair-soft);
          display: flex;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
          font-size: 9.5px;
          font-weight: 500;
          letter-spacing: 0.04em;
          color: var(--ins-gray-600);
        }

        /* The ink band — all viewports. Text prints in --ins-paper so
           the band inverts correctly under the Ink Edition. */
        .ins-footer__band {
          background: var(--ins-ink);
          color: var(--ins-paper);
          padding: 13px 20px;
          display: flex;
          justify-content: space-between;
          gap: 6px 24px;
          flex-wrap: wrap;
          font-size: 9.5px;
          font-weight: 600;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          line-height: 1.5;
        }
        @media (min-width: 1024px) {
          .ins-footer__band {
            padding: 13px 40px;
          }
        }
      `}</style>
    </footer>
  );
}
