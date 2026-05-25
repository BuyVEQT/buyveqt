import type { Region } from "@/lib/useRegions";
import type { HoldingMini } from "@/lib/sleeve-top-holdings";
import Sparkline from "@/components/charts/Sparkline";
import SleeveHoldings from "./SleeveHoldings";

interface SectorRow {
  name: string;
  /** Daily return for the sector in percent. */
  pct: number;
}

interface InsideRegionDetailProps {
  region: Region;
  sectors: SectorRow[];
  /** Top-3 holdings for this sleeve. */
  topHoldings: HoldingMini[];
}

/** Stripe color per sleeve — matches GEO_TONE in GeographyPanel. */
const REGION_STRIPE: Record<string, string> = {
  VUN: "var(--ink)",
  VCN: "var(--stamp)",
  VIU: "var(--amber)",
  VEE: "var(--rule)",
};

const REGION_DISPLAY_NAME: Record<string, string> = {
  VUN: "United States",
  VCN: "Canada",
  VIU: "Developed ex-NA",
  VEE: "Emerging Markets",
};

function fmtPct(n: number, digits = 2): string {
  if (!Number.isFinite(n)) return "—";
  const sign = n > 0 ? "+" : n < 0 ? "−" : "";
  return `${sign}${Math.abs(n).toFixed(digits)}%`;
}

function fmtPp(n: number): string {
  if (!Number.isFinite(n)) return "—";
  const sign = n >= 0 ? "+" : "−";
  return `${sign}${Math.abs(n).toFixed(2)} pp to fund`;
}

/**
 * V2 region dossier card.
 *
 * Stripe (4px) · ticker badge · italic name · big change% · contribution pp
 * · sparkline · top-3 holdings list · sector contribution bars · CTA row.
 *
 * Uses `display: flex; flex-direction: column` so the CTA can sit at the
 * bottom with `margin-top: auto`.
 */
