"use client";

import type { CSSProperties, ReactNode } from "react";
import Card from "@/components/ui/Card";

interface VerdictCardProps {
  pill?: string;
  headline?: string;
  children?: ReactNode;
}

/**
 * Dark verdict block for the flagship article. Children render as the
 * closing prose (one or more MDX paragraphs). The inline custom-prop
 * overrides recolor the inherited `.learn-article p` color to paper-cream
 * so the MDX paragraphs read against the dark ink background.
 */
export function VerdictCard({
  pill = "The bottom line",
  headline = "That’s why we buy VEQT.",
  children,
}: VerdictCardProps) {
  const proseOverrides: CSSProperties = {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    ...({
      "--ink": "#f6efdc",
      "--ink-soft": "rgba(246, 239, 220, 0.86)",
      "--ink-mute": "rgba(246, 239, 220, 0.6)",
      "--color-text-secondary": "rgba(246, 239, 220, 0.86)",
      "--color-text-primary": "#f6efdc",
      "--color-text-muted": "rgba(246, 239, 220, 0.6)",
      "--color-brand": "var(--stamp)",
      "--color-brand-dark": "var(--stamp)",
      color: "rgba(246, 239, 220, 0.86)",
    } as CSSProperties),
  };

  return (
    <div className="flagship-bleed">
      <Card dark padding={0}>
        <div style={{ padding: "clamp(20px, 4vw, 44px) clamp(18px, 4vw, 44px)" }}>
          <span
            style={{
              display: "inline-block",
              marginBottom: 14,
              padding: "5px 12px",
              background: "var(--stamp)",
              fontFamily: "var(--font-sans)",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#f6efdc",
              borderRadius: 3,
            }}
          >
            {pill}
          </span>
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 500,
              fontStyle: "italic",
              fontSize: "clamp(1.625rem, 5vw, 3rem)",
              lineHeight: 1.05,
              color: "#f6efdc",
              letterSpacing: "-0.022em",
              maxWidth: "18ch",
              margin: 0,
            }}
          >
            {headline}
          </p>

          <div
            className="verdict-prose"
            style={{
              ...proseOverrides,
              marginTop: 16,
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(0.9375rem, 1.6vw, 1.1875rem)",
              lineHeight: 1.6,
              maxWidth: "62ch",
            }}
          >
            {children}
          </div>
        </div>
      </Card>
    </div>
  );
}
