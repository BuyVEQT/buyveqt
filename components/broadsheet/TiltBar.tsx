interface TiltBarProps {
  weights: { us: number; ca: number; dev: number; em: number };
  label?: string;
}

/**
 * 100% stacked bar showing a fund's regional tilt across four segments:
 * US (vermilion), Canada (ink), Intl Developed (ink-mute), Emerging (rule).
 *
 * Weights should sum to ~1.0; the component does not normalize. Width and
 * height come from the .bs-tilt-bar classes already in globals.css.
 */
export default function TiltBar({ weights, label }: TiltBarProps) {
  const segments: { key: string; pct: number; color: string }[] = [
    { key: "us", pct: weights.us, color: "var(--stamp)" },
    { key: "ca", pct: weights.ca, color: "var(--ink)" },
    { key: "dev", pct: weights.dev, color: "var(--ink-mute)" },
    { key: "em", pct: weights.em, color: "var(--rule)" },
  ];

  return (
    <div
      className="bs-tilt-bar"
      role="img"
      aria-label={
        label ??
        `Regional tilt: US ${(weights.us * 100).toFixed(0)}%, Canada ${(weights.ca * 100).toFixed(0)}%, Developed ${(weights.dev * 100).toFixed(0)}%, Emerging ${(weights.em * 100).toFixed(0)}%`
      }
    >
      {segments.map((seg) => (
        <span
          key={seg.key}
          className="bs-tilt-bar__seg"
          style={{ width: `${seg.pct * 100}%`, backgroundColor: seg.color }}
        />
      ))}
    </div>
  );
}