export default function InsideRegionDetail({
  region,
  sectors,
  topHoldings,
}: InsideRegionDetailProps) {
  const pct = region.changePercent ?? 0;
  const contrib = region.contribution ?? 0;
  const up = pct >= 0;
  const tone = up ? "var(--green)" : "var(--stamp)";
  const stripe = REGION_STRIPE[region.ticker] ?? "var(--rule)";
  const displayName =
    REGION_DISPLAY_NAME[region.ticker] ?? region.fullName ?? region.label;

  return (
    <article id={region.ticker} className="ird">
      {/* Left-edge color stripe — 4px wide per v2 spec */}
      <div className="ird__stripe" style={{ background: stripe }} aria-hidden />

      <header className="ird__head">
        <div className="ird__head-left">
          <div className="ed-label" style={{ color: "var(--ink-mute)" }}>
            {region.ticker} · {region.weight.toFixed(1)}% of fund
          </div>
          <h3 className="ed-display-italic ird__name">{displayName}</h3>
        </div>
        <div className="ird__head-right">
          <div
            className="ed-display ed-numerals ird__pct"
            style={{ color: tone }}
          >
            {fmtPct(pct)}
          </div>
          <div className="ed-label ird__pp" style={{ color: "var(--ink-mute)" }}>
            {fmtPp(contrib)}
          </div>
        </div>
      </header>

      {/* Sparkline */}
      {region.history && region.history.length >= 2 && (
        <div className="ird__spark">
          <Sparkline
            data={region.history}
            width={520}
            height={40}
            stroke={tone}
            fill={`color-mix(in oklab, ${tone} 7%, transparent)`}
            strokeWidth={1.4}
            dot={false}
            style={{ width: "100%", height: 40 }}
            ariaLabel={`${region.ticker} 90-day price`}
          />
        </div>
      )}

      {/* Top-3 holdings list */}
      <SleeveHoldings holdings={topHoldings} ticker={region.ticker} />

      {/* Sector contribution bars */}
      <div className="ird-sectors">
        <div className="ird-sectors__head">
          <span className="ed-label">Sector contribution</span>
          <span className="ird-sectors__today">today only</span>
        </div>
        <ul className="ird-sectors__list">
          {sectors.slice(0, 4).map((s) => {
            const sUp = s.pct >= 0;
            // bar fills max 50% from midline; 1.0% absolute fills the whole half
            const w = Math.min(50, Math.abs(s.pct) * 50);
            return (
              <li key={s.name} className="ird-sectors__row">
                <span className="ird-sectors__name">{s.name}</span>
                <div className="ird-sectors__track" aria-hidden>
                  <span className="ird-sectors__axis" />
                  <span
                    className="ird-sectors__fill"
                    style={{
                      width: `${w}%`,
                      background: sUp ? "var(--green)" : "var(--stamp)",
                      ...(sUp ? { left: "50%" } : { right: "50%" }),
                    }}
                  />
                </div>
                <span
                  className="ed-numerals ird-sectors__pct"
                  style={{ color: sUp ? "var(--green)" : "var(--stamp)" }}
                >
                  {fmtPct(s.pct)}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      {/* CTA — sits at the bottom via margin-top: auto on the flex column */}
      <a href={`#${region.ticker}-all`} className="ird__cta">
        <span>
          See all <strong style={{ fontWeight: 700 }}>{region.ticker}</strong>{" "}
          holdings
        </span>
        <span style={{ color: "var(--stamp)" }} aria-hidden>
          →
        </span>
      </a>

      <style jsx>{`
        .ird {
          position: relative;
          background: var(--paper-light);
          border: 1px solid var(--rule-soft);
          border-radius: var(--radius, 18px);
          padding: 22px 24px 20px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          scroll-margin-top: 80px;
        }
        .ird__stripe {
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 4px;
        }
        .ird__head {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 14px;
          flex-wrap: wrap;
        }
        .ird__head-left {
          min-width: 0;
        }
        .ird__name {
          margin: 6px 0 0;
          font-size: clamp(1.6rem, 2.6vw, 2.2rem);
          line-height: 1.05;
          color: var(--ink);
        }
        .ird__head-right {
          text-align: right;
          flex-shrink: 0;
        }
        .ird__pct {
          font-size: clamp(1.8rem, 3vw, 2.4rem);
          line-height: 1;
          letter-spacing: -0.02em;
        }
        .ird__pp {
          margin-top: 6px;
        }
        .ird__spark {
          margin-top: 14px;
        }
        /* Sector bars */
        .ird-sectors {
          margin-top: 16px;
          padding-top: 14px;
          border-top: 1px solid var(--rule-soft);
        }
        .ird-sectors__head {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        .ird-sectors__today {
          font-family: var(--font-serif);
          font-style: italic;
          font-size: 11px;
          letter-spacing: 0;
          text-transform: none;
          color: var(--ink-mute);
        }
        .ird-sectors__list {
          list-style: none;
          margin: 0;
          padding: 0;
        }
        .ird-sectors__row {
          display: grid;
          grid-template-columns: 1fr 130px 56px;
          align-items: center;
          gap: 10px;
          padding: 4px 0;
          font-family: var(--font-sans);
          font-size: 12.5px;
          color: var(--ink-soft);
        }
        @media (max-width: 480px) {
          .ird-sectors__row {
            grid-template-columns: 1fr 80px 50px;
          }
        }
        .ird-sectors__name {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .ird-sectors__track {
          position: relative;
          height: 6px;
          background: color-mix(in oklab, var(--ink) 6%, transparent);
          border-radius: 3px;
          overflow: hidden;
        }
        .ird-sectors__axis {
          position: absolute;
          left: 50%;
          top: -3px;
          bottom: -3px;
          width: 1px;
          background: var(--ink);
          opacity: 0.45;
        }
        .ird-sectors__fill {
          position: absolute;
          top: 0;
          bottom: 0;
          border-radius: 2px;
          transition: width 0.4s ease;
        }
        .ird-sectors__pct {
          text-align: right;
          font-size: 12px;
          font-weight: 700;
        }
        /* CTA row */
        .ird__cta {
          margin-top: 18px;
          padding-top: 14px;
          border-top: 1px solid var(--rule-soft);
          font-family: var(--font-sans);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--ink);
          text-decoration: none;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .ird__cta:hover {
          color: var(--stamp);
        }
      `}</style>
    </article>
  );
}
