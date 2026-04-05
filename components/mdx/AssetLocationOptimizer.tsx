"use client";

import { useState } from "react";

type HoldingType = "veqt-only" | "veqt-bonds" | "veqt-gic-bonds";

const HOLDINGS: { id: HoldingType; label: string }[] = [
  { id: "veqt-only", label: "VEQT only" },
  { id: "veqt-bonds", label: "VEQT + Bond ETF" },
  { id: "veqt-gic-bonds", label: "VEQT + Bonds + GICs" },
];

interface LocationResult {
  tfsa: string;
  rrsp: string;
  taxable: string;
  savings: string;
  note: string;
}

const RESULTS: Record<HoldingType, LocationResult> = {
  "veqt-only": {
    tfsa: "VEQT",
    rrsp: "VEQT",
    taxable: "VEQT",
    savings: "None — it doesn't matter",
    note: "If you only hold VEQT, asset location is irrelevant. VEQT is the same product in every account. Just fill your accounts in priority order (TFSA → RRSP → Taxable) and stop thinking about it.",
  },
  "veqt-bonds": {
    tfsa: "VEQT",
    rrsp: "Bond ETF (VAB, ZAG)",
    taxable: "VEQT",
    savings: "~$50-200/yr on a $500K portfolio",
    note: "Bond interest is fully taxable at your marginal rate — the least tax-efficient income type. Sheltering bonds in an RRSP (where withdrawals are also taxed as income) means you defer, not avoid, the tax — but the deferral still adds value. VEQT's returns (capital gains + Canadian dividends) are more tax-friendly in a taxable account.",
  },
  "veqt-gic-bonds": {
    tfsa: "VEQT",
    rrsp: "Bonds + GICs",
    taxable: "VEQT",
    savings: "~$100-400/yr on a $500K portfolio",
    note: "GIC interest is taxed identically to bond interest — fully at your marginal rate. Shelter both in registered accounts. VEQT goes in the TFSA (tax-free growth on equities is the best deal) and taxable (capital gains and dividend tax credit are more efficient than interest income).",
  },
};

export function AssetLocationOptimizer() {
  const [holding, setHolding] = useState<HoldingType>("veqt-only");
  const result = RESULTS[holding];
  const isVeqtOnly = holding === "veqt-only";

  return (
    <div className="my-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] overflow-hidden">
      <div className="px-5 py-3 border-b border-[var(--color-border)] bg-[var(--color-card-hover)]">
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
          Asset Location Tool
        </p>
      </div>

      <div className="p-5">
        <p className="text-sm text-[var(--color-text-secondary)] mb-4">
          What do you hold?
        </p>

        <div className="flex flex-wrap gap-2 mb-5">
          {HOLDINGS.map((h) => (
            <button
              key={h.id}
              onClick={() => setHolding(h.id)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium border transition-colors ${
                holding === h.id
                  ? "bg-[var(--color-brand)] border-[var(--color-brand)] text-white"
                  : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-brand)] hover:text-[var(--color-brand)]"
              }`}
            >
              {h.label}
            </button>
          ))}
        </div>

        {/* Result */}
        <div
          className={`rounded-lg border p-4 mb-4 ${
            isVeqtOnly
              ? "border-[var(--color-positive)] bg-[var(--color-positive-bg)]"
              : "border-[var(--color-border)] bg-[var(--color-base)]"
          }`}
        >
          {isVeqtOnly ? (
            <div className="text-center py-3">
              <p className="text-base font-bold text-[var(--color-positive)] mb-2">
                It doesn&apos;t matter — just invest
              </p>
              <p className="text-sm text-[var(--color-text-secondary)] max-w-md mx-auto">
                {result.note}
              </p>
            </div>
          ) : (
            <>
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-3">
                Recommended placement
              </p>
              <div className="space-y-2 mb-4">
                {[
                  { label: "TFSA", value: result.tfsa },
                  { label: "RRSP", value: result.rrsp },
                  { label: "Taxable", value: result.taxable },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between py-1.5 border-b border-[var(--color-border)] last:border-0"
                  >
                    <span className="text-sm font-medium text-[var(--color-text-primary)]">
                      {row.label}
                    </span>
                    <span className="text-sm text-[var(--color-text-secondary)]">
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs text-[var(--color-text-muted)]">
                  Estimated annual tax savings:
                </span>
                <span className="text-sm font-bold text-[var(--color-positive)]">
                  {result.savings}
                </span>
              </div>
              <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                {result.note}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
