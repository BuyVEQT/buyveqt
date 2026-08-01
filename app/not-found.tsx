import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page Not Found",
  description: "The page you're looking for has been moved or doesn't exist.",
  robots: { index: false, follow: true },
  // The root layout sets a site-wide canonical at the homepage. Inheriting
  // it here told crawlers this 404 *is* the homepage — a contradiction with
  // the noindex above. Null drops the tag; the noindex stands alone.
  alternates: { canonical: null },
};

/**
 * Global 404 — the Instrument's smallest page.
 *
 * Three ruled rows, not six: the point is to get a wrong URL back onto the
 * tape in one click, and a long directory reads as a sitemap rather than a
 * recovery. Live data, JSON-LD and charts all stay off it, so a mistyped
 * address never pays for the heavy bundles.
 */
const ROWS: Array<{ href: string; label: string; blurb: string }> = [
  {
    href: "/",
    label: "Today",
    blurb: "The live price, the day's conditions, and what moved it.",
  },
  {
    href: "/learn",
    label: "The Archive",
    blurb: "Primers, head-to-heads, and the tax-account playbook.",
  },
  {
    href: "/compare",
    label: "Compare",
    blurb: "VEQT against XEQT, VGRO and ZEQT — side by side.",
  },
];

export default function NotFound() {
  return (
    <main className="ins-root nf404">
      <div className="nf404__page">
        <header className="nf404__hero">
          <div className="nf404__kicker">Four-oh-four · Off the tape</div>
          <h1 className="nf404__display">This page isn&rsquo;t on file.</h1>
          <p className="nf404__dek">
            The address you followed has been retired, mistyped, or never
            printed. Nothing is broken and nothing is missing — the three
            entry points below cover most of what anyone comes here for.
          </p>
        </header>

        <ol className="nf404__rows" aria-label="Where to go instead">
          {ROWS.map((row, i) => (
            <li key={row.href} className="nf404__item">
              <Link href={row.href} className="nf404__row">
                <span className="nf404__ord" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="nf404__body">
                  <span className="nf404__label">{row.label}</span>
                  <span className="nf404__blurb">{row.blurb}</span>
                </span>
                <span className="nf404__arrow" aria-hidden="true">
                  →
                </span>
              </Link>
            </li>
          ))}
        </ol>

        <section className="nf404__closer" aria-label="Closing note">
          <div>
            <p className="nf404__closerDisplay">Back to the board.</p>
            <p className="nf404__closerSub">
              Everything else on the site is one hop from the front page.
            </p>
          </div>
          <Link href="/" className="nf404__closerLink">
            Back to today <span aria-hidden="true">→</span>
          </Link>
        </section>
      </div>

      <style dangerouslySetInnerHTML={{ __html: css }} />
    </main>
  );
}

/* ── Styles — Instrument tokens, radius 0, no shadows, tabular numerals.
 * Plain <style> (not styled-jsx) keeps this a server component and lets
 * descendant selectors reach <Link>-rendered anchors. Every selector
 * carries the unique `nf404` prefix. ── */

