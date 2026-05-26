"use client";

/**
 * CalculatorCard — shared shell used by DCACalculator and TFSARRSPCalculator.
 *
 * Composition:
 *   - vermilion calculator-number stamp + italic title
 *   - 2-col layout: dark slab + cream chart on the left, controls on the right
 *   - pinned scenarios chip bar above the dark slab
 *   - sub-stats row (contribute / growth / multiple) below the headline
 *   - scenario toggle below the projection chart
 *   - controls column with advanced panel + pin/reset actions at the bottom
 *
 * FIRECalculator does NOT use this wrapper — its result slab needs a
 * "FIRE in {n} years" layout instead of a dollar headline.
 */
import type { ReactNode } from "react";
import { SCENARIOS, fmtCAD, type ScenarioKey } from "@/lib/calc-data";
import AnimatedDollar from "./AnimatedDollar";
import PinnedScenariosBar, { type PinnedScenario } from "./PinnedScenariosBar";
import ProjectionChart, {
  type ProjectionPathSet,
} from "@/components/charts/ProjectionChart";
import ScenarioToggle from "./ScenarioToggle";
import AdvancedPanel from "./AdvancedPanel";
import ControlsActions from "./ControlsActions";

export interface CalculatorCardProps<I> {
  /** "02" / "03" — left-padded calculator order number. */
  number: string;
  /** "DCA" / "Account growth" — short name in the vermilion stamp. */
  name: string;
  /** Big italic display title. */
  title: ReactNode;
  /** Italic body sentence under the headline. */
  tagline: ReactNode;
  /** Anchor id for the section (matches CalcDock jump links). */
  anchorId: string;

  paths: ProjectionPathSet;
  activeKey: ScenarioKey;
  setActiveKey: (k: ScenarioKey) => void;
  baseline?: { month: number; balance: number }[];

  pinned: PinnedScenario<I>[];
  onPin: () => void;
  onRemove: (i: number) => void;
  onRestore: (i: number) => void;
  onReset: () => void;

  /** Children of <AdvancedPanel> — pass undefined to skip the panel entirely. */
  advancedContent?: ReactNode;
  /** Primary controls (number inputs, segmented controls, presets…). */
  controls: ReactNode;
  /** Optional content rendered above the projection chart (e.g. account
   *  contribution-room tracker for Shelter). */
  aboveChart?: ReactNode;
  /** Optional content rendered below the scenario toggle (e.g. depth
   *  stat strip in Shelter's tax callouts). */
  belowChart?: ReactNode;
}

export default function CalculatorCard<I>({
  number,
  name,
  title,
  tagline,
  anchorId,
  paths,
  activeKey,
  setActiveKey,
  baseline,
  pinned,
  onPin,
  onRemove,
  onRestore,
  onReset,
  advancedContent,
  controls,
  aboveChart,
  belowChart,
}: CalculatorCardProps<I>) {
  const activePath = paths[activeKey];
  const activeYears = Math.max(0, Math.floor((activePath.path.length - 1) / 12));
  const final = activePath.final;
  const contributed = activePath.contributed;
  const growth = final - contributed;
  const multiple = contributed > 0 ? final / contributed : 0;

  return (
    <section className="calc" id={anchorId}>
      <header className="calc__head">
        <span className="ed-stamp calc__stamp">
          Calculator {number} &middot; {name}
        </span>
        <h3 className="ed-display-italic calc__title">{title}</h3>
      </header>

      <div className="calc__layout">
        <div className="calc__main">
          <PinnedScenariosBar
            pinned={pinned}
            onRestore={onRestore}
            onRemove={onRemove}
            formatter={(n) => fmtCAD(n)}
          />

          <div className="calc__result calc__result--dark">
            <div className="ed-stamp calc__result-stamp">
              In {SCENARIOS[activeKey].label.toLowerCase()} terms, after {activeYears} years
            </div>
            <AnimatedDollar value={final} size="huge" />
            <p className="calc__tagline">{tagline}</p>
            <div className="calc__sub-stats">
              <div>
                <div className="ed-label calc__sub-label">You contribute</div>
                <AnimatedDollar value={contributed} size="medium" />
              </div>
              <div className="calc__sub-rule" aria-hidden />
              <div>
                <div className="ed-label calc__sub-label">Growth</div>
                <AnimatedDollar value={growth} size="medium" />
              </div>
              <div className="calc__sub-rule" aria-hidden />
              <div>
                <div className="ed-label calc__sub-label">Multiple</div>
                <span className="ed-display ed-numerals calc__mult">
                  {multiple.toFixed(2)}&times;
                </span>
              </div>
            </div>
          </div>

          <div className="calc__chart-wrap">
            {aboveChart}
            <ProjectionChart paths={paths} activeKey={activeKey} baseline={baseline} />
            <ScenarioToggle value={activeKey} paths={paths} onChange={setActiveKey} />
            {belowChart}
          </div>
        </div>

        <aside className="calc__inputs">
          <div className="calc__inputs-head">
            <span className="ed-stamp">Controls</span>
            <span className="ed-caption">Adjust to recompute</span>
          </div>
          {controls}
          {advancedContent && <AdvancedPanel>{advancedContent}</AdvancedPanel>}
          <ControlsActions
            onPin={onPin}
            onReset={onReset}
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
          color: var(--band-paper);
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
        .calc__result {
          padding: 26px 28px 24px;
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
        .calc__result-stamp {
          color: rgba(246, 239, 220, 0.55);
          margin-bottom: 10px;
        }
        .calc__result-stamp + :global(.anum) {
          color: var(--band-paper);
        }
        .calc__result--dark :global(.anum) {
          color: var(--band-paper);
        }
        .calc__chart-wrap {
          padding: 22px 28px 18px;
          background: var(--paper-light);
          border: 1px solid var(--rule-soft);
          border-top: 0;
          border-radius: 0 0 14px 14px;
        }
        .calc__tagline {
          font-family: var(--font-serif);
          font-style: italic;
          font-size: clamp(14.5px, 1.5vw, 16px);
          color: rgba(246, 239, 220, 0.78);
          margin: 12px 0 0;
          line-height: 1.55;
          max-width: 56ch;
        }
        .calc__sub-stats {
          display: flex;
          gap: 18px;
          align-items: center;
          margin-top: 18px;
          padding-top: 16px;
          border-top: 1px solid rgba(246, 239, 220, 0.18);
          flex-wrap: wrap;
        }
        /* The original selector .calc__sub-stats > div accidentally
           caught the 1px .calc__sub-rule divider too, inflating it to
           110px min-width — a wide grey block in the middle of the dark
           result slab. :not() excludes it so only the actual stat cells
           pick up the min-width. */
        .calc__sub-stats > div:not(.calc__sub-rule) {
          display: flex;
          flex-direction: column;
          gap: 6px;
          min-width: 110px;
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
        .calc__mult {
          font-family: var(--font-display);
          font-weight: 500;
          font-size: clamp(1.4rem, 2.4vw, 1.7rem);
          line-height: 1.05;
          letter-spacing: -0.015em;
          color: var(--band-paper);
          font-variant-numeric: tabular-nums lining-nums;
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
      `}</style>
    </section>
  );
}
