"use client";

import { useState } from "react";
import type { ChartPeriod } from "@/lib/types";
import MatchupPresets from "./MatchupPresets";
import FundPicker from "./FundPicker";
import PerformanceChart from "./PerformanceChart";
import CompareGap from "./CompareGap";
import StatsTable from "./StatsTable";
import Verdict from "./Verdict";
import AllocationBars from "./AllocationBars";
import WhoThisSuits from "./WhoThisSuits";
import FAQSection from "./FAQSection";

interface CompareContentProps {
  initialFunds?: string[];
}

export default function CompareContent({ initialFunds }: CompareContentProps) {
  const [selected, setSelected] = useState<string[]>(
    initialFunds || ["VEQT.TO", "XEQT.TO"]
  );
  // Period is shared so The Gap and the chart move in lockstep.
  const [period, setPeriod] = useState<ChartPeriod>("1Y");

  const handleToggle = (ticker: string) => {
    setSelected((prev) =>
      prev.includes(ticker)
        ? prev.filter((t) => t !== ticker)
        : [...prev, ticker]
    );
  };

  // Preset clicks replace the whole selection at once. We always keep
  // VEQT pinned at slot 0 so The Gap reads "VEQT minus other".
  const handlePreset = (funds: string[]) => {
    setSelected(funds);
  };

  return (
    <div className="space-y-7 sm:space-y-9">
      {/* ── Pickers ── */}
      <div className="space-y-5">
        <MatchupPresets selected={selected} onSelect={handlePreset} />
        <FundPicker selected={selected} onToggle={handleToggle} />
      </div>

      {/* ── Performance + Gap ── */}
      <PerformanceChart
        selectedFunds={selected}
        initialPeriod={period}
        onPeriodChange={setPeriod}
      />

      {/* The Gap only renders for exactly two funds; otherwise it's null. */}
      <CompareGap selectedFunds={selected} period={period} />

      {/* ── Ledger + Editorial Verdict ── */}
      <StatsTable selectedFunds={selected} />

      <Verdict selectedFunds={selected} />

      {/* ── Geography + suitability + FAQ ── */}
      <AllocationBars selectedFunds={selected} />

      <WhoThisSuits selectedFunds={selected} />

      <FAQSection />
    </div>
  );
}
