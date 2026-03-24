import type { Metadata } from "next";
import Link from "next/link";
import PageShell from "@/components/layout/PageShell";
import DataFreshness from "@/components/ui/DataFreshness";
import StaleBanner from "@/components/ui/StaleBanner";
import DataUnavailable from "@/components/ui/DataUnavailable";
import MiniChart from "@/components/today/MiniChart";
import RedditFeed from "@/components/RedditFeed";
import NewsletterSignup from "@/components/NewsletterSignup";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildBreadcrumbSchema, canonicalUrl } from "@/lib/seo-config";
import { getQuote, getDailyHistory, getMonthlyHistory } from "@/lib/data";
import { getRedditPosts } from "@/lib/data/reddit";
import { getLatestWeeklyRecap } from "@/lib/weekly";
import {
  VEQT_DISTRIBUTIONS,
  getTrailing12MonthDistributions,
} from "@/data/distributions";

export const revalidate = 300; // 5 minutes — Yahoo is free, refresh frequently

export const metadata: Metadata = {
  title: "VEQT Today — Price, Performance & Latest News",
  description:
    "Current VEQT price, daily and YTD performance, recent distributions, and the latest from the Canadian passive investing community.",
  alternates: { canonical: canonicalUrl("/today") },
  openGraph: {
    title: "VEQT Today",
    description:
      "Current VEQT price, performance snapshot, and community updates.",
    url: canonicalUrl("/today"),
  },
};

// ─── Helpers ──────────────────────────────────────────────────

function calcReturn(
  data: { date: string; adjustedClose: number }[],
  daysBack: number
): number | null {
  if (data.length < 2) return null;
  const latest = data[data.length - 1];
  const targetIdx = Math.max(0, data.length - 1 - daysBack);
  const earlier = data[targetIdx];
  if (!earlier || !latest || earlier.adjustedClose <= 0) return null;
  return (
    ((latest.adjustedClose - earlier.adjustedClose) / earlier.adjustedClose) *
    100
  );
}

function calcYTDReturn(
  data: { date: string; adjustedClose: number }[]
): number | null {
  if (data.length < 2) return null;
  const yearStart = `${new Date().getFullYear()}-01-01`;
  const startPoint = data.find((d) => d.date >= yearStart);
  const latest = data[data.length - 1];
  if (!startPoint || !latest || startPoint.adjustedClose <= 0) return null;
  return (
    ((latest.adjustedClose - startPoint.adjustedClose) /
      startPoint.adjustedClose) *
    100
  );
}

function calcSinceInception(
  data: { date: string; adjustedClose: number }[]
): number | null {
  if (data.length < 2) return null;
  const first = data[0];
  const latest = data[data.length - 1];
  if (!first || !latest || first.adjustedClose <= 0) return null;
  return (
    ((latest.adjustedClose - first.adjustedClose) / first.adjustedClose) * 100
  );
}

function formatPct(val: number | null): string {
  if (val === null) return "\u2014";
  const sign = val >= 0 ? "+" : "\u2212";
  return `${sign}${Math.abs(val).toFixed(2)}%`;
}

// ─── Page ─────────────────────────────────────────────────────

