"use client";

import { useState } from "react";
import FundPicker from "./FundPicker";
import PerformanceChart from "./PerformanceChart";
import StatsTable from "./StatsTable";
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

  const handleToggle = (ticker: string) => {
    setSelected((prev) =>
      prev.includes(ticker)
        ? prev.filter((t) => t !== ticker)
        : [...prev, ticker]
    );
  };

  return (
    <div className="space-y-6">
      <FundPicker selected={selected} onToggle={handleToggle} />
      <PerformanceChart selectedFunds={selected} />
      <StatsTable selectedFunds={selected} />
      <AllocationBars selectedFunds={selected} />

      <div>
        <h2 className="text-base font-semibold text-[var(--color-text-primary)] mb-3">
          Who each fund suits best
        </h2>
        <WhoThisSuits selectedFunds={selected} />
      </div>

      <FAQSection />
    </div>
  );
}
