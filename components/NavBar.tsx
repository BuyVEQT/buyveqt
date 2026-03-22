"use client";

import type { VeqtQuote } from "@/lib/types";
import { useTheme } from "@/lib/ThemeContext";

interface NavBarProps {
  quote: VeqtQuote | null;
  loading: boolean;
  isFallback: boolean;
}

export default function NavBar({ quote, loading, isFallback }: NavBarProps) {
  const isPositive = (quote?.changePercent ?? 0) >= 0;
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-base)]/95 backdrop-blur-sm transition-colors duration-200">
      <div className="mx-auto max-w-7xl px-4 h-14 flex items-center justify-between gap-4">
        {/* Left: Logo + Ticker */}
        <div className="flex items-center gap-5 min-w-0">
          <span className="text-lg font-bold tracking-tight shrink-0">
            Buy<span className="text-[var(--color-accent)]">VEQT</span>
          </span>

          {/* Ticker */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 text-sm min-w-0 whitespace-nowrap">
            {loading || !quote ? (
              <div className="skeleton h-5 w-32" />
            ) : (
              <>
                <span className="font-semibold tabular-nums">
                  ${quote.price.toFixed(2)}
                </span>
                <span
                  className={`font-medium tabular-nums ${
                    isPositive
                      ? "text-[var(--color-positive)]"
                      : "text-[var(--color-negative)]"
                  }`}
                >
                  {isPositive ? "+" : ""}
                  {quote.changePercent.toFixed(2)}%
                </span>
                {isFallback && (
                  <span className="text-[10px] text-[var(--color-text-muted)]">
                    delayed
                  </span>
                )}
              </>
            )}
          </div>
        </div>

        {/* Right: Social links + Theme toggle */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          <a
            href="https://reddit.com/r/BuyVEQT"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            JustBuyVEQT
          </a>
          <a
            href="https://twitter.com/BuyVEQT"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
            aria-label="Follow on X"
          >
            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="relative w-8 h-8 flex items-center justify-center rounded-lg bg-[var(--color-toggle-bg)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-all duration-200"
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
          >
            {/* Sun icon */}
            <svg
              className={`w-4 h-4 absolute transition-all duration-300 ${
                theme === "light"
                  ? "opacity-100 rotate-0 scale-100"
                  : "opacity-0 rotate-90 scale-0"
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <circle cx="12" cy="12" r="5" />
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
            {/* Moon icon */}
            <svg
              className={`w-4 h-4 absolute transition-all duration-300 ${
                theme === "dark"
                  ? "opacity-100 rotate-0 scale-100"
                  : "opacity-0 -rotate-90 scale-0"
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
}
