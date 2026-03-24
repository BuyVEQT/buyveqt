import type { Metadata } from "next";
import PageShell from "@/components/layout/PageShell";
import CalculatorTabs from "@/components/invest/CalculatorTabs";
import { getDailyHistory } from "@/lib/data";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildBreadcrumbSchema, canonicalUrl, SITE_NAME } from "@/lib/seo-config";

export const revalidate = 86400; // 24 hours

export const metadata: Metadata = {
  title: "VEQT Calculators — Historical Returns, DCA, Dividends & TFSA/RRSP",
  description:
    "Free VEQT investment calculators. See what your investment would be worth today, plan DCA contributions, estimate dividend income, and project TFSA/RRSP growth.",
  alternates: { canonical: canonicalUrl("/invest") },
  openGraph: {
    title: "VEQT Investment Calculators",
    description:
      "Historical return calculator, DCA planner, dividend income estimator, and TFSA/RRSP growth projector for VEQT investors.",
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
          { name: "Calculators", path: "/invest" },
        ])}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "VEQT Investment Calculators",
          description:
            "Historical return calculator, DCA planner, dividend income estimator, and TFSA/RRSP growth projector.",
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
      <main className="flex-1 mx-auto w-full max-w-4xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)]">
            VEQT Calculators
          </h1>
          <p className="mt-2 text-[var(--color-text-muted)] max-w-prose">
            Four tools to help you plan, visualize, and understand your VEQT
            investment.
          </p>
        </div>

        <CalculatorTabs history={historyResult} />

        <p className="text-[11px] text-[var(--color-text-muted)] mt-8 max-w-prose">
          These calculators use simplified assumptions for illustration purposes.
          They do not account for all fees, taxes, inflation, or market
          volatility. Past performance does not guarantee future results. Not
          financial advice.
        </p>
      </main>
    </PageShell>
  );
}
