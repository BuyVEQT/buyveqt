"use client";

/**
 * LazyChartWidgets — the lazy half of the /learn MDX exhibit registry.
 *
 * Why this file exists:
 *   ArticleBody.tsx renders MDX through next-mdx-remote/rsc, so it is a
 *   server component and cannot call `next/dynamic` itself. This "use
 *   client" boundary owns the dynamic() calls; ArticleBody imports these
 *   names statically and treats the module as one client boundary, while
 *   webpack gives every widget its own async chunk.
 *
 * Why it now holds (almost) the whole registry:
 *   ArticleBody used to statically import 27 client components, which
 *   webpack merged into a single ~32 KB gz chunk shipped to all 26
 *   articles. The median article renders two of them and three render
 *   none. Every client entry below is now demand-loaded, so an article
 *   pays only for the exhibits it actually contains.
 *
 * Two deliberate exceptions stay static in ArticleBody:
 *   - the six server components (Summary, Callout, ComparisonTable,
 *     PioneerTimeline, VerdictCard, MdxLink) — they emit no client JS at
 *     all, so splitting them buys nothing and costs a request.
 *   - TableOfContents — a client component, but it appears in 23 of 26
 *     articles. Splitting it would add a chunk fetch to 23 pages to save
 *     one on three.
 *
 * SSR stays ON (the `dynamic` default — note there is no `ssr: false`
 * anywhere below). The prerendered article HTML therefore still contains
 * every exhibit's real markup, which is what makes the no-JS and
 * prefers-reduced-motion contract hold: the un-armed static frame IS the
 * diagram. The `loading` skeletons only appear on client-side navigation
 * between articles, before a chunk lands.
 *
 * The exhibits' IntersectionObserver arming is unaffected. `useExhibit`
 * registers its observer in a useEffect on the REAL component's mount —
 * the skeleton below is an inert div with no ref — so an exhibit simply
 * arms whenever its chunk has hydrated and it is scrolled into view.
 */
import dynamic from "next/dynamic";

/**
 * Placeholder factory. Uses the global `.skeleton` class — its shimmer is
 * the intended, visible loading state here (unlike DuoChart's local
 * override, which paints a flat ink tint over it).
 *
 * `radius`: 8 for the legacy `rounded-lg` card widgets, 0 for the
 * Instrument-grammar exhibits, so the placeholder is the shape of the
 * thing that replaces it.
 */
function skel(height: number, label: string, radius: number) {
  const Loading = () => (
    <div
      className="skeleton my-6"
      style={{ height, borderRadius: radius }}
      role="img"
      aria-label={label}
    />
  );
  Loading.displayName = `Skeleton(${label})`;
  return Loading;
}

/** Legacy `rounded-lg` card widget. */
const card = (height: number, label: string) => skel(height, label, 8);
/** Instrument-grammar exhibit — radius 0, per the house grammar. */
const exhibit = (height: number, label: string) => skel(height, label, 0);

// ── Legacy card widgets ────────────────────────────────────────────────

export const AccountFlowchart = dynamic(
  () =>
    import("@/components/mdx/AccountFlowchart").then((m) => m.AccountFlowchart),
  { loading: card(520, "Loading account flowchart") },
);

export const AssetLocationOptimizer = dynamic(
  () =>
    import("@/components/mdx/AssetLocationOptimizer").then(
      (m) => m.AssetLocationOptimizer,
    ),
  { loading: card(420, "Loading asset location optimizer") },
);

export const BobTimeline = dynamic(
  () => import("@/components/mdx/BobTimeline").then((m) => m.BobTimeline),
  { loading: card(520, "Loading timeline") },
);

export const CoveredCallGrowthChart = dynamic(
  () =>
    import("@/components/mdx/CoveredCallGrowthChart").then(
      (m) => m.CoveredCallGrowthChart,
    ),
  { loading: card(520, "Loading growth chart") },
);

export const DriftCalculator = dynamic(
  () =>
    import("@/components/mdx/DriftCalculator").then((m) => m.DriftCalculator),
  { loading: card(440, "Loading drift calculator") },
);

export const EquityPremiumTimeline = dynamic(
  () =>
    import("@/components/mdx/EquityPremiumTimeline").then(
      (m) => m.EquityPremiumTimeline,
    ),
  { loading: card(420, "Loading equity premium timeline") },
);

export const FHSATimeline = dynamic(
  () => import("@/components/mdx/FHSATimeline").then((m) => m.FHSATimeline),
  { loading: card(360, "Loading FHSA timeline") },
);

export const FeeCalculator = dynamic(
  () => import("@/components/mdx/FeeCalculator").then((m) => m.FeeCalculator),
  { loading: card(560, "Loading fee calculator") },
);

export const ForexLossStats = dynamic(
  () => import("@/components/mdx/ForexLossStats").then((m) => m.ForexLossStats),
  { loading: card(300, "Loading forex loss statistics") },
);

