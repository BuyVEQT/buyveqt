import type { Metadata } from "next";
import PageShell from "@/components/layout/PageShell";
import CompareContent from "@/components/compare/CompareContent";

export const metadata: Metadata = {
  title: "Compare VEQT vs XEQT vs ZEQT — BuyVEQT",
  description:
    "Side-by-side comparison of Canada's top all-in-one ETFs: VEQT, XEQT, ZEQT, VGRO, and VFV. Compare MER, performance, holdings, and geographic allocation.",
  openGraph: {
    title: "Compare VEQT vs XEQT vs ZEQT — BuyVEQT",
    description:
      "Side-by-side comparison of Canada's top all-in-one ETFs.",
  },
};

export default function ComparePage() {
  return (
    <PageShell>
      <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)]">
            Compare VEQT to Other All-in-One ETFs
          </h1>
          <p className="mt-2 text-[var(--color-text-muted)] max-w-prose">
            See how VEQT stacks up against XEQT, ZEQT, VGRO, and VFV — side by
            side.
          </p>
        </div>

        <CompareContent />
      </main>
    </PageShell>
  );
}
