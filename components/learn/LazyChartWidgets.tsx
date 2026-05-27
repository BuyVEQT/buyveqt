"use client";

/**
 * LazyChartWidgets — dynamic-import wrappers for the three recharts-bearing
 * MDX widgets used inside /learn articles.
 *
 * Why this file exists:
 *   ArticleBody.tsx and ArticleLayout.tsx are server components (they use
 *   next-mdx-remote/rsc), so they can't call `next/dynamic` with
 *   `{ ssr: false }` directly. That option is client-component-only.
 *
 * The fix: a "use client" boundary file that owns the dynamic() calls.
 * The server components import these names statically (treating this
 * module as a client boundary) and the actual recharts payload only
 * ships when an article renders one of the widgets.
 *
 * Recharts is ~110 KB gzip — and historically the entire /learn/[slug]
 * route paid for it on every article. Most articles render zero charts.
 * Splitting these three widgets out drops the static /learn/[slug] bundle
 * by ~110 KB gzip (the recharts vendor chunk now downloads on demand).
 *
 * Skeleton heights match each component's rendered height (heading +
 * controls + chart + footnote) so CLS stays at zero when the real widget
 * hot-swaps in.
 */
import dynamic from "next/dynamic";

export const FeeCalculator = dynamic(
  () => import("@/components/mdx/FeeCalculator").then((m) => m.FeeCalculator),
  {
    ssr: false,
    loading: () => (
      <div
        className="skeleton my-6"
        style={{ height: 540, borderRadius: 8 }}
        aria-label="Loading fee calculator"
      />
    ),
  },
);

export const WithdrawalSimulator = dynamic(
  () =>
    import("@/components/mdx/WithdrawalSimulator").then(
      (m) => m.WithdrawalSimulator,
    ),
  {
    ssr: false,
    loading: () => (
      <div
        className="skeleton my-6"
        style={{ height: 560, borderRadius: 8 }}
        aria-label="Loading withdrawal simulator"
      />
    ),
  },
);

export const CoveredCallGrowthChart = dynamic(
  () =>
    import("@/components/mdx/CoveredCallGrowthChart").then(
      (m) => m.CoveredCallGrowthChart,
    ),
  {
    ssr: false,
    loading: () => (
      <div
        className="skeleton my-6"
        style={{ height: 500, borderRadius: 8 }}
        aria-label="Loading growth chart"
      />
    ),
  },
);
