import Card from "@/components/ui/Card";
import Pill from "@/components/ui/Pill";
import SectionHead from "@/components/ui/SectionHead";
import { VEQT_TOP_HOLDINGS, type Holding } from "@/data/holdings";

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

function HoldingRow({
  holding,
  index,
}: {
  holding: Holding;
  index: number;
}) {
  const sector = SECTOR_BY_TICKER[holding.ticker] ?? "—";
  const stripedBg =
    index % 2 === 0 ? "var(--paper-warm)" : "transparent";

  return (
    <div
      className="inside-holdings-row"
      style={{
        background: stripedBg,
        borderRadius: 10,
      }}
    >
      <div className="inside-holdings-row__company">
        <Pill tone="neutral" style={{ padding: "2px 8px", fontSize: 10 }}>
          {holding.country}
        </Pill>
        <span
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: 14,
            color: "var(--ink)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {holding.name}
        </span>
      </div>
      <div
        className="inside-holdings-row__sector ed-numerals"
        style={{
          textAlign: "right",
          color: "var(--ink-mute)",
          fontSize: 12,
          fontFamily: "var(--font-sans)",
        }}
      >
        {sector}
      </div>
      <div
        className="ed-numerals"
        style={{
          textAlign: "right",
          fontWeight: 600,
          color: "var(--ink)",
          fontSize: 13,
          fontFamily: "var(--font-sans)",
        }}
      >
        {holding.weight.toFixed(2)}%
      </div>

      <style jsx>{`
        :global(.inside-holdings-row) {
          display: grid;
          grid-template-columns: 1fr 64px;
          padding: 12px 14px;
          align-items: center;
          gap: 8px;
        }
        :global(.inside-holdings-row__company) {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
        }
        :global(.inside-holdings-row__sector) {
          display: none;
        }
        @media (min-width: 768px) {
          :global(.inside-holdings-row) {
            grid-template-columns: 1fr 100px 80px;
          }
          :global(.inside-holdings-row__sector) {
            display: block;
          }
        }
      `}</style>
    </div>
  );
}

export default function InsideHoldings() {
  const rows = VEQT_TOP_HOLDINGS.slice(0, 10);

  return (
    <Card padding={0}>
      <div
        style={{
          padding: "20px 18px 18px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <SectionHead
          kicker="Top of the book"
          title="The ten biggest bets."
          size="md"
        />
        <span
          style={{
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            fontSize: 13,
            color: "var(--ink-mute)",
          }}
        >
          Of 13,712. The rest round to under one percent each.
        </span>
      </div>

      <div
        className="inside-holdings__head"
        style={{
          padding: "0 14px 8px",
          color: "var(--ink-mute)",
        }}
      >
        <span>Company</span>
        <span className="inside-holdings__sector" style={{ textAlign: "right" }}>
          Sector
        </span>
        <span style={{ textAlign: "right" }}>Weight</span>
      </div>

      <div style={{ padding: "0 4px 14px" }}>
        {rows.map((h, i) => (
          <HoldingRow key={h.ticker} holding={h} index={i} />
        ))}
      </div>

      <style jsx>{`
        .inside-holdings__head {
          display: grid;
          grid-template-columns: 1fr 64px;
          gap: 8px;
          font-family: var(--font-sans);
          font-size: 9.5px;
          font-weight: 700;
          letter-spacing: 0.22em;
          text-transform: uppercase;
        }
        .inside-holdings__head .inside-holdings__sector {
          display: none;
        }
        @media (min-width: 768px) {
          .inside-holdings__head {
            grid-template-columns: 1fr 100px 80px;
          }
          .inside-holdings__head .inside-holdings__sector {
            display: block;
          }
        }
      `}</style>
    </Card>
  );
}
