import Link from "next/link";
import { getAllArticles, type ArticleFrontmatter } from "@/lib/articles";

interface RelatedReadingProps {
  currentSlug: string;
  relatedSlugs: string[];
  category: string;
  className?: string;
}

/**
 * "Filed nearby" — 2-3 related dispatches shown as editorial rows.
 * Selection priority:
 *   1. Explicit relatedSlugs from frontmatter
 *   2. Same-category articles as fallback
 *   3. Anything else as last resort
 */
export default function RelatedReading({
  currentSlug,
  relatedSlugs,
  category,
  className,
}: RelatedReadingProps) {
  const allArticles = getAllArticles();
  let related: ArticleFrontmatter[] = [];

  if (relatedSlugs.length > 0) {
    related = relatedSlugs
      .map((slug) => allArticles.find((a) => a.slug === slug))
      .filter((a): a is ArticleFrontmatter => !!a && a.slug !== currentSlug)
      .slice(0, 3);
  }

  if (related.length < 3) {
    const sameCategory = allArticles
      .filter((a) => a.slug !== currentSlug && a.category === category)
      .filter((a) => !related.some((r) => r.slug === a.slug))
      .slice(0, 3 - related.length);
    related = [...related, ...sameCategory];
  }

  if (related.length < 2) {
    const remaining = allArticles
      .filter((a) => a.slug !== currentSlug)
      .filter((a) => !related.some((r) => r.slug === a.slug))
      .slice(0, 3 - related.length);
    related = [...related, ...remaining];
  }

  if (related.length === 0) return null;

  return (
    <div className={`mt-10 pt-6 border-t border-[var(--color-border)] ${className ?? ""}`}>
      <p className="bs-stamp mb-3">Filed nearby</p>
      <ul>
        {related.map((article) => (
          <li key={article.slug}>
            <Link
              href={`/learn/${article.slug}`}
              className="group block py-3 grid grid-cols-[1fr_auto] gap-4 items-baseline border-t border-[var(--color-border)] first:border-t-0"
            >
              <h3
                className="bs-display text-[1.0625rem] sm:text-[1.125rem] leading-[1.2] group-hover:text-[var(--stamp)] transition-colors"
                style={{ color: "var(--ink)" }}
              >
                {article.title}
              </h3>
              <p
                className="bs-label tabular-nums shrink-0"
                style={{ color: "var(--ink-soft)" }}
              >
                {article.readingTime}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
