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
    icon: (
      <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    id: "dca",
    label: "DCA Planner",
    shortLabel: "DCA",
    description: "Plan regular monthly contributions and see projected growth",
    icon: (
      <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor">
        <path d="M12.577 4.878a.75.75 0 01.919-.53l4.78 1.281a.75.75 0 01.531.919l-1.281 4.78a.75.75 0 01-1.449-.387l.81-3.022a19.407 19.407 0 00-5.594 5.203.75.75 0 01-1.139.093L7 10.06l-4.72 4.72a.75.75 0 01-1.06-1.06l5.25-5.25a.75.75 0 011.06 0l3.074 3.073a20.923 20.923 0 015.545-4.931l-3.042.815a.75.75 0 01-.53-.919z" />
      </svg>
    ),
  },
  {
    id: "dividends",
    label: "Dividend Income",
    shortLabel: "Dividends",
    description: "Estimate annual distribution income from your portfolio",
    icon: (
      <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor">
        <path d="M10.75 10.818v2.614A3.13 3.13 0 0011.888 13c.482-.315.612-.648.612-.875 0-.227-.13-.56-.612-.875a3.13 3.13 0 00-1.138-.432zM8.33 8.62c.053.055.115.11.184.164.208.16.46.284.736.363V6.603c-.481.085-.91.296-1.18.562-.268.265-.383.553-.383.82 0 .266.115.555.383.82a2.42 2.42 0 00.26.216z" />
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-6a.75.75 0 01.75.75v.316a3.78 3.78 0 011.653.713c.426.33.744.74.925 1.2a.75.75 0 01-1.395.55 1.97 1.97 0 00-.479-.603A2.3 2.3 0 0010.75 6.5v2.786c.862.212 1.625.6 2.183 1.163C13.5 11.016 13.75 11.65 13.75 12.375c0 .726-.25 1.358-.817 1.926-.558.563-1.321.951-2.183 1.163v.286a.75.75 0 01-1.5 0v-.286c-.862-.212-1.625-.6-2.183-1.163C6.5 13.734 6.25 13.1 6.25 12.375a.75.75 0 011.5 0c0 .267.115.556.383.82.26.259.657.464 1.117.558V10.5a.75.75 0 01-.75-.75V8.375c0-.726.25-1.358.817-1.926.558-.563 1.321-.951 2.183-1.163V5A.75.75 0 0110 4z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    id: "tfsa-rrsp",
    label: "TFSA / RRSP",
    shortLabel: "TFSA",
    description: "Project how your registered account could grow over time",
    icon: (
      <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor">
        <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
      </svg>
    ),
  },
] as const;

type TabId = (typeof TABS)[number]["id"];

interface CalculatorTabsProps {
  history: HistoricalData | null;
}

function CalculatorTabsInner({ history }: CalculatorTabsProps) {
  const searchParams = useSearchParams();

  const rawParams: Record<string, string> = {};
  searchParams.forEach((v, k) => { rawParams[k] = v; });
  const urlTab = inferTab(rawParams);
  const initialTab: TabId = TABS.some((t) => t.id === urlTab)
    ? (urlTab as TabId)
    : "historical";
  const [activeTab, setActiveTab] = useState<TabId>(initialTab);

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

  const activeTabData = TABS.find((t) => t.id === activeTab);

  return (
    <div>
      {/* Tab bar — editorial card with icons */}
      <div className="card-editorial p-1.5 mb-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-all cursor-pointer ${
                  isActive
                    ? "bg-[var(--color-brand)] text-white shadow-sm"
                    : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-card-hover)]"
                }`}
              >
                <span className={`shrink-0 ${isActive ? "text-white/80" : "text-[var(--color-accent)]"}`}>
                  {tab.icon}
                </span>
                <span className="sm:hidden">{tab.shortLabel}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active tab description */}
      {activeTabData && (
        <p className="text-sm text-[var(--color-text-muted)] mb-6">
          {activeTabData.description}
        </p>
      )}

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
        <div className="card-editorial p-1.5 mb-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            {[1,2,3,4].map(i => (
              <div key={i} className="skeleton h-10 rounded-lg" />
            ))}
          </div>
        </div>
      }
    >
      <CalculatorTabsInner history={history} />
    </Suspense>
  );
}
