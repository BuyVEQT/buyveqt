import Link from "next/link";
import type { ArticleFrontmatter } from "@/lib/articles";
import { getAllArticles, getArticleOrdinal } from "@/lib/articles";

const css = `
.ndisp {
  margin-top: 34px;
  font-family: var(--ins-font);
}
.ndisp__card {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: stretch;
  border: 1px solid var(--ins-ink);
  text-decoration: none;
  color: var(--ins-ink);
}
.ndisp__lockup {
  padding: 14px 22px 16px;
  min-width: 0;
}
.ndisp__kicker {
  display: block;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--ins-gray-600);
  font-variant-numeric: tabular-nums;
}
.ndisp__title {
  display: block;
  margin-top: 4px;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: -0.01em;
  line-height: 1.25;
  text-wrap: pretty;
}
.ndisp__time {
  font-size: 11px;
  font-weight: 500;
  color: var(--ins-gray-600);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  white-space: nowrap;
}
.ndisp__cta {
  display: flex;
  align-items: center;
  padding: 0 28px;
  background: var(--ins-signal);
  color: #ffffff;
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  white-space: nowrap;
  transition: background 0.18s ease;
}
.ndisp__card:hover .ndisp__cta,
.ndisp__card:focus-visible .ndisp__cta {
  background: #c8331f;
}
.ndisp__card:focus-visible {
  outline: 2px solid var(--ins-signal);
  outline-offset: 3px;
}
.ndisp__prev {
  margin: 12px 0 0;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--ins-gray-600);
}
.ndisp__prev a {
  color: var(--ins-ink);
  text-decoration: none;
  border-bottom: 1px solid var(--ins-hair);
}
.ndisp__prev a:hover {
  color: var(--ins-signal);
  border-bottom-color: var(--ins-signal);
}

/* ── Mobile · 390 — the red block goes full width under the lockup ── */
@media (max-width: 640px) {
  .ndisp {
    margin-top: 24px;
  }
  .ndisp__card {
    grid-template-columns: minmax(0, 1fr);
  }
  .ndisp__lockup {
    padding: 12px 14px 14px;
  }
  .ndisp__title {
    font-size: 13.5px;
  }
  .ndisp__cta {
    justify-content: center;
    min-height: 46px;
    padding: 12px 18px;
    font-size: 10px;
    letter-spacing: 0.12em;
  }
  .ndisp__prev {
    font-size: 10px;
    letter-spacing: 0.1em;
  }
}

@media (prefers-reduced-motion: reduce) {
  .ndisp__cta {
    transition: none;
  }
}
`;

interface NextDispatchProps {
  next: ArticleFrontmatter | null;
  previous?: ArticleFrontmatter | null;
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/**
 * The closer's first link — the artboard's next-dispatch row. One ink-ruled
 * band: ordinal kicker and title on the left, a solid red READ NEXT block on
 * the right that goes full width on mobile.
 *
 * The whole band is the target, so the red block is a span inside the link
 * rather than a second anchor. The "previously" line under it keeps the
 * backward step in the sequence without a second card.
 */
export default function NextDispatch({ next, previous }: NextDispatchProps) {
  if (!next && !previous) return null;

  const total = getAllArticles().length;
  const nextOrdinal = next ? getArticleOrdinal(next.slug) : null;
  const kicker = nextOrdinal
    ? `Next dispatch · ${pad(nextOrdinal)} of ${pad(total)}`
    : "Next dispatch";

  return (
    <section className="ndisp" aria-label="Continue reading">
      {next && (
        <Link href={`/learn/${next.slug}`} className="ndisp__card">
          <span className="ndisp__lockup">
            <span className="ndisp__kicker">{kicker}</span>
            <span className="ndisp__title">
              {next.title}{" "}
              <span className="ndisp__time">· {next.readingTime}</span>
            </span>
          </span>
          <span className="ndisp__cta">
            Read next <span aria-hidden>→</span>
          </span>
        </Link>
      )}

      {previous && (
        <p className="ndisp__prev">
          ← Previously ·{" "}
          <Link href={`/learn/${previous.slug}`}>{previous.title}</Link>
        </p>
      )}

      <style dangerouslySetInnerHTML={{ __html: css }} />
    </section>
  );
}
