import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import type { ArticleFrontmatter } from "@/lib/articles";
import type { ReactNode } from "react";
import RelatedReading from "./RelatedReading";
import NewsletterSignup from "@/components/NewsletterSignup";
import { Summary } from "@/components/mdx/Summary";
import { Callout } from "@/components/mdx/Callout";
import { ComparisonTable } from "@/components/mdx/ComparisonTable";
import { TableOfContents } from "@/components/mdx/TableOfContents";
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
import { OwnershipStructure } from "@/components/mdx/OwnershipStructure";
import { VanguardEffectTimeline } from "@/components/mdx/VanguardEffectTimeline";
import { FundStructure } from "@/components/mdx/FundStructure";
import { DriftCalculator } from "@/components/mdx/DriftCalculator";
import { InvestmentDecisionTree } from "@/components/mdx/InvestmentDecisionTree";
import { TimeHorizonCalculator } from "@/components/mdx/TimeHorizonCalculator";
import { EquityPremiumTimeline } from "@/components/mdx/EquityPremiumTimeline";
import { WithdrawalSimulator } from "@/components/mdx/WithdrawalSimulator";
import { AssetLocationOptimizer } from "@/components/mdx/AssetLocationOptimizer";


function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function HeadingTwo({ children }: { children?: ReactNode }) {
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
  OwnershipStructure,
  VanguardEffectTimeline,
  FundStructure,
  DriftCalculator,
  InvestmentDecisionTree,
  TimeHorizonCalculator,
  EquityPremiumTimeline,
  WithdrawalSimulator,
  AssetLocationOptimizer,
  h2: HeadingTwo,
};

interface ArticleLayoutProps {
  frontmatter: ArticleFrontmatter;
  content: string;
}

export default function ArticleLayout({ frontmatter, content }: ArticleLayoutProps) {
  return (
    <article className="flex-1 mx-auto w-full max-w-6xl px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-[var(--color-text-muted)] mb-6">
        <Link
          href="/learn"
          className="hover:text-[var(--color-text-primary)] transition-colors"
        >
          Learn
        </Link>
        <span className="mx-2">&rarr;</span>
        <span className="text-[var(--color-text-secondary)]">{frontmatter.title}</span>
      </nav>

      {/* Header */}
      <header className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] leading-tight">
          {frontmatter.title}
        </h1>
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">
          {frontmatter.readingTime} &middot; Last updated {frontmatter.lastUpdated}
        </p>
      </header>

      {/* MDX Content */}
      <div className="prose-custom">
        <MDXRemote source={content} components={mdxComponents} options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }} />
      </div>

      {/* Related Reading */}
      <RelatedReading
        currentSlug={frontmatter.slug}
        relatedSlugs={frontmatter.relatedSlugs || []}
        category={frontmatter.category || "beginner"}
      />

      {/* Newsletter */}
      <NewsletterSignup variant="section" className="mt-10" />

      {/* Footer */}
      <div className="mt-10 pt-6 border-t border-[var(--color-border)]">
        <Link
          href="/learn"
          className="text-sm font-medium text-[var(--color-brand)] hover:text-[var(--color-brand-dark)] transition-colors"
        >
          &larr; Back to all articles
        </Link>

        <div className="mt-6 rounded-lg bg-[var(--color-base)] border border-[var(--color-border)] p-4">
          <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
            This is educational content, not financial advice. Consider your
            personal situation and consult a qualified advisor before making
            investment decisions.
          </p>
        </div>
      </div>
    </article>
  );
}
