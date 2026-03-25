import type { Metadata } from "next";
import Link from "next/link";
import PageShell from "@/components/layout/PageShell";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildBreadcrumbSchema, canonicalUrl } from "@/lib/seo-config";

export const metadata: Metadata = {
  title: "Data Sources & Methodology",
  description:
    "How BuyVEQT sources its market data. Transparency about data providers, update frequency, and calculation methods.",
  alternates: { canonical: canonicalUrl("/methodology") },
  openGraph: {
    title: "Methodology & Data Sources",
    description:
      "Transparency about how BuyVEQT sources and presents its data.",
    url: canonicalUrl("/methodology"),
  },
};

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-8">
      <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-3">
        {title}
      </h2>
      <div className="text-sm text-[var(--color-text-secondary)] leading-relaxed space-y-3">
        {children}
      </div>
    </section>
  );
}

export default function MethodologyPage() {
  return (
    <PageShell>
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Methodology", path: "/methodology" },
        ])}
      />
      <main className="flex-1 mx-auto w-full max-w-3xl px-4 py-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] mb-2">
          Methodology & Data Sources
        </h1>
        <p className="text-[var(--color-text-secondary)] mb-8">
          Transparency about how this site works, where the data comes from, and
          what its limitations are.
        </p>

        <Section title="About This Site">
          <p>
            BuyVEQT.com is an unofficial, community-driven information hub for
            the Vanguard All-Equity ETF Portfolio (VEQT). It is not affiliated
            with, endorsed by, or connected to Vanguard Investments Canada Inc.
            or any other financial institution.
          </p>
          <p>
            The site is designed to make publicly available information about
            VEQT more accessible and easier to understand for Canadian
            investors.
          </p>
        </Section>

        <Section title="Data Sources">
          <p>
            Live market data is sourced from two providers in a resilient
            fallback chain:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong>Alpha Vantage</strong> (primary source for VEQT) — provides
              real-time quotes and historical price data via their financial
              data API.
            </li>
            <li>
              <strong>Yahoo Finance</strong> (primary for comparison funds,
              fallback for VEQT) — provides quotes and historical data via the{" "}
              <code className="text-xs bg-[var(--color-base)] px-1.5 py-0.5 rounded border border-[var(--color-border)]">
                yahoo-finance2
              </code>{" "}
              library.
            </li>
          </ul>
          <p>
            Every successful data fetch is cached locally so the site can serve
            the last known good data if both providers are temporarily
            unavailable. The &ldquo;Last updated&rdquo; timestamp and source
            label shown on each page indicate exactly when data was fetched and
            from which provider.
          </p>
        </Section>

        <Section title="Refresh Frequency">
          <p>
            Data refreshes at different intervals depending on type:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong>Price quotes:</strong> every ~15 minutes via ISR caching
            </li>
            <li>
              <strong>Daily historical data:</strong> every ~24 hours (yesterday&apos;s
              close doesn&apos;t change)
            </li>
            <li>
              <strong>Monthly historical data:</strong> every ~7 days
            </li>
          </ul>
          <p>
            Market data may be delayed and should not be used for trading
            decisions. Always verify prices with your brokerage before placing
            trades.
          </p>
        </Section>

        <Section title="Historical Performance Charts">
          <p>
            Charts show adjusted close prices (accounting for distributions and
            splits). Comparison charts display normalized performance
            (percentage change from a common start date), which allows
            meaningful comparison between funds with different unit prices.
          </p>
          <p>
            <strong>Past performance does not guarantee future results.</strong>
          </p>
        </Section>

        <Section title="Static Fund Metadata">
          <p>
            Fund-level information such as MER, AUM, number of holdings,
            geographic allocation, underlying ETFs, and sector breakdowns are
            manually compiled from official fund documents, provider websites,
            and regulatory filings (Fund Facts).
          </p>
          <p>
            This data is updated periodically but is not live. There may be a
            lag between when a fund provider updates their official documents
            and when this site reflects those changes.
          </p>
          <p>
            <strong>MER note:</strong> Vanguard reduced VEQT&apos;s management
            fee from 0.22% to 0.17% in November 2025. The official MER (which
            includes operating expenses and taxes) was last reported as 0.24%
            based on a prior fiscal year. The effective MER is expected to be
            approximately 0.19%&ndash;0.20% once recalculated. This site
            displays &ldquo;~0.20%*&rdquo; with a footnote to reflect this
            pending update.
          </p>
        </Section>

        <Section title="Distribution Data">
          <p>
            Distribution history is compiled from Vanguard&apos;s official
            distribution announcements. Distribution amounts, ex-dividend
            dates, and payment dates are recorded as published.
          </p>
          <p>
            Yield calculations (trailing 12-month yield) are computed by using
            the most recent annual distribution and dividing by the current unit
            price. This is a standard trailing yield calculation and does not
            predict future distributions.
          </p>
        </Section>

        <Section title="Educational Content">
          <p>
            All articles in the{" "}
            <Link
              href="/learn"
              className="text-[var(--color-brand)] hover:text-[var(--color-brand-dark)] underline"
            >
              Learn
            </Link>{" "}
            section are educational and informational only. They are written to
            help Canadians understand how VEQT and all-in-one ETFs work. They
            do not constitute financial advice, tax advice, or investment
            recommendations.
          </p>
          <p>
            Tax information is general in nature and may not apply to your
            specific situation. Tax laws change frequently. Always consult a
            qualified tax professional for advice specific to your
            circumstances.
          </p>
        </Section>

        <Section title="Contact & Corrections">
          <p>
            If you notice an error, outdated information, or have suggestions
            for improvement, reach out on{" "}
            <a
              href="https://www.reddit.com/r/JustBuyVEQT/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--color-brand)] hover:text-[var(--color-brand-dark)] underline"
            >
              r/JustBuyVEQT
            </a>
            . This is a community project and contributions are welcome.
          </p>
        </Section>

        {/* Disclaimer */}
        <div className="mt-4 rounded-lg bg-[var(--color-base)] border border-[var(--color-border)] p-4">
          <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
            <strong>Disclaimer:</strong> BuyVEQT is a community-built
            informational resource and is not affiliated with, endorsed by, or
            sponsored by Vanguard Investments Canada Inc. or any other financial
            institution. Nothing on this site constitutes financial, investment,
            tax, or legal advice. All data is provided for informational
            purposes only and may be delayed or inaccurate. Always consult a
            qualified financial advisor before making investment decisions.
          </p>
        </div>
      </main>
    </PageShell>
  );
}
