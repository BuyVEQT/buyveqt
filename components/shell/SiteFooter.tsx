"use client";

/**
 * SiteFooter — Instrument grammar. Renders on every page via
 * app/layout.tsx.
 *
 * The whole footer is ONE INK BAND with two tiers, on all viewports:
 *   Tier 1 — three columns: the brand blurb ("The VEQT Daily — …", set
 *     sentence case since Turn 8: it is a sentence, not a label),
 *     a REFERENCE column (Distributions / Weekly / Methodology /
 *     Almanac) and a
 *     SECTIONS column (Community / Compare / Learn / Calculators).
 *     Closed by a 1px white-tint rule. On mobile the blurb sits on top
 *     and the two link columns sit side by side beneath it, so every
 *     route stays reachable without the tab bar.
 *   Tier 2 — the signature sign-off: "BUYVEQT — ONE FUND. THE WHOLE
 *     WORLD." against the colophon (© year · not investment advice ·
 *     sources · Vol. I · Edition n).
 *
 * The band paints in var(--ins-ink) with var(--ins-paper) text — muted
 * tones are mixed off --ins-paper rather than the literal-white
 * --ins-inv-* tokens, which don't flip — so the band inverts correctly
 * under the Ink Edition. On mobile it sits above the fixed TabBar
 * (cleared via margin).
 */
import Link from "next/link";

const REFERENCE = [
  { label: "Distributions", href: "/distributions" },
  { label: "Weekly", href: "/weekly" },
  { label: "Methodology", href: "/methodology" },
  // /almanac's only other inbound link is the home rally module, which
  // shows conditionally — this is the route's permanent entry point.
  { label: "Almanac", href: "/almanac" },
];

const SECTIONS = [
  { label: "Community", href: "/community" },
  { label: "Compare", href: "/compare" },
  { label: "Learn", href: "/learn" },
  { label: "Calculators", href: "/calculators" },
];

export default function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="ins-footer ins-shell">
      <div className="ins-footer__band">
        <div className="ins-footer__tier1">
          <p className="ins-footer__blurb">
            The VEQT Daily — an independent broadsheet on the boring fund.
          </p>

          <nav aria-label="Site sections" className="ins-footer__nav">
            <div className="ins-footer__col">
              <div className="ins-footer__col-head">Reference</div>
              {REFERENCE.map((l) => (
                <Link key={l.href} href={l.href} className="ins-footer__link">
                  {l.label}
                </Link>
              ))}
            </div>
            <div className="ins-footer__col">
              <div className="ins-footer__col-head">Sections</div>
              {SECTIONS.map((l) => (
                <Link key={l.href} href={l.href} className="ins-footer__link">
                  {l.label}
                </Link>
              ))}
            </div>
          </nav>
        </div>

        <div className="ins-footer__tier2">
          <span className="ins-footer__sig">
            BuyVEQT — one fund. The whole world.
          </span>
          <span className="ins-footer__colophon ins-tnum">
            &copy; {year} &middot; Not investment advice &middot; Data: Vanguard
            Canada &amp; Yahoo Finance &middot; Vol. I &middot; Edition{" "}
            {year - 2018}
          </span>
        </div>
      </div>

      {/* Global (not scoped) on purpose: styled-jsx doesn't attach its
          scope class to <Link> components, which left every footer link
          unstyled. Selectors all carry the unique ins-footer prefix. */}
      <style jsx global>{`
        .ins-footer {
          font-family: var(--ins-font);
          /* Paper root wrapper: the breathing room above the band stays
             on the footer itself (padding, not margin) — a transparent
             margin let the themed body color show through as a dark
             band between the page and the footer. */
          background: var(--ins-paper);
          padding-top: 40px;
          /* Mobile: clear the fixed TabBar so the band sits above it
             instead of underneath. */
          margin-bottom: calc(76px + env(safe-area-inset-bottom, 0px));
        }
        @media (min-width: 1024px) {
          .ins-footer {
            padding-top: 60px;
            margin-bottom: 0;
          }
        }

        /* The ink band — all viewports. Text prints in --ins-paper so
           the band inverts correctly under the Ink Edition. */
        .ins-footer__band {
          background: var(--ins-ink);
          color: var(--ins-paper);
        }

        /* ── Tier 1 — blurb + link columns ─────────────────────────── */
        .ins-footer__tier1 {
          display: grid;
          gap: 18px;
          padding: 20px;
          /* 30% — the ink scale's hairline step, mirrored in paper. */
          border-bottom: 1px solid
            color-mix(in srgb, var(--ins-paper) 30%, transparent);
        }
        @media (min-width: 1024px) {
          .ins-footer__tier1 {
            grid-template-columns: 1fr auto;
            gap: 48px;
            align-items: start;
            padding: 22px 40px;
          }
        }
        /* Turn 8 — the blurb is a SENTENCE, so it stops shouting: sentence
           case, 12px, tracking off. 55% paper is the ink-panel utility
           tone (the inverse twin of --ins-gray-600). */
        .ins-footer__blurb {
          margin: 0;
          max-width: 300px;
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.01em;
          line-height: 1.55;
          color: color-mix(in srgb, var(--ins-paper) 55%, transparent);
        }
        .ins-footer__nav {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
          align-items: start;
        }
        @media (min-width: 1024px) {
          .ins-footer__nav {
            grid-template-columns: repeat(2, minmax(150px, auto));
            gap: 40px;
          }
        }
        .ins-footer__col {
          display: flex;
          flex-direction: column;
          /* Tap targets come from link padding on mobile; the gap only
             separates the head from the first link. */
          gap: 0;
        }
        @media (min-width: 1024px) {
          .ins-footer__col {
            gap: 8px;
          }
        }
        .ins-footer__col-head {
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: color-mix(in srgb, var(--ins-paper) 55%, transparent);
          margin-bottom: 6px;
        }
        @media (min-width: 1024px) {
          .ins-footer__col-head {
            margin-bottom: 2px;
          }
        }
        .ins-footer__link {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.14em;
          line-height: 1.4;
          text-transform: uppercase;
          color: var(--ins-paper);
          text-decoration: none;
          align-self: flex-start;
          /* Turn 8 touch targets: 14px line box + 2×15px padding = 44px on
             mobile, where these are the only route to /almanac and friends
             once the tab bar runs out of slots. (Was 9px pads / ≈32px.)
             Padding, not glyph size — the label stays 10px. */
          padding: 15px 0;
          transition: opacity 0.15s;
        }
        @media (min-width: 1024px) {
          .ins-footer__link {
            padding: 0;
          }
        }
        .ins-footer__link:hover {
          opacity: 0.62;
        }

        /* ── Tier 2 — the sign-off + colophon ──────────────────────── */
        .ins-footer__tier2 {
          display: flex;
          justify-content: space-between;
          gap: 6px 24px;
          flex-wrap: wrap;
          padding: 13px 20px;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          line-height: 1.5;
        }
        @media (min-width: 1024px) {
          .ins-footer__tier2 {
            padding: 13px 40px;
          }
        }
        /* The sign-off stays a display LABEL — it is the paper's wordmark
           line, not a sentence being read. Caps + tracking at the 10px
           floor is the whole point of it. */
        .ins-footer__sig {
          color: var(--ins-paper);
        }
        /* The colophon is a footnote — sentence case, 12px, tracking off.
           It overrides tier-2's caps grammar on purpose; the sig and the
           colophon are two different kinds of type sharing one row. */
        .ins-footer__colophon {
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.01em;
          text-transform: none;
          color: color-mix(in srgb, var(--ins-paper) 55%, transparent);
        }
      `}</style>
    </footer>
  );
}
