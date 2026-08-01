import type { ReactNode } from "react";

const css = `
.mvc {
  /* Literal ink, not the token: the verdict panel is the one surface that
     stays dark even under the Ink Edition, where --ins-ink inverts. */
  background: #111111;
  color: #ffffff;
  margin: 32px 0;
  padding: 26px 28px 28px;
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  gap: 40px;
  align-items: start;
  font-family: var(--ins-font);
}
/* TRUE LABEL — the pill prop ("Our verdict") is a badge over the
   headline. Caps and tracking stay; the size moves to the floor. At
   10px/0.2em it measures ~90px in the 220px rail column, so the track is
   left alone. */
.mvc__kicker {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--ins-signal);
}
.mvc__headline {
  margin: 8px 0 0;
  font-size: 22px;
  font-weight: 600;
  letter-spacing: -0.01em;
  line-height: 1.15;
  color: #ffffff;
  text-wrap: pretty;
}
.mvc__body {
  max-width: 74ch;
  font-size: 13.5px;
  font-weight: 500;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.78);
  text-wrap: pretty;
}
.mvc__body p {
  margin: 0 0 14px;
  /* The article body's own paragraph rules are scoped to the prose column,
     so restate colour here rather than inheriting paper-on-paper. */
  color: rgba(255, 255, 255, 0.78);
  max-width: none;
}
.mvc__body > :last-child {
  margin-bottom: 0;
}
.mvc__body em {
  color: rgba(255, 255, 255, 0.62);
  font-style: italic;
}
.mvc__body strong {
  color: #ffffff;
  font-weight: 700;
}
.mvc__body a {
  color: #ffffff;
  text-decoration: underline;
  text-decoration-thickness: 1.5px;
  text-underline-offset: 4px;
}
.mvc__body a:hover {
  color: var(--ins-signal);
}

@media (max-width: 860px) {
  .mvc {
    grid-template-columns: minmax(0, 1fr);
    gap: 14px;
  }
}
@media (max-width: 640px) {
  .mvc {
    margin: 22px 0;
    padding: 16px 18px 18px;
  }
  .mvc__kicker {
    font-size: 10px;
    letter-spacing: 0.18em;
  }
  .mvc__headline {
    font-size: 17px;
  }
  .mvc__body {
    font-size: 12.5px;
    line-height: 1.65;
  }
}
`;

interface VerdictCardProps {
  /** Red kicker over the headline. */
  pill?: string;
  headline?: string;
  children?: ReactNode;
}

/**
 * The verdict panel — the flagship's closing argument, and the same block
 * six other dispatches end on.
 *
 * Turn 7 makes it the artboard's ink slab: literal #111 ground, red "OUR
 * VERDICT" kicker, white display headline from `headline`, muted Archivo
 * body from `children`. Rendered exactly once — the reader page suppresses
 * its own frontmatter verdict on any article whose MDX already ends here.
 *
 * Server component; `pill` and `headline` keep their old names so existing
 * MDX call sites are untouched.
 */
export function VerdictCard({
  pill = "Our verdict",
  headline = "That’s why we buy VEQT.",
  children,
}: VerdictCardProps) {
  return (
    <aside className="mvc">
      <div>
        <div className="mvc__kicker">{pill}</div>
        <p className="mvc__headline">{headline}</p>
      </div>
      <div className="mvc__body">{children}</div>
      <style dangerouslySetInnerHTML={{ __html: css }} />
    </aside>
  );
}
