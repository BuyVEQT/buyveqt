import Link from "next/link";
import type { ArticleFrontmatter } from "@/lib/articles";

interface CompactArticleListProps {
  articles: ArticleFrontmatter[];
}

const DIFFICULTY_STYLES = {
  beginner: "bg-green-50 text-green-700 border-green-200",
  intermediate: "bg-blue-50 text-blue-700 border-blue-200",
  advanced: "bg-amber-50 text-amber-700 border-amber-200",
} as const;

const DIFFICULTY_LABELS = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
} as const;

export default function CompactArticleList({
  articles,
}: CompactArticleListProps) {
  if (articles.length === 0) return null;

  return (
    <div className="divide-y divide-[var(--color-border)]">
      {articles.map((article) => (
        <Link
          key={article.slug}
          href={`/learn/${article.slug}`}
          className="group flex items-start sm:items-center gap-3 py-3 px-2 -mx-2 rounded-lg hover:bg-[var(--color-card-hover)] transition-colors"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-brand)] transition-colors truncate">
                {article.title}
              </h3>
              {article.difficulty &&
                DIFFICULTY_STYLES[article.difficulty] && (
                  <span
                    className={`hidden sm:inline-block shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full border ${DIFFICULTY_STYLES[article.difficulty]}`}
                  >
                    {DIFFICULTY_LABELS[article.difficulty]}
                  </span>
                )}
            </div>
            <p className="text-xs text-[var(--color-text-muted)] line-clamp-1 mt-0.5">
              {article.excerpt || article.description}
            </p>
          </div>
          <span className="shrink-0 text-xs text-[var(--color-text-muted)] hidden sm:block">
            {article.readingTime}
          </span>
        </Link>
      ))}
    </div>
  );
}
