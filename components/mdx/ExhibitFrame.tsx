import type { ReactNode } from "react";

/**
 * Shared exhibit chrome. Every exhibit on the flagship opens the same way —
 * 3px ink rule, red "EXHIBIT X — NAME" kicker, display headline, the
 * diagram, then a grey caption — so the four read as one series.
 *
 * Turn 8 splits the chrome in two: the kicker is a LABEL (caps, tracked,
 * at the 10px floor) and the caption is a SENTENCE (12px, sentence case,
 * no transform). Every exhibit that draws its own sub-labels below should
 * follow the same split rather than inventing a third size.
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
/* TRUE LABEL — "EXHIBIT A — THE OWNERSHIP LOOP" names the figure, no verb.
   Stays caps + tracking, now at the 10px microtype floor. It runs the full
   body column and can wrap, so the tracking is not dialled back. */
.exh__kicker {
  font-size: 10px;
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
/* CAPTION — the caption prop is a full explaining sentence on every
   exhibit ("On a $100,000 position both funds take about $200 a year…"),
   so Turn 8 takes it out of 8.5px caps and into the house caption: 12px,
   w500, near-zero tracking, sentence case. The transform is GONE rather
   than reduced — the strings are already authored in sentence case at the
   call sites, and a transform here would print "S&P" fine but flatten the
   sentence into shouting. Ditto the 1.7 leading, which existed only to
   open up a caps microline; 1.45 is the house caption leading. */
.exh__caption {
  margin: 10px 0 0;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.01em;
  line-height: 1.45;
  color: var(--ins-gray-600);
  max-width: 90ch;
}
.exh--tight .exh__headline {
  font-size: 24px;
}

/* Shared diagram atoms. */
/* CAPTION — the per-panel note under a diagram ("The manager is, in
   effect, you") explains rather than names, so it takes caption grammar
   too. Centring stays: it is tied to the panel it sits under. */
.exh__panelCap {
  margin: 0;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.01em;
  line-height: 1.45;
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
/* Kept as a LABEL despite reading as a sentence. The verdict rail is a
   boxed stamp — the exhibit's ruled conclusion, the same object as
   ConditionsBand's rail and NewsletterCard's confirmation strip, both of
   which Turn 8 audited and left in caps for exactly this reason. It is
   already clear of the floor at 10.5px; only the mobile override below
   had to move. */
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
    font-size: 10px;
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
  /* No .exh__caption override any more: it is running sentence copy now,
     and 12px is already the smallest size the sheet sets running copy at.
     Shrinking it further on the narrowest screen is the opposite of what
     the floor is for. */
  .exh__verdict {
    padding: 10px 14px;
    align-items: flex-start;
  }
  .exh__verdictSq {
    margin-top: 3px;
  }
  .exh__verdictCopy {
    font-size: 10px;
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
  /** Grey caption under the diagram. Write it as a sentence — it renders
   *  as one; the CSS no longer uppercases it. */
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
