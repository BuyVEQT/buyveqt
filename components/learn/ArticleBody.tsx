import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import type { ReactNode } from "react";
import { Summary } from "@/components/mdx/Summary";
import { Callout } from "@/components/mdx/Callout";
import { ComparisonTable } from "@/components/mdx/ComparisonTable";
import { TableOfContents } from "@/components/mdx/TableOfContents";
import { Pullquote, PullQuote } from "@/components/mdx/Pullquote";
import { Sidenote } from "@/components/mdx/Sidenote";
import { AccountFlowchart } from "@/components/mdx/AccountFlowchart";
import { FHSATimeline } from "@/components/mdx/FHSATimeline";
import { FeeCalculator } from "@/components/mdx/FeeCalculator";
import { ProgressTracker } from "@/components/mdx/ProgressTracker";
import { CoveredCallGrowthChart } from "@/components/mdx/CoveredCallGrowthChart";
import { UpsideCapVisualizer } from "@/components/mdx/UpsideCapVisualizer";
import { ForexLossStats } from "@/components/mdx/ForexLossStats";
import { OpportunityCostCalculator } from "@/components/mdx/OpportunityCostCalculator";
import { JourneyTimeline } from "@/components/mdx/JourneyTimeline";
import { ZeroSumExplainer } from "@/components/mdx/ZeroSumExplainer";
import { OwnershipDiagram } from "@/components/mdx/OwnershipDiagram";
import { OwnershipStructure } from "@/components/mdx/OwnershipStructure";
import { VanguardEffectTimeline } from "@/components/mdx/VanguardEffectTimeline";
import { FundStructure } from "@/components/mdx/FundStructure";
import { DriftCalculator } from "@/components/mdx/DriftCalculator";
import { InvestmentDecisionTree } from "@/components/mdx/InvestmentDecisionTree";
import { TimeHorizonCalculator } from "@/components/mdx/TimeHorizonCalculator";
import { EquityPremiumTimeline } from "@/components/mdx/EquityPremiumTimeline";
import { WithdrawalSimulator } from "@/components/mdx/WithdrawalSimulator";
import { AssetLocationOptimizer } from "@/components/mdx/AssetLocationOptimizer";
import { BobTimeline } from "@/components/mdx/BobTimeline";
import { MissedDaysChart } from "@/components/mdx/MissedDaysChart";
import { SPIVAFunnel } from "@/components/mdx/SPIVAFunnel";
import { OwnershipLoop } from "@/components/mdx/OwnershipLoop";
import { HoldingsUniverse } from "@/components/mdx/HoldingsUniverse";
import { PerformanceBattle } from "@/components/mdx/PerformanceBattle";
import { WeightingComparison } from "@/components/mdx/WeightingComparison";
import { PioneerTimeline } from "@/components/mdx/PioneerTimeline";
import { VanguardEffectV2 } from "@/components/mdx/VanguardEffectV2";
import { VerdictCard } from "@/components/mdx/VerdictCard";
import VerdictCallout from "./VerdictCallout";

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
  Pullquote,
  PullQuote,
  Sidenote,
  VerdictCallout,
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
  OwnershipDiagram,
  OwnershipStructure,
  VanguardEffectTimeline,
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
  VerdictCard,
  h2: H2,
};

interface ArticleBodyProps {
  content: string;
}

/**
 * Article reader body. Owns the MDX render and the editorial typography
 * for the prose column. Auto-applies the .ed-lede drop cap to the
 * first paragraph via CSS (no MDX changes needed).
 *
 * Line-length capped at ~68ch via max-width: 32rem on the inner
 * `.learn-article` block; the parent grid handles the marginalia sidecar.
 */
export default function ArticleBody({ content }: ArticleBodyProps) {
  return (
    <article data-article-body className="learn-article">
      <MDXRemote
        source={content}
        components={mdxComponents}
        options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
      />

    </article>
  );
}
