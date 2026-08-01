"use client";

/**
 * Lookback — calculator 01, the marquee panel on /calculators.
 *
 * "What was, exactly." Reskinned to the Instrument (artboard 6d) without
 * touching the engine: the same amount / lump-sum-vs-DCA / real-dollar
 * inputs, the same cohort math, the same URL round-trip.
 *
 * Module order:
 *   section header      — 01 — LOOKBACK · "What was, exactly." · cohort count
 *   control bar         — one 1px ink strip: amount · mode · CPI · pin/reset
 *   poster result       — sentence, poster figure with the signal underline,
 *                         total return / CAGR / years held
 *   entry ruler         — draggable marker over the year ticks
 *   cohort rail         — best / median / unlucky, marked to today's close
 *   pinned row          — 1px ink chips, up to four
 *   cohort fan          — every monthly cohort since launch (unchanged chart)
 */
import { useState, useMemo, useEffect } from "react";
import {
  fmtCAD,
  fmtMonth,
  dailyToMonthly,
  buildLookbackCohorts,
  buildLookbackDCACohorts,
  toDailySeries,
  cagr,
  type MonthlyBar,
} from "@/lib/calc-data";
import type { HistoricalData } from "@/lib/data/types";
import { expandParams } from "@/lib/share-params";
import AnimatedDollar, { AnimatedPct } from "./AnimatedDollar";
import NumberInput from "./NumberInput";
import SegmentedControl from "./SegmentedControl";
import YearPicker from "./YearPicker";
import { AdvToggle } from "./AdvancedPanel";
import ControlsActions from "./ControlsActions";
import PinnedScenariosBar, { usePinnedScenarios } from "./PinnedScenariosBar";
import CohortFanChart from "@/components/charts/CohortFanChart";

type Mode = "lump" | "dca";

const MAX_PINS = 4;

interface LookbackInputs {
  amount: number;
  startYear: number;
  mode: Mode;
  adjustInflation: boolean;
}

interface LookbackProps {
  history: HistoricalData | null;
}

interface LookbackResult {
  contributed: number;
  finalValue: number;
  totalReturn: number;
  years: number;
  cagr: number | null;
  path: { date: string; value: number }[];
}

function calcLookback(opts: {
  amount: number;
  startYear: number;
  mode: Mode;
  daily: { date: string; close: number }[];
  monthly: MonthlyBar[];
}): LookbackResult | null {
  const { amount, startYear, mode, daily, monthly } = opts;
  if (daily.length === 0 || monthly.length === 0) return null;

  // Find the first monthly bar in startYear. Fall back to the earliest bar
  // if the user picked a year before inception (shouldn't happen with the
  // ruler's clamp, but guard anyway).
  const startBar =
    monthly.find((m) => m.date.startsWith(`${startYear}-`)) ?? monthly[0];
  const endBar = daily[daily.length - 1];

  if (mode === "lump") {
    const shares = amount / startBar.close;
    const finalValue = shares * endBar.close;
    const totalReturn = (endBar.close - startBar.close) / startBar.close;
    const years =
      (new Date(endBar.date).getTime() - new Date(startBar.date).getTime()) /
      (1000 * 60 * 60 * 24 * 365.25);
    const cagrVal = cagr(startBar.close, endBar.close, years);
    // Build a month-by-month value-over-time path
    const path: { date: string; value: number }[] = [];
    let curMonth = "";
    for (const p of daily) {
      if (p.date < startBar.date) continue;
      const ym = p.date.slice(0, 7);
      if (ym !== curMonth) {
        path.push({ date: p.date, value: shares * p.close });
        curMonth = ym;
      }
    }
    return {
      contributed: amount,
      finalValue,
      totalReturn,
      years,
      cagr: cagrVal,
      path,
    };
  }

  // DCA: monthly purchases at each month's close, from startBar to today.
  const monthlyAmount = amount;
  const filtered = monthly.filter((m) => m.date >= startBar.date);
  const months = filtered.length;
  let totalShares = 0;
  let contributed = 0;
  const path: { date: string; value: number }[] = [];
  for (const m of filtered) {
    totalShares += monthlyAmount / m.close;
    contributed += monthlyAmount;
    path.push({ date: m.date, value: totalShares * m.close });
  }
  const finalValue = totalShares * endBar.close;
  const totalReturn = contributed > 0 ? (finalValue - contributed) / contributed : 0;
  const years = months / 12;
  const cagrVal = years > 0 ? cagr(contributed, finalValue, years) : null;
  return { contributed, finalValue, totalReturn, years, cagr: cagrVal, path };
}

