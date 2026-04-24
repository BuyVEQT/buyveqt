"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useVeqtData } from "@/lib/useVeqtData";
import {
  COMPARISON_DATA,
  LEARN_ARTICLES,
  STATIC_DATA,
} from "@/lib/constants";
import {
  VEQT_DISTRIBUTIONS,
  getTrailing12MonthDistributions,
} from "@/data/distributions";
import Masthead from "@/components/broadsheet/Masthead";
import RegionCards from "@/components/broadsheet/RegionCards";
import Letters from "@/components/broadsheet/Letters";
import Colophon from "@/components/broadsheet/Colophon";
import { useRegions } from "@/lib/useRegions";
import { computeLeadHeadline } from "@/lib/lead-headline";

function formatCAD(n: number, digits = 0): string {
  return n.toLocaleString("en-CA", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export default function Home() {
  const { data, loading } = useVeqtData();
  const quote = data?.quote ?? null;
  const isPositive = (quote?.changePercent ?? 0) >= 0;

  const [investment, setInvestment] = useState(10_000);
  const historical = data?.historical ?? [];
  const inceptionPrice = historical[0]?.close ?? 0;
  const currentPrice = quote?.price ?? 0;
  const calcResult =
    inceptionPrice > 0 && currentPrice > 0
      ? (investment / inceptionPrice) * currentPrice
      : null;
  const calcReturn =
    calcResult !== null && investment > 0
      ? ((calcResult - investment) / investment) * 100
      : null;

  const trailingYield = useMemo(() => {
    if (!quote || quote.price <= 0) return null;
    const ttm = getTrailing12MonthDistributions();
    return (ttm / quote.price) * 100;
  }, [quote]);

  const latestDist = VEQT_DISTRIBUTIONS.distributions.find((d) => !d.estimated);

  // Live sleeve data — shared between the lead headline and RegionCards.
  const { payload: regionsPayload, loading: regionsLoading } = useRegions();
  const regions = regionsPayload?.regions ?? [];

  // One-sentence editorial headline driven by the VEQT move + leading region.
  const leadCopy = useMemo(
    () => computeLeadHeadline(quote?.changePercent, regions),
    [quote?.changePercent, regions]
  );

  // 52-week range position, clamped so the dot is always fully visible.
  const rangePct =
    quote && quote.fiftyTwoWeekHigh > quote.fiftyTwoWeekLow
      ? ((quote.price - quote.fiftyTwoWeekLow) /
          (quote.fiftyTwoWeekHigh - quote.fiftyTwoWeekLow)) *
        100
      : null;
  const rangeDotPct = rangePct !== null ? Math.min(97, Math.max(3, rangePct)) : null;

  // Editorial framing of where we are in the range.
  const rangeCaption = (() => {
    if (rangePct === null) return "";
    if (!quote) return "";
    const highDist = quote.fiftyTwoWeekHigh - quote.price;
    const lowDist = quote.price - quote.fiftyTwoWeekLow;
    if (rangePct >= 97) return "at the 52-week high";
    if (rangePct >= 90)
      return `$${highDist.toFixed(2)} from the 52-week high`;
    if (rangePct >= 75) return "pressing the highs";
    if (rangePct <= 3) return "at the 52-week low";
    if (rangePct <= 10) return `$${lowDist.toFixed(2)} from the 52-week low`;
    if (rangePct <= 25) return "pressing the lows";
    return `${rangePct.toFixed(0)}% of range`;
  })();

  return (
    <div
      data-broadsheet
      className="min-h-screen relative overflow-x-hidden"
      style={{ backgroundColor: "var(--paper)" }}
    >
      <div className="mx-auto max-w-[1200px] px-5 sm:px-8 lg:px-12 relative">
        <Masthead quote={quote} loading={loading} />

        {/* ─────────────────────── THE LEAD ─────────────────────── */}
        <section className="py-7 sm:py-10 lg:py-12 bs-enter">
          <div className="max-w-[52rem]">
            {/* Price — the anchor */}
            <div className="flex items-baseline gap-x-4 gap-y-2 flex-wrap">
              <p className="bs-display bs-numerals text-[3.25rem] sm:text-[4.5rem] lg:text-[5.5rem] leading-[0.88] text-[var(--ink)]">
                {loading || !quote ? "—" : `$${quote.price.toFixed(2)}`}
              </p>
              {!loading && quote && (
                <p
                  className="bs-numerals text-lg sm:text-xl lg:text-2xl"
                  style={{
                    color: isPositive
                      ? "var(--print-green)"
                      : "var(--print-red)",
                  }}
                >
                  {isPositive ? "▲" : "▼"} {isPositive ? "+" : "−"}$
                  {Math.abs(quote.change).toFixed(2)}
                  <span className="opacity-70 ml-1.5">
                    ({isPositive ? "+" : ""}
                    {quote.changePercent.toFixed(2)}%)
                  </span>
                </p>
              )}
            </div>

            {/* Single-sentence headline derived from real data */}
            <h2
              className="bs-display-italic text-[1.375rem] sm:text-[1.625rem] lg:text-[2rem] leading-[1.1] mt-5 text-[var(--ink)] max-w-[30ch]"
            >
              {leadCopy.headline}
            </h2>

            {/* ── Supporting data strip ── */}
            <div className="mt-7 sm:mt-9 pt-5 border-t border-[var(--ink)] grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-7 sm:gap-10">
              {/* 52-week range */}
              {quote && rangePct !== null && rangeDotPct !== null && (
                <div>
                  <p className="bs-label mb-2">52-week range</p>
                  <div className="relative h-px bg-[var(--ink)]">
                    <span
                      aria-hidden
                      className="absolute w-2.5 h-2.5 rounded-full bg-[var(--stamp)] -translate-y-1/2 -translate-x-1/2 top-1/2"
                      style={{ left: `${rangeDotPct}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-2 bs-numerals text-sm">
                    <span>${quote.fiftyTwoWeekLow.toFixed(2)}</span>
                    <span>${quote.fiftyTwoWeekHigh.toFixed(2)}</span>
                  </div>
                  <p
                    className="bs-caption italic text-[12px] mt-1"
                    style={{ color: "var(--ink-soft)" }}
                  >
                    {rangeCaption}
                  </p>
                </div>
              )}

              {/* Key stats — three inline facts */}
              <div className="grid grid-cols-3 gap-4 items-start">
                <div>
                  <p className="bs-label">MER</p>
                  <p className="bs-numerals text-[1rem] mt-1">
                    ~{STATIC_DATA.mer.toFixed(2)}%
                  </p>
                </div>
                <div>
                  <p className="bs-label">AUM</p>
                  <p className="bs-numerals text-[1rem] mt-1">
                    {STATIC_DATA.aum}
                  </p>
                </div>
                <div>
                  <p className="bs-label">Yield</p>
                  <p className="bs-numerals text-[1rem] mt-1">
                    {trailingYield !== null
                      ? `${trailingYield.toFixed(2)}%`
                      : "—"}
                  </p>
                </div>
              </div>
            </div>

            {latestDist && (
              <p
                className="bs-caption italic mt-4 text-[12px]"
                style={{ color: "var(--ink-soft)" }}
              >
                Last distribution ${latestDist.amount.toFixed(4)} &middot;
                ex-div{" "}
                {new Date(
                  latestDist.exDate + "T00:00:00"
                ).toLocaleDateString("en-CA", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}{" "}
                &middot;{" "}
                <Link href="/distributions" className="bs-link">
                  all distributions
                </Link>
              </p>
            )}
          </div>
        </section>

        {/* ─────────────────────── THE REGIONS ─────────────────────── */}
        <section className="py-8 sm:py-12 bs-enter">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 mb-8">
            <div className="lg:col-span-5">
              <p className="bs-stamp mb-2">Regional contribution</p>
              <h3 className="bs-display text-3xl sm:text-4xl lg:text-[2.75rem] leading-[1]">
                Where today&apos;s move
                <br />
                <em className="bs-display-italic">came from.</em>
              </h3>
            </div>
            <p className="lg:col-span-7 bs-body">
              VEQT holds four Vanguard index ETFs — one per major equity
              region. Each card shows how that sleeve moved today and what it
              contributed to the fund. Rebalancing happens automatically
              inside the fund; your job is not to sell.
            </p>
          </div>

          <RegionCards regions={regions} loading={regionsLoading} />
        </section>

        {/* ─────────────────────── FROM THE SUBREDDIT ─────────────────────── */}
        <section className="py-8 sm:py-12 bs-enter">
          <Letters />
        </section>

        {/* ─────────────────── INCEPTION CALCULATOR ─────────────────── */}
        <section className="py-8 sm:py-12 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 bs-enter">
          <div className="lg:col-span-5 order-2 lg:order-1">
            <table className="w-full bs-numerals">
              <tbody>
                <tr className="border-t border-[var(--ink)]">
                  <td className="py-3 bs-label">At inception</td>
                  <td className="py-3 text-right text-lg">
                    ${formatCAD(investment)}
                  </td>
                </tr>
                <tr className="border-t border-[var(--color-border)]">
                  <td className="py-3 bs-label">Today</td>
                  <td className="py-3 text-right text-2xl font-semibold">
                    {calcResult !== null
                      ? `$${formatCAD(calcResult, 0)}`
                      : "—"}
                  </td>
                </tr>
                <tr className="border-t border-[var(--color-border)]">
                  <td className="py-3 bs-label">Return</td>
                  <td
                    className="py-3 text-right text-lg"
                    style={{
                      color:
                        calcReturn !== null && calcReturn >= 0
                          ? "var(--print-green)"
                          : "var(--print-red)",
                    }}
                  >
                    {calcReturn !== null
                      ? `${calcReturn >= 0 ? "+" : ""}${calcReturn.toFixed(1)}%`
                      : "—"}
                  </td>
                </tr>
                <tr className="border-t border-b border-[var(--ink)]">
                  <td className="py-3 bs-label">Since</td>
                  <td className="py-3 text-right text-lg">Jan 2019</td>
                </tr>
              </tbody>
            </table>
            <p className="bs-caption mt-4">
              Price return only. Excludes reinvested distributions, which
              would add several percentage points. Past performance is a
              terrible predictor of future performance.
            </p>
          </div>

          <div className="lg:col-span-7 order-1 lg:order-2">
            <p className="bs-stamp mb-2">Inception calculator</p>
            <h3 className="bs-display text-3xl sm:text-4xl lg:text-[2.75rem] leading-[1]">
              If you&apos;d bought{" "}
              <span className="inline-flex items-baseline gap-1 text-[var(--stamp)]">
                <span className="text-xl sm:text-2xl">$</span>
                <input
                  type="number"
                  min={100}
                  step={100}
                  value={investment}
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10);
                    if (!isNaN(v) && v > 0) setInvestment(v);
                  }}
                  className="bg-transparent border-b-2 border-[var(--stamp)] outline-none w-[5.5ch] text-center tabular-nums focus:border-[var(--ink)] transition-colors"
                  aria-label="Investment amount"
                />
              </span>{" "}
              of VEQT at launch.
            </h3>
            <p className="bs-body mt-5 max-w-lg">
              Edit the number — the math updates as you type. The sidebar
              keeps score.
            </p>
            <Link
              href="/invest"
              className="bs-label mt-4 inline-block hover:text-[var(--stamp)] transition-colors"
            >
              More calculators, drawdowns, reinvested-dividend math &rarr;
            </Link>
          </div>
        </section>

        {/* ─────────────────────── COMPARISON TABLE ─────────────────────── */}
        <section className="py-8 sm:py-12 bs-enter">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 mb-6">
            <div className="lg:col-span-5">
              <p className="bs-stamp mb-2">Head to head</p>
              <h3 className="bs-display text-3xl sm:text-4xl lg:text-[2.75rem] leading-[1]">
                VEQT <em className="bs-display-italic">vs.</em>
                <br />
                the field.
              </h3>
            </div>
            <p className="lg:col-span-7 bs-body">
              Three ETFs, one job: own the world. The differences between
              them are smaller than Reddit will have you believe, but they
              are not zero. Vanguard leans Canadian; iShares leans American;
              BMO is the youngest of the three.
            </p>
          </div>

          <table className="w-full bs-numerals border-t border-b border-[var(--ink)]">
            <thead>
              <tr>
                <th className="bs-label text-left py-3 hidden sm:table-cell"></th>
                <th className="bs-label text-left py-3">Ticker</th>
                <th className="bs-label text-left py-3">MER</th>
                <th className="bs-label text-left py-3">AUM</th>
                <th className="bs-label text-left py-3 hidden sm:table-cell">Holdings</th>
                <th className="bs-label text-left py-3">Inception</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON_DATA.etfs.map((etf, idx) => (
                <tr
                  key={etf.ticker}
                  className={
                    idx === 0
                      ? "border-t-2 border-[var(--ink)]"
                      : "border-t border-[var(--color-border)]"
                  }
                >
                  <td className="py-4 font-serif italic hidden sm:table-cell">{etf.name}</td>
                  <td className="py-4 font-mono text-sm tracking-wider">
                    <span className="sm:hidden bs-display-italic not-italic font-serif italic text-[var(--ink-soft)] text-xs block mb-1 tracking-normal">{etf.name}</span>
                    {etf.ticker}
                    {etf.ticker === "VEQT" && (
                      <span
                        className="ml-2 inline-block align-middle"
                        style={{
                          fontFamily: "var(--font-sans)",
                          fontWeight: 700,
                          fontSize: "9px",
                          letterSpacing: "0.14em",
                          textTransform: "uppercase",
                          color: "var(--stamp)",
                          padding: "2px 6px 1px",
                          border: "1px solid var(--stamp)",
                          borderRadius: "1px",
                          lineHeight: 1.1,
                        }}
                      >
                        House Choice
                      </span>
                    )}
                  </td>
                  <td className="py-4 tabular-nums">{etf.mer}</td>
                  <td className="py-4 tabular-nums">{etf.aum}</td>
                  <td className="py-4 tabular-nums hidden sm:table-cell">{etf.holdings}</td>
                  <td className="py-4 tabular-nums">{etf.inception}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="bs-caption mt-4 text-right">
            <Link href="/compare" className="bs-link">
              Full head-to-head &rarr;
            </Link>
          </p>
        </section>

        {/* ─────────────────── LEARN DISPATCHES ─────────────────── */}
        <section className="py-8 sm:py-12 bs-enter">
          <div className="mb-8">
            <p className="bs-stamp mb-2">From the archive</p>
            <h3 className="bs-display text-3xl sm:text-4xl lg:text-[2.75rem] leading-[1]">
              Three to start with.
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
            {LEARN_ARTICLES.map((article, i) => (
              <article key={article.slug} className="flex flex-col">
                <p className="bs-label mb-2">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <Link href={`/learn/${article.slug}`} className="group block">
                  <h4 className="bs-display-italic text-[1.5rem] sm:text-[1.75rem] leading-[1.08] group-hover:text-[var(--stamp)] transition-colors">
                    {article.title}
                  </h4>
                </Link>
                <p className="bs-body mt-3 flex-1 text-[0.9375rem] leading-[1.5]">
                  {article.teaser}
                </p>
                <Link
                  href={`/learn/${article.slug}`}
                  className="bs-label mt-4 inline-flex items-center hover:text-[var(--stamp)] transition-colors"
                >
                  Read it &rarr;
                </Link>
              </article>
            ))}
          </div>
          <p className="bs-caption mt-8 text-right">
            <Link href="/learn" className="bs-link">
              Twenty more articles in the archive &rarr;
            </Link>
          </p>
        </section>

        <Colophon />
      </div>
    </div>
  );
}
