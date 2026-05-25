"use client";

/**
 * FIRECalculator (V2) — financial-independence math.
 *
 * Inputs: annual `expenses`, withdrawal rate `wRate` (%), current
 * portfolio `currentNW`, monthly contribution `monthly`.
 * Derived: `fireNumber = expenses / (wRate/100)`. For each scenario, we
 * compute years to reach the FIRE number via `yearsToTarget`, plus a
 * projection path for the chart.
 *
 * Result slab differs from DCA / TFSA: instead of an animated dollar
 * headline, the big number is "FIRE in {years} years" using
 * `useAnimatedNumberRaw` directly so the fractional years tween smoothly.
 * Two sub-stats: the FIRE number itself and Coast FIRE today (the lump
 * that, left alone at this rate, would compound into the FIRE number by
 * the FIRE date).
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
}

const DEFAULTS: FIREInputs = {
  expenses: 50000,
  wRate: 4,
  currentNW: 50000,
  monthly: 1500,
  active: "realistic",
  adjustInflation: false,
  income: 90000,
};

export default function FIRECalculator() {
  const [expenses, setExpenses] = useState(DEFAULTS.expenses);
  const [wRate, setWRate] = useState(DEFAULTS.wRate);
  const [currentNW, setCurrentNW] = useState(DEFAULTS.currentNW);
  const [monthly, setMonthly] = useState(DEFAULTS.monthly);
  const [active, setActive] = useState<ScenarioKey>(DEFAULTS.active);
  const [adjustInflation, setAdjustInflation] = useState(DEFAULTS.adjustInflation);
  const [income, setIncome] = useState(DEFAULTS.income);
  const { pinned, pin, remove, restore } = usePinnedScenarios<FIREInputs>(3);

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
    const coast =
      fireNumber /
      Math.pow(1 + SCENARIOS[active].rate, Math.max(0, activeYears));
    sp.set("coastFire", String(Math.round(coast)));
    window.history.replaceState(null, "", `${url.pathname}?${sp.toString()}${url.hash}`);
  }, [expenses, wRate, currentNW, monthly, active, fireNumber, activeYears]);

  function resetAll() {
    setExpenses(DEFAULTS.expenses);
    setWRate(DEFAULTS.wRate);
    setCurrentNW(DEFAULTS.currentNW);
    setMonthly(DEFAULTS.monthly);
    setActive(DEFAULTS.active);
    setAdjustInflation(DEFAULTS.adjustInflation);
    setIncome(DEFAULTS.income);
  }

  function pinCurrent() {
    pin({
      label: `${fmtCAD(expenses)}/yr · ${wRate}%`,
      value: fireNumber,
      inputs: {
        expenses, wRate, currentNW, monthly, active, adjustInflation, income,
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
    <section className="calc" id="fire">
      <header className="calc__head">
        <span className="ed-stamp calc__stamp">Calculator 04 &middot; FIRE</span>
        <h3 className="ed-display-italic calc__title">
          Years to{" "}
          <em style={{ fontStyle: "italic", fontWeight: 500 }}>financial independence.</em>
        </h3>
      </header>

      <div className="calc__layout">
        <div className="calc__main">
          <PinnedScenariosBar
            pinned={pinned}
            onRestore={restoreScenario}
            onRemove={remove}
            formatter={(n) => fmtCAD(n)}
          />

          <div className="calc__result calc__result--dark">
            <div className="ed-stamp calc__result-stamp">FIRE in</div>
            <div className="fire__years-row">
              <span className="ed-display ed-numerals fire__years">
                {animatedYears.toFixed(1)}
              </span>
              <span className="fire__years-unit">years</span>
            </div>
            <p className="fire__sentence">
              At {(activeRate * 100).toFixed(0)}% returns and {fmtCAD(monthly)} a month, you cross{" "}
              <strong>{fmtCAD(fireNumber, 0)}</strong> (your FIRE number, based on a {wRate}% withdrawal).
            </p>
            <div className="fire__stats">
              <div>
                <div className="ed-label calc__sub-label">FIRE number</div>
                <AnimatedDollar value={fireNumber} size="large" />
                <div className="ed-caption fire__caption">
                  {fmtCAD(expenses)}/yr &divide; {wRate}%
                </div>
              </div>
              <div className="calc__sub-rule" />
              <div>
                <div className="ed-label calc__sub-label">Coast FIRE today</div>
                <AnimatedDollar value={coastFire} size="large" />
                <div className="ed-caption fire__caption">
                  If you stop contributing now
                </div>
              </div>
            </div>
          </div>

          <div className="calc__chart-wrap">
            <ProjectionChart paths={chartPaths} activeKey={active} baseline={baseline} />
            <ScenarioToggle value={active} paths={chartPaths} onChange={setActive} />

            {/* Depth strip — three reference points: savings rate
                check, Lean FIRE target, and Fat FIRE target. Helps the
                user calibrate whether the FIRE plan above is plausible
                and what alternatives look like. */}
            <div className="fire-depth">
              <div className="fire-depth__cell">
                <div className="ed-label">Savings rate</div>
                <div className="fire-depth__val">
                  {savingsRateLabel}
                </div>
                <div className="ed-caption fire-depth__cap">
                  {fmtCAD(annualContribution)} / yr of {fmtCAD(income)} gross
                </div>
              </div>
              <div className="fire-depth__cell">
                <div className="ed-label">Lean FIRE</div>
                <div className="fire-depth__val fire-depth__val--green">
                  {fmtCAD(leanFire, 0)}
                </div>
                <div className="ed-caption fire-depth__cap">
                  If you trim expenses 25% to {fmtCAD(expenses * 0.75)}/yr
                </div>
              </div>
              <div className="fire-depth__cell">
                <div className="ed-label">Fat FIRE</div>
                <div className="fire-depth__val fire-depth__val--stamp">
                  {fmtCAD(fatFire, 0)}
                </div>
                <div className="ed-caption fire-depth__cap">
                  If you target 50% more spending: {fmtCAD(expenses * 1.5)}/yr
                </div>
              </div>
            </div>
          </div>
        </div>

        <aside className="calc__inputs">
          <div className="calc__inputs-head">
            <span className="ed-stamp">Controls</span>
            <span className="ed-caption">Adjust to recompute</span>
          </div>
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
            label="Annual gross income"
            value={income}
            onChange={setIncome}
            prefix="$"
            step={5000}
            min={0}
            max={2_000_000}
          />
          <AdvancedPanel>
            <AdvToggle
              label="Adjust for inflation"
              sub="Subtract 2.5% from the assumed return rate"
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
        .calc {
          padding: 30px 0 18px;
          scroll-margin-top: 80px;
        }
        .calc__head {
          margin-bottom: 22px;
        }
        .calc__stamp {
          color: var(--paper-light);
          background: var(--stamp);
          padding: 5px 12px 4px;
          letter-spacing: 0.22em;
          display: inline-block;
        }
        .calc__title {
          font-size: clamp(1.8rem, 3.4vw, 2.4rem);
          line-height: 1.05;
          letter-spacing: -0.025em;
          margin: 12px 0 0;
          color: var(--ink);
        }
        .calc__layout {
          display: grid;
          grid-template-columns: 1fr;
          gap: 18px;
        }
        @media (min-width: 1000px) {
          .calc__layout {
            grid-template-columns: minmax(0, 1.8fr) minmax(260px, 1fr);
            gap: 32px;
          }
        }
        .calc__main {
          min-width: 0;
          display: flex;
          flex-direction: column;
        }
        .calc__result--dark {
          background: var(--band-ink);
          color: var(--band-paper);
          border-radius: 14px 14px 0 0;
          position: relative;
          overflow: hidden;
          padding: 28px 30px 26px;
        }
        .calc__result--dark::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: var(--stamp);
        }
        .calc__result--dark :global(.anum) {
          color: var(--paper);
        }
        .calc__result-stamp {
          color: rgba(246, 239, 220, 0.55);
          margin-bottom: 10px;
        }
        .fire__years-row {
          display: flex;
          align-items: baseline;
          gap: 12px;
          margin: 4px 0 10px;
        }
        .fire__years {
          font-size: clamp(3.4rem, 7vw, 5.4rem);
          line-height: 0.95;
          letter-spacing: -0.035em;
          color: var(--paper);
          font-family: var(--font-display);
          font-weight: 500;
          font-variant-numeric: tabular-nums lining-nums;
        }
        .fire__years-unit {
          font-family: var(--font-serif);
          font-style: italic;
          font-size: clamp(1.3rem, 1.9vw, 1.6rem);
          color: rgba(246, 239, 220, 0.6);
        }
        .fire__sentence {
          font-family: var(--font-serif);
          font-style: italic;
          font-size: clamp(15px, 1.6vw, 17px);
          line-height: 1.55;
          color: rgba(246, 239, 220, 0.78);
          margin: 6px 0 0;
          max-width: 56ch;
        }
        .fire__sentence strong {
          font-style: normal;
          color: var(--paper);
          font-weight: 600;
        }
        .fire__stats {
          display: flex;
          gap: 18px;
          align-items: center;
          margin-top: 18px;
          padding-top: 16px;
          border-top: 1px solid rgba(246, 239, 220, 0.18);
          flex-wrap: wrap;
        }
        /* Exclude .calc__sub-rule from the flex/min-width that applies
           to actual stat cells, otherwise the 1px divider gets inflated
           to 160px and reads as a grey block in the middle of the slab. */
        .fire__stats > div:not(.calc__sub-rule) {
          flex: 1;
          min-width: 160px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .fire__caption {
          color: rgba(246, 239, 220, 0.55);
        }
        .calc__sub-label {
          color: rgba(246, 239, 220, 0.55);
        }
        .calc__sub-rule {
          flex: 0 0 1px;
          width: 1px;
          align-self: stretch;
          background: rgba(246, 239, 220, 0.18);
        }
        .calc__chart-wrap {
          padding: 22px 28px 18px;
          background: var(--paper-light);
          border: 1px solid var(--rule-soft);
          border-top: 0;
          border-radius: 0 0 14px 14px;
        }
        .calc__inputs {
          padding: 24px;
          background: var(--paper-warm);
          border: 1px solid var(--rule-soft);
          border-radius: 14px;
          display: flex;
          flex-direction: column;
          gap: 22px;
          align-self: start;
        }
        .calc__inputs-head {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: 12px;
          padding-bottom: 14px;
          border-bottom: 1px solid var(--rule-soft);
        }
        .fire-depth {
          margin-top: 24px;
          padding-top: 20px;
          border-top: 1px solid var(--rule-soft);
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }
        @media (min-width: 720px) {
          .fire-depth {
            grid-template-columns: repeat(3, 1fr);
            gap: 22px;
          }
        }
        .fire-depth__cell {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .fire-depth__val {
          font-family: var(--font-display);
          font-weight: 500;
          font-size: clamp(1.4rem, 2.4vw, 1.8rem);
          line-height: 1.05;
          letter-spacing: -0.02em;
          margin-top: 4px;
          color: var(--ink);
          font-variant-numeric: tabular-nums lining-nums;
        }
        .fire-depth__val--green {
          color: var(--green);
        }
        .fire-depth__val--stamp {
          color: var(--stamp);
        }
        .fire-depth__cap {
          font-size: 12px;
          color: var(--ink-mute);
        }
      `}</style>
    </section>
  );
}
