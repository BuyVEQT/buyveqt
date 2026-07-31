"use client";

/**
 * ScenarioToggle — three ruled cells under the projection chart, one per
 * scenario, that swap the active scenario when clicked. Same grammar as
 * the calculator tab strip: 1px ink cells sharing rules, the active one
 * filled ink with a signal square in the corner.
 */
import { SCENARIOS, SCENARIO_KEYS, type ScenarioKey } from "@/lib/calc-data";
import AnimatedDollar from "./AnimatedDollar";

interface ScenarioToggleProps {
  value: ScenarioKey;
  paths: Record<ScenarioKey, { final: number; contributed: number }>;
  onChange: (k: ScenarioKey) => void;
}

export default function ScenarioToggle({ value, paths, onChange }: ScenarioToggleProps) {
  return (
    <div className="scn-toggle" role="group" aria-label="Return scenario">
      {SCENARIO_KEYS.map((key) => {
        const s = SCENARIOS[key];
        const active = key === value;
        const final = paths[key]?.final ?? 0;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            aria-pressed={active}
            className={`scn-toggle__opt${active ? " is-active" : ""}`}
          >
            <span className="scn-toggle__top">
              <span className="scn-toggle__head">{s.label}</span>
              {active && <span className="scn-toggle__sq" aria-hidden />}
            </span>
            <span className="scn-toggle__val">
              <AnimatedDollar value={final} size="medium" />
            </span>
            <span className="scn-toggle__cap">{s.caption}</span>
          </button>
        );
      })}
      <style jsx>{`
        .scn-toggle {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          margin-top: 20px;
          font-family: var(--ins-font);
        }
        .scn-toggle__opt {
          appearance: none;
          border-radius: 0;
          text-align: left;
          padding: 12px 14px 13px;
          background: transparent;
          border: 1px solid var(--ins-ink);
          cursor: pointer;
          transition: background 0.15s, color 0.15s;
          color: var(--ins-ink);
          font: inherit;
          display: flex;
          flex-direction: column;
          gap: 4px;
          min-width: 0;
        }
        .scn-toggle__opt + .scn-toggle__opt {
          border-left: 0;
        }
        .scn-toggle__opt:focus-visible {
          outline: 2px solid var(--ins-signal);
          outline-offset: -3px;
        }
        .scn-toggle__opt.is-active {
          background: var(--ins-ink);
          color: var(--ins-paper);
        }
        .scn-toggle__opt.is-active :global(.anum) {
          color: var(--ins-paper);
        }
        .scn-toggle__top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }
        .scn-toggle__head {
          font-size: 8.5px;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--ins-gray-600);
        }
        .scn-toggle__opt.is-active .scn-toggle__head {
          color: var(--ins-inv-mute);
        }
        .scn-toggle__sq {
          width: 7px;
          height: 7px;
          background: var(--ins-signal);
          flex: none;
        }
        .scn-toggle__cap {
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--ins-gray-600);
        }
        .scn-toggle__opt.is-active .scn-toggle__cap {
          color: var(--ins-inv-mute);
        }
        @media (max-width: 640px) {
          .scn-toggle {
            grid-template-columns: 1fr;
          }
          .scn-toggle__opt {
            min-height: 44px;
          }
          .scn-toggle__opt + .scn-toggle__opt {
            border-left: 1px solid var(--ins-ink);
            border-top: 0;
          }
        }
      `}</style>
    </div>
  );
}
