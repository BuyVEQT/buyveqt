"use client";

interface Preset {
  id: string;
  label: string;
  funds: string[];
  blurb: string;
}

const PRESETS: Preset[] = [
  {
    id: "veqt-xeqt",
    label: "VEQT × XEQT",
    funds: ["VEQT.TO", "XEQT.TO"],
    blurb: "The marquee fight",
  },
  {
    id: "veqt-zeqt",
    label: "VEQT × ZEQT",
    funds: ["VEQT.TO", "ZEQT.TO"],
    blurb: "The challenger",
  },
  {
    id: "veqt-vfv",
    label: "VEQT × VFV",
    funds: ["VEQT.TO", "VFV.TO"],
    blurb: "World vs U.S.",
  },
  {
    id: "veqt-vgro",
    label: "VEQT × VGRO",
    funds: ["VEQT.TO", "VGRO.TO"],
    blurb: "With or without bonds",
  },
  {
    id: "veqt-xgro",
    label: "VEQT × XGRO",
    funds: ["VEQT.TO", "XGRO.TO"],
    blurb: "Equity vs 80/20",
  },
];

interface MatchupPresetsProps {
  selected: string[];
  onSelect: (funds: string[]) => void;
}

/**
 * Curated head-to-head shortcuts. Each preset reads like a fight card —
 * a labeled bout with a one-line caption. Selecting one swaps the entire
 * picker state in a single click. We mark the active card so users
 * recognise when their custom selection matches a known matchup.
 */
export default function MatchupPresets({
  selected,
  onSelect,
}: MatchupPresetsProps) {
  // A preset is active when its funds match the current selection exactly
  // (regardless of order).
  const sel = [...selected].sort().join("|");

  return (
    <section aria-labelledby="matchups-heading">
      <header className="flex items-baseline justify-between gap-3 mb-3">
        <p id="matchups-heading" className="bs-stamp">
          Marquee Matchups
        </p>
        <p
          className="bs-caption italic text-[11.5px]"
          style={{ color: "var(--ink-soft)" }}
        >
          Tap a card to load the fight
        </p>
      </header>

      <ul
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3"
        role="list"
      >
        {PRESETS.map((preset, idx) => {
          const presetKey = [...preset.funds].sort().join("|");
          const active = presetKey === sel;
          const dispatchNumber = String(idx + 1).padStart(2, "0");

          return (
            <li key={preset.id}>
              <button
                onClick={() => onSelect(preset.funds)}
                aria-pressed={active}
                className="group w-full text-left transition-colors"
                style={{
                  backgroundColor: active
                    ? "var(--ink)"
                    : "transparent",
                  color: active ? "var(--paper)" : "var(--ink)",
                  borderTop: active
                    ? "2px solid var(--stamp)"
                    : "2px solid var(--ink)",
                  padding: "10px 12px 12px",
                }}
              >
                <span
                  className="bs-numerals not-italic block text-[10.5px] mb-1"
                  style={{
                    color: active ? "var(--stamp)" : "var(--ink-soft)",
                    letterSpacing: "0.14em",
                  }}
                >
                  №{dispatchNumber}
                </span>
                <span
                  className="bs-display block text-[15px] sm:text-base leading-tight"
                  style={{ color: active ? "var(--paper)" : "var(--ink)" }}
                >
                  {preset.label}
                </span>
                <span
                  className="bs-caption italic block mt-0.5 text-[11.5px] leading-snug"
                  style={{
                    color: active
                      ? "color-mix(in oklab, var(--paper) 75%, transparent)"
                      : "var(--ink-soft)",
                  }}
                >
                  {preset.blurb}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
