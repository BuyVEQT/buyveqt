"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import InvestCalculator from "./InvestCalculator";
import DCACalculator from "@/components/calculators/DCACalculator";
import DividendCalculator from "@/components/calculators/DividendCalculator";
import TFSARRSPCalculator from "@/components/calculators/TFSARRSPCalculator";
import FIRECalculator from "@/components/calculators/FIRECalculator";
import CalculatorShell from "./CalculatorShell";
import PinnedScenariosBar from "./PinnedScenariosBar";
import type { HistoricalData } from "@/lib/data/types";
import type { VolatilityStats } from "@/lib/data/volatility";
import { inferTab } from "@/lib/share-params";
import type { Handoff } from "@/lib/calculator-handoffs";
import { usePinnedScenarios, type NewPin } from "@/lib/usePinnedScenarios";

interface TabSpec {
  id: "historical" | "dca" | "dividends" | "tfsa-rrsp" | "fire";
  /** Pill icon glyph. */
  icon: string;
  /** Small-caps tab label. */
  label: string;
  /** Fraunces full name displayed under the label. */
  name: string;
  /** Subhead surfaced under the active tab. */
  sub: string;
}

const TABS: readonly TabSpec[] = [
  {
    id: "historical",
    icon: "∫",
    label: "Lookback",
    name: "The Lookback",
    sub: "If you'd bought $X at launch — what would it be now?",
  },
  {
    id: "dca",
    icon: "∥",
    label: "DCA",
    name: "The Drip-Feed",
    sub: "$X per month, for Y years, at an assumed return rate.",
  },
  {
    id: "dividends",
    icon: "↻",
    label: "DRIP",
    name: "The Reinvestment",
    sub: "What VEQT's distributions actually add, projected at today's yield.",
  },
  {
    id: "tfsa-rrsp",
    icon: "☂",
    label: "Shelter",
    name: "The Shelter",
    sub: "TFSA vs RRSP vs taxable — project tax-sheltered growth.",
  },
  {
    id: "fire",
    icon: "Ω",
    label: "Exit",
    name: "The Exit",
    sub: "Your financial-independence number, and the years until you reach it.",
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
  searchParams.forEach((v, k) => {
    rawParams[k] = v;
  });
  const urlTab = inferTab(rawParams);
  const initialTab: TabId = TABS.some((t) => t.id === urlTab)
    ? (urlTab as TabId)
    : "historical";
  const [activeTab, setActiveTab] = useState<TabId>(initialTab);

  // Sync activeTab → URL. Read window.location.search directly because
  // useSearchParams doesn't observe replaceState, so handoff URL writes
  // would otherwise be clobbered. Bail early if URL already reflects state.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const current = new URLSearchParams(window.location.search);
    const currentTab = current.get("tab") || "historical";
    if (currentTab === activeTab) return;

    if (activeTab === "historical") {
      current.delete("tab");
    } else {
      current.set("tab", activeTab);
    }
    const qs = current.toString();
    const newUrl = qs ? `/calculators?${qs}` : "/calculators";
    window.history.replaceState(null, "", newUrl);
  }, [activeTab]);

  // Cross-calc handoff: write params + switch tab. Each calc unmounts on
  // tab change, so the destination's mount effect picks up fresh params.
  const handleHandoff = useCallback((h: Handoff) => {
    if (!TABS.some((t) => t.id === h.tab)) return;
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(h.params)) {
      sp.set(k, String(v));
    }
    if (h.tab !== "historical") sp.set("tab", h.tab);
    const newUrl = `/calculators?${sp.toString()}`;
    window.history.replaceState(null, "", newUrl);
    setActiveTab(h.tab as TabId);
  }, []);

  const { scenarios, pin, unpin, clear } = usePinnedScenarios();

  const handlePin = useCallback(
    (input: NewPin) => {
      pin(input);
    },
    [pin]
  );

  const activeTabData = TABS.find((t) => t.id === activeTab) ?? TABS[0];

  return (
    <div>
      {/* ── Pill row ── */}
      <div
        className="calc-pills"
        role="tablist"
        aria-label="Calculator sections"
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(tab.id)}
              title={tab.sub}
              className="calc-pill"
              data-active={isActive ? "true" : "false"}
            >
              <span
                className="calc-pill__icon"
                data-active={isActive ? "true" : "false"}
                aria-hidden
              >
                {tab.icon}
              </span>
              <span className="calc-pill__copy">
                <span
                  className="ed-label"
                  style={{
                    color: isActive
                      ? "rgba(246,239,220,0.55)"
                      : "var(--ink-mute)",
                  }}
                >
                  {tab.label}
                </span>
                <span
                  className="ed-display-italic calc-pill__name"
                  style={{
                    color: isActive ? "var(--paper)" : "var(--ink)",
                  }}
                >
                  {tab.name}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <PinnedScenariosBar
        scenarios={scenarios}
        onLoad={handleHandoff}
        onRemove={unpin}
        onClear={clear}
      />

      {/* ── Active calc inside the dark shell ── */}
      <CalculatorShell
        icon={activeTabData.icon}
        label={activeTabData.label}
        name={activeTabData.name}
        sub={activeTabData.sub}
      >
        {activeTab === "historical" && (
          <InvestCalculator
            history={history}
            onHandoff={handleHandoff}
            onPin={handlePin}
          />
        )}
        {activeTab === "dca" && (
          <DCACalculator
            volatilityStats={volatilityStats}
            onHandoff={handleHandoff}
            onPin={handlePin}
          />
        )}
        {activeTab === "dividends" && <DividendCalculator onPin={handlePin} />}
        {activeTab === "tfsa-rrsp" && (
          <TFSARRSPCalculator
            volatilityStats={volatilityStats}
            onHandoff={handleHandoff}
            onPin={handlePin}
          />
        )}
        {activeTab === "fire" && (
          <FIRECalculator
            volatilityStats={volatilityStats}
            onPin={handlePin}
          />
        )}
      </CalculatorShell>
    </div>
  );
}

export default function CalculatorTabs({ history, volatilityStats }: CalculatorTabsProps) {
  return (
    <Suspense
      fallback={
        <div
          className="calc-pills"
          aria-hidden
          style={{ pointerEvents: "none" }}
        >
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="skeleton"
              style={{ height: 72, borderRadius: 16, minWidth: 140 }}
            />
          ))}
        </div>
      }
    >
      <CalculatorTabsInner history={history} volatilityStats={volatilityStats} />
    </Suspense>
  );
}
