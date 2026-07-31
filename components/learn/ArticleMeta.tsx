"use client";

import Link from "next/link";
import { useArticleMeta, useArticleProgress } from "./ArticleContext";

const css = `
.ameta {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 20px;
  padding-top: 8px;
  font-family: var(--ins-font);
}
.ameta__left,
.ameta__right {
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--ins-gray-600);
  font-variant-numeric: tabular-nums;
}
.ameta__right {
  text-align: right;
  white-space: nowrap;
}
/* The only breadcrumb the reader needs — the old header's separate nav is
   gone, so this carries the way back to the index. */
.ameta__up {
  color: var(--ins-ink);
  text-decoration: none;
  border-bottom: 1px solid var(--ins-hair);
}
.ameta__up:hover {
  color: var(--ins-signal);
  border-bottom-color: var(--ins-signal);
}
@media (max-width: 640px) {
  .ameta {
    gap: 12px;
  }
  .ameta__left,
  .ameta__right {
    font-size: 8.5px;
    letter-spacing: 0.14em;
  }
  .ameta__left {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
`;

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/**
 * The dateline strip under the masthead: what this dispatch is on the left,
 * how far through it you are on the right. Both halves read from
 * <ArticleProvider> so the percentage and the minutes-left figure update off
 * the same rAF-throttled scroll measurement that drives the reading tape.
 *
 * Minutes left is frontmatter reading time scaled by what's left to read,
 * rounded up so it never shows "0 MIN LEFT" while there's still page below.
 */
export default function ArticleMeta() {
  const meta = useArticleMeta();
  const pct = useArticleProgress();
  if (!meta) return null;

  const read = Math.round(pct);
  const left = meta.minutes
    ? Math.max(pct >= 99.5 ? 0 : 1, Math.ceil(meta.minutes * (1 - pct / 100)))
    : null;

  const dispatch = meta.ordinal
    ? `Dispatch no. ${pad(meta.ordinal)} of ${pad(meta.total)}`
    : "Dispatch";

  return (
    <div className="ameta">
      <span className="ameta__left">
        <Link className="ameta__up" href="/learn">
          Learn
        </Link>{" "}
        · {meta.category} · {dispatch}
      </span>
      <span className="ameta__right">
        Reading — {read}%{left !== null && ` · ${left} min left`}
      </span>
      <style dangerouslySetInnerHTML={{ __html: css }} />
    </div>
  );
}
