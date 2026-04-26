"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { ChartTooltipWrapper, AXIS_PROPS, GRID_PROPS } from "@/lib/chart-utils";

const FEE_DATA = [
  { date: "2019-01", veqt: 0.24, xeqt: null },
  { date: "2019-08", veqt: 0.24, xeqt: 0.20 },
  // VEQT interim cut to 0.22% — exact date unverified; shown at mid-2020 (approximation)
  { date: "2020-06", veqt: 0.22, xeqt: 0.20 },
  // XEQT interim cut to 0.18% — exact date unverified; shown at mid-2021 (approximation)
  { date: "2021-06", veqt: 0.22, xeqt: 0.18 },
  { date: "2025-11", veqt: 0.17, xeqt: 0.18 }, // Vanguard cuts first (verified)
  { date: "2025-12", veqt: 0.17, xeqt: 0.17 }, // BlackRock matches (verified)
  { date: "2026-04", veqt: 0.17, xeqt: 0.17 }, // current
];

const KEY_MOMENTS = [
  { date: "Jan 2019", event: "Vanguard launches VEQT at 0.24% management fee" },
  { date: "Aug 2019", event: "BlackRock launches XEQT at 0.20%, undercutting" },
  { date: "Nov 2025", event: "Vanguard cuts VEQT management fee to 0.17%" },
  { date: "Dec 2025", event: "BlackRock cuts XEQT to match — within 30 days" },
];

interface TooltipProps {
  active?: boolean;
  payload?: { value: number | null; name: string; color: string }[];
  label?: string;
}

function FeeTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <ChartTooltipWrapper>
      <p className="text-[11px] text-[var(--color-text-muted)] mb-1">{label}</p>
      {payload
        .filter((p) => p.value !== null)
        .map((p) => (
          <p
            key={p.name}
            className="text-[11px] font-semibold"
            style={{ color: p.color }}
          >
            {p.name}: {(p.value as number).toFixed(2)}%
          </p>
        ))}
    </ChartTooltipWrapper>
  );
}

export function VanguardEffectTimeline() {
  return (
    <div className="my-8 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 sm:p-8">
      {/* Header band */}
      <div className="mb-6">
        <p className="text-[11px] uppercase tracking-[0.18em] font-semibold mb-2" style={{ color: "#c4122f" }}>
          The Vanguard Effect
        </p>
        <h3 className="text-2xl sm:text-3xl font-serif text-[var(--color-text-primary)]">
          Lead first. Everyone follows.
        </h3>
        <p className="text-sm italic text-[var(--color-text-secondary)] mt-2">
          Vanguard moved on fees. Within a month, BlackRock matched.
        </p>
      </div>

      {/* Chart area */}
      <div className="mt-2 mb-2">
        <p className="text-[11px] uppercase tracking-wider font-medium text-[var(--color-text-muted)] mb-2">
          Management fee, %
        </p>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={FEE_DATA} margin={{ top: 10, right: 24, left: 0, bottom: 6 }}>
            <CartesianGrid {...GRID_PROPS} />
            <XAxis
              dataKey="date"
              {...AXIS_PROPS}
              tickFormatter={(d: string) => d.split("-")[0]}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={[0.10, 0.30]}
              tickFormatter={(v: number) => `${v.toFixed(2)}%`}
              {...AXIS_PROPS}
              width={50}
            />
            <Tooltip content={<FeeTooltip />} />
            <Line
              type="stepAfter"
              dataKey="veqt"
              stroke="#c4122f"
              strokeWidth={2.5}
              name="VEQT"
              dot={{ r: 4, fill: "#c4122f" }}
              activeDot={{ r: 6 }}
              connectNulls={false}
            />
            <Line
              type="stepAfter"
              dataKey="xeqt"
              stroke="#1a6dca"
              strokeWidth={2.5}
              name="XEQT"
              dot={{ r: 4, fill: "#1a6dca" }}
              activeDot={{ r: 6 }}
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>

        {/* Custom legend */}
        <div className="flex items-center gap-6 mt-3 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full" style={{ background: "#c4122f" }} />
            <span className="text-[var(--color-text-secondary)]">VEQT (Vanguard)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full" style={{ background: "#1a6dca" }} />
            <span className="text-[var(--color-text-secondary)]">XEQT (BlackRock)</span>
          </span>
        </div>
      </div>

      {/* Key moments */}
      <div className="mt-6">
        <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-[var(--color-text-muted)] mb-3">
          Key Moments
        </p>
        <ul className="space-y-2">
          {KEY_MOMENTS.map((m) => (
            <li key={m.date} className="flex gap-3 text-sm leading-relaxed">
              <span className="font-bold tabular-nums text-[var(--color-text-primary)] shrink-0 w-20">
                {m.date}
              </span>
              <span className="text-[var(--color-text-secondary)]">{m.event}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Footer band */}
      <div className="mt-6 pt-5 border-t border-[var(--color-border)]">
        <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
          Vanguard has reduced fees over <strong className="font-bold text-[var(--color-text-primary)]">2,100 times</strong> since 1975. The pattern that drives industry-wide fee compression is named after them for a reason.
        </p>
      </div>
    </div>
  );
}
