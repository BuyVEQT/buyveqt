"use client";

/**
 * CalculatorCard — shared Instrument shell used by DCACalculator and
 * TFSARRSPCalculator.
 *
 * Same grammar as the Lookback, adapted to a projection: ordinal kicker +
 * display + right micro, a poster figure with the signal underline, ruled
 * stat rows, the projection chart, and a bordered control column whose
 * rows are divided by 1px rules and closed by PIN SCENARIO / RESET.
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
  /** "DCA" / "Shelter" — short name in the section kicker. */
  name: string;
  /** Display headline for the section. */
  title: ReactNode;
  /** Micro line under the poster figure — pre-uppercased. */
  tagline: ReactNode;
  /** Anchor id for the section (matches deep links). */
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
  /** Pin cap — the strip disables PIN once the list is full. */
  maxPins?: number;

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
  maxPins = 4,
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
  const scenario = SCENARIOS[activeKey];

  return (
    <section className="calc" id={anchorId}>
      <div className="calc__head">
        <div>
          <div className="calc__kicker">
            {number} &mdash; {name.toUpperCase()}
          </div>
          <h2 className="calc__display">{title}</h2>
        </div>
        <span className="calc__micro">
          PROJECTION &middot; {(scenario.rate * 100).toFixed(0)}% ASSUMED
          &middot; {activeYears} YEARS
        </span>
      </div>

      <div className="calc__layout">
        <div className="calc__main">
          <div className="calc__pinned">
            <PinnedScenariosBar
              pinned={pinned}
              onRestore={onRestore}
              onRemove={onRemove}
              formatter={(n) => fmtCAD(n)}
              hint="Pin up to four scenarios to compare"
            />
          </div>

          <div className="calc__result">
            {/* Result qualifier — a sentence about the figure below, so it
                reads as a caption in sentence case since Turn 8. The
                scenario name is lower-cased inline rather than shouted. */}
            <div className="calc__sentence">
              In {scenario.label.toLowerCase()} terms, after {activeYears} years
            </div>
            <div className="calc__fig">
              <AnimatedDollar value={final} size="huge" />
            </div>
            <p className="calc__tagline">{tagline}</p>
            <div className="calc__stats">
              <span className="calc__stat">
                <span className="calc__stat-lab">YOU CONTRIBUTE</span>
                <AnimatedDollar value={contributed} size="medium" />
              </span>
              <span className="calc__stat">
                <span className="calc__stat-lab">GROWTH</span>
                <AnimatedDollar value={growth} size="medium" />
              </span>
              <span className="calc__stat">
                <span className="calc__stat-lab">MULTIPLE</span>
                <span className="calc__stat-val">{multiple.toFixed(2)}&times;</span>
              </span>
            </div>
          </div>

          <div className="calc__plot">
            {aboveChart}
            <ProjectionChart paths={paths} activeKey={activeKey} baseline={baseline} />
            <ScenarioToggle value={activeKey} paths={paths} onChange={setActiveKey} />
            {belowChart}
          </div>
        </div>

        <aside className="calc__inputs">
          <div className="calc__inputs-head">
            <span className="calc__inputs-lab">CONTROLS</span>
            <span className="calc__inputs-hint">ADJUST TO RECOMPUTE</span>
          </div>
          <div className="calc__inputs-body">{controls}</div>
          {advancedContent && (
            <div className="calc__inputs-adv">
              <AdvancedPanel>{advancedContent}</AdvancedPanel>
            </div>
          )}
          <ControlsActions
            variant="column"
            onPin={onPin}
            onReset={onReset}
            pinDisabled={pinned.length >= maxPins}
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
        /* Section kicker and right-hand micro are both TRUE LABELS — an
           ordinal + name, and a spec strip naming the assumptions. Caps
           and tracking stay; 9.5px → the 10px floor. Neither sits in a
           fixed box (the header is a flex row that wraps at 640px), so
           there is nothing to dial back. */
        .calc__kicker {
          font-size: 10px;
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
          font-size: 10px;
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
        /* EXPLANATORY CAPTION — the qualifier above the poster figure.
           Caption contract; the copy is authored in sentence case in the
           JSX above, so there is no text-transform to undo. */
        .calc__sentence {
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.01em;
          color: var(--ins-gray-600);
        }
        .calc__fig {
          margin-top: 12px;
        }
        .calc__fig :global(.anum) {
          border-bottom: 4px solid var(--ins-signal);
          padding-bottom: 6px;
        }
        /* The tagline stayed a caps LABEL, unlike the sentence above it:
           every string that lands here is a spec strip with no verb
           ("$500/MO · 20 YEARS OUT", "TAX-FREE GROWTH · $7,000/YR CAP") —
           it names the run, it doesn't explain it. Already above the
           floor, so nothing moved. */
        .calc__tagline {
          margin: 20px 0 0;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.12em;
          color: var(--ins-gray-600);
          line-height: 1.6;
          max-width: 60ch;
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
        /* Stat labels ("YOU CONTRIBUTE", "GROWTH", "MULTIPLE") name their
           figures — labels, caps kept, 9.5px → the floor. */
        .calc__stat-lab {
          font-size: 10px;
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
        /* Control-column head. "CONTROLS" is plainly a label; "ADJUST TO
           RECOMPUTE" stayed one too — a two-word stamp paired with a label
           in a header row reads as chrome, not as prose (the same call the
           learn newsletter card's "SHIPS SUNDAYS" takes). Both to the
           floor, both one tracking notch back for the fixed 320px column:
           at 10px the pair measures ~215px against 288px of inner width. */
        .calc__inputs-lab {
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.18em;
        }
        .calc__inputs-hint {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.12em;
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
            font-size: 10px;
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
            font-size: 10px;
            letter-spacing: 0.12em;
          }
          .calc__layout {
            margin-top: 14px;
            gap: 18px;
          }
          /* Captions hold one size across breakpoints — the phone override
             only existed to shrink a caps line that no longer shouts. */
          .calc__sentence {
            font-size: 12px;
            letter-spacing: 0.01em;
          }
          .calc__fig :global(.anum) {
            border-bottom-width: 3px;
            padding-bottom: 4px;
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
            font-size: 10px;
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
