import Link from "next/link";
import { getAllArticles, type ArticleFrontmatter } from "@/lib/articles";

interface RelatedReadingProps {
  currentSlug: string;
  relatedSlugs: string[];
  category: string;
  className?: string;
}

const DIFFICULTY_LABELS: Record<string, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

export default function RelatedReading({
  currentSlug,
  relatedSlugs,
  category,
  className,
}: RelatedReadingProps) {
  const allArticles = getAllArticles();
  let related: ArticleFrontmatter[] = [];

  // 1. Explicit related slugs
  if (relatedSlugs.length > 0) {
    related = relatedSlugs
      .map((slug) => allArticles.find((a) => a.slug === slug))
      .filter((a): a is ArticleFrontmatter => !!a && a.slug !== currentSlug)
      .slice(0, 3);
  }

  // 2. Auto-fallback: same category
  if (related.length < 2) {
    const sameCategory = allArticles
      .filter((a) => a.slug !== currentSlug && a.category === category)
      .filter((a) => !related.some((r) => r.slug === a.slug))
      .slice(0, 3 - related.length);
    related = [...related, ...sameCategory];
  }

  // 3. Fill with any recent articles
  if (related.length < 2) {
    const remaining = allArticles
      .filter((a) => a.slug !== currentSlug)
      .filter((a) => !related.some((r) => r.slug === a.slug))
      .slice(0, 3 - related.length);
    related = [...related, ...remaining];
  }

  if (related.length === 0) return null;

  return (
    <div className={`mt-10 pt-8 border-t border-[var(--color-border)] ${className ?? ""}`}>
      <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
        Continue Reading
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {related.map((article) => (
          <Link
            key={article.slug}
            href={`/learn/${article.slug}`}
            className="group block rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-4 hover:border-[var(--color-brand)] hover:shadow-sm transition-all"
          >
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-brand)] transition-colors leading-snug line-clamp-2">
              {article.title}
            </h3>
            <p className="mt-1.5 text-xs text-[var(--color-text-muted)] leading-relaxed line-clamp-2">
              {article.excerpt || article.description}
            </p>
            <div className="mt-2 flex items-center gap-2">
              {article.category && (
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-[var(--color-base)] text-[var(--color-text-muted)]">
                  {article.category.replace("-", " ")}
                </span>
              )}
              {article.difficulty && DIFFICULTY_LABELS[article.difficulty] && (
                <span className="text-[10px] text-[var(--color-text-muted)]">
                  {DIFFICULTY_LABELS[article.difficulty]}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
