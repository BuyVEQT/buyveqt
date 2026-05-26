"use client";

/**
 * ClientOnlyChart — defers rendering of recharts children until after
 * client hydration.
 *
 * Why: recharts' ResponsiveContainer logs
 *   "The width(-1) and height(-1) of chart should be greater than 0…"
 * during static gen because the container can't measure its parent
 * before hydration. The warning is benign (charts render fine
 * client-side) but pollutes the build log and looks like a real bug.
 *
 * This wrapper renders a height-matched skeleton during SSG and the
 * initial client render, then swaps in the actual chart after mount.
 * Net behavior is the same; SSG noise goes away.
 */
import { useEffect, useState, type ReactNode } from "react";

interface ClientOnlyChartProps {
  /** Height of the placeholder skeleton — match the chart's height so
   *  there's no layout shift between skeleton and chart. */
  height: number;
  /** Optional ARIA label for the skeleton state. */
  label?: string;
  children: ReactNode;
}

export default function ClientOnlyChart({
  height,
  label = "Loading chart…",
  children,
}: ClientOnlyChartProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div
        className="skeleton"
        style={{ height, borderRadius: 8 }}
        aria-label={label}
      />
    );
  }
  return <>{children}</>;
}
