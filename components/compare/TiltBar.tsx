import { FUNDS } from "@/data/funds";

const REGION_COLOR: Record<string, string> = {
  "United States": "color-mix(in oklab, var(--ink) 70%, transparent)",
  Canada: "color-mix(in oklab, var(--ink) 45%, transparent)",
  "International Developed":
    "color-mix(in oklab, var(--ink) 25%, transparent)",
  "Emerging Markets": "color-mix(in oklab, var(--stamp) 60%, var(--paper))",
};

const REGION_SHORT: Record<string, string> = {
  "United States": "US",
  Canada: "CA",
  "International Developed": "Intl",
  "Emerging Markets": "EM",
};

interface TiltBarProps {
  ticker: string;
}

export default function TiltBar({ ticker }: TiltBarProps) {
  const fund = FUNDS[ticker];
  const allocation = fund?.geographyAllocation ?? [];
  if (allocation.length === 0) {
    return (
      <span style={{ color: "var(--ink-soft)" }} aria-label="No allocation data">
        &mdash;
      </span>
    );
  }
  const total = allocation.reduce((s, x) => s + x.weight, 0);
  return (
    <div
      className="bs-tilt-bar"
      role="img"
      aria-label={allocation
        .map((s) => `${REGION_SHORT[s.region] ?? s.region} ${s.weight}%`)
        .join(", ")}
    >
      {allocation.map((seg) => (
        <span
          key={seg.region}
          className="bs-tilt-bar__seg"
          style={{
            width: `${(seg.weight / total) * 100}%`,
            background: REGION_COLOR[seg.region] ?? "var(--ink-mute)",
          }}
          title={`${REGION_SHORT[seg.region] ?? seg.region} ${seg.weight}%`}
        />
      ))}
    </div>
  );
}
