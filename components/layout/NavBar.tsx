"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { VeqtQuote, DataSourceType } from "@/lib/types";
import { NAV_LINKS } from "@/lib/constants";
import DataFreshness from "@/components/ui/DataFreshness";

interface NavBarProps {
  quote: VeqtQuote | null;
  loading: boolean;
  isFallback: boolean;
  quoteSource?: DataSourceType;
  quoteFetchedAt?: string;
}

export default function NavBar({ quote, loading, isFallback, quoteSource, quoteFetchedAt }: NavBarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const isPositive = (quote?.changePercent ?? 0) >= 0;
  const isCache = quoteSource === "cache";

  return (
    <nav className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-white/95 backdrop-blur-sm">
      <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between gap-3">
        {/* Left: Logo */}
        <Link href="/" className="text-lg font-bold tracking-tight shrink-0">
          Buy<span className="text-[var(--color-brand)]">VEQT</span>
        </Link>

        {/* Center: Desktop Nav Links — show at lg to avoid crowding with ticker */}
        <div className="hidden md:flex items-center gap-0.5">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-2.5 py-1.5 rounded-md text-sm font-medium transition-colors ${
                pathname === link.href
                  ? "text-[var(--color-text-primary)] bg-[var(--color-base)]"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-base)]"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right: Live Price + Mobile/Tablet Menu Button */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Live ticker */}
          <div className="flex items-center gap-1.5 text-sm">
            {loading ? (
              <div className="skeleton h-5 w-28" />
            ) : !quote ? (
              <span className="text-xs text-[var(--color-text-muted)]">
                VEQT: &mdash;
              </span>
            ) : (
              <>
                <span className="text-xs text-[var(--color-text-muted)] hidden sm:inline">
                  VEQT.TO
                </span>
                {/* Amber dot for cached data */}
                {isCache && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                )}
                <span className="font-semibold tabular-nums">
                  ${quote.price.toFixed(2)}
                </span>
                <span
                  className={`text-xs font-medium tabular-nums px-1.5 py-0.5 rounded ${
                    isPositive
                      ? "text-[var(--color-positive)] bg-[var(--color-positive-bg)]"
                      : "text-[var(--color-negative)] bg-[var(--color-negative-bg)]"
                  }`}
                >
                  {isPositive ? "+" : ""}
                  {quote.changePercent.toFixed(2)}%
                </span>
                {/* Wide desktop: show freshness timestamp */}
                {quoteSource && quoteFetchedAt && (
                  <span className="hidden lg:inline">
                    <DataFreshness
                      source={quoteSource}
                      fetchedAt={quoteFetchedAt}
                      compact
                    />
                  </span>
                )}
              </>
            )}
          </div>

          {/* Hamburger menu — visible below lg */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-1.5 rounded-md text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-base)]"
            aria-label="Toggle menu"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile/Tablet menu — visible below lg */}
      {menuOpen && (
        <div className="md:hidden border-t border-[var(--color-border)] bg-white px-4 py-2">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={`block px-3 py-2 rounded-md text-sm font-medium ${
                pathname === link.href
                  ? "text-[var(--color-text-primary)] bg-[var(--color-base)]"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
