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
import OrnateRule from "@/components/broadsheet/OrnateRule";
import RegionCards from "@/components/broadsheet/RegionCards";
import Letters from "@/components/broadsheet/Letters";
import OnTheWire from "@/components/broadsheet/OnTheWire";
import Colophon from "@/components/broadsheet/Colophon";
import { useRegions } from "@/lib/useRegions";
import { useNews } from "@/lib/useNews";
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

  // Live sleeve data — shared between the dynamic lead eyebrow and RegionCards.
  const { payload: regionsPayload, loading: regionsLoading } = useRegions();
  const regions = regionsPayload?.regions ?? [];

  // Live financial news wire — drives the Lead quote line + the OnTheWire strip.
  const { payload: newsPayload, loading: newsLoading } = useNews();
  const newsItems = newsPayload?.items ?? [];
  const leadWireItem = newsItems[0] ?? null;

  // Package news payload into the NewsContext shape the headline function expects.
  const newsContext = useMemo(
    () =>
      newsPayload
        ? {
            sentiment: newsPayload.overall.sentiment,
            itemCount: newsPayload.items.length,
          }
        : undefined,
    [newsPayload]
  );

  // Dynamic editorial deck + headline + coda — magnitude × driving sleeve × wire alignment.
  const leadCopy = useMemo(
    () => computeLeadHeadline(quote?.changePercent, regions, newsContext),
    [quote?.changePercent, regions, newsContext]
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
        <section className="py-8 sm:py-12 lg:py-14 bs-enter">
          <div className="max-w-[52rem]">
            {/* Deck — small stamp, dynamic */}
            <p className="bs-stamp mb-3 sm:mb-4">{leadCopy.deck}</p>

            {/* Price — the anchor */}
            <div className="flex items-baseline gap-x-4 gap-y-2 flex-wrap">
              <p className="bs-display bs-numerals text-[3.5rem] sm:text-[5rem] lg:text-[6.25rem] leading-[0.88] text-[var(--ink)]">
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

            {/* Editorial headline — with optional news-sentiment coda */}
            <h2 className="bs-display-italic text-[1.5rem] sm:text-[1.875rem] lg:text-[2.5rem] leading-[1.08] mt-5 sm:mt-6 text-[var(--ink)] max-w-[28ch]">
              {leadCopy.headline}
              {leadCopy.coda && (
                <span
                  className="text-[var(--ink-soft)]"
                  style={{ fontStyle: "italic" }}
                >
                  {" "}
                  {leadCopy.coda}
                </span>
              )}
            </h2>

            {/* Wire quote — real news headline from AV NEWS_SENTIMENT,
                falls back to brand tagline when news is unavailable. */}
            {leadWireItem ? (
              <p
                className="bs-caption mt-4 text-[13px] sm:text-[14px] leading-[1.5]"
                style={{ color: "var(--ink-soft)" }}
              >
                <span
                  className="bs-stamp mr-1.5 align-middle"
                  style={{ fontSize: "10px" }}
                >
                  On the wire
                </span>
                <a
                  href={leadWireItem.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bs-link italic"
                >
                  &ldquo;{leadWireItem.title}&rdquo;
                </a>{" "}
                <span className="opacity-70 whitespace-nowrap">
                  &mdash; {leadWireItem.source}
                </span>
              </p>
            ) : (
              <p className="bs-caption italic mt-3 text-[13px] sm:text-[14px]">
                One fund &middot; ~13,700 companies &middot; 50+ countries
              </p>
            )}

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

        {/* ─────────────────── ON THE WIRE ─────────────────── */}
        {(newsLoading || newsItems.length > 1) && (
          <>
            <OrnateRule label="On the Wire" />
            <section className="py-6 sm:py-8 bs-enter">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-2">
                <div className="lg:col-span-5">
                  <h3 className="bs-display text-3xl sm:text-4xl lg:text-5xl leading-[0.98]">
                    Today, filed.
                  </h3>
                </div>
                <p className="lg:col-span-7 bs-caption italic max-w-lg">
                  Market news touching the four sleeves of VEQT, pulled
                  from the Alpha Vantage wire. Refreshed every six hours.
                  Publishers named; nothing rewritten.
                </p>
              </div>
              <OnTheWire
                items={newsItems}
                loading={newsLoading}
                leadItemIndex={0}
              />
            </section>
          </>
        )}

        <OrnateRule label="The Regions" />

        {/* ─────────────────────── THE REGIONS ─────────────────────── */}
        <section className="py-8 sm:py-12 bs-enter">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 mb-10">
            <div className="lg:col-span-5">
              <h3 className="bs-display text-4xl sm:text-5xl lg:text-6xl leading-[0.95]">
                Four sleeves.
                <br />
                <em className="bs-display-italic text-[var(--stamp)]">
                  One fund.
                </em>
              </h3>
            </div>
            <p className="lg:col-span-7 bs-body bs-lede">
              VEQT is not a stock. It is a single ticker that holds four
              Vanguard index ETFs covering every major equity market in the
              world. Rebalancing happens automatically inside the fund. Your
              only job, according to the people who coined the term, is not
              to sell. What follows is today&apos;s contribution from each
              sleeve.
            </p>
          </div>

          <RegionCards regions={regions} loading={regionsLoading} />
        </section>

        <OrnateRule label="If You Invested" />

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
              Price return only. Excludes reinvested distributions (which
              would add several percentage points). Past performance is a
              terrible predictor of future performance.
            </p>
          </div>

          <div className="lg:col-span-7 order-1 lg:order-2">
            <h3 className="bs-display text-4xl sm:text-5xl lg:text-6xl leading-[0.95]">
              <em className="bs-display-italic">Dear reader,</em>
              <br />
              imagine you bought{" "}
              <span className="inline-flex items-baseline gap-1 text-[var(--stamp)]">
                <span className="text-2xl">$</span>
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
              the day VEQT launched.
            </h3>
            <p className="bs-body mt-6 max-w-lg">
              Change the number &mdash; the arithmetic updates at the same
              speed as your editing. The sidebar keeps score.
            </p>
            <Link
              href="/invest"
              className="bs-label mt-4 inline-block hover:text-[var(--stamp)] transition-colors"
            >
              More calculators, drawdowns, reinvested-dividend math &rarr;
            </Link>
          </div>
        </section>

        <OrnateRule label="The Comparison" />

        {/* ─────────────────────── COMPARISON TABLE ─────────────────────── */}
        <section className="py-8 sm:py-12 bs-enter">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 mb-8">
            <div className="lg:col-span-5">
              <h3 className="bs-display text-4xl sm:text-5xl lg:text-6xl leading-[0.95]">
                VEQT <em className="bs-display-italic">vs.</em>
                <br />
                the field.
              </h3>
            </div>
            <p className="lg:col-span-7 bs-body bs-lede">
              Three ETFs, one job: own the world in equity weight. The
              differences are smaller than the internet would have you
              believe, but they are not zero. Vanguard leans a little more
              Canadian; iShares leans a little more American; BMO is the
              youngest of the three.
            </p>
          </div>

          <table className="w-full bs-numerals border-t border-b border-[var(--ink)]">
            <thead>
              <tr>
                <th className="bs-label text-left py-3"></th>
                <th className="bs-label text-left py-3">Ticker</th>
                <th className="bs-label text-left py-3">MER</th>
                <th className="bs-label text-left py-3">AUM</th>
                <th className="bs-label text-left py-3">Holdings</th>
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
                  <td className="py-4 font-serif italic">{etf.name}</td>
                  <td className="py-4 font-mono text-sm tracking-wider">
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
                  <td className="py-4 tabular-nums">{etf.holdings}</td>
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

        <OrnateRule label="Dispatches from the Archive" />

        {/* ─────────────────── LEARN DISPATCHES ─────────────────── */}
        <section className="py-8 sm:py-12 bs-enter">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
            {LEARN_ARTICLES.map((article, i) => (
              <article key={article.slug} className="flex flex-col">
                <p className="bs-stamp mb-2">
                  Dispatch No. {String(i + 1).padStart(2, "0")}
                </p>
                <Link href={`/learn/${article.slug}`} className="group block">
                  <h4 className="bs-display-italic text-[1.75rem] sm:text-[2rem] leading-[1.02] group-hover:text-[var(--stamp)] transition-colors">
                    {article.title}
                  </h4>
                </Link>
                <p className="bs-body mt-3 flex-1">{article.teaser}</p>
                <Link
                  href={`/learn/${article.slug}`}
                  className="bs-label mt-4 inline-flex items-center hover:text-[var(--stamp)] transition-colors"
                >
                  Read the dispatch &rarr;
                </Link>
              </article>
            ))}
          </div>
          <p className="bs-caption mt-8 text-center">
            <Link href="/learn" className="bs-link">
              Twenty more from the archive
            </Link>
          </p>
        </section>

        <OrnateRule label="Letters" />

        {/* ─────────────────────── LETTERS / COMMUNITY ─────────────────────── */}
        <section className="py-8 sm:py-12 bs-enter">
          <Letters />
        </section>

        <OrnateRule ornament="asterism" />

        <Colophon />
      </div>
    </div>
  );
}
