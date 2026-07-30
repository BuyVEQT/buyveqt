"use client";

/**
 * FiftyTwoTrack — the 52-week range track that sits inside the hero facts
 * column's "52-WEEK RANGE" row (The Instrument).
 *
 * Anatomy (from the handoff, artboard 3a desktop):
 *   - 4px bar, full width, `var(--ins-track)` (rgba(17,17,17,0.14))
 *   - marker: 10px ink dot, 2px paper border + 1px ink ring (box-shadow),
 *     centered at (price − low) / (high − low)
 *   - labels "LOW · {month}" / "NOW" — 8.5px w600 0.16em gray
 *
 * Border radius 0 on the bar (Instrument rule: radius only on the today
 * chip and round dots); the dot itself is 999px per the dots exception.
 */

interface FiftyTwoTrackProps {
  price: number;
  low: number;
  high: number;
  /** "OCT" — month of the trailing-year low close; null drops the suffix. */
  lowMonth: string | null;
}

export default function FiftyTwoTrack({
  price,
  low,
  high,
  lowMonth,
}: FiftyTwoTrackProps) {
  const range = high - low;
  const pct =
    range > 0 ? Math.max(0, Math.min(100, ((price - low) / range) * 100)) : 50;

  return (
    <div
      className="track"
      role="img"
      aria-label={`52-week range ${low.toFixed(2)} to ${high.toFixed(
        2
      )}, now at ${price.toFixed(2)}`}
    >
      <div className="track__bar">
        <span className="track__marker" style={{ left: `${pct}%` }} />
      </div>
      <div className="track__ends" aria-hidden="true">
        <span>{lowMonth ? `LOW · ${lowMonth}` : "LOW"}</span>
        <span>NOW</span>
      </div>

      <style jsx>{`
        .track__bar {
          position: relative;
          height: 4px;
          background: var(--ins-track);
          margin-top: 12px;
        }
        .track__marker {
          position: absolute;
          top: 50%;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: var(--ins-ink);
          border: 2px solid var(--ins-paper);
          box-shadow: 0 0 0 1px var(--ins-ink);
          transform: translate(-50%, -50%);
        }
        .track__ends {
          display: flex;
          justify-content: space-between;
          font-size: 8.5px;
          font-weight: 600;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--ins-gray-600);
          margin-top: 8px;
          font-variant-numeric: tabular-nums;
        }
      `}</style>
    </div>
  );
}
