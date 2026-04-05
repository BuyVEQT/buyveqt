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
      }, 350);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <span
      className={`inline-block transition-all duration-350 font-serif italic text-[var(--color-brand)] ${
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
    <section className="hero-gradient py-12 sm:py-16 lg:py-20">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-10 lg:gap-16">
        {/* Left: Editorial copy — asymmetric width for visual tension */}
        <div className="lg:max-w-[58%] animate-fade-up">
          {/* Section label */}
          <p className="section-label mb-4">The Global ETF</p>

          <h1 className="font-serif text-4xl sm:text-5xl md:text-[3.5rem] lg:text-[4rem] font-normal tracking-tight text-[var(--color-text-primary)] leading-[1.08]">
            One ETF.
            <br />
            The whole world.
            <br />
            <span className="text-[var(--color-text-muted)] text-3xl sm:text-4xl md:text-[2.75rem]">
              VEQT, <RotatingWord />.
            </span>
          </h1>

          {/* Editorial rule */}
          <div className="editorial-rule my-6 sm:my-8 max-w-xs" />

          {/* Stat pills */}
          <div className="flex flex-wrap gap-3 animate-fade-up delay-2">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--color-brand)]/15 bg-[var(--color-brand)]/[0.04]">
              <span ref={stocks.ref} className="text-sm font-semibold text-[var(--color-brand)] tabular-nums tracking-tight">
                {stocks.value.toLocaleString()}+
              </span>
              <span className="text-xs text-[var(--color-text-muted)]">stocks</span>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--color-chart-line)]/15 bg-[var(--color-chart-line)]/[0.04]">
              <span ref={countries.ref} className="text-sm font-semibold text-[var(--color-chart-line)] tabular-nums tracking-tight">
                {countries.value}+
              </span>
              <span className="text-xs text-[var(--color-text-muted)]">countries</span>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--color-accent)]/20 bg-[var(--color-accent)]/[0.04]">
              <span className="text-sm font-semibold text-[var(--color-accent)]">~0.20%</span>
              <span className="text-xs text-[var(--color-text-muted)]">MER</span>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3 animate-fade-up delay-3">
            <Link
              href="/compare"
              className="inline-flex items-center px-6 py-3 rounded-lg bg-[var(--color-brand)] text-white text-sm font-semibold hover:bg-[var(--color-brand-dark)] transition-all hover:shadow-lg hover:shadow-[var(--color-brand)]/10"
            >
              Compare VEQT vs XEQT
            </Link>
            <Link
              href="/inside-veqt"
              className="inline-flex items-center px-6 py-3 rounded-lg border border-[var(--color-border)] text-sm font-semibold text-[var(--color-text-secondary)] hover:bg-[var(--color-card)] hover:border-[var(--color-border-light)] transition-all"
            >
              See what&apos;s inside VEQT
            </Link>
          </div>
        </div>

        {/* Right: Live Summary Card */}
        <div className="w-full lg:w-auto lg:min-w-[320px] space-y-3 animate-fade-up delay-2">
          {showQuoteUnavailable ? (
            <DataUnavailable type="quote" />
          ) : (
            <div className="card-editorial p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-positive)] animate-pulse" />
                <p className="section-label">
                  Live Summary
                </p>
              </div>

              {loading ? (
                <div className="space-y-3">
                  <div className="skeleton h-9 w-36" />
                  <div className="skeleton h-5 w-24" />
                  <div className="skeleton h-4 w-full" />
                  <div className="skeleton h-4 w-full" />
                </div>
              ) : quote && (
                <>
                  <div className="flex items-baseline gap-2 mb-1.5">
                    <span className="font-serif text-3xl font-normal tabular-nums tracking-tight">
                      ${quote.price.toFixed(2)}
                    </span>
                    <span className="text-xs text-[var(--color-text-muted)] font-medium tracking-wide">CAD</span>
                  </div>
                  <div className="flex items-center gap-2 mb-5">
                    <span
                      className={`text-sm font-semibold tabular-nums px-2 py-0.5 rounded-md ${
                        isPositive
                          ? "text-[var(--color-positive)] bg-[var(--color-positive-bg)]"
                          : "text-[var(--color-negative)] bg-[var(--color-negative-bg)]"
                      }`}
                    >
                      {isPositive ? "+" : ""}${Math.abs(quote.change).toFixed(2)} ({isPositive ? "+" : ""}{quote.changePercent.toFixed(2)}%)
                    </span>
                  </div>

                  {/* Thin rule */}
                  <div className="border-t border-[var(--color-border)] mb-4" />

                  <div className="space-y-2.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[var(--color-text-muted)]">MER</span>
                      <span className="font-medium group relative cursor-help">
                        ~{STATIC_DATA.mer.toFixed(2)}%*
                        <span className="invisible group-hover:visible absolute bottom-full right-0 w-64 p-2.5 text-[11px] text-[var(--color-text-muted)] bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg shadow-xl z-10 font-normal leading-relaxed">
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
                        <span className="text-[var(--color-text-muted)]">52-Wk Range</span>
                        <span className="font-medium tabular-nums">
                          ${quote.fiftyTwoWeekLow.toFixed(2)} – ${quote.fiftyTwoWeekHigh.toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-[var(--color-border)]">
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

          {isCache && quoteFetchedAt && (
            <StaleBanner fetchedAt={quoteFetchedAt} />
          )}
        </div>
      </div>
    </section>
  );
}
