"use client";

import { FUNDS } from "@/data/funds";
import { fundColor } from "@/lib/styles";

const PRESETS = [
  { id: "veqt-xeqt", label: "VEQT × XEQT", funds: ["VEQT.TO", "XEQT.TO"], blurb: "The marquee fight" },
  { id: "veqt-cage", label: "VEQT × CAGE", funds: ["VEQT.TO", "CAGE.TO"], blurb: "Index vs evidence" },
  { id: "veqt-zeqt", label: "VEQT × ZEQT", funds: ["VEQT.TO", "ZEQT.TO"], blurb: "The challenger" },
  { id: "veqt-vfv",  label: "VEQT × VFV",  funds: ["VEQT.TO", "VFV.TO"],  blurb: "World vs U.S." },
  { id: "veqt-vgro", label: "VEQT × VGRO", funds: ["VEQT.TO", "VGRO.TO"], blurb: "With or without bonds" },
] as const;

// All-equity cohort first (VEQT · ZEQT · CAGE · XEQT), then the
// 80/20 balanced sleeve, then the single-market plays. CAGE sits between
// ZEQT and XEQT as the new factor-tilted entrant in the all-equity field.
const ALL_FUNDS_ORDER = [
  "VEQT.TO",
  "ZEQT.TO",
  "CAGE.TO",
  "XEQT.TO",
  "VGRO.TO",
  "VFV.TO",
  "VUN.TO",
] as const;

interface PresetCardProps {
  preset: (typeof PRESETS)[number];
  idx: number;
  isActive: boolean;
  onSelect: (funds: string[]) => void;
}

function PresetCard({ preset, idx, isActive, onSelect }: PresetCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect([...preset.funds])}
      aria-pressed={isActive}
      className={`preset${isActive ? " is-active" : ""}`}
    >
      <span className="ed-label preset__bout">
        Bout {String(idx + 1).padStart(2, "0")}
      </span>
      <span className="ed-display ed-numerals preset__label">{preset.label}</span>
      <span className="preset__blurb">{preset.blurb}</span>
    </button>
  );
}

interface FundChipProps {
  ticker: string;
  isActive: boolean;
  isPinned: boolean;
  onToggle: (ticker: string) => void;
}

function FundChip({ ticker, isActive, isPinned, onToggle }: FundChipProps) {
  const fund = FUNDS[ticker];
  if (!fund) return null;
  const color = fundColor(fund.shortName);
  return (
    <button
      type="button"
      onClick={() => { if (!isPinned) onToggle(ticker); }}
      disabled={isPinned}
      aria-pressed={isActive}
      className={`chip${isActive ? " is-active" : ""}${isPinned ? " is-pinned" : ""}`}
    >
      <span
        className="chip__dot"
        aria-hidden
        style={{ background: color }}
      />
      {fund.shortName}
      {isPinned && <span className="chip__pin" aria-hidden>📌</span>}
    </button>
  );
}

interface CompareSetupProps {
  selected: string[];
  onPreset: (funds: string[]) => void;
  onToggle: (ticker: string) => void;
}

