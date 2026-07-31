"use client";

/**
 * FIRECalculator (V2) — financial-independence math.
 *
 * Inputs: annual `expenses`, withdrawal rate `wRate` (%), current
 * portfolio `currentNW`, monthly contribution `monthly`, current age,
 * optional annual gross income (for savings-rate display).
 * Derived: `fireNumber = expenses / (wRate/100)`. For each scenario, we
 * compute years to reach the FIRE number via `yearsToTarget`, plus a
 * projection path for the chart.
 *
 * Result differs from DCA / Shelter: instead of a dollar headline, the
 * poster figure is "{years}" using `useAnimatedNumberRaw` directly so the
 * fractional years tween smoothly.
 *
 * Depth layer below the chart:
 *  - Progress band with % to FIRE and Coast/full-FIRE achievement callout
 *  - 3-up cells: savings rate · Lean FIRE · Fat FIRE
 */
import { useState, useMemo, useEffect } from "react";
import {
  SCENARIOS,
  SCENARIO_KEYS,
  fmtCAD,
  projectGrowth,
  yearsToTarget,
  type ScenarioKey,
} from "@/lib/calc-data";
import { expandParams } from "@/lib/share-params";
import AnimatedDollar from "./AnimatedDollar";
import NumberInput from "./NumberInput";
import AdvancedPanel, { AdvToggle } from "./AdvancedPanel";
import ControlsActions from "./ControlsActions";
import PinnedScenariosBar, { usePinnedScenarios } from "./PinnedScenariosBar";
import ProjectionChart, {
  type ProjectionPathSet,
} from "@/components/charts/ProjectionChart";
import ScenarioToggle from "./ScenarioToggle";
import { useAnimatedNumberRaw } from "./useAnimatedNumber";

interface FIREInputs {
  expenses: number;
  wRate: number;
  currentNW: number;
  monthly: number;
  active: ScenarioKey;
  adjustInflation: boolean;
  /** Optional annual gross income — drives savings-rate display. */
  income: number;
  /** Current age — drives "FIRE at age X" framing in the depth strip. */
  currentAge: number;
}

const MAX_PINS = 4;

const DEFAULTS: FIREInputs = {
  expenses: 50000,
  wRate: 4,
  currentNW: 50000,
  monthly: 1500,
  active: "realistic",
  adjustInflation: false,
  income: 90000,
  currentAge: 30,
};

