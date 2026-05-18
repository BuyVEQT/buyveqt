import type { CSSProperties } from "react";

export interface TiltWeights {
  /** All four values should sum to ~1.0. Component does not normalize. */
  us: number;
  ca: number;
  dev: number;
  em: number;
}

interface TiltBarProps {
  weights: TiltWeights;
  /** Height in px. Default 12. */
  height?: number;
  /** Render the "US 43% · CA 31% · Dev 18% · EM 7%" summary line below. */
  showLabels?: boolean;
  className?: string;
  style?: CSSProperties;
  ariaLabel?: string;
}

interface Segment {
  key: keyof TiltWeights;
  label: string;
  pct: number;
  color: string;
}

/**
 * 100% stacked bar showing a fund's regional tilt. Round 4 colors:
 *   US → stamp (vermilion)
 *   Canada → ink
 *   Developed ex-NA → amber
 *   Emerging → rule (gold)
 */
export default function TiltBar({
  weights,
  height = 12,
  showLabels = false,
  className = "",
  style,
  ariaLabel,
}: TiltBarProps) {
  const segments: Segment[] = [
    { key: "us", label: "US", pct: weights.us, color: "var(--stamp)" },
    { key: "ca", label: "CA", pct: weights.ca, color: "var(--ink)" },
    { key: "dev", label: "Dev", pct: weights.dev, color: "var(--amber)" },
    { key: "em", label: "EM", pct: weights.em, color: "var(--rule)" },
  ];

  const fmtPct = (p: number) => `${Math.round(p * 100)}%`;
  const label =
    ariaLabel ??
    `Regional tilt: US ${fmtPct(weights.us)}, Canada ${fmtPct(weights.ca)}, Developed ${fmtPct(weights.dev)}, Emerging ${fmtPct(weights.em)}`;

  return (
    <div className={className} style={style}>
      <div
        role="img"
        aria-label={label}
        style={{
          display: "flex",
          width: "100%",
          height,
          overflow: "hidden",
          borderRadius: 3,
        }}
      >
        {segments.map((seg) => (
          <span
            key={seg.key}
            style={{
              width: `${seg.pct * 100}%`,
              height: "100%",
              background: seg.color,
              display: "block",
            }}
          />
        ))}
      </div>
      {showLabels && (
        <div
          className="ed-numerals"
          style={{
            display: "flex",
            gap: 10,
            marginTop: 8,
            fontFamily: "var(--font-sans)",
            fontSize: 11,
            color: "var(--ink-mute)",
            letterSpacing: "0.02em",
            flexWrap: "wrap",
          }}
        >
          {segments.map((seg, i) => (
            <span
              key={seg.key}
              style={{ display: "inline-flex", alignItems: "center", gap: 5 }}
            >
              <span
                aria-hidden
                style={{
                  display: "inline-block",
                  width: 8,
                  height: 8,
                  background: seg.color,
                  borderRadius: 1,
                }}
              />
              {seg.label} {fmtPct(seg.pct)}
              {i < segments.length - 1 && <span style={{ color: "var(--ink-faint)" }}> ·</span>}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
