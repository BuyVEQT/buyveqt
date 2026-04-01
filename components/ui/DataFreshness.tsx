"use client";

import { useState, useEffect } from "react";

interface DataFreshnessProps {
  source: "alpha-vantage" | "yahoo-finance" | "cache";
  fetchedAt: string; // ISO timestamp
  className?: string;
  /** On mobile, hide the source label to save space */
  compact?: boolean;
}

const SOURCE_LABELS: Record<string, string> = {
  "alpha-vantage": "via Alpha Vantage",
  "yahoo-finance": "via Yahoo Finance",
  cache: "via cached data",
};

function formatTimestamp(isoString: string): string {
  const now = Date.now();
  const then = new Date(isoString).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60_000);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin} min ago`;

  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hr ago`;

  // Absolute format in ET
  const et = new Date(isoString).toLocaleString("en-US", {
    timeZone: "America/New_York",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return `${et} ET`;
}

export default function DataFreshness({
  source,
  fetchedAt,
  className,
  compact = false,
}: DataFreshnessProps) {
  const [timeLabel, setTimeLabel] = useState(() => formatTimestamp(fetchedAt));

  // Re-render relative time every 60 seconds
  useEffect(() => {
    setTimeLabel(formatTimestamp(fetchedAt));
    const interval = setInterval(() => {
      setTimeLabel(formatTimestamp(fetchedAt));
    }, 60_000);
    return () => clearInterval(interval);
  }, [fetchedAt]);

  const isCache = source === "cache";

  return (
    <span
      className={`text-xs whitespace-nowrap ${
        isCache ? "text-amber-500" : "text-[var(--color-text-muted)]"
      } ${className ?? ""}`}
    >
      Updated {timeLabel}
      {!compact && (
        <>
          {" "}
          <span className={isCache ? "text-amber-500/70" : "text-[var(--color-text-muted)]/60"}>
            &middot;
          </span>{" "}
          {SOURCE_LABELS[source] ?? source}
        </>
      )}
    </span>
  );
}
