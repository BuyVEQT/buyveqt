import Link from "next/link";
import type { ArticleFrontmatter } from "@/lib/articles";
import ArticleCard from "./ArticleCard";

interface ArticleSectionProps {
  id: string;
  heading: string;
  description: string;
  articles: ArticleFrontmatter[];
  className?: string;
}

export default function ArticleSection({
  id,
  heading,
  description,
  articles,
  className,
}: ArticleSectionProps) {
  if (articles.length === 0) return null;

  return (
    <section id={id} className={`scroll-mt-24 ${className ?? ""}`}>
      <div className="mb-4">
        <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
          {heading}
        </h2>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          {description}
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {articles.map((article) => (
          <ArticleCard key={article.slug} article={article} />
        ))}
      </div>
    </section>
  );
}
