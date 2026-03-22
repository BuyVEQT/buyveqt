"use client";

import { useState } from "react";

export default function WhatIsVeqt() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4 sm:p-5">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between gap-2 group"
      >
        <h2 className="text-sm font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
          What is VEQT?
        </h2>
        <svg
          className={`w-4 h-4 text-[var(--color-text-muted)] transition-transform duration-200 ${
            expanded ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <p className="mt-3 text-sm text-[var(--color-text-muted)] leading-relaxed">
        VEQT is Vanguard&apos;s All-Equity ETF Portfolio — a single-ticket fund
        offering instant global diversification across 13,000+ stocks.
      </p>

      <div
        className={`grid transition-all duration-300 ease-in-out ${
          expanded ? "grid-rows-[1fr] opacity-100 mt-3" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="space-y-3 text-sm text-[var(--color-text-muted)] leading-relaxed">
            <p>
              With an MER of just <span className="text-[var(--color-text-secondary)] font-medium">0.24%</span>,
              it&apos;s one of the most cost-effective ways for Canadians to invest
              globally. One buy gives you exposure to Canada, the US, developed
              international markets, and emerging economies.
            </p>
            <p>
              VEQT is designed for long-term, buy-and-hold investors who want 100%
              equity exposure without the hassle of rebalancing multiple funds.
              It&apos;s become a favourite among Canadian investors for its
              simplicity and broad diversification.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
