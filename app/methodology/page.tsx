import type { Metadata } from "next";
import Link from "next/link";
import InteriorShell from "@/components/broadsheet/InteriorShell";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildBreadcrumbSchema, canonicalUrl } from "@/lib/seo-config";

export const metadata: Metadata = {
  title: "The Colophon — Sources, Methods, Fine Print",
  description:
    "How BuyVEQT sources its data, what's manual versus live, what we cache, and where the limits are. The fine print, plain.",
  alternates: { canonical: canonicalUrl("/methodology") },
  openGraph: {
    title: "The Colophon — Sources, Methods, Fine Print",
    description:
      "Where the data comes from, how often it refreshes, and what to trust.",
    url: canonicalUrl("/methodology"),
  },
};

interface Note {
  title: string;
  body: React.ReactNode;
}

/**
 * The Colophon — methodology page in broadsheet voice.
 *
 * A printer's colophon traditionally went at the back of a book to
 * declare its sources and craft. Here it does the same job for the
 * data on the rest of the site: where each number comes from, how
 * stale it can be, and what's manual.
 *
 * Structured as numbered notes (matching /community Letters and
 * /compare Suitability cards) so the rhythm reads as one publication.
 */
export default function MethodologyPage() {
  const notes: Note[] = [
    {
      title: "About this site",
      body: (
        <>
          <p>
            BuyVEQT is an unofficial, community-built information hub for the
            Vanguard All-Equity ETF Portfolio (VEQT). It is not affiliated
            with, endorsed by, or connected to Vanguard Investments Canada
            Inc. or any other financial institution.
          </p>
          <p>
            Every page on this site exists to make publicly available
            information about VEQT easier for Canadian investors to read,
            compare, and trust.
          </p>
        </>
      ),
    },
    {
      title: "Where the prices come from",
      body: (
        <>
          <p>
            Live market data flows through a two-source fallback chain so a
            single outage doesn&apos;t blank the page:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              <strong>Alpha Vantage</strong> — primary source for VEQT.
              Real-time quotes and full daily history via their financial
              data API.
            </li>
            <li>
              <strong>Yahoo Finance</strong> — primary for comparison funds,
              fallback for VEQT. Quotes and history via the{" "}
              <code className="text-[12px] px-1.5 py-0.5 rounded border border-[var(--color-border)]">
                yahoo-finance2
              </code>{" "}
              library.
            </li>
          </ul>
          <p>
            Every successful fetch is cached locally so the site can serve
            the last known good data when both providers are unreachable.
            The &ldquo;Updated&rdquo; timestamp and source label on each
            page tell you when and from where.
          </p>
        </>
      ),
    },
    {
      title: "How often it refreshes",
      body: (
        <>
          <p>Different data, different cadences:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              <strong>Price quotes</strong> — every ~15 minutes via ISR
              caching. Often fresher inside market hours.
            </li>
            <li>
              <strong>Daily history</strong> — every ~24 hours.
              Yesterday&apos;s close doesn&apos;t change.
            </li>
            <li>
              <strong>Monthly history</strong> — every ~7 days.
            </li>
          </ul>
          <p>
            Market data may be delayed and is not suitable for trading
            decisions. Always confirm prices with your brokerage before
            placing an order.
          </p>
        </>
      ),
    },
    {
      title: "How the charts read",
      body: (
        <>
          <p>
            Charts use adjusted close prices, which back out distributions
            and splits so dividends don&apos;t manufacture phantom drops.
            Comparison charts normalize each fund to the start of the
            window, so two funds with different unit prices can be read on
            the same y-axis.
          </p>
          <p>
            <strong>Past performance does not guarantee future results.</strong>
          </p>
        </>
      ),
    },
    {
      title: "What's manual",
      body: (
        <>
          <p>
            Fund metadata — MER, AUM, holding count, geographic and sector
            breakdowns, underlying ETFs — is compiled by hand from official
            fund documents, provider websites, and regulatory filings (Fund
            Facts).
          </p>
          <p>
            We update these periodically, but they are not live. Expect a
            short lag between when a provider publishes a change and when
            this site reflects it.
          </p>
          <p>
            <strong>MER note.</strong> Vanguard cut VEQT&apos;s management
            fee from 0.22% to 0.17% in November 2025. The official MER (which
            adds operating expenses and taxes) was last reported as 0.24%
            against an earlier fiscal year. The effective MER should land
            around 0.19%–0.20% once recalculated. We display
            &ldquo;~0.20%*&rdquo; with a footnote until the official number
            updates.
          </p>
        </>
      ),
    },
    {
      title: "Distributions",
      body: (
        <>
          <p>
            Distribution history is transcribed from Vanguard&apos;s
            published distribution announcements — amounts, ex-dates, and
            payment dates as printed.
          </p>
          <p>
            Trailing 12-month yield is the sum of the last twelve months of
            distributions divided by the current unit price. A standard
            trailing yield. It does not predict future distributions.
          </p>
        </>
      ),
    },
    {
      title: "Editorial content",
      body: (
        <>
          <p>
            Everything in the{" "}
            <Link href="/learn" className="bs-link" style={{ color: "var(--ink)" }}>
              Learn
            </Link>{" "}
            archive is educational. The dispatches help Canadians understand
            how VEQT, all-in-one ETFs, and tax-advantaged accounts work.
            They do not constitute financial, investment, tax, or legal
            advice.
          </p>
          <p>
            Tax information is general. Tax law changes. Always consult a
            qualified professional for advice specific to your situation.
          </p>
        </>
      ),
    },
    {
      title: "Corrections & contributions",
      body: (
        <>
          <p>
            See an error, a stale figure, or a number that smells wrong?
            Reach the editors at{" "}
            <a
              href="https://www.reddit.com/r/JustBuyVEQT/"
              target="_blank"
              rel="noopener noreferrer"
              className="bs-link"
              style={{ color: "var(--ink)" }}
            >
              r/JustBuyVEQT
            </a>
            . This is a community project — corrections are welcomed, not
            tolerated.
          </p>
        </>
      ),
    },
  ];

  return (
    <InteriorShell>
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Methodology", path: "/methodology" },
        ])}
      />

      {/* ── Page head ──────────────────────────────────────────── */}
      <section className="pt-8 sm:pt-10 pb-2 bs-enter">
        <p className="bs-stamp mb-3">The Colophon</p>
        <h1
          className="bs-display text-[2.25rem] sm:text-[3.25rem] lg:text-[4.25rem] leading-[0.98]"
          style={{ color: "var(--ink)" }}
        >
          Sources, methods,
          <br />
          <em className="bs-display-italic">fine print.</em>
        </h1>
        <p
          className="bs-body italic mt-5 max-w-[58ch] text-[1.0625rem]"
          style={{ color: "var(--ink-soft)" }}
        >
          Where each number comes from, what we cache, what&apos;s typed by
          hand, and what to trust. The same notes a printer would set at
          the back of the book.
        </p>
      </section>

      {/* ── Numbered notes ─────────────────────────────────────── */}
      <ol className="mt-8 sm:mt-10 border-t border-[var(--ink)]">
        {notes.map((note, idx) => {
          const dispatchNumber = String(idx + 1).padStart(2, "0");
          return (
            <li
              key={note.title}
              className="py-7 sm:py-8 grid grid-cols-[auto_1fr] gap-x-5 sm:gap-x-8 border-b border-[var(--color-border)]"
            >
              <span
                className="bs-display bs-numerals text-2xl sm:text-3xl leading-none pt-1 tabular-nums"
                style={{ color: "var(--ink-soft)" }}
              >
                {dispatchNumber}
              </span>
              <div className="min-w-0">
                <h2
                  className="bs-display-italic text-[1.375rem] sm:text-[1.75rem] leading-[1.15] mb-3"
                  style={{ color: "var(--ink)" }}
                >
                  {note.title}
                </h2>
                <div
                  className="bs-body text-[15px] leading-[1.6] space-y-3 max-w-[62ch]"
                  style={{ color: "var(--ink)" }}
                >
                  {note.body}
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      {/* ── Disclaimer band ────────────────────────────────────── */}
      <section
        className="mt-10 mb-4 py-6 px-5 sm:px-7 border-t-2 border-b-2 border-[var(--ink)]"
      >
        <p className="bs-stamp mb-3">Disclaimer</p>
        <p
          className="bs-caption italic text-[12.5px] leading-[1.6] max-w-[72ch]"
          style={{ color: "var(--ink-soft)" }}
        >
          BuyVEQT is a community-built informational resource. It is not
          affiliated with, endorsed by, or sponsored by Vanguard Investments
          Canada Inc. or any other financial institution. Nothing on this
          site constitutes financial, investment, tax, or legal advice. All
          data is provided for informational purposes only and may be
          delayed or inaccurate. Always consult a qualified financial
          advisor before making investment decisions.
        </p>
      </section>
    </InteriorShell>
  );
}
