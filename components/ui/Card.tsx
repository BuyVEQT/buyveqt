import type { ReactNode, CSSProperties } from "react";

interface CardProps {
  /** Dark variant — pure ink bg with paper text. The dark band motif. */
  dark?: boolean;
  /** Paints a 3px vermilion left-stripe (used on the Compare "Gap" card). */
  accent?: boolean;
  /** Override padding (default 22px). Pass 0 for tile-divider patterns. */
  padding?: number | string;
  /** Override the corner radius (default 22). */
  radius?: number;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

export default function Card({
  dark = false,
  accent = false,
  padding = 22,
  radius = 22,
  className = "",
  style,
  children,
}: CardProps) {
  return (
    <div
      className={className}
      style={{
        // The dark band is a discipline color — must remain pure ink + paper
        // regardless of theme. Using var(--ink)/var(--paper) breaks because
        // those tokens swap in dark mode, turning the band cream.
        background: dark ? "#0f0d0a" : "var(--paper-light)",
        color: dark ? "#f6efdc" : "var(--ink)",
        border: dark ? "none" : "1px solid var(--rule-soft)",
        borderRadius: radius,
        padding,
        position: "relative",
        overflow: "hidden",
        ...style,
      }}
    >
      {accent && (
        <div
          aria-hidden
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: 3,
            background: "var(--stamp)",
          }}
        />
      )}
      {children}
    </div>
  );
}