export default async function TodayPage() {
  const [quoteResult, dailyResult, monthlyResult, redditPosts] =
    await Promise.allSettled([
      getQuote("VEQT"),
      getDailyHistory("VEQT", "compact"),
      getMonthlyHistory("VEQT"),
      getRedditPosts("hot", 6),
    ]);

  const quote =
    quoteResult.status === "fulfilled" ? quoteResult.value : null;
  const daily =
    dailyResult.status === "fulfilled" ? dailyResult.value : null;
  const monthly =
    monthlyResult.status === "fulfilled" ? monthlyResult.value : null;
  const posts =
    redditPosts.status === "fulfilled" ? redditPosts.value : [];

  const latestRecap = getLatestWeeklyRecap();

  // Performance calculations
  const dailyData = daily?.data ?? [];
  const monthlyData = monthly?.data ?? [];
  const allData = dailyData.length > monthlyData.length ? dailyData : monthlyData;

  const perfMetrics = [
    { label: "1 Day", value: calcReturn(dailyData, 1) },
    { label: "1 Week", value: calcReturn(dailyData, 5) },
    { label: "1 Month", value: calcReturn(dailyData, 22) },
    { label: "3 Months", value: calcReturn(dailyData, 66) },
    { label: "YTD", value: calcYTDReturn(allData) },
    {
      label: "1 Year",
      value: dailyData.length >= 252
        ? calcReturn(dailyData, 252)
        : calcReturn(monthlyData, 12),
    },
    { label: "Since Inception", value: calcSinceInception(monthlyData) },
  ];

  // Mini chart data (last ~66 trading days ≈ 3 months)
  const chartSlice = dailyData.slice(-66).map((d) => ({
    date: d.date,
    close: d.adjustedClose,
  }));
  const chartPositive =
    chartSlice.length >= 2
      ? chartSlice[chartSlice.length - 1].close >= chartSlice[0].close
      : true;

  // Distribution info
  const latestDist = VEQT_DISTRIBUTIONS.distributions[0];
  const trailingYield =
    quote && quote.price > 0
      ? (getTrailing12MonthDistributions() / quote.price) * 100
      : null;

  const isCache = quote?.source === "cache";
  const isPositive = (quote?.change ?? 0) >= 0;

  const quickLinks = [
    { label: "Compare Funds", href: "/compare" },
    { label: "If You Invested", href: "/invest" },
    { label: "Inside VEQT", href: "/inside-veqt" },
    { label: "Distributions", href: "/distributions" },
    { label: "Learn", href: "/learn" },
    {
      label: "Reddit Community",
      href: "https://www.reddit.com/r/JustBuyVEQT/",
      external: true,
    },
  ];

  return (
    <PageShell>
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "VEQT Today", path: "/today" },
        ])}
      />
      <main className="flex-1 mx-auto w-full max-w-3xl px-4 py-8 space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)]">
            VEQT Today
          </h1>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            Your daily snapshot of Vanguard All-Equity ETF
          </p>
        </div>

        {/* Section 1: Price Hero */}
        {!quote ? (
          <DataUnavailable type="quote" />
        ) : (
          <div className="rounded-lg border border-[var(--color-border)] bg-white p-5">
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="text-3xl sm:text-4xl font-bold tabular-nums">
                ${quote.price.toFixed(2)}
              </span>
              <span
                className={`text-lg font-semibold tabular-nums ${
                  isPositive
                    ? "text-[var(--color-positive)]"
                    : "text-[var(--color-negative)]"
                }`}
              >
                {isPositive ? "+" : "\u2212"}$
                {Math.abs(quote.change).toFixed(2)} (
                {isPositive ? "+" : "\u2212"}
                {Math.abs(quote.changePercent).toFixed(2)}%)
              </span>
            </div>
            <div className="mt-2">
              <DataFreshness source={quote.source} fetchedAt={quote.fetchedAt} />
            </div>
            {isCache && quote.fetchedAt && (
              <StaleBanner fetchedAt={quote.fetchedAt} className="mt-3" />
            )}
          </div>
        )}

        {/* Section 2: Performance Snapshot */}
        <div>
          <h2 className="text-sm font-semibold text-[var(--color-text-secondary)] mb-3">
            Performance
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {perfMetrics.map((m) => {
              const isPos = m.value !== null && m.value >= 0;
              return (
                <div
                  key={m.label}
                  className="rounded-lg border border-[var(--color-border)] bg-white p-2.5 text-center"
                >
                  <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wide mb-1">
                    {m.label}
                  </p>
                  <p
                    className={`text-sm font-bold tabular-nums ${
                      m.value === null
                        ? "text-[var(--color-text-muted)]"
                        : isPos
                        ? "text-[var(--color-positive)]"
                        : "text-[var(--color-negative)]"
                    }`}
                  >
                    {formatPct(m.value)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 3: Mini Price Chart */}
        {chartSlice.length >= 2 && (
          <div className="rounded-lg border border-[var(--color-border)] bg-white p-4">
            <h2 className="text-sm font-semibold text-[var(--color-text-secondary)] mb-2">
              Last 3 Months
            </h2>
            <MiniChart data={chartSlice} positive={chartPositive} />
          </div>
        )}

        {/* Section 4: Latest Distribution */}
        {latestDist && (
          <div className="rounded-lg border border-[var(--color-border)] bg-white p-5">
            <h2 className="text-sm font-semibold text-[var(--color-text-secondary)] mb-3">
              Latest Distribution
            </h2>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-xl font-bold tabular-nums">
                ${latestDist.amount.toFixed(4)}
              </span>
              <span className="text-sm text-[var(--color-text-muted)]">
                per unit
              </span>
            </div>
            <p className="text-sm text-[var(--color-text-muted)]">
              Ex-dividend:{" "}
              {new Date(latestDist.exDate + "T00:00:00").toLocaleDateString(
                "en-CA",
                { year: "numeric", month: "short", day: "numeric" }
              )}
            </p>
            {trailingYield !== null && (
              <p className="text-sm text-[var(--color-text-muted)] mt-1">
                Trailing annual yield: ~{trailingYield.toFixed(2)}%
              </p>
            )}
            <Link
              href="/distributions"
              className="inline-block mt-3 text-sm font-medium text-[var(--color-brand)] hover:text-[var(--color-brand-dark)] transition-colors"
            >
              View full distribution history &rarr;
            </Link>
          </div>
        )}

        {/* Section 5: Quick Links */}
        <div>
          <h2 className="text-sm font-semibold text-[var(--color-text-secondary)] mb-3">
            Explore
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {quickLinks.map((link) =>
              "external" in link && link.external ? (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-[var(--color-border)] bg-white px-3 py-2.5 text-sm font-medium text-[var(--color-text-secondary)] hover:border-[var(--color-brand)] hover:text-[var(--color-brand)] transition-colors text-center"
                >
                  {link.label} &rarr;
                </a>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-lg border border-[var(--color-border)] bg-white px-3 py-2.5 text-sm font-medium text-[var(--color-text-secondary)] hover:border-[var(--color-brand)] hover:text-[var(--color-brand)] transition-colors text-center"
                >
                  {link.label} &rarr;
                </Link>
              )
            )}
          </div>
        </div>

        {/* Section 6: Latest Weekly Recap */}
        {latestRecap && (
          <div>
            <h2 className="text-sm font-semibold text-[var(--color-text-secondary)] mb-3">
              This Week&apos;s Recap
            </h2>
            <Link
              href={`/weekly/${latestRecap.slug}`}
              className="block rounded-lg border border-[var(--color-border)] bg-white p-4 hover:border-[var(--color-brand)] hover:shadow-sm transition-all"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                  {latestRecap.title}
                </p>
                <span
                  className={`text-sm font-bold tabular-nums shrink-0 ${
                    latestRecap.weeklyChange >= 0
                      ? "text-[#15803d]"
                      : "text-[#b91c1c]"
                  }`}
                >
                  {latestRecap.weeklyChange >= 0 ? "+" : ""}
                  {latestRecap.weeklyChangePercent.toFixed(2)}%
                </span>
              </div>
            </Link>
          </div>
        )}

        {/* Section 7: Reddit Feed */}
        {posts.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-[var(--color-text-secondary)] mb-3">
              Latest on r/JustBuyVEQT
            </h2>
            <div className="rounded-lg border border-[var(--color-border)] bg-white p-4">
              <RedditFeed posts={posts} />
            </div>
          </div>
        )}

        {/* Section 8: Newsletter Signup */}
        <NewsletterSignup variant="section" />
      </main>
    </PageShell>
  );
}
