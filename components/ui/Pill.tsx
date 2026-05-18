import type { ReactNode, CSSProperties } from "react";

export type PillTone = "neutral" | "up" | "down" | "accent";

interface PillProps {
  tone?: PillTone;
  /** Filled = solid color (only meaningful for "accent" tone). */
  filled?: boolean;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

interface PaletteEntry {
  fg: string;
  bg: string;
}

function palette(tone: PillTone, filled: boolean): PaletteEntry {
  switch (tone) {
    case "up":
      return { fg: "var(--green)", bg: "var(--green-soft)" };
    case "down":
      return { fg: "var(--stamp)", bg: "var(--stamp-soft)" };
    case "accent":
      return filled
        ? { fg: "var(--paper-light)", bg: "var(--stamp)" }
        : { fg: "var(--stamp)", bg: "var(--stamp-soft)" };
    case "neutral":
    default:
      return { fg: "var(--ink-soft)", bg: "var(--paper-warm)" };
  }
}

export default function Pill({
  tone = "neutral",
  filled = false,
  className = "",
  style,
  children,
}: PillProps) {
  const p = palette(tone, filled);
  return (
    <span
      className={`ed-numerals ${className}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "3px 10px",
        borderRadius: 999,
        background: p.bg,
        color: p.fg,
        fontFamily: "var(--font-sans)",
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.04em",
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {children}
    </span>
  );
}
