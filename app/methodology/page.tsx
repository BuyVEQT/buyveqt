import type { Metadata } from "next";
import Link from "next/link";
import PageShell from "@/components/layout/PageShell";

export const metadata: Metadata = {
  title: "Methodology & Data Sources — BuyVEQT",
  description:
    "How BuyVEQT sources its data, what's live vs static, and the limitations of the information on this site.",
  openGraph: {
    title: "Methodology & Data Sources — BuyVEQT",
    description:
      "Transparency about how BuyVEQT sources and presents its data.",
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

        <Section title="Live Market Data">
          <p>
            Price quotes, daily change, 52-week ranges, volume, and other
            real-time market data are sourced from Yahoo Finance via the{" "}
            <code className="text-xs bg-[var(--color-base)] px-1.5 py-0.5 rounded border border-[var(--color-border)]">
              yahoo-finance2
            </code>{" "}
            library. Data is cached and refreshed approximately every 30
            minutes.
          </p>
          <p>
            Market data may be delayed and should not be used for trading
            decisions. Always verify prices with your brokerage before placing
            trades.
          </p>
        </Section>

        <Section title="Historical Performance Charts">
          <p>
            Historical price data for VEQT and comparison ETFs is also sourced
            from Yahoo Finance. Charts show adjusted close prices (accounting
            for distributions and splits).
          </p>
          <p>
            Comparison charts display normalized performance (percentage change
            from a common start date), which allows meaningful comparison
            between funds with different unit prices. The available time ranges
            are limited to the shortest-lived fund in the comparison.
          </p>
          <p>
            <strong>Past performance does not guarantee future results.</strong>
          </p>
        </Section>

        <Section title="Static Fund Metadata">
          <p>
            Fund-level information such as MER, AUM, number of holdings,
            geographic allocation, underlying ETFs, and sector breakdowns are
            manually compiled from official fund documents, Vanguard&apos;s
            website, and regulatory filings (Fund Facts).
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
            Yield calculations (trailing 12-month yield) are computed by
            summing the last four quarterly distributions and dividing by the
            current unit price. This is a standard trailing yield calculation
            and does not predict future distributions.
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
            for improvement, please open an issue or pull request on the{" "}
            <a
              href="https://github.com/mattdrapkin/buyveqt"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--color-brand)] hover:text-[var(--color-brand-dark)] underline"
            >
              GitHub repository
            </a>
            . This is a community project and contributions are welcome.
          </p>
        </Section>

        {/* Disclaimer */}
        <div className="mt-4 rounded-lg bg-[var(--color-base)] border border-[var(--color-border)] p-4">
          <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
            <strong>Disclaimer:</strong> BuyVEQT.com is not affiliated with
            Vanguard Investments Canada Inc. All information is provided for
            educational purposes only and should not be construed as financial
            advice. Past performance does not guarantee future results. Always
            do your own research and consult a qualified professional before
            making investment decisions.
          </p>
        </div>
      </main>
    </PageShell>
  );
}
