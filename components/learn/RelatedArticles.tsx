import Link from "next/link";
import { getAllArticles, getArticleOrdinal, type ArticleFrontmatter } from "@/lib/articles";

const css = `
.arel {
  margin-top: 30px;
  padding-top: 12px;
  border-top: 1px solid var(--ins-ink);
  font-family: var(--ins-font);
}
.arel__kicker {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--ins-gray-600);
}
.arel__rows {
  list-style: none;
  margin: 10px 0 0;
  padding: 0;
}
.arel__row {
  border-top: 1px solid var(--ins-hair);
}
.arel__row:last-child {
  border-bottom: 1px solid var(--ins-hair);
}
.arel__link {
  display: grid;
  grid-template-columns: 46px minmax(0, 1fr) auto;
  gap: 16px;
  align-items: baseline;
  padding: 13px 0 14px;
  text-decoration: none;
  color: var(--ins-ink);
}
.arel__ord {
  font-size: 26px;
  font-weight: 700;
  line-height: 1;
  letter-spacing: -0.03em;
  color: var(--ins-ordinal);
  font-variant-numeric: tabular-nums;
  transition: color 0.15s ease;
}
.arel__title {
  font-size: 17px;
  font-weight: 600;
  letter-spacing: -0.012em;
  line-height: 1.25;
  text-wrap: pretty;
}
.arel__meta {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--ins-gray-600);
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}
.arel__link:hover .arel__ord,
.arel__link:focus-visible .arel__ord {
  color: var(--ins-signal);
}
.arel__link:hover .arel__title {
  text-decoration: underline;
  text-decoration-thickness: 2px;
  text-underline-offset: 4px;
}
.arel__link:focus-visible {
  outline: 2px solid var(--ins-signal);
  outline-offset: 2px;
}

@media (max-width: 640px) {
  .arel {
    margin-top: 22px;
  }
  .arel__link {
    grid-template-columns: 34px minmax(0, 1fr);
    gap: 12px;
    padding: 11px 0 12px;
  }
  .arel__ord {
    font-size: 20px;
  }
  .arel__title {
    font-size: 15px;
  }
  .arel__meta {
    grid-column: 2;
    font-size: 10px;
    letter-spacing: 0.1em;
  }
}

@media (prefers-reduced-motion: reduce) {
  .arel__ord {
    transition: none;
  }
}
`;

interface RelatedArticlesProps {
  /** Current article's slug — excluded from the pick list. */
  currentSlug: string;
  /** Optional explicit slugs (from frontmatter.relatedSlugs). */
  relatedSlugs?: string[];
  /** Category fallback when explicit slugs run out. */
  category?: string;
}

/**
 * "Also worth reading" — Turn 7 turns the two rounded cards into ruled
 * ordinal rows: the dispatch's number in the registry set in oversized
 * ordinal grey, title, read time. Same three-tier pick (explicit
 * relatedSlugs → same category → anything) and the same links.
 */
export default function RelatedArticles({
  currentSlug,
  relatedSlugs = [],
  category,
}: RelatedArticlesProps) {
  const all = getAllArticles();
  let picks: ArticleFrontmatter[] = [];

  if (relatedSlugs.length > 0) {
    picks = relatedSlugs
      .map((s) => all.find((a) => a.slug === s))
      .filter((a): a is ArticleFrontmatter => !!a && a.slug !== currentSlug)
      .slice(0, 3);
  }

  if (picks.length < 3 && category) {
    const same = all
      .filter((a) => a.slug !== currentSlug && a.category === category)
      .filter((a) => !picks.some((p) => p.slug === a.slug))
      .slice(0, 3 - picks.length);
    picks = [...picks, ...same];
  }

  if (picks.length < 3) {
    const fill = all
      .filter((a) => a.slug !== currentSlug)
      .filter((a) => !picks.some((p) => p.slug === a.slug))
      .slice(0, 3 - picks.length);
    picks = [...picks, ...fill];
  }

  if (picks.length === 0) return null;

  return (
    <section className="arel" aria-label="Also worth reading">
      <div className="arel__kicker">Also worth reading</div>
      <ul className="arel__rows">
        {picks.map((a) => {
          const ordinal = getArticleOrdinal(a.slug);
          return (
            <li className="arel__row" key={a.slug}>
              <Link href={`/learn/${a.slug}`} className="arel__link">
                <span className="arel__ord">
                  {ordinal ? String(ordinal).padStart(2, "0") : "—"}
                </span>
                <span className="arel__title">{a.title}</span>
                <span className="arel__meta">{a.readingTime}</span>
              </Link>
            </li>
          );
        })}
      </ul>
      <style dangerouslySetInnerHTML={{ __html: css }} />
    </section>
  );
}
