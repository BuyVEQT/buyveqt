"use client";

/**
 * Lookback — the marquee calculator at the top of /calculators.
 *
 * "What if you'd bought $X of VEQT in {year}?" Pick a year, see the
 * dollar result animate; toggle lump-sum vs monthly DCA; optionally
 * adjust the headline to starting-year dollars.
 *
 * Layout:
 *   - Pinned scenarios bar above
 *   - Dark result slab: vermilion top rule, animated dollar, sentence,
 *     sub-stats (total return / CAGR / years held)
 *   - Cohort fan chart below the slab (combined border-radius)
 *   - 3-up scenario strip: worst / median / best cohort outcomes
 *   - Right rail: Strategy, Amount, Year picker, Advanced, Pin/Reset
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
import AdvancedPanel, { AdvToggle } from "./AdvancedPanel";
import ControlsActions from "./ControlsActions";
import PinnedScenariosBar, { usePinnedScenarios } from "./PinnedScenariosBar";
import CohortFanChart from "@/components/charts/CohortFanChart";

type Mode = "lump" | "dca";

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
  // YearPicker clamp, but guard anyway).
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

interface ScenarioCellProps {
  label: string;
  value: number;
  caption: string;
  tone: "stamp" | "ink" | "green";
}

function ScenarioCell({ label, value, caption, tone }: ScenarioCellProps) {
  const color =
    tone === "stamp" ? "var(--stamp)" : tone === "green" ? "var(--green)" : "var(--ink)";
  return (
    <div className="scn">
      <div className="ed-label scn__lab">{label}</div>
      <div className="scn__val" style={{ color }}>
        <AnimatedDollar value={value} size="medium" />
      </div>
      <div className="ed-caption scn__cap">{caption}</div>
      <style jsx>{`
        .scn {
          padding: 12px 14px;
          background: var(--paper);
          border: 1px solid var(--rule-soft);
          border-radius: 10px;
        }
        .scn__lab {
          color: var(--ink-mute);
        }
        .scn__val {
          margin-top: 6px;
        }
        .scn__cap {
          margin-top: 4px;
          font-size: 12px;
        }
      `}</style>
    </div>
  );
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
  const { pinned, pin, remove, restore } = usePinnedScenarios<LookbackInputs>(3);

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
    return { worst, median, best };
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
      label: `${mode === "lump" ? fmtCAD(amount) : `${fmtCAD(amount)}/mo`} · ${startYear}`,
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
      <section className="lookback lookback--unavail">
        <div className="ed-stamp">Calculator 01 · Lookback</div>
        <h2 className="ed-display-italic lookback__h2">The lookback is offline.</h2>
        <p className="ed-body">
          We couldn&rsquo;t load VEQT&rsquo;s history just now. Try again in a moment.
        </p>
        <style jsx>{`
          .lookback--unavail {
            padding: 30px 0 24px;
          }
          .lookback__h2 {
            font-size: clamp(2rem, 4vw, 3rem);
            margin: 12px 0 8px;
            color: var(--ink);
          }
        `}</style>
      </section>
    );
  }

  const verbalSentence =
    mode === "lump"
      ? `Your ${fmtCAD(amount)} in ${startYear} is worth this much today, after ${(result?.years ?? 0).toFixed(1)} years.`
      : `${fmtCAD(amount)} a month since ${startYear} (${fmtCAD(result?.contributed ?? 0)} contributed) compounds to this.`;

  return (
    <section className="lookback">
      <div className="lookback__head">
        <span className="ed-stamp lookback__stamp">
          Calculator 01 &middot; Lookback
        </span>
        <h2 className="ed-display-italic lookback__h2">
          What if{" "}
          <em style={{ fontStyle: "italic", fontWeight: 500 }}>you&rsquo;d bought</em> in {startYear}?
        </h2>
      </div>

      <div className="lookback__layout">
        <div className="lookback__chart-col">
          <PinnedScenariosBar
            pinned={pinned}
            onRestore={restoreScenario}
            onRemove={remove}
            formatter={(n) => fmtCAD(n)}
          />

          <div className="lookback__result lookback__result--dark">
            <div className="ed-stamp lookback__result-stamp">
              Worth today
              {adjustInflation && (
                <em className="lookback__result-stamp-em">
                  &middot; in {startYear} dollars
                </em>
              )}
            </div>
            <AnimatedDollar value={displayedFinal} size="huge" />
            <p className="lookback__verbal">{verbalSentence}</p>
            <div className="lookback__sub-stats">
              <div>
                <div className="ed-label lookback__sub-label">Total return</div>
                <AnimatedPct value={result?.totalReturn ?? 0} tone="auto" digits={1} />
              </div>
              <div className="lookback__sub-rule" aria-hidden />
              <div>
                <div className="ed-label lookback__sub-label">CAGR</div>
                <AnimatedPct value={result?.cagr ?? 0} tone="green" digits={1} />
              </div>
              <div className="lookback__sub-rule" aria-hidden />
              <div>
                <div className="ed-label lookback__sub-label">Years held</div>
                <span className="ed-display ed-numerals lookback__years">
                  {(result?.years ?? 0).toFixed(1)}
                </span>
              </div>
            </div>
          </div>

          <div className="lookback__chart-wrap">
            <CohortFanChart
              userPath={result?.path ?? []}
              monthlyHistory={monthly}
              mode={mode}
              userAmount={amount}
            />
          </div>

          {scenarios && (
            <div className="lookback__scenarios">
              <ScenarioCell
                label="If you&rsquo;d been unlucky"
                tone="stamp"
                value={scenarios.worst.finalValue}
                caption={`Worst-case cohort · started ${fmtMonth(scenarios.worst.start)}`}
              />
              <ScenarioCell
                label="Median outcome"
                tone="ink"
                value={scenarios.median.finalValue}
                caption={`Median cohort · started ${fmtMonth(scenarios.median.start)}`}
              />
              <ScenarioCell
                label="If you&rsquo;d timed it right"
                tone="green"
                value={scenarios.best.finalValue}
                caption={`Best-case cohort · started ${fmtMonth(scenarios.best.start)}`}
              />
            </div>
          )}
        </div>

        <aside className="lookback__inputs">
          <div className="lookback__inputs-head">
            <span className="ed-stamp">Controls</span>
            <span className="ed-caption">Adjust to recompute</span>
          </div>

          <SegmentedControl<Mode>
            label="Strategy"
            value={mode}
            options={[
              { value: "lump", label: "Lump sum" },
              { value: "dca", label: "Monthly DCA" },
            ]}
            onChange={setMode}
          />

          <NumberInput
            label={mode === "lump" ? "Amount invested" : "Monthly contribution"}
            value={amount}
            onChange={setAmount}
            prefix="$"
            step={mode === "lump" ? 1000 : 50}
            min={0}
            max={10_000_000}
          />

          <YearPicker
            min={minYear}
            max={maxYear}
            value={startYear}
            onChange={setStartYear}
          />

          <AdvancedPanel>
            <AdvToggle
              label="Adjust for inflation"
              sub="Show result in starting-year dollars (assumes 2.5% CPI)"
              value={adjustInflation}
              onChange={setAdjustInflation}
            />
          </AdvancedPanel>

          <ControlsActions
            onPin={pinCurrent}
            onReset={resetAll}
            pinDisabled={pinned.length >= 3}
          />
        </aside>
      </div>

      <style jsx>{`
        .lookback {
          padding: 0 0 36px;
        }
        .lookback__head {
          margin-bottom: 22px;
        }
        .lookback__stamp {
          color: var(--paper-light);
          background: var(--stamp);
          padding: 5px 12px 4px;
          letter-spacing: 0.22em;
          display: inline-block;
        }
        .lookback__h2 {
          font-size: clamp(2rem, 4vw, 3rem);
          line-height: 1.05;
          letter-spacing: -0.025em;
          margin: 12px 0 0;
          color: var(--ink);
        }
        .lookback__layout {
          display: grid;
          grid-template-columns: 1fr;
          gap: 18px;
        }
        @media (min-width: 1000px) {
          .lookback__layout {
            grid-template-columns: minmax(0, 1.8fr) minmax(280px, 1fr);
            gap: 36px;
          }
        }
        .lookback__chart-col {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 0;
        }
        .lookback__result--dark {
          background: var(--band-ink);
          color: var(--band-paper);
          border-radius: 14px 14px 0 0;
          padding: 28px 30px 26px;
          position: relative;
          overflow: hidden;
        }
        .lookback__result--dark::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: var(--stamp);
        }
        .lookback__result--dark :global(.anum) {
          color: var(--paper);
        }
        .lookback__result-stamp {
          color: rgba(246, 239, 220, 0.55);
          margin-bottom: 10px;
          display: inline-block;
        }
        .lookback__result-stamp-em {
          margin-left: 8px;
          font-style: italic;
          text-transform: none;
          letter-spacing: 0;
        }
        .lookback__verbal {
          font-family: var(--font-serif);
          font-style: italic;
          font-size: clamp(15px, 1.6vw, 17px);
          line-height: 1.55;
          color: rgba(246, 239, 220, 0.78);
          margin: 14px 0 0;
          max-width: 56ch;
        }
        .lookback__sub-stats {
          display: flex;
          gap: 18px;
          align-items: center;
          margin-top: 18px;
          padding-top: 16px;
          border-top: 1px solid rgba(246, 239, 220, 0.18);
          flex-wrap: wrap;
        }
        /* :not(.lookback__sub-rule) — same bug as CalculatorCard /
           FIRECalculator. The min-width was inflating the 1px divider
           into a 90px grey block in the middle of the result slab. */
        .lookback__sub-stats > div:not(.lookback__sub-rule) {
          display: flex;
          flex-direction: column;
          gap: 6px;
          min-width: 90px;
        }
        .lookback__sub-label {
          color: rgba(246, 239, 220, 0.55);
        }
        .lookback__sub-rule {
          flex: 0 0 1px;
          width: 1px;
          align-self: stretch;
          background: rgba(246, 239, 220, 0.18);
        }
        .lookback__years {
          font-family: var(--font-display);
          font-weight: 500;
          font-size: clamp(1.6rem, 2.6vw, 2rem);
          line-height: 1;
          color: var(--paper);
          letter-spacing: -0.02em;
          font-variant-numeric: tabular-nums lining-nums;
        }
        .lookback__chart-wrap {
          padding: 22px 28px 18px;
          background: var(--paper-light);
          border: 1px solid var(--rule-soft);
          border-top: 0;
          border-radius: 0 0 14px 14px;
        }
        .lookback__scenarios {
          display: grid;
          grid-template-columns: 1fr;
          gap: 10px;
          margin-top: 16px;
        }
        @media (min-width: 720px) {
          .lookback__scenarios {
            grid-template-columns: repeat(3, 1fr);
            gap: 14px;
          }
        }
        .lookback__inputs {
          padding: 24px;
          background: var(--paper-warm);
          border: 1px solid var(--rule-soft);
          border-radius: 14px;
          display: flex;
          flex-direction: column;
          gap: 24px;
          align-self: start;
        }
        .lookback__inputs-head {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: 12px;
          padding-bottom: 14px;
          border-bottom: 1px solid var(--rule-soft);
        }
      `}</style>
    </section>
  );
}
