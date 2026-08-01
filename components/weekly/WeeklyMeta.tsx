"use client";

import Link from "next/link";
import {
  useArticleMeta,
  useArticleProgress,
} from "@/components/learn/ArticleContext";

const css = `
.wkmeta {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 20px;
  padding-top: 8px;
  font-family: var(--ins-font);
}
.wkmeta__left,
.wkmeta__right {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--ins-gray-600);
  font-variant-numeric: tabular-nums;
}
.wkmeta__right {
  text-align: right;
  white-space: nowrap;
}
/* The only breadcrumb the reader gets — the issue hero carries the rest. */
.wkmeta__up {
  color: var(--ins-ink);
  text-decoration: none;
  border-bottom: 1px solid var(--ins-hair);
}
.wkmeta__up:hover {
  color: var(--ins-signal);
  border-bottom-color: var(--ins-signal);
}
@media (max-width: 640px) {
  .wkmeta {
    gap: 12px;
  }
  .wkmeta__left,
  .wkmeta__right {
    font-size: 10px;
    letter-spacing: 0.1em;
  }
  .wkmeta__left {
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
 * The issue dateline strip: which issue this is on the left, how far
 * through it you are on the right.
 *
 * A near-twin of components/learn/ArticleMeta — the two readers share the
 * same grammar — but that one hard-codes the /learn breadcrumb and the
 * "Dispatch no." wording, so /weekly gets its own 40-line copy rather than
 * a prop-flag fork of a component another route owns. The *state* is
 * genuinely shared: both halves read <ArticleProvider> from
 * components/learn/ArticleContext, so the percentage, the minutes-left
 * figure, and the reading tape all tick off one rAF-throttled measurement.
 */
export default function WeeklyMeta() {
  const meta = useArticleMeta();
  const pct = useArticleProgress();
  if (!meta) return null;

  const read = Math.round(pct);
  const left = meta.minutes
    ? Math.max(pct >= 99.5 ? 0 : 1, Math.ceil(meta.minutes * (1 - pct / 100)))
    : null;

  const issue =
    meta.ordinal && meta.total
      ? `Issue № ${pad(meta.ordinal)} of ${pad(meta.total)}`
      : "The weekly dispatch";

  return (
    <div className="wkmeta">
      <span className="wkmeta__left">
        <Link className="wkmeta__up" href="/weekly">
          The Wire
        </Link>{" "}
        · {issue}
      </span>
      <span className="wkmeta__right">
        Reading — {read}%{left !== null && ` · ${left} min left`}
      </span>
      <style dangerouslySetInnerHTML={{ __html: css }} />
    </div>
  );
}
