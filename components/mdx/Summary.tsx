import type { ReactNode } from "react";

const css = `
.msum {
  margin: 26px 0;
  border: 1px solid var(--ins-ink);
  padding: 16px 20px 18px;
  font-family: var(--ins-font);
}
/* TRUE LABEL — the label prop is a badge over the standfirst ("Key
   takeaway"). Caps and tracking stay; the size moves to the floor. It sits
   on its own full-width line inside the box, not in a fixed track, so
   0.22em is kept. */
.msum__label {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--ins-signal);
}
.msum__body {
  margin-top: 10px;
  max-width: 68ch;
  font-size: 16px;
  font-weight: 500;
  line-height: 1.6;
  color: var(--ins-ink);
}
.msum__body p {
  margin: 0 0 12px;
}
.msum__body > :last-child {
  margin-bottom: 0;
}
.msum__body strong {
  font-weight: 700;
}
@media (max-width: 640px) {
  .msum {
    margin: 18px 0;
    padding: 14px 16px 16px;
  }
  .msum__label {
    font-size: 10px;
    letter-spacing: 0.18em;
  }
  .msum__body {
    font-size: 15px;
  }
}
`;

interface SummaryProps {
  children: ReactNode;
  label?: string;
}

/**
 * The standfirst block every dispatch opens with. Turn 7 dresses it in
 * Instrument chrome — square 1px ink box, red micro-label, Archivo body —
 * and leaves the copy and the `label` prop exactly as they were.
 */
export function Summary({ children, label = "Key takeaway" }: SummaryProps) {
  return (
    <aside className="msum">
      <p className="msum__label">{label}</p>
      <div className="msum__body">{children}</div>
      <style dangerouslySetInnerHTML={{ __html: css }} />
    </aside>
  );
}
