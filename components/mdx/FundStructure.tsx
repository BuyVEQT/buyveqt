"use client";

import { useState } from "react";

interface FundLayer {
  etf: string;
  region: string;
  weight: string;
  stocks: string;
  examples: string;
  color: string;
}

const FUNDS: FundLayer[] = [
  {
    etf: "VUN",
    region: "United States",
    weight: "~40%",
    stocks: "~4,000",
    examples: "Apple, Microsoft, NVIDIA, Amazon",
    color: "var(--color-brand)",
  },
  {
    etf: "VCN",
    region: "Canada",
    weight: "~30%",
    stocks: "~200",
    examples: "Royal Bank, TD, Shopify, Enbridge",
    color: "var(--color-positive)",
  },
  {
    etf: "VIU",
    region: "International",
    weight: "~23%",
    stocks: "~6,000",
    examples: "Nestlé, ASML, Toyota, SAP",
    color: "var(--color-chart-purple, #8b5cf6)",
  },
  {
    etf: "VEE",
    region: "Emerging Markets",
    weight: "~7%",
    stocks: "~5,000",
    examples: "TSMC, Samsung, Reliance, Tencent",
    color: "var(--color-chart-orange, #f59e0b)",
  },
];

export function FundStructure() {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="my-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-5 sm:p-6">
      <h3 className="text-base font-semibold text-[var(--color-text-primary)] mb-1">
        What One Share of VEQT Contains
      </h3>
      <p className="text-sm text-[var(--color-text-muted)] mb-5">
        Three layers: you buy VEQT, VEQT holds 4 ETFs, those ETFs hold ~13,700
        stocks. Click any fund to see examples.
      </p>

      {/* Layer 1: VEQT */}
      <div className="rounded-md border border-[var(--color-brand)] bg-[var(--color-brand)]/[0.04] px-4 py-3 text-center mb-2">
        <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-brand)] mb-0.5">
          Layer 1 — You buy
        </p>
        <p className="text-lg font-bold text-[var(--color-text-primary)]">
          VEQT
        </p>
        <p className="text-xs text-[var(--color-text-muted)]">
          1 ticker on the TSX · ~13,700 stocks · 50+ countries
        </p>
      </div>

      {/* Arrow */}
      <div className="flex justify-center py-1">
        <svg
          width="12"
          height="8"
          viewBox="0 0 12 8"
          className="text-[var(--color-text-muted)]"
        >
          <path d="M6 8L0 0h12z" fill="currentColor" />
        </svg>
      </div>

      {/* Layer 2: The 4 ETFs */}
      <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-base)] p-3 mb-2">
        <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-3 text-center">
          Layer 2 — VEQT holds 4 underlying ETFs
        </p>
        <div className="space-y-2">
          {FUNDS.map((fund) => {
            const isExpanded = expanded === fund.etf;
            return (
              <button
                key={fund.etf}
                onClick={() =>
                  setExpanded(isExpanded ? null : fund.etf)
                }
                className="w-full text-left rounded-md border border-[var(--color-border)] bg-[var(--color-card)] p-3 transition-all hover:border-[var(--color-brand)]/40"
              >
                <div className="flex items-center gap-3">
                  {/* Weight bar */}
                  <div className="w-16 shrink-0">
                    <div className="h-2 rounded-full bg-[var(--color-base)] overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: fund.weight.replace("~", ""),
                          backgroundColor: fund.color,
                          opacity: 0.8,
                        }}
                      />
                    </div>
                    <p
                      className="text-[10px] font-bold tabular-nums mt-0.5 text-center"
                      style={{ color: fund.color }}
                    >
                      {fund.weight}
                    </p>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-[var(--color-text-primary)]">
                        {fund.etf}
                      </span>
                      <span className="text-xs text-[var(--color-text-muted)]">
                        {fund.region}
                      </span>
                    </div>
                  </div>

                  {/* Stock count */}
                  <span className="text-xs text-[var(--color-text-muted)] tabular-nums shrink-0">
                    {fund.stocks} stocks
                  </span>

                  {/* Expand indicator */}
                  <svg
                    width="10"
                    height="6"
                    viewBox="0 0 10 6"
                    className={`shrink-0 text-[var(--color-text-muted)] transition-transform ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                  >
                    <path
                      d="M5 6L0 0h10z"
                      fill="currentColor"
                    />
                  </svg>
                </div>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-[var(--color-border)]">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-1.5">
                      Layer 3 — Example holdings
                    </p>
                    <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                      {fund.examples}
                    </p>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <p className="mt-3 text-[11px] text-[var(--color-text-muted)] text-center">
        Weights are approximate and shift with markets. Vanguard periodically
        rebalances VEQT back toward its targets. See the{" "}
        <a
          href="/inside-veqt"
          className="text-[var(--color-brand)] hover:underline"
        >
          Inside VEQT
        </a>{" "}
        page for current data.
      </p>
    </div>
  );
}
