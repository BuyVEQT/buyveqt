import Link from "next/link";
import type { ArticleFrontmatter } from "@/lib/articles";
import { EDITORS_PICKS } from "@/lib/editors-picks";

interface EditorsPicksProps {
  articles: ArticleFrontmatter[];
}

export default function EditorsPicks({ articles }: EditorsPicksProps) {
  const picks = EDITORS_PICKS.map((slug) =>
    articles.find((a) => a.slug === slug)
  ).filter((a): a is ArticleFrontmatter => !!a);

  if (picks.length === 0) return null;

  return (
    <section className="mt-2 mb-8 sm:mb-10">
      <p className="bs-stamp mb-4">Editor&rsquo;s Picks</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {picks.map((article) => (
          <Link
            key={article.slug}
            href={`/learn/${article.slug}`}
            className="group flex flex-col p-4 border border-[var(--color-border)] hover:border-[var(--stamp)] transition-colors"
            style={{ background: "var(--paper)" }}
          >
            <h3
              className="bs-display text-[1.0625rem] sm:text-[1.125rem] leading-[1.1] mb-2 group-hover:text-[var(--stamp)] transition-colors"
              style={{ color: "var(--ink)" }}
            >
              {article.title}
            </h3>
            <p
              className="bs-body text-[0.875rem] leading-[1.45] mb-3 flex-1"
              style={{ color: "var(--ink-soft)" }}
            >
              {article.excerpt || article.description}
            </p>
            <p
              className="bs-label text-[0.75rem] mt-auto"
              style={{ color: "var(--ink-soft)" }}
            >
              {article.readingTime} &nbsp;&rarr;
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
