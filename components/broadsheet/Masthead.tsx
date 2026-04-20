"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { VeqtQuote } from "@/lib/types";
import { isMarketOpen } from "@/lib/data/market-hours";

interface MastheadProps {
  quote: VeqtQuote | null;
  loading: boolean;
}

function formatPrice(n: number): string {
  return n.toLocaleString("en-CA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function todayInToronto(): { weekday: string; full: string; compact: string } {
  const now = new Date();
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Toronto",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const parts = Object.fromEntries(
    fmt.formatToParts(now).map((p) => [p.type, p.value])
  );
  // Compact form drops the year for mobile.
  return {
    weekday: parts.weekday ?? "",
    full: `${parts.weekday}, ${parts.month} ${parts.day}, ${parts.year}`,
    compact: `${parts.weekday}, ${parts.month} ${parts.day}`,
  };
}

const DEPARTMENTS = [
  { href: "/invest", label: "The Calculator" },
  { href: "/compare", label: "The Comparison" },
  { href: "/learn", label: "Learning" },
  { href: "/inside-veqt", label: "The Portfolio" },
  { href: "/community", label: "Community" },
];

const DRAWER_SECONDARY = [
  { href: "/distributions", label: "Distributions" },
  { href: "/methodology", label: "Methodology" },
];

export default function Masthead({ quote, loading }: MastheadProps) {
  const [date, setDate] = useState(() => ({
    full: "",
    weekday: "",
    compact: "",
  }));
  const [marketOpen, setMarketOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const tick = () => {
      setDate(todayInToronto());
      setMarketOpen(isMarketOpen());
    };
    tick();
    const interval = setInterval(tick, 60_000);
    return () => clearInterval(interval);
  }, []);

  // Close drawer on Escape; lock body scroll while open.
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawerOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  const isPositive = (quote?.changePercent ?? 0) >= 0;

  return (
    <header className="border-b border-[var(--ink)] pt-3 pb-2 relative z-10">
      {/* ── Top strip: wire state + date + hamburger (mobile only) ── */}
      <div className="flex items-center justify-between gap-3 pb-2 sm:pb-3">
        {marketOpen ? (
          <span className="bs-stamp">
            <span className="bs-live-dot" />
            Live Wire
          </span>
        ) : (
          <span className="bs-label text-[var(--ink-soft)]">
            <span
              aria-hidden
              className="inline-block w-[6px] h-[6px] rounded-full bg-[var(--ink-soft)] align-middle mr-[0.45em]"
            />
            After Hours
          </span>
        )}

        {/* Date — compact on mobile, full on desktop */}
        <span className="bs-label tabular-nums text-[var(--ink-soft)] text-center flex-1 sm:flex-none">
          <span className="hidden sm:inline">{date.full || "\u00A0"}</span>
          <span className="sm:hidden">{date.compact || "\u00A0"}</span>
        </span>

        {/* Desktop: nothing on right (kept minimal). Mobile: hamburger. */}
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="sm:hidden inline-flex items-center gap-2 bs-label hover:text-[var(--stamp)] transition-colors"
          aria-label="Open navigation"
          aria-expanded={drawerOpen}
        >
          <svg
            width="16"
            height="12"
            viewBox="0 0 16 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden
          >
            <line x1="0" y1="1" x2="16" y2="1" />
            <line x1="0" y1="6" x2="16" y2="6" />
            <line x1="0" y1="11" x2="16" y2="11" />
          </svg>
          <span className="hidden xs:inline">Menu</span>
        </button>
        <span className="hidden sm:inline w-[72px]" aria-hidden />
      </div>

      <div className="bs-rule-thick" />

      {/* ── Nameplate — scales down sharply on mobile ── */}
      <div className="py-3 sm:py-5 flex items-end justify-between gap-4">
        <Link href="/" className="block min-w-0 flex-1">
          <h1 className="bs-display text-[2rem] sm:text-6xl lg:text-[7rem] leading-[0.9] sm:leading-[0.82] tracking-[-0.02em] sm:tracking-[-0.03em] text-[var(--ink)]">
            The VEQT Daily
          </h1>
          <p className="bs-caption mt-1 sm:mt-2 hidden sm:block">
            A Canadian broadsheet for the lazy investor &mdash; priced, read, held.
          </p>
        </Link>

        {/* Desktop ticker block — large price at right edge */}
        <div className="hidden md:block text-right shrink-0">
          <p className="bs-label">VEQT.TO &middot; Last close</p>
          <p className="bs-numerals text-3xl lg:text-4xl font-medium mt-1">
            {loading || !quote ? "—" : `$${formatPrice(quote.price)}`}
          </p>
          {!loading && quote && (
            <p
              className="bs-numerals text-sm mt-0.5"
              style={{
                color: isPositive ? "var(--print-green)" : "var(--print-red)",
              }}
            >
              {isPositive ? "▲" : "▼"} {isPositive ? "+" : ""}
              {quote.changePercent.toFixed(2)}% &nbsp;({isPositive ? "+" : ""}
              ${Math.abs(quote.change).toFixed(2)})
            </p>
          )}
        </div>
      </div>

      <div className="bs-rule-thin" />

      {/* ── Department rail — desktop only. Mobile gets the drawer. ── */}
      <nav className="hidden sm:flex items-center gap-5 lg:gap-8 pt-2 pb-1 bs-label">
        {DEPARTMENTS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="whitespace-nowrap hover:text-[var(--stamp)] transition-colors"
          >
            {l.label}
          </Link>
        ))}
      </nav>

      {/* ── Mobile drawer ── */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-50 sm:hidden"
          role="dialog"
          aria-modal="true"
        >
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Close navigation"
            className="absolute inset-0 bg-[var(--ink)]/60"
            onClick={() => setDrawerOpen(false)}
          />

          {/* Panel */}
          <div
            className="absolute inset-y-0 right-0 w-[85%] max-w-[340px] bg-[var(--paper)] border-l border-[var(--ink)] p-6 flex flex-col animate-slide-in-right"
            style={{ boxShadow: "-10px 0 30px rgba(0,0,0,0.18)" }}
          >
            <div className="flex items-center justify-between pb-4 border-b border-[var(--ink)]">
              <span className="bs-stamp">The Masthead</span>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="bs-label p-1 hover:text-[var(--stamp)] transition-colors"
                aria-label="Close"
              >
                Close ×
              </button>
            </div>

            <nav className="mt-6 flex flex-col gap-1">
              {DEPARTMENTS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setDrawerOpen(false)}
                  className="bs-display text-2xl py-2 border-b border-[var(--color-border)] hover:text-[var(--stamp)] transition-colors"
                >
                  {l.label}
                </Link>
              ))}
            </nav>

            <div className="mt-8">
              <p className="bs-label mb-2">Also in the paper</p>
              <div className="flex flex-col gap-2">
                {DRAWER_SECONDARY.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setDrawerOpen(false)}
                    className="bs-link text-sm"
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="mt-auto pt-6 border-t border-[var(--color-border)]">
              <p className="bs-caption italic">
                Every Sunday, and whenever the market requires it.
              </p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
