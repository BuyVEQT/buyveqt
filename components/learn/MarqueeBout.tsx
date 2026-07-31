import Link from "next/link";
import type { SyllabusEntry } from "./learn-syllabus";

const css = `
.lrn-bout__link {
  display: grid;
  grid-template-columns: 1fr auto;
  font-family: var(--ins-font);
  text-decoration: none;
  color: var(--ins-inv-text);
}
.lrn-bout__panel {
  display: flex;
  align-items: center;
  gap: 28px;
  padding: 20px 28px;
  background: var(--ins-ink);
  min-width: 0;
}
.lrn-bout__lockup {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}
.lrn-bout__kicker {
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: var(--ins-signal);
}
.lrn-bout__title {
  font-size: 26px;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.15;
  text-wrap: pretty;
}
.lrn-bout__meta {
  margin-left: auto;
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--ins-inv-mute);
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}
.lrn-bout__cta {
  display: flex;
  align-items: center;
  padding: 0 32px;
  background: var(--ins-signal);
  color: #ffffff;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  white-space: nowrap;
  transition: background 0.18s ease;
}
.lrn-bout__link:hover .lrn-bout__cta,
.lrn-bout__link:focus-visible .lrn-bout__cta {
  background: #c8331f;
}
.lrn-bout__link:focus-visible {
  outline: 2px solid var(--ins-signal);
  outline-offset: 3px;
}

@media (prefers-reduced-motion: reduce) {
  .lrn-bout__cta {
    transition: none;
  }
}

@media (max-width: 1180px) {
  .lrn-bout__title {
    font-size: 22px;
  }
  .lrn-bout__panel {
    gap: 20px;
    padding: 18px 22px;
  }
  .lrn-bout__cta {
    padding: 0 22px;
  }
}
@media (max-width: 860px) {
  .lrn-bout__link {
    grid-template-columns: 1fr;
  }
  .lrn-bout__panel {
    display: block;
    padding: 16px 18px;
  }
  .lrn-bout__lockup {
    display: block;
  }
  .lrn-bout__kicker {
    display: block;
    font-size: 8.5px;
    letter-spacing: 0.2em;
  }
  .lrn-bout__title {
    display: block;
    margin-top: 6px;
    font-size: 18px;
    letter-spacing: -0.015em;
    line-height: 1.2;
  }
  .lrn-bout__meta {
    display: block;
    margin: 8px 0 0;
    font-size: 8.5px;
    letter-spacing: 0.12em;
    white-space: normal;
  }
  .lrn-bout__cta {
    justify-content: center;
    min-height: 46px;
    padding: 14px 18px;
    font-size: 10px;
  }
}
`;

/**
 * The marquee bout — artboard 6c, pinned directly under the hero.
 *
 * One link, two panels: an ink panel (red kicker · white title · muted
 * meta) beside a solid signal-red CTA block. The whole banner is the
 * target, so the red block is a span, not a second link. Mobile stacks
 * with the red CTA full-width.
 *
 * Reading time comes from the article's own frontmatter.
 *
 * Server-safe: no client state; plain <style>, not styled-jsx.
 */
export default function MarqueeBout({ entry }: { entry: SyllabusEntry }) {
  return (
    <section className="lrn-bout" aria-labelledby="lrn-bout-title">
      <Link href={`/learn/${entry.slug}`} className="lrn-bout__link">
        <span className="lrn-bout__panel">
          <span className="lrn-bout__lockup">
            <span className="lrn-bout__kicker">The marquee read</span>
            <span id="lrn-bout-title" className="lrn-bout__title">
              VEQT × XEQT — the only bout most readers came for.
            </span>
          </span>
          <span className="lrn-bout__meta">
            {entry.minutes} min · Verdict reviewed quarterly
          </span>
        </span>
        <span className="lrn-bout__cta">
          Read the bout <span aria-hidden>→</span>
        </span>
      </Link>
      <style dangerouslySetInnerHTML={{ __html: css }} />
    </section>
  );
}
