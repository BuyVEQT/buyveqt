"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { VeqtQuote, DataSourceType } from "@/lib/types";
import { NAV_LINKS, NAV_LINKS_SECONDARY } from "@/lib/constants";
import DataFreshness from "@/components/ui/DataFreshness";
import { useTheme } from "@/components/ThemeProvider";

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
  const { theme, toggleTheme } = useTheme();
  const isPositive = (quote?.changePercent ?? 0) >= 0;
  const isCache = quoteSource === "cache";

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

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
      <nav className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-card)]/95 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between gap-3">
          {/* Logo — editorial serif treatment */}
          <Link href="/" className="shrink-0 group flex items-baseline gap-0.5">
            <span className="font-serif text-xl font-normal tracking-tight text-[var(--color-text-primary)]">
              Buy
            </span>
            <span className="font-serif text-xl font-normal tracking-tight text-[var(--color-brand)]">
              VEQT
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-0.5">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? "text-[var(--color-text-primary)] bg-[var(--color-base)]"
                    : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-base)]"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right: Ticker + Theme + Menu */}
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
                  <span className="text-xs text-[var(--color-text-muted)] hidden sm:inline tracking-wide">
                    VEQT.TO
                  </span>
                  {isCache && (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                  )}
                  <span className="font-semibold tabular-nums">
                    ${quote.price.toFixed(2)}
                  </span>
                  <span
                    className={`text-xs font-semibold tabular-nums px-1.5 py-0.5 rounded-md ${
                      isPositive
                        ? "text-[var(--color-positive)] bg-[var(--color-positive-bg)]"
                        : "text-[var(--color-negative)] bg-[var(--color-negative-bg)]"
                    }`}
                  >
                    {isPositive ? "+" : ""}
                    {quote.changePercent.toFixed(2)}%
                  </span>
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

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-md text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-base)] transition-colors"
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? (
                <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <circle cx="12" cy="12" r="5" />
                  <path strokeLinecap="round" d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                </svg>
              ) : (
                <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                </svg>
              )}
            </button>

            {/* Hamburger */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden p-1.5 rounded-md text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-base)] transition-colors"
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

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="lg:hidden fixed inset-0 z-40" aria-modal="true" role="dialog">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-[2px] transition-opacity"
            onClick={() => setMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute top-14 right-0 w-64 max-h-[calc(100dvh-3.5rem)] bg-[var(--color-card)] border-l border-[var(--color-border)] shadow-xl overflow-y-auto animate-slide-in-right">
            <div className="p-4">
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
              <div className="my-3 border-t border-[var(--color-border)]" />
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
