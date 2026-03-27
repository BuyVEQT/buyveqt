"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import InvestCalculator from "./InvestCalculator";
import DCACalculator from "@/components/calculators/DCACalculator";
import DividendCalculator from "@/components/calculators/DividendCalculator";
import TFSARRSPCalculator from "@/components/calculators/TFSARRSPCalculator";
import type { HistoricalData } from "@/lib/data/types";
import { inferTab } from "@/lib/share-params";

const TABS = [
  {
    id: "historical",
    label: "If You Invested",
    shortLabel: "Historical",
    description: "See what a past VEQT investment would be worth today",
  },
  {
    id: "dca",
    label: "DCA Planner",
    shortLabel: "DCA",
    description: "Plan regular monthly contributions",
  },
  {
    id: "dividends",
    label: "Dividend Income",
    shortLabel: "Dividends",
    description: "Estimate annual distribution income",
  },
  {
    id: "tfsa-rrsp",
    label: "TFSA / RRSP",
    shortLabel: "TFSA",
    description: "Project registered account growth",
  },
] as const;

type TabId = (typeof TABS)[number]["id"];

interface CalculatorTabsProps {
  history: HistoricalData | null;
}

function CalculatorTabsInner({ history }: CalculatorTabsProps) {
  const searchParams = useSearchParams();

  // Read initial tab from URL — supports explicit ?tab=, ?t=, or inference
  // from other keys (e.g. ?o=500 → dca tab, ?y=1.8 → dividends)
  const rawParams: Record<string, string> = {};
  searchParams.forEach((v, k) => { rawParams[k] = v; });
  const urlTab = inferTab(rawParams);
  const initialTab: TabId = TABS.some((t) => t.id === urlTab)
    ? (urlTab as TabId)
    : "historical";
  const [activeTab, setActiveTab] = useState<TabId>(initialTab);

  // Update URL when tab changes (without full navigation)
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (activeTab === "historical") {
      params.delete("tab");
    } else {
      params.set("tab", activeTab);
    }
    const qs = params.toString();
    const newUrl = qs ? `/invest?${qs}` : "/invest";
    window.history.replaceState(null, "", newUrl);
  }, [activeTab, searchParams]);

  return (
    <div>
      {/* Tab bar */}
      <div className="flex gap-1 rounded-xl bg-[var(--color-base)] p-1 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 min-w-0 rounded-lg px-3 py-2.5 text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-white text-[var(--color-text-primary)] shadow-sm"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            {/* Show short label on mobile, full label on desktop */}
            <span className="sm:hidden">{tab.shortLabel}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab description */}
      <p className="text-xs text-[var(--color-text-muted)] mt-2 mb-5">
        {TABS.find((t) => t.id === activeTab)?.description}
      </p>

      {/* Tab content */}
      <div>
        {activeTab === "historical" && (
          <InvestCalculator history={history} />
        )}
        {activeTab === "dca" && <DCACalculator />}
        {activeTab === "dividends" && <DividendCalculator />}
        {activeTab === "tfsa-rrsp" && <TFSARRSPCalculator />}
      </div>
    </div>
  );
}

export default function CalculatorTabs({ history }: CalculatorTabsProps) {
  return (
    <Suspense
      fallback={
        <div className="animate-pulse rounded-xl bg-[var(--color-base)] h-12 mb-5" />
      }
    >
      <CalculatorTabsInner history={history} />
    </Suspense>
  );
}
