import Link from "next/link";
import type { ArticleFrontmatter } from "@/lib/articles";

interface ArticleCardProps {
  article: ArticleFrontmatter;
  featured?: boolean;
  step?: number;
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

export default function ArticleCard({ article, featured, step }: ArticleCardProps) {
  const isEditorial = article.isEditorial;
  const difficulty = article.difficulty;

  return (
    <Link
      href={`/learn/${article.slug}`}
      className={`group block rounded-xl border p-5 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${
        featured
          ? "border-[var(--color-brand)]/30 bg-[var(--color-brand)]/[0.02] hover:border-[var(--color-brand)]/60"
          : isEditorial
          ? "border-[var(--color-brand)]/40 hover:border-[var(--color-brand)]"
          : "border-[var(--color-border)] hover:border-[var(--color-brand)]"
      }`}
    >
      {/* Top badges row */}
      <div className="flex items-center justify-between gap-2 mb-2 min-h-[20px]">
        <div className="flex items-center gap-2">
          {step !== undefined && (
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[var(--color-base)] text-[10px] font-bold text-[var(--color-text-muted)] border border-[var(--color-border)]">
              {step}
            </span>
          )}
          {isEditorial && (
            <span className="inline-block text-[10px] font-semibold uppercase tracking-wider text-[var(--color-brand)]">
              Our Take
            </span>
          )}
        </div>
        {difficulty && DIFFICULTY_STYLES[difficulty] && (
          <span
            className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-full border ${DIFFICULTY_STYLES[difficulty]}`}
          >
            {DIFFICULTY_LABELS[difficulty]}
          </span>
        )}
      </div>

      <h3
        className={`font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-brand)] transition-colors leading-snug ${
          featured ? "text-xl" : "text-lg"
        }`}
      >
        {article.title}
      </h3>

      <p
        className={`mt-2 text-sm text-[var(--color-text-secondary)] leading-relaxed ${
          featured ? "" : "line-clamp-2"
        }`}
      >
        {article.excerpt || article.description}
      </p>

      <p className="mt-3 text-xs text-[var(--color-text-muted)]">
        {article.readingTime}
      </p>
    </Link>
  );
}
