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
 * closing prose (one or more <p> nodes from MDX). The inline custom-prop
 * overrides recolor inherited `.prose-custom p` text to paper-cream so the
 * MDX paragraphs read on the dark ink background.
 */
export function VerdictCard({
  pill = "The bottom line",
  headline = "That’s why we buy VEQT.",
  children,
}: VerdictCardProps) {
  const proseOverrides: CSSProperties = {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    ...({
      "--color-text-secondary": "rgba(246, 239, 220, 0.85)",
      "--color-text-primary": "#f6efdc",
      "--color-text-muted": "rgba(246, 239, 220, 0.55)",
      "--color-brand": "var(--stamp)",
      "--color-brand-dark": "var(--stamp)",
      color: "rgba(246, 239, 220, 0.85)",
    } as CSSProperties),
  };

  return (
    <div className="my-10">
      <Card dark padding={0}>
        <div style={{ padding: "32px 32px 28px" }}>
          <span
            style={{
              display: "inline-block",
              marginBottom: 16,
              padding: "4px 12px",
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
              fontSize: "clamp(1.75rem, 4vw, 2.625rem)",
              lineHeight: 1.05,
              color: "#f6efdc",
              letterSpacing: "-0.022em",
              maxWidth: "20ch",
              margin: 0,
            }}
          >
            {headline}
          </p>

          <div
            className="verdict-prose"
            style={{
              ...proseOverrides,
              marginTop: 18,
              fontFamily: "var(--font-serif)",
              fontSize: "1.0625rem",
              lineHeight: 1.65,
              maxWidth: "56ch",
            }}
          >
            {children}
          </div>
        </div>
      </Card>
    </div>
  );
}
