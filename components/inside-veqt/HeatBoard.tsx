"use client";

import { useEffect, useMemo, useState } from "react";
import VolatilityHeatmap, {
  type VolatilityHeatmapEntry,
} from "@/components/broadsheet/VolatilityHeatmap";
import { useVeqtData } from "@/lib/useVeqtData";
import { classifyReturns, type ClassifiedReturn } from "@/lib/volatility";

type Range = "30D" | "90D" | "YTD" | "1Y";

function sliceByRange(returns: ClassifiedReturn[], range: Range): ClassifiedReturn[] {
  if (returns.length === 0) return [];
  if (range === "30D") return returns.slice(-30);
  if (range === "90D") return returns.slice(-90);
  if (range === "1Y") return returns.slice(-252);
  // YTD
  const year = new Date().getFullYear();
  return returns.filter((r) => r.date.startsWith(`${year}-`));
}

function fmtPct(n: number): string {
  const sign = n >= 0 ? "+" : "";
  return `${sign}${n.toFixed(2)}%`;
}

function fmtDate(iso: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date(`${iso}T12:00:00`));
}

export default function HeatBoard() {
  const { data, loading } = useVeqtData();
  const [range, setRange] = useState<Range>("90D");

  const { returns: allReturns } = useMemo(() => {
    if (!data?.historical) return { returns: [], sigma: 0 };
    return classifyReturns(data.historical);
  }, [data?.historical]);

  const slice = useMemo(() => sliceByRange(allReturns, range), [allReturns, range]);

  const heatmapHistory: VolatilityHeatmapEntry[] = useMemo(
    () =>
      slice.map((r) => ({
        date: r.date,
        pct: r.pct,
        severity: r.severity,
      })),
    [slice]
  );

  const todayIndex = slice.length > 0 ? slice.length - 1 : -1;

  const stats = useMemo(() => {
    if (slice.length === 0) {
      return {
        arc: null as number | null,
        worst: null as ClassifiedReturn | null,
        best: null as ClassifiedReturn | null,
        realisedVol: null as number | null,
      };
    }
    let cumulative = 1;
    let worst = slice[0];
    let best = slice[0];
    let sumSq = 0;
    let mean = 0;
    for (const r of slice) {
      cumulative *= 1 + r.pct / 100;
      if (r.pct < worst.pct) worst = r;
      if (r.pct > best.pct) best = r;
      mean += r.pct;
    }
    mean /= slice.length;
    for (const r of slice) sumSq += (r.pct - mean) ** 2;
    const realisedVol = Math.sqrt(sumSq / slice.length);
    return {
      arc: (cumulative - 1) * 100,
      worst,
      best,
      realisedVol,
    };
  }, [slice]);

  // After initial mount, if URL hash points at #heatmap, smooth-scroll into view.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash === "#heatmap") {
      const el = document.getElementById("heatmap");
      if (el) {
        // Defer so React has painted.
        requestAnimationFrame(() => {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      }
    }
  }, []);

  const ranges: Range[] = ["30D", "90D", "YTD", "1Y"];

  return (
    <section id="heatmap" className="bs-heatboard mb-14 sm:mb-16">
      {/* Hero block — matches designs/Inside-VEQT.html .hero */}
      <div className="bs-heatboard__hero">
        <p className="bs-stamp mb-3">Inside VEQT · Centerfold</p>
        <h2 className="bs-heatboard__hero-h2">
          Ninety sessions
          <br />
          <em>of weather.</em>
        </h2>
        <p className="bs-heatboard__hero-deck">
          Each cell below is a session. Shade is the size of the move; hue is
          its direction. Hover or tap a cell to read the date, the percent, and
          how unusual the day was relative to VEQT&rsquo;s own history.
        </p>
      </div>

      {/* Controls row — range buttons + comparison toggle (placeholder) */}
      <div className="bs-heatboard__controls">
        <div className="bs-heatboard__range" role="group" aria-label="Time range">
          {ranges.map((r) => (
            <button
              key={r}
              type="button"
              className={`bs-heatboard__ctrl ${
                range === r ? "is-current" : ""
              }`}
              onClick={() => setRange(r)}
              aria-pressed={range === r}
            >
              {r}
            </button>
          ))}
        </div>
        <div
          className="bs-heatboard__compare"
          role="group"
          aria-label="Comparison fund"
        >
          <button
            type="button"
            className="bs-heatboard__ctrl is-current"
            aria-pressed="true"
          >
            VEQT
          </button>
          <button
            type="button"
            className="bs-heatboard__ctrl"
            disabled
            title="XEQT comparison coming soon"
          >
            vs. XEQT
          </button>
        </div>
      </div>

      {/* Summary stat band */}
      <div className="bs-heatboard__summary">
        <div className="bs-heatboard__card bs-heatboard__card--lead">
          <div className="bs-heatboard__lab">{range} arc</div>
          <div
            className="bs-heatboard__num"
            style={{
              color:
                stats.arc != null && stats.arc < 0
                  ? "var(--print-red)"
                  : stats.arc != null && stats.arc > 0
                  ? "var(--print-green)"
                  : "var(--ink)",
            }}
          >
            {loading || stats.arc == null ? "—" : fmtPct(stats.arc)}
          </div>
          <div className="bs-heatboard__sub">
            {slice.length > 0
              ? `${slice.length} sessions · ${fmtDate(slice[0].date)} → ${fmtDate(slice[slice.length - 1].date)}`
              : ""}
          </div>
        </div>
        <div className="bs-heatboard__card">
          <div className="bs-heatboard__lab">Worst session</div>
          <div
            className="bs-heatboard__num"
            style={{ color: "var(--print-red)" }}
          >
            {loading || !stats.worst ? "—" : fmtPct(stats.worst.pct)}
          </div>
          <div className="bs-heatboard__sub">
            {stats.worst ? fmtDate(stats.worst.date) : ""}
          </div>
        </div>
        <div className="bs-heatboard__card">
          <div className="bs-heatboard__lab">Best session</div>
          <div
            className="bs-heatboard__num"
            style={{ color: "var(--print-green)" }}
          >
            {loading || !stats.best ? "—" : fmtPct(stats.best.pct)}
          </div>
          <div className="bs-heatboard__sub">
            {stats.best ? fmtDate(stats.best.date) : ""}
          </div>
        </div>
        <div className="bs-heatboard__card">
          <div className="bs-heatboard__lab">Realised volatility</div>
          <div className="bs-heatboard__num">
            {loading || stats.realisedVol == null
              ? "—"
              : `${stats.realisedVol.toFixed(2)}%`}
          </div>
          <div className="bs-heatboard__sub">Daily σ across the window</div>
        </div>
      </div>

      {/* Heatmap */}
      <div className="bs-heatboard__grid-wrap">
        {!loading && heatmapHistory.length > 0 ? (
          <VolatilityHeatmap
            history={heatmapHistory}
            size="hero"
            todayIndex={todayIndex}
          />
        ) : (
          <div className="skeleton h-[200px] w-full" aria-hidden />
        )}
      </div>

      {/* Footnote */}
      <p className="bs-heatboard__footnote">
        Sigma anchored to the full one-year window. Zones — typical · notable
        · unusual · rare — correspond to ≤1σ · 1–2σ · 2–3σ · &gt;3σ moves.
      </p>
    </section>
  );
}
