"use client";

/**
 * DistributionChartClient — client-only loader around the recharts-based
 * DistributionChart.
 *
 * We dynamically import the chart with `ssr: false` so:
 *  1. The "width(-1) and height(-1) of chart" SSG warning recharts logs
 *     when its ResponsiveContainer can't measure during static gen is
 *     suppressed.
 *  2. The recharts payload doesn't ship in the server render — it
 *     loads after hydration, keeping the rest of /distributions
 *     instant.
 *
 * Wrapping in a client component is required because Next.js App Router
 * forbids `dynamic({ ssr: false })` directly inside server components.
 */
import dynamic from "next/dynamic";

const DistributionChart = dynamic(
  () => import("./DistributionChart"),
  {
    ssr: false,
    loading: () => (
      <div
        className="skeleton"
        style={{ height: 280, borderRadius: 8 }}
        aria-label="Loading distribution chart…"
      />
    ),
  }
);

export default function DistributionChartClient() {
  return <DistributionChart />;
}
