import Link from "next/link";
import type { LearnPath } from "@/lib/learn-paths-data";
import type { ArticleFrontmatter } from "@/lib/articles";

const PREVIEW_COUNT = 3;

interface PathCardProps {
  path: LearnPath;
  articles: ArticleFrontmatter[];
}

export default function PathCard({ path, articles }: PathCardProps) {
  const pathArticles = path.slugs
    .map((slug) => articles.find((a) => a.slug === slug))
    .filter((a): a is ArticleFrontmatter => !!a);

  const preview = pathArticles.slice(0, PREVIEW_COUNT);
  const totalCount = pathArticles.length;
  const hasMore = totalCount > PREVIEW_COUNT;

  return (
    <div
      className="flex flex-col p-5 border border-[var(--color-border)] hover:border-[var(--stamp)] transition-colors"
      style={{ background: "var(--paper)" }}
    >
      <h3
        className="bs-display text-[1.25rem] sm:text-[1.5rem] leading-[1.1] mb-1"
        style={{ color: "var(--ink)" }}
      >
        {path.title}
      </h3>
      <p
        className="bs-body italic text-[0.9rem] mb-4"
        style={{ color: "var(--ink-soft)" }}
      >
        {path.description}
      </p>
      <ul className="flex flex-col gap-2 mt-auto">
        {preview.map((article, i) => (
          <li key={article.slug}>
            <Link
              href={`/learn/${article.slug}`}
              className="group flex items-baseline justify-between gap-3 py-1 border-t border-[var(--color-border)]"
            >
              <span
                className="bs-body text-[0.875rem] leading-[1.35] group-hover:text-[var(--stamp)] transition-colors"
                style={{ color: "var(--ink)" }}
              >
                <span
                  className="bs-numerals tabular-nums mr-2"
                  style={{ color: "var(--ink-soft)", fontSize: "11px" }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                {article.title}
              </span>
              <span
                className="bs-caption shrink-0"
                style={{ color: "var(--ink-soft)", fontSize: "11px" }}
              >
                {article.readingTime}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      {hasMore && (
        <div className="mt-3 pt-3 border-t border-[var(--color-border)]">
          <Link
            href={`/learn/path/${path.id}`}
            className="bs-link text-[0.8125rem] hover:text-[var(--stamp)] transition-colors"
            style={{ color: "var(--ink-soft)" }}
          >
            View full path ({totalCount} articles) &rarr;
          </Link>
        </div>
      )}
    </div>
  );
}
