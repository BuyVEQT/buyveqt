import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import type { ReactNode } from "react";

// ── Static half of the registry ────────────────────────────────────────
// Server components (no "use client", therefore no client JS at all) plus
// TableOfContents, which is a client component but appears in 23 of the
// 26 articles — demand-loading it would add a request to 23 pages to save
// one on three. Everything else is demand-loaded; see LazyChartWidgets.
import { Summary } from "@/components/mdx/Summary";
import { Callout } from "@/components/mdx/Callout";
import { ComparisonTable } from "@/components/mdx/ComparisonTable";
import { PioneerTimeline } from "@/components/mdx/PioneerTimeline";
import { VerdictCard } from "@/components/mdx/VerdictCard";
import { MdxLink } from "@/components/mdx/MdxLink";
import { TableOfContents } from "@/components/mdx/TableOfContents";

// ── Lazy half of the registry ──────────────────────────────────────────
// Every client exhibit, dynamic-imported through a "use client" boundary
// (this file is RSC — next-mdx-remote/rsc — so it can't call dynamic()
// itself). SSR stays on, so the prerendered HTML still carries each
// exhibit's markup. See LazyChartWidgets for the full rationale.
import {
  AccountFlowchart,
  AssetLocationOptimizer,
  BobTimeline,
  CoveredCallGrowthChart,
  DriftCalculator,
  EquityPremiumTimeline,
  FHSATimeline,
  FactorBetOutcomes,
  FactorTilt,
  FeeCalculator,
  ForexLossStats,
  FundStructure,
  HoldingsUniverse,
  HomeBiasOverweight,
  InvestmentDecisionTree,
  JourneyTimeline,
  MissedDaysChart,
  OpportunityCostCalculator,
  OwnershipLoop,
  PerformanceBattle,
  ProgressTracker,
  SPIVAFunnel,
  TimeHorizonCalculator,
  UpsideCapVisualizer,
  ValueDecade,
  VanguardEffectV2,
  WeightingComparison,
  WithdrawalSimulator,
  ZeroSumExplainer,
} from "./LazyChartWidgets";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function H2({ children }: { children?: ReactNode }) {
  const text = typeof children === "string" ? children : String(children ?? "");
  const id = slugify(text);
  return <h2 id={id}>{children}</h2>;
}

const mdxComponents = {
  Summary,
  Callout,
  ComparisonTable,
  TableOfContents,
  AccountFlowchart,
  FHSATimeline,
  FeeCalculator,
  ProgressTracker,
  CoveredCallGrowthChart,
  UpsideCapVisualizer,
  ForexLossStats,
  OpportunityCostCalculator,
  JourneyTimeline,
  ZeroSumExplainer,
  FundStructure,
  DriftCalculator,
  InvestmentDecisionTree,
  TimeHorizonCalculator,
  EquityPremiumTimeline,
  WithdrawalSimulator,
  AssetLocationOptimizer,
  BobTimeline,
  MissedDaysChart,
  SPIVAFunnel,
  OwnershipLoop,
  HoldingsUniverse,
  PerformanceBattle,
  WeightingComparison,
  PioneerTimeline,
  VanguardEffectV2,
  HomeBiasOverweight,
  FactorTilt,
  FactorBetOutcomes,
  ValueDecade,
  VerdictCard,
  h2: H2,
  a: MdxLink,
};

interface ArticleBodyProps {
  content: string;
}

/**
 * Article reader body — owns the MDX render.
 *
 * Turn 7 moved the prose typography out of globals' legacy article block
 * and into the reader page's own `.artc__prose` grammar (21px/1.6 Archivo,
 * 68ch measure on paragraphs only, 3px ink rules on h2, no drop cap), so
 * block-level MDX components can run the full column width.
 *
 * `data-article-body` is the hook the section chips and scroll-spy use to
 * find the real headings — keep it.
 */
export default function ArticleBody({ content }: ArticleBodyProps) {
  return (
    <article data-article-body className="artc__prose">
      <MDXRemote
        source={content}
        components={mdxComponents}
        options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
      />
    </article>
  );
}
