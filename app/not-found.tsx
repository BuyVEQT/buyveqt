import type { Metadata } from "next";
import Link from "next/link";
import InteriorShell from "@/components/broadsheet/InteriorShell";

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
 * Global 404 handler. Replaces Next's stock "404 — Page not found" with the
 * site's broadsheet treatment + a small directory of canonical entry points
 * so a wrong URL doesn't become a dead end.
 *
 * Kept intentionally short — no live data, no JS work, no JSON-LD — so the
 * 404 itself doesn't ship the heavy chart/data bundles.
 */
const SUGGESTIONS: Array<{ href: string; label: string; blurb: string }> = [
  {
    href: "/",
    label: "Today",
    blurb: "Live VEQT.TO price, regional sleeves, weather signal.",
  },
  {
    href: "/inside-veqt",
    label: "Inside VEQT",
    blurb: "Holdings, sectors, geography — what you actually own.",
  },
  {
    href: "/compare",
    label: "Compare",
    blurb: "VEQT against XEQT, VGRO, ZEQT — side by side.",
  },
  {
    href: "/calculators",
    label: "Calculators",
    blurb: "If you'd invested, DCA, dividend income, TFSA / RRSP.",
  },
  {
    href: "/learn",
    label: "Learn",
    blurb: "The archive — primers, comparisons, tax strategy.",
  },
  {
    href: "/distributions",
    label: "Distributions",
    blurb: "Every annual distribution since 2019, with payment dates.",
  },
];

export default function NotFound() {
  return (
    <InteriorShell>
      <section className="pt-8 sm:pt-10 pb-2 bs-enter">
        <p className="bs-stamp mb-3">Off the map</p>
        <h1
          className="bs-display text-[2.25rem] sm:text-[3.25rem] lg:text-[4.25rem] leading-[0.98]"
          style={{ color: "var(--ink)" }}
        >
          <span className="block">404 — that page</span>{" "}
          <em className="bs-display-italic block">isn&rsquo;t in this paper.</em>
        </h1>
        <p
          className="bs-body italic mt-5 max-w-[58ch] text-[1.0625rem]"
          style={{ color: "var(--ink-soft)" }}
        >
          The URL you followed has been retired, mistyped, or never existed.
          A few canonical entry points are below — most readers find what
          they were looking for inside two clicks.
        </p>
      </section>

      <ol
        className="mt-8 sm:mt-10 border-t border-[var(--ink)]"
        aria-label="Suggested destinations"
      >
        {SUGGESTIONS.map((item, idx) => {
          const dispatchNumber = String(idx + 1).padStart(2, "0");
          return (
            <li
              key={item.href}
              className="border-b border-[var(--color-border)]"
            >
              <Link
                href={item.href}
                className="group block py-6 sm:py-7 grid grid-cols-[auto_1fr_auto] gap-x-5 sm:gap-x-8 items-start"
                style={{ textDecoration: "none" }}
              >
                <span
                  className="bs-display bs-numerals text-2xl sm:text-3xl leading-none pt-1 tabular-nums"
                  style={{ color: "var(--ink-soft)" }}
                  aria-hidden
                >
                  {dispatchNumber}
                </span>
                <div className="min-w-0">
                  <h2
                    className="bs-display text-[1.25rem] sm:text-[1.5rem] leading-[1.15] group-hover:underline transition-colors"
                    style={{ color: "var(--ink)" }}
                  >
                    {item.label}
                  </h2>
                  <p
                    className="bs-body text-[14px] mt-2 leading-[1.5] max-w-[58ch]"
                    style={{ color: "var(--ink)" }}
                  >
                    {item.blurb}
                  </p>
                </div>
                <span
                  className="bs-numerals tabular-nums text-[15px] sm:text-[16px] font-semibold pt-1 shrink-0"
                  style={{ color: "var(--ink-soft)" }}
                  aria-hidden
                >
                  →
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </InteriorShell>
  );
}
