"use client";

import { useState } from "react";

type Timeline = "1-2" | "3-5" | "5-10" | "10+";

interface TimelineOption {
  id: Timeline;
  label: string;
  investment: string;
  rationale: string;
  veqt: "none" | "partial" | "good" | "strong";
}

const OPTIONS: TimelineOption[] = [
  {
    id: "1-2",
    label: "1–2 years",
    investment: "HISA ETF or GIC",
    rationale:
      "Capital preservation only. The tax deduction is your return — don't risk your down payment on market volatility.",
    veqt: "none",
  },
  {
    id: "3-5",
    label: "3–5 years",
    investment: "VBAL or VCNS",
    rationale:
      "A balanced ETF (60/40 or 40/60) gives some growth potential while limiting downside in this grey zone.",
    veqt: "partial",
  },
  {
    id: "5-10",
    label: "5–10 years",
    investment: "VEQT → de-risk as you approach",
    rationale:
      "VEQT is appropriate early in this window. Plan a glide path: shift to bonds 3 years out, then cash 1–2 years out.",
    veqt: "good",
  },
  {
    id: "10+",
    label: "10+ years",
    investment: "VEQT",
    rationale:
      "A decade-plus horizon lets you ride out any downturn. If you never buy, the FHSA rolls to your RRSP with no penalty.",
    veqt: "strong",
  },
];

const VEQT_BADGE: Record<
  TimelineOption["veqt"],
  { label: string; className: string }
> = {
  none: {
    label: "Not suitable",
    className: "bg-[var(--color-negative-bg)] text-[var(--color-negative)]",
  },
  partial: {
    label: "Partially suitable",
    className: "bg-[rgba(217,119,6,0.08)] text-[#d97706]",
  },
  good: {
    label: "Good fit",
    className: "bg-[var(--color-positive-bg)] text-[var(--color-positive)]",
  },
  strong: {
    label: "Strong fit",
    className: "bg-[var(--color-positive-bg)] text-[var(--color-positive)]",
  },
};

export function FHSATimeline() {
  const [selected, setSelected] = useState<Timeline | null>("5-10");

  return (
    <div className="my-6">
      {/* Segment control */}
      <div className="flex flex-wrap gap-2 mb-4">
        {OPTIONS.map((opt) => (
          <button
            key={opt.id}
            onClick={() => setSelected(opt.id)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium border transition-colors ${
              selected === opt.id
                ? "bg-[var(--color-brand)] border-[var(--color-brand)] text-white"
                : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-brand)] hover:text-[var(--color-brand)]"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Cards */}
      <div className="space-y-3">
        {OPTIONS.map((opt) => {
          const isActive = selected === opt.id;
          const badge = VEQT_BADGE[opt.veqt];
          return (
            <div
              key={opt.id}
              onClick={() => setSelected(opt.id)}
              className={`rounded-lg border p-4 cursor-pointer transition-all ${
                isActive
                  ? "border-[var(--color-brand)] bg-[var(--color-card)] opacity-100"
                  : "border-[var(--color-border)] bg-[var(--color-card)] opacity-40"
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-1.5">
                <div>
                  <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                    {opt.label}
                  </span>
                  <span className="mx-2 text-[var(--color-border-light)]">·</span>
                  <span className="text-sm text-[var(--color-text-secondary)]">
                    {opt.investment}
                  </span>
                </div>
                <span
                  className={`shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-full ${badge.className}`}
                >
                  {badge.label}
                </span>
              </div>
              <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                {opt.rationale}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
