"use client";

/**
 * ScenarioToggle — three large pill cards under the projection chart, one
 * per scenario, that swap the active scenario when clicked. Each card
 * shows the scenario's label, headline final value, and a short caption.
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
    <div className="scn-toggle">
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
            style={{ borderColor: active ? s.color : "var(--rule-soft)" }}
          >
            <div className="ed-stamp scn-toggle__head" style={{ color: s.color }}>
              {s.label}
            </div>
            <div className="scn-toggle__val">
              <AnimatedDollar value={final} size="medium" />
            </div>
            <div className="ed-caption scn-toggle__cap">{s.caption}</div>
          </button>
        );
      })}
      <style jsx>{`
        .scn-toggle {
          display: grid;
          grid-template-columns: 1fr;
          gap: 10px;
          margin-top: 20px;
        }
        @media (min-width: 720px) {
          .scn-toggle {
            grid-template-columns: repeat(3, 1fr);
            gap: 14px;
          }
        }
        .scn-toggle__opt {
          appearance: none;
          text-align: left;
          padding: 14px 16px;
          background: var(--paper);
          border: 1.5px solid var(--rule-soft);
          border-radius: 12px;
          cursor: pointer;
          transition: background 0.18s, border-color 0.18s, transform 0.18s;
          color: inherit;
          font: inherit;
        }
        .scn-toggle__opt:hover {
          background: var(--paper-light);
          transform: translateY(-1px);
        }
        .scn-toggle__opt.is-active {
          background: var(--paper-light);
          border-width: 2px;
        }
        .scn-toggle__val {
          margin: 6px 0 4px;
        }
        .scn-toggle__cap {
          font-size: 12px;
        }
      `}</style>
    </div>
  );
}
