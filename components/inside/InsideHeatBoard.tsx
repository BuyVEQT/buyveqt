"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Card from "@/components/ui/Card";
import SectionLabel from "@/components/ui/SectionLabel";
import { useVeqtData } from "@/lib/useVeqtData";
import { classifyReturns, type ClassifiedReturn } from "@/lib/volatility";
import VolatilityHeatmap from "@/components/broadsheet/VolatilityHeatmap";

type Range = "30D" | "90D" | "YTD" | "1Y";
const RANGES: Range[] = ["30D", "90D", "YTD", "1Y"];

function sliceByRange(returns: ClassifiedReturn[], range: Range): ClassifiedReturn[] {
  if (returns.length === 0) return [];
  if (range === "30D") return returns.slice(-30);
  if (range === "90D") return returns.slice(-90);
  if (range === "1Y") return returns.slice(-252);
  const year = new Date().getFullYear();
  return returns.filter((r) => r.date.startsWith(`${year}-`));
}

function fmtPct(n: number): string {
  return `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;
}

function fmtDate(iso: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date(`${iso}T12:00:00`));
}

interface SummaryStats {
  total: number;
  up: number;
  down: number;
  best: ClassifiedReturn | null;
  worst: ClassifiedReturn | null;
}

function summarize(returns: ClassifiedReturn[]): SummaryStats {
  let up = 0;
  let down = 0;
  let best: ClassifiedReturn | null = null;
  let worst: ClassifiedReturn | null = null;
  for (const r of returns) {
    if (r.pct > 0) up += 1;
    else if (r.pct < 0) down += 1;
    if (best === null || r.pct > best.pct) best = r;
    if (worst === null || r.pct < worst.pct) worst = r;
  }
  return { total: returns.length, up, down, best, worst };
}

/**
 * /inside-veqt deep heatmap. Round 4 polish #2 restores the interactive
 * session-board that the M3 redesign omitted. Range tabs (30D / 90D /
 * YTD / 1Y), four summary stats, and the legacy VolatilityHeatmap
 * (full tooltip + pinned-tap on mobile + dispatch markers) inside a
 * D2 cream Card.
 *
 * `?date=YYYY-MM-DD` from the home card's per-cell click-through pins
 * that day in the tooltip on first paint.
 */
export default function InsideHeatBoard() {
  const { data, loading } = useVeqtData("ALL");
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const dateParam = params.get("date");
  const [range, setRange] = useState<Range>("90D");
  const anchorRef = useRef<HTMLDivElement>(null);

  // Clicking a cell updates ?date=YYYY-MM-DD so the highlight follows
  // selection and each cell becomes a shareable URL. Replace (not push)
  // so we don't pollute history. scroll:false because the section is
  // already in view.
  const handleCellClick = useCallback(
    (date: string) => {
      const sp = new URLSearchParams(window.location.search);
      sp.set("date", date);
      router.replace(`${pathname}?${sp.toString()}#heatmap`, { scroll: false });
    },
    [pathname, router]
  );

  // Scroll to anchor on first paint if it's `#heatmap`.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash === "#heatmap" && anchorRef.current) {
      anchorRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  const allReturns = useMemo<ClassifiedReturn[]>(() => {
    if (!data?.historical) return [];
    return classifyReturns(data.historical).returns;
  }, [data]);

  const sliced = useMemo(() => sliceByRange(allReturns, range), [allReturns, range]);
  const stats = useMemo(() => summarize(sliced), [sliced]);
  const todayIdx = sliced.length - 1;

  // If the user arrived via ?date=, focus that day's range — promote to a
  // window large enough to include it. We don't change `range` so the user
  // can still click their own range; we just ensure the date is in scope.
  const focusDate = dateParam ?? null;

  return (
    <Card>
      <div ref={anchorRef} id="heatmap" style={{ scrollMarginTop: 96 }} />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          gap: 16,
          flexWrap: "wrap",
          marginBottom: 18,
        }}
      >
        <div>
          <SectionLabel>Sessions on file</SectionLabel>
          <div
            className="ed-display-italic"
            style={{ fontSize: 32, marginTop: 6, lineHeight: 1.05 }}
          >
            The session board.
          </div>
        </div>

        {/* Range pills */}
        <div
          role="tablist"
          aria-label="Range"
          style={{ display: "flex", gap: 4, flexWrap: "wrap" }}
        >
          {RANGES.map((r) => {
            const active = r === range;
            return (
              <button
                key={r}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setRange(r)}
                style={{
                  appearance: "none",
                  border: "1px solid var(--rule-soft)",
                  background: active ? "var(--ink)" : "transparent",
                  color: active ? "var(--paper-light)" : "var(--ink-soft)",
                  borderColor: active ? "var(--ink)" : "var(--rule-soft)",
                  padding: "6px 12px",
                  borderRadius: 8,
                  fontFamily: "var(--font-sans)",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  transition: "background 0.15s, color 0.15s",
                }}
              >
                {r}
              </button>
            );
          })}
        </div>
      </div>

      {/* Summary stat strip */}
      <div className="heatboard-summary">
        <Stat
          label="Sessions"
          value={loading && stats.total === 0 ? "—" : String(stats.total)}
          sub={range === "YTD" ? `year-to-date` : `last ${range.toLowerCase()}`}
        />
        <Stat
          label="Up days"
          value={loading && stats.total === 0 ? "—" : String(stats.up)}
          sub={
            stats.total > 0
              ? `${Math.round((stats.up / stats.total) * 100)}% of sessions`
              : "—"
          }
          tone="up"
        />
        <Stat
          label="Best day"
          value={stats.best ? fmtPct(stats.best.pct) : "—"}
          sub={stats.best ? fmtDate(stats.best.date) : "—"}
          tone="up"
        />
        <Stat
          label="Worst day"
          value={stats.worst ? fmtPct(stats.worst.pct) : "—"}
          sub={stats.worst ? fmtDate(stats.worst.date) : "—"}
          tone="down"
        />
      </div>

      {/* Heatmap */}
      <div
        style={{
          marginTop: 22,
          padding: 12,
          background: "var(--paper)",
          borderRadius: 14,
          border: "1px solid var(--rule-soft)",
          overflowX: "auto",
        }}
      >
        {loading || sliced.length === 0 ? (
          <div
            className="skeleton"
            style={{ width: "100%", height: 220, borderRadius: 8 }}
          />
        ) : (
          <VolatilityHeatmap
            history={sliced}
            size="hero"
            todayIndex={focusDate ? sliced.findIndex((r) => r.date === focusDate) : todayIdx}
            onCellClick={handleCellClick}
          />
        )}
      </div>

      <p
        className="ed-body"
        style={{
          marginTop: 16,
          fontSize: 13.5,
          lineHeight: 1.55,
          color: "var(--ink-mute)",
          fontStyle: "italic",
          maxWidth: "64ch",
        }}
      >
        Each cell is one trading day. Darker greens = stronger up days,
        darker reds = stronger down days. Hover for the date and return;
        tap on mobile to pin, tap again to follow through to the day&apos;s
        dispatch if there is one.
      </p>

      <style jsx>{`
        .heatboard-summary {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          padding-top: 18px;
          border-top: 1px solid var(--rule-soft);
        }
        @media (min-width: 768px) {
          .heatboard-summary {
            grid-template-columns: repeat(4, 1fr);
            gap: 28px;
          }
        }
      `}</style>
    </Card>
  );
}

interface StatProps {
  label: string;
  value: string;
  sub: string;
  tone?: "up" | "down";
}

function Stat({ label, value, sub, tone }: StatProps) {
  const valueColor =
    tone === "up" ? "var(--green)" : tone === "down" ? "var(--stamp)" : "var(--ink)";
  return (
    <div>
      <SectionLabel>{label}</SectionLabel>
      <div
        className="ed-display ed-numerals"
        style={{
          fontSize: 26,
          lineHeight: 1.05,
          marginTop: 6,
          color: valueColor,
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontFamily: "var(--font-serif)",
          fontStyle: "italic",
          fontSize: 12.5,
          color: "var(--ink-mute)",
          marginTop: 4,
        }}
      >
        {sub}
      </div>
    </div>
  );
}
