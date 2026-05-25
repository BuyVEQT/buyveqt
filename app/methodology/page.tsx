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
  /** Anchor id so other pages can deep-link, e.g. `/methodology#sources`. */
  id: string;
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
      id: "about",
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
      // Linked from inside-veqt's methodology card as "Sources →".
      id: "sources",
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
      id: "refresh-cadence",
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
      id: "charts",
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
      id: "manual-data",
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
      id: "distributions",
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
      id: "editorial",
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
      id: "corrections",
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

      {/* ── V2 Masthead ────────────────────────────────────────── */}
      <header className="v2-masthead">
        <div className="v2-masthead__top">
          <span className="ed-stamp">
            The colophon · {notes.length} notes on record · Updated as data changes
          </span>
          <span className="ed-stamp" style={{ color: "var(--ink-mute)" }}>
            {new Intl.DateTimeFormat("en-CA", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            }).format(new Date())}
          </span>
        </div>
        <div className="v2-masthead__lockup">
          <h1 className="ed-display-italic v2-masthead__h1">
            The{" "}
            <em style={{ fontStyle: "italic", fontWeight: 500 }}>
              fine print.
            </em>
          </h1>
          <p className="ed-body v2-masthead__lede">
            Where each number comes from, what we cache, what&apos;s typed
            by hand, and what to trust. The same notes a printer would set
            at the back of the book.
          </p>
        </div>
        <style>{`
          .v2-masthead {
            padding: 26px 0 22px;
          }
          .v2-masthead__top {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            gap: 12px;
            flex-wrap: wrap;
            padding-bottom: 10px;
          }
          .v2-masthead__lockup {
            display: grid;
            grid-template-columns: 1fr;
            gap: 18px;
            padding: 18px 0 8px;
            border-top: 3px solid var(--ink);
            border-bottom: 1px solid var(--ink);
            align-items: end;
          }
          @media (min-width: 720px) {
            .v2-masthead__lockup {
              grid-template-columns: auto 1fr;
              gap: 40px;
              padding: 22px 0 12px;
            }
          }
          .v2-masthead__h1 {
            font-size: clamp(3rem, 8vw, 6rem);
            line-height: 1;
            letter-spacing: -0.035em;
            margin: 0;
            color: var(--ink);
            white-space: nowrap;
          }
          .v2-masthead__lede {
            font-size: clamp(15px, 1.6vw, 17.5px);
            line-height: 1.55;
            color: var(--ink-soft);
            margin: 0;
            max-width: 52ch;
            padding-bottom: 8px;
          }
        `}</style>
      </header>

      {/* ── Numbered notes ─────────────────────────────────────── */}
      <ol className="mt-8 sm:mt-10 border-t border-[var(--ink)]">
        {notes.map((note, idx) => {
          const dispatchNumber = String(idx + 1).padStart(2, "0");
          return (
            <li
              key={note.id}
              id={note.id}
              // scrollMarginTop clears the sticky mobile TopBar (~56px) and
              // gives a small visual buffer so the anchor target doesn't sit
              // flush against the chrome.
              style={{ scrollMarginTop: 80 }}
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
                  className="bs-display text-[1.375rem] sm:text-[1.75rem] leading-[1.15] mb-3"
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

      {/* ── Disclaimer band (V2 dark slab with vermilion rule) ── */}
      <section className="meth-disclaimer">
        <div className="meth-disclaimer__top">
          <span
            className="ed-stamp"
            style={{
              color: "var(--paper-light)",
              background: "var(--stamp)",
              padding: "4px 10px",
              letterSpacing: "0.22em",
            }}
          >
            Disclaimer
          </span>
          <span className="ed-stamp" style={{ color: "rgba(246,239,220,0.55)" }}>
            Read the whole thing
          </span>
        </div>
        <div className="meth-disclaimer__rule" />
        <p className="meth-disclaimer__body">
          BuyVEQT is a community-built informational resource. It is not
          affiliated with, endorsed by, or sponsored by Vanguard
          Investments Canada Inc. or any other financial institution.
          Nothing on this site constitutes financial, investment, tax, or
          legal advice. All data is provided for informational purposes
          only and may be delayed or inaccurate. Always consult a
          qualified financial advisor before making investment decisions.
        </p>
        <style>{`
          .meth-disclaimer {
            margin-top: 40px;
            margin-bottom: 16px;
            padding: 26px 30px 24px;
            background: var(--band-ink);
            color: var(--band-paper);
            border-radius: 18px;
            position: relative;
            overflow: hidden;
          }
          .meth-disclaimer::before {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 3px;
            background: var(--stamp);
          }
          .meth-disclaimer__top {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            gap: 12px;
            flex-wrap: wrap;
          }
          .meth-disclaimer__rule {
            height: 1px;
            background: rgba(246, 239, 220, 0.22);
            margin: 14px 0 18px;
          }
          .meth-disclaimer__body {
            font-family: var(--font-serif);
            font-style: italic;
            font-size: 13.5px;
            line-height: 1.6;
            color: rgba(246, 239, 220, 0.82);
            margin: 0;
            max-width: 72ch;
            padding-left: 14px;
            border-left: 2px solid var(--stamp);
          }
        `}</style>
      </section>
    </InteriorShell>
  );
}
