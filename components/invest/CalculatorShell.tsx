import type { ReactNode } from "react";

interface CalculatorShellProps {
  /** Pill icon glyph (e.g. ∫, ∥, ↻, ☂, Ω). */
  icon: string;
  /** Small-caps tab label (e.g. "Lookback"). */
  label: string;
  /** Fraunces full name (e.g. "The Lookback"). */
  name: string;
  /** Subhead surfaced under the heading. */
  sub: string;
  children: ReactNode;
}

/**
 * Calculator shell. Round 4 polish split this into two surfaces:
 *   - A dark editorial header strip (icon tile + label + name + sub)
 *     that preserves the "one dark band per page" motif.
 *   - A cream `<Card>`-style body that hosts the active calculator
 *     unchanged. Keeping the calc body on a light surface lets the
 *     existing calculator chrome (inputs, charts, result tiles)
 *     render legibly without per-component restyling.
 *
 * The two surfaces are visually fused — radius 22 at the corners,
 * the header sits flush on top of the body. Reads as a single card
 * with an editorial header.
 */
export default function CalculatorShell({
  icon,
  label,
  name,
  sub,
  children,
}: CalculatorShellProps) {
  return (
    <section
      aria-label={`${name} calculator`}
      className="calc-shell"
      style={{
        borderRadius: 22,
        overflow: "hidden",
        border: "1px solid var(--rule-soft)",
        background: "var(--paper-light)",
      }}
    >
      {/* Dark editorial header strip */}
      <header
        style={{
          background: "#0f0d0a",
          color: "#f6efdc",
          padding: "22px 24px 20px",
          display: "flex",
          alignItems: "flex-start",
          gap: 14,
        }}
      >
        <div
          aria-hidden
          style={{
            width: 42,
            height: 42,
            borderRadius: 12,
            background: "rgba(246,239,220,0.10)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--font-display)",
            fontWeight: 500,
            fontSize: 22,
            color: "#f6efdc",
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            className="ed-label"
            style={{ color: "rgba(246,239,220,0.55)" }}
          >
            {label}
          </div>
          <div
            className="ed-display-italic"
            style={{
              fontSize: "clamp(1.5rem, 3vw, 2rem)",
              lineHeight: 1.1,
              color: "#f6efdc",
              marginTop: 4,
            }}
          >
            {name}
          </div>
          <p
            style={{
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
              fontSize: 14,
              lineHeight: 1.5,
              color: "rgba(246,239,220,0.7)",
              margin: "8px 0 0",
              maxWidth: "60ch",
            }}
          >
            {sub}
          </p>
        </div>
      </header>

      {/* Cream body — hosts the existing calculator as-is */}
      <div
        className="calc-shell__body"
        style={{ padding: "24px 24px 28px" }}
      >
        {children}
      </div>
    </section>
  );
}
