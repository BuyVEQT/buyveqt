"use client";

import Link from "next/link";
import type { VeqtQuote } from "@/lib/types";
import { STATIC_DATA } from "@/lib/constants";

interface HeroSectionProps {
  quote: VeqtQuote | null;
  loading: boolean;
  isFallback: boolean;
}

function timeSince(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ago`;
}

export default function HeroSection({ quote, loading, isFallback }: HeroSectionProps) {
  const isPositive = (quote?.changePercent ?? 0) >= 0;

  return (
    <section className="py-10 sm:py-14">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8 lg:gap-12">
        {/* Left: Copy */}
        <div className="lg:max-w-[55%]">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--color-text-primary)] leading-tight">
            VEQT, explained simply.
          </h1>
          <p className="mt-3 text-base sm:text-lg text-[var(--color-text-muted)] leading-relaxed max-w-prose">
            Track performance, compare VEQT to other all-in-one ETFs, and see
            what&apos;s actually inside the fund.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/compare"
              className="inline-flex items-center px-5 py-2.5 rounded-lg bg-[var(--color-brand)] text-white text-sm font-semibold hover:bg-[var(--color-brand-dark)] transition-colors"
            >
              Compare VEQT vs XEQT
            </Link>
            <Link
              href="/inside-veqt"
              className="inline-flex items-center px-5 py-2.5 rounded-lg border border-[var(--color-border)] text-sm font-semibold text-[var(--color-text-secondary)] hover:bg-[var(--color-base)] transition-colors"
            >
              See what&apos;s inside VEQT
            </Link>
          </div>
        </div>

        {/* Right: Live Summary Card */}
        <div className="w-full lg:w-auto lg:min-w-[300px] rounded-lg border border-[var(--color-border)] bg-white p-5">
          <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-3">
            Live Summary
          </p>

          {loading || !quote ? (
            <div className="space-y-3">
              <div className="skeleton h-8 w-32" />
              <div className="skeleton h-4 w-24" />
              <div className="skeleton h-4 w-full" />
              <div className="skeleton h-4 w-full" />
            </div>
          ) : (
            <>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-2xl font-bold tabular-nums">
                  ${quote.price.toFixed(2)}
                </span>
                <span className="text-xs text-[var(--color-text-muted)]">CAD</span>
              </div>
              <div className="flex items-center gap-2 mb-4">
                <span
                  className={`text-sm font-medium tabular-nums px-1.5 py-0.5 rounded ${
                    isPositive
                      ? "text-[var(--color-positive)] bg-[var(--color-positive-bg)]"
                      : "text-[var(--color-negative)] bg-[var(--color-negative-bg)]"
                  }`}
                >
                  {isPositive ? "+" : ""}${Math.abs(quote.change).toFixed(2)} ({isPositive ? "+" : ""}{quote.changePercent.toFixed(2)}%)
                </span>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-muted)]">MER</span>
                  <span className="font-medium">{STATIC_DATA.mer}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-muted)]">AUM</span>
                  <span className="font-medium">{STATIC_DATA.aum}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-muted)]">Dividend Yield</span>
                  <span className="font-medium">{quote.dividendYield.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-muted)]">52-Week Range</span>
                  <span className="font-medium tabular-nums">
                    ${quote.fiftyTwoWeekLow.toFixed(2)} – ${quote.fiftyTwoWeekHigh.toFixed(2)}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-[var(--color-text-muted)] mt-3 pt-3 border-t border-[var(--color-border)]">
                {isFallback ? "Data may be delayed" : `Updated ${timeSince(quote.lastUpdated)}`}
              </p>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
