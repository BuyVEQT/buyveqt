"use client";

/**
 * DCACalculator (V2) — monthly contribution + horizon, three scenarios.
 *
 * Inputs: `monthly`, `horizon` (years), `active` (scenario), `contribGrowth`
 * (% / yr COLA), `adjustInflation` (subtract 2.5% from each scenario rate).
 *
 * URL state: writes the long-key params (`monthly`, `horizon`, `rate`,
 * `contributed`, `result`, `growth`) on every change so the OG-image
 * preview picks them up via `expandParams`. The route's `revalidate = 86400`
 * is unaffected — only the metadata branch reads searchParams.
 */
import { useState, useMemo, useEffect } from "react";
import {
  SCENARIOS,
  SCENARIO_KEYS,
  fmtCAD,
  projectGrowth,
  type ScenarioKey,
} from "@/lib/calc-data";
import { expandParams } from "@/lib/share-params";
import CalculatorCard from "./CalculatorCard";
import NumberInput from "./NumberInput";
import { AdvToggle } from "./AdvancedPanel";
import { usePinnedScenarios } from "./PinnedScenariosBar";
import type { ProjectionPathSet } from "@/components/charts/ProjectionChart";

interface DCAInputs {
  monthly: number;
  horizon: number;
  active: ScenarioKey;
  contribGrowth: number;
  adjustInflation: boolean;
}

const DEFAULTS: DCAInputs = {
  monthly: 500,
  horizon: 20,
  active: "realistic",
  contribGrowth: 0,
  adjustInflation: false,
};

