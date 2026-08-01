import type { ReactNode } from "react";

const css = `
.vcall {
  /* Literal ink so the panel survives the Ink Edition's token inversion —
     same ground as the MDX <VerdictCard>. */
  background: #111111;
  color: #ffffff;
  padding: 20px 22px 22px;
  font-family: var(--ins-font);
}
.vcall__kicker {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--ins-signal);
}
.vcall__headline {
  margin: 8px 0 0;
  font-size: 20px;
  font-weight: 600;
  letter-spacing: -0.012em;
  line-height: 1.2;
  color: #ffffff;
  text-wrap: pretty;
}
.vcall__body {
  margin: 12px 0 0;
  font-size: 13px;
  font-weight: 500;
  line-height: 1.65;
  /* Snapped to the ink scale's 100% step — 0.78 was an off-scale fifth
     gray. Size (13px against the 20px headline) carries the hierarchy;
     dimming a two-sentence verdict on an ink panel never did. */
  color: #ffffff;
  text-wrap: pretty;
}
@media (max-width: 640px) {
  .vcall {
    padding: 16px 18px 18px;
  }
  .vcall__headline {
    font-size: 17px;
  }
  .vcall__body {
    font-size: 12.5px;
  }
}
`;

interface VerdictCalloutProps {
  /** Short headline — "Our verdict, in one line." */
  headline: ReactNode;
  /** Supporting body — 1–2 sentences. */
  children?: ReactNode;
}

/**
 * The reader's own verdict panel, built from frontmatter for editorial
 * dispatches that don't already close on an MDX <VerdictCard>.
 *
 * Turn 7 makes it the ink slab and — the fix for the flagged bug — renders
 * it exactly once. It used to appear twice in the DOM: inline for mobile and
 * again inside the desktop sidecar, toggled by CSS. Now the page's grid moves
 * this single node between the rail and the flow.
 */
export default function VerdictCallout({
  headline,
  children,
}: VerdictCalloutProps) {
  return (
    <aside className="vcall">
      <div className="vcall__kicker">Our verdict</div>
      <p className="vcall__headline">{headline}</p>
      {children && <p className="vcall__body">{children}</p>}
      <style dangerouslySetInnerHTML={{ __html: css }} />
    </aside>
  );
}
