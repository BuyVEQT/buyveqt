"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { VeqtQuote, DataSourceType } from "@/lib/types";
import { NAV_LINKS, NAV_LINKS_SECONDARY } from "@/lib/constants";
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

  // Close drawer on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    if (menuOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [menuOpen]);

  const isActive = useCallback(
    (href: string) => {
      if (href === "/") return pathname === "/";
      return pathname === href || pathname.startsWith(href + "/");
    },
    [pathname]
  );

  return (
    <>
      <nav className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-white/95 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between gap-3">
          {/* Left: Logo */}
          <Link href="/" className="text-lg font-bold tracking-tight shrink-0">
            Buy<span className="text-[var(--color-brand)]">VEQT</span>
          </Link>

          {/* Center: Desktop Nav Links — show at lg to avoid crowding with ticker */}
          <div className="hidden lg:flex items-center gap-0.5">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-2.5 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  isActive(link.href)
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
              className="lg:hidden p-1.5 rounded-md text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-base)]"
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
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
      </nav>

      {/* Mobile drawer overlay — visible below lg */}
      {menuOpen && (
        <div className="lg:hidden fixed inset-0 z-40" aria-modal="true" role="dialog">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-[2px] transition-opacity"
            onClick={() => setMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer panel */}
          <div className="absolute top-14 right-0 w-64 max-h-[calc(100dvh-3.5rem)] bg-white border-l border-[var(--color-border)] shadow-xl overflow-y-auto animate-slide-in-right">
            <div className="p-4">
              {/* Primary nav */}
              <div className="space-y-1">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive(link.href)
                        ? "text-[var(--color-brand)] bg-[var(--color-brand)]/5 border-l-2 border-[var(--color-brand)]"
                        : "text-[var(--color-text-primary)] hover:bg-[var(--color-base)]"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              {/* Divider */}
              <div className="my-3 border-t border-[var(--color-border)]" />

              {/* Secondary nav */}
              <div className="space-y-1">
                {NAV_LINKS_SECONDARY.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                      isActive(link.href)
                        ? "text-[var(--color-brand)] bg-[var(--color-brand)]/5 border-l-2 border-[var(--color-brand)] font-medium"
                        : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-base)]"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
