import type { Region } from "@/lib/useRegions";
import SectionLabel from "@/components/ui/SectionLabel";
import RegionCard from "./RegionCard";

interface RegionGridProps {
  regions: Region[];
  leaderIndex: number;
}

/**
 * Desktop 4-up grid of region cards. Same content as the mobile carousel,
 * but the four sleeves get equal real-estate side-by-side.
 */
export default function RegionGrid({ regions, leaderIndex }: RegionGridProps) {
  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 18,
          padding: "0 4px",
        }}
      >
        <div>
          <SectionLabel>Today&apos;s move came from</SectionLabel>
          <div
            className="ed-display"
            style={{ fontSize: 32, marginTop: 4, letterSpacing: "-0.015em" }}
          >
            Four sleeves, one fund.
          </div>
        </div>
        <div
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 12,
            color: "var(--ink-mute)",
          }}
        >
          Weighted average of four regional Vanguard ETFs
        </div>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 14,
        }}
      >
        {regions.length === 0
          ? [0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="skeleton"
                style={{ height: 240, borderRadius: 18 }}
              />
            ))
          : regions.map((r, i) => (
              <RegionCard key={r.ticker} region={r} leader={i === leaderIndex} />
            ))}
      </div>
    </div>
  );
}
