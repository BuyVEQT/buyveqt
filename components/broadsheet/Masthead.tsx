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

function todayInToronto(): { weekday: string; full: string } {
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
  return {
    weekday: parts.weekday ?? "",
    full: `${parts.weekday}, ${parts.month} ${parts.day}, ${parts.year}`,
  };
}

export default function Masthead({ quote, loading }: MastheadProps) {
  const [date, setDate] = useState(() => ({ full: "", weekday: "" }));
  const [marketOpen, setMarketOpen] = useState(false);

  // Compute dates + market state on the client so we don't mismatch SSR vs. locale.
  useEffect(() => {
    const tick = () => {
      setDate(todayInToronto());
      setMarketOpen(isMarketOpen());
    };
    tick();
    const interval = setInterval(tick, 60_000);
    return () => clearInterval(interval);
  }, []);

  const isPositive = (quote?.changePercent ?? 0) >= 0;

  return (
    <header className="border-b border-[var(--ink)] pt-4 pb-2 relative z-10">
      {/* Top strip — live state on the left, date center, community right */}
      <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.2em] font-sans pb-3">
        {marketOpen ? (
          <span className="bs-stamp hidden sm:inline">
            <span className="bs-live-dot" />
            Live Wire
          </span>
        ) : (
          <span className="bs-label hidden sm:inline text-[var(--ink-soft)]">
            <span
              aria-hidden
              className="inline-block w-[6px] h-[6px] rounded-full bg-[var(--ink-soft)] align-middle mr-[0.45em]"
            />
            After Hours
          </span>
        )}
        <span className="bs-label tabular-nums text-[var(--ink-soft)]">
          {date.full || "\u00A0"}
        </span>
        <Link
          href="/community"
          className="bs-label hover:text-[var(--stamp)] transition-colors hidden sm:inline"
        >
          The Community
        </Link>
      </div>

      {/* The big masthead title */}
      <div className="bs-rule-thick" />
      <div className="py-4 sm:py-5 flex items-end justify-between gap-4">
        <Link href="/" className="block">
          <h1 className="bs-display text-5xl sm:text-7xl lg:text-[7rem] leading-[0.82] tracking-[-0.03em] text-[var(--ink)]">
            The VEQT Daily
          </h1>
          <p className="bs-caption mt-2 hidden sm:block">
            A Canadian broadsheet for the lazy investor &mdash; priced, read, held.
          </p>
        </Link>

        {/* Ticker block — large price display to the right */}
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

      {/* Section shortcuts — a newspaper's department row */}
      <nav className="flex items-center gap-5 sm:gap-8 overflow-x-auto pt-2 pb-1 bs-label hide-scrollbar">
        {[
          { href: "/invest", label: "The Calculator" },
          { href: "/compare", label: "The Comparison" },
          { href: "/learn", label: "The Archive" },
          { href: "/inside-veqt", label: "The Portfolio" },
          { href: "/community", label: "Letters" },
        ].map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="whitespace-nowrap hover:text-[var(--stamp)] transition-colors"
          >
            {l.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
