import Link from "next/link";
import type { ArticleFrontmatter } from "@/lib/articles";

interface ArticleCardProps {
  article: ArticleFrontmatter;
  featured?: boolean;
  step?: number;
}

const DIFFICULTY_STYLES = {
  beginner:
    "bg-[var(--color-positive)]/8 text-[var(--color-positive)] border-[var(--color-positive)]/20",
  intermediate:
    "bg-[var(--color-chart-line)]/8 text-[var(--color-chart-line)] border-[var(--color-chart-line)]/20",
  advanced:
    "bg-[var(--color-accent)]/10 text-[var(--color-accent)] border-[var(--color-accent)]/25",
} as const;

const DIFFICULTY_LABELS = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
} as const;

export default function ArticleCard({
  article,
  featured,
  step,
}: ArticleCardProps) {
  const isEditorial = article.isEditorial;
  const difficulty = article.difficulty;

  if (featured) {
    return (
      <Link
        href={`/learn/${article.slug}`}
        className="group block card-editorial overflow-hidden transition-all duration-300"
      >
        <div className="flex flex-col md:flex-row">
          {/* Left accent bar */}
          <div className="hidden md:block w-1.5 bg-gradient-to-b from-[var(--color-brand)] via-[var(--color-accent)] to-[var(--color-chart-line)] shrink-0" />

          <div className="flex-1 p-6 md:p-8">
            <div className="flex items-center gap-3 mb-3">
              {/* Start Here badge */}
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--color-brand)]/8 border border-[var(--color-brand)]/20 text-[var(--color-brand)] text-xs font-semibold">
                <svg
                  viewBox="0 0 16 16"
                  width="12"
                  height="12"
                  fill="currentColor"
                >
                  <path d="M8 0a8 8 0 110 16A8 8 0 018 0zm.93 4.59l-4.5 4.5a.75.75 0 001.06 1.06L9.5 6.14V11a.75.75 0 001.5 0V4.75a.75.75 0 00-.75-.75H5a.75.75 0 000 1.5h2.69l-.76.09z" />
                </svg>
                Essential
              </span>
              {difficulty && DIFFICULTY_STYLES[difficulty] && (
                <span
                  className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${DIFFICULTY_STYLES[difficulty]}`}
                >
                  {DIFFICULTY_LABELS[difficulty]}
                </span>
              )}
            </div>

            <h3 className="font-serif text-xl sm:text-2xl font-medium text-[var(--color-text-primary)] group-hover:text-[var(--color-brand)] transition-colors leading-snug">
              {article.title}
            </h3>

            <p className="mt-3 text-sm text-[var(--color-text-secondary)] leading-relaxed max-w-xl">
              {article.excerpt || article.description}
            </p>

            <div className="mt-4 flex items-center gap-4">
              <span className="text-sm font-medium text-[var(--color-brand)] group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
                Start reading &rarr;
              </span>
              <span className="text-xs text-[var(--color-text-muted)]">
                {article.readingTime}
              </span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/learn/${article.slug}`}
      className={`group block card-editorial p-5 transition-all duration-200 ${
        isEditorial
          ? "border-[var(--color-brand)]/30 hover:border-[var(--color-brand)]/60"
          : ""
      }`}
    >
      {/* Top badges row */}
      <div className="flex items-center justify-between gap-2 mb-2.5 min-h-[20px]">
        <div className="flex items-center gap-2">
          {step !== undefined && (
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[var(--color-accent)]/10 text-[10px] font-bold text-[var(--color-accent)] border border-[var(--color-accent)]/20 tabular-nums">
              {step}
            </span>
          )}
          {isEditorial && (
            <span className="section-label">Our Take</span>
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
        className="text-sm font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-brand)] transition-colors leading-snug"
      >
        {article.title}
      </h3>

      <p className="mt-2 text-sm text-[var(--color-text-muted)] leading-relaxed line-clamp-2">
        {article.excerpt || article.description}
      </p>

      <div className="mt-3 flex items-center justify-between">
        <span className="text-sm font-medium text-[var(--color-brand)]">
          Read &rarr;
        </span>
        <span className="text-xs text-[var(--color-text-muted)]">
          {article.readingTime}
        </span>
      </div>
    </Link>
  );
}