export default function CompareSetup({
  selected,
  onPreset,
  onToggle,
}: CompareSetupProps) {
  const sortedKey = [...selected].sort().join("|");

  return (
    <section className="setup">
      <div className="setup__head">
        <div>
          <div className="ed-stamp">The fight card</div>
          <h1 className="ed-display-italic setup__h1">
            Pick a <em>matchup.</em>
          </h1>
        </div>
        <p className="ed-caption setup__deck">
          Five preset bouts — or roll your own. We pin{" "}
          <strong style={{ color: "var(--stamp)", fontWeight: 700, fontStyle: "normal" }}>
            VEQT
          </strong>{" "}
          in slot one so the deltas read as{" "}
          <em>VEQT minus other</em>. Useful if you, like us, already hold it.
        </p>
      </div>

      <div className="rule-thick" />

      <div className="setup__presets">
        {PRESETS.map((preset, idx) => {
          const presetKey = [...preset.funds].sort().join("|");
          return (
            <PresetCard
              key={preset.id}
              preset={preset}
              idx={idx}
              isActive={presetKey === sortedKey}
              onSelect={onPreset}
            />
          );
        })}
      </div>

      <div className="setup__picker">
        <div className="ed-label setup__picker-label">Or roll your own</div>
        <div className="setup__chips">
          {ALL_FUNDS_ORDER.map((ticker) => (
            <FundChip
              key={ticker}
              ticker={ticker}
              isActive={selected.includes(ticker)}
              isPinned={ticker === "VEQT.TO"}
              onToggle={onToggle}
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        .setup {
          padding: 26px 0 18px;
        }
        .setup__head {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 24px;
          margin-bottom: 16px;
          flex-wrap: wrap;
        }
        .setup__h1 {
          font-size: clamp(2.4rem, 5vw, 4rem);
          line-height: 1.08;
          letter-spacing: -0.03em;
          margin: 6px 0 0;
        }
        .setup__deck {
          flex: 0 1 380px;
          max-width: 380px;
          font-size: 13.5px;
          line-height: 1.5;
        }
        .setup__presets {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
          margin-top: 18px;
        }
        @media (min-width: 640px) {
          .setup__presets {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        @media (min-width: 980px) {
          .setup__presets {
            grid-template-columns: repeat(5, 1fr);
            gap: 14px;
          }
        }
        .setup__picker {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-top: 20px;
          padding-top: 18px;
          border-top: 1px solid var(--rule-soft);
          flex-wrap: wrap;
        }
        .setup__picker-label {
          flex-shrink: 0;
        }
        .setup__chips {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        /* Preset card */
        :global(.preset) {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 6px;
          padding: 14px 16px 13px;
          border-radius: 12px;
          background: var(--paper-light);
          border: 1px solid var(--rule-soft);
          cursor: pointer;
          width: 100%;
          text-align: left;
          appearance: none;
          color: var(--ink);
          transition: background 0.15s, border-color 0.15s, color 0.15s;
        }
        :global(.preset:hover) {
          background: var(--paper-warm);
        }
        :global(.preset.is-active) {
          background: var(--ink);
          color: var(--paper);
          border-color: var(--ink);
        }
        :global(.preset__bout) {
          opacity: 0.7;
        }
        :global(.preset.is-active .preset__bout) {
          color: rgba(246,239,220,0.55);
          opacity: 1;
        }
        :global(.preset__label) {
          font-size: clamp(17px, 1.8vw, 20px);
          line-height: 1;
          letter-spacing: -0.012em;
        }
        :global(.preset__blurb) {
          font-family: var(--font-serif);
          font-style: italic;
          font-size: 13px;
          color: var(--ink-mute);
          margin-top: 2px;
        }
        :global(.preset.is-active .preset__blurb) {
          color: rgba(246,239,220,0.75);
        }

        /* Fund chip */
        :global(.chip) {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 14px;
          border-radius: 999px;
          background: transparent;
          border: 1px solid var(--rule-soft);
          font-family: var(--font-sans);
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.02em;
          color: var(--ink-soft);
          cursor: pointer;
          appearance: none;
        }
        :global(.chip:hover:not(:disabled)) {
          background: var(--paper-warm);
        }
        :global(.chip.is-active) {
          background: var(--ink);
          color: var(--paper-light);
          border-color: var(--ink);
        }
        :global(.chip.is-pinned) {
          cursor: default;
          background: color-mix(in oklab, var(--stamp) 8%, var(--paper-light));
          border-color: var(--stamp);
          color: var(--stamp);
        }
        :global(.chip__dot) {
          width: 9px;
          height: 9px;
          border-radius: 2px;
          flex-shrink: 0;
        }
        :global(.chip__pin) {
          font-size: 10px;
        }
      `}</style>
    </section>
  );
}
