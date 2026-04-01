import type { ReactNode } from "react";

/** Format a number as Canadian dollars. Shows decimals for values under $100. */
export function formatDollars(value: number): string {
  if (value < 100) return "$" + value.toFixed(2);
  return "$" + Math.round(value).toLocaleString("en-CA");
}

/** Shared CartesianGrid props for all charts */
export const GRID_PROPS = {
  strokeDasharray: "3 3",
  stroke: "var(--color-border)",
  vertical: false,
} as const;

/** Shared tick style for XAxis/YAxis */
export const TICK_STYLE = {
  fontSize: 11,
  fill: "var(--color-text-muted)",
} as const;

/** Shared axis props (tick style + no lines) — spread onto XAxis/YAxis */
export const AXIS_PROPS = {
  tick: TICK_STYLE,
  tickLine: false,
  axisLine: false,
} as const;

/** Consistent tooltip wrapper used across all charts */
export function ChartTooltipWrapper({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2 shadow-lg">
      {children}
    </div>
  );
}