const DEFAULTS: LookbackInputs = {
  amount: 10000,
  startYear: 2019,
  mode: "lump",
  adjustInflation: false,
};

export default function Lookback({ history }: LookbackProps) {
  const daily = useMemo(() => toDailySeries(history?.data), [history]);
  const monthly = useMemo(() => dailyToMonthly(daily), [daily]);

  // Inception year — first monthly bar — clamped to 2019 fallback.
  const inceptionYear = monthly.length > 0 ? Number(monthly[0].date.slice(0, 4)) : 2019;
  const currentYear = monthly.length > 0
    ? Number(monthly[monthly.length - 1].date.slice(0, 4))
    : new Date().getFullYear();
  const minYear = inceptionYear;
  const maxYear = Math.max(inceptionYear, currentYear - 1);

  const initialYear = Math.min(Math.max(DEFAULTS.startYear, minYear), maxYear);

  const [amount, setAmount] = useState(DEFAULTS.amount);
  const [startYear, setStartYear] = useState(initialYear);
  const [mode, setMode] = useState<Mode>(DEFAULTS.mode);
  const [adjustInflation, setAdjustInflation] = useState(DEFAULTS.adjustInflation);
  const { pinned, pin, remove, restore } = usePinnedScenarios<LookbackInputs>(MAX_PINS);

  // Hydrate from URL params on mount.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw: Record<string, string> = {};
    new URLSearchParams(window.location.search).forEach((v, k) => {
      raw[k] = v;
    });
    const p = expandParams(raw);
    const a = typeof p.amount === "string" ? Number(p.amount) : NaN;
    if (Number.isFinite(a) && a > 0 && a <= 10_000_000) setAmount(Math.round(a));
    const m = typeof p.mode === "string" ? p.mode : null;
    if (m === "lump" || m === "dca") setMode(m);
    const s = typeof p.start === "string" ? p.start : null;
    if (s) {
      const yr = Number(s.slice(0, 4));
      if (Number.isFinite(yr) && yr >= minYear && yr <= maxYear) {
        setStartYear(yr);
      }
    }
  }, [minYear, maxYear]);

  const result = useMemo(
    () =>
      calcLookback({
        amount,
        startYear,
        mode,
        daily,
        monthly,
      }),
    [amount, startYear, mode, daily, monthly]
  );

  // The entry month the engine actually lands on for `startYear` — printed
  // on the date chip and the ruler marker so the two always agree.
  const entryLabel = useMemo(() => {
    const startBar =
      monthly.find((m) => m.date.startsWith(`${startYear}-`)) ?? monthly[0];
    return startBar
      ? fmtMonth(startBar.date.slice(0, 7)).toUpperCase()
      : String(startYear);
  }, [monthly, startYear]);

  // Inflation deflator: 2.5%/yr applied to displayed final + contributed.
  const years = result?.years ?? 0;
  const deflator = adjustInflation ? Math.pow(1 + 0.025, years) : 1;
  const displayedFinal = (result?.finalValue ?? 0) / deflator;

  // Scenario percentiles from every monthly cohort, scaled to the
  // user's amount AND strategy. In lump-sum mode each cohort is a one-
  // shot buy on the cohort start month; in DCA mode each cohort is a
  // recurring $amount/mo from the start through today.
  const scenarios = useMemo(() => {
    const cohorts = mode === "lump"
      ? buildLookbackCohorts(amount, monthly)
      : buildLookbackDCACohorts(amount, monthly);
    if (cohorts.length === 0) {
      return null;
    }
    const sorted = [...cohorts].sort((a, b) => a.finalValue - b.finalValue);
    const worst = sorted[Math.floor(sorted.length * 0.1)] ?? sorted[0];
    const median = sorted[Math.floor(sorted.length * 0.5)] ?? sorted[Math.floor(sorted.length / 2)];
    const best = sorted[Math.floor(sorted.length * 0.9)] ?? sorted[sorted.length - 1];
    return { worst, median, best, count: cohorts.length };
  }, [amount, monthly, mode]);

  // Push state to URL so OG-image preview keeps working.
  useEffect(() => {
    if (typeof window === "undefined" || !result) return;
    const url = new URL(window.location.href);
    const sp = url.searchParams;
    sp.set("tab", "historical");
    sp.set("mode", mode);
    sp.set("amount", String(amount));
    sp.set("start", `${startYear}-01`);
    sp.set("result", String(Math.round(displayedFinal)));
    sp.set("contributed", String(Math.round(result.contributed)));
    sp.set("returnPct", (result.totalReturn * 100).toFixed(1));
    window.history.replaceState(null, "", `${url.pathname}?${sp.toString()}${url.hash}`);
  }, [amount, startYear, mode, result, displayedFinal]);

  function resetAll() {
    setAmount(DEFAULTS.amount);
    setStartYear(initialYear);
    setMode(DEFAULTS.mode);
    setAdjustInflation(DEFAULTS.adjustInflation);
  }

  function pinCurrent() {
    pin({
      label: mode === "lump" ? entryLabel : `${entryLabel} · ${fmtCAD(amount)}/MO`,
      value: displayedFinal,
      inputs: { amount, startYear, mode, adjustInflation },
    });
  }

  function restoreScenario(i: number) {
    const inp = restore(i);
    if (!inp) return;
    setAmount(inp.amount);
    setStartYear(inp.startYear);
    setMode(inp.mode);
    setAdjustInflation(inp.adjustInflation);
  }

  // No history? Render a quiet placeholder rather than a broken hero.
  if (!history || monthly.length === 0) {
    return (
      <section className="lb lb--unavail">
        <div className="lb__kicker">01 — LOOKBACK</div>
        <h2 className="lb__display">The lookback is offline.</h2>
        <p className="lb__offline">
          We couldn&rsquo;t load VEQT&rsquo;s history just now. Try again in a moment.
        </p>
        <style jsx>{`
          .lb--unavail {
            font-family: var(--ins-font);
            color: var(--ins-ink);
            border-top: 3px solid var(--ins-rule-strong, var(--ins-ink));
            padding-top: 16px;
          }
          .lb__kicker {
            font-size: 9.5px;
            font-weight: 700;
            letter-spacing: 0.2em;
            color: var(--ins-gray-600);
          }
          .lb__display {
            font-size: 40px;
            font-weight: 700;
            letter-spacing: -0.03em;
            margin: 8px 0 0;
          }
          .lb__offline {
            margin: 12px 0 0;
            font-size: 15px;
            font-weight: 500;
            color: var(--ins-gray-600);
          }
        `}</style>
      </section>
    );
  }

  const cohortCount = scenarios?.count ?? 0;
  const placedCopy =
    mode === "lump"
      ? `${fmtCAD(amount)} PLACED`
      : `${fmtCAD(amount)}/MO SINCE`;
  const railFootnote =
    mode === "lump"
      ? `EVERY COHORT PLACES ${fmtCAD(amount)} · VALUES MARKED TO TODAY’S CLOSE`
      : `EVERY COHORT CONTRIBUTES ${fmtCAD(amount)}/MO · VALUES MARKED TO TODAY’S CLOSE`;

  return (
    <section className="lb" aria-label="Lookback calculator">
      <div className="lb__head">
        <div>
          <div className="lb__kicker">01 &mdash; LOOKBACK</div>
          <h2 className="lb__display">What was, exactly.</h2>
        </div>
        <span className="lb__micro">
          REAL TAPE &middot; NO ASSUMPTIONS
          {cohortCount > 0 ? ` · ${cohortCount} COHORTS` : ""}
        </span>
      </div>

      {/* ── Instrument control bar ─────────────────────────────── */}
      <div className="lb__bar">
        <div className="lb__cell">
          <NumberInput
            variant="bar"
            label={mode === "lump" ? "Amount" : "Amount / month"}
            value={amount}
            onChange={setAmount}
            prefix="$"
            step={mode === "lump" ? 1000 : 50}
            min={0}
            max={10_000_000}
          />
        </div>
        <div className="lb__cell">
          <SegmentedControl<Mode>
            label="Mode"
            value={mode}
            options={[
              { value: "lump", label: "Lump sum" },
              { value: "dca", label: "Monthly DCA" },
            ]}
            onChange={setMode}
          />
        </div>
        <div className="lb__cell lb__cell--check">
          <AdvToggle
            variant="inline"
            label="Real dollars (CPI)"
            value={adjustInflation}
            onChange={setAdjustInflation}
          />
        </div>
        <div className="lb__actions">
          <ControlsActions
            variant="bar"
            onPin={pinCurrent}
            onReset={resetAll}
            pinDisabled={pinned.length >= MAX_PINS}
          />
        </div>
      </div>

      {/* ── Poster result + cohort rail ────────────────────────── */}
      <div className="lb__grid">
        <div className="lb__poster">
          <div className="lb__sentence">
            <span>{placedCopy}</span>
            <span className="lb__chip">{entryLabel}</span>
            <span>IS TODAY</span>
            {adjustInflation && (
              <span className="lb__chip lb__chip--soft">
                IN {startYear} DOLLARS
              </span>
            )}
          </div>

          <div className="lb__fig">
            <AnimatedDollar value={displayedFinal} size="huge" />
          </div>

          <div className="lb__stats">
            <span className="lb__stat">
              <span className="lb__stat-lab">TOTAL RETURN</span>
              <AnimatedPct value={result?.totalReturn ?? 0} tone="auto" digits={1} />
            </span>
            <span className="lb__stat">
              <span className="lb__stat-lab">CAGR</span>
              <AnimatedPct value={result?.cagr ?? 0} tone="auto" digits={1} />
            </span>
            <span className="lb__stat">
              <span className="lb__stat-lab">YEARS HELD</span>
              <span className="lb__stat-val">{(result?.years ?? 0).toFixed(1)}</span>
            </span>
          </div>

          <div className="lb__ruler">
            <YearPicker
              min={minYear}
              max={maxYear}
              value={startYear}
              onChange={setStartYear}
              markerLabel={entryLabel}
            />
          </div>
        </div>

        {scenarios && (
          <div className="lb__rail">
            <div className="lb__rail-row lb__rail-row--first">
              <div className="lb__rail-lab">IF YOU&rsquo;D TIMED IT RIGHT</div>
              <div className="lb__rail-val">
                <AnimatedDollar value={scenarios.best.finalValue} size="large" />
              </div>
              <div className="lb__rail-sub">
                BEST COHORT &middot; STARTED{" "}
                {fmtMonth(scenarios.best.start).toUpperCase()}
              </div>
            </div>
            <div className="lb__rail-row">
              <div className="lb__rail-lab">THE MEDIAN COHORT</div>
              <div className="lb__rail-val">
                <AnimatedDollar value={scenarios.median.finalValue} size="large" />
              </div>
              <div className="lb__rail-sub">
                MEDIAN OF {scenarios.count} &middot; STARTED{" "}
                {fmtMonth(scenarios.median.start).toUpperCase()}
              </div>
            </div>
            <div className="lb__rail-row lb__rail-row--last">
              <div className="lb__rail-lab">IF YOU&rsquo;D BEEN UNLUCKY</div>
              <div className="lb__rail-val">
                <AnimatedDollar value={scenarios.worst.finalValue} size="large" />
              </div>
              <div className="lb__rail-sub">
                WORST COHORT &middot; STARTED{" "}
                {fmtMonth(scenarios.worst.start).toUpperCase()}
              </div>
            </div>
            <div className="lb__rail-foot">{railFootnote}</div>
          </div>
        )}
      </div>

      {/* ── Pinned cohorts ─────────────────────────────────────── */}
      <div className="lb__pinned">
        <PinnedScenariosBar
          pinned={pinned}
          onRestore={restoreScenario}
          onRemove={remove}
          formatter={(n) => fmtCAD(n)}
          hint="PIN UP TO FOUR COHORTS TO COMPARE ENTRIES"
        />
      </div>

      {/* ── Cohort fan ─────────────────────────────────────────── */}
      <div className="lb__fan">
        <div className="lb__fan-head">
          <span className="lb__fan-lab">EVERY MONTHLY COHORT SINCE LAUNCH</span>
          <span className="lb__fan-micro">
            VALUE OVER TIME &middot; $10K-EQUIVALENT PATHS
          </span>
        </div>
        <div className="lb__fan-plot">
          <CohortFanChart
            userPath={result?.path ?? []}
            monthlyHistory={monthly}
            mode={mode}
            userAmount={amount}
          />
        </div>
      </div>

      <style jsx>{`
        .lb {
          font-family: var(--ins-font);
          color: var(--ins-ink);
          border-top: 3px solid var(--ins-rule-strong, var(--ins-ink));
          padding-top: 16px;
        }

        /* ── Section header ── */
        .lb__head {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: 24px;
        }
        .lb__kicker {
          font-size: 9.5px;
          font-weight: 700;
          letter-spacing: 0.2em;
          color: var(--ins-gray-600);
        }
        .lb__display {
          font-size: 40px;
          font-weight: 700;
          letter-spacing: -0.03em;
          line-height: 1.05;
          margin: 8px 0 0;
        }
        .lb__micro {
          font-size: 9.5px;
          font-weight: 600;
          letter-spacing: 0.16em;
          color: var(--ins-gray-600);
          text-align: right;
          flex: none;
        }

        /* ── Control bar ── */
        .lb__bar {
          margin-top: 18px;
          border: 1px solid var(--ins-ink);
          display: flex;
          align-items: stretch;
          flex-wrap: nowrap;
        }
        .lb__cell {
          padding: 10px 20px;
          border-right: 1px solid var(--ins-hair);
          display: flex;
          flex-direction: column;
          justify-content: center;
          min-width: 0;
        }
        .lb__cell--check {
          flex-direction: row;
          align-items: center;
        }
        .lb__actions {
          margin-left: auto;
          display: flex;
          align-items: stretch;
        }

        /* ── Poster + rail ── */
        .lb__grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 380px;
          gap: 48px;
          margin-top: 22px;
          align-items: start;
        }
        .lb__poster {
          min-width: 0;
        }
        .lb__sentence {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.14em;
          color: var(--ins-gray-600);
        }
        .lb__chip {
          border: 1px solid var(--ins-ink);
          padding: 2px 8px;
          color: var(--ins-ink);
          font-weight: 700;
          font-variant-numeric: tabular-nums;
        }
        .lb__chip--soft {
          border-color: var(--ins-hair);
          color: var(--ins-gray-600);
          font-weight: 600;
        }
        .lb__fig {
          margin-top: 14px;
        }
        .lb__fig :global(.anum) {
          border-bottom: 4px solid var(--ins-signal);
          padding-bottom: 6px;
        }
        .lb__stats {
          display: flex;
          gap: 36px;
          flex-wrap: wrap;
          margin-top: 26px;
        }
        .lb__stat {
          display: inline-flex;
          align-items: baseline;
          gap: 8px;
        }
        .lb__stat-lab {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.14em;
          color: var(--ins-gray-600);
        }
        .lb__stat-val {
          font-size: 15px;
          font-weight: 700;
          font-variant-numeric: tabular-nums;
          color: var(--ins-ink);
        }
        .lb__ruler {
          margin-top: 26px;
        }

        /* ── Cohort rail ── */
        .lb__rail {
          min-width: 0;
        }
        .lb__rail-row {
          padding: 14px 0;
          border-top: 1px solid var(--ins-hair);
        }
        .lb__rail-row--first {
          border-top: 3px solid var(--ins-rule-strong, var(--ins-ink));
        }
        .lb__rail-row--last {
          border-bottom: 1px solid var(--ins-ink);
        }
        .lb__rail-lab {
          font-size: 9.5px;
          font-weight: 600;
          letter-spacing: 0.22em;
          color: var(--ins-gray-600);
        }
        .lb__rail-val {
          margin-top: 6px;
        }
        .lb__rail-sub {
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.14em;
          color: var(--ins-gray-600);
          margin-top: 4px;
        }
        .lb__rail-foot {
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.14em;
          color: var(--ins-gray-600);
          margin-top: 10px;
          line-height: 1.7;
        }

        /* ── Pinned ── */
        .lb__pinned {
          margin-top: 20px;
          border-top: 1px solid var(--ins-hair);
          padding-top: 12px;
        }

        /* ── Cohort fan ── */
        .lb__fan {
          margin-top: 26px;
          border-top: 1px solid var(--ins-ink);
          padding-top: 14px;
        }
        .lb__fan-head {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: 16px;
          flex-wrap: wrap;
        }
        .lb__fan-lab {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.2em;
          color: var(--ins-ink);
        }
        .lb__fan-micro {
          font-size: 8.5px;
          font-weight: 600;
          letter-spacing: 0.14em;
          color: var(--ins-gray-600);
        }
        /* Map the editorial chart tokens onto the Instrument palette so
           the (out-of-scope) SVG modules print in this page's ink/red. */
        .lb__fan-plot {
          margin-top: 10px;
          --ink: var(--ins-ink);
          --ink-soft: var(--ins-gray-700);
          --ink-mute: var(--ins-gray-600);
          --paper: var(--ins-paper);
          --paper-light: var(--ins-paper);
          --paper-warm: #f4f4f4;
          --rule: var(--ins-hair);
          --rule-soft: var(--ins-hair-soft);
          --rule-hair: var(--ins-track-soft);
          --stamp: var(--ins-signal);
          --green: var(--ins-gray-600);
        }

        /* ── Tablet ── */
        @media (max-width: 1080px) {
          .lb__grid {
            grid-template-columns: 1fr;
            gap: 26px;
          }
          .lb__bar {
            flex-wrap: wrap;
          }
          .lb__actions {
            margin-left: auto;
          }
        }

        /* ── Mobile 390 ── */
        @media (max-width: 640px) {
          .lb {
            padding-top: 12px;
          }
          .lb__head {
            display: block;
          }
          .lb__kicker {
            font-size: 9px;
            letter-spacing: 0.18em;
          }
          .lb__display {
            font-size: 26px;
            margin-top: 6px;
          }
          .lb__micro {
            display: block;
            text-align: left;
            margin-top: 6px;
            font-size: 8.5px;
            letter-spacing: 0.12em;
          }
          .lb__bar {
            margin-top: 14px;
            display: block;
          }
          .lb__cell {
            border-right: 0;
            border-bottom: 1px solid var(--ins-hair);
            padding: 10px 14px;
          }
          .lb__actions {
            margin-left: 0;
            width: 100%;
          }
          .lb__grid {
            margin-top: 16px;
            gap: 18px;
          }
          .lb__sentence {
            gap: 8px;
            font-size: 9.5px;
            letter-spacing: 0.12em;
          }
          .lb__chip {
            padding: 2px 7px;
          }
          .lb__fig {
            margin-top: 12px;
          }
          .lb__fig :global(.anum) {
            border-bottom-width: 3px;
            padding-bottom: 4px;
          }
          .lb__stats {
            gap: 22px;
            margin-top: 16px;
          }
          .lb__stat-lab {
            font-size: 9px;
            letter-spacing: 0.12em;
          }
          .lb__stat-val {
            font-size: 12px;
          }
          .lb__ruler {
            margin-top: 18px;
          }

          /* Rail collapses to ruled label/value rows. */
          .lb__rail-row {
            display: grid;
            grid-template-columns: minmax(0, 1fr) auto;
            column-gap: 12px;
            align-items: baseline;
            padding: 10px 0;
          }
          .lb__rail-row--first {
            border-top: 1px solid var(--ins-ink);
          }
          .lb__rail-lab {
            grid-column: 1;
            font-size: 8.5px;
            letter-spacing: 0.14em;
          }
          .lb__rail-sub {
            grid-column: 1;
            margin-top: 2px;
          }
          .lb__rail-val {
            grid-column: 2;
            grid-row: 1 / span 2;
            margin-top: 0;
            align-self: center;
          }
          .lb__rail-val :global(.anum) {
            font-size: 16px;
            font-weight: 700;
          }
          .lb__rail-foot {
            font-size: 8px;
            letter-spacing: 0.1em;
          }
          .lb__pinned {
            margin-top: 14px;
          }
          .lb__fan {
            margin-top: 20px;
          }
        }
      `}</style>
    </section>
  );
}
