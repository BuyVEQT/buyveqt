"use client";

import type { NewsItem } from "@/app/api/news/route";

interface OnTheWireProps {
  items: readonly NewsItem[];
  loading: boolean;
  /** Optional first item to highlight; the grid starts from index 1 if provided. */
  leadItemIndex?: number;
}

function formatAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diffMs / 3_600_000);
  const days = Math.floor(diffMs / 86_400_000);
  if (days >= 7) return `${Math.floor(days / 7)}w ago`;
  if (days >= 1) return `${days}d ago`;
  if (hours >= 1) return `${hours}h ago`;
  const minutes = Math.floor(diffMs / 60_000);
  return `${Math.max(1, minutes)}m ago`;
}

const SENTIMENT_TONE: Record<string, string> = {
  Bearish: "var(--print-red)",
  "Somewhat-Bearish": "var(--print-red)",
  Neutral: "var(--ink-soft)",
  "Somewhat-Bullish": "var(--print-green)",
  Bullish: "var(--print-green)",
};

const SENTIMENT_GLYPH: Record<string, string> = {
  Bearish: "▼",
  "Somewhat-Bearish": "▽",
  Neutral: "◇",
  "Somewhat-Bullish": "△",
  Bullish: "▲",
};

export default function OnTheWire({
  items,
  loading,
  leadItemIndex = 0,
}: OnTheWireProps) {
  const visible = items.filter((_, i) => i !== leadItemIndex).slice(0, 5);

  if (loading && items.length === 0) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="border-t border-[var(--ink)] pt-3">
            <div className="skeleton h-4 w-3/4 mb-2" />
            <div className="skeleton h-2 w-1/3" />
          </div>
        ))}
      </div>
    );
  }

  if (visible.length === 0) {
    return null; // Gracefully hide if no news (rate-limited, empty, etc.)
  }

  return (
    <ul className="divide-y divide-[var(--color-border)]">
      {visible.map((item, idx) => (
        <li key={item.url} className="py-4 grid grid-cols-[auto_1fr] gap-4 sm:gap-5">
          <span className="bs-display bs-numerals text-xl sm:text-2xl text-[var(--ink-soft)] leading-none pt-0.5 tabular-nums">
            {String(idx + 1).padStart(2, "0")}
          </span>
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group block"
          >
            <h4 className="bs-display-italic text-[1.0625rem] sm:text-[1.25rem] leading-[1.2] text-[var(--ink)] group-hover:text-[var(--stamp)] transition-colors">
              {item.title}
            </h4>
            <p className="bs-caption mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
              <span
                aria-hidden
                style={{ color: SENTIMENT_TONE[item.sentimentLabel] ?? "var(--ink-soft)" }}
              >
                {SENTIMENT_GLYPH[item.sentimentLabel] ?? "◇"}
              </span>
              <span className="italic">&mdash; {item.source}</span>
              <span className="opacity-40">·</span>
              <span>{formatAgo(item.publishedAt)}</span>
            </p>
          </a>
        </li>
      ))}
    </ul>
  );
}