export default function FIRECalculator() {
  const [expenses, setExpenses] = useState(DEFAULTS.expenses);
  const [wRate, setWRate] = useState(DEFAULTS.wRate);
  const [currentNW, setCurrentNW] = useState(DEFAULTS.currentNW);
  const [monthly, setMonthly] = useState(DEFAULTS.monthly);
  const [active, setActive] = useState<ScenarioKey>(DEFAULTS.active);
  const [adjustInflation, setAdjustInflation] = useState(DEFAULTS.adjustInflation);
  const [income, setIncome] = useState(DEFAULTS.income);
  const [currentAge, setCurrentAge] = useState(DEFAULTS.currentAge);
  const { pinned, pin, remove, restore } = usePinnedScenarios<FIREInputs>(MAX_PINS);

  // Hydrate from URL (share-link landings + OG previews).
  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw: Record<string, string> = {};
    new URLSearchParams(window.location.search).forEach((v, k) => {
      raw[k] = v;
    });
    const p = expandParams(raw);
    const e = typeof p.expenses === "string" ? Number(p.expenses) : NaN;
    if (Number.isFinite(e) && e >= 10_000 && e <= 500_000) setExpenses(Math.round(e));
    const wr = typeof p.withdrawalRate === "string" ? Number(p.withdrawalRate) : NaN;
    if (Number.isFinite(wr) && wr >= 2 && wr <= 6) setWRate(wr);
    const port = typeof p.portfolio === "string" ? Number(p.portfolio) : NaN;
    if (Number.isFinite(port) && port >= 0 && port <= 10_000_000) {
      setCurrentNW(Math.round(port));
    }
    const m = typeof p.monthly === "string" ? Number(p.monthly) : NaN;
    if (Number.isFinite(m) && m >= 0 && m <= 50_000) setMonthly(Math.round(m));
    const a = typeof p.currentAge === "string" ? Number(p.currentAge) : NaN;
    if (Number.isFinite(a) && a >= 16 && a <= 90) setCurrentAge(Math.round(a));
  }, []);

  const fireNumber = expenses / (wRate / 100);

  // Per-scenario: years to reach fireNumber, and a projection path that
  // ends at the FIRE-crossing month so the chart shows accumulation up
  // to the milestone (not 80-year tails).
  const scenarioResults: ProjectionPathSet & { years: Record<ScenarioKey, number> } = useMemo(() => {
    const out: ProjectionPathSet & { years: Record<ScenarioKey, number> } = {
      pessimistic: { final: 0, contributed: 0, path: [] },
      realistic: { final: 0, contributed: 0, path: [] },
      optimistic: { final: 0, contributed: 0, path: [] },
      years: { pessimistic: 0, realistic: 0, optimistic: 0 },
    } as ProjectionPathSet & { years: Record<ScenarioKey, number> };

    for (const key of SCENARIO_KEYS) {
      const rate = SCENARIOS[key].rate - (adjustInflation ? 0.025 : 0);
      const years = yearsToTarget({
        lumpSum: currentNW,
        monthly,
        target: fireNumber,
        annualRate: rate,
      });
      const months = Math.max(12, Math.ceil(years * 12));
      const p = projectGrowth({
        lumpSum: currentNW,
        monthly,
        months,
        annualRate: rate,
      });
      out[key] = { final: p.final, contributed: p.contributed, path: p.path };
      out.years[key] = years;
    }
    return out;
  }, [expenses, wRate, currentNW, monthly, fireNumber, adjustInflation]);

  const activeYears = scenarioResults.years[active];
  const animatedYears = useAnimatedNumberRaw(activeYears);

  // Push state to URL for OG previews.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    const sp = url.searchParams;
    sp.set("tab", "fire");
    sp.set("expenses", String(expenses));
    sp.set("withdrawalRate", String(wRate));
    sp.set("portfolio", String(currentNW));
    sp.set("monthly", String(monthly));
    sp.set("rate", String((SCENARIOS[active].rate * 100).toFixed(1)));
    sp.set("yearsToFire", activeYears.toFixed(1));
    sp.set("result", String(Math.round(fireNumber)));
    sp.set("currentAge", String(currentAge));
    const coast =
      fireNumber /
      Math.pow(1 + SCENARIOS[active].rate, Math.max(0, activeYears));
    sp.set("coastFire", String(Math.round(coast)));
    window.history.replaceState(null, "", `${url.pathname}?${sp.toString()}${url.hash}`);
  }, [expenses, wRate, currentNW, monthly, active, fireNumber, activeYears, currentAge]);

  function resetAll() {
    setExpenses(DEFAULTS.expenses);
    setWRate(DEFAULTS.wRate);
    setCurrentNW(DEFAULTS.currentNW);
    setMonthly(DEFAULTS.monthly);
    setActive(DEFAULTS.active);
    setAdjustInflation(DEFAULTS.adjustInflation);
    setIncome(DEFAULTS.income);
    setCurrentAge(DEFAULTS.currentAge);
  }

  function pinCurrent() {
    pin({
      label: `${fmtCAD(expenses)}/yr · ${wRate}%`,
      value: fireNumber,
      inputs: {
        expenses, wRate, currentNW, monthly, active, adjustInflation, income, currentAge,
      },
    });
  }

  function restoreScenario(i: number) {
    const inp = restore(i);
    if (!inp) return;
    setExpenses(inp.expenses);
    setWRate(inp.wRate);
    setCurrentNW(inp.currentNW);
    setMonthly(inp.monthly);
    setActive(inp.active);
    setAdjustInflation(inp.adjustInflation);
    if (inp.income !== undefined) setIncome(inp.income);
    if (inp.currentAge !== undefined) setCurrentAge(inp.currentAge);
  }

  const activeRate = SCENARIOS[active].rate;
  const coastFire = fireNumber / Math.pow(1 + activeRate, Math.max(0, activeYears));

  // Savings rate — proportion of gross income going into contributions.
  // The 4% rule's flip-side rule of thumb is that savings rate maps
  // roughly to years-to-FIRE (e.g. 50% rate → ~17 years). Display gives
  // the user a check against their progress vs that heuristic.
  const annualContribution = monthly * 12;
  const savingsRate =
    income > 0 ? Math.min(0.95, annualContribution / income) : 0;
  const savingsRateLabel = `${(savingsRate * 100).toFixed(0)}%`;
  // Lean FIRE = 25× a tighter expenses figure (75% of current);
  // Fat FIRE = 25× 150% expenses. Both at the same withdrawal rate.
  const leanFire = (expenses * 0.75) / (wRate / 100);
  const fatFire = (expenses * 1.5) / (wRate / 100);

  // Progress and achievement status against the FIRE number.
  const fireProgress = fireNumber > 0
    ? Math.min(1, currentNW / fireNumber)
    : 0;
  const animatedProgress = useAnimatedNumberRaw(fireProgress * 100);
  const alreadyFire = currentNW >= fireNumber;
  const coastFireAchieved = !alreadyFire && currentNW >= coastFire;

  // Age framing: when will this user hit FIRE, and how does that
  // compare to the conventional Canadian retirement age of 65?
  const fireAge = currentAge + activeYears;
  const yearsVs65 = 65 - fireAge;

  // Safe monthly income at the FIRE number — the actual lived-experience
  // translation of the abstract dollar target.
  const safeMonthlyIncome = fireNumber * (wRate / 100) / 12;

  // Restrict the chart to just the 3 scenario paths (no `years` field).
  const chartPaths: ProjectionPathSet = {
    pessimistic: scenarioResults.pessimistic,
    realistic: scenarioResults.realistic,
    optimistic: scenarioResults.optimistic,
  };
  const baseline = chartPaths.realistic.path.map((p) => ({
    month: p.month,
    balance: p.contributed,
  }));

  return (
    <section className="calc" id="fire" aria-label="FIRE calculator">
      <div className="calc__head">
        <div>
          <div className="calc__kicker">04 &mdash; FIRE</div>
          <h2 className="calc__display">Years to financial independence.</h2>
        </div>
        <span className="calc__micro">
          PROJECTION &middot; {(activeRate * 100).toFixed(0)}% ASSUMED &middot;{" "}
          {wRate}% WITHDRAWAL
        </span>
      </div>

      <div className="calc__layout">
        <div className="calc__main">
          <div className="calc__pinned">
            <PinnedScenariosBar
              pinned={pinned}
              onRestore={restoreScenario}
              onRemove={remove}
              formatter={(n) => fmtCAD(n)}
              hint="PIN UP TO FOUR SCENARIOS TO COMPARE"
            />
          </div>

          <div className="calc__result">
            <div className="calc__sentence">
              <span>FIRE IN</span>
              {Number.isFinite(fireAge) && (
                <span className="calc__chip">AT AGE {fireAge.toFixed(0)}</span>
              )}
              {Number.isFinite(fireAge) && yearsVs65 > 0 && (
                <span>{Math.round(yearsVs65)} YEARS BEFORE 65</span>
              )}
            </div>

            <div className="fire__figrow">
              <span className="fire__fig">{animatedYears.toFixed(1)}</span>
              <span className="fire__unit">YEARS</span>
            </div>

            <p className="calc__tagline">
              AT {(activeRate * 100).toFixed(0)}% RETURNS AND {fmtCAD(monthly)}/MO
              YOU CROSS {fmtCAD(fireNumber, 0)} &mdash; YOUR FIRE NUMBER AT A{" "}
              {wRate}% WITHDRAWAL
            </p>

            <div className="calc__stats">
              <span className="calc__stat">
                <span className="calc__stat-lab">FIRE NUMBER</span>
                <AnimatedDollar value={fireNumber} size="medium" />
              </span>
              <span className="calc__stat">
                <span className="calc__stat-lab">COAST FIRE TODAY</span>
                <AnimatedDollar value={coastFire} size="medium" />
              </span>
              <span className="calc__stat">
                <span className="calc__stat-lab">SAFE MONTHLY INCOME</span>
                <span className="calc__stat-val">
                  {fmtCAD(safeMonthlyIncome, 0)}
                </span>
              </span>
            </div>
          </div>

          <div className="calc__plot">
            {/* Progress band — sits between the result and the chart.
                Gives an at-a-glance gauge of how close the user is. */}
            <div
              className={`fire-progress${alreadyFire ? " is-fired" : coastFireAchieved ? " is-coast" : ""}`}
            >
              <div className="fire-progress__top">
                <span className="fire-progress__lab">PROGRESS TO FIRE</span>
                <span className="fire-progress__pct">
                  {Math.round(animatedProgress)}%
                </span>
              </div>
              <div className="fire-progress__bar" aria-hidden>
                <div
                  className="fire-progress__fill"
                  style={{ width: `${Math.min(100, fireProgress * 100)}%` }}
                />
              </div>
              <div className="fire-progress__cap">
                <span>
                  {fmtCAD(currentNW, 0)} OF {fmtCAD(fireNumber, 0)}
                </span>
                {alreadyFire ? (
                  <span className="fire-progress__chip">
                    FIRE ACHIEVED &middot; WITHDRAW{" "}
                    {fmtCAD(safeMonthlyIncome, 0)}/MO AT {wRate}%
                  </span>
                ) : coastFireAchieved ? (
                  <span className="fire-progress__chip">
                    COAST FIRE &middot; GROWTH ALONE GETS YOU THERE
                  </span>
                ) : (
                  <span className="fire-progress__togo">
                    {fmtCAD(Math.max(0, fireNumber - currentNW), 0)} TO GO
                  </span>
                )}
              </div>
            </div>

            <ProjectionChart paths={chartPaths} activeKey={active} baseline={baseline} />
            <ScenarioToggle value={active} paths={chartPaths} onChange={setActive} />

            {/* Depth strip — calibration against Lean / Fat alternatives and
                a savings-rate check, so the plan above can be judged. */}
            <div className="fire-depth">
              <div className="fire-depth__cell">
                <div className="fire-depth__lab">SAVINGS RATE</div>
                <div className="fire-depth__val">{savingsRateLabel}</div>
                <div className="fire-depth__cap">
                  {fmtCAD(annualContribution)} / YR OF {fmtCAD(income)} GROSS
                </div>
              </div>
              <div className="fire-depth__cell">
                <div className="fire-depth__lab">LEAN FIRE</div>
                <div className="fire-depth__val">{fmtCAD(leanFire, 0)}</div>
                <div className="fire-depth__cap">
                  IF YOU TRIM EXPENSES 25% TO {fmtCAD(expenses * 0.75)}/YR
                </div>
              </div>
              <div className="fire-depth__cell">
                <div className="fire-depth__lab">FAT FIRE</div>
                <div className="fire-depth__val">{fmtCAD(fatFire, 0)}</div>
                <div className="fire-depth__cap">
                  IF YOU TARGET 50% MORE SPENDING: {fmtCAD(expenses * 1.5)}/YR
                </div>
              </div>
            </div>
          </div>
        </div>

        <aside className="calc__inputs">
          <div className="calc__inputs-head">
            <span className="calc__inputs-lab">CONTROLS</span>
            <span className="calc__inputs-hint">ADJUST TO RECOMPUTE</span>
          </div>
          <div className="calc__inputs-body">
            <NumberInput
              label="Annual expenses"
              value={expenses}
              onChange={setExpenses}
              prefix="$"
              step={1000}
              min={10000}
              max={500_000}
            />
            <NumberInput
              label="Withdrawal rate"
              value={wRate}
              onChange={setWRate}
              suffix="%"
              step={0.5}
              min={2}
              max={6}
            />
            <NumberInput
              label="Current portfolio"
              value={currentNW}
              onChange={setCurrentNW}
              prefix="$"
              step={5000}
              min={0}
              max={10_000_000}
            />
            <NumberInput
              label="Monthly contribution"
              value={monthly}
              onChange={setMonthly}
              prefix="$"
              step={100}
              min={0}
              max={50_000}
            />
            <NumberInput
              label="Current age"
              value={currentAge}
              onChange={setCurrentAge}
              suffix="yrs"
              step={1}
              min={16}
              max={90}
            />
          </div>
          <div className="calc__inputs-adv">
            <AdvancedPanel>
              <NumberInput
                label="Annual gross income"
                value={income}
                onChange={setIncome}
                prefix="$"
                step={5000}
                min={0}
                max={2_000_000}
              />
              <AdvToggle
                label="Adjust for inflation"
                sub="Subtract 2.5% from the assumed return rate"
                value={adjustInflation}
                onChange={setAdjustInflation}
              />
            </AdvancedPanel>
          </div>
          <ControlsActions
            variant="column"
            onPin={pinCurrent}
            onReset={resetAll}
            pinDisabled={pinned.length >= MAX_PINS}
          />
        </aside>
      </div>

      <style jsx>{`
        .calc {
          font-family: var(--ins-font);
          color: var(--ins-ink);
          border-top: 3px solid var(--ins-rule-strong, var(--ins-ink));
          padding-top: 16px;
          scroll-margin-top: 80px;
        }
        .calc__head {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: 24px;
        }
        .calc__kicker {
          font-size: 9.5px;
          font-weight: 700;
          letter-spacing: 0.2em;
          color: var(--ins-gray-600);
        }
        .calc__display {
          font-size: 40px;
          font-weight: 700;
          letter-spacing: -0.03em;
          line-height: 1.05;
          margin: 8px 0 0;
        }
        .calc__micro {
          font-size: 9.5px;
          font-weight: 600;
          letter-spacing: 0.16em;
          color: var(--ins-gray-600);
          text-align: right;
          flex: none;
        }

        .calc__layout {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 320px;
          gap: 40px;
          margin-top: 20px;
          align-items: start;
        }
        .calc__main {
          min-width: 0;
        }
        .calc__pinned {
          border-bottom: 1px solid var(--ins-hair);
          padding-bottom: 12px;
        }
        .calc__result {
          padding-top: 18px;
        }
        .calc__sentence {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.14em;
          color: var(--ins-gray-600);
        }
        .calc__chip {
          border: 1px solid var(--ins-ink);
          padding: 2px 8px;
          color: var(--ins-ink);
          font-weight: 700;
          font-variant-numeric: tabular-nums;
        }
        .fire__figrow {
          display: flex;
          align-items: baseline;
          gap: 14px;
          flex-wrap: wrap;
          margin-top: 12px;
        }
        .fire__fig {
          font-size: clamp(44px, 7.4vw, 96px);
          font-weight: 700;
          line-height: 0.95;
          letter-spacing: -0.04em;
          font-variant-numeric: tabular-nums;
          border-bottom: 4px solid var(--ins-signal);
          padding-bottom: 6px;
        }
        .fire__unit {
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.16em;
          color: var(--ins-gray-600);
        }
        .calc__tagline {
          margin: 20px 0 0;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.12em;
          color: var(--ins-gray-600);
          line-height: 1.6;
          max-width: 62ch;
        }
        .calc__stats {
          display: flex;
          gap: 36px;
          flex-wrap: wrap;
          margin-top: 18px;
          padding-top: 14px;
          border-top: 1px solid var(--ins-hair);
        }
        .calc__stat {
          display: inline-flex;
          align-items: baseline;
          gap: 8px;
        }
        .calc__stat-lab {
          font-size: 9.5px;
          font-weight: 600;
          letter-spacing: 0.16em;
          color: var(--ins-gray-600);
        }
        .calc__stat-val {
          font-size: 20px;
          font-weight: 700;
          letter-spacing: -0.015em;
          font-variant-numeric: tabular-nums;
        }

        /* Map the editorial chart tokens onto the Instrument palette so
           the (out-of-scope) SVG modules print in this page's ink/red. */
        .calc__plot {
          margin-top: 26px;
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
          --font-sans: var(--ins-font);
          --font-serif: var(--ins-font);
        }

        /* ── Control column ── */
        .calc__inputs {
          border: 1px solid var(--ins-ink);
          align-self: start;
        }
        .calc__inputs-head {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: 10px;
          padding: 10px 16px;
          border-bottom: 1px solid var(--ins-ink);
        }
        .calc__inputs-lab {
          font-size: 8.5px;
          font-weight: 800;
          letter-spacing: 0.2em;
        }
        .calc__inputs-hint {
          font-size: 8px;
          font-weight: 600;
          letter-spacing: 0.14em;
          color: var(--ins-gray-600);
        }
        .calc__inputs-body {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }
        .calc__inputs-adv {
          padding: 12px 16px;
          border-top: 1px solid var(--ins-hair);
        }

        /* ── Progress band ── */
        .fire-progress {
          margin-bottom: 18px;
          padding: 12px 14px;
          border: 1px solid var(--ins-hair);
        }
        .fire-progress.is-fired,
        .fire-progress.is-coast {
          border-color: var(--ins-ink);
        }
        .fire-progress__top {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: 12px;
          margin-bottom: 8px;
        }
        .fire-progress__lab {
          font-size: 8.5px;
          font-weight: 700;
          letter-spacing: 0.2em;
          color: var(--ins-gray-600);
        }
        .fire-progress__pct {
          font-size: 18px;
          font-weight: 700;
          letter-spacing: -0.02em;
          font-variant-numeric: tabular-nums;
        }
        .fire-progress__bar {
          width: 100%;
          height: 6px;
          background: var(--ins-track-soft);
        }
        .fire-progress__fill {
          height: 100%;
          background: var(--ins-ink);
          transition: width 0.4s ease;
        }
        .fire-progress__cap {
          margin-top: 8px;
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.12em;
          color: var(--ins-gray-600);
          font-variant-numeric: tabular-nums;
        }
        .fire-progress__chip {
          background: var(--ins-ink);
          color: var(--ins-paper);
          padding: 3px 9px;
          font-weight: 700;
          letter-spacing: 0.12em;
        }
        .fire-progress__togo {
          color: var(--ins-gray-600);
        }

        /* ── Depth strip ── */
        .fire-depth {
          margin-top: 24px;
          padding-top: 18px;
          border-top: 1px solid var(--ins-hair);
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }
        .fire-depth__cell {
          display: flex;
          flex-direction: column;
          gap: 4px;
          min-width: 0;
        }
        .fire-depth__lab {
          font-size: 8.5px;
          font-weight: 700;
          letter-spacing: 0.2em;
          color: var(--ins-gray-600);
        }
        .fire-depth__val {
          font-size: 22px;
          font-weight: 700;
          line-height: 1.05;
          letter-spacing: -0.02em;
          margin-top: 4px;
          font-variant-numeric: tabular-nums;
        }
        .fire-depth__cap {
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.1em;
          color: var(--ins-gray-600);
          line-height: 1.5;
        }
        @media (min-width: 720px) {
          .fire-depth {
            grid-template-columns: repeat(3, 1fr);
            gap: 22px;
          }
        }

        @media (max-width: 1080px) {
          .calc__layout {
            grid-template-columns: 1fr;
            gap: 24px;
          }
        }
        @media (max-width: 640px) {
          .calc {
            padding-top: 12px;
          }
          .calc__head {
            display: block;
          }
          .calc__kicker {
            font-size: 9px;
            letter-spacing: 0.18em;
          }
          .calc__display {
            font-size: 26px;
            margin-top: 6px;
          }
          .calc__micro {
            display: block;
            text-align: left;
            margin-top: 6px;
            font-size: 8.5px;
            letter-spacing: 0.12em;
          }
          .calc__layout {
            margin-top: 14px;
            gap: 18px;
          }
          .calc__sentence {
            font-size: 9.5px;
            letter-spacing: 0.12em;
            gap: 8px;
          }
          .fire__fig {
            border-bottom-width: 3px;
            padding-bottom: 4px;
          }
          .fire__unit {
            font-size: 11px;
          }
          .calc__tagline {
            margin-top: 14px;
            font-size: 10px;
          }
          .calc__stats {
            gap: 20px;
            margin-top: 14px;
          }
          .calc__stat-lab {
            font-size: 9px;
            letter-spacing: 0.12em;
          }
          .calc__stat-val {
            font-size: 16px;
          }
          .calc__plot {
            margin-top: 20px;
          }
        }
      `}</style>
    </section>
  );
}
