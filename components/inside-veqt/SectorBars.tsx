import { VEQT_SECTOR_ALLOCATION } from "@/data/holdings";

/**
 * Editorial sector breakdown — horizontal bars rendered in CSS, no JS,
 * no recharts. Reads as a print infographic on the broadsheet paper:
 * a left rail of sector names, a right rail of numerals, an ink bar
 * sweeping between them. Sorted by weight, descending.
 */
export default function SectorBars() {
  const sorted = [...VEQT_SECTOR_ALLOCATION].sort((a, b) => b.weight - a.weight);
  const max = Math.max(...sorted.map((s) => s.weight));

  return (
    <div className="space-y-2.5">
      {sorted.map((s) => {
        const pct = (s.weight / max) * 100;
        return (
          <div
            key={s.sector}
            className="grid grid-cols-[7.5rem_1fr_2.5rem] sm:grid-cols-[10rem_1fr_3rem] items-center gap-3 sm:gap-4"
          >
            <p
              className="bs-caption not-italic text-[0.8125rem] sm:text-[0.875rem] truncate"
              style={{ color: "var(--ink)" }}
            >
              {s.sector}
            </p>
            <div
              className="relative h-[14px] sm:h-[16px] overflow-hidden"
              style={{
                backgroundColor: "color-mix(in oklab, var(--ink) 6%, transparent)",
              }}
            >
              <div
                className="absolute left-0 top-0 bottom-0"
                style={{
                  width: `${pct}%`,
                  backgroundColor: "var(--ink)",
                }}
              />
              {/* Hatching overlay for an engraved feel */}
              <div
                aria-hidden
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(90deg, color-mix(in oklab, var(--paper) 30%, transparent) 0 1px, transparent 1px 6px)",
                  width: `${pct}%`,
                }}
              />
            </div>
            <p
              className="bs-numerals text-right text-[0.875rem] sm:text-[0.9375rem]"
              style={{ color: "var(--ink)" }}
            >
              {s.weight}%
            </p>
          </div>
        );
      })}
    </div>
  );
}
