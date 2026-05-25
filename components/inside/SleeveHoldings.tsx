import type { HoldingMini } from "@/lib/sleeve-top-holdings";

interface SleeveHoldingsProps {
  holdings: HoldingMini[];
  /** The sleeve ticker, e.g. "VUN". Displayed in the header. */
  ticker: string;
}

/**
 * Top-3 holdings list for a sleeve dossier card.
 * Shows: company name | weight bar | weight %.
 * Bar caps at 8% so the category leader fills the track.
 * Used inside InsideRegionDetail.
 */
export default function SleeveHoldings({ holdings, ticker }: SleeveHoldingsProps) {
  if (holdings.length === 0) return null;

  return (
    <div className="ird-holdings">
      <div className="ed-label ird-holdings__head">
        <span>Top 3 holdings</span>
        <span style={{ color: "var(--ink-mute)" }}>of {ticker.toLowerCase()}</span>
      </div>
      <ul className="ird-holdings__list">
        {holdings.map((h) => {
          const fillPct = Math.min(100, (h.weight / 8) * 100);
          return (
            <li key={h.ticker} className="ird-holdings__row">
              <span className="ird-holdings__name">{h.name}</span>
              <span className="ird-holdings__bar" aria-hidden>
                <span
                  className="ird-holdings__fill"
                  style={{ width: `${fillPct}%` }}
                />
              </span>
              <span className="ird-holdings__weight ed-numerals">
                {h.weight.toFixed(1)}%
              </span>
            </li>
          );
        })}
      </ul>

      <style jsx>{`
        .ird-holdings {
          margin-top: 16px;
          padding-top: 14px;
          border-top: 1px solid var(--rule-soft);
        }
        .ird-holdings__head {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          gap: 12px;
        }
        .ird-holdings__list {
          list-style: none;
          margin: 0;
          padding: 0;
        }
        .ird-holdings__row {
          display: grid;
          grid-template-columns: 1fr 90px 48px;
          align-items: center;
          gap: 10px;
          padding: 4px 0;
          font-family: var(--font-serif);
          font-size: 13px;
          color: var(--ink);
        }
        @media (max-width: 480px) {
          .ird-holdings__row {
            grid-template-columns: 1fr 60px 44px;
          }
        }
        .ird-holdings__name {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .ird-holdings__bar {
          height: 4px;
          background: color-mix(in oklab, var(--ink) 6%, transparent);
          border-radius: 2px;
          overflow: hidden;
          position: relative;
          display: block;
        }
        .ird-holdings__fill {
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          background: var(--ink);
          opacity: 0.55;
          border-radius: 2px;
          transition: width 0.4s ease;
        }
        .ird-holdings__weight {
          text-align: right;
          font-family: var(--font-sans);
          font-size: 12px;
          font-weight: 600;
          color: var(--ink-soft);
        }
      `}</style>
    </div>
  );
}
