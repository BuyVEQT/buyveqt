import Link from "next/link";
import type { Region } from "@/lib/useRegions";
import Sparkline from "@/components/charts/Sparkline";

interface RegionCardProps {
  region: Region;
  /** True when this card is in the leader contribution position. */
  leader?: boolean;
  /** Width override for carousel cards. */
  width?: number | string;
}

const REGION_DISPLAY_NAME: Record<string, string> = {
  VUN: "United States",
  VCN: "Canada",
  VIU: "Developed ex-NA",
  VEE: "Emerging Markets",
};

const REGION_STRIPE: Record<string, string> = {
  VUN: "var(--stamp)",
  VCN: "var(--ink)",
  VIU: "var(--amber)",
  VEE: "var(--rule)",
};

/**
 * Card for a single regional sleeve. Top: ticker · weight, italic name,
 * leader badge if applicable. Middle: big change% (Fraunces, color-coded)
 * plus contribution pp. Bottom: 30-day sparkline. No external state.
 */
export default function RegionCard({ region, leader = false, width }: RegionCardProps) {
  const pct = region.changePercent;
  const contrib = region.contribution;
  const up = (pct ?? 0) >= 0;
  const tone = up ? "var(--green)" : "var(--stamp)";
  const pctStr =
    pct !== null && Number.isFinite(pct)
      ? `${up ? "+" : "−"}${Math.abs(pct).toFixed(2)}%`
      : "—";
  const contribStr =
    contrib !== null && Number.isFinite(contrib)
      ? `${contrib >= 0 ? "+" : "−"}${Math.abs(contrib).toFixed(2)} pp`
      : "—";
  const displayName = REGION_DISPLAY_NAME[region.ticker] ?? region.region;
  const stripe = REGION_STRIPE[region.ticker] ?? "var(--rule)";

  return (
    <Link
      href={`/inside-veqt#${region.ticker}`}
      aria-label={`${displayName} sleeve detail on Inside VEQT`}
      className="home-region-card"
      style={{
        width,
        textDecoration: "none",
        color: "inherit",
        display: "block",
      }}
    >
    <article
      style={{
        background: "var(--paper-light)",
        border: "1px solid var(--rule-soft)",
        borderRadius: 18,
        padding: "20px 20px 18px",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        gap: 6,
        transition: "transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease",
        cursor: "pointer",
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
      {leader && (
        <div
          style={{
            position: "absolute",
            top: 14,
            right: 14,
            fontFamily: "var(--font-sans)",
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "var(--stamp)",
            padding: "3px 7px",
            border: "1px solid var(--stamp)",
            borderRadius: 3,
          }}
        >
          Leader
        </div>
      )}
      <div className="ed-label">
        {region.ticker} · {region.weight}%
      </div>
      <div
        className="ed-display-italic"
        style={{ fontSize: 22, lineHeight: 1.05, color: "var(--ink)" }}
      >
        {displayName}
      </div>
      <div
        className="ed-display ed-numerals"
        style={{
          fontSize: 38,
          lineHeight: 1,
          letterSpacing: "-0.025em",
          color: tone,
          marginTop: 12,
        }}
      >
        {pctStr}
      </div>
      <div
        className="ed-numerals"
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: 11,
          color: "var(--ink-mute)",
          marginTop: 4,
        }}
      >
        Contrib to fund:{" "}
        <span style={{ color: tone, fontWeight: 600 }}>{contribStr}</span>
      </div>
      {region.history && region.history.length >= 2 && (
        <div style={{ marginTop: 14, width: "100%" }}>
          <Sparkline
            data={region.history}
            width={200}
            height={36}
            stroke={tone}
            fill={`color-mix(in oklab, ${tone} 12%, transparent)`}
            strokeWidth={1.4}
            style={{ width: "100%", height: 36 }}
            ariaLabel={`${region.ticker} 30-day price`}
          />
        </div>
      )}
    </article>
    </Link>
  );
}
