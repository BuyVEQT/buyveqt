import type { ReactNode } from "react";

const SVG = {
  width: 13,
  height: 13,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  style: { flexShrink: 0 },
};

// Token-driven SVG marks (no emoji, per the editorial house style). Each
// inherits its callout's accent through stroke="currentColor".
const ICONS: Record<CalloutType, ReactNode> = {
  info: (
    <svg {...SVG}>
      <circle cx="12" cy="12" r="9" />
      <line x1="12" y1="11" x2="12" y2="16" />
      <line x1="12" y1="7.75" x2="12.01" y2="7.75" />
    </svg>
  ),
  warning: (
    <svg {...SVG}>
      <path d="M10.29 4.1 2.42 18a1.5 1.5 0 0 0 1.3 2.25h16.56a1.5 1.5 0 0 0 1.3-2.25L13.71 4.1a1.5 1.5 0 0 0-2.42 0z" />
      <line x1="12" y1="9.5" x2="12" y2="14" />
      <line x1="12" y1="17.5" x2="12.01" y2="17.5" />
    </svg>
  ),
  tip: (
    <svg {...SVG}>
      <path d="M9 18h6" />
      <path d="M10 21.5h4" />
      <path d="M15.1 14c.2-1 .7-1.75 1.45-2.5A4.65 4.65 0 0 0 18 8 6 6 0 1 0 6 8c0 1 .25 2.25 1.45 3.5.75.75 1.25 1.5 1.45 2.5" />
    </svg>
  ),
};

const css = `
.mcal {
  margin: 22px 0;
  padding: 12px 0 12px 16px;
  border-left: 3px solid var(--ins-ink);
  font-family: var(--ins-font);
}
/* Red is the signal colour, so only "watch out" spends it. */
.mcal--warning {
  border-left-color: var(--ins-signal);
}
/* TRUE LABEL — "Good to know" / "Watch out" / "Pro tip" are badges, not
   sentences. Caps and tracking stay; only the size moves to the floor. The
   label runs the full aside and can wrap, so no tracking dial-back. */
.mcal__label {
  display: flex;
  align-items: center;
  gap: 7px;
  margin: 0;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--ins-ink);
}
.mcal--warning .mcal__label {
  color: var(--ins-signal);
}
.mcal__body {
  margin-top: 8px;
  max-width: 68ch;
  font-size: 15px;
  font-weight: 500;
  line-height: 1.6;
  color: var(--ins-gray-700);
}
.mcal__body p {
  margin: 0 0 12px;
}
.mcal__body > :last-child {
  margin-bottom: 0;
}
.mcal__body strong {
  font-weight: 700;
  color: var(--ins-ink);
}
.mcal__body a {
  color: var(--ins-ink);
  text-decoration: underline;
  text-decoration-thickness: 1.5px;
  text-underline-offset: 4px;
}
.mcal__body a:hover {
  color: var(--ins-signal);
}
@media (max-width: 640px) {
  .mcal {
    margin: 18px 0;
    padding-left: 13px;
  }
  .mcal__label {
    font-size: 10px;
    letter-spacing: 0.16em;
  }
  .mcal__body {
    font-size: 14px;
  }
}
`;

type CalloutType = "info" | "warning" | "tip";

const LABELS: Record<CalloutType, string> = {
  info: "Good to know",
  warning: "Watch out",
  tip: "Pro tip",
};

interface CalloutProps {
  type?: CalloutType;
  children: ReactNode;
}

/**
 * Inline aside. Turn 7 swaps the tinted rounded card for the Instrument's
 * ruled grammar: a 3px ink rule down the left, an Archivo micro-label, and
 * no fill. The three types keep their labels and marks; only "watch out"
 * spends red, since red carries signal everywhere else on the site.
 */
export function Callout({ type = "info", children }: CalloutProps) {
  return (
    <aside className={`mcal mcal--${type}`}>
      <p className="mcal__label">
        {ICONS[type]}
        {LABELS[type]}
      </p>
      <div className="mcal__body">{children}</div>
      <style dangerouslySetInnerHTML={{ __html: css }} />
    </aside>
  );
}
