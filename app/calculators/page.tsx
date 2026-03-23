import type { Metadata } from "next";
import PageShell from "@/components/layout/PageShell";
import DCACalculator from "@/components/calculators/DCACalculator";
import DividendCalculator from "@/components/calculators/DividendCalculator";
import TFSARRSPCalculator from "@/components/calculators/TFSARRSPCalculator";

export const metadata: Metadata = {
  title: "VEQT Calculators — DCA, Dividend Income, TFSA/RRSP Growth | BuyVEQT",
  description:
    "Free VEQT investment calculators. Estimate growth with dollar-cost averaging, project dividend income, and plan your TFSA or RRSP contributions.",
  openGraph: {
    title:
      "VEQT Calculators — DCA, Dividend Income, TFSA/RRSP Growth | BuyVEQT",
    description:
      "Free VEQT investment calculators. Estimate growth with dollar-cost averaging, project dividend income, and plan your TFSA or RRSP contributions.",
  },
};

export default function CalculatorsPage() {
  return (
    <PageShell>
      <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)]">
            VEQT Calculators
          </h1>
          <p className="mt-2 text-[var(--color-text-muted)] max-w-prose">
            Simple tools to help you plan and visualize your VEQT investment.
          </p>
        </div>

        {/* Page disclaimer */}
        <p className="text-[11px] text-[var(--color-text-muted)] mb-8 max-w-prose">
          These calculators use simplified assumptions for illustration purposes.
          They do not account for fees, taxes, inflation, or market volatility.
          Not financial advice.
        </p>

        {/* Calculators */}
        <div className="space-y-8">
          <DCACalculator />
          <DividendCalculator />
          <TFSARRSPCalculator />
        </div>
      </main>
    </PageShell>
  );
}
