"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import InvestCalculator from "./InvestCalculator";
import DCACalculator from "@/components/calculators/DCACalculator";
import DividendCalculator from "@/components/calculators/DividendCalculator";
import TFSARRSPCalculator from "@/components/calculators/TFSARRSPCalculator";
import FIRECalculator from "@/components/calculators/FIRECalculator";
import CalculatorFrame from "./CalculatorFrame";
import type { HistoricalData } from "@/lib/data/types";
import type { VolatilityStats } from "@/lib/data/volatility";
import { inferTab } from "@/lib/share-params";

const TABS = [
  {
    id: "historical",
    label: "Lookback",
    frameTitle: "What it would have been",
    frameSubhead:
      "Backtest against real VEQT history — pick a past date and see what a lump sum or monthly plan would have grown into today.",
  },
  {
    id: "dca",
    label: "DCA",
    frameTitle: "What steady contributions become",
    frameSubhead:
      "Forward projection — set a monthly amount, a horizon, and an assumed return rate, see what it could compound into.",
  },
  {
    id: "dividends",
    label: "Dividends",
    frameTitle: "What your stake pays",
    frameSubhead:
      "Annual distribution income from a VEQT position, projected at today's yield.",
  },
  {
    id: "tfsa-rrsp",
    label: "TFSA / RRSP",
    frameTitle: "What grows tax-free",
    frameSubhead:
      "Project a TFSA or RRSP balance over the long horizon, with VEQT-typical returns.",
  },
  {
    id: "fire",
    label: "FIRE",
    frameTitle: "When the fund buys you out",
    frameSubhead:
      "Your financial independence number, and how many years of saving stand between you and it.",
  },
] as const;

export type TabId = (typeof TABS)[number]["id"];

interface CalculatorTabsProps {
  history: HistoricalData | null;
  volatilityStats: VolatilityStats | null;
}

function CalculatorTabsInner({ history, volatilityStats }: CalculatorTabsProps) {
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
    const newUrl = qs ? `/calculators?${qs}` : "/calculators";
    window.history.replaceState(null, "", newUrl);
  }, [activeTab, searchParams]);

  const activeTabData = TABS.find((t) => t.id === activeTab);

  return (
    <div>
      {/* Tab bar — broadsheet selector, scrolls horizontally on mobile */}
      <div
        className="border-b border-[var(--ink)] mb-2"
        role="tablist"
        aria-label="Calculator sections"
      >
        <div
          className="flex sm:grid sm:grid-cols-5 gap-0 overflow-x-auto hide-scrollbar snap-x snap-mandatory"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab.id)}
                title={tab.frameSubhead}
                className={`
                  flex items-center justify-center sm:justify-start text-left
                  px-4 py-3 sm:px-5 sm:py-4 cursor-pointer shrink-0 snap-start min-h-[52px]
                  border-t-2 transition-colors
                  ${isActive
                    ? "border-[var(--stamp)]"
                    : "border-transparent hover:bg-[var(--color-card-hover)]"}
                `}
                style={{
                  backgroundColor: isActive ? "var(--paper)" : "transparent",
                }}
              >
                <span
                  className="bs-display text-[15px] sm:text-[17px] leading-none whitespace-nowrap"
                  style={{
                    color: isActive ? "var(--ink)" : "var(--ink-soft)",
                  }}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {activeTabData && (
        <>
          {/* Active tab subhead — surfaces what the active calc does
              immediately under the tab row, instead of forcing the user
              to scroll into the frame to read it. Hover-tooltip on each
              tab button preview the same line for inactive tabs. */}
          <p
            className="bs-caption italic mt-3 mb-2 max-w-[60ch] text-[13px] sm:text-[14px]"
            style={{ color: "var(--ink-soft)" }}
          >
            {activeTabData.frameSubhead}
          </p>

          <CalculatorFrame
            stamp={activeTabData.label}
            title={activeTabData.frameTitle}
          >
            {activeTab === "historical" && (
              <InvestCalculator
                history={history}
                onSelectTab={(id) => {
                  if (TABS.some((t) => t.id === id)) {
                    setActiveTab(id as TabId);
                  }
                }}
              />
            )}
            {activeTab === "dca" && <DCACalculator volatilityStats={volatilityStats} />}
            {activeTab === "dividends" && <DividendCalculator />}
            {activeTab === "tfsa-rrsp" && (
              <TFSARRSPCalculator volatilityStats={volatilityStats} />
            )}
            {activeTab === "fire" && <FIRECalculator volatilityStats={volatilityStats} />}
          </CalculatorFrame>
        </>
      )}
    </div>
  );
}

export default function CalculatorTabs({ history, volatilityStats }: CalculatorTabsProps) {
  return (
    <Suspense
      fallback={
        <div className="border-b border-[var(--ink)] mb-2">
          <div className="flex sm:grid sm:grid-cols-5 gap-0 overflow-x-auto hide-scrollbar">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="skeleton h-[52px] min-w-[120px] shrink-0"
                style={{ borderRadius: 0 }}
              />
            ))}
          </div>
        </div>
      }
    >
      <CalculatorTabsInner history={history} volatilityStats={volatilityStats} />
    </Suspense>
  );
}
