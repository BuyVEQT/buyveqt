import Card from "@/components/ui/Card";
import { VEQT_TOP_HOLDINGS, type Holding } from "@/data/holdings";

/** Sector label per ticker — used in the sector column. */
const SECTOR_BY_TICKER: Record<string, string> = {
  AAPL:    "Tech",
  MSFT:    "Tech",
  NVDA:    "Tech",
  AMZN:    "Cons. Disc.",
  GOOGL:   "Comm.",
  META:    "Comm.",
  AVGO:    "Tech",
  TSLA:    "Cons. Disc.",
  SHOP:    "Tech",
  "BRK.B": "Financials",
  JPM:     "Financials",
  RY:      "Banks",
  TD:      "Banks",
  ENB:     "Energy",
  BNS:     "Banks",
};

/**
 * Country tone per display value.
 * US → var(--band-ink) (always dark — see DATA-IDENTITY CONVENTION
 * in app/globals.css), Canada → var(--stamp) (vermilion).
 */
function countryTone(country: string): string {
  if (country === "US") return "var(--band-ink)";
  if (country === "Canada") return "var(--stamp)";
  return "var(--rule)";
}

function HoldingRow({
  holding,
  index,
}: {
  holding: Holding;
  index: number;
}) {
  const sector = SECTOR_BY_TICKER[holding.ticker] ?? "—";
  const stripedBg = index % 2 === 0 ? "var(--paper-warm)" : "transparent";
  const tone = countryTone(holding.country);
  const countryLabel = holding.country === "Canada" ? "CA" : holding.country;

  return (
    <li
      className="hold-row"
      style={{ background: stripedBg }}
    >
      {/* Bordered country chip — US in ink, CA in stamp */}
      <span
        className="hold-row__country"
        style={{ borderColor: tone, color: tone }}
      >
        {countryLabel}
      </span>
      <span className="hold-row__name">{holding.name}</span>
      <span className="hold-row__sector ed-numerals">{sector}</span>
      <span className="hold-row__weight ed-numerals">
        {holding.weight.toFixed(2)}%
      </span>

      <style jsx>{`
        .hold-row {
          display: grid;
          grid-template-columns: 36px 1fr 64px;
          gap: 10px;
          padding: 10px 14px;
          align-items: center;
          border-radius: 8px;
          font-family: var(--font-serif);
          font-size: 14px;
          color: var(--ink);
        }
        @media (min-width: 720px) {
          .hold-row {
            grid-template-columns: 36px 1fr 120px 70px;
          }
        }
        .hold-row__country {
          font-family: var(--font-sans);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.12em;
          padding: 2px 6px;
          border: 1px solid;
          border-radius: 4px;
          text-align: center;
          min-width: 28px;
          display: inline-block;
        }
        .hold-row__name {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .hold-row__sector {
          display: none;
          color: var(--ink-mute);
          font-size: 12px;
          font-family: var(--font-sans);
        }
        @media (min-width: 720px) {
          .hold-row__sector {
            display: inline;
          }
        }
        .hold-row__weight {
          text-align: right;
          font-family: var(--font-sans);
          font-size: 13px;
          font-weight: 700;
          color: var(--ink);
        }
      `}</style>
    </li>
  );
}

/**
 * V2 InsideHoldings — top-10 VEQT holdings with bordered country chips
 * (US=ink, CA=stamp) and sector column always visible at ≥720px.
 */
export default function InsideHoldings() {
  const rows = VEQT_TOP_HOLDINGS.slice(0, 10);

  return (
    <Card padding={0}>
      {/* V2 header: ed-stamp kicker + ed-display-italic title */}
      <div className="holdings">
        <div className="holdings__head">
          <div>
            <div className="ed-stamp">Top of the book</div>
            <h2 className="ed-display-italic holdings__h2">
              The ten biggest bets.
            </h2>
          </div>
          <p className="ed-caption holdings__deck">
            Of 13,726. The rest round to under one percent each.
          </p>
        </div>

        {/* Column labels — match hold-row grid at each breakpoint */}
        <div className="holdings__cols">
          <span className="ed-label">Co.</span>
          <span className="ed-label">Company</span>
          <span className="ed-label holdings__col-sector" style={{ textAlign: "left" }}>
            Sector
          </span>
          <span className="ed-label" style={{ textAlign: "right" }}>
            Weight
          </span>
        </div>

        <ul className="holdings__list">
          {rows.map((h, i) => (
            <HoldingRow key={h.ticker} holding={h} index={i} />
          ))}
        </ul>
      </div>

      <style jsx>{`
        .holdings {
          padding: 22px 22px 16px;
        }
        .holdings__head {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 16px;
          flex-wrap: wrap;
        }
        .holdings__h2 {
          font-size: clamp(1.4rem, 2.2vw, 1.7rem);
          line-height: 1.05;
          margin-top: 4px;
          color: var(--ink);
        }
        .holdings__deck {
          flex: 0 1 260px;
          max-width: 260px;
          font-size: 12px;
        }
        .holdings__cols {
          display: grid;
          grid-template-columns: 36px 1fr 64px;
          gap: 10px;
          padding: 12px 14px 6px;
          margin-top: 16px;
          border-top: 1px solid var(--ink);
        }
        @media (min-width: 720px) {
          .holdings__cols {
            grid-template-columns: 36px 1fr 120px 70px;
          }
        }
        .holdings__col-sector {
          display: none;
        }
        @media (min-width: 720px) {
          .holdings__col-sector {
            display: inline;
          }
        }
        .holdings__list {
          list-style: none;
          margin: 0;
          padding: 0;
        }
      `}</style>
    </Card>
  );
}
