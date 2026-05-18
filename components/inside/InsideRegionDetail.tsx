import type { Region } from "@/lib/useRegions";
import Sparkline from "@/components/charts/Sparkline";

interface SectorRow {
  name: string;
  /** Daily return for the sector in percent. */
  pct: number;
}

interface InsideRegionDetailProps {
  region: Region;
  sectors: SectorRow[];
}

const REGION_STRIPE: Record<string, string> = {
  VUN: "var(--stamp)",
  VCN: "var(--ink)",
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
 * Big sleeve card with a left color stripe, ticker · weight eyebrow, italic
 * name, large color-coded change%, contribution pp, sleeve sparkline, then
 * the center-axis sector contribution bars (D1 borrowing — 50% midline,
 * fills left for negative and right for positive). Used by InsideRegionGrid.
 *
 * Always expanded — no accordion. The grid composes four of these for the
 * four sleeves.
 */
export default function InsideRegionDetail({
  region,
  sectors,
}: InsideRegionDetailProps) {
  const pct = region.changePercent ?? 0;
  const contrib = region.contribution ?? 0;
  const up = pct >= 0;
  const tone = up ? "var(--green)" : "var(--stamp)";
  const stripe = REGION_STRIPE[region.ticker] ?? "var(--rule)";
  const displayName =
    REGION_DISPLAY_NAME[region.ticker] ?? region.fullName ?? region.label;

  return (
    <article
      id={region.ticker}
      style={{
        background: "var(--paper-light)",
        border: "1px solid var(--rule-soft)",
        borderRadius: 18,
        padding: "22px 22px",
        position: "relative",
        overflow: "hidden",
        scrollMarginTop: 96,
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 3,
          background: stripe,
        }}
      />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          gap: 12,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div className="ed-label" style={{ color: "var(--ink-mute)" }}>
            {region.ticker} · {region.weight}% of fund
          </div>
          <div
            className="ed-display-italic"
            style={{
              fontSize: 26,
              lineHeight: 1.05,
              marginTop: 6,
              color: "var(--ink)",
            }}
          >
            {displayName}
          </div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div
            className="ed-numerals"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 500,
              fontSize: 36,
              lineHeight: 1,
              color: tone,
            }}
          >
            {fmtPct(pct)}
          </div>
          <div
            className="ed-label ed-numerals"
            style={{ marginTop: 6, color: "var(--ink-mute)" }}
          >
            {fmtPp(contrib)}
          </div>
        </div>
      </div>

      {/* Sparkline */}
      {region.history && region.history.length >= 2 && (
        <div style={{ marginTop: 14, width: "100%" }}>
          <Sparkline
            data={region.history}
            width={300}
            height={36}
            stroke="var(--ink)"
            fill="color-mix(in oklab, var(--ink) 5%, transparent)"
            strokeWidth={1.4}
            dot={false}
            style={{ width: "100%", height: 36 }}
            ariaLabel={`${region.ticker} 90-day price chart`}
          />
        </div>
      )}

      {/* Sectors */}
      <div
        style={{
          marginTop: 16,
          paddingTop: 14,
          borderTop: "1px solid var(--rule-soft)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 8,
            gap: 12,
          }}
        >
          <span className="ed-label" style={{ color: "var(--ink-mute)" }}>
            Sector contribution
          </span>
          <span
            style={{
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
              fontSize: 11,
              color: "var(--ink-mute)",
            }}
          >
            today only
          </span>
        </div>

        {sectors.slice(0, 4).map((s) => {
          const sUp = s.pct >= 0;
          const w = Math.min(50, Math.abs(s.pct) * 50);
          return (
            <div
              key={s.name}
              style={{
                display: "grid",
                gridTemplateColumns: "92px 1fr 62px",
                alignItems: "center",
                gap: 10,
                padding: "5px 0",
                fontSize: 12.5,
                fontFamily: "var(--font-sans)",
                color: "var(--ink-soft)",
              }}
            >
              <span
                style={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {s.name}
              </span>
              <div
                style={{
                  position: "relative",
                  height: 4,
                  background: "color-mix(in oklab, var(--ink) 8%, transparent)",
                  borderRadius: 2,
                  overflow: "hidden",
                }}
              >
                {/* center axis */}
                <div
                  aria-hidden
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: -2,
                    bottom: -2,
                    width: 1,
                    background: "var(--ink)",
                    opacity: 0.5,
                  }}
                />
                {/* fill — right of midline when positive, left when negative */}
                <div
                  aria-hidden
                  style={{
                    position: "absolute",
                    top: 0,
                    bottom: 0,
                    width: `${w}%`,
                    background: sUp ? "var(--green)" : "var(--stamp)",
                    ...(sUp ? { left: "50%" } : { right: "50%" }),
                  }}
                />
              </div>
              <span
                className="ed-numerals"
                style={{
                  textAlign: "right",
                  fontSize: 11.5,
                  fontWeight: 600,
                  color: sUp ? "var(--green)" : "var(--stamp)",
                }}
              >
                {fmtPct(s.pct, 2)}
              </span>
            </div>
          );
        })}
      </div>
    </article>
  );
}