const css = `
.nf404 {
  background: var(--ins-paper);
  color: var(--ins-ink);
  font-family: var(--ins-font);
  min-height: 100dvh;
}
.nf404__page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 40px 48px;
  display: flex;
  flex-direction: column;
  gap: 34px;
}

/* ── Hero ─────────────────────────────────────────────────────── */
.nf404__hero {
  padding-top: 40px;
}
.nf404__kicker {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: var(--ins-gray-600);
  font-variant-numeric: tabular-nums;
}
.nf404__display {
  margin: 18px 0 0;
  max-width: 16ch;
  font-size: clamp(38px, 6vw, 72px);
  font-weight: 700;
  letter-spacing: -0.035em;
  line-height: 1;
}
.nf404__dek {
  margin: 20px 0 0;
  max-width: 60ch;
  font-size: 17px;
  font-weight: 500;
  line-height: 1.55;
  color: var(--ins-gray-700);
  text-wrap: pretty;
}

/* ── Rows ─────────────────────────────────────────────────────── */
.nf404__rows {
  list-style: none;
  margin: 0;
  padding: 0;
  border-top: 3px solid var(--ins-rule-strong);
}
.nf404__item {
  border-bottom: 1px solid var(--ins-hair);
}
.nf404__item:last-child {
  border-bottom-color: var(--ins-ink);
}
.nf404__row {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 28px;
  align-items: center;
  min-height: 44px;
  padding: 18px 0;
  color: var(--ins-ink);
  text-decoration: none;
  transition: padding-left 0.18s ease;
}
.nf404__row:hover {
  padding-left: 8px;
}
.nf404__ord {
  font-size: 30px;
  font-weight: 700;
  line-height: 1;
  color: var(--ins-ordinal);
  font-variant-numeric: tabular-nums;
}
.nf404__body {
  min-width: 0;
  max-width: 62ch;
}
.nf404__label {
  display: block;
  font-size: 26px;
  font-weight: 600;
  letter-spacing: -0.02em;
  line-height: 1.1;
}
.nf404__blurb {
  display: block;
  margin-top: 6px;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.5;
  color: var(--ins-gray-700);
}
.nf404__arrow {
  font-size: 18px;
  font-weight: 700;
  color: var(--ins-ink);
  transition: color 0.18s ease;
}
.nf404__row:hover .nf404__arrow {
  color: var(--ins-signal);
}

/* ── Closer — the page's one red moment ──────────────────────── */
.nf404__closer {
  border-top: 1px solid var(--ins-ink);
  padding-top: 40px;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 40px;
  align-items: end;
}
.nf404__closerDisplay {
  margin: 0;
  font-size: 44px;
  font-weight: 600;
  letter-spacing: -0.03em;
  line-height: 1.05;
}
.nf404__closerSub {
  margin: 12px 0 0;
  max-width: 56ch;
  font-size: 15px;
  font-weight: 500;
  color: var(--ins-gray-600);
}
.nf404__closerLink {
  justify-self: end;
  white-space: nowrap;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--ins-signal);
  text-decoration: none;
  border-bottom: 2px solid var(--ins-signal);
  padding-bottom: 5px;
}

/* ── Mobile · 390 ────────────────────────────────────────────── */
@media (max-width: 640px) {
  .nf404__page {
    padding: 0 20px 32px;
    gap: 26px;
  }
  .nf404__hero {
    padding-top: 24px;
  }
  .nf404__kicker {
    font-size: 8.5px;
    letter-spacing: 0.22em;
  }
  .nf404__display {
    margin-top: 12px;
    max-width: none;
    letter-spacing: -0.03em;
    line-height: 1.02;
  }
  .nf404__dek {
    margin-top: 14px;
    font-size: 15px;
  }
  .nf404__row {
    grid-template-columns: auto minmax(0, 1fr) auto;
    gap: 14px;
    padding: 14px 0;
  }
  .nf404__ord {
    font-size: 20px;
  }
  .nf404__label {
    font-size: 19px;
  }
  .nf404__blurb {
    margin-top: 4px;
    font-size: 13px;
  }
  .nf404__arrow {
    font-size: 15px;
  }
  .nf404__closer {
    display: block;
    padding-top: 18px;
  }
  .nf404__closerDisplay {
    font-size: 24px;
    letter-spacing: -0.02em;
    line-height: 1.1;
  }
  .nf404__closerSub {
    margin-top: 8px;
    font-size: 12.5px;
    line-height: 1.5;
  }
  .nf404__closerLink {
    display: inline-block;
    margin-top: 14px;
    min-height: 44px;
    line-height: 40px;
    font-size: 10px;
    letter-spacing: 0.14em;
    padding-bottom: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .nf404__row,
  .nf404__arrow {
    transition: none;
  }
}
`;
