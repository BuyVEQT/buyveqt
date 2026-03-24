import type { Metadata } from "next";
import PageShell from "@/components/layout/PageShell";
import InvestCalculator from "@/components/invest/InvestCalculator";
import { getDailyHistory } from "@/lib/data";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildBreadcrumbSchema, canonicalUrl } from "@/lib/seo-config";

export const revalidate = 86400; // 24 hours

export const metadata: Metadata = {
  title: "If You Invested in VEQT — Historical Return Calculator",
  description:
    "See what your VEQT investment would be worth today. Enter an amount and start date to calculate historical returns with real price data.",
  alternates: { canonical: canonicalUrl("/invest") },
  openGraph: {
    title: "If You Invested in VEQT",
    description:
      "Calculate what a VEQT investment would be worth today using real historical prices.",
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
          { name: "If You Invested", path: "/invest" },
        ])}
      />
      <main className="flex-1 mx-auto w-full max-w-3xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)]">
            If You Invested in VEQT
          </h1>
          <p className="mt-2 text-[var(--color-text-muted)] max-w-prose">
            See what a lump sum or monthly investment in VEQT would be worth
            today, using real historical prices.
          </p>
        </div>

        <InvestCalculator history={historyResult} />
      </main>
    </PageShell>
  );
}
