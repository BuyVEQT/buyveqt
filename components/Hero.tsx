"use client";

import type { VeqtQuote } from "@/lib/types";

interface HeroProps {
  quote: VeqtQuote | null;
  loading: boolean;
  isFallback: boolean;
}

export default function Hero({ quote, loading, isFallback }: HeroProps) {
  const isPositive = (quote?.changePercent ?? 0) >= 0;

  return (
    <section className="relative overflow-hidden bg-[var(--color-vanguard-dark)] text-white">
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a0a0a] via-[#2a0f0f] to-[#1a0a0a]" />
      <div className="relative mx-auto max-w-5xl px-6 py-20 sm:py-28 text-center">
        <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight">
          Buy<span className="text-[var(--color-vanguard-red)]">VEQT</span>
        </h1>
        <p className="mt-4 text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto">
          The unofficial home for VEQT investors
        </p>

        <div className="mt-10 flex flex-col items-center gap-2">
          {loading || !quote ? (
            <div className="flex flex-col items-center gap-2">
              <div className="skeleton h-12 w-40" />
              <div className="skeleton h-6 w-28" />
            </div>
          ) : (
            <>
              <div className="text-5xl sm:text-6xl font-bold tabular-nums">
                ${quote.price.toFixed(2)}
                <span className="ml-2 text-sm font-medium text-gray-400">
                  CAD
                </span>
              </div>
              <div
                className={`text-lg font-semibold ${isPositive ? "text-[var(--color-positive)]" : "text-[var(--color-negative)]"}`}
              >
                {isPositive ? "▲" : "▼"}{" "}
                {isPositive ? "+" : ""}
                {quote.change.toFixed(2)} ({isPositive ? "+" : ""}
                {quote.changePercent.toFixed(2)}%)
              </div>
              {isFallback && (
                <p className="text-xs text-gray-500 mt-1">
                  Data may be delayed
                </p>
              )}
            </>
          )}
        </div>

        <div className="mt-10">
          <a
            href="https://reddit.com/r/BuyVEQT"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-vanguard-red)] px-8 py-3.5 text-base font-semibold text-white transition-all hover:bg-[var(--color-vanguard-red-light)] hover:shadow-lg hover:shadow-red-900/25 active:scale-[0.98]"
          >
            Join r/BuyVEQT
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M7 17L17 7M17 7H7M17 7V17" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
