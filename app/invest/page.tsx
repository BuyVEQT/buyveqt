import type { Metadata } from "next";
import Link from "next/link";
import PageShell from "@/components/layout/PageShell";
import InvestCalculator from "@/components/invest/InvestCalculator";
import { getDailyHistory } from "@/lib/data";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildBreadcrumbSchema, canonicalUrl, SITE_NAME } from "@/lib/seo-config";

export const revalidate = 86400; // 24 hours

export const metadata: Metadata = {
  title: "If You Invested in VEQT — Historical Return Calculator",
  description:
    "See what your VEQT investment would be worth today. Enter an amount and start date to calculate historical returns with real adjusted-close price data since 2019.",
  alternates: { canonical: canonicalUrl("/invest") },
  openGraph: {
    title: "If You Invested in VEQT — Calculator",
    description:
      "Calculate what a VEQT investment would be worth today using real historical prices. Lump sum and DCA modes.",
    url: canonicalUrl("/invest"),
  },
};

export default async function InvestPage() {
  let historyResult = null;
  try {
    historyResult = await getDailyHistory("VEQT", "full");
  } catch {
    // Will show DataUnavailable in the component
  }

  return (
    <PageShell>
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Calculator", path: "/invest" },
        ])}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "VEQT Historical Return Calculator",
          description:
            "Calculate what a lump sum or monthly VEQT investment would be worth today using real historical price data.",
          url: canonicalUrl("/invest"),
          applicationCategory: "FinanceApplication",
          operatingSystem: "Any",
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "CAD",
          },
          publisher: {
            "@type": "Organization",
            name: SITE_NAME,
          },
        }}
      />
      <main className="flex-1 mx-auto w-full max-w-3xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)]">
            If You Invested in VEQT
          </h1>
          <p className="mt-2 text-[var(--color-text-muted)] max-w-prose">
            See what a lump sum or monthly investment in VEQT would be worth
            today, using real historical adjusted-close prices that account for
            reinvested dividends.
          </p>
        </div>

        <InvestCalculator history={historyResult} />

        {/* SEO content below calculator */}
        <section className="mt-12 pt-8 border-t border-[var(--color-border)] space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
              How This Calculator Works
            </h2>
            <p className="text-sm text-[var(--color-text-muted)] leading-relaxed max-w-prose">
              This calculator uses VEQT&apos;s actual historical adjusted close
              prices — which account for distributions (dividends) being
              reinvested. Choose a start date and an amount, and it shows
              exactly what your investment would be worth today. The{" "}
              <strong className="text-[var(--color-text-secondary)]">
                lump sum
              </strong>{" "}
              mode shows a one-time investment, while{" "}
              <strong className="text-[var(--color-text-secondary)]">
                monthly (DCA)
              </strong>{" "}
              mode simulates contributing a fixed amount on the first trading
              day of each month.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
              Share Your Results
            </h2>
            <p className="text-sm text-[var(--color-text-muted)] leading-relaxed max-w-prose">
              The URL in your browser bar updates as you change inputs. Copy
              and share it — anyone who opens the link will see the exact same
              calculation.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 text-sm">
            <Link
              href="/learn/getting-started-with-veqt"
              className="text-[var(--color-brand)] hover:text-[var(--color-brand-dark)] font-medium transition-colors"
            >
              Getting started with VEQT &rarr;
            </Link>
            <Link
              href="/compare"
              className="text-[var(--color-brand)] hover:text-[var(--color-brand-dark)] font-medium transition-colors"
            >
              Compare VEQT vs other ETFs &rarr;
            </Link>
            <Link
              href="/distributions"
              className="text-[var(--color-brand)] hover:text-[var(--color-brand-dark)] font-medium transition-colors"
            >
              Distribution history &rarr;
            </Link>
          </div>
        </section>
      </main>
    </PageShell>
  );
}
