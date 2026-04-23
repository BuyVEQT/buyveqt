import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import type { ArticleFrontmatter } from "@/lib/articles";
import type { ReactNode } from "react";
import { getAdjacentArticles, getArticleOrdinal } from "@/lib/articles";
import RelatedReading from "./RelatedReading";
import NewsletterSignup from "@/components/NewsletterSignup";
import ReadingProgress from "@/components/broadsheet/dispatch/ReadingProgress";
import DispatchTOC from "@/components/broadsheet/dispatch/DispatchTOC";
import NextDispatch from "@/components/broadsheet/dispatch/NextDispatch";
import { Summary } from "@/components/mdx/Summary";
import { Callout } from "@/components/mdx/Callout";
import { ComparisonTable } from "@/components/mdx/ComparisonTable";
import { TableOfContents } from "@/components/mdx/TableOfContents";
import { Pullquote } from "@/components/mdx/Pullquote";
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
  Pullquote,
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
  h2: HeadingTwo,
};

const CATEGORY_LABEL: Record<string, string> = {
  beginner: "The Basics",
  comparison: "Head-to-Head",
  "tax-strategy": "Tax & Accounts",
  "veqt-deep-dive": "The Deep Dive",
  opinion: "Opinion",
};

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

interface ArticleLayoutProps {
  frontmatter: ArticleFrontmatter;
  content: string;
}

/**
 * Dispatch layout — the broadsheet article page.
 *
 * Structure:
 *   - Reading-progress bar (fixed, ink line at top)
 *   - Breadcrumb strip
 *   - Article head: category stamp, dispatch no., title (italic), byline
 *   - Body grid: prose (max-w-[65ch]) + sticky TOC sidebar on desktop
 *   - Next Dispatch CTA (sequenced)
 *   - Related reading
 *   - Newsletter signup
 */
export default function ArticleLayout({
  frontmatter,
  content,
}: ArticleLayoutProps) {
  const { previous, next } = getAdjacentArticles(frontmatter.slug);
  const ordinal = getArticleOrdinal(frontmatter.slug);
  const categoryLabel =
    CATEGORY_LABEL[frontmatter.category ?? "beginner"] ?? "The Archive";
  const updated = formatDate(frontmatter.updatedDate ?? frontmatter.lastUpdated);

  return (
    <>
      <ReadingProgress />

      {/* ── Breadcrumb ───────────────────────────────────────────── */}
      <nav
        className="pt-5 pb-2 bs-caption flex items-center gap-2 flex-wrap"
        style={{ color: "var(--ink-soft)" }}
      >
        <Link href="/learn" className="bs-link" style={{ color: "var(--ink)" }}>
          Learn
        </Link>
        <span className="opacity-40">·</span>
        <span className="italic">{categoryLabel}</span>
      </nav>

      {/* ── Article head ─────────────────────────────────────────── */}
      <header className="pt-4 pb-8 sm:pb-10 border-b border-[var(--ink)]">
        <div className="flex items-center justify-between gap-4 mb-4">
          <p className="bs-stamp">
            {ordinal ? `Dispatch No. ${String(ordinal).padStart(2, "0")}` : categoryLabel}
          </p>
          <p
            className="bs-label tabular-nums shrink-0"
            style={{ color: "var(--ink-soft)" }}
          >
            {frontmatter.readingTime}
          </p>
        </div>
        <h1
          className="bs-display-italic text-[2rem] sm:text-[2.75rem] lg:text-[3.5rem] leading-[1.02] max-w-[22ch]"
          style={{ color: "var(--ink)" }}
        >
          {frontmatter.title}
        </h1>
        <p
          className="bs-caption italic mt-4 flex flex-wrap items-center gap-x-3 gap-y-1"
          style={{ color: "var(--ink-soft)" }}
        >
          <span>By BuyVEQT</span>
          <span className="opacity-40">·</span>
          <span>Updated {updated}</span>
          {frontmatter.difficulty && frontmatter.difficulty !== "beginner" && (
            <>
              <span className="opacity-40">·</span>
              <span className="capitalize">{frontmatter.difficulty}</span>
            </>
          )}
          {frontmatter.isEditorial && (
            <>
              <span className="opacity-40">·</span>
              <span
                className="bs-stamp"
                style={{ fontSize: "10px", color: "var(--stamp)" }}
              >
                Our Take
              </span>
            </>
          )}
        </p>
      </header>

      {/* ── Body + optional sticky TOC ──────────────────────────── */}
      <div className="pt-8 lg:pt-10 flex gap-12">
        <article
          data-dispatch-body
          className="prose-custom flex-1 min-w-0 max-w-[65ch]"
        >
          <MDXRemote
            source={content}
            components={mdxComponents}
            options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
          />
        </article>
        <DispatchTOC />
      </div>

      {/* ── Next Dispatch CTA ───────────────────────────────────── */}
      <div className="max-w-[65ch]">
        <NextDispatch next={next} previous={previous} />
      </div>

      {/* ── Related Reading ─────────────────────────────────────── */}
      <div className="max-w-[65ch]">
        <RelatedReading
          currentSlug={frontmatter.slug}
          relatedSlugs={frontmatter.relatedSlugs || []}
          category={frontmatter.category || "beginner"}
        />
      </div>

      {/* ── Newsletter ──────────────────────────────────────────── */}
      <div className="max-w-[65ch] mt-12 mb-4">
        <NewsletterSignup variant="section" />
      </div>
    </>
  );
}