export default function DCACalculator() {
  const [monthly, setMonthly] = useState(DEFAULTS.monthly);
  const [horizon, setHorizon] = useState(DEFAULTS.horizon);
  const [active, setActive] = useState<ScenarioKey>(DEFAULTS.active);
  const [contribGrowth, setContribGrowth] = useState(DEFAULTS.contribGrowth);
  const [adjustInflation, setAdjustInflation] = useState(DEFAULTS.adjustInflation);
  const { pinned, pin, remove, restore } = usePinnedScenarios<DCAInputs>(4);

  // Read URL params on mount — supports share-link landings + OG previews.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw: Record<string, string> = {};
    new URLSearchParams(window.location.search).forEach((v, k) => {
      raw[k] = v;
    });
    const p = expandParams(raw);
    const m = typeof p.monthly === "string" ? Number(p.monthly) : NaN;
    if (Number.isFinite(m) && m >= 0 && m <= 100000) setMonthly(Math.round(m));
    const h = typeof p.horizon === "string" ? Number(p.horizon) : NaN;
    if (Number.isFinite(h) && h >= 1 && h <= 50) setHorizon(Math.round(h));
  }, []);

  const paths: ProjectionPathSet = useMemo(() => {
    const months = horizon * 12;
    // COLA is approximated by averaging — `projectGrowth` accepts a constant
    // monthly. We use the midpoint of the growth ramp so the integrated
    // contribution comes out approximately right without re-implementing
    // the compounding loop here.
    const effMonthly = monthly * (1 + (contribGrowth / 100) * (horizon / 2));
    const out = {} as ProjectionPathSet;
    for (const key of SCENARIO_KEYS) {
      const rate = SCENARIOS[key].rate - (adjustInflation ? 0.025 : 0);
      out[key] = projectGrowth({ monthly: effMonthly, months, annualRate: rate });
    }
    return out;
  }, [monthly, horizon, contribGrowth, adjustInflation]);

  const baseline = useMemo(
    () =>
      paths.realistic.path.map((p) => ({ month: p.month, balance: p.contributed })),
    [paths]
  );

  // Mirror inputs to the URL so OG-image preview picks them up. No history
  // push — replaceState keeps the back-button clean.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    const sp = url.searchParams;
    sp.set("tab", "dca");
    sp.set("monthly", String(monthly));
    sp.set("horizon", String(horizon));
    sp.set("rate", String((SCENARIOS[active].rate * 100).toFixed(1)));
    sp.set("contributions", String(Math.round(paths[active].contributed)));
    sp.set("growth", String(Math.round(paths[active].final - paths[active].contributed)));
    sp.set("result", String(Math.round(paths[active].final)));
    window.history.replaceState(null, "", `${url.pathname}?${sp.toString()}${url.hash}`);
  }, [monthly, horizon, active, paths]);

  function resetAll() {
    setMonthly(DEFAULTS.monthly);
    setHorizon(DEFAULTS.horizon);
    setActive(DEFAULTS.active);
    setContribGrowth(DEFAULTS.contribGrowth);
    setAdjustInflation(DEFAULTS.adjustInflation);
  }

  function pinCurrent() {
    pin({
      label: `${fmtCAD(monthly)}/mo · ${horizon}y`,
      value: paths[active].final,
      inputs: { monthly, horizon, active, contribGrowth, adjustInflation },
    });
  }

  function restoreScenario(i: number) {
    const inp = restore(i);
    if (!inp) return;
    setMonthly(inp.monthly);
    setHorizon(inp.horizon);
    setActive(inp.active);
    setContribGrowth(inp.contribGrowth);
    setAdjustInflation(inp.adjustInflation);
  }

  // Stays SHOUTING: this is a spec strip with no verb — it names the run
  // rather than explaining it — so it is a label, not a caption, and keeps
  // its caps under the Turn 8 contract. Pre-uppercased rather than
  // text-transformed so a symbol added here later can't be mangled.
  const taglineCola =
    contribGrowth > 0 ? ` · GROWING ${contribGrowth}%/YR` : "";
  const taglineInflation = adjustInflation ? " · IN TODAY’S DOLLARS" : "";
  const tagline = `${fmtCAD(monthly)}/MO · ${horizon} YEARS OUT${taglineCola}${taglineInflation}`;

  return (
    <CalculatorCard<DCAInputs>
      number="02"
      name="DCA"
      anchorId="dca"
      title="Dollar-cost average."
      tagline={tagline}
      paths={paths}
      activeKey={active}
      setActiveKey={setActive}
      baseline={baseline}
      pinned={pinned}
      onPin={pinCurrent}
      onRemove={remove}
      onRestore={restoreScenario}
      onReset={resetAll}
      advancedContent={
        <>
          <NumberInput
            label="Contribution growth (annual)"
            value={contribGrowth}
            onChange={setContribGrowth}
            suffix="% / yr"
            step={0.5}
            min={0}
            max={10}
          />
          <AdvToggle
            label="Adjust for inflation"
            sub="Subtract 2.5% from the assumed return rate"
            value={adjustInflation}
            onChange={setAdjustInflation}
          />
        </>
      }
      controls={
        <>
          <NumberInput
            label="Monthly contribution"
            value={monthly}
            onChange={setMonthly}
            prefix="$"
            step={50}
            min={0}
            max={100000}
          />
          <NumberInput
            label="Years invested"
            value={horizon}
            onChange={setHorizon}
            suffix="years"
            step={1}
            min={1}
            max={50}
          />
          <div className="calc-quick">
            <span className="calc-quick__lab">TRY</span>
            <button
              type="button"
              onClick={() => {
                setMonthly(500);
                setHorizon(20);
              }}
            >
              $500/mo &times; 20y
            </button>
            <button
              type="button"
              onClick={() => {
                setMonthly(1000);
                setHorizon(30);
              }}
            >
              $1k/mo &times; 30y
            </button>
            <button
              type="button"
              onClick={() => {
                setMonthly(250);
                setHorizon(40);
              }}
            >
              $250/mo &times; 40y
            </button>
          </div>
          <style jsx>{`
            .calc-quick {
              padding-top: 16px;
              border-top: 1px solid var(--ins-hair);
              display: flex;
              flex-wrap: wrap;
              align-items: center;
              gap: 6px;
              font-family: var(--ins-font);
            }
            /* "TRY" — a TRUE LABEL heading the preset row. 8px → the
               floor, one tracking notch back for the fixed 320px column. */
            .calc-quick__lab {
              font-size: 10px;
              font-weight: 700;
              letter-spacing: 0.18em;
              color: var(--ins-gray-600);
              flex-basis: 100%;
            }
            /* Preset chips are labels too — they name a run ("$500/MO ×
               20Y"). Caps kept, 9px → the floor; 0.08em tracking is
               already below the dial-back table, and at 10px a chip
               measures ~111px, so the row still seats two per line inside
               the column exactly as it did. min-height 32px → 44px on
               every viewport, not just phones. */
            .calc-quick button {
              appearance: none;
              background: transparent;
              border: 1px solid var(--ins-hair);
              border-radius: 0;
              padding: 7px 10px;
              min-height: 44px;
              font-family: var(--ins-font);
              font-size: 10px;
              font-weight: 700;
              letter-spacing: 0.08em;
              text-transform: uppercase;
              font-variant-numeric: tabular-nums;
              color: var(--ins-ink);
              cursor: pointer;
              transition: background 0.15s, color 0.15s, border-color 0.15s;
            }
            .calc-quick button:hover {
              background: var(--ins-ink);
              border-color: var(--ins-ink);
              color: var(--ins-paper);
            }
            .calc-quick button:focus-visible {
              outline: 2px solid var(--ins-signal);
              outline-offset: 2px;
            }
          `}</style>
        </>
      }
    />
  );
}
