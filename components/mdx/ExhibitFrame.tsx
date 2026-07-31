import type { ReactNode } from "react";

/**
 * Shared exhibit chrome. Every exhibit on the flagship opens the same way —
 * 3px ink rule, red "EXHIBIT X — NAME" kicker, display headline, the
 * diagram, then a grey micro-caption — so the four read as one series.
 *
 * Exported so each exhibit imports the CSS once; it's emitted by
 * <ExhibitFrame> itself, and duplicate identical <style> tags are harmless.
 */
export const exhibitCss = `
.exh {
  margin: 34px 0 30px;
  border-top: 3px solid var(--ins-rule-strong);
  padding-top: 14px;
  font-family: var(--ins-font);
  color: var(--ins-ink);
  scroll-margin-top: 88px;
}
.exh__kicker {
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--ins-signal);
}
.exh__headline {
  margin: 8px 0 0;
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.1;
  color: var(--ins-ink);
}
.exh__body {
  margin-top: 16px;
}
.exh__caption {
  margin: 10px 0 0;
  font-size: 8.5px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  line-height: 1.7;
  color: var(--ins-gray-600);
  max-width: 90ch;
}
.exh--tight .exh__headline {
  font-size: 24px;
}

/* Shared diagram atoms. */
.exh__panelCap {
  margin: 0;
  font-size: 8.5px;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  line-height: 1.6;
  color: var(--ins-gray-600);
  text-align: center;
}
.exh__verdict {
  border: 1px solid var(--ins-ink);
  border-top: none;
  padding: 11px 18px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.exh__verdictSq {
  width: 9px;
  height: 9px;
  background: var(--ins-ink);
  flex: none;
}
.exh__verdictCopy {
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  line-height: 1.4;
}

@media (max-width: 640px) {
  .exh {
    margin: 22px 0 20px;
    padding-top: 12px;
  }
  .exh__kicker {
    font-size: 9px;
    letter-spacing: 0.18em;
  }
  .exh__headline,
  .exh--tight .exh__headline {
    font-size: 19px;
    letter-spacing: -0.015em;
  }
  .exh__body {
    margin-top: 12px;
  }
  .exh__caption {
    font-size: 8px;
    letter-spacing: 0.1em;
  }
  .exh__verdict {
    padding: 10px 14px;
    align-items: flex-start;
  }
  .exh__verdictSq {
    margin-top: 3px;
  }
  .exh__verdictCopy {
    font-size: 9px;
    letter-spacing: 0.12em;
  }
}
`;

interface ExhibitFrameProps {
  /** "A" … "D". */
  letter: string;
  /** Exhibit name for the red kicker — sentence case, uppercased by CSS. */
  name: string;
  /** Display headline. */
  headline: string;
  /** Grey micro-caption under the diagram — uppercased by CSS. */
  caption: string;
  /** Smaller headline for the two half-width exhibits. */
  tight?: boolean;
  children: ReactNode;
}

export default function ExhibitFrame({
  letter,
  name,
  headline,
  caption,
  tight = false,
  children,
}: ExhibitFrameProps) {
  return (
    <figure className={`exh${tight ? " exh--tight" : ""}`}>
      <div className="exh__kicker">
        Exhibit {letter} — {name}
      </div>
      <h3 className="exh__headline">{headline}</h3>
      <div className="exh__body">{children}</div>
      <figcaption className="exh__caption">{caption}</figcaption>
      <style dangerouslySetInnerHTML={{ __html: exhibitCss }} />
    </figure>
  );
}
