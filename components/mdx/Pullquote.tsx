import type { ReactNode } from "react";

interface PullquoteProps {
  children: ReactNode;
  attribution?: string;
  /** Legacy prop (Round 3 broadsheet). Ignored — the Instrument pull-quote
   *  is always a full-width block on an ink left rule. Kept so existing MDX
   *  <Pullquote align="…"> calls don't error. */
  align?: "center" | "left" | "right";
}

/**
 * Instrument pull-quote: a 3px ink left rule, Archivo at w600, nothing else.
 *
 * No italic (Archivo ships upright only — the Instrument's emphasis grammar
 * is weight and red, never slant) and no oversized red quotation mark: the
 * red budget on the issue reader belongs to the section kickers and the one
 * closing CTA. Inline styles rather than a class because this renders inside
 * MDX, where the host page's prefixed rules deliberately only reach direct
 * children.
 */
export function Pullquote({ children, attribution }: PullquoteProps) {
  return (
    <figure
      style={{
        margin: "30px 0",
        padding: "2px 0 2px 20px",
        borderLeft: "3px solid var(--ins-ink)",
      }}
    >
      <blockquote
        style={{
          fontFamily: "var(--ins-font)",
          fontWeight: 600,
          fontSize: "clamp(19px, 2.2vw, 25px)",
          lineHeight: 1.3,
          letterSpacing: "-0.02em",
          color: "var(--ins-ink)",
          maxWidth: "46ch",
          margin: 0,
          textWrap: "pretty",
        }}
      >
        {children}
      </blockquote>
      {attribution && (
        <figcaption
          style={{
            marginTop: 12,
            fontFamily: "var(--ins-font)",
            fontSize: 9.5,
            fontWeight: 700,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--ins-gray-600)",
          }}
        >
          {attribution}
        </figcaption>
      )}
    </figure>
  );
}

/** PascalCase alias, in case MDX authors use <PullQuote>. */
export const PullQuote = Pullquote;