export const FundStructure = dynamic(
  () => import("@/components/mdx/FundStructure").then((m) => m.FundStructure),
  { loading: card(460, "Loading fund structure diagram") },
);

export const InvestmentDecisionTree = dynamic(
  () =>
    import("@/components/mdx/InvestmentDecisionTree").then(
      (m) => m.InvestmentDecisionTree,
    ),
  { loading: card(520, "Loading decision tree") },
);

export const JourneyTimeline = dynamic(
  () =>
    import("@/components/mdx/JourneyTimeline").then((m) => m.JourneyTimeline),
  { loading: card(440, "Loading journey timeline") },
);

export const MissedDaysChart = dynamic(
  () =>
    import("@/components/mdx/MissedDaysChart").then((m) => m.MissedDaysChart),
  { loading: card(340, "Loading missed days chart") },
);

export const OpportunityCostCalculator = dynamic(
  () =>
    import("@/components/mdx/OpportunityCostCalculator").then(
      (m) => m.OpportunityCostCalculator,
    ),
  { loading: card(540, "Loading opportunity cost calculator") },
);

export const ProgressTracker = dynamic(
  () =>
    import("@/components/mdx/ProgressTracker").then((m) => m.ProgressTracker),
  { loading: card(200, "Loading progress tracker") },
);

export const SPIVAFunnel = dynamic(
  () => import("@/components/mdx/SPIVAFunnel").then((m) => m.SPIVAFunnel),
  { loading: card(320, "Loading SPIVA funnel") },
);

export const TimeHorizonCalculator = dynamic(
  () =>
    import("@/components/mdx/TimeHorizonCalculator").then(
      (m) => m.TimeHorizonCalculator,
    ),
  { loading: card(460, "Loading time horizon calculator") },
);

export const UpsideCapVisualizer = dynamic(
  () =>
    import("@/components/mdx/UpsideCapVisualizer").then(
      (m) => m.UpsideCapVisualizer,
    ),
  { loading: card(620, "Loading upside cap visualizer") },
);

export const WithdrawalSimulator = dynamic(
  () =>
    import("@/components/mdx/WithdrawalSimulator").then(
      (m) => m.WithdrawalSimulator,
    ),
  { loading: card(600, "Loading withdrawal simulator") },
);

export const ZeroSumExplainer = dynamic(
  () =>
    import("@/components/mdx/ZeroSumExplainer").then((m) => m.ZeroSumExplainer),
  { loading: card(260, "Loading zero sum explainer") },
);

// ── Instrument-grammar exhibits ────────────────────────────────────────
// The four flagship exhibits (A–D) plus the bleed panels. All of these
// arm their animation through useExhibit's IntersectionObserver on mount,
// which happens after their chunk hydrates — the un-armed frame is the
// finished diagram either way.

export const FactorBetOutcomes = dynamic(
  () =>
    import("@/components/mdx/FactorBetOutcomes").then(
      (m) => m.FactorBetOutcomes,
    ),
  { loading: exhibit(400, "Loading factor bet outcomes exhibit") },
);

export const FactorTilt = dynamic(
  () => import("@/components/mdx/FactorTilt").then((m) => m.FactorTilt),
  { loading: exhibit(460, "Loading factor tilt exhibit") },
);

export const HoldingsUniverse = dynamic(
  () =>
    import("@/components/mdx/HoldingsUniverse").then((m) => m.HoldingsUniverse),
  { loading: exhibit(420, "Loading holdings universe exhibit") },
);

export const HomeBiasOverweight = dynamic(
  () =>
    import("@/components/mdx/HomeBiasOverweight").then(
      (m) => m.HomeBiasOverweight,
    ),
  { loading: exhibit(400, "Loading home bias exhibit") },
);

export const OwnershipLoop = dynamic(
  () => import("@/components/mdx/OwnershipLoop").then((m) => m.OwnershipLoop),
  { loading: exhibit(460, "Loading ownership loop exhibit") },
);

export const PerformanceBattle = dynamic(
  () =>
    import("@/components/mdx/PerformanceBattle").then(
      (m) => m.PerformanceBattle,
    ),
  { loading: exhibit(560, "Loading performance battle exhibit") },
);

export const ValueDecade = dynamic(
  () => import("@/components/mdx/ValueDecade").then((m) => m.ValueDecade),
  { loading: exhibit(420, "Loading value decade exhibit") },
);

export const VanguardEffectV2 = dynamic(
  () =>
    import("@/components/mdx/VanguardEffectV2").then((m) => m.VanguardEffectV2),
  { loading: exhibit(400, "Loading Vanguard effect exhibit") },
);

export const WeightingComparison = dynamic(
  () =>
    import("@/components/mdx/WeightingComparison").then(
      (m) => m.WeightingComparison,
    ),
  { loading: exhibit(540, "Loading weighting comparison exhibit") },
);
