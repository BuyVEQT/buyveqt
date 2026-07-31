"use client";

import { VEQT_TOP_HOLDINGS, type Holding } from "@/data/holdings";
import { FUNDS } from "@/data/funds";

/** GICS bucket per ticker — rendered uppercase by CSS. */
const SECTOR_BY_TICKER: Record<string, string> = {
  AAPL: "Tech",
  MSFT: "Tech",
  NVDA: "Tech",
  AMZN: "Cons. Disc.",
  GOOGL: "Comm.",
  META: "Comm.",
  AVGO: "Tech",
  TSLA: "Cons. Disc.",
  SHOP: "Tech",
  "BRK.B": "Financials",
  JPM: "Financials",
  RY: "Banks",
  TD: "Banks",
  ENB: "Energy",
  BNS: "Banks",
};

const TOP_N = 10;
const ROWS = VEQT_TOP_HOLDINGS.slice(0, TOP_N);
const LEFT = ROWS.slice(0, 5);
const RIGHT = ROWS.slice(5, 10);
const TOP_N_WEIGHT = ROWS.reduce((sum, h) => sum + h.weight, 0);

function chipLabel(country: string): string {
  return country === "Canada" ? "CA" : country;
}

function BookRow({ holding, rank }: { holding: Holding; rank: number }) {
  const isCa = holding.country === "Canada";
  const sector = SECTOR_BY_TICKER[holding.ticker] ?? "—";
  const chip = chipLabel(holding.country);

  return (
    <div className="book__row">
      <span className="book__ord" aria-hidden="true">
        {String(rank).padStart(2, "0")}
      </span>
      <span className={`book__chip${isCa ? " is-ca" : ""}`}>{chip}</span>
      <div className="book__id">
        <div className="book__name">{holding.name}</div>
        <div className={`book__sector${isCa ? " is-ca" : ""}`}>
          <span className="book__sector-country">{chip} · </span>
          {sector}
        </div>
      </div>
      <span className="book__weight">{holding.weight.toFixed(2)}%</span>

      <style jsx>{`
        .book__row {
          display: grid;
          grid-template-columns: 34px 40px 1fr auto;
          gap: 14px;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid var(--ins-hair);
          font-variant-numeric: tabular-nums;
        }
        .book__ord {
          font-size: 15px;
          font-weight: 700;
          color: rgba(17, 17, 17, 0.3);
        }
        .book__chip {
          justify-self: start;
          border: 1px solid var(--ins-hair);
          padding: 2px 6px;
          font-size: 8.5px;
          font-weight: 700;
          letter-spacing: 0.1em;
          color: var(--ins-ink);
        }
        .book__chip.is-ca {
          border-color: var(--ins-signal);
          color: var(--ins-signal);
        }
        .book__id {
          min-width: 0;
        }
        .book__name {
          font-size: 15px;
          font-weight: 600;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .book__sector {
          margin-top: 2px;
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--ins-gray-600);
        }
        /* The chip carries the country on desktop; the micro-label repeats
           it only once the chip column is dropped on phones. */
        .book__sector-country {
          display: none;
        }
        .book__weight {
          font-size: 16px;
          font-weight: 700;
          text-align: right;
        }

        @media (max-width: 640px) {
          .book__row {
            grid-template-columns: 26px 1fr auto;
            gap: 12px;
            padding: 11px 0;
          }
          .book__ord {
            font-size: 13px;
          }
          .book__chip {
            display: none;
          }
          .book__name {
            font-size: 13px;
          }
          .book__sector {
            font-size: 8.5px;
            letter-spacing: 0.12em;
          }
          .book__sector.is-ca {
            color: var(--ins-signal);
          }
          .book__sector-country {
            display: inline;
          }
          .book__weight {
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  );
}

/**
 * "The ten biggest bets." — top of the book (artboard 6a).
 *
 * Two ruled columns of five on desktop (rank ordinal · country chip · name +
 * GICS micro-label · weight), collapsing to a single ten-row column on
 * phones with the country folded into the micro-label. Canadian names carry
 * the one red mark in the module.
 *
 * The footnote row totals the ten and names the sector taxonomy.
 */
export default function InsideHoldings() {
  const holdingCount = FUNDS["VEQT.TO"]?.numberOfHoldings;
  const universe =
    holdingCount != null ? holdingCount.toLocaleString("en-CA") : "the book";

  return (
    <section className="book" aria-label="The ten biggest bets">
      <div className="book__head">
        <div>
          <div className="book__kicker">Top of the book</div>
          <h2 className="book__display">The ten biggest bets.</h2>
        </div>
        <span className="book__caption">
          Of {universe} — the rest round to under 1% each
        </span>
      </div>

      <div className="book__cols">
        <div className="book__col">
          {LEFT.map((h, i) => (
            <BookRow key={h.ticker} holding={h} rank={i + 1} />
          ))}
        </div>
        <div className="book__col">
          {RIGHT.map((h, i) => (
            <BookRow key={h.ticker} holding={h} rank={i + 6} />
          ))}
        </div>
      </div>

      <div className="book__foot">
        <span>
          Top 10 together — {TOP_N_WEIGHT.toFixed(1)}% of the fund
        </span>
        <span>Sector tags follow GICS</span>
      </div>

      <style jsx>{`
        .book {
          font-family: var(--ins-font);
          color: var(--ins-ink);
          border-top: 3px solid var(--ins-rule-strong);
          padding-top: 16px;
        }

        .book__head {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: 24px;
        }
        .book__kicker {
          font-size: 9.5px;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--ins-signal);
        }
        .book__display {
          margin: 8px 0 0;
          font-size: 28px;
          font-weight: 700;
          letter-spacing: -0.02em;
          line-height: 1.1;
          color: var(--ins-ink);
        }
        .book__caption {
          font-size: 9.5px;
          font-weight: 600;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--ins-gray-600);
          text-align: right;
          font-variant-numeric: tabular-nums;
        }

        .book__cols {
          display: grid;
          grid-template-columns: 1fr 1fr;
          column-gap: 56px;
          margin-top: 16px;
          border-top: 1px solid var(--ins-ink);
        }
        .book__col {
          min-width: 0;
        }
        /* Each desktop column closes on its own — the footnote rule below
           does the closing for the block. */
        .book__col :global(.book__row:last-child) {
          border-bottom: none;
        }

        .book__foot {
          display: flex;
          justify-content: space-between;
          gap: 20px;
          border-top: 1px solid var(--ins-ink);
          padding-top: 10px;
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--ins-gray-600);
          font-variant-numeric: tabular-nums;
        }

        @media (max-width: 900px) {
          .book__cols {
            column-gap: 32px;
          }
        }

        @media (max-width: 640px) {
          .book {
            border-top-width: 2px;
            padding-top: 12px;
          }
          .book__head {
            display: block;
          }
          .book__kicker {
            font-size: 9px;
            letter-spacing: 0.18em;
          }
          .book__display {
            margin-top: 6px;
            font-size: 24px;
          }
          .book__caption {
            display: block;
            margin-top: 6px;
            text-align: left;
            font-size: 8.5px;
            letter-spacing: 0.12em;
          }
          .book__cols {
            grid-template-columns: 1fr;
            margin-top: 10px;
          }
          /* Stacked, the first column is mid-list again — only the very
             last row closes the ledger. */
          .book__col:first-child :global(.book__row:last-child) {
            border-bottom: 1px solid var(--ins-hair);
          }
          .book__col:last-child :global(.book__row:last-child) {
            border-bottom: 1px solid var(--ins-ink);
          }
          .book__foot {
            display: block;
            border-top: none;
            padding-top: 10px;
            font-size: 8.5px;
            letter-spacing: 0.12em;
          }
          .book__foot span {
            display: block;
          }
          .book__foot span + span {
            margin-top: 3px;
          }
        }
      `}</style>
    </section>
  );
}
