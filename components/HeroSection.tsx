"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import type { VeqtQuote, DataSourceType } from "@/lib/types";
import { STATIC_DATA, MER_FOOTNOTE } from "@/lib/constants";
import DataFreshness from "@/components/ui/DataFreshness";
import StaleBanner from "@/components/ui/StaleBanner";
import DataUnavailable from "@/components/ui/DataUnavailable";

interface HeroSectionProps {
  quote: VeqtQuote | null;
  loading: boolean;
  isFallback: boolean;
  quoteSource?: DataSourceType;
  quoteFetchedAt?: string;
}

function useCountUp(target: number, duration = 1200, decimals = 0) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const animate = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            // ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(parseFloat((eased * target).toFixed(decimals)));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration, decimals]);

  return { value, ref };
}

const ROTATING_WORDS = ["understood", "compared", "chosen"];

function RotatingWord() {
  const [index, setIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % ROTATING_WORDS.length);
        setIsVisible(true);
      }, 300);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <span
      className={`inline-block transition-all duration-300 text-[var(--color-brand)] ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      }`}
    >
      {ROTATING_WORDS[index]}
    </span>
  );
}

export default function HeroSection({
  quote,
  loading,
  isFallback,
  quoteSource,
  quoteFetchedAt,
}: HeroSectionProps) {
  const isPositive = (quote?.changePercent ?? 0) >= 0;

  const stocks = useCountUp(13700, 1400);
  const countries = useCountUp(50, 1000);

  const showQuoteUnavailable = !loading && !quote;
  const isCache = quoteSource === "cache";

  return (
    <section className="py-10 sm:py-14">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8 lg:gap-12">
        {/* Left: Copy */}
        <div className="lg:max-w-[55%]">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[var(--color-text-primary)] leading-[1.15]">
            One ETF.
            <br />
            The whole world.
            <br />
            <span className="text-[var(--color-text-muted)] font-medium text-2xl sm:text-3xl md:text-4xl">
              VEQT, <RotatingWord />.
            </span>
          </h1>

          {/* Animated stat pills */}
          <div className="mt-5 flex flex-wrap gap-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--color-brand)]/[0.07] border border-[var(--color-brand)]/20">
              <span ref={stocks.ref} className="text-sm font-bold text-[var(--color-brand)] tabular-nums">
                {stocks.value.toLocaleString()}+
              </span>
              <span className="text-xs text-[var(--color-text-muted)]">stocks</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--color-chart-line)]/[0.07] border border-[var(--color-chart-line)]/20">
              <span ref={countries.ref} className="text-sm font-bold text-[var(--color-chart-line)] tabular-nums">
                {countries.value}+
              </span>
              <span className="text-xs text-[var(--color-text-muted)]">countries</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#8b5cf6]/[0.07] border border-[#8b5cf6]/20">
              <span className="text-sm font-bold text-[#8b5cf6]">~0.20%</span>
              <span className="text-xs text-[var(--color-text-muted)]">MER</span>
            </div>
          </div>

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
        <div className="w-full lg:w-auto lg:min-w-[300px] space-y-3">
          {showQuoteUnavailable ? (
            <DataUnavailable type="quote" />
          ) : (
            <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-5">
              <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-3">
                Live Summary
              </p>

              {loading ? (
                <div className="space-y-3">
                  <div className="skeleton h-8 w-32" />
                  <div className="skeleton h-4 w-24" />
                  <div className="skeleton h-4 w-full" />
                  <div className="skeleton h-4 w-full" />
                </div>
              ) : quote && (
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
                      <span className="font-medium group relative cursor-help">
                        ~{STATIC_DATA.mer.toFixed(2)}%*
                        <span className="invisible group-hover:visible absolute bottom-full right-0 w-64 p-2 text-[11px] text-[var(--color-text-muted)] bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg shadow-lg z-10 font-normal leading-relaxed">
                          {MER_FOOTNOTE}
                        </span>
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--color-text-muted)]">AUM</span>
                      <span className="font-medium">{STATIC_DATA.aum}</span>
                    </div>
                    {quote.dividendYield > 0 && (
                      <div className="flex justify-between">
                        <span className="text-[var(--color-text-muted)]">Dividend Yield</span>
                        <span className="font-medium">{quote.dividendYield.toFixed(2)}%</span>
                      </div>
                    )}
                    {quote.fiftyTwoWeekHigh > 0 && quote.fiftyTwoWeekLow > 0 && (
                      <div className="flex justify-between">
                        <span className="text-[var(--color-text-muted)]">52-Week Range</span>
                        <span className="font-medium tabular-nums">
                          ${quote.fiftyTwoWeekLow.toFixed(2)} – ${quote.fiftyTwoWeekHigh.toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Data freshness indicator */}
                  <div className="mt-3 pt-3 border-t border-[var(--color-border)]">
                    {quoteSource && quoteFetchedAt ? (
                      <DataFreshness source={quoteSource} fetchedAt={quoteFetchedAt} />
                    ) : (
                      <p className="text-[11px] text-[var(--color-text-muted)]">
                        {isFallback ? "Data may be delayed" : `Updated just now`}
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Stale banner below the card when data is cached */}
          {isCache && quoteFetchedAt && (
            <StaleBanner fetchedAt={quoteFetchedAt} />
          )}
        </div>
      </div>
    </section>
  );
}
